/**
 * LoyaltyProgramDrillView — preview партнерської програми лояльності
 * + tier-прогрес + транзакції + дії «Витратити» / «Перевести в банк».
 */

import { useMemo } from "react";
import { ExternalLink, ArrowRight, Gift, Banknote, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo, ORDERS_NUM } from "@/components/cabinets/orders/_primitives";
import { getLoyaltyForCabinet } from "@/personal/loyalty/loyaltyProgramsMock";
import { enrichLoyalty } from "@/personal/loyalty/loyaltyEnrich";

interface Props {
  programId: string;
  cabinetId?: string;
  sourceLabel?: string;
  onOpenFullLoyalty?: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  bank: "Банк", grocery: "Продукти", fuel: "Паливо",
  cinema: "Кіно", beauty: "Краса", other: "Інше",
};

export function LoyaltyProgramDrillView({ programId, cabinetId, sourceLabel, onOpenFullLoyalty }: Props) {
  const { popAll } = useDrillStack();
  const { toast } = useToast();
  const raw = useMemo(
    () => (cabinetId ? getLoyaltyForCabinet(cabinetId).find((p) => p.id === programId) : undefined),
    [cabinetId, programId]
  );
  if (!raw) {
    return (
      <DrillSheet matchKind="loyalty-program" matchId={programId} title="Програма не знайдена" sourceLabel={sourceLabel}>
        <p className="text-sm text-muted-foreground">Запис {programId} відсутній.</p>
      </DrillSheet>
    );
  }
  const p = enrichLoyalty(raw);

  return (
    <DrillSheet
      matchKind="loyalty-program"
      matchId={programId}
      title={p.brand}
      sourceLabel={sourceLabel}
      footer={
        onOpenFullLoyalty ? (
          <Button size="sm" className="w-full" onClick={() => { popAll(); onOpenFullLoyalty(); }}>
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Відкрити в «Лояльність»
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <BrandLogo brand={p.brand} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge variant="outline" className="text-[10px]">{CATEGORY_LABEL[p.category]}</Badge>
              {p.tier && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">
                  {p.tier}
                </Badge>
              )}
            </div>
            <div className="text-2xl font-semibold tabular-nums mt-1">
              {ORDERS_NUM.format(p.balance)} <span className="text-sm font-normal text-muted-foreground">{p.unit}</span>
            </div>
          </div>
        </div>

        {p.nextTier && (
          <div className="rounded-md border bg-card p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">До {p.nextTier}</span>
              <span className="font-medium tabular-nums">
                {ORDERS_NUM.format(p.toNextDelta)} {p.toNextUnit}
              </span>
            </div>
            <Progress value={p.progressPct} className="h-1.5" />
            <div className="text-[10px] text-muted-foreground mt-1">{p.progressPct}% до наступного рівня</div>
          </div>
        )}

        <Separator />
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">Останні операції</div>
          <ul className="space-y-1 text-sm">
            {p.transactions.slice(0, 6).map((t, i) => (
              <li key={i} className="flex items-center justify-between gap-2 py-1 border-b last:border-0">
                <span className="text-xs tabular-nums">{t.date}</span>
                <span className="text-xs text-muted-foreground truncate flex-1 px-2">{t.reason}</span>
                <span className={`text-xs font-medium tabular-nums inline-flex items-center gap-0.5 ${t.delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {t.delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {t.delta >= 0 ? "+" : ""}{ORDERS_NUM.format(t.delta)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-muted-foreground">
          {p.expiryRules}
        </div>

        <Separator />
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" className="h-9 text-xs" onClick={() => toast({ title: "Демо", description: `Готовий до використання баланс ${ORDERS_NUM.format(p.balance)} ${p.unit}` })}>
            <Gift className="w-3.5 h-3.5 mr-1.5" /> Витратити
          </Button>
          {p.unit === "₴" && (
            <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => toast({ title: "Демо", description: "Переказ ініційовано" })}>
              <Banknote className="w-3.5 h-3.5 mr-1.5" /> В банк
            </Button>
          )}
        </div>
      </div>
    </DrillSheet>
  );
}
