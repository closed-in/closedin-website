#!/usr/bin/env python3
"""Checks the JSON-LD on every page (22-10-2026): it parses, carries no em or en dash, spells the brand closed:in, and Articles have a
headline, datePublished, dateModified (not before datePublished) and an author; Organization blocks have sameAs; VideoObjects have name, thumbnailUrl and uploadDate. Replaces the byte
comparison of the JSON-LD against main (check-trackers.py still compares the tracker, cookie and Leadboxer blocks byte for byte).
Usage: python3 scripts/check-schema.py"""
import re, json, sys, pathlib, subprocess, html
root = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
LD = re.compile(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', re.S)
files = [f for f in subprocess.run(["git", "ls-files", "*.html"], cwd=root, capture_output=True, text=True).stdout.split() if not f.startswith("assets/") and f not in ("pipeline-demo.html", "index-light.html")]
fails = 0; pages = 0; types = {}
def strings(o):
    if isinstance(o, dict):
        for v in o.values(): yield from strings(v)
    elif isinstance(o, list):
        for v in o: yield from strings(v)
    elif isinstance(o, str): yield o
def nodes(o):
    if isinstance(o, dict):
        yield o
        for v in o.values(): yield from nodes(v)
    elif isinstance(o, list):
        for v in o: yield from nodes(v)
for f in files:
    t = (root / f).read_text(encoding="utf-8")
    blocks = LD.findall(t)
    if not blocks:
        if f not in ("404.html", "privacy.html"): print(f"FAIL {f}: no JSON-LD"); fails += 1
        continue
    pages += 1
    for raw in blocks:
        try: d = json.loads(raw)
        except Exception as e: print(f"FAIL {f}: JSON-LD does not parse ({e})"); fails += 1; continue
        for s in strings(d):
            if "—" in s or "–" in s: print(f"FAIL {f}: dash in schema text: {s[:80]}"); fails += 1
            if "Closed:in" in s: print(f"FAIL {f}: brand capitalised: {s[:80]}"); fails += 1
            if "plynq" in s.lower(): print(f"FAIL {f}: plynq in schema"); fails += 1
        for n in nodes(d):
            ty = n.get("@type"); 
            if isinstance(ty, str): types[ty] = types.get(ty, 0) + 1
            if ty == "Article":
                for k in ("headline", "datePublished", "author"):
                    if k not in n: print(f"FAIL {f}: Article without {k}"); fails += 1
                if "dateModified" not in n: print(f"WARN {f}: Article without dateModified (sitemap uses datePublished)")
                elif n["dateModified"] < n.get("datePublished", ""): print(f"FAIL {f}: dateModified before datePublished"); fails += 1
                a = n.get("author");
                if isinstance(a, dict) and a.get("@type") == "Person" and not a.get("sameAs"): print(f"FAIL {f}: author Person without sameAs"); fails += 1
            if ty == "Organization" and n.get("@id", "").endswith("#organization") and f == "index.html":
                if not n.get("sameAs"): print(f"FAIL {f}: Organization without sameAs"); fails += 1
                if not n.get("award"): print(f"FAIL {f}: Organization without award"); fails += 1
                for fo in n.get("founder", []):
                    if not fo.get("sameAs"): print(f"FAIL {f}: founder {fo.get('name')} without sameAs"); fails += 1
                if "United States" not in json.dumps(n.get("areaServed", [])): print(f"FAIL {f}: areaServed without United States (there is a US page)"); fails += 1
            if ty == "Person" and f == "team.html" and n.get("jobTitle") and not n.get("sameAs"): print(f"FAIL {f}: {n.get('name')} without sameAs"); fails += 1
            if ty == "VideoObject":   # 24-10: Search Console flagged the homepage video for a missing uploadDate; Google requires name, thumbnailUrl and uploadDate
                for k in ("name", "thumbnailUrl", "uploadDate"):
                    if not n.get(k): print(f"FAIL {f}: VideoObject without {k}"); fails += 1
                thumbs = n.get("thumbnailUrl") if isinstance(n.get("thumbnailUrl"), list) else [n.get("thumbnailUrl")]
                if any(not str(u).startswith("https://") for u in thumbs if u): print(f"FAIL {f}: VideoObject thumbnailUrl not absolute"); fails += 1
                if n.get("uploadDate") and not re.match(r"^\d{4}-\d{2}-\d{2}", str(n["uploadDate"])): print(f"FAIL {f}: VideoObject uploadDate not ISO 8601: {n['uploadDate']}"); fails += 1
                if not n.get("description"): print(f"WARN {f}: VideoObject without description")
            if ty == "FAQPage":
                qs = [q.get("name", "") for q in n.get("mainEntity", [])]
                vis = html.unescape(re.sub(r"<[^>]+>", "", t))
                for q in qs:
                    if html.unescape(q) not in vis: print(f"FAIL {f}: FAQ question not on the page: {q[:70]}"); fails += 1
print(f"schema check: {pages} pages, " + ", ".join(f"{k} {v}" for k, v in sorted(types.items(), key=lambda x: -x[1])[:8]))
print("schema check: PASS" if not fails else f"schema check: FAIL ({fails})")
sys.exit(1 if fails else 0)
