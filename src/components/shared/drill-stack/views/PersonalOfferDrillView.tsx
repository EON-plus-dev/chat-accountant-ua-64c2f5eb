/**
 * PersonalOfferDrillView — універсальний preview для будь-якої пропозиції
 * (recommendation / promo / special / announcement / product / service / booking).
 */

import { useMemo } from "react";
import { ExternalLink, ArrowRight, Sparkles, Star, Bookmark, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo, fmtUah } from "@/components/cabinets/orders/_primitives";
import { findOfferById, offerSourceLabel } from "@/personal/orders/offerHelpers";
import { useCartStore } from "@/personal/cart/cartStore";
import { useBookingFlowStore } from "@/personal/bookings/bookingFlowStore";


interface Props {
  offerId: string;
  cabinetId?: string;
  sourceLabel?: string;
  onAccept?: (target: "shop" | "services" | "bookings" | "external") => void;
}

export function PersonalOfferDrillView({ offerId, cabinetId, sourceLabel, onAccept }: Props) {
  const { popAll } = useDrillStack();
  const { toast } = useToast();
  const addToCart = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.openCart);
  const openBooking = useBookingFlowStore((s) => s.openFlow);
  const offer = useMemo(
    () => (cabinetId ? findOfferById(cabinetId, offerId) : null),
    [cabinetId, offerId]
  );
  if (!offer) {
    return (
      <DrillSheet matchKind="personal-offer" matchId={offerId} title="Пропозицію не знайдено" sourceLabel={sourceLabel}>
        <p className="text-sm text-muted-foreground">Запис {offerId} відсутній.</p>
      </DrillSheet>
    );
  }

  const accept = () => {
    // Product → in cart, Booking → in flow
    if (offer.source === "product" && offer.priceFromUah) {
      addToCart({
        productId: offer.id,
        title: offer.title,
        vendor: offer.provider,
        priceUah: offer.priceFromUah,
        emoji: offer.emoji,
      });
      popAll();
      openCart();
      return;
    }
    if (offer.source === "booking" && cabinetId) {
      popAll();
      openBooking(offer.id, cabinetId);
      return;
    }
    if (onAccept && offer.acceptTarget) {
      popAll();
      onAccept(offer.acceptTarget);
    } else {
      toast({ title: "Демо", description: `«${offer.title}» додано до плану` });
    }
  };


  return (
    <DrillSheet
      matchKind="personal-offer"
      matchId={offerId}
      title={offer.title}
      sourceLabel={sourceLabel}
      footer={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-9 text-xs flex-1" onClick={() => toast({ title: "Збережено", description: "Пропозиція в обраному" })}>
            <Bookmark className="w-3.5 h-3.5 mr-1.5" /> Зберегти
          </Button>
          <Button size="sm" className="h-9 text-xs flex-1" onClick={accept}>
            {offer.cta ?? "Прийняти"}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {offer.emoji ? (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
              {offer.emoji}
            </div>
          ) : (
            <BrandLogo brand={offer.provider} size={48} />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge variant="outline" className="text-[10px] gap-1">
                <Sparkles className="w-2.5 h-2.5" /> {offerSourceLabel(offer.source)}
              </Badge>
              {offer.category && <Badge variant="outline" className="text-[10px]">{offer.category}</Badge>}
              {offer.rating !== undefined && (
                <Badge variant="outline" className="text-[10px] gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> {offer.rating.toFixed(1)}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{offer.provider}</div>
            {offer.priceFromUah !== undefined && offer.priceFromUah > 0 && (
              <div className="text-base font-semibold tabular-nums mt-1">
                {offer.source === "product" ? fmtUah(offer.priceFromUah) : `від ${fmtUah(offer.priceFromUah)}`}
              </div>
            )}
          </div>
        </div>

        {offer.description && (
          <p className="text-sm text-foreground/85 leading-relaxed">{offer.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {offer.benefit && (
            <div className="rounded-md border bg-card p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Вигода</div>
              <div className="text-sm font-semibold tabular-nums mt-0.5">{offer.benefit}</div>
            </div>
          )}
          {offer.saving && (
            <div className="rounded-md border bg-emerald-500/5 border-emerald-500/30 p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Економія</div>
              <div className="text-sm font-semibold tabular-nums mt-0.5">{offer.saving}</div>
            </div>
          )}
          {offer.validUntil && (
            <div className="rounded-md border bg-card p-2.5 col-span-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Діє</div>
              <div className="text-sm font-medium mt-0.5">{offer.validUntil}</div>
            </div>
          )}
        </div>

        <Separator />
        <div className="rounded-md border bg-muted/30 p-2.5 text-xs text-muted-foreground space-y-1">
          <div className="font-medium text-foreground/80">Умови (демо)</div>
          <div>• Пропозиція дійсна для активного аккаунту FINTODO.</div>
          <div>• Партнер залишає за собою право змінити умови.</div>
          <div>• Деталі за {offer.provider}.</div>
        </div>

        <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground" onClick={() => toast({ title: "Сховано", description: "Більше не показувати цю пропозицію" })}>
          <EyeOff className="w-3.5 h-3.5 mr-1.5" /> Не показувати
        </Button>
      </div>
    </DrillSheet>
  );
}
