/**
 * ContractorDrillView — компактний preview контрагента.
 * Тримаємо мінімум: назва, код (ЄДРПОУ/ІПН), кнопка «Відкрити повний профіль».
 */

import { ArrowRight, Building2, ExternalLink, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { RelatedAuditsList } from "./RelatedAuditsList";

interface Props {
  contractorId: string;
  /** Опц. ім'я для красивого заголовку, якщо передано з parent */
  contractorName?: string;
  sourceLabel?: string;
  onOpenFullProfile?: (contractorId: string) => void;
}

export function ContractorDrillView({ contractorId, contractorName, sourceLabel, onOpenFullProfile }: Props) {
  const { popAll } = useDrillStack();

  // Eвристика: визначаємо чи це ЄДРПОУ (8 цифр) чи ІПН (10 цифр)
  const codeKind = /^\d{8}$/.test(contractorId)
    ? "ЄДРПОУ"
    : /^\d{10}$/.test(contractorId)
      ? "ІПН"
      : null;

  return (
    <DrillSheet
      matchKind="contractor"
      matchId={contractorId}
      title="Картка контрагента"
      sourceLabel={sourceLabel}
      footer={
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            popAll();
            onOpenFullProfile?.(contractorId);
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Відкрити повний профіль
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">
              {contractorName || "Контрагент"}
            </p>
            {codeKind && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Hash className="h-3 w-3" />
                <span className="font-mono">{codeKind}: {contractorId}</span>
              </div>
            )}
          </div>
          <Badge variant="secondary" size="sm" className="shrink-0">
            Превʼю
          </Badge>
        </div>

        <Separator />

        <RelatedAuditsList match="contractor" value={contractorId} />

        <div className="text-xs text-muted-foreground leading-relaxed">
          Це швидкий перегляд. У повному профілі — реквізити, історія операцій,
          ризик-скоринг, прив'язані документи та налаштування взаємодії.
        </div>
      </div>
    </DrillSheet>
  );
}
