# Design QA

Source visual truth: `C:\Users\billo\.codex\generated_images\019f99cc-84cd-7ce0-84f3-ff87d913fc51\call_or5UFqYrFY709U5FrJ3PAj8Q.png`

Implementation evidence:

- Desktop: `D:\代码\Daily\.codex\redesign-qa\final-home-2.png`
- Mobile home: `D:\代码\Daily\.codex\redesign-qa\mobile-final.png`
- Mobile finance: `D:\代码\Daily\.codex\redesign-qa\mobile-finance.png`
- Final side-by-side comparison: `D:\代码\Daily\.codex\redesign-qa\compare-final-2.png`

Viewport and normalization:

- Source pixels: 1487 × 1058.
- Desktop implementation pixels: 1487 × 1058.
- Desktop CSS viewport: 1488 × 1058 at deviceScaleFactor 1.
- Mobile CSS viewport: 390 × 844 at deviceScaleFactor 1.
- The final desktop comparison uses equal-size, unscaled source and implementation images.

State:

- Today view, light theme, 2026-07-26, “产品设计评审会” selected.
- Finance view uses realistic account, credit-card and loan data.

## Full-view comparison

The implementation matches the selected concept’s primary composition: full-width top navigation, horizontal week rail, large day timeline, persistent contextual detail panel, floating quick-entry card and bottom life/finance pulse. Region proportions, warm ivory canvas, teal selection treatment, thin borders and restrained typography are consistent with the source.

## Focused comparison

- Header and week rail: hierarchy, active underline, date emphasis and plant avatar match. Navigation arrows from the source are omitted as non-blocking P3 polish.
- Timeline: selected row, time scale, finance alert treatment, category metadata and schedule density match after iteration.
- Detail panel: related-note and financial-impact blocks preserve the source hierarchy and action placement.
- Life pulse: the three-column information architecture matches. The source’s tiny finance sparkline is simplified to text and directional values; detailed financial analysis is available in the integrated Finance view.
- Mobile: the week rail becomes horizontally scrollable with today first, the timeline remains readable, and persistent bottom navigation does not hide primary controls.

## Required fidelity surfaces

- Fonts and typography: serif display hierarchy and compact sans-serif UI text match the reference’s editorial character. Weight, wrapping and truncation remain readable at desktop and mobile widths.
- Spacing and layout rhythm: header, week rail, timeline, detail rail and life pulse align to the source. Composer positioning was corrected from document flow to an anchored overlay.
- Colors and visual tokens: warm ivory, paper white, muted teal, soft blue selection and semantic red are consistently tokenized.
- Image quality and asset fidelity: the plant avatar is a generated 512 × 512 raster asset and stays crisp at 40 × 40. No placeholder image assets remain.
- Copy and content: all visible product copy is readable Chinese with realistic planner and financial data; no mojibake appears in the rebuilt experience.

## Comparison history

### Pass 1 — blocked

- P1: the quick-entry card participated in normal flow, making the main region about 120 px taller than the source and pushing the life pulse below the target viewport.
- P2: the selected timeline item lacked the teal time emphasis and inner selection dot.
- P2: lunch and bedtime rows were missing, changing the timeline’s rhythm.
- P2: mobile week navigation opened on Monday and did not expose today.

Fixes:

- Anchored the desktop quick-entry card inside the day column.
- Added the selected time and dot states.
- Added lunch, family dinner and bedtime context rows and sorted the schedule by time.
- Made the mobile week rail horizontally scrollable and placed today first.

### Pass 2 — passed

- Desktop source and implementation were compared at matching 1487 × 1058 pixels.
- No actionable P0, P1 or P2 differences remain.

## Primary interactions tested

- Today, Plan, Calendar, Finance and Review navigation.
- Quick Record opens the note editor.
- Account card opens the balance editor.
- A bank balance was changed from ¥28,680 to ¥30,000 and the saved value was rendered.
- Desktop 1488 × 1058, mobile home 390 × 844 and mobile finance 390 × 844.
- Browser console checked after interaction testing: no errors.

## Follow-up polish

- P3: add subtle previous/next controls to the desktop week rail.
- P3: add a compact net-worth sparkline to the Life Pulse footer.

final result: passed
