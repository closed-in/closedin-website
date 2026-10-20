#!/usr/bin/env python3
"""Copy hygiene for the homepage and the pages rebuilt on the new design: no emoji, no em/en dashes, no 'open rate', no 'plynq', no 'Closed:in', no framer-hosted images,
no Wistia player.js in the initial HTML, no star or arrow glyphs. Scripts and JSON-LD are excluded from the glyph checks but
included in the 'open rate' / 'plynq' checks. Exit 1 on any hit.
The blog index keeps the teaser of the post that argues against open rate (live copy, allowlisted below by its exact sentences)."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
PAGES = ["index.html", "case-studies.html", "resources.html", "team.html", "blog/index.html", "resources/gtm-stack.html",
         "resources/n8n-workflows.html", "playbook.html", "tools/roi-calculator.html", "tools/email-verifier.html", "resources/cold-email-templates.html",
         "resources/clay-waterfall.html",
         "case-study-endresz.html", "case-study-gen-zero.html", "case-study-jamezz.html", "case-study-mistertafel.html", "case-study-redfox.html", "case-study-verzendbazen.html", "case-study-wetaxus.html", "case-study-zano.html",   # case pages converted 20-10
         "clay-agency.html", "cold-email-agency-amsterdam.html", "cold-email-agency-saas.html", "gtm-engineering-agency.html", "outbound-agency-uk.html", "outbound-agency-us.html"]   # landing pages converted 20-10
files = [root / p for p in PAGES] + [root / "assets/css" / c for c in ("site.css", "home.css", "pages.css", "docs.css", "case.css", "landing.css")] + [root / "assets/js" / j for j in ("site.js", "pages.js", "mark-3d.js", "mark-dark.js", "stack.js")]
files = [f for f in files if f.exists()]
ALLOW = ("Apple killed open rate. Most agencies still report on it.", "closed:in dropped open rate from client reports two years ago.")
hits = 0
emoji = re.compile(r"[\U0001F000-\U0001FAFF☀-➿⭐✅⬆↔-⇿]")
for f in files:
    text = f.read_text(encoding="utf-8")
    body = re.sub(r"<!--.*?-->", "", re.sub(r"<script\b[^>]*>.*?</script>", "", text, flags=re.S), flags=re.S) if f.suffix == ".html" else text
    for i, line in enumerate(body.splitlines(), 1):
        for pat, label in ((emoji, "emoji/pictograph"), (re.compile("—"), "em dash"), (re.compile("–"), "en dash"), (re.compile("★|→"), "star/arrow glyph")):
            if pat.search(line):
                print(f"{f.relative_to(root)}:{i}: {label}: {line.strip()[:120]}"); hits += 1
    for pat, label in ((re.compile(r"open rate", re.I), "open rate"), (re.compile(r"plynq", re.I), "plynq"), (re.compile(r"Closed:in"), "capitalised brand"),
                       (re.compile(r"framerusercontent"), "framer-hosted image"), (re.compile(r"fast\.wistia\.com/player\.js"), "wistia player in initial html")):
        if f.suffix == ".html" or label in ("open rate", "plynq"):
            for i, line in enumerate(text.splitlines(), 1):
                if pat.search(line) and not (label == "wistia player in initial html" and f.suffix == ".js") and not (label == "open rate" and any(a in line for a in ALLOW)):
                    print(f"{f.relative_to(root)}:{i}: {label}: {line.strip()[:120]}"); hits += 1
print("copy check:", "PASS" if hits == 0 else f"FAIL ({hits})")
sys.exit(1 if hits else 0)
