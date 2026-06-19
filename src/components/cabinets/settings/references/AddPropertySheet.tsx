import { useState, useCallback, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  PenLine,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { classifyPropertyDocument, type PropertyClassificationResult } from "@/lib/documentAnalysis/classifyUploadedDocument";
import {
  PROPERTY_TYPE_LABELS,
  ACQUISITION_METHOD_LABELS,
  RECOGNIZABLE_DOCUMENT_TYPES,
  MOCK_RECOGNITION_PRESETS,
  REQUIRED_DOCUMENTS_BY_TYPE,
  type PropertyType,
  type AcquisitionMethod,
  type PropertyObject,
  type PropertyRequiredDocument,
} from "@/config/propertyRegistryConfig";

interface AddPropertySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (property: PropertyObject) => void;
  editProperty?: PropertyObject | null;
  onUpdate?: (property: PropertyObject) => void;
  initialTab?: "upload" | "manual";
  targetChecklistItemId?: string | null;
}

type UploadState = "idle" | "uploading" | "recognizing" | "recognized";

const SHARE_OPTIONS = [
  { value: "1", label: "1/1" },
  { value: "0.5", label: "1/2" },
  { value: "0.333", label: "1/3" },
  { value: "0.25", label: "1/4" },
];

export const AddPropertySheet = ({
  open,
  onOpenChange,
  onAdd,
  editProperty,
  onUpdate,
  initialTab,
  targetChecklistItemId,
}: AddPropertySheetProps) => {
  const isEdit = !!editProperty;
  const [activeTab, setActiveTab] = useState(initialTab ?? (isEdit ? "manual" : "upload"));

  // Resolve the checklist item from all property types
  const targetChecklistItem = targetChecklistItemId
    ? Object.values(REQUIRED_DOCUMENTS_BY_TYPE)
        .flat()
        .find((item) => item.id === targetChecklistItemId) ?? null
    : null;

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab ?? (isEdit ? "manual" : "upload"));
    }
  }, [open, initialTab, isEdit]);

  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Recognized form fields (structured)
  const [recDocType, setRecDocType] = useState("");
  const [recType, setRecType] = useState<PropertyType>("apartment");
  const [recDescription, setRecDescription] = useState("");
  const [recAddress, setRecAddress] = useState("");
  const [recShare, setRecShare] = useState("1");
  const [recDate, setRecDate] = useState("");
  const [recMethod, setRecMethod] = useState<AcquisitionMethod>("purchase");
  const [recValue, setRecValue] = useState("");

  // Manual form state
  const [formType, setFormType] = useState<PropertyType>("apartment");
  const [formDescription, setFormDescription] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formShare, setFormShare] = useState("1");
  const [formDate, setFormDate] = useState("");
  const [formMethod, setFormMethod] = useState<AcquisitionMethod>("purchase");
  const [formValue, setFormValue] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (editProperty && open) {
      setActiveTab("manual");
      setFormType(editProperty.type);
      setFormDescription(editProperty.description);
      setFormAddress(editProperty.address || "");
      setFormShare(String(editProperty.ownershipShare));
      setFormDate(editProperty.acquisitionDate);
      setFormMethod(editProperty.acquisitionMethod);
      setFormValue(editProperty.estimatedValue ? String(editProperty.estimatedValue) : "");
    }
  }, [editProperty, open]);

  const resetState = () => {
    setUploadState("idle");
    setUploadProgress(0);
    setUploadedFileName("");
    setIsDragOver(false);
    setRecDocType("");
    setRecType("apartment");
    setRecDescription("");
    setRecAddress("");
    setRecShare("1");
    setRecDate("");
    setRecMethod("purchase");
    setRecValue("");
    setFormType("apartment");
    setFormDescription("");
    setFormAddress("");
    setFormShare("1");
    setFormDate("");
    setFormMethod("purchase");
    setFormValue("");
    setActiveTab("upload");
  };

  const simulateUpload = useCallback((fileName: string) => {
    setUploadedFileName(fileName);
    setUploadState("uploading");
    setUploadProgress(0);

    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setUploadState("recognizing");

          setTimeout(() => {
            // Pick random mock preset for realism
            const preset = MOCK_RECOGNITION_PRESETS[Math.floor(Math.random() * MOCK_RECOGNITION_PRESETS.length)];
            // If uploading for a specific checklist item, use its matchClassification as docType
            const docType = targetChecklistItem?.matchClassifications?.[0] ?? preset.docType;
            setRecDocType(docType);
            setRecType(preset.type);
            setRecDescription(preset.description);
            setRecAddress(preset.address);
            setRecShare(preset.share);
            setRecDate(preset.date);
            setRecMethod(preset.method);
            setRecValue(preset.value);
            setUploadState("recognized");
          }, 2000);

          return 100;
        }
        return prev + 15;
      });
    }, 200);
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) simulateUpload(file.name);
    },
    [simulateUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) simulateUpload(file.name);
    },
    [simulateUpload]
  );

  const handleConfirmRecognized = (): PropertyObject => {
    const newProperty: PropertyObject = {
      id: `prop-${Date.now()}`,
      type: recType,
      description: recDescription || PROPERTY_TYPE_LABELS[recType],
      address: recAddress || undefined,
      ownershipShare: parseFloat(recShare) || 1,
      acquisitionDate: recDate || new Date().toISOString().slice(0, 10),
      acquisitionMethod: recMethod,
      estimatedValue: recValue ? parseInt(recValue, 10) : undefined,
      status: "owned",
      dataSource: "document",
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: uploadedFileName,
          fileType: uploadedFileName.split(".").pop() || "pdf",
          uploadedAt: new Date().toISOString(),
          aiClassification: recDocType,
          recognizedFields: {
            "Тип майна": PROPERTY_TYPE_LABELS[recType],
            "Адреса": recAddress,
            "Частка": SHARE_OPTIONS.find(s => s.value === recShare)?.label || recShare,
            "Дата": recDate,
          },
        },
      ],
    };
    onAdd(newProperty);
    toast.success("Об'єкт майна додано");
    toast.info("Документ також додано до документообігу", {
      description: `${uploadedFileName} зареєстровано як ${recDocType}`,
    });
    resetState();
    onOpenChange(false);
    return newProperty;
  };

  const handleManualSave = () => {
    if (!formDescription && !isEdit) {
      toast.error("Заповніть обов'язкові поля");
      return;
    }
    if (!formDate) {
      toast.error("Вкажіть дату набуття");
      return;
    }

    if (isEdit && editProperty && onUpdate) {
      const updated: PropertyObject = {
        ...editProperty,
        type: formType,
        description: formDescription || editProperty.description,
        address: formAddress || undefined,
        ownershipShare: parseFloat(formShare) || 1,
        acquisitionDate: formDate,
        acquisitionMethod: formMethod,
        estimatedValue: formValue ? parseInt(formValue, 10) : undefined,
      };
      onUpdate(updated);
      toast.success("Зміни збережено");
    } else {
      const newProperty: PropertyObject = {
        id: `prop-${Date.now()}`,
        type: formType,
        description: formDescription,
        address: formAddress || undefined,
        ownershipShare: parseFloat(formShare) || 1,
        acquisitionDate: formDate,
        acquisitionMethod: formMethod,
        estimatedValue: formValue ? parseInt(formValue, 10) : undefined,
        status: "owned",
        dataSource: "manual",
        documents: [],
      };
      onAdd(newProperty);
      toast.success("Об'єкт майна додано");
    }
    resetState();
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
      }}
    >
      <SheetContent side="responsive-right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Редагувати об'єкт" : "Додати об'єкт майна"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Внесіть зміни та збережіть"
              : "Завантажте документ для автоматичного розпізнавання або введіть дані вручну"}
          </SheetDescription>
        </SheetHeader>

        {isEdit ? (
          /* Edit mode — only manual form */
          <div className="mt-4 space-y-4">
            {renderManualForm()}
            <Button onClick={handleManualSave} className="w-full">
              Зберегти зміни
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "manual")} className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1 gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Завантажити
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex-1 gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                Вручну
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4 mt-4">
              {/* Checklist item hint banner */}
              {targetChecklistItem && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Документ для: {targetChecklistItem.label}</p>
                    {targetChecklistItem.description && (
                      <p className="text-xs text-muted-foreground">{targetChecklistItem.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {targetChecklistItem.priority === "critical" ? "Критичний" : targetChecklistItem.priority === "high" ? "Важливий" : "Бажаний"}
                  </Badge>
                </div>
              )}
              {uploadState === "idle" && (
                <>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                  >
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium">Перетягніть файл сюди</p>
                    <p className="text-xs text-muted-foreground mt-1">або</p>
                    <label>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <span>Обрати файл</span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-3">PDF, JPG, PNG — до 20 МБ</p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                    <p className="text-xs font-medium flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Система розпізнає такі документи:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {RECOGNIZABLE_DOCUMENT_TYPES.map((doc) => (
                        <Badge key={doc} variant="secondary" className="text-xs font-normal">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(uploadState === "uploading" || uploadState === "recognizing") && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {uploadState === "uploading" ? "Завантаження..." : "AI розпізнавання документа..."}
                      </p>
                    </div>
                  </div>
                  <Progress value={uploadState === "uploading" ? uploadProgress : 100} className="h-2" />
                  {uploadState === "recognizing" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
                      Аналіз документа та вилучення даних...
                    </div>
                  )}
                </div>
              )}

              {uploadState === "recognized" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Документ розпізнано</span>
                  </div>

                  {/* Structured recognized fields */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Тип документа</Label>
                      <Input value={recDocType} onChange={(e) => setRecDocType(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Тип майна</Label>
                      <Select value={recType} onValueChange={(v) => setRecType(v as PropertyType)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(PROPERTY_TYPE_LABELS).map(([k, l]) => (
                            <SelectItem key={k} value={k}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Опис</Label>
                      <Input value={recDescription} onChange={(e) => setRecDescription(e.target.value)} placeholder="напр. 2-кімнатна квартира" className="h-9 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Адреса</Label>
                      <Input value={recAddress} onChange={(e) => setRecAddress(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Частка</Label>
                        <Select value={recShare} onValueChange={setRecShare}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SHARE_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Дата набуття</Label>
                        <Input type="date" value={recDate} onChange={(e) => setRecDate(e.target.value)} className="h-9 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Спосіб набуття</Label>
                      <Select value={recMethod} onValueChange={(v) => setRecMethod(v as AcquisitionMethod)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ACQUISITION_METHOD_LABELS).map(([k, l]) => (
                            <SelectItem key={k} value={k}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Орієнтовна вартість, грн</Label>
                      <Input type="number" value={recValue} onChange={(e) => setRecValue(e.target.value)} className="h-9 text-sm" />
                    </div>
                  </div>

                  {/* Property Tax Classification */}
                  {(() => {
                    const propClass = classifyPropertyDocument({
                      acquisitionMethod: recMethod,
                      estimatedValue: recValue ? parseInt(recValue, 10) : undefined,
                    });
                    const hasClassInfo = propClass.requiresDeclaration || propClass.tags.length > 0;
                    if (!hasClassInfo) return null;
                    return (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                        <p className="text-xs font-medium flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          Податковий аналіз
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">При продажу:</span>
                          <Badge variant="outline" className="text-xs">
                            {propClass.taxScenarioOnSale.rate}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {propClass.taxScenarioOnSale.label}
                          </span>
                        </div>
                        {propClass.requiresDeclaration && propClass.declarationReason && (
                          <div className="flex items-start gap-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              {propClass.declarationReason}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Перевірте розпізнані дані та відредагуйте за потреби перед збереженням
                    </p>
                  </div>

                  <Button onClick={() => handleConfirmRecognized()} className="w-full">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Підтвердити та зберегти
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Manual Tab */}
            <TabsContent value="manual" className="space-y-4 mt-4">
              {renderManualForm()}
              <Button onClick={handleManualSave} className="w-full">
                Зберегти
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );

  function renderManualForm() {
    return (
      <>
        <div className="space-y-1">
          <Label className="text-sm">Тип майна *</Label>
          <Select value={formType} onValueChange={(v) => setFormType(v as PropertyType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Опис *</Label>
          <Input
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="напр. 3-кімнатна квартира, Toyota RAV4 2020"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Адреса</Label>
          <Input
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            placeholder="м. Київ, вул. Шевченка, 10, кв. 5"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-sm">Частка володіння</Label>
            <Select value={formShare} onValueChange={setFormShare}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SHARE_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Дата набуття *</Label>
            <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Спосіб набуття</Label>
          <Select value={formMethod} onValueChange={(v) => setFormMethod(v as AcquisitionMethod)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ACQUISITION_METHOD_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Орієнтовна вартість, грн</Label>
          <Input
            type="number"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="2 800 000"
          />
        </div>
      </>
    );
  }
};
