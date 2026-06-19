import { SystemPageShell } from "./SystemPageShell";
import { MOCK_CONNECTORS } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const STATUS_CLASS = { ok: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", degraded: "bg-amber-500/15 text-amber-700 border-amber-500/30", down: "bg-rose-500/15 text-rose-700 border-rose-500/30" };
const CAT: Record<string, string> = { bank: "Банк", edo: "ЕДО", gov: "Держсервіс", kep: "КЕП" };

export default function SystemConnectorsPage() {
  return (
    <SystemPageShell title="Стан конекторів" description="Real-time стан інтеграцій, % успішності та постраждалі кабінети.">
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {MOCK_CONNECTORS.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 hover:bg-muted/40">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{CAT[c.category]} · успішність {c.successRate}% · постраждало {c.affectedCabinets} каб.</div>
                </div>
                <Badge variant="outline" className={`text-xs ${STATUS_CLASS[c.status]}`}>{c.status.toUpperCase()}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">AI-рекомендація</div>
            <div className="text-xs text-muted-foreground mt-1">ПриватБанк деградує з 06:00 — рекомендуємо тимчасово перенаправити синхронізацію через резервний канал та повідомити постраждалі кабінети у чаті.</div>
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
