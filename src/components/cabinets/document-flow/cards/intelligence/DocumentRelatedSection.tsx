import React from "react";
import { Paperclip, Upload, CheckCircle2, FileQuestion, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ReferencedDocument {
  type: string;
  description: string;
  sourceClause?: string;
}

interface DocumentRelatedSectionProps {
  referencedDocuments: ReferencedDocument[];
  attachedDocumentDescriptions?: Set<string>;
  onUploadDocument?: (docType: string, description: string) => void;
  onNavigateToDocument?: (docId: string) => void;
  className?: string;
}

export const DocumentRelatedSection: React.FC<DocumentRelatedSectionProps> = ({
  referencedDocuments,
  attachedDocumentDescriptions = new Set(),
  onUploadDocument,
  onNavigateToDocument,
  className,
}) => {
  if (!referencedDocuments || referencedDocuments.length === 0) {
    return null;
  }

  // Count attached documents
  const attachedCount = referencedDocuments.filter(
    (doc) => attachedDocumentDescriptions.has(doc.description)
  ).length;
  const totalCount = referencedDocuments.length;
  const progressPercent = totalCount > 0 ? (attachedCount / totalCount) * 100 : 0;
  const allAttached = attachedCount === totalCount;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Paperclip className="w-4 h-4 text-primary" />
            Пов'язані документи
          </CardTitle>
          <div className="flex items-center gap-2">
            {allAttached ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Всі додані
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-medium">
                {attachedCount}/{totalCount}
              </span>
            )}
          </div>
        </div>
        
        {/* Progress bar */}
        {totalCount > 1 && (
          <Progress 
            value={progressPercent} 
            className={cn(
              "h-1.5 mt-2",
              allAttached && "[&>div]:bg-emerald-500"
            )}
          />
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {referencedDocuments.map((doc, index) => {
            const isAttached = attachedDocumentDescriptions.has(doc.description);
            
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg border transition-colors",
                  isAttached 
                    ? "bg-emerald-50/50 border-emerald-200" 
                    : "bg-muted/30 border-border hover:bg-muted/50"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                  isAttached ? "bg-emerald-100" : "bg-muted"
                )}>
                  {isAttached ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <FileQuestion className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isAttached ? "text-emerald-800" : "text-foreground"
                  )}>
                    {doc.description}
                  </p>
                  {doc.sourceClause && (
                    <p className="text-xs text-muted-foreground truncate">
                      Посилання: {doc.sourceClause}
                    </p>
                  )}
                </div>

                {/* Action */}
                {isAttached ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100"
                    onClick={() => onNavigateToDocument?.(doc.description)}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Відкрити
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => onUploadDocument?.(doc.type, doc.description)}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Завантажити
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Helper text */}
        {!allAttached && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Документи згадані в тексті, але ще не завантажені в систему
          </p>
        )}
      </CardContent>
    </Card>
  );
};
