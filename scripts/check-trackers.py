#!/usr/bin/env python3
"""Byte parity of the tracker, JSON-LD and cookie blocks between main and the working copy (or a live URL), for the homepage and the rebuilt inner pages.
Usage: python3 scripts/check-trackers.py [--url https://www.closedin.io/]"""
import subprocess, sys, pathlib, urllib.request, re
root = pathlib.Path(__file__).resolve().parent.parent
def block(text, start, end, inclusive_end=True):
    i = text.find(start)
    if i < 0: return None
    if isinstance(end, tuple):   # (marker, closing): up to and including the first closing string after the marker
        j = text.find(end[0], i)
        if j < 0: return None
        j = text.find(end[1], j)
        return None if j < 0 else text[i: j + len(end[1])]
    j = text.find(end, i)
    if j < 0: return None
    return text[i: j + (len(end) if inclusive_end else 0)]
BLOCKS = [
    ("head trackers", '<script defer src="/_vercel/insights/script.js"></script>', ("gtag('config', 'G-WK7J5NHB0C');", "</script>")),
    ("json-ld graph", '<script type="application/ld+json">\n    {\n      "@context": "https://schema.org",\n      "@graph"', "</script>"),
    ("prospect pro + stairoids", "<!-- Prospect Pro", "jq_950354e1.js'></script>"),
    ("stairoids", "<!-- Stairoids", "jq_950354e1.js'></script>"),
    ("cookie banner + claydar", '<div class="cookie-banner" id="cookie-banner">', "})();\n</script>"),
    ("leadboxer", "<!-- Leadboxer", 'leadboxer.com/?dataset=316eddd7dcb64c2d96481f90418a96c1"></script>'),
    ("leadboxer + subscribe", "<!-- Leadboxer", '<script defer src="/subscribe-form.js"></script>'),
]
PAGES = ["index.html", "case-studies.html", "resources.html", "team.html", "contact.html",   # pages rebuilt on the new design system
         "blog/index.html", "resources/gtm-stack.html", "resources/n8n-workflows.html", "playbook.html", "tools/roi-calculator.html",
         "tools/email-verifier.html", "resources/cold-email-templates.html", "resources/clay-waterfall.html"]
LD = re.compile(r'<script type="application/ld\+json"[^>]*>.*?</script>', re.S)
def check(name, main, new):
    fails = 0
    blocks = BLOCKS if name == "index.html" else [b for b in BLOCKS if b[0] != "json-ld graph"]
    for label, s_, e_ in blocks:
        a, b = block(main, s_, e_), block(new, s_, e_)
        if a is None and b is None: continue
        ok = a is not None and a == b
        print(f"{'PASS' if ok else 'FAIL'}  {name}: {label}  ({len(a or '')} bytes in main, {len(b or '')} in new)")
        if not ok:
            fails += 1
            if a and b:
                import difflib
                for line in list(difflib.unified_diff(a.splitlines(), b.splitlines(), "main", "new", lineterm=""))[:40]: print("   ", line)
    if name != "index.html":
        ok = LD.findall(main) == LD.findall(new)
        print(f"{'PASS' if ok else 'FAIL'}  {name}: json-ld blocks  ({len(LD.findall(main))} in main, {len(LD.findall(new))} in new)")
        fails += 0 if ok else 1
    return fails
fails = 0
if len(sys.argv) > 2 and sys.argv[1] == "--url":
    main = subprocess.run(["git", "-C", str(root), "show", "main:case-study-showcase/index.html"], capture_output=True, text=True, check=True).stdout
    fails += check("index.html", main, urllib.request.urlopen(sys.argv[2], timeout=20).read().decode("utf-8"))
else:
    for name in PAGES:
        main = subprocess.run(["git", "-C", str(root), "show", f"main:case-study-showcase/{name}"], capture_output=True, text=True, check=True).stdout
        fails += check(name, main, (root / "case-study-showcase" / name).read_text(encoding="utf-8"))
print("ALL PASS" if not fails else f"{fails} FAILED")
sys.exit(1 if fails else 0)
