/**
 * Per-canton data for the v1 estimate model.
 *
 * `taxCurve`: income tax burden (direct federal + cantonal + communal, WITHOUT church
 * tax) as a share of gross employment income for a SINGLE person at the CANTON CAPITAL.
 * Points are [gross annual CHF, effective rate]. Derived from the ESTV
 * "Steuerbelastung in den Kantonshauptorten" statistics; values are estimates for v1
 * and are labeled as such in the UI. v2 replaces this with official per-commune
 * multiplier data / QST tariff files (see design doc).
 *
 * `churchFactor`: multiplier applied to the tax estimate for church members
 * (church tax is a surcharge on the cantonal simple tax; expressed here as an
 * effect on the total burden). `churchMode` encodes the QST tariff-file reality:
 * GE/NE/VD/VS/TI publish no church variant (toggle disabled), JU only with church
 * (toggle forced on).
 *
 * `childAllowance`: monthly child allowance CHF for children under 16, canton level,
 * 2025/2026 (federal minimum 215; education allowance 268+ not modeled separately in v1).
 */
export const CANTONS = [
  "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR", "JU", "LU", "NE",
  "NW", "OW", "SG", "SH", "SO", "SZ", "TG", "TI", "UR", "VD", "VS", "ZG", "ZH",
] as const;

export type Canton = (typeof CANTONS)[number];

export type ChurchMode = "optional" | "none" | "always";

export interface CantonData {
  names: { de: string; en: string; fr: string; it: string };
  capital: string;
  taxCurve: readonly (readonly [number, number])[];
  churchFactor: number;
  churchMode: ChurchMode;
  childAllowance: number;
}

export const CANTON_DATA: Record<Canton, CantonData> = {
  ZH: {
    names: { de: "Zürich", en: "Zurich", fr: "Zurich", it: "Zurigo" },
    capital: "Zürich",
    taxCurve: [[50_000, 0.055], [80_000, 0.098], [100_000, 0.124], [150_000, 0.175], [250_000, 0.238]],
    churchFactor: 1.06, churchMode: "optional", childAllowance: 215,
  },
  BE: {
    names: { de: "Bern", en: "Bern", fr: "Berne", it: "Berna" },
    capital: "Bern",
    taxCurve: [[50_000, 0.080], [80_000, 0.128], [100_000, 0.155], [150_000, 0.208], [250_000, 0.272]],
    churchFactor: 1.09, churchMode: "optional", childAllowance: 230,
  },
  LU: {
    names: { de: "Luzern", en: "Lucerne", fr: "Lucerne", it: "Lucerna" },
    capital: "Luzern",
    taxCurve: [[50_000, 0.064], [80_000, 0.103], [100_000, 0.124], [150_000, 0.168], [250_000, 0.226]],
    churchFactor: 1.09, churchMode: "optional", childAllowance: 215,
  },
  UR: {
    names: { de: "Uri", en: "Uri", fr: "Uri", it: "Uri" },
    capital: "Altdorf",
    taxCurve: [[50_000, 0.058], [80_000, 0.092], [100_000, 0.111], [150_000, 0.150], [250_000, 0.202]],
    churchFactor: 1.08, churchMode: "optional", childAllowance: 240,
  },
  SZ: {
    names: { de: "Schwyz", en: "Schwyz", fr: "Schwytz", it: "Svitto" },
    capital: "Schwyz",
    taxCurve: [[50_000, 0.045], [80_000, 0.075], [100_000, 0.094], [150_000, 0.133], [250_000, 0.192]],
    churchFactor: 1.07, churchMode: "optional", childAllowance: 230,
  },
  OW: {
    names: { de: "Obwalden", en: "Obwalden", fr: "Obwald", it: "Obvaldo" },
    capital: "Sarnen",
    taxCurve: [[50_000, 0.058], [80_000, 0.092], [100_000, 0.110], [150_000, 0.148], [250_000, 0.198]],
    churchFactor: 1.08, churchMode: "optional", childAllowance: 220,
  },
  NW: {
    names: { de: "Nidwalden", en: "Nidwalden", fr: "Nidwald", it: "Nidvaldo" },
    capital: "Stans",
    taxCurve: [[50_000, 0.054], [80_000, 0.087], [100_000, 0.105], [150_000, 0.143], [250_000, 0.193]],
    churchFactor: 1.07, churchMode: "optional", childAllowance: 240,
  },
  GL: {
    names: { de: "Glarus", en: "Glarus", fr: "Glaris", it: "Glarona" },
    capital: "Glarus",
    taxCurve: [[50_000, 0.068], [80_000, 0.105], [100_000, 0.122], [150_000, 0.162], [250_000, 0.216]],
    churchFactor: 1.08, churchMode: "optional", childAllowance: 200,
  },
  ZG: {
    names: { de: "Zug", en: "Zug", fr: "Zoug", it: "Zugo" },
    capital: "Zug",
    taxCurve: [[50_000, 0.026], [80_000, 0.050], [100_000, 0.068], [150_000, 0.108], [250_000, 0.168]],
    churchFactor: 1.06, churchMode: "optional", childAllowance: 300,
  },
  FR: {
    names: { de: "Freiburg", en: "Fribourg", fr: "Fribourg", it: "Friburgo" },
    capital: "Fribourg",
    taxCurve: [[50_000, 0.084], [80_000, 0.130], [100_000, 0.154], [150_000, 0.205], [250_000, 0.266]],
    churchFactor: 1.08, churchMode: "optional", childAllowance: 265,
  },
  SO: {
    names: { de: "Solothurn", en: "Solothurn", fr: "Soleure", it: "Soletta" },
    capital: "Solothurn",
    taxCurve: [[50_000, 0.080], [80_000, 0.125], [100_000, 0.149], [150_000, 0.200], [250_000, 0.260]],
    churchFactor: 1.09, churchMode: "optional", childAllowance: 200,
  },
  BS: {
    names: { de: "Basel-Stadt", en: "Basel-City", fr: "Bâle-Ville", it: "Basilea Città" },
    capital: "Basel",
    taxCurve: [[50_000, 0.074], [80_000, 0.118], [100_000, 0.143], [150_000, 0.196], [250_000, 0.260]],
    churchFactor: 1.05, churchMode: "optional", childAllowance: 275,
  },
  BL: {
    names: { de: "Basel-Landschaft", en: "Basel-Country", fr: "Bâle-Campagne", it: "Basilea Campagna" },
    capital: "Liestal",
    taxCurve: [[50_000, 0.070], [80_000, 0.114], [100_000, 0.139], [150_000, 0.192], [250_000, 0.258]],
    churchFactor: 1.07, churchMode: "optional", childAllowance: 200,
  },
  SH: {
    names: { de: "Schaffhausen", en: "Schaffhausen", fr: "Schaffhouse", it: "Sciaffusa" },
    capital: "Schaffhausen",
    taxCurve: [[50_000, 0.068], [80_000, 0.105], [100_000, 0.125], [150_000, 0.167], [250_000, 0.222]],
    churchFactor: 1.09, churchMode: "optional", childAllowance: 230,
  },
  AR: {
    names: { de: "Appenzell Ausserrhoden", en: "Appenzell Outer Rhodes", fr: "Appenzell Rhodes-Extérieures", it: "Appenzello Esterno" },
    capital: "Herisau",
    taxCurve: [[50_000, 0.068], [80_000, 0.103], [100_000, 0.121], [150_000, 0.158], [250_000, 0.210]],
    churchFactor: 1.09, churchMode: "optional", childAllowance: 200,
  },
  AI: {
    names: { de: "Appenzell Innerrhoden", en: "Appenzell Inner Rhodes", fr: "Appenzell Rhodes-Intérieures", it: "Appenzello Interno" },
    capital: "Appenzell",
    taxCurve: [[50_000, 0.058], [80_000, 0.089], [100_000, 0.106], [150_000, 0.140], [250_000, 0.190]],
    churchFactor: 1.08, churchMode: "optional", childAllowance: 200,
  },
  SG: {
    names: { de: "St. Gallen", en: "St. Gallen", fr: "Saint-Gall", it: "San Gallo" },
    capital: "St. Gallen",
    taxCurve: [[50_000, 0.078], [80_000, 0.122], [100_000, 0.145], [150_000, 0.192], [250_000, 0.248]],
    churchFactor: 1.09, churchMode: "optional", childAllowance: 230,
  },
  GR: {
    names: { de: "Graubünden", en: "Grisons", fr: "Grisons", it: "Grigioni" },
    capital: "Chur",
    taxCurve: [[50_000, 0.068], [80_000, 0.105], [100_000, 0.126], [150_000, 0.168], [250_000, 0.224]],
    churchFactor: 1.08, churchMode: "optional", childAllowance: 240,
  },
  AG: {
    names: { de: "Aargau", en: "Aargau", fr: "Argovie", it: "Argovia" },
    capital: "Aarau",
    taxCurve: [[50_000, 0.068], [80_000, 0.106], [100_000, 0.128], [150_000, 0.178], [250_000, 0.240]],
    churchFactor: 1.08, churchMode: "optional", childAllowance: 200,
  },
  TG: {
    names: { de: "Thurgau", en: "Thurgau", fr: "Thurgovie", it: "Turgovia" },
    capital: "Frauenfeld",
    taxCurve: [[50_000, 0.068], [80_000, 0.106], [100_000, 0.127], [150_000, 0.172], [250_000, 0.228]],
    churchFactor: 1.09, churchMode: "optional", childAllowance: 200,
  },
  TI: {
    names: { de: "Tessin", en: "Ticino", fr: "Tessin", it: "Ticino" },
    capital: "Bellinzona",
    taxCurve: [[50_000, 0.062], [80_000, 0.112], [100_000, 0.140], [150_000, 0.198], [250_000, 0.266]],
    churchFactor: 1.0, churchMode: "none", childAllowance: 200,
  },
  VD: {
    names: { de: "Waadt", en: "Vaud", fr: "Vaud", it: "Vaud" },
    capital: "Lausanne",
    taxCurve: [[50_000, 0.092], [80_000, 0.140], [100_000, 0.166], [150_000, 0.222], [250_000, 0.292]],
    churchFactor: 1.0, churchMode: "none", childAllowance: 300,
  },
  VS: {
    names: { de: "Wallis", en: "Valais", fr: "Valais", it: "Vallese" },
    capital: "Sion",
    taxCurve: [[50_000, 0.076], [80_000, 0.120], [100_000, 0.143], [150_000, 0.196], [250_000, 0.264]],
    churchFactor: 1.0, churchMode: "none", childAllowance: 275,
  },
  NE: {
    names: { de: "Neuenburg", en: "Neuchâtel", fr: "Neuchâtel", it: "Neuchâtel" },
    capital: "Neuchâtel",
    taxCurve: [[50_000, 0.096], [80_000, 0.144], [100_000, 0.168], [150_000, 0.222], [250_000, 0.284]],
    churchFactor: 1.0, churchMode: "none", childAllowance: 220,
  },
  GE: {
    names: { de: "Genf", en: "Geneva", fr: "Genève", it: "Ginevra" },
    capital: "Genève",
    taxCurve: [[50_000, 0.074], [80_000, 0.122], [100_000, 0.152], [150_000, 0.216], [250_000, 0.296]],
    churchFactor: 1.0, churchMode: "none", childAllowance: 311,
  },
  JU: {
    names: { de: "Jura", en: "Jura", fr: "Jura", it: "Giura" },
    capital: "Delémont",
    taxCurve: [[50_000, 0.096], [80_000, 0.142], [100_000, 0.166], [150_000, 0.218], [250_000, 0.278]],
    churchFactor: 1.08, churchMode: "always", childAllowance: 275,
  },
};

/** Married (joint tariff, sole earner): splitting advantage shrinks as income rises. */
export const MARRIED_FACTOR: readonly (readonly [number, number])[] = [
  [50_000, 0.55], [100_000, 0.63], [150_000, 0.72], [250_000, 0.82],
];

/** Additional reduction per child (deductions), diminishing. */
export const CHILD_TAX_FACTOR = 0.88;
/** Two-earner deduction effect for married double-income couples. */
export const DOUBLE_INCOME_FACTOR = 0.95;
