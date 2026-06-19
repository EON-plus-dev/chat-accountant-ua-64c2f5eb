export interface TaxCategory {
  id: string;
  emoji: string;
  name: string;
  count: number;
  hotTopic: string;
  slug: string;
}

export const TAX_CATEGORIES: TaxCategory[] = [
  { id: 'fop', emoji: '💼', name: 'ФОП та єдиний податок', count: 84, hotTopic: 'Гайд для початківців', slug: 'fop' },
  { id: 'pdv', emoji: '🧾', name: 'ПДВ', count: 67, hotTopic: 'СЕА та ліміти 2025', slug: 'pdv' },
  { id: 'esv', emoji: '📊', name: 'ЄСВ', count: 51, hotTopic: 'Ставки 2025', slug: 'esv' },
  { id: 'pdfo', emoji: '💰', name: 'ПДФО та ВЗ', count: 43, hotTopic: 'Ставки та відрахування', slug: 'pdfo' },
  { id: 'profit', emoji: '🏢', name: 'Податок на прибуток', count: 38, hotTopic: 'Авансові внески', slug: 'profit' },
  { id: 'local', emoji: '🏛️', name: 'Місцеві податки', count: 29, hotTopic: 'Земельний та нерухомість', slug: 'local' },
];
