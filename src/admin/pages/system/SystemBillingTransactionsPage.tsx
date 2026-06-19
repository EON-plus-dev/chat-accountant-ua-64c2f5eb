import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_BILLING_TX } from "@/admin/system/data/mocks";
import { Download } from "lucide-react";

const TYPE_LABEL: Record<string, string> = { charge: "Списання", topup: "Поповнення", refund: "Повернення", adjust: "Коригування" };

export default function SystemBillingTransactionsPage() {
  return (
    <SystemPageShell
      title="Транзакції кредитів"
      description="Історія списань і поповнень кредитів по всіх кабінетах."
      actions={<Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" />Експорт CSV</Button>}
    >
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {MOCK_BILLING_TX.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{tx.cabinetName}</div>
                  <div className="text-xs text-muted-foreground">{tx.reason}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">{TYPE_LABEL[tx.type]}</Badge>
                {tx.anomaly && <Badge variant="outline" className="text-[10px] bg-rose-500/15 text-rose-700 border-rose-500/30">Аномалія</Badge>}
                <div className={`text-sm font-mono font-semibold tabular-nums w-24 text-right ${tx.amount < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </div>
                <div className="text-xs text-muted-foreground w-32 text-right">{new Date(tx.at).toLocaleString("uk-UA")}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
