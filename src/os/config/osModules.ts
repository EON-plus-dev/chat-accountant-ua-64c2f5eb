import {
  Wallet, Users, Package, CalendarCheck, FileSignature, ListTodo, Calculator, Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type OsModule = {
  id: string;
  icon: LucideIcon;
  name: string;
  /** Один JTBD, спільний для обох аудиторій */
  jtbd: string;
  business: { caption: string; bullets: string[] };
  individual: { caption: string; bullets: string[] };
  integrations: string[];
};

export const osModules: OsModule[] = [
  {
    id: "finance",
    icon: Wallet,
    name: "Фінанси",
    jtbd: "Бачити стан коштів і рух — у реальному часі, без Excel",
    business: {
      caption: "Каса, банки, ПРРО, FX",
      bullets: ["Синхронізація з банками та ПРРО", "Касова дисципліна", "Мультивалюта з FX-курсом дня"],
    },
    individual: {
      caption: "Гаманці, бюджет, FX",
      bullets: ["Усі гаманці на одному екрані", "Категорії та бюджети", "Конвертація без калькулятора"],
    },
    integrations: ["orders", "tax", "ai"],
  },
  {
    id: "contacts",
    icon: Users,
    name: "Контакти",
    jtbd: "Тримати всіх ваших людей в одному місці з історією",
    business: {
      caption: "CRM: клієнти, угоди, воронка",
      bullets: ["Картка клієнта з історією", "Воронка з каденціями", "Тригери з фінансів"],
    },
    individual: {
      caption: "Родина, продавці, контрагенти",
      bullets: ["Картка людини з договорами", "Делегації родині", "Історія взаємодій"],
    },
    integrations: ["orders", "documents", "tasks"],
  },
  {
    id: "orders",
    icon: Package,
    name: "Замовлення",
    jtbd: "Закривати продажі та закупки без подвійного обліку",
    business: {
      caption: "Продажі · Закупки · Повернення",
      bullets: ["Один потік: замовлення → відвантаження → оплата", "Повернення = негативна кількість", "Облік логістичних витрат у собівартості"],
    },
    individual: {
      caption: "Покупки та повернення",
      bullets: ["Гарантії та чеки в одному", "Повернення з нагадуванням", "ЗЕД-доходи у валюті"],
    },
    integrations: ["finance", "documents"],
  },
  {
    id: "bookings",
    icon: CalendarCheck,
    name: "Бронювання",
    jtbd: "Керувати часом — своїм або клієнтів — без подвійних записів",
    business: {
      caption: "Записи клієнтів, ресурси, майстри",
      bullets: ["Публічна сторінка для запису", "AI-чат і AI-голос для запису", "Делегації майстрам"],
    },
    individual: {
      caption: "Мої місця та записи",
      bullets: ["Лікар, фітнес, корт — в одному календарі", "Нагадування за добу", "Підписки на улюблені місця"],
    },
    integrations: ["contacts", "tasks"],
  },
  {
    id: "documents",
    icon: FileSignature,
    name: "Документи",
    jtbd: "Підписувати й зберігати все юридично-вагоме в одному хабі",
    business: {
      caption: "Договори, акти, КЕП",
      bullets: ["Версіонування з підписами", "Підпис КЕП у 2 кліки", "Авто-підпис із контролем"],
    },
    individual: {
      caption: "Договори, поліси, Дія.Підпис",
      bullets: ["Хаб документів із пошуком", "Дія.Підпис вбудовано", "Шеринг родині та юристу"],
    },
    integrations: ["contacts", "orders"],
  },
  {
    id: "tasks",
    icon: ListTodo,
    name: "Справи та цілі",
    jtbd: "Перетворювати наміри на дії — з нагадуваннями та делегацією",
    business: {
      caption: "Команда, процеси, плейбуки",
      bullets: ["Каденції, звʼязані з угодами CRM", "Готові плейбуки на події", "Звіти по виконанню"],
    },
    individual: {
      caption: "Звички, цілі, час",
      bullets: ["Особисті цілі за сферами", "Сімейні справи з ролями", "AI-нагадування у Morning Brief"],
    },
    integrations: ["contacts", "ai"],
  },
  {
    id: "tax",
    icon: Calculator,
    name: "Податки",
    jtbd: "Платити правильно й вчасно — без сюрпризів від ДПС",
    business: {
      caption: "ЄП, ПДВ, ЄСВ, звіти",
      bullets: ["Авто-розрахунок ЄП/ПДВ/ЄСВ", "Календар платежів", "Інбокс листів ДПС"],
    },
    individual: {
      caption: "Декларація, знижка, ЗЕД",
      bullets: ["Покроковий помічник декларації", "Податкова знижка з лімітами", "ЗЕД-доходи та залік закордонного податку (FTC)"],
    },
    integrations: ["finance", "orders", "ai"],
  },
  {
    id: "ai",
    icon: Sparkles,
    name: "AI-мозок",
    jtbd: "Перетворювати дані на рішення — і навпаки",
    business: {
      caption: "AI-директор",
      bullets: ["Morning Brief зі справжніх KPI", "Питання-відповіді у чаті (BI)", "Рекомендації наступного кроку"],
    },
    individual: {
      caption: "AI-помічник фізособи",
      bullets: ["Розбір рахунків і договорів", "Поради по бюджету", "Підказки по податках"],
    },
    integrations: ["finance", "tasks", "tax"],
  },
];

export const osModulesById = Object.fromEntries(osModules.map((m) => [m.id, m]));
