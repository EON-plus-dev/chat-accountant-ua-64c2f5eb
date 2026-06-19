/**
 * MethodSelectionStep - Step 1: Choose between Create or Upload
 */

import { FileEdit, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export type AddMethod = "create" | "upload";

interface MethodSelectionStepProps {
  onSelect: (method: AddMethod) => void;
}

const methods = [
  {
    id: "create" as const,
    icon: FileEdit,
    title: "Створити в системі",
    description: "Обрати шаблон та заповнити дані",
  },
  {
    id: "upload" as const,
    icon: Upload,
    title: "Завантажити файл",
    description: "PDF, DOCX, зображення для AI-аналізу",
  },
];

export function MethodSelectionStep({ onSelect }: MethodSelectionStepProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-lg space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold">Як додати документ?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Оберіть спосіб додавання документа в систему
          </p>
        </div>

        <div className="grid gap-4">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => onSelect(method.id)}
                className={cn(
                  "w-full p-6 rounded-xl border-2 text-left transition-all",
                  "hover:border-primary hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "flex items-start gap-4"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base">{method.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {method.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
