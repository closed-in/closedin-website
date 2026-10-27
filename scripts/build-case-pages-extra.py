"""The four case pages written from the video testimonials (22-10-2026): TPN, Sankore Labs, Sustainable Motion, Advantive Advisory.
Same markup and styles as the eight generated cases (build-case-pages.py, case.css): light opening with logo and tags, Watch the story
(the testimonial in the homepage lightbox), key numbers, three sections, the client quote, result tiles, Next case, CTA band.
Head (trackers byte-identical), footer, cookie banner and Leadboxer come from case-study-endresz.html; only title, description,
canonical, preview tags and the JSON-LD are the page's own. Sources: the testimonial transcripts and the client files; numbers only
where they are in those files. Usage: python3 scripts/build-case-pages-extra.py [slug ...] [--write]"""
import re, sys, pathlib, html, importlib.util
_here = pathlib.Path(__file__).parent
_spec = importlib.util.spec_from_file_location("build_cases", _here / "build-case-pages.py")
bc = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(bc)
bp = bc.bp; ROOT = bp.ROOT; BASE = "https://www.closedin.io"
PUBLISHED = "2026-10-22"

CASES = {
"tpn": dict(
    client="True Performance Network", short="TPN", slug="tpn",
    title="TPN Case Study: 500+ Positive Replies from Cold Email | closed:in",
    description="Case study: how closed:in rebuilt TPN's cold email around a free first step for AI developers, from 12 replies on the first campaign to 466 interested prospects out of 7,128 in four weeks.",
    headline="TPN: 500+ positive replies from cold email after a first campaign that got 12",
    about="AI model compression and benchmarking platform for developers",
    keywords="cold email for developers, technical founders outbound, offer testing, signal-based outbound, AI tooling outbound",
    tags=["AI / LLM tooling", "Developers", "Cold email"],
    h1="How TPN got <b>500+ positive replies</b> from cold email",
    lead="True Performance Network (TPN) compresses, optimizes and benchmarks LLM models for developers and research teams: buyers who skip conferences and never show up in a LinkedIn filter. The first campaign in May got 12 replies on 2,919 emails. closed:in rebuilt the list around what those people had just published, replaced the pitch with a free first step, and the second campaign had 80 interested prospects within 24 hours.",
    video=("vid_cmvjj3y2500be02oq9qbb9m42", "Mikel Palokaj, True Performance Network", "/assets/img/stories/tpn-photo.webp"),
    uploaded="2026-10-22T12:40:00+00:00",  # Tella createdAt (UTC); Search Console 27-10: uploadDate needs a time zone
    stats=[("7,128", "Prospects since 16 Sept 2026"), ("762", "Replies, 10.7%"), ("466", "Interested, 1 in 15"), ("24 h", "To the first 80 interested")],
    sections=[
        dict(label="The challenge", title="A technical product, buyers who sit in no database", glyphs="left", paras=[
            "TPN serves developers and developer teams: people who compress, fine-tune and benchmark LLM models. As Mikel puts it, they do not go to conferences, and they do not sit in a LinkedIn title filter either. TPN knew what kind of customer it wanted. The open question was how to reach them.",
            "A previous outbound partner had tried, with a small LinkedIn campaign that got some traction but could not scale. When closed:in started in April 2026, TPN had four possible segments on paper and no proof which one would buy. The first campaign leaned on the obvious angle: cheaper than the big proxy providers. It went out to 2,919 prospects in May and came back with 12 replies and 4 interested. We paused it and went back to the drawing board."]),
        dict(label="The solution", title="Same inboxes, same client, a different offer", glyphs="right", paras=[
            "The relaunch on 16 September started from a signal instead of a title: people who had just published a model without benchmark scores. That is a moment, not a demographic. The offer became a free first step, closed:in runs the first benchmark for you, with a one-line call to action. Four segments, four campaigns, three plain-text emails, on the same 40 inboxes that had carried the May campaign.",
            "The list came from where those people publish, found and qualified by closed:in rather than exported from a database. What Mikel noticed was the digging: instead of asking TPN for a customer profile and buying a list against it, we went into what TPN does and built the list from the source itself."],
            steps=[("Signal sourcing", "A public source where every lead had just published a model. The timing is the hook: the email lands while the work is fresh."),
                   ("Four segments", "Four campaigns by what the person had published and who they are, so each segment could be read on its own instead of averaged away."),
                   ("Offer and copy", "No pitch on price. The first benchmark run for free, written as one question, in three plain-text steps."),
                   ("Infrastructure", "20 domains and 40 inboxes, warmed since April, 1,000 sends a day. Nothing new to build, everything to re-aim.")]),
        dict(label="The results", title="80 interested in 24 hours, 466 in four weeks", glyphs="left", paras=[
            "The first 24 hours brought 80 interested replies. After 17 days it was 309. On 13 October, four weeks in, Instantly showed 7,128 prospects contacted, 762 replies and 466 interested: one positive answer for every 15 people emailed, against 4 interested on 2,919 in May.",
            "For TPN the replies were more than pipeline. Mikel counts over 500 positive responses, each one a data point: wish lists, feedback on the business model, input on the platform. Real users uploaded models and requested benchmarks, which stress-tested the product and surfaced bugs the team would not have found without the outreach."],
            results=[("466", "Interested prospects out of 7,128"), ("1 in 15", "Positive reply per prospect emailed"), ("80", "Interested in the first 24 hours"), ("500+", "Positive replies as product feedback")]),
    ],
    quote=("I really like your hands-on approach. Digging in, trying to really understand the business and then finding creative ways to reach customers.", "Mikel Palokaj, Co-founder, True Performance Network"),
    cta=("Want results<br>like these?", "Book a free strategy call and discover how we can build a predictable outbound pipeline for your business.", "Book a 30 min call", "https://meeting.closedin.io/discovery-call?utm_source=closedin.io&amp;utm_medium=cta&amp;utm_content=case-study-tpn"),
),
"sankore": dict(
    client="Sankore Labs", short="Sankore Labs", slug="sankore",
    title="Sankore Labs Case Study: Clarity on ICP in the Discovery Phase | closed:in",
    description="Case study: how closed:in ran outbound as a discovery engine for Sankore Labs, a new developer matchmaking service, so the founders could validate the ICP and the offer before spending months on it.",
    headline="Sankore Labs: validation before scale for a new developer matchmaking service",
    about="Developer matchmaking: Nigerian engineering talent for European product teams",
    keywords="go-to-market validation, ICP validation, early-stage outbound, recruitment outbound, developer matchmaking",
    tags=["Developer matchmaking", "Early stage", "Email outbound"],
    h1="Validation before scale: <b>a clear ICP</b> for Sankore Labs",
    lead="Sankore Labs connects Nigerian engineers with European teams whose vibe-coded products need a backend that holds up under real customers. A new proposition, founders from another industry, no network and no inbound. closed:in ran outbound as a discovery engine: segments, messages and tests that told the founders what stuck, what did not, and when to pivot.",
    video=("vid_cmvjey1l0003c02qh4r8584ze", "Leva Konaté, Sankore Labs", "/assets/img/stories/sankore-photo.webp"),
    uploaded="2026-10-22T10:43:00+00:00",  # Tella createdAt (UTC); Search Console 27-10: uploadDate needs a time zone
    stats=[("New", "Proposition, no inbound yet"), ("ICP", "Sharpened before scaling"), ("A/B", "Messages tested per segment"), ("Weekly", "Decisions with the founders")],
    sections=[
        dict(label="The challenge", title="A new category, no network, no inbound", glyphs="left", paras=[
            "Leva Konaté and her co-founder Jonathan started Sankore Labs after meeting capable Nigerian developers and watching the rise of AI-assisted coding. Products built that way look finished fast, but the foundation underneath often is not. Sankore's engineers fix the backend so it does not break when customers arrive.",
            "Leva came from a different industry, so the network that normally brings a first wave of customers was not there. The founders had a go-to-market plan, in Leva's words not at the level a professional operation runs on. No inbound, no demos being booked, no teams getting up to speed with their engineers."]),
        dict(label="The approach", title="Outbound as a discovery engine", glyphs="right", paras=[
            "For a proposition this new, the first job of outbound is not volume. It is learning fast. closed:in set up the system together with the founders, close enough that questions about data, tools and who owns what were answered in the same week, and then used the campaigns to test the offer against real conversations.",
            "What stood out to Leva was the communication: meetings set quickly, replies the same day, and a partner who asks whether the results meet the goal instead of telling the founders what they want to hear."],
            steps=[("ICP sharpening", "Who the buyer is, what their pain points and jobs to be done are, and which questions tell a fit from a non-fit in the first reply."),
                   ("Message tests", "Different messages to different segments, read per segment, so the founders could see which proposition clicked with whom."),
                   ("Conversations over bookings", "In the discovery stage the goal was a conversation with the potential customer, not a demo at any cost."),
                   ("The honest read", "A third party that puts the goal on the table: are we getting the results we aimed for, and if not, what do we change?")]),
        dict(label="What it changed", title="A decision in weeks instead of months", glyphs="left", paras=[
            "The response was not the response the founders had hoped for, and that was the point. The campaigns showed which elements of the offer helped toward product-market fit and which did not, early enough to act on. As Leva says: it made them decide whether to continue with the same proposition or not.",
            "Without that read, the risk was months of money and time on a proposition that was a founder's baby rather than a customer's need. With it, Sankore pivoted and continued. Leva's advice to founders with a little go-to-market experience: it is not just setting up tools and starting a campaign. It is the ICP, the messages, the tests, and a strategic partner who thinks along."],
            results=[("Clarity", "On ICP and messaging in the discovery phase"), ("Pivot", "Informed by real replies, not assumptions"), ("Weeks", "To a decision instead of months"), ("Partner", "Who asks whether the goal is met")]),
    ],
    quote=("It brought about clarity in the early discovery phase. Definitely.", "Leva Konaté, Founder, Sankore Labs"),
    cta=("Want clarity<br>on your ICP?", "Book a free strategy call and find out whether your offer, your segments and your messaging hold up in real conversations.", "Book a 30 min call", "https://meeting.closedin.io/discovery-call?utm_source=closedin.io&amp;utm_medium=cta&amp;utm_content=case-study-sankore"),
),
"sustainable-motion": dict(
    client="Sustainable Motion", short="Sustainable Motion", slug="sustainable-motion",
    title="Sustainable Motion Case Study: 3,215 Contacts in One HubSpot System | closed:in",
    description="Case study: how closed:in turned Sustainable Motion's loose Excel lists into one HubSpot system with 2,121 organisations, 3,215 validated contacts and 252 new mobile numbers, ready for their own outreach.",
    headline="Sustainable Motion: from loose Excel lists to one HubSpot system with 3,215 contacts",
    about="Organiser of the Netherlands' sustainability career events",
    keywords="TAM build, list building, Clay enrichment, HubSpot setup, data project, career events",
    tags=["Career events", "Netherlands", "Data and CRM"],
    h1="From loose Excel lists to <b>one HubSpot system</b> for Sustainable Motion",
    lead="Sustainable Motion has organised the Netherlands' sustainability career events for sixteen years, two fairs a year. A small team, a warm network, and no capacity to find and approach cold organisations. closed:in rebuilt their market as one database: 2,121 organisations in three tiers, 3,215 validated contacts and 252 new mobile numbers, delivered in HubSpot so their own team runs the outreach.",
    video=("vid_cmvjm3i60033a02mb3hwagt3z", "Laura Wolf, Sustainable Motion", "/assets/img/stories/sustainable-motion-photo.webp"),
    uploaded="2026-10-22T14:03:00+00:00",  # Tella createdAt (UTC); Search Console 27-10: uploadDate needs a time zone
    stats=[("2,121", "Organisations in three tiers"), ("3,215", "Contacts, every email validated"), ("252", "New mobile numbers"), ("1", "HubSpot system instead of 8 Excel files")],
    sections=[
        dict(label="The challenge", title="Cold acquisition without a team for it", glyphs="left", paras=[
            "Sustainable Motion's exhibitors come from a client base built over sixteen years of projects: organisations that care about sustainability, many of them returning. New ones found the website or came through word of mouth. Cold organisations were another story. As event manager Laura Wolf says, finding cold leads, approaching them and calling them takes a lot of time, and a two-person team cannot put a department on it.",
            "The conversation started as an outbound retainer. The market is about a thousand organisations and the ticket size of a stand does not carry a monthly campaign budget, so we told them so and scoped what would work: a one-off data build that their own team could run outreach from."]),
        dict(label="The approach", title="One market, cleaned, sourced and tiered", glyphs="right", paras=[
            "First the existing file: eight Excel files with 66 tabs, merged to 1,226 rows and checked person by person against LinkedIn. 471 people still worked at the organisation in the file; 324 had moved on. Then the market itself, sourced from public lists such as the MVO Nederland members, the B Corp directory, SBTi and CDP, and tiered by how likely an organisation is to exhibit.",
            "The plan from July slipped: getting the TAM exactly right was harder than both sides expected, and Laura is honest that part of that was their own perfectionism. closed:in kept iterating with them without counting revision rounds. The delivery landed on 21 September 2026 in a HubSpot built to survive a downgrade to Starter: properties, one pipeline, lists and data, no automations that would vanish."],
            steps=[("Own file cleaned", "1,052 people checked against LinkedIn: 425 contacts with a valid personal address and 163 organisation addresses kept, the rest retired."),
                   ("Market sourced", "2,121 organisations from public sources and their own notes, in three tiers, with vacancy counts for 1,368 of them."),
                   ("Contacts found", "Up to three people per organisation in recruitment, HR, marketing and leadership: 3,215 validated emails, 2,790 of them new."),
                   ("Phones and HubSpot", "252 new mobile numbers, tier 1 first, and a HubSpot with lead statuses on the company and a deal pipeline that only fills when an organisation responds.")]),
        dict(label="The results", title="Thousands of new potential clients, and a way to work them", glyphs="left", paras=[
            "Sustainable Motion went from Excel lists that changed every year to one system their team works in. The tiering decides who gets an email only and who also gets a call, which matters when there are more contacts than a small team can phone.",
            "The outreach is theirs and it is still running. What they have in hand: 3,215 validated contacts at 2,121 organisations, 252 new mobile numbers, 1,368 organisations with vacancy data, and 316 with their own notes carried over. Laura's recommendation is for smaller organisations without the capacity to build a list, find the contact details and work out who to talk to: if you want new leads you then approach yourself, ask closed:in."],
            results=[("3,215", "Validated contacts"), ("2,790", "Emails found and validated"), ("252", "New mobile numbers"), ("21 Sept", "Delivered in HubSpot, 2026")]),
    ],
    quote=("I really noticed that you simply wanted to deliver quality and go all in for it.", "Laura Wolf, Event manager, Sustainable Motion (translated from Dutch)"),
    cta=("Need the list<br>before the outreach?", "Book a free strategy call and see what a cleaned, sourced and tiered market looks like for your team.", "Book a 30 min call", "https://meeting.closedin.io/discovery-call?utm_source=closedin.io&amp;utm_medium=cta&amp;utm_content=case-study-sustainable-motion"),
),
"advantive": dict(
    client="Advantive Advisory", short="Advantive Advisory", slug="advantive",
    title="Advantive Advisory Case Study: Outbound Partner to a GTM Consultancy | closed:in",
    description="Case study: how closed:in became the outbound delivery partner of Advantive Advisory, running list building, Clay enrichment and multi-channel campaigns for the consultancy and its clients in financial services, fintech and tech.",
    headline="Advantive Advisory: the outbound partner behind a go-to-market consultancy",
    about="Boutique go-to-market and B2B business development consultancy serving financial services, fintech and technology",
    keywords="outbound partner, white-label outbound, consultancy outbound, financial services outbound, multi-channel campaigns",
    tags=["Consultancy", "Financial services and fintech", "Multi-channel"],
    h1="The outbound partner behind <b>a go-to-market consultancy</b>",
    lead="Advantive Advisory is a boutique go-to-market and B2B business development consultancy with clients in financial services, fintech and technology. When it won more clients than it could service, founder Shirin Danesh brought in closed:in as the delivery partner: list building, Clay enrichment and multi-channel campaigns inside Advantive's own infrastructure, for Advantive and for its clients.",
    video=("vid_cmvjl3x7a005x02qa1bikghj8", "Shirin Danesh, Advantive Advisory", "/assets/img/stories/advantive-photo.webp"),
    uploaded="2026-10-22T13:36:00+00:00",  # Tella createdAt (UTC); Search Console 27-10: uploadDate needs a time zone
    stats=[("June 2026", "Partnership started, ongoing"), ("3", "Campaigns built and run"), ("2", "Channels, email and LinkedIn"), ("Weekly", "Iteration with the founder")],
    sections=[
        dict(label="The challenge", title="More clients than capacity", glyphs="left", paras=[
            "Advantive had just won a couple of clients and did not have the hands to service them. Shirin came to closed:in through mutual friends and a glowing reference. The bar was set by her own background: years in financial services and dozens of vendors, so she knows what good looks like.",
            "The ask was not a generic campaign. Advantive owns strategy, messaging and the sending infrastructure, and its clients expect the consultancy's standard. closed:in had to build and run inside that setup, to that standard, and keep it running week after week."]),
        dict(label="The setup", title="A partner model inside the client's own stack", glyphs="right", paras=[
            "closed:in builds the lists, enriches and verifies them in its own Clay workspace, and sets up and runs the campaigns in Advantive's infrastructure: Instantly for email, HeyReach for LinkedIn, around twenty domains and a hundred inboxes. Shirin signs off on every list and every line of copy before a launch.",
            "The rhythm is a weekly meeting and two-week campaign cycles: run, read, iterate on the data or the messaging. The target definition is by function and seniority band rather than job title, with cohorts kept apart so each one can be judged on its own. One lead source play scrapes the followers of relevant accounts and qualifies them in Clay."],
            steps=[("Lists from signals", "Followers of relevant accounts and other sources, qualified in Clay against function, seniority and tenure, in separate test cohorts."),
                   ("Enrichment and verification", "Email and LinkedIn data found and checked before anything is sent; data costs passed through at cost."),
                   ("Campaigns in the client's infra", "Built and launched in Advantive's Instantly and HeyReach, warmed for at least two weeks, plain text."),
                   ("Weekly iteration", "One meeting a week, a two-week cycle per campaign, and a change order per new client campaign.")]),
        dict(label="What it changed", title="Capacity, speed, and engagements that closed", glyphs="left", paras=[
            "Advantive could take on the clients it had won. What Shirin calls out is not the methodology but how the work ran: the professionalism from the first week, how problems were solved, and how engagements were closed. Her second point is speed: there is always something that goes wrong, and what matters is how fast it is fixed. She remembers Jurre taking his laptop on holiday to look after a live campaign.",
            "The partnership started in June 2026 and continues. Shirin recommends closed:in to anyone who needs lead generation."],
            results=[("3", "Campaigns for Advantive and its clients"), ("Weekly", "Meeting and a two-week cycle"), ("Ongoing", "Since June 2026"), ("Recommended", "To others who need lead gen")]),
    ],
    quote=("I have worked with so many vendors, so I know what good looks like. These guys just know how to run and lead an engagement.", "Shirin Danesh, Founder, Advantive Advisory"),
    cta=("Need a delivery partner<br>for your clients' outbound?", "Book a free strategy call and see how closed:in runs campaigns inside your stack, to your standard.", "Book a 30 min call", "https://meeting.closedin.io/discovery-call?utm_source=closedin.io&amp;utm_medium=cta&amp;utm_content=case-study-advantive"),
),
}

TEMPLATE = (ROOT / "case-study-endresz.html").read_text(encoding="utf-8")
QUOTE_SVG = '<svg class="case-quote__mark" aria-hidden="true" viewBox="0 0 32 24"><path d="M0 24V14C0 6 4 1 12 0l1 3c-4 1.4-6 4.4-6 8h5v13H0Zm19 0V14c0-8 4-13 12-14l1 3c-4 1.4-6 4.4-6 8h5v13H19Z" fill="currentColor"/></svg>'
esc = lambda s: html.escape(s, quote=True)

def head_for(c):
    """the Endresz head with its own title, description, canonical, preview tags and JSON-LD; the tracker block stays as it is"""
    h = bp.between(TEMPLATE, "<head>", "</head>")
    url = f"{BASE}/case-study-{c['slug']}"
    ld = f'''<script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@graph": [
        {{
          "@type": "Article",
          "@id": "{url}#article",
          "headline": {json_s(c["headline"])},
          "description": {json_s(c["description"])},
          "image": "{BASE}/assets/img/og/case-study-{c['slug']}-v1.jpg",
          "datePublished": "{PUBLISHED}",
          "dateModified": "{PUBLISHED}",
          "inLanguage": "en",
          "author": {{ "@type": "Organization", "name": "closed:in", "url": "{BASE}/" }},
          "publisher": {{ "@type": "Organization", "name": "closed:in", "logo": {{ "@type": "ImageObject", "url": "{BASE}/closedin-logo.png" }} }},
          "mainEntityOfPage": {{ "@type": "WebPage", "@id": "{url}" }},
          "about": {{ "@type": "Organization", "name": {json_s(c["client"])}, "description": {json_s(c["about"])} }},
          "keywords": {json_s(c["keywords"])},
          "articleSection": "Case study",
          "video": {{ "@type": "VideoObject", "name": {json_s("Client story: " + c["video"][1])}, "description": {json_s(c["client"] + " on working with closed:in, recorded for closedin.io.")}, "thumbnailUrl": "{BASE}{c['video'][2]}", "uploadDate": "{c['uploaded']}", "embedUrl": "https://www.tella.tv/video/{c['video'][0]}/embed" }}
        }},
        {{
          "@type": "BreadcrumbList",
          "itemListElement": [
            {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "{BASE}/" }},
            {{ "@type": "ListItem", "position": 2, "name": "Case studies", "item": "{BASE}/case-studies" }},
            {{ "@type": "ListItem", "position": 3, "name": {json_s(c["short"])}, "item": "{url}" }}
          ]
        }}
      ]
    }}
    </script>'''
    a = h.index("<title>"); b = h.index('<link rel="preload"')
    meta = f'''<title>{esc(c["title"])}</title>
    <meta name="description" content="{esc(c["description"])}">
    <link rel="canonical" href="{url}">
    <meta name="robots" content="index, follow">
    {ld}
    <meta property="og:type" content="article">
    <meta property="og:title" content="{esc(c["title"])}">
    <meta property="og:description" content="{esc(c["description"])}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{BASE}/assets/img/og/case-study-{c['slug']}-v1.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{esc(c["title"])}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{BASE}/assets/img/og/case-study-{c['slug']}-v1.jpg">
    '''
    return h[:a] + meta + h[b:]

def json_s(s):
    import json; return json.dumps(s, ensure_ascii=False)

def build(slug):
    c = CASES[slug]; src, alt, lw, lh = bc.EXTRA_LOGOS[slug]
    tid, cap, poster = c["video"]
    parts = ['<section class="phero phero--light case-hero case-hero--video" id="hero" data-glyphs="right">', '    <div class="container phero__in">',
             '        <a class="case-back hero-in" style="--i:0" href="/case-studies"><svg aria-hidden="true"><use href="#i-w"/></svg>Back to case studies</a>',
             f'        <div class="case-meta hero-in" style="--i:1"><img class="case-logo" src="{src}" alt="{alt}" width="{lw}" height="{lh}" decoding="async"><span class="case-tags">' + "".join(f'<span class="ptag">{t}</span>' for t in c["tags"]) + '</span></div>',
             f'        <h1 class="phero__title hero-in" style="--i:2">{c["h1"]}</h1>',
             f'        <p class="phero__lead hero-in" style="--i:3">{c["lead"]}</p>',
             f'        <div class="phero__actions hero-in" style="--i:4"><button class="btn-accent" type="button" data-open-video data-tella-id="{tid}" data-aspect="16/9" data-caption="{cap}" data-poster="{poster}"><span class="txt">Watch the story</span><span class="ico"><svg><use href="#i-play"/></svg></span></button></div>',
             bc.POSTER.format(tid=tid, cap=cap, poster=poster, logo=src, lw=lw, lh=lh),
             "    </div>", "</section>"]
    out = ["\n".join(parts)]
    out.append('<section class="case-stats" aria-label="Key numbers">\n    <div class="container"><div class="case-stats__grid">\n' + "\n".join(f'            <div class="case-stat" data-reveal><b>{v}</b><span>{l}</span></div>' for v, l in c["stats"]) + "\n    </div></div>\n</section>")
    for n, s in enumerate(c["sections"], 1):
        sec = [f'<section class="psec case-sec" aria-labelledby="case-sec-{n}" data-glyphs="{s["glyphs"]}">', '    <div class="container">', '        <div class="case-sec__grid">',
               f'            <div class="case-sec__head" data-reveal><p class="case-sec__label"><span>{n:02d}</span>{s["label"]}</p><h2 id="case-sec-{n}" class="h2">{s["title"]}</h2></div>',
               '            <div class="case-sec__body" data-reveal>' + "".join(f"<p>{p}</p>" for p in s["paras"]) + "</div>", "        </div>"]
        if s.get("steps"):
            sec.append(f'        <div class="case-steps case-steps--{len(s["steps"])}">' + "".join(f'<article class="case-step" data-reveal><span class="case-step__num">{i:02d}</span><h3>{t}</h3><p>{d}</p></article>' for i, (t, d) in enumerate(s["steps"], 1)) + "</div>")
        if s.get("results"):
            sec.append('        <div class="case-results">' + "".join(f'<div class="case-result" data-reveal><b>{v}</b><span>{l}</span></div>' for v, l in s["results"]) + "</div>")
        sec += ["    </div>", "</section>"]
        out.append("\n".join(sec))
        if n == 2:
            q, who = c["quote"]
            out.append(f'<section class="psec case-quote" aria-label="What the client says">\n    <div class="container">\n        <figure class="case-quote__card" data-reveal>{QUOTE_SVG}<blockquote>{q}</blockquote><figcaption>{who}</figcaption></figure>\n    </div>\n</section>')
    out.append(bc.next_case(slug))
    h2, lead, btn, href = c["cta"]
    out.append(bp.cta_band(h2, lead, btn, href))
    main = "\n".join(out)
    bad = [x for x in ("—", "–", "open rate", "Closed:in") if x in main]
    assert not bad, (slug, bad)
    doc_open = TEMPLATE[: TEMPLATE.index("<head>")]
    lightbox = bp.between(bp.INDEX, '<dialog class="lightbox" id="lightbox"', "</dialog>")
    page = "\n".join(['<body class="case">', bp.VEIL, bp.NOSCRIPT, bp.SKIP, "", bp.SPRITE.rstrip("\n"), "", bp.nav_for(f"case-study-{slug}"), "", '<main id="main">', main, "</main>", "", bp.FOOTER, ""])
    page += lightbox + "\n" + bp.tail_blocks(TEMPLATE) + "\n</body>\n</html>\n"
    return doc_open + "<head>" + head_for(c) + "</head>\n" + page

if __name__ == "__main__":
    write = "--write" in sys.argv
    slugs = [a for a in sys.argv[1:] if not a.startswith("--")] or list(CASES)
    out_dir = _here / "case-out"; out_dir.mkdir(exist_ok=True)
    for s in slugs:
        new = build(s)
        target = (ROOT / f"case-study-{s}.html") if write else (out_dir / f"case-study-{s}.html")
        target.write_text(new, encoding="utf-8"); print(f"case-study-{s:20s} -> {len(new):6d} bytes {'(written)' if write else ''}")
