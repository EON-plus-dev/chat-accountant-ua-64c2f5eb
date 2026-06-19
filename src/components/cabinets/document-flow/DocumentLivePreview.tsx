import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "@/config/settingsConfig";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import type { DocumentType } from "@/config/documentFlowConfig";
import {
  type DocumentPosition,
  type GeneratedDocumentData,
  generateDocumentFromForm,
} from "@/config/documentTemplateGenerator";
import { InlineFieldEditor } from "./InlineFieldEditor";

interface DocumentLivePreviewProps {
  documentType: DocumentType;
  template: DocumentTemplate | null;
  formValues: Record<string, string | number | boolean>;
  positions: DocumentPosition[];
  cabinet: Cabinet;
  contractor: Contractor | null;
  highlightedFieldId: string | null;
  onFieldClick?: (fieldId: string) => void;
  /** Fields that can be edited inline (e.g., paymentPurpose, notes) */
  editableFields?: string[];
  /** Callback when an inline field is edited */
  onInlineEdit?: (fieldKey: string, value: string) => void;
  className?: string;
  showZoomControls?: boolean;
}

export function DocumentLivePreview({
  documentType,
  template,
  formValues,
  positions,
  cabinet,
  contractor,
  highlightedFieldId,
  onFieldClick,
  editableFields = [],
  onInlineEdit,
  className,
  showZoomControls = true,
}: DocumentLivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFieldRect, setEditingFieldRect] = useState<DOMRect | null>(null);

  // Generate document HTML with field status
  const documentData: GeneratedDocumentData = useMemo(() => {
    return generateDocumentFromForm(
      documentType,
      template,
      formValues,
      positions,
      cabinet,
      contractor
    );
  }, [documentType, template, formValues, positions, cabinet, contractor]);

  // Inject click handlers into HTML
  const processedHtml = useMemo(() => {
    if (!documentData.html) return "";

    // Add field click data attributes
    let html = documentData.html;

    // Add click handlers via data attributes
    documentData.fields.forEach((field) => {
      const htmlId = field.htmlId;
      if (htmlId && html.includes(`id="${htmlId}"`)) {
        html = html.replace(
          `id="${htmlId}"`,
          `id="${htmlId}" data-field-key="${field.key}" data-clickable="true"`
        );
      }
    });

    // Ensure all elements with data-field-key also have data-clickable
    // This catches static elements like positions-table, field-total
    html = html.replace(
      /data-field-key="([^"]+)"(?![^>]*data-clickable)/g,
      (match, key) => `data-field-key="${key}" data-clickable="true"`
    );

    return html;
  }, [documentData]);

  // Handle click on field in preview
  const handlePreviewClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const fieldElement = target.closest("[data-field-key]") as HTMLElement;
      
      if (fieldElement) {
        const fieldKey = fieldElement.getAttribute("data-field-key");
        if (!fieldKey) return;

        // Check if field is editable inline
        if (editableFields.includes(fieldKey) && onInlineEdit) {
          e.stopPropagation();
          e.preventDefault();
          
          // Get position for inline editor
          const rect = fieldElement.getBoundingClientRect();
          setEditingFieldRect(rect);
          setEditingFieldId(fieldKey);
        } else if (onFieldClick) {
          // Scroll to Anchor Card for non-editable fields
          onFieldClick(fieldKey);
        }
      }
    },
    [editableFields, onInlineEdit, onFieldClick]
  );

  // Handle inline edit save
  const handleInlineEditSave = useCallback(
    (value: string) => {
      if (editingFieldId && onInlineEdit) {
        onInlineEdit(editingFieldId, value);
      }
      setEditingFieldId(null);
      setEditingFieldRect(null);
    },
    [editingFieldId, onInlineEdit]
  );

  // Handle inline edit cancel
  const handleInlineEditCancel = useCallback(() => {
    setEditingFieldId(null);
    setEditingFieldRect(null);
  }, []);

  // Get label for field
  const getFieldLabel = useCallback((fieldKey: string): string => {
    const labels: Record<string, string> = {
      paymentPurpose: "Призначення платежу",
      notes: "Примітки",
      additionalTerms: "Додаткові умови",
      paymentTerms: "Умови оплати",
    };
    return labels[fieldKey] || fieldKey;
  }, []);

  // Scroll to highlighted field
  useEffect(() => {
    if (highlightedFieldId && containerRef.current) {
      const fieldElement = containerRef.current.querySelector(
        `[data-field-key="${highlightedFieldId}"], #field-${highlightedFieldId}`
      ) as HTMLElement;
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
        fieldElement.classList.add("highlight-pulse");
        setTimeout(() => fieldElement.classList.remove("highlight-pulse"), 2000);
      }
    }
  }, [highlightedFieldId]);

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 150));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      {showZoomControls && (
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {documentData.readinessPercent}% готовий
            </Badge>
            {documentData.missingFields.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Не заповнено: {documentData.missingFields.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-10 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleZoomIn}
              disabled={zoom >= 150}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleZoomReset}
              disabled={zoom === 100}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Document Preview */}
      <div
        ref={containerRef}
        data-document-preview-scroll
        className="flex-1 overflow-auto p-4 bg-muted/20 relative"
        onClick={handlePreviewClick}
      >
        <div
          className="document-html-preview mx-auto transition-transform"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            maxWidth: "210mm",
            minHeight: "297mm",
            padding: "20mm",
          }}
          dangerouslySetInnerHTML={{ __html: processedHtml }}
        />

        {/* Inline Field Editor Overlay */}
        {editingFieldId && editingFieldRect && containerRef.current && (
          <div
            className="fixed z-50"
            style={{
              top: editingFieldRect.top,
              left: Math.min(editingFieldRect.left, window.innerWidth - 420),
            }}
          >
            <InlineFieldEditor
              fieldKey={editingFieldId}
              initialValue={String(formValues[editingFieldId] || "")}
              onSave={handleInlineEditSave}
              onCancel={handleInlineEditCancel}
              label={getFieldLabel(editingFieldId)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
