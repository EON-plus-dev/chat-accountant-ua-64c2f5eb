import oksanaPortrait from '@/assets/accountants/oksana-portrait.jpg';
import finhouseLogo from '@/assets/accountants/finhouse-logo.png';
import finhouseTeam from '@/assets/accountants/finhouse-team.jpg';
import taxsmartLogo from '@/assets/accountants/taxsmart-logo.png';

export type AccountantEntityType = 'individual' | 'agency';

export interface AccountantProfile {
  id: string;
  slug: string;
  name: string;
  /** Display photo: portrait for individuals, logo for agencies. ES6 import path or URL. */
  photoUrl?: string;
  /** Optional secondary photo: team/office shot for agencies. */
  teamPhotoUrl?: string;
  /** Determines profile layout (Individual vs Agency biography). */
  entityType: AccountantEntityType;
  initials: string;
  initialsColor: string;
  city: string;
  region: string;
  isOnline: boolean;
  specializations: string[];
  taxSystems: string[];
  industries: string[];
  experience: number;
  clientCount: number;
  priceFrom: number;
  priceTo?: number;
  priceDisplay: string;
  certifications: string[];
  isFintodoCertified: boolean;
  fintodoPartner: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  contactEmail?: string;
  contactTelegram?: string;
  contactPhone?: string;
  website?: string;
  languages: string[];
  responseTime: string;
  isVerified: boolean;
  joinedDate: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export const ACCOUNTANT_REGIONS = [
  'Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів', 'Онлайн',
] as const;

export const ACCOUNTANT_SPECIALIZATIONS = [
  'ФОП 1-3 групи', 'ТОВ', 'IT-компанії', 'ЗЕД', 'Загальна система', 'Єдиний податок',
] as const;

export const ACCOUNTANTS: AccountantProfile[] = [
  {
    id: 'oksana-kovalenko',
    slug: 'oksana-kovalenko',
    name: 'Оксана Коваленко',
    entityType: 'individual',
    photoUrl: '/src/assets/accountants/oksana-portrait.jpg',
    initials: 'ОК',
    initialsColor: '#7C3AED',
    city: 'Київ',
    region: 'Київська область',
    isOnline: true,
    specializations: ['ФОП 1-3 групи', 'ТОВ малий бізнес', 'IT-компанії та фрілансери'],
    taxSystems: ['Єдиний податок', 'Загальна система'],
    industries: ['IT', 'Консалтинг', 'Торгівля'],
    experience: 12,
    clientCount: 18,
    priceFrom: 1500,
    priceTo: 5000,
    priceDisplay: 'від 1 500 ₴/міс',
    certifications: ['FINTODO Certified Accountant', 'Сертифікат практикуючого бухгалтера'],
    isFintodoCertified: true,
    fintodoPartner: true,
    rating: 4.9,
    reviewCount: 47,
    description:
      'Спеціалізуюсь на IT-компаніях та фрілансерах. Допомагаю з валютними надходженнями, Wise, Deel та правильним декларуванням іноземних доходів.',
    contactTelegram: '@oksana_buh_kyiv',
    languages: ['Українська', 'Англійська'],
    responseTime: 'до 2 годин',
    isVerified: true,
    joinedDate: '2024-01',
    seoTitle: 'Оксана Коваленко — бухгалтер | FINTODO',
    seoDescription: 'Спеціалізуюсь на IT-компаніях та фрілансерах. Допомагаю з валютними надходженнями, Wise, Deel та правильним декларуванням іноземних доходів.',
    seoKeywords: ['бухгалтер'],
  },
  {
    id: 'andriy-bondarenko',
    slug: 'andriy-bondarenko',
    name: 'Андрій Бондаренко',
    entityType: 'individual',
    initials: 'АБ',
    initialsColor: '#0EA5E9',
    city: 'Львів',
    region: 'Львівська область',
    isOnline: true,
    specializations: ['ТОВ', 'ЗЕД', 'IT-компанії'],
    taxSystems: ['Загальна система', 'Єдиний податок'],
    industries: ['IT', 'Експорт послуг', 'E-commerce'],
    experience: 9,
    clientCount: 24,
    priceFrom: 4000,
    priceTo: 15000,
    priceDisplay: 'від 4 000 ₴/міс',
    certifications: ['ACCA DipIFR', 'FINTODO Certified Accountant'],
    isFintodoCertified: true,
    fintodoPartner: true,
    rating: 4.8,
    reviewCount: 31,
    description:
      'Веду ТОВ на загальній системі з ЗЕД-контрактами. Налаштовую внутрішню фінансову модель, бюджети, P&L. Працюю в FINTODO та 1С.',
    contactEmail: 'andriy@bondar-buh.com.ua',
    contactTelegram: '@andriy_bondar',
    languages: ['Українська', 'Польська', 'Англійська'],
    responseTime: 'до 4 годин',
    isVerified: true,
    joinedDate: '2024-03',
  },
  {
    id: 'finhouse-agency',
    slug: 'finhouse-agency',
    name: 'FinHouse — бухгалтерська агенція',
    entityType: 'agency',
    photoUrl: '/src/assets/accountants/finhouse-logo.png',
    teamPhotoUrl: '/src/assets/accountants/finhouse-team.jpg',
    initials: 'FH',
    initialsColor: '#10B981',
    city: 'Київ',
    region: 'Київська область',
    isOnline: true,
    specializations: ['ТОВ', 'IT-компанії', 'Холдинги'],
    taxSystems: ['Загальна система', 'Єдиний податок'],
    industries: ['IT', 'Виробництво', 'Логістика', 'Ритейл'],
    experience: 14,
    clientCount: 86,
    priceFrom: 8000,
    priceTo: 60000,
    priceDisplay: 'від 8 000 ₴/міс',
    certifications: ['ISO 9001', 'FINTODO Certified Firm'],
    isFintodoCertified: true,
    fintodoPartner: true,
    rating: 4.9,
    reviewCount: 112,
    description:
      'Команда з 12 спеціалістів. Повний бухгалтерський аутсорс для ТОВ — від первинки до управлінської звітності та підготовки до due diligence.',
    contactEmail: 'hello@finhouse.ua',
    contactPhone: '+380 44 123 4567',
    website: 'https://finhouse.ua',
    languages: ['Українська', 'Англійська'],
    responseTime: 'до 1 години',
    isVerified: true,
    joinedDate: '2023-09',
  },
  {
    id: 'maryna-petrenko',
    slug: 'maryna-petrenko',
    name: 'Марина Петренко',
    entityType: 'individual',
    initials: 'МП',
    initialsColor: '#F59E0B',
    city: 'Дніпро',
    region: 'Дніпропетровська область',
    isOnline: true,
    specializations: ['ФОП 1-3 групи', 'Загальна система'],
    taxSystems: ['Єдиний податок', 'Загальна система'],
    industries: ['Послуги', 'Освіта', 'Бʼюті-сфера'],
    experience: 7,
    clientCount: 32,
    priceFrom: 1200,
    priceTo: 3500,
    priceDisplay: 'від 1 200 ₴/міс',
    certifications: ['Сертифікат практикуючого бухгалтера'],
    isFintodoCertified: false,
    fintodoPartner: true,
    rating: 4.7,
    reviewCount: 58,
    description:
      'Веду ФОП-2 та ФОП-3. Допомагаю з відкриттям, зміною КВЕД, переходом на загальну систему. Швидко відповідаю в Telegram.',
    contactTelegram: '@maryna_buh_dnipro',
    languages: ['Українська'],
    responseTime: 'до 30 хвилин',
    isVerified: true,
    joinedDate: '2024-06',
  },
  {
    id: 'taxsmart-firm',
    slug: 'taxsmart-firm',
    name: 'TaxSmart — податкове бюро',
    entityType: 'agency',
    photoUrl: '/src/assets/accountants/taxsmart-logo.png',
    initials: 'TS',
    initialsColor: '#EF4444',
    city: 'Харків',
    region: 'Харківська область',
    isOnline: true,
    specializations: ['ТОВ', 'ЗЕД', 'Податкові спори'],
    taxSystems: ['Загальна система'],
    industries: ['Виробництво', 'Імпорт', 'Агро'],
    experience: 18,
    clientCount: 54,
    priceFrom: 12000,
    priceTo: 80000,
    priceDisplay: 'від 12 000 ₴/міс',
    certifications: ['Адвокатське свідоцтво', 'FINTODO Certified Firm'],
    isFintodoCertified: true,
    fintodoPartner: true,
    rating: 4.9,
    reviewCount: 76,
    description:
      'Бухгалтерія + податкова адвокатура. Супровід перевірок ДПС, оскарження ППР, due diligence для M&A. Тільки складні кейси.',
    contactEmail: 'office@taxsmart.ua',
    contactPhone: '+380 57 765 4321',
    website: 'https://taxsmart.ua',
    languages: ['Українська', 'Англійська'],
    responseTime: 'до 6 годин',
    isVerified: true,
    joinedDate: '2023-05',
  },
  {
    id: 'iryna-savchuk',
    slug: 'iryna-savchuk',
    name: 'Ірина Савчук',
    entityType: 'individual',
    initials: 'ІС',
    initialsColor: '#8B5CF6',
    city: 'Одеса',
    region: 'Одеська область',
    isOnline: true,
    specializations: ['ФОП 1-3 групи', 'IT-компанії'],
    taxSystems: ['Єдиний податок'],
    industries: ['IT', 'Маркетинг', 'Дизайн'],
    experience: 6,
    clientCount: 41,
    priceFrom: 1800,
    priceTo: 4500,
    priceDisplay: 'від 1 800 ₴/міс',
    certifications: ['FINTODO Certified Accountant'],
    isFintodoCertified: true,
    fintodoPartner: true,
    rating: 4.8,
    reviewCount: 39,
    description:
      'Працюю з digital-агенціями та фрілансерами. Wise, Payoneer, Deel, оплата з-за кордону. Українська/англійська.',
    contactTelegram: '@iryna_savchuk',
    contactEmail: 'iryna@savchuk-buh.com',
    languages: ['Українська', 'Англійська'],
    responseTime: 'до 1 години',
    isVerified: true,
    joinedDate: '2024-04',
  },
];

