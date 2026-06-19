import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Plus,
  AlertCircle,
  GitPullRequestArrow,
  Loader2,
  CheckCircle2,
  MoreHorizontal,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Cabinet } from "@/types/cabinet";
import { getWorkCenterMockData, type WcCard, TONE_ICON_CLASS } from "./workCenterMockData";
import { WorkCenterCard } from "./WorkCenterCard";
import { WorkCenterDailyPlan } from "./WorkCenterDailyPlan";
import { WorkCenterMobileFocus } from "./WorkCenterMobileFocus";
import { cn } from "@/lib/utils";

interface Props {
  cabinet: Cabinet;
  defaultInner?: string;
  onNavigateToOverview?: () => void;
  onNavigateToOperations?: (subTab?: string) => void;
  /** Повернення до Life Launcher («Мої сфери») */
  onNavigateToLauncher?: () => void;
}

type ColumnKey = "attention" | "decision" | "progress" | "done";

interface ColumnMeta {
  key: ColumnKey;
  label: string;
  shortLabel: string;
  icon: typeof AlertCircle;
  dotClass: string; // bg colour for indicator dot
}

const COLUMNS: ColumnMeta[] = [
  { key: "attention", label: "Потребує уваги", shortLabel: "Увага", icon: AlertCircle, dotClass: "bg-rose-500" },
  { key: "decision", label: "Очікують рішення", shortLabel: "Рішення", icon: GitPullRequestArrow, dotClass: "bg-amber-500" },
  { key: "progress", label: "Виконується", shortLabel: "В роботі", icon: Loader2, dotClass: "bg-blue-500" },
  { key: "done", label: "Виконано", shortLabel: "Готово", icon: CheckCircle2, dotClass: "bg-emerald-500" },
];

export default function WorkCenterPage({ onNavigateToLauncher }: Props) {
  const data = useMemo(() => getWorkCenterMockData(), []);
  const [activeTab, setActiveTab] = useState<ColumnKey>("attention");

  const columnsData: Record<ColumnKey, WcCard[]> = {
    attention: data.attention,
    decision: data.decision,
    progress: data.progress,
    done: data.done,
  };

  const counts: Record<ColumnKey, number> = {
    attention: data.attention.length,
    decision: data.decision.length,
    progress: data.progress.length,
    done: data.doneTotal,
  };

  const delegate = (card: WcCard) =>
    toast.success("Передано AI Assistant", {
      description: `«${card.title}» — AI підготує наступний крок і повідомить.`,
    });

  const primary = (card: WcCard) =>
    toast(card.kind === "decision" ? "Погоджено" : "Відкрито", { description: card.title });

  const secondary = (card: WcCard) => toast("Перегляд", { description: card.title });

  const reject = (card: WcCard) => toast("Відхилено", { description: card.title });

  const startDailyPlan = () =>
    toast.success("План дня запущено", {
      description: `${data.dailyPlan.items.length} дій передано AI Assistant.`,
    });

  const goLauncher = () => {
    if (onNavigateToLauncher) onNavigateToLauncher();
    else toast("Мої сфери", { description: "Навігація до каталогу сфер." });
  };

  const renderCards = (key: ColumnKey) =>
    columnsData[key].map((c) => (
      <WorkCenterCard
        key={c.id}
        card={c}
        onDelegate={delegate}
        onPrimary={primary}
        onSecondary={secondary}
        onReject={reject}
      />
    ));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-6 space-y-3 md:space-y-6">
      {/* ───────── Breadcrumb (desktop) ───────── */}
      {onNavigateToLauncher && (
        <nav className="hidden md:flex items-center gap-1 text-xs text-muted-foreground" aria-label="Хлібні крихти">
          <button onClick={goLauncher} className="hover:text-foreground transition-colors">
            Мої сфери
          </button>
          <span className="opacity-50">/</span>
          <span className="text-foreground/80">Робочий центр</span>
        </nav>
      )}

      {/* Header */}
      <header className="flex items-start gap-3 min-w-0">
        {onNavigateToLauncher && (
          <button
            type="button"
            onClick={goLauncher}
            aria-label="До Мої сфери"
            className="md:hidden w-11 h-11 rounded-2xl bg-muted hover:bg-muted/70 text-foreground flex items-center justify-center shrink-0 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Робочий центр</h1>
          <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
            Ваші справи та процеси. Оберіть завдання або передайте його AI Assistant.
          </p>
        </div>
      </header>



      {/* Daily Plan — Desktop only */}
      <div className="hidden lg:block">
        <WorkCenterDailyPlan
          items={data.dailyPlan.items}
          estimateMinutes={data.dailyPlan.estimateMinutes}
          onStart={startDailyPlan}
        />
      </div>

      {/* Mobile Focus Card */}
      <div className="lg:hidden">
        <WorkCenterMobileFocus
          needsAttention={data.focusStats.needsAttention}
          awaitingDecision={data.focusStats.awaitingDecision}
          risk={data.focusStats.risk}
          onStartDailyPlan={startDailyPlan}
        />
      </div>

      {/* Search bar — full-width, перед колонками */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук задач, документів, процесів…"
            className="pl-9 pr-14 h-9 md:h-10 rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-border"
          />
          <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-5 items-center rounded border border-border bg-background px-1.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        <Button variant="outline" size="sm" className="h-9 md:h-10 gap-1.5 shrink-0">
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Фільтри</span>
        </Button>
        <Button size="sm" className="h-9 md:h-10 gap-1.5 shrink-0">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Створити</span>
        </Button>
      </div>

      {/* Desktop Kanban */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <section
            key={col.key}
            className="rounded-2xl border border-border/60 bg-card shadow-sm flex flex-col min-h-[440px]"
          >
            <header className="flex items-center justify-between px-4 pt-3.5 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("h-2 w-2 rounded-full shrink-0", col.dotClass)} aria-hidden />
                <h3 className="text-[15px] font-semibold truncate">{col.label}</h3>
                <span className="text-xs font-medium tabular-nums rounded-md px-1.5 py-0.5 bg-muted text-muted-foreground shrink-0">
                  {counts[col.key]}
                </span>
              </div>
              <button
                className="text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-md p-1 transition-colors"
                aria-label="Дії"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </header>
            <div className="border-t border-border/50" />
            <div className="flex flex-col gap-2 p-3 flex-1">
              {renderCards(col.key)}
              {counts[col.key] > columnsData[col.key].length && (
                <button className="text-xs text-primary hover:underline self-center mt-1">
                  Показати ще {counts[col.key] - columnsData[col.key].length}
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Mobile — 4-в-ряд сегментований перемикач */}
      <div className="lg:hidden">
        <nav
          aria-label="Колонки"
          className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-muted/50 border border-border/50"
        >
          {COLUMNS.map((col) => {
            const active = col.key === activeTab;
            return (
              <button
                key={col.key}
                onClick={() => setActiveTab(col.key)}
                aria-pressed={active}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-xl transition-all min-h-[56px] active:scale-[0.97]",
                  active
                    ? "bg-card shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", col.dotClass)} aria-hidden />
                  <span
                    className={cn(
                      "text-[11px] font-semibold tabular-nums",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {counts[col.key]}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-[11.5px] leading-tight truncate max-w-full",
                    active ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
                  )}
                >
                  {col.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="space-y-2.5 mt-4">{renderCards(activeTab)}</div>
      </div>

      {/* Activity Feed */}
      <section className="rounded-2xl border border-border/60 bg-card p-4 md:p-5 shadow-sm">
        <header className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Остання активність</h3>
          <button className="text-xs text-primary hover:underline">Переглянути всі події</button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {data.activity.map((a) => {
            const Icon = a.icon;
            const tone = a.tone ? TONE_ICON_CLASS[a.tone] : "bg-muted text-muted-foreground";
            return (
              <div key={a.id} className="flex items-center gap-3 py-1.5">
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", tone)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 text-sm truncate">{a.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{a.whenLabel}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
