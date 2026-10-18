// Scroll smoothness: wheel-driven scroll through a page (Lenis) with the real GPU; frame-time percentiles plus every long animation frame with its script.
// Usage: node scripts/smooth.mjs http://localhost:8080/ [mobile|desktop] [cpu slowdown, e.g. 4]
import puppeteer from 'puppeteer-core';
const url = process.argv[2] || 'http://localhost:8080/'; const mobile = process.argv[3] === 'mobile'; const cpu = +(process.argv[4] || 1);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--hide-scrollbars'] });
const p = await b.newPage();
await p.setViewport(mobile ? { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { width: 1440, height: 900, deviceScaleFactor: 2 });
const cdp = await p.createCDPSession(); if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('cookieConsent', 'rejected'); } catch (e) {} window.__loaf = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__loaf.push({ t: Math.round(e.startTime), d: Math.round(e.duration), block: Math.round(e.blockingDuration), render: Math.round(e.startTime + e.duration - (e.renderStart || e.startTime)), sl: Math.round(e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0), y: Math.round(scrollY), scripts: (e.scripts || []).map(s => ({ src: (s.sourceURL || '').split('/').pop() + ':' + (s.sourceFunctionName || '') + ' ' + (s.invoker || '').slice(0, 60), d: Math.round(s.duration), fl: Math.round(s.forcedStyleAndLayoutDuration || 0) })) }))).observe({ type: 'long-animation-frame', buffered: true }); } catch (e) {} });
await p.goto(url, { waitUntil: 'load', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
const start = await p.evaluate(() => { window.__frames = []; let last = performance.now(); const tick = now => { window.__frames.push(now - last); last = now; if (!window.__stop) requestAnimationFrame(tick); }; requestAnimationFrame(tick); window.__loaf = []; return performance.now(); });
const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
await p.mouse.move(mobile ? 200 : 700, mobile ? 400 : 450);
let y = 0, steps = 0; while (y < H && steps < 900) { await p.mouse.wheel({ deltaY: 120 }); y = await p.evaluate(() => scrollY); steps++; await new Promise(r => setTimeout(r, 16)); }
await new Promise(r => setTimeout(r, 800));
const res = await p.evaluate(() => { window.__stop = true; return { frames: window.__frames, loaf: window.__loaf }; });
const f = res.frames.slice(2).sort((a, b) => a - b); const pct = q => f[Math.min(f.length - 1, Math.floor(f.length * q))].toFixed(1);
const over = n => f.filter(x => x > n).length;
console.log(`${url} ${mobile ? 'mobile' : 'desktop'} cpu x${cpu}: ${f.length} frames over ${steps} wheel steps | p50 ${pct(.5)}ms p90 ${pct(.9)}ms p99 ${pct(.99)}ms max ${f[f.length - 1].toFixed(1)}ms | >20ms: ${over(20)} >34ms: ${over(34)} >50ms: ${over(50)}`);
const agg = new Map(); for (const l of res.loaf) for (const s of l.scripts) { const k = s.src; const a = agg.get(k) || { n: 0, d: 0, fl: 0 }; a.n++; a.d += s.d; a.fl += s.fl; agg.set(k, a); }
for (const l of res.loaf) console.log('   LoAF at', l.t, 'ms, scrollY', l.y, 'dur', l.d, 'render part', l.render, 'style+layout', l.sl, 'block', l.block, l.scripts.map(x => x.src + ' ' + x.d).join(' | '));
console.log('LoAF count', res.loaf.length, 'total blocking', res.loaf.reduce((s, l) => s + l.block, 0), 'ms; scripts in LoAFs:');
for (const [k, a] of [...agg.entries()].sort((x, y) => y[1].d - x[1].d).slice(0, 12)) console.log('   ', String(a.d).padStart(5), 'ms', 'forced layout', String(a.fl).padStart(4), 'ms', 'x' + a.n, k);
await b.close();
