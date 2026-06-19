import { CheckCircle2, Calendar, Clock, User, Download, XCircle } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { salonServices, salonMasters, salonClients } from "@/config/demoCabinets/salonData";
import { formatCurrency } from "@/lib/formatters";
import type { Cabinet } from "@/types/cabinet";
import type { PublicBookingRecord } from "@/lib/publicBooking/types";
import { cancelPublicBooking } from "@/lib/publicBooking/store";
import { useState } from "react";
import { RegisterCabinetPitch } from "@/components/client-registration/RegisterCabinetPitch";
import { useMultiFopPitch } from "@/lib/clientRegistrationPitch/multiFopDetect";
import { isTaxSeason, industryEligibleForTaxRefund } from "@/lib/clientRegistrationPitch/taxSeason";
import { Link } from "react-router-dom";

interface Props {
  cabinet: Cabinet;
  brandName?: string;
  booking: PublicBookingRecord;
}

function buildIcs(b: PublicBookingRecord, displayName: string, serviceNames: string): string {
  const dt = new Date(`${b.date}T${b.startTime}:00`);
  const end = new Date(dt.getTime() + b.durationMin * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Fintodo//Salon Booking//UK",
    "BEGIN:VEVENT",
    `UID:${b.id}@fintodo.com.ua`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(dt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${displayName}: ${serviceNames}`,
    `DESCRIPTION:Запис у салон. Скасувати: код ${b.cancelToken}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function ConfirmationView({ cabinet, brandName, booking }: Props) {
  const { toast } = useToast();
  const displayName = brandName || cabinet.name;
  const [canceled, setCanceled] = useState(booking.status === "canceled");
  const services = booking.serviceIds
    .map((id) => salonServices.find((s) => s.id === id)?.name)
    .filter(Boolean)
    .join(", ");
  const master = salonMasters.find((m) => m.id === booking.masterId);

  const downloadIcs = () => {
    const ics = buildIcs(booking, displayName, services);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-${booking.id.slice(0, 8)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCancel = () => {
    if (!confirm("Скасувати запис?")) return;
    const ok = cancelPublicBooking(booking.cabinetId, booking.id, booking.cancelToken);
    if (ok) {
      setCanceled(true);
      toast({ title: "Запис скасовано" });
    }
  };

  return (
    <div className="p-4 md:p-6 text-center space-y-4">
      {canceled ? (
        <>
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Запис скасовано</h2>
          <p className="text-sm text-muted-foreground">До зустрічі іншим разом!</p>
        </>
      ) : (
        <>
          <div className="mx-auto w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-semibold">Дякуємо! {displayName} чекає на вас</h2>
          <div className="rounded-lg border bg-muted/30 p-4 text-left space-y-2 mx-auto max-w-sm">
            <div className="text-sm font-medium">{services}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(new Date(booking.date), "EEEE, d MMMM yyyy", { locale: uk })}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {booking.startTime} · {booking.durationMin} хв
            </div>
            {master && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                Майстер: {master.shortName}
              </div>
            )}
            <div className="pt-2 mt-2 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">До сплати в салоні</span>
              <span className="font-semibold tabular-nums">{formatCurrency(booking.totalPrice)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Ми надішлемо нагадування за 24 години до візиту.
          </p>
          <div className="max-w-sm mx-auto space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={downloadIcs} className="h-11 md:h-10">
                <Download className="w-4 h-4 mr-1.5" /> В календар
              </Button>
              <Button variant="outline" asChild className="h-11 md:h-10">
                <a href={`/receipt/${booking.cancelToken}`} target="_blank" rel="noreferrer">
                  Квитанція
                </a>
              </Button>
            </div>
            <Button variant="ghost" onClick={handleCancel} className="w-full text-muted-foreground">
              Скасувати запис
            </Button>
          </div>

          <PostBookingPitches
            booking={booking}
            cabinet={cabinet}
            displayName={displayName}
          />
          
        </>
      )}
    </div>
  );
}

interface PitchesProps {
  booking: PublicBookingRecord;
  cabinet: Cabinet;
  displayName: string;
}

function PostBookingPitches({ booking, cabinet, displayName }: PitchesProps) {
  // ClientId = phone (стабільний натуральний ключ для funnel state).
  const matched = salonClients.find((c) => c.phone === booking.clientPhone);
  const alreadyLinked = Boolean(matched?.linkedUserId);
  const clientId = matched?.id ?? `phone:${booking.clientPhone}`;
  const multi = useMultiFopPitch(booking.clientPhone, booking.cabinetId);

  // Multi-FOP має пріоритет над дефолтним post-booking (найсильніший аргумент).
  const primarySource = multi.shouldShow ? "multi-fop" : "post-booking";
  const showTaxSeason =
    !alreadyLinked &&
    isTaxSeason() &&
    industryEligibleForTaxRefund(cabinet.industry) &&
    !multi.shouldShow;

  return (
    <div className="pt-4 space-y-3">
      <RegisterCabinetPitch
        clientId={clientId}
        fopCabinetId={booking.cabinetId}
        fopIndustry={cabinet.industry}
        brandName={displayName}
        source={primarySource}
        variant="card"
        alreadyLinked={alreadyLinked}
        hasMultiFop={multi.shouldShow}
      />
      {showTaxSeason && (
        <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground max-w-md mx-auto text-left">
          <span className="font-medium text-foreground">Зараз сезон ПДФО-знижки.</span>{" "}
          Зберіть чеки за рік за 5 хв замість 5 годин у грудні.{" "}
          <Link to="/tax-refund-pitch" className="text-primary underline-offset-2 hover:underline">
            Дізнатися більше →
          </Link>
        </div>
      )}
    </div>
  );
}
