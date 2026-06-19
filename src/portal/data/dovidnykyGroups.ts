/**
 * 8 тематичних груп для індексу /dovidnyky.
 * Кожен `sectionIds[]` посилається на `DovidnykySection.id`.
 * Розділ, не присутній в жодній групі, потрапляє у «Інше» автоматично.
 */
export interface DovidnykyGroup {
  id: string;
  label: string;
  emoji: string;
  description: string;
  sectionIds: string[];
}

export const DOVIDNYKY_GROUPS: DovidnykyGroup[] = [
  {
    id: 'tax',
    label: 'Податки і ставки',
    emoji: '💸',
    description: 'Ставки, пільги, коди бюджету, дедлайни і звітні форми',
    sectionIds: [
      'pdv-pilhy', 'stavky', 'kalendar', 'limity', 'zvitni-formy',
      'kkd', 'oznaky-dohodu', 'psp', 'kody-pilg', 'kody-pdv',
      'biudzhetni-rakhunky', 'kasovi-limity', 'tco',
    ],
  },
  {
    id: 'finance',
    label: 'Фінанси і платежі',
    emoji: '🏦',
    description: 'Банки, валюти, курси, інфляція, ОВДП',
    sectionIds: [
      'banky-mfo', 'valyuty', 'kursy-nbu', 'indeks-infliatsii',
      'kvo', 'valyutnyy-kontrol',
    ],
  },
  {
    id: 'zed',
    label: 'ЗЕД і митниця',
    emoji: '🚢',
    description: 'Митниця, УКТ ЗЕД, Incoterms, ДПО, міжнародні перевезення',
    sectionIds: [
      'mytni-dokumenty', 'ukt-zed', 'incoterms', 'dpo', 'krayiny',
      'customs-tariff', 'customs-sanctions', 'intl-carriers', 'rozmytnennya-avto',
    ],
  },
  {
    id: 'hr',
    label: 'HR і праця',
    emoji: '👥',
    description: 'Кадрові шаблони, зарплати, професії, військовий облік',
    sectionIds: [
      'hr-shablony', 'zarplaty', 'profesii', 'viyskovyy-oblik',
      'mobilizatsiya-bronyuvannya', 'trudovi-vyplaty',
    ],
  },
  {
    id: 'law',
    label: 'Право і договори',
    emoji: '⚖️',
    description: 'Закони, судова практика, договори, КЕП, нотаріуси, адвокати',
    sectionIds: [
      'zakony', 'sudy', 'rozyasnennia', 'dohovory', 'korporatyvne-pravo',
      'ip-prava', 'atsk-kep', 'notariusy', 'advokaty', 'sudovyj-zbir',
      'tsnap', 'perevirky-biznesu', 'penalties', 'sanctions',
      'litsenziyi', 'sertyfikatsii',
    ],
  },
  {
    id: 'realty',
    label: 'Будівництво і нерухомість',
    emoji: '🏗',
    description: 'ДБН, вартість м², оцінка землі, оренда, комунальні тарифи',
    sectionIds: [
      'dbn', 'vartist-budivnytstva', 'otsinka-zemli',
      'komertsiyna-orenda', 'komunalni-taryfy',
    ],
  },
  {
    id: 'auto',
    label: 'Авто і логістика',
    emoji: '🚗',
    description: 'ОСЦПВ, штрафи ПДР, розмитнення, АЗС, перевізники, пошта',
    sectionIds: [
      'osago', 'shtrafy-pdr', 'azs', 'tsiny-palyva',
      'domestic-carriers-b2b', 'poshtovi-operatory', 'poshtovi-indeksy',
    ],
  },
  {
    id: 'tech',
    label: 'IT, маркетинг, освіта',
    emoji: '💻',
    description: 'IT-ставки, шаблони договорів, бенчмарки, гранти, освіта',
    sectionIds: [
      'it-stavky', 'it-shablony-dohovoriv', 'marketingovi-benchmarky',
      'diia-city', 'navchalni-tsentry', 'granty-na-navchannya', 'granty',
    ],
  },
  {
    id: 'core',
    label: 'Установи, реєстри, довідки',
    emoji: '🏛',
    description: 'Каталог установ, держоргани, словник, реєстри, регіональні контакти',
    sectionIds: [
      'ustanovy', 'accountants', 'derzhorgany', 'slovnyk', 'reestry',
      'kved', 'katottg', 'plan-rakhunkiv', 'pervynni-dokumenty',
      'rro-pprro', 'templates', 'formy-biznesu', 'regionalni-kontakty',
    ],
  },
];

/** Index id→groupId for O(1) lookup */
export const SECTION_TO_GROUP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  DOVIDNYKY_GROUPS.forEach((g) => g.sectionIds.forEach((id) => { m[id] = g.id; }));
  return m;
})();

/** Pinned sections (top of /dovidnyky) */
export const PINNED_SECTION_IDS = [
  'kved', 'pdv-pilhy', 'zakony', 'granty', 'kursy-nbu', 'mytni-dokumenty',
];
