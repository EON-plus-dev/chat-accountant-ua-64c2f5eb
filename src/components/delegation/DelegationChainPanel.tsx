import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, User, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────
interface PartnerLink {
  id: string;
  cabinet_id: string;
  partner_user_id: string;
  client_owner_user_id: string;
  status: string;
  billing_payer: string;
  accountant_slug: string;
  contract_id: string | null;
}
interface EmployeeAssignment {
  id: string;
  client_link_id: string;
  employee_user_id: string;
  partner_user_id: string;
  status: string;
  billing_payer_override: string | null;
}

// ── Hook: load chain for cabinet ──────────────────────────────────────
function useDelegationChain(cabinetId: string | null) {
  return useQuery({
    enabled: !!cabinetId,
    queryKey: ["delegation_chain", cabinetId],
    queryFn: async () => {
      const { data: links, error: e1 } = await supabase
        .from("partner_client_links")
        .select("*")
        .eq("cabinet_id", cabinetId!)
        .eq("status", "active");
      if (e1) throw e1;

      const linkIds = (links ?? []).map((l) => l.id);
      let assignments: EmployeeAssignment[] = [];
      if (linkIds.length > 0) {
        const { data: pea } = await supabase
          .from("partner_employee_assignments")
          .select("*")
          .in("client_link_id", linkIds)
          .eq("status", "active");
        assignments = (pea ?? []) as unknown as EmployeeAssignment[];
      }
      return {
        links: (links ?? []) as unknown as PartnerLink[],
        assignments,
      };
    },
  });
}

interface Props {
  cabinetId: string;
  /** True only for cabinet owner (else revoke buttons hidden) */
  isOwner: boolean;
}

export function DelegationChainPanel({ cabinetId, isOwner }: Props) {
  const qc = useQueryClient();
  const { data, isLoading } = useDelegationChain(cabinetId);

  const revokeLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from("partner_client_links")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Договір з партнером відкликано" });
      qc.invalidateQueries({ queryKey: ["delegation_chain", cabinetId] });
    },
    onError: (e: Error) => toast({ title: "Помилка", description: e.message, variant: "destructive" }),
  });

  const revokeEmployee = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from("partner_employee_assignments")
        .update({ status: "revoked", revoked_at: new Date().toISOString() })
        .eq("id", assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Доступ співробітника відкликано" });
      qc.invalidateQueries({ queryKey: ["delegation_chain", cabinetId] });
    },
    onError: (e: Error) => toast({ title: "Помилка", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Завантаження ланцюга делегування…</p>;
  }
  if (!data || data.links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ланцюг делегування</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Партнерські договори не оформлені. Ви ведете кабінет самостійно.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ланцюг делегування</CardTitle>
        <p className="text-xs text-muted-foreground">
          Двоступенева ревокація: можна відкликати весь договір з партнером або лише доступ конкретного співробітника.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.links.map((link) => {
          const linkAssignments = data.assignments.filter(
            (a) => a.client_link_id === link.id
          );
          return (
            <div key={link.id} className="rounded-lg border p-3 space-y-3">
              {/* Step 1: client → partner */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Ви</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{link.accountant_slug}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    Платник AI: {link.billing_payer === "cabinet_owner" ? "ви" : "партнер"}
                  </Badge>
                </div>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Відкликати договір з партнером? Усі співробітники втратять доступ.")) {
                        revokeLink.mutate(link.id);
                      }
                    }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Відкликати договір
                  </Button>
                )}
              </div>

              {/* Step 2: partner → employees */}
              {linkAssignments.length === 0 ? (
                <p className="pl-6 text-xs text-muted-foreground">
                  Партнер ще не призначив співробітників.
                </p>
              ) : (
                <div className="pl-6 space-y-1.5">
                  {linkAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between gap-2 text-sm rounded border bg-muted/40 px-2 py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-xs">
                          {a.employee_user_id.slice(0, 8)}…
                        </span>
                        {a.billing_payer_override && (
                          <Badge variant="outline" className="text-xs">
                            Override: {a.billing_payer_override}
                          </Badge>
                        )}
                      </div>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Відкликати доступ цього співробітника?")) {
                              revokeEmployee.mutate(a.id);
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
