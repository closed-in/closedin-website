# The closed:in GTM Stack

# 24 tools, 6 categories, ~€2,750 a month, what each one is for

---

## Read this first

This is every tool closed:in pays for to run outbound across 50+ B2B clients, with the real monthly cost and an honest take per tool. No affiliate links. Updated quarterly.

Two files:

- **This guide**: per category what the tool has to do, when you need it, when you can skip it, and our take per tool.
- **gtm-stack.xlsx**: the same 24 tools as a spreadsheet with category, tier, monthly cost and link, plus subtotals. Sort, filter, delete what you do not need, add your own.

The tiers we use:

- **Core**: we would not run outbound without it.
- **Waterfall / Verification**: part of the email-finding chain (see the Clay waterfall guide).
- **Use case / Niche**: only for specific ICPs or specific jobs.
- **Infrastructure / Backup / Internal**: it has to exist, it does not have to be special.

---

## 1. Sourcing and prospect data

5 tools, about €500 a month.

**What it has to do:** get you the right 200 people to talk to, with enough account context to write something specific. Sourcing is where most lists go wrong. A bigger list is not a better list.

**Buy when:** you have an ICP written down and you can name the titles and account filters. **Skip when:** you are still guessing who buys. Fix that first, sourcing tools amplify whatever definition you feed them.

| Tool | Tier | Cost | Our take |
|---|---|---|---|
| [LinkedIn Sales Navigator](https://business.linkedin.com/sales-solutions/sales-navigator) | Core | €99 per seat per month | Non-negotiable. Best source for verified people data and account info. Boolean search beats Apollo for finding niche roles. |
| [Apollo.io](https://www.apollo.io) | Core | €99 per seat per month | Volume sourcing and email enrichment in one. Data quality varies by region (great US, mediocre NL). Use as sourcing, not as your primary verifier. |
| [PhantomBuster](https://phantombuster.com) | Use case | €56 per month | For LinkedIn search export and Sales Nav scraping. Reliable, simple. Skip if you only need one or two exports a month. |
| [Google Maps + Outscraper](https://outscraper.com) | Niche | ~€50 per month, variable | For hospitality, retail and local-services ICPs. The "unreachable ICP" trick from the Jamezz case study. |
| [Apify](https://apify.com) | Niche | Variable | Custom scrapers when standard sourcing fails: industry directories, association sites, niche marketplaces. Put a cost cap on every run. |

---

## 2. Enrichment and orchestration

4 tools, about €800 a month.

**What it has to do:** fill the gaps so the message can be specific, find the email at the lowest credit cost, and move data between sourcing, sending and CRM without a human copy-pasting CSVs.

**Buy when:** you send more than one campaign a month. **Skip when:** you are running a single 300-row list by hand. Clay pays for itself at volume, not at a one-off.

| Tool | Tier | Cost | Our take |
|---|---|---|---|
| [Clay](https://www.clay.com) | Core, Partner | €349 per month (Pro) | Our enrichment and orchestration spine. Waterfall enrichment, Claygent for AI scraping, signal aggregation. We are a Clay Solutions Partner. |
| [Findymail](https://www.findymail.com) | Waterfall | €69 per month | Validated finds inside the waterfall. Best hit rate for personal emails: small business owners, founders without a corporate setup. |
| [Datagma](https://datagma.com) | Waterfall | €89 per month | Strong in EU markets where Apollo lags. Also does phone enrichment we sometimes use. |
| [Hunter](https://hunter.io) | Verification | €49 per month | Verification step in the waterfall. Catches what others miss, lower false-positive rate than the alternatives. |

The full 10-provider order, run conditions and credit math are in the Clay waterfall guide: https://www.closedin.io/downloads/clay-waterfall.pdf

---

## 3. Sending and deliverability

3 tools, about €500 a month.

**What it has to do:** land plain-text email in the primary inbox, at volume, without burning your main domain. Everything here is infrastructure. It is boring on purpose.

**Buy when:** before your first send. Domains need two to three weeks of warmup before a cold email goes out, so this is the first purchase on the timeline, not the last. **Skip when:** never, if you send cold email.

| Tool | Tier | Cost | Our take |
|---|---|---|---|
| [Instantly](https://instantly.ai) | Core, Expert | €297 per month (Hyper) | Cold email infrastructure. Unlimited inboxes, built-in warmup, sequence orchestration. We are an Instantly Certified Expert. |
| Domain providers ([Cloudflare](https://www.cloudflare.com), [Namecheap](https://www.namecheap.com)) | Infrastructure | ~€100 per month, variable | Alternate sending domains, two to three per client. Renews annually, spread monthly here. Never send cold from your main domain. |
| [Google Workspace](https://workspace.google.com) / [Microsoft 365](https://www.microsoft.com/microsoft-365) | Infrastructure | ~€100 per month per client | Two inboxes per sending domain. Google for most clients, Microsoft where their primary stack is M365. |

---

## 4. CRM and automation

4 tools, about €450 a month.

**What it has to do:** keep one source of truth for replies, meetings and pipeline, and glue the other tools together so nothing depends on someone remembering to do it.

**Buy when:** the first positive reply lands. A reply that lives only in a sending tool's inbox is a reply that gets lost. **Skip when:** you can count your open conversations on one hand and you are the only person following up. Even then, get the calendar tool.

| Tool | Tier | Cost | Our take |
|---|---|---|---|
| [Close CRM](https://www.close.com) | Core | €109 per seat per month | Our CRM. Pipeline management, reply handling, call and email tracking. Clean API for the Clay integration. |
| [n8n](https://n8n.io) (self-hosted) | Automation | ~€20 per month hosting | Workflow automation between Clay, Close and Instantly. Self-hosted on Hetzner for cost. Cron jobs, webhooks, custom logic. |
| [Neetocal](https://neetocal.com) | Meetings | €29 per month (team) | Calendly alternative. Cheaper, faster booking widget, none of the Calendly bloat. Works fine for B2B. |
| [Slack](https://slack.com) | Internal | €60 per month (team) | Internal comms and client channels. Slack Connect for shared workspaces with clients. |

---

## 5. AI and agents

3 tools, about €300 a month.

**What it has to do:** write and iterate copy, research accounts, and run the engineering work behind the automations. One primary model, one cheap backup, and API access for the prompts that run inside Clay.

**Buy when:** day one for the primary model. The API line item only once you run Claygent or custom prompt columns at volume. **Skip when:** you are paying for three chat subscriptions and using one. Cut to one.

| Tool | Tier | Cost | Our take |
|---|---|---|---|
| [Claude](https://claude.ai) (Max plan) | Core | €100 per month | Primary AI for sales, copy and automation. Claude Code for the engineering work. Used daily across the team. |
| [ChatGPT](https://chatgpt.com) Pro | Backup | €20 per month | Cheap backup. Useful for image generation and quick lookups. Not our primary anymore. |
| [Anthropic API](https://www.anthropic.com) + [OpenAI API](https://openai.com) | Inside Clay | Variable | Used inside Clay Claygent prompts. Pay per token, scales with campaign volume. |

---

## 6. Analytics, infrastructure and misc

5 tools, about €200 a month.

**What it has to do:** host the site and internal dashboards, store the data behind them, record meetings, keep the books, and run the newsletter. None of these win a campaign. All of them stop you from losing time.

**Buy when:** each one solves a problem you have this month. **Skip when:** you are buying it for the version of the company you plan to be next year.

| Tool | Tier | Cost | Our take |
|---|---|---|---|
| [Vercel](https://vercel.com) | Core | €20 per month (Pro) | Hosts closedin.io, internal dashboards and partner login portals. Web Analytics and Speed Insights included. |
| [Supabase](https://supabase.com) | Backend | €25 per month (Pro) | Postgres and Auth for internal tools. The partner login portal runs on Supabase. |
| [Fireflies](https://fireflies.ai) | Meetings | €19 per seat per month | Meeting transcripts. Auto-joins Zoom and Google Meet, transcripts land in our notes automatically. Saves hours a week. |
| [Moneybird](https://www.moneybird.nl) | Finance | €20 per month | Dutch accounting. Invoicing, expenses, tax reporting. Compulsory for NL businesses, also genuinely good. |
| [Beehiiv](https://www.beehiiv.com) | Newsletter | €39 per month (Pro) | Our newsletter platform. Recommendations and boosts for growth. |

---

## Total and what it means

About €2,750 a month for a two-founder agency running six or more active clients. Per client we charge €5K to €8K a month, so the stack is roughly 5 to 8% of revenue.

If you are starting from zero, buy in this order:

1. **Sending infrastructure first** (domains, inboxes, Instantly). Warmup takes weeks, everything else takes days.
2. **Sourcing** (Sales Navigator). One seat is enough to build your first three lists.
3. **CRM and calendar** (Close, Neetocal). Before the first reply, not after.
4. **Enrichment** (Clay, then the waterfall providers). Once you send more than one campaign a month.
5. **AI** (one primary model). Day one for writing, the API line only at volume.
6. **Everything in category 6**, one at a time, when the problem shows up.

---

## Skip the stack-building, hire the team that runs it

closed:in builds the list, writes the copy, runs the infrastructure and books the meetings into your calendar. You get the sending domains, the Clay tables and the CRM setup as your own assets. Thirty minutes, no slides.

Book here: https://closedin.neetocal.com/discovery-call?utm_source=closedin.io&utm_medium=download&utm_content=gtm-stack-pdf

closed:in is a Clay Solutions Partner and an Instantly Certified Expert. Amsterdam, working across NL, BE, UK, EU and US.
