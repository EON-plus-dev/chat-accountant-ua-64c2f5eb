import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBookingFlowStore } from "@/personal/bookings/bookingFlowStore";
import { useOrdersStore } from "@/personal/orders/personalOrdersStore";
import { findOfferById } from "@/personal/orders/offerHelpers";
import { getSlots, getNextDays } from "@/personal/bookings/bookingSlots";
import type { PersonalOrder } from "@/personal/orders/personalOrdersMock";

type Step = "when" | "details" | "review" | "done";

export function BookingFlowSheet() {
  const { open, offerId, cabinetId, close } = useBookingFlowStore();
  const addOrder = useOrdersStore((s) => s.addOrder);
  const { toast } = useToast();

  const offer = useMemo(() => (cabinetId && offerId ? findOfferById(cabinetId, offerId) : null), [cabinetId, offerId]);
  const raw = (offer?.raw ?? {}) as { kind?: string; nights?: number; durationMin?: number };
  const kind = raw.kind ?? "restaurant";

  const days = useMemo(() => getNextDays(7), []);
  const [step, setStep] = useState<Step>("when");
  const [date, setDate] = useState(days[0].iso);
  const [endDate, setEndDate] = useState(days[2].iso);
  const [slot, setSlot] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState("");

  const slots = useMemo(() => (offerId ? getSlots(offerId, date) : []), [offerId, date]);
  const isHotel = kind === "hotel";
  const isDoctor = kind === "doctor";

  const handleClose = (v: boolean) => {
    if (!v) { close(); setTimeout(() => { setStep("when"); setSlot(null); setNote(""); }, 300); }
  };

  if (!offer) return null;

  // Hotel calculation
  const nights = (() => {
    if (!isHotel) return 0;
    const a = new Date(date).getTime();
    const b = new Date(endDate).getTime();
    return Math.max(1, Math.round((b - a) / 86400000));
  })();
  const nightlyRate = offer.priceFromUah ?? 0;
  const touristTax = isHotel ? nights * 50 : 0;
  const hotelTotal = isHotel ? nightlyRate * nights + touristTax : 0;

  const confirm = () => {
    if (!cabinetId) return;
    const id = `ord-book-${Date.now().toString(36)}`;
    const title = isHotel
      ? `${offer.title} · ${nights} ${nights === 1 ? "ніч" : nights < 5 ? "ночі" : "ночей"}`
      : `${offer.title} · ${date} ${slot ?? ""}`.trim();
    const amount = isHotel ? hotelTotal : (offer.priceFromUah ?? 0);
    const order: PersonalOrder = {
      id, kind: "booking", title, vendor: offer.provider, date,
      amountUah: amount,
      status: "scheduled",
      notes: note || undefined,
    };
    addOrder(cabinetId, order);
    setStep("done");
    toast({ title: "Заброньовано", description: `${offer.provider} · ${date}${slot ? ` ${slot}` : ""}` });
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            {step !== "when" && step !== "done" && (
              <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2"
                onClick={() => setStep(step === "review" ? "details" : "when")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            Бронювання
          </SheetTitle>
          <SheetDescription className="line-clamp-1">{offer.title} · {offer.provider}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "when" && (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {isHotel ? "Заїзд" : "Дата"}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {days.map((d) => (
                  <Button key={d.iso} variant={date === d.iso ? "default" : "outline"} size="sm"
                    className="h-auto py-2 px-1 flex flex-col text-[10px]"
                    onClick={() => setDate(d.iso)}>
                    <span className="font-medium">{d.label.split(" ")[0]}</span>
                    {d.label.split(" ")[1] && <span className="text-[9px] opacity-75">{d.label.split(" ").slice(1).join(" ")}</span>}
                  </Button>
                ))}
              </div>

              {isHotel ? (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3">Виїзд</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {days.filter((d) => d.iso > date).map((d) => (
                      <Button key={d.iso} variant={endDate === d.iso ? "default" : "outline"} size="sm"
                        className="h-auto py-2 px-1 flex flex-col text-[10px]"
                        onClick={() => setEndDate(d.iso)}>
                        <span className="font-medium">{d.label.split(" ")[0]}</span>
                        {d.label.split(" ")[1] && <span className="text-[9px] opacity-75">{d.label.split(" ").slice(1).join(" ")}</span>}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Доступні слоти
                  </div>
                  {slots.length === 0 ? (
                    <Card className="p-3 text-xs text-muted-foreground text-center">
                      На цей день усі слоти зайняті — оберіть іншу дату
                    </Card>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {slots.map((s) => (
                        <Button key={s} variant={slot === s ? "default" : "outline"} size="sm"
                          className="h-9 text-xs" onClick={() => setSlot(s)}>{s}</Button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === "details" && (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> {isHotel ? "Гості" : "Кількість осіб"}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => setGuests(Math.max(1, guests - 1))}>−</Button>
                <span className="text-base font-semibold w-8 text-center tabular-nums">{guests}</span>
                <Button variant="outline" size="icon" className="h-8 w-8"
                  onClick={() => setGuests(Math.min(10, guests + 1))}>+</Button>
              </div>

              {isDoctor && (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3">
                    Причина візиту
                  </div>
                  <Textarea rows={3} placeholder="Коротко опишіть скарги..."
                    value={note} onChange={(e) => setNote(e.target.value)} />
                </>
              )}

              {!isDoctor && (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mt-3">
                    Коментар (необов'язково)
                  </div>
                  <Textarea rows={3} placeholder="Особливі побажання..."
                    value={note} onChange={(e) => setNote(e.target.value)} />
                </>
              )}
            </div>
          )}

          {step === "review" && (
            <Card className="p-3 space-y-2 text-sm">
              <Row label="Заклад" value={offer.provider} />
              <Row label="Дата" value={isHotel ? `${date} → ${endDate} · ${nights} ${nights === 1 ? "ніч" : "ноч."}` : `${date}${slot ? ` · ${slot}` : ""}`} />
              <Row label={isHotel ? "Гостей" : "Осіб"} value={String(guests)} />
              {note && <Row label="Коментар" value={note} />}
              {isHotel && nightlyRate > 0 ? (
                <>
                  <Separator />
                  <Row label={`${nightlyRate} ₴ × ${nights} ноч.`} value={`${nightlyRate * nights} ₴`} />
                  <Row label="Туристичний збір" value={`${touristTax} ₴`} />
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>До сплати</span>
                    <span className="tabular-nums">{`${hotelTotal} ₴`}</span>
                  </div>
                </>
              ) : offer.priceFromUah ? (
                <>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>До сплати</span>
                    <span className="tabular-nums">{`від ${offer.priceFromUah} ₴`}</span>
                  </div>
                </>
              ) : (
                <div className="text-[11px] text-muted-foreground pt-1">Оплата у закладі</div>
              )}
            </Card>
          )}

          {step === "done" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="text-lg font-semibold">Бронювання підтверджено</div>
                <div className="text-sm text-muted-foreground mt-1">Деталі — у «Мої замовлення»</div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-5">
          {step === "when" && (
            <Button className="w-full" onClick={() => setStep("details")}
              disabled={!isHotel && !slot}>Далі</Button>
          )}
          {step === "details" && (
            <Button className="w-full" onClick={() => setStep("review")}>Далі</Button>
          )}
          {step === "review" && (
            <Button className="w-full" onClick={confirm}>Підтвердити бронювання</Button>
          )}
          {step === "done" && (
            <Button className="w-full" onClick={() => handleClose(false)}>Готово</Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs text-right">{value}</span>
    </div>
  );
}
