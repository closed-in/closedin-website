# closedin.io

De website van closed:in, GTM engineering agency in Amsterdam. Statische HTML, CSS en JavaScript op Vercel, zonder build-stap.

## Waar staat wat

- `case-study-showcase/`: de site zelf (de Vercel-root). 37 pagina's; `assets/css` (`site.css` plus een blad per paginatype), `assets/js` (`site.js`, `veil.js` voor de paginatransitie, `stack.js`, `mark-dark.js` voor het 3D-merk), `assets/img`, `assets/vendor` (GSAP, Lenis en three.js met vast versienummer), `api/` (serverless: nieuwsbrief via Beehiiv, e-mailverifier) en `vercel.json` (redirects, headers, cache).
- `scripts/`: de checks (`check-trackers.py`, `check-copy.py`, `check-links.mjs`, `audit.mjs`), de eenmalige generators waarmee de pagina's naar het nieuwe ontwerp zijn omgezet, `og-images.mjs` voor de linkpreviews en `sync-chrome.py` voor menu en footer op alle pagina's.
- `research/`: ontwerpkeuzes en valkuilen per ronde (`REFERENCE-NOTES.md`) en de audits.

## Werken aan de site

Lees eerst `CLAUDE.md` (werkafspraken) en `CONTRIBUTING.md`. Kort: werk op een branch, `main` is live en gaat alleen via een pull request die Max merget; draai voor elke push `python3 scripts/check-trackers.py` en `python3 scripts/check-copy.py`.

Lokaal bekijken: `cd scripts && npm install && npx serve -l 8080 ../case-study-showcase`, dan http://localhost:8080.
