"""20-10-2026 (night audit): the seven Resources-menu detail pages (playbook, ROI calculator, email verifier, GTM stack, n8n workflows,
cold email templates, Clay waterfall) open light like every other detail page, instead of the dark band with the fade. The blog index
keeps the dark opening, like the other overview pages (Cases, Resources). Swaps the hero's opening tag and drops the fade; reversible by
swapping back. Idempotent."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
PAGES = ["playbook.html", "tools/roi-calculator.html", "tools/email-verifier.html", "resources/gtm-stack.html", "resources/n8n-workflows.html",
         "resources/cold-email-templates.html", "resources/clay-waterfall.html"]
DARK = '<section class="hero" data-nav-theme="dark" data-glyphs="hero">'
LIGHT = '<section class="hero hero--light" data-glyphs="right">'
FADE = '\n<div class="fade" aria-hidden="true"></div>'
for name in PAGES:
    f = ROOT / name; t = f.read_text(encoding="utf-8")
    if LIGHT in t: print(name, "already light"); continue
    assert t.count(DARK) == 1, name
    i = t.index(DARK); j = t.index("</section>", i) + len("</section>")
    assert t[j:j + len(FADE)] == FADE, (name, t[j:j + 60])
    t = t[:i] + LIGHT + t[i + len(DARK):j] + t[j + len(FADE):]
    f.write_text(t, encoding="utf-8"); print(name, "light")
