import { useMemo } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { Report } from "@/config/reportsConfig";
import { reportStatusConfig, getDeadlineUrgency, getUpcomingDeadlines } from "@/config/reportsConfig";

interface ReportsDeadlinesBlockProps {
  reports: Report[];
  onReportClick?: (report: Report) => void;
  maxItems?: number;
}

export function ReportsDeadlinesBlock({ reports, onReportClick, maxItems = 5 }: ReportsDeadlinesBlockProps) {
  const upcomingReports = useMemo(() => 
    getUpcomingDeadlines(reports, 60).slice(0, maxItems), 
    [reports, maxItems]
  );

  if (upcomingReports.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Найближчі дедлайни
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Немає найближчих дедлайнів
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Найближчі дедлайни
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-4 pb-4">
          <div className="space-y-2">
            {upcomingReports.map((report) => {
              const urgency = getDeadlineUrgency(report.deadline);
              const daysLeft = differenceInDays(new Date(report.deadline), new Date());
              const StatusIcon = reportStatusConfig[report.status]?.icon;
              
              const urgencyStyles = {
                urgent: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50",
                warning: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50",
                normal: "bg-muted/30 border-border/50",
              };

              const deadlineStyles = {
                urgent: "text-red-600 dark:text-red-400",
                warning: "text-amber-600 dark:text-amber-400",
                normal: "text-muted-foreground",
              };

              return (
                <button
                  key={report.id}
                  onClick={() => onReportClick?.(report)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                    "hover:shadow-sm hover:border-primary/50",
                    urgencyStyles[urgency]
                  )}
                >
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {report.typeLabel.split(" ")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {report.periodLabel}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={cn("text-sm font-medium", deadlineStyles[urgency])}>
                      {format(new Date(report.deadline), "dd.MM", { locale: uk })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {daysLeft === 0 ? "Сьогодні" : daysLeft === 1 ? "Завтра" : `${daysLeft} дн.`}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 ml-2 shrink-0" />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
