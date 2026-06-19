import { useState, useMemo } from "react";
import { AlertTriangle, FileText, Gift, ArrowLeftRight, Briefcase, HelpCircle, ShieldAlert } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TAX_RATES } from "@/config/taxConstantsConfig";
import {
  formatCurrency,
  type IncomeBookRecord,
  type IncomeRecordStatus,
} from "@/config/incomeBookConfig";

// ── Types ──

export type TransferCategory =
  | "gift-relative"
  | "gift-non-relative"
  | "debt-return"
  | "service-income"
  | "other";

interface CategoryMeta {
  label: string;
  description: string;
  icon: React.ReactNode;
  pitRate: number;
  militaryRate: number;
  resultStatus: IncomeRecordStatus;
  article: string;
  documentHint: string;
}

const FINMON_THRESHOLD = 400_000;

const CATEGORIES: Record<TransferCategory, CategoryMeta> = {
  "gift-relative": {
    label: "Подарунок від родича 1-ї черги",
    description: "Батьки, діти, подружжя — звільнено від ПДФО",
    icon: <Gift className="w-4 h-4 text-emerald-500" />,
    pitRate: 0,
    militaryRate: 0,
    resultStatus: "not-income",
    article: "ст. 174.2.1 ПКУ",
    documentHint: "Завантажте нотаріальну дарчу або документ, що підтверджує родинні зв'язки",
  },
  "gift-non-relative": {
    label: "Подарунок від не-родича",
    description: "Друзі, знайомі, далекі родичі — оподатковується",
    icon: <Gift className="w-4 h-4 text-amber-500" />,
    pitRate: TAX_RATES.personalIncomeTax,
    militaryRate: TAX_RATES.militaryTax,
    resultStatus: "income",
    article: "ст. 174.6 ПКУ",
    documentHint: "Рекомендовано оформити договір дарування для сум понад 50 000 ₴",
  },
  "debt-return": {
    label: "Повернення боргу",
    description: "Повернення раніше наданих коштів — не є доходом",
    icon: <ArrowLeftRight className="w-4 h-4 text-blue-500" />,
    pitRate: 0,
    militaryRate: 0,
    resultStatus: "not-income",
    article: "—",
    documentHint: "Завантажте розписку або договір позики для підтвердження",
  },
  "service-income": {
    label: "Дохід за послуги / товари",
    description: "Оплата за виконану роботу або продаж — оподатковується",
    icon: <Briefcase className="w-4 h-4 text-primary" />,
    pitRate: TAX_RATES.personalIncomeTax,
    militaryRate: TAX_RATES.militaryTax,
    resultStatus: "income",
    article: "ст. 164.1 ПКУ",
    documentHint: "Оформіть акт виконаних робіт або ЦПД",
  },
  other: {
    label: "Інше / Не впевнений",
    description: "Потребує додаткового уточнення",
    icon: <HelpCircle className="w-4 h-4 text-muted-foreground" />,
    pitRate: 0,
    militaryRate: 0,
    resultStatus: "needs-clarification",
    article: "—",
    documentHint: "Зверніться до бухгалтера або AI-помічника для уточнення",
  },
};

// ── Props ──

interface TransferClassificationSheetProps {
  record: IncomeBookRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassify: (recordId: string, category: TransferCategory, newStatus: IncomeRecordStatus) => void;
}

// ── Component ──

export const TransferClassificationSheet = ({
  record,
  open,
  onOpenChange,
  onClassify,
}: TransferClassificationSheetProps) => {
  const [selectedCategory, setSelectedCategory] = useState<TransferCategory | "">("");

  const meta = selectedCategory ? CATEGORIES[selectedCategory] : null;

  const taxCalc = useMemo(() => {
    if (!meta) return null;
    const pit = Math.round(record.amount * meta.pitRate * 100) / 100;
    const military = Math.round(record.amount * meta.militaryRate * 100) / 100;
    return { pit, military, total: pit + military };
  }, [meta, record.amount]);

  const isFinmonWarning = record.amount >= FINMON_THRESHOLD;

  const handleConfirm = () => {
    if (!selectedCategory || !meta) return;
    onClassify(record.id, selectedCategory as TransferCategory, meta.resultStatus);
    setSelectedCategory("");
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setSelectedCategory("");
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col">
        <SheetHeader className="space-y-1 pb-2">
          <SheetTitle className="text-lg">Класифікація переказу</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(record.amount)} • {record.description}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-5">
          {/* Finmon warning */}
          {isFinmonWarning && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-3 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Увага: фінансовий моніторинг</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Сума перевищує поріг {formatCurrency(FINMON_THRESHOLD)}. Банк може запросити
                    документальне підтвердження походження коштів.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Category */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Крок 1: Оберіть категорію
            </h3>
            <RadioGroup
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as TransferCategory)}
              className="space-y-2"
            >
              {(Object.entries(CATEGORIES) as [TransferCategory, CategoryMeta][]).map(
                ([key, cat]) => (
                  <Label
                    key={key}
                    htmlFor={`cat-${key}`}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                      selectedCategory === key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <RadioGroupItem value={key} id={`cat-${key}`} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                    </div>
                    {cat.pitRate > 0 && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {Math.round(cat.pitRate * 100)}% + {Math.round(cat.militaryRate * 100)}%
                      </Badge>
                    )}
                    {cat.pitRate === 0 && key !== "other" && (
                      <Badge variant="outline" className="shrink-0 text-xs text-emerald-600 border-emerald-200 dark:border-emerald-800">
                        0%
                      </Badge>
                    )}
                  </Label>
                )
              )}
            </RadioGroup>
          </section>

          {/* Step 2: Result */}
          {meta && taxCalc && selectedCategory !== "other" && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Крок 2: Результат
                </h3>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Сума переказу</span>
                      <span className="font-medium tabular-nums">{formatCurrency(record.amount)}</span>
                    </div>

                    {meta.pitRate > 0 ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ПДФО ({Math.round(meta.pitRate * 100)}%)
                          </span>
                          <span className="tabular-nums">{formatCurrency(taxCalc.pit)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Військовий збір ({Math.round(meta.militaryRate * 100)}%)
                          </span>
                          <span className="tabular-nums">{formatCurrency(taxCalc.military)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Разом до сплати</span>
                          <span className="text-destructive tabular-nums">
                            {formatCurrency(taxCalc.total)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <span>✓</span>
                        <span>Не оподатковується</span>
                      </div>
                    )}

                    <Separator />

                    <div className="text-xs text-muted-foreground space-y-1.5">
                      {meta.article !== "—" && (
                        <p>
                          <span className="font-medium">Підстава:</span> {meta.article}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Статус запису:</span>{" "}
                        {meta.resultStatus === "income"
                          ? "Буде включено в дохід"
                          : meta.resultStatus === "not-income"
                          ? "Не буде включено в дохід"
                          : "Потребує додаткового розгляду"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Document recommendation */}
                <div className="mt-3 flex items-start gap-2.5 p-3 bg-muted/40 rounded-lg">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{meta.documentHint}</p>
                </div>
              </section>
            </>
          )}

          {/* "Other" explanation */}
          {selectedCategory === "other" && (
            <>
              <Separator />
              <section>
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Операція залишиться зі статусом «Потребує уточнення». 
                    Скористайтесь AI-помічником для детальнішої консультації.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>

        <SheetFooter className="pt-4 border-t mt-4">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              Скасувати
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedCategory}
              onClick={handleConfirm}
            >
              Підтвердити класифікацію
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
