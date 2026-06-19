import { Card } from "@/components/ui/card";
import { getLoyaltyForCabinet } from "@/personal/loyalty/loyaltyProgramsMock";
import { Gift } from "lucide-react";

const CATEGORY_LABEL = {
  bank: "Банк",
  grocery: "Продукти",
  fuel: "Паливо",
  cinema: "Кіно",
  beauty: "Краса",
  other: "Інше",
} as const;

export function LoyaltyProgramsList({ cabinetId }: { cabinetId: string }) {
  const programs = getLoyaltyForCabinet(cabinetId);
  if (programs.length === 0) {
    return <p className="text-sm text-muted-foreground">Програми лояльності ще не підключено.</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {programs.map((p) => (
        <Card key={p.id} className="p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{p.brand}</span>
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {CATEGORY_LABEL[p.category]}
              </span>
              {p.tier && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {p.tier}
                </span>
              )}
            </div>
            {p.lastActivity && (
              <p className="text-[11px] text-muted-foreground mt-0.5">остання активність: {p.lastActivity}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{new Intl.NumberFormat("uk-UA").format(p.balance)}</div>
            <div className="text-[10px] text-muted-foreground">{p.unit}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
