"""One-off conversion (20-10-2026, night audit) of the eight case-study detail pages to the site design system.
Copy stays as it is; head trackers, JSON-LD, Prospect Pro/Stairoids, the cookie banner and the Leadboxer block stay byte-for-byte
(the head is taken over with only the old fonts, the vault stylesheet and the inline styles swapped for the site stylesheets);
nav, sprite, veil and footer come from index.html. New: the client logo in the hero, a Watch the story button where the client
has a video testimonial (same lightbox as the homepage), the counters carry their end value in the HTML.
Reads the OLD pages from git (SRC_REV), so it can be re-run; writes to scripts/case-out/ unless --write is given."""
import re, sys, html, pathlib, subprocess
import importlib.util
_spec = importlib.util.spec_from_file_location("build_pages", pathlib.Path(__file__).parent / "build-inner-pages.py")
bp = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(bp)

ROOT = bp.ROOT
SRC_REV = "fada808"
SLUGS = ["endresz", "gen-zero", "jamezz", "mistertafel", "redfox", "verzendbazen", "wetaxus", "zano"]
NEXT_ORDER = ["gen-zero", "zano", "verzendbazen", "jamezz", "mistertafel", "endresz", "tpn", "sankore", "sustainable-motion", "advantive", "redfox", "wetaxus"]   # the written cases in the order of the Cases page, then the ones with a video (22-10: plus the four new video cases); the last points back to the first
# 22-10: the four cases written from the video testimonials (build-case-pages-extra.py) are not in git's old pages; their titles and logos live here so Next case can point at them
EXTRA_TITLES = {"tpn": "How TPN got <b>500+ positive replies</b> from cold email", "sankore": "Validation before scale: <b>a clear ICP</b> for Sankore Labs",
                "sustainable-motion": "From loose Excel lists to <b>one HubSpot system</b> for Sustainable Motion", "advantive": "The outbound partner behind <b>a go-to-market consultancy</b>"}
EXTRA_LOGOS = {"tpn": ("/assets/img/logos-web/tpn-sm-v3.webp", "TPN", "315", "120"), "sankore": ("/assets/img/logos-web/sankore-sm.webp", "Sankore Labs", "400", "49"),
               "sustainable-motion": ("/assets/img/logos-web/sustainable-motion-sm.webp", "Sustainable Motion", "339", "120"), "advantive": ("/assets/img/logos-web/advantive-sm-v2.webp", "Advantive Advisory", "363", "143")}
# 22-10 (Bing: "many of your page titles are too short"): what the case delivered, in the title
CASE_TITLES = {"endresz": "Endresz Case Study: 247 Boutique Conversations Across Europe | closed:in", "gen-zero": "Gen-Zero Case Study: 142 Opportunities in 13 Weeks | closed:in",
               "jamezz": "Jamezz Case Study: 81 Leads from an Unreachable ICP | closed:in", "mistertafel": "Mistertafel Case Study: 96 Opportunities in 30 Days | closed:in",
               "redfox": "Red Fox Case Study: 33 Opportunities, 8.47% Reply Rate | closed:in", "verzendbazen": "Verzendbazen Case Study: 78 Opportunities, 13.9% Reply Rate | closed:in",
               "wetaxus": "WeTaxus Case Study: Two Channels into a Hard Market | closed:in", "zano": "Zano Case Study: 2,253 Verified Buyers from 17,000 Domains | closed:in"}
# 22-10 (SEO round): the service page that fits each case, linked under Next case
SERVICE = {"endresz": ("/outbound-agency", "Outbound agency"), "gen-zero": ("/cold-email-agency-amsterdam", "Cold email agency, NL and EU"), "jamezz": ("/clay-agency", "Clay agency"),
           "mistertafel": ("/cold-email-agency-amsterdam", "Cold email agency, NL and EU"), "redfox": ("/outbound-agency-uk", "Outbound agency UK"), "verzendbazen": ("/cold-email-agency-amsterdam", "Cold email agency, NL and EU"),
           "wetaxus": ("/gtm-engineering-agency", "GTM engineering agency"), "zano": ("/clay-agency", "Clay agency"), "tpn": ("/outbound-agency", "Outbound agency"),
           "sankore": ("/gtm-engineering-agency", "GTM engineering agency"), "sustainable-motion": ("/clay-agency", "Clay agency"), "advantive": ("/outbound-agency-us", "Outbound agency US")}
INDEX = bp.INDEX

HEAD_LINKS = '''    <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-latin-wght-normal.woff2" crossorigin>
    <link rel="stylesheet" href="/assets/vendor/lenis-1.3.26/lenis.css">
    <link rel="stylesheet" href="/assets/css/site.css">
    <link rel="stylesheet" href="/assets/css/pages.css">
    <link rel="stylesheet" href="/assets/css/case.css">
    <script defer src="/assets/js/veil.js"></script>
    <script defer src="/assets/vendor/gsap-3.15.0/gsap.min.js"></script>
    <script defer src="/assets/vendor/gsap-3.15.0/ScrollTrigger.min.js"></script>
    <script defer src="/assets/vendor/lenis-1.3.26/lenis.min.js"></script>
    <script defer src="/assets/js/site.js"></script>'''


def new_head(old):
    head = bp.between(old, "<head>", "</head>")
    vp = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    assert head.count(vp) == 1
    head = head.replace(vp, vp + "\n    <script>document.documentElement.classList.add('js')</script>", 1)
    head, k = re.subn(r'    <link rel="preconnect" href="https://fonts\.(?:googleapis|gstatic)\.com"(?: crossorigin)?>\n', "", head); assert k == 2, k
    head, k = re.subn(r'    <link href="https://(?:fonts\.googleapis\.com/css2|api\.fontshare\.com/v2/css)\?[^"]*" rel="stylesheet">\n', "", head); assert k == 2, k
    m = re.search(r'    <link rel="stylesheet" href="vault-premium\.css">', head); assert m, "vault link"
    head = head.replace(m.group(0), HEAD_LINKS)
    head = re.sub(r"\n[ \t]*<style>.*?</style>", "", head, flags=re.S)
    assert "<style" not in head and "vault-premium" not in head and "fontshare" not in head
    return head


def text(s):
    return re.sub(r"\s+", " ", s).strip()


def wall_logo(slug):
    """the client logo, as the homepage wall shows it"""
    if slug in EXTRA_LOGOS: return EXTRA_LOGOS[slug]
    m = re.search(r'<a class="wcell[^"]*" href="case-study-' + re.escape(slug) + r'"><img src="([^"]+)" alt="([^"]*)" loading="lazy" width="(\d+)" height="(\d+)">', INDEX)
    assert m, slug
    return m.group(1), m.group(2), m.group(3), m.group(4)


def story_video(name):
    """Tella id, caption and poster of the client's story card on the homepage, if there is one"""
    m = re.search(r'<button class="story__poster" type="button" data-open-video data-tella-id="([^"]+)" data-aspect="16/9" data-caption="([^"]*' + re.escape(name) + r'[^"]*)"><span class="sr-only">[^<]*</span><img src="([^"]+)"', INDEX, re.I)
    return (m.group(1), m.group(2), m.group(3)) if m else None


def case_title(slug):
    """the headline of a case page as its hero shows it (two tones: <b> for the strong part)"""
    if slug in EXTRA_TITLES: return EXTRA_TITLES[slug]
    old = subprocess.run(["git", "-C", str(ROOT.parent), "show", f"{SRC_REV}:case-study-showcase/case-study-{slug}.html"], capture_output=True, text=True, check=True).stdout
    h1 = re.search(r"<h1>(.*?)</h1>", re.search(r'<section class="hero" id="hero">(.*?)</section>', old, re.S).group(1), re.S).group(1)
    h1 = re.sub(r'<span class="gradient">(.*?)</span>', r"<b>\1</b>", h1, flags=re.S)
    h1 = re.sub(r'<span class="fade-up"[^>]*>', "", h1).replace("</span>", " ")
    h1 = text(h1).replace(" </b>", "</b> ").replace("<b> ", " <b>")
    return re.sub(r"\s+", " ", h1).strip()


# 22-10 (Max): the cases Instantly featured link to that LinkedIn post, on the card and under the quote
EXT_POSTS = {'gen-zero': 'https://www.linkedin.com/posts/max-m%C3%BCnstermann-instantly-case-study-ugcPost-7470923379399901184-qDbT/', 'jamezz': 'https://www.linkedin.com/posts/max-m%C3%BCnstermann-instantly-case-study-ugcPost-7379479814598180864-dqWC/'}
EXT_LABEL = 'Featured by Instantly as a case study'


def ext_line(slug):
    u = EXT_POSTS.get(slug)
    if not u: return ""
    return (f'<a class="case-quote__ext ipill beam" href="{u}" target="_blank" rel="noopener"><img class="ipill__bolt" src="/assets/img/logos-web/instantly-bolt.webp" alt="" width="52" height="64">'
            f'<span>Instantly case study</span><svg class="ipill__ne" aria-hidden="true"><use href="#i-ne"/></svg></a>')


POSTER = '        <button class="phero__media story__poster hero-in" style="--i:5" type="button" data-open-video data-tella-id="{tid}" data-aspect="16/9" data-caption="{cap}" data-poster="{poster}"><span class="sr-only">Play video: {cap}</span><img src="{poster}" width="880" height="495" alt="" decoding="async" fetchpriority="high"><span class="story__shade" aria-hidden="true"></span><img class="story__brand" src="{logo}" alt="" width="{lw}" height="{lh}" loading="lazy" decoding="async"><span class="play" aria-hidden="true"><svg><use href="#i-play"/></svg></span></button>'


def next_case(slug):
    """20-10: a card to the next case before the call to action, so a reader goes on to another story"""
    n = NEXT_ORDER[(NEXT_ORDER.index(slug) + 1) % len(NEXT_ORDER)]
    src, alt, w, h = wall_logo(n)
    return (f'<section class="psec case-next" aria-label="Next case">\n    <div class="container">\n'
            f'        <a class="case-next__card" href="/case-study-{n}" data-reveal><span class="case-next__top"><span class="case-next__label">Next case</span>'
            f'<img class="case-next__logo" src="{src}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async"></span>'
            f'<span class="case-next__title">{case_title(n)}</span><span class="case-next__go">Read the case<svg aria-hidden="true"><use href="#i-e"/></svg></span></a>\n'
            f'        <p class="case-next__links"><a class="case-next__all" href="/case-studies">All case studies</a><span class="case-next__sep" aria-hidden="true">&middot;</span><span class="case-next__svc">Service: <a class="case-next__all" href="{SERVICE[slug][0]}">{SERVICE[slug][1]}</a></span></p>\n    </div>\n</section>')


def counter(el_inner, attrs):
    """old counters start at 0 and count up; the site's counters carry the end value in the HTML"""
    cnt = re.search(r'data-count="([^"]+)"', attrs)
    if not cnt:
        return attrs.strip(), text(el_inner)
    pre = re.search(r'data-prefix="([^"]*)"', attrs); suf = re.search(r'data-suffix="([^"]*)"', attrs); dec = re.search(r'data-decimals="([^"]*)"', attrs)
    val = cnt.group(1)
    if dec: val = f"{float(val):.{int(dec.group(1))}f}"
    elif re.fullmatch(r"\d{4,}", val): val = f"{int(val):,}"
    end = (pre.group(1) if pre else "") + val + (suf.group(1) if suf else "")
    a = f'data-count="{cnt.group(1)}"' + (f' data-prefix="{pre.group(1)}"' if pre else "") + (f' data-suffix="{suf.group(1)}"' if suf else "") + (f' data-decimals="{dec.group(1)}"' if dec else "")
    return a, end


def build(slug):
    name = f"case-study-{slug}.html"
    old = subprocess.run(["git", "-C", str(ROOT.parent), "show", f"{SRC_REV}:case-study-showcase/{name}"], capture_output=True, text=True, check=True).stdout
    cta_slug = re.search(r'utm_content=([a-z0-9-]+)" target="_blank" class="nav-cta"', old).group(1)
    i = old.index("</nav>"); j = old.index('<footer class="premium-footer">')
    body = old[i:j]
    # ---- hero
    hero = re.search(r'<section class="hero" id="hero">(.*?)</section>', body, re.S).group(1)
    tags = re.findall(r'<span class="hero-tag">(.*?)</span>', hero)
    h1 = re.search(r"<h1>(.*?)</h1>", hero, re.S).group(1)
    h1 = re.sub(r'<span class="gradient">(.*?)</span>', r"<b>\1</b>", h1, flags=re.S)
    h1 = re.sub(r'<span class="fade-up"[^>]*>', "", h1).replace("</span>", " ")
    h1 = text(h1).replace(" </b>", "</b> ").replace("<b> ", " <b>")
    h1 = re.sub(r"\s+", " ", h1).strip()
    sub = text(re.search(r'<p class="hero-sub[^"]*"[^>]*>(.*?)</p>', hero, re.S).group(1))
    logo_src, logo_alt, lw, lh = wall_logo(slug)
    client = logo_alt
    vid = story_video({"redfox": "Red Fox", "wetaxus": "WeTaxus"}.get(slug, client))
    parts = [f'<section class="phero phero--light case-hero{" case-hero--video" if vid else ""}" id="hero" data-glyphs="right">', '    <div class="container phero__in">',
             f'        <a class="case-back hero-in" style="--i:0" href="/case-studies"><svg aria-hidden="true"><use href="#i-w"/></svg>Back to case studies</a>',
             f'        <div class="case-meta hero-in" style="--i:1"><img class="case-logo" src="{logo_src}" alt="{logo_alt}" width="{lw}" height="{lh}" decoding="async"><span class="case-tags">' + "".join(f'<span class="ptag">{t}</span>' for t in tags) + '</span></div>',
             f'        <h1 class="phero__title hero-in" style="--i:2">{h1}</h1>',
             f'        <p class="phero__lead hero-in" style="--i:3">{sub}</p>']
    if vid:
        tid, cap, poster = vid
        parts.append(f'        <div class="phero__actions hero-in" style="--i:4"><button class="btn-accent" type="button" data-open-video data-tella-id="{tid}" data-aspect="16/9" data-caption="{cap}" data-poster="{poster}"><span class="txt">Watch the story</span><span class="ico"><svg><use href="#i-play"/></svg></span></button></div>')
        # 22-10 (Max): the founder's face with a play button in the opening, the story card poster a size up
        parts.append(POSTER.format(tid=tid, cap=cap, poster=poster, logo=logo_src, lw=lw, lh=lh))
    parts += ["    </div>", "</section>"]
    out = ["\n".join(parts)]
    # ---- stats ribbon
    cells = re.findall(r'<div class="stat-cell"><div class="stat-num"([^>]*)>(.*?)</div><div class="stat-lbl">(.*?)</div></div>', body, re.S)
    assert len(cells) == 4, (slug, len(cells))
    st = []
    for attrs, inner, lbl in cells:
        a, end = counter(inner, attrs)
        st.append(f'            <div class="case-stat" data-reveal><b{(" " + a) if a else ""}>{end}</b><span>{text(lbl)}</span></div>')
    out.append('<section class="case-stats" aria-label="Key numbers">\n    <div class="container"><div class="case-stats__grid">\n' + "\n".join(st) + "\n    </div></div>\n</section>")
    # ---- the three content blocks, with the quote between solution and results
    blocks = [m for m in re.finditer(r'<div class="content">(.*?)\n</div>\n', body, re.S)]
    assert len(blocks) == 3, (slug, len(blocks))
    quote = re.search(r'<p class="quote-text">(.*?)</p>\s*<div class="quote-author">(.*?)</div>', body, re.S)
    glyphs = ["left", "right", "left"]
    for n, m in enumerate(blocks, 1):
        b = m.group(1)
        label = text(re.search(r'<div class="section-label">(.*?)</div>', b, re.S).group(1))
        title = text(re.search(r'<h2 class="section-title">(.*?)</h2>', b, re.S).group(1))
        sb = re.search(r'<div class="section-body">(.*?)</div>', b, re.S).group(1)
        ps = [text(p) for p in re.findall(r"<p[^>]*>(.*?)</p>", sb, re.S)]
        num, lab = (label.split(" ", 1) + [""])[:2]
        sec = [f'<section class="psec case-sec" aria-labelledby="case-sec-{n}" data-glyphs="{glyphs[n - 1]}">', '    <div class="container">',
               '        <div class="case-sec__grid">',
               f'            <div class="case-sec__head" data-reveal><p class="case-sec__label"><span>{num}</span>{lab}</p><h2 id="case-sec-{n}" class="h2">{title}</h2></div>',
               '            <div class="case-sec__body" data-reveal>' + "".join(f"<p>{p}</p>" for p in ps) + "</div>", "        </div>"]
        steps = re.findall(r'<div class="step-num">(.*?)</div>\s*<div><div class="step-title">(.*?)</div><div class="step-desc">(.*?)</div></div>', b, re.S)
        if steps:
            sec.append(f'        <div class="case-steps case-steps--{len(steps)}">' + "".join(f'<article class="case-step" data-reveal><span class="case-step__num">{text(sn)}</span><h3>{text(stt)}</h3><p>{text(sd)}</p></article>' for sn, stt, sd in steps) + "</div>")
        results = re.findall(r'<div class="result-val"([^>]*)>(.*?)</div>\s*<div class="result-lbl">(.*?)</div>', b, re.S)
        if results:
            rs = []
            for attrs, inner, lbl in results:
                a, end = counter(inner, attrs)
                rs.append(f'<div class="case-result" data-reveal><b{(" " + a) if a else ""}>{end}</b><span>{text(lbl)}</span></div>')
            sec.append('        <div class="case-results">' + "".join(rs) + "</div>")
        sec += ["    </div>", "</section>"]
        out.append("\n".join(sec))
        if n == 2 and quote:
            out.append(f'<section class="psec case-quote" aria-label="What the client says">\n    <div class="container">\n        <figure class="case-quote__card" data-reveal><svg class="case-quote__mark" aria-hidden="true" viewBox="0 0 32 24"><path d="M0 24V14C0 6 4 1 12 0l1 3c-4 1.4-6 4.4-6 8h5v13H0Zm19 0V14c0-8 4-13 12-14l1 3c-4 1.4-6 4.4-6 8h5v13H19Z" fill="currentColor"/></svg><blockquote>{text(quote.group(1))}</blockquote><figcaption>{text(quote.group(2))}</figcaption>{ext_line(slug)}</figure>\n    </div>\n</section>')
    # ---- call to action
    cta = re.search(r'<section class="bottom-cta">(.*?)</section>', body, re.S).group(1)
    h2 = text(re.search(r"<h2>(.*?)</h2>", cta, re.S).group(1)); lead = text(re.search(r"<p>(.*?)</p>", cta, re.S).group(1))
    a = re.search(r'<a href="([^"]+)" target="_blank" class="magnetic-btn"[^>]*>.*?<span class="pt-a">(.*?)</span>', cta, re.S)
    href = a.group(1).replace("&utm", "&amp;utm") if "&amp;" not in a.group(1) else a.group(1)
    out.append(next_case(slug))
    out.append(bp.cta_band(h2, lead, text(a.group(2)), href))
    main = "\n".join(out)
    bad = [x for x in ("→", "✓", "★", "pill-text-wrap", 'class="reveal', "transition-delay", "fade-up", "gradient") if x in main]
    assert not bad, (slug, bad)
    # ---- page
    doc_open = old[: old.index("<head>")].replace('<html lang="en">', '<html lang="en" data-theme="light">', 1)
    assert 'data-theme="light"' in doc_open
    if slug in CASE_TITLES:
        old_title = re.search(r"<title>(.*?)</title>", old).group(1)
        old = old.replace(f"<title>{old_title}</title>", f"<title>{CASE_TITLES[slug]}</title>").replace(f'<meta property="og:title" content="{old_title}">', f'<meta property="og:title" content="{CASE_TITLES[slug]}">')
    lightbox = bp.between(INDEX, '<dialog class="lightbox" id="lightbox"', "</dialog>") if vid else ""
    page = "\n".join(['<body class="case">', bp.VEIL, bp.NOSCRIPT, bp.SKIP, "", bp.SPRITE.rstrip("\n"), "", bp.nav_for(cta_slug), "", '<main id="main">', main, "</main>", "", bp.FOOTER, ""])
    if lightbox: page += lightbox + "\n"
    page += bp.tail_blocks(old) + "\n</body>\n</html>\n"
    return doc_open + new_head(old) + "\n" + page


if __name__ == "__main__":
    write = "--write" in sys.argv
    slugs = [a for a in sys.argv[1:] if not a.startswith("--")] or SLUGS
    out_dir = pathlib.Path(__file__).parent / "case-out"; out_dir.mkdir(exist_ok=True)
    for s in slugs:
        new = build(s)
        target = (ROOT / f"case-study-{s}.html") if write else (out_dir / f"case-study-{s}.html")
        target.write_text(new, encoding="utf-8"); print(f"case-study-{s:14s} -> {len(new):6d} bytes {'(written)' if write else ''}")
