import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wallet, Shield } from "lucide-react";

interface Props {
  cabinetId: string;
}

interface Row {
  id: string;
  kind: "direct" | "partner";
  delegate_user_id: string;
  scope: string[];
  billing_payer: "cabinet_owner" | "delegate";
  contract_id: string | null;
  status: string;
}

export function AccessListPanel({ cabinetId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["cabinet_access_list", cabinetId],
    queryFn: async () => {
      const [direct, partner] = await Promise.all([
        supabase
          .from("direct_delegations")
          .select("*")
          .eq("cabinet_id", cabinetId)
          .eq("status", "active"),
        supabase
          .from("partner_client_links")
          .select("*")
          .eq("cabinet_id", cabinetId)
          .eq("status", "active"),
      ]);
      const rows: Row[] = [];
      (direct.data ?? []).forEach((d: any) =>
        rows.push({
          id: d.id,
          kind: "direct",
          delegate_user_id: d.delegate_user_id,
          scope: Array.isArray(d.granted_permissions) ? d.granted_permissions : [],
          billing_payer: d.billing_payer,
          contract_id: d.contract_id,
          status: d.status,
        })
      );
      (partner.data ?? []).forEach((p: any) =>
        rows.push({
          id: p.id,
          kind: "partner",
          delegate_user_id: p.partner_user_id,
          scope: Array.isArray(p.scope) ? p.scope : [],
          billing_payer: p.billing_payer,
          contract_id: p.contract_id,
          status: p.status,
        })
      );
      return rows;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" /> Хто має доступ до кабінету
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Завантаження…</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Делегацій немає. Додайте партнера або співробітника на підставі договору.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Хто</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Дозволи</TableHead>
                <TableHead>
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3 w-3" /> Платник AI
                  </span>
                </TableHead>
                <TableHead>Договір</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">
                    {r.delegate_user_id.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {r.kind === "direct" ? "Пряма" : "Партнер"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {r.scope.length === 0 ? "Усі" : `${r.scope.length} операцій`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={r.billing_payer === "cabinet_owner" ? "secondary" : "default"}
                    >
                      {r.billing_payer === "cabinet_owner" ? "Я (власник)" : "Делегат"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.contract_id ? (
                      <Badge variant="outline" className="text-xs">
                        активний
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        немає
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      Відкликати
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
