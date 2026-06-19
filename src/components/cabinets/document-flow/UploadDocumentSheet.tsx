import { useState, useCallback, useRef } from "react";
import {
  Upload, FileText, Bot, CheckCircle, AlertCircle,
  FileUp, X, Loader2, Building2, Calendar, DollarSign,
  User, FileCheck, ChevronRight, Sparkles
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import {
  type DocumentType,
  documentTypeConfigs,
} from "@/config/documentFlowConfig";

interface UploadDocumentSheetProps {
  cabinet: Cabinet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatPromptInsert?: (prompt: string) => void;
  onDocumentUploaded?: () => void;
  /** Context for linking uploaded document to parent */
  parentDocumentId?: string;
  relatedDocumentType?: string;
  relatedDocumentDescription?: string;
  /** Callback when document is linked to parent */
  onDocumentLinked?: (newDocumentId: string) => void;
}

type UploadStep = "upload" | "analyzing" | "review" | "saving";

interface AnalysisResult {
  detectedType: DocumentType;
  confidence: number;
  parties: {
    supplier?: string;
    supplierCode?: string;
    buyer?: string;
    buyerCode?: string;
  };
  documentNumber?: string;
  documentDate?: string;
  amount?: number;
  currency?: string;
  subject?: string;
  keyTerms?: string[];
  validUntil?: string;
  summary: string;
}

// Mock AI analysis - simulates document parsing
const mockAnalyzeDocument = (fileName: string): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Determine type from filename
      let detectedType: DocumentType = "other";
      let confidence = 0.85;
      
      const nameLower = fileName.toLowerCase();
      if (nameLower.includes("договір") || nameLower.includes("contract") || nameLower.includes("дог")) {
        detectedType = "contract";
        confidence = 0.92;
      } else if (nameLower.includes("рахунок") || nameLower.includes("invoice") || nameLower.includes("рах")) {
        detectedType = "invoice";
        confidence = 0.94;
      } else if (nameLower.includes("акт") || nameLower.includes("act")) {
        detectedType = "act";
        confidence = 0.91;
      } else if (nameLower.includes("накладна") || nameLower.includes("waybill")) {
        detectedType = "waybill";
        confidence = 0.89;
      }

      const mockResults: Record<DocumentType, AnalysisResult> = {
        contract: {
          detectedType: "contract",
          confidence,
          parties: {
            supplier: "ТОВ \"Діджитал Солюшнз\"",
            supplierCode: "32855961", // Valid EDRPOU
            buyer: "ФОП Петренко І.В.",
            buyerCode: "3184710691", // Valid IPN
          },
          documentNumber: "ДОГ-2025-001",
          documentDate: "2025-01-15",
          amount: 75000,
          currency: "UAH",
          subject: "Надання послуг з розробки програмного забезпечення",
          keyTerms: [
            "Строк дії: 12 місяців",
            "Оплата: 50% передоплата, 50% по завершенню",
            "Відповідальність за порушення строків: 0.1% за день",
            "Інтелектуальна власність: замовника",
          ],
          validUntil: "2026-01-15",
          summary: "Договір на надання IT-послуг між ТОВ \"Діджитал Солюшнз\" та ФОП Петренко. Предмет: розробка ПЗ, сума 75 000 ₴, строк 12 міс. Передбачено передоплату 50%.",
        },
        invoice: {
          detectedType: "invoice",
          confidence,
          parties: {
            supplier: "ТОВ \"Постачальник Плюс\"",
            supplierCode: "40075815", // Valid EDRPOU
            buyer: "ФОП Іваненко О.М.",
            buyerCode: "3184710691", // Valid IPN
          },
          documentNumber: "РАХ-2025-0156",
          documentDate: "2025-01-10",
          amount: 24500,
          currency: "UAH",
          subject: "Оплата за канцелярські товари згідно специфікації",
          keyTerms: [
            "Термін оплати: 5 банківських днів",
            "Доставка: за рахунок постачальника",
          ],
          summary: "Рахунок на оплату канцтоварів від ТОВ \"Постачальник Плюс\" на суму 24 500 ₴. Термін оплати до 17.01.2025.",
        },
        act: {
          detectedType: "act",
          confidence,
          parties: {
            supplier: "ФОП Сидоренко В.П.",
            supplierCode: "2453671089", // Valid IPN
            buyer: "ТОВ \"Клієнт\"",
            buyerCode: "32855961", // Valid EDRPOU
          },
          documentNumber: "АКТ-2025-0089",
          documentDate: "2025-01-12",
          amount: 18000,
          currency: "UAH",
          subject: "Акт наданих послуг з консультування",
          keyTerms: [
            "Послуги надано в повному обсязі",
            "Претензій до якості немає",
          ],
          summary: "Акт виконаних робіт з консультування. Виконавець: ФОП Сидоренко, замовник: ТОВ \"Клієнт\", сума 18 000 ₴.",
        },
        waybill: {
          detectedType: "waybill",
          confidence,
          parties: {
            supplier: "ТОВ \"Логістик\"",
            supplierCode: "40075815", // Valid EDRPOU
            buyer: "ФОП Коваленко А.С.",
            buyerCode: "3184710691", // Valid IPN
          },
          documentNumber: "НКЛ-2025-0234",
          documentDate: "2025-01-08",
          amount: 42300,
          currency: "UAH",
          subject: "Поставка електроніки (10 позицій)",
          keyTerms: [
            "Вага вантажу: 45 кг",
            "Кількість місць: 3",
          ],
          summary: "Видаткова накладна на поставку електроніки від ТОВ \"Логістик\". 10 позицій, загальна сума 42 300 ₴.",
        },
        other: {
          detectedType: "other",
          confidence: 0.65,
          parties: {
            supplier: "Невизначено",
            buyer: "Невизначено",
          },
          documentDate: new Date().toISOString().split("T")[0],
          summary: "Тип документа не вдалося визначити автоматично. Будь ласка, перевірте та вкажіть тип вручну.",
        },
        "tax-invoice": {
          detectedType: "tax-invoice",
          confidence: 0.88,
          parties: { supplier: "ТОВ \"Продавець\"", supplierCode: "32855961" }, // Valid EDRPOU
          documentNumber: "ПН-2025-001",
          documentDate: "2025-01-10",
          amount: 15000,
          currency: "UAH",
          summary: "Податкова накладна від ТОВ \"Продавець\" на суму 15 000 ₴.",
        },
        "prro-receipt": {
          detectedType: "prro-receipt",
          confidence: 0.95,
          parties: {},
          amount: 350,
          currency: "UAH",
          summary: "Фіскальний чек ПРРО на суму 350 ₴.",
        },
        reconciliation: {
          detectedType: "reconciliation",
          confidence: 0.82,
          parties: { supplier: "ТОВ \"Партнер\"", buyer: "ФОП Тест" },
          summary: "Акт звірки взаєморозрахунків з ТОВ \"Партнер\".",
        },
        certificate: {
          detectedType: "certificate",
          confidence: 0.78,
          parties: {},
          summary: "Довідка або сертифікат.",
        },
        receipt: {
          detectedType: "receipt",
          confidence: 0.85,
          parties: {},
          amount: 1200,
          summary: "Квитанція на суму 1 200 ₴.",
        },
        "power-of-attorney": {
          detectedType: "power-of-attorney",
          confidence: 0.87,
          parties: {},
          validUntil: "2025-12-31",
          summary: "Довіреність на представництво.",
        },
        order: {
          detectedType: "order",
          confidence: 0.80,
          parties: {},
          summary: "Наказ або розпорядження.",
        },
        "payment-order": {
          detectedType: "payment-order",
          confidence: 0.91,
          parties: {},
          amount: 5000,
          summary: "Платіжне доручення на суму 5 000 ₴.",
        },
        "bank-statement": {
          detectedType: "bank-statement",
          confidence: 0.93,
          parties: {},
          summary: "Банківська виписка.",
        },
        "rental-agreement": {
          detectedType: "rental-agreement",
          confidence: 0.89,
          parties: { supplier: "Орендодавець", buyer: "Орендар" },
          summary: "Договір оренди приміщення.",
        },
        "sale-agreement": {
          detectedType: "sale-agreement",
          confidence: 0.88,
          parties: { supplier: "Продавець", buyer: "Покупець" },
          summary: "Договір купівлі-продажу.",
        },
        ttn: {
          detectedType: "ttn",
          confidence: 0.90,
          parties: { supplier: "Відправник", buyer: "Отримувач" },
          summary: "Товарно-транспортна накладна.",
        },
        "employment-order": {
          detectedType: "employment-order",
          confidence: 0.85,
          parties: {},
          summary: "Наказ про прийняття на роботу.",
        },
        "dismissal-order": {
          detectedType: "dismissal-order",
          confidence: 0.85,
          parties: {},
          summary: "Наказ про звільнення.",
        },
        "vacation-order": {
          detectedType: "vacation-order",
          confidence: 0.85,
          parties: {},
          summary: "Наказ про відпустку.",
        },
        "supply-contract": {
          detectedType: "supply-contract",
          confidence: 0.88,
          parties: { supplier: "Постачальник", buyer: "Покупець" },
          summary: "Договір поставки товарів.",
        },
        "fop-service-contract": {
          detectedType: "fop-service-contract",
          confidence: 0.87,
          parties: { supplier: "ФОП-підрядник", buyer: "Замовник" },
          summary: "Договір з ФОП-підрядником.",
        },
        "discrepancy-act": {
          detectedType: "discrepancy-act",
          confidence: 0.85,
          parties: { supplier: "Контрагент", buyer: "Ми" },
          summary: "Акт розбіжностей до документа.",
        },
      };

      resolve(mockResults[detectedType] || mockResults.other);
    }, 2500); // Simulate AI processing time
  });
};

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";

export const UploadDocumentSheet = ({
  cabinet,
  open,
  onOpenChange,
  onChatPromptInsert,
  onDocumentUploaded,
  parentDocumentId,
  relatedDocumentType,
  relatedDocumentDescription,
  onDocumentLinked,
}: UploadDocumentSheetProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [editedType, setEditedType] = useState<DocumentType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when sheet closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep("upload");
      setSelectedFile(null);
      setUploadProgress(0);
      setAnalysisResult(null);
      setEditedType(null);
      setIsDragging(false);
    }
    onOpenChange(open);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Непідтримуваний формат",
        description: "Підтримуються: PDF, DOC, DOCX, JPG, PNG",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "Файл завеликий",
        description: "Максимальний розмір файлу: 20 МБ",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setStep("analyzing");

    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 200);

    // Run mock AI analysis
    try {
      const result = await mockAnalyzeDocument(file.name);
      setAnalysisResult(result);
      setEditedType(result.detectedType);
      setStep("review");
    } catch (error) {
      toast({
        title: "Помилка аналізу",
        description: "Не вдалося проаналізувати документ",
        variant: "destructive",
      });
      setStep("upload");
      setSelectedFile(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStep("saving");

    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate a mock new document ID
    const newDocumentId = `doc-${Date.now()}`;

    // Create new document with bidirectional link
    // In a real implementation, this would be saved to the backend with:
    // linkedDocuments: parentDocumentId ? [parentDocumentId] : []
    const newDocumentData = {
      id: newDocumentId,
      type: editedType || "other",
      linkedDocuments: parentDocumentId ? [parentDocumentId] : [],
      // ... other document fields from analysisResult
    };

    // If linked to parent, call the linking callback for bidirectional connection
    if (parentDocumentId && onDocumentLinked) {
      // This triggers the parent document to add newDocumentId to its linkedDocuments
      onDocumentLinked(newDocumentId);
      toast({
        title: "Документи пов'язано",
        description: `${documentTypeConfigs[editedType || "other"].label} та батьківський документ тепер взаємопов'язані`,
      });
    } else {
      toast({
        title: "Документ збережено",
        description: `${documentTypeConfigs[editedType || "other"].label} додано до системи`,
      });
    }

    setIsSaving(false);
    onDocumentUploaded?.();
    handleOpenChange(false);
  };

  const handleAIHelp = () => {
    const prompt = `Допоможи проаналізувати завантажений документ${selectedFile ? `: ${selectedFile.name}` : ""}`;
    onChatPromptInsert?.(prompt);
    toast({
      title: "AI-підказка",
      description: "Запит відправлено до AI-асистента",
    });
  };

  // Demo analysis - simulate full flow without real file
  const handleDemoAnalysis = async () => {
    const mockFile = new File(
      [new Blob(["demo content"])],
      "Договір_ТОВ_Діджитал_2025.pdf",
      { type: "application/pdf" }
    );
    setSelectedFile(mockFile);
    setStep("analyzing");

    // Faster animation for demo
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 35;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 150);

    // Shorter wait for demo
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const demoResult: AnalysisResult = {
      detectedType: "contract",
      confidence: 0.92,
      parties: {
        supplier: "ТОВ \"Діджитал Солюшнз\"",
        supplierCode: "43567891",
        buyer: "ФОП Петренко І.В.",
        buyerCode: "3456789012",
      },
      documentNumber: "ДОГ-2025-001",
      documentDate: "2025-01-15",
      amount: 75000,
      currency: "UAH",
      subject: "Надання послуг з розробки програмного забезпечення",
      keyTerms: [
        "Строк дії: 12 місяців",
        "Оплата: 50% передоплата, 50% по завершенню",
        "Відповідальність за порушення строків: 0.1% за день",
        "Інтелектуальна власність: замовника",
      ],
      validUntil: "2026-01-15",
      summary: "Договір на надання IT-послуг між ТОВ \"Діджитал Солюшнз\" та ФОП Петренко. Предмет: розробка ПЗ, сума 75 000 ₴, строк 12 міс. Передбачено передоплату 50%.",
    };

    setAnalysisResult(demoResult);
    setEditedType(demoResult.detectedType);
    setStep("review");
  };

  const isDemo = selectedFile?.name.includes("Договір_ТОВ_Діджитал");

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragging && "border-primary bg-primary/10 scale-[1.02]",
          !isDragging && "border-border/70"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isDragging ? "bg-primary/20" : "bg-muted"
          )}>
            <FileUp className={cn(
              "w-8 h-8 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div className="space-y-1">
            <p className="font-medium">
              {isDragging ? "Відпустіть файл тут" : "Перетягніть файл сюди"}
            </p>
            <p className="text-sm text-muted-foreground">
              або натисніть для вибору
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">PDF</Badge>
            <Badge variant="secondary" className="text-xs">DOC/DOCX</Badge>
            <Badge variant="secondary" className="text-xs">JPG/PNG</Badge>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Максимум 20 МБ
          </p>
        </div>
      </div>

      {/* AI Features Hint */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">AI-аналіз документів</p>
              <p className="text-xs text-muted-foreground">
                Система автоматично розпізнає тип документа, сторони, суму та ключові умови
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Analysis Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDemoAnalysis}
          className="gap-2 border-dashed"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          Спробувати демо-аналіз
        </Button>
      </div>
    </div>
  );

  const renderAnalyzingStep = () => (
    <div className="space-y-6 py-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">AI аналізує документ</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Розпізнаємо тип, визначаємо сторони та витягуємо ключові дані
          </p>
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              ({formatFileSize(selectedFile.size)})
            </span>
          </div>
        )}

        <div className="w-full max-w-[280px] space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {uploadProgress < 100 ? "Завантаження..." : "Аналіз..."}
          </p>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    if (!analysisResult) return null;

    const typeConfig = documentTypeConfigs[editedType || analysisResult.detectedType];
    const confidenceColor = analysisResult.confidence >= 0.9 
      ? "text-emerald-600 dark:text-emerald-400" 
      : analysisResult.confidence >= 0.75 
        ? "text-amber-600 dark:text-amber-400" 
        : "text-red-600 dark:text-red-400";

    return (
      <div className="space-y-5">
        {/* File Info */}
        {selectedFile && (
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <div className="flex items-center gap-2">
              {isDemo && (
                <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  ДЕМО
                </Badge>
              )}
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Завантажено
              </Badge>
            </div>
          </div>
        )}

        {/* AI Summary Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">AI-резюме</span>
                  <Badge variant="outline" className={cn("text-[10px] h-5", confidenceColor)}>
                    Впевненість: {Math.round(analysisResult.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Detected Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-muted-foreground" />
            Тип документа
          </Label>
          <Select 
            value={editedType || analysisResult.detectedType} 
            onValueChange={(v) => setEditedType(v as DocumentType)}
          >
            <SelectTrigger>
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

        {/* Parties */}
        {(analysisResult.parties.supplier || analysisResult.parties.buyer) && (
          <div className="grid grid-cols-2 gap-4">
            {analysisResult.parties.supplier && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <User className="w-3 h-3 text-muted-foreground" />
                  Постачальник
                </Label>
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-sm font-medium truncate">{analysisResult.parties.supplier}</p>
                  {analysisResult.parties.supplierCode && (
                    <p className="text-xs text-muted-foreground">
                      {analysisResult.parties.supplierCode.length === 8 ? "ЄДРПОУ" : "ІПН"}: {analysisResult.parties.supplierCode}
                    </p>
                  )}
                </div>
              </div>
            )}
            {analysisResult.parties.buyer && (
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  Покупець
                </Label>
                <div className="p-2 bg-muted/30 rounded-md">
                  <p className="text-sm font-medium truncate">{analysisResult.parties.buyer}</p>
                  {analysisResult.parties.buyerCode && (
                    <p className="text-xs text-muted-foreground">
                      {analysisResult.parties.buyerCode.length === 8 ? "ЄДРПОУ" : "ІПН"}: {analysisResult.parties.buyerCode}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {analysisResult.documentNumber && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Номер</Label>
              <Input value={analysisResult.documentNumber} readOnly className="h-9 bg-muted/30" />
            </div>
          )}
          {analysisResult.documentDate && (
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Дата
              </Label>
              <Input 
                type="date" 
                value={analysisResult.documentDate} 
                readOnly 
                className="h-9 bg-muted/30" 
              />
            </div>
          )}
        </div>

        {/* Amount */}
        {analysisResult.amount !== undefined && (
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              Сума
            </Label>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <span className="text-lg font-semibold">
                {analysisResult.amount.toLocaleString("uk-UA")} {analysisResult.currency || "₴"}
              </span>
            </div>
          </div>
        )}

        {/* Key Terms */}
        {analysisResult.keyTerms && analysisResult.keyTerms.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Ключові умови</Label>
            <div className="space-y-1.5">
              {analysisResult.keyTerms.map((term, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSavingStep = () => (
    <div className="space-y-6 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold">Збереження документа</h3>
          <p className="text-sm text-muted-foreground">
            Зачекайте, додаємо документ до системи...
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            {relatedDocumentDescription 
              ? `Завантажити: ${relatedDocumentDescription}` 
              : "Завантажити документ"}
          </SheetTitle>
          <SheetDescription>
            {step === "upload" && (relatedDocumentType 
              ? `Завантажте ${relatedDocumentDescription?.toLowerCase() || "супутній документ"} для прив'язки`
              : "Завантажте існуючий документ для AI-аналізу")}
            {step === "analyzing" && "Аналізуємо документ..."}
            {step === "review" && "Перевірте та підтвердіть дані"}
            {step === "saving" && "Збереження..."}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="pb-4">
            {step === "upload" && renderUploadStep()}
            {step === "analyzing" && renderAnalyzingStep()}
            {step === "review" && renderReviewStep()}
            {step === "saving" && renderSavingStep()}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          {step === "upload" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIHelp}
                className="gap-1.5"
              >
                <Bot className="w-4 h-4" />
                AI-допомога
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Скасувати
              </Button>
            </>
          )}

          {step === "review" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setSelectedFile(null);
                  setAnalysisResult(null);
                }}
              >
                Інший файл
              </Button>
              <div className="flex-1" />
              <Button
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Скасувати
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Зберегти
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
