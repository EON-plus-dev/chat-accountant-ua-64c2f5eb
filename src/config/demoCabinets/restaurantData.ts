/**
 * RESTAURANT CABINET (demo-restaurant-3)
 * ФОП Шевченко О.І. — Ресторан «Смак», 3 група 5% без ПДВ.
 *
 * Команда: 2 кухарі штат + 1 кухар-ФОП (холодний цех),
 *          2 офіціанти штат + 2 офіціанти-ФОП (вечірні зміни),
 *          2 адміни штат (хост + менеджер залу).
 * Інфраструктура: 25 столиків (14 зал + 7 тераса + 4 VIP),
 *                 150 SKU (страви/напої/інгредієнти), 2 ПРРО (Зал + Кухня/Доставка),
 *                 власна служба доставки (3 курʼєри).
 *
 * Архітектурно ресторан = індустрія `restaurant`: повний набір модулів
 * (bookings + client_book + retail_prro + goods_sales + purchases + warehouse +
 * fixed_assets + delivery). Бронюємо столики через `SalonBooking` з категорією
 * `table_reservation`. Замовлення страв ідуть через універсальний `orders`-модуль.
 *
 * Персонал реалізований через `SalonMaster` (універсальний bookable-resource owner),
 * делегації — через `salonMasterDelegations`. У внутрішніх типах слова «master/салон»
 * лишаються, для ресторанного UI відображаємо як «персонал/ресторан».
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
} from "./salonData";
import { getDateInPast } from "./helpers";

const CABINET_ID = "demo-restaurant-3";
const CABINET_META = {
  cabinetId: CABINET_ID,
  cabinetName: "ФОП Шевченко О.І. (Смак)",
  cabinetCode: "3312345678",
};

// ============================================
// TABLES (workstations) — 25 столиків
// ============================================
// 14 зал (2/4/6 місць) + 7 тераса (2/4) + 4 VIP-кабінки (6–10)

function mkTable(
  id: string,
  name: string,
  seats: number,
  zone: "hall" | "terrace" | "vip",
  smoking = false,
): SalonWorkstation {
  return {
    id,
    name,
    kind: "restaurant_table",
    resourceKind: "table",
    seats,
    zone,
    smoking,
    allowedCategories: ["table_reservation", "event_booking"],
  };
}

export const restaurantTables: SalonWorkstation[] = [
  // Зал (14)
  mkTable("rt-h-01", "Стіл №1 (зал, біля вікна)", 2, "hall"),
  mkTable("rt-h-02", "Стіл №2 (зал)", 2, "hall"),
  mkTable("rt-h-03", "Стіл №3 (зал)", 4, "hall"),
  mkTable("rt-h-04", "Стіл №4 (зал)", 4, "hall"),
  mkTable("rt-h-05", "Стіл №5 (зал)", 4, "hall"),
  mkTable("rt-h-06", "Стіл №6 (зал)", 4, "hall"),
  mkTable("rt-h-07", "Стіл №7 (зал)", 6, "hall"),
  mkTable("rt-h-08", "Стіл №8 (зал, біля каміна)", 6, "hall"),
  mkTable("rt-h-09", "Стіл №9 (зал)", 4, "hall"),
  mkTable("rt-h-10", "Стіл №10 (зал)", 2, "hall"),
  mkTable("rt-h-11", "Стіл №11 (зал)", 2, "hall"),
  mkTable("rt-h-12", "Стіл №12 (зал)", 4, "hall"),
  mkTable("rt-h-13", "Стіл №13 (зал)", 4, "hall"),
  mkTable("rt-h-14", "Стіл №14 (зал)", 6, "hall"),
  // Тераса (7)
  mkTable("rt-t-01", "Тераса №1", 2, "terrace", true),
  mkTable("rt-t-02", "Тераса №2", 2, "terrace", true),
  mkTable("rt-t-03", "Тераса №3", 4, "terrace", true),
  mkTable("rt-t-04", "Тераса №4", 4, "terrace", true),
  mkTable("rt-t-05", "Тераса №5", 4, "terrace", false),
  mkTable("rt-t-06", "Тераса №6", 4, "terrace", false),
  mkTable("rt-t-07", "Тераса №7 (кутова)", 6, "terrace", false),
  // VIP (4)
  mkTable("rt-v-01", "VIP-кабінка «Карпати»", 6, "vip"),
  mkTable("rt-v-02", "VIP-кабінка «Дніпро»", 8, "vip"),
  mkTable("rt-v-03", "VIP-кабінка «Львів»", 8, "vip"),
  mkTable("rt-v-04", "VIP-кабінка «Одеса»", 10, "vip"),
];

// ============================================
// SERVICES (бронювання столиків + івенти)
// ============================================

export const restaurantServices: SalonService[] = [
  { id: "rsvc-tbl-2h", name: "Бронювання столика · 2 год", category: "table_reservation", durationMin: 120, price: 0, defaultCommissionPct: 0 },
  { id: "rsvc-tbl-3h", name: "Бронювання столика · 3 год", category: "table_reservation", durationMin: 180, price: 0, defaultCommissionPct: 0 },
  { id: "rsvc-event-corp", name: "Корпоратив (груповий)", category: "event_booking", durationMin: 240, price: 8000, defaultCommissionPct: 0 },
  { id: "rsvc-event-birthday", name: "Святкування Дня Народження", category: "event_booking", durationMin: 240, price: 3500, defaultCommissionPct: 0 },
  { id: "rsvc-event-wedding", name: "Романтична вечеря на двох (set-menu)", category: "event_booking", durationMin: 150, price: 2400, defaultCommissionPct: 0 },
];

// ============================================
// MENU — 150 позицій (категорії: starters/soups/mains/grill/pasta/desserts/drinks/wine/cocktails/sides)
// ============================================

export type DietaryTag = "vegan" | "vegetarian" | "gluten_free" | "lactose_free" | "halal" | "low_carb" | "high_protein";

export interface MenuItemModifier {
  id: string;
  label: string;
  required?: boolean;
  multi?: boolean;
  options: { id: string; label: string; priceDelta?: number }[];
}

export interface MenuItem {
  id: string;
  sku: string;
  name: string;
  category: "starters" | "soups" | "mains" | "grill" | "pasta" | "pizza" | "salads" | "desserts" | "drinks" | "wine" | "cocktails" | "beer" | "sides" | "kids";
  /** Ціна продажу клієнту, ₴ */
  price: number;
  /** Очікувана собівартість для маржі, ₴ */
  baseCost: number;
  /** Час приготування, хв */
  prepTimeMin: number;
  /** Чи доступна для доставки */
  availableDelivery: boolean;
  /** Опис для меню/віджета */
  description?: string;
  /** Алергени (короткі ярлики: "глютен", "лактоза", "горіхи"…) */
  allergens?: string[];
  /** Інгредієнти, які бачить клієнт */
  ingredients?: string[];
  /** Дієтичні позначки */
  dietary?: DietaryTag[];
  /** Гострота 0–3 */
  spicy?: 0 | 1 | 2 | 3;
  /** Калорійність порції, ккал */
  calories?: number;
  /** Стоп-лист (немає інгредієнтів) */
  stopList?: boolean;
  /** Чи це топ-позиція для віджета */
  isSignature?: boolean;
  /** Вибір шеф-кухаря */
  chefPick?: boolean;
  /** Популярна позиція (часто замовляють) */
  popular?: boolean;
  /** Модифікатори (прожарка, додатковий сир тощо) */
  modifiers?: MenuItemModifier[];
  unit: "шт" | "г" | "мл" | "порц";
  weight?: number;
}

function gen(
  prefix: string,
  cat: MenuItem["category"],
  items: Array<[string, number, number, number?, string?]>,
  unit: MenuItem["unit"] = "порц",
  availableDelivery = true,
): MenuItem[] {
  return items.map(([name, price, cost, prep, desc], i) => ({
    id: `${prefix}-${String(i + 1).padStart(2, "0")}`,
    sku: `${prefix.toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
    name,
    category: cat,
    price,
    baseCost: cost,
    prepTimeMin: prep ?? 15,
    availableDelivery,
    description: desc,
    unit,
  }));
}

export const restaurantMenu: MenuItem[] = [
  // STARTERS (15)
  ...gen("rm-st", "starters", [
    ["Хрустка брускета з томатами та базиліком", 180, 65, 8, "Артизанальний хліб, чері-томати, фіолетовий базилік, моцарела"],
    ["Сирне асорті (4 види, 200 г)", 380, 160, 5],
    ["Тартар з лосося", 420, 195, 12],
    ["Тартар з телятини", 460, 215, 12],
    ["Креветки темпура (8 шт)", 380, 180, 14],
    ["Карпачо з телятини", 380, 175, 10],
    ["Хумус з лавашем", 180, 50, 6],
    ["Бабагануш", 180, 55, 7],
    ["Закуска зі шпрот по-домашньому", 220, 75, 5],
    ["Маринований оселедець з картоплею", 240, 95, 10],
    ["Сало з домашньою гірчицею", 180, 60, 5],
    ["Карпачо з буряка та козячого сиру", 240, 95, 10],
    ["Грибна жульєн (порція)", 220, 80, 14],
    ["Сирні палички з журавлиною (6 шт)", 220, 80, 10],
    ["Овочеві чіпси з ароматною сіллю", 140, 35, 6],
  ]),
  // SOUPS (10)
  ...gen("rm-sp", "soups", [
    ["Борщ український з пампушками", 220, 75, 12, "Класичний рецепт із салом та часником"],
    ["Крем-суп з білих грибів", 240, 85, 14],
    ["Том-Ям з креветками", 320, 130, 16],
    ["Гарбузовий крем-суп з імбиром", 200, 70, 12],
    ["Уха зі стерляді", 320, 145, 18],
    ["Юшка курячий з лапшею", 180, 55, 14],
    ["Зелений борщ із щавлю", 200, 70, 14],
    ["Капусняк зі свининою", 220, 80, 14],
    ["Курячий бульйон з фрикадельками", 180, 60, 12],
    ["Окрошка на квасі (літня)", 180, 55, 8],
  ]),
  // SALADS (12)
  ...gen("rm-sa", "salads", [
    ["Цезар з куркою", 320, 130, 10],
    ["Цезар з креветками", 380, 165, 12],
    ["Грецький салат", 260, 95, 8],
    ["Нісуаз з тунцем", 340, 145, 12],
    ["Олів'є по-домашньому", 220, 85, 10],
    ["Селедка під шубою", 220, 85, 12],
    ["Капрезе з моцарелою", 260, 105, 8],
    ["Цитрусовий салат з білою рибою", 340, 145, 14],
    ["Теплий салат з печінкою індички", 320, 130, 14],
    ["Зелений салат з козячим сиром", 280, 110, 8],
    ["Салат з качкою та апельсином", 360, 150, 14],
    ["Веганський боул з кіноа", 280, 100, 10],
  ]),
  // MAINS (15)
  ...gen("rm-mn", "mains", [
    ["Куряча грудка з трюфельним пюре", 380, 155, 22],
    ["Телятина а-ля Беф-Строганов", 460, 200, 25],
    ["Качине філе з вишневим соусом", 540, 240, 22],
    ["Лосось гриль із спаржею", 580, 265, 18],
    ["Дорадо запечена цілком", 580, 270, 22],
    ["Сібас з овочами на парі", 580, 260, 20],
    ["Свинячі реберця в медовій глазурі", 460, 190, 28],
    ["Стейк зі свинини на кістці", 480, 210, 22],
    ["Кролик у вершковому соусі", 460, 200, 32],
    ["Голубці з телятиною", 320, 120, 30],
    ["Деруни зі сметаною та грибами", 240, 75, 18],
    ["Вареники з вишнею (10 шт)", 220, 70, 16],
    ["Вареники з картоплею та грибами", 220, 70, 16],
    ["Котлета по-київськи з пюре", 360, 145, 22],
    ["Печеня по-домашньому в горщику", 320, 125, 35],
  ]),
  // GRILL (12)
  ...gen("rm-gr", "grill", [
    ["Стейк Рібай (300 г) USDA", 1280, 620, 18],
    ["Стейк Філе-міньйон (250 г)", 1180, 580, 20],
    ["Стейк Стриплойн (300 г)", 1080, 540, 18],
    ["Стейк Томагавк (1.2 кг)", 3200, 1480, 28],
    ["Шашлик зі свинини (300 г)", 380, 145, 22],
    ["Шашлик з курки (300 г)", 320, 125, 22],
    ["Кебаб з баранини (250 г)", 460, 195, 24],
    ["Овочі на грилі (300 г)", 240, 85, 14],
    ["Свинячі ковбаски-гриль (300 г)", 320, 130, 18],
    ["Курячий шашлик з овочами", 320, 125, 20],
    ["Лосось на грилі (250 г)", 620, 285, 16],
    ["Тигрові креветки гриль (8 шт)", 480, 215, 14],
  ]),
  // PASTA (10)
  ...gen("rm-pa", "pasta", [
    ["Карбонара з беконом", 280, 105, 16],
    ["Болоньєзе з телятиною", 280, 105, 18],
    ["Феттучіні з лососем", 360, 155, 16],
    ["Песто з куркою", 280, 105, 14],
    ["4 сири з грушою", 280, 110, 14],
    ["Спагетті з морепродуктами", 420, 185, 18],
    ["Лазанья по-італійськи", 320, 125, 28],
    ["Феттучіні з трюфелем", 480, 215, 16],
    ["Спагеті з мідіями", 380, 175, 18],
    ["Веганська паста з овочами", 260, 90, 14],
  ]),
  // PIZZA (10)
  ...gen("rm-pz", "pizza", [
    ["Маргарита 32 см", 260, 95, 18],
    ["Пепероні 32 см", 320, 130, 18],
    ["4 сири 32 см", 340, 145, 18],
    ["Гавайська 32 см", 320, 130, 18],
    ["Карбонара 32 см", 340, 145, 18],
    ["Чотири м'яса 32 см", 380, 165, 20],
    ["Морепродукти 32 см", 420, 195, 22],
    ["Веганська 32 см", 320, 130, 18],
    ["Кальцоне з шинкою", 340, 145, 22],
    ["Дитяча піца (24 см)", 220, 90, 16],
  ]),
  // SIDES (8)
  ...gen("rm-sd", "sides", [
    ["Картопля фрі", 120, 40, 8],
    ["Картопля по-сільськи", 120, 40, 10],
    ["Картопляне пюре з трюфельною олією", 140, 55, 8],
    ["Овочі гриль", 180, 70, 12],
    ["Рис з овочами", 120, 45, 10],
    ["Печена картопля з розмарином", 140, 55, 14],
    ["Соус демі-гляс", 60, 18, 4],
    ["Хліб з трав'яним маслом", 80, 25, 5],
  ]),
  // DESSERTS (10)
  ...gen("rm-ds", "desserts", [
    ["Тірамісу класичне", 180, 65, 5],
    ["Чізкейк Нью-Йорк", 180, 65, 5],
    ["Шоколадний фондан", 200, 75, 10],
    ["Наполеон по-домашньому", 180, 60, 5],
    ["Медовик класичний", 180, 60, 5],
    ["Морозиво (3 кульки)", 140, 50, 4],
    ["Сирники зі сметаною та варенням", 200, 70, 12],
    ["Панна-кота з ягодами", 180, 65, 5],
    ["Брауні з горіхом і морозивом", 200, 70, 8],
    ["Профітролі з ванільним кремом", 180, 65, 6],
  ]),
  // KIDS (5)
  ...gen("rm-kd", "kids", [
    ["Курячі нагетси з картоплею (дит.)", 180, 60, 12],
    ["Спагетті з томатним соусом (дит.)", 180, 60, 14],
    ["Дитячі мілкшейки полуниця/банан/шоколад", 120, 35, 5],
    ["Дитячі панкейки з сиропом", 160, 50, 12],
    ["Курячий супчик з лапшою (дит.)", 140, 40, 12],
  ]),
  // DRINKS (15)
  ...gen("rm-dr", "drinks", [
    ["Кава Еспресо", 60, 18, 3],
    ["Капучіно", 80, 22, 4],
    ["Латте", 80, 22, 4],
    ["Американо", 70, 18, 3],
    ["Флет-уайт", 90, 25, 4],
    ["Чай чорний (чайник 0.5 л)", 90, 25, 5],
    ["Чай зелений (чайник 0.5 л)", 90, 25, 5],
    ["Чай фруктовий (чайник 0.5 л)", 110, 35, 6],
    ["Сік свіжовичавлений апельсин 250 мл", 140, 55, 4],
    ["Сік свіжовичавлений яблуко 250 мл", 120, 45, 4],
    ["Мінеральна вода Borjomi 0.5 л", 90, 35, 1],
    ["Coca-Cola 0.33 л", 80, 25, 1],
    ["Sprite 0.33 л", 80, 25, 1],
    ["Лимонад домашній 0.5 л", 140, 45, 5],
    ["Молочний коктейль (полуниця/банан/шоколад)", 140, 50, 5],
  ]),
  // COCKTAILS (10)
  ...gen("rm-ck", "cocktails", [
    ["Aperol Spritz", 220, 90, 4],
    ["Mojito класичний", 220, 85, 5],
    ["Negroni", 240, 100, 4],
    ["Whisky Sour", 240, 105, 5],
    ["Margarita", 240, 105, 5],
    ["Cosmopolitan", 240, 105, 5],
    ["Pina Colada", 240, 105, 5],
    ["Long Island Iced Tea", 280, 130, 5],
    ["Old Fashioned", 280, 130, 4],
    ["Безалкогольний Mojito", 180, 70, 5],
  ]),
  // WINE (10)
  ...gen("rm-wn", "wine", [
    ["Бокал червоного домашнього (180 мл)", 160, 70, 2],
    ["Бокал білого домашнього (180 мл)", 160, 70, 2],
    ["Бокал просекко (150 мл)", 220, 95, 2],
    ["Пляшка Chianti DOCG 0.75 л", 980, 480, 2],
    ["Пляшка Pinot Grigio 0.75 л", 880, 425, 2],
    ["Пляшка Prosecco 0.75 л", 1180, 565, 2],
    ["Пляшка Cabernet Sauvignon 0.75 л", 1280, 615, 2],
    ["Пляшка Sauvignon Blanc 0.75 л", 1080, 510, 2],
    ["Пляшка домашнього вина 1 л", 540, 240, 2],
    ["Глінтвейн 250 мл (сезонне)", 160, 60, 7],
  ]),
  // BEER (8)
  ...gen("rm-be", "beer", [
    ["Beer Lager 0.5 л (розливне)", 90, 30, 2],
    ["Beer IPA 0.5 л (крафт)", 140, 55, 2],
    ["Beer Pilsner 0.5 л (розливне)", 100, 35, 2],
    ["Heineken 0.33 л", 110, 45, 1],
    ["Stella Artois 0.33 л", 110, 45, 1],
    ["Corona Extra 0.33 л", 130, 55, 1],
    ["Сидр яблучний 0.5 л", 120, 50, 1],
    ["Сидр грушевий 0.5 л", 120, 50, 1],
  ]),
];

// Гарантуємо рівно 150 позицій
if (restaurantMenu.length !== 150) {
  // eslint-disable-next-line no-console
  console.warn(`Restaurant menu has ${restaurantMenu.length} items, expected 150`);
}

// Виділимо «фірмові» страви для віджета
const SIGNATURE_IDS = new Set(["rm-st-01", "rm-mn-04", "rm-mn-02", "rm-gr-01", "rm-pa-08", "rm-pz-06", "rm-ds-01", "rm-sp-01"]);
restaurantMenu.forEach((m) => {
  if (SIGNATURE_IDS.has(m.id)) m.isSignature = true;
});
// 2 позиції в стоп-листі для реалістичності
const STOP_IDS = new Set(["rm-gr-04", "rm-mn-05"]);
restaurantMenu.forEach((m) => {
  if (STOP_IDS.has(m.id)) m.stopList = true;
});

// ============================================
// STAFF (як SalonMaster) — 2+1 кухар + 2+2 офіціанти + 2 адміни
// ============================================

export const restaurantStaff: SalonMaster[] = [
  // === Кухарі ===
  {
    id: "rs-chef-1", fullName: "Гайдук Богдан Сергійович", shortName: "Богдан · шеф",
    type: "staff", masterCabinetId: "ind-chef-1",
    specialties: ["event_booking", "table_reservation"], employeeId: "emp-rest-1", commissionPct: 0,
    schedule: { workDays: [2, 3, 4, 5, 6], startHour: 10, endHour: 23 },
    color: "#DC2626", avatarInitials: "ГБ",
    preferredWorkstationIds: ["rt-v-01"],
    publicTitle: "Шеф-кухар · 16 років досвіду",
    experienceYears: 16, rating: 4.96, reviewsCount: 412, completedServices: 8400,
    bio: "Шеф-кухар «Смак». Спеціалізація — українська авторська і середземноморська кухня. Працював у Lvov Royal та Mistro.",
    languages: ["uk", "en"],
    badges: ["top_rated", "verified"],
  },
  {
    id: "rs-chef-2", fullName: "Москаленко Вікторія Петрівна", shortName: "Вікторія · су-шеф",
    type: "staff", masterCabinetId: "ind-chef-2",
    specialties: ["event_booking"], employeeId: "emp-rest-2", commissionPct: 0,
    schedule: { workDays: [1, 2, 3, 4, 5, 6, 0], startHour: 9, endHour: 22 },
    color: "#F97316", avatarInitials: "МВ",
    preferredWorkstationIds: ["rt-h-08"],
    publicTitle: "Су-шеф · гаряча кухня",
    experienceYears: 10, rating: 4.92, reviewsCount: 287, completedServices: 5240,
    bio: "Су-шеф гарячого цеху. Відповідає за стейки, м'ясо, рибу.",
    languages: ["uk"],
    badges: ["verified"],
  },
  {
    id: "rs-chef-3", fullName: "Левченко Олексій Володимирович", shortName: "Олексій · холодний цех",
    type: "fop", masterCabinetId: "ind-chef-3", fopCabinetId: "fop-chef-3",
    specialties: ["event_booking"], contractorId: "c-rest-chef-3", commissionPct: 0,
    schedule: { workDays: [1, 2, 3, 4, 5, 6], startHour: 9, endHour: 20 },
    color: "#16A34A", avatarInitials: "ЛО",
    preferredWorkstationIds: ["rt-h-09"],
    publicTitle: "Кухар холодного цеху · ФОП",
    experienceYears: 8, rating: 4.88, reviewsCount: 156, completedServices: 2980,
    bio: "Закуски, салати, тартари, карпачо. ФОП-партнер ресторану.",
    languages: ["uk"],
    badges: ["verified"],
  },
  // === Офіціанти ===
  {
    id: "rs-wait-1", fullName: "Шевченко Анна Олегівна", shortName: "Анна · офіціант",
    type: "staff", masterCabinetId: "ind-waiter-1",
    specialties: ["table_reservation"], employeeId: "emp-rest-3", commissionPct: 0,
    schedule: { workDays: [2, 3, 4, 5, 6, 0], startHour: 11, endHour: 23 },
    color: "#0EA5E9", avatarInitials: "ША",
    preferredWorkstationIds: ["rt-h-01"],
    publicTitle: "Старший офіціант · зал",
    experienceYears: 5, rating: 4.85, reviewsCount: 198, completedServices: 1840,
    languages: ["uk", "en"],
    badges: ["verified", "english_speaking"],
  },
  {
    id: "rs-wait-2", fullName: "Кравчук Олена Петрівна", shortName: "Олена · офіціант",
    type: "staff", masterCabinetId: "ind-waiter-2",
    specialties: ["table_reservation"], employeeId: "emp-rest-4", commissionPct: 0,
    schedule: { workDays: [1, 2, 4, 5, 6], startHour: 10, endHour: 22 },
    color: "#A855F7", avatarInitials: "КО",
    preferredWorkstationIds: ["rt-h-04"],
    publicTitle: "Офіціант · зал",
    experienceYears: 3, rating: 4.82, reviewsCount: 142, completedServices: 1320,
    languages: ["uk"],
    badges: ["verified"],
  },
  {
    id: "rs-wait-3", fullName: "Петренко Дмитро Іванович", shortName: "Дмитро · офіціант ФОП",
    type: "fop", masterCabinetId: "ind-waiter-3", fopCabinetId: "fop-waiter-3",
    specialties: ["table_reservation"], contractorId: "c-rest-wait-3", commissionPct: 10,
    schedule: { workDays: [3, 4, 5, 6, 0], startHour: 14, endHour: 23 },
    color: "#EC4899", avatarInitials: "ПД",
    preferredWorkstationIds: ["rt-v-02"],
    publicTitle: "Вечірній офіціант · VIP-зал · ФОП",
    experienceYears: 6, rating: 4.9, reviewsCount: 187, completedServices: 2120,
    languages: ["uk", "en"],
    badges: ["top_rated", "verified", "english_speaking"],
  },
  {
    id: "rs-wait-4", fullName: "Романюк Софія Михайлівна", shortName: "Софія · офіціант ФОП",
    type: "fop", masterCabinetId: "ind-waiter-4", fopCabinetId: "fop-waiter-4",
    specialties: ["table_reservation"], contractorId: "c-rest-wait-4", commissionPct: 10,
    schedule: { workDays: [2, 3, 4, 5, 6], startHour: 17, endHour: 23 },
    color: "#F59E0B", avatarInitials: "РС",
    preferredWorkstationIds: ["rt-t-03"],
    publicTitle: "Вечірній офіціант · тераса · ФОП",
    experienceYears: 4, rating: 4.86, reviewsCount: 134, completedServices: 1480,
    languages: ["uk", "en"],
    badges: ["verified", "english_speaking"],
  },
  // === Адміністратори ===
  {
    id: "rs-mgr-1", fullName: "Іванчук Тетяна Андріївна", shortName: "Тетяна · хост",
    type: "staff", masterCabinetId: "ind-mgr-1",
    specialties: ["table_reservation", "event_booking"], employeeId: "emp-rest-5", commissionPct: 0,
    schedule: { workDays: [1, 2, 3, 4, 5], startHour: 10, endHour: 19 },
    color: "#10B981", avatarInitials: "ІТ",
    preferredWorkstationIds: ["rt-h-01"],
    publicTitle: "Хост-менеджер залу",
    experienceYears: 7, rating: 4.9, reviewsCount: 0, completedServices: 0,
    languages: ["uk", "en"],
    badges: ["verified", "english_speaking"],
  },
  {
    id: "rs-mgr-2", fullName: "Бондар Олег Сергійович", shortName: "Олег · менеджер",
    type: "staff", masterCabinetId: "ind-mgr-2",
    specialties: ["table_reservation", "event_booking"], employeeId: "emp-rest-6", commissionPct: 0,
    schedule: { workDays: [2, 3, 4, 5, 6, 0], startHour: 14, endHour: 23 },
    color: "#6366F1", avatarInitials: "БО",
    preferredWorkstationIds: ["rt-h-08"],
    publicTitle: "Менеджер вечірньої зміни",
    experienceYears: 9, rating: 4.92, reviewsCount: 0, completedServices: 0,
    languages: ["uk", "en"],
    badges: ["verified", "english_speaking"],
  },
];

// ============================================
// CLIENTS (24)
// ============================================

export const restaurantClients: SalonClient[] = [
  { id: "rcli-1", fullName: "Гриценко Олександр Петрович", phone: "+380501112301", totalVisits: 38, lastVisitDate: getDateInPast(2), isVip: true, email: "grytsenko@example.com", bonusBalance: 1820, tags: ["VIP", "вечеря"], source: "referral" },
  { id: "rcli-2", fullName: "Литвин Ірина Михайлівна", phone: "+380672223402", totalVisits: 14, lastVisitDate: getDateInPast(4), email: "lytvyn@example.com", bonusBalance: 460, source: "online" },
  { id: "rcli-3", fullName: "Бондаренко Сергій Олегович", phone: "+380633334503", totalVisits: 22, lastVisitDate: getDateInPast(1), isVip: true, email: "bondarenko@example.com", bonusBalance: 980, tags: ["VIP", "вечеря"], source: "walk-in" },
  { id: "rcli-4", fullName: "Коваль Анна Іванівна", phone: "+380504445604", totalVisits: 7, lastVisitDate: getDateInPast(8), email: "kov.a@example.com", bonusBalance: 220, source: "ad" },
  { id: "rcli-5", fullName: "Мельник Олексій Сергійович", phone: "+380675556705", totalVisits: 16, lastVisitDate: getDateInPast(3), bonusBalance: 540, source: "online" },
  { id: "rcli-6", fullName: "Захарченко Юлія Володимирівна", phone: "+380636667806", totalVisits: 11, lastVisitDate: getDateInPast(5), email: "zakharchenko@example.com", bonusBalance: 360, source: "referral" },
  { id: "rcli-7", fullName: "ТОВ «Партнер Груп» (корпоратив)", phone: "+380507778907", totalVisits: 5, lastVisitDate: getDateInPast(12), notes: "Корпоративні вечері кварталу", bonusBalance: 0, tags: ["B2B"], source: "referral" },
  { id: "rcli-8", fullName: "Романенко Михайло Олегович", phone: "+380678889008", totalVisits: 9, lastVisitDate: getDateInPast(6), bonusBalance: 280, source: "walk-in" },
  { id: "rcli-9", fullName: "Шевчук Олена Петрівна", phone: "+380639990109", totalVisits: 26, lastVisitDate: getDateInPast(2), isVip: true, email: "shevchuk@example.com", bonusBalance: 1140, tags: ["VIP"], source: "referral" },
  { id: "rcli-10", fullName: "Гончар Андрій Володимирович", phone: "+380500001210", totalVisits: 12, lastVisitDate: getDateInPast(7), bonusBalance: 380, source: "online" },
  { id: "rcli-11", fullName: "Литвиненко Софія Андріївна", phone: "+380671112311", totalVisits: 8, lastVisitDate: getDateInPast(9), bonusBalance: 220, source: "ad" },
  { id: "rcli-12", fullName: "Кравченко Дмитро Сергійович", phone: "+380632223412", totalVisits: 19, lastVisitDate: getDateInPast(3), isVip: true, email: "kravchenko@example.com", bonusBalance: 740, tags: ["VIP", "пара"], source: "walk-in" },
  { id: "rcli-13", fullName: "Левченко Тетяна Іванівна", phone: "+380503334513", totalVisits: 6, lastVisitDate: getDateInPast(14), bonusBalance: 160, source: "ad" },
  { id: "rcli-14", fullName: "Бойко Анна Олегівна", phone: "+380674445614", totalVisits: 10, lastVisitDate: getDateInPast(5), bonusBalance: 280, source: "online" },
  { id: "rcli-15", fullName: "Кучер Олег Михайлович", phone: "+380635556715", totalVisits: 15, lastVisitDate: getDateInPast(4), email: "kucher@example.com", bonusBalance: 460, source: "referral" },
  { id: "rcli-16", fullName: "Лисенко Олена Володимирівна", phone: "+380506667816", totalVisits: 21, lastVisitDate: getDateInPast(2), isVip: true, email: "lysenko.o@example.com", bonusBalance: 860, tags: ["VIP"], source: "referral" },
  { id: "rcli-17", fullName: "Морозенко Вадим Олегович", phone: "+380677778917", totalVisits: 4, lastVisitDate: getDateInPast(18), bonusBalance: 100, source: "ad" },
  { id: "rcli-18", fullName: "Сидоренко Ірина Сергіївна", phone: "+380638889018", totalVisits: 13, lastVisitDate: getDateInPast(6), bonusBalance: 380, source: "online" },
  { id: "rcli-19", fullName: "Тимошенко Олександр Іванович", phone: "+380509990119", totalVisits: 17, lastVisitDate: getDateInPast(3), email: "tymoshenko@example.com", bonusBalance: 540, source: "referral" },
  { id: "rcli-20", fullName: "Денисенко Юлія Михайлівна", phone: "+380670001220", totalVisits: 8, lastVisitDate: getDateInPast(11), bonusBalance: 200, source: "online" },
  { id: "rcli-21", fullName: "Чорна Катерина Сергіївна", phone: "+380631112321", totalVisits: 11, lastVisitDate: getDateInPast(5), bonusBalance: 320, source: "walk-in" },
  { id: "rcli-22", fullName: "Гордієнко Андрій Олегович", phone: "+380502223422", totalVisits: 25, lastVisitDate: getDateInPast(2), isVip: true, email: "gordienko@example.com", bonusBalance: 980, tags: ["VIP", "пара"], source: "referral" },
  { id: "rcli-23", fullName: "Олійник Софія Володимирівна", phone: "+380673334523", totalVisits: 6, lastVisitDate: getDateInPast(13), bonusBalance: 160, source: "ad" },
  { id: "rcli-24", fullName: "Закревський Максим Іванович", phone: "+380634445624", totalVisits: 9, lastVisitDate: getDateInPast(7), bonusBalance: 240, source: "online" },
];

// ============================================
// BOOKINGS (бронювання столиків) — 60 днів історії + 14 майбутніх
// ============================================

function generateBookings(): SalonBooking[] {
  const out: SalonBooking[] = [];
  let id = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const times = ["12:00", "13:00", "14:00", "18:00", "19:00", "19:30", "20:00", "21:00"];
  const guestPool = [2, 2, 4, 4, 4, 6];

  const mk = (offset: number, time: string, clientIdx: number, tblIdx: number, statusOverride?: BookingStatus) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dateIso = d.toISOString().split("T")[0];
    const client = restaurantClients[clientIdx % restaurantClients.length];
    const table = restaurantTables[tblIdx % restaurantTables.length];
    const guests = guestPool[(id + offset) % guestPool.length];
    const svc = restaurantServices[0]; // дефолт — бронювання 2 год
    const avgCheckPerGuest = 480; // ₴
    const totalPrice = guests * avgCheckPerGuest;
    const manager = restaurantStaff.find((s) => s.id === (id % 2 === 0 ? "rs-mgr-1" : "rs-mgr-2"))!;

    let status: BookingStatus;
    let paymentMethod: BookingPaymentMethod | undefined;
    if (statusOverride) {
      status = statusOverride;
    } else if (offset < 0) {
      const r = (id * 41) % 100;
      if (r < 88) status = "done";
      else if (r < 94) status = "no-show";
      else status = "canceled";
    } else if (offset === 0) {
      status = id % 2 === 0 ? "confirmed" : "scheduled";
    } else {
      status = "scheduled";
    }
    if (status === "done") {
      const r = (id * 17) % 100;
      paymentMethod = r < 70 ? "card" : "cash";
    }

    return {
      id: `rbk-${String(id++).padStart(4, "0")}`,
      date: dateIso,
      startTime: time,
      durationMin: svc.durationMin,
      clientId: client.id,
      masterId: manager.id,
      workstationId: table.id,
      serviceIds: [svc.id],
      totalPrice: status === "done" ? totalPrice : 0,
      commissionAmount: 0,
      status,
      paymentMethod,
      prroCheckId: status === "done" && paymentMethod ? `prro-r-${id}` : undefined,
      notes: `${guests} гостей`,
      salonCabinetId: CABINET_ID,
      origin: "salon",
      revenueOwner: "salon",
    } satisfies SalonBooking;
  };

  for (let offset = -60; offset <= -1; offset++) {
    const dow = ((new Date(today).getDay() + offset) % 7 + 7) % 7;
    if (dow === 1) continue; // понеділок — вихідний
    const n = dow === 0 || dow === 6 ? 14 : 9;
    for (let i = 0; i < n; i++) {
      const t = times[(i + Math.abs(offset)) % times.length];
      out.push(mk(offset, t, i + Math.abs(offset), i + Math.abs(offset) * 3));
    }
  }
  for (let offset = 0; offset <= 14; offset++) {
    const dow = ((new Date(today).getDay() + offset) + 7) % 7;
    if (dow === 1) continue;
    const n = offset === 0 ? 11 : (dow === 0 || dow === 6 ? 9 : 5);
    for (let i = 0; i < n; i++) {
      const t = times[(i * 2 + offset) % times.length];
      out.push(mk(offset, t, i + offset * 2, i + offset * 5));
    }
  }
  return out;
}

export const restaurantBookings: SalonBooking[] = generateBookings();

// ============================================
// EMPLOYEES — 6 штатних (2 шеф/су-шеф + 2 офіціанти + 2 адміни)
// ============================================

export const restaurantEmployees: Employee[] = [
  {
    id: "emp-rest-1", cabinetId: CABINET_ID, fullName: "Гайдук Богдан Сергійович",
    position: "Шеф-кухар", contractType: "labor", status: "active",
    startDate: "2023-03-01", employmentMode: "full-time", fte: 1,
    schedule: "Вт–Сб 10:00–23:00", location: "office",
    contractNumber: "ТД-2023-R1", contractDate: "2023-03-01", militaryStatus: "liable",
  },
  {
    id: "emp-rest-2", cabinetId: CABINET_ID, fullName: "Москаленко Вікторія Петрівна",
    position: "Су-шеф (гаряча кухня)", contractType: "labor", status: "active",
    startDate: "2023-05-15", employmentMode: "full-time", fte: 1,
    schedule: "Пн–Нд (плаваюча) 9:00–22:00", location: "office",
    contractNumber: "ТД-2023-R2", contractDate: "2023-05-15", militaryStatus: "not-applicable",
  },
  {
    id: "emp-rest-3", cabinetId: CABINET_ID, fullName: "Шевченко Анна Олегівна",
    position: "Старший офіціант", contractType: "labor", status: "active",
    startDate: "2024-02-01", employmentMode: "full-time", fte: 1,
    schedule: "Вт–Нд 11:00–23:00", location: "office",
    contractNumber: "ТД-2024-R3", contractDate: "2024-02-01", militaryStatus: "not-applicable",
  },
  {
    id: "emp-rest-4", cabinetId: CABINET_ID, fullName: "Кравчук Олена Петрівна",
    position: "Офіціант", contractType: "labor", status: "active",
    startDate: "2024-06-01", employmentMode: "full-time", fte: 1,
    schedule: "Пн–Сб (без Сб) 10:00–22:00", location: "office",
    contractNumber: "ТД-2024-R4", contractDate: "2024-06-01", militaryStatus: "not-applicable",
  },
  {
    id: "emp-rest-5", cabinetId: CABINET_ID, fullName: "Іванчук Тетяна Андріївна",
    position: "Хост-менеджер залу", contractType: "labor", status: "active",
    startDate: "2023-09-01", employmentMode: "full-time", fte: 1,
    schedule: "Пн–Пт 10:00–19:00", location: "office",
    contractNumber: "ТД-2023-R5", contractDate: "2023-09-01", militaryStatus: "not-applicable",
  },
  {
    id: "emp-rest-6", cabinetId: CABINET_ID, fullName: "Бондар Олег Сергійович",
    position: "Менеджер вечірньої зміни", contractType: "labor", status: "active",
    startDate: "2023-04-10", employmentMode: "full-time", fte: 1,
    schedule: "Вт–Нд 14:00–23:00", location: "office",
    contractNumber: "ТД-2023-R6", contractDate: "2023-04-10", militaryStatus: "liable",
  },
];

// ============================================
// CONTRACTORS — 3 ФОП-персонал + 12 постачальників + сервіси
// ============================================

export const restaurantContractors: Contractor[] = [
  ...restaurantStaff
    .filter((m) => m.type === "fop")
    .map<Contractor>((m, idx) => ({
      id: m.contractorId!,
      name: `ФОП ${m.fullName.split(" ").slice(0, 2).join(" ")}`,
      fullName: `Фізична особа-підприємець ${m.fullName}`,
      code: `337654320${idx + 1}`,
      iban: `UA${50 + idx}305299000026004${String(3000 + idx).padStart(4, "0")}00003`,
      ibanConfirmed: true,
      phone: `+38067${(1112300 + idx * 11).toString().slice(0, 7)}`,
      type: "fop",
      role: "master",
      taxStatus: "Платник ЄП 3 група",
      isSynced: true,
      status: "active",
      tags: ["fop-restaurant"],
      notes: m.id.startsWith("rs-chef")
        ? "Кухар-партнер ресторану. Договір про надання послуг приготування їжі."
        : `Офіціант-партнер ресторану. Винагорода ${m.commissionPct}% від чека + чайові.`,
      createdAt: "2024-01-15",
    })),
  // Постачальники
  { id: "c-rest-rent", name: "ТОВ «Еталон Нерухомість»", fullName: "ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ «ЕТАЛОН НЕРУХОМІСТЬ»", code: "41334455", iban: "UA213052990000026007000088812", ibanConfirmed: true, type: "legal", role: "supplier", taxStatus: "Платник ПДВ", isSynced: true, status: "active", notes: "Оренда приміщення 320 м² (зал + кухня + склад)", createdAt: "2023-01-15" },
  { id: "c-rest-meat", name: "ТОВ «М'ясторг Преміум»", code: "32987654", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Преміум яловичина (USDA), свинина, баранина", createdAt: "2023-02-01" },
  { id: "c-rest-fish", name: "ТОВ «Океан-Фуд»", code: "31228899", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Свіжа риба і морепродукти (лосось, дорадо, креветки)", createdAt: "2023-02-01" },
  { id: "c-rest-veg", name: "ФОП Литвиненко (Овочі)", code: "2945001234", type: "fop", role: "supplier", isSynced: false, status: "active", notes: "Сезонні овочі і зелень з ферми", createdAt: "2023-03-10" },
  { id: "c-rest-dairy", name: "ТОВ «Молочна Долина»", code: "30557788", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Сири, сметана, масло, молоко", createdAt: "2023-02-15" },
  { id: "c-rest-bake", name: "ТОВ «Bake & Co»", code: "42223344", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Хліб, булочки, тістечка, дріжджі", createdAt: "2023-02-20" },
  { id: "c-rest-wine", name: "ТОВ «Винний Дім Україна»", code: "32445566", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Вина (Італія, Франція, Україна), просекко", createdAt: "2023-03-01" },
  { id: "c-rest-beer", name: "ТОВ «Крафтовий Лагер»", code: "42667788", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Розливне пиво, крафтові IPA, сидри", createdAt: "2023-03-15" },
  { id: "c-rest-bar", name: "ТОВ «Bartender's Supply»", code: "41889900", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Спіртні напої (віскі, джин, ром, лікери)", createdAt: "2023-04-01" },
  { id: "c-rest-bev", name: "ТОВ «Coca-Cola Україна»", code: "20071260", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Безалкогольні напої, мінеральна вода", createdAt: "2023-04-01" },
  { id: "c-rest-coffee", name: "ТОВ «BeanLab Coffee»", code: "42558899", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Зернова кава для бару", createdAt: "2023-04-15" },
  { id: "c-rest-utility", name: "ПрАТ «ДТЕК Київські електромережі»", code: "00131305", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Електроенергія", createdAt: "2023-01-15" },
  { id: "c-rest-gas", name: "АТ «Нафтогаз України»", code: "20077720", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Газ (кухня)", createdAt: "2023-01-15" },
  { id: "c-rest-clean", name: "ФОП Мельник (Клінінг)", code: "2956123456", type: "fop", role: "supplier", isSynced: false, status: "active", notes: "Прибирання залу + санстанція кухні", createdAt: "2023-02-01" },
  { id: "c-rest-pack", name: "ТОВ «EcoPack»", code: "42112233", type: "legal", role: "supplier", isSynced: true, status: "active", notes: "Упаковка для доставки (eco), серветки", createdAt: "2023-05-01" },
];

// ============================================
// INCOME — генеруємо з виконаних бронювань
// ============================================

function generateIncomeFromBookings(): IncomeBookRecord[] {
  const done = restaurantBookings.filter((b) => b.status === "done" && b.totalPrice > 0);
  return done.map((b, idx) => {
    const client = restaurantClients.find((c) => c.id === b.clientId);
    return {
      id: `inc-rest-${String(idx + 1).padStart(4, "0")}`,
      date: b.date,
      description: `Замовлення в ресторані${client ? ` · ${client.fullName.split(" ").slice(0, 2).join(" ")}` : ""}`,
      contractor: client?.fullName,
      amount: b.totalPrice,
      inIncomeBook: b.totalPrice,
      paymentType: b.paymentMethod === "cash" ? "cash" : "card",
      source: "prro",
      status: "income",
    } as IncomeBookRecord;
  });
}

export const restaurantIncomeRecords: IncomeBookRecord[] = generateIncomeFromBookings();

// ============================================
// TAX PAYMENTS
// ============================================

const Q1_INCOME_R = restaurantIncomeRecords
  .filter((r) => {
    const m = parseInt(r.date.slice(5, 7), 10);
    return m >= 1 && m <= 3;
  })
  .reduce((s, r) => s + r.amount, 0);

export const restaurantTaxPayments: TaxPayment[] = [
  {
    id: "tax-rest-ep-q1", cabinetId: CABINET_ID, taxType: "ep",
    taxTypeLabel: "Єдиний податок 5%", period: "I квартал 2026",
    year: 2026, quarter: 1,
    amountToPay: Math.round((Q1_INCOME_R || 1_700_000) * 0.05),
    status: "scheduled", statusLabel: "Заплановано",
    deadline: "2026-05-20", createdAt: getDateInPast(2),
    taxRate: 5, calculatedFromIncome: Q1_INCOME_R || 1_700_000,
  },
  {
    id: "tax-rest-esv-q1", cabinetId: CABINET_ID, taxType: "esv",
    taxTypeLabel: "ЄСВ ФОП (фіксований)", period: "I квартал 2026",
    year: 2026, quarter: 1, amountToPay: 5280,
    status: "scheduled", statusLabel: "Заплановано",
    deadline: "2026-04-22", createdAt: getDateInPast(2),
  },
  {
    id: "tax-rest-pdfo-mar", cabinetId: CABINET_ID, taxType: "pdfo",
    taxTypeLabel: "ПДФО з ЗП", period: "Березень 2026",
    year: 2026, month: 3, amountToPay: 24840, // 18% × 138 000 (6 штатних)
    status: "paid", statusLabel: "Сплачено",
    deadline: "2026-04-10", paidDate: "2026-04-08", paidAmount: 24840,
    createdAt: "2026-04-01",
  },
  {
    id: "tax-rest-vz-mar", cabinetId: CABINET_ID, taxType: "military",
    taxTypeLabel: "Військовий збір з ЗП", period: "Березень 2026",
    year: 2026, month: 3, amountToPay: 6900,
    status: "paid", statusLabel: "Сплачено",
    deadline: "2026-04-10", paidDate: "2026-04-08", paidAmount: 6900,
    createdAt: "2026-04-01",
  },
  {
    id: "tax-rest-esv-emp-mar", cabinetId: CABINET_ID, taxType: "esv-employer",
    taxTypeLabel: "ЄСВ роботодавця", period: "Березень 2026",
    year: 2026, month: 3, amountToPay: 30360, // 22% × 138 000
    status: "paid", statusLabel: "Сплачено",
    deadline: "2026-04-22", paidDate: "2026-04-20", paidAmount: 30360,
    createdAt: "2026-04-01",
  },
];

// ============================================
// CONTRACTOR PAYMENTS — ФОП-персонал + оренда + комунальні
// ============================================

export const restaurantContractorPayments: ContractorPayment[] = [
  {
    id: "pay-rest-chef-1", cabinetId: CABINET_ID, date: getDateInPast(5),
    contractor: "ФОП Левченко О.В.", contractorId: "c-rest-chef-3", contractorCode: "3376543201",
    purpose: "Послуги приготування холодних страв за квітень 2026",
    amount: 32000, status: "paid", statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-rest-wait-3", cabinetId: CABINET_ID, date: getDateInPast(3),
    contractor: "ФОП Петренко Д.І.", contractorId: "c-rest-wait-3", contractorCode: "3376543202",
    purpose: "Послуги обслуговування гостей (вечірні зміни, 22 зміни)",
    amount: 18500, status: "paid", statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-rest-wait-4", cabinetId: CABINET_ID, date: getDateInPast(2),
    contractor: "ФОП Романюк С.М.", contractorId: "c-rest-wait-4", contractorCode: "3376543203",
    purpose: "Послуги обслуговування гостей (тераса, 18 змін)",
    amount: 14800, status: "paid", statusLabel: "Сплачено",
    paymentPurposeType: "services",
  },
  {
    id: "pay-rest-rent-apr", cabinetId: CABINET_ID, date: "2026-04-05",
    contractor: "ТОВ «Еталон Нерухомість»", contractorId: "c-rest-rent", contractorCode: "41334455",
    purpose: "Оренда приміщення ресторану «Смак», квітень 2026",
    amount: 145000, status: "paid", statusLabel: "Сплачено",
    recipientIban: "UA213052990000026007000088812", paymentPurposeType: "rent",
  },
  {
    id: "pay-rest-rent-may", cabinetId: CABINET_ID, date: "2026-05-05",
    contractor: "ТОВ «Еталон Нерухомість»", contractorId: "c-rest-rent", contractorCode: "41334455",
    purpose: "Оренда приміщення ресторану «Смак», травень 2026",
    amount: 145000, status: "scheduled", statusLabel: "Заплановано",
    recipientIban: "UA213052990000026007000088812", paymentPurposeType: "rent",
  },
  {
    id: "pay-rest-utility", cabinetId: CABINET_ID, date: getDateInPast(7),
    contractor: "ПрАТ «ДТЕК Київські електромережі»", contractorId: "c-rest-utility",
    purpose: "Електроенергія, березень 2026", amount: 24300,
    status: "paid", statusLabel: "Сплачено", paymentPurposeType: "services",
  },
  {
    id: "pay-rest-gas", cabinetId: CABINET_ID, date: getDateInPast(7),
    contractor: "АТ «Нафтогаз України»", contractorId: "c-rest-gas",
    purpose: "Газ (кухня), березень 2026", amount: 18600,
    status: "paid", statusLabel: "Сплачено", paymentPurposeType: "services",
  },
  {
    id: "pay-rest-clean", cabinetId: CABINET_ID, date: getDateInPast(5),
    contractor: "ФОП Мельник (Клінінг)", contractorId: "c-rest-clean",
    purpose: "Прибирання залу + санстанція кухні, квітень 2026", amount: 11800,
    status: "paid", statusLabel: "Сплачено", paymentPurposeType: "services",
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
    id, cabinetId: CABINET_ID, employeeId: emp.id,
    employeeName: emp.fullName, employeePosition: emp.position,
    salaryType: "salary", salaryTypeLabel: "Зарплата",
    period, amount: net,
    status, statusLabel: status === "paid" ? "Сплачено" : "Заплановано",
    scheduledDate, paidDate: status === "paid" ? scheduledDate : undefined,
    source: "manual", grossAmount: gross,
    pdfoAmount: status === "scheduled" ? Math.round(gross * 0.18) : undefined,
    militaryTaxAmount: status === "scheduled" ? Math.round(gross * 0.052) : undefined,
    esvAmount: status === "scheduled" ? Math.round(gross * 0.22) : undefined,
  };
}

const SAL_AMOUNTS_R: Record<string, number> = {
  "emp-rest-1": 42000, // шеф
  "emp-rest-2": 28000, // су-шеф
  "emp-rest-3": 18000, // ст. офіціант
  "emp-rest-4": 14000, // офіціант
  "emp-rest-5": 22000, // хост-менеджер
  "emp-rest-6": 24000, // менеджер
};

export const restaurantSalaryPayments: SalaryPayment[] = [
  ...restaurantEmployees.map((e) => mkSalary(`sal-rest-apr-${e.id}`, e, SAL_AMOUNTS_R[e.id] ?? 18000, SAL_PERIOD_CURR, "scheduled", "2026-05-05")),
  ...restaurantEmployees.map((e) => mkSalary(`sal-rest-mar-${e.id}`, e, SAL_AMOUNTS_R[e.id] ?? 18000, SAL_PERIOD_PREV, "paid", "2026-04-05")),
];

// ============================================
// DOCUMENTS
// ============================================

export const restaurantDocuments: Document[] = [
  {
    id: "doc-rest-001", ...CABINET_META,
    number: "ОРЕНДА-СМАК-2026", type: "rental-agreement", category: "contract",
    title: "Договір оренди приміщення ресторану «Смак»",
    date: "2026-01-01", dueDate: "2026-12-31",
    amount: 145000, currency: "UAH",
    contractor: { id: "c-rest-rent", name: "ТОВ «Еталон Нерухомість»", code: "41334455" },
    status: "signed", retentionPeriod: 5,
    createdAt: "2026-01-01T08:00:00Z", createdBy: "contractor", updatedAt: "2026-01-01T12:00:00Z",
    aiSummary: "Оренда приміщення 320 м² (зал + кухня + склад). 145 000 ₴/міс, до 5 числа.",
  },
  ...restaurantStaff
    .filter((m) => m.type === "fop")
    .map<Document>((m, idx) => ({
      id: `doc-rest-cph-${idx + 1}`, ...CABINET_META,
      number: `ЦПХ-2026-R${String(idx + 1).padStart(3, "0")}`, type: "contract", category: "contract",
      title: `Договір ЦПХ з ${m.fullName.split(" ").slice(0, 2).join(" ")}`,
      date: "2026-01-15", dueDate: "2026-12-31",
      amount: 0, currency: "UAH",
      contractor: { id: m.contractorId!, name: `ФОП ${m.fullName.split(" ").slice(0, 2).join(" ")}`, code: `337654320${idx + 1}` },
      status: "signed", retentionPeriod: 5,
      createdAt: "2026-01-15T08:00:00Z", createdBy: "contractor", updatedAt: "2026-01-15T12:00:00Z",
      aiSummary: m.id.startsWith("rs-chef")
        ? `ЦПХ-договір з кухарем-ФОП. Послуги приготування страв.`
        : `ЦПХ-договір з офіціантом-ФОП. Винагорода ${m.commissionPct}% + чайові.`,
    })),
  {
    id: "doc-rest-prro-zal", ...CABINET_META,
    number: "ПРРО-СМАК-ZAL", type: "other", category: "internal",
    title: "Реєстраційна заява ПРРО (Зал)",
    date: "2023-02-15", amount: 0, currency: "UAH",
    contractor: { id: "dps", name: "ДПС України", code: "39292197" },
    status: "signed", retentionPeriod: 5,
    createdAt: "2023-02-15T08:00:00Z", createdBy: "contractor", updatedAt: "2023-02-15T12:00:00Z",
    aiSummary: "ПРРО Зал — реєстрація фіскальної каси для обслуговування столиків.",
  },
  {
    id: "doc-rest-prro-deliv", ...CABINET_META,
    number: "ПРРО-СМАК-DELIV", type: "other", category: "internal",
    title: "Реєстраційна заява ПРРО (Кухня / Доставка)",
    date: "2023-05-01", amount: 0, currency: "UAH",
    contractor: { id: "dps", name: "ДПС України", code: "39292197" },
    status: "signed", retentionPeriod: 5,
    createdAt: "2023-05-01T08:00:00Z", createdBy: "contractor", updatedAt: "2023-05-01T12:00:00Z",
    aiSummary: "ПРРО Кухня/Доставка — фіскальні чеки для онлайн-замовлень і доставки.",
  },
];

// ============================================
// REPORTS
// ============================================

export const restaurantReports: Report[] = [
  {
    id: "rep-rest-1df-q1", cabinetId: CABINET_ID, type: "1df",
    typeLabel: "1-ДФ / ЄСВ", name: "Об'єднана звітність 1-ДФ + ЄСВ за I кв.",
    period: "Q1", periodLabel: "I квартал 2026", year: 2026, quarter: 1,
    deadline: "2026-05-10", status: "review", statusLabel: "На перевірку",
    dataSources: ["employees"], fopGroup: 3,
  },
  {
    id: "rep-rest-ep-q1", cabinetId: CABINET_ID, type: "ep",
    typeLabel: "ЄП", name: "Декларація платника ЄП за I кв.",
    period: "Q1", periodLabel: "I квартал 2026", year: 2026, quarter: 1,
    deadline: "2026-05-10", status: "review", statusLabel: "На перевірку",
    dataSources: ["income-book"], fopGroup: 3,
  },
  {
    id: "rep-rest-ep-2025", cabinetId: CABINET_ID, type: "ep",
    typeLabel: "ЄП", name: "Декларація платника ЄП за 2025 рік",
    period: "year", periodLabel: "2025 рік", year: 2025,
    deadline: "2026-03-01", status: "submitted", statusLabel: "Подано",
    submittedDate: "2026-02-28", dataSources: ["income-book"], fopGroup: 3,
  },
];

// ============================================
// DELIVERIES — окрема сутність (не в Order, бо демо)
// ============================================

export type DeliveryStatus = "new" | "preparing" | "ready" | "in_transit" | "delivered" | "cancelled";
export type DeliveryChannel = "own_courier" | "pickup" | "glovo" | "bolt";

export interface RestaurantDelivery {
  id: string;
  orderNumber: string;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  customerName: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  deliveryFee: number;
  itemsCount: number;
  createdAt: string;
  /** Хвилин з моменту створення */
  ageMin: number;
  eta?: string;
  courierName?: string;
  paymentMethod: "cash" | "card" | "online";
  notes?: string;
}

function nowIso() {
  return new Date().toISOString();
}

function isoMinAgo(min: number): string {
  return new Date(Date.now() - min * 60_000).toISOString();
}

export const restaurantDeliveries: RestaurantDelivery[] = [
  {
    id: "del-001", orderNumber: "З-2026-04-217", channel: "own_courier",
    status: "in_transit", customerName: "Гриценко Олександр",
    customerPhone: "+380501112301", address: "вул. Хрещатик, 22, кв. 14",
    totalAmount: 1240, deliveryFee: 80, itemsCount: 4,
    createdAt: isoMinAgo(28), ageMin: 28, eta: "12 хв",
    courierName: "Курʼєр Іван", paymentMethod: "online",
    notes: "Без цибулі в борщі, подзвонити за 5 хв",
  },
  {
    id: "del-002", orderNumber: "З-2026-04-218", channel: "own_courier",
    status: "preparing", customerName: "Литвин Ірина",
    customerPhone: "+380672223402", address: "пров. Музейний, 8, оф. 305",
    totalAmount: 880, deliveryFee: 80, itemsCount: 3,
    createdAt: isoMinAgo(12), ageMin: 12, eta: "35 хв",
    paymentMethod: "card",
  },
  {
    id: "del-003", orderNumber: "З-2026-04-219", channel: "glovo",
    status: "ready", customerName: "Через Glovo",
    customerPhone: "+380000000000", address: "—",
    totalAmount: 720, deliveryFee: 0, itemsCount: 2,
    createdAt: isoMinAgo(22), ageMin: 22, eta: "Очікує курʼєра Glovo",
    paymentMethod: "online",
  },
  {
    id: "del-004", orderNumber: "З-2026-04-220", channel: "pickup",
    status: "ready", customerName: "Бондаренко Сергій",
    customerPhone: "+380633334503", address: "Самовивіз",
    totalAmount: 540, deliveryFee: 0, itemsCount: 2,
    createdAt: isoMinAgo(18), ageMin: 18, eta: "Готово до видачі",
    paymentMethod: "cash",
  },
  {
    id: "del-005", orderNumber: "З-2026-04-221", channel: "own_courier",
    status: "new", customerName: "Шевчук Олена",
    customerPhone: "+380639990109", address: "вул. Лесі Українки, 14, кв. 42",
    totalAmount: 1480, deliveryFee: 80, itemsCount: 5,
    createdAt: isoMinAgo(3), ageMin: 3, eta: "~45 хв",
    paymentMethod: "online",
    notes: "Подвійна порція картоплі",
  },
  {
    id: "del-006", orderNumber: "З-2026-04-222", channel: "bolt",
    status: "preparing", customerName: "Через Bolt Food",
    customerPhone: "+380000000000", address: "—",
    totalAmount: 980, deliveryFee: 0, itemsCount: 4,
    createdAt: isoMinAgo(8), ageMin: 8, eta: "20 хв",
    paymentMethod: "online",
  },
  {
    id: "del-007", orderNumber: "З-2026-04-215", channel: "own_courier",
    status: "delivered", customerName: "Кравченко Дмитро",
    customerPhone: "+380632223412", address: "вул. Володимирська, 51",
    totalAmount: 1640, deliveryFee: 80, itemsCount: 6,
    createdAt: isoMinAgo(95), ageMin: 95, eta: "Доставлено 32 хв",
    courierName: "Курʼєр Микола", paymentMethod: "online",
  },
  {
    id: "del-008", orderNumber: "З-2026-04-212", channel: "own_courier",
    status: "delivered", customerName: "Гордієнко Андрій",
    customerPhone: "+380502223422", address: "пр. Перемоги, 88",
    totalAmount: 2240, deliveryFee: 100, itemsCount: 7,
    createdAt: isoMinAgo(140), ageMin: 140, eta: "Доставлено 38 хв",
    courierName: "Курʼєр Іван", paymentMethod: "card",
  },
];

export const restaurantCouriers = [
  { id: "cour-1", name: "Курʼєр Іван", phone: "+380501119901", activeOrders: 1, todayDeliveries: 7, onTimePct: 96 },
  { id: "cour-2", name: "Курʼєр Микола", phone: "+380501119902", activeOrders: 0, todayDeliveries: 5, onTimePct: 92 },
  { id: "cour-3", name: "Курʼєр Олег", phone: "+380501119903", activeOrders: 0, todayDeliveries: 0, onTimePct: 88, status: "off" as const },
];
