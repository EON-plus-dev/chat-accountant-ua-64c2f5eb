/**
 * TemplatePreviewStep - Preview step before saving template
 * Toggle between template view (with placeholders) and document view (with values)
 */

import { useState, useMemo } from "react";
import { FileText, File } from "lucide-react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import type { UnifiedTemplateField } from "@/types/templateField";

interface TemplatePreviewStepProps {
  fields: UnifiedTemplateField[];
  documentText: string;
  testValues: Record<string, string>;
}

export const TemplatePreviewStep = ({
  fields,
  documentText,
  testValues,
}: TemplatePreviewStepProps) => {
  const [viewType, setViewType] = useState<"template" | "document">("document");

  // Render template with placeholders [1. Назва поля]
  const templateView = useMemo(() => {
    let text = documentText;
    
    // Sort fields by index (reverse) for consistent replacement
    const sortedFields = [...fields].reverse();

    sortedFields.forEach((field, index) => {
      const placeholder = `[${fields.length - index}. ${field.label}]`;
      const originalText = `[${field.originalText || field.label}]`;
      text = text.split(originalText).join(placeholder);
    });

    return text;
  }, [documentText, fields]);

  // Render document with filled values
  const documentViewHtml = useMemo(() => {
    let text = documentText;
    
    const sortedFields = [...fields].reverse();

    sortedFields.forEach((field, index) => {
      const value = testValues[field.key] || `[${fields.length - index}. ${field.label}]`;
      const originalText = `[${field.originalText || field.label}]`;
      text = text.split(originalText).join(value);
    });

    return text;
  }, [documentText, fields, testValues]);

  const displayHtml = viewType === "template" ? templateView : documentViewHtml;
  const sanitizedHtml = DOMPurify.sanitize(displayHtml);

  return (
    <div className="flex flex-col h-full">

      {/* View type toggle */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-full border border-border/50">
          <button
            onClick={() => setViewType("template")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all",
              viewType === "template"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="w-4 h-4" />
            Шаблон
          </button>
          <button
            onClick={() => setViewType("document")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all",
              viewType === "document"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <File className="w-4 h-4" />
            Документ
          </button>
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-muted/10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-lg border border-border/70 shadow-sm overflow-hidden">
            {/* Document header indicator */}
            <div className="px-4 py-2 bg-muted/30 border-b border-border/50 flex items-center gap-2">
              {viewType === "template" ? (
                <>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Шаблон з плейсхолдерами
                  </span>
                </>
              ) : (
                <>
                  <File className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Документ з тестовими даними
                  </span>
                </>
              )}
            </div>
            
            {/* Document content - rendered as HTML */}
            <div className="p-6">
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};