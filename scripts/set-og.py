"""Points every page's link preview at its own image from scripts/og-images.mjs (20-10-2026): og:image, its size and alt text, and
twitter:image. Touches only those meta lines in the head (trackers, JSON-LD and the rest stay as they are). Idempotent."""
import re, pathlib, html
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
BASE = "https://www.closedin.io/assets/img/og/"
OG = ROOT / "assets/img/og"

def page_for(slug):
    if slug == "home": return ROOT / "index.html"
    if slug == "blog": return ROOT / "blog/index.html"
    for pre in ("resources-", "tools-", "blog-"):
        if slug.startswith(pre): return ROOT / pre[:-1] / (slug[len(pre):] + ".html")
    return ROOT / (slug + ".html")

n = 0
for img in sorted(OG.glob("*-v1.jpg")):
    slug = img.name[:-len("-v1.jpg")]
    f = page_for(slug); assert f.exists(), f
    t = f.read_text(encoding="utf-8")
    head_end = t.index("</head>"); head, rest = t[:head_end], t[head_end:]
    url = BASE + img.name
    title = re.search(r'<meta property="og:title" content="([^"]*)">', head) or re.search(r"<title>(.*?)</title>", head)
    alt = html.unescape(title.group(1)).replace('"', "'")
    alt_attr = html.escape(alt, quote=True)
    m = re.search(r'(\s*)<meta property="og:image" content="[^"]*">', head); assert m, f
    ind = m.group(1)
    block = f'{ind}<meta property="og:image" content="{url}">{ind}<meta property="og:image:width" content="1200">{ind}<meta property="og:image:height" content="630">{ind}<meta property="og:image:alt" content="{alt_attr}">'
    head = re.sub(r'\s*<meta property="og:image:(?:width|height|alt)" content="[^"]*">', "", head)
    head = re.sub(r'(\s*)<meta property="og:image" content="[^"]*">', lambda _: block, head, count=1)
    head = re.sub(r'\s*<meta name="twitter:image" content="[^"]*">', "", head)
    tc = re.search(r'(\s*)<meta name="twitter:card" content="[^"]*">', head)
    if tc: head = head[:tc.end()] + f'{tc.group(1)}<meta name="twitter:image" content="{url}">' + head[tc.end():]
    else:   # no twitter card yet (email verifier): add one under the og block
        a = head.index(block) + len(block)
        head = head[:a] + f'{ind}<meta name="twitter:card" content="summary_large_image">{ind}<meta name="twitter:image" content="{url}">' + head[a:]
    new = head + rest
    if new != t: f.write_text(new, encoding="utf-8"); n += 1
print(n, "pages updated")
