/**
 * HOTEL NOMENCLATURE (demo-hotel-3) — 150 SKU:
 *   50 mini-bar (напої, снеки) — продаються через ПРРО Reception
 *   40 сніданок-меню (страви, кави, фреші) — у складі тарифу + à la carte
 *   25 SPA / косметика (шампунь, гель, набори)
 *   20 готельні товари (халати, тапочки, рушники, додаткові)
 *   15 сувеніри / тематичні товари
 *
 * Використовується як основа для `hotelOrdersData` (продукти/собівартість)
 * і для відображення в розділі «Номенклатура».
 */

import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";

type Seed = {
  id: string;
  sku: string;
  name: string;
  group: "minibar" | "breakfast" | "spa" | "supplies" | "souvenirs";
  category: string;
  unit: "шт" | "пач" | "мл" | "г";
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
};

const MINIBAR: Seed[] = [
  // Безалкогольні напої (15)
  { id: "h-mb-w1", sku: "MB-WATER-NS", name: "Вода негазована 0,5 л", group: "minibar", category: "Напої", unit: "шт", price: 60, cost: 14, stock: 300, minStock: 100, supplier: "BoneAqua" },
  { id: "h-mb-w2", sku: "MB-WATER-S", name: "Вода газована 0,5 л", group: "minibar", category: "Напої", unit: "шт", price: 60, cost: 14, stock: 240, minStock: 80, supplier: "BoneAqua" },
  { id: "h-mb-w3", sku: "MB-COLA-033", name: "Coca-Cola 0,33 л", group: "minibar", category: "Напої", unit: "шт", price: 80, cost: 22, stock: 180, minStock: 60, supplier: "Coca-Cola UA" },
  { id: "h-mb-w4", sku: "MB-COLA-ZERO", name: "Coca-Cola Zero 0,33 л", group: "minibar", category: "Напої", unit: "шт", price: 80, cost: 22, stock: 120, minStock: 40, supplier: "Coca-Cola UA" },
  { id: "h-mb-w5", sku: "MB-SPRITE", name: "Sprite 0,33 л", group: "minibar", category: "Напої", unit: "шт", price: 80, cost: 22, stock: 120, minStock: 40, supplier: "Coca-Cola UA" },
  { id: "h-mb-w6", sku: "MB-FANTA", name: "Fanta 0,33 л", group: "minibar", category: "Напої", unit: "шт", price: 80, cost: 22, stock: 96, minStock: 32, supplier: "Coca-Cola UA" },
  { id: "h-mb-w7", sku: "MB-JUICE-OR", name: "Сік апельсиновий Sandora 0,2 л", group: "minibar", category: "Напої", unit: "шт", price: 70, cost: 24, stock: 144, minStock: 48, supplier: "Sandora" },
  { id: "h-mb-w8", sku: "MB-JUICE-AP", name: "Сік яблучний Sandora 0,2 л", group: "minibar", category: "Напої", unit: "шт", price: 70, cost: 24, stock: 144, minStock: 48, supplier: "Sandora" },
  { id: "h-mb-w9", sku: "MB-JUICE-TM", name: "Сік томатний Sandora 0,2 л", group: "minibar", category: "Напої", unit: "шт", price: 70, cost: 24, stock: 96, minStock: 32, supplier: "Sandora" },
  { id: "h-mb-w10", sku: "MB-ICETEA", name: "Lipton Ice Tea 0,5 л", group: "minibar", category: "Напої", unit: "шт", price: 95, cost: 32, stock: 96, minStock: 36, supplier: "Coca-Cola UA" },
  { id: "h-mb-w11", sku: "MB-REDBULL", name: "Red Bull 0,25 л", group: "minibar", category: "Енергетики", unit: "шт", price: 180, cost: 75, stock: 60, minStock: 24, supplier: "Red Bull UA" },
  { id: "h-mb-w12", sku: "MB-MONSTER", name: "Monster Energy 0,5 л", group: "minibar", category: "Енергетики", unit: "шт", price: 180, cost: 78, stock: 48, minStock: 18, supplier: "Coca-Cola UA" },
  { id: "h-mb-w13", sku: "MB-PERRIER", name: "Perrier 0,33 л", group: "minibar", category: "Напої преміум", unit: "шт", price: 240, cost: 110, stock: 36, minStock: 12, supplier: "Nestle Waters" },
  { id: "h-mb-w14", sku: "MB-SANBEN", name: "San Benedetto 0,5 л", group: "minibar", category: "Напої преміум", unit: "шт", price: 180, cost: 70, stock: 48, minStock: 18, supplier: "Nestle Waters" },
  { id: "h-mb-w15", sku: "MB-MILK-CHOC", name: "Молочний коктейль шоколад 0,33 л", group: "minibar", category: "Напої", unit: "шт", price: 95, cost: 38, stock: 60, minStock: 20, supplier: "FreshDistrib" },
  // Пиво (5)
  { id: "h-mb-b1", sku: "MB-OBLN-033", name: "Оболонь 0,33 л", group: "minibar", category: "Пиво", unit: "шт", price: 120, cost: 38, stock: 72, minStock: 24, supplier: "Оболонь" },
  { id: "h-mb-b2", sku: "MB-CHRN-033", name: "Чернігівське 0,33 л", group: "minibar", category: "Пиво", unit: "шт", price: 120, cost: 40, stock: 72, minStock: 24, supplier: "Carlsberg UA" },
  { id: "h-mb-b3", sku: "MB-CORONA", name: "Corona Extra 0,33 л", group: "minibar", category: "Пиво", unit: "шт", price: 220, cost: 95, stock: 48, minStock: 18, supplier: "AB InBev UA" },
  { id: "h-mb-b4", sku: "MB-HEINEK", name: "Heineken 0,33 л", group: "minibar", category: "Пиво", unit: "шт", price: 210, cost: 90, stock: 48, minStock: 18, supplier: "Carlsberg UA" },
  { id: "h-mb-b5", sku: "MB-STELLA", name: "Stella Artois 0,33 л", group: "minibar", category: "Пиво", unit: "шт", price: 220, cost: 95, stock: 36, minStock: 12, supplier: "AB InBev UA" },
  // Вино / алкоголь (8)
  { id: "h-mb-a1", sku: "MB-WHITE-187", name: "Вино біле сухе Cricova 0,187 л", group: "minibar", category: "Алкоголь", unit: "шт", price: 280, cost: 130, stock: 36, minStock: 12, supplier: "Bayadera Group" },
  { id: "h-mb-a2", sku: "MB-RED-187", name: "Вино червоне сухе Cricova 0,187 л", group: "minibar", category: "Алкоголь", unit: "шт", price: 280, cost: 130, stock: 36, minStock: 12, supplier: "Bayadera Group" },
  { id: "h-mb-a3", sku: "MB-PROSEC-187", name: "Просекко 0,187 л", group: "minibar", category: "Алкоголь", unit: "шт", price: 380, cost: 180, stock: 24, minStock: 8, supplier: "Bayadera Group" },
  { id: "h-mb-a4", sku: "MB-VODKA-50", name: "Хортиця Платинум 50 мл", group: "minibar", category: "Алкоголь", unit: "шт", price: 90, cost: 35, stock: 60, minStock: 20, supplier: "GG Distribution" },
  { id: "h-mb-a5", sku: "MB-WHISKY-50", name: "Jameson 50 мл", group: "minibar", category: "Алкоголь", unit: "шт", price: 220, cost: 110, stock: 36, minStock: 12, supplier: "GG Distribution" },
  { id: "h-mb-a6", sku: "MB-COGNAC-50", name: "Hennessy VS 50 мл", group: "minibar", category: "Алкоголь", unit: "шт", price: 420, cost: 220, stock: 24, minStock: 8, supplier: "GG Distribution" },
  { id: "h-mb-a7", sku: "MB-GIN-50", name: "Bombay Sapphire 50 мл", group: "minibar", category: "Алкоголь", unit: "шт", price: 240, cost: 120, stock: 24, minStock: 8, supplier: "GG Distribution" },
  { id: "h-mb-a8", sku: "MB-TONIC", name: "Schweppes Tonic 0,2 л", group: "minibar", category: "Напої", unit: "шт", price: 90, cost: 32, stock: 60, minStock: 20, supplier: "Coca-Cola UA" },
  // Снеки солоні (10)
  { id: "h-mb-s1", sku: "MB-PRINGLES-S", name: "Pringles Original 40 г", group: "minibar", category: "Снеки", unit: "пач", price: 95, cost: 38, stock: 96, minStock: 36, supplier: "Mondelez UA" },
  { id: "h-mb-s2", sku: "MB-PRINGLES-C", name: "Pringles Cheese 40 г", group: "minibar", category: "Снеки", unit: "пач", price: 95, cost: 38, stock: 72, minStock: 24, supplier: "Mondelez UA" },
  { id: "h-mb-s3", sku: "MB-LAYS", name: "Lay's Sour Cream 30 г", group: "minibar", category: "Снеки", unit: "пач", price: 55, cost: 22, stock: 96, minStock: 36, supplier: "PepsiCo UA" },
  { id: "h-mb-s4", sku: "MB-PEANUTS", name: "Арахіс смажений солений 50 г", group: "minibar", category: "Снеки", unit: "пач", price: 75, cost: 28, stock: 84, minStock: 24, supplier: "NutsCo" },
  { id: "h-mb-s5", sku: "MB-PISTACH", name: "Фісташки солені 50 г", group: "minibar", category: "Снеки", unit: "пач", price: 180, cost: 85, stock: 60, minStock: 20, supplier: "NutsCo" },
  { id: "h-mb-s6", sku: "MB-CASHEW", name: "Кеш'ю смажене 50 г", group: "minibar", category: "Снеки", unit: "пач", price: 195, cost: 95, stock: 60, minStock: 20, supplier: "NutsCo" },
  { id: "h-mb-s7", sku: "MB-OLIVES", name: "Оливки в маслі 70 г", group: "minibar", category: "Снеки", unit: "пач", price: 120, cost: 55, stock: 48, minStock: 18, supplier: "FreshDistrib" },
  { id: "h-mb-s8", sku: "MB-CRACKERS", name: "Крекер сирний 60 г", group: "minibar", category: "Снеки", unit: "пач", price: 65, cost: 24, stock: 72, minStock: 24, supplier: "Бісквіт-Шоколад" },
  { id: "h-mb-s9", sku: "MB-JERKY", name: "В'ялена яловичина 30 г", group: "minibar", category: "Снеки", unit: "пач", price: 220, cost: 110, stock: 48, minStock: 18, supplier: "FreshDistrib" },
  { id: "h-mb-s10", sku: "MB-CHEESE", name: "Сирні палички 4×20 г", group: "minibar", category: "Снеки", unit: "пач", price: 130, cost: 58, stock: 60, minStock: 20, supplier: "FreshDistrib" },
  // Снеки солодкі (8)
  { id: "h-mb-d1", sku: "MB-KIT-KAT", name: "KitKat 45 г", group: "minibar", category: "Солодке", unit: "шт", price: 60, cost: 25, stock: 96, minStock: 36, supplier: "Nestle UA" },
  { id: "h-mb-d2", sku: "MB-SNICK", name: "Snickers 50 г", group: "minibar", category: "Солодке", unit: "шт", price: 60, cost: 25, stock: 96, minStock: 36, supplier: "Mars UA" },
  { id: "h-mb-d3", sku: "MB-MARS", name: "Mars 50 г", group: "minibar", category: "Солодке", unit: "шт", price: 60, cost: 25, stock: 72, minStock: 24, supplier: "Mars UA" },
  { id: "h-mb-d4", sku: "MB-TWIX", name: "Twix 50 г", group: "minibar", category: "Солодке", unit: "шт", price: 60, cost: 25, stock: 72, minStock: 24, supplier: "Mars UA" },
  { id: "h-mb-d5", sku: "MB-MILKA", name: "Milka Альпійський молочний 80 г", group: "minibar", category: "Солодке", unit: "шт", price: 130, cost: 58, stock: 48, minStock: 18, supplier: "Mondelez UA" },
  { id: "h-mb-d6", sku: "MB-RITTER", name: "Ritter Sport Marzipan 100 г", group: "minibar", category: "Солодке", unit: "шт", price: 180, cost: 95, stock: 36, minStock: 12, supplier: "Mondelez UA" },
  { id: "h-mb-d7", sku: "MB-PRINGLES-V", name: "Bounty 57 г", group: "minibar", category: "Солодке", unit: "шт", price: 80, cost: 32, stock: 60, minStock: 20, supplier: "Mars UA" },
  { id: "h-mb-d8", sku: "MB-OREO", name: "Oreo Mini 67 г", group: "minibar", category: "Солодке", unit: "пач", price: 90, cost: 38, stock: 48, minStock: 18, supplier: "Mondelez UA" },
  // Кава / чай в номер (4)
  { id: "h-mb-c1", sku: "MB-NESC-INST", name: "Nescafé Gold sachet 2 г", group: "minibar", category: "Гарячі напої", unit: "шт", price: 25, cost: 10, stock: 600, minStock: 200, supplier: "Nestle UA" },
  { id: "h-mb-c2", sku: "MB-TEA-BLK", name: "Чай чорний Greenfield (пакетик)", group: "minibar", category: "Гарячі напої", unit: "шт", price: 20, cost: 6, stock: 600, minStock: 200, supplier: "TeaHouse" },
  { id: "h-mb-c3", sku: "MB-TEA-GRN", name: "Чай зелений Greenfield (пакетик)", group: "minibar", category: "Гарячі напої", unit: "шт", price: 20, cost: 6, stock: 480, minStock: 160, supplier: "TeaHouse" },
  { id: "h-mb-c4", sku: "MB-SUGAR-STK", name: "Цукор стік 5 г", group: "minibar", category: "Гарячі напої", unit: "шт", price: 5, cost: 1, stock: 1200, minStock: 400, supplier: "TeaHouse" },
];

const BREAKFAST: Seed[] = [
  // Гарячі страви (10)
  { id: "h-br-h1", sku: "BR-OMLT-CL", name: "Омлет класичний", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 180, cost: 65, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h2", sku: "BR-OMLT-VG", name: "Омлет з овочами", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 220, cost: 85, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h3", sku: "BR-OMLT-HM", name: "Омлет з шинкою і сиром", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 260, cost: 110, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h4", sku: "BR-PANCK", name: "Млинці з джемом (3 шт)", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 180, cost: 60, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h5", sku: "BR-SYRN", name: "Сирники зі сметаною (3 шт)", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 220, cost: 75, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h6", sku: "BR-OATML", name: "Вівсянка з горіхами і ягодами", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 160, cost: 50, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h7", sku: "BR-EGGS-BEN", name: "Яйця Бенедикт", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 320, cost: 130, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h8", sku: "BR-PORRG", name: "Каша манна молочна", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 130, cost: 38, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h9", sku: "BR-SAUSAGE", name: "Сосиски гриль з картоплею (2 шт)", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 220, cost: 95, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-h10", sku: "BR-PASTA-CAR", name: "Паста Карбонара (порція)", group: "breakfast", category: "Гарячі страви", unit: "шт", price: 280, cost: 110, stock: 0, minStock: 0, supplier: "internal" },
  // Холодні страви (8)
  { id: "h-br-c1", sku: "BR-PLAT-CHS", name: "Сирне асорті (на 2)", group: "breakfast", category: "Холодні страви", unit: "шт", price: 320, cost: 150, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "h-br-c2", sku: "BR-PLAT-MEAT", name: "М'ясне асорті (на 2)", group: "breakfast", category: "Холодні страви", unit: "шт", price: 380, cost: 180, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "h-br-c3", sku: "BR-YOG-NAT", name: "Йогурт натуральний 200 г", group: "breakfast", category: "Холодні страви", unit: "шт", price: 90, cost: 32, stock: 60, minStock: 20, supplier: "FreshDistrib" },
  { id: "h-br-c4", sku: "BR-FRUITS", name: "Свіжа фруктова тарілка", group: "breakfast", category: "Холодні страви", unit: "шт", price: 220, cost: 90, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "h-br-c5", sku: "BR-MUESLI", name: "Мюслі з молоком і ягодами", group: "breakfast", category: "Холодні страви", unit: "шт", price: 160, cost: 55, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "h-br-c6", sku: "BR-TOAST-AV", name: "Тост з авокадо", group: "breakfast", category: "Холодні страви", unit: "шт", price: 240, cost: 100, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-br-c7", sku: "BR-SAL-GR", name: "Грецький салат", group: "breakfast", category: "Холодні страви", unit: "шт", price: 240, cost: 100, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "h-br-c8", sku: "BR-SAL-CSR", name: "Салат Цезар з куркою", group: "breakfast", category: "Холодні страви", unit: "шт", price: 280, cost: 115, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  // Випічка (6)
  { id: "h-br-p1", sku: "BR-CROIS", name: "Круасан класичний", group: "breakfast", category: "Випічка", unit: "шт", price: 70, cost: 22, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "h-br-p2", sku: "BR-CROIS-CH", name: "Круасан з сиром", group: "breakfast", category: "Випічка", unit: "шт", price: 90, cost: 30, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "h-br-p3", sku: "BR-DANISH", name: "Датська булочка з ягодами", group: "breakfast", category: "Випічка", unit: "шт", price: 80, cost: 28, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "h-br-p4", sku: "BR-MUFFIN", name: "Маффін шоколадний", group: "breakfast", category: "Випічка", unit: "шт", price: 75, cost: 26, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "h-br-p5", sku: "BR-CINN", name: "Сінабон", group: "breakfast", category: "Випічка", unit: "шт", price: 95, cost: 32, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "h-br-p6", sku: "BR-BAGEL", name: "Бейгл з лососем і крем-сиром", group: "breakfast", category: "Випічка", unit: "шт", price: 220, cost: 95, stock: 0, minStock: 0, supplier: "Bake&Co" },
  // Кави барні (8)
  { id: "h-br-cf1", sku: "BR-ESP", name: "Еспресо", group: "breakfast", category: "Кави", unit: "шт", price: 60, cost: 18, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "h-br-cf2", sku: "BR-AMER", name: "Американо", group: "breakfast", category: "Кави", unit: "шт", price: 70, cost: 22, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "h-br-cf3", sku: "BR-CAPP", name: "Капучино", group: "breakfast", category: "Кави", unit: "шт", price: 95, cost: 30, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "h-br-cf4", sku: "BR-LATTE", name: "Лате", group: "breakfast", category: "Кави", unit: "шт", price: 110, cost: 35, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "h-br-cf5", sku: "BR-FLAT", name: "Флет-вайт", group: "breakfast", category: "Кави", unit: "шт", price: 110, cost: 35, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "h-br-cf6", sku: "BR-MOCHA", name: "Мокачино", group: "breakfast", category: "Кави", unit: "шт", price: 120, cost: 40, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "h-br-cf7", sku: "BR-RAF", name: "Раф", group: "breakfast", category: "Кави", unit: "шт", price: 130, cost: 42, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "h-br-cf8", sku: "BR-MATCHA", name: "Матча-лате", group: "breakfast", category: "Кави", unit: "шт", price: 140, cost: 48, stock: 0, minStock: 0, supplier: "BeanLab" },
  // Чаї заварні (4)
  { id: "h-br-t1", sku: "BR-TEA-BLK", name: "Чорний чай (чайник)", group: "breakfast", category: "Чаї", unit: "шт", price: 90, cost: 24, stock: 0, minStock: 0, supplier: "TeaHouse" },
  { id: "h-br-t2", sku: "BR-TEA-GRN", name: "Зелений чай (чайник)", group: "breakfast", category: "Чаї", unit: "шт", price: 90, cost: 24, stock: 0, minStock: 0, supplier: "TeaHouse" },
  { id: "h-br-t3", sku: "BR-TEA-HERB", name: "Трав'яний чай (чайник)", group: "breakfast", category: "Чаї", unit: "шт", price: 100, cost: 28, stock: 0, minStock: 0, supplier: "TeaHouse" },
  { id: "h-br-t4", sku: "BR-TEA-GINGER", name: "Імбирний чай (чайник)", group: "breakfast", category: "Чаї", unit: "шт", price: 110, cost: 32, stock: 0, minStock: 0, supplier: "TeaHouse" },
  // Свіжі соки (4)
  { id: "h-br-j1", sku: "BR-JFR-OR", name: "Свіжий апельсиновий сік 300 мл", group: "breakfast", category: "Свіжі соки", unit: "шт", price: 140, cost: 58, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "h-br-j2", sku: "BR-JFR-CAR", name: "Свіжий морквяний сік 300 мл", group: "breakfast", category: "Свіжі соки", unit: "шт", price: 130, cost: 52, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "h-br-j3", sku: "BR-JFR-AP", name: "Свіжий яблучний сік 300 мл", group: "breakfast", category: "Свіжі соки", unit: "шт", price: 130, cost: 52, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "h-br-j4", sku: "BR-SMOOTH", name: "Смузі ягідний 300 мл", group: "breakfast", category: "Свіжі соки", unit: "шт", price: 160, cost: 68, stock: 0, minStock: 0, supplier: "FreshDistrib" },
];

const SPA: Seed[] = [
  { id: "h-sp-1", sku: "SPA-SHAMP-MINI", name: "Шампунь L'Oréal Mini 50 мл (номер)", group: "spa", category: "Гігієна номера", unit: "шт", price: 45, cost: 14, stock: 600, minStock: 200, supplier: "L'Oréal UA" },
  { id: "h-sp-2", sku: "SPA-COND-MINI", name: "Кондиціонер L'Oréal Mini 50 мл", group: "spa", category: "Гігієна номера", unit: "шт", price: 45, cost: 14, stock: 600, minStock: 200, supplier: "L'Oréal UA" },
  { id: "h-sp-3", sku: "SPA-SHOWERGEL", name: "Гель для душу 50 мл", group: "spa", category: "Гігієна номера", unit: "шт", price: 45, cost: 14, stock: 600, minStock: 200, supplier: "L'Oréal UA" },
  { id: "h-sp-4", sku: "SPA-LOTION", name: "Лосьйон для тіла 30 мл", group: "spa", category: "Гігієна номера", unit: "шт", price: 50, cost: 18, stock: 360, minStock: 120, supplier: "L'Oréal UA" },
  { id: "h-sp-5", sku: "SPA-SOAP", name: "Мило туалетне 20 г", group: "spa", category: "Гігієна номера", unit: "шт", price: 25, cost: 6, stock: 720, minStock: 240, supplier: "Ecolab UA" },
  { id: "h-sp-6", sku: "SPA-SHAVE", name: "Бритвенний набір одноразовий", group: "spa", category: "Гігієна номера", unit: "шт", price: 90, cost: 28, stock: 240, minStock: 80, supplier: "Ecolab UA" },
  { id: "h-sp-7", sku: "SPA-DENT", name: "Зубний набір (щітка + паста)", group: "spa", category: "Гігієна номера", unit: "шт", price: 90, cost: 30, stock: 240, minStock: 80, supplier: "Ecolab UA" },
  { id: "h-sp-8", sku: "SPA-COMB", name: "Гребінець одноразовий", group: "spa", category: "Гігієна номера", unit: "шт", price: 60, cost: 18, stock: 180, minStock: 60, supplier: "Ecolab UA" },
  { id: "h-sp-9", sku: "SPA-COSM-COTON", name: "Ватні диски (10 шт)", group: "spa", category: "Гігієна номера", unit: "пач", price: 80, cost: 28, stock: 120, minStock: 40, supplier: "Ecolab UA" },
  { id: "h-sp-10", sku: "SPA-EAR-PLG", name: "Беруші для сну (пара)", group: "spa", category: "Гігієна номера", unit: "шт", price: 90, cost: 28, stock: 120, minStock: 40, supplier: "Ecolab UA" },
  { id: "h-sp-11", sku: "SPA-SET-GIRL", name: "SPA-набір «Релакс» (5 предметів)", group: "spa", category: "SPA-набори", unit: "шт", price: 850, cost: 380, stock: 24, minStock: 8, supplier: "L'Oréal UA" },
  { id: "h-sp-12", sku: "SPA-SET-CPL", name: "SPA-набір для пари (8 предметів)", group: "spa", category: "SPA-набори", unit: "шт", price: 1450, cost: 680, stock: 16, minStock: 6, supplier: "L'Oréal UA" },
  { id: "h-sp-13", sku: "SPA-MASK-EYE", name: "Маска для очей з гелем", group: "spa", category: "SPA-набори", unit: "шт", price: 220, cost: 95, stock: 40, minStock: 12, supplier: "L'Oréal UA" },
  { id: "h-sp-14", sku: "SPA-BATH-SALT", name: "Сіль для ванни 250 г", group: "spa", category: "SPA-набори", unit: "шт", price: 280, cost: 110, stock: 30, minStock: 10, supplier: "L'Oréal UA" },
  { id: "h-sp-15", sku: "SPA-BATH-OIL", name: "Олія для ванни 100 мл", group: "spa", category: "SPA-набори", unit: "шт", price: 340, cost: 150, stock: 24, minStock: 8, supplier: "L'Oréal UA" },
  { id: "h-sp-16", sku: "SPA-PERFUME-T", name: "Парфум-тестер Chanel 5 мл", group: "spa", category: "Косметика", unit: "шт", price: 1200, cost: 580, stock: 12, minStock: 4, supplier: "L'Oréal UA" },
  { id: "h-sp-17", sku: "SPA-SUNSCR", name: "Сонцезахисний крем SPF 50, 100 мл", group: "spa", category: "Косметика", unit: "шт", price: 450, cost: 195, stock: 30, minStock: 10, supplier: "L'Oréal UA" },
  { id: "h-sp-18", sku: "SPA-HAND", name: "Крем для рук L'Oréal 75 мл", group: "spa", category: "Косметика", unit: "шт", price: 280, cost: 110, stock: 36, minStock: 12, supplier: "L'Oréal UA" },
  { id: "h-sp-19", sku: "SPA-FACE", name: "Маска для обличчя зволожуюча", group: "spa", category: "Косметика", unit: "шт", price: 180, cost: 75, stock: 48, minStock: 16, supplier: "L'Oréal UA" },
  { id: "h-sp-20", sku: "SPA-LIPB", name: "Бальзам для губ", group: "spa", category: "Косметика", unit: "шт", price: 140, cost: 55, stock: 60, minStock: 20, supplier: "L'Oréal UA" },
  { id: "h-sp-21", sku: "SPA-FOOT-SCRB", name: "Скраб для ніг 200 мл", group: "spa", category: "SPA-набори", unit: "шт", price: 320, cost: 140, stock: 20, minStock: 8, supplier: "L'Oréal UA" },
  { id: "h-sp-22", sku: "SPA-AROM-CDL", name: "Аромасвічка лавандова", group: "spa", category: "SPA-набори", unit: "шт", price: 380, cost: 165, stock: 24, minStock: 8, supplier: "L'Oréal UA" },
  { id: "h-sp-23", sku: "SPA-AROM-DIF", name: "Аромадифузор «Орхідея»", group: "spa", category: "SPA-набори", unit: "шт", price: 580, cost: 260, stock: 18, minStock: 6, supplier: "L'Oréal UA" },
  { id: "h-sp-24", sku: "SPA-ESS-OIL", name: "Ефірна олія евкаліпта 10 мл", group: "spa", category: "SPA-набори", unit: "шт", price: 320, cost: 140, stock: 24, minStock: 8, supplier: "L'Oréal UA" },
  { id: "h-sp-25", sku: "SPA-NEC-PILL", name: "Подушка для шиї дорожня", group: "spa", category: "SPA-набори", unit: "шт", price: 480, cost: 220, stock: 12, minStock: 4, supplier: "TextilePro" },
];

const SUPPLIES: Seed[] = [
  { id: "h-sup-1", sku: "HSV-ROBE", name: "Халат готельний (продаж)", group: "supplies", category: "Готельні товари", unit: "шт", price: 1450, cost: 680, stock: 24, minStock: 8, supplier: "TextilePro" },
  { id: "h-sup-2", sku: "HSV-SLIPP", name: "Тапочки готельні", group: "supplies", category: "Готельні товари", unit: "пач", price: 280, cost: 110, stock: 60, minStock: 20, supplier: "TextilePro" },
  { id: "h-sup-3", sku: "HSV-TOWEL-EXT", name: "Додатковий рушник банний", group: "supplies", category: "Готельні товари", unit: "шт", price: 320, cost: 140, stock: 30, minStock: 10, supplier: "TextilePro" },
  { id: "h-sup-4", sku: "HSV-PILLOW-EXT", name: "Додаткова подушка", group: "supplies", category: "Готельні товари", unit: "шт", price: 380, cost: 170, stock: 24, minStock: 8, supplier: "TextilePro" },
  { id: "h-sup-5", sku: "HSV-BLNKT-EXT", name: "Додаткова ковдра", group: "supplies", category: "Готельні товари", unit: "шт", price: 580, cost: 260, stock: 18, minStock: 6, supplier: "TextilePro" },
  { id: "h-sup-6", sku: "HSV-EXTRA-BED", name: "Розкладне ліжко (одна ніч)", group: "supplies", category: "Готельні товари", unit: "шт", price: 450, cost: 0, stock: 8, minStock: 2, supplier: "internal" },
  { id: "h-sup-7", sku: "HSV-IRON", name: "Прасування 1 одиниці одягу", group: "supplies", category: "Готельні товари", unit: "шт", price: 80, cost: 0, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-sup-8", sku: "HSV-LAUNDRY", name: "Прання гостьового одягу (за кг)", group: "supplies", category: "Готельні товари", unit: "шт", price: 220, cost: 90, stock: 0, minStock: 0, supplier: "Hotel Laundry" },
  { id: "h-sup-9", sku: "HSV-SHOE-CLN", name: "Чистка взуття", group: "supplies", category: "Готельні товари", unit: "шт", price: 180, cost: 0, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-sup-10", sku: "HSV-FAX", name: "Друк документа (А4, чорно-білий)", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 15, cost: 2, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-sup-11", sku: "HSV-FAX-COL", name: "Друк документа (А4, кольоровий)", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 35, cost: 8, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-sup-12", sku: "HSV-SAFE", name: "Сейф у номері (доба)", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 80, cost: 0, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-sup-13", sku: "HSV-PARK", name: "Платне паркомісце (доба)", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 180, cost: 0, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-sup-14", sku: "HSV-CHARG-EV", name: "EV-зарядка Type 2 (год)", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 95, cost: 35, stock: 0, minStock: 0, supplier: "DTEK" },
  { id: "h-sup-15", sku: "HSV-TRANSF-A", name: "Трансфер аеропорт Бориспіль", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 1200, cost: 480, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-sup-16", sku: "HSV-TRANSF-Z", name: "Трансфер аеропорт Жуляни", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 800, cost: 320, stock: 0, minStock: 0, supplier: "internal" },
  { id: "h-sup-17", sku: "HSV-CRIB", name: "Дитяче ліжечко (доба)", group: "supplies", category: "Готельні товари", unit: "шт", price: 250, cost: 0, stock: 6, minStock: 2, supplier: "internal" },
  { id: "h-sup-18", sku: "HSV-DOG-BED", name: "Лежанка для собаки (доба)", group: "supplies", category: "Готельні товари", unit: "шт", price: 200, cost: 0, stock: 4, minStock: 1, supplier: "internal" },
  { id: "h-sup-19", sku: "HSV-ADPT", name: "Універсальний адаптер живлення", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 350, cost: 140, stock: 12, minStock: 4, supplier: "internal" },
  { id: "h-sup-20", sku: "HSV-USB-CABLE", name: "USB-кабель (Type-C / Lightning)", group: "supplies", category: "Бізнес-сервіси", unit: "шт", price: 250, cost: 95, stock: 18, minStock: 6, supplier: "internal" },
];

const SOUVENIRS: Seed[] = [
  { id: "h-sv-1", sku: "SV-MAGNET", name: "Магніт «Затишок Київ»", group: "souvenirs", category: "Сувеніри", unit: "шт", price: 120, cost: 35, stock: 80, minStock: 24, supplier: "internal" },
  { id: "h-sv-2", sku: "SV-POSTCARD", name: "Листівка авторська (набір 5 шт)", group: "souvenirs", category: "Сувеніри", unit: "пач", price: 180, cost: 60, stock: 36, minStock: 12, supplier: "internal" },
  { id: "h-sv-3", sku: "SV-MUG", name: "Чашка з логотипом готелю", group: "souvenirs", category: "Сувеніри", unit: "шт", price: 320, cost: 130, stock: 40, minStock: 12, supplier: "internal" },
  { id: "h-sv-4", sku: "SV-TSHIRT", name: "Футболка «Zatyshok» (унісекс)", group: "souvenirs", category: "Сувеніри", unit: "шт", price: 580, cost: 250, stock: 24, minStock: 8, supplier: "internal" },
  { id: "h-sv-5", sku: "SV-BAG-TOTE", name: "Еко-сумка з лого", group: "souvenirs", category: "Сувеніри", unit: "шт", price: 280, cost: 95, stock: 36, minStock: 12, supplier: "internal" },
  { id: "h-sv-6", sku: "SV-HONEY", name: "Мед карпатський 250 г", group: "souvenirs", category: "Гастро-сувеніри", unit: "шт", price: 420, cost: 190, stock: 24, minStock: 8, supplier: "FreshDistrib" },
  { id: "h-sv-7", sku: "SV-CHOC", name: "Шоколад «Львівська майстерня» 100 г", group: "souvenirs", category: "Гастро-сувеніри", unit: "шт", price: 220, cost: 95, stock: 36, minStock: 12, supplier: "FreshDistrib" },
  { id: "h-sv-8", sku: "SV-VARENNYE", name: "Варення лісове 200 г", group: "souvenirs", category: "Гастро-сувеніри", unit: "шт", price: 280, cost: 130, stock: 18, minStock: 6, supplier: "FreshDistrib" },
  { id: "h-sv-9", sku: "SV-VYNO-UA", name: "Українське вино Frumushika-Nova 0,75 л", group: "souvenirs", category: "Гастро-сувеніри", unit: "шт", price: 650, cost: 320, stock: 24, minStock: 8, supplier: "Bayadera Group" },
  { id: "h-sv-10", sku: "SV-COFFEE", name: "Кава мелена «Carpathian Roast» 250 г", group: "souvenirs", category: "Гастро-сувеніри", unit: "шт", price: 380, cost: 180, stock: 30, minStock: 10, supplier: "BeanLab" },
  { id: "h-sv-11", sku: "SV-GIFTCARD-1K", name: "Подарунковий сертифікат 1 000 ₴", group: "souvenirs", category: "Сертифікати", unit: "шт", price: 1000, cost: 0, stock: 50, minStock: 0, supplier: "internal" },
  { id: "h-sv-12", sku: "SV-GIFTCARD-3K", name: "Подарунковий сертифікат 3 000 ₴", group: "souvenirs", category: "Сертифікати", unit: "шт", price: 3000, cost: 0, stock: 30, minStock: 0, supplier: "internal" },
  { id: "h-sv-13", sku: "SV-GIFTCARD-5K", name: "Подарунковий сертифікат 5 000 ₴", group: "souvenirs", category: "Сертифікати", unit: "шт", price: 5000, cost: 0, stock: 20, minStock: 0, supplier: "internal" },
  { id: "h-sv-14", sku: "SV-BOOK-KYIV", name: "Книга-путівник «Київ для своїх»", group: "souvenirs", category: "Сувеніри", unit: "шт", price: 480, cost: 220, stock: 18, minStock: 6, supplier: "internal" },
  { id: "h-sv-15", sku: "SV-EMBROID", name: "Вишиванка-сорочка (унісекс M-XL)", group: "souvenirs", category: "Сувеніри", unit: "шт", price: 1850, cost: 850, stock: 12, minStock: 4, supplier: "internal" },
];

export const HOTEL_NOMENCLATURE_SEED: Seed[] = [
  ...MINIBAR,
  ...BREAKFAST,
  ...SPA,
  ...SUPPLIES,
  ...SOUVENIRS,
];

const GROUP_LABEL: Record<Seed["group"], string> = {
  minibar: "Mini-bar",
  breakfast: "Сніданок і кухня",
  spa: "SPA / Косметика",
  supplies: "Готельні товари",
  souvenirs: "Сувеніри",
};

export const hotelNomenclature: NomenclatureItemV2[] = HOTEL_NOMENCLATURE_SEED.map((s) => ({
  id: s.id,
  sku: s.sku,
  name: s.name,
  category: s.category,
  unit: s.unit,
  price: s.price,
  cost: s.cost,
  stockBalance: s.stock,
  minStock: s.minStock,
  supplier: s.supplier,
  group: GROUP_LABEL[s.group],
  isService: false,
} as unknown as NomenclatureItemV2));
