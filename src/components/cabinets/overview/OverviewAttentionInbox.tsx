import { useState } from "react";
import {
  Activity,
  Bell,
  Calendar,
  Sparkles,
  Check,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { AttentionItem } from "@/config/overviewConfig";
import { useOverviewBp } from "./OverviewBpContext";
import type { HealthScoreResult, HealthGrade, HealthScorePillar } from "@/types/analyticsTypes";

interface ReminderItem {
  id: string;
  title: string;
  body?: string | null;
  severity?: "critical" | "warning" | string;
  related_event_id?: string | null;
}

interface UpcomingEvent {
  id: string;
  title: string;
  event_at: string;
  source?: string;
}

interface Props {
  attentionItems: AttentionItem[];
  reminders: ReminderItem[];
  upcomingEvents: UpcomingEvent[];
  health?: HealthScoreResult;
  onHealthDetails?: () => void;
  onCtaClick: (item: AttentionItem) => void;
  onMarkRead: (id: string) => void;
  onOpenReminder: (n: ReminderItem) => void;
  onOpenEvent: (id: string) => void;
  onOpenAllEvents: () => void;
}

const priorityTone = (p: string) =>
  p === "high"
    ? { bg: "bg-destructive/10", text: "text-destructive" }
    : p === "medium"
      ? { bg: "bg-warning/10", text: "text-warning" }
      : { bg: "bg-muted", text: "text-muted-foreground" };

const priorityImpact = (p: string): number =>
  p === "high" ? 8 : p === "medium" ? 5 : 3;

const HEALTH_LABEL: Record<HealthGrade, string> = {
  excellent: "Відмінно",
  good: "Добре",
  attention: "Потребує уваги",
  critical: "Критично",
};

const HEALTH_TONE: Record<HealthGrade, { card: string; text: string; ring: string; track: string; chip: string; seg: string }> = {
  excellent: {
    card: "border-success/30 bg-success/5",
    text: "text-success",
    ring: "stroke-success",
    track: "stroke-success/20",
    chip: "bg-success/10 text-success",
    seg: "bg-success",
  },
  good: {
    card: "border-primary/30 bg-primary/5",
    text: "text-primary",
    ring: "stroke-primary",
    track: "stroke-primary/20",
    chip: "bg-primary/10 text-primary",
    seg: "bg-primary",
  },
  attention: {
    card: "border-warning/40 bg-warning/5",
    text: "text-warning",
    ring: "stroke-warning",
    track: "stroke-warning/20",
    chip: "bg-warning/10 text-warning",
    seg: "bg-warning",
  },
  critical: {
    card: "border-destructive/40 bg-destructive/5",
    text: "text-destructive",
    ring: "stroke-destructive",
    track: "stroke-destructive/20",
    chip: "bg-destructive/10 text-destructive",
    seg: "bg-destructive",
  },
};

function pluralActions(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} дія покращить оцінку`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} дії покращать оцінку`;
  return `${n} дій покращать оцінку`;
}

function trendDelta(trend: "up" | "down" | "stable"): number {
  if (trend === "up") return 3;
  if (trend === "down") return -3;
  return 0;
}

function SegmentBar({ score, grade }: { score: number; grade: HealthGrade }) {
  const filled = Math.max(0, Math.min(5, Math.round(score / 20)));
  const segColor = HEALTH_TONE[grade].seg;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn("w-2 h-2 rounded-sm", i < filled ? segColor : "bg-muted")}
        />
      ))}
    </div>
  );
}

function PillarRow({ pillar, onClick }: { pillar: HealthScorePillar; onClick?: () => void }) {
  const tone = HEALTH_TONE[pillar.grade];
  const issue = pillar.issues[0] ?? "Все в нормі";
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full grid grid-cols-[1fr_auto_auto] items-center gap-3 py-1.5 px-2 rounded-md hover:bg-background/60 transition-colors text-left"
    >
      <div className="min-w-0">
        <div className="text-xs font-medium text-foreground truncate">{pillar.label}</div>
        <div className="text-[11px] text-muted-foreground truncate">{issue}</div>
      </div>
      <SegmentBar score={pillar.score} grade={pillar.grade} />
      <span className={cn("text-sm font-semibold tabular-nums w-8 text-right", tone.text)}>
        {Math.round(pillar.score)}
      </span>
    </button>
  );
}

function HealthHero({
  health,
  actionsCount,
  pillarsOpen,
  onTogglePillars,
}: {
  health: HealthScoreResult;
  actionsCount: number;
  pillarsOpen: boolean;
  onTogglePillars: () => void;
}) {
  const tone = HEALTH_TONE[health.grade];
  const r = 13;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, health.total)) / 100) * c;
  const summary = actionsCount === 0 ? "Все під контролем — дій не потрібно" : pluralActions(actionsCount);
  const delta = trendDelta(health.trend);
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative shrink-0">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={r} fill="none" strokeWidth="3" className={tone.track} />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className={cn("transition-all", tone.ring)}
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 18 18)"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className={cn("text-xl font-bold tabular-nums leading-none", tone.text)}>
            {health.total}
          </span>
          <span className="text-xs text-muted-foreground leading-none">/ 100</span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded",
              tone.chip,
            )}
          >
            {HEALTH_LABEL[health.grade]}
          </span>
          {health.trend === "up" && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-success leading-none">
              <ArrowUp className="w-3 h-3" />+{delta} за тиждень
            </span>
          )}
          {health.trend === "down" && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-destructive leading-none">
              <ArrowDown className="w-3 h-3" />
              {delta} за тиждень
            </span>
          )}
          {health.trend === "stable" && (
            <span className="text-[11px] text-muted-foreground leading-none">· без змін</span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1 truncate">{summary}</div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 h-7 text-xs text-muted-foreground hover:text-foreground"
        onClick={onTogglePillars}
        aria-expanded={pillarsOpen}
      >
        {pillarsOpen ? "Згорнути" : "Розгорнути"}
        <ChevronDown className={cn("w-3.5 h-3.5 ml-1 transition-transform", pillarsOpen && "rotate-180")} />
      </Button>
    </div>
  );
}

export function OverviewAttentionInbox({
  attentionItems,
  reminders,
  upcomingEvents,
  health,
  onHealthDetails,
  onCtaClick,
  onMarkRead,
  onOpenReminder,
  onOpenEvent,
  onOpenAllEvents,
}: Props) {
  const { isAtLeast } = useOverviewBp();
  const [pillarsOpen, setPillarsOpen] = useState(false);
  const total = attentionItems.length + reminders.length + upcomingEvents.length;
  if (!health && total === 0) return null;

  const tone = health ? HEALTH_TONE[health.grade] : null;
  const cardTone = tone ? tone.card : "border-destructive/30 bg-destructive/5";
  const actionsCount = attentionItems.length + reminders.length;

  return (
    <Card className={cn(cardTone)}>
      <CardHeader className={cn(isAtLeast("md") ? "pb-3" : "pb-2 px-3 pt-3")}>
        {health ? (
          <Collapsible open={pillarsOpen} onOpenChange={setPillarsOpen}>
            <HealthHero
              health={health}
              actionsCount={actionsCount}
              pillarsOpen={pillarsOpen}
              onTogglePillars={() => setPillarsOpen((v) => !v)}
            />
            <CollapsibleContent className="mt-3 pt-3 border-t border-border/50 space-y-0.5">
              {health.pillars.map((p) => (
                <PillarRow key={p.id} pillar={p} onClick={onHealthDetails} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="flex items-center gap-2 text-base font-semibold">
            <Activity className="w-5 h-5 shrink-0 text-destructive" />
            <span>Операційна оцінка</span>
          </div>
        )}
      </CardHeader>
      <CardContent className={cn("space-y-2", !isAtLeast("md") && "px-3 pb-3")}>
        {attentionItems.map((item) => {
          const t = priorityTone(item.priority);
          const impact = priorityImpact(item.priority);
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-background/80 hover:bg-background transition-colors"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", t.bg)}>
                <item.icon className={cn("w-4 h-4", t.text)} />
              </div>
              <span className="text-sm flex-1 min-w-0 line-clamp-2">{item.text}</span>
              {health && (
                <span className="shrink-0 text-[10px] font-semibold text-success tabular-nums">
                  +{impact}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 h-7 text-xs"
                onClick={() => onCtaClick(item)}
              >
                {item.cta.label}
              </Button>
            </div>
          );
        })}

        {reminders.length > 0 && (
          <div className="pt-2 border-t border-destructive/20 space-y-1.5">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium px-1">
              Нагадування
            </div>
            {reminders.map((n) => (
              <div
                key={n.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-background/80 hover:bg-background transition-colors"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    n.severity === "critical" ? "bg-destructive/10" : "bg-warning/10",
                  )}
                >
                  <Bell
                    className={cn("w-4 h-4", n.severity === "critical" ? "text-destructive" : "text-warning")}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  {n.body && (
                    <div className="text-xs text-muted-foreground line-clamp-1">{n.body}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-7 w-7 p-0"
                  onClick={() => onMarkRead(n.id)}
                  title="Позначити прочитаним"
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-7 text-xs"
                  onClick={() => onOpenReminder(n)}
                >
                  Перейти
                </Button>
              </div>
            ))}
          </div>
        )}

        {upcomingEvents.length > 0 && (
          <div className="pt-2 border-t border-destructive/20 space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                Найближчі події
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={onOpenAllEvents}
              >
                Усі →
              </Button>
            </div>
            {upcomingEvents.map((ev) => {
              const isAi = ev.source === "ai";
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onOpenEvent(ev.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-background/80 hover:bg-background transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {isAi ? (
                      <Sparkles className="w-4 h-4 text-primary" />
                    ) : (
                      <Calendar className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{ev.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(ev.event_at), "d MMM, HH:mm", { locale: uk })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
