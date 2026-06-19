import { useState, useRef, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Upload, FileImage, AlertTriangle, Sparkles, Paperclip, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  getExpenseCategoriesGrouped,
  getExpenseCategoryByCode,
} from "@/config/categoriesConfig";

interface AddExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinetId?: string;
}

interface RecognizedData {
  amount?: number;
  date?: string;
  description?: string;
  contractor?: string;
  categoryHint?: string;
  confidence?: number;
}

const paymentMethods = [
  { value: "cash", label: "Готівка" },
  { value: "card", label: "Картка" },
  { value: "bank", label: "Розрахунковий рахунок" },
];

export function AddExpenseSheet({ open, onOpenChange, cabinetId }: AddExpenseSheetProps) {
  const [tab, setTab] = useState<string>("scan");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizeProgress, setRecognizeProgress] = useState(0);
  const [recognized, setRecognized] = useState<RecognizedData | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [contractor, setContractor] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [isDeductible, setIsDeductible] = useState(true);

  // Proof scan
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const groups = getExpenseCategoriesGrouped(cabinetId);

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().slice(0, 10));
    setContractor("");
    setDescription("");
    setPaymentMethod("");
    setDocNumber("");
    setIsDeductible(true);
    setRecognized(null);
    setScanPreview(null);
    setProofFile(null);
    setProofPreview(null);
    setTab("scan");
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast({ title: "Підтримуються лише зображення та PDF", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Файл занадто великий (макс. 10 МБ)", variant: "destructive" });
      return;
    }

    // Show preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setScanPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setScanPreview(null);
    }

    // Convert to base64 and recognize
    setIsRecognizing(true);
    setRecognizeProgress(10);

    const base64 = await fileToBase64(file);
    setRecognizeProgress(30);

    try {
      const progressInterval = setInterval(() => {
        setRecognizeProgress((p) => Math.min(p + 10, 85));
      }, 400);

      const { data, error } = await supabase.functions.invoke("recognize-expense", {
        body: { imageBase64: base64, mimeType: file.type },
      });

      clearInterval(progressInterval);
      setRecognizeProgress(100);

      if (error || data?.error) {
        toast({
          title: "Не вдалося розпізнати",
          description: data?.error || "Введіть дані вручну",
          variant: "destructive",
        });
        setRecognized({ confidence: 0 });
      } else {
        setRecognized(data);
        // Auto-fill form
        if (data.amount) setAmount(String(data.amount));
        if (data.date) setDate(data.date);
        if (data.contractor) setContractor(data.contractor);
        if (data.description) setDescription(data.description);
        if (data.categoryHint) {
          const cat = getExpenseCategoryByCode(data.categoryHint);
          if (cat) {
            setCategory(cat.code);
            setIsDeductible(cat.isDeductible);
          }
        }
      }
    } catch {
      toast({ title: "Помилка мережі", variant: "destructive" });
      setRecognized({ confidence: 0 });
    } finally {
      setIsRecognizing(false);
    }
  }, []);

  const handleProofSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Файл занадто великий (макс. 10 МБ)", variant: "destructive" });
      return;
    }
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setProofPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Вкажіть суму витрати", variant: "destructive" });
      return;
    }
    toast({
      title: "Витрату збережено",
      description: `${amount} ₴ — ${description || "без опису"}${proofFile ? " (+ скан оригіналу)" : ""}`,
    });
    resetForm();
    onOpenChange(false);
  };

  const handleCategoryChange = (code: string) => {
    setCategory(code);
    const cat = getExpenseCategoryByCode(code);
    if (cat) setIsDeductible(cat.isDeductible);
  };

  const confidence = recognized?.confidence ?? null;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <SheetContent side="responsive-right" className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Додати витрату</SheetTitle>
          <SheetDescription>
            Завантажте чек для AI-розпізнавання або введіть дані вручну
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 py-2">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="scan" className="flex-1 gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Сканувати
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex-1 gap-1.5">
                <FileImage className="w-3.5 h-3.5" />
                Вручну
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="space-y-3 mt-3">
              {/* Drop zone */}
              {!scanPreview && !isRecognizing && !recognized && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Перетягніть фото чека або натисніть для вибору
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Файл
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                    >
                      <Camera className="w-3.5 h-3.5 mr-1" />
                      Камера
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ""; }}
              />

              {/* Scan preview */}
              {scanPreview && (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={scanPreview} alt="Скан чека" className="w-full max-h-40 object-contain bg-muted" />
                  <button
                    onClick={() => { setScanPreview(null); setRecognized(null); }}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Progress */}
              {isRecognizing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 animate-pulse text-primary" />
                    AI аналізує документ...
                  </div>
                  <Progress value={recognizeProgress} className="h-2" />
                </div>
              )}

              {/* Confidence result */}
              {confidence !== null && !isRecognizing && (
                <div className="flex items-center gap-2">
                  {confidence >= 60 ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI: {confidence}%
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      Низька впевненість ({confidence}%) — перевірте дані
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-3">
              <p className="text-sm text-muted-foreground">
                Заповніть поля витрати вручну
              </p>
            </TabsContent>
          </Tabs>

          {/* Common form fields */}
          <div className="space-y-3">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Сума *</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₴</span>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Категорія</label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectGroup key={g.group}>
                      <SelectLabel>{g.label}</SelectLabel>
                      {g.categories.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.icon} {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Дата</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {/* Contractor */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Контрагент</label>
              <Input placeholder="Назва компанії або ФОП" value={contractor} onChange={(e) => setContractor(e.target.value)} />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Опис / Призначення</label>
              <Textarea placeholder="Короткий опис витрати" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>

            {/* Payment method */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Спосіб оплати</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть спосіб" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document number */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Документ-підстава</label>
              <Input placeholder="№ рахунку / акту" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
            </div>

            {/* Deductible switch */}
            <div className="flex items-center justify-between py-1">
              <label className="text-sm font-medium text-foreground">Враховувати у витратах</label>
              <Switch checked={isDeductible} onCheckedChange={setIsDeductible} />
            </div>

            {/* Proof scan */}
            <div className="space-y-2 pt-1 border-t border-border">
              <label className="text-sm font-medium text-foreground">Скан оригіналу (доказ)</label>
              {proofFile ? (
                <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30">
                  {proofPreview ? (
                    <img src={proofPreview} alt="Proof" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <Paperclip className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="text-sm truncate flex-1">{proofFile.name}</span>
                  <button onClick={() => { setProofFile(null); setProofPreview(null); }}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => proofInputRef.current?.click()}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  Прикріпити скан оригіналу
                </Button>
              )}
              <input
                ref={proofInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleProofSelect(f); e.target.value = ""; }}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 pt-3 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={() => { resetForm(); onOpenChange(false); }}>
            Скасувати
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            Зберегти
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      resolve(result.split(",")[1] || result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
