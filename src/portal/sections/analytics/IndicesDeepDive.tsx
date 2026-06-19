import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ArrowRight, TrendingUp, TrendingDown, Minus, Bell, Info, Check, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAudience } from "@/contexts/AudienceContext";
import { CURRENCY_RATES, FINANCIAL_INDICES, DEPOSIT_OFFERS } from "@/portal/data/finder";
import { DEADLINES } from "@/portal/data/deadlines";
import { ARTICLES } from "@/portal/data/articles";
import { createSubscription } from "@/portal/services/subscriptions";
import {
  getNextNbuMeeting,
  FUEL_A95,
  USD_YEAR_RETURN,
  INFLATION_YOY,
  OVDP_GROSS,
  formatAsOf,
} from "@/portal/data/analyticsLiveData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Audience = "business" | "individual";

// ============================================================================
// LANE 1 · «Сьогодні треба знати» (high-frequency, daily)
// ============================================================================

function TodayMustKnowLane() {
  const usd = CURRENCY_RATES.rates.find((r) => r.currency === "USD");
  const eur = CURRENCY_RATES.rates.find((r) => r.currency === "EUR");

  const usdCash = usd ? Math.max(...usd.banks.map((b) => b.sellRate ?? 0)) : 0;
  const usdSpread = usdCash && usd ? usdCash - usd.nbuRate : 0;

  const nbu = FINANCIAL_INDICES.indices.find((i) => i.id === "discount-rate");
  const meeting = getNextNbuMeeting();

  const cards = [
    {
      id: "usd",
      label: "USD · НБУ vs готівка",
      primary: usd ? `${usd.nbuRate.toFixed(2)} ₴` : "—",
      secondary: usdCash ? `готівка ${usdCash.toFixed(2)} ₴` : "",
      delta: usd?.nbuChange ?? 0,
      deltaLabel: "за тиждень",
      sub: usdSpread ? `спред +${usdSpread.toFixed(2)} ₴` : "",
      cta: { label: "Курси банків", href: "/analytics/currency" },
      asOf: CURRENCY_RATES.meta.lastUpdatedISO,
    },
    {
      id: "eur",
      label: "EUR · офіційний курс",
      primary: eur ? `${eur.nbuRate.toFixed(2)} ₴` : "—",
      secondary: "НБУ",
      delta: eur?.nbuChange ?? 0,
      deltaLabel: "за тиждень",
      cta: { label: "Графік EUR", href: "/analytics/currency" },
      asOf: CURRENCY_RATES.meta.lastUpdatedISO,
    },
    {
      id: "fuel",
      label: "Бензин А-95",
      primary: `${FUEL_A95.value.toFixed(2)} ₴/л`,
      secondary: "сер. по топ-5 АЗС",
      delta: FUEL_A95.weekDelta,
      deltaLabel: "за тиждень",
      cta: { label: "Архів цін", href: "/analytics/archive" },
      asOf: FUEL_A95.asOf,
    },
    {
      id: "nbu",
      label: "Облікова ставка НБУ",
      primary: nbu ? `${nbu.value}%` : "14.5%",
      secondary: `засідання ${meeting.label}`,
      delta: nbu?.change ?? 0,
      deltaLabel: "з лют",
      sub: "тригер для депозитів і кредитів",
      cta: { label: "Графік ставки", href: "/analytics/indices" },
      asOf: nbu ? meeting.iso : meeting.iso,
    },
  ];

  return (
    <div className="space-y-3">
      <LaneHeader
        title="Сьогодні треба знати"
        subtitle="Цифри, які варто перевірити перед оплатою, обміном або кредитним рішенням"
        cadence="Щодня"
      />
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {cards.map((c) => {
          // Семантика: для USD/EUR/бензину зростання = погано; для НБУ — нейтрально
          const negativeWhenUp = c.id === "usd" || c.id === "eur" || c.id === "fuel";
          const isUp = c.delta > 0;
          const tone =
            c.delta === 0
              ? "muted"
              : negativeWhenUp
                ? isUp
                  ? "negative"
                  : "positive"
                : "muted";
          return (
            <Card key={c.id} className="shrink-0 w-[200px] hover:border-primary/30 transition-colors">
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground leading-tight">{c.label}</p>
                  <AlertButton metricId={c.id} metricLabel={c.label} />
                </div>
                <p className="text-xl font-bold font-mono text-foreground tabular-nums">{c.primary}</p>
                {c.secondary && <p className="text-[11px] text-muted-foreground truncate">{c.secondary}</p>}
                <div className="flex items-center gap-1 text-[11px]">
                  <DeltaBadge delta={c.delta} tone={tone} />
                  <span className="text-muted-foreground">{c.deltaLabel}</span>
                </div>
                {c.sub && <p className="text-[10px] text-muted-foreground italic">{c.sub}</p>}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <Link
                    to={c.cta.href}
                    className="inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline"
                  >
                    {c.cta.label} <ArrowRight className="h-3 w-3" />
                  </Link>
                  <span className="text-[10px] text-muted-foreground/70">{formatAsOf(c.asOf)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// LANE 2 · «Куди покласти гроші зараз» (calc, weekly)
// ============================================================================

function WhereToParkCashLane() {
  const [amount, setAmount] = useState(10_000);

  // Реальні депозити: тільки UAH і виключаємо ОВДП-проксі (вони йдуть окремою лінією)
  const topDeposits = useMemo(
    () =>
      [...DEPOSIT_OFFERS.offers]
        .filter((d) => d.currency === "UAH" && !d.bankId.includes("ovdp"))
        .sort((a, b) => b.rateMax - a.rateMax)
        .slice(0, 3),
    []
  );
  const depositGross = topDeposits.length
    ? topDeposits.reduce((s, d) => s + d.rateMax, 0) / topDeposits.length
    : 14.5;
  const depositNet = depositGross * (1 - 0.18 - 0.05); // ПДФО 18% + ВЗ 5%

  const ovdpGross = OVDP_GROSS.value;
  const ovdpNet = ovdpGross * (1 - 0.05); // тільки ВЗ 5%

  const usdYearReturn = USD_YEAR_RETURN.value;
  const inflation = INFLATION_YOY.value;

  const options = [
    {
      id: "ovdp",
      label: "ОВДП Мінфіну",
      ratePct: ovdpNet,
      result: amount * (1 + ovdpNet / 100),
      sub: `${ovdpGross}% купон, без ПДФО · ВЗ 5%`,
      href: "/analytics/deposits",
      tone: "primary" as const,
    },
    {
      id: "deposit",
      label: `Депозит топ-${topDeposits.length || 3} банків`,
      ratePct: depositNet,
      result: amount * (1 + depositNet / 100),
      sub: `${depositGross.toFixed(1)}% gross · −23% податків`,
      href: "/analytics/deposits",
      tone: "primary" as const,
    },
    {
      id: "usd",
      label: "Готівка USD",
      ratePct: usdYearReturn,
      result: amount * (1 + usdYearReturn / 100),
      sub: "девальвація грн до USD за рік",
      href: "/analytics/currency",
      tone: "muted" as const,
    },
    {
      id: "card",
      label: "Залишити на картці",
      ratePct: -inflation,
      result: amount * (1 - inflation / 100),
      sub: `інфляція ІСЦ −${inflation}%`,
      href: "/analytics/indices",
      tone: "negative" as const,
    },
  ];

  // Реальна купівельна спроможність — orientуємось проти інфляції
  const realLine = amount * (1 - inflation / 100); // що буде, якщо нічого не робити
  const sorted = [...options].sort((a, b) => b.result - a.result);
  const winner = sorted[0];
  // «Найкраще» лише якщо реально випереджає інфляцію; інакше — попередження
  const winnerBeatsInflation = winner.result > amount; // номінальний приріст
  const anyBeatsInflation = sorted.some((o) => o.ratePct > 0);

  return (
    <div className="space-y-3">
      <LaneHeader
        title="Куди покласти гроші зараз"
        subtitle="Порівняння в одній валюті, з податками, на вашу суму через 1 рік"
        cadence="Тижнево"
      />
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Input */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-medium text-foreground shrink-0">Сума:</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-32 font-mono"
              min={0}
              step={1000}
            />
            <span className="text-sm text-muted-foreground">₴ через рік:</span>
            <div className="flex gap-1.5 ml-auto">
              {[10_000, 50_000, 100_000].map((v) => (
                <Button
                  key={v}
                  variant={amount === v ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => setAmount(v)}
                >
                  {v.toLocaleString("uk-UA")}
                </Button>
              ))}
            </div>
          </div>

          {/* Бенчмарк інфляції */}
          <div className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block h-2 w-2 rounded-full bg-destructive shrink-0" />
              <p className="text-xs text-muted-foreground truncate">
                Щоб не втратити купівельну спроможність, потрібно мінімум
              </p>
            </div>
            <p className="text-sm font-mono font-semibold text-foreground tabular-nums shrink-0">
              {Math.round(amount * (1 + inflation / 100)).toLocaleString("uk-UA")} ₴
            </p>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {sorted.map((opt, i) => {
              const isWinner = opt.id === winner.id;
              const profit = opt.result - amount;
              const beatsInflation = opt.result >= amount * (1 + inflation / 100);
              const colorByTone =
                opt.tone === "primary"
                  ? "text-chart-2"
                  : opt.tone === "negative"
                    ? "text-destructive"
                    : "text-foreground";
              return (
                <Link
                  key={opt.id}
                  to={opt.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40 group",
                    isWinner && winnerBeatsInflation && "border-chart-2/40 bg-chart-2/5"
                  )}
                >
                  <span className="w-5 text-xs font-mono text-muted-foreground tabular-nums">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{opt.label}</p>
                      {isWinner && winnerBeatsInflation && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 bg-chart-2/15 text-chart-2 border-chart-2/30"
                        >
                          найкраще з номінальним +
                        </Badge>
                      )}
                      {beatsInflation && (
                        <Badge variant="outline" className="text-[10px] h-4">
                          ↑ інфляція
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{opt.sub}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-base font-bold font-mono tabular-nums", colorByTone)}>
                      {Math.round(opt.result).toLocaleString("uk-UA")} ₴
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {profit >= 0 ? "+" : ""}
                      {Math.round(profit).toLocaleString("uk-UA")} ₴ ({opt.ratePct >= 0 ? "+" : ""}
                      {opt.ratePct.toFixed(1)}%)
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {!anyBeatsInflation && (
            <div className="text-[11px] rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive flex items-start gap-1.5">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              Жоден з варіантів сьогодні не випереджає інфляцію. «Найкращий» — той, де ви втратите менше.
            </div>
          )}

          <p className="text-[11px] text-muted-foreground italic flex items-center gap-1.5">
            <Info className="h-3 w-3 shrink-0" />
            Як FINTODO рахує: депозит — gross мінус ПДФО 18% + ВЗ 5%; ОВДП — без ПДФО, тільки ВЗ; готівка USD — динаміка курсу НБУ за рік; картка — за ІСЦ Держстату. Дані станом на {formatAsOf(OVDP_GROSS.asOf)}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// LANE 3 · «Календар грошей» (monthly, audience-aware)
// ============================================================================

function MoneyCalendarLane({ audience }: { audience: Audience }) {
  const deadlines = useMemo(() => {
    return DEADLINES.filter((d) => d.daysLeft > 0)
      .filter((d) => {
        if (audience === "business") return true;
        return d.taxType === "all" || d.type === "report";
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 2);
  }, [audience]);

  const since = Date.now() - 30 * 86400000;
  const recentChanges = useMemo(
    () =>
      ARTICLES.filter((a) => a.contentType === "change")
        .filter((a) => {
          const t = new Date(a.publishedAt).getTime();
          return !isNaN(t) && t >= since;
        })
        .filter((a) =>
          audience === "business"
            ? a.audience === "business" || a.audience === "both"
            : a.audience === "personal" || a.audience === "both"
        )
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 3),
    [audience, since]
  );

  return (
    <div className="space-y-3">
      <LaneHeader
        title="Календар грошей"
        subtitle={
          audience === "business"
            ? "Найближчі дедлайни, ліміти ФОП та зміни, які стосуються вашої діяльності"
            : "Найближчі звіти фізособи та зміни, які стосуються ваших доходів"
        }
        cadence="Місячно"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 space-y-2.5">
            <p className="text-sm font-semibold text-foreground">Найближчі дедлайни</p>
            {deadlines.length === 0 ? (
              <p className="text-xs text-muted-foreground">Немає актуальних дедлайнів у вашому контексті</p>
            ) : (
              deadlines.map((d) => {
                const urgent = d.daysLeft <= 7;
                return (
                  <Link
                    key={d.id}
                    to="/tools/calendar"
                    className="block rounded-md border p-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-tight">{d.title}</p>
                      <Badge variant={urgent ? "destructive" : "secondary"} className="text-[10px] h-5 shrink-0">
                        {d.daysLeft} дн.
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{d.date}</p>
                  </Link>
                );
              })
            )}
            <Link
              to="/tools/calendar"
              className="text-xs text-primary hover:underline inline-flex items-center gap-0.5 pt-1"
            >
              Усі дедлайни <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Свіжі зміни за 30 днів</p>
              <Badge variant="secondary" className="text-[10px] h-5">
                {recentChanges.length}
              </Badge>
            </div>
            {recentChanges.length === 0 ? (
              <p className="text-xs text-muted-foreground">Останні 30 днів — без змін у вашому контексті</p>
            ) : (
              recentChanges.map((a) => (
                <Link
                  key={a.id}
                  to={`/articles/${a.slug}`}
                  className="block rounded-md border p-2.5 hover:border-primary/40 transition-colors"
                >
                  <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {new Date(a.publishedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                  </p>
                </Link>
              ))
            )}
            <Link
              to="/law"
              className="text-xs text-primary hover:underline inline-flex items-center gap-0.5 pt-1"
            >
              Усі зміни <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Shared bits
// ============================================================================

function LaneHeader({ title, subtitle, cadence }: { title: string; subtitle: string; cadence: string }) {
  return (
    <div className="flex items-end justify-between gap-3 flex-wrap">
      <div className="space-y-0.5">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <Badge variant="outline" className="text-[10px] h-5 shrink-0 font-normal text-muted-foreground">
        {cadence}
      </Badge>
    </div>
  );
}

function DeltaBadge({ delta, tone }: { delta: number; tone: "positive" | "negative" | "muted" }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>0</span>
      </span>
    );
  }
  const isUp = delta > 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  const color =
    tone === "positive" ? "text-chart-2" : tone === "negative" ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-mono tabular-nums", color)}>
      <Icon className="h-3 w-3" />
      <span>
        {isUp ? "+" : ""}
        {delta.toFixed(2)}
      </span>
    </span>
  );
}

// Реальна підписка на сповіщення про зміну метрики (пов'язана з email_subscriptions)
function AlertButton({ metricId, metricLabel }: { metricId: string; metricLabel: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({ title: "Вкажіть коректний email", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const res = await createSubscription({
      email,
      source: "alert_subscription",
      topics: [metricId],
    });
    setSubmitting(false);
    if (res.success) {
      setDone(true);
      toast({ title: "Підписка оформлена", description: `Сповіщатимемо про зміни «${metricLabel}»` });
      setTimeout(() => setOpen(false), 1200);
    } else {
      toast({ title: "Не вдалось підписатись", description: res.error, variant: "destructive" });
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="text-muted-foreground/60 hover:text-primary transition-colors"
                aria-label={`Сповіщати про зміни: ${metricLabel}`}
              >
                <Bell className="h-3 w-3" />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            Сповістити, коли зміниться
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-72 p-3" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Сповіщати про «{metricLabel}»</p>
          <p className="text-[11px] text-muted-foreground">
            Надішлемо email, коли значення зміниться більш ніж на 1%.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="ваш@email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8 text-sm"
              disabled={submitting || done}
              required
            />
            <Button type="submit" size="sm" className="h-8 px-3" disabled={submitting || done}>
              {done ? <Check className="h-3.5 w-3.5" /> : submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "ОК"}
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// Public component
// ============================================================================

export function IndicesDeepDive() {
  const { audience: ctxAudience } = useAudience();
  const audience: Audience = ctxAudience === "individual" ? "individual" : "business";

  return (
    <section className="space-y-6 py-2">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">Що варто перевірити в аналітиці</h2>
        <p className="text-sm text-muted-foreground">
          Три блоки з різною частотою — від щоденних курсів до місячних дедлайнів. Контекст
          {audience === "business" ? " «Для бізнесу»" : " «Для фізосіб»"} береться з перемикача аудиторії у шапці.
        </p>
      </div>

      <TodayMustKnowLane />
      <WhereToParkCashLane />
      <MoneyCalendarLane audience={audience} />
    </section>
  );
}

