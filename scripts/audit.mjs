// Site-wide audit against the local server: per page console errors, failed requests, horizontal overflow (desktop and mobile),
// images (alt, dimensions, broken), head tags, heading order, duplicate ids, link hygiene, copy rules, internal link targets,
// plus one external link check across all pages. Usage: node scripts/audit.mjs [--base http://localhost:8080] [--out review/<date>/audit.json]
import puppeteer from 'puppeteer-core'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)), 'case-study-showcase');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const base = arg('--base', 'http://localhost:8080'); const out = arg('--out', path.resolve(root, '..', 'review', new Date().toISOString().slice(0, 10), 'audit.json'));
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['assets', 'node_modules', 'wall'].includes(e.name) ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)]);
const pages = walk(root).filter(f => f.endsWith('.html') && !/index-light|pipeline-demo/.test(f)).map(f => path.relative(root, f)).sort();
const toPath = rel => { let p = rel.replace(/\\/g, '/').replace(/\.html$/, ''); if (p.endsWith('/index')) p = p.slice(0, -5); if (p === 'index') p = ''; return '/' + p; };
const exists = p => { const clean = decodeURIComponent(p.replace(/^\//, '').split(/[?#]/)[0]); const c = clean === '' || clean.endsWith('/') ? [path.join(clean, 'index.html')] : [clean, clean + '.html', path.join(clean, 'index.html')]; return c.some(x => fs.existsSync(path.join(root, x))); };
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const report = { base, pages: {}, external: {} }; const externals = new Map();
const ignoreReq = u => /\/_vercel\/|facebook\.net|facebook\.com|licdn\.com|ads\.linkedin|google-analytics|googletagmanager|leadboxer|claydar|stairoids|prospectpro|css\.jsapis\.com/.test(u);
for (const rel of pages) {
  const url = base + toPath(rel); const r = { url, rel, errors: [], failed: [], overflow: {} };
  for (const [tag, vw] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
    const p = await b.newPage(); await p.setViewport(vw); await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    p.on('pageerror', e => r.errors.push(tag + ': ' + e.message.slice(0, 160))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) r.errors.push(tag + ' console: ' + m.text().slice(0, 160)); });
    p.on('response', res => { if (res.status() >= 400 && !ignoreReq(res.url())) r.failed.push(res.status() + ' ' + res.url().replace(base, '')); });
    let status = 0; try { const res = await p.goto(url, { waitUntil: 'load', timeout: 45000 }); status = res ? res.status() : 0; } catch (e) { r.errors.push(tag + ' nav: ' + e.message.slice(0, 80)); }
    r.status = status; await new Promise(x => setTimeout(x, 700));
    try { await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await new Promise(x => setTimeout(x, 500)); await p.evaluate(() => window.scrollTo(0, 0)); } catch (e) { /* ignore */ }
    try {
      r.overflow[tag] = await p.evaluate(() => { const iw = innerWidth, sw = document.documentElement.scrollWidth; const off = sw > iw + 1 ? [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > iw + 1 && getComputedStyle(e).position !== 'fixed'; }).slice(0, 4).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '')) : []; return { px: sw - iw, offenders: off }; });
      if (tag === 'desktop') Object.assign(r, await p.evaluate(() => {
        const q = s => [...document.querySelectorAll(s)]; const txt = document.body.innerText; const html = document.documentElement.outerHTML; const noScript = html.replace(/<script[\s\S]*?<\/script>/g, '');
        const imgs = q('img'); const hs = q('h1,h2,h3,h4,h5,h6').map(h => +h.tagName[1]); let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) skips++;
        const ids = q('[id]').map(e => e.id); const dup = [...new Set(ids.filter((v, i, a) => a.indexOf(v) !== i))];
        const visible = e => { const b = e.getBoundingClientRect(); return b.width > 0 || b.height > 0 || e.closest('[hidden]') === null; };
        return {
          title: document.title, desc: (document.querySelector('meta[name=description]') || {}).content || '', canonical: (document.querySelector('link[rel=canonical]') || {}).href || '', ogImage: !!document.querySelector('meta[property="og:image"]'), lang: document.documentElement.lang, viewport: !!document.querySelector('meta[name=viewport]'),
          h1: q('h1').length, headingSkips: skips, dupIds: dup.slice(0, 6),
          imgs: imgs.length, imgNoAlt: imgs.filter(i => !i.hasAttribute('alt')).map(i => (i.getAttribute('src') || '').slice(-50)).slice(0, 6), imgNoDims: imgs.filter(i => !i.getAttribute('width') || !i.getAttribute('height')).length, imgBroken: imgs.filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src') && !i.getAttribute('src').startsWith('data:')).map(i => i.getAttribute('src')).slice(0, 8),
          emptyLinks: q('a').filter(a => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.title && !a.querySelector('img[alt]:not([alt=""])')).map(a => a.getAttribute('href')).slice(0, 5),
          btnNoName: q('button').filter(b => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.title).length,
          blankNoRel: q('a[target="_blank"]').filter(a => !/noopener|noreferrer/.test(a.rel)).length,
          inputsNoLabel: q('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]), textarea, select').filter(i => !(i.labels && i.labels.length) && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby') && !i.placeholder).length,
          httpRefs: q('a[href^="http://"], img[src^="http://"], script[src^="http://"], link[href^="http://"]').length,
          copy: { emdash: (noScript.match(/—/g) || []).length, endash: (noScript.match(/–/g) || []).length, openRate: (txt.match(/open rate/gi) || []).length, capClosed: (noScript.match(/Closed:in/g) || []).length, plynq: (noScript.match(/plynq/gi) || []).length, arrows: (txt.match(/→/g) || []).length, stars: (txt.match(/★/g) || []).length, emoji: (txt.match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length, lorem: /lorem ipsum/i.test(txt), todo: /\b(TODO|TBD|FIXME|XXX)\b/.test(txt), doubleSpace: (txt.match(/[a-z]\.  [A-Z]/g) || []).length, straightQuotes: (txt.match(/"[^"]{3,}"/g) || []).length },
          links: q('a[href]').map(a => a.getAttribute('href')), words: txt.split(/\s+/).filter(Boolean).length,
          smallText: q('p, li, span, a, td').filter(e => visible(e) && e.textContent.trim().length > 20 && parseFloat(getComputedStyle(e).fontSize) < 12).length,
        };
      }));
    } catch (e) { r.errors.push(tag + ' eval: ' + e.message.slice(0, 80)); }
    await p.close();
  }
  r.missingInternal = []; const seen = new Set();
  for (const h of r.links || []) {
    if (!h || h.startsWith('#') || /^(mailto|tel|javascript|data):/.test(h)) continue;
    if (/^(https?:)?\/\//.test(h)) { const u = h.startsWith('//') ? 'https:' + h : h; if (!externals.has(u)) externals.set(u, new Set()); externals.get(u).add(rel); continue; }
    if (h === 'index' || h === 'index.html') { r.missingInternal.push(h + ' (use /)'); continue; }
    const pageDir = toPath(rel).endsWith('/') ? toPath(rel) : path.posix.dirname(toPath(rel) || '/'); const abs = h.startsWith('/') ? h : path.posix.join(pageDir, h); if (seen.has(abs)) continue; seen.add(abs);
    if (!exists(abs)) r.missingInternal.push(h);
  }
  delete r.links; report.pages[rel] = r;
  const c = r.copy || {}; const flags = Object.entries(c).filter(([k, v]) => v && v !== 0).map(([k, v]) => k + (v === true ? '' : ':' + v)).join(' ');
  console.log(`${rel.padEnd(44)} ${String(r.status).padStart(3)} err:${r.errors.length} fail:${r.failed.length} ovf:${(r.overflow.desktop || {}).px}/${(r.overflow.mobile || {}).px} h1:${r.h1} noAlt:${(r.imgNoAlt || []).length} noDims:${r.imgNoDims} broken:${(r.imgBroken || []).length} miss:${r.missingInternal.length} ${flags}`);
}
await b.close();
// external links, once each
const urls = [...externals.keys()]; let i = 0; const skip = u => /linkedin\.com|instagram\.com|facebook\.com|x\.com|twitter\.com/.test(u);
await Promise.all(Array.from({ length: 6 }, async () => { while (i < urls.length) { const u = urls[i++]; if (skip(u)) { report.external[u] = { status: 'skipped (bot-blocked host)', pages: [...externals.get(u)] }; continue; }
  try { const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 10000); let res = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (link check)' } }); if (res.status === 405 || res.status === 403 || res.status === 404) res = await fetch(u, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (link check)' } }); clearTimeout(t); report.external[u] = { status: res.status, final: res.url !== u ? res.url : undefined, pages: [...externals.get(u)] }; }
  catch (e) { report.external[u] = { status: 'error ' + e.name, pages: [...externals.get(u)] }; } } }));
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(report, null, 1));
const bad = Object.entries(report.external).filter(([u, v]) => typeof v.status === 'number' ? v.status >= 400 : /error/.test(v.status));
console.log(`\nexternal links: ${urls.length} unique, ${bad.length} failing`); for (const [u, v] of bad) console.log('  ', v.status, u, '<-', v.pages.join(', '));
const redirected = Object.entries(report.external).filter(([u, v]) => v.final).slice(0, 40); console.log(`external redirects: ${redirected.length}`); for (const [u, v] of redirected) console.log('  ', u, '->', v.final);
console.log('\nwritten', out);
