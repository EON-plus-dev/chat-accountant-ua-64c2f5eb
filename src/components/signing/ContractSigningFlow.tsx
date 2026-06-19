import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck } from "lucide-react";
import { SignDocumentDialog } from "./SignDocumentDialog";
import type { DelegationContract } from "@/hooks/useDelegationContracts";

interface Props {
  contract: DelegationContract;
  currentUserId: string;
  ownerHasSigned: boolean;
  delegateHasSigned: boolean;
  documentBody: string;
}

export function ContractSigningFlow({
  contract, currentUserId, ownerHasSigned, delegateHasSigned, documentBody,
}: Props) {
  const [open, setOpen] = useState(false);
  const isOwner = contract.cabinet_owner_user_id === currentUserId;
  const isDelegate = contract.delegate_user_id === currentUserId;
  const myDone = isOwner ? ownerHasSigned : isDelegate ? delegateHasSigned : false;
  const role = isOwner ? "cabinet_owner" : "delegate";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Підписання договору № {contract.contract_number ?? "—"}
        </CardTitle>
        <CardDescription>
          Активним договір стає після підпису обох сторін. Доступ делегату відкривається автоматично.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <SignerStatus label="Власник кабінету" done={ownerHasSigned} />
          <SignerStatus label="Делегат" done={delegateHasSigned} />
        </div>
        {(isOwner || isDelegate) && !myDone && (
          <Button onClick={() => setOpen(true)} className="w-full">Підписати своєю частиною</Button>
        )}
        {myDone && <Badge variant="secondary">Ви вже підписали</Badge>}
        <SignDocumentDialog
          open={open} onOpenChange={setOpen}
          documentKind="delegation_contract"
          documentId={contract.id}
          documentBody={documentBody}
          cabinetId={contract.cabinet_id}
          signerUserId={currentUserId}
          signerRole={role}
          documentTitle={`Договір № ${contract.contract_number ?? contract.id.slice(0, 8)}`}
        />
      </CardContent>
    </Card>
  );
}

function SignerStatus({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={`rounded-md border p-3 ${done ? "bg-success/5 border-success/30" : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        {done ? <><Check className="h-4 w-4 text-success" /> Підписано</> : <span className="text-muted-foreground">Очікує підпису</span>}
      </div>
    </div>
  );
}
