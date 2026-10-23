"""The 404 page (20-10-2026, night audit): site chrome with absolute links (it is served at any depth), the light opening and the six
pages people look for most, plus the call to action. Head from team.html (trackers as on every page) without canonical, JSON-LD and
preview tags, robots noindex. Writes case-study-showcase/404.html."""
import re, pathlib
import importlib.util
_here = pathlib.Path(__file__).parent
_spec = importlib.util.spec_from_file_location("build_docs", _here / "build-docs-pages.py")
bd = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(bd)
bp = bd.bp
ROOT = bp.ROOT
team = (ROOT / "team.html").read_text(encoding="utf-8")

head = bp.between(team, "<head>", "</head>")
head = head.replace("<title>Team | closed:in</title>", "<title>Page not found | closed:in</title>")
head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="This address has no page on closedin.io. Pick up from the pages people visit most.">', head)
head = re.sub(r'\n\s*<link rel="canonical" href="[^"]*">', "", head)
head = head.replace('<meta name="robots" content="index, follow">', '<meta name="robots" content="noindex, follow">')
head = re.sub(r'\n\s*<script type="application/ld\+json">.*?</script>', "", head, flags=re.S)
head = re.sub(r'\n\s*<meta (?:property="og:[^"]*"|name="twitter:[^"]*") content="[^"]*">', "", head)
head = head.replace('\n    <script defer src="/assets/js/pages.js"></script>', "")
head = re.sub(r'href="(favicon[^"]*)"', r'href="/\1"', head)   # served at any depth
assert "og:" not in head and "ld+json" not in head and "canonical" not in head

CTA = "https://meeting.closedin.io/discovery-call?utm_source=closedin.io&amp;utm_medium=cta&amp;utm_content=404"
LINKS = [("/", "Home", "Creative outbound, engineered for predictable B2B pipeline."),
         ("/case-studies", "Case studies", "Real numbers from live client campaigns."),
         ("/resources", "Resources", "Every tool, template and workflow we use."),
         ("/blog", "Blog", "Tactics from live outbound campaigns, one post per week."),
         ("/pricing", "Pricing", "How an engagement is shaped and priced."),
         ("/team", "Team", "The people behind your pipeline.")]
cards = "".join(f'<a class="nf-link" href="{h}" data-reveal><span class="nf-link__name">{n}<svg aria-hidden="true"><use href="#i-e"/></svg></span><span class="nf-link__desc">{d}</span></a>' for h, n, d in LINKS)
main = f'''<section class="phero phero--light nf-hero" id="hero" data-glyphs="right">
    <div class="container phero__in">
        <p class="phero__pill hero-in" style="--i:0"><i></i>404</p>
        <h1 class="phero__title hero-in" style="--i:1">Let's get you <b>back on track.</b></h1>
        <p class="phero__lead hero-in" style="--i:2">Pick up from one of the pages people visit most, or book a call and ask us directly.</p>
        <div class="phero__actions hero-in" style="--i:3"><a class="btn-accent" href="{CTA}" target="_blank" rel="noopener"><span class="txt" data-letters>Book a 30 min call</span><span class="ico"><svg><use href="#i-e"/></svg></span></a></div>
    </div>
</section>
<section class="psec nf-sec" aria-label="Popular pages" data-glyphs="sides">
    <div class="container"><div class="nf-links">{cards}</div></div>
</section>'''

i = team.index('<div class="cookie-banner" id="cookie-banner">')
j = team.index("</body>")
tail = team[i:j].replace('<a href="privacy">Meer info</a>', '<a href="/privacy">Meer info</a>')
doc_open = team[: team.index("<head>")]
nav = bd.NAV.replace("utm_content=homepage", "utm_content=404")
body = "\n".join(['<body class="nf">', bp.VEIL, bp.NOSCRIPT, bp.SKIP, "", bp.SPRITE.rstrip("\n"), "", nav, "", '<main id="main">', main, "</main>", "", bd.FOOTER, "", tail.rstrip("\n"), "</body>", "</html>", ""])
out = doc_open + "<head>" + head + "</head>\n" + body
(ROOT / "404.html").write_text(out, encoding="utf-8")
print("404.html", len(out), "bytes")
