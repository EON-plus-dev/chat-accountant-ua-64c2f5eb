// Phase 7.7 — Картка статусу автогенерації для DeclarationCasePage.
// Аналог AutomationStatusBanner для звітів — повідомляє користувача, що знімок
// декларації перебудовано автоматично з даних модулів і коли востаннє оновлено.

import { Bot, RefreshCw, Sparkles, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { DeclarationSnapshot } from "@/config/demoCabinets/declarationSnapshot";

interface DeclarationAutoStatusCardProps {
  snapshot: DeclarationSnapshot;
  onRecalculate?: () => void;
}

const formatRelative = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "щойно";
  if (min < 60) return `${min} хв тому`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} год тому`;
  const d = Math.round(h / 24);
  return `${d} дн. тому`;
};

export function DeclarationAutoStatusCard({
  snapshot,
  onRecalculate,
}: DeclarationAutoStatusCardProps) {
  const { generatedAt, sourceCount } = snapshot.generation;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/15 p-2 shrink-0">
            <Bot className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-sm">Знімок декларації — автогенерація</h4>
              <Badge variant="outline" className="text-[10px] gap-1 h-5">
                <Sparkles className="size-3" /> AI
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Усі суми обчислено з реальних транзакцій ваших модулів. Декларація оновлюється
              автоматично при появі нових даних у Книзі доходів, Фін.моніторингу, Інвестиціях чи КІК.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Database className="size-3" />
                <span>
                  Джерел: <span className="font-medium text-foreground tabular-nums">{sourceCount}</span>
                </span>
              </span>
              <span>
                Оновлено: <span className="font-medium text-foreground">{formatRelative(generatedAt)}</span>
              </span>
              {snapshot.appendices.length > 0 && (
                <span>
                  Додатків: <span className="font-medium text-foreground tabular-nums">{snapshot.appendices.length}</span>
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 shrink-0"
            onClick={() => {
              onRecalculate?.();
              toast({
                title: "Перерахунок запущено",
                description: "Демо: знімок декларації перебудовується з останніх даних модулів",
              });
            }}
          >
            <RefreshCw className="size-3.5" />
            Перерахувати
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
