/**
 * Tennis-specific додатки до базових даних `tennisData.ts`:
 *  - Розклад групових класів (фіксований weekly), з capacity та поточним заповненням
 *  - Реєстр абонементів по `clientId` (демо)
 *
 * Зберігаємо окремо, щоб не змінювати спільний `SalonClient`/`SalonService`
 * (capacity для груп — лише UI-публічного віджета).
 */

export type TennisGroupKind = "cardio" | "juniors";

export interface TennisGroupClass {
  /** id заняття у розкладі (унікальний за weekday+time+kind). */
  id: string;
  kind: TennisGroupKind;
  /** Назва, що рендериться у клітинці. */
  shortName: string;
  /** День тижня (0=нд...6=сб). */
  weekday: number;
  /** Час початку HH:MM. */
  startTime: string;
  durationMin: number;
  /** Корт. */
  workstationId: string;
  /** Тренер. */
  masterId: string;
  /** ID базової послуги (з `tennisServices`). */
  serviceId: string;
  /** Макс. кількість учасників. */
  capacity: number;
  /** Скільки місць ВЖЕ зайнято демо-семплом. */
  baseEnrolled: number;
  /** Опис у деталях (1–2 речення). */
  description: string;
}

/**
 * Тиждень класів. Pn пропускаємо (клуб закритий — той самий патерн, що bookings).
 * Картинка для UI: 5 регулярних класів × кілька днів.
 */
export const tennisGroupSchedule: TennisGroupClass[] = [
  // Cardio Tennis — Вт/Чт/Сб ранок + Вт/Чт вечір
  { id: "tg-cardio-tue-08", kind: "cardio", shortName: "Cardio", weekday: 2, startTime: "08:00", durationMin: 60, workstationId: "tcourt-5", masterId: "tc-m-3", serviceId: "tsvc-group-cardio", capacity: 12, baseEnrolled: 8, description: "Інтервальний теніс під музику. Кардіо + удари. Для всіх рівнів." },
  { id: "tg-cardio-thu-08", kind: "cardio", shortName: "Cardio", weekday: 4, startTime: "08:00", durationMin: 60, workstationId: "tcourt-5", masterId: "tc-m-3", serviceId: "tsvc-group-cardio", capacity: 12, baseEnrolled: 6, description: "Інтервальний теніс під музику. Кардіо + удари. Для всіх рівнів." },
  { id: "tg-cardio-sat-09", kind: "cardio", shortName: "Cardio", weekday: 6, startTime: "09:00", durationMin: 60, workstationId: "tcourt-6", masterId: "tc-m-3", serviceId: "tsvc-group-cardio", capacity: 12, baseEnrolled: 10, description: "Інтервальний теніс під музику. Кардіо + удари. Для всіх рівнів." },
  { id: "tg-cardio-tue-19", kind: "cardio", shortName: "Cardio", weekday: 2, startTime: "19:30", durationMin: 60, workstationId: "tcourt-7", masterId: "tc-m-1", serviceId: "tsvc-group-cardio", capacity: 12, baseEnrolled: 12, description: "Вечірня група. Кардіо + ігрова частина 4×4." },
  { id: "tg-cardio-thu-19", kind: "cardio", shortName: "Cardio", weekday: 4, startTime: "19:30", durationMin: 60, workstationId: "tcourt-7", masterId: "tc-m-1", serviceId: "tsvc-group-cardio", capacity: 12, baseEnrolled: 9, description: "Вечірня група. Кардіо + ігрова частина 4×4." },
  // Junior School — Пн відсутнє (закриті), але є Вт/Ср/Чт 17:30
  { id: "tg-jr-tue-17", kind: "juniors", shortName: "Juniors", weekday: 2, startTime: "17:30", durationMin: 90, workstationId: "tcourt-2", masterId: "tc-m-2", serviceId: "tsvc-group-juniors", capacity: 16, baseEnrolled: 14, description: "Юніорська школа 8–14 років. Техніка, фітнес, ігрова частина." },
  { id: "tg-jr-wed-17", kind: "juniors", shortName: "Juniors", weekday: 3, startTime: "17:30", durationMin: 90, workstationId: "tcourt-3", masterId: "tc-m-2", serviceId: "tsvc-group-juniors", capacity: 16, baseEnrolled: 16, description: "Юніорська школа 8–14 років. Техніка, фітнес, ігрова частина." },
  { id: "tg-jr-thu-17", kind: "juniors", shortName: "Juniors", weekday: 4, startTime: "17:30", durationMin: 90, workstationId: "tcourt-2", masterId: "tc-m-2", serviceId: "tsvc-group-juniors", capacity: 16, baseEnrolled: 11, description: "Юніорська школа 8–14 років. Техніка, фітнес, ігрова частина." },
  { id: "tg-jr-sat-11", kind: "juniors", shortName: "Juniors", weekday: 6, startTime: "11:00", durationMin: 90, workstationId: "tcourt-3", masterId: "tc-m-2", serviceId: "tsvc-group-juniors", capacity: 16, baseEnrolled: 13, description: "Юніорська школа — суботній майстер-клас." },
];

// ===================================================================
// MEMBERSHIPS (абонементи)
// ===================================================================

export type MembershipKind = "clay_10h" | "junior_pack" | "indoor_unlimited" | "cardio_8";

export interface TennisMembership {
  clientId: string;
  kind: MembershipKind;
  hoursLeft: number; // або візитів, якщо kind = clay_10h / cardio_8 — годин
  validUntil: string; // ISO
  label: string;
}

export const MEMBERSHIP_META: Record<MembershipKind, { label: string; appliesToCategory: string[]; perVisitHours?: number }> = {
  clay_10h: { label: "Абонемент 10 годин · ґрунт", appliesToCategory: ["court_rent"], perVisitHours: 1 },
  cardio_8: { label: "Cardio · 8 занять", appliesToCategory: ["group_class"], perVisitHours: 1 },
  junior_pack: { label: "Juniors · 12 занять", appliesToCategory: ["group_class"], perVisitHours: 1.5 },
  indoor_unlimited: { label: "Indoor · безліміт (місяць)", appliesToCategory: ["court_rent", "training"] },
};

export const tennisMemberships: TennisMembership[] = [
  { clientId: "tcli-1", kind: "indoor_unlimited", hoursLeft: 999, validUntil: "2026-06-30", label: MEMBERSHIP_META.indoor_unlimited.label },
  { clientId: "tcli-3", kind: "clay_10h", hoursLeft: 7, validUntil: "2026-06-15", label: MEMBERSHIP_META.clay_10h.label },
  { clientId: "tcli-6", kind: "clay_10h", hoursLeft: 4, validUntil: "2026-06-10", label: MEMBERSHIP_META.clay_10h.label },
  { clientId: "tcli-15", kind: "cardio_8", hoursLeft: 5, validUntil: "2026-07-01", label: MEMBERSHIP_META.cardio_8.label },
  { clientId: "tcli-26", kind: "junior_pack", hoursLeft: 8, validUntil: "2026-07-15", label: MEMBERSHIP_META.junior_pack.label },
];

export function findMembershipByClientId(clientId: string | undefined): TennisMembership | undefined {
  if (!clientId) return undefined;
  return tennisMemberships.find((m) => m.clientId === clientId);
}
