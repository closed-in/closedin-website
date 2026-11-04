# LLM-visibility tracker

Weekly check of how ChatGPT, Claude and Gemini answer the buyer questions in `research/seo-geo/questions.json`, and where closed:in sits in those answers. Built 4-11-2026 after Xavier Caffrey's method (ask, measure, act: write a page, fix a fact, get featured, join the conversation).

## Setup (once, Max)
1. Copy `.env.example` to `.env` in this folder and paste the keys. Anthropic is required (classifier). OpenAI: platform.openai.com, API keys, create key, put 5 USD of credit on the account. Gemini: aistudio.google.com, Get API key (free tier is enough).
2. `python3 scripts/llm-visibility/track.py --dry-run` from the repo root: 2 questions, 1 model, prints the estimated cost and writes `runs/<date>-dry.json`.

## Weekly (Monday)
1. `python3 scripts/llm-visibility/track.py` prints the estimate (about 1 to 3 EUR), asks for "yes", runs, writes `runs/<date>.json` and `report.md`.
2. Claude Code reads `report.md` and writes `actions.md` (what page to write, what fact to fix, which cited domains and threads matter).
3. Max reviews on Tuesday: approves pages, requests indexing in Search Console after a merge, posts replies himself.

## Monthly
Still by hand, first working day: the 8 questions in `baseline-2026-10.md` in Perplexity and Google AI Mode, plus Bing Webmaster Tools, AI Performance, 30 D.

## Notes
- `questions.json`: keep ids stable so the trend per question survives edits. Add questions at the end.
- Prices in `track.py` (`PRICES`) are from the public price lists of 4-11-2026; check them monthly.
- `--report-only` rebuilds `report.md` from the saved runs without any call.
- The run stops at `MAX_EUR_PER_RUN`. Never commit `.env`.
