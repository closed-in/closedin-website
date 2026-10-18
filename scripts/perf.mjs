// Load timing on a slow phone (Slow 4G: 150 ms RTT, 1.6 Mbps; 4x CPU; cold cache; the real GPU), median of three runs per page and base.
// Reports FCP, LCP and when the main headline is actually visible (opacity above .6 and the page transition open).
// Usage: node scripts/perf.mjs --bases '[["NEW","http://localhost:8080"],["MAIN","http://localhost:8082"]]' [--pages '["/","/resources/gtm-stack"]']
// (serve main next to the working copy with: git archive main case-study-showcase | tar -x -C /tmp/main && npx serve -l 8082 /tmp/main/case-study-showcase)
import puppeteer from 'puppeteer-core';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? JSON.parse(process.argv[i + 1]) : d; };
const bases = arg('--bases', [['NEW', 'http://localhost:8080']]); const pages = arg('--pages', ['/', '/resources/gtm-stack', '/case-studies']);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu'] });
const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
for (const path of pages) for (const [label, base] of bases) {
  const res = [];
  for (let run = 0; run < 3; run++) {
    const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
    await p.setViewport({ width: 412, height: 823, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true });
    const cdp = await p.createCDPSession();
    await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.evaluateOnNewDocument(() => {
      window.__m = { lcp: 0, fcp: 0, h1: 0 };
      new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.name === 'first-contentful-paint') window.__m.fcp = e.startTime; })).observe({ type: 'paint', buffered: true });
      new PerformanceObserver(l => l.getEntries().forEach(e => { window.__m.lcp = e.startTime; window.__m.lcpEl = e.element ? e.element.tagName + '.' + String(e.element.className).slice(0, 24) : e.url; })).observe({ type: 'largest-contentful-paint', buffered: true });
      const poll = () => { const h = document.querySelector('h1'); if (h) { let el = h, op = 1; while (el && el !== document.documentElement) { op *= parseFloat(getComputedStyle(el).opacity); el = el.parentElement; } const veil = document.querySelector('.veil.on'); let covered = false; if (veil && getComputedStyle(veil).display !== 'none') { const sh = veil.querySelector('.shade'); const hole = sh && sh.style.clipPath && sh.style.clipPath !== 'none'; covered = document.documentElement.classList.contains('has-veil') || !hole; } if (op > .6 && !covered && !window.__m.h1) window.__m.h1 = performance.now(); } if (!window.__m.h1) requestAnimationFrame(poll); };
      requestAnimationFrame(poll);
    });
    await p.goto(base + path, { waitUntil: 'load', timeout: 90000 }); await new Promise(r => setTimeout(r, 5000));
    res.push(await p.evaluate(() => window.__m)); await ctx.close();
  }
  console.log(`${path.padEnd(24)} ${label.padEnd(6)} FCP ${(med(res.map(r => r.fcp)) / 1000).toFixed(2)}s  LCP ${(med(res.map(r => r.lcp)) / 1000).toFixed(2)}s (${res[0].lcpEl})  headline visible ${(med(res.map(r => r.h1 || 99999)) / 1000).toFixed(2)}s`);
}
await b.close();
