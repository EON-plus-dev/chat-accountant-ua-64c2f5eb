import { useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import {
  getActiveExpenseCategories,
  getActiveIncomeCategories,
} from "@/config/categoriesConfig";
import type { BankCategorizationRule } from "@/config/bankCategorizationRulesConfig";

interface BankRuleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: BankCategorizationRule | null;
  onSave: (rule: BankCategorizationRule, applyRetroactive?: boolean) => void;
  /** When provided, shows "Apply retroactively" toggle with the count of past records that match. */
  retroactiveMatchCount?: number;
}

export function BankRuleSheet({ open, onOpenChange, rule, onSave, retroactiveMatchCount }: BankRuleSheetProps) {
  const isEdit = !!rule?.id;
  const [applyRetroactive, setApplyRetroactive] = useState<boolean>(true);

  const [name, setName] = useState(rule?.name ?? "");
  const [transactionType, setTransactionType] = useState<"income" | "expense" | "any">(
    rule?.conditions.transactionType ?? "any"
  );
  const [keywords, setKeywords] = useState<string[]>(rule?.conditions.descriptionContains ?? []);
  const [keywordInput, setKeywordInput] = useState("");
  const [amountMin, setAmountMin] = useState(rule?.conditions.amountMin?.toString() ?? "");
  const [amountMax, setAmountMax] = useState(rule?.conditions.amountMax?.toString() ?? "");
  const [categoryCode, setCategoryCode] = useState(rule?.action.categoryCode ?? "");
  const [autoConfirm, setAutoConfirm] = useState(rule?.action.autoConfirm ?? false);
  const [priority, setPriority] = useState(rule?.priority?.toString() ?? "50");

  // Reset form when rule changes
  const resetForm = useCallback(() => {
    setName(rule?.name ?? "");
    setTransactionType(rule?.conditions.transactionType ?? "any");
    setKeywords(rule?.conditions.descriptionContains ?? []);
    setKeywordInput("");
    setAmountMin(rule?.conditions.amountMin?.toString() ?? "");
    setAmountMax(rule?.conditions.amountMax?.toString() ?? "");
    setCategoryCode(rule?.action.categoryCode ?? "");
    setAutoConfirm(rule?.action.autoConfirm ?? false);
    setPriority(rule?.priority?.toString() ?? "50");
  }, [rule]);

  // When sheet opens, reset
  const handleOpenChange = (v: boolean) => {
    if (v) resetForm();
    onOpenChange(v);
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim().toUpperCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords(prev => [...prev, trimmed]);
    }
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(prev => prev.filter(k => k !== kw));
  };

  const categories = transactionType === "income"
    ? getActiveIncomeCategories()
    : transactionType === "expense"
      ? getActiveExpenseCategories()
      : [...getActiveExpenseCategories(), ...getActiveIncomeCategories()];

  const canSave = name.trim() && keywords.length > 0 && categoryCode;

  const handleSave = () => {
    if (!canSave) return;
    const result: BankCategorizationRule = {
      id: rule?.id ?? `rule-${Date.now()}`,
      name: name.trim(),
      priority: parseInt(priority) || 50,
      isActive: rule?.isActive ?? true,
      cabinetId: rule?.cabinetId,
      conditions: {
        descriptionContains: keywords,
        ...(transactionType !== "any" ? { transactionType } : {}),
        ...(amountMin ? { amountMin: parseFloat(amountMin) } : {}),
        ...(amountMax ? { amountMax: parseFloat(amountMax) } : {}),
      },
      action: { categoryCode, autoConfirm },
      matchCount: rule?.matchCount ?? 0,
      lastMatchedAt: rule?.lastMatchedAt,
    };
    onSave(result, applyRetroactive && (retroactiveMatchCount ?? 0) > 0);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-md">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>{isEdit ? "Редагувати правило" : "Нове правило"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Змініть параметри правила автокатегоризації" : "Створіть правило для автоматичної категоризації транзакцій"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 pb-6">
            {/* Name */}
            <div className="space-y-2">
              <Label>Назва правила</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Наприклад: Нова пошта → Транспорт"
              />
            </div>

            {/* Transaction type */}
            <div className="space-y-2">
              <Label>Тип транзакції</Label>
              <Select value={transactionType} onValueChange={(v) => {
                setTransactionType(v as "income" | "expense" | "any");
                setCategoryCode("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Будь-який</SelectItem>
                  <SelectItem value="expense">Витрата</SelectItem>
                  <SelectItem value="income">Дохід</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <Label>Ключові слова в описі</Label>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  onBlur={() => keywordInput.trim() && addKeyword()}
                  placeholder="Введіть та натисніть Enter"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addKeyword} disabled={!keywordInput.trim()}>
                  Додати
                </Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywords.map(kw => (
                    <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                      <span className="font-mono text-xs">{kw}</span>
                      <button onClick={() => removeKeyword(kw)} className="hover:bg-muted rounded p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Розділяйте ключові слова через Enter або кому. Порівняння без урахування регістру.
              </p>
            </div>

            {/* Amount range */}
            <div className="space-y-2">
              <Label>Діапазон сум (опціонально)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={amountMin}
                  onChange={e => setAmountMin(e.target.value)}
                  placeholder="Від"
                  className="flex-1"
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="number"
                  value={amountMax}
                  onChange={e => setAmountMax(e.target.value)}
                  placeholder="До"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Категорія</Label>
              <Select value={categoryCode} onValueChange={setCategoryCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {("icon" in c ? c.icon : "") || ""} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Пріоритет</Label>
              <Input
                type="number"
                value={priority}
                onChange={e => setPriority(e.target.value)}
                min={1}
                max={100}
              />
              <p className="text-xs text-muted-foreground">
                Вищий пріоритет = обробляється першим. Діапазон 1–100.
              </p>
            </div>

            {/* Auto-confirm */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Автопідтвердження</Label>
                <p className="text-xs text-muted-foreground">
                  Категорія застосовується без ручної перевірки
                </p>
              </div>
              <Switch checked={autoConfirm} onCheckedChange={setAutoConfirm} />
            </div>

            {/* Retroactive application */}
            {(retroactiveMatchCount ?? 0) > 0 && canSave && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Застосувати ретроактивно</Label>
                    <p className="text-xs text-muted-foreground">
                      Знайдено{" "}
                      <span className="font-semibold text-foreground tabular-nums">
                        {retroactiveMatchCount}
                      </span>{" "}
                      минулих{" "}
                      {retroactiveMatchCount === 1 ? "операцію" : retroactiveMatchCount! < 5 ? "операції" : "операцій"} без категорії,
                      що підпадають під це правило.
                    </p>
                  </div>
                  <Switch checked={applyRetroactive} onCheckedChange={setApplyRetroactive} />
                </div>
              </div>
            )}
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
