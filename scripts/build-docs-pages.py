"""Reference copy (19-10-2026) of the one-off conversion of the eight Resources-menu pages (blog index, GTM stack, n8n workflows, playbook, ROI calculator, email verifier,
cold email templates, Clay waterfall) to the homepage design system.
Content markup and copy stay as they are (styled by assets/css/docs.css); head trackers, JSON-LD, Prospect Pro/Stairoids and the
Leadboxer block stay byte-for-byte; nav, sprite, veil and footer come from index.html with absolute links; the tool scripts are kept."""
import re, sys, pathlib, subprocess
import importlib.util
_spec = importlib.util.spec_from_file_location("build_pages", pathlib.Path(__file__).parent / "build-inner-pages.py")   # chrome (nav, footer, sprite, veil) and helpers
bp = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(bp)

ROOT = bp.ROOT
SRC_REV = "5e6b295"   # last commit with the old Resources-menu pages
PAGES = ["blog/index.html", "resources/gtm-stack.html", "resources/n8n-workflows.html", "playbook.html", "tools/roi-calculator.html",
         "tools/email-verifier.html", "resources/cold-email-templates.html", "resources/clay-waterfall.html"]
ABS_OK = re.compile(r'^(https?:|mailto:|tel:|/|#|data:)')


def absolutize(block):
    return re.sub(r'\b(href|src)="([^"]*)"', lambda m: m.group(0) if ABS_OK.match(m.group(2)) else f'{m.group(1)}="/{m.group(2)}"', block)


NAV = absolutize(bp.NAV).replace('href="#services"', 'href="/#services"')
FOOTER = absolutize(bp.FOOTER)
assert 'href="#services"' not in NAV and 'href="#hero"' not in FOOTER

HEAD_LINKS = '''    <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-latin-wght-normal.woff2" crossorigin>
    <link rel="stylesheet" href="/assets/vendor/lenis-1.3.26/lenis.css">
    <link rel="stylesheet" href="/assets/css/site.css">
    <link rel="stylesheet" href="/assets/css/docs.css">
    <script defer src="/assets/vendor/gsap-3.15.0/gsap.min.js"></script>
    <script defer src="/assets/vendor/gsap-3.15.0/ScrollTrigger.min.js"></script>
    <script defer src="/assets/vendor/lenis-1.3.26/lenis.min.js"></script>
    <script defer src="/assets/js/site.js"></script>'''

ICON_E = '<span class="ico"><svg><use href="#i-e"/></svg></span>'
CHECK = '<svg class="dcheck" aria-hidden="true"><use href="#i-check"/></svg>'
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


def new_head(old):
    head = bp.between(old, "<head>", "</head>")
    vp = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    assert head.count(vp) == 1
    head = head.replace(vp, vp + "\n    <script>document.documentElement.classList.add('js')</script>", 1)
    n0 = len(head)
    head, k = re.subn(r'    <link rel="preconnect" href="https://fonts\.(?:googleapis|gstatic)\.com"(?: crossorigin)?>\n', "", head)
    assert k == 2, k
    head, k = re.subn(r'    <link href="https://(?:fonts\.googleapis\.com/css2|api\.fontshare\.com/v2/css)\?[^"]*" rel="stylesheet">\n', "", head)
    assert k == 2, k
    m = re.search(r'    <link rel="stylesheet" href="(\.\./)?vault-premium\.css">', head)
    assert m, "vault link"
    head = head.replace(m.group(0), HEAD_LINKS)
    head = re.sub(r"\n[ \t]*<style>.*?</style>", "", head, flags=re.S)
    assert "<style" not in head and "vault-premium" not in head and "fontshare" not in head
    return head


def tail(old):
    i = old.index("<!-- Leadboxer"); i = old.rfind("\n", 0, i) + 1
    sf = '<script defer src="/subscribe-form.js"></script>'
    lb = 'leadboxer.com/?dataset=316eddd7dcb64c2d96481f90418a96c1"></script>'
    j = old.index(sf, i) + len(sf) if sf in old[i:] else old.index(lb, i) + len(lb)
    return old[i:j]


def top_level(s, first=False):
    """spans (start, end) of the top-level elements in an HTML fragment (first=True: stop after the first one)"""
    out, depth, start = [], 0, None
    for m in re.finditer(r"<!--.*?-->|<(/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>", s, re.S):
        if m.group(0).startswith("<!--"): continue
        close, tag, selfc = m.group(1), m.group(2).lower(), m.group(3)
        if close:
            depth -= 1
            if depth == 0:
                out.append((start, m.end()))
                if first: return out
        elif tag in VOID or selfc:
            if depth == 0:
                out.append((m.start(), m.end()))
                if first: return out
        else:
            if depth == 0: start = m.start()
            depth += 1
    assert depth == 0, "unbalanced fragment"
    return out


def add_attr(el, cls=None, attrs=""):
    """add a class and/or attributes to the opening tag of an element string"""
    m = re.match(r"<([a-zA-Z0-9]+)([^>]*)>", el)
    tag, rest = m.group(1), m.group(2)
    if cls:
        if re.search(r'\sclass="', rest): rest = re.sub(r'\sclass="([^"]*)"', lambda c: f' class="{c.group(1)} {cls}"', rest, count=1)
        else: rest = f' class="{cls}"' + rest
    return f"<{tag}{rest}{attrs}>" + el[m.end():]


def strip_reveal(s):
    """old IntersectionObserver reveals become the new data-reveal; the old inline delays go"""
    s = re.sub(r'\s*style="transition-delay:\s*[0-9.]+s;?"', "", s)
    s = re.sub(r'class="reveal"', "data-reveal", s)
    s = re.sub(r'class="([^"]*?) reveal"', r'class="\1" data-reveal', s)
    assert " reveal" not in re.sub(r"data-reveal", "", s) or True
    return s


def hero(sec):
    """the old hero keeps its content; children become the staggered hero entrance, the box gets the container"""
    sec = sec.replace('<div class="hero-bg"></div>', "").replace('<div class="hero-grid"></div>', "")
    sec = sec.replace('href="../index"', 'href="/"')
    sec = re.sub(r'\s*style="transition-delay:\s*[0-9.]+s;?"', "", sec)
    sec = re.sub(r'(class="[^"]*?) reveal"', r'\1"', sec).replace(' class="reveal"', "")
    o = sec.index(">") + 1; c = sec.rindex("</section>")
    inner = sec[o:c]
    if '<div class="hero-inner">' in inner:
        a = inner.index('<div class="hero-inner">'); b = a + len('<div class="hero-inner">')
        spans = top_level(inner[a:], True)
        end = a + spans[0][1]
        body = inner[b:end - len("</div>")]
    else:
        body = inner
    parts, kids = [], top_level(body)
    for k, (x, y) in enumerate(kids):
        parts.append("        " + add_attr(body[x:y], "hero-in", f' style="--i:{k}"'))
    out = '<section class="hero" data-nav-theme="dark" data-glyphs="hero">\n    <div class="hero-inner container">\n' + "\n".join(parts) + "\n    </div>\n</section>\n" + '<div class="fade" aria-hidden="true"></div>'
    return out


def buttons(s):
    """form buttons: the rolling-text pill becomes the accent button with the arrow, same label"""
    def btn(m):
        attrs, label = m.group(1), m.group(2)
        label = re.sub(r'<span class="pill-text-wrap"><span class="pt-a">(.*?)</span><span class="pt-b">.*?</span></span>', r"\1", label, flags=re.S).strip()
        assert "<" not in label, label
        return f'<button{attrs} class="btn-accent"><span class="txt">{label}</span>{ICON_E}</button>'
    return re.sub(r'<button( type="submit")>(.*?)</button>', btn, s, flags=re.S)


def email_labels(s):
    s = s.replace('aria-label=" (exact value)"', 'aria-label="Email address"')
    return re.sub(r'<input type="email" name="email" placeholder="([^"]*)" required>', r'<input type="email" name="email" placeholder="\1" autocomplete="email" aria-label="Email address" required>', s)


def cta(sec, slug):
    h2 = re.search(r"<h2>(.*?)</h2>", sec, re.S).group(1).strip()
    p = re.search(r"<p>(.*?)</p>", sec, re.S).group(1).strip()
    a = re.search(r'<a href="([^"]+)" target="_blank" class="btn-primary" rel="noopener"><span class="pill-text-wrap"><span class="pt-a">(.*?)</span>', sec)
    if a:
        return bp.cta_band(h2, p, a.group(2).replace(" →", "").strip(), a.group(1))
    form = bp.between(sec, "<form", "</form>")
    f_open = form[: form.index(">") + 1].replace('class="signup-form"', 'class="signup-form pform" data-reveal')
    ph = re.search(r'placeholder="([^"]*)"', form).group(1)
    label = re.search(r'<span class="pt-a">(.*?)</span>', form).group(1)
    return f'''<section class="cta-dark theme-dark" data-nav-theme="dark" aria-labelledby="cta-title">
    {bp.GRID}
    <div class="container cta-dark__in">
        <h2 id="cta-title" class="cta-dark__title" data-words>{h2}</h2>
        <p class="cta-dark__lead" data-reveal>{p}</p>
        {f_open}
            <label><span class="sr-only">Email address</span><input type="email" name="email" placeholder="{ph}" autocomplete="email" required></label>
            <button type="submit" class="btn-accent"><span class="txt">{label}</span>{ICON_E}</button>
        </form>
    </div>
</section>'''


def glyph_wrap(s, start_marker, preset, nth=0):
    """wraps the nth top-level block that starts with start_marker in a full-width glyph field"""
    idx = -1
    for _ in range(nth + 1): idx = s.index(start_marker, idx + 1)
    span = top_level(s[idx:], True)[0]
    block = s[idx: idx + span[1]]
    return s[:idx] + f'<div class="dglyph" data-glyphs="{preset}">\n' + block + "\n</div>" + s[idx + span[1]:]


def page_specific(name, c):
    if name == "blog/index.html":
        c = c.replace('<span class="post-cta">Read post →</span>', '<span class="post-cta">Read post<span class="alink__box" aria-hidden="true"><svg><use href="#i-e"/></svg></span></span>')
        assert "→" not in c
        # /blog/ redirects to /blog on Vercel (trailingSlash: false), so relative post links resolved to /<slug> (404 on the live site): absolute
        c = re.sub(r'<a href="(?!/|https?:)([^"]+)" class="post-card">', r'<a href="/blog/\1" class="post-card">', c)
        c = glyph_wrap(c, '<div class="posts">', "right")
    elif name == "tools/email-verifier.html":
        c = re.sub(r'<div class="hero-badge">✓ (.*?)</div>', lambda m: f'<div class="hero-badge">{CHECK}{m.group(1)}</div>', c)
        c = c.replace('<span class="check-icon">✓</span>', f'<span class="check-icon">{CHECK}</span>')
        assert "✓" not in c
        c = glyph_wrap(c, '<section class="info-section">', "right")
    elif name == "tools/roi-calculator.html":
        c = c.replace('<p style="margin-top: 24px;">', '<p class="assumptions__note">')
        c = glyph_wrap(c, '<section class="assumptions">', "right")
    elif name == "resources/n8n-workflows.html":
        c = c.replace('<img src="../logos/n8n.png" alt="n8n">', '<img src="../logos/n8n.png" alt="n8n" width="16" height="16">')
    elif name == "playbook.html":
        for a, b in [('<img src="verzendbazen-logo.png" alt="Verzendbazen">', '<img src="/assets/img/logos-web/verzendbazen-sm.webp" alt="Verzendbazen" width="240" height="24">'),
                     ('<img src="wetaxus-logo.png" alt="WeTaxus">', '<img class="is-tall" src="/assets/img/logos-web/wetaxus-sm.webp" alt="WeTaxus" width="205" height="96">'),
                     ('<img src="rewize-logo.png" alt="Rewize">', '<img src="/assets/img/logos-web/rewize-sm.webp" alt="Rewize" width="240" height="43">'),
                     ('<img src="zano-logo.svg" alt="Zano">', '<img class="is-tall" src="/zano-logo.svg" alt="Zano" width="512" height="512">')]:
            assert c.count(a) == 1, a
            c = c.replace(a, b)
    if name in ("resources/gtm-stack.html", "resources/n8n-workflows.html", "resources/cold-email-templates.html", "resources/clay-waterfall.html"):
        c = glyph_wrap(c, '<section class="content">', "bottom", nth=1)   # the email gate
    if name == "resources/cold-email-templates.html":
        c = glyph_wrap(c, '<section class="related">', "corners")
        a = c.index('<div class="hero-meta'); b = c.index("</div>", a)
        c = c[:a] + c[a:b].replace("<span>·</span>", '<span class="sep" aria-hidden="true">·</span>') + c[b:]
    if name == "playbook.html":
        c = glyph_wrap(c, '<section class="section">', "right", nth=1)
    return c


def build(name):
    old = subprocess.run(["git", "-C", str(ROOT), "show", f"{SRC_REV}:case-study-showcase/{name}"], capture_output=True, text=True, check=True).stdout   # the old page, from git
    slug = re.search(r'class="nav-cta"', old) and re.search(r'utm_content=([a-z0-9-]+)" target="_blank" class="nav-cta"', old).group(1)
    nav = NAV.replace("utm_content=homepage", "utm_content=" + slug)
    doc_open = old[: old.index("<head>")].replace('<html lang="en">', '<html lang="en" data-theme="light">', 1)
    assert 'data-theme="light"' in doc_open
    # content between the old nav (and the playbook's mobile menu) and the old footer
    i = old.index("</nav>") + len("</nav>")
    if '<div class="mobile-menu" id="mobileMenu">' in old[i:i + 400]:
        mm = old.index('<div class="mobile-menu" id="mobileMenu">', i); i = mm + top_level(old[mm:], True)[0][1]
    j = old.index('<footer class="premium-footer">')
    c = old[i:j].strip("\n")
    # hero
    hs = c.index('<section class="hero">'); he = hs + top_level(c[hs:], True)[0][1]
    c = c[:hs] + hero(c[hs:he]) + c[he:]
    # call to action band
    if '<section class="cta-section">' in c:
        cs = c.index('<section class="cta-section">'); ce = cs + top_level(c[cs:], True)[0][1]
        c = c[:cs] + cta(c[cs:ce], slug) + c[ce:]
    c = strip_reveal(c)
    c = buttons(c)
    c = email_labels(c)
    c = c.replace('href="../index"', 'href="/"')
    c = page_specific(name, c)
    bad = [x for x in ("→", "✓", "★", "pill-text-wrap", 'class="reveal', "transition-delay") if x in c]
    assert not bad, (name, bad)
    # scripts: the tool scripts stay (ROI calculator, email verifier); the old cursor glow, reveal and nav scripts go
    scripts = ""
    if name.startswith("tools/"):
        f_end = old.index("</footer>") + len("</footer>")
        s0 = old.index("<script>", f_end); s1 = old.index("</script>", s0) + len("</script>")
        assert "<!-- Leadboxer" not in old[f_end:s0]
        scripts = old[s0:s1]
    body = "\n".join(['<body class="docs">', bp.VEIL, bp.NOSCRIPT, bp.SKIP, "", bp.SPRITE.rstrip("\n"), "", nav, "", '<main id="main">', c, "</main>", "", FOOTER, ""])
    if scripts: body += scripts + "\n"
    body += tail(old) + "\n</body>\n</html>\n"
    return doc_open + new_head(old) + "\n" + body


if __name__ == "__main__":
    out_dir = pathlib.Path(__file__).parent / "docs-out"; out_dir.mkdir(exist_ok=True)   # review the output, then copy it over the pages
    for name in sys.argv[1:] or PAGES:
        new = build(name)
        out = out_dir / name.replace("/", "__")
        out.write_text(new, encoding="utf-8"); print(f"{name:40s} -> {len(new):6d} bytes")
