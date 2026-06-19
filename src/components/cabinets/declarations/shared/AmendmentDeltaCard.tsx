import { ArrowRight, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  originalYear: number;
  originalSubmittedAt?: string;
  deltaIncome: number;
  deltaTax: number;
  onOpenOriginal?: () => void;
}

const fmt = (n: number) => `${n.toLocaleString("uk-UA")} ₴`;
const fmtSigned = (n: number) =>
  n === 0 ? fmt(0) : `${n > 0 ? "+" : "−"}${fmt(Math.abs(n))}`;

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("uk-UA");
};

export function AmendmentDeltaCard({
  originalYear,
  originalSubmittedAt,
  deltaIncome,
  deltaTax,
  onOpenOriginal,
}: Props) {
  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <CardContent className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-sm font-medium flex items-center gap-2">
              <Copy className="size-4 text-orange-600 dark:text-orange-400" />
              Уточнює декларацію {originalYear}
            </div>
            <div className="text-xs text-muted-foreground">
              Оригінал подано: <span className="tabular-nums">{fmtDate(originalSubmittedAt)}</span>
            </div>
          </div>
          {onOpenOriginal && (
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onOpenOriginal}>
              Відкрити оригінал <ExternalLink className="size-3" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DeltaCell
            label="Δ Дохід"
            value={fmtSigned(deltaIncome)}
            tone={deltaIncome === 0 ? "neutral" : deltaIncome > 0 ? "warning" : "success"}
          />
          <DeltaCell
            label="Δ Податок"
            value={fmtSigned(deltaTax)}
            tone={deltaTax === 0 ? "neutral" : deltaTax > 0 ? "warning" : "success"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DeltaCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "warning" | "success";
}) {
  return (
    <div className="rounded-md bg-background border p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "text-lg font-semibold tabular-nums mt-0.5",
          tone === "warning" && "text-amber-700 dark:text-amber-400",
          tone === "success" && "text-emerald-700 dark:text-emerald-400",
        )}
      >
        {value}
      </div>
    </div>
  );
}
