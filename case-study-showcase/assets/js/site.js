/* closed:in site.js v4: particle hero, nav states, letter and word reveals, ripple and magnetic buttons, border beams, cursor follower, spotlight and tilt cards, carousels, counters, FAQ, Wistia lightbox, forms, 3D mark in the hero. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = hasGsap && !reduce;
  function desktop() { return window.innerWidth >= 1024; }
  if (!motion) html.classList.remove('js');

  /* Lenis */
  var lenis = null;
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false, anchors: { offset: -100 } });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  window.__closedin = { lenis: lenis, ScrollTrigger: window.ScrollTrigger || null };

  /* ---------- Particle dots in the hero (mouse parallax) ---------- */
  var dotsCanvas = document.querySelector('canvas.dots');
  if (dotsCanvas && !reduce) {
    var ctx = dotsCanvas.getContext('2d'), dots = [], W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);
    var mx = 0, my = 0, tx = 0, ty = 0, visible = true, raf = null, last = 0;
    function size() { W = innerWidth; H = innerHeight; dotsCanvas.width = W * DPR; dotsCanvas.height = H * DPR; dotsCanvas.style.width = W + 'px'; dotsCanvas.style.height = H + 'px'; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); seed(); }
    function seed() { dots = []; var n = Math.round((W * H) / 9000); for (var i = 0; i < n; i++) { var z = Math.random(); dots.push({ x: Math.random() * W, y: Math.random() * H, z: z, r: 0.8 + z * 1.6, a: 0.18 + z * 0.4, vx: (Math.random() - .5) * 0.06, vy: (Math.random() - .5) * 0.06, ph: Math.random() * Math.PI * 2 }); } }
    function draw(t) {
      raf = null; if (!visible) return;
      var dt = Math.min(40, t - last) || 16; last = t;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i]; d.x += d.vx * dt * 0.06; d.y += d.vy * dt * 0.06;
        if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10; if (d.y < -10) d.y = H + 10; if (d.y > H + 10) d.y = -10;
        var px = d.x + mx * (0.012 + d.z * 0.05), py = d.y + my * (0.012 + d.z * 0.05);
        var tw = 0.75 + 0.25 * Math.sin(t / 1400 + d.ph);
        ctx.beginPath(); ctx.arc(px, py, d.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(80, 90, 96,' + (d.a * tw).toFixed(3) + ')'; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(draw); }
    window.addEventListener('resize', size); size(); kick();
    window.addEventListener('pointermove', function (e) { tx = e.clientX - W / 2; ty = e.clientY - H / 2; }, { passive: true });
    var heroEl = document.querySelector('.hero');
    var onScroll = function () { var h = heroEl ? heroEl.offsetHeight : innerHeight; var f = Math.max(0, 1 - (scrollY / (h * 0.8))); dotsCanvas.style.opacity = f.toFixed(2); var v = f > 0.02; if (v !== visible) { visible = v; if (v) kick(); } };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
  }

  /* ---------- Nav: scrolled pill group, dark theme over dark sections ---------- */
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    /* Logo morph: Max' specimen, mode "c n". Web Animations, reversible, instant under reduced motion. */
    var logoEl = nav.querySelector('[data-logo]'), logo = null;
    if (logoEl) {
      var DUR = 750, EASE = 'cubic-bezier(.65,0,.35,1)';
      var buildLogo = function (el) {
        var inner = document.createElement('span'); inner.className = 'inner';
        var base = document.createElement('span'); base.className = 'base'; inner.appendChild(base);
        var mk = function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; inner.appendChild(s); return s; };
        var left = 'closed'.split('').map(mk);
        var colon = document.createElement('span'); colon.className = 'colon';
        var d1 = document.createElement('i'); d1.className = 'dot'; var d2 = document.createElement('i'); d2.className = 'dot'; colon.appendChild(d1); colon.appendChild(d2); inner.appendChild(colon);
        var right = 'in'.split('').map(mk);
        var hl = document.createElement('span'); hl.className = 'hook'; var hr = document.createElement('span'); hr.className = 'hook'; inner.appendChild(hl); inner.appendChild(hr);
        el.appendChild(inner);
        return { el: el, base: base, left: left, right: right, colon: colon, d1: d1, d2: d2, hl: hl, hr: hr, anims: [], mark: false };
      };
      var geo = function (a) {
        var fs = parseFloat(getComputedStyle(a.el).fontSize), em = function (v) { return v * fs; };
        var base = a.base.offsetTop, xh = em(.546), asc = em(.76);
        var cx = a.colon.offsetLeft + em(.1375);
        var dTop = base - em(.4105), dBot = base - em(.0455), cy = (dTop + dBot) / 2;
        a.d1.style.top = (dTop - a.colon.offsetTop) + 'px'; a.d2.style.top = (dBot - a.colon.offsetTop) + 'px';
        var st = em(.117), stem = em(.075), arm = em(.745);
        var ctr = function (s) { return s.offsetLeft + (s.offsetWidth + em(.07)) / 2; };
        var L1 = { x: cx - em(.86), y: cy + em(.89) }, R1 = { x: cx + em(.87), y: cy - em(.83) };
        return { em: em, base: base, xh: xh, asc: asc, cx: cx, cy: cy, st: st, stem: stem, arm: arm, ctr: ctr,
          FL: { x: L1.x - st / 2, y: L1.y - arm + st / 2, w: arm, h: arm }, FR: { x: R1.x - arm + st / 2, y: R1.y - st / 2, w: arm, h: arm },
          BL: function (w) { return '0px 0px ' + w + 'px ' + w + 'px'; }, BR: function (w) { return w + 'px ' + w + 'px 0px 0px'; } };
      };
      var box = function (b, bw, op, extra) { var o = { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px', borderWidth: bw, opacity: op }; if (extra) for (var k in extra) o[k] = extra[k]; return o; };
      var frames = function (a, g) {
        var out = [], adv = function (s) { return s.offsetWidth + g.em(.07); };
        var lk = a.left[0], rk = a.right[a.right.length - 1], lx = g.ctr(lk), rx = g.ctr(rk);
        a.left.concat(a.right).forEach(function (s) {
          if (s === lk || s === rk) { out.push([s, [{ opacity: 1, offset: 0 }, { opacity: 0, offset: .1 }, { opacity: 0, offset: 1 }], 'linear']); return; }
          var tx = ((a.left.indexOf(s) > -1 ? lx : rx) - g.ctr(s)) * .45;
          out.push([s, [{ opacity: 1, transform: 'none', filter: 'blur(0px)', offset: 0 }, { opacity: 0, transform: 'translateX(' + tx + 'px)', filter: 'blur(5px)', offset: .42 }, { opacity: 0, transform: 'translateX(' + tx + 'px)', filter: 'blur(5px)', offset: 1 }], 'cubic-bezier(.4,0,.6,1)']);
        });
        var c = lk, n = rk;
        var SL = { x: c.offsetLeft + g.em(.045), y: g.base - g.xh, w: adv(c) - g.em(.1), h: g.xh };
        var SR = { x: n.offsetLeft + g.em(.07), y: g.base - g.xh, w: adv(n) - g.em(.14), h: g.xh };
        out.push([a.hl, [box(SL, g.BL(g.stem), 0, { offset: 0 }), box(SL, g.BL(g.stem), 1, { offset: .08, easing: EASE }), box(g.FL, g.BL(g.st), 1, { offset: 1 })], 'linear']);
        out.push([a.hr, [box(SR, g.BR(g.stem), 0, { offset: 0 }), box(SR, g.BR(g.stem), 1, { offset: .08, easing: EASE }), box(g.FR, g.BR(g.st), 1, { offset: 1 })], 'linear']);
        return out;
      };
      var runMorph = function (a, toMark, instant) {
        if (!a.el.animate) return;
        if (!instant && a.mark === toMark && a.anims.length) return;
        a.anims.forEach(function (x) { x.cancel(); }); a.anims = [];
        var g = geo(a);
        a.el.style.setProperty('--shift', (g.cx - a.el.offsetWidth / 2).toFixed(2));
        frames(a, g).forEach(function (f) { var an = f[0].animate(f[1], { duration: DUR, easing: f[2], fill: 'both', direction: toMark ? 'normal' : 'reverse' }); if (instant || reduce) an.finish(); a.anims.push(an); });
        a.mark = toMark;
      };
      logo = buildLogo(logoEl);
      var relayout = function () { runMorph(logo, logo.mark, true); };
      window.addEventListener('resize', relayout);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    }
    var setScrolled = function () { var s = scrollY > 80; nav.classList.toggle('is-scrolled', s); if (logo) runMorph(logo, s, !logo.anims.length && !s); };
    window.addEventListener('scroll', setScrolled, { passive: true }); setScrolled();
    var darkSections = document.querySelectorAll('[data-nav-theme="dark"]');
    var probe = function () { var y = 40; var dark = false; darkSections.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom >= y) dark = true; }); nav.classList.toggle('is-dark', dark); };
    window.addEventListener('scroll', probe, { passive: true }); window.addEventListener('resize', probe); probe();
    var dropdowns = nav.querySelectorAll('[data-dropdown]');
    var closeDropdowns = function (except) { dropdowns.forEach(function (dd) { if (dd === except) return; dd.classList.remove('is-open'); var b = dd.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false'); }); };
    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector('button'); if (!btn) return;
      btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var open = dd.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); closeDropdowns(dd); });
      if (fine) { var t; dd.addEventListener('pointerenter', function () { clearTimeout(t); dd.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }); dd.addEventListener('pointerleave', function () { t = setTimeout(function () { dd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }, 140); }); }
    });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeDropdowns(); });
    var burger = nav.querySelector('[data-burger]'), sheet = document.getElementById('mobile-menu');
    var openSheet = function () { if (!sheet) return; sheet.setAttribute('data-open', ''); sheet.removeAttribute('hidden'); nav.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; if (lenis) lenis.stop(); };
    var closeSheet = function () { if (!sheet || !sheet.hasAttribute('data-open')) return; sheet.removeAttribute('data-open'); sheet.setAttribute('hidden', ''); nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; if (lenis) lenis.start(); };
    if (burger && sheet) { burger.addEventListener('click', function () { sheet.hasAttribute('data-open') ? closeSheet() : openSheet(); }); sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeSheet); }); window.addEventListener('resize', function () { if (desktop()) closeSheet(); }); }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDropdowns(); closeSheet(); } });
  }

  /* ---------- Letter hover: split text into letters with a rising duplicate ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-letters]').forEach(function (el) {
      if (el.querySelector('.lh')) return;
      var text = el.textContent.trim(); if (!text || text.length > 40) return;
      var wrap = document.createElement('span'); wrap.className = 'lh'; wrap.setAttribute('aria-label', text);
      Array.prototype.forEach.call(text, function (c, i) { var s = document.createElement('span'); s.className = 'ch' + (c === ' ' ? ' sp' : ''); s.setAttribute('data-c', c); s.textContent = c === ' ' ? ' ' : c; s.style.setProperty('--i', i); s.setAttribute('aria-hidden', 'true'); wrap.appendChild(s); });
      el.textContent = ''; el.appendChild(wrap);
    });
  }

  /* ---------- Ripple buttons: dark circle grows from the cursor ---------- */
  document.querySelectorAll('.btn-accent').forEach(function (btn) {
    if (!btn.querySelector('.ripple')) { var r = document.createElement('span'); r.className = 'ripple'; r.setAttribute('aria-hidden', 'true'); btn.insertBefore(r, btn.firstChild); }
    var rip = btn.querySelector('.ripple');
    var place = function (e) { var b = btn.getBoundingClientRect(); var x = e ? e.clientX - b.left : b.width / 2, y = e ? e.clientY - b.top : b.height / 2; var d = Math.max(b.width, b.height) * 2.2; rip.style.width = rip.style.height = d + 'px'; rip.style.left = x + 'px'; rip.style.top = y + 'px'; };
    btn.addEventListener('pointerenter', place); btn.addEventListener('pointerleave', place); btn.addEventListener('focus', function () { place(null); });
  });

  /* ---------- Reveals ---------- */
  if (motion) {
    var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); en.target.classList.add('in'); } }); }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el, i) { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (i % 6) * 70); io.observe(el); });
    /* Counters */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count')); if (isNaN(end)) return;
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10), prefix = el.getAttribute('data-prefix') || '', suffix = el.getAttribute('data-suffix') || '', finalText = el.textContent;
      var fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }), obj = { v: 0 };
      var cio = new IntersectionObserver(function (entries) { if (!entries.some(function (en) { return en.isIntersecting; })) return; cio.disconnect(); gsap.to(obj, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: function () { el.textContent = prefix + fmt.format(obj.v) + suffix; }, onComplete: function () { el.textContent = finalText; } }); }, { rootMargin: '0px 0px -10% 0px' });
      cio.observe(el);
    });
    /* Engine flow: progress line + lit nodes */
    var flow = document.querySelector('[data-flow]');
    if (flow) {
      var line = flow.querySelector('.flow__line'), nodes = flow.querySelectorAll('.fnode');
      ScrollTrigger.create({ trigger: flow, start: 'top 70%', end: 'bottom 55%', onUpdate: function (st) { if (line) line.style.transform = 'translateX(-50%) scaleY(' + st.progress.toFixed(4) + ')'; var lit = Math.floor(st.progress * nodes.length); nodes.forEach(function (n, k) { n.classList.toggle('lit', k <= lit); }); } });
    }
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.fnode').forEach(function (n) { n.classList.add('lit'); });
  }

  /* ---------- Marquee duplicate ---------- */
  document.querySelectorAll('.marquee__track').forEach(function (track) { var clone = track.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.parentNode.appendChild(clone); track.parentNode.style.display = 'flex'; });

  /* ---------- Trusted-by wall: duplicate each row once for a seamless loop (clone is hidden from assistive tech) ---------- */
  document.querySelectorAll('.wall__track').forEach(function (t) { var dup = document.createElement('span'); dup.className = 'wall__dup'; dup.setAttribute('aria-hidden', 'true'); dup.style.display = 'contents'; dup.innerHTML = t.innerHTML; dup.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); }); t.appendChild(dup); });

  /* ---------- Carousels ([data-carousel] tracks, arrows found in the same section) ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (track) {
    var cards = Array.prototype.slice.call(track.children); if (!cards.length) return;
    var sec = track.closest('section') || document;
    var prev = sec.querySelector('[data-carousel-prev]'), next = sec.querySelector('[data-carousel-next]');
    var centered = getComputedStyle(cards[0]).scrollSnapAlign === 'center';
    var padL = function () { return parseFloat(getComputedStyle(track).paddingLeft) || 0; };
    var target = function (card) { return centered ? card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2 : card.offsetLeft - padL(); };
    var idx = function () { var c = track.scrollLeft, best = 0, bd = 1e9; cards.forEach(function (card, i) { var d = Math.abs(target(card) - c); if (d < bd) { bd = d; best = i; } }); return best; };
    var atEnd = function () { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 2; };
    var prog = sec.querySelector('[data-carousel-progress]'), pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var mark = function () { var i = idx(); cards.forEach(function (c, k) { c.classList.toggle('is-center', k === i); }); if (prev) prev.disabled = track.scrollLeft <= 1; if (next) next.disabled = atEnd(); if (prog) prog.textContent = pad(i + 1) + ' / ' + pad(cards.length); };
    var go = function (i) { i = Math.max(0, Math.min(cards.length - 1, i)); track.scrollTo({ left: target(cards[i]), behavior: 'smooth' }); };
    if (prev) prev.addEventListener('click', function () { go(idx() - 1); });
    if (next) next.addEventListener('click', function () { go(idx() + 1); });
    track.addEventListener('scroll', mark, { passive: true }); window.addEventListener('resize', mark);
    var start = parseInt(track.getAttribute('data-start') || '0', 10);
    requestAnimationFrame(function () { if (start) track.scrollLeft = target(cards[start]); mark(); });
  });

  /* ---------- Pixel clusters (Dapper): random twinkle, drift and re-arrange with scroll ---------- */
  document.querySelectorAll('.pixels').forEach(function (grid, gi) {
    var cols = parseInt(getComputedStyle(grid).getPropertyValue('--cols')) || 4, rows = parseInt(grid.getAttribute('data-rows') || '4', 10);
    var total = cols * rows, lit = parseInt(grid.getAttribute('data-lit') || String(Math.round(total * 0.3)), 10);
    var frag = document.createDocumentFragment(); var cells = [];
    for (var i = 0; i < total; i++) { var cell = document.createElement('i'); frag.appendChild(cell); cells.push(cell); }
    grid.appendChild(frag);
    var picked = cells.slice().sort(function () { return Math.random() - .5; }).slice(0, lit);
    picked.forEach(function (c) { c.classList.add('on'); });
    if (!motion) return;
    var px = parseFloat(getComputedStyle(grid).getPropertyValue('--px')) || 44;
    var twinkle = function (c) { gsap.to(c, { opacity: 0.12 + Math.random() * 0.55, duration: 0.5 + Math.random() * 1.2, ease: 'power1.inOut', onComplete: function () { gsap.delayedCall(Math.random() * 1.8, function () { if (grid.__live) twinkle(c); }); } }); };
    var start = function () { grid.__live = true; picked.forEach(function (c, k) { gsap.delayedCall(k * 0.12, function () { twinkle(c); }); }); };
    var stop = function () { grid.__live = false; picked.forEach(function (c) { gsap.killTweensOf(c); c.style.opacity = ''; }); };
    var scope = grid.closest('section, footer') || grid.parentElement;
    picked.forEach(function (c, k) { var dx = ((k % 3) - 1) * px * (1 + (k % 2)), dy = (k % 2 ? -1 : 1) * px * (1 + ((k + gi) % 3)); gsap.to(c, { x: dx, y: dy, ease: 'none', scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 0.8 } }); });
    ScrollTrigger.create({ trigger: scope, start: 'top bottom', end: 'bottom top', onEnter: start, onEnterBack: start, onLeave: stop, onLeaveBack: stop });
    var r = scope.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) start();
  });

  /* ---------- Signals (Forwarding Copilot): flow steps light up in sequence, ticker steps one item at a time, both pause off-screen ---------- */
  document.querySelectorAll('[data-sig]').forEach(function (sig, si) {
    var steps = Array.prototype.slice.call(sig.querySelectorAll('[data-step]')).sort(function (a, b) { return +a.getAttribute('data-step') - +b.getAttribute('data-step'); });
    var list = sig.querySelector('.sig__items'); var items = list ? Array.prototype.slice.call(list.children) : [];
    if (reduce) { steps.forEach(function (s) { s.classList.add('is-on'); }); items.forEach(function (li, k) { li.classList.toggle('is-on', k === 3); }); return; }
    if (list && items.length) { items.forEach(function (li) { var cl = li.cloneNode(true); cl.setAttribute('aria-hidden', 'true'); list.appendChild(cl); }); }
    var all = list ? Array.prototype.slice.call(list.children) : [], n = items.length, pos = 0, PITCH = 58, ACTIVE = 3;
    var paint = function () { all.forEach(function (li, k) { var d = k - (pos + ACTIVE); li.classList.toggle('is-on', d === 0); li.classList.toggle('is-near', Math.abs(d) === 1); }); };
    var tick = function () { pos += 1; list.style.transform = 'translateY(' + (-pos * PITCH) + 'px)'; paint(); if (pos >= n) { setTimeout(function () { list.style.transition = 'none'; pos = 0; list.style.transform = 'translateY(0)'; paint(); void list.offsetHeight; list.style.transition = ''; }, 620); } };
    var step = -1, stepTimer = null, tickTimer = null;
    var advance = function () { step += 1; if (step >= steps.length + 2) { step = -1; steps.forEach(function (s) { s.classList.remove('is-on'); }); return; } steps.forEach(function (s, k) { s.classList.toggle('is-on', k <= step); }); };
    var start = function () { if (stepTimer) return; advance(); stepTimer = setInterval(advance, 850); if (list) { paint(); tickTimer = setInterval(tick, 1900 + si * 300); } };
    var stop = function () { clearInterval(stepTimer); clearInterval(tickTimer); stepTimer = tickTimer = null; };
    if (list) { list.style.transform = 'translateY(0)'; paint(); }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }, { rootMargin: '10% 0px' });
    io.observe(sig);
  });

  /* ---------- FAQ: one open at a time ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) faqItems.forEach(function (o) { if (o !== d && o.open) o.open = false; }); }); });

  /* ---------- Forms: hand off to the booking page with name and email prefilled ---------- */
  var BOOK = 'https://closedin.neetocal.com/discovery-call?utm_source=closedin.io&utm_medium=cta&utm_content=homepage-form';
  document.querySelectorAll('form[data-book]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (f.querySelector('input[name="name"]') || {}).value || '', email = (f.querySelector('input[name="email"]') || {}).value || '';
      var url = BOOK + (name ? '&name=' + encodeURIComponent(name) : '') + (email ? '&email=' + encodeURIComponent(email) : '');
      try { if (typeof window.gtag === 'function') window.gtag('event', 'request_call', { source: f.getAttribute('data-book') }); } catch (err) { /* ignore */ }
      window.open(url, '_blank', 'noopener');
    });
  });

  /* ---------- Wistia lightbox ---------- */
  var WISTIA_SRC = 'https://fast.wistia.com/player.js', activePlayer = null;
  function loadWistia() { if (document.querySelector('script[src="' + WISTIA_SRC + '"]')) return; var s = document.createElement('script'); s.src = WISTIA_SRC; s.async = true; document.head.appendChild(s); }
  function mountWistia(box, mediaId, aspect) { loadWistia(); if (activePlayer) unmountWistia(); var p = document.createElement('wistia-player'); p.setAttribute('media-id', mediaId); p.setAttribute('aspect', aspect || '1.7777777777777777'); p.setAttribute('autoplay', 'true'); box.appendChild(p); activePlayer = p; var played = false, tryPlay = function () { if (played) return; played = true; try { if (typeof p.play === 'function') p.play(); } catch (err) { /* autoplay attribute */ } }; p.addEventListener('api-ready', tryPlay); if (window.customElements && customElements.whenDefined) customElements.whenDefined('wistia-player').then(function () { setTimeout(tryPlay, 2000); }); }
  var HLS_SRC = '/assets/vendor/hls.js-1.7.3/hls.min.js', hlsInst = null;
  function loadHls(cb) { if (window.Hls) return cb(); var s = document.querySelector('script[src="' + HLS_SRC + '"]'); if (!s) { s = document.createElement('script'); s.src = HLS_SRC; s.async = true; document.head.appendChild(s); } s.addEventListener('load', cb, { once: true }); }
  function mountMux(box, playbackId) { if (activePlayer) unmountWistia(); var v = document.createElement('video'); v.className = 'lightbox__video'; v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto'; v.poster = 'https://image.mux.com/' + playbackId + '/thumbnail.webp?time=1'; var src = 'https://stream.mux.com/' + playbackId + '.m3u8'; box.appendChild(v); activePlayer = v; if (v.canPlayType('application/vnd.apple.mpegurl')) { v.src = src; v.play().catch(function () {}); } else { loadHls(function () { if (!window.Hls || !window.Hls.isSupported()) { v.src = src; return; } hlsInst = new window.Hls(); hlsInst.loadSource(src); hlsInst.attachMedia(v); hlsInst.on(window.Hls.Events.MANIFEST_PARSED, function () { v.play().catch(function () {}); }); }); } }
  function unmountWistia() { if (!activePlayer) return; try { if (typeof activePlayer.pause === 'function') activePlayer.pause(); } catch (err) { /* ignore */ } if (hlsInst) { try { hlsInst.destroy(); } catch (err) { /* ignore */ } hlsInst = null; } if (activePlayer.parentNode) activePlayer.parentNode.removeChild(activePlayer); activePlayer = null; }
  var dlg = document.getElementById('lightbox');
  if (dlg) {
    var dlgBox = dlg.querySelector('.lightbox__box'), dlgCap = dlg.querySelector('.lightbox__caption'), opener = null;
    var openLightbox = function (ids, aspect, caption) { var a = (aspect || '16/9').split('/'); dlgBox.style.aspectRatio = a[0] + ' / ' + (a[1] || '1'); if (dlgCap) dlgCap.textContent = caption || ''; if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); if (lenis) lenis.stop(); if (ids.mux) mountMux(dlgBox, ids.mux); else mountWistia(dlgBox, ids.wistia, (parseFloat(a[0]) / parseFloat(a[1] || '1')).toString()); };
    var closeLightbox = function () { unmountWistia(); if (dlg.open) dlg.close(); if (lenis) lenis.start(); if (opener && opener.focus) opener.focus(); };
    dlg.addEventListener('close', function () { unmountWistia(); if (lenis) lenis.start(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeLightbox(); });
    var closeBtn = dlg.querySelector('.lightbox__close'); if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    document.querySelectorAll('[data-open-video]').forEach(function (el) { el.addEventListener('click', function (e) { var ids = { wistia: el.getAttribute('data-wistia-id') || '', mux: el.getAttribute('data-mux-id') || '' }; if (!ids.wistia && !ids.mux) return; e.preventDefault(); opener = el; openLightbox(ids, el.getAttribute('data-aspect') || '16/9', el.getAttribute('data-caption') || ''); }); });
  }

  /* ---------- Border beams: pills get a travelling light with a staggered phase ---------- */
  document.querySelectorAll('.eyebrow, .tag, .chip, .learn-card .free, .story__soon').forEach(function (el, i) { el.classList.add('beam'); el.style.setProperty('--n', i % 7); });

  /* ---------- Stories without a hosted video yet: chip instead of a play button ---------- */
  document.querySelectorAll('.story__poster[data-open-video]').forEach(function (b) { if (!b.getAttribute('data-wistia-id') && !b.getAttribute('data-mux-id')) { b.classList.add('is-soon'); b.setAttribute('disabled', ''); b.removeAttribute('data-cursor'); } });

  /* ---------- Word reveal: headings split into words that rise out of the line ---------- */
  (function () {
    var els = document.querySelectorAll('[data-words]'); if (!els.length) return;
    if (!motion) { els.forEach(function (el) { el.classList.add('in-words'); }); return; }
    els.forEach(function (el) {
      var n = 0, frag = document.createDocumentFragment();
      var words = function (text, extra) { text.split(/(\s+)/).forEach(function (p) { if (!p) return; if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; } var w = document.createElement('span'); w.className = 'w'; var wi = document.createElement('span'); wi.className = 'wi' + (extra ? ' ' + extra : ''); wi.textContent = p; wi.style.setProperty('--i', n++); w.appendChild(wi); frag.appendChild(w); }); };
      Array.prototype.slice.call(el.childNodes).forEach(function (node) { if (node.nodeType === 3) words(node.textContent); else if (node.nodeType === 1 && !node.children.length && node.tagName !== 'BR') words(node.textContent, node.className); else frag.appendChild(node.cloneNode(true)); });
      el.textContent = ''; el.appendChild(frag);
      if (el.closest('.hero')) { setTimeout(function () { el.classList.add('in-words'); }, 150); }
      else { var wio = new IntersectionObserver(function (en) { if (en.some(function (e) { return e.isIntersecting; })) { wio.disconnect(); el.classList.add('in-words'); } }, { rootMargin: '0px 0px -12% 0px' }); wio.observe(el); }
    });
  })();

  /* ---------- Fine pointers only: cursor follower, magnetic buttons, spotlight, tilt ---------- */
  if (fine && !reduce) {
    html.classList.add('has-cursor');
    var mk = function (cls) { var d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<span></span>'; document.body.appendChild(d); return d; };
    var curDot = mk('cur cur--dot'), curRing = mk('cur cur--ring');
    var cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy, craf = null;
    var cloop = function () { rx += (cx - rx) * 0.16; ry += (cy - ry) * 0.16; curRing.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)'; craf = (Math.abs(cx - rx) > 0.15 || Math.abs(cy - ry) > 0.15) ? requestAnimationFrame(cloop) : null; };
    document.addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY; curDot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; if (!craf) craf = requestAnimationFrame(cloop);
      var t = e.target, c = t && t.closest ? t : null;
      var play = c && c.closest('[data-cursor="play"]:not([disabled])'), link = !play && c && c.closest('a, button, summary, input, label, [data-cursor]');
      html.classList.toggle('cur-play', !!play); html.classList.toggle('cur-link', !!link);
      html.classList.toggle('cur-dark', !!(c && c.closest('.theme-dark, .learn-card, .dark-card, .lightbox')));
      html.classList.remove('cur-out');
    }, { passive: true });
    window.addEventListener('mouseout', function (e) { if (!e.relatedTarget) html.classList.add('cur-out'); });

    /* magnetic: the element drifts toward the pointer while it is near */
    document.querySelectorAll('.btn-accent, .alink__box, .arrows button, .rcard__go').forEach(function (el) {
      var host = el.closest('a, button') || el, k = el.classList.contains('btn-accent') ? .22 : .35;
      host.addEventListener('pointermove', function (e) { var b = el.getBoundingClientRect(); var dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2); if (Math.hypot(dx, dy) > 160) return; el.style.transform = 'translate(' + (dx * k).toFixed(1) + 'px,' + (dy * k).toFixed(1) + 'px)'; }, { passive: true });
      host.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    /* spotlight: glow position as CSS variables */
    document.querySelectorAll('.spot').forEach(function (el) { el.addEventListener('pointermove', function (e) { var b = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - b.left).toFixed(0) + 'px'); el.style.setProperty('--my', (e.clientY - b.top).toFixed(0) + 'px'); }, { passive: true }); });

    /* tilt: cards lean toward the pointer */
    document.querySelectorAll('.tilt').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt') || '5');
      el.addEventListener('animationend', function () { el.style.animation = 'none'; });
      el.addEventListener('pointermove', function (e) { var b = el.getBoundingClientRect(); var px = (e.clientX - b.left) / b.width - .5, py = (e.clientY - b.top) / b.height - .5; el.style.transform = 'perspective(1000px) rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg)'; }, { passive: true });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 3D mark (hero object, scroll-bound to the hero), gated and lazy ---------- */
  var markBox = document.querySelector('[data-mark-3d]');
  function canDo3D() { if (!markBox || !motion) return false; if (/[?&]mark=poster/.test(location.search)) return false; if (navigator.connection && navigator.connection.saveData) return false; if ((navigator.deviceMemory || 4) < 2) return false; try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (err) { return false; } }
  if (canDo3D()) {
    var load3D = function () { import('/assets/js/mark-3d.js').then(function (m) { return m.init(markBox, { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger, lenis: lenis, isMobile: !desktop() || !fine, trigger: markBox.getAttribute('data-trigger') || '.engine', start: markBox.getAttribute('data-start') || 'top 80%', end: markBox.getAttribute('data-end') || 'bottom 20%' }); }).catch(function (err) { if (window.console) console.warn('3D mark unavailable, poster shown.', err); }); };
    var armed = false, arm = function () { if (armed) return; armed = true; if ('requestIdleCallback' in window) requestIdleCallback(load3D, { timeout: 1200 }); else setTimeout(load3D, 200); };
    var near = new IntersectionObserver(function (entries) { if (entries.some(function (en) { return en.isIntersecting; })) { near.disconnect(); arm(); } }, { rootMargin: '120% 0px' }); near.observe(markBox);
  }

  /* ---------- Footer star field ---------- */
  var sky = document.querySelector('canvas.sky');
  if (sky && !reduce) {
    var sctx = sky.getContext('2d'), stars = [];
    var ssize = function () { var r = sky.parentElement.getBoundingClientRect(); sky.width = r.width; sky.height = r.height; stars = []; for (var i = 0; i < 260; i++) stars.push({ x: Math.random() * sky.width, y: sky.height * 0.25 + Math.random() * sky.height * 0.75, r: Math.random() * 1.4 + 0.3, a: Math.random() * 0.7 + 0.2, ph: Math.random() * 6 }); };
    var sdraw = function (t) { sctx.clearRect(0, 0, sky.width, sky.height); for (var i = 0; i < stars.length; i++) { var s = stars[i]; var tw = 0.6 + 0.4 * Math.sin(t / 1100 + s.ph); sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, 6.283); sctx.fillStyle = 'rgba(255,255,255,' + (s.a * tw).toFixed(3) + ')'; sctx.fill(); } if (skyVisible) requestAnimationFrame(sdraw); };
    var skyVisible = false;
    new IntersectionObserver(function (en) { var v = en.some(function (e) { return e.isIntersecting; }); if (v && !skyVisible) { skyVisible = true; requestAnimationFrame(sdraw); } else if (!v) skyVisible = false; }).observe(sky);
    window.addEventListener('resize', ssize); ssize();
  }
})();
