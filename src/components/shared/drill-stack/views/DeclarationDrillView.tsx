/**
 * DeclarationDrillView — компактний preview декларації / звіту фізособи / справи.
 * Викликається з аналітики, фін-моніторингу, AttentionInbox, Сповіщень.
 */

import { ArrowRight, ExternalLink, FileText, Calendar, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";

interface Props {
  declarationId: string;
  /** Опц. метадані для preview (передаються з parent) */
  title?: string;
  statusLabel?: string;
  deadline?: string;
  totalAmount?: number;
  taxAmount?: number;
  sourceLabel?: string;
  onOpenFullDeclaration?: (id: string) => void;
}

const formatCurrency = (n: number) =>
  `₴${n.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function DeclarationDrillView({
  declarationId,
  title,
  statusLabel,
  deadline,
  totalAmount,
  taxAmount,
  sourceLabel,
  onOpenFullDeclaration,
}: Props) {
  const { popAll } = useDrillStack();

  return (
    <DrillSheet
      matchKind="declaration"
      matchId={declarationId}
      title="Декларація"
      sourceLabel={sourceLabel}
      footer={
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            popAll();
            onOpenFullDeclaration?.(declarationId);
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1.5" />
          Відкрити повну декларацію
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">
              {title || `Декларація ${declarationId}`}
            </p>
            {statusLabel && (
              <Badge variant="secondary" size="sm" className="mt-1.5 font-normal">
                {statusLabel}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-3 text-xs">
          {deadline && (
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Calendar className="h-3 w-3" />
                Дедлайн
              </div>
              <p className="font-medium">
                {format(new Date(deadline), "dd MMM yyyy", { locale: uk })}
              </p>
            </div>
          )}
          {typeof totalAmount === "number" && (
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Coins className="h-3 w-3" />
                База
              </div>
              <p className="font-medium font-mono">{formatCurrency(totalAmount)}</p>
            </div>
          )}
          {typeof taxAmount === "number" && taxAmount !== 0 && (
            <div className="col-span-2 p-2.5 rounded-md border bg-muted/40 flex items-center justify-between">
              <span className="text-muted-foreground">
                {taxAmount > 0 ? "До сплати" : "До повернення"}
              </span>
              <span
                className={`font-mono font-semibold ${
                  taxAmount > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatCurrency(Math.abs(taxAmount))}
              </span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground leading-relaxed">
          Це швидкий перегляд. У повній декларації — розрахунок, додатки, журнал подій
          та можливість підготувати/підписати.
        </div>
      </div>
    </DrillSheet>
  );
}
