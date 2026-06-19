import { SystemPageShell } from "./SystemPageShell";
import { MOCK_AUDIT_LOG } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SCOPE: Record<string, string> = { knowledge: "Знання", policy: "AI-політики", cabinet: "Кабінети", billing: "Білінг", rules: "Правила" };

export default function SystemAuditPage() {
  return (
    <SystemPageShell title="Аудит і комплаєнс" description="Журнал дій: хто і коли змінив знання, політики, кабінети, фінансові коригування й правила.">
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {MOCK_AUDIT_LOG.map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3">
                <Badge variant="outline" className="text-[10px] shrink-0">{SCOPE[e.scope]}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm"><b>{e.actor}</b> — {e.action}</div>
                  <div className="text-xs text-muted-foreground">{e.detail}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{new Date(e.at).toLocaleString("uk-UA")}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
