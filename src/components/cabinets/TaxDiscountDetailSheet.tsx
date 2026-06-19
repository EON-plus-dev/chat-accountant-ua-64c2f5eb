import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  FileText,
  AlertTriangle,
  Calendar,
  Scale,
  FileImage,
  Upload,
  Pencil,
  Trash2,
  Calculator,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getStatusClassName } from "@/config/semanticStyles";
import { useToast } from "@/hooks/use-toast";
import type { DemoRecord, OperationsSubTab } from "@/config/operationsConfig";

interface TaxDiscountDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DemoRecord | null;
  subtab: OperationsSubTab | null;
}

// Document checklists per category prefix
const documentChecklists: Record<string, string[]> = {
  "📚": [
    "Договір з навчальним закладом",
    "Квитанції про оплату за навчання",
    "Довідка з ДПС про доходи (форма)",
    "Копія ліцензії закладу (за потреби)",
  ],
  "🏥": [
    "Рецепт або направлення лікаря",
    "Чеки / квитанції за лікування",
    "Копія ліцензії медичного закладу",
    "Довідка про інвалідність / статус УБД",
  ],
  "🏠": [
    "Кредитний договір (іпотека)",
    "Довідка банку про сплачені відсотки",
    "Витяг з реєстру (площа ≤ 100 м²)",
    "Акт прийому-передачі житла",
  ],
  "🛡️": [
    "Договір довгострокового страхування",
    "Квитанції про сплату внесків",
    "Довідка від страхової компанії",
  ],
  "🤝": [
    "Квитанції / платіжні доручення",
    "Підтвердження статусу благодійної організації",
    "Довідка з ДПС про доходи (для розрахунку 4%)",
  ],
  "⛽": [
    "Акт переобладнання транспортного засобу",
    "Квитанції / чеки за встановлення ГБО",
    "Свідоцтво про реєстрацію ТЗ",
  ],
  "🍼": [
    "Договір з медичною клінікою",
    "Чеки / квитанції за процедуру",
    "Медичний висновок (за потреби)",
  ],
  "🏗️": [
    "Договір на будівництво (держпрограма)",
    "Квитанції / акти виконаних робіт",
    "Довідка про участь у програмі доступного житла",
  ],
};

// Map emoji to PKU article
const emojiToPku: Record<string, string> = {
  "📚": "ст. 166.3.3 ПКУ",
  "🏥": "ст. 166.3.4 ПКУ",
  "🏠": "ст. 166.3.1 ПКУ",
  "🛡️": "ст. 166.3.5 ПКУ",
  "🤝": "ст. 166.3.2 ПКУ",
  "⛽": "ст. 166.3.7 ПКУ",
  "🍼": "ст. 166.3.8 ПКУ",
  "🏗️": "ст. 166.3.9 ПКУ",
};

function getCategoryEmoji(category: string): string {
  return category.slice(0, 2).trim() || "📚";
}

function parseAmount(val: string | number | undefined): number | null {
  if (!val) return null;
  const n = parseFloat(String(val).replace(/[^\d.,-]/g, "").replace(",", "."));
  return isNaN(n) ? null : n;
}

export const TaxDiscountDetailSheet = ({
  open,
  onOpenChange,
  record,
  subtab,
}: TaxDiscountDetailSheetProps) => {
  const { toast } = useToast();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!record) return null;

  const { columns, status, statusLabel } = record;
  const emoji = getCategoryEmoji(String(columns.category || ""));
  const docs = documentChecklists[emoji] || [];
  const isWarning = status === "warning" && String(columns.limit || "").includes("166.3.4");
  const pkuArticle = emojiToPku[emoji] || String(columns.limit || "—");

  const expenseAmount = parseAmount(columns.amount);
  const refundAmount = parseAmount(columns.refund);

  const toggleDoc = (idx: number) => {
    setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const checkedCount = docs.filter((_, i) => checked[i]).length;
  const progressPercent = docs.length > 0 ? (checkedCount / docs.length) * 100 : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col overflow-y-auto">
        {/* ── Header ── */}
        <SheetHeader>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{emoji}</span>
            <SheetTitle className="text-lg leading-tight">
              {columns.category}
            </SheetTitle>
          </div>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {columns.refund || "—"}
            </span>
            <Badge variant="success" size="sm">Повернення ПДФО</Badge>
            {status && statusLabel && (
              <Badge
                variant="secondary"
                size="sm"
                className={cn(getStatusClassName(status))}
              >
                {statusLabel}
              </Badge>
            )}
          </div>
          <SheetDescription>{columns.description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 py-3">
          {/* ── Основна інформація ── */}
          <section className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Основна інформація
            </h4>

            <InfoRow
              icon={<Scale className="w-4 h-4" />}
              label="Стаття ПКУ"
              value={pkuArticle}
            />

            <InfoRow
              icon={<Calculator className="w-4 h-4" />}
              label="Витрачено"
              value={String(columns.amount || "—")}
            />

            <InfoRow
              icon={<Info className="w-4 h-4" />}
              label="Ліміт"
              value={String(columns.limit || "Без обмежень")}
            />

            <InfoRow
              icon={<CheckCircle2 className="w-4 h-4" />}
              label="До повернення"
              value={
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {columns.refund || "—"}
                </span>
              }
            />

            <InfoRow
              icon={<Calendar className="w-4 h-4" />}
              label="Дедлайн подання"
              value="31.12.2026"
            />

            <InfoRow
              icon={<Calculator className="w-4 h-4" />}
              label="Ставка ПДФО"
              value="18%"
            />
          </section>

          {/* ── Формула розрахунку ── */}
          <section className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Формула розрахунку
            </span>
            <p className="text-sm font-mono text-foreground">
              min(витрати, ліміт) × 18% = повернення
            </p>
            {expenseAmount && refundAmount && (
              <p className="text-xs text-muted-foreground">
                {columns.amount} → {columns.refund}
              </p>
            )}
          </section>

          {/* ── Warning for medical ── */}
          {isWarning && (
            <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Обмеження за ст. 166.3.4 ПКУ</p>
                <p>
                  Знижка на лікування доступна лише для:
                </p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>осіб з інвалідністю I або II групи</li>
                  <li>учасників бойових дій (УБД)</li>
                  <li>батьків дітей з інвалідністю</li>
                </ul>
                <p className="mt-1">Перевірте право на знижку перед включенням у декларацію.</p>
              </div>
            </div>
          )}

          {/* ── Document checklist ── */}
          {docs.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Документи
                </h4>
                <span className="text-xs text-muted-foreground">
                  {checkedCount}/{docs.length}
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
              <div className="space-y-1.5">
                {docs.map((doc, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2.5 rounded-lg border border-border/50 p-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      checked={!!checked[idx]}
                      onCheckedChange={() => toggleDoc(idx)}
                    />
                    <span className={cn(
                      "text-sm flex-1",
                      checked[idx] && "line-through text-muted-foreground"
                    )}>
                      {doc}
                    </span>
                    {checked[idx] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                    )}
                  </label>
                ))}
              </div>
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
            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              Податковий вплив
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Зменшує ПДФО на <span className="font-semibold text-foreground">{columns.refund || "—"}</span></span>
              </p>
              <p className="flex items-center gap-1.5">
                <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
                <span>Не впливає на ВЗ (1,5%)</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
                <span>Загальний ліміт: не більше суми річного оподатковуваного доходу</span>
              </p>
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <SheetFooter className="flex-row gap-2 pt-3 border-t border-border mt-auto">
          <Button
            className="flex-1"
            onClick={() => {
              toast({
                title: "Включено в декларацію",
                description: `${columns.category} — ${columns.refund} додано до розрахунку`,
              });
              onOpenChange(false);
            }}
          >
            Включити в декларацію
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toast({ title: "Демо-режим", description: "Редагування буде доступне після запуску" })}
          >
            <Pencil className="w-3.5 h-3.5" />
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
};

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
