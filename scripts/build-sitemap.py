"""Builds case-study-showcase/sitemap.xml from the pages themselves (22-10-2026, SEO round). lastmod per page is the dateModified
(else datePublished) from the page's JSON-LD; pages without a date in their schema get the date of their last git commit, so the
sitemap never claims a change the page does not show. Priorities and change frequencies are the table below (new pages get the
default of their kind). Leaves out pipeline-demo (old design) and 404. Usage: python3 scripts/build-sitemap.py [--check]"""
import re, json, sys, pathlib, subprocess, datetime
ROOT = pathlib.Path(__file__).resolve().parent.parent / "case-study-showcase"
BASE = "https://www.closedin.io"
SKIP = {"404.html", "pipeline-demo.html", "index-light.html"}
PRIORITY = {"/": (1.0, "weekly"), "/case-studies": (.9, "monthly"), "/pricing": (.95, "monthly"), "/playbook": (.95, "monthly"), "/resources": (.95, "weekly"),
            "/blog": (.9, "weekly"), "/team": (.6, "monthly"), "/privacy": (.3, "yearly"), "/outbound-agency": (.9, "monthly"),
            "/tools/roi-calculator": (.9, "monthly"), "/tools/email-verifier": (.9, "monthly"),
            "/resources/sales-nav-booleans": (.8, "monthly"), "/resources/n8n-workflows": (.8, "monthly"), "/resources/icp-scorecard": (.8, "monthly"),
            "/resources/pre-launch-audit": (.8, "monthly"), "/resources/claude-code-sales": (.8, "monthly")}
DEFAULT = {"case-study-": (.7, "monthly"), "blog/": (.75, "monthly"), "resources/": (.85, "monthly")}
LD = re.compile(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', re.S)

def url_of(f):
    u = "/" + re.sub(r"(^|/)index\.html$", "", f).replace(".html", "")
    return u.rstrip("/") or "/"

def schema_date(text):
    dates = []
    for m in LD.finditer(text):
        try: d = json.loads(m.group(1))
        except Exception: continue
        def walk(o):
            if isinstance(o, dict):
                for k in ("dateModified", "datePublished"):
                    v = o.get(k)
                    if isinstance(v, str) and re.match(r"\d{4}-\d{2}-\d{2}", v): dates.append((k, v[:10]))
                for v in o.values(): walk(v)
            elif isinstance(o, list):
                for v in o: walk(v)
        walk(d)
    mod = [v for k, v in dates if k == "dateModified"]; pub = [v for k, v in dates if k == "datePublished"]
    return max(mod) if mod else (max(pub) if pub else None)

def git_date(f):
    out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", f], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return out or datetime.date.today().isoformat()

def entries():
    files = sorted(f for f in subprocess.run(["git", "ls-files", "*.html"], cwd=ROOT, capture_output=True, text=True).stdout.split() if f not in SKIP and not f.startswith("assets/"))
    rows = []
    for f in files:
        t = (ROOT / f).read_text(encoding="utf-8")
        if 'name="robots" content="noindex' in t: continue
        u = url_of(f)
        pr, cf = PRIORITY.get(u) or next((v for k, v in DEFAULT.items() if f.startswith(k)), (.8, "monthly"))
        rows.append((u, schema_date(t) or git_date(f), cf, pr))
    order = {u: i for i, (u, *_r) in enumerate(rows)}
    rows.sort(key=lambda r: (-r[3], order[r[0]]))
    return rows

def render(rows):
    body = "".join(f"  <url>\n    <loc>{BASE}{u}</loc>\n    <lastmod>{d}</lastmod>\n    <changefreq>{cf}</changefreq>\n    <priority>{pr:g}</priority>\n  </url>\n" for u, d, cf, pr in rows)
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "</urlset>\n"

if __name__ == "__main__":
    xml = render(entries()); target = ROOT / "sitemap.xml"
    if "--check" in sys.argv:
        print("sitemap: " + ("PASS" if target.read_text(encoding="utf-8") == xml else "FAIL (run build-sitemap.py)")); sys.exit(0 if target.read_text(encoding="utf-8") == xml else 1)
    target.write_text(xml, encoding="utf-8"); print(f"sitemap.xml: {xml.count('<url>')} urls")
