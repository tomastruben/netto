# netto. — Swiss net salary calculator

Transparent gross-to-net salary calculator for Switzerland, 2026. All 26 cantons,
four languages (DE/EN/FR/IT), every deduction shown with its rate. Everything is
computed client-side — no backend, no data leaves the browser.

## Stack

Next.js 16 (App Router, static prerender per locale) · React 19 · Tailwind 4 ·
shadcn/ui (Base UI primitives) · vitest.

## Develop

```bash
npm run dev     # dev server on :3000 (routes: /de /en /fr /it)
npm test        # engine tests
npm run build   # static production build
```

## Where things live

- `lib/salary/constants.ts` — 2026 federal parameters (update once a year)
- `lib/salary/cantons.ts` — per-canton names, church-tax modes, child
  allowances (BSV table 1.1.2026)
- `lib/salary/tax-curves.ts` — generated: official ESTV income-tax burden
  curves per household profile (canton capitals, TaxYear 2026)
- `lib/salary/qst-tariffs.ts` — generated: official 2026 withholding tariffs
  (delta-encoded knots per tariff code)
- `lib/salary/engine.ts` — pure calculation functions + canton comparison
- `lib/salary/insights.ts` — per-profile "tax lever" facts for the results panel
- `lib/guide-content.ts` + `app/[locale]/guide/` — tax-optimisation guide
  (four locales, tables computed from the official curves)
- `scripts/` — yearly data refresh (`refresh-tax-curves.mjs`,
  `refresh-qst-tariffs.mjs`; run each January for the new tax year)
- `lib/i18n.ts` — all four language dictionaries
- `components/calculator/` — form, results, canton comparison, monetization slots
- `docs/specs/` — design doc (research findings, v1 decisions, v2 path)

## Accuracy model

Social insurance (AHV/IV/EO, ALV, NBU, KTG, BVG) is exact per the published 2026
parameters. Ordinary income tax interpolates official ESTV burden curves (TaxYear
2026, canton capitals; single / married / married+2-children / two-earner
profiles) and is labeled with its canton-capital scope in the UI. Withholding tax
(B/L permits) follows the official 2026 QST tariff files per tariff code (A/B/C/H,
children, church), with the month vs. annual model per canton, within ±0.26
percentage points of the exact bracket rates. Child allowances per the BSV table
of 1.1.2026. Official reference values are pinned as tests in
`lib/salary/__tests__/tax-reference.test.ts`. Not modeled: commune-level
multipliers (v3 path), Grenzgänger specials — see the design doc.

## Sharing

Calculator state lives in the URL (`?g=12000&c=GE&a=40&k=2&m=1`), so results are
shareable and language switching preserves inputs.
