/**
 * Piecewise-linear interpolation over [income, rate] points.
 * Below the first point the rate scales linearly down to 0 at income 0
 * (progressive taxes vanish near zero income); above the last point it clamps.
 */
export function interpolateRate(
  points: readonly (readonly [number, number])[],
  income: number
): number {
  if (points.length === 0 || income <= 0) return 0;
  const first = points[0];
  if (income <= first[0]) return first[1] * (income / first[0]);
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    if (income <= x2) {
      const t = (income - x1) / (x2 - x1);
      return y1 + t * (y2 - y1);
    }
  }
  return points[points.length - 1][1];
}
