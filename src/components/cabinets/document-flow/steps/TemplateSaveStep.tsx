/**
 * TemplateSaveStep - Final step to save the template
 * Edit name, description, view statistics
 */

import { CheckCircle2, Sparkles, FileText, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { UnifiedTemplateField } from "@/types/templateField";

interface TemplateSaveStepProps {
  fields: UnifiedTemplateField[];
  templateName: string;
  templateDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  isSaving?: boolean;
}

export const TemplateSaveStep = ({
  fields,
  templateName,
  templateDescription,
  onNameChange,
  onDescriptionChange,
  isSaving = false,
}: TemplateSaveStepProps) => {
  // Calculate statistics
  const stats = {
    totalFields: fields.length,
    autoFillFields: fields.filter(
      (f) => f.source === "cabinet" || f.source === "contractor"
    ).length,
    requiredFields: fields.filter((f) => f.required).length,
  };

  const isValid = templateName.trim().length > 0;

  return (
    <div className="flex flex-col h-full">

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Success icon */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Шаблон протестовано</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Введіть назву та опис для шаблону
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">
                Назва шаблону <span className="text-destructive">*</span>
              </Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Введіть назву шаблону"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateDescription">Опис</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Опис шаблону (необов'язково)"
                rows={3}
                className="w-full resize-none"
              />
            </div>
          </div>

          {/* Statistics card */}
          <div className="bg-muted/30 rounded-lg border border-border/50 p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Статистика шаблону
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5" />
                  Полів для заповнення
                </span>
                <span className="font-medium">{stats.totalFields}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Автозаповнення з кабінету
                </span>
                <span className="font-medium">{stats.autoFillFields}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <span className="text-destructive">*</span>
                  Обов'язкові поля
                </span>
                <span className="font-medium">{stats.requiredFields}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
                <span className="text-muted-foreground">Статус</span>
                <Badge variant="secondary" className="text-primary border-primary/30 bg-primary/10">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Протестовано
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
