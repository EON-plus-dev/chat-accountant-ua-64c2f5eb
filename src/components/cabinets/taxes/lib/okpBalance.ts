/**
 * Сальдо ОКП за bucket'ами станом на дату.
 * Дт > 0 → недоїмка, Кт > 0 → переплата.
 */
import type { OkpBucket, OkpOperation } from "./okpLedgerEngine";

export interface BucketBalance {
  /** Сума всіх Дт-операцій (нарахувань) */
  dt: number;
  /** Сума всіх Кт-операцій (сплат/повернень) */
  kt: number;
  /** Підсумкове сальдо: Дт − Кт. + → недоїмка, − → переплата */
  net: number;
}

export interface OkpBalance {
  main: BucketBalance;
  fine: BucketBalance;
  penalty: BucketBalance;
  total: BucketBalance;
}

const empty = (): BucketBalance => ({ dt: 0, kt: 0, net: 0 });

export function computeOkpBalance(
  operations: OkpOperation[],
  asOf: Date = new Date(),
): OkpBalance {
  const ts = asOf.getTime();
  const buckets: Record<OkpBucket, BucketBalance> = {
    main: empty(),
    fine: empty(),
    penalty: empty(),
  };
  for (const op of operations) {
    if (new Date(op.date).getTime() > ts) continue;
    const b = buckets[op.bucket];
    if (op.amount >= 0) b.dt += op.amount;
    else b.kt += -op.amount;
    b.net = b.dt - b.kt;
  }
  const total: BucketBalance = {
    dt: buckets.main.dt + buckets.fine.dt + buckets.penalty.dt,
    kt: buckets.main.kt + buckets.fine.kt + buckets.penalty.kt,
    net: 0,
  };
  total.net = total.dt - total.kt;
  return { ...buckets, total };
}

export function balanceLabel(net: number): { text: string; tone: "debt" | "credit" | "zero" } {
  if (net > 0.5) return { text: "Недоїмка", tone: "debt" };
  if (net < -0.5) return { text: "Переплата", tone: "credit" };
  return { text: "Сальдо нульове", tone: "zero" };
}
