"""20-10-2026 (night audit): every resource page with an email gate gets a button in its opening with the gate's own label
(Get all 50+ booleans, Get the stack, ...) that glides to the gate, so the free download is visible above the fold.
The gate card gets id="get". Idempotent; touches only the hero and the gate's opening tag."""
import re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
n = 0
for f in sorted((ROOT / "resources").glob("*.html")):
    t = f.read_text(encoding="utf-8")
    if 'class="gate-section"' not in t or 'class="hero-actions' in t: continue
    g = t.index('<div class="gate-section"')
    label = re.search(r'<button[^>]*class="btn-accent"[^>]*><span class="txt">(.*?)</span>', t[g:]).group(1)
    t = t[:g] + '<div class="gate-section" id="get"' + t[g + len('<div class="gate-section"'):]
    hs = t.index('<section class="hero hero--light"'); he = t.index("</section>", hs)
    hero = t[hs:he]
    k = len(re.findall(r'class="[^"]*hero-in[^"]*" style="--i:\d+"', hero))
    i = hero.rindex("    </div>")   # the end of hero-inner
    btn = f'        <div class="hero-actions hero-in" style="--i:{k}"><a class="btn-accent" href="#get"><span class="txt">{label}</span><span class="ico"><svg><use href="#i-s"/></svg></span></a></div>\n'
    hero = hero[:i] + btn + hero[i:]
    t = t[:hs] + hero + t[he:]
    f.write_text(t, encoding="utf-8"); n += 1; print(f.name, "->", label)
print(n, "pages")
