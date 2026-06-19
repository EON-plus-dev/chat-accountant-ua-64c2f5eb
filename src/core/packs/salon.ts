import type { VerticalPack } from "../verticalPack";

export const salonPack: VerticalPack = {
  id: "salon",
  displayName: "Салон краси",
  labels: {
    resourcePlural: "Робочі місця",
    resourceSingular: "Робоче місце",
    staffPlural: "Майстри",
    staffSingular: "Майстер",
    bookingSingular: "Запис",
    bookingPlural: "Записи",
    serviceSingular: "Послуга",
    servicePlural: "Послуги",
    clientSingular: "Клієнт",
  },
  bookings: {
    resourceKind: "chair",
    defaultDurationMin: 60,
    supportsDateRange: false,
    capacityPerSlot: 1,
    requiresStaff: true,
  },
  bookingRules: {
    allowedDurationsMin: [30, 60, 90, 120],
    leadHours: 0,
    horizonDays: 30,
    maxActivePerPhone: 5,
    requiresDeposit: false,
    softHoldMin: 10,
  },
  defaults: {
    staffCommissionPct: 35,
    fopCommissionPct: 50,
    cashbackPct: 3,
    noShowThreshold: 3,
    serviceCategories: [
      { id: "hair", label: "Перукарські" },
      { id: "nails", label: "Манікюр / педикюр" },
      { id: "massage", label: "Масаж" },
      { id: "spa", label: "SPA" },
      { id: "brows", label: "Брови / вії" },
    ],
    recommendedIntegrations: ["prro-master", "viber-bot", "google-calendar", "ical-feed"],
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
    title: "Салон",
    subtitle:
      "Професійні налаштування індустрії: робочі місця, команда, прайс і правила винагород. Модуль «Бронювання» використовує ці дані для оперативної роботи.",
    overrides: {},
  },
};
