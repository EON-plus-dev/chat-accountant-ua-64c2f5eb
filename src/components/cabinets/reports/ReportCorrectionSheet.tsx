import { useState } from "react";
import { FileEdit, AlertTriangle, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { Report } from "@/config/reportsConfig";
import { createCorrectionReport, getCorrectionDeadlineInfo, getRecommendationsForError } from "@/lib/reportCorrectionUtils";

interface ReportCorrectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onCreateCorrection: (correctionReport: Report) => void;
}

export function ReportCorrectionSheet({ 
  open, 
  onOpenChange, 
  report, 
  onCreateCorrection 
}: ReportCorrectionSheetProps) {
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  
  if (!report) return null;

  const deadlineInfo = getCorrectionDeadlineInfo(report);
  const recommendations = getRecommendationsForError(report.rejectionDetails?.code);
  
  const handleCheckItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const handleCreate = () => {
    const correction = createCorrectionReport({ 
      originalReport: report,
      correctionReason: additionalNotes || undefined,
    });
    onCreateCorrection(correction);
    // Reset state
    setAdditionalNotes("");
    setCheckedItems(new Set());
  };

  const allChecked = recommendations.checks.every((_, i) => checkedItems.has(`check-${i}`));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-primary" />
            Створити коригуючий звіт
          </SheetTitle>
          <SheetDescription>
            На підставі відхиленого: {report.name}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Причина відхилення */}
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Причина відхилення
                  </p>
                  {report.rejectionDetails?.code && (
                    <Badge variant="outline" className="text-xs bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                      Код: {report.rejectionDetails.code}
                    </Badge>
                  )}
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {report.rejectionDetails?.reason || "Причина не вказана"}
                  </p>
                </div>
              </div>
            </div>

            {/* Термін виправлення */}
            <div className={cn(
              "p-4 rounded-lg border",
              deadlineInfo.isUrgent 
                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                : "bg-muted/30 border-border"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className={cn(
                    "h-4 w-4",
                    deadlineInfo.isUrgent ? "text-amber-600" : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium">Термін виправлення</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-semibold",
                    deadlineInfo.isUrgent ? "text-amber-700 dark:text-amber-400" : ""
                  )}>
                    {format(new Date(deadlineInfo.deadline), "dd.MM.yyyy", { locale: uk })}
                  </span>
                  {deadlineInfo.isUrgent && (
                    <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300">
                      {deadlineInfo.daysRemaining} дн.
                    </Badge>
                  )}
                </div>
              </div>
              {deadlineInfo.isUrgent && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  ⚠️ Терміново! Залишилось мало часу на виправлення
                </p>
              )}
            </div>

            {/* Чеклист рекомендацій */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {recommendations.title}
                </Label>
                {allChecked && (
                  <Badge variant="outline" className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Перевірено
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {recommendations.checks.map((check, index) => {
                  const itemId = `check-${index}`;
                  const isChecked = checkedItems.has(itemId);
                  
                  return (
                    <div 
                      key={itemId}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        isChecked 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" 
                          : "bg-background hover:bg-muted/50"
                      )}
                      onClick={() => handleCheckItem(itemId)}
                    >
                      <Checkbox 
                        id={itemId}
                        checked={isChecked}
                        onCheckedChange={() => handleCheckItem(itemId)}
                        className="mt-0.5"
                      />
                      <Label 
                        htmlFor={itemId} 
                        className={cn(
                          "text-sm cursor-pointer",
                          isChecked && "text-emerald-700 dark:text-emerald-300"
                        )}
                      >
                        {check}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Додаткові примітки */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Додаткові примітки (опціонально)
              </Label>
              <Textarea
                id="notes"
                placeholder="Опишіть що було виправлено..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Що буде створено */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-2">Буде створено:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Коригуючий звіт №{(report.correctionNumber || 0) + 1}</p>
                <p>• На базі даних з відхиленого звіту</p>
                <p>• Статус: «На перевірку»</p>
                <p>• Зв'язок з оригінальним звітом збережено</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Скасувати
          </Button>
          <Button 
            onClick={handleCreate}
            className="w-full sm:w-auto gap-2"
          >
            <FileEdit className="h-4 w-4" />
            Створити коригуючий звіт
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
