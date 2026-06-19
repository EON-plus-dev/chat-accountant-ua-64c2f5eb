/**
 * TaxCalendarPage — Податковий календар (6.3)
 * Візуальний таймлайн дедлайнів для ФОП та фіз. осіб
 */
import { useMemo } from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileText,
  Send,
  Landmark,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";

interface TaxCalendarPageProps {
  cabinet: Cabinet;
}

interface TaxDeadline {
  id: string;
  label: string;
  date: Date;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "tax" | "report" | "payment" | "document";
  amount?: string;
  law?: string;
}

const today = new Date(2026, 2, 13); // 2026-03-13

function getDeadlineStatus(date: Date): "overdue" | "warning" | "upcoming" | "done" {
  const diff = date.getTime() - today.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "overdue";
  if (days <= 14) return "warning";
  return "upcoming";
}

function getDaysUntil(date: Date): number {
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// FOP deadlines (2026)
const fopDeadlines: TaxDeadline[] = [
  // Q1 2026
  { id: "fop-ep-q1", label: "ЄП за січень", date: new Date(2026, 0, 19), description: "Сплата єдиного податку", icon: CreditCard, category: "payment", amount: "1 729,40 ₴", law: "ст. 295.1 ПКУ" },
  { id: "fop-esv-q1", label: "ЄСВ за січень", date: new Date(2026, 0, 19), description: "Сплата єдиного соц. внеску", icon: CreditCard, category: "payment", amount: "1 902,34 ₴", law: "ст. 9 ЗУ «Про ЄСВ»" },
  { id: "fop-ep-feb", label: "ЄП за лютий", date: new Date(2026, 1, 19), description: "Сплата єдиного податку", icon: CreditCard, category: "payment", amount: "1 729,40 ₴" },
  { id: "fop-esv-feb", label: "ЄСВ за лютий", date: new Date(2026, 1, 19), description: "Сплата єдиного соц. внеску", icon: CreditCard, category: "payment", amount: "1 902,34 ₴" },
  { id: "fop-ep-mar", label: "ЄП за березень", date: new Date(2026, 2, 19), description: "Сплата єдиного податку", icon: CreditCard, category: "payment", amount: "1 729,40 ₴" },
  { id: "fop-esv-mar", label: "ЄСВ за березень", date: new Date(2026, 2, 19), description: "Сплата єдиного соц. внеску", icon: CreditCard, category: "payment", amount: "1 902,34 ₴" },
  // Annual declaration
  { id: "fop-decl-annual", label: "Річна декларація ЄП", date: new Date(2026, 1, 9), description: "Подання річної декларації за 2025 р.", icon: Send, category: "report", law: "ст. 296.2 ПКУ" },
  // Q2
  { id: "fop-ep-apr", label: "ЄП за квітень", date: new Date(2026, 3, 20), description: "Сплата єдиного податку", icon: CreditCard, category: "payment", amount: "1 729,40 ₴" },
  { id: "fop-esv-apr", label: "ЄСВ за квітень", date: new Date(2026, 3, 20), description: "Сплата єдиного соц. внеску", icon: CreditCard, category: "payment", amount: "1 902,34 ₴" },
];

// Individual deadlines (2026)
const individualDeadlines: TaxDeadline[] = [
  { id: "ind-gather", label: "Збір документів", date: new Date(2026, 3, 1), description: "Зберіть довідки, W-8BEN, виписки брокера", icon: FileText, category: "document" },
  { id: "ind-decl-deadline", label: "Дедлайн декларації", date: new Date(2026, 4, 1), description: "Подання декларації про доходи за 2025 рік", icon: Send, category: "report", law: "ст. 179.1 ПКУ" },
  { id: "ind-pit-invest", label: "ПДФО (інвестиції)", date: new Date(2026, 6, 31), description: "Сплата ПДФО з інвестиційного прибутку", icon: CreditCard, category: "payment", amount: "31 820 ₴", law: "ст. 179.7 ПКУ" },
  { id: "ind-pit-foreign", label: "ПДФО (іноземна зарплата)", date: new Date(2026, 6, 31), description: "Сплата ПДФО з іноземних доходів", icon: CreditCard, category: "payment", amount: "43 200 ₴" },
  { id: "ind-mil-invest", label: "ВЗ (інвестиції)", date: new Date(2026, 6, 31), description: "Сплата військового збору", icon: Landmark, category: "payment", amount: "8 839 ₴" },
  { id: "ind-property-tax", label: "Податок на нерухомість", date: new Date(2026, 6, 1), description: "Сплата за повідомленням ДПС", icon: CreditCard, category: "payment", amount: "3 300 ₴" },
  { id: "ind-discount-deadline", label: "Дедлайн податкової знижки", date: new Date(2026, 11, 31), description: "Останній день для подання декларації на знижку за 2025 рік", icon: FileText, category: "report", law: "ст. 166.4.3 ПКУ" },
];

const statusStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
  overdue: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30", label: "Прострочено" },
  warning: { bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-300 dark:border-amber-700", label: "Наближається" },
  upcoming: { bg: "bg-muted/30", text: "text-foreground", border: "border-border", label: "Заплановано" },
  done: { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-300 dark:border-emerald-700", label: "Виконано" },
};

const categoryIcons: Record<string, { color: string; label: string }> = {
  tax: { color: "text-amber-600 dark:text-amber-400", label: "Податок" },
  report: { color: "text-primary", label: "Звіт" },
  payment: { color: "text-destructive", label: "Платіж" },
  document: { color: "text-muted-foreground", label: "Документ" },
};

export const TaxCalendarPage = ({ cabinet }: TaxCalendarPageProps) => {
  const deadlines = useMemo(() => {
    const raw = cabinet.type === "fop" ? fopDeadlines : individualDeadlines;
    return [...raw].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [cabinet.type]);

  const nextDeadline = useMemo(() => {
    return deadlines.find(d => getDaysUntil(d.date) >= 0);
  }, [deadlines]);

  const overdueCount = deadlines.filter(d => getDeadlineStatus(d.date) === "overdue").length;
  const warningCount = deadlines.filter(d => getDeadlineStatus(d.date) === "warning").length;
  const upcomingCount = deadlines.filter(d => getDeadlineStatus(d.date) === "upcoming").length;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Наступний дедлайн</span>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            {nextDeadline ? (
              <>
                <p className="text-lg font-bold text-foreground">{getDaysUntil(nextDeadline.date)} днів</p>
                <p className="text-xs text-muted-foreground mt-0.5">{nextDeadline.label}</p>
              </>
            ) : (
              <p className="text-lg font-bold text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Прострочено</span>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <p className={cn("text-lg font-bold", overdueCount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>{overdueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Наближається</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className={cn("text-lg font-bold", warningCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>{warningCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Заплановано</span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{upcomingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Податковий календар {cabinet.type === "fop" ? "ФОП" : "фізичної особи"} — 2026
            <Badge variant="info" size="sm">6.3</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {deadlines.map((deadline) => {
            const status = getDeadlineStatus(deadline.date);
            const style = statusStyles[status];
            const days = getDaysUntil(deadline.date);
            const Icon = deadline.icon;
            const cat = categoryIcons[deadline.category];

            return (
              <div
                key={deadline.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  style.bg,
                  style.border,
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                  status === "overdue" && "bg-destructive/20",
                  status === "warning" && "bg-amber-100 dark:bg-amber-900/30",
                  status === "upcoming" && "bg-muted",
                  status === "done" && "bg-emerald-100 dark:bg-emerald-900/30",
                )}>
                  {status === "overdue" ? (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  ) : status === "done" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Icon className={cn("w-4 h-4", cat.color)} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", style.text)}>{deadline.label}</span>
                    <Badge variant="outline" size="sm" className="text-[10px]">{cat.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{deadline.description}</p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{formatDate(deadline.date)}</span>
                  {deadline.amount && (
                    <span className="text-xs font-medium text-foreground">{deadline.amount}</span>
                  )}
                  <Badge
                    variant={status === "overdue" ? "destructive" : status === "warning" ? "warning" : "secondary"}
                    size="sm"
                  >
                    {days < 0 ? `${Math.abs(days)} дн. тому` : days === 0 ? "Сьогодні!" : `${days} дн.`}
                  </Badge>
                </div>

                {deadline.law && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">{deadline.law}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Legal note */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 space-y-1">
        <p><strong>ФОП Група 2/3:</strong> ЄП сплачується до 20-го числа поточного місяця, ЄСВ — до 19-го.</p>
        <p><strong>Фізична особа:</strong> Декларація подається до 01.05, ПДФО сплачується до 31.07 (ст. 179.7 ПКУ).</p>
        <p><strong>Податкова знижка:</strong> Подання декларації до 31.12 наступного року (ст. 166.4.3 ПКУ).</p>
      </div>
    </div>
  );
};
