import { useState, useCallback } from "react";
import {
  Upload, FileText, Bot, CheckCircle, Loader2, Sparkles, X, ChevronRight, 
  Building2, User, Eye, ChevronDown, FileCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import { documentTypeConfigs, type DocumentType, type DocumentCategory } from "@/config/documentFlowConfig";
import { DocumentPDFPreview } from "./DocumentPDFPreview";
import { DocumentThumbnail } from "./DocumentThumbnail";
import { DocumentSummaryCard } from "./DocumentSummaryCard";
import { DocumentChecklistCard } from "./DocumentChecklistCard";
import { InviteContractorSheet, type ContractorPrefillData } from "./InviteContractorSheet";
import { demoScenarios, getDemoScenarioById } from "@/config/documentSummaryDemo";
import { scenarioToAnalysisResult } from "@/lib/documentAnalysis/generateSummary";
import { classifyUploadedDocument, type UploadClassificationResult } from "@/lib/documentAnalysis/classifyUploadedDocument";
import { ClassificationPreview } from "./ClassificationPreview";
import { PropertyLinkBanner, isPropertyRelatedDocument } from "./PropertyLinkBanner";
import type { ExtendedAnalysisResult, DocumentChecklist, ChecklistItem, DocumentRegistration } from "@/types/documentSummary";

interface UploadDocumentContentProps {
  cabinet: Cabinet;
  onDocumentUploaded?: () => void;
  onChatMessage?: (prompt: string) => void;
  // Context for linked document upload (Scenario 2)
  parentDocument?: import("@/config/documentFlowConfig").Document | null;
}

type UploadStep = "upload" | "analyzing" | "review" | "saving";

// Legacy AnalysisResult type for backward compatibility
interface AnalysisResult {
  documentType: DocumentType;
  suggestedNumber: string;
  suggestedDate: string;
  contractor?: { name: string; code: string };
  amount?: number;
  summary: string;
  confidence: number;
  parties?: {
    supplier: string;
    supplierCode: string;
    buyer: string;
    buyerCode: string;
  };
  keyTerms?: string[];
  subject?: string;
  currency?: string;
  validUntil?: string;
  // DIH extensions
  dihSummary?: ExtendedAnalysisResult["dihSummary"];
  checklist?: DocumentChecklist;
  demoScenarioId?: string;
}

// Map AI result to unified fieldValues structure
const mapAIResultToFieldValues = (result: AnalysisResult): Record<string, string | number> => ({
  documentNumber: result.suggestedNumber || "",
  documentDate: result.suggestedDate || "",
  supplierName: result.parties?.supplier || "",
  supplierCode: result.parties?.supplierCode || "",
  buyerName: result.parties?.buyer || "",
  buyerCode: result.parties?.buyerCode || "",
  total: result.amount || 0,
  subject: result.subject || "",
  currency: result.currency || "UAH",
  validUntil: result.validUntil || "",
});

// Mock AI analysis function with detailed results
const mockAnalyzeDocument = async (file: File, isDemo = false): Promise<AnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, isDemo ? 1800 : 2000));
  
  const fileName = file.name.toLowerCase();
  
  // Demo contract analysis
  if (fileName.includes("договір") || fileName.includes("contract") || isDemo) {
    return {
      documentType: "contract",
      suggestedNumber: "ДОГ-2025-047",
      suggestedDate: "2025-01-15",
      contractor: { name: "ТОВ «Діджитал Солюшнс»", code: "43215678" },
      amount: 125000,
      summary: "Договір про надання IT-послуг. AI визначив сторони, предмет та ключові умови.",
      confidence: 94,
      parties: {
        supplier: "ТОВ «Діджитал Солюшнс»",
        supplierCode: "43215678",
        buyer: "ФОП Мельник О.В.",
        buyerCode: "3456789012",
      },
      keyTerms: [
        "Термін дії: 12 місяців",
        "Оплата: щомісячно до 10 числа",
        "Штрафні санкції: 0.1% за день прострочення",
        "Автопролонгація на 12 місяців",
      ],
      subject: "Розробка та підтримка веб-додатку",
      currency: "UAH",
      validUntil: "2026-01-15",
    };
  }
  
  if (fileName.includes("рахунок") || fileName.includes("invoice")) {
    return {
      documentType: "invoice",
      suggestedNumber: "РАХ-2025-001",
      suggestedDate: new Date().toISOString().split("T")[0],
      contractor: { name: "ТОВ «Клієнт»", code: "12345678" },
      amount: 15000,
      summary: "Рахунок на оплату за послуги. AI визначив контрагента та суму автоматично.",
      confidence: 92,
      parties: {
        supplier: "ФОП Мельник О.В.",
        supplierCode: "3456789012",
        buyer: "ТОВ «Клієнт»",
        buyerCode: "12345678",
      },
      keyTerms: [
        "Термін оплати: 5 банківських днів",
        "Без ПДВ (платник єдиного податку)",
      ],
      currency: "UAH",
    };
  }
  
  if (fileName.includes("акт") || fileName.includes("act")) {
    return {
      documentType: "act",
      suggestedNumber: "АКТ-2025-001",
      suggestedDate: new Date().toISOString().split("T")[0],
      contractor: { name: "ФОП Петренко", code: "1234567890" },
      amount: 8500,
      summary: "Акт виконаних робіт. AI визначив тип та дані документа.",
      confidence: 88,
      parties: {
        supplier: "ФОП Петренко І.С.",
        supplierCode: "1234567890",
        buyer: "ФОП Мельник О.В.",
        buyerCode: "3456789012",
      },
      keyTerms: [
        "Роботи виконано в повному обсязі",
        "Претензій до якості немає",
      ],
      currency: "UAH",
    };
  }
  
  return {
    documentType: "other",
    suggestedNumber: "ДОК-2025-001",
    suggestedDate: new Date().toISOString().split("T")[0],
    summary: "Документ успішно розпізнано. Перевірте дані та підтвердіть.",
    confidence: 75,
  };
};

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp,.docx";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const UploadDocumentContent = ({
  cabinet,
  onDocumentUploaded,
  onChatMessage,
  parentDocument,
}: UploadDocumentContentProps) => {
  const [step, setStep] = useState<UploadStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editedType, setEditedType] = useState<DocumentType>("other");
  const [isDemo, setIsDemo] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentChecklist, setCurrentChecklist] = useState<DocumentChecklist | null>(null);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [invitePrefillData, setInvitePrefillData] = useState<ContractorPrefillData | null>(null);
  const [classification, setClassification] = useState<UploadClassificationResult | null>(null);
  const [propertyBannerDismissed, setPropertyBannerDismissed] = useState(false);
  const [linkedPropertyId, setLinkedPropertyId] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: "Непідтримуваний формат",
        description: "Підтримуються: PDF, JPEG, PNG, DOCX",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Файл завеликий",
        description: "Максимальний розмір: 20 МБ",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const runAnalysis = useCallback(async (file: File, isDemoMode: boolean, scenarioId?: string) => {
    setSelectedFile(file);
    setIsDemo(isDemoMode);
    setStep("analyzing");
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setUploadProgress(Math.min(progress, 90));
      if (progress >= 90) clearInterval(progressInterval);
    }, isDemoMode ? 150 : 200);
    
    try {
      let result: AnalysisResult;
      
      // If demo scenario ID provided, use DIH data
      if (scenarioId) {
        const dihResult = scenarioToAnalysisResult(scenarioId);
        if (dihResult) {
          result = dihResult as AnalysisResult;
          setCurrentChecklist(dihResult.checklist || null);
        } else {
          result = await mockAnalyzeDocument(file, isDemoMode);
          setCurrentChecklist(null);
        }
      } else {
        result = await mockAnalyzeDocument(file, isDemoMode);
        setCurrentChecklist(null);
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setAnalysisResult(result);
      setEditedType(result.documentType);
      
      // Run auto-classification
      const classResult = classifyUploadedDocument({
        documentType: result.documentType,
        amount: result.amount,
        subject: result.subject,
        contractorName: result.contractor?.name || result.parties?.supplier,
        keyTerms: result.keyTerms,
      });
      setClassification(classResult);
      
      setStep("review");
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Помилка аналізу",
        description: "Не вдалося проаналізувати документ",
        variant: "destructive",
      });
      setStep("upload");
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFile(file)) return;
    runAnalysis(file, false);
  }, [runAnalysis]);

  const handleDemoScenario = useCallback((scenarioId: string) => {
    const scenario = getDemoScenarioById(scenarioId);
    if (!scenario) return;
    
    // Create a mock file for demo
    const mockFile = new File(
      ["demo content"],
      scenario.fileName,
      { type: "application/pdf" }
    );
    runAnalysis(mockFile, true, scenarioId);
  }, [runAnalysis]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Helper functions for registration
  const calculateRetentionDeadline = (documentDate: string, years: number): string => {
    const date = new Date(documentDate);
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().split("T")[0];
  };

  const getCategoryLabel = (category: DocumentCategory): string => {
    const labels: Record<DocumentCategory, string> = {
      primary: "Первинний",
      contract: "Договірний",
      fiscal: "Фіскальний",
      report: "Звітний",
      bank: "Банківський",
      internal: "Внутрішній",
    };
    return labels[category] || category;
  };

  const handleSave = () => {
    setStep("saving");
    
    // Calculate retention based on document type
    const typeConfig = documentTypeConfigs[editedType];
    const retentionYears = typeConfig.retentionYears;
    const retentionDeadline = calculateRetentionDeadline(
      analysisResult?.suggestedDate || new Date().toISOString().split("T")[0],
      retentionYears
    );
    
    // Create document registration record with unified field values
    const fieldValues = analysisResult ? mapAIResultToFieldValues(analysisResult) : {};
    
    const documentRecord: DocumentRegistration = {
      number: analysisResult?.suggestedNumber || `DOC-${Date.now()}`,
      category: typeConfig.category,
      retentionYears: retentionYears,
      retentionDeadline: retentionDeadline,
      registeredAt: new Date().toISOString(),
      humanVerified: currentChecklist?.completionPercent === 100,
    };
    
    // Log fieldValues for debugging (in real app, this would be saved to DB)
    if (import.meta.env.DEV) console.log("Document field values:", fieldValues);

    setTimeout(() => {
      const deadlineFormatted = new Date(retentionDeadline).toLocaleDateString("uk-UA");
      toast({
        title: "Документ зареєстровано",
        description: `${typeConfig.label} №${documentRecord.number}. Зберігати до ${deadlineFormatted}.`,
      });
      onDocumentUploaded?.();
    }, 1000);
  };

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setUploadProgress(0);
    setAnalysisResult(null);
    setIsDemo(false);
    setPreviewOpen(false);
    setCurrentChecklist(null);
    setClassification(null);
    setPropertyBannerDismissed(false);
    setLinkedPropertyId(null);
  };

  const handleOpenPreview = useCallback(() => {
    if (analysisResult) {
      setPreviewOpen(true);
    }
  }, [analysisResult]);

  const handleChecklistAction = useCallback((item: ChecklistItem) => {
    if (import.meta.env.DEV) console.log("handleChecklistAction called:", item.action.type, item);
    // Handle different action types
    if (item.action.type === "invite") {
      // Extract prefill data from checklist item
      const prefillData: ContractorPrefillData = {
        name: item.action.prefillData?.name as string || undefined,
        code: item.action.prefillData?.code as string || undefined,
        type: item.action.prefillData?.type as "supplier" | "buyer" | "both" || "supplier",
        sourceDocument: analysisResult?.demoScenarioId || "uploaded-doc",
      };
      if (import.meta.env.DEV) console.log("Opening invite sheet with prefillData:", prefillData);
      setInvitePrefillData(prefillData);
      setInviteSheetOpen(true);
    } else if (item.action.type === "navigate") {
      toast({
        title: "Навігація",
        description: `Перехід до: ${item.action.targetRoute?.replace("{cabinetId}", cabinet.id) || ""}`,
      });
    } else if (item.action.type === "upload") {
      toast({
        title: "Завантаження",
        description: "Завантажте відсутній документ",
      });
    } else {
      toast({
        title: item.action.label,
        description: item.description,
      });
    }
  }, [cabinet.id, analysisResult?.demoScenarioId]);

  const handleChecklistItemComplete = useCallback((itemId: string) => {
    if (!currentChecklist) return;
    
    const updatedItems = currentChecklist.items.map(item => {
      if (item.id === itemId && item.status !== "done") {
        return { ...item, status: "done" as const, completedAt: new Date().toISOString() };
      }
      return item;
    });
    
    const completedCount = updatedItems.filter(i => i.status === "done").length;
    
    setCurrentChecklist({
      ...currentChecklist,
      items: updatedItems,
      completedItems: completedCount,
      completionPercent: Math.round((completedCount / currentChecklist.totalItems) * 100),
    });
    
    toast({
      title: "Виконано",
      description: "Пункт позначено як виконаний",
    });
  }, [currentChecklist]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Upload step
  if (step === "upload") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Parent Document Context Banner */}
        {parentDocument && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Завантаження до документу</p>
                <p className="text-xs text-muted-foreground truncate">
                  {documentTypeConfigs[parentDocument.type]?.label} №{parentDocument.number}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          )}
        >
          <input
            type="file"
            id="file-upload"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              isDragOver ? "bg-primary/20" : "bg-muted"
            )}>
              <Upload className={cn(
                "w-8 h-8 transition-colors",
                isDragOver ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Перетягніть файл сюди
              </p>
              <p className="text-sm text-muted-foreground">
                або
              </p>
            </div>
            
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Обрати файл
              </label>
            </Button>
            
            <p className="text-xs text-muted-foreground">
              PDF, JPEG, PNG, DOCX • Макс. 20 МБ
            </p>
          </div>
        </div>

        {/* AI hint */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">AI автоматично розпізнає</p>
              <p className="text-sm text-muted-foreground">
                Тип документа, контрагента, суму та інші дані
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Scenarios Dropdown */}
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Bot className="w-4 h-4" />
                Спробувати демо-аналіз
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-80 bg-popover">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Оберіть сценарій для демонстрації
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {demoScenarios.map((scenario) => (
                <DropdownMenuItem
                  key={scenario.id}
                  onClick={() => handleDemoScenario(scenario.id)}
                  className="flex flex-col items-start py-2.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <scenario.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm">{scenario.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6 mt-0.5">
                    {scenario.description}
                  </p>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Analyzing step
  if (step === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6 animate-in fade-in duration-300">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">AI аналізує документ...</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Розпізнаємо тип, визначаємо сторони та витягуємо ключові дані
          </p>
          {selectedFile && (
            <p className="text-xs text-muted-foreground/70 truncate max-w-[200px] mx-auto">
              {selectedFile.name}
            </p>
          )}
        </div>
        
        <div className="w-full max-w-xs">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground mt-2">
            {uploadProgress}%
          </p>
        </div>
      </div>
    );
  }

  // Review step
  if (step === "review" && analysisResult) {
    const typeConfig = documentTypeConfigs[editedType];
    const hasDihData = analysisResult.dihSummary && currentChecklist;
    
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* File info with PDF thumbnail */}
        <Card>
          <CardContent className="p-4 flex items-start gap-4">
            {/* PDF Thumbnail */}
            <DocumentThumbnail
              documentData={{
                type: documentTypeConfigs[editedType]?.label || editedType,
                number: analysisResult.suggestedNumber,
                date: analysisResult.suggestedDate,
                supplier: analysisResult.parties?.supplier,
                buyer: analysisResult.parties?.buyer || cabinet.name,
                amount: analysisResult.amount,
              }}
              onClick={handleOpenPreview}
            />
            
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium truncate text-sm">{selectedFile?.name}</p>
                {isDemo && (
                  <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0 h-5">
                    ДЕМО
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {isDemo ? "Демонстраційний файл" : formatFileSize(selectedFile?.size || 0)}
              </p>
              
              {/* Preview button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenPreview}
                className="gap-1.5 h-8"
              >
                <Eye className="w-4 h-4" />
                Переглянути PDF
              </Button>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleReset} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* DIH Summary Card (for demo scenarios) */}
        {hasDihData && analysisResult.dihSummary && (
          <DocumentSummaryCard summary={analysisResult.dihSummary} />
        )}

        {/* DIH Checklist Card (for demo scenarios) */}
        {hasDihData && currentChecklist && (
          <DocumentChecklistCard 
            checklist={currentChecklist}
            onAction={handleChecklistAction}
            onItemComplete={handleChecklistItemComplete}
          />
        )}

        {/* Legacy AI Summary (for non-DIH analysis) */}
        {!hasDihData && (
          <>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-medium">AI аналіз</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "ml-auto",
                      analysisResult.confidence >= 90 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : analysisResult.confidence >= 75 
                          ? "text-amber-600 dark:text-amber-400" 
                          : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {analysisResult.confidence}% впевненість
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysisResult.summary}
                </p>
              </CardContent>
            </Card>

            {/* Parties */}
            {analysisResult.parties && (
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 bg-muted/30">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Постачальник</p>
                      <p className="font-medium text-sm truncate">{analysisResult.parties.supplier}</p>
                      <p className="text-xs text-muted-foreground">
                        ЄДРПОУ: {analysisResult.parties.supplierCode}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 bg-muted/30">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Покупець</p>
                      <p className="font-medium text-sm truncate">{analysisResult.parties.buyer}</p>
                      <p className="text-xs text-muted-foreground">
                        ІПН: {analysisResult.parties.buyerCode}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Key terms */}
            {analysisResult.keyTerms && analysisResult.keyTerms.length > 0 && (
              <Card className="p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Ключові умови
                </p>
                <ul className="space-y-1.5">
                  {analysisResult.keyTerms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        )}

        {/* Auto-classification */}
        {classification && (
          <ClassificationPreview classification={classification} />
        )}

        {/* Document number and date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Номер документа</Label>
            <Input 
              value={analysisResult.suggestedNumber} 
              readOnly 
              className="h-9 bg-muted/30"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Дата</Label>
            <Input 
              type="date"
              value={analysisResult.suggestedDate} 
              readOnly 
              className="h-9 bg-muted/30"
            />
          </div>
        </div>

        {/* Document type select */}
        <div className="space-y-1.5">
          <Label className="text-xs">Тип документа</Label>
          <Select value={editedType} onValueChange={(v) => setEditedType(v as DocumentType)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(documentTypeConfigs).map((config) => (
                <SelectItem key={config.type} value={config.type}>
                  <div className="flex items-center gap-2">
                    <config.icon className="w-4 h-4 text-muted-foreground" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount (only show for non-DIH or if no financials in DIH) */}
        {analysisResult.amount && !hasDihData && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Сума</span>
            <span className="text-lg font-bold">
              {analysisResult.amount.toLocaleString("uk-UA")} ₴
            </span>
          </div>
        )}

        {/* Registration Preview - show what will be created */}
        {analysisResult && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm">Реєстрація документа</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Номер:</span>
                  <span className="ml-2 font-medium">{analysisResult.suggestedNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Тип:</span>
                  <span className="ml-2">{documentTypeConfigs[editedType].label}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Категорія:</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {getCategoryLabel(documentTypeConfigs[editedType].category)}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Зберігання:</span>
                  <span className="ml-2">{documentTypeConfigs[editedType].retentionYears} років</span>
                </div>
              </div>
              
              {/* Human validation status */}
              {currentChecklist && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  {currentChecklist.completionPercent === 100 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600">Верифікація завершена</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-600">
                        Верифікація: {currentChecklist.completionPercent}%
                      </span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Property Registry Link Banner */}
        {!propertyBannerDismissed && !linkedPropertyId && analysisResult && isPropertyRelatedDocument(
          editedType,
          analysisResult.subject,
          analysisResult.contractor?.name || analysisResult.parties?.supplier,
        ) && (
          <PropertyLinkBanner
            documentType={editedType}
            subject={analysisResult.subject}
            contractorName={analysisResult.contractor?.name}
            onAddToRegistry={() => {
              toast({
                title: "Реєстр майна",
                description: "Відкрийте Налаштування → Довідники → Реєстр майна для додавання об'єкта",
              });
              setPropertyBannerDismissed(true);
            }}
            onLinkToExisting={(propertyId) => {
              setLinkedPropertyId(propertyId);
              toast({
                title: "Прив'язано до об'єкта",
                description: "Документ буде пов'язано з об'єктом у реєстрі майна",
              });
            }}
            onDismiss={() => setPropertyBannerDismissed(true)}
          />
        )}

        {/* Linked Property Confirmation */}
        {linkedPropertyId && (
          <Card className="border-emerald-300/50 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-700/30">
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-sm font-medium">Прив'язано до реєстру майна</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 text-xs text-muted-foreground"
                onClick={() => setLinkedPropertyId(null)}
              >
                Відв'язати
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <div className="flex-1" />
          <Button variant="outline" onClick={handleReset}>
            Скасувати
          </Button>
          <Button onClick={handleSave}>
            {hasDihData ? "Зберегти та зареєструвати" : "Зберегти документ"}
          </Button>
        </div>

        {/* PDF Preview Dialog */}
        {analysisResult && (
          <DocumentPDFPreview
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            documentData={{
              type: documentTypeConfigs[editedType]?.label || editedType,
              number: analysisResult.suggestedNumber,
              date: analysisResult.suggestedDate,
              supplier: {
                name: analysisResult.parties?.supplier || analysisResult.contractor?.name || '',
                code: analysisResult.parties?.supplierCode || analysisResult.contractor?.code || '',
              },
              buyer: {
                name: analysisResult.parties?.buyer || cabinet.name,
                code: analysisResult.parties?.buyerCode || (cabinet as any).code || '',
              },
              amount: analysisResult.amount,
              currency: analysisResult.currency,
              keyTerms: analysisResult.keyTerms,
            }}
          />
        )}
        
        {/* Invite Contractor Sheet - for review step */}
        <InviteContractorSheet
          open={inviteSheetOpen}
          onOpenChange={setInviteSheetOpen}
          prefillData={invitePrefillData || undefined}
          cabinetName={cabinet.name}
          onInviteSent={(email, name, code) => {
            toast({
              title: "Запрошення надіслано",
              description: `${name} отримає запрошення на ${email}`,
            });
            // Mark the checklist item as done
            if (currentChecklist) {
              const inviteItem = currentChecklist.items.find(
                i => i.action.type === "invite" && i.status !== "done"
              );
              if (inviteItem) {
                handleChecklistItemComplete(inviteItem.id);
              }
            }
          }}
        />
      </div>
    );
  }

  // Saving step
  if (step === "saving") {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-in fade-in duration-300">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-lg font-medium">Збереження...</p>
        </div>
        
        {/* Invite Contractor Sheet */}
        <InviteContractorSheet
          open={inviteSheetOpen}
          onOpenChange={setInviteSheetOpen}
          prefillData={invitePrefillData || undefined}
          cabinetName={cabinet.name}
          onInviteSent={(email, name, code) => {
            toast({
              title: "Запрошення надіслано",
              description: `${name} отримає запрошення на ${email}`,
            });
            // Mark the checklist item as done
            if (currentChecklist) {
              const inviteItem = currentChecklist.items.find(
                i => i.action.type === "invite" && i.status !== "done"
              );
              if (inviteItem) {
                handleChecklistItemComplete(inviteItem.id);
              }
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Invite Contractor Sheet - available in all steps */}
      <InviteContractorSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        prefillData={invitePrefillData || undefined}
        cabinetName={cabinet.name}
        onInviteSent={(email, name, code) => {
          toast({
            title: "Запрошення надіслано",
            description: `${name} отримає запрошення на ${email}`,
          });
          // Mark the checklist item as done
          if (currentChecklist) {
            const inviteItem = currentChecklist.items.find(
              i => i.action.type === "invite" && i.status !== "done"
            );
            if (inviteItem) {
              handleChecklistItemComplete(inviteItem.id);
            }
          }
        }}
      />
    </>
  );
};
