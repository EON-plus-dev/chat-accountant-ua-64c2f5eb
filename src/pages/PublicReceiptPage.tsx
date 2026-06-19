/**
 * Публічна сторінка-квитанція клієнта: /receipt/:token
 *
 * Точка-дотик #2 у funnel реєстрації власного кабінету (див.
 * mem://marketing/client-registration-funnel-uk). Показуємо клієнту:
 *  - деталі його запису (бренд, послуга, дата/час, ціна, адреса),
 *  - кнопку «Скасувати запис» (через cancelToken),
 *  - banner-варіант RegisterCabinetPitch з адаптивним benefit'ом.
 *
 * Працює без авторизації — токен у URL це і є capability.
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterCabinetPitch } from "@/components/client-registration/RegisterCabinetPitch";
import { useMultiFopPitch } from "@/lib/clientRegistrationPitch/multiFopDetect";
import { isTaxSeason, industryEligibleForTaxRefund } from "@/lib/clientRegistrationPitch/taxSeason";
import {
  findPublicBookingByToken,
  cancelPublicBooking,
} from "@/lib/publicBooking/store";
import { getSalonPublicProfile } from "@/lib/publicBooking/slugMap";
import { mockCabinets } from "@/config/cabinetsData";
import { salonServices, salonMasters } from "@/config/demoCabinets/salonData";
import type { PublicBookingRecord } from "@/lib/publicBooking/types";

export default function PublicReceiptPage() {
  const { token = "" } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<PublicBookingRecord | null>(() =>
    findPublicBookingByToken(token),
  );

  useEffect(() => {
    setBooking(findPublicBookingByToken(token));
  }, [token]);

  const cabinet = useMemo(
    () => (booking ? mockCabinets.find((c) => c.id === booking.cabinetId) ?? null : null),
    [booking],
  );
  const profile = useMemo(() => getSalonPublicProfile(cabinet), [cabinet]);

  if (!booking) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-semibold">Квитанцію не знайдено</h1>
          <p className="text-muted-foreground text-sm">
            Можливо, посилання застаріло або запис скасовано. Спробуйте звернутися до закладу.
          </p>
          <Button asChild variant="outline">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> На головну
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const services = booking.serviceIds
    .map((id) => salonServices.find((s) => s.id === id))
    .filter(Boolean);
  const master = salonMasters.find((m) => m.id === booking.masterId);

  const isCanceled = booking.status === "canceled";

  const handleCancel = () => {
    if (!confirm("Скасувати запис?")) return;
    const ok = cancelPublicBooking(booking.cabinetId, booking.id, booking.cancelToken);
    if (ok) setBooking(findPublicBookingByToken(token));
  };

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 md:py-10">
      <div className="max-w-md mx-auto space-y-4">
        <header className="text-center space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Ваша квитанція</p>
          <h1 className="text-2xl font-semibold">{profile.brandName}</h1>
          {profile.tagline && (
            <p className="text-sm text-muted-foreground">{profile.tagline}</p>
          )}
        </header>

        <section className="rounded-xl border bg-card p-4 md:p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-base">{booking.clientName}</h2>
            <span
              className={
                "text-xs px-2 py-0.5 rounded-full " +
                (isCanceled
                  ? "bg-destructive/10 text-destructive"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300")
              }
            >
              {isCanceled ? "Скасовано" : "Підтверджено"}
            </span>
          </div>

          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
              <span>{booking.date}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>
                {booking.startTime} · {booking.durationMin} хв
              </span>
            </div>
            {master && (
              <div className="text-muted-foreground">Майстер: <span className="text-foreground">{master.fullName}</span></div>
            )}
            <ul className="space-y-1">
              {services.map((s) => s && (
                <li key={s.id} className="flex items-center justify-between">
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">{s.price} ₴</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-muted-foreground">До сплати</span>
              <span className="font-semibold">{booking.totalPrice} ₴</span>
            </div>
            {profile.tagline && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Адресу та контакти ви отримали у SMS/email</span>
              </div>
            )}
          </div>

          {!isCanceled && (
            <Button variant="outline" className="w-full" onClick={handleCancel}>
              Скасувати запис
            </Button>
          )}
        </section>

        {/* Touch #2/#4/#5 — Register-cabinet pitch (multi-FOP > receipt > tax-season) */}
        <ReceiptPitches
          booking={booking}
          brandName={profile.brandName}
          industry={(cabinet as { industry?: string } | null)?.industry}
        />

        <p className="text-center text-xs text-muted-foreground pt-2">
          Квитанція доступна за прямим посиланням. Збережіть або додайте у закладки.
        </p>
      </div>
    </main>
  );
}

function ReceiptPitches({
  booking,
  brandName,
  industry,
}: {
  booking: PublicBookingRecord;
  brandName: string;
  industry?: string;
}) {
  const multi = useMultiFopPitch(booking.clientPhone, booking.cabinetId);
  const primarySource = multi.shouldShow ? "multi-fop" : "receipt-banner";
  const showTaxSeason =
    isTaxSeason() && industryEligibleForTaxRefund(industry) && !multi.shouldShow;

  return (
    <>
      <RegisterCabinetPitch
        clientId={booking.clientPhone}
        fopCabinetId={booking.cabinetId}
        fopIndustry={industry}
        brandName={brandName}
        source={primarySource}
        variant="banner"
        hasMultiFop={multi.shouldShow}
      />
      {showTaxSeason && (
        <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Сезон ПДФО-знижки.</span>{" "}
          Поверніть до 4 200 ₴ за рік за чеками з медицини/освіти.{" "}
          <Link to="/tax-refund-pitch" className="text-primary underline-offset-2 hover:underline">
            Як це працює →
          </Link>
        </div>
      )}
    </>
  );
}
