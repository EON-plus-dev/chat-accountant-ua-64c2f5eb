import { useState, useCallback, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncomeCategory } from "@/config/categoriesConfig";

interface IncomeCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: IncomeCategory | null;
  existingCodes: string[];
  onSave: (category: IncomeCategory) => void;
  isSystemCategory?: boolean;
}

const taxGroupLabels: Record<string, string> = {
  services: "Послуги",
  goods: "Товари",
  other: "Інше",
};

export function IncomeCategorySheet({
  open,
  onOpenChange,
  category,
  existingCodes,
  onSave,
  isSystemCategory = false,
}: IncomeCategorySheetProps) {
  const isEdit = !!category;

  const [name, setName] = useState(category?.name ?? "");
  const [code, setCode] = useState(category?.code ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "📋");
  const [description, setDescription] = useState(category?.description ?? "");
  const [taxGroup, setTaxGroup] = useState<"services" | "goods" | "other">(
    category?.taxGroup ?? "services"
  );
  const [isDefault, setIsDefault] = useState(category?.isDefault ?? false);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  const resetForm = useCallback(() => {
    setName(category?.name ?? "");
    setCode(category?.code ?? "");
    setIcon(category?.icon ?? "📋");
    setDescription(category?.description ?? "");
    setTaxGroup(category?.taxGroup ?? "services");
    setIsDefault(category?.isDefault ?? false);
    setIsActive(category?.isActive ?? true);
  }, [category]);

  const handleOpenChange = (v: boolean) => {
    if (v) resetForm();
    onOpenChange(v);
  };

  const autoGenerateCode = (val: string) => {
    setName(val);
    if (!isEdit && !isSystemCategory) {
      const generated = val
        .trim()
        .split(/\s+/)
        .map((w) => w.substring(0, 3))
        .join("")
        .toUpperCase()
        .substring(0, 6);
      if (generated) setCode(generated);
    }
  };

  const codeError = useMemo(() => {
    if (!code.trim()) return null;
    const upper = code.trim().toUpperCase();
    const isDuplicate = existingCodes.some(
      (c) => c === upper && c !== category?.code
    );
    return isDuplicate ? "Код вже використовується" : null;
  }, [code, existingCodes, category?.code]);

  const canSave = name.trim() && code.trim() && !codeError;

  const handleSave = () => {
    if (!canSave) return;
    const result: IncomeCategory = {
      id: category?.id ?? `inc-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      isDefault,
      isActive,
      sortOrder: category?.sortOrder ?? 50,
      taxGroup,
      cabinetId: category?.cabinetId,
    };
    onSave(result);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>
            {isEdit ? "Редагувати категорію доходу" : "Нова категорія доходу"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Змініть параметри категорії"
              : "Створіть нову категорію для класифікації доходів"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 pb-6">
            {/* Name */}
            <div className="space-y-2">
              <Label>Назва категорії *</Label>
              <Input
                value={name}
                onChange={(e) => autoGenerateCode(e.target.value)}
                placeholder="Наприклад: IT-послуги"
              />
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label>Код *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="IT"
                maxLength={8}
                disabled={isSystemCategory}
                className="font-mono"
              />
              {codeError && (
                <p className="text-xs text-destructive">{codeError}</p>
              )}
              {isSystemCategory && (
                <p className="text-xs text-muted-foreground">
                  Код системної категорії не можна змінити
                </p>
              )}
            </div>

            {/* Icon */}
            <div className="space-y-2">
              <Label>Іконка (emoji)</Label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="💼"
                className="w-20 text-center text-xl"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Опис</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опис категорії..."
                rows={2}
              />
            </div>

            {/* Tax group */}
            <div className="space-y-2">
              <Label>Податкова група</Label>
              <Select
                value={taxGroup}
                onValueChange={(v) =>
                  setTaxGroup(v as "services" | "goods" | "other")
                }
                disabled={isSystemCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(taxGroupLabels).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSystemCategory && (
                <p className="text-xs text-muted-foreground">
                  Податкову групу системної категорії не можна змінити
                </p>
              )}
            </div>

            {/* Default */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>За замовчуванням</Label>
                <p className="text-xs text-muted-foreground">
                  Автоматично обирається для нових записів
                </p>
              </div>
              <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Активна</Label>
                <p className="text-xs text-muted-foreground">
                  Неактивні категорії не з'являються у Select-ах
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </ScrollArea>

        {/* Sticky footer */}
        <div className="border-t px-6 py-4 flex gap-3 justify-end bg-background">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isEdit ? "Зберегти" : "Створити"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
