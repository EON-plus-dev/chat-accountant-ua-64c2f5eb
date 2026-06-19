import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Wallet, Gift, CheckCircle2, Clock, AlertTriangle, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type MilestoneStatus = "completed" | "current" | "upcoming" | "overdue";
type MilestoneType = "primary" | "quarterly";

interface Milestone {
  id: string;
  label: string;
  description: string;
  date: string;
  endDate?: string;
  icon: React.ElementType;
  pku?: string;
  type: MilestoneType;
}

interface IndividualTaxCalendarProps {
  year: number;
  onDeadlineClick?: (deadlineId: string) => void;
}

const getMilestones = (year: number): Milestone[] => [
  {
    id: "collect",
    label: "Збір документів",
    description: "Імпорт та класифікація доходів",
    date: `${year}-01-01`,
    endDate: `${year}-04-30`,
    icon: FileText,
    type: "primary",
  },
  {
    id: "declaration",
    label: "Подання декларації",
    description: "Дедлайн подання річної декларації",
    date: `${year}-05-01`,
    icon: Calendar,
    pku: "ст. 179.1 ПКУ",
    type: "primary",
  },
  {
    id: "property-tax",
    label: "Податок на нерухомість",
    description: "Дедлайн сплати податку на нерухоме майно",
    date: `${year}-07-01`,
    icon: Wallet,
    pku: "ст. 266 ПКУ",
    type: "primary",
  },
  {
    id: "payment",
    label: "Сплата ПДФО",
    description: "Дедлайн сплати податкового зобов'язання",
    date: `${year}-07-31`,
    icon: Wallet,
    pku: "ст. 179.7 ПКУ",
    type: "primary",
  },
  {
    id: "tax-credit",
    label: "Податкова знижка",
    description: "Дедлайн декларації на податкову знижку",
    date: `${year}-12-31`,
    icon: Gift,
    pku: "ст. 166 ПКУ",
    type: "primary",
  },
  {
    id: "q1-review",
    label: "Перевірка Q1",
    description: "Перевірка банківських виписок за І квартал",
    date: `${year}-03-31`,
    icon: ClipboardCheck,
    type: "quarterly",
  },
  {
    id: "q2-review",
    label: "Перевірка Q2",
    description: "Перевірка банківських виписок за ІІ квартал",
    date: `${year}-06-30`,
    icon: ClipboardCheck,
    type: "quarterly",
  },
  {
    id: "q3-review",
    label: "Перевірка Q3",
    description: "Перевірка банківських виписок за ІІІ квартал",
    date: `${year}-09-30`,
    icon: ClipboardCheck,
    type: "quarterly",
  },
  {
    id: "q4-review",
    label: "Перевірка Q4",
    description: "Перевірка банківських виписок за IV квартал",
    date: `${year}-12-31`,
    icon: ClipboardCheck,
    type: "quarterly",
  },
];

function getMilestoneStatus(milestone: Milestone, now: Date): MilestoneStatus {
  const deadlineDate = new Date(milestone.date);
  const endDate = milestone.endDate ? new Date(milestone.endDate) : null;

  if (endDate) {
    const startDate = new Date(milestone.date);
    if (now < startDate) return "upcoming";
    if (now <= endDate) return "current";
    return "completed";
  }

  const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 0) return "completed";
  if (daysDiff <= 14) return "current";
  return "upcoming";
}

function formatMilestoneDate(milestone: Milestone): string {
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
  };
  if (milestone.endDate) {
    return `${fmt(milestone.date)} – ${fmt(milestone.endDate)}`;
  }
  return fmt(milestone.date);
}

const statusConfig: Record<MilestoneStatus, { 
  bg: string; border: string; text: string; icon: React.ElementType; badgeVariant: "success" | "warning" | "error" | "info" | "outline" 
}> = {
  completed: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
    badgeVariant: "success",
  },
  current: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    icon: Clock,
    badgeVariant: "info",
  },
  upcoming: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    icon: Calendar,
    badgeVariant: "outline",
  },
  overdue: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    icon: AlertTriangle,
    badgeVariant: "error",
  },
};

const statusLabels: Record<MilestoneStatus, string> = {
  completed: "Виконано",
  current: "Активно",
  upcoming: "Очікується",
  overdue: "Прострочено",
};

export function IndividualTaxCalendar({ year, onDeadlineClick }: IndividualTaxCalendarProps) {
  const isMobile = useIsMobile();
  const now = useMemo(() => new Date(), []);
  const milestones = useMemo(() => getMilestones(year), [year]);

  const milestonesWithStatus = useMemo(
    () => milestones.map((m) => ({ ...m, status: getMilestoneStatus(m, now) })),
    [milestones, now]
  );

  const primaryMilestones = useMemo(
    () => milestonesWithStatus.filter((m) => m.type === "primary"),
    [milestonesWithStatus]
  );

  const quarterlyMilestones = useMemo(
    () => milestonesWithStatus.filter((m) => m.type === "quarterly"),
    [milestonesWithStatus]
  );

  const completedCount = primaryMilestones.filter((m) => m.status === "completed").length;
  const progressPercent = Math.round((completedCount / primaryMilestones.length) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Податковий календар {year}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ключові дати декларанта · {completedCount}/{primaryMilestones.length} виконано
              </p>
            </div>
          </div>
          <Badge variant={progressPercent === 100 ? "success" : "info"}>
            {progressPercent}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted mb-6">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {isMobile ? (
          /* Mobile: vertical stack */
          <div className="space-y-3">
            {primaryMilestones.map((milestone) => {
              const config = statusConfig[milestone.status];
              const StatusIcon = config.icon;
              const MIcon = milestone.icon;

              return (
                <button
                  key={milestone.id}
                  onClick={() => onDeadlineClick?.(milestone.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left",
                    config.border,
                    milestone.status === "current" ? config.bg : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                    <MIcon className={cn("h-4 w-4", config.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{milestone.label}</p>
                    <p className="text-xs text-muted-foreground">{formatMilestoneDate(milestone)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusIcon className={cn("h-3.5 w-3.5", config.text)} />
                    <span className={cn("text-xs font-medium", config.text)}>
                      {statusLabels[milestone.status]}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Quarterly separator */}
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground font-medium">Квартальні перевірки</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {quarterlyMilestones.map((milestone) => {
              const config = statusConfig[milestone.status];
              const StatusIcon = config.icon;

              return (
                <button
                  key={milestone.id}
                  onClick={() => onDeadlineClick?.(milestone.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left",
                    config.border,
                    milestone.status === "current" ? config.bg : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn("p-1.5 rounded-md shrink-0", config.bg)}>
                    <ClipboardCheck className={cn("h-3.5 w-3.5", config.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{milestone.label}</p>
                    <p className="text-xs text-muted-foreground">{formatMilestoneDate(milestone)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusIcon className={cn("h-3 w-3", config.text)} />
                    <span className={cn("text-[11px] font-medium", config.text)}>
                      {statusLabels[milestone.status]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Desktop */
          <div className="space-y-6">
            {/* Primary timeline */}
            <div className="relative">
              <div className="absolute top-5 left-[calc(12.5%)] right-[calc(12.5%)] h-0.5 bg-border" />
              <div
                className="absolute top-5 left-[calc(12.5%)] h-0.5 bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(progressPercent, 100) * 0.75}%`,
                }}
              />

              <div className="relative grid grid-cols-5 gap-2">
                {primaryMilestones.map((milestone) => {
                  const config = statusConfig[milestone.status];
                  const MIcon = milestone.icon;

                  return (
                    <button
                      key={milestone.id}
                      onClick={() => onDeadlineClick?.(milestone.id)}
                      className="flex flex-col items-center text-center group"
                    >
                      <div
                        className={cn(
                          "relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                          config.bg,
                          config.border,
                          milestone.status === "current" && "ring-4 ring-primary/20 animate-pulse",
                          "group-hover:scale-110"
                        )}
                      >
                        {milestone.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <MIcon className={cn("h-4 w-4", config.text)} />
                        )}
                      </div>

                      <p className="mt-3 text-xs font-semibold leading-tight">{milestone.label}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatMilestoneDate(milestone)}
                      </p>

                      <Badge variant={config.badgeVariant} size="sm" className="mt-1.5">
                        {statusLabels[milestone.status]}
                      </Badge>

                      {milestone.pku && (
                        <p className="mt-1 text-[10px] text-muted-foreground/70">{milestone.pku}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quarterly reviews */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Квартальні перевірки виписок</p>
              <div className="grid grid-cols-4 gap-3">
                {quarterlyMilestones.map((milestone) => {
                  const config = statusConfig[milestone.status];

                  return (
                    <button
                      key={milestone.id}
                      onClick={() => onDeadlineClick?.(milestone.id)}
                      className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors group",
                        config.border,
                        milestone.status === "current" ? config.bg : "hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full border flex items-center justify-center shrink-0",
                          config.bg,
                          config.border,
                          "group-hover:scale-110 transition-transform"
                        )}
                      >
                        {milestone.status === "completed" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ClipboardCheck className={cn("h-3.5 w-3.5", config.text)} />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-medium truncate">{milestone.label}</p>
                        <p className="text-[11px] text-muted-foreground">{formatMilestoneDate(milestone)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}