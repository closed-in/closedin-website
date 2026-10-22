"""Every video testimonial card on the homepage and the Cases page links to the written case page of that client (22-10-2026, Max:
"als je op de video testimonial klikt moet je naar een pagina gaan waarop het werk staat uitgeschreven"). The play button keeps
opening the video in the lightbox; the body of the card (quote, outcome, name) is the link, with a Read the story line at the bottom.
Idempotent. Usage: python3 scripts/story-links.py"""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
PAGE = {"Ronne van Rijn": ("endresz", "Endresz"), "Mikel Palokaj": ("tpn", "TPN"), "Leva Konaté": ("sankore", "Sankore Labs"), "Laura Wolf": ("sustainable-motion", "Sustainable Motion"),
        "Shirin Danesh": ("advantive", "Advantive Advisory"), "Nick Verhulsdonck": ("wetaxus", "WeTaxus"), "Zen Alex": ("redfox", "Red Fox Agency")}
READ = '<span class="story__read" aria-hidden="true">Read the story<svg><use href="#i-e"/></svg></span>'
for name in ("index.html", "case-studies.html"):
    p = ROOT / name; t = p.read_text(encoding="utf-8"); n = 0
    def fix(m):
        global n
        art = m.group(0)
        if 'class="story__link"' in art or 'class="story story--case' in art: return art
        who = next((k for k in PAGE if k in art), None)
        if not who: return art
        slug, client = PAGE[who]
        link = f'<a class="story__link" href="case-study-{slug}"><span class="sr-only">Read the {client} story</span></a>'
        art = art.replace('<div class="story__body">', '<div class="story__body">' + link, 1)
        art = re.sub(r'(</p>)(\s*</div>\s*<span itemprop="reviewRating")', r'\1' + READ + r'\2', art, count=1)
        n += 1; return art
    t2 = re.sub(r'<article class="story[^"]*"[^>]*>.*?</article>', fix, t, flags=re.S)
    p.write_text(t2, encoding="utf-8"); print(name, n, "cards linked")
