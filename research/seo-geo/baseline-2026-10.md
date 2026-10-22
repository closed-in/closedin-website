# SEO en GEO: nulmeting en maandelijkse check

Gestart 22 oktober 2026. Doel: hoger op "GTM engineering agency", "go-to-market" en "outbound agency", beter geïndexeerd, vaker genoemd en aanbevolen door AI-tools. Wat er op de site is gedaan staat in `research/REFERENCE-NOTES.md` (v4.45).

## 0. Stand 22-10 (uit Max' schermafbeeldingen)

- Search Console en Bing Webmaster Tools zijn al gekoppeld. Sitemap ingediend op 5 mei 2026, laatst gelezen 14 oktober, 37 pagina's ontdekt, 21 geïndexeerd, 167 niet geïndexeerd. Bing: 318 vertoningen en 0 klikken sinds augustus; waarschuwingen: IndexNow niet ingesteld (de sleutel staat op de branch, live na de merge), te weinig inkomende links van goede domeinen (off-site), veel te korte paginatitels (22-10 verlengd).
- Bing AI Performance (Copilot en partners, 3 maanden t/m 22-10): 149 citaties, de eerste half augustus, piek eind september. 133 van de 149 gaan naar /resources/gtm-stack, de rest naar apollo-booleans (6), sales-nav-booleans (5) en /clay-agency (5); geen andere dienstpagina wordt geciteerd. De vragen waarop Copilot ons aanhaalt: "2026 pricing GTM stack tools enrichment" (38 citaties, aandeel 38,78%) en "best GTM stack tools 2026 pricing enrichment" (7, aandeel 24,14%). Bing deelt de site in bij het onderwerp Enterprise Software (ERP, CRM) en stelt als kansen alleen CRM-software-zoekopdrachten voor: dat is de classificatie van de stackpagina, niet onze markt, dus niet najagen. Les: concrete tool- en prijslijsten worden geciteerd, dienstpagina's niet. Daarom kreeg de stackpagina 22-10 kaarten naar de GTM-dienst, de Clay-dienst en pricing, en is de tooltelling rechtgezet (24, niet 32).
- Gevonden bij het nalopen: `closedin.io` zonder www geeft een 200 in plaats van een redirect naar `www.closedin.io`, dus elke pagina bestaat voor Google twee keer. Redirect toegevoegd in `vercel.json` (live na de merge); in het Vercel-dashboard kan hij eerder (Domains, closedin.io, Redirect to www.closedin.io).
- Nog uit te zoeken: de redenen achter de 167 niet-geïndexeerde URL's (Search Console, Pagina's, Volledig rapport). Verwacht: dubbele niet-www-pagina's, oude `.html`- en `/blog/`-adressen die doorverwijzen, oude Framer-adressen die 404 geven.

## 1. Eenmalig inrichten (Max, klikpaden; grotendeels al gedaan)

**Google Search Console**
1. Ga naar search.google.com/search-console, klik linksboven op het property-menu, "Property toevoegen".
2. Kies "URL-voorvoegsel", vul `https://www.closedin.io/` in, klik Doorgaan.
3. Kies de methode "HTML-bestand", klik Download. Stuur het bestand (`google<code>.html`) naar mij of zet het zelf in `case-study-showcase/` in de repo; na de merge klik je "Verifiëren".
4. Daarna: linkermenu "Sitemaps", vul `sitemap.xml` in, Verzenden.

**Bing Webmaster Tools** (de index waar ChatGPT en Copilot uit putten)
1. Ga naar www.bing.com/webmasters, log in met het Google-account van closed:in, kies "Importeren uit Google Search Console" (één klik, neemt de verificatie en de sitemap over).
2. Lukt dat niet: "Site toevoegen", `https://www.closedin.io`, methode XML-bestand (`BingSiteAuth.xml`), zelfde route als bij Google.
3. In Bing: "IndexNow" in het linkermenu laat zien of de sleutel gevonden is (`https://www.closedin.io/a9876328c11455fd999a21b4e5b84a30.txt`, staat in de repo).

**GA4, kanaal "AI" zodat verwijzingen uit AI-tools apart zichtbaar zijn**
1. GA4, Beheer (tandwiel), kolom Property, "Gegevensweergave", "Kanaalgroepen", "Nieuwe kanaalgroep maken".
2. Naam "Met AI". Klik "Kanaal toevoegen", naam "AI", voorwaarde: Bron bevat één van `chatgpt.com`, `openai.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`, `claude.ai`, `bing.com/chat`. Sleep het kanaal naar boven (boven Verwijzing), opslaan.
3. Rapporten, Acquisitie, "Verkeersacquisitie", kies bovenin de dimensie "Sessie: standaardkanaalgroep (Met AI)".

**Na elke merge naar main**
- `node scripts/indexnow.mjs --changed <laatste-main-commit>` meldt de gewijzigde pagina's bij Bing (en de engines die IndexNow delen). Alleen voor de live site.
- In Search Console: "URL-inspectie" op de homepage, `/gtm-engineering-agency` en `/outbound-agency`, "Indexering aanvragen".

## 2. Nulmeting (invullen zodra de consoles staan)

| Meting | Bron | 22-10-2026 | +4 weken | +8 weken |
|---|---|---|---|---|
| Klikken en vertoningen op "gtm engineering agency" | Search Console, Prestaties, filter op zoekopdracht | | | |
| Idem "go-to-market agency" / "go to market agency" | Search Console | | | |
| Idem "outbound agency" | Search Console | | | |
| Idem "cold email agency" | Search Console | | | |
| Gemiddelde positie van /gtm-engineering-agency en /outbound-agency | Search Console, Pagina's | | | |
| Pagina's geïndexeerd (Google) | Search Console, Pagina's | | | |
| Pagina's geïndexeerd (Bing) | Bing Webmaster, Site Explorer | | | |
| Citaties door Copilot, 3 maanden | Bing Webmaster, AI Performance, Citations & Pages | 149 | | |
| Pagina's die Copilot citeert | idem, lijst Pages | 4 (gtm-stack 133) | | |
| Sessies uit kanaal "AI" | GA4, Verkeersacquisitie | | | |
| Boekingsklikken uit kanaal "AI" | GA4, event book_call_click, dimensie kanaal | | | |

## 3. Maandelijkse AI-check (eerste werkdag van de maand, een kwartier)

Stel elke vraag in ChatGPT (met zoeken aan), Perplexity en Google AI Mode. Noteer: wordt closed:in genoemd (ja/nee), op welke plek, en welke bron de tool citeert. Nieuwe venster of incognito, zodat de geschiedenis niet meespeelt.

Noteer dezelfde dag ook de Bing-cijfers: Bing Webmaster Tools, AI Performance, tabblad Citations & Pages, periode 30 D: totaal citaties en de lijst Pages (welke pagina's Copilot aanhaalt). Dat is de enige harde teller voor AI-vermeldingen die we hebben; de rest is handwerk.

1. What is a GTM engineering agency and which ones are good in Europe?
2. Best GTM engineering agency in the Netherlands
3. Best outbound agency for B2B SaaS in Europe
4. Cold email agency in Amsterdam for B2B companies
5. Clay Solutions Partner agency that builds outbound systems
6. Outbound agency UK for mid-market B2B companies
7. What does an outbound agency cost per month?
8. Which agency should I hire instead of a first SDR?

| Datum | Vraag | ChatGPT | Perplexity | Google AI Mode | Bron die genoemd wordt |
|---|---|---|---|---|---|
| 2026-10-22 | 1 | nee | nee | nee | Understory, European Business Magazine, Ninja Promo |
| 2026-10-22 | 2 | | | | SyncGTM-lijst (geen closed:in), Salesforge Clay-lijst NL (wel closed:in) |

(De regels van 22-10 komen uit de webzoektocht bij de audit; de volledige eerste ronde in de drie tools doet Max of ik bij de volgende check.)

## 4. Nieuwe content (twee per maand)

Onderwerpen in volgorde, elk met de vraag die AI-tools ervoor krijgen:
1. What is GTM engineering? (and what a GTM engineering agency actually does) → /gtm-engineering-agency
2. GTM engineering agency vs hiring SDRs: the real cost in 2026 → /pricing
3. What an outbound agency does, step by step (from list to booked meeting) → /outbound-agency
4. Go-to-market for B2B service companies: the system we run for 50+ clients → /gtm-engineering-agency

Werkwijze: Max levert ruwe input (transcript, LinkedIn-post, voice memo), ik schrijf het stuk als markdown met front matter, `python3 scripts/new-post.py <bestand> --write` zet het live-klaar (pagina, blogindex, llms.txt, sitemap, feed), daarna het previewbeeld en de checks. Elk stuk: antwoord in de eerste 150 woorden, eigen cijfers met datum, een klantcase, auteur en datum zichtbaar.
