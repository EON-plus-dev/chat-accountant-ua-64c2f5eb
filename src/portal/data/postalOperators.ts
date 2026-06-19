export type PostalOperatorKind = 'state' | 'private' | 'courier' | 'marketplace';

export interface PostalOperator {
  id: string;
  slug: string;
  name: string;
  kind: PostalOperatorKind;
  website: string;
  hotline: string;
  email?: string;
  branches: number;
  postomats?: number;
  cities: number;
  coverage: string;
  deliveryTime: string;
  baseTariff: string;
  insurance: string;
  cod: string;
  b2bCabinet: boolean;
  apiAvailable: boolean;
  edoIntegrations: string[];
  popular: boolean;
  notes?: string;
  legalRef?: string;
}

export const POSTAL_OPERATORS_AS_OF = 'квітень 2026';

export const POSTAL_OPERATOR_KIND_LABEL: Record<PostalOperatorKind, string> = {
  state: 'Державний',
  private: 'Приватний',
  courier: 'Курʼєрський',
  marketplace: 'Маркетплейс',
};

export const POSTAL_OPERATORS: PostalOperator[] = [
  {
    id: 'nova-poshta',
    slug: 'nova-poshta',
    name: 'Нова Пошта',
    kind: 'private',
    website: 'https://novaposhta.ua',
    hotline: '0 800 500 609',
    email: 'info@novaposhta.ua',
    branches: 10200,
    postomats: 19500,
    cities: 1700,
    coverage: 'Уся Україна, ЄС, США, Канада, Велика Британія, Молдова, Польща',
    deliveryTime: '1–2 дні Україна, 5–10 днів ЄС',
    baseTariff: 'Від 70 ₴ (відділення → відділення, до 2 кг)',
    insurance: '0.5% від оголошеної вартості (мін. 5 ₴)',
    cod: '20 ₴ + 2% від суми накладеного платежу',
    b2bCabinet: true,
    apiAvailable: true,
    edoIntegrations: ['M.E.Doc', 'Vchasno', 'BAS', '1С', 'Дія.Підпис'],
    popular: true,
    notes: 'Лідер ринку — 70%+ комерційних відправлень. Інтеграція через API key у B2B-кабінеті.',
  },
  {
    id: 'ukrposhta',
    slug: 'ukrposhta',
    name: 'Укрпошта',
    kind: 'state',
    website: 'https://ukrposhta.ua',
    hotline: '0 800 300 545',
    email: 'info@ukrposhta.ua',
    branches: 26000,
    postomats: 1200,
    cities: 28500,
    coverage: 'Уся Україна (включно з селами), 230+ країн через UPU',
    deliveryTime: '2–5 днів Україна, 7–25 днів міжнародно',
    baseTariff: 'Від 35 ₴ (Стандарт, до 2 кг)',
    insurance: '1% від оголошеної вартості (мін. 3 ₴)',
    cod: '15 ₴ + 1.5% від суми',
    b2bCabinet: true,
    apiAvailable: true,
    edoIntegrations: ['M.E.Doc', 'Vchasno', 'BAS'],
    popular: true,
    notes: 'Єдиний оператор з покриттям усіх сіл. Універсальна поштова послуга (УПП). Член UPU.',
    legalRef: 'ЗУ "Про поштовий звʼязок" № 2759-III',
  },
  {
    id: 'meest',
    slug: 'meest',
    name: 'Meest',
    kind: 'private',
    website: 'https://meest.com',
    hotline: '0 800 30 11 70',
    email: 'info@meest.ua',
    branches: 3400,
    postomats: 800,
    cities: 950,
    coverage: 'Україна + 30 країн (Польща, ЄС, США, Канада, Ізраїль)',
    deliveryTime: '1–3 дні Україна, 5–14 днів закордон',
    baseTariff: 'Від 60 ₴ (до 2 кг)',
    insurance: '0.5% (мін. 5 ₴)',
    cod: '20 ₴ + 2%',
    b2bCabinet: true,
    apiAvailable: true,
    edoIntegrations: ['M.E.Doc', 'Vchasno'],
    popular: true,
    notes: 'Сильний у міжнародній доставці українській діаспорі. Meest China — окремий B2C-канал з Китаю.',
  },
  {
    id: 'justin',
    slug: 'justin',
    name: 'Justin',
    kind: 'private',
    website: 'https://justin.ua',
    hotline: '0 800 30 28 99',
    email: 'info@justin.ua',
    branches: 1800,
    postomats: 2500,
    cities: 480,
    coverage: 'Україна (підконтрольна територія)',
    deliveryTime: '1–2 дні',
    baseTariff: 'Від 55 ₴ (до 2 кг)',
    insurance: '0.5% (мін. 5 ₴)',
    cod: '15 ₴ + 1.5%',
    b2bCabinet: true,
    apiAvailable: true,
    edoIntegrations: ['M.E.Doc', 'Vchasno', 'BAS'],
    popular: true,
    notes: 'Належить ATB-маркет. Сильна сітка постоматів у супермаркетах ATB.',
  },
  {
    id: 'delivery',
    slug: 'delivery',
    name: 'Делівері',
    kind: 'private',
    website: 'https://delivery-auto.com',
    hotline: '0 800 21 26 06',
    email: 'info@delivery-auto.com',
    branches: 320,
    cities: 280,
    coverage: 'Україна, спеціалізація — великогабаритні вантажі',
    deliveryTime: '1–3 дні',
    baseTariff: 'Від 100 ₴ (документи) / від 250 ₴ (вантаж до 30 кг)',
    insurance: '0.5%',
    cod: '20 ₴ + 2%',
    b2bCabinet: true,
    apiAvailable: true,
    edoIntegrations: ['M.E.Doc', 'Vchasno', '1С'],
    popular: false,
    notes: 'Лідер у сегменті меблі/побутова техніка/негабарит. Доставка до 1500 кг на 1 місце.',
  },
  {
    id: 'rozetka-delivery',
    slug: 'rozetka-delivery',
    name: 'Rozetka Доставка',
    kind: 'marketplace',
    website: 'https://rozetka.com.ua/delivery',
    hotline: '044 537 02 22',
    branches: 950,
    postomats: 0,
    cities: 240,
    coverage: 'Україна (маркетплейс і власні відділення)',
    deliveryTime: '1–3 дні',
    baseTariff: 'Від 50 ₴ (відділення RZ)',
    insurance: 'Включено до 1000 ₴',
    cod: '0 ₴ — оплата на сайті/в відділенні',
    b2bCabinet: true,
    apiAvailable: true,
    edoIntegrations: ['Власний API маркетплейсу'],
    popular: false,
    notes: 'Доступна лише для продавців маркетплейсу Rozetka. Власна логістика з 2022 року.',
  },
  {
    id: 'dpd-ukraine',
    slug: 'dpd-ukraine',
    name: 'DPD Україна',
    kind: 'courier',
    website: 'https://dpd.com/ua',
    hotline: '0 800 21 13 11',
    branches: 60,
    cities: 320,
    coverage: 'Україна + 220 країн через DPDgroup',
    deliveryTime: '1–2 дні Україна, 2–5 днів ЄС',
    baseTariff: 'Від 120 ₴ Україна, від 800 ₴ ЄС',
    insurance: 'Включено до €520, доплата за вищу вартість',
    cod: 'Доступно',
    b2bCabinet: true,
    apiAvailable: true,
    edoIntegrations: ['M.E.Doc', 'Vchasno'],
    popular: false,
    notes: 'Премʼєм-сегмент B2B-логістики. Курʼєрська доставка door-to-door.',
  },
  {
    id: 'in-time',
    slug: 'in-time',
    name: 'Ін-Тайм',
    kind: 'private',
    website: 'https://intime.ua',
    hotline: '0 800 60 50 12',
    branches: 580,
    cities: 220,
    coverage: 'Україна',
    deliveryTime: '1–3 дні',
    baseTariff: 'Від 50 ₴ (до 2 кг)',
    insurance: '0.5%',
    cod: '15 ₴ + 1.5%',
    b2bCabinet: true,
    apiAvailable: true,
    edoIntegrations: ['M.E.Doc', 'Vchasno'],
    popular: false,
    notes: 'Раніше — частина Епіцентр-К. Активно нарощує мережу з 2024 року.',
  },
];
