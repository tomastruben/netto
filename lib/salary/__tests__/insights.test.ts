import { describe, it, expect } from "vitest";
import { pillar3aSavings, type SalaryInput } from "../engine";
import { computeInsights, type Insight } from "../insights";
import { CONST_2026 } from "../constants";

const input = (over: Partial<SalaryInput>): SalaryInput => ({
  grossMonthly: 100_000 / 12,
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

const kinds = (list: Insight[]) => list.map((i) => i.kind);
const find = <K extends Insight["kind"]>(list: Insight[], kind: K) =>
  list.find((i) => i.kind === kind) as Extract<Insight, { kind: K }> | undefined;

describe("pillar 3a savings", () => {
  it("uses the published 2026 maximum of CHF 7'258", () => {
    expect(CONST_2026.pillar3aMax).toBe(7_258);
  });

  it("ZH 100k single saves ≈ CHF 1'542 (official curve slope)", () => {
    expect(pillar3aSavings(input({}))).toBeCloseTo(1_542, -2);
  });

  it("is zero without income", () => {
    expect(pillar3aSavings(input({ grossMonthly: 0 }))).toBe(0);
  });
});

describe("computeInsights", () => {
  it("ZH 100k single: pillar 3a and canton lever, no family gap (7.7pp < 8pp)", () => {
    const list = computeInsights(input({}));
    expect(kinds(list)).toContain("pillar3a");
    const canton = find(list, "canton");
    expect(canton).toBeDefined();
    expect(canton!.best).not.toBe("ZH");
    expect(canton!.gain).toBeGreaterThanOrEqual(500);
    expect(kinds(list)).not.toContain("familyGap");
    expect(kinds(list)).not.toContain("church");
    expect(kinds(list)).not.toContain("qst13");
  });

  it("GE 150k single: family gap shows (≈20% vs ≈8%)", () => {
    const gap = find(computeInsights(input({ canton: "GE", grossMonthly: 12_500 })), "familyGap");
    expect(gap).toBeDefined();
    expect(gap!.singlePct).toBeGreaterThan(gap!.familyPct);
    expect(gap!.singlePct).toBeCloseTo(0.203, 1.5);
    expect(gap!.userIsFamily).toBe(false);
  });

  it("church cost shows for members in optional-mode cantons only", () => {
    const lu = find(computeInsights(input({ canton: "LU", churchMember: true })), "church");
    expect(lu).toBeDefined();
    expect(lu!.cost).toBeGreaterThan(700);
    expect(lu!.cost).toBeLessThan(1_000);
    expect(find(computeInsights(input({ canton: "LU" })), "church")).toBeUndefined();
    // TI publishes no church variant, JU has no opt-out — no lever either way
    expect(find(computeInsights(input({ canton: "TI", churchMember: true })), "church")).toBeUndefined();
    expect(find(computeInsights(input({ canton: "JU", churchMember: true })), "church")).toBeUndefined();
  });

  it("church cost in withholding mode comes from the Y/N tariff delta", () => {
    const zh = find(
      computeInsights(input({ quellensteuer: true, churchMember: true, grossMonthly: 8_000 })),
      "church"
    );
    expect(zh).toBeDefined();
    // A0Y 8.88% vs A0N 8.66% at 8'000 → ≈ CHF 211/year
    expect(zh!.cost).toBeGreaterThan(120);
    expect(zh!.cost).toBeLessThan(320);
  });

  it("QST 13th-month insight only in month-model cantons with a 13th salary", () => {
    const zh = find(
      computeInsights(input({ quellensteuer: true, has13th: true, grossMonthly: 8_000 })),
      "qst13"
    );
    expect(zh).toBeDefined();
    expect(zh!.decemberPct).toBeCloseTo(0.1595, 2);
    expect(zh!.normalPct).toBeCloseTo(0.0866, 2);
    expect(
      find(computeInsights(input({ canton: "VD", quellensteuer: true, has13th: true, grossMonthly: 8_000 })), "qst13")
    ).toBeUndefined();
    expect(
      find(computeInsights(input({ quellensteuer: true, grossMonthly: 8_000 })), "qst13")
    ).toBeUndefined();
  });

  it("returns nothing without income", () => {
    expect(computeInsights(input({ grossMonthly: 0 }))).toEqual([]);
  });
});
