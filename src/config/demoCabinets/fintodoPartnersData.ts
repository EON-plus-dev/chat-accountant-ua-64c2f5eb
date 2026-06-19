/**
 * Демо-дані партнерської мережі для кабінету ТОВ «Fintodo» (id=5).
 *
 * Дзеркалить реальні таблиці з БД:
 *   - partner_profiles
 *   - partner_client_links
 *   - partner_commission_ledger
 *   - partner_payouts
 *   - partner_commission_runs
 *
 * Числа узгоджені з PARTNER_COMMISSION_RATE = 10% і тірами знижок 25/30/35%.
 * Сценарій: 24 партнери, ~80 активних зв'язок «партнер → клієнт»,
 * MRR-приведений ≈ 1.4M грн/міс (60% від загального MRR компанії 2.4M).
 */

export type PartnerType = "firm" | "agency" | "solo";
export type PartnerTier = "tier1" | "tier2" | "tier3"; // 25% / 30% / 35%
export type PartnerStatus = "active" | "onboarding" | "paused";

export interface FintodoPartner {
  id: string;
  name: string;
  type: PartnerType;
  tier: PartnerTier;
  status: PartnerStatus;
  joinedAt: string;
  city: string;
  contact: { name: string; email: string; phone: string };
  activeClients: number;       // = partner_profiles.active_clients_count
  endedClients: number;
  mrrAttributed: number;       // ₴/міс — сума MRR приведених клієнтів
  gmvYtd: number;              // ₴ — оборот клієнтів цього партнера YTD
  commissionYtd: number;       // ₴ — нараховано YTD
  payoutPending: number;       // ₴ — accrued, ще не виплачено
  payoutMethod: "iban" | "card";
  ibanLast4?: string;
  cardLast4?: string;
  csat: number;                // 0–100, NPS-подібний індекс лояльності клієнтів партнера
  ratingOnPortal: number;      // 0–5, рейтинг на порталі Fintodo
}

export type LinkStatus = "active" | "ended" | "paused";
export type BillingPayer = "cabinet_owner" | "delegate";

export interface FintodoPartnerClientLink {
  id: string;
  partnerId: string;
  clientName: string;
  clientType: "fop" | "tov" | "individual";
  plan: "Start" | "Smart" | "Premium";
  status: LinkStatus;
  attributionVerified: boolean;
  billingPayer: BillingPayer;
  linkedAt: string;
  firstPaymentAt: string | null;
  clientMrr: number;           // ₴/міс
  monthlyCommission: number;   // 10% від обороту
  region: string;
}

export type CommissionStatus = "accrued" | "pending_payout" | "paid";

export interface FintodoCommissionRow {
  id: string;
  period: string;              // YYYY-MM
  partnerId: string;
  clientLinkId: string;
  clientUahSpent: number;      // оборот клієнта за місяць
  commissionUah: number;       // 10%
  status: CommissionStatus;
  payoutId?: string;
}

export type PayoutStatus = "requested" | "approved" | "paid" | "rejected";

export interface FintodoPayout {
  id: string;
  partnerId: string;
  periodFrom: string;
  periodTo: string;
  amount: number;
  status: PayoutStatus;
  method: "iban" | "card";
  requestedAt: string;
  paidAt?: string;
  reference?: string;
  rejectedReason?: string;
}

export interface FintodoCommissionRun {
  id: string;
  period: string;
  ranAt: string;
  linksProcessed: number;
  status: "success" | "error";
  triggeredBy: "cron" | "manual";
  error?: string;
}

// ────────────────────────── ПАРТНЕРИ ──────────────────────────
const today = "2026-05-26";

export const FINTODO_PARTNERS: FintodoPartner[] = [
  // ── Firm (бухгалтерські фірми) — 6 шт, тір 3 (35%) переважно ──
  { id: "p-01", name: "Бухгалтерська фірма «Прайм Аудит»", type: "firm",   tier: "tier3", status: "active",     joinedAt: "2024-08-12", city: "Київ",
    contact: { name: "Олена Поліщук",  email: "olena@prime-audit.ua",  phone: "+380 67 123 45 12" },
    activeClients: 64, endedClients: 4, mrrAttributed: 184500, gmvYtd: 2_840_000, commissionYtd: 284_000, payoutPending: 41_280, payoutMethod: "iban", ibanLast4: "3214", csat: 92, ratingOnPortal: 4.9 },
  { id: "p-02", name: "АФ «Контур-Консалт»",                type: "firm",   tier: "tier3", status: "active",     joinedAt: "2024-10-01", city: "Львів",
    contact: { name: "Андрій Гнатишин", email: "a.gnatyshyn@kontur.com.ua", phone: "+380 96 412 88 03" },
    activeClients: 52, endedClients: 2, mrrAttributed: 148200, gmvYtd: 2_120_000, commissionYtd: 212_000, payoutPending: 33_840, payoutMethod: "iban", ibanLast4: "7711", csat: 89, ratingOnPortal: 4.8 },
  { id: "p-03", name: "ТОВ «Аудит-Плюс»",                   type: "firm",   tier: "tier3", status: "active",     joinedAt: "2025-01-15", city: "Одеса",
    contact: { name: "Марина Левченко", email: "marina@audit-plus.od.ua", phone: "+380 50 778 33 90" },
    activeClients: 47, endedClients: 1, mrrAttributed: 132100, gmvYtd: 1_584_000, commissionYtd: 158_400, payoutPending: 28_950, payoutMethod: "iban", ibanLast4: "5520", csat: 88, ratingOnPortal: 4.7 },
  { id: "p-04", name: "АФ «Деловi Партнери»",               type: "firm",   tier: "tier3", status: "active",     joinedAt: "2025-03-20", city: "Дніпро",
    contact: { name: "Ігор Семенюк",    email: "i.semeniuk@dp.partners",  phone: "+380 67 990 12 45" },
    activeClients: 38, endedClients: 0, mrrAttributed: 108300, gmvYtd: 1_120_000, commissionYtd: 112_000, payoutPending: 22_410, payoutMethod: "iban", ibanLast4: "9821", csat: 86, ratingOnPortal: 4.6 },
  { id: "p-05", name: "ТОВ «Чесний Облік»",                 type: "firm",   tier: "tier2", status: "active",     joinedAt: "2025-06-04", city: "Харків",
    contact: { name: "Тетяна Бойко",    email: "t.boyko@honest.ua",       phone: "+380 95 123 77 89" },
    activeClients: 22, endedClients: 1, mrrAttributed: 64800,  gmvYtd: 612_000,   commissionYtd: 61_200,  payoutPending: 12_840, payoutMethod: "iban", ibanLast4: "4477", csat: 84, ratingOnPortal: 4.5 },
  { id: "p-06", name: "АФ «Ставка»",                        type: "firm",   tier: "tier2", status: "paused",     joinedAt: "2024-11-22", city: "Запоріжжя",
    contact: { name: "Сергій Романюк",  email: "s.romaniuk@stavka.ua",    phone: "+380 67 314 90 22" },
    activeClients: 14, endedClients: 6, mrrAttributed: 38400,  gmvYtd: 540_000,   commissionYtd: 54_000,  payoutPending: 0,      payoutMethod: "iban", ibanLast4: "0192", csat: 71, ratingOnPortal: 3.9 },

  // ── Agency (бухгалтерські бюро / аутсорс) — 8 шт ──
  { id: "p-07", name: "Бухгалтерське бюро «АктивКом»",      type: "agency", tier: "tier3", status: "active",     joinedAt: "2024-09-08", city: "Київ",
    contact: { name: "Наталія Дубенко", email: "n.dubenko@aktiv.com.ua",  phone: "+380 50 412 56 78" },
    activeClients: 41, endedClients: 3, mrrAttributed: 116400, gmvYtd: 1_388_000, commissionYtd: 138_800, payoutPending: 24_120, payoutMethod: "iban", ibanLast4: "2241", csat: 90, ratingOnPortal: 4.8 },
  { id: "p-08", name: "Бюро «Облік 24/7»",                  type: "agency", tier: "tier2", status: "active",     joinedAt: "2025-02-11", city: "Київ",
    contact: { name: "Дмитро Костенко", email: "d.kostenko@oblik247.com", phone: "+380 67 555 11 22" },
    activeClients: 28, endedClients: 1, mrrAttributed: 82200,  gmvYtd: 884_000,   commissionYtd: 88_400,  payoutPending: 17_640, payoutMethod: "iban", ibanLast4: "8821", csat: 87, ratingOnPortal: 4.7 },
  { id: "p-09", name: "АБ «ФінансиPro»",                    type: "agency", tier: "tier2", status: "active",     joinedAt: "2025-04-30", city: "Львів",
    contact: { name: "Богдан Зінчук",   email: "b.zinchuk@finpro.lviv",   phone: "+380 95 211 09 88" },
    activeClients: 19, endedClients: 0, mrrAttributed: 54100,  gmvYtd: 488_000,   commissionYtd: 48_800,  payoutPending: 10_800, payoutMethod: "card", cardLast4: "4422", csat: 85, ratingOnPortal: 4.6 },
  { id: "p-10", name: "Бюро «Декларант»",                   type: "agency", tier: "tier2", status: "active",     joinedAt: "2025-05-18", city: "Івано-Франківськ",
    contact: { name: "Ірина Левчук",    email: "i.levchuk@deklarant.if",  phone: "+380 67 922 44 11" },
    activeClients: 17, endedClients: 0, mrrAttributed: 48400,  gmvYtd: 412_000,   commissionYtd: 41_200,  payoutPending: 9_400,  payoutMethod: "iban", ibanLast4: "6612", csat: 88, ratingOnPortal: 4.7 },
  { id: "p-11", name: "Бюро «Кейс»",                        type: "agency", tier: "tier2", status: "active",     joinedAt: "2025-08-02", city: "Вінниця",
    contact: { name: "Володимир Шеремет", email: "v.sheremet@case.vn",    phone: "+380 50 188 33 66" },
    activeClients: 14, endedClients: 1, mrrAttributed: 39200,  gmvYtd: 312_000,   commissionYtd: 31_200,  payoutPending: 7_100,  payoutMethod: "iban", ibanLast4: "9981", csat: 84, ratingOnPortal: 4.5 },
  { id: "p-12", name: "АБ «Лінія Звіту»",                   type: "agency", tier: "tier1", status: "onboarding", joinedAt: "2026-03-15", city: "Полтава",
    contact: { name: "Юлія Маринчук",   email: "y.marynchuk@liniya.pl",   phone: "+380 95 633 22 11" },
    activeClients: 6,  endedClients: 0, mrrAttributed: 14400,  gmvYtd: 38_400,    commissionYtd: 3_840,   payoutPending: 1_440,  payoutMethod: "iban", ibanLast4: "1101", csat: 78, ratingOnPortal: 4.4 },
  { id: "p-13", name: "Бюро «Старт-Бухгалтер»",             type: "agency", tier: "tier1", status: "active",     joinedAt: "2025-11-09", city: "Чернівці",
    contact: { name: "Олег Микитюк",    email: "o.mykytyuk@startbuh.cv",  phone: "+380 67 442 90 11" },
    activeClients: 9,  endedClients: 1, mrrAttributed: 21600,  gmvYtd: 144_000,   commissionYtd: 14_400,  payoutPending: 3_240,  payoutMethod: "card", cardLast4: "1284", csat: 80, ratingOnPortal: 4.3 },
  { id: "p-14", name: "Бюро «Прозоро»",                     type: "agency", tier: "tier2", status: "active",     joinedAt: "2025-07-25", city: "Тернопіль",
    contact: { name: "Лідія Ференц",    email: "l.ferenc@prozoro.te",     phone: "+380 50 922 18 33" },
    activeClients: 15, endedClients: 0, mrrAttributed: 41400,  gmvYtd: 318_000,   commissionYtd: 31_800,  payoutPending: 8_280,  payoutMethod: "iban", ibanLast4: "3344", csat: 87, ratingOnPortal: 4.6 },

  // ── Solo (одинаки-консультанти) — 10 шт ──
  { id: "p-15", name: "Катерина Сорока (ФОП-консультант)",  type: "solo",   tier: "tier1", status: "active",     joinedAt: "2025-06-02", city: "Київ",
    contact: { name: "Катерина Сорока", email: "k.soroka@gmail.com",      phone: "+380 67 111 22 33" },
    activeClients: 8,  endedClients: 0, mrrAttributed: 19200,  gmvYtd: 168_000,   commissionYtd: 16_800,  payoutPending: 3_840,  payoutMethod: "card", cardLast4: "9988", csat: 91, ratingOnPortal: 4.9 },
  { id: "p-16", name: "Олексій Гриценко (приватний бухгалтер)", type: "solo", tier: "tier1", status: "active",   joinedAt: "2025-04-12", city: "Львів",
    contact: { name: "Олексій Гриценко", email: "o.grycenko@ukr.net",     phone: "+380 95 311 44 55" },
    activeClients: 7,  endedClients: 1, mrrAttributed: 16800,  gmvYtd: 156_000,   commissionYtd: 15_600,  payoutPending: 3_360,  payoutMethod: "card", cardLast4: "5511", csat: 86, ratingOnPortal: 4.7 },
  { id: "p-17", name: "Марія Шевчук (податковий консультант)", type: "solo", tier: "tier1", status: "active",    joinedAt: "2025-09-14", city: "Одеса",
    contact: { name: "Марія Шевчук",    email: "m.shevchuk@gmail.com",    phone: "+380 50 622 77 11" },
    activeClients: 6,  endedClients: 0, mrrAttributed: 14400,  gmvYtd: 96_000,    commissionYtd: 9_600,   payoutPending: 2_880,  payoutMethod: "card", cardLast4: "3377", csat: 89, ratingOnPortal: 4.8 },
  { id: "p-18", name: "Назар Біленко (ФОП-IT-consult)",     type: "solo",   tier: "tier1", status: "active",     joinedAt: "2025-12-01", city: "Київ",
    contact: { name: "Назар Біленко",   email: "nazar@bilenko.dev",       phone: "+380 67 884 12 04" },
    activeClients: 5,  endedClients: 0, mrrAttributed: 14500,  gmvYtd: 72_500,    commissionYtd: 7_250,   payoutPending: 2_900,  payoutMethod: "iban", ibanLast4: "7702", csat: 92, ratingOnPortal: 4.9 },
  { id: "p-19", name: "Ольга Дзюба (бухгалтер-freelance)",  type: "solo",   tier: "tier1", status: "active",     joinedAt: "2025-10-20", city: "Дніпро",
    contact: { name: "Ольга Дзюба",     email: "o.dziuba@gmail.com",      phone: "+380 95 552 90 11" },
    activeClients: 5,  endedClients: 0, mrrAttributed: 12000,  gmvYtd: 84_000,    commissionYtd: 8_400,   payoutPending: 2_400,  payoutMethod: "card", cardLast4: "8810", csat: 84, ratingOnPortal: 4.5 },
  { id: "p-20", name: "Юрій Павленко (фін-консультант)",    type: "solo",   tier: "tier1", status: "active",     joinedAt: "2026-01-08", city: "Харків",
    contact: { name: "Юрій Павленко",   email: "y.pavlenko@gmail.com",    phone: "+380 67 211 88 77" },
    activeClients: 4,  endedClients: 0, mrrAttributed: 9600,   gmvYtd: 38_400,    commissionYtd: 3_840,   payoutPending: 1_920,  payoutMethod: "card", cardLast4: "2200", csat: 82, ratingOnPortal: 4.4 },
  { id: "p-21", name: "Іван Кучер (приватний податковий)",  type: "solo",   tier: "tier1", status: "active",     joinedAt: "2026-02-19", city: "Київ",
    contact: { name: "Іван Кучер",      email: "ivan.kucher@me.com",      phone: "+380 50 778 11 44" },
    activeClients: 3,  endedClients: 0, mrrAttributed: 7200,   gmvYtd: 21_600,    commissionYtd: 2_160,   payoutPending: 1_440,  payoutMethod: "card", cardLast4: "6655", csat: 79, ratingOnPortal: 4.3 },
  { id: "p-22", name: "Світлана Романюк (FOP-decl)",        type: "solo",   tier: "tier1", status: "onboarding", joinedAt: "2026-04-04", city: "Чернігів",
    contact: { name: "Світлана Романюк", email: "s.romaniuk@gmail.com",   phone: "+380 67 332 11 90" },
    activeClients: 2,  endedClients: 0, mrrAttributed: 4800,   gmvYtd: 9_600,     commissionYtd: 960,     payoutPending: 960,    payoutMethod: "card", cardLast4: "1141", csat: 75, ratingOnPortal: 4.2 },
  { id: "p-23", name: "Анна Литвиненко (декларації фізосіб)", type: "solo", tier: "tier1", status: "active",     joinedAt: "2025-12-22", city: "Київ",
    contact: { name: "Анна Литвиненко", email: "a.lytvynenko@gmail.com",  phone: "+380 95 411 22 88" },
    activeClients: 6,  endedClients: 0, mrrAttributed: 7200,   gmvYtd: 32_400,    commissionYtd: 3_240,   payoutPending: 1_440,  payoutMethod: "card", cardLast4: "3030", csat: 88, ratingOnPortal: 4.7 },
  { id: "p-24", name: "Роман Гайдук (фінансовий аудитор)",  type: "solo",   tier: "tier1", status: "paused",     joinedAt: "2025-03-30", city: "Львів",
    contact: { name: "Роман Гайдук",    email: "r.haiduk@gmail.com",      phone: "+380 67 122 88 33" },
    activeClients: 0,  endedClients: 4, mrrAttributed: 0,      gmvYtd: 64_000,    commissionYtd: 6_400,   payoutPending: 0,      payoutMethod: "card", cardLast4: "4040", csat: 62, ratingOnPortal: 3.7 },
];

// ────────────────────────── ЗВ'ЯЗКИ (top examples) ──────────────────────────
// Не дублюємо всі ~80 — показуємо 18 показових записів,
// агрегат «всього зв'язок» рахуємо з activeClients у партнерах.
export const FINTODO_LINKS: FintodoPartnerClientLink[] = [
  { id: "lnk-001", partnerId: "p-01", clientName: "ТОВ «Будмаш-Київ»",          clientType: "tov",        plan: "Premium", status: "active", attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2024-09-04", firstPaymentAt: "2024-09-10", clientMrr: 14990, monthlyCommission: 1499, region: "Київ" },
  { id: "lnk-002", partnerId: "p-01", clientName: "ФОП Петренко Ігор",          clientType: "fop",        plan: "Smart",   status: "active", attributionVerified: true,  billingPayer: "delegate",      linkedAt: "2024-09-22", firstPaymentAt: "2024-10-01", clientMrr: 3990,  monthlyCommission: 399,  region: "Київ" },
  { id: "lnk-003", partnerId: "p-01", clientName: "ТОВ «Логістика-Експрес»",    clientType: "tov",        plan: "Premium", status: "active", attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2025-01-15", firstPaymentAt: "2025-01-20", clientMrr: 14990, monthlyCommission: 1499, region: "Бровари" },
  { id: "lnk-004", partnerId: "p-02", clientName: "ТОВ «Львівська Кераміка»",   clientType: "tov",        plan: "Smart",   status: "active", attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2024-11-03", firstPaymentAt: "2024-11-10", clientMrr: 4990,  monthlyCommission: 499,  region: "Львів" },
  { id: "lnk-005", partnerId: "p-02", clientName: "ФОП Гнатишин Олег",          clientType: "fop",        plan: "Smart",   status: "active", attributionVerified: true,  billingPayer: "delegate",      linkedAt: "2025-02-18", firstPaymentAt: "2025-02-25", clientMrr: 3990,  monthlyCommission: 399,  region: "Львів" },
  { id: "lnk-006", partnerId: "p-03", clientName: "ТОВ «Чорноморський порт»",   clientType: "tov",        plan: "Premium", status: "active", attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2025-02-04", firstPaymentAt: "2025-02-12", clientMrr: 14990, monthlyCommission: 1499, region: "Одеса" },
  { id: "lnk-007", partnerId: "p-04", clientName: "ТОВ «Дніпровський метал»",   clientType: "tov",        plan: "Premium", status: "active", attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2025-04-11", firstPaymentAt: "2025-04-18", clientMrr: 14990, monthlyCommission: 1499, region: "Дніпро" },
  { id: "lnk-008", partnerId: "p-05", clientName: "ФОП Бойко Тетяна",           clientType: "fop",        plan: "Start",   status: "active", attributionVerified: false, billingPayer: "delegate",      linkedAt: "2026-04-22", firstPaymentAt: null,         clientMrr: 0,     monthlyCommission: 0,    region: "Харків" },
  { id: "lnk-009", partnerId: "p-07", clientName: "ТОВ «АктивКом-Маркет»",       clientType: "tov",        plan: "Smart",   status: "active", attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2024-10-09", firstPaymentAt: "2024-10-15", clientMrr: 4990,  monthlyCommission: 499,  region: "Київ" },
  { id: "lnk-010", partnerId: "p-07", clientName: "ФОП Дубенко Н.В.",            clientType: "fop",        plan: "Smart",   status: "active", attributionVerified: true,  billingPayer: "delegate",      linkedAt: "2024-12-01", firstPaymentAt: "2024-12-08", clientMrr: 3990,  monthlyCommission: 399,  region: "Київ" },
  { id: "lnk-011", partnerId: "p-08", clientName: "ТОВ «Облік24-Сервіс»",        clientType: "tov",        plan: "Smart",   status: "ended",  attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2025-03-12", firstPaymentAt: "2025-03-20", clientMrr: 0,     monthlyCommission: 0,    region: "Київ" },
  { id: "lnk-012", partnerId: "p-09", clientName: "ФОП Зінчук Б.",                clientType: "fop",        plan: "Smart",   status: "active", attributionVerified: true,  billingPayer: "delegate",      linkedAt: "2025-05-04", firstPaymentAt: "2025-05-12", clientMrr: 3990,  monthlyCommission: 399,  region: "Львів" },
  { id: "lnk-013", partnerId: "p-11", clientName: "ТОВ «ВінКейс»",                clientType: "tov",        plan: "Smart",   status: "active", attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2025-09-10", firstPaymentAt: "2025-09-18", clientMrr: 4990,  monthlyCommission: 499,  region: "Вінниця" },
  { id: "lnk-014", partnerId: "p-15", clientName: "Іванова Олена (фізособа)",     clientType: "individual", plan: "Start",   status: "active", attributionVerified: false, billingPayer: "cabinet_owner", linkedAt: "2025-08-01", firstPaymentAt: null,         clientMrr: 0,     monthlyCommission: 0,    region: "Київ" },
  { id: "lnk-015", partnerId: "p-15", clientName: "ФОП Сорока К.",                clientType: "fop",        plan: "Smart",   status: "active", attributionVerified: true,  billingPayer: "delegate",      linkedAt: "2025-06-20", firstPaymentAt: "2025-06-28", clientMrr: 3990,  monthlyCommission: 399,  region: "Київ" },
  { id: "lnk-016", partnerId: "p-18", clientName: "ТОВ «BilenkoDev Studio»",      clientType: "tov",        plan: "Premium", status: "active", attributionVerified: true,  billingPayer: "delegate",      linkedAt: "2025-12-05", firstPaymentAt: "2025-12-12", clientMrr: 14990, monthlyCommission: 1499, region: "Київ" },
  { id: "lnk-017", partnerId: "p-23", clientName: "Литвиненко Анна (фізособа)",   clientType: "individual", plan: "Start",   status: "active", attributionVerified: false, billingPayer: "delegate",      linkedAt: "2026-01-04", firstPaymentAt: null,         clientMrr: 0,     monthlyCommission: 0,    region: "Київ" },
  { id: "lnk-018", partnerId: "p-06", clientName: "ТОВ «ЗапоріжСталь-ЛТД»",       clientType: "tov",        plan: "Smart",   status: "ended",  attributionVerified: true,  billingPayer: "cabinet_owner", linkedAt: "2024-12-08", firstPaymentAt: "2024-12-15", clientMrr: 0,     monthlyCommission: 0,    region: "Запоріжжя" },
];

// ────────────────────────── ВИПЛАТИ ──────────────────────────
export const FINTODO_PAYOUTS: FintodoPayout[] = [
  { id: "po-001", partnerId: "p-01", periodFrom: "2026-04", periodTo: "2026-04", amount: 41_280, status: "requested", method: "iban", requestedAt: "2026-05-02" },
  { id: "po-002", partnerId: "p-02", periodFrom: "2026-04", periodTo: "2026-04", amount: 33_840, status: "approved",  method: "iban", requestedAt: "2026-05-02" },
  { id: "po-003", partnerId: "p-03", periodFrom: "2026-03", periodTo: "2026-04", amount: 52_300, status: "paid",      method: "iban", requestedAt: "2026-04-04", paidAt: "2026-04-09", reference: "PAY-2026-0409-P03" },
  { id: "po-004", partnerId: "p-07", periodFrom: "2026-04", periodTo: "2026-04", amount: 24_120, status: "requested", method: "iban", requestedAt: "2026-05-03" },
  { id: "po-005", partnerId: "p-15", periodFrom: "2026-03", periodTo: "2026-04", amount: 7_680,  status: "paid",      method: "card", requestedAt: "2026-04-02", paidAt: "2026-04-05", reference: "PAY-2026-0405-P15" },
  { id: "po-006", partnerId: "p-09", periodFrom: "2026-04", periodTo: "2026-04", amount: 10_800, status: "rejected",  method: "card", requestedAt: "2026-05-01", rejectedReason: "Невідповідність даних картки — оновіть payout-метод" },
];

// ────────────────────────── ЗАПУСКИ НАРАХУВАНЬ ──────────────────────────
export const FINTODO_COMMISSION_RUNS: FintodoCommissionRun[] = [
  { id: "run-202605", period: "2026-04", ranAt: "2026-05-01T02:00:00Z", linksProcessed: 78, status: "success", triggeredBy: "cron" },
  { id: "run-202604", period: "2026-03", ranAt: "2026-04-01T02:00:00Z", linksProcessed: 74, status: "success", triggeredBy: "cron" },
  { id: "run-202603", period: "2026-02", ranAt: "2026-03-01T02:00:00Z", linksProcessed: 71, status: "success", triggeredBy: "cron" },
  { id: "run-202602", period: "2026-01", ranAt: "2026-02-01T02:00:00Z", linksProcessed: 68, status: "success", triggeredBy: "cron" },
  { id: "run-202601", period: "2025-12", ranAt: "2026-01-01T02:00:00Z", linksProcessed: 65, status: "success", triggeredBy: "cron" },
];

// ────────────────────────── РЕЄСТР КОМІСІЙ (приклад поточного періоду) ──────────────────────────
export const FINTODO_COMMISSION_LEDGER_APRIL_2026: FintodoCommissionRow[] = [
  { id: "cm-001", period: "2026-04", partnerId: "p-01", clientLinkId: "lnk-001", clientUahSpent: 14990, commissionUah: 1499, status: "pending_payout", payoutId: "po-001" },
  { id: "cm-002", period: "2026-04", partnerId: "p-01", clientLinkId: "lnk-002", clientUahSpent: 3990,  commissionUah: 399,  status: "pending_payout", payoutId: "po-001" },
  { id: "cm-003", period: "2026-04", partnerId: "p-01", clientLinkId: "lnk-003", clientUahSpent: 14990, commissionUah: 1499, status: "pending_payout", payoutId: "po-001" },
  { id: "cm-004", period: "2026-04", partnerId: "p-02", clientLinkId: "lnk-004", clientUahSpent: 4990,  commissionUah: 499,  status: "pending_payout", payoutId: "po-002" },
  { id: "cm-005", period: "2026-04", partnerId: "p-02", clientLinkId: "lnk-005", clientUahSpent: 3990,  commissionUah: 399,  status: "pending_payout", payoutId: "po-002" },
  { id: "cm-006", period: "2026-04", partnerId: "p-07", clientLinkId: "lnk-009", clientUahSpent: 4990,  commissionUah: 499,  status: "pending_payout", payoutId: "po-004" },
  { id: "cm-007", period: "2026-04", partnerId: "p-15", clientLinkId: "lnk-015", clientUahSpent: 3990,  commissionUah: 399,  status: "accrued" },
  { id: "cm-008", period: "2026-04", partnerId: "p-18", clientLinkId: "lnk-016", clientUahSpent: 14990, commissionUah: 1499, status: "accrued" },
];

// ────────────────────────── АГРЕГАТИ ──────────────────────────
export const FINTODO_PARTNERS_TOTALS = (() => {
  const totalPartners = FINTODO_PARTNERS.length;
  const activePartners = FINTODO_PARTNERS.filter(p => p.status === "active").length;
  const totalActiveClients = FINTODO_PARTNERS.reduce((s, p) => s + p.activeClients, 0);
  const totalMrrAttributed = FINTODO_PARTNERS.reduce((s, p) => s + p.mrrAttributed, 0);
  const totalCommissionYtd = FINTODO_PARTNERS.reduce((s, p) => s + p.commissionYtd, 0);
  const totalPayoutPending = FINTODO_PARTNERS.reduce((s, p) => s + p.payoutPending, 0);
  const totalGmvYtd = FINTODO_PARTNERS.reduce((s, p) => s + p.gmvYtd, 0);
  const newThisMonth = FINTODO_LINKS.filter(l => l.linkedAt.startsWith("2026-05") || l.linkedAt.startsWith("2026-04")).length;
  return {
    totalPartners, activePartners, totalActiveClients,
    totalMrrAttributed, totalCommissionYtd, totalPayoutPending,
    totalGmvYtd, newThisMonth,
  };
})();

// ────────────────────────── ХЕЛПЕРИ ──────────────────────────
export const partnerById = (id: string) => FINTODO_PARTNERS.find(p => p.id === id);

export const formatUAH = (n: number): string =>
  new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(n);

export const TIER_LABEL: Record<PartnerTier, string> = {
  tier1: "Тір 1 · 25%",
  tier2: "Тір 2 · 30%",
  tier3: "Тір 3 · 35%",
};

export const TIER_COLOR: Record<PartnerTier, string> = {
  tier1: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  tier2: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  tier3: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export const TYPE_LABEL: Record<PartnerType, string> = {
  firm:   "Фірма",
  agency: "Бюро",
  solo:   "Соло",
};

export const STATUS_LABEL: Record<PartnerStatus, string> = {
  active:     "Активний",
  onboarding: "Онбордінг",
  paused:     "На паузі",
};

export const PAYOUT_STATUS_LABEL: Record<PayoutStatus, { label: string; tone: "default" | "success" | "warning" | "danger" }> = {
  requested: { label: "Запит",      tone: "warning" },
  approved:  { label: "Схвалено",   tone: "default" },
  paid:      { label: "Виплачено",  tone: "success" },
  rejected:  { label: "Відхилено",  tone: "danger"  },
};

export const TODAY = today;
