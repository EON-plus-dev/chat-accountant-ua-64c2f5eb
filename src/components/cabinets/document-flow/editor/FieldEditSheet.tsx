/**
 * FieldEditSheet - Sheet component for editing field properties
 */

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UnifiedTemplateField } from "@/types/templateField";

interface FieldEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: UnifiedTemplateField | null;
  onSave: (field: UnifiedTemplateField) => void;
}

export const FieldEditSheet = ({
  open,
  onOpenChange,
  field,
  onSave,
}: FieldEditSheetProps) => {
  const [label, setLabel] = useState("");
  const [dataType, setDataType] = useState<string>("text");
  const [source, setSource] = useState<string>("manual");
  const [required, setRequired] = useState(false);
  const [originalText, setOriginalText] = useState("");

  // Reset form when field changes
  useEffect(() => {
    if (field) {
      setLabel(field.label || "");
      setDataType(field.dataType || "text");
      setSource(field.source || "manual");
      setRequired(field.required ?? false);
      setOriginalText(field.originalText || "");
    }
  }, [field]);

  const handleSave = () => {
    if (!field) return;
    
    onSave({
      ...field,
      label,
      dataType: dataType as UnifiedTemplateField["dataType"],
      source: source as UnifiedTemplateField["source"],
      required,
      originalText,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="responsive-right" 
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        {/* Header - shrink-0 for fixed height */}
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <SheetTitle>Редагувати поле</SheetTitle>
          <SheetDescription>
            Змініть властивості поля шаблону
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-4">
            {/* Field label */}
            <div className="space-y-2">
              <Label htmlFor="field-label">Назва поля</Label>
              <Input
                id="field-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Введіть назву поля"
              />
            </div>

            {/* Original text */}
            <div className="space-y-2">
              <Label htmlFor="field-original-text">Текст у шаблоні</Label>
              <Input
                id="field-original-text"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Текст, який буде замінено"
              />
              <p className="text-xs text-muted-foreground">
                Цей текст буде замінено значенням поля
              </p>
            </div>

            {/* Data type */}
            <div className="space-y-2">
              <Label>Тип даних</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Текст</SelectItem>
                  <SelectItem value="number">Число</SelectItem>
                  <SelectItem value="currency">Гроші</SelectItem>
                  <SelectItem value="date">Дата</SelectItem>
                  <SelectItem value="iban">IBAN</SelectItem>
                  <SelectItem value="edrpou">ЄДРПОУ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label>Джерело даних</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Виберіть джерело" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Ручне введення</SelectItem>
                  <SelectItem value="cabinet">Кабінет (авто)</SelectItem>
                  <SelectItem value="contractor">Контрагент (авто)</SelectItem>
                  <SelectItem value="computed">Обчислюване</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {source === "manual" && "Значення вводиться вручну при створенні документа"}
                {source === "cabinet" && "Автоматично з даних вашого кабінету"}
                {source === "contractor" && "Автоматично з даних контрагента"}
                {source === "computed" && "Обчислюється на основі інших полів"}
              </p>
            </div>

            {/* Required checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                id="field-required"
                checked={required}
                onCheckedChange={(checked) => setRequired(checked === true)}
              />
              <Label htmlFor="field-required" className="cursor-pointer">
                Обов'язкове поле
              </Label>
            </div>
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="shrink-0 border-t px-6 py-4 flex items-center justify-end gap-3 bg-background">
          <Button variant="outline" onClick={handleCancel}>
            Скасувати
          </Button>
          <Button onClick={handleSave}>
            Зберегти
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
