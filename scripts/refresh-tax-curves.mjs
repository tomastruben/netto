#!/usr/bin/env node
/**
 * Regenerates lib/salary/tax-curves.ts from the official ESTV tax calculator
 * (swisstaxcalculator.estv.admin.ch — the engine behind the "Steuerbelastung
 * in den Kantonshauptorten" statistics).
 *
 * For every canton capital it sweeps four household profiles over a gross-
 * income grid (employee, standard deductions only, no church tax) and stores
 * the effective burden (TotalTax / gross):
 *   single     – unmarried, no children
 *   married    – married, sole earner, no children
 *   family     – married, sole earner, 2 children
 *   twoEarner  – married, both earn 50/50 (keyed by HOUSEHOLD income)
 * plus the church surcharge factor derived from the official parish
 * multipliers at 100k.
 *
 * Usage:  node scripts/refresh-tax-curves.mjs [year]
 * Run it each January once ESTV activates the new tax year. Results are
 * cached per canton in $TMPDIR/swiss-salary-tax-cache-<year>/ so an aborted
 * run resumes instead of re-fetching (~1000 requests, ~8 min).
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const YEAR = Number(process.argv[2] ?? 2026);
const OUT = new URL("../lib/salary/tax-curves.ts", import.meta.url).pathname;
const CACHE = path.join(os.tmpdir(), `swiss-salary-tax-cache-${YEAR}`);
const BASE =
  "https://swisstaxcalculator.estv.admin.ch/delegate/ost-integration/v1/lg-proxy/operation/c3b67379_ESTV";

const CAPITALS = {
  ZH: "Zürich", BE: "Bern", LU: "Luzern", UR: "Altdorf", SZ: "Schwyz",
  OW: "Sarnen", NW: "Stans", GL: "Glarus", ZG: "Zug", FR: "Fribourg",
  SO: "Solothurn", BS: "Basel", BL: "Liestal", SH: "Schaffhausen",
  AR: "Herisau", AI: "Appenzell", SG: "St. Gallen", GR: "Chur",
  AG: "Aarau", TG: "Frauenfeld", TI: "Bellinzona", VD: "Lausanne",
  VS: "Sion", NE: "Neuchâtel", GE: "Genève", JU: "Delémont",
};
// Cantons where the QST tariff files publish no church variant; the church
// toggle is disabled there, so no ordinary-tax factor is applied either.
const NO_CHURCH = new Set(["GE", "NE", "VD", "VS", "TI"]);

const SINGLE_GRID = [20000, 35000, 50000, 65000, 80000, 100000, 120000, 145000, 175000, 220000, 300000, 500000];
const MARRIED_GRID = [50000, 70000, 90000, 115000, 145000, 185000, 250000, 400000];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(op, body, attempt = 0) {
  try {
    const res = await fetch(`${BASE}/${op}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const json = JSON.parse(await res.text());
    if (!json.response) throw new Error(`empty response from ${op}`);
    return json.response;
  } catch (e) {
    if (attempt < 5) {
      await sleep(2000 * (attempt + 1));
      return post(op, body, attempt + 1);
    }
    throw e;
  }
}

const norm = (s) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

async function locationId(canton, city) {
  const list = await post("API_searchLocation", { Search: city });
  const hit =
    list.find((l) => l.Canton === canton && norm(l.City) === norm(city)) ??
    list.find((l) => l.Canton === canton && norm(l.City).startsWith(norm(city)));
  if (!hit) throw new Error(`no tax location for ${city} (${canton})`);
  return hit.TaxLocationID;
}

async function burden(loc, o) {
  const r = await post("API_calculateDetailedTaxes", {
    SimKey: null,
    TaxYear: YEAR,
    TaxLocationID: loc,
    Relationship: o.married ? 2 : 1,
    Confession1: 4, // no confession — church handled via the factor
    Children: (o.kids ?? []).map((a) => ({ Age: a })),
    Age1: 30,
    RevenueType1: 1, // employed
    Revenue1: o.gross,
    Fortune: 0,
    Language: "de",
    Confession2: o.married ? 4 : 0,
    Age2: o.married ? 30 : 0,
    RevenueType2: o.married && o.gross2 ? 1 : 0,
    Revenue2: o.married ? o.gross2 ?? 0 : 0,
  });
  if (r.Diagnosis) console.error(`  diagnosis (${JSON.stringify(o)}): ${r.Diagnosis}`);
  return {
    total: r.TotalTax,
    simple: r.IncomeSimpleTaxCanton,
    rateP: r.TaxRates?.IncomeRateProtestant ?? 0,
    rateR: r.TaxRates?.IncomeRateRoman ?? 0,
  };
}

async function sweepCanton(canton, city) {
  const file = path.join(CACHE, `${canton}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  const loc = await locationId(canton, city);
  const c = { single: [], married: [], family: [], twoEarner: [] };
  for (const g of SINGLE_GRID) { c.single.push([g, await burden(loc, { gross: g })]); await sleep(220); }
  for (const g of MARRIED_GRID) { c.married.push([g, await burden(loc, { gross: g, married: true })]); await sleep(220); }
  for (const g of MARRIED_GRID) { c.family.push([g, await burden(loc, { gross: g, married: true, kids: [6, 9] })]); await sleep(220); }
  for (const g of MARRIED_GRID) { c.twoEarner.push([g, await burden(loc, { gross: g / 2, gross2: g / 2, married: true })]); await sleep(220); }
  fs.writeFileSync(file, JSON.stringify(c));
  console.log(`${canton} swept`);
  return c;
}

const round5 = (x) => Math.round(x * 1e5) / 1e5;
const curve = (pts) => `[${pts.map(([g, b]) => `[${g}, ${round5(b.total / g).toFixed(5)}]`).join(", ")}]`;

fs.mkdirSync(CACHE, { recursive: true });
const cantons = {};
for (const [canton, city] of Object.entries(CAPITALS)) cantons[canton] = await sweepCanton(canton, city);

let body = "";
for (const [canton, c] of Object.entries(cantons)) {
  const ref = c.single.find(([g]) => g === 100000)[1];
  const churchFactor = NO_CHURCH.has(canton)
    ? 1
    : round5(1 + (((ref.rateP + ref.rateR) / 2) / 100) * (ref.simple / ref.total));
  body += `  ${canton}: {\n`;
  body += `    single: ${curve(c.single)},\n`;
  body += `    married: ${curve(c.married)},\n`;
  body += `    family: ${curve(c.family)},\n`;
  body += `    twoEarner: ${curve(c.twoEarner)},\n`;
  body += `    churchFactor: ${churchFactor},\n  },\n`;
}

const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node scripts/refresh-tax-curves.mjs ${YEAR}
 * Generated from the official ESTV tax calculator (TaxYear ${YEAR}), canton
 * capitals, employee with standard deductions, no church tax.
 *
 * Effective income-tax burden (direct federal + cantonal + communal +
 * Personalsteuer) as a share of GROSS employment income, per household
 * profile. \`twoEarner\` is keyed by HOUSEHOLD income (both partners earning
 * 50/50). \`churchFactor\` multiplies the total burden for church members
 * (mean of the reformed and roman-catholic parish multipliers at 100k).
 */
import type { Canton } from "./cantons";

export type BurdenCurve = readonly (readonly [number, number])[];

export interface CantonTaxCurves {
  /** Unmarried, no children. */
  single: BurdenCurve;
  /** Married, sole earner, no children. */
  married: BurdenCurve;
  /** Married, sole earner, 2 children. */
  family: BurdenCurve;
  /** Married, both earn 50/50 — income axis = household total. */
  twoEarner: BurdenCurve;
  churchFactor: number;
}

export const TAX_YEAR = ${YEAR};

export const TAX_CURVES: Record<Canton, CantonTaxCurves> = {
${body}};
`;
fs.writeFileSync(OUT, out);
console.log(`wrote ${OUT}`);
