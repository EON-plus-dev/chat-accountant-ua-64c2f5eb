import { useMemo, useState } from "react";
import type { Cabinet } from "@/types/cabinet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageShell,
  PageHeader,
  SearchBar,
  StatusPill,
  CounterTabs,
  BrandLogo,
  StickyTopBar,
  fmtUah,
} from "../_primitives";
import {
  type PersonalOrderStatus,
  type PersonalOrderKind,
} from "@/personal/orders/personalOrdersMock";
import { getMergedPersonalOrders, useOrdersStore } from "@/personal/orders/personalOrdersStore";

import { MoreVertical, RotateCcw, X, LifeBuoy, Download } from "lucide-react";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { useToast } from "@/hooks/use-toast";

type KindTab = "all" | PersonalOrderKind;

const KIND_LABEL: Record<PersonalOrderKind, string> = {
  purchase: "Покупка",
  service: "Послуга",
  booking: "Бронювання",
};

const STATUS_FILTERS: { id: PersonalOrderStatus | "all"; label: string }[] = [
  { id: "all", label: "Усі статуси" },
  { id: "scheduled", label: "Заплановані" },
  { id: "active", label: "Активні" },
  { id: "completed", label: "Завершені" },
  { id: "cancelled", label: "Скасовані" },
];

const STATUS_TONE: Record<PersonalOrderStatus, "active" | "success" | "neutral" | "danger"> = {
  scheduled: "active",
  active: "success",
  completed: "neutral",
  cancelled: "danger",
};
const STATUS_LABEL: Record<PersonalOrderStatus, string> = {
  scheduled: "Заплановано",
  active: "В дорозі",
  completed: "Виконано",
  cancelled: "Скасовано",
};

const MONTHS_UK = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];

function monthLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS_UK[d.getMonth()]} ${d.getFullYear()}`;
}

function orderNumber(id: string) {
  // Stable mock-derived order number
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 33 + id.charCodeAt(i)) >>> 0;
  return `№ ${100000 + (h % 900000)}`;
}

export default function MyOrdersPage({ cabinet }: { cabinet: Cabinet }) {
  // Підписка на store через селектор — щоб переоренденриться при checkout/cancel.
  useOrdersStore((s) => s.extra[cabinet.id]);
  useOrdersStore((s) => s.statusOverride);
  const all = getMergedPersonalOrders(cabinet.id);

  const { push } = useDrillStack();
  const { toast } = useToast();
  const demoToast = (msg: string) => toast({ title: "Демо-режим", description: msg });
  const [kind, setKind] = useState<KindTab>("all");
  const [status, setStatus] = useState<PersonalOrderStatus | "all">("all");

  const filtered = useMemo(
    () =>
      all
        .filter((o) => (kind === "all" ? true : o.kind === kind))
        .filter((o) => (status === "all" ? true : o.status === status))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [all, kind, status]
  );

  const counts = useMemo(() => ({
    all: all.length,
    purchase: all.filter((o) => o.kind === "purchase").length,
    service: all.filter((o) => o.kind === "service").length,
    booking: all.filter((o) => o.kind === "booking").length,
  }), [all]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const o of filtered) {
      const m = monthLabel(o.date);
      const arr = map.get(m) ?? [];
      arr.push(o);
      map.set(m, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <PageShell>
      <StickyTopBar>
        <PageHeader
          title="Мої замовлення"
          subtitle="Усі ваші покупки, послуги та бронювання разом"
        />
        <SearchBar placeholder="Пошук замовлень" />
        <CounterTabs<KindTab>
          value={kind}
          onChange={setKind}
          tabs={[
            { id: "all", label: "Усі", count: counts.all },
            { id: "purchase", label: "Магазин", count: counts.purchase },
            { id: "service", label: "Послуги", count: counts.service },
            { id: "booking", label: "Бронювання", count: counts.booking },
          ]}
        />
      </StickyTopBar>

      {/* Mobile: status as Select */}
      <div className="md:hidden">
        <Select value={status} onValueChange={(v) => setStatus(v as PersonalOrderStatus | "all")}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: status as button row */}
      <div className="hidden md:flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.id}
            variant={status === f.id ? "secondary" : "ghost"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setStatus(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <Card className="p-6 border-border/70 text-sm text-muted-foreground text-center">
          За цими фільтрами замовлень немає
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([month, items]) => (
            <section key={month}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {month}
                </h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {items.length} замовлень · {fmtUah(items.reduce((a, o) => a + o.amountUah, 0))}
                </span>
              </div>
              <div className="grid gap-2">
                {items.map((o) => (
                  <Card
                    key={o.id}
                    className="p-3 border-border/70 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => push({ kind: "personal-order", id: o.id, sourceLabel: "Мої замовлення", displayName: o.title })}
                  >
                    <div className="flex items-start gap-3">
                      <BrandLogo brand={o.vendor} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium leading-tight truncate">{o.title}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-1 -mr-1">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => demoToast("Замовлення скопійовано в кошик")}>
                                <RotateCcw className="w-3.5 h-3.5 mr-2" /> Повторити
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => demoToast("Звернення створено")}>
                                <LifeBuoy className="w-3.5 h-3.5 mr-2" /> Допомога
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => demoToast("Чек збережено")}>
                                <Download className="w-3.5 h-3.5 mr-2" /> Експорт
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-rose-600" onClick={() => demoToast("Скасування буде підтверджено email")}>
                                <X className="w-3.5 h-3.5 mr-2" /> Скасувати
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {orderNumber(o.id)} · {KIND_LABEL[o.kind]} · {o.vendor} · {o.date}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <StatusPill label={STATUS_LABEL[o.status]} tone={STATUS_TONE[o.status]} />
                          <div className="text-sm font-semibold whitespace-nowrap tabular-nums">
                            {o.amountUah > 0 ? fmtUah(o.amountUah) : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
