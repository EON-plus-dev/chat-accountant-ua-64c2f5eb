/**
 * IncomeRecordDrillView — компактна картка одного запису з Книги доходів.
 * Викликається коли користувач натискає «Відкрити в Книзі доходів» з картки платежу.
 */

import { useMemo } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { ArrowRight, BookOpen, Building2, Calendar, FileText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { demoIncomeRecords } from "@/config/incomeBookConfig";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";

interface Props {
  recordId: string;
  sourceLabel?: string;
  /** Викликається при кліку «Відкрити повний розділ» — типова реалізація: handleSubtabChange("income-book") + ?highlight=id */
  onOpenInBook?: (recordId: string) => void;
}

export function IncomeRecordDrillView({ recordId, sourceLabel, onOpenInBook }: Props) {
  const { popAll } = useDrillStack();

  const record = useMemo(
    () => demoIncomeRecords.find((r) => r.id === recordId),
    [recordId]
  );

  const formatCurrency = (n: number) => `₴${n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <DrillSheet
      matchKind="income-record"
      matchId={recordId}
      title="Запис у Книзі доходів"
      sourceLabel={sourceLabel}
      footer={
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            popAll();
            onOpenInBook?.(recordId);
          }}
        >
          <BookOpen className="h-4 w-4 mr-1.5" />
          Відкрити повний розділ Книги доходів
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      }
    >
      {!record ? (
        <div className="text-sm text-muted-foreground py-6 text-center">
          Запис із ID <code className="text-xs bg-muted px-1 rounded">{recordId}</code> не знайдено в демо-даних.
          <br />
          Натисніть кнопку нижче, щоб перейти в повну Книгу доходів.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Header: дата + сума */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(record.date), "dd MMMM yyyy", { locale: uk })}
              </div>
              <p className="text-sm font-medium leading-tight">{record.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(record.amount)}
              </p>
              <Badge variant="secondary" size="sm" className="mt-1 font-normal">
                {record.source}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Контрагент */}
          {record.contractor && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Контрагент
              </div>
              <p className="text-sm font-medium">{record.contractor}</p>
              {record.contractorCode && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  Код: {record.contractorCode}
                </p>
              )}
            </div>
          )}

          {/* В дохід Книги */}
          <div className="p-3 rounded-lg border bg-muted/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">До Книги доходів</span>
              </div>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(record.inIncomeBook)}
              </span>
            </div>
          </div>

          {/* Пов'язаний документ */}
          {record.relatedDocument && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <FileText className="h-3.5 w-3.5" />
                Пов'язаний документ
              </div>
              <p className="text-sm">
                {record.relatedDocument.type === "invoice" ? "Рахунок" :
                 record.relatedDocument.type === "act" ? "Акт виконаних робіт" :
                 record.relatedDocument.type === "contract" ? "Договір" : "Чек"}{" "}
                №{record.relatedDocument.number}
              </p>
            </div>
          )}

          {record.aiNote && (
            <div className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-3">
              {record.aiNote}
            </div>
          )}
        </div>
      )}
    </DrillSheet>
  );
}
