// AI-powered onboarding personalization

import { RegistryData, KVEDCode } from './registryIntegration';

export interface AIRecommendation {
  type: 'template' | 'tax' | 'integration' | 'tip' | 'warning';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    route?: string;
  };
}

export interface PersonalizationResult {
  welcomeMessage: string;
  industryProfile: string;
  recommendations: AIRecommendation[];
  suggestedTemplates: string[];
  dashboardConfig: {
    primaryWidgets: string[];
    quickActions: string[];
  };
}

// KVED to industry mapping
const KVED_INDUSTRY_MAP: Record<string, string> = {
  '62': 'IT та програмування',
  '63': 'Інформаційні технології',
  '70': 'Консалтинг',
  '73': 'Реклама та маркетинг',
  '74': 'Дизайн та креатив',
  '69': 'Юридичні послуги',
  '66': 'Фінансові послуги',
  '47': 'Роздрібна торгівля',
  '46': 'Оптова торгівля',
  '41': 'Будівництво',
  '56': 'Ресторанний бізнес',
  '55': 'Готельний бізнес',
  '86': 'Медичні послуги',
  '85': 'Освітні послуги',
  '49': 'Транспорт та логістика',
  '01': 'Сільське господарство',
};

// Get industry from primary KVED
const getIndustryFromKVED = (kveds: KVEDCode[]): string => {
  const primaryKved = kveds.find(k => k.isPrimary) || kveds[0];
  if (!primaryKved) return 'Загальний бізнес';
  
  const prefix = primaryKved.code.substring(0, 2);
  return KVED_INDUSTRY_MAP[prefix] || 'Інші послуги';
};

// Generate recommendations based on KVEDs
const getKVEDRecommendations = (kveds: KVEDCode[], entityType: 'tov' | 'fop' | 'individual'): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  const kvedCodes = kveds.map(k => k.code);
  
  // IT sector recommendations
  if (kvedCodes.some(c => c.startsWith('62') || c.startsWith('63'))) {
    recommendations.push({
      type: 'template',
      title: 'Шаблони IT-договорів',
      description: 'Договори на розробку ПЗ, технічну підтримку та консалтинг',
      priority: 'high',
      action: { label: 'Переглянути', route: '/templates' },
    });
    
    if (entityType === 'fop') {
      recommendations.push({
        type: 'tax',
        title: 'Дія.City',
        description: 'Оптимізація ЄСВ для IT-спеціалістів',
        priority: 'medium',
        action: { label: 'Дізнатися більше' },
      });
    }
  }
  
  // Trade recommendations
  if (kvedCodes.some(c => c.startsWith('46') || c.startsWith('47'))) {
    recommendations.push({
      type: 'integration',
      title: 'Касове обладнання',
      description: 'Підключення РРО/ПРРО для автообліку продажів',
      priority: 'high',
      action: { label: 'Налаштувати' },
    });
  }
  
  // Design/Creative recommendations
  if (kvedCodes.some(c => c.startsWith('74') || c.startsWith('73'))) {
    recommendations.push({
      type: 'template',
      title: 'Договори з клієнтами',
      description: 'Шаблони на дизайн, авторські права та NDA',
      priority: 'high',
    });
  }
  
  // VAT payer recommendation for large businesses
  if (entityType === 'tov') {
    recommendations.push({
      type: 'tip',
      title: 'Автозвітність',
      description: 'Податкова звітність формується автоматично',
      priority: 'medium',
    });
  }
  
  return recommendations;
};

// Generate tax-specific recommendations
const getTaxRecommendations = (data: RegistryData): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  
  if (data.tax.vatPayer) {
    recommendations.push({
      type: 'tip',
      title: 'ПДВ декларації',
      description: 'AI формує декларації та реєстр податкових накладних',
      priority: 'high',
    });
  }
  
  if (data.tax.singleTax) {
    const { group } = data.tax.singleTax;
    
    if (group === 3) {
      recommendations.push({
        type: 'tip',
        title: 'Декларація ЄП',
        description: 'Нагадування про квартальні дедлайни',
        priority: 'high',
      });
    }
    
    recommendations.push({
      type: 'warning',
      title: 'Ліміт доходу',
      description: `Контроль ліміту для ${group} групи ЄП`,
      priority: 'medium',
    });
  }
  
  return recommendations;
};

// Get suggested templates based on activity
const getSuggestedTemplates = (data: RegistryData): string[] => {
  const templates: string[] = [];
  const kvedCodes = data.activity.kveds.map(k => k.code);
  
  // Universal templates
  templates.push('Акт виконаних робіт');
  templates.push('Рахунок-фактура');
  
  if (data.entityType === 'tov') {
    templates.push('Договір з контрагентом');
    templates.push('Довіреність');
  } else {
    templates.push('Договір ФОП');
  }
  
  // Industry-specific
  if (kvedCodes.some(c => c.startsWith('62'))) {
    templates.push('Договір на ПЗ');
    templates.push('NDA');
  }
  
  if (kvedCodes.some(c => c.startsWith('74'))) {
    templates.push('Договір на дизайн');
  }
  
  return templates.slice(0, 5);
};

// Get dashboard configuration
const getDashboardConfig = (data: RegistryData): PersonalizationResult['dashboardConfig'] => {
  const config = {
    primaryWidgets: ['income', 'taxes', 'documents'],
    quickActions: ['create-invoice', 'create-act'],
  };
  
  if (data.tax.vatPayer) {
    config.primaryWidgets.push('vat-balance');
    config.quickActions.push('create-tax-invoice');
  }
  
  if (data.tax.singleTax) {
    config.primaryWidgets.push('single-tax-limit');
    config.quickActions.push('pay-esv');
  }
  
  if (data.entityType === 'tov') {
    config.quickActions.push('salary-calc');
  }
  
  return config;
};

// Main personalization function
export const generatePersonalization = (data: RegistryData): PersonalizationResult => {
  // Спеціальний сценарій для фізособи (без КВЕДів та юр. реквізитів)
  if (data.entityType === 'individual') {
    const welcomeMessage = `Вітаємо, ${data.leadership.director}! Ваш кабінет фізособи готовий — допоможемо з декларацією, інвестиціями та майном.`;
    const recommendations: AIRecommendation[] = [
      { type: 'tip', title: 'Декларація про доходи', description: 'Нагадаємо до 1 травня й допоможемо подати онлайн', priority: 'high' },
      { type: 'integration', title: 'Іноземні доходи', description: 'Залік сплаченого податку (КУПО) — автоматично', priority: 'medium' },
      { type: 'tip', title: 'Майно та авто', description: 'Розрахунок податку на нерухомість і транспорт', priority: 'medium' },
    ];
    return {
      welcomeMessage,
      industryProfile: 'Особисті фінанси',
      recommendations,
      suggestedTemplates: ['Декларація про майновий стан', 'Заява на податкову знижку', 'Розписка про отримання коштів'],
      dashboardConfig: {
        primaryWidgets: ['income', 'taxes', 'investments', 'property'],
        quickActions: ['add-income', 'declare-tax', 'add-property'],
      },
    };
  }

  const industry = getIndustryFromKVED(data.activity.kveds);

  const welcomeMessage = data.entityType === 'tov'
    ? `Вітаємо, ${data.leadership.director}! Систему налаштовано для ${data.basic.shortName || data.basic.name}. Сфера: ${industry.toLowerCase()}.`
    : `Вітаємо, ${data.leadership.director}! Ваша сфера — "${industry}". Систему персоналізовано.`;

  const recommendations: AIRecommendation[] = [
    ...getKVEDRecommendations(data.activity.kveds, data.entityType),
    ...getTaxRecommendations(data),
  ];

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    welcomeMessage,
    industryProfile: industry,
    recommendations: recommendations.slice(0, 3),
    suggestedTemplates: getSuggestedTemplates(data),
    dashboardConfig: getDashboardConfig(data),
  };
};

// Generate quick AI greeting for welcome step - user-centric, value-focused
export const getAIGreeting = (userType?: 'business' | 'fop' | 'individual'): string[] => {
  if (userType === 'individual') {
    return [
      'Привіт! Я — ваш AI-помічник для особистих фінансів.',
      'Декларація, інвестиції, майно — без рутини.',
      'За хвилину все налаштуємо.',
    ];
  }
  if (userType === 'fop') {
    return [
      'Привіт! Я — ваш AI-помічник ФОП.',
      'Книга обліку, ЄП, ЄСВ і звітність — автоматично.',
      'За хвилину все налаштуємо.',
    ];
  }
  return [
    'Привіт! Я — ваш AI-помічник.',
    'Автоматизую документи, податки та звітність.',
    'За хвилину все налаштуємо.',
  ];
};