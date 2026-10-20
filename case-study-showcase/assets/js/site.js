/* closed:in site.js v4: particle hero, nav states, letter and word reveals, ripple buttons, border beams, spotlight and tilt cards, carousels, counters, FAQ, Wistia lightbox, forms, 3D mark in the hero. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = hasGsap && !reduce;
  function desktop() { return window.innerWidth >= 1024; }
  if (!motion) html.classList.remove('js');

  /* ---------- Work that waits for the arrival transition: the veil animates on the main thread, so heavy starts (the WebGL mark) come after it, in idle time ---------- */
  var arrivalQ = [], arrived = false;
  function afterArrival(fn) { if (arrived) fn(); else arrivalQ.push(fn); }
  function markArrived() { if (arrived) return; arrived = true; arrivalQ.splice(0).forEach(function (fn) { try { fn(); } catch (err) { if (window.console) console.warn(err); } }); }
  function whenIdle(fn, timeout) { if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: timeout || 1000 }); else setTimeout(fn, 50); }
  setTimeout(markArrived, 4000);   /* safety net: a background tab never runs the veil's frames */

  /* ---------- The page transition lives in veil.js (loaded first); site.js only waits for its arrival signal ---------- */
  if (window.__veil && window.__veil.arrived) markArrived(); else document.addEventListener('veil:arrived', markArrived);


  /* Lenis */
  var lenis = null;
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({ lerp: 0.14, smoothWheel: true, syncTouch: false, autoRaf: false });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  window.__closedin = { lenis: lenis, ScrollTrigger: window.ScrollTrigger || null };

  /* In-page anchors (19-10): a section scrolls to its own top, so the section above stays out of view (Max: Services opened on the toolstack);
     cards keep room for the nav. Links to another page are handled by veil.js and the browser, with the same CSS margins. */
  if (lenis) document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest ? e.target.closest('a[href*="#"]') : null; if (!a || a.target || a.classList.contains('skip-link')) return;
    var url; try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.hash.length < 2) return;
    var t = document.getElementById(decodeURIComponent(url.hash.slice(1))); if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t);   /* Lenis honours scroll-padding-top (24px, sections) and scroll-margin-top (cards: 110px in all) from site.css, like the browser does across pages */
    if (history.replaceState) history.replaceState(null, '', url.hash);
  });

  /* ---------- Particle dots in the hero (mouse parallax) ---------- */
  var dotsCanvas = document.querySelector('canvas.dots');
  if (dotsCanvas && !reduce) {
    var ctx = dotsCanvas.getContext('2d'), dots = [], W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 1.5);
    var mx = 0, my = 0, tx = 0, ty = 0, visible = true, raf = null, last = 0;
    function size() { W = innerWidth; H = innerHeight; dotsCanvas.width = W * DPR; dotsCanvas.height = H * DPR; dotsCanvas.style.width = W + 'px'; dotsCanvas.style.height = H + 'px'; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); seed(); }
    function seed() { dots = []; var n = Math.round((W * H) / 12000); for (var i = 0; i < n; i++) { var z = Math.random(); dots.push({ x: Math.random() * W, y: Math.random() * H, z: z, r: 0.8 + z * 1.6, a: 0.18 + z * 0.4, vx: (Math.random() - .5) * 0.06, vy: (Math.random() - .5) * 0.06, ph: Math.random() * Math.PI * 2 }); } }
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

  /* ---------- Nav: scrolled pill group, black on the opening section, light glass after it ---------- */
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var logoEl = nav.querySelector('[data-logo]');
    var setScrolled = function () { var s = scrollY > 80; nav.classList.toggle('is-scrolled', s); if (logoEl) logoEl.classList.toggle('is-mark', s); };
    window.addEventListener('scroll', setScrolled, { passive: true }); setScrolled();
    /* Black on the dark opening section, light glass once it has scrolled past the bar (Max 19-10); later dark sections keep the light glass */
    var hero = document.querySelector('main [data-nav-theme="dark"]');
    if (hero && hero.getBoundingClientRect().top + window.scrollY > 120) hero = null;   /* it must open the page: the team page starts light (19-10), its CTA band further down keeps the light glass */
    var probe = function () { nav.classList.toggle('is-dark', !!hero && !nav.classList.contains('is-open') && hero.getBoundingClientRect().bottom > 40); };
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
    var openSheet = function () { if (!sheet) return; sheet.setAttribute('data-open', ''); sheet.removeAttribute('hidden'); nav.classList.add('is-open'); probe(); burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; if (lenis) lenis.stop(); };
    var closeSheet = function () { if (!sheet || !sheet.hasAttribute('data-open')) return; sheet.removeAttribute('data-open'); sheet.setAttribute('hidden', ''); nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; if (lenis) lenis.start(); probe(); };
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
  document.querySelectorAll('.wall__track').forEach(function (t) { var dup = document.createElement('span'); dup.className = 'wall__dup'; dup.setAttribute('aria-hidden', 'true'); dup.style.display = 'contents'; dup.innerHTML = t.innerHTML; dup.querySelectorAll('a, button').forEach(function (a) { a.setAttribute('tabindex', '-1'); }); dup.querySelectorAll('[itemscope], [itemprop]').forEach(function (n) { n.removeAttribute('itemscope'); n.removeAttribute('itemtype'); n.removeAttribute('itemprop'); }); dup.querySelectorAll('[id]').forEach(function (n) { n.removeAttribute('id'); }); t.appendChild(dup); });

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

  /* ---------- Watch video: preview card follows the cursor while it hovers the trigger (fine pointers only) ---------- */
  var peek = document.querySelector('.peek'), peekVideo = peek && peek.querySelector('video');
  if (peek && fine && motion) {
    /* The preview sits still above the trigger (no cursor following, Max 17-10) and plays muted while the pointer is on it, like workflows.io.
       Max 19-10: the pointer can move up onto the preview (a short grace period covers the gap) and a click on it plays the video, as the pill does. */
    var peekFrom = null, peekT = 0;
    var peekOff = function () { clearTimeout(peekT); peekT = 0; peek.classList.remove('is-on'); if (peekVideo) peekVideo.pause(); peekFrom = null; };
    var peekLater = function () { clearTimeout(peekT); peekT = setTimeout(peekOff, 320); };
    var peekStay = function () { clearTimeout(peekT); peekT = 0; };
    document.querySelectorAll('[data-peek]').forEach(function (tr) {
      tr.addEventListener('pointerenter', function () {
        peekStay(); if (peekFrom === tr && peek.classList.contains('is-on')) return;   /* back from the preview: it keeps playing */
        peekFrom = tr;
        var r = tr.getBoundingClientRect(); var x = Math.min(Math.max(r.left + r.width / 2, 170), innerWidth - 170);
        peek.style.left = x + 'px'; peek.style.top = (r.top - 14) + 'px'; peek.classList.add('is-on');
        if (peekVideo) { peekVideo.muted = true; try { peekVideo.currentTime = 0; } catch (err) { /* not loaded yet */ } var pr = peekVideo.play(); if (pr && pr.catch) pr.catch(function () {}); }
      });
      tr.addEventListener('pointerleave', peekLater); tr.addEventListener('click', peekOff);
    });
    peek.addEventListener('pointerenter', peekStay);
    peek.addEventListener('pointerleave', peekLater);
    peek.addEventListener('click', function () { var tr = peekFrom; peekOff(); if (tr) tr.click(); });
    window.addEventListener('scroll', function () { if (peek.classList.contains('is-on')) peekOff(); }, { passive: true });   /* fixed card: it would drift away from the pill */
  }

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

  /* ---------- GA4 events (20-10): which call to action and which video get the clicks, through the gtag that is already on the page
     (no new trackers). book_call_click carries where the button sits (nav, hero, content, cta_band, footer) and its utm_content. ---------- */
  document.addEventListener('click', function (e) {
    if (typeof window.gtag !== 'function' || !e.target.closest) return;
    try {
      var a = e.target.closest('a[href*="meeting.closedin.io"], a[href*="neetocal.com"]');
      if (a) {
        var where = a.closest('.nav') ? 'nav' : a.closest('.footer') ? 'footer' : a.closest('.cta-dark') ? 'cta_band' : a.closest('.toc') ? 'toc' : a.closest('.hero, .phero') ? 'hero' : 'content';
        var m = /[?&]utm_content=([^&#]+)/.exec(a.href);
        window.gtag('event', 'book_call_click', { cta_location: where, utm_content: m ? decodeURIComponent(m[1]) : '', link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) });
        return;
      }
      var v = e.target.closest('[data-open-video]');
      if (v) window.gtag('event', 'video_open', { video_title: v.getAttribute('data-caption') || '', video_provider: v.hasAttribute('data-tella-id') ? 'tella' : 'wistia' });
    } catch (err) { /* analytics never breaks a click */ }
  }, true);

  /* ---------- Wistia lightbox ---------- */
  var WISTIA_SRC = 'https://fast.wistia.com/player.js', activePlayer = null;
  function loadWistia() { if (document.querySelector('script[src="' + WISTIA_SRC + '"]')) return; var s = document.createElement('script'); s.src = WISTIA_SRC; s.async = true; document.head.appendChild(s); }
  function mountWistia(box, mediaId, aspect, ready) { loadWistia(); if (activePlayer) unmountWistia(); var p = document.createElement('wistia-player'); p.setAttribute('media-id', mediaId); p.setAttribute('aspect', aspect || '1.7777777777777777'); p.setAttribute('autoplay', 'true'); box.appendChild(p); activePlayer = p; var played = false, tryPlay = function () { if (ready) ready(); if (played) return; played = true; try { if (typeof p.play === 'function') p.play(); } catch (err) { /* autoplay attribute */ } }; p.addEventListener('api-ready', tryPlay); if (window.customElements && customElements.whenDefined) customElements.whenDefined('wistia-player').then(function () { setTimeout(tryPlay, 2000); }); }
  var HLS_SRC = '/assets/vendor/hls.js-1.7.3/hls.min.js', hlsInst = null;
  function loadHls(cb) { if (window.Hls) return cb(); var s = document.querySelector('script[src="' + HLS_SRC + '"]'); if (!s) { s = document.createElement('script'); s.src = HLS_SRC; s.async = true; document.head.appendChild(s); } s.addEventListener('load', cb, { once: true }); }
  function mountMux(box, playbackId, ready) { if (activePlayer) unmountWistia(); var v = document.createElement('video'); v.className = 'lightbox__video'; v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto'; v.poster = 'https://image.mux.com/' + playbackId + '/thumbnail.webp?time=1'; var src = 'https://stream.mux.com/' + playbackId + '.m3u8'; box.appendChild(v); activePlayer = v; if (ready) v.addEventListener('loadeddata', ready, { once: true }); if (v.canPlayType('application/vnd.apple.mpegurl')) { v.src = src; v.play().catch(function () {}); } else { loadHls(function () { if (!window.Hls || !window.Hls.isSupported()) { v.src = src; return; } hlsInst = new window.Hls(); hlsInst.loadSource(src); hlsInst.attachMedia(v); hlsInst.on(window.Hls.Events.MANIFEST_PARSED, function () { v.play().catch(function () {}); }); }); } }
  var tellaSrc = function (id) { return 'https://www.tella.tv/video/' + id + '/embed?b=0&title=0&a=1&loop=0&t=0&muted=0&wt=0'; };
  /* The Tella player fades in over the poster once its page has loaded (Max 19-10: it felt slow; a black box for seconds) */
  function mountTella(box, id, ready) { if (activePlayer) unmountWistia(); var f = document.createElement('iframe'); f.className = 'lightbox__video'; f.src = tellaSrc(id); f.allow = 'autoplay; fullscreen; picture-in-picture'; f.setAttribute('allowfullscreen', ''); f.setAttribute('title', 'Client story video'); f.style.cssText = 'width:100%;height:100%;border:0;display:block;background:transparent;opacity:0;position:relative;z-index:3'; f.addEventListener('load', function () { f.style.opacity = '1'; if (ready) ready(); }, { once: true }); box.appendChild(f); activePlayer = f; }
  function unmountWistia() { if (!activePlayer) return; try { if (typeof activePlayer.pause === 'function') activePlayer.pause(); } catch (err) { /* ignore */ } if (hlsInst) { try { hlsInst.destroy(); } catch (err) { /* ignore */ } hlsInst = null; } if (activePlayer.parentNode) activePlayer.parentNode.removeChild(activePlayer); activePlayer = null; }
  /* Tella answers a page it served a moment ago in about 0.7 s and a cold one in 2 to 3 s (measured 19-10): open the connection when the stories come near,
     and ask for a video's player page as soon as the pointer is on its card, so it is warm by the time someone clicks play */
  var hint = function (rel, href) { if (document.querySelector('link[rel="' + rel + '"][href="' + href + '"]')) return; var l = document.createElement('link'); l.rel = rel; l.href = href; document.head.appendChild(l); };
  var tellaCards = document.querySelectorAll('[data-open-video][data-tella-id]');
  if (tellaCards.length) {
    var warmUp = function () { hint('preconnect', 'https://www.tella.tv'); hint('preconnect', 'https://prod-stream.tella.tv'); };
    if ('IntersectionObserver' in window) { var tio = new IntersectionObserver(function (en) { if (en.some(function (e) { return e.isIntersecting; })) { tio.disconnect(); warmUp(); } }, { rootMargin: '600px 0px' }); tellaCards.forEach(function (c) { tio.observe(c); }); } else warmUp();
    tellaCards.forEach(function (el) {
      var card = el.closest('.story') || el, id = el.getAttribute('data-tella-id'), warm = function () { if (id) { warmUp(); hint('prefetch', tellaSrc(id)); } };
      card.addEventListener('pointerenter', warm, { once: true }); card.addEventListener('focusin', warm, { once: true }); card.addEventListener('touchstart', warm, { once: true, passive: true });
    });
  }
  var dlg = document.getElementById('lightbox');
  if (dlg) {
    var dlgBox = dlg.querySelector('.lightbox__box'), dlgCap = dlg.querySelector('.lightbox__caption'), closeBtn = dlg.querySelector('.lightbox__close'), opener = null, closing = false, waitT = 0, fades = [];
    /* Max 19-10: the player grows out of the play button that was clicked and shrinks back into it on close */
    var originOf = function (el) { var o = el && (el.querySelector('.play') || el), r = o && o.getBoundingClientRect(); return r && r.width && r.bottom > 0 && r.top < innerHeight ? r : null; };
    var flip = function (back) {
      if (reduce || !dlgBox.animate) return null;
      var from = originOf(opener), to = dlgBox.getBoundingClientRect(); if (!from || !to.width) return null;
      var s = Math.max(from.width / to.width, .03), dx = (from.left + from.width / 2) - (to.left + to.width / 2), dy = (from.top + from.height / 2) - (to.top + to.height / 2);
      var small = { transform: 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')', borderRadius: (to.height / 2).toFixed(1) + 'px', opacity: .5 }, big = { transform: 'none', borderRadius: getComputedStyle(dlgBox).borderTopLeftRadius, opacity: 1 };
      return dlgBox.animate(back ? [big, small] : [small, big], back ? { duration: 360, easing: 'cubic-bezier(.5, 0, .75, .15)', fill: 'forwards' } : { duration: 560, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    };
    var clearFades = function () { fades.forEach(function (an) { an.cancel(); }); fades = []; };
    var fadeChrome = function (show) { clearFades(); if (reduce) return; [closeBtn, dlgCap].forEach(function (el) { if (el && el.animate) fades.push(el.animate([{ opacity: show ? 0 : 1 }, { opacity: show ? 1 : 0 }], { duration: show ? 300 : 160, delay: show ? 260 : 0, easing: 'ease', fill: show ? 'backwards' : 'forwards' })); }); };
    var ready = function () { clearTimeout(waitT); dlgBox.classList.remove('is-waiting'); };
    var openLightbox = function (ids, aspect, caption) {
      var a = (aspect || '16/9').split('/'); dlgBox.style.aspectRatio = a[0] + ' / ' + (a[1] || '1'); if (dlgCap) dlgCap.textContent = caption || '';
      var img = opener && opener.querySelector('img'), poster = (opener && opener.getAttribute('data-poster')) || (img && (img.currentSrc || img.src)) || '';
      dlgBox.style.backgroundImage = poster ? 'url("' + poster + '")' : ''; dlgBox.classList.add('is-waiting'); clearTimeout(waitT); waitT = setTimeout(ready, 8000);
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      if (lenis) lenis.stop();
      flip(false); fadeChrome(true);
      if (ids.tella) mountTella(dlgBox, ids.tella, ready); else if (ids.mux) mountMux(dlgBox, ids.mux, ready); else mountWistia(dlgBox, ids.wistia, (parseFloat(a[0]) / parseFloat(a[1] || '1')).toString(), ready);
    };
    var finishClose = function () { closing = false; clearTimeout(waitT); unmountWistia(); dlgBox.classList.remove('is-waiting'); dlgBox.style.backgroundImage = ''; if (dlg.open) dlg.close(); dlgBox.getAnimations().forEach(function (an) { an.cancel(); }); clearFades(); if (lenis) lenis.start(); if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (err) { /* old browsers */ } } };
    var closeLightbox = function () {
      if (closing || !dlg.open) return; closing = true;
      var an = flip(true); fadeChrome(false);
      if (an) { try { fades.push(dlg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, easing: 'ease', fill: 'forwards', pseudoElement: '::backdrop' })); } catch (err) { /* no pseudo-element animations */ } an.onfinish = finishClose; } else finishClose();
    };
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeLightbox(); });   /* Escape closes with the same shrink */
    dlg.addEventListener('close', function () { if (closing) return; clearTimeout(waitT); unmountWistia(); if (lenis) lenis.start(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeLightbox(); });
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    document.querySelectorAll('[data-open-video]').forEach(function (el) { el.addEventListener('click', function (e) { var ids = { wistia: el.getAttribute('data-wistia-id') || '', mux: el.getAttribute('data-mux-id') || '', tella: el.getAttribute('data-tella-id') || '' }; if (!ids.wistia && !ids.mux && !ids.tella) return; e.preventDefault(); opener = el; openLightbox(ids, el.getAttribute('data-aspect') || '16/9', el.getAttribute('data-caption') || ''); }); });
  }

  /* ---------- Border beams: pills get a travelling light with a staggered phase ---------- */
  document.querySelectorAll('.eyebrow, .tag, .chip, .learn-card .free, .story__soon, .hero__eyebrow').forEach(function (el, i) { if (el.matches('.chips--dark .chip:not(.chip--play)')) return; el.classList.add('beam'); el.style.setProperty('--n', 0); });   /* Max 19-10: no beam on the hero service pills, one on the award pill */   /* one phase for every beam: staggered lights read as noise (Max 18-10) */
  /* The beam spins on its own (CSS animation) and only pauses while the pill is off screen; observe after the classes exist */
  var beamEls = document.querySelectorAll('.beam');
  if (beamEls.length && 'IntersectionObserver' in window) { var bio = new IntersectionObserver(function (entries) { entries.forEach(function (en) { en.target.classList.toggle('beam--live', en.isIntersecting); }); }, { rootMargin: '10% 0px' }); beamEls.forEach(function (el) { bio.observe(el); }); } else { beamEls.forEach(function (el) { el.classList.add('beam--live'); }); }


  /* ---------- Stories without a hosted video yet: chip instead of a play button ---------- */
  document.querySelectorAll('.story__poster[data-open-video]').forEach(function (b) { if (!b.getAttribute('data-wistia-id') && !b.getAttribute('data-mux-id') && !b.getAttribute('data-tella-id')) { b.classList.add('is-soon'); b.setAttribute('disabled', ''); } });

  /* ---------- Copy buttons on the boolean search strings (Apollo and Sales Navigator resources, 20-10) ---------- */
  (function () {
    var els = document.querySelectorAll('.boolean-string'); if (!els.length || !navigator.clipboard) return;
    els.forEach(function (el) {
      var txt = el.textContent.trim(), card = el.closest('.boolean-card'), h = card && card.querySelector('h3');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'boolean-copy'; b.textContent = 'Copy';
      b.setAttribute('aria-label', 'Copy this search string' + (h ? ': ' + h.textContent.trim() : ''));
      var t0;
      b.addEventListener('click', function () {
        navigator.clipboard.writeText(txt).then(function () {
          b.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>Copied'; b.classList.add('is-done');
          clearTimeout(t0); t0 = setTimeout(function () { b.textContent = 'Copy'; b.classList.remove('is-done'); }, 1800);
          if (typeof window.gtag === 'function') window.gtag('event', 'copy_search_string', { item_name: h ? h.textContent.trim() : '', page_path: location.pathname });
        }, function () { b.textContent = 'Select and copy'; });
      });
      el.classList.add('has-copy'); el.appendChild(b);
    });
  })();

  /* ---------- Off-screen sections pause their CSS loops (20-10). The logo strips, play rings, live pings and footer bands kept running out of
     view; the pings animate a box-shadow, which costs a style and paint pass every frame. data-off pauses every animation inside (site.css). ---------- */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { e.target.toggleAttribute('data-off', !e.isIntersecting); }); }, { rootMargin: '150px 0px' });
    document.querySelectorAll('main > *, body > footer').forEach(function (s) { io.observe(s); });
  })();

  /* ---------- Blog posts: an On this page list beside the article (20-10), built from its section headings; the section you are in lights up ---------- */
  (function () {
    var art = document.querySelector('.docs--post .article'); if (!art) return;
    var hs = Array.prototype.slice.call(art.querySelectorAll(':scope > h2')); if (hs.length < 3) return;
    var slug = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); };
    var nav = document.createElement('nav'); nav.className = 'toc'; nav.setAttribute('aria-label', 'On this page');
    var inner = '<div class="toc__in"><p class="toc__hd">On this page</p><ol>';
    hs.forEach(function (h) { if (!h.id) h.id = slug(h.textContent); inner += '<li><a href="#' + h.id + '">' + h.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</a></li>'; });
    nav.innerHTML = inner + '</ol></div>'; art.appendChild(nav);
    /* under the list, the article's own closing call to action (its heading and button from the CTA band), tagged utm_content ...-toc */
    var band = document.querySelector('.cta-dark'), bh = band && band.querySelector('.cta-dark__title'), ba = band && band.querySelector('a.btn-accent[href*="meeting.closedin.io"]');
    if (bh && ba) {
      var box = document.createElement('div'); box.className = 'toc__cta';
      var q = document.createElement('p'); q.textContent = bh.textContent.trim(); box.appendChild(q);
      var a = ba.cloneNode(true); a.className = 'btn-accent btn-accent--sm'; a.setAttribute('href', ba.getAttribute('href').replace(/utm_content=([^&#]+)/, 'utm_content=$1-toc'));
      a.querySelectorAll('[data-letters]').forEach(function (x) { x.removeAttribute('data-letters'); });
      box.appendChild(a); nav.firstChild.appendChild(box);
    }
    var links = nav.querySelectorAll('a'), cur = -1, ticking = false;
    var update = function () {
      ticking = false; var line = innerHeight * .3, k = -1;
      for (var i = 0; i < hs.length; i++) { if (hs[i].getBoundingClientRect().top < line) k = i; else break; }
      if (k !== cur) { if (cur > -1) links[cur].classList.remove('is-on'); if (k > -1) links[k].classList.add('is-on'); cur = k; }
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  })();

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


  /* ---------- Glyph fields (Firecrawl-style): a slow field of monospace glyphs in the accent colour behind every section marked data-glyphs. The preset says where the shapes sit; a band breathes in waves, the side shapes drift.
     19-10: the canvas holds pixels only while its section is on screen (freed again off screen), is sized from the observer entries (no forced layouts),
     draws at ~10 fps on a timer instead of waking every frame, and batches the glyphs per alpha step. ---------- */
  (function () {
    if (reduce) return;
    var secs = document.querySelectorAll('[data-glyphs]'); if (!secs.length || !('IntersectionObserver' in window)) return;
    var ramp = ' .:-=+*#', hash = function (x, y) { var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
    var PRESETS = {
      top: [{ x: .5, y: .12, rx: .62, ry: .16, band: 1 }, { x: .06, y: .55, rx: .11, ry: .24 }, { x: .94, y: .55, rx: .11, ry: .24 }],
      bottom: [{ x: .5, y: .94, rx: .62, ry: .12, band: 1 }, { x: .04, y: .35, rx: .09, ry: .2 }, { x: .96, y: .35, rx: .09, ry: .2 }],
      corners: [{ x: .05, y: .9, rx: .2, ry: .16 }, { x: .95, y: .88, rx: .2, ry: .16 }],
      right: [{ x: .94, y: .2, rx: .16, ry: .2 }, { x: .04, y: .82, rx: .1, ry: .16 }],
      left: [{ x: .06, y: .22, rx: .16, ry: .2 }, { x: .96, y: .84, rx: .1, ry: .16 }],
      hero: [{ x: .86, y: .46, rx: .17, ry: .4 }, { x: .5, y: .97, rx: .8, ry: .1, band: 1 }, { x: .66, y: .14, rx: .09, ry: .16 }, { x: .5, y: .012, rx: .82, ry: .06, band: 1 }, { x: .025, y: .5, rx: .045, ry: .34 }],   /* dark page heroes: a field on the right, bands along the bottom and top edges, a column on the left (19-10, as the homepage hero) */
      sides: [{ x: .84, y: .045, rx: .2, ry: .05, w: .95 }, { x: .03, y: .1, rx: .055, ry: .09, w: .95 }, { x: .97, y: .3, rx: .055, ry: .09, w: .95 }, { x: .03, y: .52, rx: .055, ry: .09, w: .95 }, { x: .97, y: .74, rx: .055, ry: .09, w: .95 }, { x: .03, y: .94, rx: .055, ry: .07, w: .95 }],   /* tall light sections with cards (19-10, Max: more on the secondary pages): a field beside the section heading, then fields down both side margins where the cards leave room; a little stronger (w) than the homepage side fields */
      edges: [{ x: .02, y: .5, rx: .05, ry: .42 }, { x: .98, y: .5, rx: .05, ry: .42 }],   /* thin columns in the side margins, for bands where the middle is busy */
      band: [{ x: .5, y: .9, rx: .7, ry: .14, band: 1 }],   /* one breathing band low in the section */
      heroband: [{ x: .5, y: .985, rx: .82, ry: .075, band: 1 }, { x: .97, y: .55, rx: .05, ry: .3 }, { x: .5, y: .012, rx: .82, ry: .05, band: 1 }, { x: .025, y: .45, rx: .045, ry: .34 }]   /* homepage hero: bands hugging the bottom and top edges, thin columns on the far right and left (Max 19-10: more on top and left) */
    };
    var STEPS = 14, STY = [];
    for (var q = 0; q < STEPS; q++) STY.push('rgba(114, 193, 255, ' + (.2 + .65 * q / (STEPS - 1)).toFixed(3) + ')');
    var dpr = Math.min(window.devicePixelRatio || 1, 2), cell = 11, line = 15;
    secs.forEach(function (sec, si) {
      var shapes = PRESETS[sec.getAttribute('data-glyphs')] || PRESETS.top;
      /* the element goes in right away (same DOM as before, so no selector or layout changes later); its pixels come with the first visit */
      var cv = document.createElement('canvas'), ctx = null, cw = 0, ch = 0, cols = 0, rows = 0, live = false, timer = 0, t0 = performance.now() - si * 7300;
      cv.className = 'glyphs'; cv.setAttribute('aria-hidden', 'true'); cv.width = 0; cv.height = 0; sec.insertBefore(cv, sec.firstChild);
      var buckets = []; for (var q = 0; q < STEPS; q++) buckets.push([]);
      var size = function (w, h) {
        w = Math.round(w); h = Math.round(h); if (!w || !h || (w === cw && h === ch)) return;
        if (!ctx) ctx = cv.getContext('2d');
        cw = w; ch = h; cv.width = cw * dpr; cv.height = ch * dpr; cv.style.width = cw + 'px'; cv.style.height = ch + 'px'; cols = Math.ceil(cw / cell); rows = Math.ceil(ch / line);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = '12px ui-monospace, "SF Mono", Menlo, monospace'; ctx.textBaseline = 'top';
      };
      var release = function () { cv.width = 0; cv.height = 0; cw = ch = 0; };   /* frees the pixels; the element stays */
      var hasBand = shapes.some(function (sh) { return sh.band; }), drawable = function (w) { return w > 700 || hasBand; };   /* phones draw only the bands: a corner-only field stays empty there, so it gets no pixels */
      var draw = function () {
        timer = 0; if (!live || !ctx || !cw) return;
        var tt = (performance.now() - t0) / 1000, wide = cw > 700, step = Math.floor(tt * .5), q, k;
        for (q = 0; q < STEPS; q++) buckets[q].length = 0;
        for (var yi = 0; yi < rows; yi++) for (var xi = 0; xi < cols; xi++) {
          var px = (xi + .5) / cols, py = (yi + .5) / rows, v = 0;
          for (k = 0; k < shapes.length; k++) {
            var sh = shapes[k]; if (!wide && !sh.band) continue;
            var dx = (px - sh.x) / sh.rx, dy = (py - sh.y) / sh.ry, d2 = dx * dx + dy * dy; if (d2 > 4) continue;
            var wave = sh.band ? .5 + .5 * Math.sin(px * 9 + tt * .2) * Math.sin(px * 3.7 - tt * .11 + 1.3) : .5 + .5 * Math.sin(tt * .3 + py * 9 + px * 20 + k);
            v += Math.exp(-d2) * wave * (sh.w || (sh.band ? 1 : .7));
          }
          if (v <= .1) continue;
          v = v * (.8 + .2 * hash(xi + step, yi)) - .22; if (v <= .05) continue;
          var g = ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))]; if (g === ' ') continue;
          q = Math.round((Math.min(.85, .2 + v * .6) - .2) / .65 * (STEPS - 1)); buckets[q].push(g, xi * cell, yi * line);
        }
        ctx.clearRect(0, 0, cw, ch);
        for (q = 0; q < STEPS; q++) { var bk = buckets[q]; if (!bk.length) continue; ctx.fillStyle = STY[q]; for (var j = 0; j < bk.length; j += 3) ctx.fillText(bk[j], bk[j + 1], bk[j + 2]); }
        timer = setTimeout(function () { requestAnimationFrame(draw); }, 100);
      };
      new IntersectionObserver(function (en) {
        var e = en[en.length - 1];
        if (e.isIntersecting && drawable(e.boundingClientRect.width)) { size(e.boundingClientRect.width, e.boundingClientRect.height); if (!live) { live = true; if (!timer) requestAnimationFrame(draw); } }
        else if (live) { live = false; if (timer) { clearTimeout(timer); timer = 0; } release(); }
      }, { rootMargin: '10% 0px' }).observe(sec);
      if ('ResizeObserver' in window) new ResizeObserver(function (en) { if (!live) return; var b = en[0].borderBoxSize && en[0].borderBoxSize[0], w, h; if (b) { w = b.inlineSize; h = b.blockSize; } else { var r = sec.getBoundingClientRect(); w = r.width; h = r.height; } if (!drawable(w)) { live = false; if (timer) { clearTimeout(timer); timer = 0; } release(); return; } size(w, h); }).observe(sec);
    });
  })();

  /* ---------- Directional fill: the accent enters the arrow boxes from the side where the pointer comes in and leaves on the side where it goes out (workflows.io; Max 17-10: boxes stay static) ---------- */
  document.querySelectorAll('.alink__box, .arrows button').forEach(function (box) {
    var host = box.closest('.alink, .hero__trust, .rcard') || box;
    var side = function (e) { var r = box.getBoundingClientRect(); box.style.setProperty('--ox', e.clientX < r.left + r.width / 2 ? '0%' : '100%'); };
    host.addEventListener('pointerenter', side); host.addEventListener('pointerleave', side);
  });

  /* ---------- Fine pointers only: spotlight, tilt (no custom cursor and no magnetic drift: the native pointer is enough, Max 17-10) ---------- */
  if (fine && !reduce) {
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

  /* ---------- Dark hero mark (Front Page artifact): loads right away, the SVG mark stays until the first frame ---------- */
  var darkBox = document.querySelector('[data-mark-dark]');
  if (darkBox && motion && !(navigator.connection && navigator.connection.saveData) && (navigator.deviceMemory || 4) >= 2 && !/[?&]mark=poster/.test(location.search) && ('WebGLRenderingContext' in window)) {
    /* 19-10: the WebGL support test used to create a throwaway context (a long task during the arrival animation); three.js now throws on its own when WebGL is missing and the SVG mark stays.
       The modules download and compile right away (modulepreload), the scene starts once the veil is gone, in idle time; the canvas fades in over the SVG mark. */
    ['/assets/vendor/three-0.186.1/three.core.min.js', '/assets/vendor/three-0.186.1/three.module.min.js', '/assets/js/mark-dark.js'].forEach(function (href) { var l = document.createElement('link'); l.rel = 'modulepreload'; l.href = href; l.fetchPriority = 'low'; document.head.appendChild(l); });   /* low: the font and the images above the fold go first */
    afterArrival(function () { whenIdle(function () { import('/assets/js/mark-dark.js').then(function (m) { return m.init(darkBox, { isMobile: !desktop() || !fine }); }).catch(function (err) { if (window.console) console.warn('mark-dark', err); }); }, 700); });
  }

  /* ---------- Services console: hover or focus picks a service, auto-advances while in view ---------- */
  document.querySelectorAll('[data-svc]').forEach(function (root) {
    var items = Array.prototype.slice.call(root.querySelectorAll('.svc__item')), rows = Array.prototype.slice.call(root.querySelectorAll('.svc__row')), screens = Array.prototype.slice.call(root.querySelectorAll('.svc__screen'));
    var cur = 0, timer = null, hover = false, inView = false;
    function go(i) { cur = i; items.forEach(function (it, k) { var on = k === i; it.classList.toggle('is-on', on); var r = it.querySelector('.svc__row'); if (r) r.setAttribute('aria-expanded', on ? 'true' : 'false'); }); screens.forEach(function (sc, k) { sc.classList.toggle('is-on', k === i); }); }
    function restart() { if (timer) clearInterval(timer); timer = setInterval(function () { if (inView && !hover && !reduce && !document.hidden) go((cur + 1) % items.length); }, 6000); }
    rows.forEach(function (r, i) { r.addEventListener('click', function () { go(i); restart(); }); r.addEventListener('mouseenter', function () { if (fine) go(i); }); r.addEventListener('focus', function () { go(i); }); });
    root.addEventListener('mouseenter', function () { hover = true; }); root.addEventListener('mouseleave', function () { hover = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: .25 }).observe(root); else inView = true;
    restart();
  });

  /* ---------- 3D mark (hero object, scroll-bound to the hero), gated and lazy ---------- */
  var markBox = document.querySelector('[data-mark-3d]');
  document.addEventListener('markdrag', function (e) { var st = e.target && e.target.closest ? e.target.closest('.stage') : null; if (st) st.classList.add('is-dragged'); });
  function canDo3D() { if (!markBox || !motion) return false; if (/[?&]mark=poster/.test(location.search)) return false; if (navigator.connection && navigator.connection.saveData) return false; if ((navigator.deviceMemory || 4) < 2) return false; return 'WebGLRenderingContext' in window; }
  if (canDo3D()) {
    var load3D = function () { import('/assets/js/mark-3d.js').then(function (m) { return m.init(markBox, { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger, lenis: lenis, isMobile: !desktop() || !fine, trigger: markBox.getAttribute('data-trigger') || '.engine', start: markBox.getAttribute('data-start') || 'top 80%', end: markBox.getAttribute('data-end') || 'bottom 20%', drag: markBox.hasAttribute('data-drag') }); }).catch(function (err) { if (window.console) console.warn('3D mark unavailable, poster shown.', err); }); };
    var armed = false, arm = function () { if (armed) return; armed = true; var go = function () { if ('requestIdleCallback' in window) requestIdleCallback(load3D, { timeout: 3000 }); else setTimeout(load3D, 400); }; if (document.readyState === 'complete') setTimeout(go, 1200); else window.addEventListener('load', function () { setTimeout(go, 1200); }, { once: true }); };
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
