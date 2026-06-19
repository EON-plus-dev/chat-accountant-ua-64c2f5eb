import type { VerticalPack } from "../verticalPack";

export const hotelPack: VerticalPack = {
  id: "hotel",
  displayName: "Готель",
  labels: {
    resourcePlural: "Номери",
    resourceSingular: "Номер",
    staffPlural: "Персонал",
    staffSingular: "Співробітник",
    bookingSingular: "Бронювання номера",
    bookingPlural: "Бронювання",
    serviceSingular: "Тариф",
    servicePlural: "Тарифи та послуги",
    clientSingular: "Гість",
  },
  bookings: {
    resourceKind: "room",
    defaultDurationMin: 60 * 24,
    supportsDateRange: true,
    capacityPerSlot: 1,
    requiresStaff: false,
  },
  bookingRules: {
    // hotel — у днях; UI трактує defaultDurationMin*N через supportsDateRange
    leadHours: 0,
    horizonDays: 365,
    maxActivePerPhone: 3,
    requiresDeposit: true,
    depositPct: 50,
    softHoldMin: 30,
  },
  defaults: {
    staffCommissionPct: 0, // готель — оклад, не комісія
    fopCommissionPct: 30, // ФОП-прибиральниці тощо
    cashbackPct: 5,
    noShowThreshold: 1,
    serviceCategories: [
      { id: "stay", label: "Проживання" },
      { id: "breakfast", label: "Сніданок" },
      { id: "minibar", label: "Mini-bar" },
      { id: "extras", label: "Додаткові послуги" },
      { id: "transfer", label: "Трансфер" },
    ],
    recommendedIntegrations: ["prro-master", "booking-com", "airbnb", "google-calendar"],
  },
  settings: {
    sections: [
      "general",
      "workstations",
      "services",
      "schedule",
      "categories",
      "loyalty",
      "channels",
    ],
    hidden: ["masters", "memberships", "payouts"],
  },
  settingsNav: {
    title: "Готель",
    subtitle:
      "Налаштування готелю: номери, тарифи, mini-bar, сніданок, прибирання і ресепшн. Онлайн-віджет бронювання номерів використовує ці дані.",
    overrides: {
      workstations: { label: "Номери", description: "Категорії, тарифи, місткість, поверхи" },
      masters: { label: "Персонал готелю", description: "Прибиральниці, ресепшн, технічні майстри" },
      delegations: { label: "Делегації персоналу", description: "Штат і ФОП-договори" },
      shifts: { label: "Графік змін", description: "Housekeeping, ресепшн, технічна служба" },
      services: { label: "Тарифи та послуги", description: "Проживання, сніданок, додаткові послуги" },
      categories: { label: "Категорії номерів і пакети", description: "Standard, Superior, Suite — пакети «Романтик» / «Бізнес»" },
      "payout-rules": { label: "Винагороди персоналу", description: "Ставки, премії, нічні доплати" },
      hours: { label: "Розклад роботи готелю", description: "Check-in 14:00 · Check-out 12:00 · 24/7 ресепшн" },
      clients: { label: "Гості й лояльність", description: "Картка гостя, бонуси, returning-сегменти" },
      "sales-purchases": { label: "Mini-bar, сніданки, закупки", description: "Policy engine, OTA-канали, бюджет" },
      "online-booking": { label: "Онлайн-бронювання номерів", description: "Публічний віджет з date-range + депозит" },
      reminders: { label: "Нагадування гостям", description: "Підтвердження бронювання, check-in/out" },
      integrations: { label: "Інтеграції готелю", description: "ПРРО, Booking.com, Airbnb (заплановано)" },
    },
  },
};
