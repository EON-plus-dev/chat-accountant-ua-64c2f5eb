/**
 * Detail Sheet for Financial Monitoring records
 */

import { Calendar, User, Landmark, FileText, CreditCard, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import {
  type FinMonitoringRecord,
  finCategoryConfig,
  finSourceConfig,
  finStatusConfig,
  finSourceTabLabels,
  formatUAH,
} from "@/config/finMonitoringConfig";

interface FinMonitoringDetailSheetProps {
  record: FinMonitoringRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToDocumentDetail?: (documentId: string) => void;
  onNavigateToTab?: (tabId: string) => void;
}

const Section = ({ icon: Icon, label, children }: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <div className="pl-5.5">{children}</div>
  </div>
);

/** Human-readable labels for linked document IDs */
const docIdLabels: Record<string, string> = {
  "doc-ind-d-001": "Брокерський звіт IBKR",
  "doc-ind-d-002": "Довідка про доходи (Польща)",
  "doc-ind-d-003": "Податкова декларація PIT-36 (Польща)",
  "doc-ind-d-004": "Трудовий договір / ЦПД",
  "doc-ind-d-005": "Договір купівлі-продажу ТЗ",
  "doc-ind-d-006": "Акт оцінки ТЗ",
  "doc-ind-d-007": "Квитанція за навчання (1 семестр)",
  "doc-ind-d-008": "Квитанція за навчання (2 семестр)",
  "doc-ind-d-009": "Договір з МЦ «Добробут»",
  "doc-ind-d-010": "Договір оренди квартири",
  "doc-ind-d-015": "Свідоцтво про спадщину",
};

function docIdToLabel(docId: string): string {
  return docIdLabels[docId] || docId;
}

export const FinMonitoringDetailSheet = ({ record, open, onOpenChange, onNavigateToDocumentDetail, onNavigateToTab }: FinMonitoringDetailSheetProps) => {
  const { toast } = useToast();

  if (!record) return null;

  const catCfg = finCategoryConfig[record.category];
  const srcCfg = finSourceConfig[record.source];
  const statusCfg = finStatusConfig[record.status];
  const CatIcon = catCfg.icon;
  const SrcIcon = srcCfg.icon;
  const isIncome = record.direction === "income";
  const needsReview = record.status === "needs-review";

  const demoAction = (action: string) => {
    toast({ title: "Демо-режим", description: `${action} буде доступне після запуску` });
  };

  const handleConfirm = () => {
    toast({
      title: "Запис підтверджено",
      description: `«${record.description}» позначено як підтверджений`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="responsive-right" className="flex flex-col">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2.5 shrink-0", catCfg.badgeClass)}>
              <CatIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base leading-tight truncate">
                {record.description}
              </SheetTitle>
              <SheetDescription className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="status" size="sm" className={isIncome
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                }>
                  {isIncome ? "Дохід" : "Витрата"}
                </Badge>
                <Badge variant="status" size="sm" className={statusCfg.badgeClass}>
                  {statusCfg.label}
                </Badge>
                <Badge variant="outline" size="sm" className={cn("gap-1", srcCfg.badgeClass)}>
                  <SrcIcon className="h-2.5 w-2.5" />
                  {srcCfg.shortLabel}
                </Badge>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-5 py-4 overflow-y-auto">
          {/* Date */}
          <Section icon={Calendar} label="Дата">
            <p className="text-sm">{formatDate(record.date)}</p>
          </Section>

          {/* Amount */}
          <Section icon={CreditCard} label="Сума">
            <p className={cn(
              "text-xl font-bold tabular-nums",
              isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {isIncome ? "+" : "−"}{formatUAH(record.amount)}
            </p>
            {record.currency && record.currency !== "UAH" && (
              <p className="text-xs text-muted-foreground mt-0.5">Валюта: {record.currency}</p>
            )}
          </Section>

          {/* Contractor */}
          {record.contractor && (
            <Section icon={User} label="Контрагент">
              <p className="text-sm font-medium">{record.contractor}</p>
              {record.contractorCode && (
                <p className="text-xs text-muted-foreground">ЄДРПОУ: {record.contractorCode}</p>
              )}
            </Section>
          )}

          {/* Tax Implications */}
          <Section icon={Landmark} label="Податкові наслідки">
            {record.taxImplication ? (
              <div className="space-y-1">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">ПДФО:</span>
                  <span className="font-semibold tabular-nums">{formatUAH(record.taxImplication.pdfo)}</span>
                  <span className="text-muted-foreground">ВЗ:</span>
                  <span className="font-semibold tabular-nums">{formatUAH(record.taxImplication.vz)}</span>
                </div>
                {record.taxImplication.rate && (
                  <p className="text-xs text-muted-foreground">Ставка: {record.taxImplication.rate}</p>
                )}
                {record.taxImplication.article && (
                  <p className="text-xs text-muted-foreground">{record.taxImplication.article}</p>
                )}
              </div>
            ) : (
            <p className="text-sm text-muted-foreground italic">
              {record.direction === "expense" ? "Витрата — не є об'єктом оподаткування" : "Не оподатковується"}
            </p>
            )}
          </Section>

          {/* Source Tab */}
          {record.sourceTab && (
            <Section icon={FileText} label="Джерело запису">
              <div className="flex items-center gap-2">
                <span className="text-sm">{finSourceTabLabels[record.sourceTab]}</span>
                {onNavigateToTab && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => {
                      onOpenChange(false);
                      onNavigateToTab(record.sourceTab!);
                    }}
                  >
                    Перейти →
                  </Button>
                )}
              </div>
            </Section>
          )}

        {/* Linked Documents */}
          <Section icon={FileText} label="Лінковані документи">
            {record.linkedDocuments.length > 0 ? (
              <ul className="space-y-1">
                {record.linkedDocuments.map((docId) => (
                  <li key={docId}>
                    <button
                      onClick={() => {
                        if (onNavigateToDocumentDetail) {
                          onNavigateToDocumentDetail(docId);
                        } else {
                          demoAction(`Перехід до ${docId}`);
                        }
                      }}
                      className="text-sm text-primary hover:underline underline-offset-2 flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      {docIdToLabel(docId)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">Документи не прикріплені</p>
            )}
          </Section>
        </div>

        <SheetFooter className="border-t border-border pt-4 gap-2">
          {needsReview ? (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleConfirm}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Підтвердити
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => demoAction("Редагування")}>
                Редагувати
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => demoAction("Редагування")}>
              Редагувати
            </Button>
          )}
          <Button variant="destructive" size="sm" className="flex-1" onClick={() => demoAction("Видалення")}>
            Видалити
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FinMonitoringDetailSheet;
