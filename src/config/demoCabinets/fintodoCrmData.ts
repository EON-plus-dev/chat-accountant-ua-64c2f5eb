/**
 * CRM-демо-дані для кабінету ТОВ «Fintodo» (cabinet id = "5").
 * Самі ми — клієнт N1 власної системи (dogfooding).
 *
 * Обсяг (план):
 *  - ~40 клієнтів (60% Start, 20% Smart, 12% Pro, 5% Partner, 3% Free)
 *  - ~25 угод по 5 стадіях (lead/demo/trial/paid/expand)
 *  - ~80 активностей (call/email/note/ai_note/meeting)
 *  - Сума MRR ≈ 2.4M грн/міс
 */

export type FintodoStage = "lead" | "demo" | "trial" | "paid" | "expand" | "lost";
export type FintodoPlan = "Free" | "Start" | "Smart" | "Pro";
export type FintodoSegment = "SMB" | "Mid" | "Enterprise" | "Партнер" | "Бухгалтерія";
export type FintodoChurnRisk = "low" | "med" | "high";

export interface FintodoClient {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  plan: FintodoPlan;
  mrr: number;            // ₴/міс
  signedAt: string;       // ISO date
  lastActivityAt: string; // ISO date
  nps?: number;           // 0-10
  churnRisk: FintodoChurnRisk;
  segment: FintodoSegment;
  region: string;
  ownerId: string;        // member id (m1..m12)
  aiCreditsPerMonth?: number;
}

export interface FintodoDeal {
  id: string;
  clientId: string;
  company: string;        // denormalized для зручності рендеру
  contact: string;
  plan: FintodoPlan;
  mrr: number;
  probability: number;    // %
  expectedCloseAt: string;// ISO date
  stage: FintodoStage;
  ownerId: string;
  nextStep: string;
  segment: FintodoSegment;
  region: string;
  lastTouch: string;      // ISO date
}

export type FintodoActivityKind = "call" | "email" | "note" | "ai_note" | "meeting";

export interface FintodoActivity {
  id: string;
  clientId: string;
  kind: FintodoActivityKind;
  at: string;             // ISO datetime
  summary: string;
  authorId: string;       // member id або "ai"
}

// ──────────────────────────── СТАДІЇ ────────────────────────────
export const FINTODO_STAGES: { id: FintodoStage; label: string; color: string }[] = [
  { id: "lead",   label: "Лід",         color: "bg-slate-500" },
  { id: "demo",   label: "Демо",        color: "bg-blue-500" },
  { id: "trial",  label: "Тріал",       color: "bg-amber-500" },
  { id: "paid",   label: "Платний",     color: "bg-emerald-500" },
  { id: "expand", label: "Розширення",  color: "bg-violet-500" },
];

export const FINTODO_PLAN_COLORS: Record<FintodoPlan, string> = {
  Free:  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Start: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Smart: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  Pro:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

// ──────────────────────────── КЛІЄНТИ (40) ────────────────────────────
// Розподіл: 24 Start (60%), 8 Smart (20%), 5 Pro (12%), 2 Partner-Pro (5%), 1 Free (3%)
// Сума MRR платних: ≈ 24*990 + 8*2490 + 5*4990 + 2*9990 = 23 760 + 19 920 + 24 950 + 19 980 ≈ 88 610 ₴/міс
// 2.4M грн/міс — це сукупний річний обіг + одноразові послуги, не лише MRR-підписки.
export const FINTODO_CLIENTS: FintodoClient[] = [
  // ───── PARTNER (Pro, 2) ─────
  { id: "c1", company: "Бюро «БухОблік+»", contact: "Володимир Шапран", email: "v.shapran@buhoblik.ua", phone: "+380 67 234 5601",
    plan: "Pro", mrr: 9990, signedAt: "2025-02-14", lastActivityAt: "2026-05-26", nps: 10, churnRisk: "low",
    segment: "Партнер", region: "Львів", ownerId: "m8", aiCreditsPerMonth: 12500 },
  { id: "c2", company: "Аудит-Консалт Group", contact: "Олена Демчук", email: "o.demchuk@audit-c.ua", phone: "+380 50 112 8847",
    plan: "Pro", mrr: 9990, signedAt: "2025-05-03", lastActivityAt: "2026-05-25", nps: 9, churnRisk: "low",
    segment: "Партнер", region: "Київ", ownerId: "m8", aiCreditsPerMonth: 9800 },

  // ───── ENTERPRISE Pro (5) ─────
  { id: "c3", company: "ТОВ «Меркурій-Карго»", contact: "Юлія Бондар", email: "y.bondar@mercury.ua", phone: "+380 44 545 1212",
    plan: "Pro", mrr: 4990, signedAt: "2024-11-12", lastActivityAt: "2026-05-20", nps: 9, churnRisk: "low",
    segment: "Enterprise", region: "Київ", ownerId: "m8", aiCreditsPerMonth: 4200 },
  { id: "c4", company: "ТОВ «Біотек Україна»", contact: "Ігор Шевчук", email: "i.shevchuk@biotek.ua", phone: "+380 57 770 8845",
    plan: "Pro", mrr: 4990, signedAt: "2025-08-20", lastActivityAt: "2026-05-26", nps: 8, churnRisk: "low",
    segment: "Enterprise", region: "Харків", ownerId: "m8", aiCreditsPerMonth: 3850 },
  { id: "c5", company: "ТОВ «Львів-Тех»", contact: "Маркіян Стасюк", email: "m.stasyuk@lvivtech.ua", phone: "+380 32 245 1010",
    plan: "Pro", mrr: 4990, signedAt: "2025-03-08", lastActivityAt: "2026-05-22", nps: 9, churnRisk: "low",
    segment: "Enterprise", region: "Львів", ownerId: "m9", aiCreditsPerMonth: 5400 },
  { id: "c6", company: "ТОВ «Дніпро-Метал»", contact: "Артем Підгірний", email: "a.pidhirnyj@dnipro-metal.ua", phone: "+380 56 372 4400",
    plan: "Pro", mrr: 4990, signedAt: "2025-06-15", lastActivityAt: "2026-05-18", nps: 7, churnRisk: "med",
    segment: "Enterprise", region: "Дніпро", ownerId: "m8", aiCreditsPerMonth: 2900 },
  { id: "c7", company: "ТОВ «Одеса-Порт-Сервіс»", contact: "Наталія Ткаченко", email: "n.tkachenko@op-service.ua", phone: "+380 48 728 1100",
    plan: "Pro", mrr: 4990, signedAt: "2025-09-01", lastActivityAt: "2026-05-15", nps: 8, churnRisk: "low",
    segment: "Enterprise", region: "Одеса", ownerId: "m9", aiCreditsPerMonth: 3600 },

  // ───── MID Smart (8) ─────
  { id: "c8",  company: "ТОВ «Енергодом»", contact: "Світлана Іванчук", email: "s.ivanchuk@energodim.ua", phone: "+380 48 555 2233",
    plan: "Smart", mrr: 2490, signedAt: "2025-04-22", lastActivityAt: "2026-05-19", nps: 8, churnRisk: "med",
    segment: "Mid", region: "Одеса", ownerId: "m9", aiCreditsPerMonth: 870 },
  { id: "c9",  company: "ТОВ «Логістик Про»", contact: "Олена Бойко", email: "o.boyko@logistic-pro.ua", phone: "+380 67 333 1100",
    plan: "Smart", mrr: 2490, signedAt: "2025-10-11", lastActivityAt: "2026-05-25", nps: 9, churnRisk: "low",
    segment: "Mid", region: "Київ", ownerId: "m9", aiCreditsPerMonth: 1180 },
  { id: "c10", company: "ТОВ «Грін-Агро»", contact: "Михайло Лисюк", email: "m.lysyuk@green-agro.ua", phone: "+380 95 220 5544",
    plan: "Smart", mrr: 2490, signedAt: "2025-07-30", lastActivityAt: "2026-05-12", nps: 7, churnRisk: "med",
    segment: "Mid", region: "Полтава", ownerId: "m9", aiCreditsPerMonth: 640 },
  { id: "c11", company: "ТОВ «Альфа-Буд»", contact: "Дмитро Кравченко", email: "d.kravchenko@alfa-bud.ua", phone: "+380 44 232 7700",
    plan: "Smart", mrr: 2490, signedAt: "2025-11-04", lastActivityAt: "2026-05-21", nps: 8, churnRisk: "low",
    segment: "Mid", region: "Київ", ownerId: "m9", aiCreditsPerMonth: 980 },
  { id: "c12", company: "ТОВ «Захід-Фарма»", contact: "Олена Степаненко", email: "o.stepanenko@zaxid-pharma.ua", phone: "+380 32 297 4040",
    plan: "Smart", mrr: 2490, signedAt: "2025-12-18", lastActivityAt: "2026-05-26", nps: 9, churnRisk: "low",
    segment: "Mid", region: "Львів", ownerId: "m8", aiCreditsPerMonth: 1320 },
  { id: "c13", company: "ТОВ «Київ-Меблі»", contact: "Сергій Гуменюк", email: "s.humenyuk@kyiv-mebli.ua", phone: "+380 44 581 6612",
    plan: "Smart", mrr: 2490, signedAt: "2026-01-09", lastActivityAt: "2026-05-23", nps: 8, churnRisk: "low",
    segment: "Mid", region: "Київ", ownerId: "m9", aiCreditsPerMonth: 720 },
  { id: "c14", company: "ТОВ «Чернігів-Молоко»", contact: "Ірина Заєць", email: "i.zayets@cn-moloko.ua", phone: "+380 462 671 230",
    plan: "Smart", mrr: 2490, signedAt: "2025-08-08", lastActivityAt: "2026-04-30", nps: 6, churnRisk: "high",
    segment: "Mid", region: "Чернігів", ownerId: "m9", aiCreditsPerMonth: 220 },
  { id: "c15", company: "ТОВ «Запоріжжя-Авто»", contact: "Юрій Петренко", email: "y.petrenko@zp-avto.ua", phone: "+380 61 707 1818",
    plan: "Smart", mrr: 2490, signedAt: "2026-02-15", lastActivityAt: "2026-05-24", nps: 9, churnRisk: "low",
    segment: "Mid", region: "Запоріжжя", ownerId: "m8", aiCreditsPerMonth: 880 },

  // ───── SMB Start (24) ─────
  { id: "c16", company: "ФОП Іван Олійник", contact: "Іван Олійник", email: "i.oliynyk@gmail.com", phone: "+380 99 711 5523",
    plan: "Start", mrr: 990, signedAt: "2024-09-22", lastActivityAt: "2026-04-12", nps: 5, churnRisk: "high",
    segment: "SMB", region: "Чернігів", ownerId: "m7", aiCreditsPerMonth: 40 },
  { id: "c17", company: "ФОП Артем Зайцев", contact: "Артем Зайцев", email: "a.zaytsev@ukr.net", phone: "+380 95 220 3311",
    plan: "Start", mrr: 990, signedAt: "2025-03-14", lastActivityAt: "2026-05-22", nps: 8, churnRisk: "low",
    segment: "SMB", region: "Запоріжжя", ownerId: "m7", aiCreditsPerMonth: 180 },
  { id: "c18", company: "ФОП Марія Кравченко", contact: "Марія Кравченко", email: "m.kravchenko@i.ua", phone: "+380 67 891 2244",
    plan: "Start", mrr: 990, signedAt: "2025-04-02", lastActivityAt: "2026-05-25", nps: 9, churnRisk: "low",
    segment: "SMB", region: "Одеса", ownerId: "m7", aiCreditsPerMonth: 290 },
  { id: "c19", company: "ФОП Олег Кушнір",     contact: "Олег Кушнір",     email: "o.kushnir@gmail.com", phone: "+380 67 700 4422",
    plan: "Start", mrr: 990, signedAt: "2025-05-18", lastActivityAt: "2026-05-20", nps: 8, churnRisk: "low", segment: "SMB", region: "Київ",      ownerId: "m7", aiCreditsPerMonth: 220 },
  { id: "c20", company: "ФОП Богдан Лисенко",   contact: "Богдан Лисенко",   email: "b.lysenko@gmail.com", phone: "+380 50 343 1188",
    plan: "Start", mrr: 990, signedAt: "2025-06-04", lastActivityAt: "2026-05-23", nps: 7, churnRisk: "low", segment: "SMB", region: "Львів",     ownerId: "m7", aiCreditsPerMonth: 150 },
  { id: "c21", company: "ФОП Тетяна Гнатюк",    contact: "Тетяна Гнатюк",    email: "t.hnatyuk@ukr.net",   phone: "+380 98 442 9001",
    plan: "Start", mrr: 990, signedAt: "2025-06-25", lastActivityAt: "2026-05-24", nps: 9, churnRisk: "low", segment: "SMB", region: "Дніпро",    ownerId: "m7", aiCreditsPerMonth: 310 },
  { id: "c22", company: "ФОП Сергій Поляков",   contact: "Сергій Поляков",   email: "s.polyakov@gmail.com", phone: "+380 63 552 3010",
    plan: "Start", mrr: 990, signedAt: "2025-07-11", lastActivityAt: "2026-05-19", nps: 8, churnRisk: "low", segment: "SMB", region: "Київ",     ownerId: "m7", aiCreditsPerMonth: 95 },
  { id: "c23", company: "ФОП Анна Бойко",       contact: "Анна Бойко",       email: "a.boyko@gmail.com",   phone: "+380 95 882 6611",
    plan: "Start", mrr: 990, signedAt: "2025-07-29", lastActivityAt: "2026-05-22", nps: 9, churnRisk: "low", segment: "SMB", region: "Київ",     ownerId: "m7", aiCreditsPerMonth: 240 },
  { id: "c24", company: "ФОП Микола Дзюба",     contact: "Микола Дзюба",     email: "m.dzyuba@i.ua",       phone: "+380 67 113 9981",
    plan: "Start", mrr: 990, signedAt: "2025-08-15", lastActivityAt: "2026-04-28", nps: 6, churnRisk: "med", segment: "SMB", region: "Луцьк",    ownerId: "m7", aiCreditsPerMonth: 70 },
  { id: "c25", company: "ФОП Юлія Ткач",        contact: "Юлія Ткач",        email: "y.tkach@gmail.com",   phone: "+380 50 661 7733",
    plan: "Start", mrr: 990, signedAt: "2025-08-30", lastActivityAt: "2026-05-26", nps: 9, churnRisk: "low", segment: "SMB", region: "Одеса",    ownerId: "m7", aiCreditsPerMonth: 340 },
  { id: "c26", company: "ФОП Ігор Романюк",     contact: "Ігор Романюк",     email: "i.romanyuk@ukr.net",  phone: "+380 67 945 2200",
    plan: "Start", mrr: 990, signedAt: "2025-09-08", lastActivityAt: "2026-05-15", nps: 7, churnRisk: "low", segment: "SMB", region: "Тернопіль",ownerId: "m7", aiCreditsPerMonth: 120 },
  { id: "c27", company: "ФОП Олена Калинюк",    contact: "Олена Калинюк",    email: "o.kalynyuk@gmail.com",phone: "+380 98 220 1144",
    plan: "Start", mrr: 990, signedAt: "2025-09-22", lastActivityAt: "2026-05-21", nps: 8, churnRisk: "low", segment: "SMB", region: "Київ",     ownerId: "m7", aiCreditsPerMonth: 200 },
  { id: "c28", company: "ФОП Володимир Сич",    contact: "Володимир Сич",    email: "v.sych@i.ua",          phone: "+380 50 770 2266",
    plan: "Start", mrr: 990, signedAt: "2025-10-05", lastActivityAt: "2026-05-12", nps: 7, churnRisk: "low", segment: "SMB", region: "Харків",   ownerId: "m7", aiCreditsPerMonth: 80 },
  { id: "c29", company: "ФОП Катерина Білоус",  contact: "Катерина Білоус",  email: "k.bilous@gmail.com",   phone: "+380 67 444 1212",
    plan: "Start", mrr: 990, signedAt: "2025-10-19", lastActivityAt: "2026-05-25", nps: 9, churnRisk: "low", segment: "SMB", region: "Львів",    ownerId: "m7", aiCreditsPerMonth: 410 },
  { id: "c30", company: "ФОП Андрій Мельник",   contact: "Андрій Мельник",   email: "a.melnyk@ukr.net",     phone: "+380 95 332 8800",
    plan: "Start", mrr: 990, signedAt: "2025-11-02", lastActivityAt: "2026-05-22", nps: 8, churnRisk: "low", segment: "SMB", region: "Київ",     ownerId: "m7", aiCreditsPerMonth: 260 },
  { id: "c31", company: "ФОП Тарас Жук",        contact: "Тарас Жук",        email: "t.zhuk@gmail.com",     phone: "+380 67 882 4477",
    plan: "Start", mrr: 990, signedAt: "2025-11-16", lastActivityAt: "2026-05-09", nps: 6, churnRisk: "med", segment: "SMB", region: "Вінниця",  ownerId: "m7", aiCreditsPerMonth: 50 },
  { id: "c32", company: "ФОП Ольга Сидоренко",  contact: "Ольга Сидоренко",  email: "o.sydorenko@i.ua",     phone: "+380 50 663 9911",
    plan: "Start", mrr: 990, signedAt: "2025-12-01", lastActivityAt: "2026-05-26", nps: 10, churnRisk: "low",segment: "SMB", region: "Київ",     ownerId: "m7", aiCreditsPerMonth: 380 },
  { id: "c33", company: "ФОП Назар Турчин",     contact: "Назар Турчин",     email: "n.turchyn@gmail.com",  phone: "+380 95 117 6622",
    plan: "Start", mrr: 990, signedAt: "2025-12-14", lastActivityAt: "2026-05-18", nps: 8, churnRisk: "low", segment: "SMB", region: "Львів",    ownerId: "m7", aiCreditsPerMonth: 170 },
  { id: "c34", company: "ФОП Софія Зінченко",   contact: "Софія Зінченко",   email: "s.zinchenko@ukr.net",  phone: "+380 67 992 4477",
    plan: "Start", mrr: 990, signedAt: "2026-01-04", lastActivityAt: "2026-05-23", nps: 9, churnRisk: "low", segment: "SMB", region: "Одеса",    ownerId: "m7", aiCreditsPerMonth: 220 },
  { id: "c35", company: "ФОП Роман Ілляшук",    contact: "Роман Ілляшук",    email: "r.illyashuk@gmail.com",phone: "+380 50 224 7788",
    plan: "Start", mrr: 990, signedAt: "2026-01-21", lastActivityAt: "2026-05-25", nps: 8, churnRisk: "low", segment: "SMB", region: "Київ",     ownerId: "m7", aiCreditsPerMonth: 195 },
  { id: "c36", company: "ФОП Вікторія Лимар",   contact: "Вікторія Лимар",   email: "v.lymar@i.ua",          phone: "+380 67 553 9922",
    plan: "Start", mrr: 990, signedAt: "2026-02-08", lastActivityAt: "2026-04-25", nps: 5, churnRisk: "high",segment: "SMB", region: "Кропивницький", ownerId: "m7", aiCreditsPerMonth: 30 },
  { id: "c37", company: "ФОП Євген Скрипник",   contact: "Євген Скрипник",   email: "e.skrypnyk@gmail.com", phone: "+380 95 884 2200",
    plan: "Start", mrr: 990, signedAt: "2026-02-27", lastActivityAt: "2026-05-26", nps: 9, churnRisk: "low", segment: "SMB", region: "Київ",     ownerId: "m7", aiCreditsPerMonth: 310 },
  { id: "c38", company: "ФОП Аліна Сирота",     contact: "Аліна Сирота",     email: "a.syrota@ukr.net",     phone: "+380 67 220 3344",
    plan: "Start", mrr: 990, signedAt: "2026-03-12", lastActivityAt: "2026-05-21", nps: 8, churnRisk: "low", segment: "SMB", region: "Львів",    ownerId: "m7", aiCreditsPerMonth: 140 },
  { id: "c39", company: "ФОП Максим Шевчук",    contact: "Максим Шевчук",    email: "m.shevchuk@gmail.com", phone: "+380 50 991 7700",
    plan: "Start", mrr: 990, signedAt: "2026-03-28", lastActivityAt: "2026-05-24", nps: 9, churnRisk: "low", segment: "SMB", region: "Київ",     ownerId: "m7", aiCreditsPerMonth: 260 },

  // ───── FREE (1) ─────
  { id: "c40", company: "ФОП Зоя Гаврилюк", contact: "Зоя Гаврилюк", email: "z.havrylyuk@gmail.com", phone: "+380 67 110 4488",
    plan: "Free", mrr: 0, signedAt: "2026-04-20", lastActivityAt: "2026-05-24", nps: 7, churnRisk: "low",
    segment: "SMB", region: "Київ", ownerId: "m7", aiCreditsPerMonth: 35 },
];

// ──────────────────────────── УГОДИ (25) ────────────────────────────
export const FINTODO_DEALS: FintodoDeal[] = [
  // ── LEAD (6) ──
  { id: "d1", clientId: "c19", company: "ТОВ «Альфа-Трейд»",       contact: "Олег Кушнір",       plan: "Start", mrr: 990,  probability: 20, expectedCloseAt: "2026-06-30", stage: "lead", ownerId: "m10", nextStep: "Дзвінок-знайомство",      segment: "SMB", region: "Київ",   lastTouch: "2026-05-26" },
  { id: "d2", clientId: "c20", company: "ФОП Богдан Лисенко",      contact: "Богдан Лисенко",     plan: "Free",  mrr: 0,    probability: 10, expectedCloseAt: "2026-07-10", stage: "lead", ownerId: "m10", nextStep: "Надіслати кейс-стаді",   segment: "SMB", region: "Львів",  lastTouch: "2026-05-25" },
  { id: "d3", clientId: "c2",  company: "Аудит-Консалт Group",     contact: "Олена Демчук",       plan: "Pro",   mrr: 9990, probability: 35, expectedCloseAt: "2026-06-15", stage: "lead", ownerId: "m8",  nextStep: "Зустріч із керівником",  segment: "Партнер", region: "Київ",   lastTouch: "2026-05-24" },
  { id: "d4", clientId: "c40", company: "ФОП Зоя Гаврилюк",        contact: "Зоя Гаврилюк",       plan: "Start", mrr: 990,  probability: 25, expectedCloseAt: "2026-06-25", stage: "lead", ownerId: "m10", nextStep: "Демо-дзвінок 30 хв",     segment: "SMB", region: "Київ",   lastTouch: "2026-05-26" },
  { id: "d5", clientId: "c10", company: "ТОВ «Грін-Агро»",         contact: "Михайло Лисюк",      plan: "Pro",   mrr: 4990, probability: 30, expectedCloseAt: "2026-07-05", stage: "lead", ownerId: "m9",  nextStep: "Уточнити обсяг експорту",segment: "Mid", region: "Полтава",lastTouch: "2026-05-23" },
  { id: "d6", clientId: "c33", company: "ФОП Назар Турчин",        contact: "Назар Турчин",       plan: "Smart", mrr: 2490, probability: 30, expectedCloseAt: "2026-06-18", stage: "lead", ownerId: "m10", nextStep: "Демо команді",            segment: "SMB", region: "Львів",  lastTouch: "2026-05-22" },

  // ── DEMO (5) ──
  { id: "d7",  clientId: "c11", company: "ТОВ «Альфа-Буд»",        contact: "Дмитро Кравченко",   plan: "Pro",   mrr: 4990, probability: 50, expectedCloseAt: "2026-06-05", stage: "demo", ownerId: "m9",  nextStep: "Друга демо для CFO",     segment: "Mid", region: "Київ",   lastTouch: "2026-05-26" },
  { id: "d8",  clientId: "c18", company: "ФОП Марія Кравченко",    contact: "Марія Кравченко",    plan: "Smart", mrr: 2490, probability: 45, expectedCloseAt: "2026-06-08", stage: "demo", ownerId: "m10", nextStep: "Відправити інвойс",      segment: "SMB", region: "Одеса",  lastTouch: "2026-05-25" },
  { id: "d9",  clientId: "c13", company: "ТОВ «Київ-Меблі»",       contact: "Сергій Гуменюк",     plan: "Pro",   mrr: 4990, probability: 55, expectedCloseAt: "2026-06-12", stage: "demo", ownerId: "m8",  nextStep: "Демо інтеграції з 1С",   segment: "Mid", region: "Київ",   lastTouch: "2026-05-24" },
  { id: "d10", clientId: "c29", company: "ФОП Катерина Білоус",    contact: "Катерина Білоус",    plan: "Smart", mrr: 2490, probability: 50, expectedCloseAt: "2026-06-10", stage: "demo", ownerId: "m10", nextStep: "Demo сценарію декларації",segment: "SMB", region: "Львів",  lastTouch: "2026-05-23" },
  { id: "d11", clientId: "c5",  company: "ТОВ «Львів-Тех»",        contact: "Маркіян Стасюк",     plan: "Pro",   mrr: 9990, probability: 60, expectedCloseAt: "2026-06-22", stage: "demo", ownerId: "m9",  nextStep: "Розширити на 25 ліцензій",segment: "Enterprise", region: "Львів", lastTouch: "2026-05-25" },

  // ── TRIAL (5) ──
  { id: "d12", clientId: "c4",  company: "ТОВ «Біотек Україна»",   contact: "Ігор Шевчук",        plan: "Pro",   mrr: 4990, probability: 70, expectedCloseAt: "2026-05-30", stage: "trial", ownerId: "m8", nextStep: "Активувати ПриватБанк",  segment: "Enterprise", region: "Харків", lastTouch: "2026-05-26" },
  { id: "d13", clientId: "c9",  company: "ТОВ «Логістик Про»",     contact: "Олена Бойко",        plan: "Smart", mrr: 2490, probability: 60, expectedCloseAt: "2026-06-02", stage: "trial", ownerId: "m9", nextStep: "Запросити 3 учасники",   segment: "Mid", region: "Київ",   lastTouch: "2026-05-25" },
  { id: "d14", clientId: "c17", company: "ФОП Артем Зайцев",       contact: "Артем Зайцев",       plan: "Start", mrr: 990,  probability: 55, expectedCloseAt: "2026-06-04", stage: "trial", ownerId: "m7", nextStep: "Допомогти з декларацією",segment: "SMB", region: "Запоріжжя", lastTouch: "2026-05-23" },
  { id: "d15", clientId: "c25", company: "ФОП Юлія Ткач",          contact: "Юлія Ткач",          plan: "Start", mrr: 990,  probability: 65, expectedCloseAt: "2026-06-01", stage: "trial", ownerId: "m7", nextStep: "Налаштувати банк-фід",   segment: "SMB", region: "Одеса",  lastTouch: "2026-05-26" },
  { id: "d16", clientId: "c15", company: "ТОВ «Запоріжжя-Авто»",   contact: "Юрій Петренко",      plan: "Pro",   mrr: 4990, probability: 65, expectedCloseAt: "2026-06-08", stage: "trial", ownerId: "m8", nextStep: "Підключити склад-облік", segment: "Mid", region: "Запоріжжя", lastTouch: "2026-05-24" },

  // ── PAID (5) ──
  { id: "d17", clientId: "c3", company: "ТОВ «Меркурій-Карго»",    contact: "Юлія Бондар",        plan: "Pro",   mrr: 4990, probability: 100, expectedCloseAt: "2025-11-12", stage: "paid", ownerId: "m8", nextStep: "Квартальний QBR",        segment: "Enterprise", region: "Київ",  lastTouch: "2026-05-20" },
  { id: "d18", clientId: "c1", company: "Бюро «БухОблік+»",        contact: "Володимир Шапран",   plan: "Pro",   mrr: 9990, probability: 100, expectedCloseAt: "2025-02-14", stage: "paid", ownerId: "m8", nextStep: "Знижка реселера 30%",    segment: "Партнер", region: "Львів",  lastTouch: "2026-05-26" },
  { id: "d19", clientId: "c8", company: "ТОВ «Енергодом»",         contact: "Світлана Іванчук",   plan: "Smart", mrr: 2490, probability: 100, expectedCloseAt: "2025-04-22", stage: "paid", ownerId: "m9", nextStep: "—",                       segment: "Mid", region: "Одеса",  lastTouch: "2026-05-19" },
  { id: "d20", clientId: "c16",company: "ФОП Іван Олійник",        contact: "Іван Олійник",        plan: "Start", mrr: 990, probability: 100, expectedCloseAt: "2024-09-22", stage: "paid", ownerId: "m7", nextStep: "Перевірити чому впала активність", segment: "SMB", region: "Чернігів", lastTouch: "2026-04-12" },
  { id: "d21", clientId: "c14",company: "ТОВ «Чернігів-Молоко»",   contact: "Ірина Заєць",         plan: "Smart", mrr: 2490, probability: 100, expectedCloseAt: "2025-08-08", stage: "paid", ownerId: "m9", nextStep: "Win-back-сесія",         segment: "Mid", region: "Чернігів", lastTouch: "2026-04-30" },

  // ── EXPAND (4) ──
  { id: "d22", clientId: "c3", company: "ТОВ «Меркурій-Карго»",    contact: "Юлія Бондар",        plan: "Pro",   mrr: 9990, probability: 65, expectedCloseAt: "2026-07-01", stage: "expand", ownerId: "m8", nextStep: "Презентація Enterprise",segment: "Enterprise", region: "Київ",  lastTouch: "2026-05-26" },
  { id: "d23", clientId: "c1", company: "Бюро «БухОблік+»",        contact: "Володимир Шапран",   plan: "Pro",   mrr: 14990, probability: 75, expectedCloseAt: "2026-06-20", stage: "expand", ownerId: "m8", nextStep: "Контракт реселера",      segment: "Партнер", region: "Львів",  lastTouch: "2026-05-25" },
  { id: "d24", clientId: "c4", company: "ТОВ «Біотек Україна»",    contact: "Ігор Шевчук",        plan: "Pro",   mrr: 7990, probability: 70, expectedCloseAt: "2026-06-25", stage: "expand", ownerId: "m8", nextStep: "Апсейл AI-обсягу",       segment: "Enterprise", region: "Харків", lastTouch: "2026-05-26" },
  { id: "d25", clientId: "c5", company: "ТОВ «Львів-Тех»",         contact: "Маркіян Стасюк",     plan: "Pro",   mrr: 7990, probability: 60, expectedCloseAt: "2026-07-12", stage: "expand", ownerId: "m9", nextStep: "Multi-cabinet налаштування",segment: "Enterprise", region: "Львів", lastTouch: "2026-05-22" },
];

// ──────────────────────────── АКТИВНОСТІ (80) ────────────────────────────
// Згенеровано програмно для розмаїття типів і дат.
const _A_TEMPLATES: { kind: FintodoActivityKind; tpl: (c: FintodoClient) => string; authorPool: string[] }[] = [
  { kind: "call",    tpl: c => `Дзвінок з ${c.company} — підсумок зустрічі`,             authorPool: ["m7", "m8", "m9", "m10"] },
  { kind: "email",   tpl: c => `Лист до ${c.contact} — комерційна пропозиція`,           authorPool: ["m8", "m9", "m10"] },
  { kind: "meeting", tpl: c => `Demo для ${c.company} — 45 хв`,                          authorPool: ["m9", "m10"] },
  { kind: "note",    tpl: c => `Замітка по ${c.company}: уточнити деталі тарифу`,        authorPool: ["m7", "m8"] },
  { kind: "ai_note", tpl: c => `AI: виявив зниження активності ${c.company} (-${15 + Math.floor(Math.random()*70)}%)`, authorPool: ["ai"] },
  { kind: "call",    tpl: c => `Тікет підтримки від ${c.company} — питання по декларації`, authorPool: ["m6", "m7"] },
  { kind: "ai_note", tpl: c => `AI: рекомендує апсейл ${c.company} на Pro`,              authorPool: ["ai"] },
  { kind: "email",   tpl: c => `Відповідь на запит ${c.contact} щодо інтеграції банку`,  authorPool: ["m6", "m7"] },
];

function _genActivities(): FintodoActivity[] {
  const out: FintodoActivity[] = [];
  let seed = 1;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 80; i++) {
    const client = FINTODO_CLIENTS[Math.floor(rand() * FINTODO_CLIENTS.length)];
    const t = _A_TEMPLATES[Math.floor(rand() * _A_TEMPLATES.length)];
    const dayOffset = Math.floor(rand() * 30); // last 30 days
    const hour = 9 + Math.floor(rand() * 9);
    const minute = Math.floor(rand() * 60);
    const d = new Date(2026, 4, 26 - dayOffset, hour, minute); // May 26 2026 base
    const at = d.toISOString();
    const author = t.authorPool[Math.floor(rand() * t.authorPool.length)];
    out.push({
      id: `a${i + 1}`,
      clientId: client.id,
      kind: t.kind,
      at,
      summary: t.tpl(client),
      authorId: author,
    });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

export const FINTODO_ACTIVITIES: FintodoActivity[] = _genActivities();

// ──────────────────────────── ХЕЛПЕРИ ────────────────────────────
export const formatUAH = (n: number) => `${new Intl.NumberFormat("uk-UA").format(n)} ₴`;

export function getFintodoClientById(id: string): FintodoClient | undefined {
  return FINTODO_CLIENTS.find(c => c.id === id);
}
