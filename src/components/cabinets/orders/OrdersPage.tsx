import { useSearchParams } from "react-router-dom";
import type { Cabinet } from "@/types/cabinet";

import OrdersLauncher from "./OrdersLauncher";
import OffersPage from "./sections/OffersPage";
import PurchasesPage from "./sections/PurchasesPage";
import ServicesPage from "./sections/ServicesPage";
import BookingsPage from "./sections/BookingsPage";
import SubscriptionsPage from "./sections/SubscriptionsPage";
import LoyaltyPage from "./sections/LoyaltyPage";
import MyOrdersPage from "./sections/MyOrdersPage";
import { BackHeader } from "./_primitives";

interface Props {
  cabinet: Cabinet;
  /** Kept for backwards compatibility with parent dispatcher. */
  defaultInner?: string;
  onNavigateToOperations?: (subTab?: string) => void;
  onNavigateToLauncher?: () => void;
}

const SECTION_LABEL: Record<string, string> = {
  offers: "Пропозиції",
  purchases: "Магазин",
  services: "Послуги",
  bookings: "Бронювання",
  subscriptions: "Підписки",
  loyalty: "Лояльність",
  "my-orders": "Мої замовлення",
};

function isValidInner(raw: string | null): raw is keyof typeof SECTION_LABEL {
  return !!raw && raw in SECTION_LABEL;
}

export default function OrdersPage({ cabinet, defaultInner, onNavigateToLauncher }: Props) {
  // Single source of truth — react-router searchParams.
  // No local state, no window.history.replaceState desyncs.
  const [searchParams, setSearchParams] = useSearchParams();
  const fromUrl = searchParams.get("inner");
  const inner = isValidInner(fromUrl)
    ? fromUrl
    : isValidInner(defaultInner ?? null)
    ? defaultInner!
    : null;

  const goInner = (id: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (id && isValidInner(id)) next.set("inner", id);
    else next.delete("inner");
    // Forward (launcher → section): push, so browser Back returns to launcher.
    // Back (section → launcher): replace, щоб не множити history-записи.
    setSearchParams(next, { replace: id === null });
  };

  if (!inner) {
    return (
      <OrdersLauncher
        cabinet={cabinet}
        onOpen={(id) => goInner(id)}
        onBackToHub={onNavigateToLauncher}
      />
    );
  }

  const Section =
    inner === "offers" ? OffersPage :
    inner === "purchases" ? PurchasesPage :
    inner === "services" ? ServicesPage :
    inner === "bookings" ? BookingsPage :
    inner === "subscriptions" ? SubscriptionsPage :
    inner === "loyalty" ? LoyaltyPage :
    MyOrdersPage;

  return (
    <div className="min-h-full">
      <BackHeader section={SECTION_LABEL[inner]} onBack={() => goInner(null)} />
      <Section cabinet={cabinet} />
    </div>
  );
}
