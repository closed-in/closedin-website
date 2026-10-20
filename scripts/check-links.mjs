// Checks every href/src on every page (20-10: was the homepage only). Internal links are resolved the way Vercel serves the page
// (cleanUrls, no trailing slash: blog/index.html is /blog, so a relative link there resolves from /) and must map to a file or a
// redirect in vercel.json; external links are checked once each (HEAD, GET when refused; LinkedIn's 999 and 403 are warnings).
// Usage: node scripts/check-links.mjs [--internal]
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execSync } from 'node:child_process';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)), 'case-study-showcase');
const internalOnly = process.argv.includes('--internal');
const files = execSync('git ls-files "*.html"', { cwd: root }).toString().trim().split('\n').filter(f => !/pipeline-demo|index-light/.test(f)).concat(fs.existsSync(path.join(root, '404.html')) ? [] : []);
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const redirects = new Set((vercel.redirects || []).map(r => r.source));
const urlOf = f => '/' + f.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
const exists = p => {
  if (redirects.has(p)) return true;
  const c = p.replace(/^\//, '');
  return (c === '' ? ['index.html'] : [c, c + '.html', path.join(c, 'index.html')]).some(x => fs.existsSync(path.join(root, x)) && fs.statSync(path.join(root, x)).isFile());
};
let bad = 0; const external = new Map();
for (const f of files) {
  const html = fs.readFileSync(path.join(root, f), 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  const base = 'https://www.closedin.io' + urlOf(f);
  const refs = [...html.matchAll(/(?:href|src)="([^"]*)"/g)].map(m => m[1]).filter((v, i, a) => v && a.indexOf(v) === i);
  for (const ref of refs) {
    if (/^(mailto:|tel:|data:|javascript:)/.test(ref) || ref.startsWith('/_vercel/')) continue;
    if (/^https?:\/\//.test(ref) || ref.startsWith('//')) {
      const u = ref.startsWith('//') ? 'https:' + ref : ref;
      if (u.startsWith('https://www.closedin.io/')) { const p = new URL(u).pathname; if (!exists(p.replace(/\/$/, '') || '/')) { console.log('MISSING', f, ref); bad++; } continue; }
      if (!external.has(u)) external.set(u, f);
      continue;
    }
    if (ref.startsWith('#')) { const id = ref.slice(1); if (id && !new RegExp(`id="${id}"`).test(html)) { console.log('ANCHOR ', f, ref); bad++; } continue; }
    if (ref === 'index') { console.log('LEGACY', f, 'href="index", use "/"'); bad++; continue; }
    const u = new URL(ref.replace(/&amp;/g, '&'), base);
    const p = decodeURIComponent(u.pathname).replace(/\/$/, '') || '/';
    if (!exists(p)) { console.log('MISSING', f, ref, '->', p); bad++; }
  }
}
console.log(`internal: ${files.length} pages checked`);
if (!internalOnly) {
  const list = [...external.keys()]; let i = 0;
  const one = async (url) => {
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 10000);
      const H = { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' };
      let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal, headers: H });
      if (r.status >= 400) r = await fetch(url, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: H });
      clearTimeout(t);
      if (r.status === 999 || r.status === 403 || r.status === 429) console.log('warn   ', r.status, url);
      else if (r.status >= 400) { console.log('EXTERNAL', r.status, url, '(' + external.get(url) + ')'); bad++; }
    } catch (e) { console.log('warn    error', e.name, url, '(' + external.get(url) + ')'); }
  };
  await Promise.all(Array.from({ length: 8 }, async () => { while (i < list.length) await one(list[i++]); }));
  console.log(`external: ${list.length} unique links checked`);
}
console.log(bad === 0 ? 'links: PASS' : `links: FAIL (${bad})`);
process.exit(bad ? 1 : 0);
