"""New blog post from one markdown file (22-10-2026, SEO round): builds the page in the site design from the latest existing post as
template, with Article schema (dates, author with LinkedIn), the breadcrumb, the preview tags and the feed link; adds the card to
blog/index.html at the top and the line to llms.txt; then rebuilds sitemap, feed and llms-full.txt. Finish with the preview image
(local server on 8080): node scripts/og-images.mjs /blog/<slug> && python3 scripts/set-og.py, then the checks.

Markdown file, front matter between --- lines, then the body:
---
title: What is GTM engineering? (and what a GTM engineering agency actually does)
slug: what-is-gtm-engineering
tag: GTM engineering
description: One or two sentences for Google and the preview card.
lead: The opening paragraph under the title (the answer, in two or three sentences).
date: 2026-10-29          (optional, today when missing)
author: Max               (optional)
related: /gtm-engineering-agency   (the service page in the Related row)
keywords: gtm engineering, go-to-market engineering   (optional)
---
## A heading
Paragraphs. **bold**, *italic*, [links](https://...), `code`.
- list items
1. numbered items
> a quote

Usage: python3 scripts/new-post.py <file.md> [--write]   (without --write: prints the page to scripts/posts-out/)"""
import re, sys, json, html, pathlib, datetime
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
BASE = "https://www.closedin.io"
TEMPLATE = ROOT / "blog/cold-email-warmup-schedule.html"
AUTHORS = {"Max": ("Max Münstermann", "Founder & Sales Lead", "https://www.linkedin.com/in/maxmunstermann"), "Jurre": ("Jurre Groot", "Co-founder", "https://www.linkedin.com/in/jurre-groot-04b7a11a1/")}
SERVICES = {"/outbound-agency": "Outbound agency: cold email, LinkedIn and Clay as one system", "/gtm-engineering-agency": "GTM engineering agency: go-to-market as a system",
            "/clay-agency": "Clay agency: waterfalls, Claygent prompts and CRM orchestration", "/cold-email-agency-amsterdam": "Cold email agency: infrastructure, warmup and campaigns, run for you",
            "/cold-email-agency-saas": "Cold email agency for B2B SaaS: qualified demos from your ICP", "/pricing": "Pricing: EUR 4K to 8K a month, priced by complexity"}

def front_matter(text):
    m = re.match(r"---\n(.*?)\n---\n(.*)$", text, re.S); assert m, "front matter missing"
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line: k, v = line.split(":", 1); meta[k.strip()] = v.strip()
    return meta, m.group(2).strip()

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s); s = re.sub(r"(?<![*\w])\*(?!\*)(.+?)\*(?!\*)", r"<em>\1</em>", s)
    s = re.sub(r"`(.+?)`", r"<code>\1</code>", s)
    s = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', s)
    s = re.sub(r"\[([^\]]+)\]\((/[^)]*)\)", r'<a href="\2">\1</a>', s)
    return s

def md_to_html(md):
    out, i, lines = [], 0, md.splitlines()
    while i < len(lines):
        line = lines[i].rstrip()
        if not line: i += 1; continue
        if line.startswith("## "): out.append(f"<h2>{inline(line[3:])}</h2>"); i += 1; continue
        if line.startswith("### "): out.append(f"<h3>{inline(line[4:])}</h3>"); i += 1; continue
        if line.startswith("> "):
            q = []
            while i < len(lines) and lines[i].startswith("> "): q.append(inline(lines[i][2:])); i += 1
            out.append("<blockquote><p>" + " ".join(q) + "</p></blockquote>"); continue
        if re.match(r"^[-*] ", line) or re.match(r"^\d+\. ", line):
            tag = "ol" if re.match(r"^\d+\. ", line) else "ul"; items = []
            while i < len(lines) and (re.match(r"^[-*] ", lines[i]) or re.match(r"^\d+\. ", lines[i])):
                item = re.sub(r"^([-*]|\d+\.) ", "", lines[i]); items.append(f"    <li>{inline(item)}</li>"); i += 1
            out.append(f"<{tag}>\n" + "\n".join(items) + f"\n</{tag}>"); continue
        p = []
        while i < len(lines) and lines[i].strip() and not re.match(r"^(## |### |> |[-*] |\d+\. )", lines[i]): p.append(lines[i].strip()); i += 1
        out.append(f"<p>{inline(' '.join(p))}</p>")
    return "\n\n".join(out)

def build(md_path, write):
    meta, body_md = front_matter(pathlib.Path(md_path).read_text(encoding="utf-8"))
    for k in ("title", "slug", "tag", "description", "lead"): assert meta.get(k), f"front matter needs {k}"
    slug, title, tag, desc, lead = meta["slug"], meta["title"], meta["tag"], meta["description"], meta["lead"]
    date = meta.get("date") or datetime.date.today().isoformat()
    d = datetime.date.fromisoformat(date); date_vis = f"{d.day} {d.strftime('%B %Y')}"
    name, job, linkedin = AUTHORS[meta.get("author", "Max")]
    related = meta.get("related", "/outbound-agency"); assert related in SERVICES, related
    body = md_to_html(body_md)
    words = len(re.sub(r"<[^>]+>", " ", body).split()); minutes = max(2, round(words / 220))
    for bad in ("—", "–", "open rate", "Closed:in", "→"):
        assert bad not in body + title + lead + desc, f"not allowed in copy: {bad}"
    url = f"{BASE}/blog/{slug}"
    t = TEMPLATE.read_text(encoding="utf-8")
    # head
    t = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title, quote=False)} | closed:in</title>", t, count=1)
    t = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{html.escape(desc, quote=True)}">', t, count=1)
    t = t.replace("https://www.closedin.io/blog/cold-email-warmup-schedule", url)
    t = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{html.escape(title, quote=True)} | closed:in">', t)
    t = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{html.escape(desc, quote=True)}">', t)
    t = re.sub(r'<meta property="og:image:alt" content="[^"]*">', f'<meta property="og:image:alt" content="{html.escape(title, quote=True)} | closed:in">', t)
    t = t.replace("/assets/img/og/blog-cold-email-warmup-schedule-v1.jpg", f"/assets/img/og/blog-{slug}-v1.jpg")
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "headline": title, "description": desc, "image": f"{BASE}/assets/img/og/blog-{slug}-v1.jpg", "datePublished": date, "dateModified": date, "inLanguage": "en",
         "author": {"@type": "Person", "name": name, "jobTitle": job, "url": f"{BASE}/team", "sameAs": [linkedin]},
         "publisher": {"@type": "Organization", "name": "closed:in", "logo": {"@type": "ImageObject", "url": f"{BASE}/closedin-logo.png"}},
         "mainEntityOfPage": url, "keywords": meta.get("keywords", tag.lower()), "articleSection": tag, "wordCount": words},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/"}, {"@type": "ListItem", "position": 2, "name": "Blog", "item": BASE + "/blog"}, {"@type": "ListItem", "position": 3, "name": title, "item": url}]}]}
    t = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: '<script type="application/ld+json">\n    ' + json.dumps(ld, ensure_ascii=False) + "\n    </script>", t, count=1, flags=re.S)
    # hero
    t = re.sub(r'(<div class="breadcrumb hero-in" style="--i:0">.*?/ <a href="/blog">Blog</a> / )[^<]*(</div>)', lambda m: m.group(1) + html.escape(tag, quote=False) + m.group(2), t, count=1, flags=re.S)
    t = re.sub(r'<span class="post-tag">[^<]*</span>\s*<span>[^<]*</span>\s*<span>·</span>\s*<span>[^<]*</span>\s*<span>·</span>\s*<span>by [^<]*</span>',
               f'<span class="post-tag">{html.escape(tag)}</span>\n            <span>{date_vis}</span>\n            <span>·</span>\n            <span>{minutes} min read</span>\n            <span>·</span>\n            <span>by {name.split()[0]}</span>', t, count=1)
    t = re.sub(r'<h1 class="hero-in" style="--i:2">.*?</h1>', f'<h1 class="hero-in" style="--i:2">{html.escape(title, quote=False)}</h1>', t, count=1, flags=re.S)
    t = re.sub(r'<p class="lead hero-in" style="--i:3">.*?</p>', f'<p class="lead hero-in" style="--i:3">{inline(lead)}</p>', t, count=1, flags=re.S)
    # article body: everything between <div class="article"> and the related section
    a = t.index('<div class="article">') + len('<div class="article">'); b = t.index("</div>\n</article>")
    signup = re.search(r'<div class="inline-signup">.*?</form>\s*</div>', t[a:b], re.S).group(0)
    paras = body.split("\n\n"); mid = max(1, len(paras) // 2)
    t = t[:a] + "\n" + "\n\n".join(paras[:mid]) + "\n\n" + signup + "\n\n" + "\n\n".join(paras[mid:]) + "\n" + t[b:]
    # related: the service card
    t = re.sub(r'(<a href=")(/[a-z-]+)(" class="related-card"><div class="related-card-meta">Service</div><h4>)[^<]*(</h4></a>)', lambda m: m.group(1) + related + m.group(3) + html.escape(SERVICES[related], quote=False) + m.group(4), t, count=1)
    # the three latest other posts in Related (the template carried its own), then the CTA band and nav get this post's utm_content
    idx_cards = re.findall(r'<a href="(/blog/[^"]+)" class="post-card">.*?<span class="post-tag">([^<]*)</span>.*?<h2>(.*?)</h2>', (ROOT / "blog/index.html").read_text(encoding="utf-8"), re.S)
    others = [c for c in idx_cards if c[0] != f"/blog/{slug}"][:3]
    post_cards = re.findall(r'<a href="/blog/[^"]+" class="related-card">.*?</a>', t, re.S)
    for old_card, (href, ptag, ptitle) in zip(post_cards, others):
        t = t.replace(old_card, f'<a href="{href}" class="related-card"><div class="related-card-meta">{html.escape(ptag)}</div><h4>{ptitle}</h4></a>', 1)
    t = t.replace("utm_content=blog-cold-email-warmup-schedule", f"utm_content=blog-{slug}").replace("utm_content=cold-email-warmup-schedule", f"utm_content={slug}")
    out = ROOT / f"blog/{slug}.html" if write else (pathlib.Path(__file__).parent / "posts-out" / f"{slug}.html")
    out.parent.mkdir(exist_ok=True); out.write_text(t, encoding="utf-8"); print(f"{out.relative_to(ROOT.parent)}: {words} words, {minutes} min")
    if not write: return
    # the card on the blog index, newest on top
    idx = ROOT / "blog/index.html"; it = idx.read_text(encoding="utf-8")
    card = (f'    <a href="/blog/{slug}" class="post-card">\n        <div class="post-meta">\n            <span class="post-tag">{html.escape(tag)}</span>\n            <span>{date_vis}</span>\n            <span>·</span>\n            <span>{minutes} min read</span>\n        </div>\n'
            f'        <h2>{html.escape(title, quote=False)}</h2>\n        <p>{html.escape(desc, quote=False)}</p>\n        <span class="post-cta">Read post<span class="alink__box" aria-hidden="true"><svg><use href="#i-e"/></svg></span></span>\n    </a>\n\n')
    if f'href="/blog/{slug}"' not in it:
        k = it.index('    <a href="/blog/'); it = it[:k] + card + it[k:]; idx.write_text(it, encoding="utf-8"); print("blog/index.html: card added")
    # llms.txt
    lp = ROOT / "llms.txt"; lt = lp.read_text(encoding="utf-8")
    if url not in lt:
        k = lt.index("Active posts include:"); k = lt.index("\n", k) + 1
        lt = lt[:k] + f'- ["{title}"]({url}): {desc}\n' + lt[k:]; lp.write_text(lt, encoding="utf-8"); print("llms.txt: line added")
    import subprocess
    for s in ("build-sitemap.py", "build-feed.py", "build-llms-full.py"): subprocess.run([sys.executable, str(pathlib.Path(__file__).parent / s)], check=True)
    print(f"next: node scripts/og-images.mjs /blog/{slug} && python3 scripts/set-og.py, then the checks; after the merge: node scripts/indexnow.mjs /blog/{slug}")

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    build(args[0], "--write" in sys.argv)
