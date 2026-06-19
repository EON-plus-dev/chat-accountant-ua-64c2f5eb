// Unified «Делегування» tab for cabinet settings — composes:
//   • DelegationChainPanel (client→partner→employee with two-tier revoke)
//   • AccessListPanel (flat list of who has access + AI billing payer)
//   • EmployeeClientMatrix (only for partner cabinet owners)
//   • Active delegation contracts list with auto-sign panel per contract
//   • SignatureAuditLogViewer (immutable journal — ЗУ № 2155-VIII)
//
// Drop into any cabinet settings page:
//   <DelegationSettingsTab cabinetId={id} currentUserId={uid} isOwner={true} isPartnerCabinet={false} />

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSignature } from "lucide-react";
import { DelegationChainPanel } from "./DelegationChainPanel";
import { AccessListPanel } from "./AccessListPanel";
import { EmployeeClientMatrix } from "@/components/partner/EmployeeClientMatrix";
import { AutoSignRulesPanel } from "@/components/signing/AutoSignRulesPanel";
import { SignatureAuditLogViewer } from "@/components/signing/SignatureAuditLogViewer";

interface Props {
  cabinetId: string;
  currentUserId: string;
  isOwner: boolean;
  /** Show partner-side EmployeeClientMatrix when this cabinet belongs to a partner firm. */
  isPartnerCabinet?: boolean;
}

interface ContractRow {
  id: string;
  contract_kind: string;
  contract_number: string | null;
  status: string;
  delegate_kind: string;
  valid_from: string;
  valid_until: string | null;
}

function useCabinetContracts(cabinetId: string) {
  return useQuery({
    queryKey: ["cabinet_delegation_contracts", cabinetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("delegation_contracts")
        .select("id, contract_kind, contract_number, status, delegate_kind, valid_from, valid_until")
        .eq("cabinet_id", cabinetId)
        .in("status", ["active", "pending_sign"])
        .order("valid_from", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContractRow[];
    },
  });
}

const KIND_LABEL: Record<string, string> = {
  services: "Договір послуг",
  employment: "Трудовий договір",
  partner_outsourcing: "Аутсорсинг (партнер)",
};

export function DelegationSettingsTab({
  cabinetId,
  currentUserId,
  isOwner,
  isPartnerCabinet = false,
}: Props) {
  const { data: contracts } = useCabinetContracts(cabinetId);

  return (
    <Tabs defaultValue="chain" className="w-full">
      <TabsList className="w-full md:w-auto">
        <TabsTrigger value="chain">Ланцюг</TabsTrigger>
        <TabsTrigger value="access">Доступи</TabsTrigger>
        <TabsTrigger value="contracts">Договори</TabsTrigger>
        {isPartnerCabinet && <TabsTrigger value="employees">Співробітники</TabsTrigger>}
        {isOwner && <TabsTrigger value="audit">Журнал підписів</TabsTrigger>}
      </TabsList>

      <TabsContent value="chain" className="mt-4 space-y-4">
        <DelegationChainPanel cabinetId={cabinetId} isOwner={isOwner} />
      </TabsContent>

      <TabsContent value="access" className="mt-4 space-y-4">
        <AccessListPanel cabinetId={cabinetId} />
      </TabsContent>

      <TabsContent value="contracts" className="mt-4 space-y-4">
        {!contracts || contracts.length === 0 ? (
          <Card>
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">
                Активних договорів делегування немає.
              </p>
            </CardContent>
          </Card>
        ) : (
          contracts.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <span className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4" />
                    {KIND_LABEL[c.contract_kind] ?? c.contract_kind}
                    {c.contract_number && (
                      <span className="text-muted-foreground font-normal">
                        № {c.contract_number}
                      </span>
                    )}
                  </span>
                  <Badge
                    variant={c.status === "active" ? "default" : "secondary"}
                  >
                    {c.status === "active" ? "Активний" : "Очікує підпису"}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.valid_from).toLocaleDateString("uk-UA")} —{" "}
                  {c.valid_until
                    ? new Date(c.valid_until).toLocaleDateString("uk-UA")
                    : "безстроково"}
                </p>
              </CardHeader>
              {c.status === "active" && (
                <CardContent>
                  <AutoSignRulesPanel
                    contractId={c.id}
                    cabinetId={cabinetId}
                    currentUserId={currentUserId}
                    isOwner={isOwner}
                  />
                </CardContent>
              )}
            </Card>
          ))
        )}
      </TabsContent>

      {isPartnerCabinet && (
        <TabsContent value="employees" className="mt-4">
          <EmployeeClientMatrix partnerUserId={currentUserId} />
        </TabsContent>
      )}

      {isOwner && (
        <TabsContent value="audit" className="mt-4">
          <SignatureAuditLogViewer cabinetId={cabinetId} />
        </TabsContent>
      )}
    </Tabs>
  );
}
