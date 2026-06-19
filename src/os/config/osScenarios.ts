import type { Audience } from "./osCopy";

export type OsScenario = {
  id: string;
  audience: Audience;
  vertical: string;
  title: string;
  persona: string;
  pains: string[];
  outcomes: string[];
  demoHref: string;
};

export const osScenarios: OsScenario[] = [
  // ===== Business =====
  {
    id: "salon",
    audience: "business",
    vertical: "Краса",
    title: "Салон краси",
    persona: "ФОП 3 гр., 3 штатні + 7 ФОП-майстрів",
    pains: ["Подвійні записи в Instagram-чатах", "Розрахунки з майстрами вручну", "ПРРО окремо, CRM окремо"],
    outcomes: ["Один календар із публічною сторінкою для запису", "Авто-розподіл виторгу майстрам", "ПРРО + каса в одному вікні"],
    demoHref: "/dashboard?cabinet=demo-salon-3",
  },
  {
    id: "hotel",
    audience: "business",
    vertical: "HoReCa",
    title: "Готель / апарт-готель",
    persona: "ФОП/ТОВ, 30 номерів, ресепшн 24/7",
    pains: ["Booking + дзвінки + Excel = овербукінг", "Депозити не звіряються з банком", "Прибиральниці у Viber-чаті"],
    outcomes: ["Channel manager у кабінеті", "Депозити Apple/Google Pay прямо у віджеті", "Завдання для покоївок"],
    demoHref: "/dashboard?cabinet=demo-hotel-3",
  },
  {
    id: "tennis-club",
    audience: "business",
    vertical: "Спорт",
    title: "Тенісний клуб",
    persona: "ФОП, 8 кортів, 5 тренерів, Pro Shop",
    pains: ["Корти і тренери — у різних таблицях", "Pro Shop без обліку складу", "Абонементи рахуються вручну"],
    outcomes: ["Бронювання кортів і тренерів разом", "Pro Shop із SKU та ПРРО", "Абонементи з авто-списанням"],
    demoHref: "/dashboard?cabinet=demo-tennis-3",
  },
  {
    id: "restaurant",
    audience: "business",
    vertical: "HoReCa",
    title: "Ресторан / кафе",
    persona: "ТОВ, кухня + зал + доставка",
    pains: ["POS, доставка, бухгалтерія — три системи", "ПДВ + акциз без єдиного звіту", "Собівартість страв — на око"],
    outcomes: ["Замовлення з усіх каналів у одному потоці", "ПДВ авто з продажів", "Калькуляції з тех-картами"],
    demoHref: "/dashboard?cabinet=demo-restaurant-3",
  },
  {
    id: "services",
    audience: "business",
    vertical: "Послуги",
    title: "Агенція / бюро послуг",
    persona: "ТОВ, 10–25 співр., проєктна робота",
    pains: ["Угоди в Notion, акти у Word", "Проєкти і фінанси не звʼязані", "Делегації клієнтам — через email"],
    outcomes: ["Проєкти з бюджетом і факт-витратами", "Акти з КЕП у 2 кліки", "Клієнтський портал у кабінеті"],
    demoHref: "/dashboard?cabinet=demo-consulting-3",
  },
  {
    id: "retail",
    audience: "business",
    vertical: "Ритейл",
    title: "Магазин / онлайн-ритейл",
    persona: "ФОП/ТОВ, 1–3 точки + сайт",
    pains: ["Склад, ПРРО, повернення нарізно", "Маржа по SKU — невідома", "ПДВ-облік раз на місяць — авралом"],
    outcomes: ["Один потік: закупка → склад → продаж → повернення", "Маржа в розрізі SKU онлайн", "ПДВ-звіт із даних, а не з памʼяті"],
    demoHref: "/dashboard?cabinet=demo-dealer-2",
  },
  // ===== Individual =====
  {
    id: "freelancer",
    audience: "individual",
    vertical: "Робота",
    title: "Фрілансер з іноземними клієнтами",
    persona: "Фізособа з валютними доходами, без ФОП або з ФОП",
    pains: ["Доходи в USD/EUR, FX-курс ловлю вручну", "ЗЕД-декларація — щорічний стрес", "Контракти у Google Drive"],
    outcomes: ["Автоматичний валютний курс на дату зарахування", "Декларація з готовими сумами", "Хаб документів із пошуком"],
    demoHref: "/dashboard?cabinet=demo-individual-declarant",
  },
  {
    id: "investor",
    audience: "individual",
    vertical: "Фінанси",
    title: "Інвестор",
    persona: "Фізособа з портфелем акцій/ОВДП/крипти",
    pains: ["Лоти у трьох брокерах", "Зафіксований і нереалізований прибуток — у голові", "ПДФО з дивідендів — окремий квест"],
    outcomes: ["FIFO-облік лотів", "Зафіксований і нереалізований прибуток — автоматично", "Податки з дивідендів — у декларації"],
    demoHref: "/dashboard?cabinet=demo-individual-declarant",
  },
  {
    id: "family",
    audience: "individual",
    vertical: "Родина",
    title: "Родина з дітьми",
    persona: "2 дорослих, 2 дитини, спільні витрати",
    pains: ["Хто за що платив — у голові", "Документи дітей — по фото-папках", "Делегації бабусі без доступу"],
    outcomes: ["Спільний бюджет з категоріями", "Хаб документів із ролями для родини", "Делегації з межами доступу"],
    demoHref: "/dashboard?cabinet=demo-individual-declarant",
  },
  {
    id: "property",
    audience: "individual",
    vertical: "Нерухомість",
    title: "Власник нерухомості",
    persona: "Фізособа з 1–3 обʼєктами, частково в оренді",
    pains: ["Платежі ОСББ — у роздрукованих квитанціях", "Орендарі — у Telegram-чаті", "Податок на нерухомість — раптом"],
    outcomes: ["Платежі по обʼєктах окремо", "Орендарі як контакти з договорами", "Календар податку з нагадуванням"],
    demoHref: "/dashboard?cabinet=demo-individual-declarant",
  },
  {
    id: "foreign-income",
    audience: "individual",
    vertical: "ЗЕД",
    title: "Українець за кордоном",
    persona: "Фізособа з ВНЖ (посвідка на проживання) або тимчасовим захистом",
    pains: ["Доходи в двох країнах", "Подвійне оподаткування", "Залік закордонного податку (FTC) — як рахувати?"],
    outcomes: ["FX і доходи по країнах", "Залік закордонного податку (FTC)", "Календар обох податкових"],
    demoHref: "/dashboard?cabinet=demo-individual-declarant",
  },
  {
    id: "retiree",
    audience: "individual",
    vertical: "Турбота",
    title: "Пенсіонер / опікун",
    persona: "Фізособа з пенсією, ліками, делегаціями родині",
    pains: ["Ліки — у трьох рецептах", "Платежі — діти платять через Viber", "Документи — у папці на кухні"],
    outcomes: ["Картка здоровʼя з ліками", "Делегації дітям з лімітами", "Хаб документів зі скан-копіями"],
    demoHref: "/dashboard?cabinet=demo-individual-declarant",
  },
];

export const osScenariosByAudience = (a: Audience) => osScenarios.filter((s) => s.audience === a);
export const osScenariosById = Object.fromEntries(osScenarios.map((s) => [s.id, s]));
