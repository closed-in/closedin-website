/* closed:in page transition (Max' specimen): brackets close the page into the logo, hold, open again on the next page.
   19-10: split out of site.js and loaded first, so the arrival starts as soon as the page is parsed instead of after GSAP, ScrollTrigger and Lenis
   (0.4 to 0.8 s sooner on a slow phone). Exposes window.__veil (show, t, arrived) and fires 'veil:arrived' on document when the page is uncovered. */
(function () {
  'use strict';
  var html = document.documentElement, veil = document.getElementById('veil');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__veil = { arrived: false };
  var arrive = function () { if (window.__veil.arrived) return; window.__veil.arrived = true; try { document.dispatchEvent(new CustomEvent('veil:arrived')); } catch (err) { /* old browsers: site.js has a timer */ } };
  if (!veil) { arrive(); return; }
  var shade = veil.querySelector('.shade'), hooks = veil.querySelectorAll('.hook'), hl = hooks[0], hr = hooks[1], vdots = veil.querySelectorAll('.dot');
  try { var gc = document.createElement('canvas'); gc.width = gc.height = 180; var gx = gc.getContext('2d'); var gim = gx.createImageData(180, 180); for (var gi = 0; gi < gim.data.length; gi += 4) { var gv = Math.random() * 255; gim.data[gi] = gim.data[gi + 1] = gim.data[gi + 2] = gv; gim.data[gi + 3] = 38; } gx.putImageData(gim, 0, 0); html.style.setProperty('--grain', 'url(' + gc.toDataURL() + ')'); } catch (err) { /* no grain */ }
  var K = { st: .117, arm: .745, dot: .117, dotY: .1825, L: { x: -.86, y: .89 }, R: { x: .87, y: -.83 } }; K.sq = (K.arm - K.st) / 2;
  /* 19-10 (Max: "kan iets versneld worden"): about 30% faster than the specimen timing (close 700, toLogo 420, hold 450, back 360, openOut 700).
     Arrival now 1.04 s instead of 1.51 s, the page wakes after 0.52 s instead of 0.81 s; leaving navigates after 0.91 s instead of 1.35 s. */
  var T = { close: 480, toLogo: 300, hold: 260, back: 260, openOut: 520 }; var vt1 = T.close, vt2 = vt1 + T.toLogo, vt3 = vt2 + T.hold, vt4 = vt3 + T.back, vt5 = vt4 + T.openOut;
  var lerp = function (a, b, t) { return a + (b - a) * t; }, lerpP = function (a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; };
  var vEase = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, outE = function (t) { return 1 - Math.pow(1 - t, 3); }, smooth = function (a, b, t) { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
  var dims = function () { var W = innerWidth, H = innerHeight, em = Math.min(W, H) * .16, C = { x: W / 2, y: H / 2 }; var P = function (u, v) { return { x: C.x + u * em, y: C.y + v * em }; }; return { W: W, H: H, em: em, C: C, open: { L: { x: -K.arm * em, y: H + K.arm * em }, R: { x: W + K.arm * em, y: -K.arm * em } }, square: { L: P(-K.sq, K.sq), R: P(K.sq, -K.sq) }, logo: { L: P(K.L.x, K.L.y), R: P(K.R.x, K.R.y) } }; };
  var draw = function (g, L, R, hole, dotAmt) {
    var st = K.st * g.em, arm = K.arm * g.em;
    hl.style.cssText = 'left:' + (L.x - st / 2) + 'px;top:' + (L.y - arm + st / 2) + 'px;width:' + arm + 'px;height:' + arm + 'px;border-width:0 0 ' + st + 'px ' + st + 'px';
    hr.style.cssText = 'left:' + (R.x - arm + st / 2) + 'px;top:' + (R.y - st / 2) + 'px;width:' + arm + 'px;height:' + arm + 'px;border-width:' + st + 'px ' + st + 'px 0 0';
    var x1 = L.x + st / 2, x2 = R.x - st / 2, y1 = R.y + st / 2, y2 = L.y - st / 2, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    x1 = mx + (x1 - mx) * hole; x2 = mx + (x2 - mx) * hole; y1 = my + (y1 - my) * hole; y2 = my + (y2 - my) * hole;
    shade.style.clipPath = hole <= 0.001 ? 'none' : 'polygon(evenodd,0px 0px,' + g.W + 'px 0px,' + g.W + 'px ' + g.H + 'px,0px ' + g.H + 'px,0px 0px,' + x1 + 'px ' + y1 + 'px,' + x2 + 'px ' + y1 + 'px,' + x2 + 'px ' + y2 + 'px,' + x1 + 'px ' + y2 + 'px,' + x1 + 'px ' + y1 + 'px)';
    var ds = K.dot * g.em * (.4 + .6 * dotAmt);
    [[vdots[0], -K.dotY], [vdots[1], K.dotY]].forEach(function (pair) { pair[0].style.cssText = 'width:' + ds + 'px;height:' + ds + 'px;left:' + (g.C.x - ds / 2) + 'px;top:' + (g.C.y + pair[1] * g.em - ds / 2) + 'px;opacity:' + dotAmt; });
  };
  var frameAt = function (t, g) {
    if (t < vt1) { var p0 = t / T.close, e0 = vEase(p0); return [lerpP(g.open.L, g.square.L, e0), lerpP(g.open.R, g.square.R, e0), 1 - smooth(.62, 1, p0), 0]; }
    if (t < vt2) { var p1 = (t - vt1) / T.toLogo, e1 = outE(p1); return [lerpP(g.square.L, g.logo.L, e1), lerpP(g.square.R, g.logo.R, e1), 0, smooth(0, .7, p1)]; }
    if (t < vt3) return [g.logo.L, g.logo.R, 0, 1];
    if (t < vt4) { var p3 = (t - vt3) / T.back, e3 = vEase(p3); return [lerpP(g.logo.L, g.square.L, e3), lerpP(g.logo.R, g.square.R, e3), 0, 1 - smooth(.25, 1, p3)]; }
    var p4 = Math.min(1, (t - vt4) / T.openOut), e4 = vEase(p4); return [lerpP(g.square.L, g.open.L, e4), lerpP(g.square.R, g.open.R, e4), smooth(0, .38, p4), 0];
  };
  /* the geometry is measured once per size, not every frame: reading innerWidth after the style writes forced a layout on each frame of the transition */
  var geo = null; window.addEventListener('resize', function () { geo = null; });
  var show = function (t) { var g = geo || (geo = dims()), f = frameAt(t, g); draw(g, f[0], f[1], f[2], f[3]); };
  var hideVeil = function () { veil.classList.remove('on'); html.classList.remove('has-veil'); busyVeil = false; arrive(); };
  var busyVeil = false, hold = /[?&]veil=hold/.test(location.search);
  var playVeil = function (from, to, onPass, passAt, onDone) { busyVeil = true; veil.classList.add('on'); html.classList.add('has-veil'); var start = performance.now(), passed = false; show(from); var tick = function (now) { var t = from + (now - start); if (!passed && passAt != null && t >= passAt) { passed = true; onPass && onPass(); } if (t >= to) { show(to); onDone && onDone(); return; } show(t); requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
  if (reduce) { hideVeil(); }
  else if (hold) { veil.classList.add('on'); html.classList.add('has-veil', 'veil-hold'); show(vt2); arrive(); }
  else { playVeil(vt2, vt5, function () { html.classList.remove('has-veil'); }, vt4, hideVeil); }   /* arrival: the logo holds, closes and the brackets open out; the page wakes up as they open */
  window.addEventListener('pageshow', function (e) { if (e.persisted) hideVeil(); });
  window.__veil.show = show; window.__veil.t = { t1: vt1, t2: vt2, t3: vt3, t4: vt4, t5: vt5 };
  if (!reduce) document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]'); if (!a || a.target || a.hasAttribute('download') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var url; try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return; if (url.pathname === location.pathname && url.hash) return; if (/^(mailto|tel):/.test(a.getAttribute('href'))) return;
    e.preventDefault(); if (busyVeil) return;
    prefetch(url);
    playVeil(0, vt3, function () { location.href = url.href; }, vt2 + T.hold / 2, null);   /* leaving: close in, become the logo, navigate mid-hold */
  });
  /* 19-10: the next page downloads while the brackets close (and already on hover or touch), so the navigation mid-hold comes from the cache */
  var fetched = {};
  var prefetch = function (url) { var key = url.origin + url.pathname; if (fetched[key] || url.origin !== location.origin || url.pathname === location.pathname) return; fetched[key] = 1; var l = document.createElement('link'); l.rel = 'prefetch'; l.href = url.origin + url.pathname; document.head.appendChild(l); };
  var hoverFetch = function (e) { var a = e.target && e.target.closest ? e.target.closest('a[href]') : null; if (!a || a.target || a.hasAttribute('download')) return; var url; try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; } if (!/^https?:$/.test(url.protocol)) return; prefetch(url); };
  if (!(navigator.connection && navigator.connection.saveData)) { document.addEventListener('pointerover', hoverFetch, { passive: true }); document.addEventListener('touchstart', hoverFetch, { passive: true }); }
})();
