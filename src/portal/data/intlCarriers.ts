/**
 * Міжнародні перевізники для B2B-логістики в/з України.
 *
 * Джерела: офіційні сайти представництв, прайс-аркуші 2026,
 * Асоціація міжнародних автомобільних перевізників (АсМАП).
 */

export type CarrierService = 'ftl' | 'ltl' | 'sea' | 'air' | 'rail' | 'express' | 'customs';

export const CARRIER_SERVICE_LABEL: Record<CarrierService, string> = {
  ftl: 'FTL (повна вантажівка)',
  ltl: 'LTL (збірний)',
  sea: 'Морські перевезення',
  air: 'Авіадоставка',
  rail: 'Залізниця',
  express: 'Експрес-доставка',
  customs: 'Митне оформлення',
};

export interface IntlCarrierEntry {
  id: string;
  slug: string;
  name: string;
  /** Глобальний vs український представник */
  scope: 'global' | 'european' | 'ukrainian';
  services: CarrierService[];
  /** Регіони покриття */
  geography: string[];
  ukrainianOffices: { city: string; address?: string; phone?: string }[];
  email?: string;
  website: string;
  typicalLeadTimeDays?: string;
  /** Опис типової цінової моделі */
  pricingModel: string;
  /** Орієнтовні діапазони (USD або EUR) */
  priceBenchmarks?: { route: string; price: string }[];
  strengths: string[];
  notes?: string;
}

export const INTL_CARRIERS_AS_OF = '2026-04-15';

export const INTL_CARRIERS: IntlCarrierEntry[] = [
  {
    id: 'dsv',
    slug: 'dsv',
    name: 'DSV',
    scope: 'global',
    services: ['ftl', 'ltl', 'sea', 'air', 'rail', 'customs'],
    geography: ['Європа', 'Азія', 'Америка', 'Африка'],
    ukrainianOffices: [
      { city: 'Київ', address: 'Бориспільське шосе, 9-й км', phone: '+380 44 393 18 18' },
      { city: 'Львів' },
      { city: 'Одеса' },
    ],
    email: 'info@ua.dsv.com',
    website: 'https://www.dsv.com/uk-ua',
    typicalLeadTimeDays: 'Авіа: 3–7 діб; Море FCL: 30–45; LTL ЄС: 5–10',
    pricingModel: 'Прозорий прайс за маршрутом, об\'ємні знижки від 50+ паллет/міс',
    priceBenchmarks: [
      { route: 'Київ → Гамбург, FTL 24 т', price: '€2 200–2 800' },
      { route: 'Шанхай → Одеса, 40\'HC (sea)', price: '$3 800–5 500' },
      { route: 'Київ → Варшава, паллета LTL', price: '€80–140' },
    ],
    strengths: ['Власна митна брокеридж', 'Тендерна підтримка', 'Real-time трекінг'],
  },
  {
    id: 'kuehne-nagel',
    slug: 'kuehne-nagel',
    name: 'Kuehne+Nagel',
    scope: 'global',
    services: ['sea', 'air', 'ftl', 'rail', 'customs'],
    geography: ['Глобально'],
    ukrainianOffices: [
      { city: 'Київ', address: 'вул. Берковецька, 6', phone: '+380 44 593 12 12' },
      { city: 'Львів' },
      { city: 'Одеса' },
    ],
    website: 'https://ua.kuehne-nagel.com',
    typicalLeadTimeDays: 'Авіа: 2–5 діб; FCL Азія: 35–55',
    pricingModel: 'Контрактні тарифи + spot для разових партій',
    priceBenchmarks: [
      { route: 'Київ → Лондон, авіа 100 кг', price: '€450–650' },
      { route: 'Нінбо → Одеса, 20\'DC', price: '$2 200–3 500' },
    ],
    strengths: ['Лідер морського фрахту', 'Фармацевтичний холодовий ланцюг', 'GxP сертифікація'],
  },
  {
    id: 'raben',
    slug: 'raben',
    name: 'Raben Group',
    scope: 'european',
    services: ['ftl', 'ltl', 'customs'],
    geography: ['Польща', 'Німеччина', 'Чехія', 'Словаччина', 'Угорщина', 'Україна'],
    ukrainianOffices: [
      { city: 'Київ', phone: '+380 44 593 73 03' },
      { city: 'Львів' },
      { city: 'Дніпро' },
    ],
    website: 'https://ukraine.raben-group.com',
    typicalLeadTimeDays: 'LTL ЄС: 4–8 діб',
    pricingModel: 'LTL за вагою/об\'ємом (тарифні зони); FTL за маршрутом',
    priceBenchmarks: [
      { route: 'Київ → Берлін, паллета EUR1', price: '€95–160' },
      { route: 'Київ → Варшава, FTL', price: '€1 500–1 900' },
    ],
    strengths: ['Сильна мережа Центральної Європи', 'Щоденні відправлення', 'B2B портал myRaben'],
  },
  {
    id: 'db-schenker',
    slug: 'db-schenker',
    name: 'DB Schenker',
    scope: 'global',
    services: ['ftl', 'ltl', 'sea', 'air', 'rail', 'customs'],
    geography: ['Європа', 'Азія', 'Америка'],
    ukrainianOffices: [
      { city: 'Київ', phone: '+380 44 490 79 00' },
      { city: 'Львів' },
      { city: 'Одеса' },
    ],
    website: 'https://www.dbschenker.com/ua-uk',
    typicalLeadTimeDays: 'Авіа: 3–6; Залізниця Китай-ЄС: 16–22',
    pricingModel: 'Регулярні лінії з фіксованими тарифами + контракти',
    priceBenchmarks: [
      { route: 'Чунцин → Київ, залізниця 40\'', price: '$5 500–7 500' },
    ],
    strengths: ['Сильна залізнична Євразія', 'Дочка Deutsche Bahn', 'Промислова логістика'],
  },
  {
    id: 'maersk',
    slug: 'maersk',
    name: 'Maersk',
    scope: 'global',
    services: ['sea', 'customs'],
    geography: ['Глобально (морський фрахт)'],
    ukrainianOffices: [
      { city: 'Одеса', phone: '+380 48 729 64 64' },
      { city: 'Київ' },
    ],
    website: 'https://www.maersk.com/local-information/europe/ukraine',
    typicalLeadTimeDays: 'FCL Азія→Чорне море: 35–50; США→Одеса: 25–35',
    pricingModel: 'Spot rates + сервісні контракти; платформа Maersk Spot',
    priceBenchmarks: [
      { route: 'Шанхай → Чорноморськ, 40\'HC', price: '$3 500–5 000' },
      { route: 'Іллічівськ → Гданськ, 20\'', price: '$1 200–1 800' },
    ],
    strengths: ['Найбільший контейнерний оператор світу', 'Інтегрована логістика з 2023', 'Власні термінали'],
  },
  {
    id: 'fedex',
    slug: 'fedex',
    name: 'FedEx',
    scope: 'global',
    services: ['express', 'air', 'customs'],
    geography: ['Глобально'],
    ukrainianOffices: [
      { city: 'Київ', phone: '+380 44 593 51 11' },
    ],
    website: 'https://www.fedex.com/uk-ua',
    typicalLeadTimeDays: 'IP — 1–3 робочі дні до 90% країн',
    pricingModel: 'Зонування за вагою; e-Commerce знижки на тарифі',
    priceBenchmarks: [
      { route: 'Київ → Нью-Йорк, документ до 0,5 кг', price: '$95–130' },
      { route: 'Київ → Лондон, посилка 5 кг', price: '€110–170' },
    ],
    strengths: ['IP-доставка', 'Сильна Північна Америка', 'Гарантія часу'],
  },
  {
    id: 'dhl-express',
    slug: 'dhl-express',
    name: 'DHL Express',
    scope: 'global',
    services: ['express', 'air', 'customs'],
    geography: ['Глобально'],
    ukrainianOffices: [
      { city: 'Київ', phone: '+380 44 393 34 73' },
      { city: 'Львів' }, { city: 'Дніпро' }, { city: 'Одеса' },
    ],
    website: 'https://www.dhl.com/ua-uk/home.html',
    typicalLeadTimeDays: 'TDX/TDY: 1–3 робочі дні',
    pricingModel: 'MyDHL+ калькулятор онлайн; контракти від $5k/рік',
    priceBenchmarks: [
      { route: 'Київ → Шанхай, посилка 2 кг', price: '$110–160' },
      { route: 'Київ → Берлін, посилка 10 кг', price: '€140–220' },
    ],
    strengths: ['Найшвидша мережа в Європі', 'Сильна Азія', 'Premium-картки'],
  },
  {
    id: 'dpd',
    slug: 'dpd',
    name: 'DPD',
    scope: 'european',
    services: ['express', 'ltl'],
    geography: ['Європа'],
    ukrainianOffices: [
      { city: 'Київ' },
    ],
    website: 'https://www.dpd.com/ua/uk',
    typicalLeadTimeDays: 'B2B ЄС: 2–5 робочих днів',
    pricingModel: 'Стандартні тарифи за вагою/маршрутом',
    priceBenchmarks: [
      { route: 'Київ → Прага, посилка до 10 кг', price: '€35–55' },
    ],
    strengths: ['Дешевший за DHL/FedEx в Європі', 'Хороша мережа PUDO'],
  },
  {
    id: 'zim',
    slug: 'zim',
    name: 'ZIM',
    scope: 'global',
    services: ['sea', 'customs'],
    geography: ['Середземне море', 'Азія', 'Чорне море'],
    ukrainianOffices: [
      { city: 'Одеса', phone: '+380 48 728 99 99' },
    ],
    website: 'https://www.zim.com',
    typicalLeadTimeDays: 'Хайфа → Одеса: 7–10; Шанхай → Одеса: 38–50',
    pricingModel: 'Spot + 1Q/3Q контракти',
    priceBenchmarks: [
      { route: 'Хайфа → Одеса, 20\'DC', price: '$800–1 400' },
    ],
    strengths: ['Спеціалізація на Середземному морі', 'Прямі лінії на Чорне море'],
  },
  {
    id: 'kombat-logistic',
    slug: 'kombat-logistic',
    name: 'Comb. Логістик',
    scope: 'ukrainian',
    services: ['ftl', 'sea', 'customs'],
    geography: ['Україна-ЄС', 'Україна-Туреччина'],
    ukrainianOffices: [
      { city: 'Одеса' },
      { city: 'Київ' },
    ],
    website: 'https://kl-logistic.com.ua',
    typicalLeadTimeDays: 'Україна-ЄС FTL: 4–8 діб',
    pricingModel: 'Гнучкі тарифи для МСБ; від 1 паллети',
    priceBenchmarks: [
      { route: 'Київ → Стамбул, FTL 22 т', price: '$2 800–3 600' },
    ],
    strengths: ['Локальна гнучкість', 'Митний брокер у складі', 'Робота з МСБ'],
  },
];

export function getIntlCarrierBySlug(slug: string): IntlCarrierEntry | undefined {
  return INTL_CARRIERS.find((c) => c.slug === slug);
}
