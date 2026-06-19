/**
 * BookingDrillView — компактний preview бронювання салону.
 * Викликається з місць, де користувач НЕ хоче втрачати поточну сторінку
 * (платіж комісії майстру, картка клієнта, AttentionInbox у дашборді).
 *
 * Джерела даних:
 *  - seed `salonBookings`
 *  - локальний адмін-стор (`bookingsStore`)
 *  - публічні бронювання з widget'а (`publicBooking/store`)
 */

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  CalendarClock,
  User,
  Scissors,
  Receipt,
  MapPin,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { formatCurrency } from "@/lib/formatters";
import {
  salonBookings,
  salonClients,
  salonMasters,
  salonServices,
  salonWorkstations,
  type SalonBooking,
  type BookingStatus,
} from "@/config/demoCabinets/salonData";
import { readState } from "@/components/cabinets/bookings/bookingsStore";
import { listPublicBookings } from "@/lib/publicBooking/store";
import { OrderEditorSheet } from "@/modules/orders/components/OrderEditorSheet";
import { mockCabinets } from "@/config/cabinetsData";
import { hasCapability } from "@/config/cabinetCapabilities";


interface Props {
  bookingId: string;
  cabinetId?: string;
  sourceLabel?: string;
  onOpenFullBooking?: (id: string) => void;
}

const STATUS_CHIP: Record<BookingStatus, string> = {
  scheduled: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  done: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  "no-show": "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  canceled: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  scheduled: "Заплановано",
  confirmed: "Підтверджено",
  done: "Виконано",
  "no-show": "Не прийшов",
  canceled: "Скасовано",
};

export function BookingDrillView({ bookingId, cabinetId, sourceLabel, onOpenFullBooking }: Props) {
  const { popAll, push } = useDrillStack();
  const [upsellOpen, setUpsellOpen] = useState(false);

  const booking = useMemo<SalonBooking | null>(() => {
    // 1) seed
    const seed = salonBookings.find((b) => b.id === bookingId);
    if (seed) return seed;
    // 2) admin store
    if (cabinetId) {
      const st = readState(cabinetId);
      const created = st.created.find((b) => b.id === bookingId);
      if (created) return created;
    }
    // 3) public bookings
    if (cabinetId) {
      const pub = listPublicBookings(cabinetId).find((b) => b.id === bookingId);
      if (pub) {
        return {
          id: pub.id,
          date: pub.date,
          startTime: pub.startTime,
          durationMin: pub.durationMin,
          clientId: salonClients.find((c) => c.phone.replace(/\D/g, "") === pub.clientPhone.replace(/\D/g, ""))?.id ?? `pub-${pub.id.slice(0, 6)}`,
          masterId: pub.masterId,
          workstationId: pub.workstationId,
          serviceIds: pub.serviceIds,
          totalPrice: pub.totalPrice,
          commissionAmount: Math.round(pub.totalPrice * 0.5),
          status: pub.status === "canceled" ? "canceled" : "confirmed",
          notes: pub.note,
          source: "wizard",
        };
      }
    }
    return null;
  }, [bookingId, cabinetId]);

  if (!booking) {
    return (
      <DrillSheet
        matchKind="booking"
        matchId={bookingId}
        title="Бронювання не знайдено"
        sourceLabel={sourceLabel}
      >
        <p className="text-sm text-muted-foreground">
          Запис із ID {bookingId} відсутній у кабінеті.
        </p>
      </DrillSheet>
    );
  }

  const client = salonClients.find((c) => c.id === booking.clientId);
  const master = salonMasters.find((m) => m.id === booking.masterId);
  const workstation = salonWorkstations.find((w) => w.id === booking.workstationId);
  const svcList = booking.serviceIds
    .map((id) => salonServices.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => !!s);

  const d = new Date(booking.date);

  const ownerCabinet = mockCabinets.find((c) => c.id === cabinetId) ?? null;
  const isMasterCabinet = ownerCabinet?.type === "individual";
  // Кнопка «Відкрити у Щоденнику» — лише для майстрів з повним операційним доступом.
  const canOpenInDiary = ownerCabinet
    ? hasCapability(ownerCabinet, "bookings_personal:operate")
    : false;
  // Для salon-side кабінетів — стандартна навігація в розділ «Бронювання».
  const canOpenInSalonBookings = ownerCabinet
    ? hasCapability(ownerCabinet, "bookings")
    : false;
  const showOpenFullButton = canOpenInDiary || canOpenInSalonBookings;


  return (
    <>
    <DrillSheet
      matchKind="booking"
      matchId={bookingId}
      title={`${booking.startTime} · ${svcList[0]?.name ?? "Бронювання"}`}
      sourceLabel={sourceLabel}
      footer={
        <div className="space-y-2">
          {ownerCabinet && booking.status !== "canceled" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setUpsellOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              {isMasterCabinet ? "Допродаж (потребує затвердження)" : "Допродаж на візиті"}
            </Button>
          )}
          {onOpenFullBooking && showOpenFullButton && (
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                popAll();
                onOpenFullBooking(bookingId);
              }}
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              {canOpenInDiary ? "Відкрити у Щоденнику" : "Відкрити у розділі «Бронювання»"}
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          )}

        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: master ? `${master.color}22` : "hsl(var(--muted))",
              color: master?.color ?? "hsl(var(--muted-foreground))",
            }}
          >
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight tabular-nums">
              {d.toLocaleDateString("uk-UA", {
                weekday: "short",
                day: "2-digit",
                month: "long",
              })}{" "}
              · {booking.startTime}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Тривалість {booking.durationMin} хв
            </p>
            <Badge
              variant="outline"
              className={`mt-1.5 text-xs gap-1 ${STATUS_CHIP[booking.status]}`}
            >
              {STATUS_LABEL[booking.status]}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <User className="h-3.5 w-3.5" /> Клієнт
            </span>
            {client ? (
              <button
                type="button"
                onClick={() => push({ kind: "client", id: client.id, sourceLabel: `Бронювання ${booking.startTime}` })}
                className="text-right truncate hover:text-primary hover:underline underline-offset-2 transition-colors"
              >
                {client.fullName}
              </button>
            ) : (
              <span className="text-right truncate">—</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Scissors className="h-3.5 w-3.5" /> Майстер
            </span>
            <span className="text-right truncate">{master?.fullName ?? "—"}</span>
          </div>
          {workstation && (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <MapPin className="h-3.5 w-3.5" /> Робоче місце
              </span>
              <span className="text-right truncate">{workstation.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Receipt className="h-3.5 w-3.5" /> Сума
            </span>
            <span className="text-right font-medium tabular-nums">
              {formatCurrency(booking.totalPrice)}
            </span>
          </div>
          {booking.commissionAmount > 0 && (
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>з них винагорода майстру</span>
              <span className="tabular-nums">{formatCurrency(booking.commissionAmount)}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Послуги</div>
          <ul className="text-sm space-y-1">
            {svcList.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2">
                <span className="truncate">{s.name}</span>
                <span className="tabular-nums text-muted-foreground shrink-0">
                  {s.durationMin} хв · {formatCurrency(s.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {booking.notes && (
          <div className="text-xs text-muted-foreground leading-relaxed border-t pt-3">
            <span className="font-medium text-foreground">Примітка:</span> {booking.notes}
          </div>
        )}
      </div>
    </DrillSheet>
    {ownerCabinet && (
      <OrderEditorSheet
        cabinet={ownerCabinet}
        direction="sale"
        open={upsellOpen}
        onOpenChange={setUpsellOpen}
        presets={{
          counterpartyId: client?.id,
          linkedBookingId: bookingId,
          submittedByMasterId: isMasterCabinet ? cabinetId : undefined,
          requiresApproval: isMasterCabinet,
        }}
      />
    )}
    </>
  );
}
