// Individual cabinet onboarding configuration

export interface IntegrationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'brokers' | 'banks' | 'gov';
  comingSoon?: boolean;
}

export interface IntegrationCategory {
  id: 'brokers' | 'banks' | 'gov';
  title: string;
  description: string;
  icon: string;
}

export interface SystemGuideItem {
  id: string;
  documentName: string;
  purpose: string;
  automation: string;
  icon: string;
  hint?: string;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    id: 'brokers',
    title: 'Брокери',
    description: 'Імпорт брокерських звітів',
    icon: 'trending-up',
  },
  {
    id: 'banks',
    title: 'Банки',
    description: 'Банківські виписки та рахунки',
    icon: 'landmark',
  },
  {
    id: 'gov',
    title: 'Держсервіси',
    description: 'Державні реєстри та портали',
    icon: 'shield-check',
  },
];

export const INTEGRATION_OPTIONS: IntegrationOption[] = [
  // Brokers
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    description: 'Автоматичний імпорт Activity Statement',
    icon: 'bar-chart-3',
    category: 'brokers',
  },
  {
    id: 'freedom',
    name: 'Freedom Finance',
    description: 'Імпорт звітів про операції',
    icon: 'line-chart',
    category: 'brokers',
    comingSoon: true,
  },
  // Banks
  {
    id: 'monobank',
    name: 'Monobank',
    description: 'Виписки через API',
    icon: 'credit-card',
    category: 'banks',
  },
  {
    id: 'privatbank',
    name: 'ПриватБанк',
    description: 'Імпорт виписок',
    icon: 'wallet',
    category: 'banks',
    comingSoon: true,
  },
  {
    id: 'wise',
    name: 'Wise',
    description: 'Міжнародні перекази та валютні рахунки',
    icon: 'globe',
    category: 'banks',
    comingSoon: true,
  },
  // Gov services
  {
    id: 'diia',
    name: 'Дія',
    description: 'Документи та сервіси',
    icon: 'smartphone',
    category: 'gov',
    comingSoon: true,
  },
  {
    id: 'tax-cabinet',
    name: 'Кабінет платника',
    description: 'Електронний кабінет ДПС',
    icon: 'file-text',
    category: 'gov',
  },
  {
    id: 'property-registry',
    name: 'Реєстри майна',
    description: 'Державний реєстр речових прав',
    icon: 'home',
    category: 'gov',
    comingSoon: true,
  },
];

export const SYSTEM_GUIDE_ITEMS: SystemGuideItem[] = [
  {
    id: 'broker-report',
    documentName: 'Брокерський звіт',
    purpose: 'Розрахунок інвестиційного прибутку',
    automation: 'Автоматичний розрахунок за методом FIFO, конвертація валют за курсом НБУ',
    icon: 'file-spreadsheet',
  },
  {
    id: 'foreign-income',
    documentName: 'Довідки про іноземні доходи',
    purpose: 'Залік сплаченого податку за кордоном',
    automation: 'Автоматичне формування КУПО та розрахунок різниці до сплати',
    icon: 'globe',
  },
  {
    id: 'sale-contracts',
    documentName: 'Договори купівлі-продажу',
    purpose: 'Визначення оподаткування операцій з майном',
    automation: 'Автоматичне визначення пільг та розрахунок бази оподаткування',
    icon: 'file-signature',
  },
  {
    id: 'bank-statements',
    documentName: 'Банківські виписки',
    purpose: 'Категоризація та облік доходів',
    automation: 'AI-категоризація транзакцій за типами доходів',
    icon: 'receipt',
  },
  {
    id: 'tax-deduction',
    documentName: 'Квитанції (навчання, медицина)',
    purpose: 'Податкова знижка',
    automation: 'Автоматичне формування додатку до декларації',
    icon: 'heart-pulse',
  },
  {
    id: 'property-manual',
    documentName: 'Реєстр майна',
    purpose: 'Облік нерухомого та рухомого майна',
    automation: 'Ручний ввід або завантаження документів з AI-розпізнаванням',
    icon: 'home',
    hint: 'Доступно в Налаштуваннях → Довідники після створення кабінету',
  },
];
