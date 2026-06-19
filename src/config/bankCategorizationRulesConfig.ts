/**
 * Bank Categorization Rules Configuration
 * Auto-categorization rules for bank transactions
 */

import { DEMO_CABINET_IDS, isDemoCabinet } from "./demoCabinets/types";

export interface BankCategorizationRule {
  id: string;
  name: string;
  priority: number; // Higher = processed first
  isActive: boolean;
  cabinetId?: string; // undefined = global rule
  
  conditions: {
    descriptionContains?: string[];
    amountMin?: number;
    amountMax?: number;
    transactionType?: "income" | "expense";
  };
  
  action: {
    categoryCode: string;
    autoConfirm: boolean;
  };
  
  // Statistics
  matchCount: number;
  lastMatchedAt?: string;
}

export const DEMO_BANK_RULES: BankCategorizationRule[] = [
  // === IT Cabinet rules ===
  {
    id: "rule-1",
    name: "Нова пошта → Транспорт",
    priority: 100,
    isActive: true,
    cabinetId: "demo-it-3",
    conditions: { 
      descriptionContains: ["NOVA POSHTA", "НОВАПОШТА", "Нова Пошта"],
      transactionType: "expense" 
    },
    action: { categoryCode: "TRN", autoConfirm: true },
    matchCount: 45,
    lastMatchedAt: "2025-01-25",
  },
  {
    id: "rule-2",
    name: "OpenAI/Stripe → ПЗ",
    priority: 90,
    isActive: true,
    cabinetId: "demo-it-3",
    conditions: { 
      descriptionContains: ["OPENAI", "STRIPE", "GITHUB", "VERCEL", "NETLIFY"],
      transactionType: "expense"
    },
    action: { categoryCode: "SW", autoConfirm: true },
    matchCount: 28,
    lastMatchedAt: "2025-01-26",
  },
  {
    id: "rule-3",
    name: "Банківська комісія",
    priority: 80,
    isActive: true,
    // global rule — no cabinetId
    conditions: { 
      descriptionContains: ["КОМІСІЯ", "ОБСЛУГОВУВАННЯ РАХУНКУ", "MEMBERSHIP FEE", "АБОНПЛАТА"],
      transactionType: "expense"
    },
    action: { categoryCode: "BANK", autoConfirm: true },
    matchCount: 156,
    lastMatchedAt: "2025-01-27",
  },
  {
    id: "rule-4",
    name: "Rozetka → Обладнання",
    priority: 70,
    isActive: true,
    cabinetId: "demo-it-3",
    conditions: { 
      descriptionContains: ["ROZETKA", "РОЗЕТКА"],
      transactionType: "expense"
    },
    action: { categoryCode: "EQUIP", autoConfirm: false },
    matchCount: 12,
    lastMatchedAt: "2025-01-20",
  },
  {
    id: "rule-5",
    name: "АЗС → Транспорт",
    priority: 75,
    isActive: true,
    // global rule
    conditions: { 
      descriptionContains: ["OKKO", "WOG", "УКРНАФТА", "SHELL", "АЗС", "ПАЛЬНЕ"],
      transactionType: "expense"
    },
    action: { categoryCode: "TRN", autoConfirm: true },
    matchCount: 34,
    lastMatchedAt: "2025-01-26",
  },
  {
    id: "rule-6",
    name: "Кава/Кейтерінг → Представницькі",
    priority: 50,
    isActive: false,
    conditions: { 
      descriptionContains: ["STARBUCKS", "SILPO", "ATB", "КАВА", "РЕСТОРАН"],
      transactionType: "expense"
    },
    action: { categoryCode: "REPR", autoConfirm: false },
    matchCount: 8,
  },

  // === Income rules (IT) ===
  {
    id: "rule-7",
    name: "Upwork → Дохід IT",
    priority: 95,
    isActive: true,
    cabinetId: "demo-it-3",
    conditions: {
      descriptionContains: ["UPWORK", "PAYONEER", "WISE"],
      transactionType: "income",
    },
    action: { categoryCode: "IT", autoConfirm: true },
    matchCount: 63,
    lastMatchedAt: "2025-01-27",
  },
  {
    id: "rule-8",
    name: "Повернення переплати",
    priority: 40,
    isActive: true,
    // global
    conditions: {
      descriptionContains: ["ПОВЕРНЕННЯ", "REFUND", "ВОЗВРАТ"],
      transactionType: "income",
    },
    action: { categoryCode: "OTHER", autoConfirm: false },
    matchCount: 5,
    lastMatchedAt: "2025-01-15",
  },

  // === Auto Repair cabinet ===
  {
    id: "rule-9",
    name: "Автозапчастини → Матеріали",
    priority: 85,
    isActive: true,
    cabinetId: "demo-autorepair-2",
    conditions: {
      descriptionContains: ["АВТОЗАПЧАСТИНИ", "EXIST", "AUTODOC", "ЗАПЧАСТИНИ"],
      transactionType: "expense",
    },
    action: { categoryCode: "MAT", autoConfirm: true },
    matchCount: 89,
    lastMatchedAt: "2025-01-27",
  },
  {
    id: "rule-10",
    name: "Оплата за ремонт → Дохід",
    priority: 80,
    isActive: true,
    cabinetId: "demo-autorepair-2",
    conditions: {
      descriptionContains: ["РЕМОНТ", "ТО ", "ДІАГНОСТИКА", "СТО"],
      transactionType: "income",
    },
    action: { categoryCode: "OTHER", autoConfirm: false },
    matchCount: 42,
    lastMatchedAt: "2025-01-26",
  },

  // === Consulting cabinet ===
  {
    id: "rule-11",
    name: "Оплата за консалтинг",
    priority: 90,
    isActive: true,
    cabinetId: "demo-consulting-3",
    conditions: {
      descriptionContains: ["КОНСУЛЬТАЦ", "АУДИТ", "ЮРИДИЧН"],
      transactionType: "income",
    },
    action: { categoryCode: "CONS", autoConfirm: true },
    matchCount: 31,
    lastMatchedAt: "2025-01-27",
  },

  // === Dealer cabinet ===
  {
    id: "rule-12",
    name: "Постачальники товарів",
    priority: 85,
    isActive: true,
    cabinetId: "demo-dealer-2",
    conditions: {
      descriptionContains: ["ПОСТАЧАЛЬНИК", "ТОВ ", "ФОП "],
      transactionType: "expense",
    },
    action: { categoryCode: "MAT", autoConfirm: false },
    matchCount: 67,
    lastMatchedAt: "2025-01-27",
  },
  {
    id: "rule-13",
    name: "Продаж товарів → Дохід",
    priority: 80,
    isActive: true,
    cabinetId: "demo-dealer-2",
    conditions: {
      descriptionContains: ["ПРОДАЖ", "РЕАЛІЗАЦІЯ", "ОПТОВИЙ"],
      transactionType: "income",
    },
    action: { categoryCode: "SALE", autoConfirm: true },
    matchCount: 54,
    lastMatchedAt: "2025-01-26",
  },

  // === Individual (physical person) tax discount rules ===
  {
    id: "rule-14",
    name: "Навчальні заклади → Знижка",
    priority: 85,
    isActive: true,
    conditions: {
      descriptionContains: ["УНІВЕРСИТЕТ", "ІНСТИТУТ", "АКАДЕМІЯ", "КНУ", "КПІ", "НАВЧАННЯ"],
      transactionType: "expense",
    },
    action: { categoryCode: "EDU", autoConfirm: false },
    matchCount: 14,
    lastMatchedAt: "2025-01-20",
  },
  {
    id: "rule-15",
    name: "Медичні заклади → Знижка",
    priority: 80,
    isActive: true,
    conditions: {
      descriptionContains: ["КЛІНІКА", "ЛІКАРНЯ", "СТОМАТОЛОГ", "ДОБРОБУТ", "БОРИС", "СИНЕВО"],
      transactionType: "expense",
    },
    action: { categoryCode: "MED", autoConfirm: false },
    matchCount: 8,
    lastMatchedAt: "2025-01-25",
  },
  {
    id: "rule-16",
    name: "Благодійні фонди → Знижка",
    priority: 75,
    isActive: true,
    conditions: {
      descriptionContains: ["БЛАГОДІЙН", "ПОВЕРНИСЬ ЖИВИМ", "UNITED24", "ПРИТУЛА", "ФОНД"],
      transactionType: "expense",
    },
    action: { categoryCode: "CHARITY", autoConfirm: false },
    matchCount: 22,
    lastMatchedAt: "2025-01-27",
  },
];

/**
 * Get bank rules for a specific cabinet (cabinet-specific + global)
 */
export function getBankRulesForCabinet(cabinetId: string): BankCategorizationRule[] {
  return [...DEMO_BANK_RULES]
    .filter(r => !r.cabinetId || r.cabinetId === cabinetId)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get all bank rules sorted by priority (highest first)
 */
export function getBankRulesSorted(): BankCategorizationRule[] {
  return [...DEMO_BANK_RULES].sort((a, b) => b.priority - a.priority);
}

/**
 * Get only active bank rules for a cabinet
 */
export function getActiveBankRules(cabinetId?: string): BankCategorizationRule[] {
  const rules = cabinetId ? getBankRulesForCabinet(cabinetId) : getBankRulesSorted();
  return rules.filter(r => r.isActive);
}

/**
 * Find matching rule for a transaction
 */
export function findMatchingRule(
  description: string,
  amount: number,
  transactionType: "income" | "expense",
  cabinetId?: string
): BankCategorizationRule | undefined {
  const normalizedDesc = description.toUpperCase();
  
  return getActiveBankRules(cabinetId).find(rule => {
    if (rule.conditions.transactionType && rule.conditions.transactionType !== transactionType) {
      return false;
    }
    if (rule.conditions.amountMin !== undefined && amount < rule.conditions.amountMin) {
      return false;
    }
    if (rule.conditions.amountMax !== undefined && amount > rule.conditions.amountMax) {
      return false;
    }
    if (rule.conditions.descriptionContains) {
      const matches = rule.conditions.descriptionContains.some(keyword => 
        normalizedDesc.includes(keyword.toUpperCase())
      );
      if (!matches) return false;
    }
    return true;
  });
}
