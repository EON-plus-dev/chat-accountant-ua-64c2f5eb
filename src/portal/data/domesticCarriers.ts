/**
 * Українські перевізники для B2B-логістики (внутрішні і Україна↔ЄС).
 *
 * Дані ґрунтуються на офіційних B2B-розділах сайтів, тарифних калькуляторах
 * та публічних умовах для корпоративних клієнтів. Цифри — типові орієнтири;
 * фактичні умови залежать від обсягу та індивідуального договору.
 */

export interface DomesticCarrierEntry {
  id: string;
  slug: string;
  name: string;
  /** B2B-договір з персональним менеджером */
  b2bContractAvailable: boolean;
  /** Поріг обсягу для отримання персонального менеджера / контракту */
  personalManagerThreshold?: string;
  apiAvailable: boolean;
  /** Інтеграції з популярними CRM/ERP */
  integrations?: string[];
  services: string[];
  geography: string;
  /** Типові ставки за основними маршрутами */
  typicalRates: { description: string; price: string }[];
  /** Особливі сервіси для B2B */
  b2bFeatures: string[];
  website: string;
  contactPhone?: string;
  contactEmail?: string;
}

export const DOMESTIC_CARRIERS_AS_OF = '2026-04-15';

export const DOMESTIC_CARRIERS: DomesticCarrierEntry[] = [
  {
    id: 'nova-poshta-biznes',
    slug: 'nova-poshta-biznes',
    name: 'Нова Пошта Бізнес',
    b2bContractAvailable: true,
    personalManagerThreshold: 'Від 50 відправлень/місяць або від 30 000 ₴/міс обороту',
    apiAvailable: true,
    integrations: ['1С', 'BAS', 'KeyCRM', 'Bitrix24', 'Prom.ua', 'Хорошоп', 'OpenCart', 'WooCommerce'],
    services: [
      'Адресна доставка та самовивіз',
      'Міжнародна доставка (НП Glоbal)',
      'Перевезення вантажів до 1 000 кг',
      'НП Cargo (палети, до 10 т)',
      'Кур\'єрська доставка',
      'Контроль платежу (накладений)',
      'Доставка в день замовлення (експрес)',
    ],
    geography: 'Україна + 70+ країн через NP Global',
    typicalRates: [
      { description: 'Київ → Львів, посилка 5 кг (відділення-відділення)', price: '55–75 ₴' },
      { description: 'Київ → Львів, паллета 100 кг', price: '480–620 ₴' },
      { description: 'Київ → Дніпро, вантаж 500 кг (Cargo)', price: '1 600–2 200 ₴' },
      { description: 'Київ → Варшава (NP Global), 5 кг', price: '650–900 ₴' },
    ],
    b2bFeatures: [
      'Особистий кабінет з аналітикою',
      'API-інтеграція без обмежень',
      'Постоплата контрагентом',
      'Відстрочення оплати до 14 днів',
      'Знижки до −30% за обсягом',
      'Маркування партій',
      'Безкоштовний забір з 50+ відправлень/день',
    ],
    website: 'https://novaposhta.ua/business',
    contactPhone: '+380 800 500 609',
    contactEmail: 'business@novaposhta.ua',
  },
  {
    id: 'ukrposhta-biznes',
    slug: 'ukrposhta-biznes',
    name: 'УкрПошта Бізнес',
    b2bContractAvailable: true,
    personalManagerThreshold: 'Від 30 000 ₴/міс обороту',
    apiAvailable: true,
    integrations: ['1С', 'Prom.ua', 'Розетка Маркет', 'Хорошоп', 'OpenCart', 'Shopify'],
    services: [
      'Стандарт (3–10 робочих днів по Україні)',
      'Експрес-доставка (1–3 дні до 30 кг)',
      'Міжнародна доставка (190 країн)',
      'Логістика для маркетплейсів',
      'Контроль платежу',
      'Палетні відправлення',
      'Доставка великогабаритних до 100 кг',
    ],
    geography: 'Україна (28 000 відділень) + 190 країн',
    typicalRates: [
      { description: 'Київ → Львів, посилка 5 кг (Стандарт)', price: '38–55 ₴' },
      { description: 'Київ → Львів, посилка 5 кг (Експрес)', price: '80–115 ₴' },
      { description: 'Київ → Берлін, посилка 2 кг (Avia)', price: '420–580 ₴' },
      { description: 'Київ → Дніпро, паллета 100 кг (Стандарт)', price: '380–500 ₴' },
    ],
    b2bFeatures: [
      'Найнижчі ціни на стандартну доставку',
      'Найбільша мережа (села, ОТГ)',
      'Експорт в 190 країн з прямим стиком з пошт ЄС',
      'API + кабінет «УкрПошта Онлайн»',
      'Постоплата і агрегований рахунок',
      'Знижки до −40% від обсягу',
    ],
    website: 'https://www.ukrposhta.ua/ua/biznes',
    contactPhone: '+380 800 300 545',
    contactEmail: 'business@ukrposhta.ua',
  },
  {
    id: 'meest',
    slug: 'meest',
    name: 'Meest',
    b2bContractAvailable: true,
    personalManagerThreshold: 'Від 100 відправлень/місяць',
    apiAvailable: true,
    integrations: ['Prom.ua', 'Розетка', 'Хорошоп', 'WooCommerce', 'Shopify', 'OpenCart'],
    services: [
      'Доставка по Україні (відділення/адресна)',
      'Міжнародна доставка (Європа, США, Канада)',
      'Cross-border eCommerce',
      'Fulfillment у Польщі/Німеччині',
      'Доставка з/до маркетплейсів (Amazon, eBay)',
      'Платіжні рішення (післяплата)',
    ],
    geography: 'Україна, 20+ країн через Meest Global',
    typicalRates: [
      { description: 'Київ → Львів, посилка 5 кг', price: '50–70 ₴' },
      { description: 'Київ → Варшава, 2 кг (Express)', price: '380–520 ₴' },
      { description: 'Київ → Нью-Йорк, 5 кг (Avia)', price: '$45–65' },
    ],
    b2bFeatures: [
      'Спеціалізація на cross-border eCommerce',
      'Власні fulfillment-центри в ЄС',
      'API і кабінет Meest Online',
      'Інтеграція з маркетплейсами США/Канади',
      'Прозоре митне оформлення',
    ],
    website: 'https://meest.com',
    contactPhone: '+380 800 503 003',
    contactEmail: 'b2b@meest.com',
  },
  {
    id: 'delivery',
    slug: 'delivery',
    name: 'Делівері',
    b2bContractAvailable: true,
    personalManagerThreshold: 'Від 20 000 ₴/міс обороту',
    apiAvailable: true,
    integrations: ['1С', 'BAS', 'KeyCRM', 'Bitrix24', 'Хорошоп'],
    services: [
      'Доставка вантажів до 20 т',
      'Палетні відправлення',
      'Адресна доставка та склад-склад',
      'Контроль платежу',
      'Зберігання на складі-терміналі',
      'Доставка крихкого/негабаритного',
    ],
    geography: 'Україна (200+ терміналів)',
    typicalRates: [
      { description: 'Київ → Львів, паллета 100 кг', price: '350–480 ₴' },
      { description: 'Київ → Одеса, вантаж 1 т', price: '2 200–3 100 ₴' },
      { description: 'Київ → Дніпро, фура 20 т (FTL)', price: '14 000–18 000 ₴' },
    ],
    b2bFeatures: [
      'Спеціалізація на вантажах',
      'Власний автопарк (1 000+ авто)',
      'Постоплата до 14 днів',
      'Страхування вантажу включно',
      'Знижки за обсягом до −25%',
    ],
    website: 'https://www.delivery-auto.com',
    contactPhone: '+380 800 21 22 33',
    contactEmail: 'corporate@delivery-auto.com',
  },
  {
    id: 'sat',
    slug: 'sat',
    name: 'САТ',
    b2bContractAvailable: true,
    apiAvailable: true,
    integrations: ['1С', 'BAS'],
    services: [
      'Адресна доставка та склад-склад',
      'Вантажі до 10 т',
      'Палетні відправлення',
      'Експрес-доставка',
      'Зберігання, кросдок',
    ],
    geography: 'Україна (130+ відділень)',
    typicalRates: [
      { description: 'Київ → Львів, паллета 100 кг', price: '320–450 ₴' },
      { description: 'Київ → Харків, вантаж 500 кг', price: '1 400–1 900 ₴' },
    ],
    b2bFeatures: [
      'Гнучкі тарифи для МСБ',
      'Кросдок-послуги',
      'Зберігання на терміналі',
      'API доступний',
    ],
    website: 'https://sat.ua',
    contactPhone: '+380 800 50 70 70',
  },
];

export function getDomesticCarrierBySlug(slug: string): DomesticCarrierEntry | undefined {
  return DOMESTIC_CARRIERS.find((c) => c.slug === slug);
}
