// ЦНАП — Центри надання адміністративних послуг
// Найпоширеніші послуги, тарифи, терміни. Snapshot 2026-01
export const CNAP_SERVICES_AS_OF = "2026-01-15";

export type CnapCategory =
  | "passport"        // паспорти, ID
  | "registration"    // прописка / реєстрація місця проживання
  | "civil_status"    // РАЦС
  | "land_realty"     // земля, нерухомість
  | "vehicle"         // транспорт (через сервцентр МВС)
  | "business"        // бізнес (через держреєстратора)
  | "social";         // соц. послуги, субсидії

export const CNAP_CATEGORY_LABEL: Record<CnapCategory, string> = {
  passport: "Паспортні",
  registration: "Реєстрація місця проживання",
  civil_status: "РАЦС / Цивільний стан",
  land_realty: "Земля та нерухомість",
  vehicle: "Транспорт",
  business: "Бізнес-реєстрація",
  social: "Соціальні",
};

export interface CnapService {
  id: string;
  category: CnapCategory;
  service: string;
  fee: string;            // адм. збір / держмито
  term: string;           // термін
  documents: string[];    // ключові документи
  onlineDiia?: boolean;   // доступно в Дії
  notes?: string;
}

export const CNAP_SERVICES: CnapService[] = [
  // Паспортні
  { id: "c-pass-1", category: "passport", service: "ID-картка (вперше, 14 років)",
    fee: "Безкоштовно (адм. збір 0 ₴) — вперше з 14 р.",
    term: "20 робочих днів (приск. 10 — +кошт)",
    documents: ["Свідоцтво про народження", "1 фото 3.5×4.5 (роблять на місці)"],
    onlineDiia: false, notes: "Платні: приск. видача 10 робочих днів — 391 ₴, 5 — 553 ₴" },
  { id: "c-pass-2", category: "passport", service: "Заміна ID-картки (втрата/пошкодження)",
    fee: "391 ₴ адм. збір + 87 ₴ бланк",
    term: "20 робочих днів",
    documents: ["Заява", "Документ, що підтверджує особу"],
    onlineDiia: false },
  { id: "c-pass-3", category: "passport", service: "Закордонний паспорт (біометричний)",
    fee: "682 ₴ (звичайно) / 1 034 ₴ (приск. 7 днів)",
    term: "20 робочих днів / 7 робочих днів",
    documents: ["ID-картка", "Платіжка адм. збору"],
    onlineDiia: false, notes: "Дитячий — 372 ₴, приск. — 724 ₴" },

  // Реєстрація місця проживання
  { id: "c-reg-1", category: "registration", service: "Реєстрація / зняття з реєстрації місця проживання",
    fee: "Безкоштовно (якщо в межах 30 днів після зміни)",
    term: "1 робочий день",
    documents: ["ID-картка", "Документ на житло / згода власника"],
    onlineDiia: true, notes: "Прострочка — штраф 17–51 ₴ (КУпАП ст. 197)" },
  { id: "c-reg-2", category: "registration", service: "Довідка про склад сім'ї / місце проживання",
    fee: "Безкоштовно",
    term: "1–3 робочі дні",
    documents: ["ID-картка"],
    onlineDiia: true },

  // РАЦС
  { id: "c-rac-1", category: "civil_status", service: "Реєстрація шлюбу",
    fee: "85 ₴ (5 нмдг) держмито + 600–1 200 ₴ урочиста церемонія",
    term: "1 місяць від подачі заяви (можна < 1 міс. з поважних причин)",
    documents: ["Паспорти", "Свідоцтва про розлучення (якщо повторно)"],
    onlineDiia: true, notes: "Послуга 'Шлюб за добу' — у пілотних містах, 24 год" },
  { id: "c-rac-2", category: "civil_status", service: "Розірвання шлюбу (за згодою, без дітей)",
    fee: "пільга — 0 ₴ держмита, проте 25.50 ₴ (1.5 нмдг) за реєстрацію",
    term: "1 місяць",
    documents: ["Паспорти", "Свідоцтво про шлюб", "Спільна заява"],
    onlineDiia: true },
  { id: "c-rac-3", category: "civil_status", service: "Свідоцтво про народження дитини",
    fee: "Безкоштовно",
    term: "1 робочий день",
    documents: ["Медичне свідоцтво про народження", "Паспорти батьків"],
    onlineDiia: true, notes: "Послуга 'єМалятко' — 10 послуг одночасно" },
  { id: "c-rac-4", category: "civil_status", service: "Дублікат свідоцтва РАЦС",
    fee: "85 ₴", term: "5 робочих днів",
    documents: ["ID-картка", "Заява"], onlineDiia: true },

  // Земля та нерухомість
  { id: "c-land-1", category: "land_realty", service: "Витяг з ДРРП про право власності",
    fee: "300 ₴ (паперовий) / 150 ₴ (електронний)",
    term: "До 5 робочих днів / миттєво (онлайн)",
    documents: ["ID-картка"], onlineDiia: true },
  { id: "c-land-2", category: "land_realty", service: "Витяг з Держземкадастру",
    fee: "186 ₴ (паперовий) / 130 ₴ (електронний)",
    term: "3 робочі дні", documents: ["Кадастровий номер ділянки"], onlineDiia: true },
  { id: "c-land-3", category: "land_realty", service: "Реєстрація права власності на нерухомість",
    fee: "230 ₴ (звичайно) / 11 500 ₴ (приск. 24 год)",
    term: "5 робочих днів / 1 робочий день",
    documents: ["Договір (нотар. посв.)", "Технічний паспорт", "Витяг з реєстру речових прав"],
    onlineDiia: false },

  // Транспорт (через сервцентр МВС, не ЦНАП, але часто плутають)
  { id: "c-veh-1", category: "vehicle", service: "Перереєстрація ТЗ (зміна власника)",
    fee: "Адм. збір 220 ₴ + посвідчення про реєстрацію 219 ₴ + експертиза 600–1 200 ₴",
    term: "1 робочий день",
    documents: ["ID-картка", "Договір купівлі-продажу", "Тех. паспорт", "Поліс ОСЦПВ"],
    onlineDiia: true, notes: "Послуга 'Авто на дитину/дружину' — в Дії" },

  // Бізнес (державний реєстратор у ЦНАП)
  { id: "c-biz-1", category: "business", service: "Реєстрація ТОВ (через держреєстратора)",
    fee: "Безкоштовно (з 2018 р.)",
    term: "24 год",
    documents: ["Статут (підписи нотар.)", "Протокол ЗЗУ", "Заява"],
    onlineDiia: true, notes: "Онлайн через 'Дія.Бізнес' — 24 год, 0 ₴" },
  { id: "c-biz-2", category: "business", service: "Реєстрація ФОП",
    fee: "Безкоштовно",
    term: "24 год",
    documents: ["ID-картка", "КВЕДи"],
    onlineDiia: true, notes: "Через Дію — миттєво з КЕП" },
  { id: "c-biz-3", category: "business", service: "Внесення змін до ЄДР (зміна КВЕД, директора, статуту)",
    fee: "0.3 ПМПО ≈ 908 ₴",
    term: "24 год",
    documents: ["Рішення засновників", "Заява", "Документ про сплату"],
    onlineDiia: true },
  { id: "c-biz-4", category: "business", service: "Припинення ФОП",
    fee: "Безкоштовно",
    term: "24 год", documents: ["Заява"], onlineDiia: true },

  // Соціальні
  { id: "c-soc-1", category: "social", service: "Призначення житлової субсидії",
    fee: "Безкоштовно",
    term: "10 робочих днів",
    documents: ["Заява", "Декларація доходів"],
    onlineDiia: true },
  { id: "c-soc-2", category: "social", service: "Допомога при народженні дитини",
    fee: "Безкоштовно",
    term: "10 робочих днів",
    documents: ["Свідоцтво про народження", "Заява"],
    onlineDiia: true, notes: "41 280 ₴ одноразово + 860 ₴/міс на 3 роки (2026)" },
  { id: "c-soc-3", category: "social", service: "Видача УБД (учасник бойових дій)",
    fee: "Безкоштовно",
    term: "До 30 днів",
    documents: ["Документи з військової частини", "Заява"],
    onlineDiia: false },
];
