"""One-off conversion (20-10-2026, night audit) of the six service and market landing pages to the site design system.
Copy stays as it is; head trackers, JSON-LD, Prospect Pro/Stairoids and the Leadboxer block stay byte-for-byte (the head is
taken over with only the old fonts, the vault stylesheet and the inline styles swapped for the site stylesheets); nav, sprite,
veil and footer come from index.html. The trust bar becomes the key numbers frame of the case pages, numbered cards become
numbered cells, the case spotlights become dark case cards with the client logo, the FAQ gets the homepage accordion, the
playbook signup block goes (the footer carries the same form).
Reads the OLD pages from git (SRC_REV), so it can be re-run; writes to scripts/landing-out/ unless --write is given."""
import re, sys, pathlib, subprocess
import importlib.util
_here = pathlib.Path(__file__).parent
_spec = importlib.util.spec_from_file_location("build_pages", _here / "build-inner-pages.py")
bp = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(bp)
_spec2 = importlib.util.spec_from_file_location("build_cases", _here / "build-case-pages.py")
bc = importlib.util.module_from_spec(_spec2); _spec2.loader.exec_module(bc)

ROOT = bp.ROOT
SRC_REV = "fada808"
SLUGS = ["clay-agency", "cold-email-agency-amsterdam", "cold-email-agency-saas", "gtm-engineering-agency", "outbound-agency-uk", "outbound-agency-us", "pricing"]   # pricing has the same build, with six sections and the three engagement shapes as tier cards
HEAD_LINKS = bc.HEAD_LINKS.replace('<link rel="stylesheet" href="/assets/css/case.css">', '<link rel="stylesheet" href="/assets/css/case.css">\n    <link rel="stylesheet" href="/assets/css/landing.css">')


# 22-10 (SEO round): the keyword that the page is for in its title and H1 (Max approved the strings in the plan); the rest of the copy is unchanged
OVERRIDES = {
    "gtm-engineering-agency": dict(title="GTM Engineering Agency | Go-to-Market as a System | closed:in", h1="GTM engineering agency: <b>go-to-market as a system</b>",
                                   lead="closed:in is a GTM engineering agency in Amsterdam. We engineer the full go-to-market system: enriched data, multi-channel outbound, CRM automation and pipeline analytics. The output is a repeatable revenue engine, built on infrastructure rather than headcount.",
                                   h2={"From manual sales<br>to engineered revenue.": "What is GTM engineering?<br>Go-to-market as a system."}),
    "cold-email-agency-saas": dict(title="Cold Email Agency for B2B SaaS | Qualified Demos from Your ICP | closed:in", h1="Cold email agency for B2B SaaS: <b>qualified demos from your exact ICP</b>"),
    "cold-email-agency-amsterdam": dict(title="Cold Email Agency Amsterdam: Dutch and European B2B | closed:in"),
    "pricing": dict(title="Pricing: Outbound from EUR 4K to 8K per Month | closed:in"),
}
# the sister services under every landing page (hub and spokes, 22-10)
RELATED = {"clay-agency": ["outbound-agency", "gtm-engineering-agency", "cold-email-agency-saas"], "cold-email-agency-amsterdam": ["outbound-agency", "outbound-agency-uk", "clay-agency"],
           "cold-email-agency-saas": ["outbound-agency", "clay-agency", "gtm-engineering-agency"], "gtm-engineering-agency": ["outbound-agency", "clay-agency", "cold-email-agency-saas"],
           "outbound-agency-uk": ["outbound-agency", "outbound-agency-us", "cold-email-agency-amsterdam"], "outbound-agency-us": ["outbound-agency", "outbound-agency-uk", "cold-email-agency-saas"],
           "pricing": ["outbound-agency", "clay-agency", "gtm-engineering-agency"]}
NAMES = {"outbound-agency": ("Outbound agency", "Cold email, LinkedIn and Clay as one system, for B2B in Europe, the UK and the US."), "gtm-engineering-agency": ("GTM engineering agency", "Go-to-market as a system: data, outbound, CRM and analytics."),
         "clay-agency": ("Clay agency", "Clay Solutions Partner: waterfalls, Claygent prompts and CRM orchestration."), "cold-email-agency-saas": ("Cold email for SaaS", "Qualified demos from your exact ICP for B2B SaaS."),
         "cold-email-agency-amsterdam": ("Cold email, NL and EU", "GDPR-proof cold email for Dutch and European B2B."), "outbound-agency-uk": ("Outbound agency UK", "Cold email and LinkedIn for UK pipeline."),
         "outbound-agency-us": ("Outbound agency US", "Outbound into the US mid-market, CAN-SPAM compliant.")}

def related_row(slug):
    cards = "".join(f'<a class="land-card land-card--link" href="{s}" data-reveal><h3>{NAMES[s][0]}<svg aria-hidden="true"><use href="#i-e"/></svg></h3><p>{NAMES[s][1]}</p></a>' for s in RELATED.get(slug, []))
    if not cards: return ""
    return ('<section class="psec land-sec land-related" aria-labelledby="land-related-title" data-glyphs="edges">\n    <div class="container">\n'
            '        <div class="land-head"><div data-reveal><p class="case-sec__label"><span>+</span>Also from closed:in</p><h2 id="land-related-title" class="h2">Related services.</h2></div></div>\n'
            f'        <div class="land-cards land-cards--3">{cards}</div>\n    </div>\n</section>')


def new_head(old):
    head = bc.new_head(old)
    return head.replace(bc.HEAD_LINKS, HEAD_LINKS, 1)


def text(s):
    return re.sub(r"\s+", " ", s).strip()


def arrowless(s):
    return text(s.replace("→", ""))


def label(n, s):
    return f'<p class="case-sec__label"><span>{n:02d}</span>{text(s)}</p>'


def build(slug):
    name = f"{slug}.html"
    old = subprocess.run(["git", "-C", str(ROOT.parent), "show", f"{SRC_REV}:case-study-showcase/{name}"], capture_output=True, text=True, check=True).stdout
    cta_slug = re.search(r'utm_content=([a-z0-9-]+)" target="_blank" class="nav-cta"', old).group(1)
    body = old[old.index('<section class="hero">'): old.index('<section class="footer-signup">')]
    # ---- hero
    hero = re.search(r'<section class="hero">(.*?)</section>', body, re.S).group(1)
    pill = text(re.search(r'<div class="hero-label[^"]*">(.*?)</div>', hero, re.S).group(1))
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", hero, re.S).group(1)
    h1 = text(re.sub(r'<span class="gradient">(.*?)</span>', r"<b>\1</b>", h1, flags=re.S))
    lead = text(re.search(r"</h1>\s*<p[^>]*>(.*?)</p>", hero, re.S).group(1))
    ov = OVERRIDES.get(slug, {})
    h1 = ov.get("h1", h1); lead = ov.get("lead", lead)
    btn = re.search(r'<a href="([^"]+)" target="_blank" class="btn-primary[^"]*"[^>]*>(.*?)</a>', hero, re.S)
    href = btn.group(1).replace("&utm", "&amp;utm")
    trust = re.findall(r'<div class="trust-num">(.*?)</div><div class="trust-lbl">(.*?)</div>', hero, re.S)
    assert len(trust) == 4, (slug, len(trust))
    video_flag = []
    out = ["\n".join([
        '<section class="phero phero--light land-hero" id="hero" data-glyphs="right">', '    <div class="container phero__in">',
        f'        <p class="phero__pill hero-in" style="--i:0"><i></i>{pill}</p>',
        f'        <h1 class="phero__title hero-in" style="--i:1">{h1}</h1>',
        f'        <p class="phero__lead hero-in" style="--i:2">{lead}</p>',
        f'        <div class="phero__actions hero-in" style="--i:3"><a class="btn-accent" href="{href}" target="_blank" rel="noopener"><span class="txt" data-letters>{arrowless(btn.group(2))}</span><span class="ico"><svg><use href="#i-e"/></svg></span></a><a class="land-btn-line" href="#proof"><span>See the results</span><svg aria-hidden="true"><use href="#i-s"/></svg></a></div>',
        '    </div>', '</section>'])]
    out.append('<section class="case-stats land-stats" aria-label="Key numbers">\n    <div class="container"><div class="case-stats__grid">\n'
               + "\n".join(f'            <div class="case-stat" data-reveal><b>{text(v)}</b><span>{text(l)}</span></div>' for v, l in trust)
               + "\n    </div></div>\n</section>")
    # ---- the four content sections
    secs = re.findall(r'<section class="section">(.*?)</section>', body, re.S)
    assert len(secs) in (4, 6), (slug, len(secs))
    glyphs = ["left", "right", "left", "right", "left", "corners"][-len(secs):] if len(secs) == 6 else ["left", "right", "left", "corners"]
    for n, s in enumerate(secs, 1):
        lab = re.search(r'<div class="section-label[^"]*">(.*?)</div>', s, re.S).group(1)
        h2 = text(re.search(r"<h2[^>]*>(.*?)</h2>", s, re.S).group(1))
        h2 = OVERRIDES.get(slug, {}).get("h2", {}).get(h2, h2)
        lead_m = re.search(r'<p class="lead[^"]*">(.*?)</p>', s, re.S)
        sid = f"land-sec-{n}"
        if "faq-list" in s:
            items = re.findall(r'<details class="faq-item">\s*<summary>(.*?)</summary>\s*<div class="faq-answer">(.*?)</div>\s*</details>', s, re.S)
            assert items, slug
            faq = "\n".join(f'            <details class="faq-item"{" open" if k == 0 else ""}>\n                <summary><span>{text(q)}</span><span class="pm" aria-hidden="true"><svg><use href="#i-plus"/></svg></span></summary>\n                <div class="faq-answer">{text(a)}</div>\n            </details>' for k, (q, a) in enumerate(items))
            out.append("\n".join([f'<section class="psec land-faq" id="faq" aria-labelledby="{sid}" data-glyphs="{glyphs[n - 1]}">', '    <div class="container faq__grid">',
                                  f'        <div class="faq__left" data-reveal>{label(n, lab)}<h2 id="{sid}" class="h2">{h2}</h2></div>',
                                  '        <div class="faq__list" data-reveal>', faq, '        </div>', '    </div>', '</section>']))
            continue
        head = f'<div class="land-head{" land-head--lead" if lead_m else ""}"><div data-reveal>{label(n, lab)}<h2 id="{sid}" class="h2">{h2}</h2></div>' + (f'<p class="land-head__lead" data-reveal>{text(lead_m.group(1))}</p>' if lead_m else "") + "</div>"
        sid_attr = 'id="proof" ' if "case-spotlight" in s else ""
        sec = [f'<section class="psec land-sec" {sid_attr}aria-labelledby="{sid}" data-glyphs="{glyphs[n - 1]}">', '    <div class="container">', f'        {head}']
        if "case-spotlight" in s:
            spots = re.findall(r'<a href="([^"]+)" class="case-spot[^"]*"[^>]*>(.*?)</a>', s, re.S)
            assert spots, slug
            cards = []
            for link, inner in spots:
                cslug = link.replace("case-study-", "")
                src, alt, w, h = bc.wall_logo(cslug)
                client = text(re.search(r'<div class="case-spot-client">(.*?)</div>', inner, re.S).group(1))
                t = text(re.search(r"<h3>(.*?)</h3>", inner, re.S).group(1)); p = text(re.search(r"<p>(.*?)</p>", inner, re.S).group(1))
                stats = re.findall(r'<div class="case-spot-stat-val">(.*?)</div><div class="case-spot-stat-lbl">(.*?)</div>', inner, re.S)
                # 20-10: the card is an article whose title link covers it, so a client with a video testimonial can have a Watch the story button
                # beside the link (no button inside a link); the video opens in the homepage lightbox
                vid = bc.story_video({"redfox": "Red Fox", "wetaxus": "WeTaxus"}.get(cslug, alt))
                play = ""
                if vid:
                    tid, cap, poster = vid; video_flag.append(1)
                    play = (f'<button class="land-case__play" type="button" data-open-video data-tella-id="{tid}" data-aspect="16/9" data-caption="{cap}" data-poster="{poster}">'
                            '<span class="land-case__play-ic" aria-hidden="true"><svg><use href="#i-play"/></svg></span>Watch the story</button>')
                cards.append(f'<article class="land-case" data-reveal><span class="land-case__top"><img class="land-case__logo" src="{src}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async"><span class="land-case__go" aria-hidden="true">Read the case<svg><use href="#i-e"/></svg></span></span>'
                             f'<span class="land-case__client">{client}</span><h3 class="land-case__title"><a class="land-case__link" href="{link}">{t}</a></h3><span class="land-case__desc">{p}</span>{play}'
                             f'<span class="land-case__stats">' + "".join(f"<span><b>{text(v)}</b><small>{text(l)}</small></span>" for v, l in stats) + "</span></article>")
            sec.append(f'        <div class="land-cases land-cases--{len(cards)}">' + "".join(cards) + "</div>")
        elif re.search(r'<div class="info-num">EUR', s):   # pricing: the three engagement shapes as tier cards, the middle one (where most engagements sit) drawn dark
            tiers = re.findall(r'<div class="info-card[^"]*"[^>]*>\s*<div class="info-num">(EUR[^<]*)</div>\s*<h3>(.*?)</h3>\s*<p[^>]*>(.*?)</p>\s*<p[^>]*>(.*?)</p>\s*</div>', s, re.S)
            assert len(tiers) == 3, (slug, len(tiers))
            cards = []
            for k, (price, name_, desc, inc) in enumerate(tiers):
                amount, per = (price.split("/", 1) + [""])[:2]
                inc = re.sub(r'<strong style="[^"]*">', "<strong>", text(inc))
                cards.append(f'<article class="land-tier{" land-tier--pop" if k == 1 else ""}" data-reveal><p class="land-tier__price"><b>{text(amount)}</b>' + (f"<small>/{per}</small>" if per else "") + f'</p><h3>{text(name_)}</h3><p class="land-tier__desc">{text(desc)}</p><p class="land-tier__inc">{inc}</p></article>')
            sec.append('        <div class="land-tiers">' + "".join(cards) + "</div>")
            note = re.search(r'<p style="text-align: center;[^"]*">(.*?)</p>', s, re.S)
            if note:
                note_html = re.sub(r'<a href="([^"]+)" style="[^"]*">', r'<a href="\1">', text(note.group(1)))
                sec.append(f'        <p class="land-note" data-reveal>{note_html}</p>')
        else:
            cards = re.findall(r'<div class="info-card[^"]*"[^>]*>\s*(?:<div class="info-num">(.*?)</div>\s*)?<h3>(.*?)</h3>\s*<p>(.*?)</p>\s*</div>', s, re.S)
            assert cards, (slug, n)
            if cards[0][0]:
                sec.append(f'        <div class="case-steps case-steps--{len(cards)}">' + "".join(f'<article class="case-step" data-reveal><span class="case-step__num">{text(num)}</span><h3>{text(t)}</h3><p>{text(p)}</p></article>' for num, t, p in cards) + "</div>")
            else:
                sec.append('        <div class="land-cards">' + "".join(f'<article class="land-card" data-reveal><h3>{text(t)}</h3><p>{text(p)}</p></article>' for _, t, p in cards) + "</div>")
        sec += ["    </div>", "</section>"]
        out.append("\n".join(sec))
    # ---- call to action
    cta = re.search(r'<section class="cta-section">(.*?)</section>', body, re.S).group(1)
    h2 = text(re.search(r"<h2>(.*?)</h2>", cta, re.S).group(1)); cl = text(re.search(r"<p>(.*?)</p>", cta, re.S).group(1))
    a = re.search(r'<a href="([^"]+)" target="_blank" class="btn-primary"[^>]*>.*?<span class="pt-a">(.*?)</span>', cta, re.S)
    if related_row(slug): out.append(related_row(slug))
    out.append(bp.cta_band(h2, cl, arrowless(a.group(2)), a.group(1).replace("&utm", "&amp;utm")))
    main = "\n".join(out)
    bad = [x for x in ("→", "✓", "★", "pill-text-wrap", 'class="reveal', "transition-delay", "gradient", "info-card", "case-spot") if x in main]
    assert not bad, (slug, bad)
    doc_open = old[: old.index("<head>")].replace('<html lang="en">', '<html lang="en" data-theme="light">', 1)
    assert 'data-theme="light"' in doc_open
    if "title" in ov:
        old_title = re.search(r"<title>(.*?)</title>", old).group(1)
        old = old.replace(f"<title>{old_title}</title>", f"<title>{ov['title']}</title>").replace(f'<meta property="og:title" content="{old_title}">', f'<meta property="og:title" content="{ov["title"]}">')
    page = "\n".join(['<body class="land">', bp.VEIL, bp.NOSCRIPT, bp.SKIP, "", bp.SPRITE.rstrip("\n"), "", bp.nav_for(cta_slug), "", '<main id="main">', main, "</main>", "", bp.FOOTER, ""])
    if video_flag: page += bp.between(bp.INDEX, '<dialog class="lightbox" id="lightbox"', "</dialog>") + "\n"
    page += bp.tail_blocks(old) + "\n</body>\n</html>\n"
    return doc_open + new_head(old) + "\n" + page


if __name__ == "__main__":
    write = "--write" in sys.argv
    slugs = [a for a in sys.argv[1:] if not a.startswith("--")] or SLUGS
    out_dir = _here / "landing-out"; out_dir.mkdir(exist_ok=True)
    for s in slugs:
        new = build(s)
        target = (ROOT / f"{s}.html") if write else (out_dir / f"{s}.html")
        target.write_text(new, encoding="utf-8"); print(f"{s:28s} -> {len(new):6d} bytes {'(written)' if write else ''}")
