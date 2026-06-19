/**
 * Team & Tasks демо-дані для кабінету ТОВ «Fintodo» (cabinet id = "5").
 *
 * Обсяг (план):
 *  - 12 членів команди (CEO, 4 Eng, 3 Support, 2 Sales, 1 Marketing, 1 Finance)
 *  - ~40 задач у 4 статусах (backlog/in_progress/review/done)
 *  - 6 епіків, 4 спринти (поточний + 3 минулих)
 */

import type { LucideIcon } from "lucide-react";
import {
  Code, Headphones, ShoppingCart, Megaphone, Wallet,
} from "lucide-react";

export type FintodoTeam = "eng" | "support" | "sales" | "marketing" | "finance";
export type FintodoTaskStatus = "backlog" | "in_progress" | "review" | "done";
export type FintodoTaskPriority = "low" | "med" | "high" | "urgent";

export interface FintodoTeamMember {
  id: string;
  name: string;
  role: string;
  team: FintodoTeam;
  contract: "штат" | "ФОП";
  email: string;
  capacityHoursPerWeek: number;
}

export interface FintodoEpic {
  id: string;
  title: string;
  color: string; // tailwind bg
}

export interface FintodoSprint {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  isCurrent?: boolean;
}

export interface FintodoTask {
  id: string;
  title: string;
  status: FintodoTaskStatus;
  team: FintodoTeam;
  assigneeId: string;     // member id
  priority: FintodoTaskPriority;
  deadline: string;       // ISO date
  epicId?: string;
  sprintId?: string;
  tag?: string;
  linkedClientId?: string;
  linkedClient?: string;  // denormalized
}

// ──────────────────────────── КОМАНДИ ────────────────────────────
export const FINTODO_TEAMS: Record<FintodoTeam, { label: string; icon: LucideIcon; color: string }> = {
  eng:       { label: "Інженерія",  icon: Code,         color: "bg-blue-500" },
  support:   { label: "Підтримка",  icon: Headphones,   color: "bg-emerald-500" },
  sales:     { label: "Продажі",    icon: ShoppingCart, color: "bg-violet-500" },
  marketing: { label: "Маркетинг",  icon: Megaphone,    color: "bg-amber-500" },
  finance:   { label: "Фінанси",    icon: Wallet,       color: "bg-slate-500" },
};

export const FINTODO_STATUS_COLUMNS: { id: FintodoTaskStatus; label: string; color: string }[] = [
  { id: "backlog",     label: "Бекл",      color: "bg-slate-500" },
  { id: "in_progress", label: "В роботі",  color: "bg-blue-500" },
  { id: "review",      label: "На рев'ю",  color: "bg-amber-500" },
  { id: "done",        label: "Готово",    color: "bg-emerald-500" },
];

export const FINTODO_PRIORITY_COLORS: Record<FintodoTaskPriority, string> = {
  low:    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  med:    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  high:   "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

// ──────────────────────────── КОМАНДА (12) ────────────────────────────
export const FINTODO_MEMBERS: FintodoTeamMember[] = [
  { id: "m1",  name: "Олександр Шевченко", role: "CEO / Засновник",   team: "eng",       contract: "штат", email: "o.shevchenko@fintodo.ua", capacityHoursPerWeek: 20 },
  { id: "m2",  name: "Андрій Левченко",    role: "Tech Lead",         team: "eng",       contract: "штат", email: "a.levchenko@fintodo.ua",  capacityHoursPerWeek: 40 },
  { id: "m3",  name: "Михайло Гнатюк",     role: "Senior Engineer",   team: "eng",       contract: "ФОП",  email: "m.hnatyuk@fintodo.ua",    capacityHoursPerWeek: 40 },
  { id: "m4",  name: "Юлія Поліщук",       role: "Senior Engineer",   team: "eng",       contract: "ФОП",  email: "y.polishchuk@fintodo.ua", capacityHoursPerWeek: 32 },
  { id: "m5",  name: "Богдан Кравчук",     role: "QA Engineer",       team: "eng",       contract: "ФОП",  email: "b.kravchuk@fintodo.ua",   capacityHoursPerWeek: 32 },
  { id: "m6",  name: "Тетяна Мороз",       role: "Head of Support",   team: "support",   contract: "штат", email: "t.moroz@fintodo.ua",      capacityHoursPerWeek: 40 },
  { id: "m7",  name: "Наталія Білик",      role: "Support Specialist",team: "support",   contract: "штат", email: "n.bilyk@fintodo.ua",      capacityHoursPerWeek: 40 },
  { id: "m8",  name: "Дмитро Сафонов",     role: "Customer Success",  team: "support",   contract: "штат", email: "d.safonov@fintodo.ua",    capacityHoursPerWeek: 40 },
  { id: "m9",  name: "Анна Дорошенко",     role: "Head of Sales",     team: "sales",     contract: "штат", email: "a.doroshenko@fintodo.ua", capacityHoursPerWeek: 40 },
  { id: "m10", name: "Ірина Колесник",     role: "Sales Manager",     team: "sales",     contract: "штат", email: "i.kolesnyk@fintodo.ua",   capacityHoursPerWeek: 40 },
  { id: "m11", name: "Олена Семенюк",      role: "Content Lead",      team: "marketing", contract: "ФОП",  email: "o.semenyuk@fintodo.ua",   capacityHoursPerWeek: 30 },
  { id: "m12", name: "Світлана Гончар",    role: "Головбух",          team: "finance",   contract: "ФОП",  email: "s.honchar@fintodo.ua",    capacityHoursPerWeek: 20 },
];

// ──────────────────────────── ЕПІКИ (6) ────────────────────────────
export const FINTODO_EPICS: FintodoEpic[] = [
  { id: "e1", title: "AI-чат v2",            color: "bg-violet-500" },
  { id: "e2", title: "Marketplace партнерів",color: "bg-emerald-500" },
  { id: "e3", title: "Перевірки ФОП",        color: "bg-amber-500" },
  { id: "e4", title: "Білінг кредитів",      color: "bg-blue-500" },
  { id: "e5", title: "Mobile UX",            color: "bg-pink-500" },
  { id: "e6", title: "Звітність ДПС",        color: "bg-cyan-500" },
];

// ──────────────────────────── СПРИНТИ (4) ────────────────────────────
export const FINTODO_SPRINTS: FintodoSprint[] = [
  { id: "sp-23", label: "Спринт 23 (квітень I)",  startsAt: "2026-04-01", endsAt: "2026-04-14" },
  { id: "sp-24", label: "Спринт 24 (квітень II)", startsAt: "2026-04-15", endsAt: "2026-04-28" },
  { id: "sp-25", label: "Спринт 25 (травень I)",  startsAt: "2026-04-29", endsAt: "2026-05-12" },
  { id: "sp-26", label: "Спринт 26 (травень II)", startsAt: "2026-05-13", endsAt: "2026-05-26", isCurrent: true },
];

// ──────────────────────────── ЗАДАЧІ (40) ────────────────────────────
export const FINTODO_TASKS: FintodoTask[] = [
  // ── BACKLOG (12) ──
  { id: "t1",  title: "Окремий партнерський простір для бухбюро",      status: "backlog",     team: "eng",       assigneeId: "m2",  priority: "high",   deadline: "2026-06-15", epicId: "e2", sprintId: "sp-26", tag: "Epic" },
  { id: "t2",  title: "Інтеграція з Monobank Open API",                 status: "backlog",     team: "eng",       assigneeId: "m3",  priority: "med",    deadline: "2026-06-20", epicId: "e4", sprintId: "sp-26", tag: "Інтеграції" },
  { id: "t3",  title: "Записати вебінар «Декларація 2026»",             status: "backlog",     team: "marketing", assigneeId: "m11", priority: "med",    deadline: "2026-06-10", epicId: "e6", sprintId: "sp-26" },
  { id: "t4",  title: "ROI-калькулятор для лендингу /pro",              status: "backlog",     team: "eng",       assigneeId: "m4",  priority: "low",    deadline: "2026-07-01", epicId: "e2" },
  { id: "t5",  title: "Кампанія Google Ads на «ФОП 3 група»",            status: "backlog",     team: "marketing", assigneeId: "m11", priority: "high",   deadline: "2026-06-05" },
  { id: "t6",  title: "Перенести AI-промпти на gemini-3.1-flash-lite",   status: "backlog",     team: "eng",       assigneeId: "m3",  priority: "med",    deadline: "2026-06-08", epicId: "e1" },
  { id: "t7",  title: "Скорегувати лімітерну логіку Free-тарифу",        status: "backlog",     team: "eng",       assigneeId: "m4",  priority: "high",   deadline: "2026-06-02", epicId: "e4" },
  { id: "t8",  title: "Email-кампанія для churn-ризику (40 клієнтів)",   status: "backlog",     team: "marketing", assigneeId: "m11", priority: "high",   deadline: "2026-05-31" },
  { id: "t9",  title: "Шаблон «Акт ППР» для розділу Перевірок",          status: "backlog",     team: "eng",       assigneeId: "m5",  priority: "med",    deadline: "2026-06-12", epicId: "e3" },
  { id: "t10", title: "Аудит безпеки edge-функцій (rate-limit)",         status: "backlog",     team: "eng",       assigneeId: "m2",  priority: "high",   deadline: "2026-06-18" },
  { id: "t11", title: "Сторінка партнерського кешбеку у CMS",            status: "backlog",     team: "eng",       assigneeId: "m4",  priority: "low",    deadline: "2026-06-25", epicId: "e2" },
  { id: "t12", title: "Скрипт виплат ЗП співробітникам (ФОП)",           status: "backlog",     team: "finance",   assigneeId: "m12", priority: "med",    deadline: "2026-06-01" },

  // ── IN PROGRESS (12) ──
  { id: "t13", title: "CRM-модуль для ТОВ «Fintodo»",                   status: "in_progress", team: "eng",       assigneeId: "m4",  priority: "urgent", deadline: "2026-05-28", epicId: "e2", sprintId: "sp-26", tag: "Epic" },
  { id: "t14", title: "Виправити drill-навігацію у звіті по платежах",  status: "in_progress", team: "eng",       assigneeId: "m3",  priority: "high",   deadline: "2026-05-27", sprintId: "sp-26", tag: "Bug" },
  { id: "t15", title: "Дзвінок з ТОВ «Біотек Україна» — апсейл на Pro", status: "in_progress", team: "sales",     assigneeId: "m9",  priority: "high",   deadline: "2026-05-26", sprintId: "sp-26", linkedClientId: "c4", linkedClient: "ТОВ «Біотек Україна»" },
  { id: "t16", title: "Тікет #1247: помилка реєстрації ПН у ЄРПН",      status: "in_progress", team: "support",   assigneeId: "m7",  priority: "urgent", deadline: "2026-05-25", sprintId: "sp-26", linkedClientId: "c8", linkedClient: "ТОВ «Енергодом»" },
  { id: "t17", title: "Підготувати декларацію з податку на прибуток Q1",status: "in_progress", team: "finance",   assigneeId: "m12", priority: "high",   deadline: "2026-05-30", sprintId: "sp-26", epicId: "e6" },
  { id: "t18", title: "Стаття «10 типових помилок декларації ФОП»",      status: "in_progress", team: "marketing", assigneeId: "m11", priority: "med",    deadline: "2026-05-28", sprintId: "sp-26" },
  { id: "t19", title: "Підключити Дія.Підпис до flow підпису контрактів", status: "in_progress",team: "eng",       assigneeId: "m2",  priority: "high",   deadline: "2026-05-29", sprintId: "sp-26", epicId: "e3" },
  { id: "t20", title: "Win-back-сесія з ТОВ «Чернігів-Молоко»",         status: "in_progress", team: "sales",     assigneeId: "m10", priority: "med",    deadline: "2026-05-27", sprintId: "sp-26", linkedClientId: "c14", linkedClient: "ТОВ «Чернігів-Молоко»" },
  { id: "t21", title: "Запит на повернення коштів — ФОП Кравченко",      status: "in_progress", team: "support",   assigneeId: "m6",  priority: "high",   deadline: "2026-05-26", sprintId: "sp-26", linkedClientId: "c18", linkedClient: "ФОП Марія Кравченко" },
  { id: "t22", title: "Демо для CFO ТОВ «Альфа-Буд»",                    status: "in_progress", team: "sales",     assigneeId: "m9",  priority: "high",   deadline: "2026-05-28", sprintId: "sp-26", linkedClientId: "c11", linkedClient: "ТОВ «Альфа-Буд»" },
  { id: "t23", title: "Мобільний фікс sticky-tab у Cabinet Operations",  status: "in_progress", team: "eng",       assigneeId: "m5",  priority: "med",    deadline: "2026-05-29", sprintId: "sp-26", epicId: "e5" },
  { id: "t24", title: "Налаштувати quota-warning для Smart-плану",       status: "in_progress", team: "eng",       assigneeId: "m4",  priority: "med",    deadline: "2026-05-30", sprintId: "sp-26", epicId: "e4" },

  // ── REVIEW (8) ──
  { id: "t25", title: "AI-аналіз churn-ризику (PR #482)",               status: "review",      team: "eng",       assigneeId: "m5",  priority: "high",   deadline: "2026-05-26", sprintId: "sp-26", epicId: "e1", tag: "Code review" },
  { id: "t26", title: "Лендинг /for-accountants — нова heading-секція", status: "review",      team: "eng",       assigneeId: "m4",  priority: "med",    deadline: "2026-05-27", sprintId: "sp-26" },
  { id: "t27", title: "Контракт реселера для Бюро «БухОблік+»",          status: "review",      team: "sales",     assigneeId: "m9",  priority: "high",   deadline: "2026-05-26", sprintId: "sp-26", epicId: "e2", linkedClientId: "c1", linkedClient: "Бюро «БухОблік+»" },
  { id: "t28", title: "PR #501: модуль Team & Tasks",                   status: "review",      team: "eng",       assigneeId: "m3",  priority: "med",    deadline: "2026-05-27", sprintId: "sp-26", tag: "Code review" },
  { id: "t29", title: "Сценарій рев'ю акта ППР (ДПС)",                  status: "review",      team: "eng",       assigneeId: "m2",  priority: "high",   deadline: "2026-05-28", sprintId: "sp-26", epicId: "e3" },
  { id: "t30", title: "QA: інтеграція ПриватБанк (Open API)",           status: "review",      team: "eng",       assigneeId: "m5",  priority: "high",   deadline: "2026-05-29", sprintId: "sp-26", epicId: "e4" },
  { id: "t31", title: "Текст для onboarding-step «Команда»",            status: "review",      team: "marketing", assigneeId: "m11", priority: "low",    deadline: "2026-05-28", sprintId: "sp-26" },
  { id: "t32", title: "Виплата комісії партнеру (Аудит-Консалт)",       status: "review",      team: "finance",   assigneeId: "m12", priority: "med",    deadline: "2026-05-27", sprintId: "sp-26", linkedClientId: "c2", linkedClient: "Аудит-Консалт Group" },

  // ── DONE (8) ──
  { id: "t33", title: "Запустити push-сповіщення PWA",                  status: "done",        team: "eng",       assigneeId: "m3",  priority: "med",    deadline: "2026-05-20", sprintId: "sp-25", epicId: "e5" },
  { id: "t34", title: "Onboarding-видео для нових ФОП",                 status: "done",        team: "marketing", assigneeId: "m11", priority: "med",    deadline: "2026-05-18", sprintId: "sp-25" },
  { id: "t35", title: "QBR з ТОВ «Меркурій-Карго»",                     status: "done",        team: "sales",     assigneeId: "m9",  priority: "high",   deadline: "2026-05-15", sprintId: "sp-25", linkedClientId: "c3", linkedClient: "ТОВ «Меркурій-Карго»" },
  { id: "t36", title: "Виплата зарплати команді (травень)",             status: "done",        team: "finance",   assigneeId: "m12", priority: "urgent", deadline: "2026-05-15", sprintId: "sp-25" },
  { id: "t37", title: "Рефакторинг типу fop-group → tov «Fintodo»",     status: "done",        team: "eng",       assigneeId: "m2",  priority: "med",    deadline: "2026-05-22", sprintId: "sp-25" },
  { id: "t38", title: "Закрити тікет #1198 від ФОП Олійник",            status: "done",        team: "support",   assigneeId: "m6",  priority: "med",    deadline: "2026-05-12", sprintId: "sp-24", linkedClientId: "c16", linkedClient: "ФОП Іван Олійник" },
  { id: "t39", title: "Релізні нотатки до v2.6.0",                      status: "done",        team: "marketing", assigneeId: "m11", priority: "low",    deadline: "2026-05-13", sprintId: "sp-25" },
  { id: "t40", title: "AI-розрахунок ROI на лендингу /business",        status: "done",        team: "eng",       assigneeId: "m4",  priority: "med",    deadline: "2026-05-10", sprintId: "sp-24", epicId: "e1" },
];

// ──────────────────────────── ХЕЛПЕРИ ────────────────────────────
export const fintodoMemberById = (id: string): FintodoTeamMember | undefined =>
  FINTODO_MEMBERS.find(m => m.id === id);

export const fintodoEpicById = (id?: string): FintodoEpic | undefined =>
  id ? FINTODO_EPICS.find(e => e.id === id) : undefined;

export const fintodoInitials = (name: string): string =>
  name.split(" ").map(p => p[0]).slice(0, 2).join("");
