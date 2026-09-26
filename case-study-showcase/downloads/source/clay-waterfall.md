# The Clay Email Waterfall

# 10 providers, one column, ~95% find rate at the lowest credit cost

---

## Read this first

This is the exact provider chain closed:in runs inside Clay across client tables. Cheap providers go first. Expensive ones only fire when everything before them came back empty. That single rule is what keeps the credit bill low while the find rate stays high.

You get three files:

- **This guide**: the order, the setup per column, the fallback logic, the credit math, and two alternate orders.
- **clay-waterfall.json**: the same chain as a config spec (provider, column name, credits, run condition, inputs, output). Clay shares tables through template links, not JSON imports, so this is a rebuild spec, not a file you upload. Rebuilding from it takes about ten minutes.
- **clay-credit-calculator.xlsx**: type in your list size and your own hit rates per step, read off the expected credits and find rate.

What you need before you start:

- A Clay workspace (Pro or higher for the volumes this is built for).
- The 10 providers below, each available as a Clay integration. Most run on Clay credits, so you do not need separate accounts.
- Input columns per row: **First name**, **Last name**, **Company domain**. A **LinkedIn URL** column helps Wiza and improves matches elsewhere.

---

## The order

Run these in series, never in parallel. Each step only fires if the previous step returned empty.

| Step | Provider | Credits per row | Why it sits here |
|---|---|---|---|
| 1 | Icypeas | 0.5 | Cheapest in the stack. Good baseline on common B2B emails. Always first to keep the average down. |
| 2 | LeadMagic | 1 | Strong on SMB and recent role changes. Picks up what Icypeas misses on smaller domains. |
| 3 | Enrow | 1 | Solid EU coverage. Frequently hits where US-focused providers return empty on European prospects. |
| 4 | Kitt | 1 | Last cheap step before real credits start. Catches another slice of stragglers from steps 1 to 3. |
| 5 | Findymail | 2 | High-quality validated finds. We trust Findymail results without extra verification, which saves a credit downstream. |
| 6 | Hunter | 2 | Strong on tech B2B and US lists. Doubles as our verification provider on cheap-tier results when we need a quality gate. |
| 7 | Prospeo | 2 | Good catalog depth on long-tail domains. Often returns hits where the bigger names fail. |
| 8 | Datagma | 2 | Strong on NL, BE and DE. Worth the 2 credits on European mid-market. |
| 9 | Wiza | 2 | LinkedIn-derived data. Best for prospects with an active profile where you already have the URL. |
| 10 | Dropcontact | 2 | French-rooted, strong GDPR posture. Last resort. Often picks up the final 2 to 3% of finds. |

Full chain, all attempts: 15.5 credits per row. Sequenced by price and stopped at the first hit: a fraction of that. The credit math section below has the numbers.

---

## Column-by-column setup

Every step is the same five moves. Do them ten times, in order.

**1. Add the enrichment column.** In your Clay table: Add column → Enrich data → search the provider (Icypeas, LeadMagic, and so on) → pick its "find work email" action.

**2. Map the inputs.** First name, last name, company domain. For Wiza, map the LinkedIn URL. Use the same source columns for every step so results are comparable.

**3. Name the column** `Validate <Provider>`, for example `Validate Icypeas`. This is the naming we use in every client table. It makes the run conditions readable and the cost report per column self-explanatory.

**4. Set the run condition.** Open the column settings → Run settings → "Only run if". For step 1 leave it empty. For every later step, the condition is: the previous step's output is empty. So `Validate LeadMagic` only runs when `Validate Icypeas` is empty, `Validate Enrow` only runs when `Validate LeadMagic` is empty, and so on down the chain.

**5. Run and check.** Run the column on 20 rows first. Confirm it fired only on rows where the previous column is empty. Then run the full table.

**Final column: the email you actually use.** Add a formula column named `Email (waterfall)` that returns the first non-empty value from `Validate Icypeas` through `Validate Dropcontact`, in that order. Every downstream column (verification, push to Instantly, push to CRM) reads from this one column, never from the individual provider columns.

**Optional quality gate.** If you want a verification pass on the cheap tier, add a Hunter "verify email" column that only runs when `Email (waterfall)` came from steps 1 to 4. Findymail results (step 5) skip it; we trust those as-is.

---

## Fallback logic

Providers rate-limit, time out, or go down for an afternoon. Three rules keep the chain honest when that happens.

**Errors are not empties.** When a provider errors out, Clay shows an error state in the cell, not an empty cell. The next step's run condition ("previous is empty") will not fire on error cells, so those rows stall at the broken step. After every full run, filter the table on error cells per `Validate` column and re-run those rows from the column menu. Do this before you read the find rate, otherwise you undercount.

**Rate limits: wait, then re-run.** A burst of errors on one provider usually means you hit its rate limit. Wait 15 minutes and re-run the errored rows. Do not move on to the next provider for those rows, that just pays the more expensive step for emails the cheap step would have found.

**A provider is down for the day: skip it once.** Add a checkbox column `Skip <Provider>` and extend that step's run condition with "and Skip is unchecked". Tick it for the rows you need today, run the rest of the chain, untick it tomorrow and re-run the skipped step on the rows that are still empty. This way a single outage never blocks a list.

---

## Credit math

Average cost per 1,000 prospects on a mixed EU/US B2B list:

- Most rows resolve in steps 1 to 4 (cheap tier, 0.5 to 1 credit per row).
- Roughly 25% of rows continue into the 2-credit tier.
- Roughly 5% of rows exhaust the full chain and still return empty.
- Net: budget 1,300 to 1,800 credits per 1,000 prospects at ~95% find rate. That range covers re-runs on errored rows and the optional verification gate.

Running all 10 providers in parallel costs 15.5 credits per row regardless of where the hit lands. Sequencing by price cuts that by 80 to 90%.

The calculator ships with default hit rates per step that land at the lower end of that range. Those defaults are starting points, not measurements of your list. After your first full run, read the actual hit rate per `Validate` column off your table and type those in. From then on the calculator predicts your own credit bill.

Where billing matters: for most email providers Clay charges credits on found results, not on empty attempts. If a provider you add charges on every attempt, flip the billing switch in the calculator and the numbers update.

---

## Two alternate orders

Keep the cheap tier first in both. Reorder inside each tier by where the provider is strongest.

**US-heavy lists** (tech, SaaS, US mid-market):

1. Icypeas
2. LeadMagic
3. Kitt
4. Enrow
5. Hunter
6. Findymail
7. Prospeo
8. Wiza
9. Datagma
10. Dropcontact

Hunter moves up because it is strongest on US and tech B2B. Datagma and Dropcontact move to the end because their edge is European.

**EU-heavy lists** (NL, BE, DE, FR, UK mid-market):

1. Icypeas
2. Enrow
3. LeadMagic
4. Kitt
5. Datagma
6. Findymail
7. Dropcontact
8. Hunter
9. Prospeo
10. Wiza

Enrow moves to step 2 for its EU coverage. Datagma and Dropcontact move up into the 2-credit tier's front half, which is where they earn their credits on European domains.

Both orders are in the JSON under `alternate_orders`.

---

## Want closed:in to build it in your workspace?

We set up the full chain in your Clay workspace, wire it to Instantly and your CRM, and run the first list through it with you on the call. You keep the table, the columns and the credit report. Thirty minutes, no slides.

Book here: https://closedin.neetocal.com/discovery-call?utm_source=closedin.io&utm_medium=download&utm_content=clay-waterfall-pdf

closed:in is a Clay Solutions Partner and an Instantly Certified Expert. Amsterdam, working across NL, BE, UK, EU and US.
