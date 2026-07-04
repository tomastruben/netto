# Tax insights panel + optimisation guide — design

Date: 2026-07-04 · Status: approved in chat ("both"), building panel first

## Problem

The official-data engine (see the v2 update in the calculator design doc) surfaces
facts users never see spelled out: what a pillar-3a payment is worth *to them*,
how much their canton choice costs, that Geneva taxes a single at 15% and a
family at 2% for the same salary. Today the app shows results, not levers.

## Decisions

1. **Two deliverables.** (a) A computed "tax levers" panel in the calculator —
   personal, from the user's own inputs, via the existing engine. (b) A static
   guide page per locale (`/[locale]/guide`) — the same levers as prose, with
   tables computed from the official curves at build time. Panel ships first.
2. **Panel insights (each conditional, one line):**
   - Pillar 3a: tax saved by the max contribution (CHF 7'258, 2026) — shown when
     savings ≥ CHF 200. Sits directly above the existing 3a affiliate card.
   - Canton lever: net gain in the cheapest canton for this profile — shown when
     ≥ CHF 500/year and the user isn't already there.
   - Family gap: single vs married+2-kids burden at the user's salary — shown
     when the gap ≥ 5 percentage points (GE/VD/FR/VS territory).
   - Church cost: for members, the factor-implied yearly cost — shown ≥ CHF 100.
   - QST 13th month: in month-model cantons with a 13th salary on withholding,
     the December double-month rate vs the normal month.
   - Disclaimer line; each insight links to its guide section.
3. **Guide** (`/guide`, all four locales, same slug): sections `#pillar-3a`,
   `#canton`, `#family`, `#church`, `#withholding`, `#limits`. Two computed
   tables from `TAX_CURVES` (single@100k ranking extremes; married+2kids@100k
   cheapest capitals). Claims carry "see it with your numbers" links back to the
   calculator's URL state (`/?c=GE&m=1&k=2`). Content voice: terse, numbers
   first; Tomas polishes the copy after the draft lands.
4. **Engine surface:** one new export `pillar3aSavings(input)` plus
   `pillar3aMax: 7_258` in `CONST_2026` (BSV, unchanged from 2025). Insight
   selection is a pure, tested function in `lib/salary/insights.ts` returning
   typed descriptors; the component only renders dictionary templates.
5. **Out of scope:** commune granularity, BVG buy-ins, Grenzgänger, per-canton
   guide subpages (possible later SEO expansion).

## Testing

TDD on `pillar3aSavings` and `computeInsights` (thresholds, canton conditions,
QST month-model gating). UI verified in the browser preview; guide prerender
verified by `next build`.
