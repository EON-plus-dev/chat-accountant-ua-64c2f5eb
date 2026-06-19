/**
 * ISO 3166-1 коди країн (alpha-2, alpha-3, numeric).
 * Використання: митні декларації (УКТ ЗЕД, ВМД), форма 4ДФ для нерезидентів,
 * SWIFT-платежі (BIC, IBAN), CRS/FATCA, статистична звітність НБУ, ЗЕД-контракти.
 * Snapshot: квітень 2026. Джерело: iso.org/iso-3166, державні класифікатори.
 */

export const COUNTRY_CODES_AS_OF = '2026-04';

export type CountryGroup =
  | 'eu'
  | 'g7'
  | 'cis_partner'
  | 'fatf_high_risk'
  | 'sanctioned'
  | 'offshore'
  | 'major_trade'
  | 'other';

export type CountryRiskLevel = 'safe' | 'enhanced' | 'high_risk' | 'sanctioned';

export interface CountryCodeEntry {
  /** ISO 3166-1 alpha-2 (2 літери) — основний код для SWIFT, IBAN, доменів. */
  alpha2: string;
  /** ISO 3166-1 alpha-3 (3 літери) — для митних декларацій ЗЕД. */
  alpha3: string;
  /** ISO 3166-1 numeric (3 цифри) — для статистики і митниць. */
  numeric: string;
  /** Українська назва. */
  name: string;
  /** Офіційна повна назва (для контрактів). */
  fullName?: string;
  /** Емодзі-прапор для UI. */
  flag: string;
  /** Регіон / основна група. */
  group: CountryGroup;
  /** Рівень ризику для фін-моніторингу та ЗЕД. */
  risk: CountryRiskLevel;
  /** Наявність Угоди про уникнення подвійного оподаткування з Україною. */
  hasDtt: boolean;
  /** Чи поширений у ЗЕД-операціях. */
  popular?: boolean;
  /** Особлива нотатка (санкції, специфіка митниці тощо). */
  note?: string;
}

export const COUNTRY_GROUP_LABEL: Record<CountryGroup, string> = {
  eu: 'ЄС',
  g7: 'G7',
  cis_partner: 'Партнери (Молдова, Грузія)',
  fatf_high_risk: 'FATF — підвищений ризик',
  sanctioned: 'Під санкціями',
  offshore: 'Офшорна юрисдикція',
  major_trade: 'Великі торгові партнери',
  other: 'Інші',
};

export const COUNTRY_RISK_LABEL: Record<CountryRiskLevel, { text: string; cls: string }> = {
  safe: { text: 'Низький', cls: 'text-emerald-600' },
  enhanced: { text: 'Посилений', cls: 'text-amber-600' },
  high_risk: { text: 'Високий (FATF)', cls: 'text-orange-600' },
  sanctioned: { text: 'Санкції', cls: 'text-red-600' },
};

export const COUNTRIES: CountryCodeEntry[] = [
  // ── ЄС (топ-торгові партнери) ──
  { alpha2: 'PL', alpha3: 'POL', numeric: '616', name: 'Польща', fullName: 'Республіка Польща', flag: '🇵🇱', group: 'eu', risk: 'safe', hasDtt: true, popular: true, note: 'Топ-1 експорт України. Кордон, ЦКТ.' },
  { alpha2: 'DE', alpha3: 'DEU', numeric: '276', name: 'Німеччина', fullName: 'Федеративна Республіка Німеччина', flag: '🇩🇪', group: 'eu', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'NL', alpha3: 'NLD', numeric: '528', name: 'Нідерланди', fullName: 'Королівство Нідерландів', flag: '🇳🇱', group: 'eu', risk: 'safe', hasDtt: true, popular: true, note: 'Часто транзит для холдингів IT.' },
  { alpha2: 'IT', alpha3: 'ITA', numeric: '380', name: 'Італія', fullName: 'Італійська Республіка', flag: '🇮🇹', group: 'eu', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'ES', alpha3: 'ESP', numeric: '724', name: 'Іспанія', fullName: 'Королівство Іспанія', flag: '🇪🇸', group: 'eu', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'FR', alpha3: 'FRA', numeric: '250', name: 'Франція', fullName: 'Французька Республіка', flag: '🇫🇷', group: 'eu', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'RO', alpha3: 'ROU', numeric: '642', name: 'Румунія', fullName: 'Румунія', flag: '🇷🇴', group: 'eu', risk: 'safe', hasDtt: true, popular: true, note: 'Кордон, дунайські порти.' },
  { alpha2: 'HU', alpha3: 'HUN', numeric: '348', name: 'Угорщина', fullName: 'Угорщина', flag: '🇭🇺', group: 'eu', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'SK', alpha3: 'SVK', numeric: '703', name: 'Словаччина', fullName: 'Словацька Республіка', flag: '🇸🇰', group: 'eu', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'CZ', alpha3: 'CZE', numeric: '203', name: 'Чехія', fullName: 'Чеська Республіка', flag: '🇨🇿', group: 'eu', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'AT', alpha3: 'AUT', numeric: '040', name: 'Австрія', fullName: 'Австрійська Республіка', flag: '🇦🇹', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'BE', alpha3: 'BEL', numeric: '056', name: 'Бельгія', fullName: 'Королівство Бельгія', flag: '🇧🇪', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'SE', alpha3: 'SWE', numeric: '752', name: 'Швеція', fullName: 'Королівство Швеція', flag: '🇸🇪', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'FI', alpha3: 'FIN', numeric: '246', name: 'Фінляндія', fullName: 'Фінляндська Республіка', flag: '🇫🇮', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'DK', alpha3: 'DNK', numeric: '208', name: 'Данія', fullName: 'Королівство Данія', flag: '🇩🇰', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'IE', alpha3: 'IRL', numeric: '372', name: 'Ірландія', fullName: 'Ірландія', flag: '🇮🇪', group: 'eu', risk: 'enhanced', hasDtt: true, note: 'Низькі податки для IT — підвищена увага ДПС.' },
  { alpha2: 'LT', alpha3: 'LTU', numeric: '440', name: 'Литва', fullName: 'Литовська Республіка', flag: '🇱🇹', group: 'eu', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'LV', alpha3: 'LVA', numeric: '428', name: 'Латвія', fullName: 'Латвійська Республіка', flag: '🇱🇻', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'EE', alpha3: 'EST', numeric: '233', name: 'Естонія', fullName: 'Естонська Республіка', flag: '🇪🇪', group: 'eu', risk: 'safe', hasDtt: true, popular: true, note: 'e-Residency, популярно для IT.' },
  { alpha2: 'BG', alpha3: 'BGR', numeric: '100', name: 'Болгарія', fullName: 'Республіка Болгарія', flag: '🇧🇬', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'GR', alpha3: 'GRC', numeric: '300', name: 'Греція', fullName: 'Грецька Республіка', flag: '🇬🇷', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'PT', alpha3: 'PRT', numeric: '620', name: 'Португалія', fullName: 'Португальська Республіка', flag: '🇵🇹', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'HR', alpha3: 'HRV', numeric: '191', name: 'Хорватія', fullName: 'Республіка Хорватія', flag: '🇭🇷', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'SI', alpha3: 'SVN', numeric: '705', name: 'Словенія', fullName: 'Республіка Словенія', flag: '🇸🇮', group: 'eu', risk: 'safe', hasDtt: true },
  { alpha2: 'LU', alpha3: 'LUX', numeric: '442', name: 'Люксембург', fullName: 'Велике Герцогство Люксембург', flag: '🇱🇺', group: 'eu', risk: 'enhanced', hasDtt: true, note: 'Холдингова юрисдикція — особлива увага.' },
  { alpha2: 'MT', alpha3: 'MLT', numeric: '470', name: 'Мальта', fullName: 'Республіка Мальта', flag: '🇲🇹', group: 'eu', risk: 'enhanced', hasDtt: true, note: 'У переліку низькоподаткових для ст. 39 ПКУ.' },
  { alpha2: 'CY', alpha3: 'CYP', numeric: '196', name: 'Кіпр', fullName: 'Республіка Кіпр', flag: '🇨🇾', group: 'eu', risk: 'enhanced', hasDtt: true, popular: true, note: 'Класичний холдинг — посилений контроль ТЦО.' },

  // ── G7 / великі економіки ──
  { alpha2: 'US', alpha3: 'USA', numeric: '840', name: 'США', fullName: 'Сполучені Штати Америки', flag: '🇺🇸', group: 'g7', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'GB', alpha3: 'GBR', numeric: '826', name: 'Велика Британія', fullName: 'Сполучене Королівство Великої Британії та Північної Ірландії', flag: '🇬🇧', group: 'g7', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'CA', alpha3: 'CAN', numeric: '124', name: 'Канада', fullName: 'Канада', flag: '🇨🇦', group: 'g7', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'JP', alpha3: 'JPN', numeric: '392', name: 'Японія', fullName: 'Японія', flag: '🇯🇵', group: 'g7', risk: 'safe', hasDtt: true },
  { alpha2: 'AU', alpha3: 'AUS', numeric: '036', name: 'Австралія', fullName: 'Австралійський Союз', flag: '🇦🇺', group: 'g7', risk: 'safe', hasDtt: false, note: 'ДПО на стадії укладення.' },
  { alpha2: 'CH', alpha3: 'CHE', numeric: '756', name: 'Швейцарія', fullName: 'Швейцарська Конфедерація', flag: '🇨🇭', group: 'g7', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'NO', alpha3: 'NOR', numeric: '578', name: 'Норвегія', fullName: 'Королівство Норвегія', flag: '🇳🇴', group: 'g7', risk: 'safe', hasDtt: true },

  // ── Великі торгові партнери Азії / світу ──
  { alpha2: 'CN', alpha3: 'CHN', numeric: '156', name: 'Китай', fullName: 'Китайська Народна Республіка', flag: '🇨🇳', group: 'major_trade', risk: 'safe', hasDtt: true, popular: true, note: 'Топ-імпортер. Сертифікати CCC, обовʼязкові експертизи.' },
  { alpha2: 'TR', alpha3: 'TUR', numeric: '792', name: 'Туреччина', fullName: 'Турецька Республіка', flag: '🇹🇷', group: 'major_trade', risk: 'safe', hasDtt: true, popular: true, note: 'Угода про ЗВТ — пільгові ставки мита.' },
  { alpha2: 'IN', alpha3: 'IND', numeric: '356', name: 'Індія', fullName: 'Республіка Індія', flag: '🇮🇳', group: 'major_trade', risk: 'safe', hasDtt: true, popular: true },
  { alpha2: 'KR', alpha3: 'KOR', numeric: '410', name: 'Південна Корея', fullName: 'Республіка Корея', flag: '🇰🇷', group: 'major_trade', risk: 'safe', hasDtt: true },
  { alpha2: 'IL', alpha3: 'ISR', numeric: '376', name: 'Ізраїль', fullName: 'Держава Ізраїль', flag: '🇮🇱', group: 'major_trade', risk: 'safe', hasDtt: true, note: 'Угода про ЗВТ.' },
  { alpha2: 'AE', alpha3: 'ARE', numeric: '784', name: 'ОАЕ', fullName: 'Обʼєднані Арабські Емірати', flag: '🇦🇪', group: 'major_trade', risk: 'enhanced', hasDtt: true, popular: true, note: 'Низькі податки — посилена увага ТЦО.' },
  { alpha2: 'SA', alpha3: 'SAU', numeric: '682', name: 'Саудівська Аравія', fullName: 'Королівство Саудівська Аравія', flag: '🇸🇦', group: 'major_trade', risk: 'safe', hasDtt: true },
  { alpha2: 'EG', alpha3: 'EGY', numeric: '818', name: 'Єгипет', fullName: 'Арабська Республіка Єгипет', flag: '🇪🇬', group: 'major_trade', risk: 'safe', hasDtt: true, popular: true, note: 'Експорт зерна — топ-3 для України.' },
  { alpha2: 'BR', alpha3: 'BRA', numeric: '076', name: 'Бразилія', fullName: 'Федеративна Республіка Бразилія', flag: '🇧🇷', group: 'major_trade', risk: 'safe', hasDtt: true },
  { alpha2: 'VN', alpha3: 'VNM', numeric: '704', name: 'Вʼєтнам', fullName: 'Соціалістична Республіка Вʼєтнам', flag: '🇻🇳', group: 'major_trade', risk: 'safe', hasDtt: true },
  { alpha2: 'MX', alpha3: 'MEX', numeric: '484', name: 'Мексика', fullName: 'Мексиканські Сполучені Штати', flag: '🇲🇽', group: 'major_trade', risk: 'safe', hasDtt: true },
  { alpha2: 'ZA', alpha3: 'ZAF', numeric: '710', name: 'ПАР', fullName: 'Південно-Африканська Республіка', flag: '🇿🇦', group: 'major_trade', risk: 'enhanced', hasDtt: true, note: 'FATF grey list (раніше).' },
  { alpha2: 'TH', alpha3: 'THA', numeric: '764', name: 'Таїланд', fullName: 'Королівство Таїланд', flag: '🇹🇭', group: 'major_trade', risk: 'safe', hasDtt: true },
  { alpha2: 'SG', alpha3: 'SGP', numeric: '702', name: 'Сингапур', fullName: 'Республіка Сингапур', flag: '🇸🇬', group: 'major_trade', risk: 'enhanced', hasDtt: true, popular: true, note: 'Холдинги, фінансовий центр — увага ТЦО.' },
  { alpha2: 'HK', alpha3: 'HKG', numeric: '344', name: 'Гонконг', fullName: 'Гонконг — спеціальний адміністративний район КНР', flag: '🇭🇰', group: 'offshore', risk: 'enhanced', hasDtt: false, note: 'У переліку низькоподаткових за ст. 39 ПКУ.' },
  { alpha2: 'GE', alpha3: 'GEO', numeric: '268', name: 'Грузія', fullName: 'Грузія', flag: '🇬🇪', group: 'cis_partner', risk: 'safe', hasDtt: true, popular: true, note: 'Угода про ЗВТ, безвіз для бізнесу.' },
  { alpha2: 'MD', alpha3: 'MDA', numeric: '498', name: 'Молдова', fullName: 'Республіка Молдова', flag: '🇲🇩', group: 'cis_partner', risk: 'safe', hasDtt: true, popular: true, note: 'Угода про асоціацію з ЄС, ЗВТ.' },
  { alpha2: 'AM', alpha3: 'ARM', numeric: '051', name: 'Вірменія', fullName: 'Республіка Вірменія', flag: '🇦🇲', group: 'other', risk: 'enhanced', hasDtt: true, note: 'Член ЄАЕС.' },
  { alpha2: 'AZ', alpha3: 'AZE', numeric: '031', name: 'Азербайджан', fullName: 'Азербайджанська Республіка', flag: '🇦🇿', group: 'other', risk: 'safe', hasDtt: true },
  { alpha2: 'KZ', alpha3: 'KAZ', numeric: '398', name: 'Казахстан', fullName: 'Республіка Казахстан', flag: '🇰🇿', group: 'other', risk: 'enhanced', hasDtt: true, note: 'Член ЄАЕС — обмеження на товари подвійного призначення.' },
  { alpha2: 'UZ', alpha3: 'UZB', numeric: '860', name: 'Узбекистан', fullName: 'Республіка Узбекистан', flag: '🇺🇿', group: 'other', risk: 'safe', hasDtt: true },

  // ── Офшори / низькоподаткові ──
  
  { alpha2: 'VG', alpha3: 'VGB', numeric: '092', name: 'Британські Віргінські острови', flag: '🇻🇬', group: 'offshore', risk: 'high_risk', hasDtt: false, note: 'Класичний офшор — у переліку Кабміну за ст. 39 ПКУ.' },
  { alpha2: 'KY', alpha3: 'CYM', numeric: '136', name: 'Кайманові острови', flag: '🇰🇾', group: 'offshore', risk: 'high_risk', hasDtt: false, note: 'Офшор, посилений ТЦО.' },
  { alpha2: 'BZ', alpha3: 'BLZ', numeric: '084', name: 'Беліз', flag: '🇧🇿', group: 'offshore', risk: 'high_risk', hasDtt: false },
  { alpha2: 'PA', alpha3: 'PAN', numeric: '591', name: 'Панама', flag: '🇵🇦', group: 'offshore', risk: 'high_risk', hasDtt: false, note: 'FATF grey list періодично.' },
  { alpha2: 'SC', alpha3: 'SYC', numeric: '690', name: 'Сейшельські Острови', flag: '🇸🇨', group: 'offshore', risk: 'high_risk', hasDtt: false },
  { alpha2: 'MU', alpha3: 'MUS', numeric: '480', name: 'Маврикій', flag: '🇲🇺', group: 'offshore', risk: 'enhanced', hasDtt: false },
  { alpha2: 'LI', alpha3: 'LIE', numeric: '438', name: 'Ліхтенштейн', flag: '🇱🇮', group: 'offshore', risk: 'enhanced', hasDtt: false },
  { alpha2: 'MC', alpha3: 'MCO', numeric: '492', name: 'Монако', flag: '🇲🇨', group: 'offshore', risk: 'enhanced', hasDtt: false },

  // ── FATF / санкції ──
  { alpha2: 'IR', alpha3: 'IRN', numeric: '364', name: 'Іран', fullName: 'Ісламська Республіка Іран', flag: '🇮🇷', group: 'sanctioned', risk: 'sanctioned', hasDtt: false, note: 'FATF black list. Санкції РНБО.' },
  { alpha2: 'KP', alpha3: 'PRK', numeric: '408', name: 'КНДР', fullName: 'Корейська Народно-Демократична Республіка', flag: '🇰🇵', group: 'sanctioned', risk: 'sanctioned', hasDtt: false, note: 'FATF black list. Повна заборона.' },
  { alpha2: 'MM', alpha3: 'MMR', numeric: '104', name: 'М’янма', fullName: 'Республіка Союз М’янма', flag: '🇲🇲', group: 'fatf_high_risk', risk: 'high_risk', hasDtt: false, note: 'FATF black list.' },
  { alpha2: 'RU', alpha3: 'RUS', numeric: '643', name: 'росія', fullName: 'російська федерація', flag: '🇷🇺', group: 'sanctioned', risk: 'sanctioned', hasDtt: false, popular: true, note: 'Країна-агресор. ЗУ № 2120-IX — заборона будь-яких операцій.' },
  { alpha2: 'BY', alpha3: 'BLR', numeric: '112', name: 'білорусь', fullName: 'республіка білорусь', flag: '🇧🇾', group: 'sanctioned', risk: 'sanctioned', hasDtt: false, popular: true, note: 'Санкції РНБО, заборона ЗЕД-операцій.' },
  { alpha2: 'SY', alpha3: 'SYR', numeric: '760', name: 'Сирія', fullName: 'Сирійська Арабська Республіка', flag: '🇸🇾', group: 'sanctioned', risk: 'sanctioned', hasDtt: false },
  { alpha2: 'CU', alpha3: 'CUB', numeric: '192', name: 'Куба', fullName: 'Республіка Куба', flag: '🇨🇺', group: 'fatf_high_risk', risk: 'high_risk', hasDtt: false },
  { alpha2: 'YE', alpha3: 'YEM', numeric: '887', name: 'Ємен', fullName: 'Республіка Ємен', flag: '🇾🇪', group: 'fatf_high_risk', risk: 'high_risk', hasDtt: false, note: 'Високий ризик ВК / тероризму.' },
];
