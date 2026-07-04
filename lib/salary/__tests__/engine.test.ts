import { describe, it, expect } from "vitest";
import { calcSalary, socialDeductions } from "../engine";
import { CONST_2026 } from "../constants";
import { interpolateRate } from "../interpolate";

const base = {
  grossMonthly: 8000,
  has13th: false,
  age: 30,
  canton: "ZH" as const,
  children: 0,
  married: false,
  doubleIncome: false,
  churchMember: false,
  bvgEmployeeShare: 0.5,
  nbuRate: 0.014,
  ktgRate: 0,
};

describe("social deductions (federally uniform)", () => {
  it("AHV/IV/EO is 5.3% of full gross with no ceiling", () => {
    const d = socialDeductions(96000, base);
    expect(d.ahv).toBeCloseTo(96000 * 0.053, 2);
    const dHigh = socialDeductions(400000, base);
    expect(dHigh.ahv).toBeCloseTo(400000 * 0.053, 2);
  });

  it("ALV is 1.1% capped at the CHF 148'200 insured ceiling", () => {
    expect(socialDeductions(96000, base).alv).toBeCloseTo(96000 * 0.011, 2);
    expect(socialDeductions(200000, base).alv).toBeCloseTo(148200 * 0.011, 2);
  });

  it("NBU uses the given rate, capped at the UVG ceiling", () => {
    expect(socialDeductions(96000, base).nbu).toBeCloseTo(96000 * 0.014, 2);
    expect(socialDeductions(300000, base).nbu).toBeCloseTo(148200 * 0.014, 2);
  });

  it("BVG: no savings contribution below the entry threshold", () => {
    expect(socialDeductions(20000, base).bvg).toBe(0);
  });

  it("BVG: coordinated salary = capped gross minus coordination deduction, with minimum", () => {
    // gross 96'000 → min(96'000, 90'720) − 26'460 = 64'260 (the max coordinated salary)
    // age 30 → 7% credit, employee pays half → 3.5%
    expect(socialDeductions(96000, base).bvg).toBeCloseTo(64260 * 0.07 * 0.5, 2);
    // gross 26'000 (≥ threshold 22'680) → coordinated floors at 3'780
    expect(socialDeductions(26000, base).bvg).toBeCloseTo(3780 * 0.07 * 0.5, 2);
  });

  it("BVG age bands: 7/10/15/18% and nothing before 25", () => {
    const at = (age: number) => socialDeductions(96000, { ...base, age }).bvg;
    expect(at(22)).toBe(0);
    expect(at(35)).toBeCloseTo(64260 * 0.1 * 0.5, 2);
    expect(at(50)).toBeCloseTo(64260 * 0.15 * 0.5, 2);
    expect(at(60)).toBeCloseTo(64260 * 0.18 * 0.5, 2);
  });

  it("KTG applies to full gross when a rate is set", () => {
    const d = socialDeductions(96000, { ...base, ktgRate: 0.005 });
    expect(d.ktg).toBeCloseTo(96000 * 0.005, 2);
  });
});

describe("full calculation", () => {
  it("13th salary multiplies the annual base by 13", () => {
    const r = calcSalary({ ...base, has13th: true });
    expect(r.grossAnnual).toBe(8000 * 13);
  });

  it("net = gross − social − tax, monthly derived from payout count", () => {
    const r = calcSalary(base);
    expect(r.grossAnnual).toBe(96000);
    expect(r.netAnnual).toBeCloseTo(
      r.grossAnnual - r.totalSocialAnnual - r.taxAnnual,
      2
    );
    expect(r.netMonthly).toBeCloseTo(r.netAnnual / 12, 2);
  });

  it("child allowance adds per-canton amounts per child", () => {
    const r = calcSalary({ ...base, children: 2 });
    expect(r.childAllowanceMonthly).toBeGreaterThanOrEqual(2 * 200); // federal minimum
  });

  it("tax differs across cantons (ZG below GE for same profile)", () => {
    const zg = calcSalary({ ...base, canton: "ZG" });
    const ge = calcSalary({ ...base, canton: "GE" });
    expect(zg.taxAnnual).toBeLessThan(ge.taxAnnual);
  });

  it("married with children pays less tax than single at same gross", () => {
    const single = calcSalary(base);
    const family = calcSalary({ ...base, married: true, children: 2 });
    expect(family.taxAnnual).toBeLessThan(single.taxAnnual);
  });

  it("church member pays more tax than non-member", () => {
    const no = calcSalary(base);
    const yes = calcSalary({ ...base, churchMember: true });
    expect(yes.taxAnnual).toBeGreaterThan(no.taxAnnual);
  });

  it("effective deduction rate is sane (10–45%) for a normal salary", () => {
    const r = calcSalary(base);
    const rate = 1 - r.netAnnual / r.grossAnnual;
    expect(rate).toBeGreaterThan(0.1);
    expect(rate).toBeLessThan(0.45);
  });
});

describe("tax curve interpolation", () => {
  const points: [number, number][] = [
    [50000, 0.05],
    [100000, 0.1],
    [200000, 0.2],
  ];
  it("interpolates linearly between points", () => {
    expect(interpolateRate(points, 75000)).toBeCloseTo(0.075, 5);
  });
  it("clamps below the first and above the last point", () => {
    expect(interpolateRate(points, 10000)).toBeCloseTo(0.05 * (10000 / 50000), 5);
    expect(interpolateRate(points, 500000)).toBeCloseTo(0.2, 5);
  });
});

describe("2026 constants sanity", () => {
  it("uses the published 2026 parameters", () => {
    expect(CONST_2026.ahvIvEoEmployee).toBe(0.053);
    expect(CONST_2026.alvEmployee).toBe(0.011);
    expect(CONST_2026.uvgCeiling).toBe(148200);
    expect(CONST_2026.bvg.entryThreshold).toBe(22680);
    expect(CONST_2026.bvg.coordinationDeduction).toBe(26460);
    expect(CONST_2026.bvg.maxSalary).toBe(90720);
  });
});
