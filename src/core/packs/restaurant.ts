import type { VerticalPack } from "../verticalPack";

export const restaurantPack: VerticalPack = {
  id: "restaurant",
  displayName: "Ресторан",
  labels: {
    resourcePlural: "Столи",
    resourceSingular: "Стіл",
    staffPlural: "Офіціанти",
    staffSingular: "Офіціант",
    bookingSingular: "Резерв стола",
    bookingPlural: "Резерви",
    serviceSingular: "Страва",
    servicePlural: "Меню",
    clientSingular: "Гість",
  },
  bookings: {
    resourceKind: "table",
    defaultDurationMin: 90,
    supportsDateRange: false,
    capacityPerSlot: 4,
    requiresStaff: false,
  },
  bookingRules: {
    allowedDurationsMin: [60, 90, 120, 180],
    leadHours: 1,
    horizonDays: 30,
    maxActivePerPhone: 3,
    requiresDeposit: false,
    softHoldMin: 15,
  },
  defaults: {
    staffCommissionPct: 0, // ресторан — оклад
    fopCommissionPct: 20, // доставник-ФОП
    cashbackPct: 3,
    noShowThreshold: 2,
    serviceCategories: [
      { id: "main", label: "Гарячі страви" },
      { id: "starter", label: "Закуски" },
      { id: "dessert", label: "Десерти" },
      { id: "drink", label: "Напої" },
      { id: "bar", label: "Бар" },
      { id: "set", label: "Сети / бізнес-ланч" },
    ],
    recommendedIntegrations: ["prro-master", "glovo", "bolt-food", "telegram-bot"],
  },
  settings: {
    sections: [
      "general",
      "workstations",
      "masters",
      "services",
      "schedule",
      "categories",
      "loyalty",
      "payouts",
    ],
    hidden: ["memberships", "channels"],
  },
  settingsNav: {
    title: "Ресторан",
    subtitle:
      "Налаштування ресторану: зали і столики, кухня та зал, меню і ціни, винагороди персоналу, замовлення і доставка. Онлайн-віджет використовує ці дані.",
    overrides: {
      workstations: { label: "Зали і столики", description: "Зал, тераса, VIP — місткість" },
      masters: { label: "Персонал (кухня, зал)", description: "Кухарі, офіціанти, адміни" },
      delegations: { label: "Делегації персоналу", description: "Штат і ФОП-договори" },
      shifts: { label: "Графік змін", description: "Кухня, зал, доставка" },
      services: { label: "Меню та прайс", description: "Каталог страв і напоїв" },
      categories: { label: "Категорії меню та сети", description: "Групи страв, бізнес-ланч, сети" },
      "payout-rules": { label: "Винагороди персоналу", description: "Ставки, відсотки, чайові" },
      hours: { label: "Розклад роботи ресторану", description: "Години ресторану і кухні" },
      clients: { label: "Гості й лояльність", description: "Картка гостя, бонуси, сегменти" },
      "sales-purchases": { label: "Замовлення, доставка, закупки", description: "Policy engine, доставка, бюджет" },
      "online-booking": { label: "Онлайн-віджет (столики + меню)", description: "Публічний віджет бронювання і замовлення" },
      reminders: { label: "Нагадування гостям", description: "SMS, Viber, Telegram" },
      integrations: { label: "Інтеграції ресторану", description: "ПРРО, агрегатори доставки, боти" },
    },
  },
};
