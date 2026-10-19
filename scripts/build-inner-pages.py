"""Kept for reference: the one-off conversion (19-10-2026) of the inner pages (cases, resources, team, contact) to the homepage design system.
Keeps head trackers, JSON-LD, Prospect Pro/Stairoids, the cookie banner block and the Leadboxer block byte-for-byte;
takes the nav, sprite, veil and footer from index.html; rewrites only the page body markup, with the existing copy.
It reads the OLD page layout (vault-premium markup), so it does not run on the converted pages; use it as the map from old to new classes."""
import re, sys, html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")


def between(s, a, b, start=0, incl=True):
    i = s.index(a, start); j = s.index(b, i + len(a))
    return s[i: j + len(b)] if incl else s[i + len(a): j]


def strip_tags(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).strip()


# ---------- chrome from the homepage ----------
VEIL = between(INDEX, '<div class="veil on" id="veil"', '</div></div>')
NOSCRIPT = '<noscript><style>.veil { display: none !important; }</style></noscript>'
SKIP = '<a class="skip-link" href="#main">Skip to content</a>'
SPRITE = between(INDEX, '<svg width="0" height="0" style="position:absolute" aria-hidden="true">', '</svg>\n')
# the sprite contains nested <svg>? no: symbols only, so the first closing </svg> after the opening one ends it
assert SPRITE.count('<symbol') > 20, "sprite"
NAV = between(INDEX, '<header class="nav" id="nav" data-nav>', '</header>')
FOOTER = between(INDEX, '<footer class="footer theme-dark" id="contact-cta" data-nav-theme="dark">', '</footer>')
assert FOOTER.count('href="#hero"') == 1
FOOTER = FOOTER.replace('href="#hero"', 'href="#main"')
GRID = '<div class="cta-dark__grid" aria-hidden="true">' + '<i></i>' * 18 + '</div>'


def nav_for(slug):
    n = NAV.replace('<a href="#services">Services</a>', '<a href="/">Services</a>').replace('utm_content=homepage', 'utm_content=' + slug)
    assert 'href="#services"' not in n
    return n


HEAD_LINKS = '''    <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-latin-wght-normal.woff2" crossorigin>
    <link rel="stylesheet" href="/assets/vendor/lenis-1.3.26/lenis.css">
    <link rel="stylesheet" href="/assets/css/site.css">
    <link rel="stylesheet" href="/assets/css/pages.css">
    <script defer src="/assets/js/veil.js"></script>
    <script defer src="/assets/vendor/gsap-3.15.0/gsap.min.js"></script>
    <script defer src="/assets/vendor/gsap-3.15.0/ScrollTrigger.min.js"></script>
    <script defer src="/assets/vendor/lenis-1.3.26/lenis.min.js"></script>
    <script defer src="/assets/js/site.js"></script>
    <script defer src="/assets/js/pages.js"></script>'''


def new_head(old):
    head = between(old, "<head>", "</head>")
    head = head.replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <script>document.documentElement.classList.add(\'js\')</script>', 1)
    for l in ['    <link rel="preconnect" href="https://fonts.googleapis.com">\n', '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n',
              '    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">\n',
              '    <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet">\n']:
        head = head.replace(l, "")
    assert head.count('    <link rel="stylesheet" href="vault-premium.css">') == 1
    head = head.replace('    <link rel="stylesheet" href="vault-premium.css">', HEAD_LINKS)
    head = re.sub(r"\n[ \t]*<style>.*?</style>", "", head, flags=re.S)
    assert "<style" not in head and "vault-premium" not in head and "fontshare" not in head
    return head


def tail_blocks(old):
    """the protected blocks at the end of the body, byte-identical"""
    out = []
    if '<div class="cookie-banner" id="cookie-banner">' in old:
        out.append(between(old, '<div class="cookie-banner" id="cookie-banner">', "})();\n</script>"))
    i = old.index("<!-- Leadboxer"); i = old.rfind("\n", 0, i) + 1
    j = old.index('<script defer src="/subscribe-form.js"></script>', i) + len('<script defer src="/subscribe-form.js"></script>')
    out.append(old[i:j])
    return "\n".join(out)


def page(old, slug, main, extra_scripts=""):
    o = old
    doc_open = o[: o.index("<head>")].replace('<html lang="en">', '<html lang="en" data-theme="light">', 1)
    assert 'data-theme="light"' in doc_open
    body = "\n".join([
        "<body>", VEIL, NOSCRIPT, SKIP, "", SPRITE.rstrip("\n"), "", nav_for(slug), "", '<main id="main">', main.strip("\n"), "</main>", "", FOOTER, "",
    ])
    if extra_scripts: body += extra_scripts.strip("\n") + "\n"
    body += tail_blocks(o) + "\n</body>\n</html>\n"
    return doc_open + new_head(o) + "\n" + body


def cta_band(title_html, lead, btn_text, href, label_id="cta-title"):
    return f'''<section class="cta-dark theme-dark" data-nav-theme="dark" aria-labelledby="{label_id}">
    {GRID}
    <div class="container cta-dark__in">
        <h2 id="{label_id}" class="cta-dark__title" data-words>{title_html}</h2>
        <p class="cta-dark__lead" data-reveal>{lead}</p>
        <div class="cta-dark__actions" data-reveal>
            <a class="btn-accent" href="{href}" target="_blank" rel="noopener"><span class="txt" data-letters>{btn_text}</span><span class="ico"><svg><use href="#i-e"/></svg></span></a>
        </div>
    </div>
</section>'''


def hero(pill_html, title_html, lead_html, actions_html="", cue_html="", sec_id="hero"):
    parts = [f'<section class="phero" id="{sec_id}" data-nav-theme="dark" data-glyphs="hero">', '    <div class="container phero__in">',
             f'        <p class="phero__pill hero-in" style="--i:0">{pill_html}</p>',
             f'        <h1 class="phero__title hero-in" style="--i:1">{title_html}</h1>',
             f'        <p class="phero__lead hero-in" style="--i:2">{lead_html}</p>']
    if actions_html: parts.append(f'        <div class="phero__actions hero-in" style="--i:3">{actions_html}</div>')
    if cue_html: parts.append(f'        {cue_html}')
    parts += ['    </div>', '</section>', '<div class="fade" aria-hidden="true"></div>']
    return "\n".join(parts)


# ===================================================================== CASES
def build_cases(old):
    h = between(old, '<section class="hero" id="hero">', "</section>")
    pill = strip_tags(between(h, '<div class="hero-badge vault-pill">', "</div>"))
    lines = re.findall(r'<span class="line">(.*?)</span>\s*(?=<span class="line">|</h1>)', between(h, "<h1>", "</h1>"), re.S)
    l1, l2 = strip_tags(lines[0]), strip_tags(lines[1])
    lead = re.search(r"</h1>\s*<p>(.*?)</p>", h, re.S).group(1).strip()
    cta = strip_tags(re.search(r'<span class="pt-a">(.*?)</span>', h).group(1))
    m = between(old, '<section class="marquee-section">', "</section>")
    items = re.findall(r'<div class="marquee-item"><span class="num">(.*?)</span><span class="label">(.*?)</span></div>', m)
    assert len(items) == 10, len(items)
    stats = "".join(f'<span class="pstats__item"><span class="num">{n}</span><span class="label">{l}</span></span><i class="pstats__sep" aria-hidden="true"></i>' for n, l in items)
    sec = between(old, '<section class="cases-section" id="cases">', "</section>")
    label = strip_tags(between(sec, '<div class="label">', "</div>"))
    h2 = re.search(r"<h2>(.*?)</h2>", sec, re.S).group(1).strip()
    LOGO = {"Gen-Zero": ("/assets/img/logos-web/gen-zero-sm.webp", 240, 38, ""), "Zano": ("/zano-logo.svg", 0, 0, ""), "Verzendbazen": ("/assets/img/logos-web/verzendbazen-sm.webp", 240, 24, ""),
            "Jamezz": ("/assets/img/clients/jamezz-sm.png", 169, 96, ""), "Endresz": ("/assets/img/logos-web/endresz-sm.webp", 240, 49, ""), "Mistertafel": ("/assets/img/clients/mistertafel-sm.png", 98, 96, ""),
            "Redfox": ("/assets/img/clients/redfox-sm.png", 96, 96, " is-white"), "Wetaxus": ("/assets/img/logos-web/wetaxus-sm.webp", 205, 96, "")}
    cards = []
    for cm in re.finditer(r'<a href="([^"]+)" class="case-card[^>]*>(.*?)</a>', sec, re.S):
        href, c = cm.group(1), cm.group(2)
        alt = re.search(r'<img class="case-card-logo" src="[^"]+" alt="([^"]*)"', c).group(1)
        src, w, hh, white = LOGO[alt]
        dims = f' width="{w}" height="{hh}"' if w else ""
        word = re.search(r'<span style="[^"]*">([A-Z]{2,})</span>', between(c, '<div class="case-card-image"', '<div class="case-card-content">'))
        wordmark = f'<span class="wordmark">{word.group(1)}</span>' if word else ""
        tags = "".join(f'<span class="ptag">{t}</span>' for t in re.findall(r'<span class="case-card-tag">(.*?)</span>', c))
        h3 = re.search(r"<h3>(.*?)</h3>", c, re.S).group(1).strip()
        desc = re.search(r'<p class="desc">(.*?)</p>', c, re.S).group(1).strip()
        st = []
        for sm in re.finditer(r'<div><div class="case-card-stat-val"([^>]*)>(.*?)</div><div class="case-card-stat-lbl">(.*?)</div></div>', c):
            attrs, val, lbl = sm.group(1), sm.group(2), sm.group(3)
            dc = re.search(r'data-count="([^"]+)"', attrs); sf = re.search(r'data-suffix="([^"]+)"', attrs)
            if dc: val = dc.group(1) + (sf.group(1) if sf else ""); attrs = f' data-count="{dc.group(1)}"' + (f' data-suffix="{sf.group(1)}"' if sf else "")
            else: attrs = ""
            st.append(f'<div><div class="pcase__stat-val"{attrs}>{val}</div><div class="pcase__stat-lbl">{lbl}</div></div>')
        assert len(st) == 3, (href, st)
        cards.append(f'''        <a href="{href}" class="pcase spot" data-reveal>
            <div class="pcase__top"><span class="pcase__logo{white}"><img src="{src}" alt="{alt}"{dims} loading="lazy">{wordmark}</span><span class="alink__box" aria-hidden="true"><svg><use href="#i-ne"/></svg></span></div>
            <div class="pcase__tags">{tags}</div>
            <h3>{h3}</h3>
            <p class="desc">{desc}</p>
            <div class="pcase__stats">{"".join(st)}</div>
        </a>''')
    assert len(cards) == 8, len(cards)
    b = between(old, '<section class="bottom-cta">', "</section>")
    b_h2 = re.search(r"<h2>(.*?)</h2>", b, re.S).group(1).strip(); b_p = re.search(r"<p>(.*?)</p>", b, re.S).group(1).strip()
    b_href = re.search(r'<a href="([^"]+)"', b).group(1); b_btn = strip_tags(re.search(r'<span class="pt-a">(.*?)</span>', b).group(1))
    main = "\n".join([
        hero(f'<i aria-hidden="true"></i>{pill}', f'{l1}<br><b>{l2}</b>', lead, f'<a class="btn-accent" href="#cases"><span class="txt" data-letters>{cta}</span><span class="ico"><svg><use href="#i-s"/></svg></span></a>'),
        f'<section class="pstats" aria-label="Results"><div class="pstats__track">{stats}</div></section>',
        '<section class="psec" id="cases" aria-labelledby="cases-title" data-glyphs="right">', '    <div class="container">',
        f'        <div class="psec__head"><p class="eyebrow" data-reveal>{label}</p><h2 id="cases-title" class="h2 h2--xl" data-words>{h2}</h2></div>',
        '        <div class="pcases">', "\n".join(cards), "        </div>", "    </div>", "</section>",
        cta_band(b_h2, b_p, b_btn, b_href)])
    return page(old, "case-studies", main)


# ===================================================================== RESOURCES
def build_resources(old):
    h = between(old, '<section class="hero">', "</section>")
    pill = strip_tags(between(h, '<div class="hero-pill reveal">', "</div>"))
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S).group(1)
    h1 = re.sub(r'<span class="accent-word">(.*?)</span>', r"<b>\1</b>", h1)
    h1 = re.sub(r"<em[^>]*>(.*?)</em>", r"<b>\1</b>", h1)
    lead = re.search(r"</h1>\s*<p[^>]*>(.*?)</p>", h, re.S).group(1).strip()
    cue = strip_tags(between(h, '<div class="scroll-cue">', "</div>"))
    f = between(old, '<section class="filter-bar reveal">', "</section>")
    count = strip_tags(between(f, '<div class="filter-pill-label">', "</div>"))
    pills = re.findall(r'<button class="filter-pill( active)?" data-filter="([^"]+)"><span class="pill-text-wrap"><span class="pt-a">(.*?)</span>', f)
    pills_html = "".join(f'<button class="filter-pill{a}" type="button" data-filter="{d}">{t}</button>' for a, d, t in pills)
    v = between(old, '<section class="vault-section">', "</section>")
    cells = []
    for cm in re.finditer(r'<a href="([^"]+)" class="vault-cell[^"]*" data-cat="([^"]+)">(.*?)</a>', v, re.S):
        href, cat, c = cm.groups()
        icon = between(c, '<div class="vault-cell-icon', "</div></div>")
        inner = icon[icon.index(">") + 1: -len("</div></div>")]
        name = strip_tags(re.search(r"<strong>(.*?)</strong>", c, re.S).group(1))
        tag = strip_tags(re.search(r'<span class="tag">(.*?)</span>', c, re.S).group(1))
        h3 = re.search(r"<h3>(.*?)</h3>", c, re.S).group(1).strip()
        ptag = strip_tags(re.search(r'<span class="vault-popup-tag">(.*?)</span>', c, re.S).group(1))
        desc = re.search(r'</div>\s*<p>(.*?)</p>', c, re.S).group(1).strip()
        cta = strip_tags(re.search(r'<span class="vault-popup-cta">(.*?)<svg', c, re.S).group(1))
        cells.append(f'''        <a href="{href}" class="vault-cell pres" data-cat="{cat}" data-reveal>
            <div class="pres__top"><span class="pres__icon" aria-hidden="true">{inner}</span><span class="pres__tags"><span class="ptag">{tag}</span><span class="ptag ptag--accent">{ptag}</span></span></div>
            <p class="pres__name">{name}</p>
            <h3>{h3}</h3>
            <p class="pres__desc">{desc}</p>
            <span class="pres__cta">{cta}<span class="alink__box" aria-hidden="true"><svg><use href="#i-e"/></svg></span></span>
        </a>''')
    c = between(old, '<section class="cta-section">', "</section>")
    c_h2 = re.search(r"<h2>(.*?)</h2>", c, re.S).group(1).strip(); c_p = re.search(r"<p>(.*?)</p>", c, re.S).group(1).strip()
    form = between(c, "<form", "</form>")
    f_open = form[: form.index(">") + 1]
    ph = re.search(r'placeholder="([^"]*)"', form).group(1); btn = strip_tags(re.search(r'<button type="submit">(.*?)</button>', form).group(1))
    cta_html = f'''<section class="cta-dark theme-dark" data-nav-theme="dark" aria-labelledby="cta-title">
    {GRID}
    <div class="container cta-dark__in">
        <h2 id="cta-title" class="cta-dark__title" data-words>{c_h2}</h2>
        <p class="cta-dark__lead" data-reveal>{c_p}</p>
        {f_open.replace('class="cta-signup-form"', 'class="cta-signup-form pform" data-reveal')}
            <label><span class="sr-only">Email address</span><input type="email" name="email" placeholder="{ph}" autocomplete="email" required></label>
            <button type="submit" class="btn-accent"><span class="txt">{btn}</span><span class="ico"><svg><use href="#i-e"/></svg></span></button>
        </form>
    </div>
</section>'''
    main = "\n".join([
        hero(f'<img src="favicon-32.png" alt="" width="32" height="32">{pill}', h1, lead, "", f'<a class="phero__cue hero-in" style="--i:3" href="#vault">{cue}<svg aria-hidden="true"><use href="#i-s"/></svg></a>'),
        '<section class="psec" id="vault" aria-label="The closed:in Vault" data-glyphs="top">', '    <div class="container">',
        f'        <div class="pfilter" data-reveal><p class="pfilter__count"><img src="favicon-32.png" alt="" width="32" height="32">{count}</p><div class="pfilter__pills" role="group" aria-label="Filter resources">{pills_html}</div></div>',
        '        <div class="pvault">', "\n".join(cells), "        </div>", "    </div>", "</section>", cta_html])
    return page(old, "resources", main), len(cells)


# ===================================================================== TEAM
def build_team(old):
    h = between(old, '<section class="hero">', "</section>")
    pill = strip_tags(between(h, '<div class="hero-label reveal">', "</div>"))
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S).group(1)
    h1 = re.sub(r'<span class="gradient">(.*?)</span>', r"<b>\1</b>", h1)
    lead = re.search(r"</h1>\s*<p[^>]*>(.*?)</p>", h, re.S).group(1).strip()
    sec = between(old, '<section class="team-section">', "</section>")
    cards = []
    PHOTO = {"jurre.png": "/assets/team/jurre-640.webp", "max.png": "/assets/team/max-640.webp"}
    for c in sec.split('<div class="team-card reveal"')[1:]:
        img = re.search(r'<img src="([^"]+)" alt="([^"]*)"', c)
        if img:
            photo = f'<div class="pmember__photo"><img src="{PHOTO[img.group(1)]}" alt="{img.group(2)}" width="640" height="640" loading="lazy" decoding="async"></div>'
        else:
            soon = re.search(r'<div class="team-photo team-photo--soon" role="img" aria-label="([^"]+)">\s*<span aria-hidden="true">(.*?)</span>', c, re.S)
            photo = f'<div class="pmember__photo pmember__photo--soon" role="img" aria-label="{soon.group(1)}"><span aria-hidden="true">{soon.group(2)}</span></div>'
        name = strip_tags(between(c, '<div class="team-name">', "</div>")); role = between(c, '<div class="team-role">', "</div>", incl=False).strip()
        desc = between(c, '<div class="team-desc">', "</div>", incl=False).strip()
        tags = "".join(f'<span class="ptag">{t}</span>' for t in re.findall(r'<span class="team-tag">(.*?)</span>', c))
        soc = re.findall(r'(<a href="[^"]+" target="_blank" rel="noopener" aria-label="[^"]+"><svg viewBox="0 0 24 24">.*?</svg></a>)', c, re.S)
        soc_html = f'<div class="pmember__social">{"".join(soc)}</div>' if soc else ""
        cards.append(f'''        <article class="pmember" data-reveal>
            {photo}
            <div class="pmember__body">
                <div class="pmember__name">{name}</div>
                <div class="pmember__role">{role}</div>
                <div class="pmember__desc">{desc}</div>
                <div class="pmember__tags">{tags}</div>
                {soc_html}
            </div>
        </article>''')
    assert len(cards) == 4, len(cards)
    vs = between(old, '<section class="values-section">', "</section>")
    v_h2 = re.search(r"<h2>(.*?)</h2>", vs, re.S).group(1).strip()
    vals = re.findall(r'<div class="value-num">(.*?)</div>\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>', vs, re.S)
    vals_html = "".join(f'<div class="pvalue" data-reveal><div class="pvalue__num">{n}</div><h3>{t}</h3><p>{p}</p></div>' for n, t, p in vals)
    c = between(old, '<section class="cta-section">', "</section>")
    c_h2 = re.search(r"<h2>(.*?)</h2>", c, re.S).group(1).strip(); c_p = re.search(r"<p>(.*?)</p>", c, re.S).group(1).strip()
    c_href = re.search(r'<a href="([^"]+)"', c).group(1); c_btn = strip_tags(re.search(r'<span class="pt-a">(.*?)</span>', c).group(1)).replace(" →", "")
    main = "\n".join([
        hero(f'<i aria-hidden="true"></i>{pill}', h1, lead),
        '<section class="psec" id="team" aria-label="Team" data-glyphs="right">', '    <div class="container">', '        <div class="pteam">', "\n".join(cards), "        </div>", "    </div>", "</section>",
        '<section class="psec" aria-labelledby="values-title" data-glyphs="left">', '    <div class="container">',
        f'        <div class="psec__head"><h2 id="values-title" class="h2 h2--xl" data-words>{v_h2}</h2></div>',
        f'        <div class="pvalues">{vals_html}</div>', "    </div>", "</section>",
        cta_band(c_h2, c_p, c_btn, c_href)])
    return page(old, "team", main)


# ===================================================================== CONTACT
def build_contact(old):
    h1 = re.search(r'<h1 style="[^"]*">(.*?)</h1>', old).group(1)
    z = between(old, '<div class="zoom-container" id="zoomContainer">', "\n</div>\n")
    z = z.replace('<div class="zoom-container" id="zoomContainer">', '<section class="zoom-container" id="zoomContainer" data-nav-theme="dark" aria-label="Find us in Amsterdam">', 1)
    z = z[: z.rindex("</div>")] + "</section>"
    z = z.replace('fill="#7877C6"', 'fill="#72C1FF"')
    btn = re.search(r'<a href="([^"]+)" target="_blank" class="btn-primary" rel="noopener"><span class="pill-text-wrap"><span class="pt-a">(.*?)</span>.*?</a>', z, re.S)
    z = z.replace(btn.group(0), f'<a class="btn-accent" href="{btn.group(1)}" target="_blank" rel="noopener"><span class="txt">{btn.group(2).replace(" →", "")}</span><span class="ico"><svg><use href="#i-e"/></svg></span></a>')
    f = between(old, '<section class="contact-form-section">', "</section>")
    label = strip_tags(between(f, '<div class="contact-form-label">', "</div>"))
    h2 = re.search(r"<h2>(.*?)</h2>", f, re.S).group(1).strip(); lead = re.search(r'<p class="contact-form-lead">(.*?)</p>', f, re.S).group(1).strip()
    form = between(f, '<form class="contact-form"', "</form>")
    sub = re.search(r'<button type="submit" class="contact-form-submit">(.*?)</button>', form)
    form = form.replace(sub.group(0), f'<button type="submit" class="btn-accent contact-form-submit"><span class="txt">{sub.group(1)}</span><span class="ico"><svg><use href="#i-e"/></svg></span></button>')
    alt = re.search(r'<a href="([^"]+)" target="_blank" class="contact-form-alt" rel="noopener">(.*?)</a>', form)
    form = form.replace(alt.group(0), f'<a class="alink contact-form-alt" href="{alt.group(1)}" target="_blank" rel="noopener"><span class="alink__t">{alt.group(2)}</span><span class="alink__box" aria-hidden="true"><svg><use href="#i-ne"/></svg></span></a>')
    form = form.replace('<form class="contact-form"', '<form class="contact-form" data-reveal', 1)
    main = "\n".join([f'<h1 class="sr-only">{h1}</h1>', z,
        '<section class="psec pcontact" aria-labelledby="form-title" data-glyphs="corners">', '    <div class="container pcontact__grid">',
        f'        <div class="psec__head"><p class="eyebrow" data-reveal>{label}</p><h2 id="form-title" class="h2 h2--xl" data-words>{h2}</h2><p class="small" data-reveal>{lead}</p></div>',
        "        " + form, "    </div>", "</section>"])
    # the map scripts: Leaflet plus the zoom script, recoloured to the accent
    leaflet = '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>'
    s0 = old.index(leaflet); s1 = old.index("<script>", s0 + len(leaflet)); s2 = old.index("</script>", s1) + len("</script>")
    zoom = old[s1:s2]
    zoom = zoom.replace("rgba(180, 190, 255, ${alpha})", "rgba(150, 205, 255, ${alpha})").replace("rgba(200, 210, 255, ${alpha})", "rgba(219, 238, 255, ${alpha})")
    return page(old, "contact", main, extra_scripts=leaflet + "\n" + zoom)


if __name__ == "__main__":
    which = sys.argv[1:] or ["case-studies", "resources", "team", "contact"]
    for name in which:
        src = ROOT / f"{name}.html"; old = src.read_text(encoding="utf-8")
        if name == "case-studies": new = build_cases(old)
        elif name == "resources": new, n = build_resources(old); print("  vault cells:", n)
        elif name == "team": new = build_team(old)
        elif name == "contact": new = build_contact(old)
        out = pathlib.Path(sys.argv[0]).parent / f"out-{name}.html"
        out.write_text(new, encoding="utf-8"); print(name, "->", out, len(old), "->", len(new), "bytes")
