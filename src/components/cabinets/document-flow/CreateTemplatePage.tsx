import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ArrowLeft, Upload, TestTube, Save, Sparkles, ChevronRight, Info, FileText, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Cabinet } from "@/types/cabinet";
import { TemplateStepIndicator } from "./TemplateStepIndicator";
import { type TemplateField } from "./TemplateTextEditor";
import { TemplateTestStep } from "./steps/TemplateTestStep";
import { RichTextEditor } from "./RichTextEditor";
import { EditorFieldsStrip } from "./editor/EditorFieldsStrip";
import { FieldCreateSheet } from "./editor/FieldCreateSheet";
import { FieldEditSheet } from "./editor/FieldEditSheet";
import type { AIHighlightItem } from "./extensions/AIHighlightPlugin";
import { demoDocumentTexts, type FieldDataType } from "@/config/documentTemplatesConfig";
import type { UnifiedTemplateField } from "@/types/templateField";
import { mapDataTypeToFieldType, inferGroupFromKey } from "@/types/templateField";

// Validation function based on dataType
const validateFieldValue = (value: string, dataType: FieldDataType): { isValid: boolean; error?: string } => {
  const trimmed = value.trim();
  if (!trimmed) return { isValid: false, error: "Поле обов'язкове" };
  
  switch (dataType) {
    case "edrpou":
      if (!/^\d{8}$/.test(trimmed)) {
        return { isValid: false, error: "ЄДРПОУ має містити 8 цифр" };
      }
      break;
    case "ipn":
      if (!/^\d{10}$/.test(trimmed)) {
        return { isValid: false, error: "ІПН має містити 10 цифр" };
      }
      break;
    case "iban":
      if (!/^UA\d{27}$/i.test(trimmed.replace(/\s/g, ""))) {
        return { isValid: false, error: "IBAN: UA + 27 цифр" };
      }
      break;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return { isValid: false, error: "Невірний формат email" };
      }
      break;
    case "phone":
      if (!/^(\+?\d[\d\s\-()]{9,})$/.test(trimmed)) {
        return { isValid: false, error: "Невірний формат телефону" };
      }
      break;
    case "number":
    case "currency":
      if (!/^[\d\s,.\-]+$/.test(trimmed)) {
        return { isValid: false, error: "Має бути числом" };
      }
      break;
    case "date":
      if (!/\d{1,4}[\.\-\/]\d{1,2}[\.\-\/]\d{1,4}/.test(trimmed) &&
          !/\d{1,2}\s*(січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)/i.test(trimmed)) {
        return { isValid: false, error: "Невірний формат дати" };
      }
      break;
  }
  
  return { isValid: true };
};

export type TemplateWizardStep = "upload" | "editor" | "test" | "preview" | "save";

// Text selection interface for field creation
interface TextSelection {
  text: string;
  x: number;
  y: number;
}

interface CreateTemplatePageProps {
  cabinet: Cabinet;
  onBack?: () => void;
  onChatMessage?: (message: string) => void;
  onTestModeChange?: (enabled: boolean, fields: TemplateField[]) => void;
  externalFieldUpdate?: { key: string; value: string } | null;
  onEditFieldRequest?: (fieldKey: string) => void;
}

export const CreateTemplatePage = ({
  cabinet,
  onBack,
  onChatMessage,
  onTestModeChange,
  externalFieldUpdate,
  onEditFieldRequest,
}: CreateTemplatePageProps) => {
  const [currentStep, setCurrentStep] = useState<TemplateWizardStep>("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentText, setDocumentText] = useState("");
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [testValues, setTestValues] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<"template" | "document">("document");
  const [highlightedFieldKey, setHighlightedFieldKey] = useState<string | null>(null);
  
  // New state for field creation/editing sheets
  const [showFieldCreateSheet, setShowFieldCreateSheet] = useState(false);
  const [showFieldEditSheet, setShowFieldEditSheet] = useState(false);
  const [createFieldSelection, setCreateFieldSelection] = useState<TextSelection | null>(null);
  const [editingField, setEditingField] = useState<UnifiedTemplateField | null>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  // Handle external field updates from chat
  useEffect(() => {
    if (externalFieldUpdate && currentStep === "test") {
      setTestValues((prev) => ({
        ...prev,
        [externalFieldUpdate.key]: externalFieldUpdate.value,
      }));
    }
  }, [externalFieldUpdate, currentStep]);

  // Notify chat when entering test mode - only send manual fields
  useEffect(() => {
    if (currentStep === "test" && onTestModeChange) {
      // Filter to only manual and contractor fields (cabinet fields are auto-filled)
      const fieldsForChat = fields.filter(f => f.source !== "cabinet");
      onTestModeChange(true, fieldsForChat);
    } else if (currentStep !== "test" && onTestModeChange) {
      onTestModeChange(false, []);
    }
  }, [currentStep, fields, onTestModeChange]);

  const isMobile = useIsMobile();

  const handleDemoClick = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const demoDoc = demoDocumentTexts[0];
      setDocumentText(demoDoc.text);
      setFields(demoDoc.detectedFields);
      setTemplateName(demoDoc.suggestedName);
      setIsAnalyzing(false);
      setCurrentStep("editor");
      
      // On mobile: show toast instead of chat message to avoid switching to chat mode
      if (isMobile) {
        toast({
          title: "Документ розпізнано!",
          description: `Знайдено ${demoDoc.detectedFields.length} полів для автозаповнення`,
        });
      } else {
        onChatMessage?.("Документ розпізнано! Знайдено 8 полів для автозаповнення. Відредагуйте поля в редакторі праворуч.");
      }
    }, 1500);
  };

  const handleFileUpload = () => {
    // Demo: same as demo click
    handleDemoClick();
  };

  const handleFieldsChange = (updatedFields: TemplateField[]) => {
    setFields(updatedFields);
  };

  const handleStartTest = () => {
    // Initialize test values with defaults
    const initialValues: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.source === "cabinet") {
        // Auto-fill from cabinet
        if (field.key === "company_name") initialValues[field.key] = cabinet.name;
        if (field.key === "company_code") initialValues[field.key] = cabinet.taxId || "";
      }
    });
    setTestValues(initialValues);
    setCurrentStep("test");
    
    onChatMessage?.("Режим тестування активовано! Я буду питати вас про кожне поле. Почнемо з назви компанії-контрагента.");
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Введіть назву",
        description: "Назва шаблону є обов'язковою",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Шаблон збережено!",
      description: `"${templateName}" додано до ваших шаблонів`,
    });

    onBack?.();
  };

  // Handle field edit from preview or panel (test step)
  const handleFieldEdit = useCallback((fieldKey: string, value: string) => {
    setTestValues((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  }, []);

  // Request chat to edit a field
  const handleRequestEditViaChat = useCallback((fieldKey: string) => {
    onEditFieldRequest?.(fieldKey);
  }, [onEditFieldRequest]);

  const getPreviewText = () => {
    let preview = documentText;
    fields.forEach((field) => {
      const value = testValues[field.key] || `[${field.label}]`;
      const regex = new RegExp(`\\[${field.originalText || field.label}\\]`, "g");
      preview = preview.replace(regex, value);
    });
    return preview;
  };

  // Render clean document (no markers, only filled values)
  const renderCleanDocument = () => {
    let result = documentText;
    fields.forEach((field) => {
      const value = testValues[field.key] || field.label;
      const placeholder = `[${field.originalText || field.label}]`;
      result = result.split(placeholder).join(value);
    });
    return result;
  };

  // Render template preview (with numbered placeholders)
  const renderTemplatePreview = () => {
    let result = documentText;
    const nonCabinetFields = fields.filter(f => f.source !== "cabinet");
    nonCabinetFields.forEach((field, index) => {
      const placeholder = `[${field.originalText || field.label}]`;
      const numberedPlaceholder = `[${index + 1}. ${field.label}]`;
      result = result.split(placeholder).join(numberedPlaceholder);
    });
    return result;
  };

  // Convert TemplateField to UnifiedTemplateField for EditorFieldsStrip
  const unifiedFields: UnifiedTemplateField[] = useMemo(() => 
    fields.map((f, idx) => {
      const source = f.source === "cabinet" ? "cabinet" as const : 
                    f.source === "contractor" ? "contractor" as const : "manual" as const;
      return {
        key: f.key,
        label: f.label,
        source,
        sourceKey: f.sourceKey,
        dataType: f.dataType,
        fieldType: mapDataTypeToFieldType(f.dataType),
        group: inferGroupFromKey(f.key),
        aiHint: f.aiHint,
        required: f.required ?? false,
        order: idx,
        position: f.position,
        originalText: f.originalText,
      };
    }),
    [fields]
  );

  // Convert fields to AIHighlightItem for RichTextEditor
  const fieldHighlights: AIHighlightItem[] = useMemo(() => 
    fields.map((f) => ({
      id: f.key,
      textRef: f.originalText || f.label,
      status: "approved" as const,
    })),
    [fields]
  );

  // Field card click - scroll to highlight in editor
  const handleFieldCardClick = useCallback((fieldKey: string) => {
    setHighlightedFieldKey(fieldKey);
    
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
    
    setTimeout(() => setHighlightedFieldKey(null), 2000);
  }, []);

  // Text field click - highlight card in strip
  const handleTextFieldClick = useCallback((cardId: string) => {
    setHighlightedFieldKey(cardId);
    setTimeout(() => setHighlightedFieldKey(null), 2000);
  }, []);

  // Create field from text selection
  const handleCreateFieldFromSelection = useCallback((
    selection: TextSelection
  ) => {
    setCreateFieldSelection(selection);
    setShowFieldCreateSheet(true);
  }, []);

  // Field edit from strip card
  const handleFieldEditFromStrip = useCallback((field: UnifiedTemplateField) => {
    setEditingField(field);
    setShowFieldEditSheet(true);
  }, []);

  // Field delete with confirmation
  const handleFieldDelete = useCallback((fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey);
    if (!field) return;
    
    if (window.confirm(`Видалити поле "${field.label}"?`)) {
      const updatedFields = fields.filter(f => f.key !== fieldKey);
      handleFieldsChange(updatedFields);
      toast({
        title: "Поле видалено",
        description: `"${field.label}" видалено з шаблону`,
      });
    }
  }, [fields, handleFieldsChange]);

  // Field create from sheet
  const handleFieldCreate = useCallback((newField: UnifiedTemplateField, placement?: "replace" | "before" | "after") => {
    // Map source to TemplateField-compatible values
    const mappedSource = newField.source === "cabinet" ? "cabinet" as const :
                        newField.source === "contractor" ? "contractor" as const : 
                        "manual" as const;
    
    // For before/after placement, don't use originalText for substitution
    const effectiveOriginalText = (placement === "before" || placement === "after")
      ? undefined
      : (newField.originalText || createFieldSelection?.text || "");

    // Convert UnifiedTemplateField back to TemplateField for local state
    const templateField: TemplateField = {
      key: newField.key,
      label: newField.label,
      originalText: effectiveOriginalText || "",
      source: mappedSource,
      sourceKey: newField.sourceKey,
      dataType: newField.dataType,
      aiHint: newField.aiHint,
      required: newField.required,
      position: newField.position || { start: 0, end: 0 },
    };
    
    handleFieldsChange([...fields, templateField]);
    
    toast({
      title: "Поле створено",
      description: `Додано поле "${newField.label}"`,
    });
    
    setHighlightedFieldKey(newField.key);
    setTimeout(() => setHighlightedFieldKey(null), 2000);
    setCreateFieldSelection(null);
  }, [fields, handleFieldsChange, createFieldSelection]);

  // Field save from edit sheet
  const handleFieldSave = useCallback((updatedField: UnifiedTemplateField) => {
    const updated = fields.map(f => 
      f.key === updatedField.key 
        ? { 
            ...f, 
            label: updatedField.label,
            source: updatedField.source,
            sourceKey: updatedField.sourceKey,
            dataType: updatedField.dataType,
            required: updatedField.required,
            originalText: updatedField.originalText,
          } as TemplateField
        : f
    );
    handleFieldsChange(updated);
    toast({
      title: "Поле оновлено",
      description: `"${updatedField.label}" збережено`,
    });
  }, [fields, handleFieldsChange]);

  // Find similar (placeholder)
  const handleFindSimilar = useCallback((text: string) => {
    toast({
      title: "Пошук схожих",
      description: `Пошук фрагментів схожих на "${text.slice(0, 30)}..."`,
    });
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <div className="max-w-md w-full space-y-6">
                {/* Upload Zone */}
                <Card
                  className={cn(
                    "border-2 border-dashed cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30",
                    isAnalyzing && "pointer-events-none opacity-70"
                  )}
                  onClick={handleFileUpload}
                >
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Завантажте документ</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Перетягніть файл сюди або натисніть для вибору
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, DOCX, DOC до 10 МБ
                    </p>
                  </CardContent>
                </Card>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">або</span>
                  </div>
                </div>

                {/* Demo Button */}
                <Button
                  variant="outline"
                  className="w-full h-12 gap-2"
                  onClick={handleDemoClick}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Розпізнаю документ...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Спробувати демо-договір
                    </>
                  )}
                </Button>

                {/* AI Hint */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">AI-розпізнавання</p>
                    <p className="text-muted-foreground">
                      Система автоматично знайде всі поля для заповнення та запропонує джерела даних
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* No footer - all navigation is in header */}
          </div>
        );

      case "editor":
        return (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Field cards strip with edit/delete */}
            <EditorFieldsStrip
              fields={unifiedFields}
              highlightedFieldKey={highlightedFieldKey}
              onFieldClick={handleFieldCardClick}
              onFieldHover={() => {}}
              onFieldEdit={handleFieldEditFromStrip}
              onFieldDelete={handleFieldDelete}
            />
            
            {/* WYSIWYG Editor */}
            <div className="flex-1 min-h-0 flex flex-col" ref={editorWrapperRef}>
              <RichTextEditor
                content={documentText}
                onChange={setDocumentText}
                aiHighlights={fieldHighlights}
                activeHighlightId={highlightedFieldKey}
                onHighlightClick={handleTextFieldClick}
                onCreateFieldFromSelection={handleCreateFieldFromSelection}
                onFindSimilar={handleFindSimilar}
                className="flex-1"
              />
            </div>
            
            {/* FieldCreateSheet for creating new fields */}
            <FieldCreateSheet
              open={showFieldCreateSheet}
              onOpenChange={setShowFieldCreateSheet}
              selectedText={createFieldSelection?.text || ""}
              onSave={handleFieldCreate}
            />
            
            {/* FieldEditSheet for editing existing fields */}
            <FieldEditSheet
              open={showFieldEditSheet}
              onOpenChange={setShowFieldEditSheet}
              field={editingField}
              onSave={handleFieldSave}
            />
            
            {/* No footer - all navigation is in header */}
          </div>
        );

      case "test":
        return (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Use TemplateTestStep with AnchorCardStrip - same as document creation */}
            <TemplateTestStep
              fields={unifiedFields}
              documentText={documentText}
              cabinet={cabinet}
              testValues={testValues}
              onTestValuesChange={setTestValues}
              documentType="invoice"
            />
            
            {/* No footer - all navigation is in header */}
          </div>
        );

      case "preview":
        return (
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 sm:p-6">
                {/* Centered Toggle above document */}
                <div className="flex justify-center mb-4">
                  <ToggleGroup 
                    type="single" 
                    value={previewMode} 
                    onValueChange={(v) => v && setPreviewMode(v as "template" | "document")}
                    className="bg-muted p-1 rounded-full border border-border/70"
                  >
                    <ToggleGroupItem 
                      value="template" 
                      className="rounded-full px-4 h-8 text-sm gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
                    >
                      <FileText className="w-4 h-4" />
                      Шаблон
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="document" 
                      className="rounded-full px-4 h-8 text-sm gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-md"
                    >
                      <FileCheck className="w-4 h-4" />
                      Документ
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <Card className="max-w-2xl mx-auto shadow-sm">
                  <CardContent className="p-6 sm:p-8">
                    {/* Document header simulation */}
                    {previewMode === "document" && templateName && (
                      <div className="text-center mb-6 pb-4 border-b">
                        <h2 className="font-bold text-lg uppercase tracking-wide">{templateName}</h2>
                      </div>
                    )}
                    
                    {/* Document text - rendered as HTML */}
                    <div 
                      className="prose prose-sm max-w-none text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(
                          previewMode === "template" 
                            ? renderTemplatePreview() 
                            : renderCleanDocument(),
                          { ADD_ATTR: ['style'] }
                        ) 
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            
            {/* No footer - all navigation is in header */}
          </div>
        );

      case "save":
        return (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-lg w-full space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                  <Save className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-semibold">Збереження шаблону</h2>
                <p className="text-muted-foreground">
                  Шаблон протестовано. Дайте йому назву та збережіть.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Назва шаблону *</label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Наприклад: Договір IT-послуги"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Опис (необов'язково)</label>
                  <Textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Короткий опис призначення шаблону"
                    rows={3}
                  />
                </div>
              </div>

              {/* Summary */}
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Полів для заповнення</span>
                    <span className="font-medium">{fields.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Автозаповнення з кабінету</span>
                    <span className="font-medium">
                      {fields.filter((f) => f.source === "cabinet").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Статус</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Протестовано
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions - single primary button */}
              <Button className="w-full gap-2" onClick={handleSaveTemplate}>
                <Save className="w-4 h-4" />
                Зберегти шаблон
              </Button>
            </div>
          </div>
        );
    }
  };

  // Helper to get back step
  const getPreviousStep = (): TemplateWizardStep | null => {
    switch (currentStep) {
      case "editor": return "upload";
      case "test": return "editor";
      case "preview": return "test";
      case "save": return "preview";
      default: return null;
    }
  };

  const handleBackClick = () => {
    const prevStep = getPreviousStep();
    if (prevStep) {
      setCurrentStep(prevStep);
    } else {
      onBack?.();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header - All navigation in one place */}
      <div className="sticky top-0 z-10 border-b p-2 sm:p-3 flex items-center gap-2 sm:gap-3 bg-background">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 shrink-0"
          onClick={handleBackClick}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        {/* Title - hidden on mobile */}
        <h1 className="font-semibold text-sm hidden sm:block truncate">Створення шаблону</h1>
        
        {/* Progress indicator - compact on mobile */}
        <div className="flex-1 flex justify-center">
          <TemplateStepIndicator 
            currentStep={currentStep} 
            variant={isMobile ? "compact" : "full"} 
          />
        </div>
        
        {/* Field count + action buttons area */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Field count badge - compact on mobile */}
          {fields.length > 0 && (currentStep === 'editor' || currentStep === 'test' || currentStep === 'preview') && (
            <Badge variant="outline" className="text-xs h-6 px-1.5 sm:px-2">
              <span className="hidden sm:inline">{fields.length} полів</span>
              <span className="sm:hidden">{fields.length}</span>
            </Badge>
          )}
          
          {/* Context-aware action button */}
          {currentStep === "editor" && (
            <Button size="sm" onClick={handleStartTest} className="h-8 gap-1.5 px-2 sm:px-3">
              <TestTube className="w-4 h-4" />
              <span className="hidden sm:inline">Тестувати</span>
            </Button>
          )}
          {currentStep === "test" && (
            <Button 
              size="sm" 
              onClick={() => setCurrentStep("preview")} 
              className="h-8 gap-1 px-2 sm:px-3"
              disabled={Object.keys(testValues).length === 0}
            >
              <span>Далі</span>
              <ChevronRight className="w-4 h-4 hidden sm:block" />
            </Button>
          )}
          {currentStep === "preview" && (
            <Button 
              size="sm" 
              onClick={() => setCurrentStep("save")} 
              className="h-8 gap-1 px-2 sm:px-3"
            >
              <Save className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Зберегти</span>
              <span className="sm:hidden">Далі</span>
            </Button>
          )}
          
          {/* Info tooltip - for editor/test */}
          {(currentStep === 'editor' || currentStep === 'test') && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 hidden sm:flex">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>
                  {currentStep === 'editor' 
                    ? "Виділіть текст щоб створити нове поле. Клікніть на існуюче поле щоб змінити джерело."
                    : "Клікніть на поле в картці або в документі для редагування. Колір картки відповідає джерелу даних."
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Content */}
      {renderStepContent()}
    </div>
  );
};