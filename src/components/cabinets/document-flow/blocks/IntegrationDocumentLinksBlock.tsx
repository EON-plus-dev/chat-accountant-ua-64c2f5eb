/**
 * IntegrationDocumentLinksBlock — Блок 3: Пов'язані документи
 * 
 * Показує зв'язки документ-документ з семантичним групуванням:
 * - Ієрархія (parent/child/amendment/annex)
 * - Фінансові (payment-basis/payment-confirm)
 * - Версії (supersedes/superseded-by)
 * - Посилання (reference/related)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  FolderTree,
  Wallet,
  GitBranch,
  Link2,
  Package
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import { 
  LinkType, 
  LinkGroup, 
  linkTypeConfig, 
  linkTypeToGroup, 
  linkGroupConfig 
} from "@/types/documentLinks";

interface IntegrationDocumentLinksBlockProps {
  document: FlowDocument;
  linkedDocuments?: FlowDocument[];
  onNavigateToDocument?: (docId: string) => void;
  className?: string;
}

// Group configuration with icons
const groupIcons: Record<LinkGroup, React.ElementType> = {
  hierarchy: FolderTree,
  financial: Wallet,
  versions: GitBranch,
  references: Link2,
  packages: Package,
};

// Document type labels
const documentTypeLabels: Record<string, string> = {
  contract: "Договір",
  act: "Акт",
  invoice: "Рахунок",
  "tax-invoice": "Податкова накладна",
  payment: "Платіж",
  closing: "Акт звірки",
  annex: "Додаток",
  amendment: "Додаткова угода",
  report: "Звіт",
  other: "Документ",
};

// Determine link type based on document relationship
const determineLinkType = (
  currentDoc: FlowDocument, 
  linkedDoc: FlowDocument
): LinkType => {
  // Contract-based hierarchy
  if (currentDoc.type === "act" && linkedDoc.type === "contract") return "parent";
  if (currentDoc.type === "contract" && linkedDoc.type === "act") return "child";
  if (currentDoc.type === "invoice" && linkedDoc.type === "contract") return "parent";
  if (currentDoc.type === "contract" && linkedDoc.type === "invoice") return "child";
  
  // Payment relationships (using payment-order as payment type)
  if (currentDoc.type === "payment-order" && (linkedDoc.type === "invoice" || linkedDoc.type === "act")) {
    return "payment-confirm";
  }
  if ((currentDoc.type === "invoice" || currentDoc.type === "act") && linkedDoc.type === "payment-order") {
    return "payment-basis";
  }
  
  // Tax invoice chain
  if (currentDoc.type === "tax-invoice" && linkedDoc.type === "act") return "child";
  if (currentDoc.type === "act" && linkedDoc.type === "tax-invoice") return "parent";
  
  // Version based on dates for same type docs
  if (currentDoc.number && linkedDoc.number && currentDoc.type === linkedDoc.type) {
    const currentDate = new Date(currentDoc.date);
    const linkedDate = new Date(linkedDoc.date);
    if (currentDate > linkedDate) return "supersedes";
    if (currentDate < linkedDate) return "superseded-by";
  }
  
  // Related by default
  return "related";
};

// Direction icon component
const DirectionIcon = ({ linkType }: { linkType: LinkType }) => {
  const config = linkTypeConfig[linkType];
  const direction = config.direction;
  
  if (direction === "backward") {
    return <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  if (direction === "forward") {
    return <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  return null;
};

export const IntegrationDocumentLinksBlock = ({
  document,
  linkedDocuments = [],
  onNavigateToDocument,
  className,
}: IntegrationDocumentLinksBlockProps) => {
  // Group documents by link type group
  const groupedDocs = linkedDocuments.reduce<Record<LinkGroup, Array<{
    doc: FlowDocument;
    linkType: LinkType;
  }>>>((acc, linkedDoc) => {
    const linkType = determineLinkType(document, linkedDoc);
    const group = linkTypeToGroup[linkType];
    
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({ doc: linkedDoc, linkType });
    return acc;
  }, {} as Record<LinkGroup, Array<{ doc: FlowDocument; linkType: LinkType }>>);
  
  // Sort groups by order
  const sortedGroups = (Object.keys(groupedDocs) as LinkGroup[])
    .sort((a, b) => linkGroupConfig[a].order - linkGroupConfig[b].order);
  
  const totalCount = linkedDocuments.length;
  
  if (totalCount === 0) {
    return (
      <Card 
        className={cn("bg-card", className)}
        data-section="document-integration-document-links"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Пов'язані документи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Немає пов'язаних документів
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <TooltipProvider>
      <Card 
        className={cn("bg-card", className)}
        data-section="document-integration-document-links"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Пов'язані документи
            </div>
            <Badge variant="secondary" className="font-normal">
              {totalCount}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedGroups.map((group) => {
            const GroupIcon = groupIcons[group];
            const docs = groupedDocs[group];
            
            return (
              <div key={group} className="space-y-2">
                {/* Group header */}
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <GroupIcon className="h-4 w-4" />
                  {linkGroupConfig[group].labelUk}
                </div>
                
                {/* Documents in group */}
                <div className="space-y-1.5 pl-6">
                  {docs.map(({ doc, linkType }) => {
                    const typeLabel = documentTypeLabels[doc.type] || doc.type;
                    const linkConfig = linkTypeConfig[linkType];
                    
                    return (
                      <div 
                        key={doc.id}
                        className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Direction indicator */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="shrink-0">
                                <DirectionIcon linkType={linkType} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <p className="font-medium">{linkConfig.labelUk}</p>
                              <p className="text-xs text-muted-foreground">{linkConfig.description}</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Document info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium truncate">
                                {typeLabel} {doc.number && `№${doc.number}`}
                              </span>
                              <span className="text-muted-foreground shrink-0">
                                · {format(new Date(doc.date), "dd.MM.yyyy", { locale: uk })}
                              </span>
                              {doc.amount && (
                                <span className="text-muted-foreground shrink-0">
                                  · {doc.amount.toLocaleString("uk-UA")} ₴
                                </span>
                              )}
                            </div>
                            {doc.title && (
                              <p className="text-xs text-muted-foreground truncate">
                                {doc.title}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Navigate button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => onNavigateToDocument?.(doc.id)}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
