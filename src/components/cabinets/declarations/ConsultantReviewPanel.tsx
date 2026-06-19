import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  MessageSquare,
  Send,
  ShieldCheck,
  XCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DeclarationCase } from "@/config/demoCabinets/declarationCases";

interface ChecklistItem {
  id: string;
  label: string;
  hint?: string;
}

/** Базовий чек-лист консультанта. У реальній системі — генерується з profileTags + правил. */
const BASE_CHECKLIST: ChecklistItem[] = [
  { id: "residency", label: "Резидентський статус підтверджено", hint: "183-денний тест, центр життєвих інтересів" },
  { id: "income-sources", label: "Усі джерела доходу заявлено", hint: "Перевірка з даними Фін.моніторингу" },
  { id: "fx-rates", label: "Курси НБУ застосовано на дату події", hint: "Не на середню/кінець року" },
  { id: "fifo", label: "Інвестиційний результат: FIFO коректний", hint: "Лоти, ROC, дроблення" },
  { id: "kik-structure", label: "Структура КІК та ефективна частка", hint: "Багаторівневі ланцюги, асоційовані особи" },
  { id: "deductions", label: "Документи підтверджують податкову знижку", hint: "Чеки, договори, ліміт 18%" },
  { id: "appendices", label: "Усі необхідні додатки сформовано", hint: "Ф1, ФЗ, КІК-звіт" },
];

interface ConsultantReviewPanelProps {
  caseItem: DeclarationCase;
}

export function ConsultantReviewPanel({ caseItem }: ConsultantReviewPanelProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set(["residency", "income-sources"]));
  const [comment, setComment] = useState("");

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const completion = Math.round((checked.size / BASE_CHECKLIST.length) * 100);

  const handleApprove = () => {
    toast({
      title: "Кейс схвалено",
      description: `Демо: статус → «Перевірено». Власник отримає сповіщення про готовність до підпису.`,
    });
  };

  const handleReturnForFix = () => {
    if (!comment.trim()) {
      toast({
        title: "Потрібен коментар",
        description: "Опишіть, які саме уточнення потрібні від користувача.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Повернено на доопрацювання",
      description: `Демо: статус → «Очікує уточнень». Коментар надіслано власнику.`,
    });
    setComment("");
  };

  return (
    <Card className="border-blue-500/30 bg-blue-500/[0.03]">
      <CardContent className="p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Панель перевірки консультанта
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Доступно лише ролі «Податковий консультант». Дії логуються в журналі кейсу.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">SLA:</span>
            <span className="font-medium">
              {caseItem.reviewSlaDueAt
                ? new Date(caseItem.reviewSlaDueAt).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })
                : "—"}
            </span>
            <Badge variant="outline" className="ml-2">
              {caseItem.reviewPriority === "critical"
                ? "Критичний"
                : caseItem.reviewPriority === "high"
                  ? "Високий"
                  : caseItem.reviewPriority === "low"
                    ? "Низький"
                    : "Звичайний"}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Прогрес перевірки</span>
            <span className="tabular-nums font-medium">
              {checked.size}/{BASE_CHECKLIST.length} · {completion}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {BASE_CHECKLIST.map((item) => {
            const isOn = checked.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  "w-full text-left flex items-start gap-2 rounded-md border p-2.5 transition-colors hover:bg-muted/50",
                  isOn && "border-emerald-500/40 bg-emerald-500/5",
                )}
              >
                {isOn ? (
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-medium", isOn && "text-emerald-700 dark:text-emerald-300")}>
                    {item.label}
                  </div>
                  {item.hint && (
                    <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{item.hint}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <Separator />

        {/* Comment + actions */}
        <div className="space-y-2">
          <label className="text-xs font-medium flex items-center gap-1.5">
            <MessageSquare className="size-3.5" /> Коментар власнику
          </label>
          <Textarea
            placeholder="Опишіть знайдені невідповідності, потрібні документи або підтвердьте готовність…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px] text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleReturnForFix} className="gap-1">
            <XCircle className="size-3.5" /> Повернути на доопрацювання
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={completion < 100}
            className="gap-1"
          >
            <Send className="size-3.5" /> Схвалити кейс
          </Button>
        </div>
        {completion < 100 && (
          <p className="text-[11px] text-muted-foreground text-right">
            Схвалення доступне після завершення всіх пунктів чек-листа.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default ConsultantReviewPanel;
