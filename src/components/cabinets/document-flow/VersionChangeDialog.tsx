import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { GitBranch, FileEdit, AlertCircle } from "lucide-react";

interface ChangedField {
  fieldName: string;
  fieldLabel: string;
  previousValue: string;
  newValue: string;
}

interface VersionChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVersion: number;
  changedFields: ChangedField[];
  onConfirm: (description: string, createVersion: boolean) => void;
  onCancel: () => void;
}

export function VersionChangeDialog({
  open,
  onOpenChange,
  currentVersion,
  changedFields,
  onConfirm,
  onCancel,
}: VersionChangeDialogProps) {
  const [description, setDescription] = useState("");
  const [createVersion, setCreateVersion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextVersion = currentVersion + 1;
  const nextVersionLabel = `v${Math.floor(nextVersion / 10) || 1}.${nextVersion % 10}`;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(description || "Внесено зміни", createVersion);
      setDescription("");
      setIsSubmitting(false);
    }, 300);
  };

  const handleCancel = () => {
    setDescription("");
    onCancel();
    onOpenChange(false);
  };

  // Generate auto-description based on changed fields
  const autoDescription = changedFields.length > 0
    ? `Оновлено: ${changedFields.map(f => f.fieldLabel.toLowerCase()).join(", ")}`
    : "Внесено зміни";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Збереження змін
          </AlertDialogTitle>
          <AlertDialogDescription>
            Опишіть внесені зміни для історії версій документа
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {/* Changed fields summary */}
          {changedFields.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileEdit className="w-4 h-4" />
                Змінені поля ({changedFields.length})
              </div>
              <div className="space-y-1.5">
                {changedFields.map((field, idx) => (
                  <div key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground min-w-[100px]">
                      {field.fieldLabel}:
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      <span className="line-through text-muted-foreground/60 text-xs">
                        {field.previousValue || "—"}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium text-foreground">
                        {field.newValue || "—"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Version info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="createVersion"
                checked={createVersion}
                onCheckedChange={(checked) => setCreateVersion(checked === true)}
              />
              <Label htmlFor="createVersion" className="text-sm cursor-pointer">
                Створити нову версію
              </Label>
            </div>
            {createVersion && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {nextVersionLabel}
              </Badge>
            )}
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <Label htmlFor="changeDescription" className="text-sm">
              Опис змін
            </Label>
            <Textarea
              id="changeDescription"
              placeholder={autoDescription}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Залиште порожнім для автоматичного опису
            </p>
          </div>

          {/* Warning for no version */}
          {!createVersion && (
            <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md p-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Без створення версії ви не зможете відновити попередній стан документа
              </span>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Скасувати
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Збереження..." : "Зберегти"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
