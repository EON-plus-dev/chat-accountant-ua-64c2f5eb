import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentAuditSection } from "../DocumentAuditSection";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import type { DocumentHistoryEntry } from "@/config/documentFlowConfig";

type HistoryFilter = "all" | "sign" | "approval" | "send" | "ai";

interface HistoryTimelineBlockProps {
  documentId: string;
  filter?: HistoryFilter;
  history?: DocumentHistoryEntry[];
  onExportAudit?: () => void;
  className?: string;
}

export const HistoryTimelineBlock = ({
  documentId,
  filter = "all",
  history,
  onExportAudit,
  className,
}: HistoryTimelineBlockProps) => {
  return (
    <Card 
      className={cn("overflow-hidden", className)}
      data-section="document-history-timeline"
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Таймлайн подій
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <DocumentAuditSection
          documentId={documentId}
          filter={filter}
          history={history}
          onExportAudit={onExportAudit}
        />
      </CardContent>
    </Card>
  );
};
