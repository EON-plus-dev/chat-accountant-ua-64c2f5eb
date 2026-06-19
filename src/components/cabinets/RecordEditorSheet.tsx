import { useState } from "react";
import { Save, Trash2, Send, FileText, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { DemoRecord, RecordStatus, OperationsSubTab } from "@/config/operationsConfig";
import { cn } from "@/lib/utils";

interface RecordEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DemoRecord | null;
  subtab: OperationsSubTab | null;
  isReadOnly?: boolean;
}

const statusOptions: { value: RecordStatus; label: string }[] = [
  { value: "draft", label: "Чернетка" },
  { value: "signed", label: "Підписано" },
  { value: "sent", label: "Відправлено" },
  { value: "paid", label: "Оплачено" },
  { value: "pending", label: "Очікує" },
  { value: "approved", label: "Погоджено" },
  { value: "ready", label: "Готово" },
  { value: "submitted", label: "Подано" },
];

const statusStyles: Record<RecordStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  signed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  sent: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ready: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  submitted: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const RecordEditorSheet = ({
  open,
  onOpenChange,
  record,
  subtab,
  isReadOnly = false,
}: RecordEditorSheetProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<RecordStatus | undefined>(record?.status);
  const [notes, setNotes] = useState("");

  // Initialize form data when record changes
  useState(() => {
    if (record) {
      const initialData: Record<string, string> = {};
      Object.entries(record.columns).forEach(([key, value]) => {
        initialData[key] = String(value);
      });
      setFormData(initialData);
      setStatus(record.status);
    }
  });

  if (!record || !subtab) return null;

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Демо-режим",
      description: "Зміни збережено (демо)",
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    toast({
      title: "Демо-режим",
      description: "Запис видалено (демо)",
      variant: "destructive",
    });
    onOpenChange(false);
  };

  const handleAction = (action: string) => {
    toast({
      title: "Демо-режим",
      description: `«${action}» буде доступна після запуску`,
    });
  };

  // Get the first column value as the title
  const firstColumnKey = subtab.tableColumns?.[0]?.key;
  const title = firstColumnKey ? String(record.columns[firstColumnKey]) : `Запис #${record.id}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <SheetTitle className="text-lg">{title}</SheetTitle>
          </div>
          <SheetDescription className="flex items-center gap-2">
            <span>{subtab.label}</span>
            {record.status && record.statusLabel && (
              <Badge 
                variant="secondary" 
                className={cn("text-xs", statusStyles[record.status])}
              >
                {record.statusLabel}
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Form Fields */}
        <div className="space-y-4">
          {subtab.tableColumns?.filter(col => col.key !== "status").map((col) => (
            <div key={col.key} className="space-y-2">
              <Label htmlFor={col.key} className="text-sm font-medium">
                {col.label}
              </Label>
              <Input
                id={col.key}
                value={formData[col.key] || String(record.columns[col.key] || "")}
                onChange={(e) => handleFieldChange(col.key, e.target.value)}
                disabled={isReadOnly}
                className={cn(
                  isReadOnly && "bg-muted cursor-not-allowed"
                )}
              />
            </div>
          ))}

          {/* Status Select */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Статус
            </Label>
            <Select 
              value={status} 
              onValueChange={(val) => setStatus(val as RecordStatus)}
              disabled={isReadOnly}
            >
              <SelectTrigger className={cn(isReadOnly && "bg-muted cursor-not-allowed")}>
                <SelectValue placeholder="Оберіть статус" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Примітки
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Додайте примітку..."
              disabled={isReadOnly}
              className={cn(
                "min-h-[80px]",
                isReadOnly && "bg-muted cursor-not-allowed"
              )}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Швидкі дії
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("Надіслати")}
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Надіслати
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("AI: Заповнити")}
              className="gap-1.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-300 dark:border-violet-700 hover:from-violet-500/20 hover:to-purple-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              AI: Заповнити
            </Button>
          </div>
        </div>

        {!isReadOnly && (
          <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2 w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              Видалити
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Скасувати
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2 w-full sm:w-auto"
            >
              <Save className="w-4 h-4" />
              Зберегти
            </Button>
          </SheetFooter>
        )}

        {/* Demo Notice */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
          <p className="text-xs text-muted-foreground text-center">
            Це демонстраційний редактор. Зміни не зберігаються.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RecordEditorSheet;
