#!/usr/bin/env node
/**
 * Regenerates lib/salary/qst-tariffs.ts from the official ESTV withholding-tax
 * (Quellensteuer) tariff files for salaries.
 *
 * Source: https://www.estv2.admin.ch/qst/<year>/loehne/tar<yy>txt.zip
 * (per-canton fixed-width text files, Recordart 06, layout per ESTV
 * "Aufbau und Recordformate der Quellensteuer-Tarife (Löhne)").
 *
 * Embedded tariff codes: A0 (single), B0–B5 (married sole earner),
 * C0–C5 (married double earner), H1–H5 (single parent), each in the
 * without-church (N) and — where published — with-church (Y) variant.
 * GE/NE/VD/VS/TI publish only N, JU only Y.
 *
 * The official bracket tables (~25k rows per canton) are compressed to
 * piecewise-linear knots: rate jumps > ${JUMP_TOL}pp keep their exact step
 * edges, smooth regions are simplified with a ${TOL}pp Douglas-Peucker
 * tolerance. The script measures and prints the real worst-case deviation.
 *
 * Usage: node scripts/refresh-qst-tariffs.mjs [year] [--dir <extracted-dir>]
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const YEAR = Number(process.argv.includes("--dir") ? process.argv[2] : process.argv[2] ?? 2026) || 2026;
const YY = String(YEAR).slice(2);
const OUT = new URL("../lib/salary/qst-tariffs.ts", import.meta.url).pathname;
const TOL = 0.1; // percentage points, smooth regions
const JUMP_TOL = 0.2; // pp; larger official steps are kept exactly

const dirFlag = process.argv.indexOf("--dir");
let DIR;
if (dirFlag >= 0) {
  DIR = process.argv[dirFlag + 1];
} else {
  DIR = path.join(os.tmpdir(), `swiss-salary-qst-${YEAR}`);
  if (!fs.existsSync(path.join(DIR, `tar${YY}zh.txt`))) {
    fs.mkdirSync(DIR, { recursive: true });
    const zip = path.join(DIR, "tariffs.zip");
    const url = `https://www.estv2.admin.ch/qst/${YEAR}/loehne/tar${YEAR}txt.zip`;
    console.log(`downloading ${url}`);
    execFileSync("curl", ["-sSL", "-o", zip, url]);
    execFileSync("unzip", ["-oq", zip, "-d", DIR]);
  }
}

const CANTONS = ["AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH"];

const CODES = [];
for (const L of ["A", "B", "C", "H"])
  for (let k = 0; k <= 5; k++)
    for (const ch of ["N", "Y"]) {
      if (L === "A" && k > 0) continue;
      if (L === "H" && k === 0) continue;
      CODES.push(L + k + ch);
    }

function parseFile(file) {
  const txt = fs.readFileSync(file, "latin1");
  const tariffs = {};
  const dates = new Set();
  for (const line of txt.split(/\r?\n/)) {
    if (!line.startsWith("0601")) continue; // Recordart 06, valid entry
    const code = line.slice(6, 16).trim();
    if (!/^[ABCH]\d[NY]$/.test(code)) continue;
    dates.add(line.slice(16, 24));
    const from = Number(line.slice(24, 33)) / 100; // CHF/month
    const rate = Number(line.slice(54, 59)) / 100; // % of gross
    if (Number.isNaN(from) || Number.isNaN(rate)) throw new Error(`bad line: ${line}`);
    (tariffs[code] ??= []).push({ from, rate });
  }
  if (dates.size > 1) console.warn(`  ${path.basename(file)}: multiple validity dates ${[...dates]}`);
  for (const arr of Object.values(tariffs)) arr.sort((a, b) => a.from - b.from);
  return tariffs;
}

function douglasPeucker(pts, tol) {
  if (pts.length <= 2) return pts;
  const keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let maxD = -1, idx = -1;
    const [x1, y1] = pts[a], [x2, y2] = pts[b];
    for (let i = a + 1; i < b; i++) {
      const [x, y] = pts[i];
      const t = x2 === x1 ? 0 : (x - x1) / (x2 - x1);
      const d = Math.abs(y - (y1 + t * (y2 - y1)));
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol) { keep[idx] = true; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

function knots(brackets) {
  const pts = [];
  for (let i = 0; i < brackets.length; i++) {
    const b = brackets[i], prev = brackets[i - 1];
    if (prev && b.rate - prev.rate > JUMP_TOL) pts.push([b.from - 1, prev.rate]);
    pts.push([b.from, b.rate]);
  }
  return douglasPeucker(pts, TOL).map(([x, y]) => [Math.round(x), Math.round(y * 100)]);
}

const exactRate = (brackets, m) => {
  let r = brackets[0].rate;
  for (const b of brackets) { if (m >= b.from) r = b.rate; else break; }
  return r;
};
const interp = (kn, x) => {
  if (x <= kn[0][0]) return kn[0][1] / 100;
  if (x >= kn[kn.length - 1][0]) return kn[kn.length - 1][1] / 100;
  for (let i = 1; i < kn.length; i++)
    if (x <= kn[i][0]) {
      const [x1, y1] = kn[i - 1], [x2, y2] = kn[i];
      return (x2 === x1 ? y2 : y1 + ((x - x1) / (x2 - x1)) * (y2 - y1)) / 100;
    }
};

let body = "", nKnots = 0, worst = 0, worstAt = "";
for (const canton of CANTONS) {
  const tariffs = parseFile(path.join(DIR, `tar${YY}${canton.toLowerCase()}.txt`));
  body += `  ${canton}: {\n`;
  for (const code of CODES) {
    const br = tariffs[code];
    if (!br) continue;
    const kn = knots(br);
    nKnots += kn.length;
    for (let m = 1000; m <= 60000; m += 25) {
      const err = Math.abs(interp(kn, m) - exactRate(br, m));
      if (err > worst) { worst = err; worstAt = `${canton} ${code} @${m}`; }
    }
    // delta-encode (first pair absolute) — small integers gzip ~45% better
    const flat = kn.flatMap(([x, y], i) =>
      i === 0 ? [x, y] : [x - kn[i - 1][0], y - kn[i - 1][1]]
    );
    body += `    ${code}: [${flat.join(",")}],\n`;
  }
  body += `  },\n`;
  console.log(`${canton} done`);
}
console.log(`${nKnots} knots, worst deviation ${worst.toFixed(3)}pp (${worstAt})`);

const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node scripts/refresh-qst-tariffs.mjs ${YEAR}
 *
 * Official ESTV ${YEAR} withholding-tax (Quellensteuer) tariffs for salaries,
 * per canton and tariff code (letter + number of children + N/Y church).
 * Values are DELTA-ENCODED piecewise-linear knots: the first pair is
 * [monthly gross CHF, rate in % · 100], every further pair is the delta to
 * its predecessor (decoded in qst.ts). Compressed from the official bracket
 * tables; official rate steps larger than ${JUMP_TOL}pp keep their exact
 * edges. Worst-case deviation from the exact bracket rate (measured
 * 1'000–60'000/month): ${worst.toFixed(3)}pp.
 */
import type { Canton } from "./cantons";

export const QST_YEAR = ${YEAR};

/** tariff code → delta-encoded knot pairs (see header) */
export const QST_TARIFFS: Record<Canton, Readonly<Record<string, readonly number[]>>> = {
${body}};
`;
fs.writeFileSync(OUT, out);
console.log(`wrote ${OUT} (${Math.round(out.length / 1024)} KB)`);
