/**
 * Swiss payroll parameters for 2026.
 *
 * Sources (to re-verify each January):
 * - AHV/IV/EO + ALV rates and ceilings: BSV "Beiträge und Leistungen" / AHV-Merkblätter
 * - UVG max insured salary: Art. 22 UVV (CHF 148'200 since 1.1.2016)
 * - BVG parameters: BSV "Grenzbeträge der beruflichen Vorsorge" (unchanged for 2026;
 *   next AHV-pension-linked adjustment expected 1.1.2027)
 */
export const CONST_2026 = {
  year: 2026,
  /** Employee share of AHV/IV/EO (10.6% total, split 50/50). Applies to full gross, no ceiling. */
  ahvIvEoEmployee: 0.053,
  /** Employee share of unemployment insurance (2.2% total split 50/50) up to the ceiling. */
  alvEmployee: 0.011,
  /** Max insured salary for ALV and UVG/NBU (CHF per year). */
  uvgCeiling: 148_200,
  /** Non-occupational accident insurance — employer-specific; typical range 0.7%–1.7%. */
  nbuDefault: 0.014,
  /** Daily sickness allowance insurance — optional; typical employee share 0%–1%. */
  ktgDefault: 0.005,
  bvg: {
    /** Annual salary below which no mandatory savings apply. */
    entryThreshold: 22_680,
    /** Subtracted from gross to get the coordinated (insured) salary. */
    coordinationDeduction: 26_460,
    /** Gross salary cap for the mandatory scheme. */
    maxSalary: 90_720,
    /** Minimum coordinated salary once over the entry threshold. */
    minCoordinated: 3_780,
    /** Age-dependent retirement credits (share of coordinated salary, employer+employee). */
    credits: [
      { fromAge: 25, rate: 0.07 },
      { fromAge: 35, rate: 0.1 },
      { fromAge: 45, rate: 0.15 },
      { fromAge: 55, rate: 0.18 },
    ],
    /** Default employee share of the credit (plans must be ≥50% employer-funded). */
    employeeShareDefault: 0.5,
  },
} as const;

export type SalaryConstants = typeof CONST_2026;
