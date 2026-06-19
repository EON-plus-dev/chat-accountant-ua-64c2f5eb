import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Sparkles, FileText } from "lucide-react";
import { TAX_DISCOUNT_CATEGORIES, type TaxDiscountCategory, MZP_AMOUNT } from "@/config/taxDiscountCategoriesConfig";
import { useToast } from "@/hooks/use-toast";

interface WizardAnswer {
  categoryId: string;
  applicable: boolean;
  amount?: number;
  description?: string;
}

interface TaxDiscountWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaxDiscountWizard = ({ open, onOpenChange }: TaxDiscountWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(0); // 0 = intro, 1..N = categories, N+1 = results
  const categories = TAX_DISCOUNT_CATEGORIES;
  const totalSteps = categories.length + 2; // intro + categories + results

  const [answers, setAnswers] = useState<WizardAnswer[]>(
    categories.map(c => ({ categoryId: c.id, applicable: false }))
  );

  const currentCategory = step >= 1 && step <= categories.length ? categories[step - 1] : null;
  const isIntro = step === 0;
  const isResults = step === categories.length + 1;

  const progress = Math.round((step / (totalSteps - 1)) * 100);

  const updateAnswer = (categoryId: string, update: Partial<WizardAnswer>) => {
    setAnswers(prev =>
      prev.map(a => (a.categoryId === categoryId ? { ...a, ...update } : a))
    );
  };

  const applicableAnswers = useMemo(
    () => answers.filter(a => a.applicable && (a.amount || 0) > 0),
    [answers]
  );

  const totalRefund = useMemo(() => {
    return applicableAnswers.reduce((sum, a) => {
      const cat = categories.find(c => c.id === a.categoryId);
      if (!cat) return sum;
      let base = a.amount || 0;
      if (cat.limitType === "mzp-multiple" && cat.limitMultiplier) {
        base = Math.min(base, MZP_AMOUNT * cat.limitMultiplier);
      }
      return sum + Math.round(base * 0.18);
    }, 0);
  }, [applicableAnswers, categories]);

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    toast({
      title: "Готово!",
      description: `Знайдено ${applicableAnswers.length} категорій. Потенційне повернення: ${totalRefund.toLocaleString("uk-UA")} ₴`,
    });
    onOpenChange(false);
    setStep(0);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers(categories.map(c => ({ categoryId: c.id, applicable: false })));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Помічник податкової знижки
          </SheetTitle>
          <Progress value={progress} className="h-1.5 mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Крок {step + 1} з {totalSteps}
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="py-4 space-y-4"
            >
              {/* INTRO */}
              {isIntro && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 space-y-3">
                    <h3 className="font-semibold text-base">
                      🎯 Дізнайтеся, скільки ПДФО можна повернути
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Відповідайте на прості питання — ми перевіримо 9 категорій витрат
                      за статтею 166 Податкового кодексу і розрахуємо потенційне повернення.
                    </p>
                    <ul className="text-sm space-y-1.5 text-muted-foreground">
                      <li>📚 Навчання (своє або дитини)</li>
                      <li>🏥 Лікування (для окремих категорій)</li>
                      <li>🏠 Відсотки за іпотекою</li>
                      <li>🛡️ Страхування життя</li>
                      <li>🤝 Благодійність</li>
                      <li>⛽ Переобладнання авто на ГБО</li>
                      <li>🍼 Репродуктивні технології</li>
                      <li>🏗️ Доступне житло (держпрограма)</li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⏱ Займе ~2 хвилини. Дані не зберігаються.
                  </p>
                </div>
              )}

              {/* CATEGORY QUESTION */}
              {currentCategory && (
                <CategoryQuestion
                  category={currentCategory}
                  answer={answers.find(a => a.categoryId === currentCategory.id)!}
                  onUpdate={(update) => updateAnswer(currentCategory.id, update)}
                />
              )}

              {/* RESULTS */}
              {isResults && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Потенційне повернення ПДФО</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {totalRefund.toLocaleString("uk-UA")} ₴
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {applicableAnswers.length > 0
                        ? `За ${applicableAnswers.length} категоріями витрат`
                        : "Не знайдено підходящих витрат"}
                    </p>
                  </div>

                  {applicableAnswers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Ваші витрати:</h4>
                      {applicableAnswers.map(a => {
                        const cat = categories.find(c => c.id === a.categoryId);
                        if (!cat) return null;
                        let base = a.amount || 0;
                        if (cat.limitType === "mzp-multiple" && cat.limitMultiplier) {
                          base = Math.min(base, MZP_AMOUNT * cat.limitMultiplier);
                        }
                        const refund = Math.round(base * 0.18);
                        return (
                          <div key={a.categoryId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 text-sm">
                              <span>{cat.emoji}</span>
                              <span>{cat.shortName}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                +{refund.toLocaleString("uk-UA")} ₴
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {applicableAnswers.length > 0 && (
                    <div className="rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Необхідні документи:
                      </div>
                      {applicableAnswers.map(a => {
                        const cat = categories.find(c => c.id === a.categoryId);
                        if (!cat) return null;
                        return (
                          <div key={a.categoryId} className="text-xs text-muted-foreground">
                            <span className="font-medium">{cat.emoji} {cat.shortName}:</span>{" "}
                            {cat.requiredDocuments.join(", ")}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {applicableAnswers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Спробуйте пройти ще раз або зверніться до нашого чат-бота для консультації.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between">
          {step > 0 && !isResults ? (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Назад
            </Button>
          ) : isResults ? (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Пройти знову
            </Button>
          ) : (
            <div />
          )}

          {isIntro && (
            <Button onClick={handleNext}>
              Почати <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {currentCategory && (
            <Button onClick={handleNext}>
              Далі <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {isResults && applicableAnswers.length > 0 && (
            <Button onClick={handleFinish}>
              <Check className="h-4 w-4 mr-1" /> Додати до знижки
            </Button>
          )}
          {isResults && applicableAnswers.length === 0 && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Закрити
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Sub-component for each category question
function CategoryQuestion({
  category,
  answer,
  onUpdate,
}: {
  category: TaxDiscountCategory;
  answer: WizardAnswer;
  onUpdate: (update: Partial<WizardAnswer>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{category.emoji}</span>
        <div className="space-y-1">
          <h3 className="font-semibold text-base">{category.wizardQuestion}</h3>
          {category.wizardHint && (
            <p className="text-xs text-muted-foreground">{category.wizardHint}</p>
          )}
        </div>
      </div>

      {/* Yes/No */}
      <div className="flex gap-2">
        <Button
          variant={answer.applicable ? "default" : "outline"}
          size="sm"
          onClick={() => onUpdate({ applicable: true })}
        >
          ✅ Так
        </Button>
        <Button
          variant={!answer.applicable ? "secondary" : "outline"}
          size="sm"
          onClick={() => onUpdate({ applicable: false, amount: undefined })}
        >
          Ні
        </Button>
      </div>

      {/* Eligibility warning */}
      {answer.applicable && category.eligibilityWarning && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <span className="text-amber-700 dark:text-amber-300 text-xs">{category.eligibilityWarning}</span>
        </div>
      )}

      {/* Amount input */}
      {answer.applicable && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {category.wizardFollowUp || "Вкажіть суму витрат"}
          </label>
          <Input
            type="number"
            placeholder="Сума, ₴"
            value={answer.amount || ""}
            onChange={e => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
          />

          {/* Limit info */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {category.pkuArticle}
            </Badge>
            <span>{category.limitNote}</span>
          </div>

          {/* Preview refund */}
          {(answer.amount || 0) > 0 && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              {(() => {
                let base = answer.amount || 0;
                let limited = false;
                if (category.limitType === "mzp-multiple" && category.limitMultiplier) {
                  const limit = MZP_AMOUNT * category.limitMultiplier;
                  if (base > limit) {
                    base = limit;
                    limited = true;
                  }
                }
                const refund = Math.round(base * 0.18);
                return (
                  <div className="space-y-1">
                    {limited && (
                      <p className="text-amber-600 dark:text-amber-400 text-xs">
                        ⚠️ Перевищує ліміт. Враховуємо: {base.toLocaleString("uk-UA")} ₴
                      </p>
                    )}
                    <p>
                      Повернення ПДФО:{" "}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {refund.toLocaleString("uk-UA")} ₴
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      min({(answer.amount || 0).toLocaleString("uk-UA")}, ліміт) × 18% = {refund.toLocaleString("uk-UA")} ₴
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
