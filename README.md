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
- `lib/salary/cantons.ts` — per-canton tax curves (estimates, canton capitals),
  church-tax modes, child allowances
- `lib/salary/engine.ts` — pure calculation functions + canton comparison
- `lib/i18n.ts` — all four language dictionaries
- `components/calculator/` — form, results, canton comparison, monetization slots
- `docs/specs/` — design doc (research findings, v1 decisions, v2 path)

## Accuracy model (v1)

Social insurance (AHV/IV/EO, ALV, NBU, KTG, BVG) is exact per the published 2026
parameters. Income tax / withholding tax is an interpolated estimate for the canton
capital and is labeled as such in the UI, linking to the official ESTV calculator.
v2 path: ingest the official ESTV QST tariff files (tar26xx.txt) and per-commune
multipliers — see the design doc.

## Sharing

Calculator state lives in the URL (`?g=12000&c=GE&a=40&k=2&m=1`), so results are
shareable and language switching preserves inputs.
