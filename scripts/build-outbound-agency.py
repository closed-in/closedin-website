"""The outbound agency hub page (22-10-2026, SEO round): the non-geographic service page for "outbound agency", in the markup of the
six landing pages (landing.css, case.css), with the four market and niche pages (NL/EU, UK, US, SaaS) as its spokes. Head (trackers
byte-identical), footer, Leadboxer from outbound-agency-uk.html; own title, description, canonical, preview tags and JSON-LD
(Service, FAQPage, BreadcrumbList). Numbers are the ones already on the site. Usage: python3 scripts/build-outbound-agency.py"""
import re, json, html, pathlib, importlib.util
_here = pathlib.Path(__file__).parent
_spec = importlib.util.spec_from_file_location("build_cases", _here / "build-case-pages.py")
bc = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(bc)
bp = bc.bp; ROOT = bp.ROOT; BASE = "https://www.closedin.io"
SLUG = "outbound-agency"; URL = f"{BASE}/{SLUG}"
BOOK = "https://meeting.closedin.io/discovery-call?utm_source=closedin.io&amp;utm_medium=cta&amp;utm_content=outbound-agency"
TITLE = "Outbound Agency for B2B | Cold Email, LinkedIn and Clay as One System | closed:in"
DESC = "closed:in is an outbound agency in Amsterdam for B2B companies in Europe, the UK and the US: cold email, LinkedIn and Clay enrichment run as one system inside your CRM, with qualified meetings in 2-3 weeks."
esc = lambda s: html.escape(s, quote=True)
j = lambda s: json.dumps(s, ensure_ascii=False)

FAQ = [
    ("What does an outbound agency do?", "An outbound agency finds the companies that fit your ideal customer profile, finds and verifies the right people there, writes the outreach, runs it over email and LinkedIn from infrastructure it maintains, and hands the replies to your sales team as qualified meetings. closed:in does all of that as one managed system, wired into your CRM, with a weekly report on replies, opportunities and pipeline."),
    ("What does an outbound agency cost?", "closed:in engagements run from EUR 4K to EUR 8K per month, priced by the complexity of your ICP, the sending volume, the channels and how deep the CRM work goes. Clay enrichment, sending infrastructure, copy, reply handling and weekly reporting are included at every level. The pricing page explains the four drivers."),
    ("Outbound agency or hiring SDRs?", "An in-house SDR costs salary, tooling, data and management time, and takes months to ramp. An outbound agency brings the data, the infrastructure, the copy and the process on day one, and the first campaign is live in two to three weeks. Most clients use closed:in instead of a first SDR hire, or next to a small sales team that wants a steady flow of meetings."),
    ("Which channels does closed:in run?", "Cold email and LinkedIn, in one sequence, on infrastructure we set up and monitor: dedicated sending domains, warmed inboxes, SPF, DKIM and DMARC, deliverability checks. Lists come from Clay, with 120+ data providers in a waterfall, plus niche sources and buying signals that a database does not carry."),
    ("How fast do you deliver results?", "Setup takes two to three weeks: domains, inboxes, warmup, lists, copy, sequences. Most clients book their first qualified meeting within two to three weeks of launch. Our case studies document 78 to 247 opportunities per engagement."),
    ("Where do you run outbound?", "From Amsterdam, for B2B companies in the Netherlands, Belgium, the UK, the rest of Europe and the US. Copy is written in the language of the market, sending windows follow the recipient's time zone, and each market has its own page: cold email NL and EU, outbound UK, outbound US, cold email for SaaS."),
]

def case_card(slug, client, title, desc, stats, video=None):
    src, alt, w, h = bc.wall_logo(slug)
    play = ""
    if video:
        tid, cap, poster = video
        play = (f'<button class="land-case__play" type="button" data-open-video data-tella-id="{tid}" data-aspect="16/9" data-caption="{cap}" data-poster="{poster}">'
                '<span class="land-case__play-ic" aria-hidden="true"><svg><use href="#i-play"/></svg></span>Watch the story</button>')
    return (f'<article class="land-case" data-reveal><span class="land-case__top"><img class="land-case__logo" src="{src}" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async"><span class="land-case__go" aria-hidden="true">Read the case<svg><use href="#i-e"/></svg></span></span>'
            f'<span class="land-case__client">{client}</span><h3 class="land-case__title"><a class="land-case__link" href="case-study-{slug}">{title}</a></h3><span class="land-case__desc">{desc}</span>{play}'
            f'<span class="land-case__stats">' + "".join(f"<span><b>{v}</b><small>{l}</small></span>" for v, l in stats) + "</span></article>")

def main_html():
    out = []
    out.append("\n".join([
        '<section class="phero phero--light land-hero" id="hero" data-glyphs="right">', '    <div class="container phero__in">',
        '        <p class="phero__pill hero-in" style="--i:0"><i></i>Outbound agency for B2B</p>',
        '        <h1 class="phero__title hero-in" style="--i:1">Outbound agency for B2B: cold email, LinkedIn and Clay, <b>run as one system</b></h1>',
        '        <p class="phero__lead hero-in" style="--i:2">closed:in is an outbound agency in Amsterdam. We build and run the whole outbound engine for B2B companies in Europe, the UK and the US: the list, the enrichment, the copy, the sending infrastructure, the LinkedIn touches and the reply handling, inside your CRM. Qualified meetings on your calendar in two to three weeks, measured weekly.</p>',
        f'        <div class="phero__actions hero-in" style="--i:3"><a class="btn-accent" href="{BOOK}" target="_blank" rel="noopener"><span class="txt" data-letters>Book a 30 min call</span><span class="ico"><svg><use href="#i-e"/></svg></span></a><a class="land-btn-line" href="#proof"><span>See the results</span><svg aria-hidden="true"><use href="#i-s"/></svg></a></div>',
        '    </div>', '</section>']))
    out.append('<section class="case-stats land-stats" aria-label="Key numbers">\n    <div class="container"><div class="case-stats__grid">\n' + "\n".join(f'            <div class="case-stat" data-reveal><b>{v}</b><span>{l}</span></div>' for v, l in [("50+", "B2B clients"), ("1,000+", "Campaigns run"), ("20+", "Meetings a month, average"), ("2-3 wk", "To the first meeting")]) + "\n    </div></div>\n</section>")
    # 01 what an outbound agency does
    steps = [("List and signals", "Companies that fit your ICP, from Clay, niche directories and buying signals such as a new sales leader or a funding round. Not a database export."),
             ("Enrichment and verification", "The right people at those companies, with emails and LinkedIn profiles found through a waterfall of 120+ providers and verified before anything is sent."),
             ("Copy and sequences", "Plain-text emails and LinkedIn messages written per segment, from the signal that put the company on the list, tested weekly."),
             ("Infrastructure and replies", "Dedicated domains, warmed inboxes, deliverability monitoring, and every reply answered and routed into your CRM as a qualified opportunity.")]
    out.append("\n".join(['<section class="psec land-sec" aria-labelledby="land-sec-1" data-glyphs="left">', '    <div class="container">',
        '        <div class="land-head land-head--lead"><div data-reveal><p class="case-sec__label"><span>01</span>What an outbound agency does</p><h2 id="land-sec-1" class="h2">From a list<br>to a booked meeting.</h2></div><p class="land-head__lead" data-reveal>Outbound is four jobs that have to work together: who you contact, how you reach them, what you say, and what happens when they reply. Most teams buy a tool for each job and never wire them up. An outbound agency owns the chain end to end. closed:in builds it on Clay, Instantly and your CRM, and runs it for you.</p></div>',
        '        <div class="case-steps case-steps--4">' + "".join(f'<article class="case-step" data-reveal><span class="case-step__num">{i:02d}</span><h3>{t}</h3><p>{d}</p></article>' for i, (t, d) in enumerate(steps, 1)) + '</div>',
        '    </div>', '</section>']))
    # 02 what we run
    cards = [("Cold email outbound", "End-to-end campaigns: domains, inboxes, warmup, lists, copy, sending and reply handling. 98% deliverability across our client infrastructure."),
             ("LinkedIn outreach", "Connection requests and messages from your own profiles, in the same sequence as the email, so a prospect sees one conversation instead of two channels."),
             ("Clay enrichment and RevOps", "We are a Clay Solutions Partner. Waterfall enrichment, Claygent research, signal scoring and the sync into Close, HubSpot, Salesforce or Pipedrive."),
             ("Reporting and iteration", "A weekly report on replies, positive replies, opportunities and pipeline value, and a copy or list change every week based on it. 10% average reply rate across campaigns.")]
    out.append("\n".join(['<section class="psec land-sec" aria-labelledby="land-sec-2" data-glyphs="right">', '    <div class="container">',
        '        <div class="land-head"><div data-reveal><p class="case-sec__label"><span>02</span>What we run for you</p><h2 id="land-sec-2" class="h2">Every part of outbound,<br>as one engine.</h2></div></div>',
        '        <div class="land-cards">' + "".join(f'<article class="land-card" data-reveal><h3>{t}</h3><p>{p}</p></article>' for t, p in cards) + '</div>',
        '    </div>', '</section>']))
    # 03 markets: the spokes
    spokes = [("cold-email-agency-amsterdam", "Cold email agency, NL and EU", "GDPR-proof outbound for Dutch and European B2B companies, with the local market knowledge that cold email across borders needs."),
              ("outbound-agency-uk", "Outbound agency UK", "Cold email and LinkedIn for UK B2B companies and for European companies selling into London and the UK."),
              ("outbound-agency-us", "Outbound agency US", "Outbound into the US mid-market: CAN-SPAM compliant infrastructure, US time zones, European pricing."),
              ("cold-email-agency-saas", "Cold email agency for SaaS", "Qualified demos from your exact ICP for B2B SaaS founders and sales leaders.")]
    out.append("\n".join(['<section class="psec land-sec" aria-labelledby="land-sec-3" data-glyphs="left">', '    <div class="container">',
        '        <div class="land-head land-head--lead"><div data-reveal><p class="case-sec__label"><span>03</span>Where we run it</p><h2 id="land-sec-3" class="h2">One engine,<br>four markets.</h2></div><p class="land-head__lead" data-reveal>The system is the same everywhere. What changes is the language of the copy, the sending windows, the data sources and the rules. Each market has its own page with the details and the cases that match.</p></div>',
        '        <div class="land-cards land-cards--links">' + "".join(f'<a class="land-card land-card--link" href="{h}" data-reveal><h3>{t}<svg aria-hidden="true"><use href="#i-e"/></svg></h3><p>{p}</p></a>' for h, t, p in spokes) + '</div>',
        '    </div>', '</section>']))
    # 04 proof
    cases = [case_card("verzendbazen", "Verzendbazen · E-commerce · NL/BE", "78 opportunities with a 13.9% reply rate", "A complete outbound engine on Clay and Instantly for an e-commerce fulfilment provider, with EUR 1.56M in pipeline in eight weeks.", [("78", "Opportunities"), ("13.9%", "Reply rate"), ("€1.56M", "Pipeline")]),
             case_card("endresz", "Endresz · Creative agency · Multi-market", "247 boutique conversations across Europe", "A multi-market outbound system across NL, France, Poland and London, with localised messaging per market and USD 128K+ pipeline in six weeks.", [("247", "Conversations"), ("12%", "Reply rate"), ("$128K+", "Pipeline")], video=bc.story_video("Endresz"))]
    out.append("\n".join(['<section class="psec land-sec" id="proof" aria-labelledby="land-sec-4" data-glyphs="right">', '    <div class="container">',
        '        <div class="land-head"><div data-reveal><p class="case-sec__label"><span>04</span>Proof</p><h2 id="land-sec-4" class="h2">Documented pipeline,<br>case by case.</h2></div></div>',
        '        <div class="land-cases land-cases--2">' + "".join(cases) + '</div>',
        '        <p class="land-note" data-reveal>All eight written cases and six client videos are on the <a href="case-studies">case studies page</a>.</p>',
        '    </div>', '</section>']))
    # 05 faq
    faq = "\n".join(f'            <details class="faq-item"{" open" if k == 0 else ""}>\n                <summary><span>{q}</span><span class="pm" aria-hidden="true"><svg><use href="#i-plus"/></svg></span></summary>\n                <div class="faq-answer">{a}</div>\n            </details>' for k, (q, a) in enumerate(FAQ))
    out.append("\n".join(['<section class="psec land-faq" id="faq" aria-labelledby="land-sec-5" data-glyphs="corners">', '    <div class="container faq__grid">',
        '        <div class="faq__left" data-reveal><p class="case-sec__label"><span>05</span>Frequently asked</p><h2 id="land-sec-5" class="h2">Questions, answered.</h2></div>',
        '        <div class="faq__list" data-reveal>', faq, '        </div>', '    </div>', '</section>']))
    out.append(bp.cta_band("Ready to run outbound<br>as a system?", "Book a 30 minute discovery call. We will walk through your ICP, your channels and your CRM, and tell you whether closed:in is a fit.", "Book a 30 min call", BOOK))
    return "\n".join(out)

def head():
    src = (ROOT / "outbound-agency-uk.html").read_text(encoding="utf-8")
    h = bp.between(src, "<head>", "</head>")
    a = h.index("<title>"); b = h.index('<link rel="preload"')
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "@id": URL + "#service", "name": "Outbound agency for B2B", "serviceType": "Outbound sales agency", "description": DESC, "url": URL,
         "provider": {"@type": "Organization", "@id": BASE + "/#organization", "name": "closed:in", "url": BASE + "/"},
         "areaServed": [{"@type": "Country", "name": "Netherlands"}, {"@type": "Country", "name": "Belgium"}, {"@type": "Country", "name": "United Kingdom"}, {"@type": "Country", "name": "United States"}, {"@type": "Place", "name": "European Union"}],
         "offers": {"@type": "AggregateOffer", "priceCurrency": "EUR", "lowPrice": "4000", "highPrice": "8000", "offerCount": "3", "url": BASE + "/pricing"},
         "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Outbound services", "itemListElement": [{"@type": "Offer", "itemOffered": {"@type": "Service", "name": n, "url": BASE + "/" + u}} for n, u in [("Cold email agency, NL and EU", "cold-email-agency-amsterdam"), ("Outbound agency UK", "outbound-agency-uk"), ("Outbound agency US", "outbound-agency-us"), ("Cold email agency for SaaS", "cold-email-agency-saas"), ("Clay agency", "clay-agency"), ("GTM engineering agency", "gtm-engineering-agency")]]}},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/"}, {"@type": "ListItem", "position": 2, "name": "Outbound agency", "item": URL}]}]}
    meta = f'''<title>{esc(TITLE)}</title>
    <meta name="description" content="{esc(DESC)}">
    <link rel="canonical" href="{URL}">
    <meta name="robots" content="index, follow">
    <script type="application/ld+json">
    {json.dumps(ld, ensure_ascii=False, indent=2).replace(chr(10), chr(10) + "    ")}
    </script>
    <meta property="og:type" content="website">
    <meta property="og:title" content="{esc(TITLE)}">
    <meta property="og:description" content="{esc(DESC)}">
    <meta property="og:url" content="{URL}">
    <meta property="og:image" content="{BASE}/assets/img/og/{SLUG}-v1.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{esc(TITLE)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{BASE}/assets/img/og/{SLUG}-v1.jpg">
    '''
    return h[:a] + meta + h[b:], src

if __name__ == "__main__":
    h, src = head()
    main = main_html()
    bad = [x for x in ("—", "–", "open rate", "Closed:in", "→") if x in main]; assert not bad, bad
    doc_open = src[: src.index("<head>")]
    page = "\n".join(['<body class="land">', bp.VEIL, bp.NOSCRIPT, bp.SKIP, "", bp.SPRITE.rstrip("\n"), "", bp.nav_for(SLUG), "", '<main id="main">', main, "</main>", "", bp.FOOTER, ""])
    page += bp.between(bp.INDEX, '<dialog class="lightbox" id="lightbox"', "</dialog>") + "\n" + bp.tail_blocks(src) + "\n</body>\n</html>\n"
    (ROOT / f"{SLUG}.html").write_text(doc_open + "<head>" + h + "</head>\n" + page, encoding="utf-8"); print(f"{SLUG}.html written")
