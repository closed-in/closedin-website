"""Copies the shared chrome of index.html (nav, footer, icon sprite, page-transition veil) to every other page, so a change to the
menu or the footer is one edit plus one command (20-10-2026). Pages in a subfolder, the Resources-menu pages and the 404 get the
absolute-link version; every page keeps its own utm_content on the nav button. Dry run by default (lists what would change);
--write writes. Usage: python3 scripts/sync-chrome.py [--write]"""
import re, sys, pathlib, subprocess, difflib
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
ABS_OK = re.compile(r'^(https?:|mailto:|tel:|/|#|data:)')

def between(s, a, b):
    i = s.index(a); j = s.index(b, i) + len(b); return s[i:j]

def absolutize(block):
    return re.sub(r'\b(href|src)="([^"]*)"', lambda m: m.group(0) if ABS_OK.match(m.group(2)) else f'{m.group(1)}="/{m.group(2)}"', block)

MARKS = {
    "nav": ('<header class="nav" id="nav" data-nav>', '</header>'),
    "footer": ('<footer class="footer theme-dark" id="contact-cta" data-nav-theme="dark">', '</footer>'),
    "sprite": ('<svg width="0" height="0" style="position:absolute" aria-hidden="true">', '</svg>\n'),
    "veil": ('<div class="veil on" id="veil"', '</div></div>'),
}
SRC = {k: between(INDEX, *v) for k, v in MARKS.items()}
SRC["footer"] = SRC["footer"].replace('href="#hero"', 'href="#main"')

def chrome_for(page_text):
    """the blocks this page should have: absolute links when its nav already uses them, its own utm_content on the nav button"""
    nav_now = between(page_text, *MARKS["nav"])
    absolute = 'href="/case-studies"' in nav_now
    slug = re.search(r'utm_content=([a-z0-9-]+)', nav_now).group(1)
    nav = SRC["nav"].replace('<a href="#services">Services</a>', '<a href="/">Services</a>').replace("utm_content=homepage", "utm_content=" + slug)
    footer = SRC["footer"]
    if absolute: nav, footer = absolutize(nav), absolutize(footer)
    return {"nav": nav, "footer": footer, "sprite": SRC["sprite"], "veil": SRC["veil"]}

write = "--write" in sys.argv
files = subprocess.run(["git", "ls-files", "*.html"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split()
files = [f for f in files if f not in ("index.html", "pipeline-demo.html") and not f.startswith("assets/")]
changed = 0
for f in files:
    p = ROOT / f; t = p.read_text(encoding="utf-8"); new = t
    want = chrome_for(t)
    for k, (a, b) in MARKS.items():
        cur = between(new, a, b)
        if cur != want[k]:
            print(f"{f}: {k} differs")
            for line in list(difflib.unified_diff(cur.splitlines(), want[k].splitlines(), lineterm="", n=0))[2:8]: print("    ", line[:160])
            new = new.replace(cur, want[k], 1)
    if new != t:
        changed += 1
        if write: p.write_text(new, encoding="utf-8")
print(f"{changed} of {len(files)} pages {'updated' if write else 'would change (dry run, --write to apply)'}")
