/**
 * DocumentDrillView — компактний preview документа за номером.
 */

import { ArrowRight, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { RelatedAuditsList } from "./RelatedAuditsList";

interface Props {
  documentId: string;
  sourceLabel?: string;
  onOpenFullDocument?: (documentId: string) => void;
}

export function DocumentDrillView({ documentId, sourceLabel, onOpenFullDocument }: Props) {
  const { popAll } = useDrillStack();

  return (
    <DrillSheet
      matchKind="document"
      matchId={documentId}
      title="Документ"
      sourceLabel={sourceLabel}
      footer={
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            popAll();
            onOpenFullDocument?.(documentId);
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Відкрити документ повністю
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">№ {documentId}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Превʼю документа</p>
          </div>
        </div>

        <Separator />

        <RelatedAuditsList match="documentFlowId" value={documentId} />

        <div className="text-xs text-muted-foreground leading-relaxed">
          У повному перегляді — вкладення, історія підписів, статус, пов'язані
          платежі та можливість редагування.
        </div>
      </div>
    </DrillSheet>
  );
}
