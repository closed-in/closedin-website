---
title: Clay pricing explained (2026): Actions, Data Credits and what a plan really costs
slug: clay-pricing-explained
tag: Pricing
description: Clay now bills two things, Actions and Data Credits. What each plan costs in November 2026, how the two meters work, and how to pick a plan without overbuying.
lead: Clay's price is the sum of two meters. Actions pay for the work Clay does (running a table, calling an AI model, pushing to your CRM). Data Credits pay for the data it buys from its 150+ providers. Launch starts at $185 a month billed monthly and Growth at $495, and the plan you need depends more on features than on volume.
date: 2026-11-11
author: Max
related: /clay-agency
keywords: clay pricing, clay credits, clay actions, clay data credits, clay launch plan, clay growth plan
---
## The plans in November 2026

Prices checked on 11 November 2026 on [clay.com/pricing](https://www.clay.com/pricing). All prices in USD. Annual billing saves about 10%.

| Plan | Monthly billing | Annual billing (per month) | Included per month |
|---|---|---|---|
| Free | $0 | $0 | 500 Actions, 100 Data Credits |
| Launch | from $185 | from $167 | 15,000 Actions, 2,500 Data Credits |
| Growth | from $495 | from $446 | 40,000 Actions, 6,000 Data Credits |
| Enterprise | custom, annual | custom | 200,000+ Actions, 100,000+ Data Credits |

The headline price is the two meters added together. On Launch with monthly billing, $60 buys the 15,000 Actions and $125 buys the 2,500 Data Credits. On Growth it is $205 plus $290. You can raise either meter on its own: more Actions moves you up an Action tier, more data means a bigger Data Credit tier or a top-up.

## Actions: the platform meter

An Action is one unit of work in Clay: enriching a row, running a formula column, calling an AI model, sending a row to another tool or exporting it. Clay prices them at less than one cent each, cheaper at higher tiers.

Two rules matter in practice:

- Actions reset every billing cycle. Unused Actions do not roll over.
- If you bring your own API key for a data provider or an AI model, that run costs one Action and no Data Credits.

## Data Credits: the data meter

Data Credits pay for the data itself: the email address, the phone number, the company record. They start at $0.05 each and get cheaper at higher tiers. Clay's [plans and billing docs](https://university.clay.com/docs/plans-and-billing) put a fully enriched record at roughly 6 to 20 Data Credits, so somewhere between $0.30 and $1.00 per record at entry pricing, depending on how many fields and providers you use.

- No result, no charge: an enrichment that finds nothing costs neither credits nor Actions.
- Data Credits roll over. On Launch and Growth you can bank up to 2x your monthly amount. Enterprise can roll over up to 15% of the prior year's credits when renewing at the same or a higher commitment.
- AI: about 80% of the models in Clay cost a flat number of Data Credits per run. Token-heavy models (Clay names GPT-5.1 and Claude 4.6 Sonnet) are billed on actual token use, shown with a tilde (~) estimate per row.

## Which plan do you actually need?

Pick on features, not on volume. Clay says its plans are sized so that 90% of customers never hit a limit, and both meters can be topped up without changing plan.

- **Free** is for learning: up to 200 rows per table, waterfalls and Claygent included, no phone enrichment.
- **Launch** is the real starting point for outbound: phone enrichment, job change and signal tracking, email campaign integrations (such as Instantly), up to 50,000 rows per table.
- **Growth** is the plan once Clay has to talk to your other systems: CRM auto-sync, HTTP API integrations and webhooks. If you want new rows to flow in from a form, a CRM or a scraper without someone uploading a CSV, you need Growth.

All paid plans include unlimited seats and tables, so you do not pay more as the team grows.

## How we use it

We are a Clay Solutions Partner and run Clay for every client: sourcing, waterfall enrichment, Claygent research and the push into the CRM. Three habits keep the bill predictable:

1. **Filter before you enrich.** Score and cut the list on free columns first (domain, headcount, country), then spend Data Credits only on rows that survive.
2. **Bring your own keys where it pays.** For providers you already pay for, a BYO key turns a Data Credit cost into a single Action.
3. **Run a 50-row test first.** One small run shows the real credit cost per row before you run 10,000.

Our full tool list with what we pay per month is on the [GTM stack page](/resources/gtm-stack). If you would rather have the tables built and run for you, that is what our [Clay agency](/clay-agency) work is.

## Sources

- Clay pricing page, checked 11 November 2026: [clay.com/pricing](https://www.clay.com/pricing)
- Clay plans and billing docs: [university.clay.com/docs/plans-and-billing](https://university.clay.com/docs/plans-and-billing)

Prices change. If a number here no longer matches Clay's page, Clay's page wins; we update this article monthly.
