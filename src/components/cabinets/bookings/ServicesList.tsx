/**
 * ServicesList — каталог послуг із цінами, тривалістю, популярністю.
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { BookableService as SalonService, Booking as SalonBooking } from "@/core";
import type { ServiceCategory } from "@/config/demoCabinets/salonData";

interface Props {
  services: SalonService[];
  bookings: SalonBooking[];
}

const CAT_LABEL: Partial<Record<ServiceCategory, string>> = {
  hair: "Перукарські",
  nails: "Манікюр / Педикюр",
  massage: "Масаж",
  spa: "SPA",
  brows: "Брови / Вії",
};

const CAT_COLOR: Partial<Record<ServiceCategory, string>> = {
  hair: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  nails: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  massage: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  spa: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  brows: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
};

export function ServicesList({ services, bookings }: Props) {
  // Popularity: count of done bookings that include the service (last 30d)
  const stats = useMemo(() => {
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const iso = last30.toISOString().split("T")[0];
    const counts = new Map<string, number>();
    let total = 0;
    for (const b of bookings) {
      if (b.status !== "done" || b.date < iso) continue;
      for (const sid of b.serviceIds) {
        counts.set(sid, (counts.get(sid) ?? 0) + 1);
        total++;
      }
    }
    return { counts, total };
  }, [bookings]);

  const grouped = new Map<ServiceCategory, SalonService[]>();
  for (const s of services) {
    const arr = grouped.get(s.category) ?? [];
    arr.push(s);
    grouped.set(s.category, arr);
  }

  return (
    <div className="space-y-3">
      {[...grouped.entries()].map(([cat, items]) => (
        <Card key={cat}>
          <CardContent className="p-3 md:p-4">
            <header className="flex items-center justify-between mb-2 pb-2 border-b">
              <Badge variant="outline" size="sm" className={cn("text-[11px] border", CAT_COLOR[cat])}>
                {CAT_LABEL[cat]}
              </Badge>
              <span className="text-[11px] text-muted-foreground">{items.length} послуг</span>
            </header>
            <ul className="divide-y">
              {items.map((s) => {
                const count = stats.counts.get(s.id) ?? 0;
                const sharePct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <li key={s.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 py-2 items-center text-sm">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Винагорода майстра за замовч.: {s.defaultCommissionPct}%
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums w-14 text-right">
                      {s.durationMin} хв
                    </div>
                    <div className="text-sm font-semibold tabular-nums w-20 text-right">
                      {formatCurrency(s.price)}
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums w-16 text-right">
                      {count} раз{count === 1 ? "" : count >= 2 && count <= 4 ? "и" : "ів"}
                      {sharePct > 0 && <span className="ml-1">· {sharePct}%</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
