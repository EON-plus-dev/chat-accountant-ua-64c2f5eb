/**
 * HOTEL CABINET (demo-hotel-3)
 * ФОП Бондаренко Н.В. — Готель «Затишок», 3 група 5% без ПДВ.
 *
 * Команда: 4 прибиральниці штат + 1 ФОП-прибиральниця (ЦПХ),
 *          2 технічні майстри штат (сантехнік + електрик),
 *          2 адміністратори ресепшн штат (24/7 у 2 зміни),
 *          1 керівник готелю штат.
 * Інфраструктура: 30 номерів (16 Standard + 8 Superior + 4 Junior Suite + 2 Suite),
 *                 150 SKU (mini-bar / сніданок / SPA-косметика / готельні товари),
 *                 1 ПРРО «Reception».
 *
 * Архітектурно готель = індустрія `hotel`: повний набір модулів
 * (bookings + client_book + retail_prro + goods_sales + purchases + warehouse + fixed_assets).
 * Bookable-ресурс = номер (НЕ майстер). Бронювання багатоденне через
 * `SalonBooking` з категорією `room_stay` + `nights`/`endDate`/`guestsCount`.
 *
 * Жодних `salonMasterDelegations` — гість бронює номер напряму, без вибору особистого менеджера.
 */

import type { Document } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { TaxPayment, ContractorPayment, SalaryPayment } from "@/config/paymentsConfig";
import type { Contractor } from "@/config/settingsConfig";
import type { Employee } from "@/config/employeesConfig";
import type { Report } from "@/config/reportsConfig";
import type {
  SalonService,
  SalonWorkstation,
  SalonClient,
  SalonBooking,
  BookingStatus,
  BookingPaymentMethod,
} from "./salonData";
import { getDateInPast } from "./helpers";

const CABINET_ID = "demo-hotel-3";
const CABINET_META = {
  cabinetId: CABINET_ID,
  cabinetName: "ФОП Бондаренко Н.В. (Готель «Затишок»)",
  cabinetCode: "3398765012",
};

// ============================================
// ROOMS (workstations) — 30 номерів
// ============================================

function mkRoom(
  id: string,
  number: string,
  category: "standard" | "superior" | "junior_suite" | "suite",
  capacity: number,
  beds: "single" | "double" | "twin" | "king",
  rate: number,
  floor: number,
  view: "city" | "park" | "courtyard" | "panorama" = "city",
): SalonWorkstation {
  const labels: Record<typeof category, string> = {
    standard: "Standard",
    superior: "Superior",
    junior_suite: "Junior Suite",
    suite: "Suite Panorama",
  };
  return {
    id,
    name: `Номер ${number} (${labels[category]})`,
    kind: "hotel_room",
    resourceKind: "room",
    roomCategory: category,
    roomCapacity: capacity,
    bedsLayout: beds,
    floor,
    viewKind: view,
    nightlyRate: rate,
    allowedCategories: ["room_stay"],
  };
}

export const hotelRooms: SalonWorkstation[] = [
  // Standard (16) — поверхи 1–3, 2-місн., 1 200 ₴/ніч
  mkRoom("hr-101", "101", "standard", 2, "double", 1200, 1, "courtyard"),
  mkRoom("hr-102", "102", "standard", 2, "double", 1200, 1, "courtyard"),
  mkRoom("hr-103", "103", "standard", 2, "twin", 1200, 1, "city"),
  mkRoom("hr-104", "104", "standard", 2, "twin", 1200, 1, "city"),
  mkRoom("hr-105", "105", "standard", 2, "double", 1200, 1, "city"),
  mkRoom("hr-106", "106", "standard", 2, "twin", 1200, 1, "courtyard"),
  mkRoom("hr-201", "201", "standard", 2, "double", 1200, 2, "city"),
  mkRoom("hr-202", "202", "standard", 2, "double", 1200, 2, "city"),
  mkRoom("hr-203", "203", "standard", 2, "twin", 1200, 2, "park"),
  mkRoom("hr-204", "204", "standard", 2, "twin", 1200, 2, "park"),
  mkRoom("hr-205", "205", "standard", 2, "double", 1200, 2, "city"),
  mkRoom("hr-301", "301", "standard", 2, "double", 1200, 3, "city"),
  mkRoom("hr-302", "302", "standard", 2, "twin", 1200, 3, "park"),
  mkRoom("hr-303", "303", "standard", 2, "double", 1200, 3, "park"),
  mkRoom("hr-304", "304", "standard", 2, "twin", 1200, 3, "city"),
  mkRoom("hr-305", "305", "standard", 2, "double", 1200, 3, "city"),
  // Superior (8) — поверхи 2–4, 2-місн., 1 800 ₴/ніч
  mkRoom("hr-206", "206", "superior", 2, "king", 1800, 2, "park"),
  mkRoom("hr-207", "207", "superior", 2, "king", 1800, 2, "park"),
  mkRoom("hr-306", "306", "superior", 2, "king", 1800, 3, "park"),
  mkRoom("hr-307", "307", "superior", 2, "king", 1800, 3, "park"),
  mkRoom("hr-401", "401", "superior", 2, "king", 1800, 4, "city"),
  mkRoom("hr-402", "402", "superior", 2, "king", 1800, 4, "city"),
  mkRoom("hr-403", "403", "superior", 2, "king", 1800, 4, "park"),
  mkRoom("hr-404", "404", "superior", 2, "king", 1800, 4, "park"),
  // Junior Suite (4) — 4 поверх, 3-місн., 2 600 ₴/ніч
  mkRoom("hr-405", "405", "junior_suite", 3, "king", 2600, 4, "park"),
  mkRoom("hr-406", "406", "junior_suite", 3, "king", 2600, 4, "park"),
  mkRoom("hr-407", "407", "junior_suite", 3, "king", 2600, 4, "city"),
  mkRoom("hr-408", "408", "junior_suite", 3, "king", 2600, 4, "city"),
  // Suite Panorama (2) — 5 поверх (мансарда), 4-місн., 4 200 ₴/ніч
  mkRoom("hr-501", "501", "suite", 4, "king", 4200, 5, "panorama"),
  mkRoom("hr-502", "502", "suite", 4, "king", 4200, 5, "panorama"),
];

// ============================================
// SERVICES — проживання за категоріями + додаткові послуги
// ============================================

export const hotelServices: SalonService[] = [
  { id: "hsvc-stay-std", name: "Проживання · Standard (1 ніч)", category: "room_stay", durationMin: 1440, price: 1200, defaultCommissionPct: 0 },
  { id: "hsvc-stay-sup", name: "Проживання · Superior (1 ніч)", category: "room_stay", durationMin: 1440, price: 1800, defaultCommissionPct: 0 },
  { id: "hsvc-stay-jsuite", name: "Проживання · Junior Suite (1 ніч)", category: "room_stay", durationMin: 1440, price: 2600, defaultCommissionPct: 0 },
  { id: "hsvc-stay-suite", name: "Проживання · Suite Panorama (1 ніч)", category: "room_stay", durationMin: 1440, price: 4200, defaultCommissionPct: 0 },
  { id: "hsvc-breakfast", name: "Сніданок «шведський стіл» (на гостя)", category: "breakfast_addon", durationMin: 60, price: 250, defaultCommissionPct: 0 },
  { id: "hsvc-early-checkin", name: "Ранній check-in (з 10:00)", category: "breakfast_addon", durationMin: 0, price: 300, defaultCommissionPct: 0 },
  { id: "hsvc-late-checkout", name: "Пізній check-out (до 18:00)", category: "breakfast_addon", durationMin: 0, price: 300, defaultCommissionPct: 0 },
  { id: "hsvc-spa-massage", name: "SPA · Класичний масаж 60 хв", category: "spa_addon", durationMin: 60, price: 950, defaultCommissionPct: 0 },
  { id: "hsvc-transfer", name: "Трансфер з/до аеропорту", category: "transfer_addon", durationMin: 60, price: 1200, defaultCommissionPct: 0 },
];

// ============================================
// CLIENTS (24)
// ============================================

export const hotelClients: SalonClient[] = [
  { id: "hcli-1", fullName: "Іваненко Сергій Петрович", phone: "+380501110011", totalVisits: 12, lastVisitDate: getDateInPast(8), isVip: true, email: "ivanenko.s@example.com", tags: ["VIP", "бізнес"], source: "online" },
  { id: "hcli-2", fullName: "Кравчук Юлія Сергіївна", phone: "+380672220022", totalVisits: 5, lastVisitDate: getDateInPast(14), email: "yu.kravchuk@example.com", tags: ["сімейний"], source: "online" },
  { id: "hcli-3", fullName: "Петренко Олег Володимирович", phone: "+380631230033", totalVisits: 8, lastVisitDate: getDateInPast(4), isVip: true, email: "o.petrenko@example.com", tags: ["VIP"], source: "referral" },
  { id: "hcli-4", fullName: "Шевченко Анна Іванівна", phone: "+380501114044", totalVisits: 3, lastVisitDate: getDateInPast(21), email: "a.shevch@example.com", source: "ad" },
  { id: "hcli-5", fullName: "Лисенко Олексій Андрійович", phone: "+380672225055", totalVisits: 6, lastVisitDate: getDateInPast(30), source: "online" },
  { id: "hcli-6", fullName: "Бондар Михайло Олегович", phone: "+380631236066", totalVisits: 4, lastVisitDate: getDateInPast(45), email: "m.bondar@example.com", source: "referral" },
  { id: "hcli-7", fullName: "ТОВ «КиївБудIT»", phone: "+380501237077", totalVisits: 11, lastVisitDate: getDateInPast(2), notes: "Корпоративні відрядження", tags: ["B2B"], source: "referral" },
  { id: "hcli-8", fullName: "Гордієнко Наталія Андріївна", phone: "+380504001008", totalVisits: 2, lastVisitDate: getDateInPast(60), source: "ad" },
  { id: "hcli-9", fullName: "Smith John (UK)", phone: "+447701123009", totalVisits: 1, lastVisitDate: getDateInPast(12), email: "j.smith@example.com", notes: "Англомовний гість", tags: ["foreign"], source: "online" },
  { id: "hcli-10", fullName: "Müller Hans (DE)", phone: "+491721234010", totalVisits: 2, lastVisitDate: getDateInPast(38), email: "h.muller@example.de", tags: ["foreign"], source: "online" },
  { id: "hcli-11", fullName: "Тимошенко Вікторія Олександрівна", phone: "+380675002011", totalVisits: 5, lastVisitDate: getDateInPast(9), source: "walk-in" },
  { id: "hcli-12", fullName: "Костенко Олег Володимирович", phone: "+380636003012", totalVisits: 7, lastVisitDate: getDateInPast(6), isVip: true, email: "kostenko@example.com", tags: ["VIP", "сімейний"], source: "referral" },
  { id: "hcli-13", fullName: "Литвиненко Тетяна Петрівна", phone: "+380507004013", totalVisits: 3, lastVisitDate: getDateInPast(18), source: "online" },
  { id: "hcli-14", fullName: "Романенко Софія Сергіївна", phone: "+380678005014", totalVisits: 2, lastVisitDate: getDateInPast(55), source: "ad" },
  { id: "hcli-15", fullName: "Власенко Олена Андріївна", phone: "+380639006015", totalVisits: 4, lastVisitDate: getDateInPast(11), email: "vlasenko@example.com", source: "online" },
  { id: "hcli-16", fullName: "Гаврилюк Максим Олегович", phone: "+380501007016", totalVisits: 6, lastVisitDate: getDateInPast(7), source: "walk-in" },
  { id: "hcli-17", fullName: "ТОВ «Український Експорт»", phone: "+380672008017", totalVisits: 9, lastVisitDate: getDateInPast(3), notes: "Делегації клієнтів", tags: ["B2B"], source: "referral" },
  { id: "hcli-18", fullName: "Чорна Олександра Володимирівна", phone: "+380633009018", totalVisits: 3, lastVisitDate: getDateInPast(28), source: "online" },
  { id: "hcli-19", fullName: "Морозенко Інна Петрівна", phone: "+380504000019", totalVisits: 2, lastVisitDate: getDateInPast(40), source: "walk-in" },
  { id: "hcli-20", fullName: "Бойко Олег Сергійович", phone: "+380678000020", totalVisits: 5, lastVisitDate: getDateInPast(16), email: "boyko@example.com", source: "online" },
  { id: "hcli-21", fullName: "Денисенко Юлія Олегівна", phone: "+380636001021", totalVisits: 4, lastVisitDate: getDateInPast(24), source: "referral" },
  { id: "hcli-22", fullName: "Левченко Олександр Михайлович", phone: "+380507002022", totalVisits: 3, lastVisitDate: getDateInPast(33), source: "walk-in" },
  { id: "hcli-23", fullName: "Білоус Катерина Сергіївна", phone: "+380678003023", totalVisits: 7, lastVisitDate: getDateInPast(5), email: "bilous@example.com", tags: ["сімейний"], source: "online" },
  { id: "hcli-24", fullName: "Захарченко Євгенія Михайлівна", phone: "+380639004024", totalVisits: 2, lastVisitDate: getDateInPast(50), source: "ad" },
];

// ============================================
// BOOKINGS — генеруємо ~180 минулих + 22 майбутніх
// ============================================

function generateBookings(): SalonBooking[] {
  const out: SalonBooking[] = [];
  let id = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const standardRooms = hotelRooms.filter((r) => r.roomCategory === "standard");
  const superiorRooms = hotelRooms.filter((r) => r.roomCategory === "superior");
  const jsuiteRooms = hotelRooms.filter((r) => r.roomCategory === "junior_suite");
  const suiteRooms = hotelRooms.filter((r) => r.roomCategory === "suite");

  type Mix = { rooms: SalonWorkstation[]; svc: string; weight: number };
  const mix: Mix[] = [
    { rooms: standardRooms, svc: "hsvc-stay-std", weight: 60 },
    { rooms: superiorRooms, svc: "hsvc-stay-sup", weight: 25 },
    { rooms: jsuiteRooms, svc: "hsvc-stay-jsuite", weight: 10 },
    { rooms: suiteRooms, svc: "hsvc-stay-suite", weight: 5 },
  ];
  const weighted: Mix[] = [];
  for (const m of mix) for (let w = 0; w < m.weight; w++) weighted.push(m);

  function pickRoom(m: Mix, key: number): SalonWorkstation {
    return m.rooms[key % m.rooms.length];
  }

  function mkBooking(
    startOffset: number,
    nights: number,
    m: Mix,
    clientIdx: number,
    statusOverride?: BookingStatus,
  ): SalonBooking {
    const room = pickRoom(m, id);
    const svc = hotelServices.find((s) => s.id === m.svc)!;
    const totalPrice = svc.price * nights;
    const start = new Date(today);
    start.setDate(start.getDate() + startOffset);
    const end = new Date(start);
    end.setDate(end.getDate() + nights);
    const dateIso = start.toISOString().split("T")[0];
    const endIso = end.toISOString().split("T")[0];

    let status: BookingStatus;
    let paymentMethod: BookingPaymentMethod | undefined;
    if (statusOverride) {
      status = statusOverride;
    } else if (startOffset + nights <= 0) {
      const r = (id * 41) % 100;
      if (r < 92) status = "done";
      else if (r < 96) status = "no-show";
      else status = "canceled";
    } else if (startOffset <= 0) {
      status = "confirmed"; // currently staying
    } else {
      status = id % 4 === 0 ? "scheduled" : "confirmed";
    }
    if (status === "done") {
      const r = (id * 17) % 100;
      paymentMethod = r < 60 ? "card" : r < 90 ? "cash" : "transfer";
    }

    const guestsCount = Math.min(
      (room.roomCapacity ?? 2),
      1 + ((id + clientIdx) % 2) + ((id % 7 === 0) ? 1 : 0),
    );

    return {
      id: `hbk-${String(id++).padStart(4, "0")}`,
      date: dateIso,
      startTime: "14:00",
      durationMin: nights * 1440,
      clientId: hotelClients[clientIdx % hotelClients.length].id,
      masterId: "h-room-direct", // готель: гість бронює номер напряму, без майстра
      workstationId: room.id,
      serviceIds: [svc.id],
      totalPrice,
      commissionAmount: 0,
      status,
      paymentMethod,
      prroCheckId: status === "done" && paymentMethod !== "transfer" ? `prro-h-${id}` : undefined,
      salonCabinetId: CABINET_ID,
      origin: "salon",
      revenueOwner: "salon",
      endDate: endIso,
      nights,
      guestsCount,
      checkInTime: "14:00",
      checkOutTime: "12:00",
    };
  }

  // Минулі 90 днів — ~2 нові заїзди/день
  for (let offset = -90; offset <= -1; offset++) {
    const arrivalsThisDay = 2 + ((offset * 7) % 3);
    for (let i = 0; i < arrivalsThisDay; i++) {
      const m = weighted[(i + Math.abs(offset)) % weighted.length];
      const nights = 1 + ((i + Math.abs(offset)) % 5); // 1..5 ночей
      const clientIdx = (i * 3 + Math.abs(offset)) % hotelClients.length;
      out.push(mkBooking(offset, nights, m, clientIdx));
    }
  }

  // Сьогодні + 45 днів — майбутні брони
  for (let offset = 0; offset <= 45; offset++) {
    const arrivalsThisDay = offset < 14 ? 2 : offset < 30 ? 1 : 0;
    for (let i = 0; i < arrivalsThisDay; i++) {
      if (out.filter((b) => b.date > new Date().toISOString().slice(0, 10)).length > 22) break;
      const m = weighted[(i + offset + 11) % weighted.length];
      const nights = 1 + ((i + offset) % 4);
      const clientIdx = (i * 5 + offset) % hotelClients.length;
      out.push(mkBooking(offset, nights, m, clientIdx));
    }
  }

  return out;
}

export const hotelBookings: SalonBooking[] = generateBookings();

// ============================================
// EMPLOYEES — 9 штатних
// ============================================

export const hotelEmployees: Employee[] = [
  // 4 прибиральниці
  ...["Іщенко Марія Петрівна", "Гончарук Оксана Іванівна", "Бойчук Лариса Михайлівна", "Дяченко Олена Сергіївна"].map((name, i) => ({
    id: `emp-hotel-hk-${i + 1}`,
    cabinetId: CABINET_ID,
    fullName: name,
    position: "Прибиральниця (housekeeping)",
    contractType: "labor" as const,
    status: "active" as const,
    startDate: "2024-03-01",
    employmentMode: "full-time" as const,
    fte: 1,
    schedule: i < 2 ? "Пн–Сб 8:00–16:00 (зміна А)" : "Пн–Сб 12:00–20:00 (зміна Б)",
    location: "office" as const,
    contractNumber: `ТД-2024-H${i + 1}`,
    contractDate: "2024-03-01",
    militaryStatus: "not-applicable" as const,
  })),
  // 2 технічні майстри (ремонт/обслуговування)
  {
    id: "emp-hotel-tech-1",
    cabinetId: CABINET_ID,
    fullName: "Кравченко Андрій Володимирович",
    position: "Технічний майстер (сантехнік)",
    contractType: "labor",
    status: "active",
    startDate: "2024-02-01",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Пн–Пт 9:00–18:00 (черговий по виклику)",
    location: "office",
    contractNumber: "ТД-2024-H5",
    contractDate: "2024-02-01",
    militaryStatus: "liable",
  },
  {
    id: "emp-hotel-tech-2",
    cabinetId: CABINET_ID,
    fullName: "Сиротенко Дмитро Олегович",
    position: "Технічний майстер (електрик)",
    contractType: "labor",
    status: "active",
    startDate: "2024-04-15",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Вт–Сб 9:00–18:00 (черговий по виклику)",
    location: "office",
    contractNumber: "ТД-2024-H6",
    contractDate: "2024-04-15",
    militaryStatus: "liable",
  },
  // 2 адміністратори ресепшн (24/7 у 2 зміни)
  {
    id: "emp-hotel-rec-1",
    cabinetId: CABINET_ID,
    fullName: "Лисенко Аліна Петрівна",
    position: "Адміністратор ресепшн (зміна 1)",
    contractType: "labor",
    status: "active",
    startDate: "2024-01-15",
    employmentMode: "full-time",
    fte: 1,
    schedule: "2/2 · 8:00–20:00",
    location: "office",
    contractNumber: "ТД-2024-H7",
    contractDate: "2024-01-15",
    militaryStatus: "not-applicable",
  },
  {
    id: "emp-hotel-rec-2",
    cabinetId: CABINET_ID,
    fullName: "Романенко Тарас Михайлович",
    position: "Адміністратор ресепшн (нічна зміна)",
    contractType: "labor",
    status: "active",
    startDate: "2024-01-15",
    employmentMode: "full-time",
    fte: 1,
    schedule: "2/2 · 20:00–8:00",
    location: "office",
    contractNumber: "ТД-2024-H8",
    contractDate: "2024-01-15",
    militaryStatus: "liable",
  },
  // 1 керівник
  {
    id: "emp-hotel-mgr",
    cabinetId: CABINET_ID,
    fullName: "Шевчук Ірина Олегівна",
    position: "Керівник готелю",
    contractType: "labor",
    status: "active",
    startDate: "2023-09-01",
    employmentMode: "full-time",
    fte: 1,
    schedule: "Пн–Пт 9:00–18:00",
    location: "office",
    contractNumber: "ТД-2023-H0",
    contractDate: "2023-09-01",
    militaryStatus: "not-applicable",
  },
];

// ============================================
// CONTRACTORS — 1 ФОП-прибиральниця + 8 постачальників
// ============================================

export const hotelContractors: Contractor[] = [
  {
    id: "c-hotel-cleaner-fop",
    name: "ФОП Музика Олена (Клінінг)",
    fullName: "Фізична особа-підприємець Музика Олена Іванівна",
    code: "2987654321",
    iban: "UA743052990000026004000099913",
    ibanConfirmed: true,
    phone: "+380674445566",
    type: "fop",
    role: "supplier",
    taxStatus: "Платник ЄП 2 група",
    isSynced: true,
    status: "active",
    tags: ["fop-cleaning"],
    notes: "ФОП-прибиральниця за договором ЦПХ — погодинна оплата, додаткові виклики у пікові дні (вихідні, заїзди VIP).",
    createdAt: "2024-05-01",
  },
  { id: "c-hotel-laundry", name: "ТОВ «Hotel Laundry Service»", fullName: "ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «HOTEL LAUNDRY SERVICE»", code: "41887766", iban: "UA653052990000026007000099801", ibanConfirmed: true, type: "legal", role: "supplier", taxStatus: "Платник ПДВ", isSynced: true, status: "active", notes: "Прання постільної білизни, рушників, халатів (за кг)", createdAt: "2023-09-15" },
  { id: "c-hotel-linen", name: "ТОВ «TextilePro Україна»", code: "41223344", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Постільна білизна, рушники, халати, тапочки (закупки 2-4×/рік)", createdAt: "2023-09-15" },
  { id: "c-hotel-chemicals", name: "ТОВ «Ecolab UA»", code: "41334455", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Хімія, мийні засоби, дезінфектори", createdAt: "2023-09-15" },
  { id: "c-hotel-coffee", name: "ТОВ «BeanLab Coffee»", code: "42558899", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Кава, чай для сніданку та номерів", createdAt: "2024-01-10" },
  { id: "c-hotel-food", name: "ТОВ «FreshDistrib»", code: "41998877", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Свіжі продукти для сніданку «шведський стіл»", createdAt: "2023-09-15" },
  { id: "c-hotel-utility", name: "ПрАТ «ДТЕК Київські електромережі»", code: "00131305", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Електроенергія", createdAt: "2023-09-01" },
  { id: "c-hotel-rent", name: "ТОВ «Затишок Property»", code: "41776655", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Оренда будівлі готелю", createdAt: "2023-09-01" },
  { id: "c-hotel-security", name: "ТОВ «Securitas Україна»", code: "30457112", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Охорона + відеонагляд 24/7", createdAt: "2023-09-01" },
];

// ============================================
// INCOME — від виконаних бронювань
// ============================================

function generateIncomeFromBookings(): IncomeBookRecord[] {
  const done = hotelBookings.filter((b) => b.status === "done");
  return done.map((b, idx) => {
    const client = hotelClients.find((c) => c.id === b.clientId);
    const svc = hotelServices.find((s) => s.id === b.serviceIds[0]);
    const isTransfer = b.paymentMethod === "transfer";
    return {
      id: `inc-hotel-${String(idx + 1).padStart(4, "0")}`,
      date: b.date,
      description: `${svc?.name ?? "Проживання"} · ${b.nights ?? 1} ноч.${client ? ` · ${client.fullName.split(" ").slice(0, 2).join(" ")}` : ""}`,
      contractor: client?.fullName,
      amount: b.totalPrice,
      inIncomeBook: b.totalPrice,
      paymentType: isTransfer ? "transfer" : b.paymentMethod === "cash" ? "cash" : "card",
      source: isTransfer ? "monobank" : "prro",
      status: "income",
    } as IncomeBookRecord;
  });
}

export const hotelIncomeRecords: IncomeBookRecord[] = generateIncomeFromBookings();

// ============================================
// TAX PAYMENTS
// ============================================

const Q1_INCOME_H = hotelIncomeRecords
  .filter((r) => {
    const m = parseInt(r.date.slice(5, 7), 10);
    return m >= 1 && m <= 3;
  })
  .reduce((s, r) => s + r.amount, 0);

export const hotelTaxPayments: TaxPayment[] = [
  {
    id: "tax-hotel-ep-q1",
    cabinetId: CABINET_ID,
    taxType: "ep",
    taxTypeLabel: "Єдиний податок 5%",
    period: "I квартал 2026",
    year: 2026,
    quarter: 1,
    amountToPay: Math.round((Q1_INCOME_H || 1_400_000) * 0.05),
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2026-05-20",
    createdAt: getDateInPast(2),
    taxRate: 5,
    calculatedFromIncome: Q1_INCOME_H || 1_400_000,
  },
  {
    id: "tax-hotel-esv-q1",
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
    id: "tax-hotel-pdfo-mar",
    cabinetId: CABINET_ID,
    taxType: "pdfo",
    taxTypeLabel: "ПДФО з ЗП",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 24840, // 18% × 138 000 (брутто 9 працівників)
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-10",
    paidDate: "2026-04-08",
    paidAmount: 24840,
    createdAt: "2026-04-01",
  },
  {
    id: "tax-hotel-vz-mar",
    cabinetId: CABINET_ID,
    taxType: "military",
    taxTypeLabel: "Військовий збір з ЗП",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 6900,
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-10",
    paidDate: "2026-04-08",
    paidAmount: 6900,
    createdAt: "2026-04-01",
  },
  {
    id: "tax-hotel-esv-emp-mar",
    cabinetId: CABINET_ID,
    taxType: "esv-employer",
    taxTypeLabel: "ЄСВ роботодавця",
    period: "Березень 2026",
    year: 2026,
    month: 3,
    amountToPay: 30360, // 22% × 138 000
    status: "paid",
    statusLabel: "Сплачено",
    deadline: "2026-04-22",
    paidDate: "2026-04-20",
    paidAmount: 30360,
    createdAt: "2026-04-01",
  },
];

// ============================================
// CONTRACTOR PAYMENTS — оренда, прачка, прибирання, комуналка
// ============================================

export const hotelContractorPayments: ContractorPayment[] = [
  {
    id: "pay-hotel-rent-apr",
    cabinetId: CABINET_ID,
    date: "2026-04-05",
    contractor: "ТОВ «Затишок Property»",
    contractorId: "c-hotel-rent",
    contractorCode: "41776655",
    purpose: "Оренда будівлі готелю за квітень 2026",
    amount: 285000,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "rent",
  },
  {
    id: "pay-hotel-rent-may",
    cabinetId: CABINET_ID,
    date: "2026-05-05",
    contractor: "ТОВ «Затишок Property»",
    contractorId: "c-hotel-rent",
    contractorCode: "41776655",
    purpose: "Оренда будівлі готелю за травень 2026",
    amount: 285000,
    status: "scheduled",
    statusLabel: "Заплановано",
    paymentPurposeType: "rent",
  },
  {
    id: "pay-hotel-laundry-apr",
    cabinetId: CABINET_ID,
    date: "2026-04-12",
    contractor: "ТОВ «Hotel Laundry Service»",
    contractorId: "c-hotel-laundry",
    purpose: "Прання білизни і халатів, квітень 2026 (28 кг/добу)",
    amount: 18400,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-hotel-clean-fop-apr",
    cabinetId: CABINET_ID,
    date: "2026-04-15",
    contractor: "ФОП Музика Олена (Клінінг)",
    contractorId: "c-hotel-cleaner-fop",
    purpose: "Виклики ФОП-прибиральниці у пікові дні (8 змін)",
    amount: 6400,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-hotel-utility-mar",
    cabinetId: CABINET_ID,
    date: getDateInPast(8),
    contractor: "ПрАТ «ДТЕК Київські електромережі»",
    contractorId: "c-hotel-utility",
    purpose: "Електроенергія, березень 2026",
    amount: 28450,
    status: "paid",
    statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-hotel-security-mar",
    cabinetId: CABINET_ID,
    date: getDateInPast(6),
    contractor: "ТОВ «Securitas Україна»",
    contractorId: "c-hotel-security",
    purpose: "Охорона + відеонагляд, березень 2026",
    amount: 22000,
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
  "emp-hotel-hk-1": 12000,
  "emp-hotel-hk-2": 12000,
  "emp-hotel-hk-3": 12000,
  "emp-hotel-hk-4": 12000,
  "emp-hotel-tech-1": 18000,
  "emp-hotel-tech-2": 18000,
  "emp-hotel-rec-1": 17000,
  "emp-hotel-rec-2": 18000, // нічна доплата
  "emp-hotel-mgr": 32000,
};

export const hotelSalaryPayments: SalaryPayment[] = [
  ...hotelEmployees.map((e) => mkSalary(`sal-hotel-apr-${e.id}`, e, SAL_AMOUNTS[e.id] ?? 14000, SAL_PERIOD_CURR, "scheduled", "2026-05-05")),
  ...hotelEmployees.map((e) => mkSalary(`sal-hotel-mar-${e.id}`, e, SAL_AMOUNTS[e.id] ?? 14000, SAL_PERIOD_PREV, "paid", "2026-04-05")),
];

// ============================================
// DOCUMENTS
// ============================================

export const hotelDocuments: Document[] = [
  {
    id: "doc-hotel-rent",
    ...CABINET_META,
    number: "ОРЕНДА-ZATYSHOK-2026",
    type: "rental-agreement",
    category: "contract",
    title: "Договір оренди будівлі готелю",
    date: "2026-01-01",
    dueDate: "2026-12-31",
    amount: 285000,
    currency: "UAH",
    contractor: { id: "c-hotel-rent", name: "ТОВ «Затишок Property»", code: "41776655" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2026-01-01T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2026-01-01T12:00:00Z",
    aiSummary: "Оренда 5-поверхової будівлі під готель, 30 номерів, 1 250 м². 285 000 ₴/міс, до 5 числа.",
  },
  {
    id: "doc-hotel-cph-clean",
    ...CABINET_META,
    number: "ЦПХ-2024-H001",
    type: "contract",
    category: "contract",
    title: "Договір ЦПХ з ФОП Музика О.І. (клінінг)",
    date: "2024-05-01",
    dueDate: "2026-12-31",
    amount: 0,
    currency: "UAH",
    contractor: { id: "c-hotel-cleaner-fop", name: "ФОП Музика Олена", code: "2987654321" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2024-05-01T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2024-05-01T12:00:00Z",
    aiSummary: "ЦПХ з ФОП-прибиральницею: погодинна оплата 200 ₴/год, виклики у пікові дні (заїзди, VIP, вихідні).",
  },
  {
    id: "doc-hotel-prro-rec",
    ...CABINET_META,
    number: "ПРРО-ZATYSHOK-REC",
    type: "other",
    category: "internal",
    title: "Реєстраційна заява ПРРО (Reception)",
    date: "2023-09-15",
    amount: 0,
    currency: "UAH",
    contractor: { id: "dps", name: "ДПС України", code: "39292197" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2023-09-15T08:00:00Z",
    createdBy: "contractor",
    updatedAt: "2023-09-15T12:00:00Z",
    aiSummary: "ПРРО Reception — реєстрація фіскальної каси готелю (проживання, mini-bar, послуги).",
  },
];

// ============================================
// REPORTS
// ============================================

export const hotelReports: Report[] = [
  {
    id: "rep-hotel-1df-q1",
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
    id: "rep-hotel-ep-q1",
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
    id: "rep-hotel-ep-2025",
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
