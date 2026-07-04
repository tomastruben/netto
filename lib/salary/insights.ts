import {
  compareCantons,
  pillar3aSavings,
  taxEstimate,
  withholdingTax,
  type SalaryInput,
} from "./engine";
import { CANTON_DATA, type Canton } from "./cantons";
import { QST_ANNUAL_MODEL, qstRate, qstTariffCode } from "./qst";

/**
 * Personal "tax lever" facts computed from the user's profile. Each insight
 * appears only when it is material for this profile; amounts are CHF/year,
 * percentages are fractions of gross. The UI renders these from dictionary
 * templates — this module stays presentation-free.
 */
export type Insight =
  | { kind: "pillar3a"; savings: number }
  | { kind: "canton"; best: Canton; gain: number }
  | { kind: "familyGap"; singlePct: number; familyPct: number; userIsFamily: boolean }
  | { kind: "church"; cost: number }
  | { kind: "qst13"; decemberPct: number; normalPct: number };

/** Family-vs-single burden gap worth pointing out (GE/VD/FR/VS territory). */
const FAMILY_GAP_MIN = 0.08;

export function computeInsights(input: SalaryInput): Insight[] {
  const gross = input.grossMonthly * (input.has13th ? 13 : 12);
  if (gross <= 0) return [];
  const out: Insight[] = [];

  // Tax in the mode the user actually sees (ordinary vs. withholding).
  const taxFor = (over: Partial<SalaryInput>): number => {
    const v = { ...input, ...over };
    return v.quellensteuer ? withholdingTax(v) : taxEstimate(gross, v);
  };

  const savings = pillar3aSavings(input);
  if (savings >= 200) out.push({ kind: "pillar3a", savings });

  const ranked = compareCantons(input);
  const top = ranked[0];
  const mine = ranked.find((r) => r.canton === input.canton);
  if (mine && top.canton !== input.canton && top.netAnnual - mine.netAnnual >= 500) {
    out.push({ kind: "canton", best: top.canton, gain: top.netAnnual - mine.netAnnual });
  }

  const neutral = { doubleIncome: false, churchMember: false };
  const singlePct = taxFor({ ...neutral, married: false, children: 0 }) / gross;
  const familyPct = taxFor({ ...neutral, married: true, children: 2 }) / gross;
  if (singlePct - familyPct >= FAMILY_GAP_MIN) {
    out.push({
      kind: "familyGap",
      singlePct,
      familyPct,
      userIsFamily: input.married && input.children > 0,
    });
  }

  // A lever only where membership is the user's choice (not none/always).
  if (input.churchMember && CANTON_DATA[input.canton].churchMode === "optional") {
    const cost = taxFor({ churchMember: true }) - taxFor({ churchMember: false });
    if (cost >= 100) out.push({ kind: "church", cost });
  }

  if (input.quellensteuer && input.has13th && !QST_ANNUAL_MODEL.has(input.canton)) {
    const code = qstTariffCode(input.canton, input);
    const normalPct = qstRate(input.canton, code, input.grossMonthly);
    const decemberPct = qstRate(input.canton, code, input.grossMonthly * 2);
    if (decemberPct - normalPct >= 0.01) out.push({ kind: "qst13", decemberPct, normalPct });
  }

  return out;
}
