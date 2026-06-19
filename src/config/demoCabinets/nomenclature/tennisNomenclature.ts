/**
 * TENNIS CLUB NOMENCLATURE (demo-tennis-3) — 80 SKU:
 *   50 позицій магазину (Pro Shop): ракетки, струни, м'ячі, форма, кросівки, аксесуари.
 *   30 позицій кафе (Net Point): кава, чай, снеки, протеїн-бари, ізотоніки, легкі страви.
 *
 * Використовується як основа для `tennisOrdersData` (продукти/собівартість/постачальники)
 * і для відображення в розділі «Номенклатура».
 */

import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";

type Seed = {
  id: string;
  sku: string;
  name: string;
  group: "shop" | "cafe";
  category: string;
  unit: "шт" | "пара" | "пач" | "мл" | "г";
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
};

const SHOP: Seed[] = [
  // Ракетки (8)
  { id: "ts-r1", sku: "WIL-PSL98", name: "Wilson Pro Staff 97L v14", group: "shop", category: "Ракетки", unit: "шт", price: 8900, cost: 5600, stock: 6, minStock: 2, supplier: "Wilson EU" },
  { id: "ts-r2", sku: "WIL-BLD100", name: "Wilson Blade 100 v9", group: "shop", category: "Ракетки", unit: "шт", price: 9500, cost: 5950, stock: 4, minStock: 2, supplier: "Wilson EU" },
  { id: "ts-r3", sku: "HEAD-SPEED-MP", name: "HEAD Speed MP 2025", group: "shop", category: "Ракетки", unit: "шт", price: 9200, cost: 5800, stock: 5, minStock: 2, supplier: "Head Sport" },
  { id: "ts-r4", sku: "HEAD-RAD-PRO", name: "HEAD Radical Pro", group: "shop", category: "Ракетки", unit: "шт", price: 9800, cost: 6100, stock: 3, minStock: 2, supplier: "Head Sport" },
  { id: "ts-r5", sku: "BAB-PA100", name: "Babolat Pure Aero 100", group: "shop", category: "Ракетки", unit: "шт", price: 9700, cost: 6050, stock: 7, minStock: 3, supplier: "Babolat UA" },
  { id: "ts-r6", sku: "BAB-PD100", name: "Babolat Pure Drive 100", group: "shop", category: "Ракетки", unit: "шт", price: 9400, cost: 5900, stock: 8, minStock: 3, supplier: "Babolat UA" },
  { id: "ts-r7", sku: "YNX-EZ-98", name: "Yonex EZONE 98", group: "shop", category: "Ракетки", unit: "шт", price: 9300, cost: 5850, stock: 4, minStock: 2, supplier: "Yonex EU" },
  { id: "ts-r8", sku: "PRINCE-TXT100", name: "Prince Textreme Tour 100", group: "shop", category: "Ракетки", unit: "шт", price: 7600, cost: 4700, stock: 5, minStock: 2, supplier: "Prince Distrib" },
  // Дитячі ракетки (3)
  { id: "ts-r9", sku: "WIL-US23", name: "Wilson US Open 23 (дитяча)", group: "shop", category: "Ракетки", unit: "шт", price: 1600, cost: 950, stock: 6, minStock: 3, supplier: "Wilson EU" },
  { id: "ts-r10", sku: "HEAD-NV25", name: "HEAD Novak 25 (juniors)", group: "shop", category: "Ракетки", unit: "шт", price: 1900, cost: 1150, stock: 5, minStock: 3, supplier: "Head Sport" },
  { id: "ts-r11", sku: "BAB-NDR26", name: "Babolat Nadal 26", group: "shop", category: "Ракетки", unit: "шт", price: 2100, cost: 1280, stock: 4, minStock: 2, supplier: "Babolat UA" },
  // Струни (6)
  { id: "ts-s1", sku: "LUX-BBO125", name: "Luxilon Big Banger Original 1.25 (12 м)", group: "shop", category: "Струни", unit: "шт", price: 580, cost: 320, stock: 24, minStock: 10, supplier: "Wilson EU" },
  { id: "ts-s2", sku: "LUX-ALU125", name: "Luxilon Alu Power 1.25 (12 м)", group: "shop", category: "Струни", unit: "шт", price: 620, cost: 350, stock: 30, minStock: 12, supplier: "Wilson EU" },
  { id: "ts-s3", sku: "BAB-RPMB125", name: "Babolat RPM Blast 1.25", group: "shop", category: "Струни", unit: "шт", price: 540, cost: 300, stock: 22, minStock: 10, supplier: "Babolat UA" },
  { id: "ts-s4", sku: "HEAD-LYN125", name: "HEAD Lynx Tour 1.25", group: "shop", category: "Струни", unit: "шт", price: 460, cost: 250, stock: 18, minStock: 8, supplier: "Head Sport" },
  { id: "ts-s5", sku: "WIL-NXT130", name: "Wilson NXT 1.30 (мультифіл)", group: "shop", category: "Струни", unit: "шт", price: 720, cost: 410, stock: 14, minStock: 6, supplier: "Wilson EU" },
  { id: "ts-s6", sku: "YNX-PT125", name: "Yonex Poly Tour Pro 1.25", group: "shop", category: "Струни", unit: "шт", price: 560, cost: 310, stock: 16, minStock: 8, supplier: "Yonex EU" },
  // М'ячі (5)
  { id: "ts-b1", sku: "WIL-US4", name: "Wilson US Open 4-ball (банка)", group: "shop", category: "М'ячі", unit: "пач", price: 280, cost: 160, stock: 60, minStock: 24, supplier: "Wilson EU" },
  { id: "ts-b2", sku: "HEAD-T3", name: "HEAD Tour 3-ball (банка)", group: "shop", category: "М'ячі", unit: "пач", price: 230, cost: 130, stock: 80, minStock: 30, supplier: "Head Sport" },
  { id: "ts-b3", sku: "BAB-GS4", name: "Babolat Gold Sport 4-ball", group: "shop", category: "М'ячі", unit: "пач", price: 290, cost: 165, stock: 50, minStock: 20, supplier: "Babolat UA" },
  { id: "ts-b4", sku: "DUN-FRT3", name: "Dunlop Fort 3-ball (тренувальні)", group: "shop", category: "М'ячі", unit: "пач", price: 190, cost: 105, stock: 120, minStock: 50, supplier: "Dunlop UA" },
  { id: "ts-b5", sku: "BAB-RD25", name: "Babolat Red Foam 3-ball (kids)", group: "shop", category: "М'ячі", unit: "пач", price: 160, cost: 90, stock: 40, minStock: 15, supplier: "Babolat UA" },
  // Кросівки (6)
  { id: "ts-sh1", sku: "NIKE-VC4", name: "Nike Court Vapor Cage 4 (clay)", group: "shop", category: "Кросівки", unit: "пара", price: 5400, cost: 3300, stock: 8, minStock: 3, supplier: "Nike UA" },
  { id: "ts-sh2", sku: "NIKE-ZAR-PRO", name: "Nike Zoom Vapor Pro (hard)", group: "shop", category: "Кросівки", unit: "пара", price: 5800, cost: 3500, stock: 6, minStock: 3, supplier: "Nike UA" },
  { id: "ts-sh3", sku: "AS-GLR23", name: "ASICS Gel-Resolution 9 (hard)", group: "shop", category: "Кросівки", unit: "пара", price: 5600, cost: 3400, stock: 7, minStock: 3, supplier: "ASICS Distrib" },
  { id: "ts-sh4", sku: "AS-COURT-FF3", name: "ASICS Court FF 3 (Novak)", group: "shop", category: "Кросівки", unit: "пара", price: 6200, cost: 3800, stock: 5, minStock: 2, supplier: "ASICS Distrib" },
  { id: "ts-sh5", sku: "ADI-BARR12", name: "Adidas Barricade 12 (clay)", group: "shop", category: "Кросівки", unit: "пара", price: 5100, cost: 3100, stock: 4, minStock: 2, supplier: "Adidas UA" },
  { id: "ts-sh6", sku: "BAB-JET-MACH", name: "Babolat Jet Mach III", group: "shop", category: "Кросівки", unit: "пара", price: 5300, cost: 3200, stock: 5, minStock: 2, supplier: "Babolat UA" },
  // Одяг (8)
  { id: "ts-ap1", sku: "NIKE-DRYFIT-T", name: "Nike Dri-FIT Tennis Tee", group: "shop", category: "Одяг", unit: "шт", price: 1450, cost: 820, stock: 18, minStock: 8, supplier: "Nike UA" },
  { id: "ts-ap2", sku: "NIKE-DF-SHRT", name: "Nike Dri-FIT Shorts 9\"", group: "shop", category: "Одяг", unit: "шт", price: 1650, cost: 940, stock: 14, minStock: 6, supplier: "Nike UA" },
  { id: "ts-ap3", sku: "ADI-TENN-PL", name: "Adidas Tennis Polo", group: "shop", category: "Одяг", unit: "шт", price: 1750, cost: 1000, stock: 12, minStock: 6, supplier: "Adidas UA" },
  { id: "ts-ap4", sku: "ADI-CLUB-SK", name: "Adidas Club Skirt (жін.)", group: "shop", category: "Одяг", unit: "шт", price: 1850, cost: 1080, stock: 10, minStock: 5, supplier: "Adidas UA" },
  { id: "ts-ap5", sku: "WIL-TEAM-JK", name: "Wilson Team Jacket", group: "shop", category: "Одяг", unit: "шт", price: 2450, cost: 1400, stock: 8, minStock: 4, supplier: "Wilson EU" },
  { id: "ts-ap6", sku: "HEAD-CAP", name: "HEAD Tennis Cap", group: "shop", category: "Одяг", unit: "шт", price: 650, cost: 360, stock: 22, minStock: 10, supplier: "Head Sport" },
  { id: "ts-ap7", sku: "BAB-WBND", name: "Babolat Wristband (2 шт)", group: "shop", category: "Одяг", unit: "пач", price: 320, cost: 170, stock: 30, minStock: 12, supplier: "Babolat UA" },
  { id: "ts-ap8", sku: "NIKE-SKK-3PK", name: "Nike Tennis Socks 3-pack", group: "shop", category: "Одяг", unit: "пач", price: 580, cost: 320, stock: 28, minStock: 10, supplier: "Nike UA" },
  // Сумки / чохли (4)
  { id: "ts-bg1", sku: "WIL-T9PRO", name: "Wilson Tour 9-pack Bag", group: "shop", category: "Сумки", unit: "шт", price: 3650, cost: 2200, stock: 6, minStock: 3, supplier: "Wilson EU" },
  { id: "ts-bg2", sku: "HEAD-PRO-12R", name: "HEAD Pro 12R Bag", group: "shop", category: "Сумки", unit: "шт", price: 4200, cost: 2500, stock: 4, minStock: 2, supplier: "Head Sport" },
  { id: "ts-bg3", sku: "BAB-PA-RH6", name: "Babolat Pure Aero RH6 Bag", group: "shop", category: "Сумки", unit: "шт", price: 2950, cost: 1750, stock: 7, minStock: 3, supplier: "Babolat UA" },
  { id: "ts-bg4", sku: "WIL-COVER-1", name: "Wilson Racquet Cover", group: "shop", category: "Сумки", unit: "шт", price: 820, cost: 460, stock: 16, minStock: 6, supplier: "Wilson EU" },
  // Аксесуари (6)
  { id: "ts-ac1", sku: "WIL-OVERG-3", name: "Wilson Pro Overgrip (3-pack)", group: "shop", category: "Аксесуари", unit: "пач", price: 320, cost: 180, stock: 40, minStock: 15, supplier: "Wilson EU" },
  { id: "ts-ac2", sku: "HEAD-OVERG-3", name: "HEAD Hydrosorb Overgrip 3-pack", group: "shop", category: "Аксесуари", unit: "пач", price: 340, cost: 190, stock: 38, minStock: 15, supplier: "Head Sport" },
  { id: "ts-ac3", sku: "BAB-VS-ABS", name: "Babolat VS Vibration Dampener", group: "shop", category: "Аксесуари", unit: "шт", price: 180, cost: 95, stock: 50, minStock: 20, supplier: "Babolat UA" },
  { id: "ts-ac4", sku: "GAMMA-STR-MACH", name: "Gamma Stringing Set", group: "shop", category: "Аксесуари", unit: "шт", price: 1200, cost: 700, stock: 6, minStock: 2, supplier: "Gamma Sports" },
  { id: "ts-ac5", sku: "TR-BAS-72", name: "Tournament Basket 72 м'ячі", group: "shop", category: "Аксесуари", unit: "шт", price: 2400, cost: 1450, stock: 4, minStock: 2, supplier: "Court Equip UA" },
  { id: "ts-ac6", sku: "GIFT-1000", name: "Подарунковий сертифікат 1000 ₴", group: "shop", category: "Аксесуари", unit: "шт", price: 1000, cost: 0, stock: 30, minStock: 0, supplier: "internal" },
  // Розхідні (4)
  { id: "ts-ex1", sku: "CLAY-TONNE", name: "Тенісна цегла Antuka (т)", group: "shop", category: "Розхідні", unit: "шт", price: 18000, cost: 12500, stock: 2, minStock: 1, supplier: "Antuka Pro" },
  { id: "ts-ex2", sku: "NET-COURT-12", name: "Сітка кортова Vermont 12 м", group: "shop", category: "Розхідні", unit: "шт", price: 4200, cost: 2700, stock: 3, minStock: 1, supplier: "Court Equip UA" },
  { id: "ts-ex3", sku: "LINE-PAINT-W", name: "Фарба для розмітки (біла, 5 л)", group: "shop", category: "Розхідні", unit: "шт", price: 980, cost: 580, stock: 8, minStock: 3, supplier: "Court Equip UA" },
  { id: "ts-ex4", sku: "ROLLER-COURT", name: "Каток для ґрунту (запчастини)", group: "shop", category: "Розхідні", unit: "шт", price: 2200, cost: 1400, stock: 2, minStock: 1, supplier: "Court Equip UA" },
];

const CAFE: Seed[] = [
  // Кава / чай (8)
  { id: "tc-c1", sku: "CAF-ESP", name: "Еспресо", group: "cafe", category: "Кава", unit: "шт", price: 55, cost: 18, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "tc-c2", sku: "CAF-AMER", name: "Американо", group: "cafe", category: "Кава", unit: "шт", price: 65, cost: 20, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "tc-c3", sku: "CAF-CAPP", name: "Капучино", group: "cafe", category: "Кава", unit: "шт", price: 85, cost: 28, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "tc-c4", sku: "CAF-LATTE", name: "Лате", group: "cafe", category: "Кава", unit: "шт", price: 95, cost: 32, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "tc-c5", sku: "CAF-RAF", name: "Раф ванільний", group: "cafe", category: "Кава", unit: "шт", price: 110, cost: 38, stock: 0, minStock: 0, supplier: "BeanLab" },
  { id: "tc-c6", sku: "TEA-BLK", name: "Чорний чай (чайник)", group: "cafe", category: "Чай", unit: "шт", price: 90, cost: 24, stock: 0, minStock: 0, supplier: "TeaHouse" },
  { id: "tc-c7", sku: "TEA-GRN", name: "Зелений чай (чайник)", group: "cafe", category: "Чай", unit: "шт", price: 90, cost: 24, stock: 0, minStock: 0, supplier: "TeaHouse" },
  { id: "tc-c8", sku: "TEA-HERB", name: "Трав'яний чай (чайник)", group: "cafe", category: "Чай", unit: "шт", price: 95, cost: 26, stock: 0, minStock: 0, supplier: "TeaHouse" },
  // Свіжі напої / соки (5)
  { id: "tc-d1", sku: "DR-ORANGE", name: "Свіжий апельсиновий сік 300 мл", group: "cafe", category: "Напої", unit: "шт", price: 130, cost: 55, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "tc-d2", sku: "DR-LEMON", name: "Лимонад домашній 400 мл", group: "cafe", category: "Напої", unit: "шт", price: 110, cost: 32, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "tc-d3", sku: "DR-WATER", name: "Вода негазована 0,5 л", group: "cafe", category: "Напої", unit: "шт", price: 45, cost: 14, stock: 220, minStock: 60, supplier: "BoneAqua" },
  { id: "tc-d4", sku: "DR-COLA", name: "Coca-Cola 0,33 л", group: "cafe", category: "Напої", unit: "шт", price: 60, cost: 22, stock: 96, minStock: 36, supplier: "Coca-Cola UA" },
  { id: "tc-d5", sku: "DR-ISO-POW", name: "Powerade 0,5 л", group: "cafe", category: "Ізотоніки", unit: "шт", price: 85, cost: 38, stock: 72, minStock: 24, supplier: "Coca-Cola UA" },
  // Спорт-харчування (5)
  { id: "tc-sp1", sku: "BAR-PRO-CHOC", name: "Протеїн-бар Trec Nutrition Choco 60 г", group: "cafe", category: "Спорт-харчування", unit: "шт", price: 95, cost: 48, stock: 40, minStock: 15, supplier: "SportPit UA" },
  { id: "tc-sp2", sku: "BAR-PRO-PB", name: "Протеїн-бар Quest Peanut Butter 60 г", group: "cafe", category: "Спорт-харчування", unit: "шт", price: 130, cost: 70, stock: 28, minStock: 10, supplier: "SportPit UA" },
  { id: "tc-sp3", sku: "BAR-OATS", name: "Вівсяний бар з горіхами", group: "cafe", category: "Спорт-харчування", unit: "шт", price: 70, cost: 30, stock: 36, minStock: 12, supplier: "SportPit UA" },
  { id: "tc-sp4", sku: "ISOT-PWR-CIT", name: "Ізотонік цитрус (порошок, 30 г)", group: "cafe", category: "Спорт-харчування", unit: "шт", price: 90, cost: 38, stock: 50, minStock: 20, supplier: "SportPit UA" },
  { id: "tc-sp5", sku: "AMINO-BCAA", name: "BCAA шот 60 мл", group: "cafe", category: "Спорт-харчування", unit: "шт", price: 110, cost: 55, stock: 24, minStock: 8, supplier: "SportPit UA" },
  // Снеки / випічка (6)
  { id: "tc-sn1", sku: "SN-CROIS", name: "Круасан з сиром", group: "cafe", category: "Випічка", unit: "шт", price: 65, cost: 22, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "tc-sn2", sku: "SN-CINN", name: "Сінабон", group: "cafe", category: "Випічка", unit: "шт", price: 90, cost: 32, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "tc-sn3", sku: "SN-COOK", name: "Печиво вівсяне (3 шт)", group: "cafe", category: "Випічка", unit: "пач", price: 55, cost: 20, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "tc-sn4", sku: "SN-FRUIT", name: "Фруктова тарілка", group: "cafe", category: "Свіжі страви", unit: "шт", price: 180, cost: 70, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "tc-sn5", sku: "SN-NUTS", name: "Мікс горіхів 100 г", group: "cafe", category: "Снеки", unit: "пач", price: 120, cost: 55, stock: 30, minStock: 12, supplier: "NutsCo" },
  { id: "tc-sn6", sku: "SN-CHIPS-VEG", name: "Чіпси овочеві 70 г", group: "cafe", category: "Снеки", unit: "пач", price: 85, cost: 38, stock: 35, minStock: 12, supplier: "NutsCo" },
  // Сендвічі / салати (6)
  { id: "tc-fr1", sku: "FR-SAND-CHK", name: "Сендвіч з куркою", group: "cafe", category: "Свіжі страви", unit: "шт", price: 180, cost: 75, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "tc-fr2", sku: "FR-SAND-VEG", name: "Сендвіч овочевий", group: "cafe", category: "Свіжі страви", unit: "шт", price: 160, cost: 60, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "tc-fr3", sku: "FR-WRAP-TUNA", name: "Тортилья з тунцем", group: "cafe", category: "Свіжі страви", unit: "шт", price: 220, cost: 95, stock: 0, minStock: 0, supplier: "Bake&Co" },
  { id: "tc-fr4", sku: "FR-SAL-CESAR", name: "Салат «Цезар»", group: "cafe", category: "Свіжі страви", unit: "шт", price: 260, cost: 110, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "tc-fr5", sku: "FR-SAL-GREEK", name: "Салат «Грецький»", group: "cafe", category: "Свіжі страви", unit: "шт", price: 240, cost: 100, stock: 0, minStock: 0, supplier: "FreshDistrib" },
  { id: "tc-fr6", sku: "FR-BOWL-QUI", name: "Боул з кіноа", group: "cafe", category: "Свіжі страви", unit: "шт", price: 280, cost: 125, stock: 0, minStock: 0, supplier: "FreshDistrib" },
];

export const TENNIS_NOMENCLATURE_SEED: Seed[] = [...SHOP, ...CAFE];

export const tennisNomenclature: NomenclatureItemV2[] = TENNIS_NOMENCLATURE_SEED.map((s) => ({
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
  group: s.group === "shop" ? "Магазин Pro Shop" : "Кафе Net Point",
  isService: false,
} as unknown as NomenclatureItemV2));
