export interface ComparisonItem {
  type: 'pro' | 'con';
  text: string;
}

export interface ComparisonData {
  leftTitle: string;
  rightTitle: string;
  leftItems: ComparisonItem[];
  rightItems: ComparisonItem[];
}

export const COMPARISONS: Record<string, ComparisonData> = {
  'fop-vs-tov-2025': {
    leftTitle: 'ФОП',
    rightTitle: 'ТОВ',
    leftItems: [
      { type: 'pro', text: 'Проста і безкоштовна реєстрація' },
      { type: 'pro', text: 'Менше звітності' },
      { type: 'pro', text: 'Нижчі витрати на старті' },
      { type: 'con', text: 'Особиста відповідальність' },
      { type: 'con', text: 'Складніше масштабувати' },
    ],
    rightItems: [
      { type: 'pro', text: 'Захист особистого майна' },
      { type: 'pro', text: 'Можна залучати інвесторів' },
      { type: 'pro', text: 'Частки у власності' },
      { type: 'con', text: 'Складніша реєстрація' },
      { type: 'con', text: 'Вищі витрати на ведення' },
    ],
  },
};
