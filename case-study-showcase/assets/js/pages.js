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
