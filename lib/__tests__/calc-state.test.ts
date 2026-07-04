import { describe, it, expect } from "vitest";
import { DEFAULT_STATE, applyPatch } from "../calc-state";

describe("month/year input handling", () => {
  it("typing in month mode sets the monthly salary directly", () => {
    const s = applyPatch(DEFAULT_STATE, { grossValue: 9500 });
    expect(s.grossMonthly).toBe(9500);
  });

  it("typing in year mode divides by the payout count", () => {
    const yearMode = applyPatch(DEFAULT_STATE, { inputPeriod: "year" });
    const s = applyPatch(yearMode, { grossValue: 130000 });
    expect(s.grossMonthly).toBeCloseTo(130000 / 13, 5);
  });

  it("switching month → year converts the field value, salary unchanged", () => {
    // 8'000/month × 13 payouts
    const s = applyPatch(DEFAULT_STATE, { inputPeriod: "year" });
    expect(s.grossValue).toBe(104000);
    expect(s.grossMonthly).toBe(8000);
  });

  it("switching year → month converts back without drift", () => {
    const year = applyPatch(DEFAULT_STATE, { inputPeriod: "year" });
    const back = applyPatch(year, { inputPeriod: "month" });
    expect(back.grossValue).toBe(8000);
    expect(back.grossMonthly).toBe(8000);
  });

  it("switching without a 13th salary converts with 12 payouts", () => {
    const no13 = applyPatch(DEFAULT_STATE, { has13th: false });
    const year = applyPatch(no13, { inputPeriod: "year" });
    expect(year.grossValue).toBe(96000);
  });

  it("a patch carrying its own grossValue wins over conversion (URL hydration)", () => {
    // ?g=90000&p=y must not be clobbered by the unit-switch conversion
    const s = applyPatch(DEFAULT_STATE, { grossValue: 90000, inputPeriod: "year" });
    expect(s.grossValue).toBe(90000);
    expect(s.grossMonthly).toBeCloseTo(90000 / 13, 5);
  });

  it("13th toggle in month mode keeps the monthly amount (annual grows)", () => {
    const s = applyPatch(DEFAULT_STATE, { has13th: false });
    expect(s.grossMonthly).toBe(8000);
  });

  it("13th toggle in year mode keeps the annual total (payout shrinks)", () => {
    const year = applyPatch(DEFAULT_STATE, { inputPeriod: "year" }); // 104'000
    const no13 = applyPatch(year, { has13th: false });
    expect(no13.grossValue).toBe(104000);
    expect(no13.grossMonthly).toBeCloseTo(104000 / 12, 5);
  });

  it("year → month conversion rounds to whole Rappen", () => {
    const year = applyPatch(DEFAULT_STATE, { inputPeriod: "year" });
    const odd = applyPatch(year, { grossValue: 100000 }); // 7'692.307…/month
    const month = applyPatch(odd, { inputPeriod: "month" });
    expect(month.grossValue).toBe(7692.31);
  });
});
