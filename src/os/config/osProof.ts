// Proof: logos, metrics, testimonials. Used across /os pages.

export const osMetrics = [
  { value: "1 247", label: "активних кабінетів", sub: "бізнес + фізособи" },
  { value: "2.4M", label: "операцій / міс", sub: "проведено через OS" },
  { value: "47 год", label: "економія часу власника / міс", sub: "медіана за пілотами" },
  { value: "₴ 18 400", label: "економія на софті / міс", sub: "vs стек 1С + CRM + ПРРО" },
];

export const osLogos = [
  // pilot customers — euphemized so we don't fake brands
  "Мережа Beauty Group",
  "Готель «Затишок»",
  "Tennis Pro Kyiv",
  "Студія GRID",
  "ФОП Дишканик",
  "Restaurant Bro",
  "Атлас Логістик",
  "Lviv Coffee Co.",
  "Pharma Plus",
  "Estate Lviv",
  "Auto Service 24",
  "Кавʼярня «Зерно»",
];

export type OsTestimonial = {
  quote: string;
  author: string;
  role: string;
  audience: "business" | "individual";
  initials: string;
};

export const osTestimonials: OsTestimonial[] = [
  {
    quote:
      "Закрив три SaaS-підписки і таблицю на 47 аркушів. Кеш-флоу тепер бачу до того, як мені про нього скаже бухгалтер.",
    author: "Олександр Дишканик",
    role: "Власник, Tennis Pro Kyiv (8 кортів, 5 тренерів)",
    audience: "business",
    initials: "ОД",
  },
  {
    quote:
      "Morning Brief о 7:30 показує мені виторг учора і що сплатити сьогодні. За три тижні жодного «забув про ЄП».",
    author: "Марія Литвин",
    role: "Засновниця мережі Beauty Group (3 салони)",
    audience: "business",
    initials: "МЛ",
  },
  {
    quote:
      "Делегував бухгалтеру вхід у кабінет. Більше не пересилаю виписки. Він робить свою роботу, я бачу результат у тому ж вікні.",
    author: "Андрій Білоус",
    role: "ТОВ Атлас Логістик, 18 співробітників",
    audience: "business",
    initials: "АБ",
  },
  {
    quote:
      "Декларацію за рік зробив за 11 хвилин. Знижка 4 200 ₴ — бонусом. Без бухгалтера, без паніки в квітні.",
    author: "Дмитро Кравець",
    role: "Фрілансер, ЗЕД-доходи в USD",
    audience: "individual",
    initials: "ДК",
  },
  {
    quote:
      "Один кабінет на всю родину. Чоловік бачить бюджет, я — документи дітей, мама — лише делеговані платежі. Перестали сваритись через витрати.",
    author: "Олена Гриценко",
    role: "Сімейний бюджет, 2 дорослих + 2 дитини",
    audience: "individual",
    initials: "ОГ",
  },
  {
    quote:
      "Лоти у трьох брокерах + крипта + ОВДП. Раніше — Excel із 600 рядків. Тепер — FIFO, зафіксований і нереалізований прибуток, ПДФО в один клік.",
    author: "Ігор Ткаченко",
    role: "Приватний інвестор",
    audience: "individual",
    initials: "ІТ",
  },
];

export const osHowItWorks = [
  {
    n: "01",
    t: "Підключіть джерела",
    d: "Банк, ПРРО, бухгалтер. Один Open Banking-запит — і виписки в кабінеті. 30 секунд.",
    accent: "bank",
  },
  {
    n: "02",
    t: "AI читає історію",
    d: "За 5 хвилин AI бачить ваш кеш-флоу, клієнтів, патерни витрат і готує перші рекомендації.",
    accent: "ai",
  },
  {
    n: "03",
    t: "Morning Brief щодня",
    d: "О 7:30 у вашій пошті або Telegram: 3 цифри, 1 ризик, 1 рекомендація. Усе важливе — за хвилину читання.",
    accent: "brief",
  },
  {
    n: "04",
    t: "Делегуйте без втрати контролю",
    d: "Бухгалтер, юрист, команда, родина. Кожен з власними правами, ви — з повним аудит-логом.",
    accent: "delegate",
  },
];

export const osTrustBadges = [
  { t: "КЕП + Дія.Підпис", d: "Юридично-вагомі підписи" },
  { t: "Відповідає GDPR", d: "Право на видалення, портативність" },
  { t: "Дія.City резидент", d: "Українська юрисдикція" },
  { t: "Захист рядкового рівня", d: "Кожен запит у БД фільтрується по власнику" },
];
