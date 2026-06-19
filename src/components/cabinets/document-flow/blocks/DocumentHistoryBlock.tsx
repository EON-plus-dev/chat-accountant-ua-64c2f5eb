import { useState } from "react";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DocumentVersionsSection } from "../DocumentVersionsSection";
import { DocumentAuditSection } from "../DocumentAuditSection";
import { cn } from "@/lib/utils";
import { type DocumentVersion } from "@/config/documentVersioningConfig";
import { type DocumentHistoryEntry } from "@/config/documentFlowConfig";

type HistoryFilter = "all" | "sign" | "approval" | "send" | "ai";

interface DocumentHistoryBlockProps {
  documentId: string;
  currentVersion?: number;
  compact?: boolean;
  defaultExpanded?: boolean;
  filter?: HistoryFilter;
  // Real history from document
  history?: DocumentHistoryEntry[];
  onRestoreVersion?: (versionId: string, version: DocumentVersion) => void;
  onViewVersion?: (versionId: string) => void;
  onExportAudit?: () => void;
  className?: string;
}

export const DocumentHistoryBlock = ({
  documentId,
  currentVersion = 1,
  compact = false,
  defaultExpanded = true,
  filter = "all",
  history,
  onRestoreVersion,
  onViewVersion,
  onExportAudit,
  className,
}: DocumentHistoryBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (compact) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className={cn("overflow-hidden", className)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  Історія
                </CardTitle>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-6">
              <DocumentVersionsSection
                documentId={documentId}
                currentVersion={currentVersion}
                onRestoreVersion={onRestoreVersion}
                onViewVersion={onViewVersion}
              />
              <DocumentAuditSection
                documentId={documentId}
                filter={filter}
                history={history}
                onExportAudit={onExportAudit}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <DocumentVersionsSection
        documentId={documentId}
        currentVersion={currentVersion}
        onRestoreVersion={onRestoreVersion}
        onViewVersion={onViewVersion}
      />
      <DocumentAuditSection
        documentId={documentId}
        filter={filter}
        history={history}
        onExportAudit={onExportAudit}
      />
    </div>
  );
};
