import { Sparkles, Calendar, Clock, User, Info } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { salonServices, salonMasters } from "@/config/demoCabinets/salonData";
import { formatCurrency } from "@/lib/formatters";
import type { PublicBookingDraft } from "@/lib/publicBooking/types";

interface Props {
  draft: PublicBookingDraft;
  className?: string;
  onOpenMasterDetails?: (masterId: string) => void;
}

export function LivePreviewCard({ draft, className, onOpenMasterDetails }: Props) {
  const services = draft.serviceIds
    .map((id) => salonServices.find((s) => s.id === id))
    .filter(Boolean) as { id: string; name: string; price: number; durationMin: number }[];
  const total = services.reduce((s, x) => s + x.price, 0);
  const duration = services.reduce((s, x) => s + x.durationMin, 0);
  const master = draft.masterId ? salonMasters.find((m) => m.id === draft.masterId) : null;

  const hasAnything = services.length > 0 || draft.date || master;

  if (!hasAnything) return null;

  return (
    <aside
      aria-label="Попередній перегляд запису"
      className={`rounded-lg border bg-muted/30 p-2.5 md:p-3 ${className ?? ""}`}
    >
      <div className="text-[10px] md:text-[11px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1.5 mb-1.5">
        <Sparkles className="w-3 h-3" />
        Ваш запис
      </div>
      <div className="space-y-1.5 text-sm">

          {services.length > 0 && (
            <div className="space-y-0.5">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{s.name}</span>
                  <span className="tabular-nums text-muted-foreground text-xs shrink-0">
                    {s.durationMin} хв · {formatCurrency(s.price)}
                  </span>
                </div>
              ))}
              {services.length > 1 && (
                <div className="flex items-center justify-between pt-1 mt-1 border-t font-medium">
                  <span>Разом</span>
                  <span className="tabular-nums">
                    {duration} хв · {formatCurrency(total)}
                  </span>
                </div>
              )}
            </div>
          )}
          {(draft.date || draft.startTime) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1.5 border-t">
              <Calendar className="w-3.5 h-3.5" />
              {draft.date
                ? format(new Date(draft.date), "d MMMM, EEEE", { locale: uk })
                : "оберіть дату"}
              {draft.startTime && (
                <>
                  <Clock className="w-3.5 h-3.5 ml-1" />
                  {draft.startTime}
                </>
              )}
            </div>
          )}
          {master && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              Майстер: <span className="text-foreground font-medium">{master.shortName}</span>
              {onOpenMasterDetails && (
                <button
                  type="button"
                  onClick={() => onOpenMasterDetails(master.id)}
                  className="ml-auto inline-flex items-center gap-0.5 text-primary hover:underline"
                  aria-label="Профіль майстра"
                >
                  <Info className="w-3 h-3" /> профіль
                </button>
              )}
            </div>
          )}
      </div>

    </aside>
  );
}

