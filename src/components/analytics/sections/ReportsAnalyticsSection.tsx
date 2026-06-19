import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileCheck, 
  Clock, 
  FileText, 
  AlertTriangle, 
  ChevronRight, 
  BarChart3,
  Send,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportStats {
  total: number;
  accepted: number;
  submitted: number;
  review: number;
  scheduled: number;
}

interface Report {
  id: string;
  name: string;
  period: string;
  cabinetId: string;
  cabinetName: string;
  status: "accepted" | "submitted" | "review" | "scheduled" | "approved" | "overdue";
  deadline?: string;
  submittedDate?: string;
}

interface ReportsAnalyticsSectionProps {
  stats: ReportStats;
  reports: Report[];
  onReportClick?: (report: Report) => void;
  onCabinetClick?: (cabinetId: string) => void;
}

const statusConfig = {
  "accepted": {
    label: "Прийнято",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    badge: "default" as const,
  },
  "submitted": {
    label: "Подано",
    icon: Send,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    badge: "secondary" as const,
  },
  "review": {
    label: "На перевірку",
    icon: FileText,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    badge: "secondary" as const,
  },
  "approved": {
    label: "Підтверджено",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    badge: "default" as const,
  },
  "scheduled": {
    label: "Заплановано",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    badge: "outline" as const,
  },
  "overdue": {
    label: "Прострочено",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    badge: "destructive" as const,
  },
};

export function ReportsAnalyticsSection({
  stats,
  reports,
  onReportClick,
  onCabinetClick,
}: ReportsAnalyticsSectionProps) {
  const getPercent = (value: number) => 
    stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;

  const completionRate = stats.total > 0 
    ? Math.round(((stats.accepted + stats.submitted) / stats.total) * 100) 
    : 0;

  return (
    <Card id="reports-analytics" className="transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Аналітика звітності</CardTitle>
              <CardDescription>
                {stats.total} звітів за період
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={completionRate >= 80 ? "default" : completionRate >= 50 ? "secondary" : "destructive"}
            className="gap-1"
          >
            {completionRate}% виконано
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Прогрес подачі</span>
            <span className="font-medium">{stats.accepted + stats.submitted} / {stats.total}</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Status breakdown grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-success/10 text-center">
            <p className="text-2xl font-bold text-success">{stats.accepted}</p>
            <p className="text-xs text-muted-foreground">Прийнято</p>
            <p className="text-[10px] text-success font-medium mt-0.5">{getPercent(stats.accepted)}%</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
            <p className="text-xs text-muted-foreground">Подано</p>
            <p className="text-[10px] text-blue-600 font-medium mt-0.5">{getPercent(stats.submitted)}%</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.review}</p>
            <p className="text-xs text-muted-foreground">На перевірку</p>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">{getPercent(stats.review)}%</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 text-center">
            <p className="text-2xl font-bold text-blue-500">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground">Заплановано</p>
            <p className="text-[10px] text-blue-500 font-medium mt-0.5">{getPercent(stats.scheduled)}%</p>
          </div>
        </div>

        {/* Reports list */}
        {reports.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Деталізація звітів</p>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2">
                {reports
                  .sort((a, b) => {
                    const order = { "overdue": 0, "scheduled": 1, "review": 2, "approved": 3, "submitted": 4, "accepted": 5 };
                    return (order[a.status] ?? 6) - (order[b.status] ?? 6);
                  })
                  .map((report) => {
                    const config = statusConfig[report.status];
                    const StatusIcon = config.icon;

                    return (
                      <button
                        key={report.id}
                        onClick={() => onReportClick?.(report)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left min-h-[56px]"
                      >
                        <div className={cn("p-2 rounded-lg", config.bg)}>
                          <StatusIcon className={cn("h-4 w-4", config.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{report.name}</p>
                            <Badge variant={config.badge} className="text-[10px] px-1.5 shrink-0">
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {report.cabinetName} · {report.period}
                          </p>
                        </div>

                        {report.deadline && (
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">До:</p>
                            <p className="text-xs font-medium">{report.deadline}</p>
                          </div>
                        )}

                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
