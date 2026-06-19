import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentVersionsSection } from "../DocumentVersionsSection";
import { cn } from "@/lib/utils";
import { GitBranch } from "lucide-react";
import { getVersionsForDocument, type DocumentVersion } from "@/config/documentVersioningConfig";

interface HistoryVersionsBlockProps {
  documentId: string;
  currentVersion?: number;
  onRestoreVersion?: (versionId: string, version: DocumentVersion) => void;
  onViewVersion?: (versionId: string) => void;
  onCompareVersions?: (left: DocumentVersion, right: DocumentVersion) => void;
  className?: string;
}

export const HistoryVersionsBlock = ({
  documentId,
  currentVersion = 1,
  onRestoreVersion,
  onViewVersion,
  onCompareVersions,
  className,
}: HistoryVersionsBlockProps) => {
  // Get versions from unified source
  const versions = useMemo(() => getVersionsForDocument(documentId), [documentId]);
  const latestVersionLabel = versions[0]?.versionLabel || `v${currentVersion}.0`;
  
  return (
    <Card 
      className={cn("overflow-hidden", className)}
      data-section="document-history-versions"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-muted-foreground" />
            Версії документа
          </CardTitle>
          <Badge variant="outline" className="font-mono text-xs">
            {latestVersionLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <DocumentVersionsSection
          documentId={documentId}
          currentVersion={currentVersion}
          onRestoreVersion={onRestoreVersion}
          onViewVersion={onViewVersion}
          onCompareVersions={onCompareVersions}
        />
      </CardContent>
    </Card>
  );
};
