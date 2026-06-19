import { useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Building2, Key, FileText, CheckCircle2, Shield, ArrowRight,
  Loader2, AlertCircle, User, MapPin, Phone, Mail, Hash,
  Briefcase, Calendar, RefreshCw, ChevronRight, ExternalLink,
  Bell, Sparkles, Users, FileSignature, Play, Edit3, Landmark,
  XCircle, Upload, Trash2, File, FileImage, FileScan,
  Eye, ZoomIn, ZoomOut, Download, Database, ChevronDown, Info, FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  validateEdrpou,
  validateIpn,
  validateIban,
  validatePhone,
  validateEmail,
  getCodeValidationError,
  getIbanValidationError,
} from "@/lib/validators";

// Demo data that would come from government registries via KEP
// Using valid EDRPOU/IPN codes that pass checksum validation
const mockRegistryData = {
  legal: {
    name: 'ТОВ "Технопром Груп"',
    code: "32855961", // Valid EDRPOU (passes checksum)
    address: "м. Київ, вул. Хрещатик, 22, офіс 501",
    director: "Петренко Олександр Васильович",
    directorPosition: "Директор",
    phone: "+380441234567",
    email: "info@technoprom.ua",
    kveds: ["62.01 — Комп'ютерне програмування", "62.02 — Консультування з питань інформатизації"],
    registrationDate: "2019-03-15",
    taxStatus: "vat",
    bankName: "АТ КБ «ПриватБанк»",
    iban: "UA213223130000026007233566001",
  },
  fop: {
    name: "ФОП Коваленко Ірина Петрівна",
    code: "3184710691", // Valid IPN (passes checksum)
    address: "м. Львів, вул. Франка, 15, кв. 42",
    director: "Коваленко Ірина Петрівна",
    directorPosition: "Фізична особа-підприємець",
    phone: "+380679876543",
    email: "kovalenko.ip@gmail.com",
    kveds: ["72.19 — Дослідження й експериментальні розробки"],
    registrationDate: "2021-08-22",
    taxStatus: "ep3",
    bankName: "АТ «Ощадбанк»",
    iban: "UA213223130000026007233566001",
  },
};

const taxStatusOptions = [
  { value: "vat", label: "Платник ПДВ" },
  { value: "ep1", label: "ЄП 1 група" },
  { value: "ep2", label: "ЄП 2 група" },
  { value: "ep3", label: "ЄП 3 група" },
  { value: "ep3-vat", label: "ЄП 3 група + ПДВ" },
  { value: "general", label: "Загальна система" },
  { value: "unknown", label: "Невідомо" },
];

type OnboardingStep = "welcome" | "data-entry" | "complete";
type DataSource = "kep" | "manual" | null;

interface UploadedDocument {
  id: string;
  type: "charter" | "edr_extract" | "vat_certificate" | "ep_extract" | "license" | "power_of_attorney" | "other";
  name: string;
  file: File;
  size: number;
  uploadedAt: Date;
}

const documentTypes = [
  { value: "charter", label: "Статут", forLegal: true, forFop: false },
  { value: "edr_extract", label: "Виписка з ЄДР", forLegal: true, forFop: true },
  { value: "vat_certificate", label: "Свідоцтво ПДВ", forLegal: true, forFop: true },
  { value: "ep_extract", label: "Виписка платника ЄП", forLegal: false, forFop: true },
  { value: "license", label: "Ліцензія", forLegal: true, forFop: true },
  { value: "power_of_attorney", label: "Довіреність", forLegal: true, forFop: false },
  { value: "other", label: "Інший документ", forLegal: true, forFop: true },
];

// Document types that require manual upload (not available from registries)
const manualOnlyDocumentTypes = [
  { value: "charter", label: "Статут (повноваження)", forLegal: true, forFop: false },
  { value: "license", label: "Ліцензія", forLegal: true, forFop: true },
  { value: "power_of_attorney", label: "Довіреність", forLegal: true, forFop: false },
  { value: "other", label: "Інший документ", forLegal: true, forFop: true },
];

interface FormData {
  name: string;
  code: string;
  address: string;
  director: string;
  directorPosition: string;
  phone: string;
  email: string;
  iban: string;
  bankName: string;
  taxStatus: string;
  kveds: string[];
  registrationDate: string;
}

const emptyFormData: FormData = {
  name: "",
  code: "",
  address: "",
  director: "",
  directorPosition: "",
  phone: "",
  email: "",
  iban: "",
  bankName: "",
  taxStatus: "",
  kveds: [],
  registrationDate: "",
};

export default function ContractorOnboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = searchParams.get("code") || "";
  const inviterName = searchParams.get("from") || "ФОП Іваненко М.В.";
  const isDemo = !inviteCode;
  
  // Validate invite code format (ABC-123-XYZ)
  const isValidCode = inviteCode ? /^[A-Z]{3}-[0-9]{3}-[A-Z]{3}$/i.test(inviteCode) : true;

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [dataSource, setDataSource] = useState<DataSource>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isKepLoading, setIsKepLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDataProcessing, setAgreedToDataProcessing] = useState(false);
  const [relationshipType, setRelationshipType] = useState<"buyer" | "supplier" | "both">("supplier");
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

  // Unified form state
  const [formData, setFormData] = useState<FormData>(emptyFormData);

  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document preview state
  const [previewDocument, setPreviewDocument] = useState<UploadedDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Document handlers
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleFileAdd(file));
  }, []);

  const handleFileAdd = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Підтримуються тільки PDF, JPG, PNG");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Максимальний розмір файлу: 10 МБ");
      return;
    }
    
    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "other",
      name: file.name,
      file,
      size: file.size,
      uploadedAt: new Date(),
    };
    
    setUploadedDocuments(prev => [...prev, newDoc]);
  };

  const handleRemoveDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const updateDocumentType = (docId: string, type: UploadedDocument["type"]) => {
    setUploadedDocuments(prev => 
      prev.map(d => d.id === docId ? { ...d, type } : d)
    );
  };

  // Preview handlers
  const handlePreviewDocument = useCallback((doc: UploadedDocument) => {
    const url = URL.createObjectURL(doc.file);
    setPreviewUrl(url);
    setPreviewDocument(doc);
    setPreviewZoom(100);
  }, []);

  const handleClosePreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewDocument(null);
    setPreviewZoom(100);
  }, [previewUrl]);

  const handlePreviewZoomIn = () => setPreviewZoom(prev => Math.min(prev + 25, 200));
  const handlePreviewZoomOut = () => setPreviewZoom(prev => Math.max(prev - 25, 50));

  const handleDownloadDocument = (doc: UploadedDocument) => {
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Завантажено", { description: doc.name });
  };

  // Validation with memoization
  const codeError = useMemo(() => {
    if (!formData.code) return null;
    return getCodeValidationError(formData.code, formData.code.length === 8 ? "tov" : "fop");
  }, [formData.code]);

  const ibanError = useMemo(() => {
    if (!formData.iban) return null;
    return getIbanValidationError(formData.iban);
  }, [formData.iban]);

  const phoneError = useMemo(() => {
    if (!formData.phone) return null;
    return !validatePhone(formData.phone) ? "Формат: +380XXXXXXXXX" : null;
  }, [formData.phone]);

  const emailError = useMemo(() => {
    if (!formData.email) return null;
    return !validateEmail(formData.email) ? "Невірний формат email" : null;
  }, [formData.email]);

  const isFormValid = useMemo(() => {
    const hasRequiredFields = 
      formData.name.trim().length >= 3 &&
      (formData.code.length === 8 || formData.code.length === 10) &&
      !codeError &&
      formData.email.trim().length > 0 &&
      !emailError;
    
    const hasNoErrors = !ibanError && !phoneError;
    
    return hasRequiredFields && hasNoErrors;
  }, [formData, codeError, ibanError, phoneError, emailError]);

  // Filter document types based on data source
  const availableDocumentTypes = useMemo(() => {
    const isLegal = formData.code.length === 8;
    
    if (dataSource === "kep") {
      // For KEP - only manual documents (charter, license, power of attorney)
      return manualOnlyDocumentTypes.filter(dt => isLegal ? dt.forLegal : dt.forFop);
    }
    
    // For manual entry - all document types
    return documentTypes.filter(dt => isLegal ? dt.forLegal : dt.forFop);
  }, [dataSource, formData.code]);

  const handleKepLogin = async () => {
    setIsKepLoading(true);

    // Simulate KEP authentication and registry lookup
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Randomly pick legal or fop for demo
    const dataType = Math.random() > 0.5 ? "legal" : "fop";
    const regData = mockRegistryData[dataType];
    
    setFormData({
      name: regData.name,
      code: regData.code,
      address: regData.address,
      director: regData.director,
      directorPosition: regData.directorPosition,
      phone: regData.phone,
      email: regData.email,
      iban: regData.iban,
      bankName: regData.bankName,
      taxStatus: regData.taxStatus,
      kveds: regData.kveds,
      registrationDate: regData.registrationDate,
    });
    
    setAutoFilledFields([
      "name", "code", "address", "director", "directorPosition",
      "phone", "email", "iban", "bankName", "taxStatus", "kveds"
    ]);
    setDataSource("kep");
    setIsKepLoading(false);
    setStep("data-entry");
  };

  const handleManualEntry = () => {
    setFormData(emptyFormData);
    setAutoFilledFields([]);
    setDataSource("manual");
    setStep("data-entry");
  };

  const handleConfirm = async () => {
    if (!agreedToTerms || !agreedToDataProcessing) {
      toast.error("Погодьтеся з умовами для продовження");
      return;
    }

    if (!isFormValid) {
      toast.error("Перевірте правильність заповнення полів");
      return;
    }

    setIsLoading(true);
    
    // In production: upload documents to storage
    // const uploadedUrls = await Promise.all(
    //   uploadedDocuments.map(doc => uploadToStorage(doc.file))
    // );
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep("complete");
    
    toast.success("Реєстрацію завершено!", {
      description: uploadedDocuments.length > 0 
        ? `Завантажено ${uploadedDocuments.length} документ(ів)`
        : "Ваші реквізити синхронізовано",
    });
  };

  const getStepProgress = () => {
    const steps: OnboardingStep[] = ["welcome", "data-entry", "complete"];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const isFieldAutoFilled = (field: string) => autoFilledFields.includes(field);

  const getCodeLabel = () => {
    if (formData.code.length === 8) return "ЄДРПОУ";
    if (formData.code.length === 10) return "ІПН";
    return "ЄДРПОУ / ІПН";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-sans font-semibold tracking-wide text-base">FINTODO</h1>
                <p className="text-xs text-muted-foreground">Реєстрація контрагента</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDemo && (
                <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-700 dark:text-amber-400">
                  <Play className="h-3 w-3" />
                  Демо
                </Badge>
              )}
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                Безкоштовно
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container max-w-3xl mx-auto px-4 pt-6">
        <Progress value={getStepProgress()} className="h-1" />
      </div>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-8">
        {/* Welcome Step */}
        {step === "welcome" && (
          <div className="space-y-6">
            {/* Invalid Code Alert */}
            {!isValidCode && inviteCode && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-medium">Невірний формат коду запрошення</p>
                      <p className="text-sm text-muted-foreground">
                        Код має бути у форматі ABC-123-XYZ. Перевірте посилання від відправника.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="border-primary/20">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Вас запросили до співпраці</CardTitle>
                <CardDescription className="text-base">
                  <span className="font-medium text-foreground">{inviterName}</span> запрошує вас
                  синхронізувати реквізити для зручного документообігу
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3">
                  {[
                    { icon: CheckCircle2, text: "Безкоштовний пасивний кабінет" },
                    { icon: RefreshCw, text: "Автоматичне оновлення реквізитів у партнерів" },
                    { icon: FileText, text: "Швидке підписання документів" },
                    { icon: Shield, text: "Повний контроль над вашими даними" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <item.icon className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* KEP vs Manual selection */}
                <div className="space-y-3 pt-2">
                  <Card 
                    className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                    onClick={handleKepLogin}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {isKepLoading ? (
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          ) : (
                            <Key className="h-6 w-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">Увійти через КЕП</h3>
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                              Рекомендовано
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Автозаповнення з ЄДР, реєстру ПДВ та ЄП
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {["Назва", "Код", "Адреса", "КВЕДи", "Статус"].map(item => (
                              <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleManualEntry}
                    disabled={!isValidCode && !!inviteCode}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Заповнити вручну
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* KEP Loading overlay */}
        {isKepLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="text-center py-12 px-8 max-w-md mx-4">
              <CardContent className="space-y-6 p-0">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Зчитуємо дані з реєстрів...</h2>
                  <p className="text-muted-foreground">
                    Підключення до ЄДР, реєстру платників ПДВ та ЄП
                  </p>
                </div>
                <div className="max-w-xs mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>КЕП верифіковано</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Завантаження даних з ЄДР...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Entry Step (Unified) */}
        {step === "data-entry" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">
                {dataSource === "kep" ? "Перевірте ваші реквізити" : "Введіть ваші реквізити"}
              </h2>
              <p className="text-muted-foreground">
                {dataSource === "kep" 
                  ? "Дані отримано з реєстрів. За потреби ви можете їх відредагувати"
                  : "Заповніть обов'язкові поля для реєстрації"
                }
              </p>
            </div>

            {/* Data source indicator */}
            {dataSource === "kep" && (
              <Card className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">Дані з державних реєстрів</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">ЄДР, реєстр ПДВ, реєстр ЄП • Оновлено сьогодні</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Form */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Основні реквізити
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name + Code */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="name">
                        Повна назва <span className="text-destructive">*</span>
                      </Label>
                      {isFieldAutoFilled("name") && (
                        <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          З реєстру
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="name"
                      placeholder='ТОВ "Назва" або ФОП Прізвище І.П.'
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className={cn(
                        isFieldAutoFilled("name") && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="code">
                        {getCodeLabel()} <span className="text-destructive">*</span>
                      </Label>
                      {isFieldAutoFilled("code") && (
                        <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          З реєстру
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="code"
                        placeholder="12345678 або 1234567890"
                        value={formData.code}
                        onChange={(e) => updateField("code", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        maxLength={10}
                        className={cn(
                          "font-mono pr-10",
                          codeError && "border-destructive",
                          !codeError && formData.code.length >= 8 && "border-emerald-500",
                          isFieldAutoFilled("code") && !codeError && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                        )}
                      />
                      {formData.code && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {codeError ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : formData.code.length >= 8 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : null}
                        </div>
                      )}
                    </div>
                    {codeError && <p className="text-xs text-destructive">{codeError}</p>}
                    {!codeError && formData.code.length > 0 && formData.code.length < 8 && (
                      <p className="text-xs text-muted-foreground">8 цифр — ЄДРПОУ, 10 цифр — ІПН</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="address">Юридична адреса</Label>
                    {isFieldAutoFilled("address") && (
                      <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        З реєстру
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="address"
                    placeholder="м. Київ, вул. Хрещатик, 1"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className={cn(
                      isFieldAutoFilled("address") && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                    )}
                  />
                </div>

                {/* Director + Position */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="director">Керівник / ПІБ ФОП</Label>
                      {isFieldAutoFilled("director") && (
                        <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          З реєстру
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="director"
                      placeholder="Прізвище Ім'я По батькові"
                      value={formData.director}
                      onChange={(e) => updateField("director", e.target.value)}
                      className={cn(
                        isFieldAutoFilled("director") && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="directorPosition">Посада</Label>
                    <Input
                      id="directorPosition"
                      placeholder="Директор"
                      value={formData.directorPosition}
                      onChange={(e) => updateField("directorPosition", e.target.value)}
                      className={cn(
                        isFieldAutoFilled("directorPosition") && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      {isFieldAutoFilled("email") && (
                        <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          З реєстру
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@company.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className={cn(
                          "pr-10",
                          emailError && "border-destructive",
                          !emailError && formData.email && "border-emerald-500",
                          isFieldAutoFilled("email") && !emailError && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                        )}
                      />
                      {formData.email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {emailError ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone">Телефон</Label>
                      {isFieldAutoFilled("phone") && (
                        <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          З реєстру
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="phone"
                        placeholder="+380XXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value.replace(/[^\d+]/g, "").slice(0, 13))}
                        maxLength={13}
                        className={cn(
                          "font-mono pr-10",
                          phoneError && "border-destructive",
                          !phoneError && formData.phone && "border-emerald-500",
                          isFieldAutoFilled("phone") && !phoneError && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                        )}
                      />
                      {formData.phone && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {phoneError ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
                  </div>
                </div>

                <Separator />

                {/* Tax Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="taxStatus">Податковий статус</Label>
                    {isFieldAutoFilled("taxStatus") && (
                      <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        З реєстру
                      </Badge>
                    )}
                  </div>
                  <Select 
                    value={formData.taxStatus} 
                    onValueChange={(v) => updateField("taxStatus", v)}
                  >
                    <SelectTrigger className={cn(
                      isFieldAutoFilled("taxStatus") && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                    )}>
                      <SelectValue placeholder="Оберіть статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxStatusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* KVEDs display (read-only from KEP) */}
                {formData.kveds.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <Label>КВЕДи</Label>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.kveds.map((kved, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {kved}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-primary" />
                  Банківські реквізити
                </CardTitle>
                <CardDescription>
                  Опціонально — можна додати пізніше
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="iban">IBAN</Label>
                      {isFieldAutoFilled("iban") && (
                        <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          З реєстру
                        </Badge>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="iban"
                        placeholder="UA..."
                        value={formData.iban}
                        onChange={(e) => updateField("iban", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 29))}
                        maxLength={29}
                        className={cn(
                          "font-mono pr-10",
                          ibanError && "border-destructive",
                          !ibanError && formData.iban && "border-emerald-500",
                          isFieldAutoFilled("iban") && !ibanError && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                        )}
                      />
                      {formData.iban && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {ibanError ? (
                            <XCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {ibanError && <p className="text-xs text-destructive">{ibanError}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bankName">Назва банку</Label>
                      {isFieldAutoFilled("bankName") && (
                        <Badge variant="secondary" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          З реєстру
                        </Badge>
                      )}
                    </div>
                    <Input
                      id="bankName"
                      placeholder="АТ КБ «ПриватБанк»"
                      value={formData.bankName}
                      onChange={(e) => updateField("bankName", e.target.value)}
                      className={cn(
                        isFieldAutoFilled("bankName") && "border-emerald-300 bg-emerald-50/30 dark:border-emerald-700 dark:bg-emerald-950/20"
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Section - Conditional based on dataSource */}
            {dataSource === "kep" ? (
              /* KEP: Auto-retrieved data + Collapsible for optional uploads */
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Дані з реєстрів
                  </CardTitle>
                  <CardDescription>
                    Інформація отримана автоматично через КЕП
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Info block about auto-retrieved documents */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                          Ці документи отримано автоматично з державних реєстрів:
                        </p>
                        <ul className="space-y-1.5">
                          <li className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            Виписка з Єдиного державного реєстру
                          </li>
                          {(formData.taxStatus === "vat" || formData.taxStatus === "ep3-vat") && (
                            <li className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              Свідоцтво платника ПДВ
                            </li>
                          )}
                          {formData.taxStatus?.startsWith("ep") && (
                            <li className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              Витяг платника єдиного податку
                            </li>
                          )}
                          {formData.kveds.length > 0 && (
                            <li className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              Коди КВЕД ({formData.kveds.length})
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible for optional document uploads */}
                  <Collapsible open={isDocumentsExpanded} onOpenChange={setIsDocumentsExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between h-auto p-3 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <FileScan className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Додати статут, ліцензії або довіреність
                          </span>
                          {uploadedDocuments.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {uploadedDocuments.length}
                            </Badge>
                          )}
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          isDocumentsExpanded && "rotate-180"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3 space-y-4">
                      {/* Explanation */}
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-muted-foreground">
                          Завантажте документи для перевірки повноважень підписанта або ліцензій на певні види діяльності
                        </p>
                      </div>

                      {/* Uploaded documents list */}
                      {uploadedDocuments.length > 0 && (
                        <div className="space-y-2">
                          {uploadedDocuments.map(doc => (
                            <div 
                              key={doc.id} 
                              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                            >
                              <div 
                                className="relative h-12 w-12 rounded-md border bg-background overflow-hidden cursor-pointer group shrink-0"
                                onClick={() => handlePreviewDocument(doc)}
                              >
                                {doc.file.type.startsWith("image/") ? (
                                  <img 
                                    src={URL.createObjectURL(doc.file)} 
                                    alt={doc.name}
                                    className="h-full w-full object-cover"
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-red-50 dark:bg-red-950/30">
                                    <File className="h-6 w-6 text-red-500" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                  <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.size / 1024 / 1024).toFixed(2)} МБ
                                </p>
                              </div>
                              <Select 
                                value={doc.type} 
                                onValueChange={(v) => updateDocumentType(doc.id, v as UploadedDocument["type"])}
                              >
                                <SelectTrigger className="w-40 hidden sm:flex">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableDocumentTypes.map(dt => (
                                    <SelectItem key={dt.value} value={dt.value}>
                                      {dt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handlePreviewDocument(doc)}
                                  className="text-muted-foreground hover:text-primary h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRemoveDocument(doc.id)}
                                  className="text-muted-foreground hover:text-destructive h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Drop zone */}
                      <div
                        onDragEnter={handleDragEnter}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                          "hover:border-primary/50 hover:bg-muted/30",
                          isDragging && "border-primary bg-primary/5"
                        )}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            files.forEach(file => handleFileAdd(file));
                            e.target.value = "";
                          }}
                        />
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {isDragging ? "Відпустіть файли тут" : "Перетягніть файли або натисніть"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF, JPG, PNG до 10 МБ
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>
            ) : (
              /* Manual: Warning + Full upload section */
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileScan className="h-4 w-4 text-primary" />
                    Документи
                  </CardTitle>
                  <CardDescription>
                    Завантажте скани для верифікації даних
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Warning about manual entry */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-300">
                        <p className="font-medium">Без автентифікації через КЕП</p>
                        <p className="text-amber-700 dark:text-amber-400 mt-1">
                          Рекомендуємо завантажити виписку з ЄДР для верифікації реквізитів. 
                          Це пришвидшить підтвердження вашого профілю.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded documents list */}
                  {uploadedDocuments.length > 0 && (
                    <div className="space-y-2">
                      {uploadedDocuments.map(doc => (
                        <div 
                          key={doc.id} 
                          className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                        >
                          <div 
                            className="relative h-12 w-12 rounded-md border bg-background overflow-hidden cursor-pointer group shrink-0"
                            onClick={() => handlePreviewDocument(doc)}
                          >
                            {doc.file.type.startsWith("image/") ? (
                              <img 
                                src={URL.createObjectURL(doc.file)} 
                                alt={doc.name}
                                className="h-full w-full object-cover"
                                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-red-50 dark:bg-red-950/30">
                                <File className="h-6 w-6 text-red-500" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(doc.size / 1024 / 1024).toFixed(2)} МБ
                            </p>
                          </div>
                          <Select 
                            value={doc.type} 
                            onValueChange={(v) => updateDocumentType(doc.id, v as UploadedDocument["type"])}
                          >
                            <SelectTrigger className="w-40 hidden sm:flex">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableDocumentTypes.map(dt => (
                                <SelectItem key={dt.value} value={dt.value}>
                                  {dt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handlePreviewDocument(doc)}
                              className="text-muted-foreground hover:text-primary h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="text-muted-foreground hover:text-destructive h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drop zone */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                      "hover:border-primary/50 hover:bg-muted/30",
                      isDragging && "border-primary bg-primary/5"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleFileAdd(file));
                        e.target.value = "";
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {isDragging ? "Відпустіть файли тут" : "Перетягніть файли або натисніть"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, JPG, PNG до 10 МБ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended documents hint */}
                  {uploadedDocuments.length === 0 && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium">Рекомендовані документи:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {formData.code.length === 8 ? (
                          <>
                            <li>Статут (остання редакція)</li>
                            <li>Виписка з ЄДР</li>
                            {formData.taxStatus === "vat" && <li>Свідоцтво платника ПДВ</li>}
                          </>
                        ) : (
                          <>
                            <li>Виписка з ЄДР</li>
                            {formData.taxStatus?.startsWith("ep") && <li>Витяг платника ЄП</li>}
                            {formData.taxStatus === "vat" && <li>Свідоцтво платника ПДВ</li>}
                          </>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Relationship Type Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Напрямок співпраці
                </CardTitle>
                <CardDescription>
                  Як ви співпрацюєте з {inviterName}?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={relationshipType} 
                  onValueChange={(v) => setRelationshipType(v as typeof relationshipType)}
                  className="space-y-3"
                >
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="supplier" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Ми постачальники</p>
                      <p className="text-xs text-muted-foreground">
                        Ви продаєте товари/послуги для {inviterName}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="buyer" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Ми покупці</p>
                      <p className="text-xs text-muted-foreground">
                        Ви купуєте товари/послуги у {inviterName}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="both" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Обидва напрямки</p>
                      <p className="text-xs text-muted-foreground">
                        І продаємо, і купуємо
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Agreements */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    Погоджуюся з{" "}
                    <a href="#" className="text-primary underline">Умовами використання</a>
                    {" "}та{" "}
                    <a href="#" className="text-primary underline">Політикою конфіденційності</a>
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="data"
                    checked={agreedToDataProcessing}
                    onCheckedChange={(checked) => setAgreedToDataProcessing(checked === true)}
                  />
                  <label htmlFor="data" className="text-sm leading-relaxed cursor-pointer">
                    Даю згоду на обробку персональних даних та синхронізацію реквізитів
                    з партнером <span className="font-medium">{inviterName}</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Validation summary */}
            {!isFormValid && (formData.name || formData.code || formData.email) && (
              <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">Заповніть обов'язкові поля</p>
                      <ul className="text-amber-700 dark:text-amber-400 space-y-0.5 text-xs">
                        {formData.name.trim().length < 3 && <li>• Назва (мінімум 3 символи)</li>}
                        {(formData.code.length < 8 || codeError) && <li>• Коректний ЄДРПОУ або ІПН</li>}
                        {(!formData.email || emailError) && <li>• Коректний Email</li>}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("welcome")}>
                Назад
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleConfirm}
                disabled={!agreedToTerms || !agreedToDataProcessing || !isFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Збереження...
                  </>
                ) : (
                  <>
                    Підтвердити реквізити
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center space-y-4">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Реєстрацію завершено!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ваші реквізити синхронізовано з <span className="font-medium">{inviterName}</span>
                </p>
              </div>
            </div>

            {/* Summary Card */}
            <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold">Підсумок</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Компанія:</span>
                    <span className="font-medium text-right">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{getCodeLabel()}:</span>
                    <span className="font-mono">{formData.code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Партнер:</span>
                    <span className="font-medium">{inviterName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Напрямок:</span>
                    <Badge variant="outline">
                      {relationshipType === "buyer" && "Покупець"}
                      {relationshipType === "supplier" && "Постачальник"}
                      {relationshipType === "both" && "Обидва напрямки"}
                    </Badge>
                  </div>
                  {formData.taxStatus && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Статус:</span>
                      <Badge variant="outline">
                        {taxStatusOptions.find(o => o.value === formData.taxStatus)?.label || formData.taxStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-medium text-center">Що далі?</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Building2, label: "Мій кабінет", description: "Керуйте реквізитами та документами" },
                  { icon: FileSignature, label: "Документи", description: "Перегляньте спільні документи" },
                  { icon: Bell, label: "Сповіщення", description: "Налаштуйте важливі нагадування" },
                  { icon: Shield, label: "Безпека", description: "Перевірте налаштування КЕП" },
                ].map((action, i) => (
                  <Card key={i} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <action.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Info about passive cabinet */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RefreshCw className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Автоматична синхронізація</p>
                    <p className="text-muted-foreground">
                      При зміні ваших реквізитів — партнери отримають оновлення автоматично.
                      Ви маєте повний контроль над своїми даними.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main CTA */}
            <div className="flex justify-center pt-2">
              <Button 
                size="lg" 
                className="gap-2 px-8" 
                onClick={() => navigate("/dashboard", { 
                  state: { 
                    activeCabinetId: "passive-demo-1",
                    tab: "overview" 
                  } 
                })}
              >
                Перейти до кабінету
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Або закрийте цю сторінку — все вже збережено
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-6">
        <div className="container max-w-3xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 AI-Бухгалтер. Всі права захищено</p>
          <p className="mt-1">
            Потрібна допомога?{" "}
            <a href="#" className="text-primary hover:underline">Зв'язатися з підтримкою</a>
          </p>
        </div>
      </footer>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDocument} onOpenChange={(open) => !open && handleClosePreview()}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="flex-row items-center justify-between p-4 pr-14 border-b space-y-0">
            <div className="flex items-center gap-2 min-w-0">
              {previewDocument?.file.type.startsWith("image/") ? (
                <FileImage className="h-5 w-5 text-blue-500 shrink-0" />
              ) : (
                <File className="h-5 w-5 text-red-500 shrink-0" />
              )}
              <DialogTitle className="text-base font-semibold truncate">
                {previewDocument?.name}
              </DialogTitle>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Zoom controls - only for images */}
              {previewDocument?.file.type.startsWith("image/") && (
                <div className="flex items-center gap-1 border rounded-lg p-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={handlePreviewZoomOut} 
                    disabled={previewZoom <= 50}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{previewZoom}%</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={handlePreviewZoomIn} 
                    disabled={previewZoom >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Download button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => previewDocument && handleDownloadDocument(previewDocument)}
              >
                <Download className="h-4 w-4 mr-2" />
                Завантажити
              </Button>
            </div>
          </DialogHeader>
          
          {/* Content area */}
          <div className="flex-1 overflow-hidden bg-muted/30">
            {previewUrl && previewDocument?.file.type.startsWith("image/") && (
              <ScrollArea className="h-full">
                <div className="p-4 flex justify-center min-h-full">
                  <img 
                    src={previewUrl} 
                    alt={previewDocument.name}
                    className="max-w-full h-auto rounded-lg shadow-lg transition-transform"
                    style={{ 
                      width: `${previewZoom}%`,
                      maxWidth: `${previewZoom * 10}px` 
                    }}
                  />
                </div>
              </ScrollArea>
            )}
            
            {previewUrl && previewDocument?.file.type === "application/pdf" && (
              <iframe 
                src={previewUrl}
                className="w-full h-full border-0"
                title={previewDocument.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
