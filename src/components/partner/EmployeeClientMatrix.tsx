// Partner cabinet matrix: employees × clients with billing_payer indicator.
// Demonstrates two-tier delegation (client→partner, partner→employee).

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

interface Props {
  partnerUserId: string;
}

export function EmployeeClientMatrix({ partnerUserId }: Props) {
  const { data } = useQuery({
    queryKey: ["partner_employee_matrix", partnerUserId],
    queryFn: async () => {
      const { data: links } = await supabase
        .from("partner_client_links")
        .select("*")
        .eq("partner_user_id", partnerUserId)
        .eq("status", "active");
      const linkIds = (links ?? []).map((l: any) => l.id);
      const { data: assignments } = linkIds.length
        ? await supabase
            .from("partner_employee_assignments")
            .select("*")
            .in("client_link_id", linkIds)
            .eq("status", "active")
        : { data: [] as any[] };
      return { links: links ?? [], assignments: assignments ?? [] };
    },
  });

  const links = data?.links ?? [];
  const assignments = data?.assignments ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Співробітники × Клієнти
        </CardTitle>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Призначте співробітника на клієнта, щоб надати йому доступ. Платник AI-кредитів
            успадковується з договору з клієнтом, але може бути перевизначений (якщо
            договір це дозволяє).
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Співробітник</TableHead>
                <TableHead>Клієнт</TableHead>
                <TableHead>Дозволи</TableHead>
                <TableHead>Платник AI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a: any) => {
                const link = links.find((l: any) => l.id === a.client_link_id);
                const effectivePayer =
                  a.billing_payer_override ?? link?.billing_payer ?? "cabinet_owner";
                const overridden = a.billing_payer_override !== null;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">
                      {a.employee_user_id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {link?.cabinet_id?.slice(0, 12) ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Array.isArray(a.granted_permissions)
                        ? `${a.granted_permissions.length || "Усі"}`
                        : "Усі"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          effectivePayer === "cabinet_owner" ? "secondary" : "default"
                        }
                        className={overridden ? "ring-2 ring-amber-400" : ""}
                      >
                        {effectivePayer === "cabinet_owner" ? "Клієнт" : "Партнер"}
                        {overridden && " (перевизначено)"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
