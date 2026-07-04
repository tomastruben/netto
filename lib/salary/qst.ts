import { QST_TARIFFS } from "./qst-tariffs";
import { CANTON_DATA, type Canton } from "./cantons";

/**
 * Withholding-tax (Quellensteuer) tariff lookup on the official ESTV tariff
 * files embedded in ./qst-tariffs.ts.
 *
 * Tariff codes: A = single, B = married sole earner, C = married double
 * earner, H = single parent; digit = number of children counted in the
 * tariff (capped at 5 — more children would lower the rate slightly);
 * N/Y = without/with church tax.
 */

/**
 * Cantons that determine the rate on annualized income (Jahresmodell per
 * ESTV Kreisschreiben 45); all others tax each month separately, so a 13th
 * salary is withheld at the double-month rate in its payout month.
 */
export const QST_ANNUAL_MODEL: ReadonlySet<Canton> = new Set([
  "FR", "GE", "TI", "VD", "VS",
]);

export function qstTariffCode(
  canton: Canton,
  profile: { married: boolean; doubleIncome: boolean; children: number; churchMember: boolean }
): string {
  const letter = profile.married
    ? profile.doubleIncome ? "C" : "B"
    : profile.children > 0 ? "H" : "A";
  const kids = letter === "A" ? 0 : Math.min(profile.children, 5);
  // GE/NE/VD/VS/TI publish no church variant, JU only the church variant.
  const mode = CANTON_DATA[canton].churchMode;
  const church =
    mode === "none" ? "N" : mode === "always" ? "Y" : profile.churchMember ? "Y" : "N";
  return `${letter}${kids}${church}`;
}

/** Decoded knot cache — tariffs are stored delta-encoded (see qst-tariffs.ts). */
const decoded = new Map<string, number[]>();

function tariffKnots(canton: Canton, code: string): number[] | undefined {
  const key = canton + code;
  const hit = decoded.get(key);
  if (hit) return hit;
  const raw = QST_TARIFFS[canton][code];
  if (!raw) return undefined;
  const out = new Array<number>(raw.length);
  out[0] = raw[0];
  out[1] = raw[1];
  for (let i = 2; i < raw.length; i += 2) {
    out[i] = out[i - 2] + raw[i];
    out[i + 1] = out[i - 1] + raw[i + 1];
  }
  decoded.set(key, out);
  return out;
}

/** Official effective withholding rate (fraction of gross) for one month. */
export function qstRate(canton: Canton, code: string, monthlyGross: number): number {
  if (monthlyGross <= 0) return 0;
  const knots =
    tariffKnots(canton, code) ??
    // safety net for incomplete data: fall back to the other church variant
    tariffKnots(canton, code.slice(0, 2) + (code[2] === "Y" ? "N" : "Y"));
  if (!knots) return 0;
  const last = knots.length - 2;
  if (monthlyGross <= knots[0]) return knots[1] / 10_000;
  if (monthlyGross >= knots[last]) return knots[last + 1] / 10_000;
  for (let i = 2; i <= last; i += 2) {
    if (monthlyGross <= knots[i]) {
      const [x1, y1, x2, y2] = [knots[i - 2], knots[i - 1], knots[i], knots[i + 1]];
      const t = (monthlyGross - x1) / (x2 - x1);
      return (y1 + t * (y2 - y1)) / 10_000;
    }
  }
  return knots[last + 1] / 10_000;
}
