// Onboarding configuration and types

export type OnboardingStep = 
  | 'welcome'
  | 'auth-method'
  | 'kep-auth'
  | 'manual-entry'
  | 'registry-sync'
  | 'verify-data'
  | 'ai-personalization'
  | 'interactive-tour'
  | 'complete';

export interface OnboardingStepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  icon: string;
  duration?: number; // estimated time in seconds
}

// Simplified to 4 user-visible steps
export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'welcome',
    title: 'Вітання',
    description: 'Знайомство з AI-асистентом',
    icon: 'sparkles',
  },
  {
    id: 'auth-method',
    title: 'Підключення',
    description: 'Підтвердження особи',
    icon: 'key',
  },
  {
    id: 'kep-auth',
    title: 'Підключення',
    description: 'Автентифікація',
    icon: 'shield-check',
  },
  {
    id: 'registry-sync',
    title: 'Підключення',
    description: 'Завантаження даних',
    icon: 'refresh-cw',
    duration: 8,
  },
  {
    id: 'verify-data',
    title: 'Налаштування',
    description: 'Перевірка даних',
    icon: 'check-circle',
  },
  {
    id: 'ai-personalization',
    title: 'Персоналізація',
    description: 'AI налаштування',
    icon: 'brain',
  },
  {
    id: 'interactive-tour',
    title: 'Готово',
    description: 'Огляд системи',
    icon: 'compass',
  },
  {
    id: 'complete',
    title: 'Готово',
    description: 'Онбординг завершено',
    icon: 'rocket',
  },
];

// Primary methods (recommended) - shown as large cards
export const PRIMARY_AUTH_METHODS = [
  {
    id: 'kep',
    title: 'КЕП-ключ',
    description: 'Найшвидший спосіб — дані заповняться автоматично',
    icon: 'key',
    recommended: true,
    socialProof: '78% користувачів',
    benefits: ['Автозаповнення з ЄДР', 'Підпис документів', 'Максимальний захист'],
  },
  {
    id: 'diia',
    title: 'Дія.Підпис',
    description: 'Без додаткових пристроїв — лише ваш телефон',
    icon: 'smartphone',
    recommended: true,
    socialProof: '15% користувачів',
    benefits: ['Без носіїв', 'Швидко та зручно', 'Дані з реєстрів'],
  },
] as const;

// Secondary methods - shown in collapsible section
export const SECONDARY_AUTH_METHODS = [
  {
    id: 'bankid',
    title: 'BankID',
    description: 'Вхід через ваш банк',
    icon: 'landmark',
    recommended: false,
    benefits: ['Через мобільний банкінг'],
  },
  {
    id: 'manual',
    title: 'Ручний ввід',
    description: 'Заповнити дані самостійно',
    icon: 'edit',
    recommended: false,
    benefits: ['Без додаткових інструментів'],
  },
] as const;

// Combined for backwards compatibility
export const AUTH_METHODS = [...PRIMARY_AUTH_METHODS, ...SECONDARY_AUTH_METHODS] as const;

export type AuthMethod = typeof AUTH_METHODS[number]['id'];

// Simplified tour - 4 essential steps
export const TOUR_STEPS = [
  {
    id: 'ai-assistant',
    target: '[data-tour="ai-assistant"]',
    title: 'AI-асистент',
    description: 'Задавайте питання, створюйте документи, отримуйте консультації — все через природну мову.',
    icon: 'sparkles',
  },
  {
    id: 'documents',
    target: '[data-tour="documents"]',
    title: 'Документи',
    description: 'AI розпізнає, класифікує та заповнює документи. Шаблони адаптуються під вашу діяльність.',
    icon: 'file-text',
  },
  {
    id: 'operations',
    target: '[data-tour="operations"]',
    title: 'Платежі та податки',
    description: 'Відстежуйте платежі та звітність. Система нагадає про дедлайни.',
    icon: 'activity',
  },
  {
    id: 'settings',
    target: '[data-tour="settings"]',
    title: 'Налаштування',
    description: 'Персоналізуйте систему, підключіть інтеграції та сповіщення.',
    icon: 'settings',
  },
];