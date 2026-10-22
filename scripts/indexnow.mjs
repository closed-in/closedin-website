// IndexNow (22-10-2026): tells Bing (and the engines that share IndexNow, Yandex, Seznam, Naver) which live URLs changed, so they
// recrawl within hours instead of weeks. ChatGPT search and Copilot answer from Bing's index. The key file sits in the site root.
// Usage after a merge to main:  node scripts/indexnow.mjs --changed <merge-base or tag>   (html files changed since that commit)
//                               node scripts/indexnow.mjs / /blog/some-post /gtm-engineering-agency   (explicit paths)
// Add --dry to print the payload without sending. Only live URLs (www.closedin.io) are ever sent; never run it for the preview.
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)), 'case-study-showcase');
const HOST = 'www.closedin.io';
const keyFile = fs.readdirSync(root).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.error('no IndexNow key file in the site root'); process.exit(1); }
const key = fs.readFileSync(path.join(root, keyFile), 'utf8').trim();
const args = process.argv.slice(2); const dry = args.includes('--dry');
const urlOf = f => { let p = '/' + f.replace(/^case-study-showcase\//, '').replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''); return p.replace(/\/$/, '') || '/'; };
let paths = args.filter(a => a.startsWith('/'));
const ci = args.indexOf('--changed');
if (ci > -1) {
  const since = args[ci + 1];
  const files = execSync(`git diff --name-only ${since}..HEAD -- 'case-study-showcase/*.html' 'case-study-showcase/**/*.html'`, { cwd: path.resolve(root, '..') }).toString().trim().split('\n').filter(Boolean);
  paths = paths.concat(files.filter(f => !/404|pipeline-demo|index-light|\/assets\//.test(f)).map(urlOf));
}
paths = [...new Set(paths)];
if (!paths.length) { console.error('nothing to submit: give paths or --changed <ref>'); process.exit(1); }
const body = { host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: paths.map(p => `https://${HOST}${p}`) };
console.log(body.urlList.length, 'urls'); if (dry) { console.log(JSON.stringify(body, null, 1)); process.exit(0); }
const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log('IndexNow:', r.status, r.status === 200 || r.status === 202 ? 'accepted' : await r.text());
