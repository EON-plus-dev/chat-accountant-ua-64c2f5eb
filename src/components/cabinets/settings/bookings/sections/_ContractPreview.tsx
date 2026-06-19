/**
 * Shared preview body for a salon master delegation contract.
 * Renders inside any SheetContent. Used by MasterDelegationsSection and
 * MastersSettingsSection so the contract text is identical wherever it opens.
 */
import { FileSignature, ShieldCheck } from "lucide-react";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { buildContractCopy } from "@/lib/salonMasterContractCopy";
import type { SalonMasterDelegationContract } from "@/config/demoCabinets/salonMasterDelegations";

export function ContractPreview({ contract }: { contract: SalonMasterDelegationContract }) {
  const copy = buildContractCopy(contract);
  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <FileSignature className="w-4 h-4" />
          {copy.title}
        </SheetTitle>
        <SheetDescription>{copy.subtitle}</SheetDescription>
      </SheetHeader>
      <div className="mt-4 space-y-4 text-sm">
        {copy.sections.map((s) => (
          <section key={s.heading} className="space-y-1">
            <div className="font-semibold">{s.heading}</div>
            <p className="text-muted-foreground leading-relaxed">{s.body}</p>
          </section>
        ))}
        <section className="space-y-1.5 border-t pt-4">
          <div className="font-semibold">{copy.permissionsTitle}</div>
          <ul className="space-y-1">
            {copy.permissions.map((p) => (
              <li key={p} className="flex items-start gap-2 text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
        <div className="text-[11px] text-muted-foreground border-t pt-3">
          Демо-перегляд. Реальне підписання — через КЕП/Дія.Підпис (`kep-sign` edge function),
          з записом у `signature_audit_log`.
        </div>
      </div>
    </>
  );
}
