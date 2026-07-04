import { CONST_2026 } from "./constants";
import {
  CANTON_DATA,
  CHILD_TAX_FACTOR,
  DOUBLE_INCOME_FACTOR,
  MARRIED_FACTOR,
  type Canton,
} from "./cantons";
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
 * Income tax estimate (direct federal + cantonal + communal at the canton capital).
 * Single-person burden curve, adjusted for marital status, double income, children
 * and church membership. v1 estimate — see design doc.
 */
export function taxEstimate(
  grossAnnual: number,
  input: Pick<
    SalaryInput,
    "canton" | "married" | "doubleIncome" | "children" | "churchMember"
  >
): number {
  const data = CANTON_DATA[input.canton];
  let rate = interpolateRate(data.taxCurve, grossAnnual);
  if (input.married) {
    rate *= interpolateRate(MARRIED_FACTOR, grossAnnual);
    if (input.doubleIncome) rate *= DOUBLE_INCOME_FACTOR;
  }
  if (input.children > 0) rate *= Math.max(CHILD_TAX_FACTOR ** input.children, 0.6);
  const churchOn =
    data.churchMode === "always" || (data.churchMode === "optional" && input.churchMember);
  if (churchOn) rate *= data.churchFactor;
  return grossAnnual * rate;
}

export function calcSalary(input: SalaryInput): SalaryResult {
  const payouts = input.has13th ? 13 : 12;
  const grossAnnual = input.grossMonthly * payouts;

  const social = socialDeductions(grossAnnual, input);
  const totalSocialAnnual =
    social.ahv + social.alv + social.nbu + social.ktg + social.bvg;

  const taxAnnual = taxEstimate(grossAnnual, input);
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
