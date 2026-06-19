import { useState } from "react";
import { CheckCircle2, FileSignature, ShieldCheck, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

export interface ChecklistItem {
  id: string;
  label: string;
  required?: boolean;
  /** Якщо true — пункт вже виконаний (наприклад, дані синхронізовано). */
  done?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  checklist: ChecklistItem[];
  /** Назва форми, що буде сформована */
  formCode: string;
  /** Сума, яка фігурує в декларації (для підтвердження). */
  summaryRows: { label: string; value: string }[];
  onSubmit: () => void;
}

/**
 * Уніфікована «Підготовка до подання» для звітів-декларацій (КІК / ВЗ / Знижка),
 * де немає повноцінного DeclarationWizard.
 */
export function PrepareSubmissionSheet({
  open,
  onOpenChange,
  title,
  description,
  checklist,
  formCode,
  summaryRows,
  onSubmit,
}: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(checklist.filter((c) => c.done).map((c) => [c.id, true])),
  );

  const requiredOk = checklist
    .filter((c) => c.required)
    .every((c) => c.done || checked[c.id]);

  const handleSubmit = () => {
    onSubmit();
    onOpenChange(false);
    toast({
      title: "Документ сформовано",
      description: `Демо: ${formCode} готовий до підпису КЕП у Кабінеті ДПС.`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] sm:w-[480px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            {title}
          </SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
            <div className="text-xs text-muted-foreground">Зведення</div>
            {summaryRows.map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium tabular-nums">{r.value}</span>
              </div>
            ))}
            <Separator className="my-1" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Форма</span>
              <span className="font-mono">{formCode}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="size-4" /> Чек-лист готовності
            </div>
            <ul className="space-y-1.5">
              {checklist.map((c) => {
                const isDone = c.done || checked[c.id];
                return (
                  <li
                    key={c.id}
                    className="flex items-start gap-2 rounded-md border px-2.5 py-2 text-sm"
                  >
                    {c.done ? (
                      <CheckCircle2 className="size-4 mt-0.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Checkbox
                        id={c.id}
                        checked={!!checked[c.id]}
                        onCheckedChange={(v) =>
                          setChecked((prev) => ({ ...prev, [c.id]: v === true }))
                        }
                        className="mt-0.5"
                      />
                    )}
                    <label
                      htmlFor={c.id}
                      className={`flex-1 cursor-pointer ${isDone ? "text-muted-foreground line-through" : ""}`}
                    >
                      {c.label}
                      {c.required && !isDone && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <SheetFooter className="mt-6 gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button onClick={handleSubmit} disabled={!requiredOk} className="gap-1">
            <FileSignature className="size-4" /> Сформувати документ
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
