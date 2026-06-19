/**
 * TENNIS CLUB CABINET (demo-tennis-3)
 * ФОП Коваленко П.А. — Тенісний клуб «Ace Court», 3 група 5% без ПДВ.
 *
 * Команда: 3 штатні тренери + 2 ФОП-тренери (договори ЦПХ), 2 адміністратори ресепшн.
 * Інфраструктура: 8 кортів (4 ґрунт, 2 хард outdoor, 2 хард indoor), магазин Pro Shop (50 SKU),
 * кафе Net Point (30 SKU). Два ПРРО — магазин і кафе.
 *
 * Архітектурно тенісний клуб = індустрія `tennis_club`: повний набір модулів
 * (bookings + client_book + retail_prro + goods_sales + purchases + warehouse + fixed_assets).
 * Бронюємо одночасно корт + тренера (опційно) + спорядження в прокат.
 *
 * Тренери реалізовані через `SalonMaster` (універсальний bookable-resource owner),
 * а делегації — через `salonMasterDelegations`. Назви «master/салон» у внутрішніх
 * типах залишаються, для тенісного UI відображаємо як «тренер/клуб».
 */

import type { Document } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { TaxPayment, ContractorPayment, SalaryPayment } from "@/config/paymentsConfig";
import type { Contractor } from "@/config/settingsConfig";
import type { Employee } from "@/config/employeesConfig";
import type { Report } from "@/config/reportsConfig";
import type {
  SalonService,
  SalonMaster,
  SalonWorkstation,
  SalonClient,
  SalonBooking,
  BookingStatus,
  BookingPaymentMethod,
  ServiceCategory,
} from "./salonData";
import { getDateInPast } from "./helpers";

const CABINET_ID = "demo-tennis-3";
const CABINET_META = {
  cabinetId: CABINET_ID,
  cabinetName: "ФОП Коваленко П.А. (Ace Court)",
  cabinetCode: "3287654321",
};

// ============================================
// COURTS (workstations) — 8 кортів
// ============================================

export const tennisWorkstations: SalonWorkstation[] = [
  // 4 ґрунтові
  { id: "tcourt-1", name: "Корт №1 (ґрунт)", kind: "court", resourceKind: "court", surface: "clay", indoor: false, hourlyRate: 280, allowedCategories: ["court_rent", "training", "group_class"] },
  { id: "tcourt-2", name: "Корт №2 (ґрунт)", kind: "court", resourceKind: "court", surface: "clay", indoor: false, hourlyRate: 280, allowedCategories: ["court_rent", "training", "group_class"] },
  { id: "tcourt-3", name: "Корт №3 (ґрунт)", kind: "court", resourceKind: "court", surface: "clay", indoor: false, hourlyRate: 280, allowedCategories: ["court_rent", "training", "group_class"] },
  { id: "tcourt-4", name: "Корт №4 (ґрунт)", kind: "court", resourceKind: "court", surface: "clay", indoor: false, hourlyRate: 280, allowedCategories: ["court_rent", "training", "group_class"] },
  // 2 хард outdoor
  { id: "tcourt-5", name: "Корт №5 (хард, outdoor)", kind: "court", resourceKind: "court", surface: "hard-out", indoor: false, hourlyRate: 320, allowedCategories: ["court_rent", "training", "group_class"] },
  { id: "tcourt-6", name: "Корт №6 (хард, outdoor)", kind: "court", resourceKind: "court", surface: "hard-out", indoor: false, hourlyRate: 320, allowedCategories: ["court_rent", "training", "group_class"] },
  // 2 хард indoor (преміум)
  { id: "tcourt-7", name: "Корт №7 (хард, indoor)", kind: "court", resourceKind: "court", surface: "hard-in", indoor: true, hourlyRate: 420, allowedCategories: ["court_rent", "training", "group_class"] },
  { id: "tcourt-8", name: "Корт №8 (хард, indoor)", kind: "court", resourceKind: "court", surface: "hard-in", indoor: true, hourlyRate: 420, allowedCategories: ["court_rent", "training", "group_class"] },
];

// ============================================
// SERVICES — 14 позицій
// ============================================

export const tennisServices: SalonService[] = [
  // Оренда корту (4 типи покриття)
  { id: "tsvc-rent-clay", name: "Оренда корту (ґрунт) · 1 год", category: "court_rent", durationMin: 60, price: 280, defaultCommissionPct: 0 },
  { id: "tsvc-rent-hard-out", name: "Оренда корту (хард outdoor) · 1 год", category: "court_rent", durationMin: 60, price: 320, defaultCommissionPct: 0 },
  { id: "tsvc-rent-hard-in", name: "Оренда корту (хард indoor) · 1 год", category: "court_rent", durationMin: 60, price: 420, defaultCommissionPct: 0 },
  { id: "tsvc-rent-block", name: "Оренда корту · 1,5 год блок", category: "court_rent", durationMin: 90, price: 480, defaultCommissionPct: 0 },
  // Індивідуальне тренування (включно з кортом)
  { id: "tsvc-train-60", name: "Тренування індивідуальне 60 хв (з кортом)", category: "training", durationMin: 60, price: 950, defaultCommissionPct: 55 },
  { id: "tsvc-train-90", name: "Тренування індивідуальне 90 хв (з кортом)", category: "training", durationMin: 90, price: 1350, defaultCommissionPct: 55 },
  { id: "tsvc-train-pair", name: "Парне тренування 90 хв", category: "training", durationMin: 90, price: 1750, defaultCommissionPct: 55 },
  { id: "tsvc-train-juniors", name: "Тренування juniors 60 хв", category: "training", durationMin: 60, price: 750, defaultCommissionPct: 50 },
  // Групові класи
  { id: "tsvc-group-cardio", name: "Cardio Tennis (груповий 60 хв)", category: "group_class", durationMin: 60, price: 420, defaultCommissionPct: 45 },
  { id: "tsvc-group-juniors", name: "Junior School (груповий 90 хв)", category: "group_class", durationMin: 90, price: 480, defaultCommissionPct: 45 },
  // Прокат
  { id: "tsvc-rental-racquet", name: "Прокат ракетки на 1 год", category: "rental", durationMin: 60, price: 150, defaultCommissionPct: 0 },
  { id: "tsvc-rental-basket", name: "Прокат корзини м'ячів (72 шт)", category: "rental", durationMin: 60, price: 250, defaultCommissionPct: 0 },
  { id: "tsvc-rental-machine", name: "Прокат тренувальної машини · 1 год", category: "rental", durationMin: 60, price: 350, defaultCommissionPct: 0 },
  // Разовий гість
  { id: "tsvc-guest", name: "Гостьовий візит (без оренди)", category: "court_rent", durationMin: 60, price: 100, defaultCommissionPct: 0 },
];

// ============================================
// COACHES (3 staff + 2 fop) — як SalonMaster
// ============================================

export const tennisCoaches: SalonMaster[] = [
  {
    id: "tc-m-1", fullName: "Скрипаль Олег Іванович", shortName: "Олег", type: "staff",
    masterCabinetId: "ind-coach-1",
    specialties: ["training", "group_class"], employeeId: "emp-tennis-1", commissionPct: 0,
    schedule: { workDays: [2, 3, 4, 5, 6], startHour: 7, endHour: 21 },
    color: "#0EA5E9", avatarInitials: "ОС",
    preferredWorkstationIds: ["tcourt-7", "tcourt-1"],
    publicTitle: "Головний тренер · ITF Level 2",
    experienceYears: 16, rating: 4.95, reviewsCount: 412, completedServices: 5840,
    bio: "Експрофесійний гравець, ITF Level 2. Спеціалізується на технічній постановці удару та психологічній підготовці юніорів і дорослих гравців.",
    signatureServiceIds: ["tsvc-train-90", "tsvc-train-pair", "tsvc-group-juniors"],
    languages: ["uk", "en"],
    badges: ["top_rated", "verified", "english_speaking", "kids_friendly"],
  },
  {
    id: "tc-m-2", fullName: "Орловська Тетяна Андріївна", shortName: "Тетяна", type: "staff",
    masterCabinetId: "ind-coach-2",
    specialties: ["training", "group_class"], employeeId: "emp-tennis-2", commissionPct: 0,
    schedule: { workDays: [1, 2, 3, 4, 5], startHour: 9, endHour: 19 },
    color: "#EC4899", avatarInitials: "ОТ",
    preferredWorkstationIds: ["tcourt-3", "tcourt-2"],
    publicTitle: "Тренер дитячої академії",
    experienceYears: 9, rating: 4.9, reviewsCount: 287, completedServices: 3210,
    bio: "Майстер спорту України. Веду групи juniors 6–12 років. Терпляча, методична, працюю в ігровому форматі.",
    signatureServiceIds: ["tsvc-train-juniors", "tsvc-group-juniors", "tsvc-group-cardio"],
    languages: ["uk", "en"],
    badges: ["verified", "kids_friendly"],
  },
  {
    id: "tc-m-3", fullName: "Гончар Андрій Сергійович", shortName: "Андрій", type: "staff",
    masterCabinetId: "ind-coach-3",
    specialties: ["training"], employeeId: "emp-tennis-3", commissionPct: 0,
    schedule: { workDays: [2, 3, 4, 5, 6, 0], startHour: 11, endHour: 21 },
    color: "#10B981", avatarInitials: "АГ",
    preferredWorkstationIds: ["tcourt-5", "tcourt-6"],
    publicTitle: "Тренер фізпідготовки + теніс",
    experienceYears: 7, rating: 4.85, reviewsCount: 198, completedServices: 2240,
    bio: "Колишній футболіст, перейшов у теніс. Сильна сторона — фізична підготовка, swing speed, кардіо.",
    signatureServiceIds: ["tsvc-train-60", "tsvc-group-cardio", "tsvc-train-90"],
    languages: ["uk"],
    badges: ["verified"],
  },
  // === FOP-тренери (2) ===
  {
    id: "tc-m-4", fullName: "Романюк Михайло Володимирович", shortName: "Михайло", type: "fop",
    masterCabinetId: "ind-coach-4", fopCabinetId: "fop-coach-4",
    specialties: ["training", "group_class"], contractorId: "c-tennis-coach-4", commissionPct: 55,
    schedule: { workDays: [1, 2, 4, 5, 6], startHour: 8, endHour: 20 },
    color: "#F59E0B", avatarInitials: "РМ",
    preferredWorkstationIds: ["tcourt-7", "tcourt-8"],
    publicTitle: "Топ-тренер · PTR Professional",
    experienceYears: 12, rating: 4.92, reviewsCount: 356, completedServices: 4120,
    bio: "Сертифікований PTR Professional, експерт по тактиці одиночного матчу. Готує до національних турнірів.",
    signatureServiceIds: ["tsvc-train-90", "tsvc-train-60", "tsvc-train-pair"],
    languages: ["uk", "en", "pl"],
    badges: ["top_rated", "verified", "english_speaking"],
  },
  {
    id: "tc-m-5", fullName: "Литвин Олена Петрівна", shortName: "Олена", type: "fop",
    masterCabinetId: "ind-coach-5", fopCabinetId: "fop-coach-5",
    specialties: ["training", "group_class"], contractorId: "c-tennis-coach-5", commissionPct: 55,
    schedule: { workDays: [2, 3, 4, 5, 6, 0], startHour: 10, endHour: 21 },
    color: "#A855F7", avatarInitials: "ЛО",
    preferredWorkstationIds: ["tcourt-1", "tcourt-2"],
    publicTitle: "Тренер · WTA Coaching Level 1",
    experienceYears: 8, rating: 4.88, reviewsCount: 214, completedServices: 2680,
    bio: "Спеціалізація — жіночий теніс і техніка подачі. WTA Coaching Level 1.",
    signatureServiceIds: ["tsvc-train-60", "tsvc-train-90", "tsvc-group-cardio"],
    languages: ["uk", "en"],
    badges: ["verified", "english_speaking"],
  },
];

// ============================================
// CLIENTS (28)
// ============================================

export const tennisClients: SalonClient[] = [
  { id: "tcli-1", fullName: "Іваненко Сергій Петрович", phone: "+380501112201", totalVisits: 42, lastVisitDate: getDateInPast(2), isVip: true, notes: "Постійний клієнт — 3 тренування/тиждень", email: "ivanenko.s@example.com", bonusBalance: 1840, tags: ["VIP", "тренування"], source: "referral", preferredMasterId: "tc-m-4", preferredChannel: "inApp", linkedUserId: "demo-individual-ivanenko", linkedVerification: "diia" },
  { id: "tcli-2", fullName: "Кравчук Юлія Сергіївна", phone: "+380672222302", totalVisits: 18, lastVisitDate: getDateInPast(5), email: "yu.kravchuk@example.com", bonusBalance: 540, tags: ["юніор-батько"], source: "online" },
  { id: "tcli-3", fullName: "Петренко Олег Володимирович", phone: "+380631233403", totalVisits: 27, lastVisitDate: getDateInPast(1), isVip: true, email: "o.petrenko@example.com", bonusBalance: 980, tags: ["VIP", "пара"], source: "walk-in", preferredMasterId: "tc-m-1" },
  { id: "tcli-4", fullName: "Шевченко Анна Іванівна", phone: "+380501114504", totalVisits: 9, lastVisitDate: getDateInPast(8), email: "a.shevch@example.com", bonusBalance: 220, tags: ["група"], source: "ad" },
  { id: "tcli-5", fullName: "Лисенко Олексій Андрійович", phone: "+380672225605", totalVisits: 14, lastVisitDate: getDateInPast(4), bonusBalance: 360, tags: ["оренда"], source: "walk-in" },
  { id: "tcli-6", fullName: "Бондар Михайло Олегович", phone: "+380631236706", totalVisits: 33, lastVisitDate: getDateInPast(3), isVip: true, email: "m.bondar@example.com", bonusBalance: 1240, tags: ["VIP", "тренування"], source: "referral", preferredMasterId: "tc-m-4" },
  { id: "tcli-7", fullName: "Romanov Mark (Roof Top Hotel)", phone: "+380671237807", totalVisits: 6, lastVisitDate: getDateInPast(10), notes: "Гості готелю — корпоративний пакет", email: "concierge@rth.com", bonusBalance: 0, tags: ["корпоративний"], source: "referral" },
  { id: "tcli-8", fullName: "ТОВ «КиївБудIT»", phone: "+380501238908", totalVisits: 4, lastVisitDate: getDateInPast(7), notes: "Корпоративний кубок 2026", bonusBalance: 0, tags: ["B2B"], source: "referral" },
  { id: "tcli-9", fullName: "Tennis Academy KYIV", phone: "+380632100909", totalVisits: 16, lastVisitDate: getDateInPast(2), notes: "Школа юніорів — групові класи", bonusBalance: 0, tags: ["B2B", "юніори"], source: "referral" },
  { id: "tcli-10", fullName: "Гордієнко Наталія Андріївна", phone: "+380504001010", totalVisits: 11, lastVisitDate: getDateInPast(6), email: "n.gordienko@example.com", bonusBalance: 380, tags: ["група"], source: "online" },
  { id: "tcli-11", fullName: "Тимошенко Вікторія Олександрівна", phone: "+380675002211", totalVisits: 8, lastVisitDate: getDateInPast(9), bonusBalance: 240, tags: ["оренда"], source: "ad" },
  { id: "tcli-12", fullName: "Костенко Олег Володимирович", phone: "+380636003312", totalVisits: 22, lastVisitDate: getDateInPast(2), isVip: true, email: "kostenko@example.com", bonusBalance: 860, tags: ["VIP", "пара"], source: "walk-in" },
  { id: "tcli-13", fullName: "Литвиненко Тетяна Петрівна", phone: "+380507004413", totalVisits: 7, lastVisitDate: getDateInPast(11), bonusBalance: 180, source: "online" },
  { id: "tcli-14", fullName: "Романенко Софія Сергіївна", phone: "+380678005514", totalVisits: 5, lastVisitDate: getDateInPast(14), bonusBalance: 120, source: "ad" },
  { id: "tcli-15", fullName: "Власенко Олена Андріївна", phone: "+380639006615", totalVisits: 19, lastVisitDate: getDateInPast(3), email: "vlasenko@example.com", bonusBalance: 660, tags: ["тренування"], source: "referral", preferredMasterId: "tc-m-5" },
  { id: "tcli-16", fullName: "Гаврилюк Максим Олегович", phone: "+380501007716", totalVisits: 10, lastVisitDate: getDateInPast(5), bonusBalance: 280, source: "walk-in" },
  { id: "tcli-17", fullName: "Сергієнко Аліна Іванівна", phone: "+380672008817", totalVisits: 14, lastVisitDate: getDateInPast(4), email: "sergienko@example.com", bonusBalance: 420, tags: ["група"], source: "online" },
  { id: "tcli-18", fullName: "Чорна Олександра Володимирівна", phone: "+380633009918", totalVisits: 12, lastVisitDate: getDateInPast(8), bonusBalance: 320, source: "ad" },
  { id: "tcli-19", fullName: "Морозенко Інна Петрівна", phone: "+380504000019", totalVisits: 6, lastVisitDate: getDateInPast(13), bonusBalance: 140, source: "walk-in" },
  { id: "tcli-20", fullName: "Бойко Олег Сергійович", phone: "+380678000020", totalVisits: 8, lastVisitDate: getDateInPast(12), bonusBalance: 200, source: "online" },
  { id: "tcli-21", fullName: "Денисенко Юлія Олегівна", phone: "+380636001021", totalVisits: 15, lastVisitDate: getDateInPast(6), email: "denysenko@example.com", bonusBalance: 460, tags: ["група"], source: "referral" },
  { id: "tcli-22", fullName: "Левченко Олександр Михайлович", phone: "+380507002022", totalVisits: 9, lastVisitDate: getDateInPast(7), bonusBalance: 220, source: "walk-in" },
  { id: "tcli-23", fullName: "Білоус Катерина Сергіївна", phone: "+380678003023", totalVisits: 11, lastVisitDate: getDateInPast(5), email: "bilous@example.com", bonusBalance: 280, tags: ["тренування"], source: "online" },
  { id: "tcli-24", fullName: "Захарченко Євгенія Михайлівна", phone: "+380639004024", totalVisits: 6, lastVisitDate: getDateInPast(15), bonusBalance: 130, source: "ad" },
  { id: "tcli-25", fullName: "Мельник Анастасія Олегівна", phone: "+380504005025", totalVisits: 13, lastVisitDate: getDateInPast(4), email: "melnyk@example.com", bonusBalance: 420, tags: ["тренування"], source: "referral", preferredMasterId: "tc-m-2" },
  { id: "tcli-26", fullName: "Кравченко Ірина Володимирівна", phone: "+380672006026", totalVisits: 21, lastVisitDate: getDateInPast(2), isVip: true, email: "kravchenko@example.com", bonusBalance: 740, tags: ["VIP"], source: "referral" },
  { id: "tcli-27", fullName: "Лисенко Дмитро Сергійович", phone: "+380636007027", totalVisits: 4, lastVisitDate: getDateInPast(18), bonusBalance: 80, source: "online" },
  { id: "tcli-28", fullName: "Олексієнко Маргарита Іванівна", phone: "+380504008028", totalVisits: 7, lastVisitDate: getDateInPast(17), bonusBalance: 160, source: "ad" },
];

// ============================================
// BOOKINGS — 90 днів історії + 14 майбутніх
// ============================================

function generateBookings(): SalonBooking[] {
  const out: SalonBooking[] = [];
  let id = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slotTimes = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  type Scenario = { coach?: string; svc: string; courtPool: string[]; combo?: string[] };
  const scenarios: Scenario[] = [
    { coach: "tc-m-1", svc: "tsvc-train-90", courtPool: ["tcourt-7"] },
    { coach: "tc-m-2", svc: "tsvc-train-juniors", courtPool: ["tcourt-2", "tcourt-3"] },
    { coach: "tc-m-3", svc: "tsvc-train-60", courtPool: ["tcourt-5", "tcourt-6"] },
    { coach: "tc-m-4", svc: "tsvc-train-90", courtPool: ["tcourt-7", "tcourt-8"] },
    { coach: "tc-m-5", svc: "tsvc-train-60", courtPool: ["tcourt-1"] },
    // Оренда без тренера (masterId = ""; модельний "open-court")
    { svc: "tsvc-rent-clay", courtPool: ["tcourt-1", "tcourt-2", "tcourt-3", "tcourt-4"] },
    { svc: "tsvc-rent-hard-out", courtPool: ["tcourt-5", "tcourt-6"] },
    { svc: "tsvc-rent-hard-in", courtPool: ["tcourt-7", "tcourt-8"] },
    { coach: "tc-m-2", svc: "tsvc-group-juniors", courtPool: ["tcourt-3"] },
    { coach: "tc-m-3", svc: "tsvc-group-cardio", courtPool: ["tcourt-5"] },
  ];

  const mkBooking = (
    offset: number,
    sc: Scenario,
    time: string,
    clientId: string,
    statusOverride?: BookingStatus,
  ): SalonBooking => {
    const svc = tennisServices.find((s) => s.id === sc.svc)!;
    const totalPrice = svc.price;
    const durationMin = svc.durationMin;
    const masterId = sc.coach ?? "tc-m-open";
    const coach = sc.coach ? tennisCoaches.find((c) => c.id === sc.coach) : undefined;
    const commissionAmount = coach ? Math.round((totalPrice * coach.commissionPct) / 100) : 0;
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dateIso = d.toISOString().split("T")[0];
    const workstationId = sc.courtPool[(id + offset) % sc.courtPool.length];

    let status: BookingStatus;
    let paymentMethod: BookingPaymentMethod | undefined;
    if (statusOverride) {
      status = statusOverride;
    } else if (offset < 0) {
      const r = (id * 41) % 100;
      if (r < 90) status = "done";
      else if (r < 95) status = "no-show";
      else status = "canceled";
    } else if (offset === 0) {
      status = id % 2 === 0 ? "confirmed" : "scheduled";
    } else {
      status = "scheduled";
    }

    if (status === "done") {
      const r = (id * 17) % 100;
      paymentMethod = r < 55 ? "card" : r < 90 ? "cash" : "transfer";
    }

    return {
      id: `tbk-${String(id++).padStart(4, "0")}`,
      date: dateIso,
      startTime: time,
      durationMin,
      clientId,
      masterId,
      workstationId,
      serviceIds: [svc.id],
      totalPrice,
      commissionAmount,
      status,
      paymentMethod,
      prroCheckId: status === "done" && paymentMethod !== "transfer" ? `prro-t-${id}` : undefined,
      salonCabinetId: CABINET_ID,
      origin: "salon",
      revenueOwner: "salon",
    };
  };

  // 90 minus → -1
  for (let offset = -90; offset <= -1; offset++) {
    const dow = ((new Date(today).getDay() + offset) % 7 + 7) % 7;
    if (dow === 1) continue; // понеділок — клуб закритий
    const bookingsThisDay = 7 + ((offset * 13) % 6);
    for (let i = 0; i < bookingsThisDay; i++) {
      const sc = scenarios[(i + Math.abs(offset)) % scenarios.length];
      if (sc.coach) {
        const coach = tennisCoaches.find((c) => c.id === sc.coach)!;
        if (!coach.schedule.workDays.includes(dow)) continue;
      }
      const time = slotTimes[(i * 3 + Math.abs(offset)) % slotTimes.length];
      const clientId = tennisClients[(i * 5 + Math.abs(offset)) % tennisClients.length].id;
      out.push(mkBooking(offset, sc, time, clientId));
    }
  }

  // Сьогодні + 14 днів
  for (let offset = 0; offset <= 14; offset++) {
    const dow = ((new Date(today).getDay() + offset) + 7) % 7;
    if (dow === 1) continue;
    const bookingsThisDay = offset === 0 ? 9 : 4 + (offset % 4);
    for (let i = 0; i < bookingsThisDay; i++) {
      const sc = scenarios[(i + offset) % scenarios.length];
      if (sc.coach) {
        const coach = tennisCoaches.find((c) => c.id === sc.coach)!;
        if (!coach.schedule.workDays.includes(dow)) continue;
      }
      const time = slotTimes[(i * 2 + offset) % slotTimes.length];
      const clientId = tennisClients[(i * 3 + offset) % tennisClients.length].id;
      out.push(mkBooking(offset, sc, time, clientId));
    }
  }

  return out;
}

export const tennisBookings: SalonBooking[] = generateBookings();

// ============================================
// EMPLOYEES — 3 тренери + 2 адміни ресепшн
// ============================================

export const tennisEmployees: Employee[] = [
  {
    id: "emp-tennis-1",
    cabinetId: CABINET_ID,
    fullName: "Скрипаль Олег Іванович",
    position: "Головний тренер",
    contractType: "labor",
    status: "active",
    startDate: "2023-04-01",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Вт–Нд 7:00–21:00 (плаваюча)",
    location: "office",
    contractNumber: "ТД-2023-T1",
    contractDate: "2023-04-01",
    militaryStatus: "liable",
  },
  {
    id: "emp-tennis-2",
    cabinetId: CABINET_ID,
    fullName: "Орловська Тетяна Андріївна",
    position: "Тренер дитячої академії",
    contractType: "labor",
    status: "active",
    startDate: "2024-01-15",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Пн–Пт 9:00–19:00",
    location: "office",
    contractNumber: "ТД-2024-T2",
    contractDate: "2024-01-15",
    militaryStatus: "not-applicable",
  },
  {
    id: "emp-tennis-3",
    cabinetId: CABINET_ID,
    fullName: "Гончар Андрій Сергійович",
    position: "Тренер фізпідготовки",
    contractType: "labor",
    status: "active",
    startDate: "2024-09-01",
    employmentMode: "part-time",
    fte: 0.75,
    schedule: "Вт–Сб 11:00–21:00",
    location: "office",
    contractNumber: "ТД-2024-T3",
    contractDate: "2024-09-01",
    militaryStatus: "liable",
  },
  {
    id: "emp-tennis-4",
    cabinetId: CABINET_ID,
    fullName: "Шаповал Ірина Петрівна",
    position: "Старший адміністратор ресепшн",
    contractType: "labor",
    status: "active",
    startDate: "2023-05-10",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Пн–Пт 9:00–18:00",
    location: "office",
    contractNumber: "ТД-2023-T4",
    contractDate: "2023-05-10",
    militaryStatus: "not-applicable",
  },
  {
    id: "emp-tennis-5",
    cabinetId: CABINET_ID,
    fullName: "Сидоренко Дмитро Олегович",
    position: "Адміністратор / бариста кафе",
    contractType: "labor",
    status: "active",
    startDate: "2024-06-01",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Зміна 7:00–15:00 / 15:00–23:00",
    location: "office",
    contractNumber: "ТД-2024-T5",
    contractDate: "2024-06-01",
    militaryStatus: "liable",
  },
];

// ============================================
// CONTRACTORS — 2 ФОП-тренери + 12 постачальників
// ============================================

export const tennisContractors: Contractor[] = [
  ...tennisCoaches
    .filter((m) => m.type === "fop")
    .map<Contractor>((m, idx) => ({
      id: m.contractorId!,
      name: `ФОП ${m.fullName.split(" ").slice(0, 2).join(" ")}`,
      fullName: `Фізична особа-підприємець ${m.fullName}`,
      code: `387654320${idx + 4}`,
      iban: `UA${40 + idx}305299000026004${String(2000 + idx).padStart(4, "0")}00002`,
      ibanConfirmed: true,
      phone: `+38067123450${idx + 4}`,
      type: "fop",
      role: "master",
      taxStatus: "Платник ЄП 3 група",
      isSynced: true,
      status: "active",
      tags: ["fop-coach"],
      notes: `Тренер-партнер клубу «Ace Court». Винагорода ${m.commissionPct}% від чека.`,
      createdAt: "2024-04-01",
    })),
  { id: "c-tennis-rent", name: "ТОВ «Спорт Комплекс Київ»", fullName: "ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «СПОРТ КОМПЛЕКС КИЇВ»", code: "41112233", iban: "UA213052990000026007000099912", ibanConfirmed: true, type: "legal", role: "supplier", taxStatus: "Платник ПДВ", isSynced: true, status: "active", notes: "Оренда території та критих кортів", createdAt: "2023-03-01" },
  { id: "c-tennis-wilson", name: "Wilson Sporting Goods (EU)", code: "DE301452211", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Імпорт ракеток і струн (EUR)", createdAt: "2023-05-10" },
  { id: "c-tennis-head", name: "HEAD Sport GmbH", code: "AT12446789", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Імпорт інвентаря HEAD", createdAt: "2023-05-12" },
  { id: "c-tennis-babolat", name: "ТОВ «Babolat Україна»", code: "39827654", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Локальний дистриб'ютор Babolat", createdAt: "2023-04-22" },
  { id: "c-tennis-nike", name: "ТОВ «Nike Україна»", code: "32145678", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Кросівки і одяг Nike", createdAt: "2023-06-01" },
  { id: "c-tennis-beanlab", name: "ТОВ «BeanLab Coffee»", code: "42558899", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Кава для Net Point", createdAt: "2024-02-01" },
  { id: "c-tennis-fresh", name: "ТОВ «FreshDistrib»", code: "41998877", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Свіжі салати, фреш-соки", createdAt: "2024-02-15" },
  { id: "c-tennis-bake", name: "ТОВ «Bake & Co»", code: "42223344", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Випічка, сендвічі для кафе", createdAt: "2024-02-15" },
  { id: "c-tennis-court", name: "ТОВ «Court Equip Україна»", code: "41277889", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Сітки, фарба, інструменти для кортів", createdAt: "2023-03-10" },
  { id: "c-tennis-utility", name: "ПрАТ «ДТЕК Київські електромережі»", code: "00131305", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Електроенергія + освітлення кортів", createdAt: "2023-03-01" },
  { id: "c-tennis-telecom", name: "ТОВ «Київстар»", code: "21673832", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Інтернет + Wi-Fi для клієнтів", createdAt: "2023-03-01" },
  { id: "c-tennis-security", name: "ТОВ «Securitas Україна»", code: "30457112", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Охорона території 24/7", createdAt: "2023-04-01" },
  { id: "c-tennis-clean", name: "ФОП Кравченко (Клінінг)", code: "2934567812", type: "fop", role: "supplier", isSynced: false, status: "active", notes: "Прибирання роздягалень + кафе", createdAt: "2024-01-10" },
];

// ============================================
// INCOME — генеруємо з виконаних бронювань (booking-flow)
// ============================================

function generateIncomeFromBookings(): IncomeBookRecord[] {
  const done = tennisBookings.filter((b) => b.status === "done");
  return done.map((b, idx) => {
    const client = tennisClients.find((c) => c.id === b.clientId);
    const svc = tennisServices.find((s) => s.id === b.serviceIds[0]);
    const isTransfer = b.paymentMethod === "transfer";
    return {
      id: `inc-tennis-${String(idx + 1).padStart(4, "0")}`,
      date: b.date,
      description: `${svc?.name ?? "Послуги клубу"}${client ? ` · ${client.fullName.split(" ").slice(0, 2).join(" ")}` : ""}`,
      contractor: client?.fullName,
      amount: b.totalPrice,
      inIncomeBook: b.totalPrice,
      paymentType: isTransfer ? "transfer" : b.paymentMethod === "cash" ? "cash" : "card",
      source: isTransfer ? "monobank" : "prro",
      status: "income",
    } as IncomeBookRecord;
  });
}

export const tennisIncomeRecords: IncomeBookRecord[] = generateIncomeFromBookings();

// ============================================
// TAX PAYMENTS
// ============================================

const Q1_INCOME_T = tennisIncomeRecords
  .filter((r) => {
    const m = parseInt(r.date.slice(5, 7), 10);
    return m >= 1 && m <= 3;
  })
  .reduce((s, r) => s + r.amount, 0);

export const tennisTaxPayments: TaxPayment[] = [
  {
    id: "tax-tennis-ep-q1",
    cabinetId: CABINET_ID,
    taxType: "ep",
    taxTypeLabel: "Єдиний податок 5%",
    period: "I квартал 2026",
    year: 2026,
    quarter: 1,
    amountToPay: Math.round((Q1_INCOME_T || 1_200_000) * 0.05),
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-05-20",
    createdAt: getDateInPast(2),
    taxRate: 5,
    calculatedFromIncome: Q1_INCOME_T || 1_200_000,
  },
  {
    id: "tax-tennis-esv-q1",
    cabinetId: CABINET_ID,
    taxType: "esv",
    taxTypeLabel: "ЄСВ ФОП (фіксований)",
    period: "I квартал 2026",
    year: 2026,
    quarter: 1,
    amountToPay: 5280,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-04-22",
    createdAt: getDateInPast(2),
  },
  {
    id: "tax-tennis-pdfo-mar",
    cabinetId: CABINET_ID,
    taxType: "pdfo",
    taxTypeLabel: "ПДФО з ЗП",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 16560, // 18% × 92 000 (брутто 5 працівників)
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-10",
    paidDate: "2026-04-08",
    paidAmount: 16560,
    createdAt: "2026-04-01",
  },
  {
    id: "tax-tennis-vz-mar",
    cabinetId: CABINET_ID,
    taxType: "military",
    taxTypeLabel: "Військовий збір з ЗП",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 4600,
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-10",
    paidDate: "2026-04-08",
    paidAmount: 4600,
    createdAt: "2026-04-01",
  },
  {
    id: "tax-tennis-esv-emp-mar",
    cabinetId: CABINET_ID,
    taxType: "esv-employer",
    taxTypeLabel: "ЄСВ роботодавця",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 20240, // 22% × 92 000
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-22",
    paidDate: "2026-04-20",
    paidAmount: 20240,
    createdAt: "2026-04-01",
  },
];

// ============================================
// CONTRACTOR PAYMENTS — комісії ФОП-тренерам + оренда + кафе/інвентар
// ============================================

function generateCoachCommissions(): ContractorPayment[] {
  const weekly = new Map<string, { contractorId: string; amount: number; minDate: string; maxDate: string; count: number }>();
  for (const b of tennisBookings.filter((x) => x.status === "done")) {
    const coach = tennisCoaches.find((c) => c.id === b.masterId);
    if (!coach || coach.type !== "fop") continue;
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
      weekly.set(key, {
        contractorId: coach.contractorId!,
        amount: b.commissionAmount,
        minDate: b.date,
        maxDate: b.date,
        count: 1,
      });
    }
  }
  const today = new Date().toISOString().split("T")[0];
  const out: ContractorPayment[] = [];
  let idx = 0;
  for (const [, w] of weekly) {
    const contractor = tennisContractors.find((c) => c.id === w.contractorId)!;
    const isPaid = w.maxDate < today;
    out.push({
      id: `pay-tennis-comm-${++idx}`,
      cabinetId: CABINET_ID,
      date: w.maxDate,
      contractor: contractor.name,
      contractorId: contractor.id,
      contractorCode: contractor.code,
      purpose: `Винагорода тренера за період ${w.minDate} – ${w.maxDate} (${w.count} сесій)`,
      amount: w.amount,
      status: isPaid ? "paid" : "scheduled",
      statusLabel: isPaid ? "Сплачено" : "Заплановано",
      recipientIban: contractor.iban,
      paymentPurposeType: "services",
    });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export const tennisContractorPayments: ContractorPayment[] = [
  ...generateCoachCommissions(),
  {
    id: "pay-tennis-rent-apr",
    cabinetId: CABINET_ID,
    date: "2026-04-05",
    contractor: "ТОВ «Спорт Комплекс Київ»",
    contractorId: "c-tennis-rent",
    contractorCode: "41112233",
    purpose: "Оренда території + критих кортів за квітень 2026",
    amount: 185000,
    status: "paid",
    statusLabel: "Сплачено",
    recipientIban: "UA213052990000026007000099912",
    paymentPurposeType: "rent",
  },
  {
    id: "pay-tennis-rent-may",
    cabinetId: CABINET_ID,
    date: "2026-05-05",
    contractor: "ТОВ «Спорт Комплекс Київ»",
    contractorId: "c-tennis-rent",
    contractorCode: "41112233",
    purpose: "Оренда території + критих кортів за травень 2026",
    amount: 185000,
    status: "scheduled",
    statusLabel: "Заплановано",
    recipientIban: "UA213052990000026007000099912",
    paymentPurposeType: "rent",
  },
  {
    id: "pay-tennis-utility-1",
    cabinetId: CABINET_ID,
    date: getDateInPast(7),
    contractor: "ПрАТ «ДТЕК Київські електромережі»",
    contractorId: "c-tennis-utility",
    purpose: "Електроенергія + освітлення кортів, березень 2026",
    amount: 18250,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-tennis-clean-1",
    cabinetId: CABINET_ID,
    date: getDateInPast(5),
    contractor: "ФОП Кравченко (Клінінг)",
    contractorId: "c-tennis-clean",
    purpose: "Прибирання роздягалень + кафе, квітень",
    amount: 6800,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-tennis-security-1",
    cabinetId: CABINET_ID,
    date: getDateInPast(8),
    contractor: "ТОВ «Securitas Україна»",
    contractorId: "c-tennis-security",
    purpose: "Охорона території, березень 2026",
    amount: 14500,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-tennis-telecom-1",
    cabinetId: CABINET_ID,
    date: getDateInPast(6),
    contractor: "ТОВ «Київстар»",
    contractorId: "c-tennis-telecom",
    purpose: "Інтернет + Wi-Fi гостьовий",
    amount: 1850,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
];

// ============================================
// SALARY PAYMENTS
// ============================================

const SAL_PERIOD_CURR = "Квітень 2026";
const SAL_PERIOD_PREV = "Березень 2026";

function mkSalary(
  id: string,
  emp: Employee,
  net: number,
  period: string,
  status: "paid" | "scheduled",
  scheduledDate: string,
): SalaryPayment {
  const gross = Math.round(net / 0.7706);
  return {
    id,
    cabinetId: CABINET_ID,
    employeeId: emp.id,
    employeeName: emp.fullName,
    employeePosition: emp.position,
    salaryType: "salary",
    salaryTypeLabel: "Зарплата",
    period,
    amount: net,
    status,
    statusLabel: status === "paid" ? "Сплачено" : "Заплановано",
    scheduledDate,
    paidDate: status === "paid" ? scheduledDate : undefined,
    source: "manual",
    grossAmount: gross,
    pdfoAmount: status === "scheduled" ? Math.round(gross * 0.18) : undefined,
    militaryTaxAmount: status === "scheduled" ? Math.round(gross * 0.052) : undefined,
    esvAmount: status === "scheduled" ? Math.round(gross * 0.22) : undefined,
  };
}

const SAL_AMOUNTS: Record<string, number> = {
  "emp-tennis-1": 28000,
  "emp-tennis-2": 22000,
  "emp-tennis-3": 18000,
  "emp-tennis-4": 16000,
  "emp-tennis-5": 14000,
};

export const tennisSalaryPayments: SalaryPayment[] = [
  ...tennisEmployees.map((e) => mkSalary(`sal-tennis-apr-${e.id}`, e, SAL_AMOUNTS[e.id] ?? 15000, SAL_PERIOD_CURR, "scheduled", "2026-05-05")),
  ...tennisEmployees.map((e) => mkSalary(`sal-tennis-mar-${e.id}`, e, SAL_AMOUNTS[e.id] ?? 15000, SAL_PERIOD_PREV, "paid", "2026-04-05")),
];

// ============================================
// DOCUMENTS
// ============================================

export const tennisDocuments: Document[] = [
  {
    id: "doc-tennis-001",
    ...CABINET_META,
    number: "ОРЕНДА-ACE-2026",
    type: "rental-agreement",
    category: "contract",
    title: "Договір оренди території тенісного клубу",
    date: "2026-01-01",
    dueDate: "2026-12-31",
    amount: 185000,
    currency: "UAH",
    contractor: { id: "c-tennis-rent", name: "ТОВ «Спорт Комплекс Київ»", code: "41112233" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2026-01-01T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2026-01-01T12:00:00Z",
    aiSummary: "Оренда території 0,8 га (8 кортів) + приміщення під магазин і кафе. 185 000 ₴/міс, до 5 числа.",
  },
  ...tennisCoaches
    .filter((m) => m.type === "fop")
    .map<Document>((m, idx) => ({
      id: `doc-tennis-cph-${idx + 1}`,
      ...CABINET_META,
      number: `ЦПХ-2026-T${String(idx + 1).padStart(3, "0")}`,
      type: "contract",
      category: "contract",
      title: `Договір ЦПХ з ${m.fullName.split(" ").slice(0, 2).join(" ")}`,
      date: "2026-01-10",
      dueDate: "2026-12-31",
      amount: 0,
      currency: "UAH",
      contractor: {
        id: m.contractorId!,
        name: `ФОП ${m.fullName.split(" ").slice(0, 2).join(" ")}`,
        code: `387654320${idx + 4}`,
      },
      status: "signed",
      retentionPeriod: 5,
      createdAt: "2026-01-10T08:00:00Z",
      createdBy: "contractor",
      updatedAt: "2026-01-10T12:00:00Z",
      aiSummary: `ЦПХ-договір з ФОП-тренером. Винагорода ${m.commissionPct}% від чека за тренування.`,
    })),
  {
    id: "doc-tennis-prro-shop",
    ...CABINET_META,
    number: "ПРРО-ACE-SHOP",
    type: "other",
    category: "internal",
    title: "Реєстраційна заява ПРРО (Pro Shop)",
    date: "2023-05-01",
    amount: 0,
    currency: "UAH",
    contractor: { id: "dps", name: "ДПС України", code: "39292197" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2023-05-01T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2023-05-01T12:00:00Z",
    aiSummary: "ПРРО Pro Shop — реєстрація фіскальної каси магазину інвентаря.",
  },
  {
    id: "doc-tennis-prro-cafe",
    ...CABINET_META,
    number: "ПРРО-ACE-CAFE",
    type: "other",
    category: "internal",
    title: "Реєстраційна заява ПРРО (Net Point Cafe)",
    date: "2023-05-01",
    amount: 0,
    currency: "UAH",
    contractor: { id: "dps", name: "ДПС України", code: "39292197" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2023-05-01T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2023-05-01T12:00:00Z",
    aiSummary: "ПРРО Net Point — реєстрація фіскальної каси кафе клубу.",
  },
];

// ============================================
// REPORTS
// ============================================

export const tennisReports: Report[] = [
  {
    id: "rep-tennis-1df-q1",
    cabinetId: CABINET_ID,
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
    id: "rep-tennis-ep-q1",
    cabinetId: CABINET_ID,
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
    id: "rep-tennis-ep-2025",
    cabinetId: CABINET_ID,
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

// Re-export ServiceCategory тільки щоб TS не сварився якщо файл імпортують без салону.
export type { ServiceCategory };
