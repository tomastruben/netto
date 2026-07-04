/**
 * Per-canton reference data (2026, official sources).
 *
 * Income-tax burden curves live in ./tax-curves.ts (generated from the ESTV
 * tax calculator, see scripts/refresh-tax-curves.mjs); withholding tariffs in
 * ./qst-tariffs.ts (generated from the ESTV tariff files, see
 * scripts/refresh-qst-tariffs.mjs).
 *
 * `churchMode` encodes the official QST tariff-file reality: GE/NE/VD/VS/TI
 * publish no church variant (toggle disabled), JU only with church (toggle
 * forced on) — verified against the 2026 tar26xx.txt files.
 *
 * `childAllowance`: monthly base child allowance (Kinderzulage) in CHF per
 * child, from the BSV table "Arten und Ansätze der Familienzulagen" valid
 * 1.1.2026 (federal minimum 215). First tier only: some cantons pay more for
 * older children (ZH/LU 268/260 from age 12, ZG 385 education from 18) or
 * from the 3rd child (FR/VD/VS/NE/GE); the education allowance (min. 268)
 * is not modeled separately.
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
  churchMode: ChurchMode;
  childAllowance: number;
}

export const CANTON_DATA: Record<Canton, CantonData> = {
  ZH: {
    names: { de: "Zürich", en: "Zurich", fr: "Zurich", it: "Zurigo" },
    capital: "Zürich",
    churchMode: "optional", childAllowance: 215,
  },
  BE: {
    names: { de: "Bern", en: "Bern", fr: "Berne", it: "Berna" },
    capital: "Bern",
    churchMode: "optional", childAllowance: 250,
  },
  LU: {
    names: { de: "Luzern", en: "Lucerne", fr: "Lucerne", it: "Lucerna" },
    capital: "Luzern",
    churchMode: "optional", childAllowance: 215,
  },
  UR: {
    names: { de: "Uri", en: "Uri", fr: "Uri", it: "Uri" },
    capital: "Altdorf",
    churchMode: "optional", childAllowance: 240,
  },
  SZ: {
    names: { de: "Schwyz", en: "Schwyz", fr: "Schwytz", it: "Svitto" },
    capital: "Schwyz",
    churchMode: "optional", childAllowance: 230,
  },
  OW: {
    names: { de: "Obwalden", en: "Obwalden", fr: "Obwald", it: "Obvaldo" },
    capital: "Sarnen",
    churchMode: "optional", childAllowance: 220,
  },
  NW: {
    names: { de: "Nidwalden", en: "Nidwalden", fr: "Nidwald", it: "Nidvaldo" },
    capital: "Stans",
    churchMode: "optional", childAllowance: 258,
  },
  GL: {
    names: { de: "Glarus", en: "Glarus", fr: "Glaris", it: "Glarona" },
    capital: "Glarus",
    churchMode: "optional", childAllowance: 215,
  },
  ZG: {
    names: { de: "Zug", en: "Zug", fr: "Zoug", it: "Zugo" },
    capital: "Zug",
    churchMode: "optional", childAllowance: 330,
  },
  FR: {
    names: { de: "Freiburg", en: "Fribourg", fr: "Fribourg", it: "Friburgo" },
    capital: "Fribourg",
    churchMode: "optional", childAllowance: 265,
  },
  SO: {
    names: { de: "Solothurn", en: "Solothurn", fr: "Soleure", it: "Soletta" },
    capital: "Solothurn",
    churchMode: "optional", childAllowance: 215,
  },
  BS: {
    names: { de: "Basel-Stadt", en: "Basel-City", fr: "Bâle-Ville", it: "Basilea Città" },
    capital: "Basel",
    churchMode: "optional", childAllowance: 275,
  },
  BL: {
    names: { de: "Basel-Landschaft", en: "Basel-Country", fr: "Bâle-Campagne", it: "Basilea Campagna" },
    capital: "Liestal",
    churchMode: "optional", childAllowance: 215,
  },
  SH: {
    names: { de: "Schaffhausen", en: "Schaffhausen", fr: "Schaffhouse", it: "Sciaffusa" },
    capital: "Schaffhausen",
    churchMode: "optional", childAllowance: 230,
  },
  AR: {
    names: { de: "Appenzell Ausserrhoden", en: "Appenzell Outer Rhodes", fr: "Appenzell Rhodes-Extérieures", it: "Appenzello Esterno" },
    capital: "Herisau",
    churchMode: "optional", childAllowance: 230,
  },
  AI: {
    names: { de: "Appenzell Innerrhoden", en: "Appenzell Inner Rhodes", fr: "Appenzell Rhodes-Intérieures", it: "Appenzello Interno" },
    capital: "Appenzell",
    churchMode: "optional", childAllowance: 245,
  },
  SG: {
    names: { de: "St. Gallen", en: "St. Gallen", fr: "Saint-Gall", it: "San Gallo" },
    capital: "St. Gallen",
    churchMode: "optional", childAllowance: 245,
  },
  GR: {
    names: { de: "Graubünden", en: "Grisons", fr: "Grisons", it: "Grigioni" },
    capital: "Chur",
    churchMode: "optional", childAllowance: 240,
  },
  AG: {
    names: { de: "Aargau", en: "Aargau", fr: "Argovie", it: "Argovia" },
    capital: "Aarau",
    churchMode: "optional", childAllowance: 225,
  },
  TG: {
    names: { de: "Thurgau", en: "Thurgau", fr: "Thurgovie", it: "Turgovia" },
    capital: "Frauenfeld",
    churchMode: "optional", childAllowance: 215,
  },
  TI: {
    names: { de: "Tessin", en: "Ticino", fr: "Tessin", it: "Ticino" },
    capital: "Bellinzona",
    churchMode: "none", childAllowance: 215,
  },
  VD: {
    names: { de: "Waadt", en: "Vaud", fr: "Vaud", it: "Vaud" },
    capital: "Lausanne",
    churchMode: "none", childAllowance: 322,
  },
  VS: {
    names: { de: "Wallis", en: "Valais", fr: "Valais", it: "Vallese" },
    capital: "Sion",
    churchMode: "none", childAllowance: 327,
  },
  NE: {
    names: { de: "Neuenburg", en: "Neuchâtel", fr: "Neuchâtel", it: "Neuchâtel" },
    capital: "Neuchâtel",
    churchMode: "none", childAllowance: 240,
  },
  GE: {
    names: { de: "Genf", en: "Geneva", fr: "Genève", it: "Ginevra" },
    capital: "Genève",
    churchMode: "none", childAllowance: 311,
  },
  JU: {
    names: { de: "Jura", en: "Jura", fr: "Jura", it: "Giura" },
    capital: "Delémont",
    churchMode: "always", childAllowance: 275,
  },
};
