import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, Wallet, AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Deadline {
  id: string;
  label: string;
  cabinetId: string;
  cabinetName: string;
  date: string;
  type: "tax" | "report" | "payment" | "other";
  urgency: "urgent" | "warning" | "normal";
}

interface DeadlinesSectionProps {
  deadlines: Deadline[];
  onDeadlineClick?: (deadline: Deadline) => void;
  onCabinetClick?: (cabinetId: string) => void;
}

const typeIcons = {
  tax: Wallet,
  report: FileText,
  payment: Wallet,
  other: Calendar,
};

const typeLabels = {
  tax: "Податки",
  report: "Звіти",
  payment: "Платежі",
  other: "Інше",
};

export function DeadlinesSection({
  deadlines,
  onDeadlineClick,
  onCabinetClick,
}: DeadlinesSectionProps) {
  const urgentCount = deadlines.filter((d) => d.urgency === "urgent").length;
  const warningCount = deadlines.filter((d) => d.urgency === "warning").length;

  const groupedByType = deadlines.reduce((acc, deadline) => {
    if (!acc[deadline.type]) acc[deadline.type] = [];
    acc[deadline.type].push(deadline);
    return acc;
  }, {} as Record<string, Deadline[]>);

  const getDaysLeft = (dateStr: string) => {
    const date = new Date(dateStr);
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const renderDeadlineItem = (deadline: Deadline) => {
    const date = new Date(deadline.date);
    const daysLeft = getDaysLeft(deadline.date);
    const TypeIcon = typeIcons[deadline.type];

    return (
      <button
        key={deadline.id}
        onClick={() => onDeadlineClick?.(deadline)}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left min-h-[56px]"
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center w-12 h-12 rounded-lg text-center",
            deadline.urgency === "urgent"
              ? "bg-destructive/10 text-destructive"
              : deadline.urgency === "warning"
              ? "bg-amber-500/10 text-amber-600"
              : "bg-muted text-muted-foreground"
          )}
        >
          <span className="text-lg font-bold leading-none">{date.getDate()}</span>
          <span className="text-[10px] uppercase">
            {date.toLocaleDateString("uk-UA", { month: "short" })}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-sm font-medium truncate">{deadline.label}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate">{deadline.cabinetName}</p>
        </div>

        <Badge
          variant={
            deadline.urgency === "urgent"
              ? "destructive"
              : deadline.urgency === "warning"
              ? "secondary"
              : "outline"
          }
          className="shrink-0"
        >
          {daysLeft === 0 ? "Сьогодні" : daysLeft === 1 ? "Завтра" : `${daysLeft} дн.`}
        </Badge>

        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>
    );
  };

  return (
    <Card id="deadlines-section" className="transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Календар дедлайнів</CardTitle>
              <CardDescription>Найближчі 30 днів · {deadlines.length} подій</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {urgentCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="gap-1 text-amber-600">
                <Clock className="h-3 w-3" />
                {warningCount}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {deadlines.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Немає найближчих дедлайнів</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-9">
              <TabsTrigger value="all" className="text-xs">
                Всі ({deadlines.length})
              </TabsTrigger>
              <TabsTrigger value="tax" className="text-xs">
                Податки ({groupedByType.tax?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="report" className="text-xs">
                Звіти ({groupedByType.report?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="other" className="text-xs">
                Інше ({(groupedByType.payment?.length || 0) + (groupedByType.other?.length || 0)})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[320px]">
                <div className="space-y-1">
                  {deadlines
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(renderDeadlineItem)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tax" className="mt-4">
              <ScrollArea className="h-[320px]">
                <div className="space-y-1">
                  {(groupedByType.tax || [])
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(renderDeadlineItem)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="report" className="mt-4">
              <ScrollArea className="h-[320px]">
                <div className="space-y-1">
                  {(groupedByType.report || [])
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(renderDeadlineItem)}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="other" className="mt-4">
              <ScrollArea className="h-[320px]">
                <div className="space-y-1">
                  {[...(groupedByType.payment || []), ...(groupedByType.other || [])]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(renderDeadlineItem)}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

      </CardContent>
    </Card>
  );
}
