/** Resolve a value from a historical series at a given "as of" date. */

export interface AsOfPoint {
  date: string; // YYYY | YYYY-MM | YYYY-MM-DD
  value: number;
}

export function parseHistoryDate(s: string): Date {
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  const ym = s.match(/^(\d{4})-(\d{2})/);
  if (ym) return new Date(Number(ym[1]), Number(ym[2]) - 1, 1);
  const y = s.match(/^(\d{4})/);
  if (y) return new Date(Number(y[1]), 0, 1);
  return new Date(s);
}

export interface AsOfResult {
  value: number;
  date: string;
  isExact: boolean;
  prevValue?: number;
  prevDate?: string;
  pointsUpTo: AsOfPoint[];
}

export function getValueAsOf(history: AsOfPoint[], asOf: Date): AsOfResult | null {
  if (!history?.length) return null;
  const sorted = [...history].sort((a, b) => parseHistoryDate(a.date).getTime() - parseHistoryDate(b.date).getTime());
  const upTo = sorted.filter((p) => parseHistoryDate(p.date) <= asOf);
  if (upTo.length === 0) return null;
  const last = upTo[upTo.length - 1];
  const prev = upTo.length >= 2 ? upTo[upTo.length - 2] : undefined;
  return {
    value: last.value,
    date: last.date,
    isExact: parseHistoryDate(last.date).toDateString() === asOf.toDateString(),
    prevValue: prev?.value,
    prevDate: prev?.date,
    pointsUpTo: upTo,
  };
}
