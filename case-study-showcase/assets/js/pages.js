/* closed:in inner pages (2026-10-19): the resources filter. The chips show one category of the vault at a time; cards fade back in. */
(function () {
  'use strict';
  var pills = document.querySelectorAll('.filter-pill'); if (!pills.length) return;
  var cells = document.querySelectorAll('.vault-cell');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  pills.forEach(function (pill) {
    pill.setAttribute('aria-pressed', pill.classList.contains('active') ? 'true' : 'false');
    pill.addEventListener('click', function () {
      var f = pill.getAttribute('data-filter');
      pills.forEach(function (p) { var on = p === pill; p.classList.toggle('active', on); p.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      cells.forEach(function (c) {
        var show = f === 'all' || c.getAttribute('data-cat') === f;
        if (!show) { c.hidden = true; return; }
        c.hidden = false;
        if (!reduce) { c.classList.add('is-out'); requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.remove('is-out'); }); }); }
      });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });
})();

/* Team (19-10): the select cursor. Two favicon brackets glide with a little overshoot to the card under the pointer, the focused card or the tapped card,
   like the player cursor on a game's character select; the chosen card lifts and turns to colour (pages.css: .pteam__cursor, .is-sel, .has-sel). */
(function () {
  'use strict';
  document.querySelectorAll('.pteam').forEach(function (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.pmember')); if (!cards.length) return;
    var cur = document.createElement('span'); cur.className = 'pteam__cursor'; cur.setAttribute('aria-hidden', 'true'); cur.innerHTML = '<i></i><i></i>'; grid.appendChild(cur);
    var sel = null;
    var place = function (card, jump) {
      if (jump) cur.style.transition = 'none';
      cur.style.setProperty('--x', card.offsetLeft + 'px'); cur.style.setProperty('--y', card.offsetTop + 'px');
      cur.style.setProperty('--w', card.offsetWidth + 'px'); cur.style.setProperty('--h', card.offsetHeight + 'px');
      if (jump) { void cur.offsetWidth; cur.style.transition = ''; }
    };
    var select = function (card) {
      if (sel === card) return;
      place(card, !cur.classList.contains('on'));   /* first time: appear on the card and snap the brackets in; after that: glide */
      cards.forEach(function (c) { c.classList.toggle('is-sel', c === card); });
      grid.classList.add('has-sel'); cur.classList.add('on'); sel = card;
    };
    var clear = function () { sel = null; cards.forEach(function (c) { c.classList.remove('is-sel'); }); grid.classList.remove('has-sel'); cur.classList.remove('on'); };
    cards.forEach(function (card) {
      card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') select(card); });
      card.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') select(card); });
      card.addEventListener('focusin', function () { select(card); });
    });
    grid.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') clear(); });
    grid.addEventListener('focusout', function (e) { if (!grid.contains(e.relatedTarget)) clear(); });
    document.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' && sel && !grid.contains(e.target)) clear(); });
    window.addEventListener('resize', function () { if (sel) place(sel, true); });
  });
})();
