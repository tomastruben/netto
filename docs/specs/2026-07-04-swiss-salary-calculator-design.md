# Swiss Net Salary Calculator — v1 Design

Date: 2026-07-04 · Status: implemented as v1, pending Tomas review

> **Update (2026-07-04, v2 tax data):** income tax now runs on official data.
> Ordinary curves are generated per household profile (single / married sole /
> married+2kids / married 50-50) from the ESTV calculator, TaxYear 2026, canton
> capitals (`scripts/refresh-tax-curves.mjs` → `lib/salary/tax-curves.ts`);
> withholding tax is computed from the official 2026 QST tariff files, codes
> A/B/C/H incl. church variants and the month/annual model split
> (`scripts/refresh-qst-tariffs.mjs` → `lib/salary/qst-tariffs.ts`); child
> allowances follow the BSV table of 1.1.2026. Reference tests pin official
> values in `lib/salary/__tests__/tax-reference.test.ts`. Still out of scope:
> commune selector, Grenzgänger specials.

## Problem

People in (or moving to) Switzerland cannot easily answer "what lands in my account from a
CHF X gross salary?" The answer depends on federally uniform social insurance, canton- and
commune-level income tax, permit type (withholding vs. ordinary taxation), age (pension
credits), family situation, and church membership. Existing tools (lohncomputer.ch,
comparis.ch, ESTV) are either coarse, ugly, single-language-first, or government-grade
complex. None shows a transparent per-component breakdown or side-by-side canton
comparison in a modern UI.

## Research findings that shaped the design

All domain parameters extracted from primary sources (BSV/ESTV/AHV-IV, July 2026):

- **Federally uniform (exact math possible):** AHV/IV/EO 5.3% employee (10.6% split 50/50),
  ALV 1.1% employee up to CHF 148'200, NBU capped at CHF 148'200 (rate is
  employer-specific, typically 0.7–1.7%), BVG entry CHF 22'680 / coordination CHF 26'460 /
  max CHF 90'720 / credits 7-10-15-18% by age band. 2026 values = 2025 values (BSV
  confirmed; next adjustment expected 2027). Family allowance federal minimums CHF 215
  (child) / CHF 268 (education), cantons may set higher → per-canton table.
- **Canton/commune-varying (estimate in v1):** income tax = einfache Steuer × Steuerfuss
  multipliers (canton + commune + church parish); federal layer uniform (max 11.5%).
  Official per-municipality reference: swisstaxcalculator.estv.admin.ch. QST (withholding)
  tariffs are per-canton; ESTV publishes machine-readable tariff files (tar26xx.txt) — the
  ingestion path for v2 exactness.
- **Church tax quirk:** GE, NE, VD, VS, TI publish QST tariffs only WITHOUT church tax;
  JU only WITH. → church toggle is disabled (off) in those five cantons, forced-on in JU.
- **Competitor bar:** lohncomputer.ch asks 6 inputs, shows no component rates, no commune
  granularity, targets German migrants/Grenzgänger, ships DE/EN/FR/IT/ES, monetizes via
  health-insurance + relocation + CV lead-gen forms.

## Decisions

1. **Positioning:** "The transparent one." Every deduction line shows its rate, ceiling and
   a plain-language explanation. Everything computes client-side — *your salary never
   leaves your browser* (privacy as a feature, and zero server cost).
2. **v1 precision model:** social insurance exact (2026 params); income tax estimated by
   piecewise-linear interpolation over embedded burden curves per canton capital
   (single/married/kids modeled via factors), clearly labeled "estimate — canton capital"
   with a link to the official ESTV calculator. QST mode reuses the same estimate (QST
   tariffs are themselves canton-averaged) with an explanatory note. v2 ingests official
   ESTV QST tariff files + per-commune multipliers for exactness.
3. **Inputs (core 7 + advanced):** gross (monthly/annual toggle), 13th salary, age,
   canton, marital status + double-income, children, church membership. Advanced
   accordion: NBU rate, KTG rate, BVG employee share, permit type (Swiss/C vs. B/L → QST
   labeling).
4. **Outputs:** net monthly/annual hero number; deduction table with rates; stacked
   breakdown chart; employer-cost view (differentiator: what the employer actually pays);
   all-26-canton net comparison ranked for the user's profile (differentiator); child
   allowances as income line.
5. **Languages:** DE (default), EN, FR, IT via `/[locale]` routes + hreflang. EN is
   first-class (expat audience is the highest-value ad/affiliate segment). ES possible
   later (lohncomputer validates it).
6. **Monetization (v1 = placeholders, no tracking):** (a) two reserved display-ad slots —
   below results + sidebar on desktop; (b) affiliate cards: pillar 3a (VIAC/finpension/
   frankly), health insurance comparison, relocation services — the exact verticals
   lohncomputer proves; (c) B2B later: embeddable widget for job boards/relocation
   agencies, employer-cost calculator as the hook. Ads only after traffic exists.
7. **Design language:** Swiss International Style — structural grid, generous white,
   near-black ink, one Swiss-red accent, hairline rules, Geist Sans + Geist Mono with
   tabular numerals for every figure, `1'234.55` de-CH number formatting, 0.05 rounding
   on displayed CHF. Light default, dark available. shadcn/ui new-york components
   (incl. Field, Item, ButtonGroup, Empty, Chart).

## Architecture

- Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui; no backend, no database.
- `lib/salary/engine.ts` — pure functions: `socialDeductions()`, `calcSalary()`.
- `lib/salary/constants.ts` — 2026 federal parameters (single file to update yearly).
- `lib/salary/cantons.ts` — per-canton data: tax burden curves (canton capital,
  fed+canton+commune, no church), church factor + availability, child allowance,
  names in 4 languages.
- `lib/salary/interpolate.ts` — piecewise-linear rate interpolation.
- `lib/i18n/` — dictionaries DE/EN/FR/IT, `/[locale]` static params, no i18n library.
- `components/calculator/` — form, results, breakdown chart, canton comparison,
  employer view, ad/affiliate placeholders.
- Tests: vitest on the engine (`npm test`).

## Error handling & edge cases

- Gross below BVG entry threshold → no BVG line (legally correct), note shown.
- Gross above ALV/UVG ceiling → capped amounts, ceiling shown on the line.
- Age < 25 → no BVG savings credit (risk premiums ignored in v1, noted).
- Church toggle disabled for GE/NE/VD/VS/TI, forced for JU.
- Zero/invalid input → empty state, no NaN anywhere (guarded).

## Out of scope for v1

Commune-level selector, exact QST tariff-file math, Grenzgänger specials (DE/FR/IT
cross-border agreements), 3a/tax-optimization simulator, PDF export, salary benchmarking.
