import { CONST_2026 } from "./constants";
import { CANTON_DATA, type Canton } from "./cantons";
import { TAX_CURVES } from "./tax-curves";
import { QST_ANNUAL_MODEL, qstRate, qstTariffCode } from "./qst";
import { interpolateRate } from "./interpolate";

export interface SalaryInput {
  /** Gross salary per payout month, CHF. */
  grossMonthly: number;
  has13th: boolean;
  age: number;
  canton: Canton;
  children: number;
  married: boolean;
  /** Married and both partners earn (two-earner deduction). */
  doubleIncome: boolean;
  churchMember: boolean;
  /** Employee share of the BVG retirement credit (0.5 = legal default split). */
  bvgEmployeeShare: number;
  /** Non-occupational accident insurance rate (employer-specific). */
  nbuRate: number;
  /** Daily sickness allowance rate, employee share (0 if employer-paid/none). */
  ktgRate: number;
  /** B/L permit: tax withheld at source — uses the official QST tariff. */
  quellensteuer?: boolean;
}

export interface SocialDeductions {
  ahv: number;
  alv: number;
  nbu: number;
  ktg: number;
  bvg: number;
}

export interface SalaryResult {
  grossAnnual: number;
  grossMonthly: number;
  payouts: 12 | 13;
  social: SocialDeductions;
  totalSocialAnnual: number;
  taxAnnual: number;
  taxRate: number;
  netAnnual: number;
  netMonthly: number;
  childAllowanceMonthly: number;
  /** Employer-side annual contributions (what the job actually costs on top). */
  employer: SocialDeductions & { totalAnnual: number; fak: number };
}

const C = CONST_2026;

function bvgCredit(age: number): number {
  let rate = 0;
  for (const band of C.bvg.credits) if (age >= band.fromAge) rate = band.rate;
  return rate;
}

/** Annual coordinated (BVG-insured) salary, 0 below the entry threshold. */
export function coordinatedSalary(grossAnnual: number): number {
  if (grossAnnual < C.bvg.entryThreshold) return 0;
  const capped = Math.min(grossAnnual, C.bvg.maxSalary);
  return Math.max(capped - C.bvg.coordinationDeduction, C.bvg.minCoordinated);
}

/** Employee-side social insurance deductions per year (federally uniform). */
export function socialDeductions(
  grossAnnual: number,
  input: Pick<SalaryInput, "age" | "bvgEmployeeShare" | "nbuRate" | "ktgRate">
): SocialDeductions {
  const insured = Math.min(grossAnnual, C.uvgCeiling);
  return {
    ahv: grossAnnual * C.ahvIvEoEmployee,
    alv: insured * C.alvEmployee,
    nbu: insured * input.nbuRate,
    ktg: grossAnnual * input.ktgRate,
    bvg: coordinatedSalary(grossAnnual) * bvgCredit(input.age) * input.bvgEmployeeShare,
  };
}

/**
 * Ordinary income tax (direct federal + cantonal + communal at the canton
 * capital), interpolated on official ESTV burden curves per household profile
 * (see tax-curves.ts). Children interpolate between the official 0- and
 * 2-child curves via a per-child ratio; single parents use the married-based
 * curves (parent tariff). `doubleIncome` assumes a 50/50 household at twice
 * the entered gross and returns this earner's half of the household tax.
 */
export function taxEstimate(
  grossAnnual: number,
  input: Pick<
    SalaryInput,
    "canton" | "married" | "doubleIncome" | "children" | "churchMember"
  >
): number {
  const data = CANTON_DATA[input.canton];
  const curves = TAX_CURVES[input.canton];
  const twoEarner = input.married && input.doubleIncome;

  let rate: number;
  if (twoEarner) rate = interpolateRate(curves.twoEarner, grossAnnual * 2);
  else if (input.married || input.children > 0)
    rate = interpolateRate(curves.married, grossAnnual);
  else rate = interpolateRate(curves.single, grossAnnual);

  if (input.children > 0) {
    // household income on the sole-earner reference curves
    const household = twoEarner ? grossAnnual * 2 : grossAnnual;
    const married = interpolateRate(curves.married, household);
    const family = interpolateRate(curves.family, household);
    if (married > 1e-9) rate *= (family / married) ** (input.children / 2);
  }

  const churchOn =
    data.churchMode === "always" || (data.churchMode === "optional" && input.churchMember);
  if (churchOn) rate *= curves.churchFactor;
  return grossAnnual * rate;
}

/**
 * Withholding tax (Quellensteuer) per the official 2026 tariff files.
 * FR/GE/TI/VD/VS determine the rate on annualized income; the other cantons
 * tax each month separately, so with a 13th salary its payout month is
 * withheld at the double-month rate.
 */
export function withholdingTax(input: SalaryInput): number {
  const m = input.grossMonthly;
  if (m <= 0) return 0;
  const code = qstTariffCode(input.canton, input);
  const grossAnnual = m * (input.has13th ? 13 : 12);
  if (QST_ANNUAL_MODEL.has(input.canton))
    return grossAnnual * qstRate(input.canton, code, grossAnnual / 12);
  if (!input.has13th) return 12 * m * qstRate(input.canton, code, m);
  return 11 * m * qstRate(input.canton, code, m) + 2 * m * qstRate(input.canton, code, 2 * m);
}

/**
 * Ordinary tax saved by paying the maximum pillar-3a contribution,
 * approximated by sliding the gross down the official burden curve (the 3a
 * deduction reduces taxable income one-for-one). For withholding profiles the
 * saving is realised via the retroactive ordinary assessment, so the ordinary
 * curve is the right basis there too.
 */
export function pillar3aSavings(input: SalaryInput): number {
  const grossAnnual = input.grossMonthly * (input.has13th ? 13 : 12);
  if (grossAnnual <= C.pillar3aMax) return 0;
  return (
    taxEstimate(grossAnnual, input) -
    taxEstimate(grossAnnual - C.pillar3aMax, input)
  );
}

export function calcSalary(input: SalaryInput): SalaryResult {
  const payouts = input.has13th ? 13 : 12;
  const grossAnnual = input.grossMonthly * payouts;

  const social = socialDeductions(grossAnnual, input);
  const totalSocialAnnual =
    social.ahv + social.alv + social.nbu + social.ktg + social.bvg;

  const taxAnnual = input.quellensteuer
    ? withholdingTax(input)
    : taxEstimate(grossAnnual, input);
  const netAnnual = grossAnnual - totalSocialAnnual - taxAnnual;

  const childAllowanceMonthly =
    input.children * CANTON_DATA[input.canton].childAllowance;

  // Employer side: mirrors AHV/ALV/BVG, plus occupational accident (BU, ~0.1–1%)
  // and family compensation fund (FAK, ~1–2%); typical mid values used for the view.
  const insured = Math.min(grossAnnual, C.uvgCeiling);
  const employerBvg =
    coordinatedSalary(grossAnnual) * bvgCredit(input.age) * (1 - input.bvgEmployeeShare);
  const employer = {
    ahv: grossAnnual * C.ahvIvEoEmployee,
    alv: insured * C.alvEmployee,
    nbu: insured * 0.005, // BU — occupational accident, employer-paid
    ktg: grossAnnual * (input.ktgRate > 0 ? input.ktgRate : 0),
    bvg: employerBvg,
    fak: grossAnnual * 0.015,
    totalAnnual: 0,
  };
  employer.totalAnnual =
    employer.ahv + employer.alv + employer.nbu + employer.ktg + employer.bvg + employer.fak;

  return {
    grossAnnual,
    grossMonthly: input.grossMonthly,
    payouts,
    social,
    totalSocialAnnual,
    taxAnnual,
    taxRate: grossAnnual > 0 ? taxAnnual / grossAnnual : 0,
    netAnnual,
    netMonthly: netAnnual / 12,
    childAllowanceMonthly,
    employer,
  };
}

/** Net annual for every canton at this profile — for the comparison view. */
export function compareCantons(
  input: SalaryInput
): { canton: Canton; netAnnual: number; taxAnnual: number }[] {
  return (Object.keys(CANTON_DATA) as Canton[])
    .map((canton) => {
      const r = calcSalary({ ...input, canton });
      return { canton, netAnnual: r.netAnnual, taxAnnual: r.taxAnnual };
    })
    .sort((a, b) => b.netAnnual - a.netAnnual);
}
