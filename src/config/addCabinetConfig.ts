// Add Cabinet onboarding configuration and types

export type AddCabinetStep = 
  | 'scenario'
  | 'cabinet-type'
  | 'auth-method'
  | 'registry-sync'
  | 'verify-data'
  | 'integrations-setup'
  | 'system-guide'
  | 'ai-personalization'
  | 'team-invite'
  | 'complete';

export type AddCabinetScenario = 'owner' | 'member';

export interface CabinetTypeOption {
  id: 'fop' | 'tov' | 'individual' | 'fop-group';
  title: string;
  description: string;
  icon: string;
  recommended?: boolean;
  socialProof?: string;
  secondary?: boolean;
}

export const CABINET_TYPE_OPTIONS: CabinetTypeOption[] = [
  {
    id: 'fop',
    title: 'ФОП',
    description: 'Фізична особа-підприємець',
    icon: 'user',
    recommended: true,
    socialProof: '65% кабінетів',
  },
  {
    id: 'individual',
    title: 'Фізична особа',
    description: 'Без підприємницької діяльності',
    icon: 'id-card',
    recommended: true,
    socialProof: '28% кабінетів',
  },
  {
    id: 'tov',
    title: 'ТОВ',
    description: 'Товариство з обмеженою відповідальністю',
    icon: 'building-2',
    secondary: true,
  },
  // Прибрано опцію "Група ФОП" — такого типу юр.особи не існує в Україні.
  // Сімейний/партнерський бізнес моделюється через кілька кабінетів ФОП із делегаціями.
];

export interface AddCabinetStepConfig {
  id: AddCabinetStep;
  title: string;
  description: string;
  icon: string;
  progressStage: number; // 1-4 for progress indicator
}

export const ADD_CABINET_STEPS: AddCabinetStepConfig[] = [
  {
    id: 'scenario',
    title: 'Вибір',
    description: 'Сценарій підключення',
    icon: 'git-branch',
    progressStage: 1,
  },
  {
    id: 'cabinet-type',
    title: 'Тип',
    description: 'Тип кабінету',
    icon: 'layout-grid',
    progressStage: 1,
  },
  {
    id: 'auth-method',
    title: 'Підключення',
    description: 'Метод ідентифікації',
    icon: 'key',
    progressStage: 2,
  },
  {
    id: 'registry-sync',
    title: 'Підключення',
    description: 'Синхронізація',
    icon: 'refresh-cw',
    progressStage: 2,
  },
  {
    id: 'verify-data',
    title: 'Налаштування',
    description: 'Перевірка даних',
    icon: 'check-circle',
    progressStage: 3,
  },
  {
    id: 'integrations-setup',
    title: 'Інтеграції',
    description: 'Зовнішні сервіси',
    icon: 'plug',
    progressStage: 2,
  },
  {
    id: 'system-guide',
    title: 'Гайд',
    description: 'Як працює система',
    icon: 'lightbulb',
    progressStage: 3,
  },
  {
    id: 'ai-personalization',
    title: 'Персоналізація',
    description: 'AI налаштування',
    icon: 'brain',
    progressStage: 3,
  },
  {
    id: 'team-invite',
    title: 'Команда',
    description: 'Запрошення команди',
    icon: 'users',
    progressStage: 4,
  },
  {
    id: 'complete',
    title: 'Готово',
    description: 'Кабінет створено',
    icon: 'rocket',
    progressStage: 4,
  },
];

// Progress stages for visual indicator
export const PROGRESS_STAGES = [
  { stage: 1, title: 'Вибір', steps: ['scenario', 'cabinet-type'] },
  { stage: 2, title: 'Підключення', steps: ['auth-method', 'registry-sync'] },
  { stage: 3, title: 'Налаштування', steps: ['verify-data', 'ai-personalization'] },
  { stage: 4, title: 'Завершення', steps: ['team-invite', 'complete'] },
];

// FOP tax groups configuration
export const FOP_GROUPS = [
  { 
    value: 1, 
    label: '1 група', 
    description: 'До 1 млн грн/рік',
    limit: 1002000,
  },
  { 
    value: 2, 
    label: '2 група', 
    description: 'До 5 млн грн/рік',
    limit: 5004000,
  },
  { 
    value: 3, 
    label: '3 група', 
    description: 'До 7.8 млн грн/рік',
    limit: 7818000,
  },
] as const;
