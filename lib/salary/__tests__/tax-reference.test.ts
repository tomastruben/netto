import { describe, it, expect } from "vitest";
import { calcSalary, taxEstimate, withholdingTax, type SalaryInput } from "../engine";
import { CANTON_DATA, CANTONS } from "../cantons";

/**
 * Reference values pinned from official sources (fetched 2026-07-04):
 *
 * - Ordinary income tax: ESTV tax calculator (swisstaxcalculator.estv.admin.ch,
 *   API_calculateDetailedTaxes), TaxYear 2026, canton capital, employee with
 *   standard deductions only. Expected value = TotalTax (direct federal +
 *   cantonal + communal + Personalsteuer, WITHOUT church tax).
 * - Withholding tax: ESTV machine-readable 2026 tariff files (tar26xx.txt),
 *   exact bracket rates quoted in the case comments.
 * - Child allowances: BSV "Arten und Ansätze der Familienzulagen", 1.1.2026.
 *
 * Tolerances: at incomes that are curve grid points the engine should be
 * near-exact (rounding only); between grid points the piecewise-linear
 * interpolation carries a documented model error, hence looser bounds.
 */

const input = (over: Partial<SalaryInput>): SalaryInput => ({
  grossMonthly: 8000,
  has13th: false,
  age: 30,
  canton: "ZH",
  children: 0,
  married: false,
  doubleIncome: false,
  churchMember: false,
  bvgEmployeeShare: 0.5,
  nbuRate: 0.014,
  ktgRate: 0,
  ...over,
});

describe("ordinary tax vs official ESTV calculator (2026, canton capital)", () => {
  const cases: [string, number, Partial<SalaryInput>, number, number][] = [
    // [label, grossAnnual, profile, official TotalTax, relative tolerance]
    ["ZH 100k single", 100_000, { canton: "ZH" }, 12_106, 0.015],
    ["LU 100k single", 100_000, { canton: "LU" }, 11_745, 0.015],
    ["ZG 80k single", 80_000, { canton: "ZG" }, 3_413, 0.015],
    ["TI 65k single", 65_000, { canton: "TI" }, 6_587, 0.015],
    ["GE 220k single", 220_000, { canton: "GE" }, 54_440, 0.015],
    ["BE 115k married sole earner", 115_000, { canton: "BE", married: true }, 15_595, 0.015],
    ["VD 90k married, 2 children", 90_000, { canton: "VD", married: true, children: 2 }, 4_523, 0.025],
    // between grid points — bounded interpolation error
    ["GE 150k single (interp)", 150_000, { canton: "GE" }, 30_386, 0.03],
    ["TI 90k single (interp)", 90_000, { canton: "TI" }, 12_247, 0.03],
    ["BE 120k married (interp)", 120_000, { canton: "BE", married: true }, 16_752, 0.03],
    // VD quotient familial is steep between 70k and 90k
    ["VD 80k married, 2 children (interp)", 80_000, { canton: "VD", married: true, children: 2 }, 2_715, 0.1],
  ];

  for (const [label, gross, profile, official, tol] of cases) {
    it(`${label}: CHF ${official.toLocaleString("de-CH")} ±${tol * 100}%`, () => {
      const tax = taxEstimate(gross, input(profile));
      expect(Math.abs(tax - official)).toBeLessThanOrEqual(official * tol);
    });
  }

  it("LU church member surcharge matches official ratio (12'601 / 11'745)", () => {
    const none = taxEstimate(100_000, input({ canton: "LU" }));
    const church = taxEstimate(100_000, input({ canton: "LU", churchMember: true }));
    expect(church / none).toBeCloseTo(12_601 / 11_745, 1.8);
    expect(Math.abs(church / none - 12_601 / 11_745)).toBeLessThan(0.015);
  });

  it("BE double income (50/50 household) matches official half-share", () => {
    // Official household 140k (70k + 70k): CHF 20'345 → user share 10'172.50
    const tax = taxEstimate(70_000, input({ canton: "BE", married: true, doubleIncome: true }));
    expect(Math.abs(tax - 20_345 / 2)).toBeLessThanOrEqual((20_345 / 2) * 0.04);
  });
});

describe("withholding tax vs official 2026 tariff files", () => {
  // Tolerance: the embedded tariff curves are simplified with a max deviation
  // of ~0.2 percentage points of gross (exact at official step edges).
  const tolOf = (grossAnnual: number) => grossAnnual * 0.002 + 1;

  it("ZH single, 8'000/month, no 13th (A0N @8000 = 8.66%)", () => {
    const tax = withholdingTax(input({ quellensteuer: true }));
    expect(Math.abs(tax - 96_000 * 0.0866)).toBeLessThanOrEqual(tolOf(96_000));
  });

  it("ZH single with 13th: December taxed at the double-salary rate (A0N @16000 = 15.95%)", () => {
    const tax = withholdingTax(input({ quellensteuer: true, has13th: true }));
    const expected = 11 * 8_000 * 0.0866 + 16_000 * 0.1595;
    expect(Math.abs(tax - expected)).toBeLessThanOrEqual(tolOf(104_000));
  });

  it("ZH single church member uses the Y tariff (A0Y @8000 = 8.88%)", () => {
    const tax = withholdingTax(input({ quellensteuer: true, churchMember: true }));
    expect(Math.abs(tax - 96_000 * 0.0888)).toBeLessThanOrEqual(tolOf(96_000));
  });

  it("VD married double earner (C0N @7500 = 12.77%, annual model)", () => {
    const tax = withholdingTax(
      input({ canton: "VD", quellensteuer: true, married: true, doubleIncome: true, grossMonthly: 7_500 })
    );
    expect(Math.abs(tax - 90_000 * 0.1277)).toBeLessThanOrEqual(tolOf(90_000));
  });

  it("VD annual model with 13th: rate from annual/12 (C0N @8125 = 13.31%)", () => {
    const tax = withholdingTax(
      input({ canton: "VD", quellensteuer: true, married: true, doubleIncome: true, grossMonthly: 7_500, has13th: true })
    );
    expect(Math.abs(tax - 97_500 * 0.1331)).toBeLessThanOrEqual(tolOf(97_500));
  });

  it("TI single (A0N @5000 = 8.40%)", () => {
    const tax = withholdingTax(input({ canton: "TI", quellensteuer: true, grossMonthly: 5_000 }));
    expect(Math.abs(tax - 60_000 * 0.084)).toBeLessThanOrEqual(tolOf(60_000));
  });

  it("GE married sole earner, 2 children (B2N @9750 = 2.14%)", () => {
    const tax = withholdingTax(
      input({ canton: "GE", quellensteuer: true, married: true, children: 2, grossMonthly: 9_750 })
    );
    expect(Math.abs(tax - 117_000 * 0.0214)).toBeLessThanOrEqual(tolOf(117_000));
  });

  it("JU always applies the church tariff (B1Y @6500 = 6.02%), even for non-members", () => {
    const tax = withholdingTax(
      input({ canton: "JU", quellensteuer: true, married: true, children: 1, grossMonthly: 6_500 })
    );
    expect(Math.abs(tax - 78_000 * 0.0602)).toBeLessThanOrEqual(tolOf(78_000));
  });

  it("single parent uses the H tariff (BE H2N @7000 = 5.65%)", () => {
    const tax = withholdingTax(
      input({ canton: "BE", quellensteuer: true, children: 2, grossMonthly: 7_000 })
    );
    expect(Math.abs(tax - 84_000 * 0.0565)).toBeLessThanOrEqual(tolOf(84_000));
  });

  it("calcSalary routes to withholding when quellensteuer is set", () => {
    const qst = input({ quellensteuer: true });
    expect(calcSalary(qst).taxAnnual).toBe(withholdingTax(qst));
    const ordinary = input({});
    expect(calcSalary(ordinary).taxAnnual).toBe(taxEstimate(96_000, ordinary));
  });
});

describe("child allowances match the BSV 2026 table", () => {
  const expected: [string, number][] = [
    ["ZH", 215], ["BE", 250], ["NW", 258], ["ZG", 330],
    ["AG", 225], ["VS", 327], ["TI", 215], ["VD", 322],
  ];
  for (const [canton, amount] of expected) {
    it(`${canton} pays CHF ${amount}/month per child`, () => {
      expect(CANTON_DATA[canton as keyof typeof CANTON_DATA].childAllowance).toBe(amount);
    });
  }

  it("no canton is below the federal minimum of CHF 215", () => {
    for (const c of CANTONS) {
      expect(CANTON_DATA[c].childAllowance).toBeGreaterThanOrEqual(215);
    }
  });
});
