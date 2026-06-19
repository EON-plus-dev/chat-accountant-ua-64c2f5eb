// Stage 15: Договори про уникнення подвійного оподаткування (ДПО / DTT)
// Snapshot: 2026-04. Ставки у джерела виплати з України згідно з чинними конвенціями.
// Джерело: ДПС, перелік чинних DTT станом на 01.01.2026.

export type DttRegion = 'eu' | 'europe_non_eu' | 'asia' | 'americas' | 'africa' | 'cis' | 'middle_east' | 'oceania';

export const DTT_REGION_LABEL: Record<DttRegion, string> = {
  eu: 'ЄС',
  europe_non_eu: 'Європа (не ЄС)',
  cis: 'СНД',
  asia: 'Азія',
  americas: 'Америка',
  africa: 'Африка',
  middle_east: 'Близький Схід',
  oceania: 'Океанія',
};

export interface DttTreaty {
  id: string;            // ISO alpha-2 нижній регістр
  country: string;
  countryEn: string;
  region: DttRegion;
  flag: string;          // emoji
  inForceSince: string;  // дата набрання чинності для України
  dividends: string;     // ставка у джерела виплати
  dividendsNote?: string;
  interest: string;
  interestNote?: string;
  royalties: string;
  royaltiesNote?: string;
  permanentEstablishment?: string;  // термін будмайданчика для PE
  mli?: boolean;          // приєднана до MLI (BEPS)
  notes?: string[];
  popular?: boolean;
}

// Основні країни-партнери для IT-експорту, дивідендів і роялті
export const DTT_TREATIES: DttTreaty[] = [
  // ── ЄС ──
  {
    id: 'de', country: 'Німеччина', countryEn: 'Germany', region: 'eu', flag: '🇩🇪',
    inForceSince: '04.10.1996',
    dividends: '5% / 10%',
    dividendsNote: '5% — при участі ≥20% капіталу і інвестиції ≥100 тис. USD; інакше 10%.',
    interest: '2% / 5%',
    interestNote: '2% — за позиками банків і фінустанов, 5% — інші.',
    royalties: '0% / 5%',
    royaltiesNote: '0% — авторські права на наукові праці, патенти, ноу-хау; 5% — торгові марки, фільми.',
    mli: true, popular: true,
  },
  {
    id: 'pl', country: 'Польща', countryEn: 'Poland', region: 'eu', flag: '🇵🇱',
    inForceSince: '11.03.1994',
    dividends: '5% / 15%',
    dividendsNote: '5% — при участі ≥25% капіталу; інакше 15%.',
    interest: '10%',
    royalties: '10%',
    mli: true, popular: true,
  },
  {
    id: 'cy', country: 'Кіпр', countryEn: 'Cyprus', region: 'eu', flag: '🇨🇾',
    inForceSince: '07.08.2013 (Протокол 28.11.2019)',
    dividends: '5% / 15%',
    dividendsNote: '5% — при участі ≥20% капіталу і інвестиції ≥100 тис. EUR; інакше 15%.',
    interest: '5%',
    royalties: '5% / 10%',
    royaltiesNote: '5% — наукові праці, патенти, ноу-хау; 10% — інше.',
    mli: true, popular: true,
    notes: ['Найпопулярніша холдингова юрисдикція для українського бізнесу до 2017. Зараз — посилена дія BEPS і MLI.'],
  },
  {
    id: 'nl', country: 'Нідерланди', countryEn: 'Netherlands', region: 'eu', flag: '🇳🇱',
    inForceSince: '02.11.1996 (Протокол 2018)',
    dividends: '5% / 15%',
    dividendsNote: '5% — при участі ≥20% капіталу; 0% — для пенсійних фондів.',
    interest: '2% / 10%',
    royalties: '10%',
    mli: true, popular: true,
  },
  {
    id: 'lt', country: 'Литва', countryEn: 'Lithuania', region: 'eu', flag: '🇱🇹',
    inForceSince: '25.12.1997',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'fr', country: 'Франція', countryEn: 'France', region: 'eu', flag: '🇫🇷',
    inForceSince: '01.11.1999',
    dividends: '0% / 5% / 15%',
    dividendsNote: '0% — при участі ≥50%; 5% — ≥10%; 15% — інші.',
    interest: '2% / 10%',
    royalties: '0% / 10%',
    royaltiesNote: '0% — авторські права; 10% — інші.',
    mli: true,
  },
  {
    id: 'it', country: 'Італія', countryEn: 'Italy', region: 'eu', flag: '🇮🇹',
    inForceSince: '25.02.2003',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '7%',
    mli: true,
  },
  {
    id: 'es', country: 'Іспанія', countryEn: 'Spain', region: 'eu', flag: '🇪🇸',
    inForceSince: '07.08.1986 (досі за договором СРСР)',
    dividends: '15% / 18%',
    interest: '0%',
    royalties: '0% / 5%',
    mli: true,
  },
  {
    id: 'cz', country: 'Чехія', countryEn: 'Czech Republic', region: 'eu', flag: '🇨🇿',
    inForceSince: '20.04.1999',
    dividends: '5% / 15%',
    interest: '5%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'at', country: 'Австрія', countryEn: 'Austria', region: 'eu', flag: '🇦🇹',
    inForceSince: '20.05.1999',
    dividends: '5% / 10%',
    interest: '2% / 5%',
    royalties: '0% / 5%',
    mli: true,
  },
  {
    id: 'ie', country: 'Ірландія', countryEn: 'Ireland', region: 'eu', flag: '🇮🇪',
    inForceSince: '17.08.2015',
    dividends: '5% / 15%',
    interest: '5% / 10%',
    royalties: '5% / 10%',
    mli: true, popular: true,
    notes: ['Популярна юрисдикція для IT-холдингів і ліцензування IP.'],
  },
  {
    id: 'lu', country: 'Люксембург', countryEn: 'Luxembourg', region: 'eu', flag: '🇱🇺',
    inForceSince: '18.04.2017',
    dividends: '5% / 15%',
    interest: '5% / 10%',
    royalties: '5% / 10%',
    mli: true,
  },
  {
    id: 'mt', country: 'Мальта', countryEn: 'Malta', region: 'eu', flag: '🇲🇹',
    inForceSince: '28.08.2017',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'ro', country: 'Румунія', countryEn: 'Romania', region: 'eu', flag: '🇷🇴',
    inForceSince: '17.11.1997',
    dividends: '10% / 15%',
    interest: '10%',
    royalties: '10% / 15%',
    mli: true,
  },
  {
    id: 'sk', country: 'Словаччина', countryEn: 'Slovakia', region: 'eu', flag: '🇸🇰',
    inForceSince: '22.11.1996',
    dividends: '10%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'hu', country: 'Угорщина', countryEn: 'Hungary', region: 'eu', flag: '🇭🇺',
    inForceSince: '24.06.1996',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '5%',
    mli: true,
  },
  {
    id: 'bg', country: 'Болгарія', countryEn: 'Bulgaria', region: 'eu', flag: '🇧🇬',
    inForceSince: '03.10.1997',
    dividends: '5%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'fi', country: 'Фінляндія', countryEn: 'Finland', region: 'eu', flag: '🇫🇮',
    inForceSince: '14.02.1998',
    dividends: '0% / 5% / 15%',
    interest: '5% / 10%',
    royalties: '0% / 5% / 10%',
    mli: true,
  },
  {
    id: 'se', country: 'Швеція', countryEn: 'Sweden', region: 'eu', flag: '🇸🇪',
    inForceSince: '04.06.1996',
    dividends: '0% / 5% / 10%',
    interest: '0% / 10%',
    royalties: '0% / 10%',
    mli: true,
  },
  {
    id: 'dk', country: 'Данія', countryEn: 'Denmark', region: 'eu', flag: '🇩🇰',
    inForceSince: '21.08.1996',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'be', country: 'Бельгія', countryEn: 'Belgium', region: 'eu', flag: '🇧🇪',
    inForceSince: '25.02.1999',
    dividends: '5% / 15%',
    interest: '2% / 10%',
    royalties: '0% / 5%',
    mli: true,
  },
  {
    id: 'pt', country: 'Португалія', countryEn: 'Portugal', region: 'eu', flag: '🇵🇹',
    inForceSince: '11.03.2002',
    dividends: '10% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'gr', country: 'Греція', countryEn: 'Greece', region: 'eu', flag: '🇬🇷',
    inForceSince: '26.09.2003',
    dividends: '5% / 10%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'ee', country: 'Естонія', countryEn: 'Estonia', region: 'eu', flag: '🇪🇪',
    inForceSince: '24.12.1996',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'lv', country: 'Латвія', countryEn: 'Latvia', region: 'eu', flag: '🇱🇻',
    inForceSince: '21.11.1996',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'hr', country: 'Хорватія', countryEn: 'Croatia', region: 'eu', flag: '🇭🇷',
    inForceSince: '01.06.1999',
    dividends: '5% / 10%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'si', country: 'Словенія', countryEn: 'Slovenia', region: 'eu', flag: '🇸🇮',
    inForceSince: '25.04.2007',
    dividends: '5% / 15%',
    interest: '5%',
    royalties: '5% / 10%',
    mli: true,
  },

  // ── Європа (не ЄС) ──
  {
    id: 'gb', country: 'Велика Британія', countryEn: 'United Kingdom', region: 'europe_non_eu', flag: '🇬🇧',
    inForceSince: '11.08.1993 (Протокол 09.10.2017)',
    dividends: '5% / 15%',
    interest: '0%',
    royalties: '0% / 5%',
    mli: true, popular: true,
  },
  {
    id: 'ch', country: 'Швейцарія', countryEn: 'Switzerland', region: 'europe_non_eu', flag: '🇨🇭',
    inForceSince: '26.02.2002',
    dividends: '5% / 15%',
    interest: '0% / 10%',
    royalties: '0% / 10%',
    mli: true, popular: true,
  },
  {
    id: 'no', country: 'Норвегія', countryEn: 'Norway', region: 'europe_non_eu', flag: '🇳🇴',
    inForceSince: '18.09.1996',
    dividends: '5% / 15%',
    interest: '0% / 10%',
    royalties: '5% / 10%',
    mli: true,
  },
  {
    id: 'is', country: 'Ісландія', countryEn: 'Iceland', region: 'europe_non_eu', flag: '🇮🇸',
    inForceSince: '09.10.2008',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'tr', country: 'Туреччина', countryEn: 'Turkey', region: 'europe_non_eu', flag: '🇹🇷',
    inForceSince: '29.04.1998',
    dividends: '10% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true, popular: true,
  },
  {
    id: 'ge', country: 'Грузія', countryEn: 'Georgia', region: 'europe_non_eu', flag: '🇬🇪',
    inForceSince: '01.04.1999',
    dividends: '5% / 10%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'md', country: 'Молдова', countryEn: 'Moldova', region: 'europe_non_eu', flag: '🇲🇩',
    inForceSince: '27.05.1996',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },

  // ── Америка ──
  {
    id: 'us', country: 'США', countryEn: 'United States', region: 'americas', flag: '🇺🇸',
    inForceSince: '05.06.2000',
    dividends: '5% / 15%',
    dividendsNote: '5% — при участі ≥10% акцій з правом голосу.',
    interest: '0%',
    royalties: '10%',
    mli: false, popular: true,
    notes: ['США не приєдналася до MLI — діє оригінальний текст конвенції.'],
  },
  {
    id: 'ca', country: 'Канада', countryEn: 'Canada', region: 'americas', flag: '🇨🇦',
    inForceSince: '22.08.1996',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '0% / 10%',
    mli: true,
  },
  {
    id: 'br', country: 'Бразилія', countryEn: 'Brazil', region: 'americas', flag: '🇧🇷',
    inForceSince: '26.04.2006',
    dividends: '10% / 15%',
    interest: '15%',
    royalties: '15%',
    mli: true,
  },
  {
    id: 'mx', country: 'Мексика', countryEn: 'Mexico', region: 'americas', flag: '🇲🇽',
    inForceSince: '06.12.2012',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },

  // ── Азія ──
  {
    id: 'cn', country: 'Китай', countryEn: 'China', region: 'asia', flag: '🇨🇳',
    inForceSince: '18.10.1996',
    dividends: '5% / 10%',
    interest: '10%',
    royalties: '10%',
    mli: true, popular: true,
  },
  {
    id: 'jp', country: 'Японія', countryEn: 'Japan', region: 'asia', flag: '🇯🇵',
    inForceSince: '19.11.1986 (СРСР); новий — 2024',
    dividends: '5% / 15%',
    interest: '0% / 10%',
    royalties: '0% / 10%',
    mli: true,
  },
  {
    id: 'in', country: 'Індія', countryEn: 'India', region: 'asia', flag: '🇮🇳',
    inForceSince: '31.10.2001',
    dividends: '10% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'sg', country: 'Сингапур', countryEn: 'Singapore', region: 'asia', flag: '🇸🇬',
    inForceSince: '18.12.2009',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '7,5%',
    mli: true, popular: true,
    notes: ['Популярна юрисдикція для IT/fintech-холдингів.'],
  },
  {
    id: 'kr', country: 'Південна Корея', countryEn: 'South Korea', region: 'asia', flag: '🇰🇷',
    inForceSince: '19.03.2002',
    dividends: '5% / 15%',
    interest: '5%',
    royalties: '5%',
    mli: true,
  },
  {
    id: 'vn', country: 'Вʼєтнам', countryEn: 'Vietnam', region: 'asia', flag: '🇻🇳',
    inForceSince: '19.11.1998',
    dividends: '10%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'th', country: 'Таїланд', countryEn: 'Thailand', region: 'asia', flag: '🇹🇭',
    inForceSince: '24.11.2004',
    dividends: '10% / 15%',
    interest: '10% / 15%',
    royalties: '15%',
    mli: true,
  },
  {
    id: 'my', country: 'Малайзія', countryEn: 'Malaysia', region: 'asia', flag: '🇲🇾',
    inForceSince: '18.07.2018',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '8%',
    mli: true,
  },
  {
    id: 'id', country: 'Індонезія', countryEn: 'Indonesia', region: 'asia', flag: '🇮🇩',
    inForceSince: '09.11.1998',
    dividends: '10% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },

  // ── Близький Схід ──
  {
    id: 'ae', country: 'ОАЕ', countryEn: 'United Arab Emirates', region: 'middle_east', flag: '🇦🇪',
    inForceSince: '09.03.2004',
    dividends: '0% / 5%',
    dividendsNote: '0% — для державних установ; 5% — для приватних компаній.',
    interest: '3%',
    royalties: '0% / 10%',
    mli: true, popular: true,
    notes: ['Найпопулярніша низькоподаткова юрисдикція 2023-2026 завдяки 9% CIT.'],
  },
  {
    id: 'il', country: 'Ізраїль', countryEn: 'Israel', region: 'middle_east', flag: '🇮🇱',
    inForceSince: '20.04.2006',
    dividends: '5% / 10% / 15%',
    interest: '5% / 10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'sa', country: 'Саудівська Аравія', countryEn: 'Saudi Arabia', region: 'middle_east', flag: '🇸🇦',
    inForceSince: '01.12.2012',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'qa', country: 'Катар', countryEn: 'Qatar', region: 'middle_east', flag: '🇶🇦',
    inForceSince: '09.04.2019',
    dividends: '5% / 10%',
    interest: '5% / 10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'kw', country: 'Кувейт', countryEn: 'Kuwait', region: 'middle_east', flag: '🇰🇼',
    inForceSince: '22.02.2004',
    dividends: '5%',
    interest: '0%',
    royalties: '10%',
    mli: true,
  },

  // ── Африка ──
  {
    id: 'eg', country: 'Єгипет', countryEn: 'Egypt', region: 'africa', flag: '🇪🇬',
    inForceSince: '27.02.2002',
    dividends: '12%',
    interest: '12%',
    royalties: '12%',
    mli: true,
  },
  {
    id: 'za', country: 'Південна Африка', countryEn: 'South Africa', region: 'africa', flag: '🇿🇦',
    inForceSince: '23.12.2004',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'ma', country: 'Марокко', countryEn: 'Morocco', region: 'africa', flag: '🇲🇦',
    inForceSince: '30.03.2009',
    dividends: '10%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },

  // ── СНД ──
  {
    id: 'kz', country: 'Казахстан', countryEn: 'Kazakhstan', region: 'cis', flag: '🇰🇿',
    inForceSince: '14.04.1997',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'az', country: 'Азербайджан', countryEn: 'Azerbaijan', region: 'cis', flag: '🇦🇿',
    inForceSince: '03.07.2000',
    dividends: '10%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'uz', country: 'Узбекистан', countryEn: 'Uzbekistan', region: 'cis', flag: '🇺🇿',
    inForceSince: '26.07.1995',
    dividends: '10%',
    interest: '10%',
    royalties: '10%',
    mli: true,
  },
  {
    id: 'am', country: 'Вірменія', countryEn: 'Armenia', region: 'cis', flag: '🇦🇲',
    inForceSince: '19.11.1996',
    dividends: '5% / 15%',
    interest: '10%',
    royalties: '0%',
    mli: true,
  },

  // ── Океанія ──
  {
    id: 'au', country: 'Австралія', countryEn: 'Australia', region: 'oceania', flag: '🇦🇺',
    inForceSince: '25.11.1985 (СРСР, чинний для України)',
    dividends: '15%',
    interest: '10%',
    royalties: '10%',
    mli: false,
    notes: ['Чинна радянська конвенція; нова не підписана.'],
  },
];

export const DTT_AS_OF = '2026-04-30';

// Денонсовані / припинені дії
export const DTT_TERMINATED = [
  { country: 'Російська Федерація', countryEn: 'Russia', terminatedFrom: '2022-12-22', reason: 'Указ Президента № 873 — припинено дію.' },
  { country: 'Республіка Білорусь', countryEn: 'Belarus', terminatedFrom: '2024-02-19', reason: 'Постанова КМУ № 184 — призупинено.' },
];

export const getTreatiesByRegion = (r: DttRegion): DttTreaty[] =>
  DTT_TREATIES.filter((t) => t.region === r);

export const POPULAR_DTT = DTT_TREATIES.filter((t) => t.popular);

export const DTT_COUNT = DTT_TREATIES.length;
