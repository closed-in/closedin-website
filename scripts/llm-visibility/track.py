#!/usr/bin/env python3
"""LLM-visibility tracker (4-11-2026, after Xavier Caffrey's method). Asks the buyer questions in research/seo-geo/questions.json to
ChatGPT (OpenAI), Claude (Anthropic) and Gemini (Google), each with web search on, then classifies every answer with a cheap model
(Claude Haiku, no search): which agencies are named in order, where closed:in sits, which URLs are cited. Writes
research/seo-geo/runs/<date>.json and rewrites research/seo-geo/report.md with the trend against the previous run.

Keys: scripts/llm-visibility/.env (gitignored) with OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY; the company .env in the workspace (CLOSEDIN_ prefix) is read as fallback. A provider without a key is skipped.
Cost: estimated before any call and printed; the run stops when the estimate exceeds MAX_EUR_PER_RUN (default 3). Confirm the amount with Max first.

Usage:
  python3 scripts/llm-visibility/track.py --dry-run            # 2 questions, first available provider, prints the cost estimate
  python3 scripts/llm-visibility/track.py                      # full run, all providers with a key
  python3 scripts/llm-visibility/track.py --providers openai,gemini --limit 10
  python3 scripts/llm-visibility/track.py --report-only        # rebuild report.md from the saved runs, no calls
Only the standard library is used, so no install step."""
import argparse, datetime, json, os, pathlib, re, sys, time, urllib.request, urllib.error

HERE = pathlib.Path(__file__).resolve().parent
REPO = HERE.parent.parent
SEO = REPO / "research" / "seo-geo"
RUNS = SEO / "runs"
QUESTIONS = SEO / "questions.json"
REPORT = SEO / "report.md"

# Prices in USD per 1M tokens (input, output) plus a per-call search surcharge, from the public price lists on 4-11-2026. Re-check monthly.
PRICES = {
    "openai":    {"model": "gpt-5-mini",        "in": 0.25, "out": 2.00, "search": 0.010},
    "anthropic": {"model": "claude-haiku-5-5",  "in": 1.00, "out": 5.00, "search": 0.010},
    "gemini":    {"model": "gemini-2.5-flash",  "in": 0.30, "out": 2.50, "search": 0.0},     # grounding is free up to 1,500 requests a day
}
CLASSIFIER = {"model": "claude-haiku-5-5", "in": 1.00, "out": 5.00}
EUR_PER_USD = 0.92
EST_TOKENS = {"in": 2500, "out": 900}          # per answer, used only for the estimate before the run
EST_CLS = {"in": 1400, "out": 250}


WORKSPACE_ENV = pathlib.Path.home() / "ClosedIn-Main-Workspace" / "PROJECTS" / "Closed In" / ".env"   # company keys, CLOSEDIN_ prefix (API-REGISTRY.md)


def load_env():
    for env in (HERE / ".env", WORKSPACE_ENV):
        if env.exists():
            for line in env.read_text().splitlines():
                if "=" in line and not line.strip().startswith("#"):
                    k, v = line.split("=", 1); k = k.strip(); v = v.strip().strip('"').strip("'")
                    os.environ.setdefault(k, v)
                    if k.startswith("CLOSEDIN_"): os.environ.setdefault(k[len("CLOSEDIN_"):], v)   # CLOSEDIN_ANTHROPIC_API_KEY -> ANTHROPIC_API_KEY


def post(url, body, headers, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", **headers})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:300]
            if e.code in (429, 500, 502, 503) and attempt < 2: time.sleep(5 * (attempt + 1)); continue
            raise RuntimeError(f"{url} -> {e.code}: {msg}")


# ---- the three answer providers. Each returns (text, cited_urls, usage_in, usage_out)
def ask_openai(q):
    r = post("https://api.openai.com/v1/responses", {"model": PRICES["openai"]["model"], "tools": [{"type": "web_search"}], "input": q},
             {"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"})
    text, urls = [], []
    for item in r.get("output", []):
        for c in item.get("content", []) or []:
            if c.get("type") == "output_text":
                text.append(c.get("text", ""))
                for a in c.get("annotations", []) or []:
                    if a.get("url"): urls.append(a["url"])
    u = r.get("usage", {})
    return "\n".join(text), urls, u.get("input_tokens", 0), u.get("output_tokens", 0)


def ask_anthropic(q, search=True):
    body = {"model": PRICES["anthropic"]["model"], "max_tokens": 1500, "messages": [{"role": "user", "content": q}]}
    if search: body["tools"] = [{"type": "web_search_20250305", "name": "web_search", "max_uses": 3}]
    r = post("https://api.anthropic.com/v1/messages", body, {"x-api-key": os.environ["ANTHROPIC_API_KEY"], "anthropic-version": "2023-06-01"})
    text, urls = [], []
    for c in r.get("content", []):
        if c.get("type") == "text":
            text.append(c.get("text", ""))
            for cit in c.get("citations", []) or []:
                if cit.get("url"): urls.append(cit["url"])
    u = r.get("usage", {})
    return "\n".join(text), urls, u.get("input_tokens", 0), u.get("output_tokens", 0)


def ask_gemini(q):
    m = PRICES["gemini"]["model"]
    r = post(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent",
             {"contents": [{"parts": [{"text": q}]}], "tools": [{"google_search": {}}]}, {"x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    cand = (r.get("candidates") or [{}])[0]
    text = "\n".join(p.get("text", "") for p in cand.get("content", {}).get("parts", []))
    urls = [c.get("web", {}).get("uri") for c in cand.get("groundingMetadata", {}).get("groundingChunks", []) if c.get("web", {}).get("uri")]
    u = r.get("usageMetadata", {})
    return text, urls, u.get("promptTokenCount", 0), u.get("candidatesTokenCount", 0)


PROVIDERS = {"openai": ("OPENAI_API_KEY", ask_openai), "anthropic": ("ANTHROPIC_API_KEY", ask_anthropic), "gemini": ("GEMINI_API_KEY", ask_gemini)}


# ---- classification (Haiku, no search): vendors in order, closed:in rank, cited URLs
def classify(question, answer, cited, aliases):
    prompt = f"""You read an AI assistant's answer to a buyer question and extract facts. Reply with JSON only.
Question: {question}
Answer:
<<<
{answer[:6000]}
>>>
Cited URLs: {json.dumps(cited[:20])}
Extract:
- "vendors": the companies, agencies or products the answer recommends or lists, in the order they appear (max 15, exact names as written).
- "brand_rank": 1-based position of the brand known as {aliases} in that list, or null when not named at all.
- "brand_mentioned": true when the brand appears anywhere in the answer, even without a recommendation.
- "brand_claims": short list of concrete claims the answer makes about the brand (pricing, location, services, results), empty when none.
- "sources": domains the answer relies on (from the cited URLs plus any URLs in the text), unique, max 15.
JSON with exactly those five keys."""
    text, _, ti, to = ask_anthropic(prompt, search=False)
    m = re.search(r"\{.*\}", text, re.S)
    try: data = json.loads(m.group(0)) if m else {}
    except Exception: data = {}
    data.setdefault("vendors", []); data.setdefault("brand_rank", None); data.setdefault("brand_mentioned", False)
    data.setdefault("brand_claims", []); data.setdefault("sources", [])
    low = answer.lower()
    if any(a.lower() in low for a in aliases): data["brand_mentioned"] = True
    return data, ti, to


def cost_usd(provider, ti, to):
    p = PRICES[provider]; return ti / 1e6 * p["in"] + to / 1e6 * p["out"] + p["search"]


def estimate(providers, n):
    per_q = sum(EST_TOKENS["in"] / 1e6 * PRICES[p]["in"] + EST_TOKENS["out"] / 1e6 * PRICES[p]["out"] + PRICES[p]["search"] for p in providers)
    per_q += len(providers) * (EST_CLS["in"] / 1e6 * CLASSIFIER["in"] + EST_CLS["out"] / 1e6 * CLASSIFIER["out"])
    return per_q * n * EUR_PER_USD


def domain(u):
    m = re.match(r"https?://(?:www\.)?([^/]+)", u or ""); return m.group(1).lower() if m else None


# ---- report
def load_runs():
    runs = sorted(r for r in RUNS.glob("*.json") if not r.stem.endswith("-dry"))
    return [json.loads(r.read_text()) for r in runs]


def summarise(run):
    """share of voice per provider: % of category questions where the brand is named, plus named rate on name questions."""
    out = {}
    for prov in run["providers"]:
        cat = [r for r in run["results"] if r["provider"] == prov and not r["id"].startswith("n")]
        nam = [r for r in run["results"] if r["provider"] == prov and r["id"].startswith("n")]
        out[prov] = {
            "category_named_pct": round(100 * sum(1 for r in cat if r["brand_rank"]) / max(1, len(cat))),
            "category_mentioned_pct": round(100 * sum(1 for r in cat if r["brand_mentioned"]) / max(1, len(cat))),
            "name_q_named_pct": round(100 * sum(1 for r in nam if r["brand_mentioned"]) / max(1, len(nam))),
            "top3_pct": round(100 * sum(1 for r in cat if r["brand_rank"] and r["brand_rank"] <= 3) / max(1, len(cat))),
        }
    return out


def write_report(runs):
    if not runs: REPORT.write_text("# LLM visibility\n\nNo runs yet.\n"); return
    cur, prev = runs[-1], (runs[-2] if len(runs) > 1 else None)
    qs = {q["id"]: q for q in json.loads(QUESTIONS.read_text())["questions"]}
    provs = cur["providers"]; s_cur = summarise(cur); s_prev = summarise(prev) if prev else {}
    L = [f"# LLM visibility: closed:in", "", f"Last run {cur['date']} ({len(cur['results'])} answers, {cur['cost_eur']:.2f} EUR). Previous run: {prev['date'] if prev else 'none'}. Questions: `questions.json`. Raw answers: `runs/{cur['date']}.json`.", ""]
    L += ["## Share of voice", "", "| Model | Named on category questions | Top 3 | Mentioned at all | Named when asked by name |", "|---|---|---|---|---|"]
    for p in provs:
        c = s_cur[p]; d = s_prev.get(p)
        def cell(k, suf="%"):
            v = c[k]; return f"{v}{suf}" + (f" ({v - d[k]:+d})" if d else "")
        L.append(f"| {p} | {cell('category_named_pct')} | {cell('top3_pct')} | {cell('category_mentioned_pct')} | {cell('name_q_named_pct')} |")
    # per question
    L += ["", "## Per question (rank of closed:in; - = not named; change vs previous run in brackets)", "", "| # | Question | " + " | ".join(provs) + " | Vendors named first |", "|---|---|" + "---|" * len(provs) + "---|"]
    prev_idx = {(r["id"], r["provider"]): r for r in prev["results"]} if prev else {}
    by_q = {}
    for r in cur["results"]: by_q.setdefault(r["id"], {})[r["provider"]] = r
    for qid in sorted(by_q):
        cells = []
        for p in provs:
            r = by_q[qid].get(p)
            if not r: cells.append("n/a"); continue
            v = str(r["brand_rank"]) if r["brand_rank"] else ("(m)" if r["brand_mentioned"] else "-")
            pr = prev_idx.get((qid, p))
            if pr:
                a, b = pr["brand_rank"] or 99, r["brand_rank"] or 99
                if a != b: v += f" ({'up' if b < a else 'down'} from {pr['brand_rank'] or '-'})"
            cells.append(v)
        firsts = {}
        for p in provs:
            for vname in (by_q[qid].get(p, {}).get("vendors") or [])[:3]: firsts[vname] = firsts.get(vname, 0) + 1
        top = ", ".join(k for k, _ in sorted(firsts.items(), key=lambda kv: -kv[1])[:4])
        L.append(f"| {qid} | {qs.get(qid, {}).get('text', qid)} | " + " | ".join(cells) + f" | {top} |")
    # vendors overall
    vend, dom = {}, {}
    for r in cur["results"]:
        for i, vname in enumerate(r.get("vendors") or []): vend[vname] = vend.get(vname, 0) + (1 if i < 5 else 0.5)
        for s in r.get("sources") or []:
            d = domain(s) or s.lower(); dom[d] = dom.get(d, 0) + 1
    L += ["", "## Who gets recommended (weighted: top 5 counts 1, lower 0.5)", ""]
    L += [f"- {k}: {v:g}" for k, v in sorted(vend.items(), key=lambda kv: -kv[1])[:20]]
    L += ["", "## Top cited domains (get featured candidates, no outreach list by decision of 4-11)", ""]
    L += [f"- {k}: {v}" for k, v in sorted(dom.items(), key=lambda kv: -kv[1])[:25]]
    claims = [(r["id"], r["provider"], c) for r in cur["results"] if r["id"].startswith("n") for c in (r.get("brand_claims") or [])]
    L += ["", "## What the models say about closed:in (fix a fact: check each claim against the site)", ""]
    L += [f"- [{p}] {qid}: {c}" for qid, p, c in claims] or ["- nothing extracted"]
    # trend table over all runs
    if len(runs) > 1:
        L += ["", "## Trend (named on category questions, %)", "", "| Run | " + " | ".join(provs) + " |", "|---|" + "---|" * len(provs)]
        for run in runs:
            s = summarise(run); L.append(f"| {run['date']} | " + " | ".join(str(s.get(p, {}).get('category_named_pct', 'n/a')) for p in provs) + " |")
    L += ["", "Next: write `actions.md` from this report (write a page, fix a fact, get featured, join the conversation)."]
    REPORT.write_text("\n".join(L) + "\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true"); ap.add_argument("--providers", default=""); ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--report-only", action="store_true"); ap.add_argument("--yes", action="store_true", help="skip the cost confirmation prompt (for cron)")
    a = ap.parse_args()
    load_env()
    if a.report_only: write_report(load_runs()); print(f"report: {REPORT}"); return
    cap = float(os.environ.get("MAX_EUR_PER_RUN", "3"))
    cfg = json.loads(QUESTIONS.read_text()); aliases = cfg["brand_aliases"]
    if "ANTHROPIC_API_KEY" not in os.environ: sys.exit("ANTHROPIC_API_KEY missing: the classifier needs it (scripts/llm-visibility/.env)")
    provs = [p for p in (a.providers.split(",") if a.providers else PROVIDERS) if p]
    provs = [p for p in provs if PROVIDERS[p][0] in os.environ] or sys.exit("no provider has a key in .env")
    qs = cfg["questions"]
    if a.dry_run: qs, provs = qs[:2], provs[:1]
    if a.limit: qs = qs[:a.limit]
    est = estimate(provs, len(qs))
    print(f"{len(qs)} questions x {provs} = {len(qs) * len(provs)} answers + classification. Estimated cost {est:.2f} EUR (cap {cap:.2f} EUR).")
    if est > cap: sys.exit("estimate above MAX_EUR_PER_RUN, raise the cap in .env or lower --limit")
    if not a.yes and not a.dry_run:
        if input("Run? Type yes: ").strip().lower() != "yes": sys.exit("aborted")
    today = datetime.date.today().isoformat(); results = []; spent = 0.0
    for q in qs:
        for p in provs:
            try:
                text, urls, ti, to = PROVIDERS[p][1](q["text"]); spent += cost_usd(p, ti, to) * EUR_PER_USD
                data, ci, co = classify(q["text"], text, urls, aliases); spent += (ci / 1e6 * CLASSIFIER["in"] + co / 1e6 * CLASSIFIER["out"]) * EUR_PER_USD
                results.append({"id": q["id"], "group": q["group"], "provider": p, "question": q["text"], "answer": text, "cited": urls, **data})
                print(f"{q['id']} {p:10s} rank={data['brand_rank']} mentioned={data['brand_mentioned']} spent={spent:.2f} EUR")
            except Exception as e:
                results.append({"id": q["id"], "group": q["group"], "provider": p, "question": q["text"], "answer": "", "cited": [], "vendors": [], "brand_rank": None, "brand_mentioned": False, "brand_claims": [], "sources": [], "error": str(e)[:300]})
                print(f"{q['id']} {p:10s} ERROR {str(e)[:120]}")
            if spent > cap: print(f"cap of {cap:.2f} EUR reached, stopping"); break
        if spent > cap: break
    run = {"date": today, "providers": provs, "models": {p: PRICES[p]["model"] for p in provs}, "cost_eur": round(spent, 2), "dry_run": a.dry_run, "results": results}
    RUNS.mkdir(parents=True, exist_ok=True)
    out = RUNS / (f"{today}{'-dry' if a.dry_run else ''}.json"); out.write_text(json.dumps(run, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"saved {out} ({spent:.2f} EUR)")
    if not a.dry_run: write_report(load_runs()); print(f"report: {REPORT}")


if __name__ == "__main__": main()
