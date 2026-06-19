/**
 * Спільна конфігурація 14 модулів у 5 групах для кабінету фізособи.
 * Використовується LifeLauncherPage («Мої сфери») і NavigationDrawer (Bento).
 */
import type { LucideIcon } from "lucide-react";
import {
  ListChecks, ShoppingBag, FolderOpen,
  Landmark, Calculator, Home, PiggyBank, Shield,
  GraduationCap, Briefcase,
  Heart, House,
  Network as NetworkIcon, Bot,
} from "lucide-react";

export type LauncherTone = "violet" | "emerald" | "blue" | "rose" | "indigo";

export interface LauncherTile {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Combined metric line, e.g. "12 задач", "42 500 ₴" */
  metric: string;
  /** Optional alert sub-line. */
  sub?: string;
  /** Operations subtab id (work-center/finance/savings/...). */
  target: string;
  /** Optional inner tab inside the target hub. */
  inner?: string;
}

export interface LauncherGroup {
  id: string;
  title: string;
  tone: LauncherTone;
  tiles: LauncherTile[];
}

export const ALERT_RE = /(завтра|завершується|потребує|сьогодні|протерміновано)/i;

export const individualLauncherGroups: LauncherGroup[] = [
  {
    id: "daily",
    title: "Повсякденне",
    tone: "violet",
    tiles: [
      { id: "work-center", label: "Робочий центр", icon: ListChecks, metric: "12 активних задач", target: "work-center" },
      { id: "orders",      label: "Замовлення",    icon: ShoppingBag, metric: "4 замовлення",      target: "orders" },
      { id: "documents",   label: "Документи",     icon: FolderOpen,  metric: "28 документів",     target: "documents" },
    ],
  },
  {
    id: "finance",
    title: "Фінанси",
    tone: "emerald",
    tiles: [
      { id: "finance",    label: "Рахунки",      icon: Landmark,   metric: "42 500 ₴ · 3 рахунки",     target: "finance" },
      { id: "taxes",      label: "Податки",      icon: Calculator, metric: "18 300 ₴ · 2 декларації",  target: "finance", inner: "tax-discount" },
      { id: "property",   label: "Майно",        icon: Home,       metric: "7 250 000 ₴ · 3 активи",   target: "savings", inner: "property" },
      { id: "savings",    label: "Заощадження",  icon: PiggyBank,  metric: "256 300 ₴ · 4 цілі",       target: "savings" },
      { id: "insurance",  label: "Страхування",  icon: Shield,     metric: "3 поліси", sub: "1 завершується", target: "insurance" },
    ],
  },
  {
    id: "growth",
    title: "Розвиток",
    tone: "blue",
    tiles: [
      { id: "education", label: "Освіта",   icon: GraduationCap, metric: "2 програми · 7 завдань",          target: "education" },
      { id: "career",    label: "Кар'єра", icon: Briefcase,     metric: "2 вакансії", sub: "1 співбесіда завтра", target: "career" },
    ],
  },
  {
    id: "personal",
    title: "Особисте",
    tone: "rose",
    tiles: [
      { id: "health", label: "Здоров'я", icon: Heart, metric: "2 записи", sub: "візит завтра", target: "health" },
      { id: "home",   label: "Дім",      icon: House, metric: "1 обʼєкт · 4 платежі",            target: "home" },
    ],
  },
  {
    id: "ecosystem",
    title: "Екосистема",
    tone: "indigo",
    tiles: [
      { id: "network",   label: "Мережа",   icon: NetworkIcon, metric: "15 організацій · 6 контактів", target: "network" },
      { id: "ai-center", label: "AI Центр", icon: Bot,         metric: "4 агенти · 12 рекомендацій",   target: "ai-center" },
    ],
  },
];
