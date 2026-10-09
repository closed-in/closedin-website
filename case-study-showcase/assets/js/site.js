/* closed:in site.js: motion system (Lenis + GSAP), nav, rail, Wistia facades, 3D mark loader.
   Loaded with defer after gsap, ScrollTrigger, SplitText and lenis. Degrades to a static page without them. */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motion = hasGsap && !reduce;
  function desktop() { return window.innerWidth >= 1024; }

  if (!motion) { html.classList.remove('js'); }

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
        anchors: { offset: -64 },
        prevent: function (node) { return !!(node && node.closest && node.closest('[data-lenis-prevent]')); }
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
  window.__closedin = { lenis: lenis, ScrollTrigger: window.ScrollTrigger || null };

  /* ---------- Nav ---------- */
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var setScrolled = function () { nav.classList.toggle('is-scrolled', window.scrollY > 24); };
    window.addEventListener('scroll', setScrolled, { passive: true });
    setScrolled();

    var dropdowns = nav.querySelectorAll('[data-dropdown]');
    function closeDropdowns(except) {
      dropdowns.forEach(function (dd) {
        if (dd === except) return;
        dd.classList.remove('is-open');
        var b = dd.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
    dropdowns.forEach(function (dd) {
      var btn = dd.querySelector('button');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var open = dd.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        closeDropdowns(dd);
      });
      if (fine) {
        var leaveTimer;
        dd.addEventListener('pointerenter', function () { clearTimeout(leaveTimer); dd.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); });
        dd.addEventListener('pointerleave', function () { leaveTimer = setTimeout(function () { dd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }, 120); });
      }
    });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeDropdowns(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDropdowns(); closeSheet(); } });

    var burger = nav.querySelector('[data-burger]');
    var sheet = document.getElementById('mobile-menu');
    function openSheet() {
      if (!sheet) return;
      sheet.setAttribute('data-open', ''); sheet.removeAttribute('hidden');
      nav.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; if (lenis) lenis.stop();
    }
    function closeSheet() {
      if (!sheet || !sheet.hasAttribute('data-open')) return;
      sheet.removeAttribute('data-open'); sheet.setAttribute('hidden', '');
      nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = ''; if (lenis) lenis.start();
    }
    if (burger && sheet) {
      burger.addEventListener('click', function () { sheet.hasAttribute('data-open') ? closeSheet() : openSheet(); });
      sheet.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeSheet); });
      window.addEventListener('resize', function () { if (desktop()) closeSheet(); });
    }
  }

  /* ---------- Reveals ---------- */
  if (motion) {
    var reveals = gsap.utils.toArray('[data-reveal]');
    if (reveals.length) {
      gsap.set(reveals, { autoAlpha: 0, y: desktop() ? 24 : 16 });
      var pending = [], flushTimer = null;
      var flush = function () { var b = pending; pending = []; flushTimer = null; gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06, overwrite: true }); };
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); pending.push(en.target); } });
        if (pending.length && !flushTimer) flushTimer = setTimeout(flush, 40);
      }, { rootMargin: '0px 0px -12% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }

    /* Hero headline: line mask reveal, hero only */
    var h1 = document.querySelector('[data-split]');
    if (h1 && window.SplitText && desktop() && fine) {
      var runSplit = function () {
        SplitText.create(h1, {
          type: 'lines', mask: 'lines', autoSplit: true, aria: 'auto',
          onSplit: function (self) { return gsap.from(self.lines, { yPercent: 110, duration: 1, stagger: 0.08, ease: 'power4.out', delay: 0.1 }); }
        });
      };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(runSplit); else runSplit();
    }

    /* Count-up numbers: the final text stays in the HTML */
    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count'));
      if (isNaN(end)) return;
      var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var finalText = el.textContent;
      var fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      var obj = { v: 0 };
      var cio = new IntersectionObserver(function (entries) {
        if (!entries.some(function (en) { return en.isIntersecting; })) return;
        cio.disconnect();
        gsap.to(obj, {
          v: end, duration: 1.6, ease: 'power3.out',
          onUpdate: function () { el.textContent = prefix + fmt.format(obj.v) + suffix; },
          onComplete: function () { el.textContent = finalText; }
        });
      }, { rootMargin: '0px 0px -10% 0px' });
      cio.observe(el);
    });

    var mm = gsap.matchMedia();
    mm.add({ isDesktop: '(min-width: 1024px)', isFine: '(hover: hover) and (pointer: fine)' }, function (ctx) {
      var c = ctx.conditions;
      if (c.isDesktop) {
        /* Hero video tile recedes while it leaves the viewport */
        var heroVideo = document.querySelector('.hero__video');
        if (heroVideo) {
          gsap.to(heroVideo, { scale: 0.94, y: -24, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
        }
        /* Gentle parallax on cards */
        gsap.utils.toArray('[data-parallax]').forEach(function (card, i) {
          gsap.to(card, { yPercent: i % 2 ? 6 : -6, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
        });
      }
      if (c.isDesktop && c.isFine) {
        /* Magnetic pill buttons */
        gsap.utils.toArray('[data-magnetic]').forEach(function (btn) {
          var label = btn.querySelector('span');
          var xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3.out' });
          var yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3.out' });
          var lxTo = label ? gsap.quickTo(label, 'x', { duration: 0.6, ease: 'power3.out' }) : null;
          var lyTo = label ? gsap.quickTo(label, 'y', { duration: 0.6, ease: 'power3.out' }) : null;
          var onMove = function (e) {
            var r = btn.getBoundingClientRect();
            var dx = ((e.clientX - r.left) / r.width - 0.5), dy = ((e.clientY - r.top) / r.height - 0.5);
            xTo(dx * 24); yTo(dy * 16);
            if (lxTo) { lxTo(dx * 8); lyTo(dy * 6); }
          };
          var onLeave = function () {
            gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
            if (label) gsap.to(label, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
          };
          btn.addEventListener('pointermove', onMove);
          btn.addEventListener('pointerleave', onLeave);
        });
      }
    });

    /* Process: progress line and active step */
    var proc = document.querySelector('[data-process]');
    if (proc) {
      var fill = proc.querySelector('.process__line-fill');
      var steps = proc.querySelectorAll('.process__step');
      ScrollTrigger.create({
        trigger: proc, start: 'top 60%', end: 'bottom 60%',
        onUpdate: function (st) {
          if (fill) fill.style.transform = 'scaleY(' + st.progress.toFixed(4) + ')';
          var idx = Math.min(steps.length - 1, Math.floor(st.progress * steps.length));
          steps.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
        },
        onLeave: function () { steps.forEach(function (s, k) { s.classList.toggle('is-active', k === steps.length - 1); }); }
      });
    }
  } else {
    document.querySelectorAll('.process__step').forEach(function (s) { s.classList.add('is-active'); });
  }

  /* ---------- Stories rail ---------- */
  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var track = rail.querySelector('.rail__track');
    var prev = rail.parentElement.querySelector('[data-rail-prev]');
    var next = rail.parentElement.querySelector('[data-rail-next]');
    if (!track) return;
    function step() { var card = track.querySelector('.story'); return card ? card.getBoundingClientRect().width + 20 : 400; }
    function check() {
      var overflow = track.scrollWidth > track.clientWidth + 8;
      rail.classList.toggle('has-overflow', overflow);
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  });

  /* ---------- Wistia: poster first, player on click ---------- */
  var WISTIA_SRC = 'https://fast.wistia.com/player.js';
  var activePlayer = null;
  function loadWistia() {
    if (document.querySelector('script[src="' + WISTIA_SRC + '"]')) return;
    var s = document.createElement('script'); s.src = WISTIA_SRC; s.async = true; document.head.appendChild(s);
  }
  function mountWistia(box, mediaId, aspect) {
    loadWistia();
    if (activePlayer && activePlayer.parentNode) unmountWistia();
    var p = document.createElement('wistia-player');
    p.setAttribute('media-id', mediaId);
    p.setAttribute('aspect', aspect || '1.7777777777777777');
    p.setAttribute('autoplay', 'true');
    box.appendChild(p);
    box.classList.add('is-playing');
    activePlayer = p;
    var played = false;
    var tryPlay = function () { if (played) return; played = true; try { if (typeof p.play === 'function') p.play(); } catch (err) { /* autoplay attribute covers it */ } };
    p.addEventListener('api-ready', tryPlay);
    if (window.customElements && customElements.whenDefined) customElements.whenDefined('wistia-player').then(function () { setTimeout(tryPlay, 2000); });
    return p;
  }
  function unmountWistia() {
    if (!activePlayer) return;
    var box = activePlayer.parentNode;
    try { if (typeof activePlayer.pause === 'function') activePlayer.pause(); } catch (err) { /* ignore */ }
    if (box) { box.removeChild(activePlayer); box.classList.remove('is-playing'); }
    activePlayer = null;
  }
  function aspectOf(el) {
    var a = (el.getAttribute('data-aspect') || '16/9').split('/');
    var w = parseFloat(a[0]), h = parseFloat(a[1] || '1');
    return (w / h).toString();
  }
  /* In-place players (hero) */
  document.querySelectorAll('.video[data-wistia-id]').forEach(function (box) {
    var btn = box.querySelector('.video__poster');
    if (!btn) return;
    btn.addEventListener('click', function () { mountWistia(box, box.getAttribute('data-wistia-id'), aspectOf(box)); });
  });
  /* Lightbox players (stories) */
  var dlg = document.getElementById('lightbox');
  if (dlg) {
    var dlgBox = dlg.querySelector('.lightbox__box');
    var dlgCap = dlg.querySelector('.lightbox__caption');
    var opener = null;
    function openLightbox(mediaId, aspect, caption) {
      if (!dlgBox) return;
      dlgBox.style.aspectRatio = aspect.replace('/', ' / ');
      if (dlgCap) dlgCap.textContent = caption || '';
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      if (lenis) lenis.stop();
      mountWistia(dlgBox, mediaId, (function () { var a = aspect.split('/'); return (parseFloat(a[0]) / parseFloat(a[1] || '1')).toString(); })());
    }
    function closeLightbox() {
      unmountWistia();
      if (dlg.open) dlg.close();
      if (lenis) lenis.start();
      if (opener && opener.focus) opener.focus();
    }
    dlg.addEventListener('close', function () { unmountWistia(); if (lenis) lenis.start(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeLightbox(); });
    var closeBtn = dlg.querySelector('.lightbox__close');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    document.querySelectorAll('.story[data-wistia-id]').forEach(function (card) {
      var id = card.getAttribute('data-wistia-id');
      if (!id) return;
      card.classList.add('story--video');
      var btn = card.querySelector('.story__poster');
      if (!btn) return;
      btn.addEventListener('click', function () {
        opener = btn;
        var who = card.querySelector('.story__meta b');
        openLightbox(id, card.getAttribute('data-aspect') || '16/9', who ? who.textContent : '');
      });
    });
  }

  /* ---------- 3D mark: gated, lazy, poster fallback ---------- */
  var markBox = document.querySelector('[data-mark-3d]');
  function canDo3D() {
    if (!markBox || !motion) return false;
    if (/[?&]mark=poster/.test(location.search)) return false;
    if (navigator.connection && navigator.connection.saveData) return false;
    if ((navigator.deviceMemory || 4) < 2) return false;
    try {
      var c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (err) { return false; }
  }
  if (canDo3D()) {
    var load3D = function () {
      import('/assets/js/mark-3d.js')
        .then(function (m) { return m.init(markBox, { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger, lenis: lenis, isMobile: !desktop() || !fine, trigger: '.process' }); })
        .catch(function (err) { if (window.console) console.warn('3D mark unavailable, poster shown.', err); });
    };
    var armed = false;
    var arm = function () { if (armed) return; armed = true; if ('requestIdleCallback' in window) requestIdleCallback(load3D, { timeout: 1200 }); else setTimeout(load3D, 200); };
    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (entries) { if (entries.some(function (en) { return en.isIntersecting; })) { near.disconnect(); arm(); } }, { rootMargin: '150% 0px' });
      near.observe(markBox);
    } else { window.addEventListener('load', arm); }
  }
})();
