import { useMemo, useState } from "react";
import type { Cabinet } from "@/types/cabinet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  SearchBar,
  SectionTitle,
  StatTile,
  StatusPill,
  CounterTabs,
  BrandLogo,
  fmtUah,
} from "../_primitives";
import {
  getSubscriptionsForCabinet,
  getMonthlySubscriptionsTotal,
  type PersonalSubscription,
} from "@/personal/subscriptions/personalSubscriptionsMock";
import { Pause, X, Settings2, Sparkles } from "lucide-react";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { enrichSubscription } from "@/personal/subscriptions/subscriptionEnrich";
import { useSubFlowStore } from "@/personal/subscriptions/subFlowStore";
import { useSubsStore } from "@/personal/subscriptions/subscriptionsStore";


const CATEGORY_LABEL: Record<PersonalSubscription["category"], string> = {
  streaming: "Стрімінг",
  cloud: "Хмара",
  insurance: "Страхування",
  fitness: "Фітнес",
  telecom: "Телеком",
  gov: "Державні",
};

type GroupId = "all" | "active" | "trial" | "cancelled" | "upcoming";

function daysUntil(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SubscriptionsPage({ cabinet }: { cabinet: Cabinet }) {
  const rawSubs = getSubscriptionsForCabinet(cabinet.id);
  const statusOverride = useSubsStore((s) => s.statusOverride);
  const subs = rawSubs
    .map(enrichSubscription)
    .map((s) => (statusOverride[s.id] === "cancelled" ? { ...s, usageHint: "unused" as const } : s));
  const monthly = getMonthlySubscriptionsTotal(cabinet.id);
  const { push } = useDrillStack();
  const openSubFlow = useSubFlowStore((s) => s.open);
  const [group, setGroup] = useState<GroupId>("all");


  const active = subs.filter((s) => s.usageHint === "active");
  const trial = subs.filter((s) => s.isTrial);
  const cancelled = subs.filter((s) => s.usageHint === "unused");
  const upcoming = [...subs]
    .filter((s) => daysUntil(s.nextChargeAt) <= 14 && daysUntil(s.nextChargeAt) >= 0)
    .sort((a, b) => a.nextChargeAt.localeCompare(b.nextChargeAt));

  const filtered = useMemo(() => {
    if (group === "active") return active;
    if (group === "trial") return trial;
    if (group === "cancelled") return cancelled;
    if (group === "upcoming") return upcoming;
    return subs;
  }, [group, subs, active, trial, cancelled, upcoming]);

  const lowUse = subs.filter((s) => s.usageHint === "low_use" || s.usageHint === "unused").length;
  const savings = Math.round(
    subs.filter((s) => s.usageHint === "low_use" || s.usageHint === "unused")
      .reduce((acc, s) => acc + (s.cadence === "month" ? s.amountUah : s.amountUah / 12), 0)
  );

  const monthCharge = upcoming.reduce((a, s) => a + s.amountUah, 0);

  return (
    <PageShell>
      <PageHeader
        title="Підписки"
        subtitle="Усі ваші регулярні платежі та сервіси в одному місці"
      />
      <SearchBar placeholder="Пошук підписок" />

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Активних" value={`${active.length}`} hint="використовуєте регулярно" tone="positive" />
        <StatTile label="Сума / місяць" value={fmtUah(Math.round(monthly))} hint="ефективна" />
        <StatTile label="До оплати у місяці" value={fmtUah(Math.round(monthCharge))} hint={`${upcoming.length} списань`} />
        <StatTile label="Можна скасувати" value={`${lowUse}`} hint={`економія ${fmtUah(savings)}/міс`} tone="warning" />
      </section>

      <CounterTabs<GroupId>
        value={group}
        onChange={setGroup}
        tabs={[
          { id: "all", label: "Усі", count: subs.length },
          { id: "active", label: "Активні", count: active.length },
          { id: "trial", label: "Trial", count: trial.length },
          { id: "upcoming", label: "Майбутні платежі", count: upcoming.length },
          { id: "cancelled", label: "Скасовані", count: cancelled.length },
        ]}
      />

      {/* Timeline for upcoming charges */}
      {group === "upcoming" && upcoming.length > 0 && (
        <Card className="p-3 border-border/70">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">
            Найближчі 14 днів · {fmtUah(monthCharge)}
          </div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 14 }).map((_, i) => {
              const day = new Date();
              day.setDate(day.getDate() + i);
              const iso = day.toISOString().slice(0, 10);
              const todays = upcoming.filter((s) => s.nextChargeAt === iso);
              const sum = todays.reduce((a, s) => a + s.amountUah, 0);
              const max = Math.max(1, ...upcoming.map((s) => s.amountUah));
              const h = sum > 0 ? Math.max(8, (sum / max) * 56) : 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className={`w-full rounded-sm ${sum > 0 ? "bg-primary/70" : "bg-muted"}`} style={{ height: `${h}px` }} />
                  <div className="text-[9px] text-muted-foreground tabular-nums">{day.getDate()}</div>
                  {sum > 0 && (
                    <div className="absolute -top-7 hidden group-hover:block bg-popover text-popover-foreground border rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap z-10 tabular-nums">
                      {fmtUah(sum)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-6 border-border/70 text-sm text-muted-foreground text-center">
          У цій вкладці порожньо
        </Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map((s) => {
            const dleft = daysUntil(s.nextChargeAt);
            return (
              <Card
                key={s.id}
                className="p-3 border-border/70 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => push({ kind: "subscription", id: s.id, sourceLabel: "Підписки", displayName: s.name })}
              >
                <BrandLogo brand={s.name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{s.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {CATEGORY_LABEL[s.category]}
                    </span>
                    {s.isTrial && <StatusPill label="trial" tone="active" />}
                    {s.usageHint === "low_use" && <StatusPill label="низька активність" tone="warning" />}
                    {s.usageHint === "unused" && <StatusPill label="не використовується" tone="danger" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Наступне списання: {s.nextChargeAt}
                    {dleft >= 0 && dleft <= 7 && (
                      <span className="ml-1.5 text-amber-600 dark:text-amber-400">· через {dleft} дн</span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tabular-nums">{fmtUah(s.amountUah)}</div>
                  <div className="text-[10px] text-muted-foreground">
                    /{s.cadence === "month" ? "міс" : "рік"}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Призупинити"
                    onClick={() => useSubsStore.getState().pause(s.id)}>
                    <Pause className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Змінити тариф"
                    onClick={() => openSubFlow("changePlan", s.id, cabinet.id)}>
                    <Settings2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" title="Скасувати"
                    onClick={() => openSubFlow("cancel", s.id, cabinet.id)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

              </Card>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      <section>
        <SectionTitle title="Рекомендації AI" hint="оптимізація витрат на підписки" />
        <div className="grid gap-2 sm:grid-cols-2">
          <Card className="p-3 border-border/70 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Об'єднати Netflix + Spotify у сімейний план</div>
              <p className="text-xs text-muted-foreground mt-0.5">Економія до 280 ₴/міс</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">Деталі</Button>
          </Card>
          <Card className="p-3 border-border/70 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Apple Arcade не використовується 3 місяці</div>
              <p className="text-xs text-muted-foreground mt-0.5">Можна скасувати — економія 199 ₴/міс</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">Скасувати</Button>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
