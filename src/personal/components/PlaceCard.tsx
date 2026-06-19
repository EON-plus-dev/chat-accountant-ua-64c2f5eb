/**
 * PlaceCard — компактна картка підписаного закладу.
 * Використовується в `MyPlacesPanel` (Огляд) і в `SubscriptionsPage` (Операції).
 */
import { Badge } from "@/components/ui/badge";
import { MapPin, Scissors, Trophy, Hotel, UtensilsCrossed, Store, Calendar, Receipt, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscribedPlaceVM } from "@/modules/network";
import { useNavigate } from "react-router-dom";

export const PLACE_CATEGORY_ICONS: Record<string, typeof Scissors> = {
  salon: Scissors,
  tennis_club: Trophy,
  hotel: Hotel,
  restaurant: UtensilsCrossed,
  supplier: Store,
};

export const PLACE_CATEGORY_LABELS: Record<string, string> = {
  salon: "Салони",
  tennis_club: "Спорт",
  hotel: "Готелі",
  restaurant: "Ресторани",
  supplier: "Магазини",
};

function formatDateShort(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

interface PlaceCardProps {
  vm: SubscribedPlaceVM;
  onOpen: () => void;
}

export function PlaceCard({ vm, onOpen }: PlaceCardProps) {
  const Icon = PLACE_CATEGORY_ICONS[vm.publication.categoryKey] ?? MapPin;
  const upcoming = formatDateShort(vm.subscription.stats?.upcomingBookingAt);
  const lastVisit = formatDateShort(vm.subscription.stats?.lastVisitAt);
  const pending = vm.subscription.stats?.pendingActionsCount ?? 0;
  const navigate = useNavigate();

  const goManage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams(window.location.search);
    params.set("tab", "settings");
    params.set("sub", "connections-privacy");
    params.set("inner", "places");
    params.set("subId", vm.subscription.id);
    navigate(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border/70 bg-card",
        "p-3 hover:bg-muted/50 hover:border-border transition",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-md bg-primary/10 p-1.5 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          {pending > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium mr-6">
              {pending} дія
            </Badge>
          )}
        </div>
        <div className="mt-2 text-sm font-medium leading-tight truncate">
          {vm.publication.displayName}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {vm.publication.shortDescription}
        </div>
        {upcoming ? (
          <div className="mt-2 flex items-center gap-1 text-xs text-foreground">
            <Calendar className="h-3 w-3 text-primary" />
            <span className="truncate">{upcoming}</span>
          </div>
        ) : lastVisit ? (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Receipt className="h-3 w-3" />
            <span className="truncate">Востаннє: {lastVisit}</span>
          </div>
        ) : null}
      </button>

      <button
        type="button"
        onClick={goManage}
        title="Керувати дозволами та підпискою"
        aria-label="Керувати підпискою"
        className={cn(
          "absolute top-2 right-2 p-1 rounded-md",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "opacity-0 group-hover:opacity-100 transition focus-visible:opacity-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
      >
        <Settings2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
