import { useSignatureAuditLog } from "@/hooks/useSignatureAuditLog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  init: "Запит підпису",
  signed: "Підписано",
  callback: "Підтвердження від провайдера",
  cancel: "Скасовано",
  rule_changed: "Зміна правил автопідпису",
  auto_sign_executed: "Авто-підпис виконано",
};

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  signed: "default",
  init: "secondary",
  cancel: "destructive",
  rule_changed: "outline",
  auto_sign_executed: "default",
};

interface Props {
  cabinetId: string;
  limit?: number;
}

export function SignatureAuditLogViewer({ cabinetId, limit = 100 }: Props) {
  const { data: entries, isLoading } = useSignatureAuditLog(cabinetId, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Журнал підписів
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Імутабельний журнал для відповідності ЗУ № 2155-VIII. Записи не можна змінити чи видалити.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Завантаження…</p>
        ) : !entries || entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Поки немає подій підписання.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Час</TableHead>
                  <TableHead>Дія</TableHead>
                  <TableHead>Виконавець</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Деталі</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs">
                      {new Date(e.created_at).toLocaleString("uk-UA")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ACTION_VARIANT[e.action] ?? "outline"}>
                        {ACTION_LABELS[e.action] ?? e.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {e.actor_user_id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="text-xs">{e.ip_address ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                      {Object.keys(e.details).length > 0
                        ? JSON.stringify(e.details)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
