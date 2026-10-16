# Reference sites, what we take from each (scraped 2026-10-16)

Raw material (rendered HTML, stylesheets, computed type scale, full-page screenshots) lives in `research/reference-sites/<site>/` (gitignored, regenerate with `node scripts/scrape-refs.mjs`). This file holds the conclusions.

## Shared patterns

- Light, slightly textured canvas (Dapper #f3f3f3 with grain, Workflows #F4F6F7 with dot haze, Origami #fafafa, Anthropic ivory #faf9f5). White cards with 16 to 24px radius on top of it. Dark used once: the footer (Dennis, Anthropic) or a single feature band (Workflows, Apple).
- One display face, set huge and tight: Dapper h1 ~90px Helvetica Now Display 700 at -0.02em, Dylan 274px condensed, Dennis 216px, Origami 88px serif, Anthropic 61px sans plus 80px serif. Everything else small (12 to 15px labels, 15 to 17px body).
- A second voice for emphasis: italic serif words inside sans headlines (Dapper Ivy Presto, Origami Frank Ruhl Libre, Anthropic Serif), mono for labels (Dylan IBM Plex Mono, Anthropic JetBrains Mono).
- One accent, used as a small object: Dapper green square arrow boxes (#74f5a1), Workflows lime button (#E0FC04), Dennis blue circle (#455CE9). Never as a background.
- Hero = left-aligned statement, object on the right (Dapper plant, Dylan 3D monitor, Apple product), intro paragraph bottom-left, one overlapping proof card bottom-right (Dapper "54% increase", Workflows featured case).
- Proof as numbers in cards: logo plus two metric tiles (Dapper), featured case plus three metrics (Workflows), four stat columns (Origami).
- Motion: Lenis smooth scroll, GSAP reveals, horizontal carousels with arrow buttons, marquee strips (Dylan skewed logo band), magnetic round buttons (Dennis), scroll-bound 3D object (Dapper Spline plant).
- Footer as a destination: Dennis "Let's work together" with a round blue "Get in touch" and contact pills; Dapper rounded dark top edge; Anthropic dark four-column footer.

## Per site

- **dapper.agency** (Webflow, Helvetica Now, #f3f3f3 canvas, green #74f5a1): floating white pill nav centred at the top; eyebrow with icon; three-line 90px headline left; plant object right (Spline, scroll-rotated); intro paragraph and "Discover more" arrow bottom-left; featured case card bottom-right overlapping the hero rule; green pixel squares as decor; Results headline with italic serif word plus text column and carousel arrows; case cards (logo, two metric tiles); services headline plus three white cards; two big white cards (Demand Gen, Demand Capture) with sticky phone; team radial badge diagram; testimonial quote cards with headshots; compare table; rounded dark footer top. The structure we adopt.
- **dylanbrouwer.design** (Webflow, ABC Gravity + Die Grotesk + IBM Plex Mono): dark gradient hero with 274px condensed type over a product render; mono labels with dots; staggered large case images; skewed logo marquee band; service cards with 3D objects; 3D badge in the footer. We take: mono eyebrow labels, the marquee band, image scale.
- **dennissnellenberg.com** (custom, Dennis Sans, #1C1D20 and #455CE9): full-bleed grey hero with portrait and a marquee name; location pill; work list as giant rows with a hover image; round "More work" pill; dark footer "Let's work together" with round blue magnetic button and contact pills. We take: the footer, the round magnetic CTA, the row-list rhythm.
- **workflows.io** (Next.js, Helvetica Neue, #F4F6F7, lime #E0FC04): centred hero with eyebrow pill, two-tone headline (regular + bold words), inline lead form, chips row, "Watch video", trusted-by avatars; featured case card plus customer logo grid; services in a four-cell card; dark "knowledge hub" band with tilted screens; flow diagrams of pills and bezier lines. We take: eyebrow pills, two-tone headline weight, the flow diagram idea for the process.
- **origami.chat** (Next.js, Frank Ruhl Libre + Roboto Flex, #fafafa): 88px serif headline, big product screenshot, trusted-by row, four-column stats card, waterfall cards. We take: serif accent, stats card.
- **anthropic.com** (Webflow, Anthropic Sans + Serif, ivory): left headline with underlined words, serif paragraph on the right, big rounded feature card, three cards with mono DATE/CATEGORY rows, dark footer. We take: headline plus right-aligned paragraph, mono detail rows, the dark footer.
- **apple.com**: tiles that alternate white, #f5f5f7 and black, each one headline + one line + two pill links + product render; nothing else. We take: tile discipline and pill buttons.
