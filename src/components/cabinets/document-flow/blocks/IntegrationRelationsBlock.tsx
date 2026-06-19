/**
 * IntegrationRelationsBlock — Блок "Зв'язки з документами"
 * Wrapper для існуючого DocumentRelationshipsTab з перемикачем List/Graph
 */

import { useState } from "react";
import { GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { cn } from "@/lib/utils";
import { DocumentRelationshipsTab } from "../tabs/DocumentRelationshipsTab";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import type { CabinetType } from "@/types/cabinet";

interface IntegrationRelationsBlockProps {
  document: FlowDocument;
  cabinetType: CabinetType;
  linkedDocumentsResolved?: FlowDocument[];
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToContractor?: () => void;
  onNavigateToPayments?: () => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToAudit?: (auditId: string) => void;
  onAddToAuditPackage?: () => void;
  onAddDocumentToPackage?: () => void;
  className?: string;
}

export const IntegrationRelationsBlock = ({
  document,
  cabinetType,
  linkedDocumentsResolved,
  onNavigateToDocument,
  onNavigateToContractor,
  onNavigateToPayments,
  onNavigateToIncomeBook,
  onNavigateToAudit,
  onAddToAuditPackage,
  onAddDocumentToPackage,
  className,
}: IntegrationRelationsBlockProps) => {
  const linkedCount = linkedDocumentsResolved?.length || 0;
  const paymentsCount = document.linkedPayments?.length || 0;
  const totalConnections = linkedCount + paymentsCount;

  return (
    <Card className={cn("border-border/50", className)} data-section="document-integration-relations">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            Зв'язки з документами
            {totalConnections > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {totalConnections}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <DocumentRelationshipsTab
          document={document}
          cabinetType={cabinetType === "fop" || cabinetType === "tov" ? cabinetType : "fop"}
          linkedDocumentsResolved={linkedDocumentsResolved}
          onNavigateToDocument={onNavigateToDocument}
          onNavigateToContractor={onNavigateToContractor}
          onNavigateToPayments={onNavigateToPayments}
          onNavigateToIncomeBook={onNavigateToIncomeBook}
          onNavigateToAudit={onNavigateToAudit}
          onAddToAuditPackage={onAddToAuditPackage}
          onAddDocumentToPackage={onAddDocumentToPackage}
          className="border-0 shadow-none"
        />
      </CardContent>
    </Card>
  );
};
