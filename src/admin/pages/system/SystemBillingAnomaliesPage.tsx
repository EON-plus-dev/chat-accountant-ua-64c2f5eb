import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_BILLING_TX } from "@/admin/system/data/mocks";
import { AlertTriangle, Sparkles } from "lucide-react";

export default function SystemBillingAnomaliesPage() {
  const anomalies = MOCK_BILLING_TX.filter((t) => t.anomaly);
  return (
    <SystemPageShell
      title="Аномалії списань"
      description="Стрибки витрат, нульова активність на активному тарифі, ручні коригування з аудитом."
    >
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">AI-висновок</div>
            <div className="text-xs text-muted-foreground mt-1">Виявлено 1 стрибок витрат за останні 48 годин. Кабінет cab-3 — пакетна обробка документів понад середнє ×7.</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {anomalies.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{tx.cabinetName}</div>
                  <div className="text-xs text-muted-foreground">{tx.reason}</div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-rose-500/15 text-rose-700 border-rose-500/30">{tx.amount} кр.</Badge>
                <div className="text-xs text-muted-foreground w-32 text-right">{new Date(tx.at).toLocaleString("uk-UA")}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
