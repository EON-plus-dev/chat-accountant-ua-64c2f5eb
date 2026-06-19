/**
 * RelationSelectionStep - Step 2: Choose New document or Linked to existing
 */

import { ArrowLeft, Sparkles, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AddMethod } from "./MethodSelectionStep";

export type DocumentRelation = "new" | "linked";

interface RelationSelectionStepProps {
  method: AddMethod;
  onSelect: (relation: DocumentRelation) => void;
  onBack: () => void;
}

const getMethodLabel = (method: AddMethod): string => {
  return method === "create" ? "Створити документ" : "Завантажити файл";
};

const relations = [
  {
    id: "new" as const,
    icon: Sparkles,
    title: "Новий документ",
    description: "Незалежний новий документ в системі",
  },
  {
    id: "linked" as const,
    icon: Link2,
    title: "До документу",
    description: "Додаток, акт чи пов'язаний документ",
  },
];

export function RelationSelectionStep({ method, onSelect, onBack }: RelationSelectionStepProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">{getMethodLabel(method)}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-lg space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold">Призначення документа</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Це новий документ чи пов'язаний з існуючим?
            </p>
          </div>

          <div className="grid gap-4">
            {relations.map((relation) => {
              const Icon = relation.icon;
              return (
                <button
                  key={relation.id}
                  onClick={() => onSelect(relation.id)}
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
                    <p className="font-medium text-base">{relation.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {relation.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
