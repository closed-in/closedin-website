"""Builds blog/feed.xml (RSS 2.0) from the post cards on blog/index.html (22-10-2026): link, title, tag, date and summary per post,
newest first. Readers, aggregators and AI crawlers follow feeds for fresh content. Usage: python3 scripts/build-feed.py"""
import re, html, pathlib, datetime, email.utils
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
BASE = "https://www.closedin.io"
idx = (ROOT / "blog/index.html").read_text(encoding="utf-8")
cards = re.findall(r'<a href="([^"]+)" class="post-card">(.*?)</a>', idx, re.S)
items = []
for href, body in cards:
    tag = re.search(r'<span class="post-tag">(.*?)</span>', body).group(1)
    date = re.search(r'<span class="post-tag">.*?</span>\s*<span>(\d{1,2} \w+ \d{4})</span>', body, re.S).group(1)
    title = html.unescape(re.sub(r"<[^>]+>", "", re.search(r"<h2>(.*?)</h2>", body, re.S).group(1))).strip()
    desc = html.unescape(re.sub(r"<[^>]+>", "", re.search(r"<p>(.*?)</p>", body, re.S).group(1))).strip()
    d = datetime.datetime.strptime(date, "%d %B %Y").replace(hour=9, tzinfo=datetime.timezone.utc)
    url = BASE + (href if href.startswith("/") else "/blog/" + href)
    items.append((d, url, title, desc, tag))
items.sort(key=lambda x: x[0], reverse=True)
esc = lambda s: html.escape(s, quote=False)
rfc = lambda d: email.utils.format_datetime(d)
out = ['<?xml version="1.0" encoding="UTF-8"?>', '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">', "<channel>",
       "  <title>closed:in blog</title>", f"  <link>{BASE}/blog</link>", f'  <atom:link href="{BASE}/blog/feed.xml" rel="self" type="application/rss+xml"/>',
       "  <description>Tactics, teardowns and numbers from B2B outbound campaigns closed:in runs: cold email, Clay workflows, deliverability, GTM engineering.</description>",
       "  <language>en</language>", f"  <lastBuildDate>{rfc(datetime.datetime.now(datetime.timezone.utc))}</lastBuildDate>"]
for d, url, title, desc, tag in items:
    out += ["  <item>", f"    <title>{esc(title)}</title>", f"    <link>{url}</link>", f'    <guid isPermaLink="true">{url}</guid>', f"    <pubDate>{rfc(d)}</pubDate>",
            f"    <category>{esc(tag)}</category>", f"    <description>{esc(desc)}</description>", "  </item>"]
out += ["</channel>", "</rss>", ""]
(ROOT / "blog/feed.xml").write_text("\n".join(out), encoding="utf-8"); print(f"blog/feed.xml: {len(items)} items")
