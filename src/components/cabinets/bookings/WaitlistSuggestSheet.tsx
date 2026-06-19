/**
 * WaitlistSuggestSheet — пропонує оператору вільні слоти для конкретного waitlist-запису.
 *
 * Логіка: викликає `computeAvailability` з критеріями entry (послуги, бажаний майстер),
 * фільтрує по діапазону `[fromDate, toDate]`, групує за днем, показує TOP-12.
 *
 * Pick → створює booking (`createBooking`) + позначає waitlist як `closed`
 * + видаляє з черги. Клієнт мапиться за phone якщо знайдено в seed, інакше — синтетичний id.
 */

import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Calendar, UserCheck, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import {
  salonClients,
  type SalonMaster,
  type SalonService,
  type SalonBooking,
  type SalonWaitlistEntry,
} from "@/config/demoCabinets/salonData";
import { computeAvailability, groupSlotsByDate } from "@/lib/publicBooking/computeAvailability";
import { createBooking, removeFromWaitlist, updateWaitlistEntry } from "./bookingsStore";

interface Props {
  open: boolean;
  onClose: () => void;
  cabinetId: string;
  entry: SalonWaitlistEntry | null;
  masters: SalonMaster[];
  services: SalonService[];
}

function withinRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function normPhone(p: string) {
  return p.replace(/\D/g, "");
}

export function WaitlistSuggestSheet({
  open,
  onClose,
  cabinetId,
  entry,
  masters,
  services,
}: Props) {
  const slotsByDay = useMemo(() => {
    if (!entry) return {};
    const fromDate = new Date(entry.fromDate);
    const to = new Date(entry.toDate);
    const daysAhead = Math.max(0, Math.ceil((to.getTime() - fromDate.getTime()) / 86_400_000));
    const all = computeAvailability({
      cabinetId,
      serviceIds: entry.serviceIds,
      masterId: entry.preferredMasterId,
      fromDate,
      daysAhead,
      minLeadHours: 1,
    }).filter((s) => withinRange(s.date, entry.fromDate, entry.toDate));
    return groupSlotsByDate(all);
  }, [entry, cabinetId]);

  if (!entry) return null;

  const totals = entry.serviceIds.reduce(
    (acc, id) => {
      const svc = services.find((s) => s.id === id);
      if (!svc) return acc;
      acc.price += svc.price;
      acc.duration += svc.durationMin;
      return acc;
    },
    { price: 0, duration: 0 },
  );

  const dayKeys = Object.keys(slotsByDay).sort();

  const handlePick = (slot: { date: string; startTime: string; masterId: string; workstationId: string }) => {
    const master = masters.find((m) => m.id === slot.masterId);
    const pct = master?.commissionPct ?? services.find((s) => s.id === entry.serviceIds[0])?.defaultCommissionPct ?? 40;
    const commissionAmount = Math.round((totals.price * pct) / 100);

    const matchClient = salonClients.find(
      (c) => normPhone(c.phone) === normPhone(entry.clientPhone),
    );
    const clientId = matchClient?.id ?? `wl-${entry.id.slice(0, 8)}`;

    const booking: SalonBooking = {
      id: `bk-wl-${Date.now()}`,
      date: slot.date,
      startTime: slot.startTime,
      durationMin: totals.duration || 30,
      clientId,
      masterId: slot.masterId,
      workstationId: slot.workstationId,
      serviceIds: entry.serviceIds,
      totalPrice: totals.price,
      commissionAmount,
      status: "confirmed",
      source: "rebook",
      confirmedAt: new Date().toISOString(),
      notes: matchClient
        ? entry.note
        : `Клієнт із черги: ${entry.clientName} · ${entry.clientPhone}${entry.note ? ` · ${entry.note}` : ""}`,
      internalNote: matchClient ? undefined : `wl-id:${entry.id}`,
    };

    createBooking(cabinetId, booking);
    updateWaitlistEntry(cabinetId, entry.id, {
      status: "closed",
      proposedBookingId: booking.id,
    });
    removeFromWaitlist(cabinetId, entry.id);

    toast({
      title: "Запис створено",
      description: `${entry.clientName} → ${slot.date} ${slot.startTime}${master ? ` · ${master.shortName}` : ""}`,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="responsive-right" className="flex flex-col p-0">
        <SheetHeader className="px-6 pt-5 pb-3 border-b shrink-0 space-y-1">
          <SheetTitle className="text-base">Запропонувати слот</SheetTitle>
          <SheetDescription className="text-xs leading-tight">
            {entry.clientName} · {entry.serviceIds.length} послуг · {totals.duration} хв ·{" "}
            {formatCurrency(totals.price)}
          </SheetDescription>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <Calendar className="w-3 h-3" />
            <span>
              {entry.fromDate}
              {entry.fromDate !== entry.toDate ? ` – ${entry.toDate}` : ""}
            </span>
            {entry.preferredMasterId && (
              <Badge variant="outline" size="sm" className="text-[10px] h-4 ml-2">
                Бажаний майстер
              </Badge>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-4">
            {dayKeys.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-12 border rounded-md">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Вільних слотів у цьому діапазоні не знайдено.
                <div className="text-[11px] mt-2">
                  Спробуйте розширити діапазон дат або зняти прив'язку до майстра.
                </div>
              </div>
            ) : (
              dayKeys.map((date) => {
                const slots = slotsByDay[date].slice(0, 12);
                const d = new Date(date);
                return (
                  <div key={date}>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">
                      {d.toLocaleDateString("uk-UA", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {slots.map((s, i) => {
                        const m = masters.find((x) => x.id === s.masterId);
                        return (
                          <button
                            key={`${s.startTime}-${s.masterId}-${i}`}
                            type="button"
                            onClick={() => handlePick(s)}
                            className={cn(
                              "border rounded-md p-2 text-left hover:border-primary hover:bg-primary/5 transition focus:outline-none focus:ring-1 focus:ring-ring",
                            )}
                          >
                            <div className="flex items-center gap-1 text-sm font-semibold tabular-nums">
                              <Clock className="w-3 h-3 opacity-60" />
                              {s.startTime}
                            </div>
                            {m && (
                              <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {m.shortName}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-6 py-3 shrink-0 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Скасувати
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
