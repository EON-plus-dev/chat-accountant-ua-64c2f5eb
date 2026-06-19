/**
 * TemplateQuickPreview - Scaled-down template preview for selection screen
 * Shows a miniature version of the document with zoom-to-fullscreen option
 */

import { useState } from "react";
import { ZoomIn, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";

interface TemplateQuickPreviewProps {
  template: DocumentTemplate | null;
  className?: string;
}

export function TemplateQuickPreview({ template, className }: TemplateQuickPreviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!template) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 min-h-[400px]",
        className
      )}>
        <FileText className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground text-center px-4">
          Оберіть шаблон, щоб побачити його попередній перегляд
        </p>
      </div>
    );
  }

  const IconComponent = template.icon || FileText;

  return (
    <>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Header with template info */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 rounded-t-lg">
          <div className="flex items-center gap-2 min-w-0">
            <IconComponent className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">{template.name}</span>
            {template.isPopular && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Популярний
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs shrink-0"
            onClick={() => setIsDialogOpen(true)}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Збільшити</span>
            <ZoomIn className="w-3.5 h-3.5 sm:hidden" />
          </Button>
        </div>

        {/* Scaled Preview Container */}
        <div 
          className="flex-1 relative overflow-hidden bg-muted/20 rounded-b-lg cursor-pointer group"
          onClick={() => setIsDialogOpen(true)}
        >
          {/* Document Preview (scaled) */}
          <div className="absolute inset-0 flex items-start justify-center p-4 overflow-hidden">
            <div 
              className="bg-white shadow-md border rounded-sm origin-top transition-transform group-hover:scale-[0.62]"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "15mm 20mm",
                transform: "scale(0.58)",
                transformOrigin: "top center",
              }}
            >
              {/* Document Content Preview */}
              <div className="text-black">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-base font-bold uppercase tracking-wide">
                    {template.name}
                  </h1>
                  <p className="text-xs text-gray-600 mt-1">
                    № __________ від "__" ________ 20__ р.
                  </p>
                </div>

                {/* Parties section */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700 mb-1">Постачальник:</p>
                    <div className="h-3 bg-emerald-100 rounded w-4/5 mb-1" />
                    <div className="h-2 bg-gray-100 rounded w-3/5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-700 mb-1">Покупець:</p>
                    <div className="h-3 bg-amber-100 rounded w-4/5 mb-1" />
                    <div className="h-2 bg-gray-100 rounded w-3/5" />
                  </div>
                </div>

                {/* Variables preview */}
                {template.variables && template.variables.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] font-semibold text-gray-700 mb-2">Поля шаблону:</p>
                    <div className="space-y-1.5">
                      {template.variables.slice(0, 4).map((variable, idx) => (
                        <div key={variable.key} className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-600 w-24 truncate">
                            {variable.label}:
                          </span>
                          <div 
                            className={cn(
                              "h-2.5 rounded flex-1",
                              variable.source === "cabinet" && "bg-emerald-100",
                              variable.source === "contractor" && "bg-blue-100",
                              variable.source === "manual" && "bg-amber-100"
                            )}
                          />
                        </div>
                      ))}
                      {template.variables.length > 4 && (
                        <p className="text-[9px] text-gray-400">
                          + ще {template.variables.length - 4} полів
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Table placeholder */}
                <div className="border border-gray-200 rounded mb-6">
                  <div className="grid grid-cols-5 gap-px bg-gray-200">
                    <div className="bg-gray-100 p-1 text-[8px] font-medium">№</div>
                    <div className="bg-gray-100 p-1 text-[8px] font-medium col-span-2">Назва</div>
                    <div className="bg-gray-100 p-1 text-[8px] font-medium">К-сть</div>
                    <div className="bg-gray-100 p-1 text-[8px] font-medium">Сума</div>
                  </div>
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="grid grid-cols-5 gap-px bg-gray-200">
                      <div className="bg-white p-1 text-[8px]">{row}</div>
                      <div className="bg-white p-1 col-span-2">
                        <div className="h-2 bg-gray-100 rounded w-full" />
                      </div>
                      <div className="bg-white p-1">
                        <div className="h-2 bg-gray-100 rounded w-full" />
                      </div>
                      <div className="bg-white p-1">
                        <div className="h-2 bg-gray-100 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-[9px] font-medium text-gray-600 mb-4">Постачальник:</p>
                    <div className="border-b border-gray-300 pb-1 mb-1" />
                    <p className="text-[8px] text-gray-400">М.П.</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-medium text-gray-600 mb-4">Покупець:</p>
                    <div className="border-b border-gray-300 pb-1 mb-1" />
                    <p className="text-[8px] text-gray-400">М.П.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              <span className="text-sm font-medium">Переглянути повністю</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {template.description && (
          <div className="px-3 py-2 bg-muted/30 border-t text-xs text-muted-foreground rounded-b-lg">
            {template.description}
          </div>
        )}
      </div>

      {/* Fullscreen Dialog */}
      <TemplatePreviewDialog
        template={template}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
