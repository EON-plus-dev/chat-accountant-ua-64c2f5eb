/**
 * Спільні типи публічної форми запису.
 * Використовуються wizard'ом, AI-чатом і AI-дзвінком — щоб усі канали
 * писали запис в одну структуру.
 */

export type BookingMode = "wizard" | "ai-chat" | "ai-call";

/**
 * Маркетинговий профіль салону для публічних поверхонь.
 * Юридична назва кабінету (ФОП ...) залишається в `cabinet.name`
 * і використовується лише для документів / чеків.
 */
export interface SalonPublicProfile {
  /** Маркетингова назва, яку бачать клієнти (напр. "Beauty Lab"). */
  brandName: string;
  /** Короткий підзаголовок (до 80 символів). */
  tagline?: string;
  /** Ініціали для аватара. Якщо не задано — рахуються з brandName. */
  logoInitials?: string;
  /** HEX-акцент бренду (для майбутньої теми віджета). */
  accentColor?: string;
}

export interface PublicBookingDraft {
  serviceIds: string[];
  masterId?: string; // undefined = «будь-який вільний»
  workstationId?: string;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  note?: string;
  marketingOptIn?: boolean;
}

export interface PublicBookingRecord {
  id: string;
  cabinetId: string;
  serviceIds: string[];
  masterId: string;
  workstationId: string;
  date: string;
  startTime: string;
  durationMin: number;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  note?: string;
  source: BookingMode;
  status: "scheduled" | "canceled";
  createdAt: string;
  cancelToken: string;
  /**
   * Звідки походить запис:
   *  - "salon" (за замовч.) — публічний віджет салону `/book/:slug`;
   *  - "master_direct" — персональний віджет ФОП-майстра `/book/m-:slug`,
   *    клієнт юридично — клієнт майстра. Використовується privacy-маскінгом
   *    у `useSalonViewBookings`.
   */
  origin?: "salon" | "master_direct";
}


export interface AvailableSlot {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  masterId: string;
  workstationId: string;
}
