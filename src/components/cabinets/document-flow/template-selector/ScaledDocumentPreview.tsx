/**
 * ScaledDocumentPreview - Responsive A4 document preview
 * Renders a scaled-down version of the document template
 * Uses semantic tokens for proper theming
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";

interface ScaledDocumentPreviewProps {
  template: DocumentTemplate;
  scale?: number;
  className?: string;
}

export function ScaledDocumentPreview({ 
  template, 
  scale,
  className 
}: ScaledDocumentPreviewProps) {
  const isMobile = useIsMobile();
  // Adaptive scale: smaller on mobile for better fit in detail panel
  const effectiveScale = scale ?? (isMobile ? 0.28 : 0.32);
  // Group variables for display
  const cabinetVars = template.variables.filter(v => v.source === "cabinet");
  const contractorVars = template.variables.filter(v => v.source === "contractor");
  const manualVars = template.variables.filter(v => v.source === "manual");
  
  // Calculate container height based on effective scale
  const previewHeight = 297 * effectiveScale;
  
  return (
    <motion.div 
      key={template.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex justify-center", className)}
    >
      <div 
        className="overflow-hidden max-w-full"
        style={{ 
          height: `${297 * effectiveScale}mm`,
          maxHeight: "min(40vh, 350px)"
        }}
      >
        <div 
          className="bg-card shadow-lg border border-border rounded origin-top"
          style={{
            width: "210mm",
            height: "297mm",
            padding: "15mm 20mm",
            transform: `scale(${effectiveScale})`,
            transformOrigin: "top center",
          }}
        >
          {/* Document Content */}
          <div className="text-card-foreground">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-lg font-bold uppercase tracking-wide text-card-foreground">
                {template.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                № __________ від «___» __________ 20__ р.
              </p>
            </div>

            {/* Parties section */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-6 border-b border-border">
              {/* Supplier/Cabinet side */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Постачальник / Виконавець:
                </p>
                {cabinetVars.length > 0 ? (
                  <div className="space-y-1.5">
                    {cabinetVars.slice(0, 3).map((v) => (
                      <div key={v.key} className="text-[9px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded inline-block mr-1">
                        {v.label}
                      </div>
                    ))}
                    {cabinetVars.length > 3 && (
                      <p className="text-[9px] text-muted-foreground">+ ще {cabinetVars.length - 3}</p>
                    )}
                  </div>
                ) : (
                  <div className="h-3 bg-muted rounded w-4/5" />
                )}
              </div>
              
              {/* Buyer/Contractor side */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Покупець / Замовник:
                </p>
                {contractorVars.length > 0 ? (
                  <div className="space-y-1.5">
                    {contractorVars.slice(0, 3).map((v) => (
                      <div key={v.key} className="text-[9px] text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded inline-block mr-1">
                        {v.label}
                      </div>
                    ))}
                    {contractorVars.length > 3 && (
                      <p className="text-[9px] text-muted-foreground">+ ще {contractorVars.length - 3}</p>
                    )}
                  </div>
                ) : (
                  <div className="h-3 bg-muted rounded w-4/5" />
                )}
              </div>
            </div>

            {/* Content placeholder */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                Зміст документа:
              </p>
              
              {/* Table-like structure */}
              <div className="border border-border rounded">
                {/* Header row */}
                <div className="grid grid-cols-4 gap-2 p-2 bg-muted/50 border-b border-border text-[9px] font-medium text-muted-foreground">
                  <span>№</span>
                  <span className="col-span-2">Найменування</span>
                  <span className="text-right">Сума</span>
                </div>
                {/* Sample rows */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="grid grid-cols-4 gap-2 p-2 border-b border-border/50 last:border-0">
                    <span className="text-[10px] text-muted-foreground">{i}</span>
                    <div className="col-span-2 h-2.5 bg-amber-500/10 rounded" />
                    <div className="h-2.5 bg-muted rounded ml-auto w-16" />
                  </div>
                ))}
              </div>
            </div>

            {/* Manual fields indicator */}
            {manualVars.length > 0 && (
              <div className="mb-8 p-3 bg-amber-500/10 rounded border border-amber-500/20">
                <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium mb-1">
                  Поля для заповнення ({manualVars.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {manualVars.slice(0, 4).map(v => (
                    <span key={v.key} className="text-[8px] text-amber-600 dark:text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                      {v.label}
                    </span>
                  ))}
                  {manualVars.length > 4 && (
                    <span className="text-[8px] text-amber-600 dark:text-amber-500">+ ще {manualVars.length - 4}</span>
                  )}
                </div>
              </div>
            )}

            {/* Footer / Signatures */}
            <div className="mt-12 pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-muted-foreground mb-4">Постачальник / Виконавець</p>
                  <div className="h-px bg-border mb-1" />
                  <p className="text-[9px] text-muted-foreground/70">(підпис, П.І.Б.)</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-4">Покупець / Замовник</p>
                  <div className="h-px bg-border mb-1" />
                  <p className="text-[9px] text-muted-foreground/70">(підпис, П.І.Б.)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
