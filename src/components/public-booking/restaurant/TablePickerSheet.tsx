/**
 * Bottom-sheet вибору столика зі схемою зон.
 * Згруповано: Зал / Тераса / VIP. Бейдж зайнятий/вільний (демо-стан).
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { restaurantTables } from "@/config/demoCabinets/restaurantData";
import { getTableNumber, tableIsBusy, ZONE_LABEL } from "@/lib/publicBooking/payAtTableDemo";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (tableId: string) => void;
  selectedTableId?: string;
  accent: string;
  /** "order" — підсвічуємо вільні (зайняті — натиск дозволений з warning).
   *  "pay"   — підсвічуємо лише зайняті (вільні неактивні). */
  mode?: "order" | "pay";
}

export function TablePickerSheet({
  open,
  onClose,
  onPick,
  selectedTableId,
  accent,
  mode = "order",
}: Props) {
  const zones: Array<"hall" | "terrace" | "vip"> = ["hall", "terrace", "vip"];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-0">
        <SheetHeader className="px-4 pt-4 pb-2 text-left">
          <SheetTitle>Оберіть столик</SheetTitle>
          <SheetDescription>
            {mode === "pay"
              ? "Виберіть столик з відкритим рахунком, який треба оплатити."
              : "Знайдіть номер столика на табличці або скануйте QR на столі."}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-5">
          {zones.map((zone) => {
            const tables = restaurantTables.filter((t) => t.zone === zone);
            if (!tables.length) return null;
            return (
              <section key={zone}>
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                  {ZONE_LABEL[zone]} · {tables.length} столиків
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {tables.map((t) => {
                    const n = getTableNumber(t.id)!;
                    const busy = tableIsBusy(t.id);
                    const isSelected = selectedTableId === t.id;
                    const disabled = mode === "pay" && !busy;
                    return (
                      <button
                        key={t.id}
                        disabled={disabled}
                        onClick={() => {
                          onPick(t.id);
                          onClose();
                        }}
                        className={cn(
                          "relative rounded-xl border p-2.5 text-left transition-all min-h-[78px] flex flex-col justify-between",
                          disabled && "opacity-40 cursor-not-allowed",
                          !disabled && "hover:border-foreground active:scale-95",
                          isSelected && "border-foreground bg-muted",
                        )}
                        style={isSelected ? { borderColor: accent, background: `${accent}10` } : undefined}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold tabular-nums">№{n}</span>
                          {isSelected && <Check className="w-4 h-4" style={{ color: accent }} />}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                            <Users className="w-3 h-3" /> {t.seats}
                          </span>
                          <Badge
                            variant={busy ? "secondary" : "outline"}
                            className={cn(
                              "text-[9px] h-4 px-1.5",
                              busy && "bg-amber-100 text-amber-800 border-amber-200",
                              !busy && "text-emerald-600 border-emerald-300",
                            )}
                          >
                            {busy ? "зайнятий" : "вільний"}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
