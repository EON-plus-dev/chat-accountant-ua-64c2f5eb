import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, Clock, AlertTriangle, CheckCircle, ChevronRight, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditBreakdown {
  responseRequired: number;
  inProgress: number;
  announced: number;
}

interface Audit {
  id: string;
  cabinetId: string;
  cabinetName: string;
  type: string;
  status: "response-required" | "in-progress" | "announced" | "completed";
  daysLeft?: number;
  authority: string;
}

interface AuditsSectionProps {
  totalAudits: number;
  auditsBreakdown: AuditBreakdown;
  audits: Audit[];
  onAuditClick?: (audit: Audit) => void;
  onCabinetClick?: (cabinetId: string) => void;
}

const statusConfig = {
  "response-required": {
    label: "Потребує відповіді",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    badge: "destructive" as const,
  },
  "in-progress": {
    label: "В процесі",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    badge: "secondary" as const,
  },
  announced: {
    label: "Оголошено",
    icon: FileWarning,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    badge: "outline" as const,
  },
  completed: {
    label: "Завершено",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    badge: "outline" as const,
  },
};

export function AuditsSection({
  totalAudits,
  auditsBreakdown,
  audits,
  onAuditClick,
  onCabinetClick,
}: AuditsSectionProps) {
  return (
    <Card id="audits-section" className="transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl",
                auditsBreakdown.responseRequired > 0 ? "bg-destructive/10" : "bg-amber-500/10"
              )}
            >
              <ShieldAlert
                className={cn(
                  "h-5 w-5",
                  auditsBreakdown.responseRequired > 0 ? "text-destructive" : "text-amber-500"
                )}
              />
            </div>
            <div>
              <CardTitle className="text-lg">Податкові перевірки</CardTitle>
              <CardDescription>
                {totalAudits === 0
                  ? "Немає активних перевірок"
                  : `${totalAudits} активних перевірок`}
              </CardDescription>
            </div>
          </div>
          {auditsBreakdown.responseRequired > 0 && (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              Потребує відповіді: {auditsBreakdown.responseRequired}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {totalAudits === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-success/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Немає активних перевірок</p>
            <p className="text-xs text-muted-foreground mt-1">Усі ваші кабінети в безпеці</p>
          </div>
        ) : (
          <>
            {/* Status summary */}
            <div className="grid grid-cols-3 gap-3">
              <div
                className={cn(
                  "p-3 rounded-lg text-center",
                  auditsBreakdown.responseRequired > 0 ? "bg-destructive/10" : "bg-muted/50"
                )}
              >
                <p className="text-2xl font-bold text-destructive">{auditsBreakdown.responseRequired}</p>
                <p className="text-xs text-muted-foreground">Очікує відповіді</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 text-center">
                <p className="text-2xl font-bold text-amber-600">{auditsBreakdown.inProgress}</p>
                <p className="text-xs text-muted-foreground">В процесі</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                <p className="text-2xl font-bold text-blue-600">{auditsBreakdown.announced}</p>
                <p className="text-xs text-muted-foreground">Оголошено</p>
              </div>
            </div>

            {/* Audits list */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Деталізація перевірок</p>
              <ScrollArea className="h-[280px]">
                <div className="space-y-2">
                  {audits
                    .sort((a, b) => {
                      const order = { "response-required": 0, "in-progress": 1, announced: 2, completed: 3 };
                      return order[a.status] - order[b.status];
                    })
                    .map((audit) => {
                      const config = statusConfig[audit.status];
                      const StatusIcon = config.icon;

                      return (
                        <button
                          key={audit.id}
                          onClick={() => onAuditClick?.(audit)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left min-h-[56px]"
                        >
                          <div className={cn("p-2 rounded-lg", config.bg)}>
                            <StatusIcon className={cn("h-4 w-4", config.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{audit.type}</p>
                              <Badge variant={config.badge} className="text-[10px] px-1.5">
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {audit.cabinetName} · {audit.authority}
                            </p>
                          </div>

                          {audit.daysLeft !== undefined && (
                            <div className="text-right shrink-0">
                              <p
                                className={cn(
                                  "text-sm font-semibold",
                                  audit.daysLeft <= 3 ? "text-destructive" : "text-muted-foreground"
                                )}
                              >
                                {audit.daysLeft} дн.
                              </p>
                              <p className="text-[10px] text-muted-foreground">до відповіді</p>
                            </div>
                          )}

                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}
