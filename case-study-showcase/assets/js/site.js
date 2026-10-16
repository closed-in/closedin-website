/* closed:in site.js v2: Lenis + GSAP motion, pill nav, carousels, marquee, Wistia lightbox, gated 3D mark in the hero. */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = hasGsap && !reduce;
  function desktop() { return window.innerWidth >= 1024; }
  if (!motion) html.classList.remove('js');

  /* Smooth scroll */
  var lenis = null;
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false, anchors: { offset: -96 }, prevent: function (n) { return !!(n && n.closest && n.closest('[data-lenis-prevent]')); } });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  window.__closedin = { lenis: lenis, ScrollTrigger: window.ScrollTrigger || null };

  /* Nav */
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var setScrolled = function () { nav.classList.toggle('is-scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', setScrolled, { passive: true }); setScrolled();
    var dropdowns = nav.querySelectorAll('[data-dropdown]');
    var closeDropdowns = function (except) { dropdowns.forEach(function (dd) { if (dd === except) return; dd.classList.remove('is-open'); var b = dd.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false'); }); };
    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector('button'); if (!btn) return;
      btn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var open = dd.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); closeDropdowns(dd); });
      if (fine) {
        var t; dd.addEventListener('pointerenter', function () { clearTimeout(t); dd.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); });
        dd.addEventListener('pointerleave', function () { t = setTimeout(function () { dd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }, 140); });
      }
    });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeDropdowns(); });
    var burger = nav.querySelector('[data-burger]');
    var sheet = document.getElementById('mobile-menu');
    var openSheet = function () { if (!sheet) return; sheet.setAttribute('data-open', ''); sheet.removeAttribute('hidden'); nav.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; if (lenis) lenis.stop(); };
    var closeSheet = function () { if (!sheet || !sheet.hasAttribute('data-open')) return; sheet.removeAttribute('data-open'); sheet.setAttribute('hidden', ''); nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; if (lenis) lenis.start(); };
    if (burger && sheet) {
      burger.addEventListener('click', function () { sheet.hasAttribute('data-open') ? closeSheet() : openSheet(); });
      sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeSheet); });
      window.addEventListener('resize', function () { if (desktop()) closeSheet(); });
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDropdowns(); closeSheet(); } });
  }

  /* Marquees: duplicate once for a seamless loop */
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    var clone = track.cloneNode(true); clone.setAttribute('aria-hidden', 'true');
    track.parentNode.appendChild(clone);
    track.parentNode.style.display = 'flex';
    var speed = parseFloat(track.getAttribute('data-speed') || '46');
    [track, clone].forEach(function (t) { t.style.animationDuration = speed + 's'; });
  });

  /* Carousels: native scroll-snap with arrow buttons */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.carousel__track'); if (!track) return;
    var sec = car.closest('.sec') || document;
    var prev = sec.querySelector('[data-prev]'), next = sec.querySelector('[data-next]');
    var step = function () { var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 18 : 400; };
    var check = function () { var max = track.scrollWidth - track.clientWidth; if (prev) prev.disabled = track.scrollLeft <= 4; if (next) next.disabled = track.scrollLeft >= max - 4; };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', check, { passive: true }); window.addEventListener('resize', check); check();
  });

  /* Reveals, counters, magnetic, parallax, process line */
  if (motion) {
    var reveals = gsap.utils.toArray('[data-reveal]');
    if (reveals.length) {
      gsap.set(reveals, { autoAlpha: 0, y: desktop() ? 26 : 16 });
      var pending = [], flushTimer = null;
      var flush = function () { var b = pending; pending = []; flushTimer = null; gsap.to(b, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.07, overwrite: true }); };
      var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); pending.push(en.target); } }); if (pending.length && !flushTimer) flushTimer = setTimeout(flush, 40); }, { rootMargin: '0px 0px -10% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
    var h1 = document.querySelector('[data-split]');
    if (h1 && window.SplitText && desktop() && fine) {
      var runSplit = function () { SplitText.create(h1, { type: 'lines', mask: 'lines', autoSplit: true, aria: 'auto', onSplit: function (self) { return gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'power4.out', delay: 0.05 }); } }); };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(runSplit); else runSplit();
    }
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count')); if (isNaN(end)) return;
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10), prefix = el.getAttribute('data-prefix') || '', suffix = el.getAttribute('data-suffix') || '', finalText = el.textContent;
      var fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }), obj = { v: 0 };
      var cio = new IntersectionObserver(function (entries) { if (!entries.some(function (en) { return en.isIntersecting; })) return; cio.disconnect(); gsap.to(obj, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: function () { el.textContent = prefix + fmt.format(obj.v) + suffix; }, onComplete: function () { el.textContent = finalText; } }); }, { rootMargin: '0px 0px -10% 0px' });
      cio.observe(el);
    });
    var mm = gsap.matchMedia();
    mm.add({ isDesktop: '(min-width: 1024px)', isFine: '(hover: hover) and (pointer: fine)' }, function (ctx) {
      var c = ctx.conditions;
      if (c.isDesktop) {
        gsap.utils.toArray('[data-parallax]').forEach(function (el, i) { var amt = parseFloat(el.getAttribute('data-parallax')) || (i % 2 ? 6 : -6); gsap.to(el, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }); });
        var feature = document.querySelector('.hero__feature');
        if (feature) gsap.to(feature, { y: 44 - 28, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'bottom 90%', end: 'bottom 20%', scrub: 0.6 } });
      }
      if (c.isDesktop && c.isFine) {
        gsap.utils.toArray('[data-magnetic]').forEach(function (btn) {
          var strength = parseFloat(btn.getAttribute('data-magnetic')) || 24;
          var xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3.out' }), yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3.out' });
          btn.addEventListener('pointermove', function (e) { var r = btn.getBoundingClientRect(); xTo(((e.clientX - r.left) / r.width - 0.5) * strength); yTo(((e.clientY - r.top) / r.height - 0.5) * strength * 0.7); });
          btn.addEventListener('pointerleave', function () { gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' }); });
        });
      }
    });
    var proc = document.querySelector('[data-process]');
    if (proc) {
      var fill = proc.querySelector('.process__line-fill'), steps = proc.querySelectorAll('.process__step');
      ScrollTrigger.create({ trigger: proc, start: 'top 60%', end: 'bottom 60%', onUpdate: function (st) { if (fill) fill.style.transform = 'scaleY(' + st.progress.toFixed(4) + ')'; var idx = Math.min(steps.length - 1, Math.floor(st.progress * steps.length)); steps.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); }); }, onLeave: function () { steps.forEach(function (s, k) { s.classList.toggle('is-active', k === steps.length - 1); }); } });
    }
  } else {
    document.querySelectorAll('.process__step').forEach(function (s) { s.classList.add('is-active'); });
  }

  /* Wistia: poster first, player in a lightbox on click */
  var WISTIA_SRC = 'https://fast.wistia.com/player.js', activePlayer = null;
  function loadWistia() { if (document.querySelector('script[src="' + WISTIA_SRC + '"]')) return; var s = document.createElement('script'); s.src = WISTIA_SRC; s.async = true; document.head.appendChild(s); }
  function mountWistia(box, mediaId, aspect) {
    loadWistia(); if (activePlayer) unmountWistia();
    var p = document.createElement('wistia-player'); p.setAttribute('media-id', mediaId); p.setAttribute('aspect', aspect || '1.7777777777777777'); p.setAttribute('autoplay', 'true');
    box.appendChild(p); box.classList.add('is-playing'); activePlayer = p;
    var played = false, tryPlay = function () { if (played) return; played = true; try { if (typeof p.play === 'function') p.play(); } catch (err) { /* autoplay attribute */ } };
    p.addEventListener('api-ready', tryPlay);
    if (window.customElements && customElements.whenDefined) customElements.whenDefined('wistia-player').then(function () { setTimeout(tryPlay, 2000); });
  }
  function unmountWistia() { if (!activePlayer) return; var box = activePlayer.parentNode; try { if (typeof activePlayer.pause === 'function') activePlayer.pause(); } catch (err) { /* ignore */ } if (box) { box.removeChild(activePlayer); box.classList.remove('is-playing'); } activePlayer = null; }
  var dlg = document.getElementById('lightbox');
  if (dlg) {
    var dlgBox = dlg.querySelector('.lightbox__box'), dlgCap = dlg.querySelector('.lightbox__caption'), opener = null;
    var openLightbox = function (mediaId, aspect, caption) {
      var a = (aspect || '16/9').split('/'); var ratio = parseFloat(a[0]) / parseFloat(a[1] || '1');
      dlgBox.style.aspectRatio = a[0] + ' / ' + (a[1] || '1'); if (dlgCap) dlgCap.textContent = caption || '';
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      if (lenis) lenis.stop(); mountWistia(dlgBox, mediaId, ratio.toString());
    };
    var closeLightbox = function () { unmountWistia(); if (dlg.open) dlg.close(); if (lenis) lenis.start(); if (opener && opener.focus) opener.focus(); };
    dlg.addEventListener('close', function () { unmountWistia(); if (lenis) lenis.start(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeLightbox(); });
    var closeBtn = dlg.querySelector('.lightbox__close'); if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    document.querySelectorAll('[data-open-video]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        var id = el.getAttribute('data-wistia-id'); if (!id) return;
        e.preventDefault(); opener = el;
        openLightbox(id, el.getAttribute('data-aspect') || '16/9', el.getAttribute('data-caption') || '');
      });
    });
  }

  /* 3D mark: gated, lazy, poster fallback */
  var markBox = document.querySelector('[data-mark-3d]');
  function canDo3D() {
    if (!markBox || !motion) return false;
    if (/[?&]mark=poster/.test(location.search)) return false;
    if (navigator.connection && navigator.connection.saveData) return false;
    if ((navigator.deviceMemory || 4) < 2) return false;
    try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (err) { return false; }
  }
  if (canDo3D()) {
    var load3D = function () {
      import('/assets/js/mark-3d.js')
        .then(function (m) { return m.init(markBox, { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger, lenis: lenis, isMobile: !desktop() || !fine, trigger: markBox.getAttribute('data-trigger') || '.hero', start: markBox.getAttribute('data-start') || 'top top', end: markBox.getAttribute('data-end') || '+=160%' }); })
        .catch(function (err) { if (window.console) console.warn('3D mark unavailable, poster shown.', err); });
    };
    var armed = false, arm = function () { if (armed) return; armed = true; if ('requestIdleCallback' in window) requestIdleCallback(load3D, { timeout: 1200 }); else setTimeout(load3D, 200); };
    if ('IntersectionObserver' in window) { var near = new IntersectionObserver(function (entries) { if (entries.some(function (en) { return en.isIntersecting; })) { near.disconnect(); arm(); } }, { rootMargin: '150% 0px' }); near.observe(markBox); } else window.addEventListener('load', arm);
  }
})();
