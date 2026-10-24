# Vergelijking: Hugo's "platform-section-kit" versus onze eigen "Outbound that starts from a buying signal"

Datum: 24 oktober 2026. Vraag van Max: Hugo stuurde de code van de services-sectie van forwardingcopilot.com (het stuk rond "buying signals"). Presteert die beter dan wat wij daar nu hebben, in soepelheid, ontwerp en rendersnelheid, en welke van de twee moeten we gebruiken? Alleen onderzoek, niets aangepast.

## 1. Wat Hugo stuurde

Een kit van 2.322 regels TypeScript/React: `PlatformSection.tsx` (de drie panelen: Signal-Driven Acquisition, Visibility System, Autonomous Agents), drie diagrammen (`OutboundFlowDiagram`, `VisibilitySystemDiagram`, `PipelineFlowDiagram`), een nep-LinkedIn-post, een schaalhulp voor mobiel (`FitWidth`) en een hook voor de schermbreedte. Vereiste stack volgens de README: Next.js 15, React 19, Tailwind 3.4, framer-motion 11, lucide-react. De diagrammen laden alleen in de browser (`dynamic(..., { ssr: false })`), kleuren in `oklch`, alle opmaak inline, animaties met framer-motion (spring-animaties en `useInView`, speelt één keer af). De code is schoon: geen netwerkcalls, geen externe URL's, niets dat naar buiten praat.

Belangrijk om te weten: onze eigen sectie is op dit ontwerp gebouwd. Dezelfde opbouw ([01]-label, kop links, flowdiagram in het midden met vier knopen en pillen op de verbindingen, een rail met signalen rechts, puntjesraster, gestippelde scheidingslijnen, "Explore"-link). Wij hebben er twee panelen van gemaakt (buying signal en reply-to-meeting, met per paneel een cijferkaart eronder) in plaats van hun ene signaalpaneel.

## 2. Metingen, beide secties live, dezelfde headless Chrome (24-10)

Onze sectie: www.closedin.io, `#how-it-works`. Hun sectie: www.forwardingcopilot.com, paneel "We prospect for you, signal by signal." Scroll-meting: 3 seconden door de sectie heen scrollen met meting van elke frame.

| Meting | closed:in (desktop / telefoon) | forwardingcopilot (desktop / telefoon) |
|---|---|---|
| Frametijd tijdens scrollen, gemiddeld | 16,7 ms / 16,7 ms | 16,7 ms / 16,7 ms |
| Frames langer dan 33 ms (haperingen) | 0 / 0 | 0 / 0 |
| Lange taken op de hoofdthread tijdens scrollen | 0 ms / 0 ms | 0 ms / 0 ms |
| Layout-verschuiving in de sectie | 0,001 / 0,004 | 0 / 0 |
| Elementen in de sectie | 315 / 315 | 307 / 109 |
| Inline SVG's in de sectie | 48 | 37 / 10 |
| Hoogte van de sectie | 1.673 px / 3.425 px | 700 px / 889 px |
| Kleinste tekst | 10,5 px | 10 px (op telefoon kleiner: het diagram wordt geschaald) |
| JavaScript op de pagina | 410 KB (incl. three.js lazy en trackers) | 218 KB (Next, React, framer-motion) |
| CSS op de pagina | 34 KB | 13 KB |
| Sectie zichtbaar mét JavaScript, na laden | 876 ms (hele pagina geladen) | 396 ms |
| Sectie zichtbaar zónder JavaScript | 91 ms, compleet | nooit: het diagram staat niet in de HTML |

Lees dit zo:

- **Soepelheid:** geen verschil. Beide secties halen elke frame binnen 16,7 ms, zonder lange taken en zonder haperingen. Allebei animeren met transform en opacity; hun framer-motion en onze GSAP/CSS doen hier hetzelfde werk.
- **Rendersnelheid:** de hunne staat eerder op het scherm omdat hun hele pagina lichter is (218 KB JS tegen onze 410 KB, waarvan 190 KB het 3D-merk is dat pas na de opening laadt, en de rest trackers). Dat zit niet in de sectie maar in de pagina eromheen. Zet je hun sectie op onze pagina, dan komt er juist JS bij (React plus framer-motion, zo'n 130 tot 180 KB gecomprimeerd), en ons diagram is er zonder enige JavaScript al.
- **Zonder JavaScript:** hun diagram bestaat niet in de HTML. Google rendert JavaScript wel, maar de AI-crawlers die we juist willen (ChatGPT, Perplexity, Copilot) lezen meestal de kale HTML: daar staat bij hen alleen de kop en de alinea, bij ons de hele flow met alle labels. Voor het SEO/GEO-plan is dat een echt nadeel van hun aanpak.
- **Mobiel:** zij schalen het desktopdiagram met een transform naar de smalle kolom, waardoor de tekst onder de 10 px komt, en de rail met signalen verdwijnt (109 elementen in plaats van 307). Wij laten de kaarten herindelen op volle breedte, leesbaar, maar de sectie is daardoor lang (3.425 px).

## 3. Ontwerp

Zelfde ontwerptaal, want de een komt van de ander. Verschillen die je ziet:

- Zij: één paneel per onderwerp, vier knopen (Signal, Agent, Analysis, Outbound), een "Attended / No-show"-vertakking, rechts een rail met zeven signalen en daaronder isometrische kubusjes als vulling. Groen als accent.
- Wij: twee panelen onder elkaar (signaal naar outreach, reply naar meeting), per paneel een vertakking (Fits ICP / Out of scope, Interested / Later), rechts de rail én een cijferkaart ("120+ data providers", "Within 2 to 3 weeks"). Lichtblauw als accent, witte kaarten in de huisstijl van de rest van de site, de verbindingslijn tekent zich bij het scrollen.
- Hun kaarten en pillen zijn iets fijner getekend (dunne schaduw onder de knopen, puntjestextuur in de icoonvakjes, een handle-bolletje waar de lijn de kaart in- en uitgaat). Dat zijn details van een paar regels CSS, geen andere techniek.
- Hun tekst is kleiner (10 tot 12 px op 34 plekken) en lichter grijs (#9ca3af op wit haalt de contrastnorm niet); onze kleinste tekst is 10,5 px in de monospace-labels, de rest 14 px en groter.

## 4. Technische inpasbaarheid

- Onze site is statische HTML met CSS en een beetje JavaScript, zonder buildstap. De kit is React in Next.js met een Tailwind-build. Om hem letterlijk te gebruiken moeten we óf een React-bundel voor één sectie op een statische pagina zetten (extra JS, hydratie, een buildstap in de deploy, en alle generators en checks kennen dat niet), óf hem met de hand overzetten naar HTML en CSS. Dat laatste is precies wat de huidige sectie al is.
- De kit heeft geen `prefers-reduced-motion`; onze site zet dan alle animaties uit. De kit gebruikt `oklch`-kleuren (Safari vanaf 15.4, verder prima) en `next/image` voor het logo in de Agent-knoop (bij overzetten gewoon een `img`).
- Copy aanpassen zit bij hen in props in een TSX-bestand; bij ons in de HTML van `index.html`.

## 5. Advies

Houden wat we hebben. De meting laat geen enkel verschil in soepelheid zien, de rendersnelheid van hun pagina komt uit het gewicht van de rest van hun site en niet uit de sectie, en hun manier van bouwen (alleen in de browser gerenderd, React in een statische site) zou ons op twee punten achteruitzetten: leesbaarheid voor AI-crawlers en een buildstap die niet in onze werkwijze past.

Wat we wél van de kit kunnen overnemen, als je dat mooi vindt, in een uur CSS zonder techniek te wisselen:
1. De dunne schaduw onder de knopen en de handle-bolletjes op de verbindingen (hun diagram oogt daardoor iets "echter").
2. De puntjestextuur in de icoonvakjes.
3. Het spring-effect waarmee de verbindingslijn zich tekent bij het eerste zien (wij tekenen hem nu lineair met de scroll).

Twee dingen die wij beter doen en die we moeten houden: de kaarten herindelen op telefoon in plaats van schalen, en het hele diagram in de HTML zelf.

Bestanden: Hugo's kit staat gekopieerd in de scratchpad van deze sessie (`kit-in/platform-section-kit`), de meetresultaten in `kit-cmp/results.json` met screenshots per sectie (desktop en telefoon). De originele map in Downloads is onaangeroerd.
