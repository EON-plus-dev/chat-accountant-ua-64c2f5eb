import { SystemPageShell } from "./SystemPageShell";
import { MOCK_INCIDENTS } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Cpu, Plug, CreditCard, Server } from "lucide-react";

const SEVERITY: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  critical: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
};

const STATUS: Record<string, string> = {
  new: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  in_progress: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  resolved: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
};

const STATUS_LABEL: Record<string, string> = { new: "Нова", in_progress: "У роботі", resolved: "Вирішено" };

const SOURCE_ICON = {
  integration: Plug,
  ai: Cpu,
  platform: Server,
  billing: CreditCard,
} as const;

export default function SystemIncidentsPage() {
  return (
    <SystemPageShell
      title="Інциденти та підтримка"
      description="Журнал системних, інтеграційних та AI-інцидентів з пріоритетами, статусами і кількістю постраждалих кабінетів."
    >
      <div className="space-y-2">
        {MOCK_INCIDENTS.map((i) => {
          const Icon = SOURCE_ICON[i.source];
          return (
            <Card key={i.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-muted p-2 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{i.title}</span>
                      <Badge variant="outline" className={`text-[10px] ${SEVERITY[i.severity]}`}>{i.severity.toUpperCase()}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${STATUS[i.status]}`}>{STATUS_LABEL[i.status]}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{i.description}</div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {i.affectedCabinets} кабінетів постраждали
                      </span>
                      <span>{new Date(i.createdAt).toLocaleString("uk-UA")}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </SystemPageShell>
  );
}
