/* closed:in site.js v3: particle hero, nav states, letter hover, ripple buttons, reveals, counters, carousel, FAQ, Wistia lightbox, forms, 3D mark. */
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
    var setScrolled = function () { nav.classList.toggle('is-scrolled', scrollY > 80); };
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

  /* ---------- Case carousel: center detection + arrows ---------- */
  var ctrack = document.querySelector('.cases__track');
  if (ctrack) {
    var cards = Array.prototype.slice.call(ctrack.children);
    var prev = document.querySelector('[data-cases-prev]'), next = document.querySelector('[data-cases-next]');
    var centerIdx = function () { var c = ctrack.scrollLeft + ctrack.clientWidth / 2, best = 0, bd = 1e9; cards.forEach(function (card, i) { var m = card.offsetLeft + card.offsetWidth / 2; var d = Math.abs(m - c); if (d < bd) { bd = d; best = i; } }); return best; };
    var mark = function () { var i = centerIdx(); cards.forEach(function (c, k) { c.classList.toggle('is-center', k === i); }); if (prev) prev.disabled = i === 0; if (next) next.disabled = i === cards.length - 1; };
    var go = function (i) { i = Math.max(0, Math.min(cards.length - 1, i)); var card = cards[i]; ctrack.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - ctrack.clientWidth / 2, behavior: 'smooth' }); };
    if (prev) prev.addEventListener('click', function () { go(centerIdx() - 1); });
    if (next) next.addEventListener('click', function () { go(centerIdx() + 1); });
    ctrack.addEventListener('scroll', mark, { passive: true }); window.addEventListener('resize', mark);
    var start = parseInt(ctrack.getAttribute('data-start') || '1', 10);
    requestAnimationFrame(function () { var card = cards[start]; if (card) ctrack.scrollLeft = card.offsetLeft + card.offsetWidth / 2 - ctrack.clientWidth / 2; mark(); });
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

  /* ---------- Wistia lightbox ---------- */
  var WISTIA_SRC = 'https://fast.wistia.com/player.js', activePlayer = null;
  function loadWistia() { if (document.querySelector('script[src="' + WISTIA_SRC + '"]')) return; var s = document.createElement('script'); s.src = WISTIA_SRC; s.async = true; document.head.appendChild(s); }
  function mountWistia(box, mediaId, aspect) { loadWistia(); if (activePlayer) unmountWistia(); var p = document.createElement('wistia-player'); p.setAttribute('media-id', mediaId); p.setAttribute('aspect', aspect || '1.7777777777777777'); p.setAttribute('autoplay', 'true'); box.appendChild(p); activePlayer = p; var played = false, tryPlay = function () { if (played) return; played = true; try { if (typeof p.play === 'function') p.play(); } catch (err) { /* autoplay attribute */ } }; p.addEventListener('api-ready', tryPlay); if (window.customElements && customElements.whenDefined) customElements.whenDefined('wistia-player').then(function () { setTimeout(tryPlay, 2000); }); }
  function unmountWistia() { if (!activePlayer) return; try { if (typeof activePlayer.pause === 'function') activePlayer.pause(); } catch (err) { /* ignore */ } if (activePlayer.parentNode) activePlayer.parentNode.removeChild(activePlayer); activePlayer = null; }
  var dlg = document.getElementById('lightbox');
  if (dlg) {
    var dlgBox = dlg.querySelector('.lightbox__box'), dlgCap = dlg.querySelector('.lightbox__caption'), opener = null;
    var openLightbox = function (mediaId, aspect, caption) { var a = (aspect || '16/9').split('/'); dlgBox.style.aspectRatio = a[0] + ' / ' + (a[1] || '1'); if (dlgCap) dlgCap.textContent = caption || ''; if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', ''); if (lenis) lenis.stop(); mountWistia(dlgBox, mediaId, (parseFloat(a[0]) / parseFloat(a[1] || '1')).toString()); };
    var closeLightbox = function () { unmountWistia(); if (dlg.open) dlg.close(); if (lenis) lenis.start(); if (opener && opener.focus) opener.focus(); };
    dlg.addEventListener('close', function () { unmountWistia(); if (lenis) lenis.start(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeLightbox(); });
    var closeBtn = dlg.querySelector('.lightbox__close'); if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    document.querySelectorAll('[data-open-video]').forEach(function (el) { el.addEventListener('click', function (e) { var id = el.getAttribute('data-wistia-id'); if (!id) return; e.preventDefault(); opener = el; openLightbox(id, el.getAttribute('data-aspect') || '16/9', el.getAttribute('data-caption') || ''); }); });
  }

  /* ---------- 3D mark (in the engine flow), gated and lazy ---------- */
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
