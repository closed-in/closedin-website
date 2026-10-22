"""Builds llms-full.txt (22-10-2026): the plain text of the key pages (headings as markdown, paragraphs, list items), each under its
canonical URL, for AI tools that read the whole site in one file. Companion to llms.txt (the curated index). Usage: python3 scripts/build-llms-full.py"""
import re, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
BASE = "https://www.closedin.io"
PAGES = ["index.html", "outbound-agency.html", "gtm-engineering-agency.html", "clay-agency.html", "cold-email-agency-amsterdam.html", "cold-email-agency-saas.html",
         "outbound-agency-uk.html", "outbound-agency-us.html", "pricing.html", "case-studies.html", "case-study-verzendbazen.html", "case-study-jamezz.html",
         "case-study-endresz.html", "case-study-gen-zero.html", "case-study-mistertafel.html", "case-study-redfox.html", "case-study-wetaxus.html", "case-study-zano.html",
         "team.html", "blog/cold-email-open-rate-vanity-metric.html", "blog/cold-email-warmup-schedule.html", "blog/finding-prospects-not-in-apollo.html"]

def page_text(t):
    m = t[t.index("<main"):t.index("</main>")]
    m = re.sub(r"<(script|style|svg|dialog)\b.*?</\1>", " ", m, flags=re.S)
    m = re.sub(r'<[^>]*aria-hidden="true"[^>]*>.*?</(span|div|i)>', " ", m, flags=re.S)
    out = []
    for tag, inner in re.findall(r"<(h1|h2|h3|p|li|blockquote|figcaption|summary)\b[^>]*>(.*?)</\1>", m, re.S):
        s = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", inner))).strip()
        if not s or len(s) < 3: continue
        pre = {"h1": "# ", "h2": "## ", "h3": "### ", "li": "- ", "blockquote": "> ", "summary": "**Q:** "}.get(tag, "")
        out.append(pre + s)
    seen, dedup = set(), []
    for line in out:
        if line in seen: continue
        seen.add(line); dedup.append(line)
    return "\n".join(dedup)

parts = ["# closed:in, full text of the key pages\n", "Curated index: https://www.closedin.io/llms.txt. Generated from the pages; the pages are the source of truth.\n"]
for f in PAGES:
    p = ROOT / f
    if not p.exists(): continue
    t = p.read_text(encoding="utf-8")
    title = html.unescape(re.search(r"<title>(.*?)</title>", t, re.S).group(1).strip())
    url = BASE + ("/" + re.sub(r"(^|/)index\.html$", "", f).replace(".html", "")).rstrip("/") or BASE + "/"
    if f == "index.html": url = BASE + "/"
    parts.append(f"\n---\n\n## {title}\nURL: {url}\n\n{page_text(t)}\n")
txt = "\n".join(parts).replace("—", ",").replace("–", "-")
(ROOT / "llms-full.txt").write_text(txt, encoding="utf-8"); print(f"llms-full.txt: {len(txt)//1024} KB, {sum(1 for f in PAGES if (ROOT / f).exists())} pages")
