"""Second batch (20-10-2026, night audit) of the docs conversion: the five gated resources (Apollo and Sales Navigator booleans,
Claude Code for sales, ICP scorecard, pre-launch audit), the three blog posts and the privacy policy, on site.css plus docs.css.
Same rules as build-docs-pages.py (content markup and copy kept, trackers, JSON-LD, cookie banner and Leadboxer byte-identical,
nav, sprite, veil and footer from index.html with absolute links); these are detail pages, so they open light like the case
pages (no dark band). Reads the OLD pages from git (SRC_REV); writes to scripts/docs2-out/ unless --write is given."""
import re, sys, pathlib, subprocess
import importlib.util
_here = pathlib.Path(__file__).parent
_spec = importlib.util.spec_from_file_location("build_docs", _here / "build-docs-pages.py")
bd = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(bd)
bp = bd.bp

ROOT = bp.ROOT
SRC_REV = "fada808"
PAGES = ["resources/apollo-booleans.html", "resources/sales-nav-booleans.html", "resources/claude-code-sales.html", "resources/icp-scorecard.html",
         "resources/pre-launch-audit.html", "blog/cold-email-open-rate-vanity-metric.html", "blog/cold-email-warmup-schedule.html",
         "blog/finding-prospects-not-in-apollo.html", "privacy.html"]


def new_head(old, name=None):
    """bd.new_head, but the privacy page never had the font preconnects; blog pages get the feed link (22-10)"""
    h = _new_head(old)
    if name and name.startswith("blog/"):
        h = h.replace('<link rel="canonical"', '<link rel="alternate" type="application/rss+xml" title="closed:in blog" href="https://www.closedin.io/blog/feed.xml">\n    <link rel="canonical"', 1)
    return h


def _new_head(old):
    if 'rel="preconnect" href="https://fonts.googleapis.com"' in old: return bd.new_head(old)
    patched = old.replace('    <link href="https://fonts.googleapis.com/css2', '    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link href="https://fonts.googleapis.com/css2', 1)
    return bd.new_head(patched)


def light_hero(sec):
    out = bd.hero(sec)
    a = '<section class="hero" data-nav-theme="dark" data-glyphs="hero">'
    assert out.startswith(a)
    out = '<section class="hero hero--light" data-glyphs="right">' + out[len(a):]
    return out.replace('\n<div class="fade" aria-hidden="true"></div>', "")


def cta(sec, slug):
    """the shared CTA band; the Sales Navigator page has no lead line under its heading"""
    if "<p>" in sec: return bd.cta(sec, slug)
    out = bd.cta(sec.replace("</h2>", "</h2>\n    <p>@@</p>", 1), slug)
    out, k = re.subn(r'\n\s*<p class="cta-dark__lead" data-reveal>@@</p>', "", out); assert k == 1
    return out


def privacy_tail(old):
    """the cookie banner with the consent script (which also runs the revoke and grant buttons of this page) byte-identical, then Leadboxer;
    the old nav-dropdown script goes"""
    a = old.index("<!-- Cookie Consent Banner -->")
    b = old.index("</script>", old.index("// Mobile menu", a)) + len("</script>")
    return old[a:b] + "\n" + bd.tail(old)


def page_specific(name, c):
    c = re.sub(r'<p style="margin-top: (?:24|32)px;">', '<p class="content-note">', c)
    if name.startswith("blog/"):
        # the related posts in a grid, like the related resources
        rs = c.index('<section class="related">'); re_ = rs + bd.top_level(c[rs:], True)[0][1]
        sec = c[rs:re_]
        h = re.search(r"<h3>.*?</h3>", sec, re.S).group(0)
        cards = re.findall(r'<a href="[^"]+" class="related-card">.*?</a>', sec, re.S)
        assert len(cards) == 3, name
        # 22-10 (SEO round): the service page that fits the post, as a fourth card
        svc = {"blog/cold-email-open-rate-vanity-metric.html": ("/outbound-agency", "Service", "Outbound agency: cold email, LinkedIn and Clay as one system"),
               "blog/cold-email-warmup-schedule.html": ("/cold-email-agency-amsterdam", "Service", "Cold email agency: infrastructure, warmup and campaigns, run for you"),
               "blog/finding-prospects-not-in-apollo.html": ("/clay-agency", "Service", "Clay agency: custom sourcing and enrichment for hard ICPs")}[name]
        cards.append(f'<a href="{svc[0]}" class="related-card"><div class="related-card-meta">{svc[1]}</div><h4>{svc[2]}</h4></a>')
        cards = [re.sub(r'<a href="(?!/|https?:)([^"]+)"', lambda m: f'<a href="{"/" + m.group(1)[3:] if m.group(1).startswith("../") else "/blog/" + m.group(1)}"', x) for x in cards]
        sec = '<section class="related">\n    ' + h + '\n    <div class="related-grid">\n        ' + "\n        ".join(cards) + "\n    </div>\n</section>"
        c = c[:rs] + sec + c[re_:]
        c = c.replace('href="../blog/"', 'href="/blog"')
        c = bd.glyph_wrap(c, '<section class="related">', "corners")
        # the inline signup: same dark card and form as the email gates
        c = c.replace('<button type="submit">Subscribe</button>', '<button type="submit" class="btn-accent"><span class="txt">Subscribe</span>' + bd.ICON_E + "</button>")
    if name.startswith("resources/"):
        c = c.replace('href="../resources"', 'href="/resources"')
        c = re.sub(r'<a href="(?!/|https?:|#)([a-z0-9-]+)" class="related-card">', r'<a href="/resources/\1" class="related-card">', c)
        c = bd.glyph_wrap(c, '<section class="content">', "bottom", nth=1)   # the email gate
        if '<section class="related">' in c: c = bd.glyph_wrap(c, '<section class="related">', "corners")
    if '<div class="hero-meta' in c:   # the dots between the meta pills are separators, not pills
        a = c.index('<div class="hero-meta'); b = c.index("</div>", a)
        c = c[:a] + c[a:b].replace("<span>·</span>", '<span class="sep" aria-hidden="true">·</span>') + c[b:]
    if name == "blog/finding-prospects-not-in-apollo.html":   # the waterfall order in words (no arrow glyphs in the copy)
        a = "(Findymail → Datagma → Apollo → Hunter verification)"
        assert c.count(a) == 1
        c = c.replace(a, "(Findymail, then Datagma, then Apollo, then Hunter verification)")
    if name == "privacy.html":
        old = '<button class="revoke-btn" id="grant-btn" style="background: var(--accent); color: #fff; margin-left: 8px;">Toestemming geven</button>'
        assert old in c
        c = c.replace(old, '<button class="revoke-btn revoke-btn--grant" id="grant-btn">Toestemming geven</button>')
        c = c.replace('<button class="revoke-btn" id="revoke-btn">', '<button class="revoke-btn" id="revoke-btn" type="button">').replace('id="grant-btn">', 'id="grant-btn" type="button">')
    assert 'style="' not in re.sub(r'<section class="hero[^>]*>.*?</section>', "", c, flags=re.S).replace('style="--i:', ""), (name, re.findall(r'style="[^"]*"', c)[:3])
    return c


def build(name):
    old = subprocess.run(["git", "-C", str(ROOT), "show", f"{SRC_REV}:case-study-showcase/{name}"], capture_output=True, text=True, check=True).stdout
    slug = re.search(r'utm_content=([a-z0-9-]+)" target="_blank" class="nav-cta"', old).group(1)
    nav = bd.NAV.replace("utm_content=homepage", "utm_content=" + slug)
    doc_open = old[: old.index("<head>")].replace('<html lang="en">', '<html lang="en" data-theme="light">', 1).replace('<html lang="nl">', '<html lang="nl" data-theme="light">', 1)
    assert 'data-theme="light"' in doc_open
    i = old.index("</nav>") + len("</nav>")
    if '<div class="mobile-menu" id="mobileMenu">' in old[i:i + 400]:
        mm = old.index('<div class="mobile-menu" id="mobileMenu">', i); i = mm + bd.top_level(old[mm:], True)[0][1]
    j = old.index('<footer class="premium-footer">')
    c = old[i:j].strip("\n")
    hs = c.index('<section class="hero">'); he = hs + bd.top_level(c[hs:], True)[0][1]
    c = c[:hs] + light_hero(c[hs:he]) + c[he:]
    if '<section class="cta-section">' in c:
        cs = c.index('<section class="cta-section">'); ce = cs + bd.top_level(c[cs:], True)[0][1]
        c = c[:cs] + cta(c[cs:ce], slug) + c[ce:]
    c = bd.strip_reveal(c)
    c = bd.buttons(c)
    c = bd.email_labels(c)
    c = c.replace('href="../index"', 'href="/"')
    c = page_specific(name, c)
    bad = [x for x in ("→", "✓", "★", "pill-text-wrap", 'class="reveal', "transition-delay") if x in c]
    assert not bad, (name, bad)
    kind = "docs docs--post" if name.startswith("blog/") else "docs docs--legal" if name == "privacy.html" else "docs docs--res"
    body = "\n".join([f'<body class="{kind}">', bp.VEIL, bp.NOSCRIPT, bp.SKIP, "", bp.SPRITE.rstrip("\n"), "", nav, "", '<main id="main">', c, "</main>", "", bd.FOOTER,
                      '<script defer src="/subscribe-form.js"></script>   <!-- 20-10: the signup forms on this page post to /api/subscribe inline, like on every other page -->', ""])
    body += (privacy_tail(old) if name == "privacy.html" else bd.tail(old)) + "\n</body>\n</html>\n"
    return doc_open + new_head(old, name) + "\n" + body


if __name__ == "__main__":
    write = "--write" in sys.argv
    names = [a for a in sys.argv[1:] if not a.startswith("--")] or PAGES
    out_dir = _here / "docs2-out"; out_dir.mkdir(exist_ok=True)
    for name in names:
        new = build(name)
        target = (ROOT / name) if write else (out_dir / name.replace("/", "__"))
        target.write_text(new, encoding="utf-8"); print(f"{name:45s} -> {len(new):6d} bytes {'(written)' if write else ''}")
