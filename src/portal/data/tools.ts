export interface Tool {
  id: string;
  emoji: string;
  name: string;
  description: string;
  usageCount: number;
  usageLabel: string;
  isPremium: boolean;
  slug: string;
  category: 'calculator' | 'calendar' | 'constructor' | 'reference' | 'management' | 'hr' | 'documents' | 'generator' | 'planning' | 'finance';
  isNew?: boolean;
}

export const TOOLS: Tool[] = [
  { id: 'esv', emoji: '🧮', name: 'Калькулятор ЄСВ', description: 'Розрахунок ЄСВ для ФОП та найнятих працівників по актуальних ставках 2026', usageCount: 12400, usageLabel: '12 400 розрахунків', isPremium: false, slug: 'esv-calc', category: 'calculator' },
  { id: 'tax', emoji: '💰', name: 'Калькулятор єдиного податку', description: 'Порівняння груп ФОП та розрахунок суми єдиного податку', usageCount: 9800, usageLabel: '9 800 розрахунків', isPremium: false, slug: 'tax-calc', category: 'calculator' },
  { id: 'salary', emoji: '💼', name: 'Калькулятор зарплати', description: 'Gross → Net з урахуванням ПДФО 18% та військового збору 5%', usageCount: 7200, usageLabel: '7 200 розрахунків', isPremium: false, slug: 'salary-calc', category: 'calculator' },
  { id: 'counterparty', emoji: '🏢', name: 'Перевірка контрагента', description: 'Статус, керівник, борги ДПС та відкриті справи за ЄДРПОУ', usageCount: 4100, usageLabel: '4 100 перевірок', isPremium: false, slug: 'counterparty', category: 'reference' },
  { id: 'kved', emoji: '🔍', name: 'Пошук КВЕД', description: 'Знайдіть свій КВЕД та перевірте сумісність з групами ФОП', usageCount: 3700, usageLabel: '3 700 пошуків', isPremium: false, slug: 'kved', category: 'reference' },
  { id: 'calendar', emoji: '📅', name: 'Податковий календар', description: 'Всі дедлайни з фільтром, нагадуваннями та Google Calendar export', usageCount: 18000, usageLabel: '18 000 переглядів', isPremium: false, slug: 'calendar', category: 'calendar' },
  { id: 'cashflow', emoji: '💸', name: 'Прогноз грошових потоків', description: 'Прогноз грошових потоків на 3, 6, 12 місяців', usageCount: 0, usageLabel: '', isPremium: false, slug: 'cashflow', category: 'management', isNew: true },
  { id: 'breakeven', emoji: '📊', name: 'Точка беззбитковості', description: 'Скільки потрібно продати щоб покрити всі витрати', usageCount: 0, usageLabel: '', isPremium: false, slug: 'breakeven', category: 'management', isNew: true },
  { id: 'vacation-calc', emoji: '🏖', name: 'Калькулятор відпускних', description: 'Розрахунок відпускних і лікарняних для найнятих', usageCount: 0, usageLabel: '', isPremium: false, slug: 'vacation-calc', category: 'hr', isNew: true },
  { id: 'invoice', emoji: '🧾', name: 'Генератор рахунків', description: 'Створити рахунок-фактуру PDF за 2 хвилини', usageCount: 0, usageLabel: '', isPremium: false, slug: 'invoice', category: 'documents', isNew: true },
  { id: 'hire-roi', emoji: '🤝', name: 'Калькулятор найму', description: 'Порівняти: найманий vs ФОП-виконавець vs аутсорс', usageCount: 0, usageLabel: '', isPremium: false, slug: 'hire-roi', category: 'hr', isNew: true },
  { id: 'credit-calc', emoji: '🏦', name: 'Кредитний калькулятор', description: 'Розрахунок платежів з порівнянням умов банків', usageCount: 0, usageLabel: '', isPremium: false, slug: 'credit-calc', category: 'calculator', isNew: true },
  { id: 'deposit-calc', emoji: '💎', name: 'Депозитний калькулятор', description: 'Дохідність вкладу з урахуванням капіталізації та податків', usageCount: 0, usageLabel: '', isPremium: false, slug: 'deposit-calc', category: 'calculator', isNew: true },
  { id: 'invest-calc', emoji: '📈', name: 'Інвестиційний калькулятор', description: 'Прогноз капіталу зі складними відсотками та інфляцією', usageCount: 0, usageLabel: '', isPremium: false, slug: 'invest-calc', category: 'calculator', isNew: true },
  { id: 'insurance-calc', emoji: '🛡', name: 'Калькулятор страхування', description: 'ОСЦПВ, КАСКО, здоров\'я, подорожі — порівняння компаній та розрахунок вартості', usageCount: 0, usageLabel: '', isPremium: false, slug: 'insurance-calc', category: 'calculator', isNew: true },
  { id: 'contracts', emoji: '📄', name: 'Конструктор договорів', description: 'Договір підряду, оренди, послуг — готовий Word за 5 хвилин', usageCount: 0, usageLabel: '', isPremium: true, slug: 'contract-builder', category: 'constructor' },
  { id: 'ai', emoji: '🤖', name: 'AI-асистент з податків', description: 'Питання природною мовою — відповідь з посиланням на норму ПКУ', usageCount: 0, usageLabel: '', isPremium: true, slug: 'ai-assistant', category: 'reference' },
  { id: 'alerts', emoji: '🔔', name: 'Моніторинг змін', description: 'Миттєві сповіщення при зміні будь-якої норми, що вас стосується', usageCount: 0, usageLabel: '', isPremium: true, slug: 'monitoring', category: 'reference' },

  // ── Особисті фінанси (фін-грамотність) ──
  { id: 'budget-503020', emoji: '🥧', name: 'Бюджет 50/30/20', description: 'Розкладка зарплати на потреби, бажання та заощадження за правилом Елізабет Воррен', usageCount: 0, usageLabel: '', isPremium: false, slug: 'budget-503020', category: 'planning', isNew: true },
  { id: 'emergency-fund', emoji: '🛟', name: 'Подушка безпеки', description: 'Скільки місяців витрат тримати про запас і за який термін зібрати', usageCount: 0, usageLabel: '', isPremium: false, slug: 'emergency-fund', category: 'planning', isNew: true },
  { id: 'debt-snowball', emoji: '❄️', name: 'План погашення боргів', description: 'Лавина (за ставкою) vs снігова куля (за сумою) — порівняння графіків', usageCount: 0, usageLabel: '', isPremium: false, slug: 'debt-snowball', category: 'planning', isNew: true },
  { id: 'rent-vs-buy', emoji: '🏠', name: 'Орендувати vs купити', description: 'NPV-порівняння оренди й іпотеки з урахуванням інфляції та інвест-доходу', usageCount: 0, usageLabel: '', isPremium: false, slug: 'rent-vs-buy', category: 'planning', isNew: true },
  { id: 'fire-calc', emoji: '🔥', name: 'FIRE / Фін-незалежність', description: 'Скільки треба капіталу та років до фінансової незалежності за правилом 4%', usageCount: 0, usageLabel: '', isPremium: false, slug: 'fire-calc', category: 'planning', isNew: true },
  { id: 'inflation-impact', emoji: '📉', name: 'Вплив інфляції', description: 'Реальна купівельна спроможність ваших грошей через 5/10/20 років', usageCount: 0, usageLabel: '', isPremium: false, slug: 'inflation-impact', category: 'planning', isNew: true },
  { id: 'goal-tracker', emoji: '🎯', name: 'Калькулятор цілі', description: 'Авто, житло, подорож — щомісячний внесок для досягнення суми у термін', usageCount: 0, usageLabel: '', isPremium: false, slug: 'goal-tracker', category: 'planning', isNew: true },
  { id: 'net-worth', emoji: '⚖️', name: 'Особистий баланс', description: 'Активи − борги: ваш реальний капітал і його динаміка', usageCount: 0, usageLabel: '', isPremium: false, slug: 'net-worth', category: 'planning', isNew: true },

  // ── Бізнес-планування (фін-грамотність власника) ──
  { id: 'unit-economy', emoji: '📐', name: 'Unit-економіка', description: 'CAC, LTV, payback, маржа на одиницю продукту/клієнта', usageCount: 0, usageLabel: '', isPremium: false, slug: 'unit-economy', category: 'finance', isNew: true },
  { id: 'pricing-calc', emoji: '🏷', name: 'Ціноутворення', description: 'Cost-plus, value-based, конкурентне — порівняння маржі та націнки', usageCount: 0, usageLabel: '', isPremium: false, slug: 'pricing-calc', category: 'finance', isNew: true },
  { id: 'runway-calc', emoji: '✈️', name: 'Бізнес-runway', description: 'На скільки місяців вистачить грошей при поточному burn rate', usageCount: 0, usageLabel: '', isPremium: false, slug: 'runway-calc', category: 'finance', isNew: true },
  { id: 'fop-vs-too', emoji: '⚖️', name: 'ФОП vs ТОВ', description: 'Сума податків при різних режимах для вашого обороту і витрат', usageCount: 0, usageLabel: '', isPremium: false, slug: 'fop-vs-too', category: 'finance', isNew: true },
  { id: 'import-tco', emoji: '📦', name: 'Собівартість імпорту (TCO)', description: 'FOB + фрахт + мито + ПДВ + акциз + брокер — повна собівартість ввезення', usageCount: 0, usageLabel: '', isPremium: false, slug: 'import-tco', category: 'calculator', isNew: true },
  { id: 'vehicle-customs', emoji: '🚗', name: 'Розмитнення авто', description: 'Мито, акциз з коеф. віку, ПДВ, збір ПФУ — повна вартість ввезення легкового авто', usageCount: 0, usageLabel: '', isPremium: false, slug: 'vehicle-customs', category: 'calculator', isNew: true },
  { id: 'vin-decoder', emoji: '🔍', name: 'VIN-декодер', description: 'Виробник, рік, регіон, контрольна цифра з VIN-коду авто. ISO 3779/3780', usageCount: 0, usageLabel: '', isPremium: false, slug: 'vin-decoder', category: 'calculator', isNew: true },
];
