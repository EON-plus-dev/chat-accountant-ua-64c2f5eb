/**
 * SALON CABINET (demo-salon-3)
 * ФОП Романюк І.В. — Салон краси «Beauty Lab», 3 група 5% без ПДВ
 * Команда: 3 штатні (адміністратори + майстри) + 7 ФОП-майстрів
 * Послуги: перукарські, манікюр/педикюр, масаж/SPA
 * Особливості: бронювання, винагороди майстрам %, ПРРО (готівка/карта)
 */

import type { Document } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { TaxPayment, ContractorPayment, SalaryPayment } from "@/config/paymentsConfig";
import type { Contractor } from "@/config/settingsConfig";
import type { Employee } from "@/config/employeesConfig";
import type { Report } from "@/config/reportsConfig";
import { getDateFromNow, getDateInPast } from "./helpers";

// ============================================
// SALON-SPECIFIC DOMAIN TYPES
// ============================================

export type ServiceCategory =
  | "hair" | "nails" | "massage" | "spa" | "brows"
  // Tennis-club categories (back-compatible — лишаються невикористаними в салоні):
  | "court_rent" | "training" | "group_class" | "rental"
  // Restaurant categories (back-compatible):
  | "table_reservation" | "event_booking"
  // Hotel categories (back-compatible):
  | "room_stay" | "breakfast_addon" | "spa_addon" | "transfer_addon";
export type MasterType = "staff" | "fop"; // staff = трудовий договір, fop = ФОП-партнер
export type BookingStatus = "scheduled" | "confirmed" | "done" | "no-show" | "canceled";
export type BookingPaymentMethod = "cash" | "card" | "transfer";

/** @deprecated Use `BookableService from @/core` instead. */
export interface SalonService {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMin: number;
  price: number; // ₴
  defaultCommissionPct: number; // % майстру за замовчуванням
}

export type MasterBadge =
  | "top_rated"
  | "verified"
  | "new_talent"
  | "kids_friendly"
  | "eco"
  | "english_speaking";

/** @deprecated Use `StaffMember from @/core` instead. */
export interface SalonMaster {
  id: string;
  fullName: string;
  shortName: string; // для календаря
  type: MasterType;
  specialties: ServiceCategory[];
  /** Прив'язка до облікового запису */
  employeeId?: string; // для staff
  contractorId?: string; // для fop (master-fop у contractors)
  /**
   * Cached commission % displayed in salon UI.
   * SOURCE OF TRUTH = active `delegation_contract.terms` for this master.
   * For staff: meaningless (вони на ЗП) — лишилось для legacy demo bookings.
   * For FOP: дублює `terms.commission_pct` з активного `services`-контракту.
   */
  commissionPct: number;
  /** Робочі дні (0=нд, 1=пн … 6=сб) і години */
  schedule: { workDays: number[]; startHour: number; endHour: number };
  color: string; // hex для календаря
  avatarInitials: string;
  /** Постійні робочі місця (1+). Перше — основне, де майстер працює за замовч. */
  preferredWorkstationIds?: string[];
  /**
   * ID власного `individual` кабінету майстра (фізособа з власним ІПН).
   * Якщо undefined — майстер ще не зареєстрований у системі (invitation_pending).
   * Через цей кабінет він бачить свій Щоденник (capability `bookings_personal`),
   * агрегуючи всі записи з активних делегацій (`employment` + `services`).
   */
  masterCabinetId?: string;
  /**
   * ID `fop` кабінету майстра (лише для type="fop", лише якщо зареєстрований).
   * Створюється з `individual` кабінету з тим самим ІПН — правило власності.
   * Тримає фінансову проєкцію: КОД/КОВД, акти виконаних робіт, інвойси за оренду.
   */
  fopCabinetId?: string;
  // ============ ПУБЛІЧНІ ПОЛЯ (для віджета запису) ============
  publicTitle?: string;
  experienceYears?: number;
  rating?: number;
  reviewsCount?: number;
  completedServices?: number;
  bio?: string;
  signatureServiceIds?: string[];
  languages?: string[];
  badges?: MasterBadge[];
  photoUrl?: string;
  instagramHandle?: string;
  portfolioImages?: string[];
}

export type CrmProvider = "altegio" | "keycrm" | "bitrix24" | "amocrm" | "hubspot";

/** @deprecated Use `Client from @/core` instead. */
export interface SalonClient {
  id: string;
  fullName: string;
  phone: string;
  totalVisits: number;
  lastVisitDate?: string;
  notes?: string;
  isVip?: boolean;
  // ─── Extended (опційні, безпечні для legacy) ───
  email?: string;
  birthDate?: string;     // ISO YYYY-MM-DD
  bonusBalance?: number;  // ₴ накопичених бонусів
  noShowCount?: number;
  tags?: string[];
  allergies?: string[];
  source?: "walk-in" | "online" | "referral" | "ad" | "import";
  preferredMasterId?: string;
  /** Per-channel × per-purpose consent (GDPR Art. 7) */
  consents?: {
    gdprAcceptedAt?: string;
    marketing?: { sms?: boolean; viber?: boolean; telegram?: boolean; email?: boolean; inApp?: boolean };
    transactional?: { sms?: boolean; viber?: boolean; telegram?: boolean; email?: boolean; inApp?: boolean };
  };
  /** Пріоритетний канал доставки чеків/підтверджень. Резолвиться у `client-notify` каскадом. */
  preferredChannel?: "inApp" | "viber" | "telegram" | "sms" | "email";
  /** Зовнішні ID месенджерів клієнта */
  messengerIds?: { telegramChatId?: string; viberId?: string };
  /** Якщо клієнт ФОП має `individual`-кабінет у Fintodo — лінк через `client_user_link`.
   *  Це НЕ делегація, лише двосторонній read-only канал доставки (див. `mem://architecture/client-user-link-uk`). */
  linkedUserId?: string;
  /** Метод верифікації лінку для UI-бейджа (повна модель — у БД-таблиці `client_user_link`) */
  linkedVerification?: "diia" | "soft_match" | "magic_link";
  /** Токен одноразової відписки (опційно, для public-unsubscribe URL) */
  unsubscribeToken?: string;
  /** Sync state з зовнішньою CRM */
  externalCrmId?: { provider: CrmProvider; id: string; syncedAt: string };
  /** Власник конкретного поля (для замочків при синхронізації) */
  fieldOwnership?: Partial<Record<"fullName" | "phone" | "email" | "birthDate" | "tags" | "notes", "local" | CrmProvider>>;
  /** GDPR Art. 17 — анонімізовано, контакти видалені, bookings збережені */
  isAnonymized?: boolean;
  /** Чорний список */
  blacklist?: { since: string; reason: string; expiresAt?: string };
}

export type BookingSource =
  | "walk-in"
  | "phone"
  | "admin"
  | "wizard"
  | "ai-chat"
  | "ai-call"
  | "rebook";

/** @deprecated Use `Booking from @/core` instead. */
export interface SalonBooking {
  id: string;
  date: string; // ISO date "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  durationMin: number;
  clientId: string;
  masterId: string;
  /** Фізичне робоче місце (крісло, стіл, кабінет), де виконується запис. */
  workstationId: string;
  serviceIds: string[];
  totalPrice: number;
  commissionAmount: number;
  status: BookingStatus;
  paymentMethod?: BookingPaymentMethod;
  prroCheckId?: string;
  notes?: string;
  relatedIncomeRecordId?: string;
  relatedCommissionPaymentId?: string;
  /** Звідки прийшов запис (за замовч. walk-in для legacy). */
  source?: BookingSource;
  tipAmount?: number;
  discountAmount?: number;
  internalNote?: string;
  confirmedAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  canceledAt?: string;
  // ============ DUAL-CABINET FIELDS (Phase 1) ============
  /** Кабінет салону, у чиєму календарі видно цей запис (RLS-проєкція для салону). */
  salonCabinetId?: string;
  /** Кабінет майстра, у чиєму Щоденнику видно цей запис (RLS-проєкція для майстра). */
  masterCabinetId?: string;
  /**
   * Чий це прибуток за чек:
   * - "salon" — гроші клієнта йдуть до каси салону (staff або FOP з revenue_split)
   * - "master" — гроші йдуть напряму ФОП-майстру (FOP з workspace_rental, прямий запис)
   * Атомарний per-booking. Для hybrid-контрактів визначається конкретною операцією.
   */
  revenueOwner?: "salon" | "master";
  /**
   * Сума, яку салон винен ФОП-майстру з цього чека (revenue_split).
   * Для staff завжди undefined (вони на ЗП, не на %).
   */
  masterPayoutAmount?: number;
  /**
   * Сума, що накопичується в інвойс за оренду робочого місця (workspace_rental).
   * Зазвичай 0 для per-visit моделей; для per-shift/day/month — атрибуція дня/зміни.
   */
  rentAttributionAmount?: number;
  /**
   * Звідки прийшов запис у систему:
   * - "salon" — створений у салонному календарі (адмін, віджет салону)
   * - "master_direct" — прийшов з персонального віджета майстра `/book/m-:slug`
   */
  origin?: "salon" | "master_direct";
  // ─── Hotel-specific (back-compatible) ───
  /** Дата виїзду (для багатоденних бронювань — готель). YYYY-MM-DD */
  endDate?: string;
  /** Кількість ночей (для готельного `room_stay`). */
  nights?: number;
  /** Кількість гостей (дорослі + діти). */
  guestsCount?: number;
  /** Час check-in (готель). HH:MM */
  checkInTime?: string;
  /** Час check-out (готель). HH:MM */
  checkOutTime?: string;
}

/** Запис у waitlist — клієнт чекає на слот, якщо звільниться. */
/** @deprecated Use `WaitlistEntry from @/core` instead. */
export interface SalonWaitlistEntry {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceIds: string[];
  preferredMasterId?: string;
  /** Перший допустимий день (ISO) */
  fromDate: string;
  /** Останній допустимий день (ISO) */
  toDate: string;
  priority: "low" | "normal" | "high";
  createdAt: string;
  proposedBookingId?: string;
  status: "open" | "proposed" | "closed";
  note?: string;
}

// ============================================
// WORKSTATIONS (фізичні робочі місця)
// Для салону Beauty Lab ~110 м²: 4 крісла перукаря,
// 2 манікюрні столи, 1 масажний кабінет, 1 крісло брів/візажу.
// ============================================

export type WorkstationKind =
  | "hair_chair" | "nail_table" | "massage_room" | "brow_chair"
  // Tennis-club resources (back-compatible):
  | "court" | "shop_counter" | "cafe_table"
  // Restaurant resources (back-compatible):
  | "restaurant_table"
  // Hotel resources (back-compatible):
  | "hotel_room";

/** @deprecated Use `BookableResource from @/core` instead. */
export interface SalonWorkstation {
  id: string;
  name: string;
  kind: WorkstationKind;
  allowedCategories: ServiceCategory[];
  // ─── Optional (для bookable resource'ів типу корту, столу, номера) ───
  /** Тип ресурсу: крісло салону, корт, стіл кафе/ресторану, номер готелю. */
  resourceKind?: "chair" | "court" | "table" | "room";
  /** Покриття корту. */
  surface?: "clay" | "hard-out" | "hard-in";
  /** Ставка оренди ₴/год (для кортів — без тренера). */
  hourlyRate?: number;
  /** Чи indoor (для кортів). */
  indoor?: boolean;
  // ─── Restaurant-specific (back-compatible) ───
  /** Кількість посадкових місць (ресторан). */
  seats?: number;
  /** Зона залу ресторану. */
  zone?: "hall" | "terrace" | "vip" | "bar";
  /** Можливість курити (терасні столики). */
  smoking?: boolean;
  // ─── Hotel-specific (back-compatible) ───
  /** Категорія номера. */
  roomCategory?: "standard" | "superior" | "junior_suite" | "suite";
  /** Макс. місткість гостей у номері. */
  roomCapacity?: number;
  /** Конфігурація ліжок. */
  bedsLayout?: "single" | "double" | "twin" | "king";
  /** Поверх. */
  floor?: number;
  /** Вид з вікна. */
  viewKind?: "city" | "park" | "courtyard" | "panorama";
  /** Ціна за ніч, ₴. */
  nightlyRate?: number;
}

export interface MasterShift {
  date: string; // ISO
  masterId: string;
  workstationId: string;
  startHour: number;
  endHour: number;
}

export const salonWorkstations: SalonWorkstation[] = [
  { id: "ws-h-1", name: "Крісло 1", kind: "hair_chair", allowedCategories: ["hair"] },
  { id: "ws-h-2", name: "Крісло 2", kind: "hair_chair", allowedCategories: ["hair"] },
  { id: "ws-h-3", name: "Крісло 3", kind: "hair_chair", allowedCategories: ["hair"] },
  { id: "ws-h-4", name: "Крісло 4", kind: "hair_chair", allowedCategories: ["hair"] },
  { id: "ws-n-1", name: "Манікюрний стіл А", kind: "nail_table", allowedCategories: ["nails"] },
  { id: "ws-n-2", name: "Манікюрний стіл Б", kind: "nail_table", allowedCategories: ["nails"] },
  { id: "ws-m-1", name: "Масажний кабінет", kind: "massage_room", allowedCategories: ["massage", "spa"] },
  { id: "ws-b-1", name: "Брови / візаж", kind: "brow_chair", allowedCategories: ["brows"] },
];


// ============================================
// CABINET IDENTITY
// ============================================

const SALON_CABINET = {
  cabinetId: "demo-salon-3",
  cabinetName: "ФОП Романюк І.В. (Beauty Lab)",
  cabinetCode: "3198765432",
};

// ============================================
// SERVICES CATALOG (20 items)
// ============================================

export const salonServices: SalonService[] = [
  // Перукарські
  { id: "svc-h-1", name: "Жіноча стрижка", category: "hair", durationMin: 60, price: 650, defaultCommissionPct: 50 },
  { id: "svc-h-2", name: "Чоловіча стрижка", category: "hair", durationMin: 40, price: 450, defaultCommissionPct: 50 },
  { id: "svc-h-3", name: "Дитяча стрижка", category: "hair", durationMin: 30, price: 350, defaultCommissionPct: 45 },
  { id: "svc-h-4", name: "Укладка", category: "hair", durationMin: 45, price: 500, defaultCommissionPct: 50 },
  { id: "svc-h-5", name: "Фарбування в один тон", category: "hair", durationMin: 120, price: 1800, defaultCommissionPct: 45 },
  { id: "svc-h-6", name: "Складне фарбування (балаяж/AirTouch)", category: "hair", durationMin: 180, price: 3500, defaultCommissionPct: 50 },
  { id: "svc-h-7", name: "Тонування", category: "hair", durationMin: 60, price: 900, defaultCommissionPct: 50 },
  { id: "svc-h-8", name: "Ботокс для волосся", category: "hair", durationMin: 90, price: 1500, defaultCommissionPct: 50 },
  // Манікюр / педикюр
  { id: "svc-n-1", name: "Манікюр класичний", category: "nails", durationMin: 45, price: 400, defaultCommissionPct: 50 },
  { id: "svc-n-2", name: "Манікюр + гель-лак", category: "nails", durationMin: 90, price: 750, defaultCommissionPct: 50 },
  { id: "svc-n-3", name: "Зняття гель-лаку", category: "nails", durationMin: 30, price: 200, defaultCommissionPct: 50 },
  { id: "svc-n-4", name: "Педикюр класичний", category: "nails", durationMin: 60, price: 600, defaultCommissionPct: 50 },
  { id: "svc-n-5", name: "Педикюр + гель-лак", category: "nails", durationMin: 90, price: 950, defaultCommissionPct: 50 },
  { id: "svc-n-6", name: "Дизайн нігтів (1 нігтик)", category: "nails", durationMin: 10, price: 80, defaultCommissionPct: 50 },
  // Масаж / SPA
  { id: "svc-m-1", name: "Масаж спини 30 хв", category: "massage", durationMin: 30, price: 550, defaultCommissionPct: 60 },
  { id: "svc-m-2", name: "Масаж класичний 60 хв", category: "massage", durationMin: 60, price: 950, defaultCommissionPct: 60 },
  { id: "svc-m-3", name: "Масаж обличчя", category: "massage", durationMin: 45, price: 700, defaultCommissionPct: 60 },
  { id: "svc-m-4", name: "SPA-програма «Релакс»", category: "spa", durationMin: 90, price: 1600, defaultCommissionPct: 55 },
  // Брови / вії
  { id: "svc-b-1", name: "Корекція + фарбування брів", category: "brows", durationMin: 30, price: 350, defaultCommissionPct: 50 },
  { id: "svc-b-2", name: "Ламінування брів", category: "brows", durationMin: 45, price: 550, defaultCommissionPct: 50 },
];

// ============================================
// MASTERS (10 — 3 staff + 7 FOP)
// ============================================

export const salonMasters: SalonMaster[] = [
  // === STAFF (3) — adminstrators + masters, labor contract ===
  {
    id: "m-s-1", fullName: "Світлана Петрівна Гриценко", shortName: "Світлана", type: "staff", masterCabinetId: "ind-master-s-1",
    specialties: ["hair"], employeeId: "emp-salon-1", commissionPct: 35,
    schedule: { workDays: [1, 2, 3, 4, 5, 6], startHour: 9, endHour: 19 },
    color: "#E11D48", avatarInitials: "СГ",
    preferredWorkstationIds: ["ws-h-1"],
    publicTitle: "Старший стиліст · керівник зміни",
    experienceYears: 14, rating: 4.9, reviewsCount: 287, completedServices: 3120,
    bio: "14 років у професії. Спеціалізуюся на класичних жіночих стрижках і доглядових процедурах. Працюю з усіма типами волосся.",
    signatureServiceIds: ["svc-h-1", "svc-h-4", "svc-h-8"],
    languages: ["uk", "en"],
    badges: ["top_rated", "verified", "kids_friendly"],
    instagramHandle: "svitlana.hair.kyiv",
  },
  {
    id: "m-s-2", fullName: "Олена Михайлівна Бондар", shortName: "Олена", type: "staff", masterCabinetId: "ind-master-s-2",
    specialties: ["nails"], employeeId: "emp-salon-2", commissionPct: 35,
    schedule: { workDays: [2, 3, 4, 5, 6], startHour: 10, endHour: 20 },
    color: "#7C3AED", avatarInitials: "ОБ",
    preferredWorkstationIds: ["ws-n-1"],
    publicTitle: "Майстриня манікюру · педикюру",
    experienceYears: 7, rating: 4.8, reviewsCount: 196, completedServices: 1840,
    bio: "Акуратний апаратний манікюр і складний дизайн. Працюю з матеріалами преміумсегменту, гіпоалергенні покриття.",
    signatureServiceIds: ["svc-n-2", "svc-n-5", "svc-n-6"],
    languages: ["uk"],
    badges: ["verified", "eco"],
  },
  {
    id: "m-s-3", fullName: "Андрій Олегович Лисенко", shortName: "Андрій", type: "staff", masterCabinetId: "ind-master-s-3",
    specialties: ["massage", "spa"], employeeId: "emp-salon-3", commissionPct: 40,
    schedule: { workDays: [1, 3, 5, 6], startHour: 11, endHour: 21 },
    color: "#0891B2", avatarInitials: "АЛ",
    preferredWorkstationIds: ["ws-m-1"],
    publicTitle: "Масажист-реабілітолог",
    experienceYears: 11, rating: 4.95, reviewsCount: 312, completedServices: 2480,
    bio: "Медична освіта, сертифікований реабілітолог. Класичний, спортивний і лімфодренажний масаж. Працюю з болями у спині та шиї.",
    signatureServiceIds: ["svc-m-2", "svc-m-3", "svc-m-4"],
    languages: ["uk", "en"],
    badges: ["top_rated", "verified", "english_speaking"],
  },
  // === FOP partners (7) ===
  {
    id: "m-f-1", fullName: "Анна Володимирівна Сидоренко", shortName: "Анна", type: "fop", masterCabinetId: "ind-master-f-1", fopCabinetId: "fop-master-f-1",
    specialties: ["hair"], contractorId: "c-salon-master-1", commissionPct: 55,
    schedule: { workDays: [1, 2, 3, 4, 5], startHour: 10, endHour: 20 },
    color: "#DB2777", avatarInitials: "АС",
    preferredWorkstationIds: ["ws-h-2"],
    publicTitle: "Топ-стиліст · колорист AirTouch",
    experienceYears: 9, rating: 4.95, reviewsCount: 421, completedServices: 2960,
    bio: "Сертифікований колорист L'Oréal Professionnel. Складне фарбування: AirTouch, балаяж, шатуш. Працюю з блондами без жовтизни.",
    signatureServiceIds: ["svc-h-6", "svc-h-5", "svc-h-7"],
    languages: ["uk", "en", "pl"],
    badges: ["top_rated", "verified", "english_speaking"],
    instagramHandle: "anna.color.lab",
  },
  {
    id: "m-f-2", fullName: "Марина Сергіївна Ковальчук", shortName: "Марина", type: "fop",
    specialties: ["hair"], contractorId: "c-salon-master-2", commissionPct: 50,
    schedule: { workDays: [2, 3, 4, 5, 6], startHour: 11, endHour: 21 },
    color: "#F59E0B", avatarInitials: "МК",
    preferredWorkstationIds: ["ws-h-3"],
    publicTitle: "Стиліст-універсал",
    experienceYears: 6, rating: 4.7, reviewsCount: 138, completedServices: 1240,
    bio: "Жіночі та чоловічі стрижки, укладки, доглядові процедури. Уважна до побажань, без зайвого «продажу» додаткових послуг.",
    signatureServiceIds: ["svc-h-1", "svc-h-2", "svc-h-4"],
    languages: ["uk"],
    badges: ["verified"],
  },
  {
    id: "m-f-3", fullName: "Юлія Андріївна Мельник", shortName: "Юлія", type: "fop",
    specialties: ["hair"], contractorId: "c-salon-master-3", commissionPct: 50,
    schedule: { workDays: [1, 2, 4, 5, 6], startHour: 9, endHour: 18 },
    color: "#10B981", avatarInitials: "ЮМ",
    preferredWorkstationIds: ["ws-h-4"],
    publicTitle: "Стиліст · спеціаліст з догляду",
    experienceYears: 8, rating: 4.85, reviewsCount: 204, completedServices: 1670,
    bio: "Ботокс, кератин, реконструкція волосся. Допоможу відновити волосся після фарбувань.",
    signatureServiceIds: ["svc-h-8", "svc-h-4", "svc-h-1"],
    languages: ["uk"],
    badges: ["verified", "eco"],
  },
  {
    id: "m-f-4", fullName: "Олександр Іванович Зайцев", shortName: "Олександр", type: "fop",
    specialties: ["hair"], contractorId: "c-salon-master-4", commissionPct: 45,
    schedule: { workDays: [3, 4, 5, 6, 0], startHour: 11, endHour: 20 },
    color: "#6366F1", avatarInitials: "ОЗ",
    preferredWorkstationIds: ["ws-h-4", "ws-h-3"],
    publicTitle: "Barber · чоловічі стрижки",
    experienceYears: 5, rating: 4.8, reviewsCount: 167, completedServices: 1430,
    bio: "Класичні та сучасні чоловічі стрижки, оформлення бороди. Чітка геометрія, fade різної складності.",
    signatureServiceIds: ["svc-h-2", "svc-h-3"],
    languages: ["uk", "en"],
    badges: ["verified", "english_speaking"],
    instagramHandle: "sasha.barber.kyiv",
  },
  {
    id: "m-f-5", fullName: "Тетяна Романівна Шевчук", shortName: "Тетяна", type: "fop",
    specialties: ["nails"], contractorId: "c-salon-master-5", commissionPct: 50,
    schedule: { workDays: [1, 2, 3, 5, 6], startHour: 10, endHour: 19 },
    color: "#A855F7", avatarInitials: "ТШ",
    preferredWorkstationIds: ["ws-n-1"],
    publicTitle: "Майстриня нігтьового сервісу",
    experienceYears: 4, rating: 4.75, reviewsCount: 89, completedServices: 720,
    bio: "Манікюр, педикюр, гель-лак. Спокійна атмосфера, без зайвих розмов, якщо хочете відпочити.",
    signatureServiceIds: ["svc-n-2", "svc-n-4", "svc-n-5"],
    languages: ["uk"],
    badges: ["new_talent", "verified"],
  },
  {
    id: "m-f-6", fullName: "Катерина Олегівна Поліщук", shortName: "Катерина", type: "fop",
    specialties: ["nails", "brows"], contractorId: "c-salon-master-6", commissionPct: 50,
    schedule: { workDays: [2, 3, 4, 5, 6], startHour: 12, endHour: 21 },
    color: "#EC4899", avatarInitials: "КП",
    preferredWorkstationIds: ["ws-n-2", "ws-b-1"],
    publicTitle: "Brow-artist · майстриня манікюру",
    experienceYears: 6, rating: 4.9, reviewsCount: 243, completedServices: 1890,
    bio: "Архітектура брів за індивідуальним типажем обличчя. Ламінування, фарбування, корекція. Також роблю акуратний манікюр.",
    signatureServiceIds: ["svc-b-1", "svc-b-2", "svc-n-2"],
    languages: ["uk", "en"],
    badges: ["top_rated", "verified"],
    instagramHandle: "kate.brows.studio",
  },
  {
    id: "m-f-7", fullName: "Дмитро Васильович Назаренко", shortName: "Дмитро", type: "fop", masterCabinetId: "ind-master-f-7", fopCabinetId: "fop-master-f-7",
    specialties: ["massage", "spa"], contractorId: "c-salon-master-7", commissionPct: 60,
    schedule: { workDays: [2, 4, 5, 6, 0], startHour: 12, endHour: 21 },
    color: "#0EA5E9", avatarInitials: "ДН",
    preferredWorkstationIds: ["ws-m-1"],
    publicTitle: "Масажист · SPA-програми",
    experienceYears: 7, rating: 4.85, reviewsCount: 174, completedServices: 1380,
    bio: "Розслаблюючий і SPA-масаж. Спеціалізуюся на роботі з гостями, які мають високе фізичне навантаження.",
    signatureServiceIds: ["svc-m-1", "svc-m-2", "svc-m-4"],
    languages: ["uk", "en"],
    badges: ["verified", "english_speaking"],
  },
];


// ============================================
// CLIENTS (25)
// ============================================

export const salonClients: SalonClient[] = [
  { id: "cli-1", fullName: "Іванова Марія Петрівна", phone: "+380501234501", totalVisits: 14, lastVisitDate: getDateInPast(3), isVip: true, notes: "Постійна клієнтка, фарбування у Анни", email: "ivanova.m@example.com", birthDate: "1989-04-12", bonusBalance: 480, noShowCount: 0, tags: ["фарбування", "догляд"], allergies: ["амоніак"], source: "referral", preferredMasterId: "mst-1", preferredChannel: "inApp", linkedUserId: "demo-individual-mariia", linkedVerification: "diia", consents: { gdprAcceptedAt: getDateInPast(120), marketing: { sms: true, viber: true, telegram: false, email: true, inApp: true }, transactional: { sms: true, viber: true, telegram: true, email: true, inApp: true } } },
  { id: "cli-2", fullName: "Коваленко Олена Сергіївна", phone: "+380672345602", totalVisits: 9, lastVisitDate: getDateInPast(7), email: "kovalenko@example.com", birthDate: "1992-09-25", bonusBalance: 220, noShowCount: 1, tags: ["стрижка"], source: "online", consents: { gdprAcceptedAt: getDateInPast(95), marketing: { sms: true, viber: false, telegram: true, email: false }, transactional: { sms: true, viber: true, telegram: true, email: true } } },
  { id: "cli-3", fullName: "Петренко Андрій Володимирович", phone: "+380631234503", totalVisits: 21, lastVisitDate: getDateInPast(5), isVip: true, notes: "VIP — масаж щотижня", email: "a.petrenko@example.com", birthDate: "1985-11-03", bonusBalance: 1240, noShowCount: 0, tags: ["масаж", "VIP"], source: "walk-in", preferredMasterId: "mst-3", consents: { gdprAcceptedAt: getDateInPast(200), marketing: { sms: false, viber: true, telegram: true, email: true }, transactional: { sms: true, viber: true, telegram: true, email: true } }, externalCrmId: { provider: "altegio", id: "alt-3387", syncedAt: getDateInPast(0) }, fieldOwnership: { fullName: "altegio", phone: "altegio", email: "altegio" } },
  { id: "cli-4", fullName: "Шевченко Юлія Іванівна", phone: "+380501234504", totalVisits: 4, lastVisitDate: getDateInPast(12), email: "y.shevchenko@example.com", birthDate: "1996-02-18", bonusBalance: 90, noShowCount: 0, tags: ["манікюр"], source: "ad", consents: { gdprAcceptedAt: getDateInPast(60), marketing: { sms: true, viber: true }, transactional: { sms: true, viber: true } } },
  { id: "cli-5", fullName: "Бондаренко Олексій Петрович", phone: "+380672345605", totalVisits: 2, lastVisitDate: getDateInPast(18), bonusBalance: 40, noShowCount: 2, tags: ["стрижка"], source: "walk-in", consents: { gdprAcceptedAt: getDateInPast(40), marketing: {}, transactional: { sms: true } } },
  { id: "cli-6", fullName: "Мельник Анастасія Олегівна", phone: "+380631234506", totalVisits: 7, lastVisitDate: getDateInPast(4), email: "melnyk@example.com", birthDate: "1991-07-30", bonusBalance: 310, noShowCount: 0, tags: ["фарбування"], source: "referral", preferredMasterId: "mst-1", consents: { gdprAcceptedAt: getDateInPast(75), marketing: { sms: true, viber: true, email: true }, transactional: { sms: true } } },
  { id: "cli-7", fullName: "Кравченко Ірина Володимирівна", phone: "+380501234507", totalVisits: 12, lastVisitDate: getDateInPast(2), isVip: true, email: "kravchenko@example.com", birthDate: "1987-05-14", bonusBalance: 720, noShowCount: 0, tags: ["VIP", "догляд"], source: "referral", consents: { gdprAcceptedAt: getDateInPast(180), marketing: { sms: true, viber: true, telegram: true, email: true }, transactional: { sms: true, viber: true, telegram: true, email: true } }, externalCrmId: { provider: "altegio", id: "alt-3402", syncedAt: getDateInPast(0) } },
  { id: "cli-8", fullName: "Лисенко Дмитро Сергійович", phone: "+380672345608", totalVisits: 3, lastVisitDate: getDateInPast(20), bonusBalance: 60, noShowCount: 1, tags: ["стрижка"], source: "online", consents: { gdprAcceptedAt: getDateInPast(50), marketing: { telegram: true }, transactional: { telegram: true, sms: true } } },
  { id: "cli-9", fullName: "Гордієнко Наталія Андріївна", phone: "+380631234509", totalVisits: 6, lastVisitDate: getDateInPast(9), email: "n.gordienko@example.com", birthDate: "1994-12-08", bonusBalance: 180, noShowCount: 0, tags: ["манікюр"], source: "ad", consents: { gdprAcceptedAt: getDateInPast(70), marketing: { sms: true, viber: true }, transactional: { sms: true, viber: true } } },
  { id: "cli-10", fullName: "Тимошенко Вікторія Олександрівна", phone: "+380501234510", totalVisits: 11, lastVisitDate: getDateInPast(6), email: "tymoshenko@example.com", birthDate: "1990-03-22", bonusBalance: 540, noShowCount: 0, tags: ["фарбування", "догляд"], source: "walk-in", preferredMasterId: "mst-2", consents: { gdprAcceptedAt: getDateInPast(110), marketing: { sms: true, viber: true, email: true }, transactional: { sms: true, viber: true } } },
  { id: "cli-11", fullName: "Захарченко Євгенія Михайлівна", phone: "+380672345611", totalVisits: 5, lastVisitDate: getDateInPast(14), bonusBalance: 130, noShowCount: 0, tags: ["манікюр"], source: "referral", consents: { gdprAcceptedAt: getDateInPast(85), marketing: { viber: true }, transactional: { viber: true, sms: true } } },
  { id: "cli-12", fullName: "Костенко Олег Володимирович", phone: "+380631234512", totalVisits: 18, lastVisitDate: getDateInPast(1), isVip: true, notes: "Стрижка кожні 3 тижні", email: "kostenko@example.com", birthDate: "1982-10-09", bonusBalance: 980, noShowCount: 0, tags: ["VIP", "стрижка"], source: "walk-in", preferredChannel: "inApp", linkedUserId: "demo-individual-kostenko", linkedVerification: "soft_match", consents: { gdprAcceptedAt: getDateInPast(220), marketing: { sms: true, telegram: true, email: true, inApp: true }, transactional: { sms: true, telegram: true, email: true, inApp: true } } },
  { id: "cli-13", fullName: "Литвиненко Тетяна Петрівна", phone: "+380501234513", totalVisits: 8, lastVisitDate: getDateInPast(8), email: "lytvynenko@example.com", birthDate: "1993-06-17", bonusBalance: 260, noShowCount: 0, tags: ["догляд"], source: "online", consents: { gdprAcceptedAt: getDateInPast(95), marketing: { sms: true, viber: true, email: true }, transactional: { sms: true } } },
  { id: "cli-14", fullName: "Романенко Софія Сергіївна", phone: "+380672345614", totalVisits: 4, lastVisitDate: getDateInPast(11), bonusBalance: 100, noShowCount: 1, tags: ["манікюр"], source: "ad", consents: { gdprAcceptedAt: getDateInPast(55), marketing: { sms: true }, transactional: { sms: true } } },
  { id: "cli-15", fullName: "Власенко Олена Андріївна", phone: "+380631234515", totalVisits: 13, lastVisitDate: getDateInPast(3), email: "vlasenko@example.com", birthDate: "1988-08-04", bonusBalance: 620, noShowCount: 0, tags: ["фарбування"], source: "referral", preferredMasterId: "mst-1", consents: { gdprAcceptedAt: getDateInPast(130), marketing: { sms: true, viber: true, email: true }, transactional: { sms: true, viber: true, email: true } }, externalCrmId: { provider: "altegio", id: "alt-3501", syncedAt: getDateInPast(0) } },
  { id: "cli-16", fullName: "Гаврилюк Максим Олегович", phone: "+380501234516", totalVisits: 6, lastVisitDate: getDateInPast(15), bonusBalance: 150, noShowCount: 0, tags: ["стрижка"], source: "walk-in", consents: { gdprAcceptedAt: getDateInPast(80), marketing: { sms: true }, transactional: { sms: true } } },
  { id: "cli-17", fullName: "Сергієнко Аліна Іванівна", phone: "+380672345617", totalVisits: 9, lastVisitDate: getDateInPast(4), email: "sergienko@example.com", birthDate: "1995-01-28", bonusBalance: 380, noShowCount: 0, tags: ["манікюр", "догляд"], source: "online", consents: { gdprAcceptedAt: getDateInPast(100), marketing: { sms: true, viber: true, email: true }, transactional: { sms: true, viber: true } } },
  { id: "cli-18", fullName: "Чорна Олександра Володимирівна", phone: "+380631234518", totalVisits: 7, lastVisitDate: getDateInPast(10), bonusBalance: 210, noShowCount: 0, tags: ["фарбування"], source: "ad", consents: { gdprAcceptedAt: getDateInPast(65), marketing: { sms: true, viber: true }, transactional: { sms: true, viber: true } } },
  { id: "cli-19", fullName: "Морозенко Інна Петрівна", phone: "+380501234519", totalVisits: 3, lastVisitDate: getDateInPast(75), bonusBalance: 70, noShowCount: 1, tags: ["стрижка"], source: "walk-in", consents: { gdprAcceptedAt: getDateInPast(45), marketing: {}, transactional: { sms: true } } },
  { id: "cli-20", fullName: "Бойко Олег Сергійович", phone: "+380672345620", totalVisits: 5, lastVisitDate: getDateInPast(13), bonusBalance: 140, noShowCount: 0, tags: ["стрижка"], source: "online", consents: { gdprAcceptedAt: getDateInPast(60), marketing: { telegram: true }, transactional: { telegram: true, sms: true } } },
  { id: "cli-21", fullName: "Денисенко Юлія Олегівна", phone: "+380501234521", totalVisits: 10, lastVisitDate: getDateInPast(7), email: "denysenko@example.com", birthDate: "1991-11-15", bonusBalance: 440, noShowCount: 0, tags: ["манікюр"], source: "referral", consents: { gdprAcceptedAt: getDateInPast(105), marketing: { sms: true, viber: true, email: true }, transactional: { sms: true, viber: true, email: true } } },
  { id: "cli-22", fullName: "Левченко Олександр Михайлович", phone: "+380672345622", totalVisits: 4, lastVisitDate: getDateInPast(16), bonusBalance: 80, noShowCount: 0, tags: ["стрижка"], source: "walk-in", consents: { gdprAcceptedAt: getDateInPast(50), marketing: { sms: true }, transactional: { sms: true } } },
  { id: "cli-23", fullName: "Білоус Катерина Сергіївна", phone: "+380631234523", totalVisits: 8, lastVisitDate: getDateInPast(5), email: "bilous@example.com", birthDate: "1989-07-09", bonusBalance: 300, noShowCount: 0, tags: ["догляд"], source: "online", consents: { gdprAcceptedAt: getDateInPast(90), marketing: { sms: true, viber: true, email: true }, transactional: { sms: true, viber: true } } },
  { id: "cli-24", fullName: "Клієнт #1247", phone: "—", totalVisits: 2, lastVisitDate: getDateInPast(25), bonusBalance: 0, noShowCount: 0, isAnonymized: true, notes: "Дані видалено за запитом клієнта (GDPR Art. 17, " + getDateInPast(30) + ")" },
  { id: "cli-25", fullName: "Олексієнко Маргарита Іванівна", phone: "+380501234525", totalVisits: 6, lastVisitDate: getDateInPast(95), email: "oleksienko@example.com", birthDate: "1986-04-20", bonusBalance: 0, noShowCount: 3, tags: ["проблемний"], source: "ad", consents: { gdprAcceptedAt: getDateInPast(150), marketing: {}, transactional: { sms: true } }, blacklist: { since: getDateInPast(20), reason: "3 no-show поспіль" } },
  // Stub client for privacy masking — записи прямих клієнтів ФОП-майстра на оренді,
  // які салон бачить лише як зайнятий слот без PII. Реальний контакт — у Щоденнику майстра.
  { id: "cli-private-master", fullName: "Клієнт ФОП-майстра", phone: "—", totalVisits: 0, notes: "Приватний клієнт майстра-орендаря — контакт прихований за договором" },
];

/** Спеціальний id клієнта, який салон НЕ повинен розкривати. */
export const PRIVATE_MASTER_CLIENT_ID = "cli-private-master";

// ============================================
// BOOKINGS GENERATOR
// Realistic seed: ~80 past (last 30 days) + ~25 future (next 14 days)
// ============================================

function pickService(category: ServiceCategory, seed: number): SalonService {
  const list = salonServices.filter((s) => s.category === category);
  return list[seed % list.length];
}

function generateBookings(): SalonBooking[] {
  const out: SalonBooking[] = [];
  let id = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mkBooking = (offsetDays: number, masterId: string, startTime: string, serviceIds: string[], clientId: string, statusOverride?: BookingStatus): SalonBooking => {
    const master = salonMasters.find((m) => m.id === masterId)!;
    const services = serviceIds.map((sid) => salonServices.find((s) => s.id === sid)!);
    const totalPrice = services.reduce((s, srv) => s + srv.price, 0);
    const durationMin = services.reduce((s, srv) => s + srv.durationMin, 0);
    const commissionAmount = Math.round((totalPrice * master.commissionPct) / 100);
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    const dateIso = d.toISOString().split("T")[0];

    // Workstation: майстерове перше preferred, що дозволяє категорію першої послуги.
    const primaryCat = services[0].category;
    const preferred = master.preferredWorkstationIds ?? [];
    const matchingPreferred = preferred
      .map((wid) => salonWorkstations.find((w) => w.id === wid))
      .find((w) => w && w.allowedCategories.includes(primaryCat));
    const fallback = salonWorkstations.find((w) => w.allowedCategories.includes(primaryCat));
    const workstationId = (matchingPreferred ?? fallback ?? salonWorkstations[0]).id;

    let status: BookingStatus;
    let paymentMethod: BookingPaymentMethod | undefined;
    if (statusOverride) {
      status = statusOverride;
    } else if (offsetDays < 0) {
      const r = (id * 37) % 100;
      if (r < 88) status = "done";
      else if (r < 93) status = "no-show";
      else status = "canceled";
    } else if (offsetDays === 0) {
      status = (id % 2 === 0) ? "confirmed" : "scheduled";
    } else {
      status = "scheduled";
    }

    if (status === "done") {
      const r = (id * 13) % 100;
      if (r < 50) paymentMethod = "card";
      else if (r < 90) paymentMethod = "cash";
      else paymentMethod = "transfer";
    }

    // m-f-7 — ФОП-орендар: всі його записи в demo маркуємо як прямі (master_direct),
    // revenueOwner=master, увесь чек йде майстру (оренда сплачується окремим інвойсом).
    const isRentalMaster = masterId === "m-f-7";

    return {
      id: `bk-${String(id++).padStart(4, "0")}`,
      date: dateIso,
      startTime,
      durationMin,
      clientId,
      masterId,
      workstationId,
      serviceIds,
      totalPrice,
      commissionAmount,
      status,
      paymentMethod,
      prroCheckId: status === "done" && paymentMethod !== "transfer" ? `prro-${id}` : undefined,
      salonCabinetId: "demo-salon-3",
      masterCabinetId: isRentalMaster ? "ind-master-f-7" : undefined,
      origin: isRentalMaster ? "master_direct" : "salon",
      revenueOwner: isRentalMaster ? "master" : "salon",
      masterPayoutAmount: isRentalMaster ? totalPrice : undefined,
    };
  };



  // Past bookings — distribute across last 30 days, ~3-5/day per active master subset
  const masterPool = ["m-s-1", "m-s-2", "m-s-3", "m-f-1", "m-f-2", "m-f-3", "m-f-4", "m-f-5", "m-f-6", "m-f-7"];
  const slotTimes = ["09:00", "10:00", "10:30", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "17:30", "18:00", "19:00"];

  const scenarios: Array<{ master: string; cat: ServiceCategory; combo?: ServiceCategory[] }> = [
    { master: "m-s-1", cat: "hair" },
    { master: "m-s-2", cat: "nails" },
    { master: "m-s-3", cat: "massage" },
    { master: "m-f-1", cat: "hair" },
    { master: "m-f-2", cat: "hair" },
    { master: "m-f-3", cat: "hair" },
    { master: "m-f-4", cat: "hair" },
    { master: "m-f-5", cat: "nails" },
    { master: "m-f-6", cat: "nails", combo: ["nails", "brows"] },
    { master: "m-f-7", cat: "massage" },
  ];

  // 30 days back
  for (let offset = -30; offset <= -1; offset++) {
    const dow = ((new Date(today).getDay() + offset % 7) + 7) % 7;
    if (dow === 1) continue; // Mon — closed-ish, lighter day
    const bookingsThisDay = 3 + ((offset * 7) % 5);
    for (let i = 0; i < bookingsThisDay; i++) {
      const scIdx = (i + Math.abs(offset)) % scenarios.length;
      const sc = scenarios[scIdx];
      const master = salonMasters.find((m) => m.id === sc.master)!;
      if (!master.schedule.workDays.includes(dow)) continue;
      const time = slotTimes[(i * 3 + Math.abs(offset)) % slotTimes.length];
      let serviceIds: string[];
      if (sc.combo) {
        serviceIds = sc.combo.map((c, idx) => pickService(c, i + idx).id);
      } else {
        const svc = pickService(sc.cat, i + Math.abs(offset));
        serviceIds = [svc.id];
      }
      const clientId = salonClients[(i * 5 + Math.abs(offset)) % salonClients.length].id;
      out.push(mkBooking(offset, sc.master, time, serviceIds, clientId));
    }
  }

  // Today + 14 future days
  for (let offset = 0; offset <= 14; offset++) {
    const dow = ((new Date(today).getDay() + offset) + 7) % 7;
    if (dow === 1) continue;
    const bookingsThisDay = offset === 0 ? 5 : (2 + (offset % 3));
    for (let i = 0; i < bookingsThisDay; i++) {
      const scIdx = (i + offset) % scenarios.length;
      const sc = scenarios[scIdx];
      const master = salonMasters.find((m) => m.id === sc.master)!;
      if (!master.schedule.workDays.includes(dow)) continue;
      const time = slotTimes[(i * 2 + offset) % slotTimes.length];
      let serviceIds: string[];
      if (sc.combo) {
        serviceIds = sc.combo.map((c, idx) => pickService(c, i + idx).id);
      } else {
        const svc = pickService(sc.cat, i + offset);
        serviceIds = [svc.id];
      }
      const clientId = salonClients[(i * 3 + offset) % salonClients.length].id;
      out.push(mkBooking(offset, sc.master, time, serviceIds, clientId));
    }
  }

  return out;
}

export const salonBookings: SalonBooking[] = generateBookings();

// ============================================
// MASTER SHIFTS (±7 days, deterministic from schedule + primary preferred workstation)
// ============================================

function generateShifts(): MasterShift[] {
  const out: MasterShift[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let offset = -7; offset <= 7; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dateIso = d.toISOString().split("T")[0];
    const dow = d.getDay();
    for (const m of salonMasters) {
      if (!m.schedule.workDays.includes(dow)) continue;
      const wsId = m.preferredWorkstationIds?.[0];
      if (!wsId) continue;
      out.push({
        date: dateIso,
        masterId: m.id,
        workstationId: wsId,
        startHour: m.schedule.startHour,
        endHour: m.schedule.endHour,
      });
    }
  }
  return out;
}

export const salonShifts: MasterShift[] = generateShifts();


// ============================================
// EMPLOYEES (3 staff)
// ============================================

export const salonEmployees: Employee[] = [
  {
    id: "emp-salon-1",
    cabinetId: "demo-salon-3",
    fullName: "Гриценко Світлана Петрівна",
    position: "Старший адміністратор / Перукар-колорист",
    contractType: "labor",
    status: "active",
    startDate: "2024-03-01",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Пн–Сб 9:00–19:00",
    location: "office",
    contractNumber: "ТД-2024-01",
    contractDate: "2024-03-01",
    militaryStatus: "not-applicable",
  },
  {
    id: "emp-salon-2",
    cabinetId: "demo-salon-3",
    fullName: "Бондар Олена Михайлівна",
    position: "Адміністратор / Майстер манікюру",
    contractType: "labor",
    status: "active",
    startDate: "2024-05-15",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Вт–Сб 10:00–20:00",
    location: "office",
    contractNumber: "ТД-2024-02",
    contractDate: "2024-05-15",
    militaryStatus: "not-applicable",
  },
  {
    id: "emp-salon-3",
    cabinetId: "demo-salon-3",
    fullName: "Лисенко Андрій Олегович",
    position: "Масажист-реабілітолог",
    contractType: "labor",
    status: "active",
    startDate: "2025-01-10",
    employmentMode: "part-time",
    fte: 0.75,
    schedule: "Пн/Ср/Пт/Сб 11:00–21:00",
    location: "office",
    contractNumber: "ТД-2025-01",
    contractDate: "2025-01-10",
    militaryStatus: "liable",
    militaryDocumentDate: "2024-12-20",
  },
];

// ============================================
// CONTRACTORS — 7 master-FOPs + suppliers
// ============================================

export const salonContractors: Contractor[] = [
  // 7 master-FOPs
  ...salonMasters.filter((m) => m.type === "fop").map<Contractor>((m, idx) => ({
    id: m.contractorId!,
    name: `ФОП ${m.fullName.split(" ").slice(0, 2).join(" ")}`,
    fullName: `Фізична особа-підприємець ${m.fullName}`,
    code: `298765432${idx}`,
    iban: `UA${30 + idx}305299000026004${String(1000 + idx).padStart(4, "0")}00001`,
    ibanConfirmed: true,
    phone: `+38067123450${idx}`,
    type: "fop",
    role: "master",
    taxStatus: m.id === "m-f-7" ? "Платник ЄП 3 група (5%)" : "Платник ЄП 2 група",
    isSynced: true,
    status: "active",
    tags: ["master-fop", m.specialties.join(",")],
    notes: `Майстер-партнер салону «Beauty Lab». Винагорода ${m.commissionPct}% від чека.`,
    createdAt: "2024-06-01",
  })),
  // Suppliers
  {
    id: "c-salon-rent",
    name: "ТОВ «Бізнес-Центр Васильків»",
    fullName: "ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «БІЗНЕС-ЦЕНТР ВАСИЛЬКІВ»",
    code: "41234567",
    iban: "UA213052990000026007000000123",
    ibanConfirmed: true,
    type: "legal",
    role: "supplier",
    taxStatus: "Платник ПДВ",
    isSynced: true,
    status: "active",
    notes: "Оренда приміщення салону, вул. Велика Васильківська, 72",
    createdAt: "2024-02-01",
  },
  {
    id: "c-salon-cosm",
    name: "ТОВ «Beauty Distribution»",
    fullName: "ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «БʼЮТІ ДИСТРИБ'ЮШН»",
    code: "42345678",
    iban: "UA533052990000026007000000456",
    type: "legal",
    role: "supplier",
    taxStatus: "Платник ПДВ",
    isSynced: true,
    status: "active",
    notes: "Постачальник професійної косметики (Wella, OPI, L'Oreal Pro)",
    createdAt: "2024-03-10",
  },
  {
    id: "c-salon-laundry",
    name: "ТОВ «АкваКлін»",
    code: "43456789",
    type: "legal",
    role: "supplier",
    isSynced: false,
    status: "active",
    notes: "Прання рушників та халатів",
    createdAt: "2024-04-01",
  },
  {
    id: "c-salon-utility",
    name: "ПрАТ «ДТЕК Київські електромережі»",
    code: "00131305",
    type: "legal",
    role: "supplier",
    isSynced: true,
    status: "active",
    notes: "Постачання електроенергії",
    createdAt: "2024-02-01",
  },
  {
    id: "c-salon-telecom",
    name: "ТОВ «Київстар»",
    code: "21673832",
    type: "legal",
    role: "supplier",
    isSynced: true,
    status: "active",
    notes: "Інтернет та телефонія",
    createdAt: "2024-02-01",
  },
];

// ============================================
// DOCUMENTS
// ============================================

export const salonDocuments: Document[] = [
  {
    id: "doc-salon-001",
    ...SALON_CABINET,
    number: "ОРЕНДА-САЛОН-2026",
    type: "rental-agreement",
    category: "contract",
    title: "Договір оренди приміщення салону",
    date: "2026-01-01",
    dueDate: "2026-12-31",
    amount: 48000,
    currency: "UAH",
    contractor: { id: "c-salon-rent", name: "ТОВ «Бізнес-Центр Васильків»", code: "41234567" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2026-01-01T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2026-01-01T12:00:00Z",
    aiSummary: "Оренда салону 95 м² на вул. Велика Васильківська, 72. 48 000 ₴/міс, до 5 числа.",
  },
  {
    id: "doc-salon-002",
    ...SALON_CABINET,
    number: "ПОСТ-COSM-2026-01",
    type: "contract",
    category: "contract",
    title: "Договір постачання косметики",
    date: "2026-01-15",
    dueDate: "2026-12-31",
    amount: 0,
    currency: "UAH",
    contractor: { id: "c-salon-cosm", name: "ТОВ «Beauty Distribution»", code: "42345678" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2026-01-15T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2026-01-15T12:00:00Z",
    aiSummary: "Рамковий договір на закупівлю професійної косметики. Постоплата 14 днів.",
  },
  // 7 ЦПХ-договорів з ФОП-майстрами
  ...salonMasters.filter((m) => m.type === "fop").map<Document>((m, idx) => ({
    id: `doc-salon-cph-${idx + 1}`,
    ...SALON_CABINET,
    number: `ЦПХ-2026-${String(idx + 1).padStart(3, "0")}`,
    type: "contract",
    category: "contract",
    title: `Договір ЦПХ з ${m.fullName.split(" ").slice(0, 2).join(" ")}`,
    date: "2026-01-10",
    dueDate: "2026-12-31",
    amount: 0,
    currency: "UAH",
    contractor: { id: m.contractorId!, name: `ФОП ${m.fullName.split(" ").slice(0, 2).join(" ")}`, code: `298765432${idx}` },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2026-01-10T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2026-01-10T12:00:00Z",
    aiSummary: `Цивільно-правовий договір з майстром. Винагорода ${m.commissionPct}% від обсягу виконаних послуг.`,
  })),
  {
    id: "doc-salon-prro",
    ...SALON_CABINET,
    number: "ПРРО-РЕЄСТР-001",
    type: "other",
    category: "internal",
    title: "Реєстраційна заява ПРРО",
    date: "2024-02-15",
    amount: 0,
    currency: "UAH",
    contractor: { id: "dps", name: "ДПС України", code: "39292197" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2024-02-15T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2024-02-15T12:00:00Z",
    aiSummary: "Зареєстровано ПРРО fcid 4000123456. Каса №1, режим — стандартний.",
  },
];

// ============================================
// INCOME RECORDS (auto-derived from completed bookings + transfers)
// ============================================

function generateIncomeFromBookings(): IncomeBookRecord[] {
  const done = salonBookings.filter((b) => b.status === "done");
  return done.map((b, idx) => {
    const client = salonClients.find((c) => c.id === b.clientId);
    const services = b.serviceIds.map((sid) => salonServices.find((s) => s.id === sid)!).filter(Boolean);
    const isTransfer = b.paymentMethod === "transfer";
    return {
      id: `inc-salon-${String(idx + 1).padStart(4, "0")}`,
      date: b.date,
      description: `Послуги салону: ${services.map((s) => s.name).join(" + ")}${client ? ` · ${client.fullName.split(" ").slice(0, 2).join(" ")}` : ""}`,
      contractor: client?.fullName,
      amount: b.totalPrice,
      inIncomeBook: b.totalPrice,
      paymentType: isTransfer ? "transfer" : b.paymentMethod === "cash" ? "cash" : "card",
      source: isTransfer ? "monobank" : "prro",
      status: "income",
    } as IncomeBookRecord;
  });
}

export const salonIncomeRecords: IncomeBookRecord[] = generateIncomeFromBookings();

// ============================================
// TAX PAYMENTS — ЄП 5% квартальний, ЄСВ-фіксований, ПДФО/ВЗ/ЄСВ з ЗП
// ============================================

const Q1_INCOME = salonIncomeRecords
  .filter((r) => {
    const m = parseInt(r.date.slice(5, 7), 10);
    return m >= 1 && m <= 3;
  })
  .reduce((s, r) => s + r.amount, 0);

export const salonTaxPayments: TaxPayment[] = [
  {
    id: "tax-salon-ep-q1",
    cabinetId: "demo-salon-3",
    taxType: "ep",
    taxTypeLabel: "Єдиний податок 5%",
    period: "I квартал 2026",
    year: 2026,
    quarter: 1,
    amountToPay: Math.round(Q1_INCOME * 0.05) || 42500,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-05-20",
    createdAt: getDateInPast(2),
    taxRate: 5,
    calculatedFromIncome: Q1_INCOME || 850000,
  },
  {
    id: "tax-salon-esv-q1",
    cabinetId: "demo-salon-3",
    taxType: "esv",
    taxTypeLabel: "ЄСВ ФОП (фіксований)",
    period: "I квартал 2026",
    year: 2026,
    quarter: 1,
    amountToPay: 5280, // 1760 × 3
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-04-22",
    createdAt: getDateInPast(2),
  },
  {
    id: "tax-salon-pdfo-mar",
    cabinetId: "demo-salon-3",
    taxType: "pdfo",
    taxTypeLabel: "ПДФО з ЗП",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 5760, // 18% × 32000 (брутто 3-х)
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-10",
    paidDate: "2026-04-08",
    paidAmount: 5760,
    createdAt: "2026-04-01",
  },
  {
    id: "tax-salon-vz-mar",
    cabinetId: "demo-salon-3",
    taxType: "military",
    taxTypeLabel: "Військовий збір з ЗП",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 1600,
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-10",
    paidDate: "2026-04-08",
    paidAmount: 1600,
    createdAt: "2026-04-01",
  },
  {
    id: "tax-salon-esv-emp-mar",
    cabinetId: "demo-salon-3",
    taxType: "esv-employer",
    taxTypeLabel: "ЄСВ роботодавця",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 7040, // 22% × 32000
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-22",
    paidDate: "2026-04-20",
    paidAmount: 7040,
    createdAt: "2026-04-01",
  },
];

// ============================================
// CONTRACTOR PAYMENTS — master commissions + suppliers
// ============================================

function generateMasterCommissions(): ContractorPayment[] {
  // Aggregate done-bookings by master per week → one payment per master per week
  const weekly = new Map<string, { contractorId: string; amount: number; minDate: string; maxDate: string; count: number }>();
  for (const b of salonBookings.filter((x) => x.status === "done")) {
    const master = salonMasters.find((m) => m.id === b.masterId);
    if (!master || master.type !== "fop") continue;
    // week key = year-week
    const d = new Date(b.date);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay() + 1) / 7);
    const key = `${b.masterId}-W${week}`;
    const prev = weekly.get(key);
    if (prev) {
      prev.amount += b.commissionAmount;
      prev.count += 1;
      if (b.date < prev.minDate) prev.minDate = b.date;
      if (b.date > prev.maxDate) prev.maxDate = b.date;
    } else {
      weekly.set(key, { contractorId: master.contractorId!, amount: b.commissionAmount, minDate: b.date, maxDate: b.date, count: 1 });
    }
  }

  const today = new Date().toISOString().split("T")[0];
  const out: ContractorPayment[] = [];
  let idx = 0;
  for (const [, w] of weekly) {
    const contractor = salonContractors.find((c) => c.id === w.contractorId)!;
    const isPaid = w.maxDate < today;
    out.push({
      id: `pay-salon-comm-${++idx}`,
      cabinetId: "demo-salon-3",
      date: w.maxDate,
      contractor: contractor.name,
      contractorId: contractor.id,
      contractorCode: contractor.code,
      purpose: `Винагорода майстра за період ${w.minDate} – ${w.maxDate} (${w.count} записів)`,
      amount: w.amount,
      status: isPaid ? "paid" : "scheduled",
      statusLabel: isPaid ? "Сплачено" : "Заплановано",
      recipientIban: contractor.iban,
      paymentPurposeType: "services",
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export const salonContractorPayments: ContractorPayment[] = [
  ...generateMasterCommissions(),
  // Rent (поточний місяць)
  {
    id: "pay-salon-rent-apr",
    cabinetId: "demo-salon-3",
    date: "2026-04-05",
    contractor: "ТОВ «Бізнес-Центр Васильків»",
    contractorId: "c-salon-rent",
    contractorCode: "41234567",
    purpose: "Оренда приміщення за квітень 2026",
    amount: 48000,
    status: "paid",
    statusLabel: "Сплачено",
    recipientIban: "UA213052990000026007000000123",
    paymentPurposeType: "rent",
    contractId: "doc-salon-001",
    contractNumber: "ОРЕНДА-САЛОН-2026",
  },
  {
    id: "pay-salon-rent-may",
    cabinetId: "demo-salon-3",
    date: "2026-05-05",
    contractor: "ТОВ «Бізнес-Центр Васильків»",
    contractorId: "c-salon-rent",
    contractorCode: "41234567",
    purpose: "Оренда приміщення за травень 2026",
    amount: 48000,
    status: "scheduled",
    statusLabel: "Заплановано",
    recipientIban: "UA213052990000026007000000123",
    paymentPurposeType: "rent",
    contractId: "doc-salon-001",
    contractNumber: "ОРЕНДА-САЛОН-2026",
  },
  // Косметика
  {
    id: "pay-salon-cosm-1",
    cabinetId: "demo-salon-3",
    date: getDateInPast(12),
    contractor: "ТОВ «Beauty Distribution»",
    contractorId: "c-salon-cosm",
    contractorCode: "42345678",
    purpose: "Косметика Wella, OPI — закупівля місяця",
    amount: 28500,
    status: "paid",
    statusLabel: "Сплачено",
    recipientIban: "UA533052990000026007000000456",
    paymentPurposeType: "goods",
  },
  // Прання
  {
    id: "pay-salon-laundry-1",
    cabinetId: "demo-salon-3",
    date: getDateInPast(5),
    contractor: "ТОВ «АкваКлін»",
    contractorId: "c-salon-laundry",
    purpose: "Прання рушників та халатів",
    amount: 3200,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  // Електрика
  {
    id: "pay-salon-utility-1",
    cabinetId: "demo-salon-3",
    date: getDateInPast(8),
    contractor: "ПрАТ «ДТЕК Київські електромережі»",
    contractorId: "c-salon-utility",
    purpose: "Електроенергія березень 2026",
    amount: 4750,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  // Телеком
  {
    id: "pay-salon-telecom-1",
    cabinetId: "demo-salon-3",
    date: getDateInPast(7),
    contractor: "ТОВ «Київстар»",
    contractorId: "c-salon-telecom",
    purpose: "Інтернет + телефонія",
    amount: 850,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
];

// ============================================
// SALARY PAYMENTS (3 staff × current + previous month)
// ============================================

export const salonSalaryPayments: SalaryPayment[] = [
  // Квітень 2026 (поточний, scheduled)
  {
    id: "sal-salon-apr-1",
    cabinetId: "demo-salon-3",
    employeeId: "emp-salon-1",
    employeeName: "Гриценко Світлана Петрівна",
    employeePosition: "Старший адміністратор / Перукар-колорист",
    salaryType: "salary",
    salaryTypeLabel: "Зарплата",
    period: "Квітень 2026",
    amount: 12000,
    status: "scheduled",
    statusLabel: "Заплановано",
    scheduledDate: "2026-05-05",
    source: "manual",
    grossAmount: 15625,
    pdfoAmount: 2813,
    militaryTaxAmount: 813,
    esvAmount: 3438,
  },
  {
    id: "sal-salon-apr-2",
    cabinetId: "demo-salon-3",
    employeeId: "emp-salon-2",
    employeeName: "Бондар Олена Михайлівна",
    employeePosition: "Адміністратор / Майстер манікюру",
    salaryType: "salary",
    salaryTypeLabel: "Зарплата",
    period: "Квітень 2026",
    amount: 10000,
    status: "scheduled",
    statusLabel: "Заплановано",
    scheduledDate: "2026-05-05",
    source: "manual",
    grossAmount: 13021,
    pdfoAmount: 2344,
    militaryTaxAmount: 677,
    esvAmount: 2865,
  },
  {
    id: "sal-salon-apr-3",
    cabinetId: "demo-salon-3",
    employeeId: "emp-salon-3",
    employeeName: "Лисенко Андрій Олегович",
    employeePosition: "Масажист-реабілітолог",
    salaryType: "salary",
    salaryTypeLabel: "Зарплата",
    period: "Квітень 2026",
    amount: 10000,
    status: "scheduled",
    statusLabel: "Заплановано",
    scheduledDate: "2026-05-05",
    source: "manual",
    grossAmount: 13021,
    pdfoAmount: 2344,
    militaryTaxAmount: 677,
    esvAmount: 2865,
  },
  // Березень 2026 (paid)
  {
    id: "sal-salon-mar-1",
    cabinetId: "demo-salon-3",
    employeeId: "emp-salon-1",
    employeeName: "Гриценко Світлана Петрівна",
    employeePosition: "Старший адміністратор / Перукар-колорист",
    salaryType: "salary",
    salaryTypeLabel: "Зарплата",
    period: "Березень 2026",
    amount: 12000,
    status: "paid",
    statusLabel: "Сплачено",
    scheduledDate: "2026-04-05",
    paidDate: "2026-04-05",
    source: "manual",
    grossAmount: 15625,
  },
  {
    id: "sal-salon-mar-2",
    cabinetId: "demo-salon-3",
    employeeId: "emp-salon-2",
    employeeName: "Бондар Олена Михайлівна",
    employeePosition: "Адміністратор / Майстер манікюру",
    salaryType: "salary",
    salaryTypeLabel: "Зарплата",
    period: "Березень 2026",
    amount: 10000,
    status: "paid",
    statusLabel: "Сплачено",
    scheduledDate: "2026-04-05",
    paidDate: "2026-04-05",
    source: "manual",
    grossAmount: 13021,
  },
  {
    id: "sal-salon-mar-3",
    cabinetId: "demo-salon-3",
    employeeId: "emp-salon-3",
    employeeName: "Лисенко Андрій Олегович",
    employeePosition: "Масажист-реабілітолог",
    salaryType: "salary",
    salaryTypeLabel: "Зарплата",
    period: "Березень 2026",
    amount: 10000,
    status: "paid",
    statusLabel: "Сплачено",
    scheduledDate: "2026-04-05",
    paidDate: "2026-04-05",
    source: "manual",
    grossAmount: 13021,
  },
];

// ============================================
// REPORTS
// ============================================

export const salonReports: Report[] = [
  {
    id: "rep-salon-1df-q1",
    cabinetId: "demo-salon-3",
    type: "1df",
    typeLabel: "1-ДФ / ЄСВ",
    name: "Об'єднана звітність 1-ДФ + ЄСВ за I кв.",
    period: "Q1",
    periodLabel: "I квартал 2026",
    year: 2026,
    quarter: 1,
    deadline: "2026-05-10",
    status: "review",
    statusLabel: "На перевірку",
    dataSources: ["employees"],
    fopGroup: 3,
  },
  {
    id: "rep-salon-ep-q1",
    cabinetId: "demo-salon-3",
    type: "ep",
    typeLabel: "ЄП",
    name: "Декларація платника ЄП за I кв.",
    period: "Q1",
    periodLabel: "I квартал 2026",
    year: 2026,
    quarter: 1,
    deadline: "2026-05-10",
    status: "review",
    statusLabel: "На перевірку",
    dataSources: ["income-book"],
    fopGroup: 3,
  },
  {
    id: "rep-salon-ep-2025",
    cabinetId: "demo-salon-3",
    type: "ep",
    typeLabel: "ЄП",
    name: "Декларація платника ЄП за 2025 рік",
    period: "year",
    periodLabel: "2025 рік",
    year: 2025,
    deadline: "2026-03-01",
    status: "submitted",
    statusLabel: "Подано",
    submittedDate: "2026-02-28",
    dataSources: ["income-book"],
    fopGroup: 3,
  },
];
