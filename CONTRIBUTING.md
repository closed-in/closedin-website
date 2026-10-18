# Samenwerken aan closedin.io

**Live = `main`.** Alles wat op `main` staat, staat binnen een minuut op closedin.io. Daarom is `main` beveiligd: alleen via een pull request, en live zetten doet Max.

**Nieuwe site = branch `redesign-2026-10`.** Daar werken we samen. Elke push geeft een nieuwe preview-link (reactie van Vercel in de pull request).

## Starten

```
git clone https://github.com/closed-in/closedin-website.git
cd closedin-website
git switch redesign-2026-10
cd scripts && npm install && npx serve -l 8080 ../case-study-showcase
```

Daarna draait de site op http://localhost:8080.

## Elke werksessie

1. Voor je begint: `git pull`.
2. Werk in kleine stappen, commit met een duidelijke boodschap.
3. Voor het pushen twee checks, allebei moeten slagen:
   `python3 scripts/check-trackers.py` (vijf keer PASS) en `python3 scripts/check-copy.py` (PASS).
4. `git push`. Kijk de preview-link na in de pull request.

Optioneel voor een hele controle: `node scripts/audit.mjs` (met de lokale server aan).

## Nooit aanraken

- De tracker-blokken in de head (Vercel Analytics, GA4, Prospect Pro, Stairoids, LinkedIn, Meta), de cookiebanner (Claydar), Leadboxer en het JSON-LD blok. Die moeten byte-identiek blijven aan `main`; `check-trackers.py` controleert dat.
- `git push --force`, `git reset --hard`, `git clean`: niet gebruiken.
- Geen `.env`, API keys of wachtwoorden in de repo. Secrets staan in Vercel.

## Huisregels copy

Geen em dash, geen emoji, nooit "open rate", merknaam altijd `closed:in` (kleine letters, met dubbele punt). Engels op de site, de cookiebanner blijft Nederlands.

## Waar wat staat

- `case-study-showcase/index.html`: de nieuwe homepage.
- `case-study-showcase/assets/css/site.css`: tokens, nav, knoppen, logo, transitie.
- `case-study-showcase/assets/css/home.css`: de homepage-secties.
- `case-study-showcase/assets/js/site.js`: gedrag (transitie, carrousels, video, flows).
- `research/REFERENCE-NOTES.md`: ontwerpnotities en valkuilen per ronde, lees dit eerst.
- Afbeeldingen onder `/assets/img/` worden zeven dagen gecachet: nieuwe versie is een nieuwe bestandsnaam.
