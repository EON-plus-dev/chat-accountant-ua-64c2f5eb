import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Pencil,
  Trash2,
  Copy,
  FileImage,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { DemoRecord, OperationsSubTab } from "@/config/operationsConfig";
import {
  getExpenseCategoryByCode,
  getIncomeCategoryByCode,
  type ExpenseCategory,
} from "@/config/categoriesConfig";

interface ExpenseDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DemoRecord | null;
  subtab: OperationsSubTab | null;
}

const GROUP_LABELS: Record<string, string> = {
  operational: "Операційні",
  administrative: "Адміністративні",
  financial: "Фінансові",
  other: "Інші",
};

function inferPaymentMethod(source?: string | number): string {
  const s = String(source || "").toLowerCase();
  if (s.includes("mono") || s.includes("privat") || s.includes("картк")) return "💳 Картка";
  if (s.includes("готівк") || s.includes("каса")) return "💵 Готівка";
  if (s.includes("рахун") || s.includes("р/р") || s.includes("iban")) return "🏦 Банківський рахунок";
  return "—";
}

/** Deterministic "AI confidence" based on record id hash */
function getAiConfidence(id: string): number | null {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  const norm = Math.abs(hash) % 100;
  // ~50% of records have AI data
  if (norm < 50) return null;
  return 65 + (norm % 30); // 65-94
}

export function ExpenseDetailSheet({ open, onOpenChange, record, subtab }: ExpenseDetailSheetProps) {
  if (!record || !subtab) return null;

  const cols = record.columns;
  const amount = String(cols.amount || cols.salary || "");
  const isExpense = amount.startsWith("-");
  const title = String(cols.description || cols.name || cols.type || "Витрата");

  // Category lookup
  const categoryCode = String(cols.category || cols.categoryCode || "");
  const expCat: ExpenseCategory | undefined = getExpenseCategoryByCode(categoryCode);
  const incCat = getIncomeCategoryByCode(categoryCode);
  const cat = expCat || incCat;

  // AI
  const aiConfidence = getAiConfidence(record.id);
  const aiSource = aiConfidence ? (aiConfidence > 80 ? "банківська виписка" : "чек / скан") : null;

  // Payment method
  const paymentMethod = inferPaymentMethod(cols.source || cols.matched);

  // Document reference
  const matchedDoc = String(cols.matched || "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col overflow-y-auto">
        {/* ── Header ── */}
        <SheetHeader>
          <div className="flex items-center gap-2.5">
            {cat?.icon && <span className="text-xl">{cat.icon}</span>}
            <SheetTitle className="text-lg leading-tight">{title}</SheetTitle>
          </div>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span
              className={`text-2xl font-bold tabular-nums ${
                isExpense
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {amount || "—"}
            </span>
            <Badge variant={isExpense ? "error" : "success"} size="sm">
              {isExpense ? "Витрата" : "Дохід"}
            </Badge>
            {record.statusLabel && (
              <Badge variant="secondary" size="sm">
                {record.statusLabel}
              </Badge>
            )}
          </div>
          <SheetDescription>Деталі запису</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 py-3">
          {/* ── Основна інформація ── */}
          <section className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Основна інформація
            </h4>

            {/* Дата */}
            {cols.date && (
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Дата" value={String(cols.date)} />
            )}

            {/* Категорія */}
            {cat && (
              <InfoRow
                icon={<span className="text-sm">{cat.icon || "📁"}</span>}
                label="Категорія"
                value={
                  <span className="flex items-center gap-1.5 text-right">
                    {cat.name}
                    {expCat?.group && (
                      <Badge variant="outline" size="sm" className="ml-1">
                        {GROUP_LABELS[expCat.group] || expCat.group}
                      </Badge>
                    )}
                  </span>
                }
              />
            )}

            {/* Контрагент */}
            {(cols.source || cols.contractor) && (
              <InfoRow
                icon={<Building2 className="w-4 h-4" />}
                label="Контрагент / Джерело"
                value={String(cols.contractor || cols.source || "—")}
              />
            )}

            {/* Спосіб оплати */}
            <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Спосіб оплати" value={paymentMethod} />

            {/* Description if separate from title */}
            {cols.description && String(cols.description) !== title && (
              <InfoRow icon={<FileText className="w-4 h-4" />} label="Опис" value={String(cols.description)} />
            )}
          </section>

          {/* ── Документ-підстава ── */}
          {matchedDoc && matchedDoc !== "—" && (
            <section className="p-3 rounded-lg border border-border space-y-1.5">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Документ-підстава
              </div>
              <p className="text-sm text-muted-foreground">{matchedDoc}</p>
            </section>
          )}

          {/* ── AI-розпізнавання ── */}
          {aiConfidence !== null && (
            <section className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                AI-розпізнавання
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {aiConfidence >= 80 ? (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Впевненість: {aiConfidence}%
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Впевненість: {aiConfidence}%
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Джерело: {aiSource}
                </span>
              </div>
              {aiConfidence < 70 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Рекомендуємо перевірити розпізнані дані вручну
                </p>
              )}
            </section>
          )}

          {/* ── Скан оригіналу ── */}
          <section className="p-3 rounded-lg border border-border space-y-2">
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <FileImage className="w-4 h-4 text-muted-foreground" />
              Скан оригіналу
            </div>
            <div className="h-20 bg-muted rounded-md flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() =>
                  toast({ title: "Демо-режим", description: "Прикріплення скану буде доступне після запуску" })
                }
              >
                <Upload className="w-4 h-4" />
                Прикріпити скан
              </Button>
            </div>
          </section>

          {/* ── Податковий вплив ── */}
          <section className="p-3 rounded-lg border border-border space-y-1.5">
            <span className="text-sm font-medium text-foreground">Податковий вплив</span>
            {expCat ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={expCat.isDeductible ? "success" : "outline"} size="sm">
                    {expCat.isDeductible ? "Враховується у витратах" : "Не враховується"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Група: {GROUP_LABELS[expCat.group || "other"] || "Інші"}
                  {expCat.isDeductible
                    ? " · Зменшує оподатковуваний дохід"
                    : " · Не впливає на базу оподаткування (ЄП)"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isExpense
                  ? "Зменшує оподатковуваний дохід (враховується у витратах)"
                  : "Збільшує базу оподаткування"}
              </p>
            )}
          </section>
        </div>

        {/* ── Footer ── */}
        <SheetFooter className="flex-row gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => toast({ title: "Демо-режим", description: "Редагування буде доступне після запуску" })}
          >
            <Pencil className="w-3.5 h-3.5" />
            Редагувати
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toast({ title: "Демо-режим", description: "Дублювання буде доступне після запуску" })}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => toast({ title: "Демо-режим", description: "Видалення буде доступне після запуску" })}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/* ── Helper: info row ── */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0 gap-3">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}
