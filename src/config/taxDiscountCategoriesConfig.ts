/**
 * Tax Discount Categories Configuration
 * Centralized config for all Art. 166 PKU tax discount categories
 * with limits, PKU articles, bank keywords, and wizard questions
 */

export interface TaxDiscountCategory {
  id: string;
  emoji: string;
  name: string;
  shortName: string;
  pkuArticle: string;
  pkuDescription: string;
  pitRate: number; // 0.18

  // Limit calculation
  limitType: "mzp-multiple" | "percentage-of-income" | "actual" | "area-based";
  limitMultiplier?: number; // e.g. 3 for 3×МЗП
  limitPercentage?: number; // e.g. 0.04 for 4%
  limitNote: string;

  // Wizard question
  wizardQuestion: string;
  wizardFollowUp?: string;
  wizardHint?: string;
  eligibilityWarning?: string;

  // Bank scanner keywords (uppercase)
  bankKeywords: string[];

  // Document checklist
  requiredDocuments: string[];
}

const MZP_2026 = 8_647;

export const TAX_DISCOUNT_CATEGORIES: TaxDiscountCategory[] = [
  {
    id: "education",
    emoji: "📚",
    name: "Навчання",
    shortName: "Навчання",
    pkuArticle: "ст. 166.3.3",
    pkuDescription: "Витрати на навчання платника або його родича першого ступеня",
    pitRate: 0.18,
    limitType: "mzp-multiple",
    limitMultiplier: 3,
    limitNote: `3 × МЗП = ${(MZP_2026 * 3).toLocaleString("uk-UA")} ₴ на кожну особу/рік`,
    wizardQuestion: "Чи платили ви за навчання у 2025 році (своє або дитини)?",
    wizardFollowUp: "Вкажіть навчальний заклад і суму оплати",
    wizardHint: "Включає ВНЗ, курси, тренінги з ліцензією МОН",
    bankKeywords: [
      "УНІВЕРСИТЕТ", "ІНСТИТУТ", "АКАДЕМІЯ", "КОЛЕДЖ", "ЛІЦЕЙ", "ШКОЛА",
      "КНУ", "КПІ", "НАУ", "ХНУРЕ", "ЛНУ", "НТУУ",
      "КУРС", "НАВЧАННЯ", "ОСВІТ", "EDUCATION", "UDEMY", "COURSERA",
      "ДІДЖИТАЛ АКАДЕМІЯ", "PROJECTOR", "MATE ACADEMY", "GOIT",
    ],
    requiredDocuments: [
      "Договір з навчальним закладом",
      "Квитанції/платіжки про оплату",
      "Копія ліцензії закладу (якщо не ВНЗ)",
      "Довідка про навчання (форма №2)",
    ],
  },
  {
    id: "education-child",
    emoji: "📚",
    name: "Навчання дитини",
    shortName: "Навчання дитини",
    pkuArticle: "ст. 166.3.3",
    pkuDescription: "Витрати на навчання родича першого ступеня споріднення",
    pitRate: 0.18,
    limitType: "mzp-multiple",
    limitMultiplier: 3,
    limitNote: `3 × МЗП = ${(MZP_2026 * 3).toLocaleString("uk-UA")} ₴ на кожну дитину/рік`,
    wizardQuestion: "Чи платили ви за навчання дитини у ВНЗ або школі?",
    wizardFollowUp: "Вкажіть заклад, ім'я дитини та суму",
    wizardHint: "Окремий ліміт на кожну дитину",
    bankKeywords: [],
    requiredDocuments: [
      "Договір з навчальним закладом (на ім'я платника)",
      "Квитанції про оплату",
      "Свідоцтво про народження дитини",
      "Довідка про навчання",
    ],
  },
  {
    id: "medical",
    emoji: "🏥",
    name: "Лікування",
    shortName: "Лікування",
    pkuArticle: "ст. 166.3.4",
    pkuDescription: "Витрати на лікування платника або його родича першого ступеня",
    pitRate: 0.18,
    limitType: "actual",
    limitNote: "Без ліміту (фактичні витрати)",
    wizardQuestion: "Чи платили ви за лікування або медичні послуги?",
    wizardFollowUp: "Вкажіть клініку, вид послуги та суму",
    eligibilityWarning: "⚠️ Знижка лише для: осіб з інвалідністю I/II групи, учасників бойових дій, батьків дітей з інвалідністю. Перевірте свій статус перед подачею.",
    bankKeywords: [
      "КЛІНІКА", "ЛІКАРНЯ", "МЕДИЧН", "СТОМАТОЛОГ", "АПТЕКА", "ФАРМАЦІЯ",
      "БОРИС", "ДОБРОБУТ", "EUROLAB", "INTO-SANA", "ОБЕРІГ", "ІСІДА",
      "ПРОТЕЗУВАННЯ", "ДІАГНОСТИК", "ЛАБОРАТОРІЯ", "СИНЕВО", "ДИЛА",
    ],
    requiredDocuments: [
      "Договір з медичним закладом",
      "Акт наданих послуг / рахунок-фактура",
      "Фіскальні чеки/квитанції",
      "Довідка про інвалідність / статус УБД (якщо потрібно)",
      "Рецепт лікаря (для ліків)",
    ],
  },
  {
    id: "mortgage",
    emoji: "🏠",
    name: "Іпотека",
    shortName: "Іпотека",
    pkuArticle: "ст. 166.3.1",
    pkuDescription: "Відсотки за іпотечним кредитом на перше житло",
    pitRate: 0.18,
    limitType: "area-based",
    limitNote: "Площа житла ≤ 100 м². Тільки відсотки, не тіло кредиту.",
    wizardQuestion: "Чи маєте ви іпотечний кредит (перше житло)?",
    wizardFollowUp: "Вкажіть суму сплачених відсотків і площу житла",
    wizardHint: "Тільки перше житло. Площа не більше 100 м². Тільки відсотки.",
    bankKeywords: [
      "ІПОТЕК", "MORTGAGE", "КРЕДИТ ЖИТЛ", "ВІДСОТКИ",
    ],
    requiredDocuments: [
      "Кредитний іпотечний договір",
      "Довідка банку про сплачені відсотки за рік",
      "Договір купівлі-продажу житла",
      "Витяг з Держреєстру речових прав",
    ],
  },
  {
    id: "insurance",
    emoji: "🛡️",
    name: "Страхування",
    shortName: "Страхування",
    pkuArticle: "ст. 166.3.5",
    pkuDescription: "Довгострокове страхування життя, пенсійні внески",
    pitRate: 0.18,
    limitType: "mzp-multiple",
    limitMultiplier: 1.4,
    limitNote: `1,4 × МЗП × 12 = ${Math.round(MZP_2026 * 1.4 * 12).toLocaleString("uk-UA")} ₴/рік`,
    wizardQuestion: "Чи маєте ви довгострокове страхування життя (від 5 років)?",
    wizardFollowUp: "Вкажіть страхову компанію та суму внесків",
    wizardHint: "Тільки договори від 5 років. Пенсійні внески також підходять.",
    bankKeywords: [
      "СТРАХОВ", "INSURANCE", "МЕТЛАЙФ", "METLIFE", "PZU", "УНІКА", "UNICA",
      "ПРОВІДНА", "ALLIANZ", "СТРАХ ЖИТТЯ", "PENSION",
    ],
    requiredDocuments: [
      "Страховий договір (строк ≥ 5 років)",
      "Квитанції про сплату внесків",
      "Довідка від страхової про сплачені суми",
    ],
  },
  {
    id: "charity",
    emoji: "🤝",
    name: "Благодійність",
    shortName: "Благодійність",
    pkuArticle: "ст. 166.3.2",
    pkuDescription: "Благодійні внески на користь неприбуткових організацій",
    pitRate: 0.18,
    limitType: "percentage-of-income",
    limitPercentage: 0.04,
    limitNote: "Не більше 4% від річного оподатковуваного доходу",
    wizardQuestion: "Чи робили ви благодійні внески у 2025 році?",
    wizardFollowUp: "Вкажіть організацію та суму",
    wizardHint: "Тільки на користь організацій з Реєстру неприбуткових",
    bankKeywords: [
      "БЛАГОДІЙН", "ФОНД", "CHARITY", "DONATE", "DONATION",
      "ПОВЕРНИСЬ ЖИВИМ", "COME BACK ALIVE", "UNITED24", "ЮНАЙТЕД",
      "PRYTULA", "ПРИТУЛА", "СЕРГІЙ ПРИТУЛА",
      "ЧЕРВОНИЙ ХРЕСТ", "RED CROSS", "ВОЛОНТЕР",
    ],
    requiredDocuments: [
      "Квитанція/платіжне доручення про переказ",
      "Підтвердження статусу організації (неприбуткова)",
    ],
  },
  {
    id: "gas-conversion",
    emoji: "⛽",
    name: "Переобладнання на газ",
    shortName: "Авто на газ",
    pkuArticle: "ст. 166.3.7",
    pkuDescription: "Витрати на переобладнання авто для роботи на газовому паливі",
    pitRate: 0.18,
    limitType: "actual",
    limitNote: "Фактичні витрати без обмеження",
    wizardQuestion: "Чи переобладнували ви авто на газове паливо (ГБО)?",
    wizardFollowUp: "Вкажіть СТО та суму робіт",
    bankKeywords: [
      "ГБО", "ГАЗОБАЛОН", "ПЕРЕОБЛАДНАН", "LPG", "CNG",
    ],
    requiredDocuments: [
      "Договір на переобладнання",
      "Акт виконаних робіт",
      "Сертифікат відповідності",
      "Квитанція про оплату",
    ],
  },
  {
    id: "reproductive",
    emoji: "🍼",
    name: "Репродуктивні технології",
    shortName: "ЕКЗ",
    pkuArticle: "ст. 166.3.6",
    pkuDescription: "Витрати на допоміжні репродуктивні технології",
    pitRate: 0.18,
    limitType: "actual",
    limitNote: "Фактичні витрати без обмеження",
    wizardQuestion: "Чи використовували ви допоміжні репродуктивні технології (ЕКЗ)?",
    wizardFollowUp: "Вкажіть клініку та суму",
    bankKeywords: [
      "РЕПРОДУКТ", "ЕКЗ", "IVF", "НАДІЯ", "ІСІДА", "ISIDA",
      "КЛІНІКА РЕПРОДУК", "FERTILITY",
    ],
    requiredDocuments: [
      "Договір з клінікою",
      "Акт наданих послуг",
      "Фіскальні чеки / квитанції",
    ],
  },
  {
    id: "affordable-housing",
    emoji: "🏗️",
    name: "Доступне житло",
    shortName: "Держпрограма",
    pkuArticle: "ст. 166.3.8",
    pkuDescription: "Витрати на будівництво/придбання житла за державними програмами",
    pitRate: 0.18,
    limitType: "actual",
    limitNote: "Фактичні витрати в рамках держпрограми",
    wizardQuestion: "Чи купували/будували ви житло за державною програмою?",
    wizardFollowUp: "Вкажіть програму та суму внесків",
    bankKeywords: [
      "ДОСТУПНЕ ЖИТЛО", "ДЕРЖПРОГРАМ", "ЄОСЕЛЯ", "МОЛОДІЖН ЖИТЛ",
    ],
    requiredDocuments: [
      "Договір участі в держпрограмі",
      "Квитанції про оплату внесків",
      "Підтвердження від управління житлової політики",
    ],
  },
];

/**
 * Get category by id
 */
export function getTaxDiscountCategory(id: string): TaxDiscountCategory | undefined {
  return TAX_DISCOUNT_CATEGORIES.find(c => c.id === id);
}

/**
 * Get category by emoji (for matching with demo records)
 */
export function getTaxDiscountCategoryByEmoji(emoji: string): TaxDiscountCategory | undefined {
  return TAX_DISCOUNT_CATEGORIES.find(c => c.emoji === emoji);
}

/**
 * Calculate limit for a category
 */
export function calculateDiscountLimit(
  category: TaxDiscountCategory,
  annualIncome?: number
): number | null {
  switch (category.limitType) {
    case "mzp-multiple":
      return Math.round(MZP_2026 * (category.limitMultiplier || 1));
    case "percentage-of-income":
      return annualIncome ? Math.round(annualIncome * (category.limitPercentage || 0)) : null;
    case "actual":
    case "area-based":
      return null; // No fixed limit
  }
}

/**
 * Get all bank keywords from all categories (for scanner)
 */
export function getAllBankKeywords(): { keyword: string; categoryId: string }[] {
  return TAX_DISCOUNT_CATEGORIES.flatMap(cat =>
    cat.bankKeywords.map(keyword => ({ keyword, categoryId: cat.id }))
  );
}

export const MZP_AMOUNT = MZP_2026;
