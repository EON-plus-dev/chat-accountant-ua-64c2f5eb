/**
 * Типи реєстраційної воронки клієнтів ФОП.
 * Див. .lovable/plan.md (v3) і mem://marketing/client-registration-funnel-uk.
 */

export type PitchSource =
  | "post-booking"      // #1 — екран успіху віджету
  | "receipt-banner"    // #2 — /r/:token PDF-чек
  | "returning-client"  // #3 — повторний візит у тому ж ФОП
  | "multi-fop"         // #4 — клієнт ≥2 ФОП без linkedUserId
  | "tax-season";       // #5 — груд-лют, ПДФО

export type PitchVariant = "card" | "banner" | "inline-step" | "email-block" | "sticky-sheet";

export type PitchBenefit =
  | "tax-refund"             // дефолт: до 4 200 ₴/рік
  | "convenience-bookings"   // салон
  | "cross-booking-calendar" // теніс/мульти-секція
  | "multi-fop-calendar"     // має чеки від кількох ФОП
  | "in-app-push-savings";   // 0 ₴ за SMS

export type PitchCtaMode = "diia-oneclick" | "magic-link-email";

export interface PitchEvent {
  id: string;
  clientId: string;
  fopCabinetId: string;
  source: PitchSource;
  variant: PitchVariant;
  benefit: PitchBenefit;
  shownAt: string;
  clickedAt?: string;
  completedAt?: string;
  dismissedAt?: string;
  abandonedReason?: string;
}

export interface PitchState {
  clientId: string;
  source: PitchSource;
  lastShownAt?: string;
  dismissedCount: number;
  cooldownUntil?: string;
  autoSilencedAt?: string;
}
