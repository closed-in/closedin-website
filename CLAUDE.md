# closedin.io website, werkafspraken voor Claude Code

Lees eerst `CONTRIBUTING.md` en daarna `research/REFERENCE-NOTES.md` (ontwerpkeuzes en valkuilen per ronde).

- **Live = branch `main`.** Beveiligd: alleen via pull request, mergen doet Max. Werk nooit op `main`.
- **Nieuwe site = branch `redesign-2026-10`.** Begin elke sessie met `git pull`, eindig met commit en `git push`. Elke push geeft een preview-link in de pull request.
- **Voor elke push twee checks:** `python3 scripts/check-trackers.py` (vijf keer PASS) en `python3 scripts/check-copy.py` (PASS). Faalt er een, dan niet pushen.
- **Nooit aanraken:** de tracker-blokken in de head (Vercel Analytics, GA4, Prospect Pro, Stairoids, LinkedIn, Meta), de cookiebanner (Claydar), Leadboxer en het JSON-LD blok. Die blijven byte-identiek aan `main`.
- **Nooit:** `git push --force`, `git reset --hard`, `git clean`, `.env` of API keys committen. Secrets staan in Vercel.
- **Copy:** Engels, geen em dash, geen emoji, nooit "open rate", merknaam altijd `closed:in`.
- **Lokaal draaien:** `cd scripts && npm install && npx serve -l 8080 ../case-study-showcase`, dan http://localhost:8080. Screenshots en audits: `node scripts/audit.mjs`.
- **Afbeeldingen** onder `/assets/img/` worden zeven dagen gecachet: nieuwe versie is een nieuwe bestandsnaam.
- **Werkverdeling:** werk je tegelijk met iemand anders aan hetzelfde bestand, maak dan een eigen branch vanaf `redesign-2026-10` en open een pull request naar die branch.
