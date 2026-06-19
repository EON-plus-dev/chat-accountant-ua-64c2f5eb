// Тарифи нотаріусів 2026 — державне мито (ст. 3 Декрету КМУ № 7-93)
// + орієнтовні приватні тарифи (ринкові, м. Київ, січень 2026)
export const NOTARY_FEES_AS_OF = "2026-01-15";

export type NotaryCategory =
  | "real_estate"      // нерухомість
  | "vehicle"          // транспорт
  | "inheritance"      // спадщина
  | "power_of_attorney" // довіреності
  | "contracts"        // договори
  | "copies"           // копії, підписи
  | "corporate";       // корпоративні

export const NOTARY_CATEGORY_LABEL: Record<NotaryCategory, string> = {
  real_estate: "Нерухомість",
  vehicle: "Транспорт",
  inheritance: "Спадщина",
  power_of_attorney: "Довіреності",
  contracts: "Договори",
  copies: "Копії / підписи",
  corporate: "Корпоративні",
};

export interface NotaryFee {
  id: string;
  category: NotaryCategory;
  service: string;
  stateFee: string;       // державне мито (державний нотаріус)
  privateFee: string;     // приватний нотаріус (ринковий)
  legalBasis: string;     // Декрет № 7-93 ст. ...
  notes?: string;
}

export const NOTARY_FEES: NotaryFee[] = [
  // Нерухомість
  { id: "n-re-1", category: "real_estate", service: "Договір купівлі-продажу квартири/будинку",
    stateFee: "1% від суми (≥ 1 нмдг = 17 ₴)", privateFee: "3 500 – 8 000 ₴ + 1% держмита",
    legalBasis: "Декрет № 7-93 ст. 3 п. 1",
    notes: "+ 1% ПДФО продавцеві (якщо < 3 років володіння) + 1.5% військовий збір + 1% збір ПФУ (покупець)" },
  { id: "n-re-2", category: "real_estate", service: "Договір дарування нерухомості",
    stateFee: "1% від оціночної вартості", privateFee: "3 000 – 7 000 ₴",
    legalBasis: "Декрет № 7-93 ст. 3 п. 1",
    notes: "Між родичами 1-го ступеня — 0% ПДФО, інакше 5% ПДФО + 1.5% ВЗ" },
  { id: "n-re-3", category: "real_estate", service: "Іпотечний договір",
    stateFee: "0.01% від суми зобов'язання (≥ 5 нмдг = 85 ₴)", privateFee: "2 500 – 5 000 ₴",
    legalBasis: "Декрет № 7-93 ст. 3 п. 1",
    notes: "Реєстрація обтяження в ДРРП — 230 ₴ (2024)" },
  { id: "n-re-4", category: "real_estate", service: "Договір оренди землі (нотар.)",
    stateFee: "0.01% від суми", privateFee: "2 000 – 4 500 ₴",
    legalBasis: "Декрет № 7-93 ст. 3" },

  // Транспорт
  { id: "n-veh-1", category: "vehicle", service: "Договір купівлі-продажу авто",
    stateFee: "5% від вартості (мін. 1 нмдг)", privateFee: "1 200 – 2 500 ₴",
    legalBasis: "Декрет № 7-93 ст. 3 п. 4",
    notes: "Альтернатива — комісійний договір у сервісному центрі МВС (значно дешевше)" },
  { id: "n-veh-2", category: "vehicle", service: "Довіреність на керування ТЗ",
    stateFee: "85 ₴ (5 нмдг)", privateFee: "400 – 800 ₴",
    legalBasis: "Декрет № 7-93 ст. 3" },

  // Спадщина
  { id: "n-inh-1", category: "inheritance", service: "Свідоцтво про право на спадщину",
    stateFee: "0.5% від вартості майна (≥ 1 нмдг)", privateFee: "1 500 – 5 000 ₴",
    legalBasis: "Декрет № 7-93 ст. 3 п. 16",
    notes: "Безкоштовно для родичів 1-го та 2-го ступеня, інвалідів I-II групи" },
  { id: "n-inh-2", category: "inheritance", service: "Заведення спадкової справи",
    stateFee: "Безкоштовно (держ. нотаріус за місцем відкриття)", privateFee: "1 000 – 3 000 ₴",
    legalBasis: "ЦК ст. 1268, Закон № 3425-XII" },
  { id: "n-inh-3", category: "inheritance", service: "Заповіт (нотар. посвідчення)",
    stateFee: "85 ₴ (5 нмдг)", privateFee: "500 – 1 500 ₴",
    legalBasis: "Декрет № 7-93 ст. 3" },

  // Довіреності
  { id: "n-pa-1", category: "power_of_attorney", service: "Генеральна довіреність (загальна)",
    stateFee: "85 ₴", privateFee: "600 – 1 200 ₴", legalBasis: "Декрет № 7-93 ст. 3" },
  { id: "n-pa-2", category: "power_of_attorney", service: "Разова довіреність",
    stateFee: "17 ₴ (1 нмдг)", privateFee: "300 – 700 ₴", legalBasis: "Декрет № 7-93 ст. 3" },
  { id: "n-pa-3", category: "power_of_attorney", service: "Скасування довіреності",
    stateFee: "17 ₴", privateFee: "300 – 600 ₴", legalBasis: "ЦК ст. 248" },

  // Договори
  { id: "n-con-1", category: "contracts", service: "Шлюбний договір",
    stateFee: "85 ₴ (5 нмдг)", privateFee: "2 000 – 5 000 ₴", legalBasis: "Декрет № 7-93 ст. 3" },
  { id: "n-con-2", category: "contracts", service: "Аліментний договір",
    stateFee: "17 ₴", privateFee: "1 000 – 2 500 ₴", legalBasis: "Декрет № 7-93 ст. 3" },

  // Копії, підписи
  { id: "n-cp-1", category: "copies", service: "Засвідчення копії документа (за сторінку)",
    stateFee: "3 ₴/стор.", privateFee: "30 – 60 ₴/стор.", legalBasis: "Декрет № 7-93 ст. 3 п. 11" },
  { id: "n-cp-2", category: "copies", service: "Засвідчення справжності підпису",
    stateFee: "17 ₴", privateFee: "200 – 500 ₴", legalBasis: "Декрет № 7-93 ст. 3 п. 12" },
  { id: "n-cp-3", category: "copies", service: "Переклад документа (підпис перекладача)",
    stateFee: "51 ₴ (3 нмдг)", privateFee: "300 – 800 ₴", legalBasis: "Декрет № 7-93 ст. 3" },

  // Корпоративні
  { id: "n-corp-1", category: "corporate", service: "Засвідчення підпису на статуті ТОВ",
    stateFee: "17 ₴ за підпис", privateFee: "500 – 1 500 ₴", legalBasis: "Декрет № 7-93 ст. 3" },
  { id: "n-corp-2", category: "corporate", service: "Договір купівлі-продажу корпоративних прав",
    stateFee: "1% від суми (мін. 1 нмдг)", privateFee: "3 000 – 10 000 ₴", legalBasis: "Декрет № 7-93 ст. 3" },
  { id: "n-corp-3", category: "corporate", service: "Протокол ЗЗУ нотар. форми",
    stateFee: "85 ₴", privateFee: "1 500 – 3 500 ₴", legalBasis: "ЗУ № 2275-VIII" },
];

export const NMDG_2026 = 17; // 1 неоподатковуваний мінімум доходів громадян = 17 ₴
