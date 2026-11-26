/** Nepali-style grouping: 12,34,567 → "रु 12,34,567". */
export function npr(n: number): string {
  return "रु " + Math.round(n).toLocaleString("en-IN");
}
