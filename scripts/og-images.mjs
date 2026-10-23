// Link-preview images (20-10-2026): one 1200x630 JPEG per page in the current site look (dark, glyph field, wordmark, the page's
// own headline, the key numbers on case pages). Reads each page from the local server (npx serve -l 8080 ../case-study-showcase),
// renders scripts/og/og.html and writes case-study-showcase/assets/img/og/<slug>-v1.jpg. Usage: node og-images.mjs [path ...]
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, '..', 'case-study-showcase', 'assets', 'img', 'og');
const PAGES = ['/', '/case-studies', '/resources', '/team', '/pricing', '/privacy', '/playbook', '/blog/', '/clay-agency', '/cold-email-agency-amsterdam',
  '/cold-email-agency-saas', '/gtm-engineering-agency', '/outbound-agency-uk', '/outbound-agency-us',
  ...['endresz', 'gen-zero', 'jamezz', 'mistertafel', 'redfox', 'verzendbazen', 'wetaxus', 'zano'].map(s => '/case-study-' + s),
  ...['apollo-booleans', 'sales-nav-booleans', 'claude-code-sales', 'icp-scorecard', 'pre-launch-audit', 'gtm-stack', 'n8n-workflows', 'cold-email-templates', 'clay-waterfall'].map(s => '/resources/' + s),
  '/tools/roi-calculator', '/tools/email-verifier',
  ...['cold-email-open-rate-vanity-metric', 'cold-email-warmup-schedule', 'finding-prospects-not-in-apollo'].map(s => '/blog/' + s)];
export const slugOf = p => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
const paths = process.argv.slice(2).length ? process.argv.slice(2) : PAGES;
const fs = await import('fs'); fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
const src = await browser.newPage(); await src.setViewport({ width: 1280, height: 900 });
await src.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
const og = await browser.newPage(); await og.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
let n = 0;
for (const p of paths) {
  await src.goto('http://localhost:8080' + p, { waitUntil: 'domcontentloaded' });
  const d = await src.evaluate((p) => {
    const t = s => (s || '').replace(/\s+/g, ' ').trim();
    const h1 = document.querySelector('main h1');
    let title = '';
    if (h1) {
      const hasB = !!h1.querySelector('b');
      h1.childNodes.forEach(n => {
        const s = n.nodeType === 3 ? n.textContent : n.tagName === 'BR' ? ' ' : n.textContent;
        if (!t(s) && n.tagName !== 'BR') { title += ' '; return; }
        const esc = s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        title += n.nodeType === 1 && n.tagName === 'B' ? `<b>${esc}</b>` : n.tagName === 'BR' ? ' ' : hasB ? `<span class="g">${esc}</span>` : esc;
      });
      title = title.replace(/\s+/g, ' ').trim();
    }
    const q = s => document.querySelector(s);
    let eyebrow = 'GTM engineering agency', cta = 'Book a 30 min call', stats = [], tag = '';
    if (p === '/') { eyebrow = 'Most Innovative B2B GTM Engineering Agency 2026'; tag = 'Creative GTM engineering agency in Amsterdam. Qualified B2B sales calls in 2-3 weeks.'; }
    else if (p.startsWith('/case-study-')) { eyebrow = 'Case study · ' + (q('.case-logo') ? q('.case-logo').alt : ''); cta = 'Read the case'; stats = [...document.querySelectorAll('.case-stat')].slice(0, 3).map(e => [t(e.querySelector('b').textContent), t(e.querySelector('span').textContent)]); }
    else if (p.startsWith('/blog/') && p !== '/blog/') { eyebrow = 'Blog · ' + t(q('.post-tag') && q('.post-tag').textContent); cta = 'Read the post'; tag = t(q('.hero .lead') && q('.hero .lead').textContent).split('. ')[0] + '.'; }
    else if (p === '/blog/') { eyebrow = 'The closed:in blog'; cta = 'Read the blog'; tag = 'Tactics from live outbound campaigns, one post per week.'; }
    else if (p.startsWith('/resources/') || p.startsWith('/tools/') || p === '/playbook') { eyebrow = p.startsWith('/tools/') ? 'Free tool' : 'Free resource'; cta = 'Get it free'; tag = 'From the closed:in resource vault. Built from live client campaigns.'; }
    else if (p === '/resources') { eyebrow = 'Resource vault'; cta = 'Browse the vault'; }
    else if (p === '/case-studies') { eyebrow = 'Case studies'; cta = 'See all cases'; }
    else if (p === '/team') { eyebrow = 'Team'; cta = 'Meet the team'; }
    else if (p === '/privacy') { eyebrow = 'Privacy'; cta = 'Read the policy'; tag = 'closed:in, Jodenbreestraat 25, Amsterdam.'; }
    else if (p === '/pricing') { eyebrow = 'Pricing'; }
    else { const pill = q('.phero__pill'); if (pill) eyebrow = t(pill.textContent); stats = [...document.querySelectorAll('.case-stat')].slice(0, 3).map(e => [t(e.querySelector('b').textContent), t(e.querySelector('span').textContent)]); }
    return { title, eyebrow, cta, stats, tag, h1: h1 ? t(h1.textContent) : '' };
  }, p);
  if (!d.title) { console.log('no h1', p); continue; }
  d.seed = [...p].reduce((a, c) => a + c.charCodeAt(0), 0) % 97 + 3;
  await og.goto('file://' + path.join(here, 'og', 'og.html') + '?n=' + n + '#' + encodeURIComponent(JSON.stringify(d)));   // the query forces a fresh load (a hash change alone keeps the page)
  await og.waitForFunction(() => document.title === 'ready', { timeout: 10000 });
  const file = path.join(OUT, slugOf(p) + '-v1.jpg');
  await og.screenshot({ path: file, type: 'jpeg', quality: 86 });
  n++; console.log(slugOf(p).padEnd(40), d.eyebrow.padEnd(48), d.h1.slice(0, 60));
}
await browser.close();
console.log(n, 'images');
