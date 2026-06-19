/**
 * Centralized Units of Measure Configuration (КСПОВО)
 * Based on Ukrainian national classifier of measurement units
 */

export type UnitCategory = 
  | "quantity"   // Кількісні (шт, од, компл)
  | "weight"     // Вагові (кг, г, т)
  | "volume"     // Об'ємні (л, м³)
  | "length"     // Довжина (м, см, км)
  | "area"       // Площа (м², га)
  | "time"       // Час (год, хв, доба)
  | "service";   // Послуги (послуга, сесія)

export interface UnitOfMeasure {
  id: string;           // Код КСПОВО
  code: string;         // Скорочення ("шт", "кг", "год")
  name: string;         // Повна назва ("штука", "кілограм")
  nameGenitive: string; // Родовий відмінок ("штук", "кілограмів")
  symbol: string;       // Для документів ("шт.", "кг")
  category: UnitCategory;
  sortOrder: number;
  isActive: boolean;
  isDefault?: boolean;  // Одиниця за замовчуванням для категорії
}

/**
 * Complete units of measure dictionary
 * Based on КСПОВО (Класифікатор системи позначень одиниць вимірювання та обліку)
 */
export const UNITS_OF_MEASURE: UnitOfMeasure[] = [
  // === QUANTITY (Кількісні) ===
  { id: "796", code: "шт", name: "штука", nameGenitive: "штук", symbol: "шт.", category: "quantity", sortOrder: 1, isActive: true, isDefault: true },
  { id: "642", code: "од", name: "одиниця", nameGenitive: "одиниць", symbol: "од.", category: "quantity", sortOrder: 2, isActive: true },
  { id: "839", code: "компл", name: "комплект", nameGenitive: "комплектів", symbol: "компл.", category: "quantity", sortOrder: 3, isActive: true },
  { id: "728", code: "упак", name: "упаковка", nameGenitive: "упаковок", symbol: "упак.", category: "quantity", sortOrder: 4, isActive: true },
  { id: "715", code: "пар", name: "пара", nameGenitive: "пар", symbol: "пар", category: "quantity", sortOrder: 5, isActive: true },
  { id: "704", code: "набір", name: "набір", nameGenitive: "наборів", symbol: "набір", category: "quantity", sortOrder: 6, isActive: true },
  { id: "778", code: "рул", name: "рулон", nameGenitive: "рулонів", symbol: "рул.", category: "quantity", sortOrder: 7, isActive: true },
  { id: "736", code: "бут", name: "пляшка", nameGenitive: "пляшок", symbol: "пл.", category: "quantity", sortOrder: 8, isActive: true },
  
  // === WEIGHT (Вагові) ===
  { id: "166", code: "кг", name: "кілограм", nameGenitive: "кілограмів", symbol: "кг", category: "weight", sortOrder: 10, isActive: true, isDefault: true },
  { id: "163", code: "г", name: "грам", nameGenitive: "грамів", symbol: "г", category: "weight", sortOrder: 11, isActive: true },
  { id: "168", code: "т", name: "тонна", nameGenitive: "тонн", symbol: "т", category: "weight", sortOrder: 12, isActive: true },
  { id: "185", code: "ц", name: "центнер", nameGenitive: "центнерів", symbol: "ц", category: "weight", sortOrder: 13, isActive: true },
  
  // === VOLUME (Об'ємні) ===
  { id: "112", code: "л", name: "літр", nameGenitive: "літрів", symbol: "л", category: "volume", sortOrder: 20, isActive: true, isDefault: true },
  { id: "111", code: "мл", name: "мілілітр", nameGenitive: "мілілітрів", symbol: "мл", category: "volume", sortOrder: 21, isActive: true },
  { id: "113", code: "м³", name: "кубічний метр", nameGenitive: "кубічних метрів", symbol: "м³", category: "volume", sortOrder: 22, isActive: true },
  
  // === LENGTH (Довжина) ===
  { id: "006", code: "м", name: "метр", nameGenitive: "метрів", symbol: "м", category: "length", sortOrder: 30, isActive: true, isDefault: true },
  { id: "004", code: "см", name: "сантиметр", nameGenitive: "сантиметрів", symbol: "см", category: "length", sortOrder: 31, isActive: true },
  { id: "003", code: "мм", name: "міліметр", nameGenitive: "міліметрів", symbol: "мм", category: "length", sortOrder: 32, isActive: true },
  { id: "008", code: "км", name: "кілометр", nameGenitive: "кілометрів", symbol: "км", category: "length", sortOrder: 33, isActive: true },
  
  // === AREA (Площа) ===
  { id: "055", code: "м²", name: "квадратний метр", nameGenitive: "квадратних метрів", symbol: "м²", category: "area", sortOrder: 40, isActive: true, isDefault: true },
  { id: "059", code: "га", name: "гектар", nameGenitive: "гектарів", symbol: "га", category: "area", sortOrder: 41, isActive: true },
  { id: "061", code: "ар", name: "ар (сотка)", nameGenitive: "арів", symbol: "ар", category: "area", sortOrder: 42, isActive: true },
  
  // === TIME (Час) ===
  { id: "356", code: "год", name: "година", nameGenitive: "годин", symbol: "год.", category: "time", sortOrder: 50, isActive: true, isDefault: true },
  { id: "355", code: "хв", name: "хвилина", nameGenitive: "хвилин", symbol: "хв.", category: "time", sortOrder: 51, isActive: true },
  { id: "359", code: "доба", name: "доба", nameGenitive: "діб", symbol: "діб", category: "time", sortOrder: 52, isActive: true },
  { id: "362", code: "тижд", name: "тиждень", nameGenitive: "тижнів", symbol: "тижд.", category: "time", sortOrder: 53, isActive: true },
  { id: "365", code: "міс", name: "місяць", nameGenitive: "місяців", symbol: "міс.", category: "time", sortOrder: 54, isActive: true },
  { id: "366", code: "рік", name: "рік", nameGenitive: "років", symbol: "рік", category: "time", sortOrder: 55, isActive: true },
  
  // === SERVICE (Послуги) ===
  { id: "876", code: "послуга", name: "послуга", nameGenitive: "послуг", symbol: "посл.", category: "service", sortOrder: 60, isActive: true, isDefault: true },
  { id: "877", code: "сесія", name: "сесія", nameGenitive: "сесій", symbol: "сесія", category: "service", sortOrder: 61, isActive: true },
  { id: "878", code: "проект", name: "проект", nameGenitive: "проектів", symbol: "проект", category: "service", sortOrder: 62, isActive: true },
  { id: "879", code: "консультація", name: "консультація", nameGenitive: "консультацій", symbol: "конс.", category: "service", sortOrder: 63, isActive: true },
];

// ============= Helper Functions =============

/**
 * Get all active units
 */
export function getActiveUnits(): UnitOfMeasure[] {
  return UNITS_OF_MEASURE.filter(u => u.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get units by category
 */
export function getUnitsByCategory(category: UnitCategory): UnitOfMeasure[] {
  return getActiveUnits().filter(u => u.category === category);
}

/**
 * Get unit by code
 */
export function getUnitByCode(code: string): UnitOfMeasure | undefined {
  return UNITS_OF_MEASURE.find(u => u.code === code);
}

/**
 * Get unit by ID (КСПОВО code)
 */
export function getUnitById(id: string): UnitOfMeasure | undefined {
  return UNITS_OF_MEASURE.find(u => u.id === id);
}

/**
 * Get default unit for category
 */
export function getDefaultUnitForCategory(category: UnitCategory): UnitOfMeasure | undefined {
  return UNITS_OF_MEASURE.find(u => u.category === category && u.isDefault);
}

/**
 * Format unit options for select components
 */
export function getUnitOptions(): { value: string; label: string }[] {
  return getActiveUnits().map(u => ({
    value: u.code,
    label: u.code,
  }));
}

/**
 * Format unit options grouped by category
 */
export function getUnitOptionsGrouped(): { category: string; categoryLabel: string; units: { value: string; label: string }[] }[] {
  const categoryLabels: Record<UnitCategory, string> = {
    quantity: "Кількість",
    weight: "Вага",
    volume: "Об'єм",
    length: "Довжина",
    area: "Площа",
    time: "Час",
    service: "Послуги",
  };
  
  const categories: UnitCategory[] = ["quantity", "service", "time", "weight", "length", "area", "volume"];
  
  return categories.map(category => ({
    category,
    categoryLabel: categoryLabels[category],
    units: getUnitsByCategory(category).map(u => ({
      value: u.code,
      label: `${u.code} — ${u.name}`,
    })),
  }));
}

/**
 * Get name in genitive case with quantity
 * Example: formatUnitWithQuantity(5, "шт") => "5 штук"
 */
export function formatUnitWithQuantity(quantity: number, code: string): string {
  const unit = getUnitByCode(code);
  if (!unit) return `${quantity} ${code}`;
  
  // Ukrainian grammar rules for plural forms
  const lastDigit = Math.abs(quantity) % 10;
  const lastTwoDigits = Math.abs(quantity) % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${quantity} ${unit.nameGenitive}`;
  }
  
  if (lastDigit === 1) {
    return `${quantity} ${unit.name}`;
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    // Special plural form for 2-4
    return `${quantity} ${unit.nameGenitive}`;
  }
  
  return `${quantity} ${unit.nameGenitive}`;
}
