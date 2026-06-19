// Phase 7.5 — Drill-stack Sheet для перегляду джерел рядка декларації.
// Показує реальні транзакції з модуля з кнопкою «Відкрити повний розділ» (drill-stack pattern).

import { ExternalLink, ArrowUpRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FactEvidence } from "@/config/demoCabinets/declarationFactDeriver";
import { toast } from "@/hooks/use-toast";

interface SourceDrillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  evidence: FactEvidence[];
}

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uk-UA");
};

const fmtAmount = (n?: number) => {
  if (n == null) return null;
  return `${n.toLocaleString("uk-UA")} ₴`;
};

export function SourceDrillSheet({ open, onOpenChange, title, evidence }: SourceDrillSheetProps) {
  const moduleLabel = evidence[0]?.moduleLabel ?? "Модуль";
  const total = evidence.reduce((s, e) => s + (e.amountUah ?? 0), 0);
  const firstDeepLink = evidence[0]?.deepLink;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Джерело — {moduleLabel}. Знайдено {evidence.length}{" "}
            {evidence.length === 1 ? "запис" : "записи"}.
          </SheetDescription>
        </SheetHeader>

        {total > 0 && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm flex items-center justify-between">
            <span className="text-muted-foreground">Сума</span>
            <span className="font-semibold tabular-nums">{fmtAmount(total)}</span>
          </div>
        )}

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 pb-4">
            {evidence.map((e) => (
              <div key={e.recordId} className="rounded-md border p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-tight">{e.summary}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{fmtDate(e.date)}</div>
                  </div>
                  {e.amountUah != null && (
                    <div className="text-sm font-semibold tabular-nums shrink-0">
                      {fmtAmount(e.amountUah)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] h-5 font-mono">
                    {e.recordId}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {e.moduleLabel}
                  </Badge>
                </div>
              </div>
            ))}
            {evidence.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                Немає записів-джерел
              </div>
            )}
          </div>
        </ScrollArea>

        <SheetFooter>
          {firstDeepLink && (
            <Button
              variant="default"
              className="gap-1 w-full"
              onClick={() => {
                toast({
                  title: `Відкриття: ${moduleLabel}`,
                  description: `Демо: перехід у ${firstDeepLink}`,
                });
                onOpenChange(false);
              }}
            >
              <ArrowUpRight className="size-4" />
              Відкрити повний розділ «{moduleLabel}»
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
