/**
 * Митні ставки України — окремий датасет з режимами FTA.
 *
 * Базові ставки мита/ПДВ/акцизу частково є у uktZed.ts (поле duty.*).
 * Тут — розрив за **торговельними режимами**: MFN (без угоди), FTA з ЄС,
 * FTA з Великобританією, FTA з Канадою, CEFTA та інші.
 *
 * Джерела:
 *  • Митний тариф України (Закон № 674-IX від 04.06.2020)
 *  • Угода про асоціацію з ЄС (2014, тарифні графіки скасування мит)
 *  • Угода про вільну торгівлю Україна–Велика Британія (2020)
 *  • CUFTA — Канада (2017)
 *  • customs.gov.ua/uktzed, zakon.rada.gov.ua
 */

export type TradeRegime = 'MFN' | 'EU' | 'UK' | 'CA' | 'EFTA' | 'IL' | 'TR';

export const TRADE_REGIME_LABEL: Record<TradeRegime, string> = {
  MFN: 'Без угоди (MFN)',
  EU: 'ЄС (DCFTA)',
  UK: 'Велика Британія',
  CA: 'Канада (CUFTA)',
  EFTA: 'EFTA (Норвегія, Швейцарія)',
  IL: 'Ізраїль',
  TR: 'Туреччина',
};

export type CustomsTariffCategory =
  | 'food' | 'agro' | 'chemicals' | 'pharma' | 'plastics'
  | 'textile' | 'metals' | 'machinery' | 'electronics' | 'vehicles'
  | 'fuel' | 'consumer';

export const CUSTOMS_CATEGORY_LABEL: Record<CustomsTariffCategory, string> = {
  food: 'Харчова продукція',
  agro: 'Сільгосппродукція',
  chemicals: 'Хімія',
  pharma: 'Фармацевтика',
  plastics: 'Пластмаси',
  textile: 'Текстиль і одяг',
  metals: 'Метали',
  machinery: 'Машини, обладнання',
  electronics: 'Електроніка',
  vehicles: 'Транспортні засоби',
  fuel: 'Паливо, енергоносії',
  consumer: 'Споживчі товари',
};

export interface CustomsRateByRegime {
  regime: TradeRegime;
  /** Ставка ввізного мита (%, fixed-уточнюється у note). null = безмитно */
  importRate: number | null;
  /** Текстова форма для відображення, якщо адвалорна % недостатня */
  display?: string;
  /** Примітка про квоту/перехідний період */
  note?: string;
}

export interface CustomsTariffEntry {
  id: string;
  /** Скорочений код УКТ ЗЕД (4–10 цифр); відповідає uktZed.ts якщо є */
  uktZedCode: string;
  name: string;
  category: CustomsTariffCategory;
  /** ПДВ при імпорті (стандарт 20%, для деяких продуктів 14%/7%/0%) */
  vatRate: number;
  /** Якщо підакцизний — формула або ставка */
  excise?: string;
  /** Загальна примітка до запису */
  note?: string;
  rates: CustomsRateByRegime[];
  /** Дозволи, які потрібні незалежно від ставки */
  permits?: string[];
  legalBasis: string;
  asOf: string;
  source: string;
  sourceUrl: string;
}

export const CUSTOMS_TARIFF_AS_OF = '2026-04-15';

export const CUSTOMS_TARIFF: CustomsTariffEntry[] = [
  {
    id: 'ct-0203',
    uktZedCode: '0203',
    name: 'Свинина свіжа, охолоджена або заморожена',
    category: 'food',
    vatRate: 14,
    rates: [
      { regime: 'MFN', importRate: 12 },
      { regime: 'EU', importRate: 0, note: 'У межах тарифної квоти 20 000 т/рік' },
      { regime: 'UK', importRate: 0, note: 'У межах квоти' },
      { regime: 'CA', importRate: 12, note: 'Поза CUFTA-преференціями' },
    ],
    permits: ['Ветеринарне свідоцтво', 'Сертифікат походження EUR.1'],
    legalBasis: 'Митний тариф України, гр.02',
    asOf: '2026-01-01',
    source: 'Митний тариф України; Додаток I-A до Угоди про асоціацію',
    sourceUrl: 'https://zakon.rada.gov.ua/laws/show/674-IX',
  },
  {
    id: 'ct-0406',
    uktZedCode: '0406',
    name: 'Сири і кисломолочний сир',
    category: 'food',
    vatRate: 14,
    rates: [
      { regime: 'MFN', importRate: 10 },
      { regime: 'EU', importRate: 0, note: 'Квота 9 000 т/рік (моцарелла, пресовані)' },
      { regime: 'UK', importRate: 0 },
    ],
    permits: ['Ветеринарне свідоцтво', 'Сертифікат EUR.1'],
    legalBasis: 'Митний тариф; Регламент ЄС 510/2014',
    asOf: '2026-01-01',
    source: 'Митний тариф України',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-2204',
    uktZedCode: '2204',
    name: 'Вина виноградні',
    category: 'food',
    vatRate: 20,
    excise: '8,42 ₴/л (вина), 11,65 ₴/л (ігристі)',
    rates: [
      { regime: 'MFN', importRate: 10 },
      { regime: 'EU', importRate: 0 },
      { regime: 'CA', importRate: 0 },
      { regime: 'UK', importRate: 0 },
    ],
    permits: ['Ліцензія на імпорт алкоголю', 'Акцизні марки'],
    legalBasis: 'ПКУ ст.215; Угода Україна–ЄС',
    asOf: '2026-01-01',
    source: 'Митний тариф; ПКУ',
    sourceUrl: 'https://zakon.rada.gov.ua/laws/show/2755-17',
  },
  {
    id: 'ct-2710',
    uktZedCode: '2710 12',
    name: 'Бензини автомобільні (А-92, А-95, А-98)',
    category: 'fuel',
    vatRate: 20,
    excise: '213,50 €/1000 л',
    rates: [
      { regime: 'MFN', importRate: 5 },
      { regime: 'EU', importRate: 0 },
      { regime: 'UK', importRate: 0 },
    ],
    permits: ['Ліцензія на оптову/роздрібну торгівлю пальним'],
    legalBasis: 'ПКУ ст.215.3.4; Митний тариф',
    asOf: '2026-04-01',
    source: 'ПКУ; Митний тариф',
    sourceUrl: 'https://zakon.rada.gov.ua/laws/show/2755-17',
  },
  {
    id: 'ct-3004',
    uktZedCode: '3004',
    name: 'Лікарські засоби у дозованому вигляді',
    category: 'pharma',
    vatRate: 7,
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0 },
    ],
    permits: ['Реєстраційне посвідчення МОЗ', 'Ліцензія на імпорт ліків'],
    legalBasis: 'ЗУ «Про лікарські засоби»; ПКУ',
    asOf: '2026-01-01',
    source: 'МОЗ; ДЕЦ',
    sourceUrl: 'https://moz.gov.ua',
  },
  {
    id: 'ct-3923',
    uktZedCode: '3923',
    name: 'Тара пластмасова (пляшки, контейнери, мішки)',
    category: 'plastics',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 5 },
      { regime: 'EU', importRate: 0 },
      { regime: 'UK', importRate: 0 },
      { regime: 'TR', importRate: 0 },
    ],
    legalBasis: 'Митний тариф',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-6109',
    uktZedCode: '6109',
    name: 'Футболки, майки трикотажні',
    category: 'textile',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 12 },
      { regime: 'EU', importRate: 0 },
      { regime: 'TR', importRate: 0 },
      { regime: 'UK', importRate: 0 },
    ],
    legalBasis: 'Митний тариф',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-7308',
    uktZedCode: '7308',
    name: 'Металоконструкції зі сталі (мости, ферми, вежі)',
    category: 'metals',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0 },
    ],
    legalBasis: 'Митний тариф',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-8418',
    uktZedCode: '8418',
    name: 'Холодильники, морозильники, теплові насоси',
    category: 'machinery',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 5 },
      { regime: 'EU', importRate: 0 },
      { regime: 'UK', importRate: 0 },
    ],
    permits: ['Сертифікат енергоефективності'],
    legalBasis: 'Митний тариф; ТР енергоефективності',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-8471',
    uktZedCode: '8471',
    name: 'Машини обчислювальні (ПК, ноутбуки, сервери)',
    category: 'electronics',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0 },
    ],
    legalBasis: 'Митний тариф (ITA-обнулення)',
    asOf: '2026-01-01',
    source: 'Митний тариф; WTO ITA',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-8517',
    uktZedCode: '8517',
    name: 'Смартфони, телефони мобільні, маршрутизатори',
    category: 'electronics',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0 },
    ],
    legalBasis: 'Митний тариф (ITA)',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-8703-petrol',
    uktZedCode: '8703 23',
    name: 'Легкові авто, бензин, 1500–3000 см³',
    category: 'vehicles',
    vatRate: 20,
    excise: 'За формулою: 50 € × (об\'єм/1000) × коеф.віку (1 — нові, до 15 — 10 років і більше)',
    rates: [
      { regime: 'MFN', importRate: 10 },
      { regime: 'EU', importRate: 10, note: 'Перехідний період: обнулення з 2026 — 0%' },
      { regime: 'UK', importRate: 0 },
    ],
    permits: ['Сертифікат відповідності екологічним нормам (Євро-5)'],
    legalBasis: 'ПКУ ст.215.3.5; Митний тариф',
    asOf: '2026-01-01',
    source: 'ПКУ',
    sourceUrl: 'https://zakon.rada.gov.ua/laws/show/2755-17',
  },
  {
    id: 'ct-8703-ev',
    uktZedCode: '8703 80',
    name: 'Електромобілі (BEV)',
    category: 'vehicles',
    vatRate: 0,
    excise: '1 €',
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0 },
    ],
    note: 'Пільги діють до 2026-12-31 згідно ЗУ № 2330-IX',
    legalBasis: 'ПКУ п.197.1.31; ЗУ № 2330-IX',
    asOf: '2026-01-01',
    source: 'ПКУ',
    sourceUrl: 'https://zakon.rada.gov.ua/laws/show/2755-17',
  },
  {
    id: 'ct-9018',
    uktZedCode: '9018',
    name: 'Прилади медичні (УЗД, кардіо, хірургічні)',
    category: 'machinery',
    vatRate: 7,
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0 },
    ],
    permits: ['Свідоцтво про реєстрацію медвиробу'],
    legalBasis: 'ПКУ п.193.1; ТР медичних виробів',
    asOf: '2026-01-01',
    source: 'МОЗ; Митний тариф',
    sourceUrl: 'https://moz.gov.ua',
  },
  {
    id: 'ct-9403',
    uktZedCode: '9403',
    name: 'Меблі (офісні, кухонні, з металу і дерева)',
    category: 'consumer',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 5 },
      { regime: 'EU', importRate: 0 },
      { regime: 'TR', importRate: 0 },
    ],
    legalBasis: 'Митний тариф',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-3208',
    uktZedCode: '3208',
    name: 'Фарби, лаки на основі полімерів у неводному середовищі',
    category: 'chemicals',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 6.5 },
      { regime: 'EU', importRate: 0 },
      { regime: 'UK', importRate: 0 },
    ],
    legalBasis: 'Митний тариф',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-7210',
    uktZedCode: '7210',
    name: 'Прокат плоский з вуглецевої сталі з покриттям',
    category: 'metals',
    vatRate: 20,
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0, note: 'У межах квоти ЄС, поза квотою — захисне мито' },
    ],
    legalBasis: 'Митний тариф; Регламент ЄС 2015/478',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-1001',
    uktZedCode: '1001',
    name: 'Пшениця і суміш пшениці та жита',
    category: 'agro',
    vatRate: 14,
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0 },
    ],
    permits: ['Фітосанітарний сертифікат'],
    legalBasis: 'Митний тариф; ЗУ «Про карантин рослин»',
    asOf: '2026-01-01',
    source: 'Держпродспоживслужба',
    sourceUrl: 'https://dpss.gov.ua',
  },
  {
    id: 'ct-1507',
    uktZedCode: '1507',
    name: 'Олія соєва та її фракції',
    category: 'food',
    vatRate: 14,
    rates: [
      { regime: 'MFN', importRate: 10 },
      { regime: 'EU', importRate: 0 },
    ],
    legalBasis: 'Митний тариф',
    asOf: '2026-01-01',
    source: 'Митний тариф',
    sourceUrl: 'https://customs.gov.ua/uktzed',
  },
  {
    id: 'ct-2402',
    uktZedCode: '2402',
    name: 'Сигари, сигарили та сигарети з тютюном',
    category: 'consumer',
    vatRate: 20,
    excise: '2 175,80 ₴/1000 шт + 12% від макс.роздрібної ціни (на 2026)',
    rates: [
      { regime: 'MFN', importRate: 0 },
      { regime: 'EU', importRate: 0 },
    ],
    permits: ['Ліцензія на імпорт тютюну', 'Акцизні марки'],
    legalBasis: 'ПКУ ст.215.3.2',
    asOf: '2026-01-01',
    source: 'ПКУ',
    sourceUrl: 'https://zakon.rada.gov.ua/laws/show/2755-17',
  },
];

export function getCustomsTariffByCode(code: string): CustomsTariffEntry | undefined {
  return CUSTOMS_TARIFF.find((t) => t.uktZedCode === code || code.startsWith(t.uktZedCode));
}
