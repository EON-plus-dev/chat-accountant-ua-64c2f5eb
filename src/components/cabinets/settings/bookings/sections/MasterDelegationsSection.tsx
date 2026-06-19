/**
 * MasterDelegationsSection — список делегаційних договорів з майстрами салону
 * та запрошень, що очікують реєстрації майстра-фізособи.
 *
 * Salon-side view. Phase 4 онбордингу: тут salon owner бачить юридичну
 * сторону відносин (а не лише ставку у Майстри), і може попередньо
 * переглянути текст договору, який буде запропонований до підписання.
 */

import { useMemo, useState } from "react";
import { MailPlus, Eye, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import {
  getDelegationsForSalon,
  getInvitationsForSalon,
  type SalonMasterDelegationContract,
} from "@/config/demoCabinets/salonMasterDelegations";
import { salonMasters } from "@/config/demoCabinets/salonData";
import { SectionShell } from "../shared/SectionShell";
import { getSettingsSectionLabel, getVerticalPack } from "@/core";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import { ContractPreview } from "./_ContractPreview";
import { InviteMasterSheet, type PendingInvite } from "./_InviteMasterSheet";

export function MasterDelegationsSection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const delegations = useMemo(() => getDelegationsForSalon(cabinet.id), [cabinet.id]);
  const baseInvitations = useMemo(() => getInvitationsForSalon(cabinet.id), [cabinet.id]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [localInvites, setLocalInvites] = useState<PendingInvite[]>([]);

  const previewContract = delegations.find((d) => d.id === previewId) ?? null;
  const invitations = baseInvitations;

  const pack = getVerticalPack(cabinet);
  const label = getSettingsSectionLabel(cabinet, "delegations", {
    title: "Делегації майстрів",
    description: "Юридична сторона відносин з командою: трудові договори (штатні), договори послуг із ФОП, активні доступи в кабінет салону та запрошення.",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
      actions={
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setInviteOpen(true)}>
          <MailPlus className="w-4 h-4" />
          Запросити {pack.labels.staffSingular.toLowerCase()}а
        </Button>
      }
    >
      <div className="space-y-5">
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Активні договори ({delegations.length})</h3>
          </div>
          <div className="grid gap-2">
            {delegations.map((d) => (
              <DelegationRow key={d.id} d={d} onPreview={() => setPreviewId(d.id)} />
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Очікують реєстрації майстра ({invitations.length + localInvites.length})</h3>
          </div>
          {invitations.length === 0 ? (
            <Card>
              <CardContent className="pt-4 text-sm text-muted-foreground">
                Усі запрошені майстри вже зареєстровані в системі.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2">
              {invitations.map((inv) => {
                const m = salonMasters.find((x) => x.id === inv.masterId);
                return (
                  <Card key={inv.id}>
                    <CardContent className="p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{m?.fullName ?? inv.masterId}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {inv.invitedEmail} · запрошено{" "}
                          {new Date(inv.invitedAt).toLocaleDateString("uk-UA")} ·{" "}
                          {inv.proposedContractKind === "services" ? "договір послуг (ФОП)" : "трудовий"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[10px]">
                          Очікує
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toast({ title: "Запрошення повторно надіслане (демо)" })}
                        >
                          Надіслати ще раз
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {localInvites.map((inv) => (
                <Card key={inv.id}>
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{inv.fullName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {inv.email} · запрошено{" "}
                        {new Date(inv.invitedAt).toLocaleDateString("uk-UA")} ·{" "}
                        {inv.contractKind === "employment" ? "трудовий" : "договір послуг (ФОП)"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[10px] border-primary/40 bg-primary/10 text-primary">
                        Новий
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLocalInvites((arr) => arr.filter((x) => x.id !== inv.id))}
                      >
                        Скасувати
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <InviteMasterSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={(inv) => setLocalInvites((arr) => [inv, ...arr])}
      />


      <Sheet open={previewContract !== null} onOpenChange={(o) => !o && setPreviewId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {previewContract && <ContractPreview contract={previewContract} />}
        </SheetContent>
      </Sheet>
    </SectionShell>
  );
}

function DelegationRow({
  d,
  onPreview,
}: {
  d: SalonMasterDelegationContract;
  onPreview: () => void;
}) {
  const master = salonMasters.find((m) => m.id === d.masterId);
  const drill = useDrillStack();
  const kindLabel = d.contract_kind === "employment" ? "Трудовий" : "Договір послуг";
  const termsLabel =
    d.terms.kind === "employment"
      ? d.terms.position
      : d.terms.kind === "revenue_split"
        ? `Комісія ${d.terms.commission_pct}%`
        : d.terms.kind === "workspace_rental"
          ? `Оренда місця`
          : `Гібрид ${d.terms.commission_pct}% + оренда`;
  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() =>
                drill.push({ kind: "salon-master", id: d.masterId, displayName: master?.fullName })
              }
              className="text-sm font-medium truncate hover:text-primary hover:underline underline-offset-2 transition-colors text-left"
            >
              {master?.fullName ?? d.masterId}
            </button>
            <Badge variant="outline" className="text-[10px]">
              № {d.contract_number}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] border-primary/30 bg-primary/5 text-primary"
            >
              {kindLabel}
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {termsLabel} · з {new Date(d.valid_from).toLocaleDateString("uk-UA")} ·{" "}
            оплачує AI: {d.billing_payer === "cabinet_owner" ? "салон" : "майстер"}
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={onPreview}>
          <Eye className="w-3.5 h-3.5" />
          Договір
        </Button>
      </CardContent>
    </Card>
  );
}

