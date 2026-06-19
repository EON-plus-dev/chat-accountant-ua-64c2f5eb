import { MOCK_AUDIT_LOG } from "@/admin/system/data/mocks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  /** Якщо передати — фільтр за входженням id у поле detail. */
  entityId?: string;
  scope?: "knowledge" | "policy" | "cabinet" | "billing" | "rules";
  emptyText?: string;
}

/** Shared вкладка «Аудит» для будь-якої сутності адмін-центру. Mock-only. */
export function EntityAuditTab({ entityId, scope, emptyText }: Props) {
  const rows = MOCK_AUDIT_LOG.filter((r) => {
    if (scope && r.scope !== scope) return false;
    if (entityId && !r.detail.includes(entityId)) return false;
    return true;
  });

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          {emptyText ?? "Поки що немає записів в аудиті для цієї сутності (демо)."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border/60">
          {rows.map((r) => (
            <div key={r.id} className="p-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{r.action}</span>
                <Badge variant="outline" className="text-[10px] capitalize">{r.scope}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(r.at).toLocaleString("uk-UA")}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{r.actor} · {r.detail}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
