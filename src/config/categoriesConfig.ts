/**
 * Centralized Income and Expense Categories Configuration
 * Used for document classification and financial reporting
 */

// ============= INCOME CATEGORIES =============

export interface IncomeCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  taxGroup?: "services" | "goods" | "other";
  cabinetId?: string; // undefined = system/global
}

export const INCOME_CATEGORIES: IncomeCategory[] = [
  { id: "inc-cons", code: "CONS", name: "Консалтингові послуги", description: "Консультаційні, аудиторські та юридичні послуги", icon: "💼", isDefault: false, isActive: true, sortOrder: 1, taxGroup: "services" },
  { id: "inc-it", code: "IT", name: "IT-послуги", description: "Розробка ПЗ, підтримка, SaaS", icon: "💻", isDefault: true, isActive: true, sortOrder: 2, taxGroup: "services" },
  { id: "inc-sale", code: "SALE", name: "Продаж товарів", description: "Реалізація товарів та продукції", icon: "📦", isDefault: false, isActive: true, sortOrder: 3, taxGroup: "goods" },
  { id: "inc-rent", code: "RENT", name: "Оренда", description: "Доходи від здачі майна в оренду", icon: "🏠", isDefault: false, isActive: true, sortOrder: 4, taxGroup: "other" },
  { id: "inc-design", code: "DESIGN", name: "Дизайн", description: "Графічний, веб та UX/UI дизайн", icon: "🎨", isDefault: false, isActive: true, sortOrder: 5, taxGroup: "services" },
  { id: "inc-mkt", code: "MKT", name: "Маркетинг", description: "Маркетингові та рекламні послуги", icon: "📢", isDefault: false, isActive: true, sortOrder: 6, taxGroup: "services" },
  { id: "inc-edu", code: "EDU", name: "Освітні послуги", description: "Тренінги, курси, коучинг", icon: "📚", isDefault: false, isActive: true, sortOrder: 7, taxGroup: "services" },
  { id: "inc-fin", code: "FIN", name: "Фінансові послуги", description: "Бухгалтерські, фінансові консультації", icon: "💰", isDefault: false, isActive: true, sortOrder: 8, taxGroup: "services" },
  { id: "inc-trans", code: "TRANS", name: "Транспортні послуги", description: "Перевезення, логістика, доставка", icon: "🚚", isDefault: false, isActive: true, sortOrder: 9, taxGroup: "services" },
  { id: "inc-other", code: "OTHER", name: "Інші доходи", description: "Доходи, що не класифікуються в інші категорії", icon: "📋", isDefault: false, isActive: true, sortOrder: 100, taxGroup: "other" },

  // === Cabinet-specific demo categories ===
  // IT cabinet
  { id: "inc-saas", code: "SAAS", name: "SaaS-підписки", description: "Доходи від SaaS продуктів та підписок", icon: "☁️", isDefault: false, isActive: true, sortOrder: 10, taxGroup: "services", cabinetId: "demo-it-3" },
  { id: "inc-freelance", code: "FREELANCE", name: "Фріланс", description: "Доходи від фріланс-проєктів", icon: "🧑‍💻", isDefault: false, isActive: true, sortOrder: 11, taxGroup: "services", cabinetId: "demo-it-3" },
  // Auto repair cabinet
  { id: "inc-repair", code: "REPAIR", name: "Послуги ремонту", description: "Доходи від ремонту транспортних засобів", icon: "🔧", isDefault: true, isActive: true, sortOrder: 10, taxGroup: "services", cabinetId: "demo-auto-2" },
  { id: "inc-parts", code: "PARTS", name: "Продаж запчастин", description: "Доходи від продажу автозапчастин", icon: "⚙️", isDefault: false, isActive: true, sortOrder: 11, taxGroup: "goods", cabinetId: "demo-auto-2" },
  // Consulting cabinet
  { id: "inc-retainer", code: "RETAINER", name: "Ретейнер", description: "Щомісячний абонентський дохід", icon: "📅", isDefault: false, isActive: true, sortOrder: 10, taxGroup: "services", cabinetId: "demo-consulting-3" },
  // Dealer cabinet
  { id: "inc-wholesale", code: "WHOLESALE", name: "Оптовий продаж", description: "Доходи від оптових продажів", icon: "🏪", isDefault: true, isActive: true, sortOrder: 10, taxGroup: "goods", cabinetId: "demo-dealer-2" },
  { id: "inc-retail", code: "RETAIL", name: "Роздрібний продаж", description: "Доходи від роздрібних продажів", icon: "🛒", isDefault: false, isActive: true, sortOrder: 11, taxGroup: "goods", cabinetId: "demo-dealer-2" },
];

// ============= EXPENSE CATEGORIES =============

export interface ExpenseCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  isDeductible: boolean;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  group?: "operational" | "administrative" | "financial" | "other";
  cabinetId?: string; // undefined = system/global
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  // === OPERATIONAL ===
  { id: "exp-rent", code: "RENT", name: "Оренда офісу/приміщення", description: "Оренда робочих приміщень, коворкінгів", icon: "🏢", isDeductible: true, isDefault: false, isActive: true, sortOrder: 1, group: "operational" },
  { id: "exp-util", code: "UTL", name: "Комунальні послуги", description: "Електрика, вода, опалення, інтернет", icon: "💡", isDeductible: true, isDefault: false, isActive: true, sortOrder: 2, group: "operational" },
  { id: "exp-tel", code: "TEL", name: "Зв'язок та інтернет", description: "Мобільний зв'язок, інтернет, телефонія", icon: "📱", isDeductible: true, isDefault: false, isActive: true, sortOrder: 3, group: "operational" },
  { id: "exp-sw", code: "SW", name: "Програмне забезпечення", description: "Підписки на ПЗ, ліцензії, SaaS", icon: "💾", isDeductible: true, isDefault: true, isActive: true, sortOrder: 4, group: "operational" },
  { id: "exp-equip", code: "EQUIP", name: "Обладнання", description: "Комп'ютери, оргтехніка, меблі", icon: "🖥️", isDeductible: true, isDefault: false, isActive: true, sortOrder: 5, group: "operational" },
  { id: "exp-mat", code: "MAT", name: "Матеріали та витратники", description: "Канцтовари, витратні матеріали", icon: "📎", isDeductible: true, isDefault: false, isActive: true, sortOrder: 6, group: "operational" },
  // === ADMINISTRATIVE ===
  { id: "exp-sal", code: "SAL", name: "Зарплата та винагороди", description: "Заробітна плата працівників, гонорари", icon: "👥", isDeductible: true, isDefault: false, isActive: true, sortOrder: 10, group: "administrative" },
  { id: "exp-esv", code: "ESV", name: "ЄСВ та соціальні внески", description: "Єдиний соціальний внесок", icon: "🏥", isDeductible: true, isDefault: false, isActive: true, sortOrder: 11, group: "administrative" },
  { id: "exp-mkt", code: "MKT", name: "Маркетинг та реклама", description: "Рекламні витрати, просування", icon: "📣", isDeductible: true, isDefault: false, isActive: true, sortOrder: 12, group: "administrative" },
  { id: "exp-cons", code: "CONS", name: "Консультаційні послуги", description: "Юридичні, бухгалтерські консультації", icon: "👔", isDeductible: true, isDefault: false, isActive: true, sortOrder: 13, group: "administrative" },
  { id: "exp-edu", code: "EDU", name: "Навчання та розвиток", description: "Курси, тренінги, конференції", icon: "🎓", isDeductible: true, isDefault: false, isActive: true, sortOrder: 14, group: "administrative" },
  { id: "exp-trn", code: "TRN", name: "Транспорт та відрядження", description: "Відрядження, пальне, транспортні витрати", icon: "🚗", isDeductible: true, isDefault: false, isActive: true, sortOrder: 15, group: "administrative" },
  // === FINANCIAL ===
  { id: "exp-bank", code: "BANK", name: "Банківські комісії", description: "Комісії за обслуговування рахунку, перекази", icon: "🏦", isDeductible: true, isDefault: false, isActive: true, sortOrder: 20, group: "financial" },
  { id: "exp-tax", code: "TAX", name: "Податки та збори", description: "ЄП, ПДВ та інші обов'язкові платежі", icon: "📋", isDeductible: false, isDefault: false, isActive: true, sortOrder: 21, group: "financial" },
  { id: "exp-ins", code: "INS", name: "Страхування", description: "Страхові платежі", icon: "🛡️", isDeductible: true, isDefault: false, isActive: true, sortOrder: 22, group: "financial" },
  // === OTHER ===
  { id: "exp-repr", code: "REPR", name: "Представницькі витрати", description: "Ділові зустрічі, подарунки партнерам", icon: "🎁", isDeductible: true, isDefault: false, isActive: true, sortOrder: 30, group: "other" },
  { id: "exp-other", code: "OTHER", name: "Інші витрати", description: "Витрати, що не класифікуються в інші категорії", icon: "📝", isDeductible: true, isDefault: false, isActive: true, sortOrder: 100, group: "other" },

  // === Cabinet-specific demo categories ===
  // IT cabinet
  { id: "exp-cloud", code: "CLOUD", name: "Хмарні сервіси", description: "AWS, Azure, GCP, Vercel", icon: "☁️", isDeductible: true, isDefault: false, isActive: true, sortOrder: 7, group: "operational", cabinetId: "demo-it-3" },
  // Auto repair cabinet
  { id: "exp-parts", code: "PARTS", name: "Запчастини", description: "Закупівля автозапчастин", icon: "⚙️", isDeductible: true, isDefault: true, isActive: true, sortOrder: 7, group: "operational", cabinetId: "demo-auto-2" },
  { id: "exp-fuel", code: "FUEL", name: "Пальне", description: "Бензин, дизель, газ", icon: "⛽", isDeductible: true, isDefault: false, isActive: true, sortOrder: 8, group: "operational", cabinetId: "demo-auto-2" },
  // Dealer cabinet
  { id: "exp-goods", code: "GOODS", name: "Закупівля товарів", description: "Товари для перепродажу", icon: "📦", isDeductible: true, isDefault: true, isActive: true, sortOrder: 7, group: "operational", cabinetId: "demo-dealer-2" },
  { id: "exp-logistics", code: "LOGISTICS", name: "Логістика", description: "Доставка, склад, пакування", icon: "🚛", isDeductible: true, isDefault: false, isActive: true, sortOrder: 8, group: "operational", cabinetId: "demo-dealer-2" },
];

// ============= Helper Functions =============

/**
 * Get income categories for a specific cabinet (system + cabinet-specific)
 */
export function getIncomeCategoriesForCabinet(cabinetId?: string): IncomeCategory[] {
  return INCOME_CATEGORIES
    .filter(c => !c.cabinetId || c.cabinetId === cabinetId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get expense categories for a specific cabinet (system + cabinet-specific)
 */
export function getExpenseCategoriesForCabinet(cabinetId?: string): ExpenseCategory[] {
  return EXPENSE_CATEGORIES
    .filter(c => !c.cabinetId || c.cabinetId === cabinetId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all active income categories
 */
export function getActiveIncomeCategories(): IncomeCategory[] {
  return INCOME_CATEGORIES.filter(c => c.isActive && !c.cabinetId).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get all active expense categories
 */
export function getActiveExpenseCategories(): ExpenseCategory[] {
  return EXPENSE_CATEGORIES.filter(c => c.isActive && !c.cabinetId).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get income category by code
 */
export function getIncomeCategoryByCode(code: string): IncomeCategory | undefined {
  return INCOME_CATEGORIES.find(c => c.code === code);
}

/**
 * Get expense category by code
 */
export function getExpenseCategoryByCode(code: string): ExpenseCategory | undefined {
  return EXPENSE_CATEGORIES.find(c => c.code === code);
}

/**
 * Get default income category
 */
export function getDefaultIncomeCategory(): IncomeCategory | undefined {
  return INCOME_CATEGORIES.find(c => c.isDefault && c.isActive);
}

/**
 * Get default expense category
 */
export function getDefaultExpenseCategory(): ExpenseCategory | undefined {
  return EXPENSE_CATEGORIES.find(c => c.isDefault && c.isActive);
}

/**
 * Format income category options for select
 */
export function getIncomeCategoryOptions(): { value: string; label: string }[] {
  return getActiveIncomeCategories().map(c => ({
    value: c.code,
    label: `${c.icon || ""} ${c.name}`.trim(),
  }));
}

/**
 * Format expense category options for select
 */
export function getExpenseCategoryOptions(): { value: string; label: string }[] {
  return getActiveExpenseCategories().map(c => ({
    value: c.code,
    label: `${c.icon || ""} ${c.name}`.trim(),
  }));
}

/**
 * Get expense categories grouped by group
 */
export function getExpenseCategoriesGrouped(cabinetId?: string): { group: string; label: string; categories: ExpenseCategory[] }[] {
  const groupLabels: Record<string, string> = {
    operational: "Операційні",
    administrative: "Адміністративні",
    financial: "Фінансові",
    other: "Інші",
  };

  const groups = ["operational", "administrative", "financial", "other"];
  const allActive = (cabinetId
    ? getExpenseCategoriesForCabinet(cabinetId)
    : getActiveExpenseCategories()
  ).filter(c => c.isActive);

  return groups.map(group => ({
    group,
    label: groupLabels[group] || group,
    categories: allActive.filter(c => c.group === group),
  }));
}

/**
 * Get only deductible expense categories
 */
export function getDeductibleExpenseCategories(): ExpenseCategory[] {
  return getActiveExpenseCategories().filter(c => c.isDeductible);
}

/**
 * Check if a category is a system category (no cabinetId)
 */
export function isSystemCategory(category: IncomeCategory | ExpenseCategory): boolean {
  return !category.cabinetId;
}
