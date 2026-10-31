/* The stack dock: every tool icon sits in place, grey; as you scroll the five partners light up one by one and open their window, then the rest of the stack and the CRMs light up in one wave. A glowing line with a character stream runs down the divider (ported from Max' Stack Dock artifact, 18-10-2026). */

(() => {
// logos: closedin.io/logos, plus the official app icons of the tools that weren't on the site yet
const LOGOS = {"linkedin": "/assets/img/stack/linkedin.webp", "apollo": "/assets/img/stack/apollo.webp", "apify": "/assets/img/stack/apify.webp", "trigify": "/assets/img/stack/trigify.webp", "clay": "/assets/img/stack/clay.webp", "findymail": "/assets/img/stack/findymail.webp", "datagma": "/assets/img/stack/datagma.webp", "hunter": "/assets/img/stack/hunter.webp", "instantly": "/assets/img/stack/instantly.webp", "heyreach": "/assets/img/stack/heyreach.webp", "lemlist": "/assets/img/stack/lemlist.webp", "close": "/assets/img/stack/close.webp", "hubspot": "/assets/img/stack/hubspot.webp", "salesforce": "/assets/img/stack/salesforce.webp", "n8n": "/assets/img/stack/n8n.webp", "crossbeam": "/assets/img/stack/crossbeam.webp", "claude": "/assets/img/stack/claude.webp", "chatgpt": "/assets/img/stack/chatgpt.webp", "perplexity": "/assets/img/stack/perplexity.webp", "notion": "/assets/img/stack/notion.webp", "fireflies": "/assets/img/stack/fireflies.webp", "beehiiv": "/assets/img/stack/beehiiv.webp", "aiark": "/assets/img/stack/aiark.webp", "monday": "/assets/img/stack/monday.webp", "pipedrive": "/assets/img/stack/pipedrive.webp", "prospeo": "/assets/img/stack/prospeo.webp", "reshark": "/assets/img/stack/reshark.webp", "folk": "/assets/img/stack/folk.webp", "attio": "/assets/img/stack/attio.svg", "slack": "/assets/img/stack/slack.webp"};

// the two snakes, in the order of the toolstack sheet (green rows). The first five open a window as they land.
const STACK = [
  ['clay','Clay','c','#0b8a52','w-clay'], ['instantly','Instantly','c','#2c64f6','w-instantly'], ['apollo','Apollo.io','c','#d9e21c','w-apollo'],
  ['claude','Claude','m','#d97757','w-claude'], ['n8n','n8n','k','#ea4b71','w-n8n'], ['heyreach','HeyReach','c'], ['prospeo','Prospeo','c'],
  ['slack','Slack','c'], ['aiark','AI Ark','c'], ['apify','Apify','c'], ['reshark','Re:Shark','c'],
];
// what each tool does for a campaign (shown on hover)
const DESC = {
  clay: 'Enrichment and waterfall data. Every list is built, enriched and scored here.',
  instantly: 'Sends the email campaigns and keeps the inboxes healthy.',
  apollo: 'Sources contacts at volume and enriches emails early in the waterfall.',
  claude: 'Writes the copy, runs the research prompts and powers our automations.',
  n8n: 'The automation glue: syncs Clay, Instantly and your CRM.',
  heyreach: 'Runs the LinkedIn side of every campaign, in sync with email.',
  prospeo: 'Finds and verifies emails and phone numbers for the hard-to-reach contacts.',
  slack: 'Where we work with you: a live campaign channel with replies and alerts.',
  aiark: 'Account intelligence for building target lists and lookalikes.',
  apify: 'Scrapes sites and signals to build intent-based lists.',
  reshark: 'Extra signal and contact data to time the outreach right.',
  hubspot: 'Replies and booked meetings land straight in your HubSpot.',
  salesforce: 'Replies and booked meetings land straight in your Salesforce.',
  pipedrive: 'Replies and booked meetings land straight in your Pipedrive.',
  close: 'Our own CRM, and the one we plug into for Close customers.',
  monday: 'Replies and booked meetings land straight in your monday.com.',
  attio: 'Attio Expert Partner. Replies and booked meetings land straight in your Attio.',
  folk: 'Replies and booked meetings land straight in your Folk.',
};
const CRM = [['hubspot','HubSpot','c'], ['salesforce','Salesforce','k'], ['pipedrive','Pipedrive','c'], ['close','Close','k'], ['monday','monday.com','c'], ['attio','Attio','k'], ['folk','Folk','m']];
// partner tags under an icon (31-10: closed:in is an Attio Expert Partner; the badge itself sits in the hover tip and in the footer)
const TAGS = { attio: 'Expert Partner' };
const BADGES = { attio: '/assets/img/logos-web/attio-expert-partner.webp' };

const $ = id => document.getElementById(id);
const stack = $('stack'), pin = $('stack-pin'), head = $('stack-head'), snakesEl = $('stack-snakes');
if (!stack || !pin || !head || !snakesEl) return;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, t) => { t = clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerpP = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
stack.querySelectorAll('img[data-logo]').forEach(i => { i.src = LOGOS[i.dataset.logo]; });
const K = { st: .117, arm: .745, dot: .117, dotY: .1825, L: { x: -.86, y: .89 }, R: { x: .87, y: -.83 } };
K.sq = (K.arm - K.st) / 2;
const N_ALL = STACK.length + CRM.length;

// snake DOM
const svgNS = 'http://www.w3.org/2000/svg';
const lanesEl = document.createElement('div'); lanesEl.style.cssText = 'position:absolute;inset:0'; snakesEl.appendChild(lanesEl);   // clipped, so icons appear from under the labels
const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('aria-hidden', 'true'); lanesEl.appendChild(svg);
const mkPath = () => { const p = document.createElementNS(svgNS, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#e3e2ec'); p.setAttribute('stroke-width', '2'); p.setAttribute('stroke-dasharray', '2 8'); p.setAttribute('stroke-linecap', 'round'); svg.appendChild(p); return p; };
// toolstack in two snakes that both run down: the five tools with a window ride the left snake, in sheet order,
// so their windows pop up one after another (Clay, Instantly, Apollo, Claude, n8n); the rest ride the right snake
const LANES = [STACK.filter(s => s[4]), STACK.filter(s => !s[4]), CRM];
const labels = ['<b>Toolstack</b>', '<b>CRM</b>'].map(h => { const lab = document.createElement('div'); lab.className = 'lane-label'; lab.innerHTML = h; snakesEl.appendChild(lab); return lab; });
const sep = document.createElement('span'); sep.className = 'lane-sep'; snakesEl.appendChild(sep);
const prog = document.createElement('span'); prog.className = 'lane-prog'; prog.innerHTML = '<i></i><b></b>'; snakesEl.appendChild(prog);
const progFill = prog.firstChild, progDot = prog.lastChild;
// Firecrawl-style character stream behind the divider: always moving a little, accent blue where the scroll has been
const asc = document.createElement('canvas'); asc.className = 'lane-ascii'; snakesEl.insertBefore(asc, prog);
const actx = asc.getContext('2d'); let AW = 0, AH = 0, APF = 0;
const snakes = LANES.map((list, si) => {
  const path = mkPath();
  const items = list.map(([key, name, fit, color, win], i) => {
    const hole = document.createElement('span'); hole.className = 'hole'; lanesEl.appendChild(hole);
    const el = document.createElement('div'); el.className = 'tok' + (fit === 'k' ? ' k' : fit === 'm' ? ' m' : '') + (win ? ' feat' : '');
    el.innerHTML = `<img src="${LOGOS[key]}" alt="" width="64" height="64" decoding="async">`; el.setAttribute('role', 'img'); el.setAttribute('aria-label', name);
    if (color) el.style.setProperty('--c', color);
    lanesEl.appendChild(el);
    const it = { el, hole, i, key, name, win };
    if (TAGS[key]) { el.classList.add('part'); const tag = document.createElement('span'); tag.className = 'dock-tag'; tag.textContent = TAGS[key]; lanesEl.appendChild(tag); it.tag = tag; }
    el.addEventListener('mouseenter', () => showTip(it, si)); el.addEventListener('mouseleave', hideTip);
    return it;
  });
  return { list, path, items };
});


// hover tip
const tip = document.createElement('div'); tip.className = 'tip'; pin.appendChild(tip);
function showTip(it, si) {
  if (!G || !it.el.classList.contains('in') || !DESC[it.key]) return;
  const sl = G.S[si].slots[it.i];
  tip.innerHTML = `<b>${it.name}</b><span>${DESC[it.key]}</span>` + (BADGES[it.key] ? `<img class="tip__badge" src="${BADGES[it.key]}" alt="${it.name} ${TAGS[it.key] || ''}" decoding="async">` : '');
  tip.style.left = (G.sx0 + sl.x - G.d / 2 - 10) + 'px'; tip.style.top = (G.sy0 + sl.y) + 'px';
  tip.classList.add('on');
}
function hideTip() { tip.classList.remove('on'); }

// windows
const wins = STACK.filter(s => s[4]).map(s => { const el = $(s[4]); return { key: s[0], id: s[4], el, top: el.querySelector('.w-top'), body: el.querySelector('.w-body'), last: -1 }; });
const winsEl = $('stack-wins');
wins.forEach(w => { const disc = w.el.querySelector('.w-top .disc'), f = STACK.find(s => s[0] === w.key)[2]; if (f === 'k' || f === 'm') disc.classList.add(f); });

let G = null;
function layout() {
  const PW = pin.clientWidth, PH = pin.clientHeight, narrow = PW < 900;
  const gx = clamp(PW * .04, 16, 64), gy = clamp(PH * .1, 88, 120);   /* room for the fixed nav */
  const SA = narrow ? clamp(PW * .3, 120, 220) : clamp(PW * .2, 220, 340);          // the snakes' strip, right side
  pin.style.setProperty('--gx', gx + 'px'); pin.style.setProperty('--gy', gy + 'px'); pin.style.setProperty('--sa', SA + 'px');
  const sx0 = PW - gx - SA, sy0 = gy, sH = PH - gy * 2;
  Object.assign(snakesEl.style, { left: sx0 + 'px', top: sy0 + 'px', width: SA + 'px', height: sH + 'px' });
  // three lanes, all running down: two toolstack snakes, then a striped divider, then the CRM snake
  const labH = 26, top0 = labH + 10, rows = 7;
  const laneX = [SA * .15, SA * .42, SA * .84], sepX = SA * .63;
  const rowP = (sH - top0 - 8) / rows;
  const d = clamp(Math.min(SA * .2, rowP * .66), 28, 58);
  snakesEl.style.setProperty('--d', d + 'px');
  lanesEl.style.clipPath = `inset(${labH + 4}px -40px -40px -40px)`;              // icons appear from just under the lane labels
  Object.assign(sep.style, { left: sepX + 'px', top: (labH + 6) + 'px', bottom: '0px' });
  Object.assign(prog.style, { left: sepX + 'px', top: (labH + 6) + 'px', bottom: '0px' });
  { const dpr = Math.min(2, devicePixelRatio || 1); AW = Math.round(Math.min(46, SA * .16)); AH = Math.round(sH - labH - 6);
    asc.width = AW * dpr; asc.height = AH * dpr; Object.assign(asc.style, { left: sepX + 'px', top: (labH + 6) + 'px', width: AW + 'px', height: AH + 'px' });
    actx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  labels[0].style.left = (laneX[0] + laneX[1]) / 2 + 'px'; labels[1].style.left = laneX[2] + 'px';
  const Y = r => top0 + rowP * (r + .5);
  const gap = rowP * .72;                                     // a bit closer than the slots (so the top slot lands first), but wide enough that moving icons never overlap
  const build = (si) => {
    const sn = snakes[si], n = sn.items.length, x = laneX[si];
    const slots = sn.items.map((_, k) => ({ x, y: Y(k) }));
    const startY = top0 - rowP * .9;                        // just above the clipped lane top: the first icon shows as soon as the chain moves
    sn.path.setAttribute('d', '');
    const slotS = slots.map(sl => sl.y - startY);
    const posAt = s_ => ({ x, y: startY + s_ });
    sn.items.forEach((it, k) => { it.hole.style.left = slots[k].x + 'px'; it.hole.style.top = slots[k].y + 'px'; if (it.tag) { it.tag.style.left = slots[k].x + 'px'; it.tag.style.top = (slots[k].y + d / 2 + 5) + 'px'; it.tag.classList.toggle('off', rowP - d < 24); } });   // the tag needs 24px between the rows (5px gap, 17px pill, 2px to the next icon), otherwise it stays hidden
    const o = 0;
    return { slots, slotS, posAt, gap, o, Hend: slotS[n - 1] };
  };
  const S = [build(0), build(1), build(2)];
  const hEnd = Math.max(...S.map(g => g.Hend + g.o));
  // windows: the left four-fifths, two on top (Clay, Instantly), three below (Apollo, Claude, n8n)
  const wx0 = gx, wx1 = sx0 - (narrow ? 12 : 28), wy0 = gy + (head.offsetHeight || 60) + 14, wy1 = PH - gy * .4, pg = narrow ? 8 : 14;
  const W = wx1 - wx0, H = wy1 - wy0, hTop = (H - pg) * .6, hBot = H - pg - hTop, hBig = (H - pg) * .82;   // 18-10: Clay and Instantly open big (hBig), then settle to hTop when the bottom row comes in
  stack.classList.toggle('stack--short', hTop < 400); stack.classList.toggle('stack--xshort', hTop < 300); stack.classList.toggle('stack--tiny', hTop < 240);   // short laptops: tighter type
  const w2 = (W - pg) / 2, w3 = (W - pg * 2) / 3;
  const rects = narrow
    ? wins.map((_, i) => ({ x: wx0, y: wy0 + i * (H + pg) / 5, w: W, h: (H + pg) / 5 - pg }))
    : [{ x: wx0, y: wy0, w: w2, h: hTop }, { x: wx0 + w2 + pg, y: wy0, w: w2, h: hTop },
       { x: wx0, y: wy0 + hTop + pg, w: w3, h: hBot }, { x: wx0 + w3 + pg, y: wy0 + hTop + pg, w: w3, h: hBot }, { x: wx0 + (w3 + pg) * 2, y: wy0 + hTop + pg, w: w3, h: hBot }];
  wins.forEach((w, i) => { const r = rects[i], st = w.el.style; st.setProperty('--tx', r.x + 'px'); st.setProperty('--ty', r.y + 'px'); st.setProperty('--tw', r.w + 'px'); st.setProperty('--th', r.h + 'px'); st.setProperty('--pd', d + 'px'); w.rect = r; w.base = r; w.big = (!narrow && i < 2) ? { x: r.x, y: r.y, w: r.w, h: hBig } : null; w.lastS = -1; });
  const padW = parseFloat(getComputedStyle(wins[0].el.querySelector('.w-in')).paddingLeft) || 20;
  const U = { x0: wx0, y0: wy0, x1: wx1, y1: wy1 };
  G = { PW, PH, S, d, gap, hEnd, sx0, sy0, padW, U, narrow };
  // when does each featured icon land? (scroll position, so its window can open right then)
  wins.forEach(w => {
    const si = snakes.findIndex(sn => sn.items.some(it => it.key === w.key)), sn = snakes[si], it = sn.items.find(x => x.key === w.key), g = S[si];
    const headAt = g.slotS[it.i] + (sn.items.length - 1 - it.i) * gap + g.o;
    w.lane = si; w.item = it;
    w.landP = FEAT0 + wins.indexOf(w) * FEATSTEP; it.act = w.landP;
  });
  dirty = true; wins.forEach(w => { w.last = -1; });
}

// ── timeline ──
// dock timeline: every icon sits in place, grey, from the start (the progress starts PRE viewports before the pin)
// 0.06 to 0.70  Clay, Instantly, Apollo, Claude, n8n light up one by one and their window grows out of the icon
// 0.77 to 0.96  the rest of the stack and the CRMs light up in one quick wave, top to bottom
// 0.96 to 1.00  a short hold on the full picture, then the page scrolls on
// 19-10 (Max): the hold used to run from 0.82 (over half a screen of scrolling where nothing moved, the site felt stuck). The section is 370vh instead of
// 420vh (the progress range 3.0 instead of 3.5 screens) and every moment is stretched by T, so everything before keeps its pace per scrolled pixel.
const T = 3.5 / 3.0;
const WOPEN = .07 * T, FEAT0 = .05 * T, FEATSTEP = .12 * T, WAVE0 = .66 * T, WAVE1 = .82 * T, PRE = .3;
const rest = [];
[1, 2].forEach(si => snakes[si].items.forEach(it => rest.push(it)));
rest.sort((a, b) => a.i - b.i);
rest.forEach((it, k) => { it.act = WAVE0 + k / Math.max(1, rest.length - 1) * (WAVE1 - WAVE0); });


let target = 0, p = 0, last = performance.now(), drawnP = -1, dirty = true;
// 19-10: both loops (the scroll timeline and the character stream) only run while the section is near the screen; they used to run every frame for the whole visit
let near = true, frameOn = false, asciiOn = false;
const wake = () => {
  if (!frameOn) { read(); const r = stack.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) { p = target; dirty = true; }   // still out of sight (e.g. after a jump): no catch-up animation
    frameOn = true; last = performance.now(); requestAnimationFrame(frame); }
  if (!asciiOn && !reduce) { asciiOn = true; requestAnimationFrame(ascii); }
};
if ('IntersectionObserver' in window) new IntersectionObserver(en => { near = en[en.length - 1].isIntersecting; if (near) wake(); }, { rootMargin: '25% 0px' }).observe(stack);
function read() { const r = stack.getBoundingClientRect(), pre = innerHeight * PRE; target = clamp((pre - r.top) / Math.max(1, stack.offsetHeight - innerHeight + pre), 0, 1); }

function frame(now) {
  if (!near && p === target && !dirty) { frameOn = false; return; }   // off screen and settled: sleep until the observer wakes us
  const dt = Math.min(64, now - last); last = now;
  read();
  p += (target - p) * (reduce ? 1 : 1 - Math.exp(-dt / 140));
  if (Math.abs(target - p) < 1e-5) p = target;
  if (p === drawnP && !dirty) { requestAnimationFrame(frame); return; }      // nothing moved: skip the frame's work
  drawnP = p; dirty = false;

  // the dock: icons stay in their slot and light up at their moment; the featured five grow a little while their window opens
  let landed = 0;
  snakes.forEach((sn, si) => {
    const g = G.S[si];
    sn.items.forEach(it => {
      const q = g.slots[it.i], arrived = p >= it.act;
      const nowOn = !!it.win && arrived && p < it.act + FEATSTEP;
      if (nowOn !== it.el.classList.contains('on-now')) it.el.classList.toggle('on-now', nowOn);
      const tf = `${q.x.toFixed(1)}px ${q.y.toFixed(1)}px`;
      if (tf !== it.tf) { it.el.style.translate = tf; it.tf = tf; }
      if (arrived !== it.el.classList.contains('in')) { it.el.classList.toggle('in', arrived); if (it.tag) it.tag.classList.toggle('in', arrived); }
      if (arrived) landed++;
    });
  });

  // the running line in the divider follows the scroll continuously, so there is always motion between the moments
  const pf = clamp(p / WAVE1, 0, 1);
  progFill.style.transform = `scaleY(${pf.toFixed(4)})`;
  progDot.style.top = (pf * 100).toFixed(3) + '%'; APF = pf;

  // Clay and Instantly open big; they settle to their base size while Apollo comes in (the bottom row needs the room)
  const settle = wins[2] ? io(ss(wins[2].landP - .03 * T, wins[2].landP + .05 * T, p)) : 1;
  // the windows grow out of their icon the moment it lands
  wins.forEach(w => {
    const e = io(ss(w.landP, w.landP + WOPEN, p)), s = w.big ? settle : 1;
    if (e === w.last && s === w.lastS) return;
    if (w.big && s !== w.lastS) { const b = w.big, a = w.base; w.rect = { x: a.x, y: a.y, w: a.w, h: lerp(b.h, a.h, s) }; w.el.style.setProperty('--th', w.rect.h.toFixed(1) + 'px'); }
    w.last = e; w.lastS = s;
    if (e <= 0.001) { w.el.classList.remove('on'); return; }
    const sl = G.S[w.lane].slots[w.item.i];
    const fx = G.sx0 + sl.x, fy = G.sy0 + sl.y, r = G.d / 2;               // the landed icon's circle
    const from = { x: fx - r, y: fy - r, w: G.d, h: G.d }, to = w.rect;
    const x = lerp(from.x, to.x, e), y = lerp(from.y, to.y, e), ww = lerp(from.w, to.w, e), hh = lerp(from.h, to.h, e), rad = lerp(r, 22, e);
    w.el.classList.add('on');
    w.el.style.clipPath = `inset(${y.toFixed(2)}px ${(G.PW - x - ww).toFixed(2)}px ${(G.PH - y - hh).toFixed(2)}px ${x.toFixed(2)}px round ${rad.toFixed(2)}px)`;
    const rv = ss(.55, 1, e);
    w.body.style.opacity = rv.toFixed(3);
    w.body.style.transform = `translate3d(0, ${((1 - rv) * 14).toFixed(2)}px, 0)`;
    // the logo disc starts exactly on the icon and rides to the window's top-left corner
    const pad = G.padW;
    w.top.style.transform = `translate3d(${((from.x - (to.x + pad)) * (1 - e)).toFixed(2)}px, ${((from.y - (to.y + pad)) * (1 - e)).toFixed(2)}px, 0)`;
  });

  requestAnimationFrame(frame);
}
const CH = " .'`-_,:;^\"~+=*";
const hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
function ascii(now) {
  if (AW && AH) {
    const t = reduce ? 0 : now / 1000, cw = 7, rh = 11, cols = Math.floor(AW / cw), rows = Math.ceil(AH / rh), head = APF * AH;
    actx.clearRect(0, 0, AW, AH);
    actx.font = '500 10px ui-monospace, "SF Mono", Menlo, monospace'; actx.textAlign = 'center'; actx.textBaseline = 'middle';
    const ox = (AW - cols * cw) / 2 + cw / 2;
    for (let r = 0; r < rows; r++) {
      const y = r * rh + rh / 2, done = y <= head, nh = Math.max(0, 1 - Math.abs(y - head) / 70);
      for (let c = 0; c < cols; c++) {
        const mid = 1 - Math.abs(c - (cols - 1) / 2) / ((cols + 1) / 2);              // denser towards the line
        const wave = Math.sin(r * .42 - t * (done ? 5.5 : 2.2) + c * .9) * .5 + .5;     // waves running down
        const flick = hash(r * 7 + c, Math.floor(t * (done ? 14 : 5) + c * 3.1));       // fast flicker, like Firecrawl
        let v = wave * .55 + flick * .45; v *= .45 + mid * .75; v += nh * .6;
        if (v < (done ? .42 : .6)) continue;
        const ch = CH[Math.min(CH.length - 1, Math.floor(v * (CH.length - 1)))];
        const a = done ? Math.min(1, .35 + v * .55 + nh * .3) : .14 + nh * .5;
        actx.fillStyle = done || nh > .2 ? `rgba(84,160,240,${a.toFixed(3)})` : `rgba(150,160,185,${a.toFixed(3)})`;
        actx.fillText(ch, ox + c * cw, y);
      }
    }
  }
  if (!reduce && near) requestAnimationFrame(ascii); else asciiOn = false;
}
addEventListener('resize', layout);
// A classic scrollbar (Mac with 'always show scrollbars', Windows) appears once the page transition lets the page scroll: the section gets
// 15px narrower without a resize event and the windows' right edges cut into their padding (Max 19-10). Measure again whenever the pinned frame changes size.
if ('ResizeObserver' in window) new ResizeObserver(() => { if (G && (pin.clientWidth !== G.PW || pin.clientHeight !== G.PH)) layout(); }).observe(pin);
document.fonts?.ready.then(layout);
layout(); read(); p = target;
wake();
})();
