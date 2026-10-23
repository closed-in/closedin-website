#!/usr/bin/env python3
"""Byte parity of the tracker and cookie blocks between main and the working copy (or a live URL), for every page. (The JSON-LD left this check on 22-10 with Max's go: scripts/check-schema.py validates it.)
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
    ("prospect pro + stairoids", "<!-- Prospect Pro", "jq_950354e1.js'></script>"),
    ("stairoids", "<!-- Stairoids", "jq_950354e1.js'></script>"),
    ("cookie banner + claydar", '<div class="cookie-banner" id="cookie-banner">', "})();\n</script>"),
    ("cookie banner + consent script (privacy: also runs the revoke and grant buttons)", "<!-- Cookie Consent Banner -->", ("// Mobile menu", "</script>")),
    ("leadboxer", "<!-- Leadboxer", 'leadboxer.com/?dataset=316eddd7dcb64c2d96481f90418a96c1"></script>'),
    ("leadboxer + subscribe", "<!-- Leadboxer", '<script defer src="/subscribe-form.js"></script>'),
]
PAGES = ["index.html", "case-studies.html", "resources.html", "team.html",   # pages rebuilt on the new design system
         "blog/index.html", "resources/gtm-stack.html", "resources/n8n-workflows.html", "playbook.html", "tools/roi-calculator.html",
         "tools/email-verifier.html", "resources/cold-email-templates.html", "resources/clay-waterfall.html",
         "case-study-endresz.html", "case-study-gen-zero.html", "case-study-jamezz.html", "case-study-mistertafel.html", "case-study-redfox.html", "case-study-verzendbazen.html", "case-study-wetaxus.html", "case-study-zano.html",   # case pages converted 20-10
         "clay-agency.html", "cold-email-agency-amsterdam.html", "cold-email-agency-saas.html", "gtm-engineering-agency.html", "outbound-agency-uk.html", "outbound-agency-us.html", "pricing.html",   # landing pages converted 20-10
         "resources/apollo-booleans.html", "resources/sales-nav-booleans.html", "resources/claude-code-sales.html", "resources/icp-scorecard.html", "resources/pre-launch-audit.html",
         "blog/cold-email-open-rate-vanity-metric.html", "blog/cold-email-warmup-schedule.html", "blog/finding-prospects-not-in-apollo.html", "privacy.html"]   # detail pages converted 20-10
# 22-10: pages that do not exist on main yet; their tracker, cookie and Leadboxer blocks are compared with this reference page from main
REF = {"case-study-tpn.html": "case-study-endresz.html", "case-study-sankore.html": "case-study-endresz.html", "case-study-sustainable-motion.html": "case-study-endresz.html",
       "case-study-advantive.html": "case-study-endresz.html", "outbound-agency.html": "outbound-agency-uk.html"}
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
    return fails
fails = 0
if len(sys.argv) > 2 and sys.argv[1] == "--url":
    main = subprocess.run(["git", "-C", str(root), "show", "main:case-study-showcase/index.html"], capture_output=True, text=True, check=True).stdout
    fails += check("index.html", main, urllib.request.urlopen(sys.argv[2], timeout=20).read().decode("utf-8"))
else:
    for name in PAGES + [n for n in REF if (root / "case-study-showcase" / n).exists()]:
        main = subprocess.run(["git", "-C", str(root), "show", f"main:case-study-showcase/{REF.get(name, name)}"], capture_output=True, text=True, check=True).stdout
        fails += check(name, main, (root / "case-study-showcase" / name).read_text(encoding="utf-8"))
print("ALL PASS" if not fails else f"{fails} FAILED")
sys.exit(1 if fails else 0)
