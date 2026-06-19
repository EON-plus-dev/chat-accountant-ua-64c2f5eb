/**
 * TemplateViewerTab - Main tab component for viewing/editing templates
 * Implements View/Edit mode with multi-step editing flow (editor → test → preview → save)
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { TemplateViewerToolbar } from "../viewer/TemplateViewerToolbar";
import { FieldSchemaShelf } from "../viewer/FieldSchemaShelf";
import { TemplatePreviewArea } from "../TemplatePreviewArea";
import { RichTextEditor } from "../RichTextEditor";
import { EditorFieldsStrip } from "../editor/EditorFieldsStrip";
import { FieldEditSheet } from "../editor/FieldEditSheet";
import { FieldCreateSheet } from "../editor/FieldCreateSheet";
import { TemplateTestStep } from "../steps/TemplateTestStep";
import { TemplatePreviewStep } from "../steps/TemplatePreviewStep";
import { TemplateSaveStep } from "../steps/TemplateSaveStep";
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import { toast } from "@/hooks/use-toast";
import type { UnifiedTemplateField } from "@/types/templateField";
import type { FieldGroup } from "@/config/documentFormSchemas";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";
import type { Cabinet } from "@/types/cabinet";
import type { AIHighlightItem } from "../extensions/AIHighlightPlugin";

// Edit step type for multi-step editing flow
type EditStep = "editor" | "test" | "preview" | "save";

// Step labels for forward navigation
const STEP_LABELS: Record<EditStep, string> = {
  editor: "Тестувати",
  test: "Перегляд",
  preview: "Зберегти",
  save: "Готово",
};

// Step labels for back navigation
const BACK_LABELS: Record<EditStep, string> = {
  editor: "",
  test: "Редактор",
  preview: "Тестування",
  save: "Перегляд",
};

interface TemplateViewerTabProps {
  template: DocumentTemplate;
  fields: UnifiedTemplateField[];
  documentText: string;
  cabinet: Cabinet;
  
  // View/Edit mode
  mode: "view" | "edit";
  onModeChange: (mode: "view" | "edit") => void;
  canEdit: boolean;
  
  // Field changes (in edit mode)
  onFieldsChange?: (fields: UnifiedTemplateField[]) => void;
  onDocumentTextChange?: (text: string) => void;
  
  // Sync with schema view
  highlightedFieldKey?: string | null;
  onFieldClick?: (fieldKey: string) => void;
  onHighlightComplete?: () => void;
  
  // Unsaved changes tracking
  hasUnsavedChanges?: boolean;
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
  
  // Save/Cancel
  onSave?: () => void;
  onCancel?: () => void;
  
  // Draft version
  draftVersion?: number;
  
  className?: string;
}

import { resolveFieldValue } from "@/config/partyAttributesLibrary";

/**
 * Get auto-fill value from cabinet using unified resolveFieldValue
 */
const getCabinetAutoFillValue = (cabinet: Cabinet, sourceKey?: string): string => {
  if (!sourceKey) return "";
  
  // Use unified resolveFieldValue
  const result = resolveFieldValue(sourceKey, { 
    cabinet: {
      name: cabinet.name,
      edrpou: cabinet.taxId,
      taxId: cabinet.taxId,
    } 
  });
  
  return result !== undefined ? String(result) : "";
};

export const TemplateViewerTab = ({
  template,
  fields,
  documentText,
  cabinet,
  mode,
  onModeChange,
  canEdit,
  onFieldsChange,
  onDocumentTextChange,
  highlightedFieldKey,
  onFieldClick,
  onHighlightComplete,
  hasUnsavedChanges = false,
  onUnsavedChangesChange,
  onSave,
  onCancel,
  draftVersion = 1,
  className,
}: TemplateViewerTabProps) => {
  // Refs
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  
  // Local state
  const [isShelfExpanded, setIsShelfExpanded] = useState(true);
  const [localHighlightedKey, setLocalHighlightedKey] = useState<string | null>(null);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | undefined>(undefined);
  
  // Editor bidirectional sync state
  const [editorHighlightedKey, setEditorHighlightedKey] = useState<string | null>(null);
  
  // Multi-step editing state
  const [editStep, setEditStep] = useState<EditStep>("editor");
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const [templateName, setTemplateName] = useState(template.name);
  const [templateDescription, setTemplateDescription] = useState(template.description || "");
  const [isSaving, setIsSaving] = useState(false);
  
  // Field edit sheet state
  const [editingField, setEditingField] = useState<UnifiedTemplateField | null>(null);
  const [showFieldEditSheet, setShowFieldEditSheet] = useState(false);
  
  // Field create sheet state
  const [showFieldCreateSheet, setShowFieldCreateSheet] = useState(false);
  const [createFieldSelection, setCreateFieldSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultCount, setSearchResultCount] = useState(0);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  
  // Zoom state
  const [zoom, setZoom] = useState(100);
  
  // Original fields for reset functionality
  const [originalFields, setOriginalFields] = useState<UnifiedTemplateField[]>(fields);
  const [originalText, setOriginalText] = useState(documentText);
  
  // Use local or external highlighted key
  const effectiveHighlightedKey = highlightedFieldKey ?? localHighlightedKey;
  
  // Calculate field stats for toolbar (View mode)
  const fieldStats = useMemo(() => {
    const autoSources = ["cabinet", "contractor", "computed"];
    return {
      total: fields.length,
      auto: fields.filter(f => autoSources.includes(f.source)).length,
      manual: fields.filter(f => f.source === "manual").length,
    };
  }, [fields]);
  
  // Convert fields to AI highlights for RichTextEditor bidirectional sync
  const fieldHighlights = useMemo((): AIHighlightItem[] => {
    return fields.map(field => ({
      id: field.key,
      textRef: field.originalText || `[${field.label}]`,
      // Map source to highlight status for color coding
      status: field.source === "manual" ? "needs_review" 
            : field.source === "computed" ? "accepted"
            : "approved", // cabinet, contractor
    }));
  }, [fields]);
  
  // Store original values when entering edit mode
  useEffect(() => {
    if (mode === "edit" && editStep === "editor") {
      setOriginalFields([...fields]);
      setOriginalText(documentText);
    }
  }, [mode]);
  
  // Initialize test values with cabinet auto-fill
  const initializeTestValues = useCallback(() => {
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.source === "cabinet" || field.source === "contractor") {
        const autoValue = getCabinetAutoFillValue(cabinet, field.sourceKey);
        if (autoValue) {
          initial[field.key] = autoValue;
        }
      }
    });
    setTestValues(initial);
  }, [fields, cabinet]);
  
  // Handle field click - navigate to field in editor
  const handleFieldClick = useCallback((fieldKey: string) => {
    setLocalHighlightedKey(fieldKey);
    onFieldClick?.(fieldKey);
    // Clear highlight after animation
    setTimeout(() => {
      setLocalHighlightedKey(null);
      onHighlightComplete?.();
    }, 1500);
  }, [onFieldClick, onHighlightComplete]);
  
  // Handle group click - scroll to group in preview area
  const handleGroupClick = useCallback((group: FieldGroup, index: number) => {
    setActiveGroupIndex(index);
    // Find first field in this group and highlight it
    const groupField = fields.find(f => f.group === group);
    if (groupField) {
      handleFieldClick(groupField.key);
    }
    // Clear active after animation
    setTimeout(() => {
      setActiveGroupIndex(undefined);
    }, 2000);
  }, [fields, handleFieldClick]);
  
  // Handle editor field card click - scroll to field in RichTextEditor
  const handleEditorFieldClick = useCallback((fieldKey: string) => {
    setEditorHighlightedKey(fieldKey);
    
    // Scroll to highlighted text in editor
    if (editorWrapperRef.current) {
      const highlightEl = editorWrapperRef.current.querySelector(
        `[data-card-id="${fieldKey}"]`
      );
      if (highlightEl) {
        highlightEl.scrollIntoView({ behavior: "smooth", block: "center" });
        highlightEl.classList.add("highlight-pulse");
        setTimeout(() => highlightEl.classList.remove("highlight-pulse"), 1500);
      }
    }
    
    // Clear highlight after animation
    setTimeout(() => setEditorHighlightedKey(null), 2000);
  }, []);
  
  // Handle text field click in editor - scroll to card in strip
  const handleTextFieldClick = useCallback((cardId: string) => {
    setEditorHighlightedKey(cardId);
    
    // Strip auto-scrolls to highlighted card via effect in EditorFieldsStrip
    // Clear highlight after animation
    setTimeout(() => setEditorHighlightedKey(null), 2000);
  }, []);
  
  // Handle field hover in strip
  const handleEditorFieldHover = useCallback((fieldKey: string | null) => {
    // Optional: subtle hover highlighting
  }, []);
  
  // Handle create field from text selection in editor (Edit mode) - opens creation dialog
  const handleCreateFieldFromEditorSelection = useCallback((
    selection: { text: string; x: number; y: number }
  ) => {
    setCreateFieldSelection(selection);
    setShowFieldCreateSheet(true);
  }, []);

  // Handle field creation from dialog
  const handleFieldCreate = useCallback((newField: UnifiedTemplateField, placement?: "replace" | "before" | "after") => {
    // Set correct order
    const fieldWithOrder = {
      ...newField,
      order: fields.length + 1,
    };

    // For before/after placement, keep originalText as-is but adjust how the placeholder is inserted
    if (placement === "before" || placement === "after") {
      // Don't replace the original text — clear originalText so it won't be substituted
      fieldWithOrder.originalText = undefined;
    }
    
    onFieldsChange?.([...fields, fieldWithOrder]);
    onUnsavedChangesChange?.(true);
    
    toast({
      title: "Поле створено",
      description: `Додано поле "${newField.label}"`,
    });
    
    // Highlight the new field briefly
    setEditorHighlightedKey(newField.key);
    setTimeout(() => setEditorHighlightedKey(null), 2000);
    
    // Clear selection
    setCreateFieldSelection(null);
  }, [fields, onFieldsChange, onUnsavedChangesChange]);

  // Handle find similar from editor selection
  const handleFindSimilarFromEditor = useCallback((text: string) => {
    setSearchQuery(text);
    toast({
      title: "Пошук",
      description: `Шукаємо "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`,
    });
  }, []);

  // Handle field edit - open edit sheet
  const handleFieldEdit = useCallback((field: UnifiedTemplateField) => {
    setEditingField(field);
    setShowFieldEditSheet(true);
  }, []);

  // Handle field save from edit sheet
  const handleFieldSave = useCallback((updatedField: UnifiedTemplateField) => {
    const updatedFields = fields.map(f => 
      f.key === updatedField.key ? updatedField : f
    );
    onFieldsChange?.(updatedFields);
    onUnsavedChangesChange?.(true);
    toast({
      title: "Поле оновлено",
      description: `"${updatedField.label}" збережено`,
    });
  }, [fields, onFieldsChange, onUnsavedChangesChange]);

  // Handle field delete with confirmation
  const handleFieldDelete = useCallback((fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey);
    if (!field) return;

    // Simple confirm dialog
    if (window.confirm(`Видалити поле "${field.label}"?`)) {
      const updatedFields = fields.filter(f => f.key !== fieldKey);
      onFieldsChange?.(updatedFields);
      onUnsavedChangesChange?.(true);
      toast({
        title: "Поле видалено",
        description: `"${field.label}" видалено з шаблону`,
      });
    }
  }, [fields, onFieldsChange, onUnsavedChangesChange]);

  // Handle create field from text selection (View mode)
  const handleCreateFieldFromSelection = useCallback((text: string) => {
    // Switch to edit mode
    onModeChange("edit");
    toast({
      title: "Режим редагування",
      description: `Виділіть текст "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}" в редакторі для створення поля`,
    });
  }, [onModeChange]);

  // Handle find similar from text selection
  const handleFindSimilar = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);
  
  // Convert HTML to plain text for test step
  const plainTextForTest = useMemo(() => {
    if (!documentText) return "";
    // Check if it's already plain text (no HTML tags)
    if (!documentText.includes("<")) return documentText;
    // Strip HTML tags for test preview
    const div = document.createElement("div");
    div.innerHTML = documentText;
    return div.textContent || div.innerText || "";
  }, [documentText]);
  
  // Handle mode change with unsaved changes check
  const handleModeChange = useCallback((newMode: "view" | "edit") => {
    if (newMode === "edit" && canEdit) {
      setEditStep("editor");
      onModeChange("edit");
    } else if (mode === "edit" && hasUnsavedChanges) {
      setUnsavedDialogOpen(true);
    } else {
      setEditStep("editor");
      setSearchQuery("");
      onModeChange("view");
    }
  }, [canEdit, mode, hasUnsavedChanges, onModeChange]);
  
  // Handle step navigation
  const handleStepClick = useCallback((step: EditStep) => {
    setEditStep(step);
  }, []);
  
  // Handle next step
  const handleNextStep = useCallback(() => {
    switch (editStep) {
      case "editor":
        initializeTestValues();
        setEditStep("test");
        break;
      case "test":
        setEditStep("preview");
        break;
      case "preview":
        setEditStep("save");
        break;
      case "save":
        // Final save handled by handleFinalSave
        break;
    }
  }, [editStep, initializeTestValues]);
  
  // Handle previous step
  const handlePrevStep = useCallback(() => {
    switch (editStep) {
      case "test":
        setEditStep("editor");
        break;
      case "preview":
        setEditStep("test");
        break;
      case "save":
        setEditStep("preview");
        break;
    }
  }, [editStep, initializeTestValues]);
  
  // Handle final save
  const handleFinalSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save logic
      onSave?.();
      onModeChange("view");
      onUnsavedChangesChange?.(false);
      setEditStep("editor");
      setSearchQuery("");
      toast({
        title: "Збережено",
        description: `Шаблон "${templateName}" успішно збережено`,
      });
    } finally {
      setIsSaving(false);
    }
  }, [onSave, onModeChange, onUnsavedChangesChange, templateName]);
  
  // Handle discard changes
  const handleDiscardChanges = useCallback(() => {
    onCancel?.();
    onModeChange("view");
    onUnsavedChangesChange?.(false);
    setUnsavedDialogOpen(false);
    setEditStep("editor");
    setSearchQuery("");
  }, [onCancel, onModeChange, onUnsavedChangesChange]);
  
  // Handle reset changes
  const handleReset = useCallback(() => {
    // Restore original fields
    onFieldsChange?.(originalFields);
    onDocumentTextChange?.(originalText);
    onUnsavedChangesChange?.(false);
    toast({
      title: "Скинуто",
      description: "Всі зміни скасовано",
    });
  }, [originalFields, originalText, onFieldsChange, onDocumentTextChange, onUnsavedChangesChange]);
  
  // Handle editor HTML changes (RichTextEditor)
  const handleEditorHtmlChange = useCallback((html: string) => {
    onDocumentTextChange?.(html);
    onUnsavedChangesChange?.(true);
  }, [onDocumentTextChange, onUnsavedChangesChange]);
  
  // Search navigation
  const handleSearchPrev = useCallback(() => {
    setCurrentSearchIndex(prev => 
      prev <= 0 ? searchResultCount - 1 : prev - 1
    );
  }, [searchResultCount]);
  
  const handleSearchNext = useCallback(() => {
    setCurrentSearchIndex(prev => 
      prev >= searchResultCount - 1 ? 0 : prev + 1
    );
  }, [searchResultCount]);
  
  // Reset search index when query changes
  useEffect(() => {
    setCurrentSearchIndex(0);
  }, [searchQuery]);
  
  return (
    <div className={cn("flex flex-col h-full min-w-0 overflow-x-hidden", className)}>
      {/* VIEW MODE */}
      {mode === "view" && (
        <>
          <TemplateViewerToolbar
            mode="view"
            onModeChange={handleModeChange}
            canEdit={canEdit}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResultCount={searchResultCount}
            currentSearchIndex={currentSearchIndex}
            onSearchPrev={handleSearchPrev}
            onSearchNext={handleSearchNext}
            zoom={zoom}
            onZoomChange={setZoom}
            fieldStats={fieldStats}
          />
          
          {/* Preview Area - directly without FieldSchemaShelf */}
          <TemplatePreviewArea
            documentText={documentText}
            fields={fields}
            onFieldClick={handleFieldClick}
            highlightedFieldKey={effectiveHighlightedKey}
            zoom={zoom}
            searchQuery={searchQuery}
            onSearchResultsChange={setSearchResultCount}
            currentSearchIndex={currentSearchIndex}
            onCreateField={handleCreateFieldFromSelection}
            onFindSimilar={handleFindSimilar}
          />
        </>
      )}
      
      {/* EDIT MODE - Multi-step flow */}
      {mode === "edit" && (
        <>
          {/* Step 1: Editor */}
          {editStep === "editor" && (
            <>
              <TemplateViewerToolbar
                mode="edit"
                onModeChange={handleModeChange}
                canEdit={canEdit}
                onReset={handleReset}
                hasUnsavedChanges={hasUnsavedChanges}
                onNext={handleNextStep}
                nextLabel={STEP_LABELS[editStep]}
                draftVersion={draftVersion}
              />
              
              {/* Field cards strip with bidirectional sync and edit/delete */}
              <EditorFieldsStrip
                fields={fields}
                highlightedFieldKey={editorHighlightedKey}
                onFieldClick={handleEditorFieldClick}
                onFieldHover={handleEditorFieldHover}
                onFieldEdit={handleFieldEdit}
                onFieldDelete={handleFieldDelete}
              />
              
              <div className="flex-1 min-h-0 flex flex-col" ref={editorWrapperRef}>
                <RichTextEditor
                  content={documentText}
                  onChange={handleEditorHtmlChange}
                  aiHighlights={fieldHighlights}
                  activeHighlightId={editorHighlightedKey}
                  onHighlightClick={handleTextFieldClick}
                  onCreateFieldFromSelection={handleCreateFieldFromEditorSelection}
                  onFindSimilar={handleFindSimilarFromEditor}
                  className="flex-1"
                />
              </div>
            </>
          )}
          
          {/* Step 2: Test */}
          {editStep === "test" && (
            <>
              <TemplateViewerToolbar
                mode="edit"
                onModeChange={handleModeChange}
                canEdit={canEdit}
                onBack={handlePrevStep}
                backLabel={BACK_LABELS[editStep]}
                showBack={true}
                onNext={handleNextStep}
                nextLabel={STEP_LABELS[editStep]}
                draftVersion={draftVersion}
              />
              <TemplateTestStep
                fields={fields}
                documentText={plainTextForTest}
                cabinet={cabinet}
                testValues={testValues}
                onTestValuesChange={setTestValues}
                template={template}
                documentType={template?.type}
              />
            </>
          )}
          
          {/* Step 3: Preview */}
          {editStep === "preview" && (
            <>
              <TemplateViewerToolbar
                mode="edit"
                onModeChange={handleModeChange}
                canEdit={canEdit}
                onBack={handlePrevStep}
                backLabel={BACK_LABELS[editStep]}
                showBack={true}
                onNext={handleNextStep}
                nextLabel={STEP_LABELS[editStep]}
                draftVersion={draftVersion}
              />
              <TemplatePreviewStep
                fields={fields}
                documentText={documentText}
                testValues={testValues}
              />
            </>
          )}
          
          {/* Step 4: Save */}
          {editStep === "save" && (
            <>
              <TemplateViewerToolbar
                mode="edit"
                onModeChange={handleModeChange}
                canEdit={canEdit}
                onBack={handlePrevStep}
                backLabel={BACK_LABELS[editStep]}
                showBack={true}
                onNext={handleFinalSave}
                nextLabel={STEP_LABELS[editStep]}
                draftVersion={draftVersion}
              />
              <TemplateSaveStep
                fields={fields}
                templateName={templateName}
                templateDescription={templateDescription}
                onNameChange={setTemplateName}
                onDescriptionChange={setTemplateDescription}
                isSaving={isSaving}
              />
            </>
          )}
        </>
      )}
      
      {/* Unsaved changes dialog */}
      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onOpenChange={setUnsavedDialogOpen}
        onSave={handleFinalSave}
        onDiscard={handleDiscardChanges}
        onCancel={() => setUnsavedDialogOpen(false)}
        hasChanges={hasUnsavedChanges}
      />
      
      {/* Field edit sheet */}
      <FieldEditSheet
        open={showFieldEditSheet}
        onOpenChange={setShowFieldEditSheet}
        field={editingField}
        onSave={handleFieldSave}
      />
      
      {/* Field create sheet */}
      <FieldCreateSheet
        open={showFieldCreateSheet}
        onOpenChange={setShowFieldCreateSheet}
        selectedText={createFieldSelection?.text || ""}
        onSave={handleFieldCreate}
      />
    </div>
  );
};
