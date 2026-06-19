/**
 * Публічна сторінка запису у салон.
 * URL: /book/:slug  (наприклад, /book/beauty-lab)
 *
 * Універсальний віджет з трьома режимами: Wizard, AI-чат, AI-голос.
 * Дані спільні: послуги, майстри, доступність — через computeAvailability.
 */

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PublicBookingLayout } from "@/components/public-booking/PublicBookingLayout";
import { Wizard } from "@/components/public-booking/wizard/Wizard";
import { AiChatPanel } from "@/components/public-booking/ai-chat/AiChatPanel";
import { AiCallOverlay } from "@/components/public-booking/ai-call/AiCallOverlay";
import { RestaurantBooking } from "@/components/public-booking/restaurant/RestaurantBooking";
import { HotelBooking } from "@/components/public-booking/hotel/HotelBooking";
import { TennisBooking } from "@/components/public-booking/tennis/TennisBooking";
import { resolveCabinetBySlug, getSalonPublicProfile } from "@/lib/publicBooking/slugMap";
import { getVerticalId } from "@/core";
import type { BookingMode, PublicBookingDraft } from "@/lib/publicBooking/types";
import { MOCK_CATALOG_PUBLICATIONS } from "@/modules/network/data/mockNetworkData";
import { addRuntimeSub, isUserSubscribed } from "@/modules/network/data/subscriptionRuntime";
import { DEMO_INDIVIDUAL_USER_ID } from "@/modules/network";

/**
 * Phase D автопідписка: після успішного публічного бронювання, якщо
 * заклад має L3-публікацію і фізособа ще не підписана — додаємо її в
 * «Мої місця». MVP: завжди як DEMO_INDIVIDUAL_USER_ID.
 */
function autoSubscribeAfterBooking(cabinetId: string, brandName: string) {
  const pub = MOCK_CATALOG_PUBLICATIONS.find(
    (p) => p.providerCabinetId === cabinetId && p.kind === "c2b_place" && p.visibility === "public",
  );
  if (!pub) return;
  if (isUserSubscribed(DEMO_INDIVIDUAL_USER_ID, pub.id, [])) return;
  addRuntimeSub({
    id: `sub-book-${Date.now()}`,
    publicationId: pub.id,
    subscriberUserId: DEMO_INDIVIDUAL_USER_ID,
    status: "active",
    scope: { catalog: true, orders: true, bookings: true, pricesTier: "default" },
    acceptedTermsAt: new Date().toISOString(),
    clientCardId: `client-book-${Date.now()}`,
    createdAt: new Date().toISOString(),
    stats: { totalOrders: 0, totalSpentUah: 0, upcomingBookingLabel: `${brandName} — щойно записались` },
  });
}

const ENABLED_MODES: BookingMode[] = ["wizard", "ai-chat", "ai-call"];

export default function PublicBooking() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { cabinet, isFallback } = resolveCabinetBySlug(slug);
  const profile = getSalonPublicProfile(cabinet);
  const [mode, setMode] = useState<BookingMode>("wizard");
  const [initialDraft, setInitialDraft] = useState<PublicBookingDraft | undefined>();

  useEffect(() => {
    if (!cabinet) return;
    document.title = `${profile.brandName} — онлайн-запис`;
  }, [cabinet, profile.brandName]);

  if (!cabinet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <h1 className="text-xl font-semibold">Салон не знайдено</h1>
          <p className="text-sm text-muted-foreground mt-2">Перевірте посилання у власника салону.</p>
        </div>
      </div>
    );
  }

  const switchToWizard = (draft: PublicBookingDraft) => {
    setInitialDraft(draft);
    setMode("wizard");
  };

  const verticalId = getVerticalId(cabinet);

  // Ресторан має власний віджет (бронювання столиків + замовлення страв + Pay-by-Table).
  if (verticalId === "restaurant") {
    const payParam = searchParams.get("pay") ?? "";
    const tableParam = searchParams.get("table");
    const payMatch = payParam.match(/^table-(\d+)$/);
    const initialTableNumber = tableParam
      ? parseInt(tableParam, 10)
      : payMatch
        ? parseInt(payMatch[1], 10)
        : undefined;
    const initialTab = initialTableNumber || payParam ? "pay" : "table";
    return (
      <RestaurantBooking
        cabinet={cabinet}
        profile={profile}
        isDemoFallback={isFallback}
        initialTab={initialTab}
        initialTableNumber={Number.isFinite(initialTableNumber) ? initialTableNumber : undefined}
      />
    );
  }

  // Готель — багатоденне бронювання номерів з date-range + депозитом.
  if (verticalId === "hotel") {
    return <HotelBooking cabinet={cabinet} profile={profile} isDemoFallback={isFallback} />;
  }

  // Тенісний клуб — 3 таби (Оренда корту / Тренування / Групи) + кошик.
  if (verticalId === "tennis_club") {
    return <TennisBooking cabinet={cabinet} profile={profile} isDemoFallback={isFallback} />;
  }



  return (
    <PublicBookingLayout
      cabinet={cabinet}
      profile={profile}
      mode={mode}
      onModeChange={setMode}
      isDemoFallback={isFallback}
      enabledModes={ENABLED_MODES}
    >
      {mode === "wizard" && (
        <Wizard
          cabinet={cabinet}
          brandName={profile.brandName}
          initialDraft={initialDraft}
          onConfirmed={() => autoSubscribeAfterBooking(cabinet.id, profile.brandName)}
        />
      )}
      {mode === "ai-chat" && (
        <AiChatPanel
          cabinet={cabinet}
          brandName={profile.brandName}
          onSwitchToWizard={switchToWizard}
        />
      )}
      {mode === "ai-call" && (
        <AiCallOverlay
          cabinet={cabinet}
          brandName={profile.brandName}
          onClose={() => setMode("wizard")}
          onSwitchToChat={() => setMode("ai-chat")}
        />
      )}
    </PublicBookingLayout>
  );
}
