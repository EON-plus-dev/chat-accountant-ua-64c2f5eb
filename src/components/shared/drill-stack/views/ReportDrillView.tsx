/**
 * ReportDrillView — компактний preview звіту ФОП.
 * Викликається з аналітики / Календаря / AttentionInbox.
 */

import { ArrowRight, ExternalLink, FileBarChart2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";

interface Props {
  reportId: string;
  title?: string;
  period?: string;
  statusLabel?: string;
  deadline?: string;
  taxAmount?: number;
  sourceLabel?: string;
  onOpenFullReport?: (id: string) => void;
}

const formatCurrency = (n: number) =>
  `₴${n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ReportDrillView({
  reportId,
  title,
  period,
  statusLabel,
  deadline,
  taxAmount,
  sourceLabel,
  onOpenFullReport,
}: Props) {
  const { popAll } = useDrillStack();

  return (
    <DrillSheet
      matchKind="report"
      matchId={reportId}
      title="Звіт"
      sourceLabel={sourceLabel}
      footer={
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            popAll();
            onOpenFullReport?.(reportId);
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Відкрити повний звіт
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileBarChart2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">{title || `Звіт ${reportId}`}</p>
            {period && <p className="text-xs text-muted-foreground mt-0.5">{period}</p>}
            {statusLabel && (
              <Badge variant="secondary" size="sm" className="mt-1.5 font-normal">
                {statusLabel}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          {deadline && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Дедлайн
              </span>
              <span>{format(new Date(deadline), "dd MMM yyyy", { locale: uk })}</span>
            </div>
          )}
          {typeof taxAmount === "number" && taxAmount !== 0 && (
            <div className="p-2.5 rounded-md border bg-muted/40 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">До сплати</span>
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                {formatCurrency(taxAmount)}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground leading-relaxed border-t pt-3">
          Це швидкий перегляд. У повному звіті — розрахунок, журнал, можливість підготувати.
        </div>
      </div>
    </DrillSheet>
  );
}
