import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Newspaper,
  Wrench,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface SubNavItem {
  label: string;
  /** Або повний href ("/analytics"), або anchor ("#pricing"). */
  href: string;
  icon?: LucideIcon;
}

export type SubNavKind = "audience" | "resources";

export const RESOURCES_ITEMS: SubNavItem[] = [
  { label: "Огляд", href: "/overview", icon: LayoutDashboard },
  { label: "Аналітика", href: "/analytics", icon: BarChart3 },
  { label: "Довідники", href: "/dovidnyky", icon: BookOpen },
  { label: "Публікації", href: "/publications", icon: Newspaper },
  { label: "Інструменти", href: "/tools", icon: Wrench },
  { label: "Навчання", href: "/learn", icon: GraduationCap },
  { label: "AI-хаб", href: "/consultant", icon: Sparkles },
];

const BUSINESS_ITEMS: SubNavItem[] = [
  { label: "Як працює", href: "#how-it-works" },
  { label: "Кому", href: "#for-who" },
  { label: "Навіщо", href: "#why" },
  { label: "Безпека", href: "#security" },
  { label: "Тарифи", href: "#pricing" },
  { label: "Питання", href: "#faq" },
];

const INDIVIDUAL_ITEMS: SubNavItem[] = [
  { label: "Як працює", href: "#how-it-works" },
  { label: "Кейси", href: "#for-who" },
  { label: "Навіщо", href: "#why" },
  { label: "Безпека", href: "#security" },
  { label: "Тарифи", href: "#pricing" },
  { label: "Питання", href: "#faq" },
];

const PARTNERS_ITEMS: SubNavItem[] = [
  { label: "Reseller-економіка", href: "#partner-program" },
  { label: "Безпека", href: "#security" },
  { label: "Тарифи", href: "#pricing" },
  { label: "Питання", href: "#faq" },
];

const RESOURCE_PREFIXES = [
  "/overview",
  "/analytics",
  "/dovidnyky",
  "/publications",
  "/tools",
  "/learn",
  "/consultant",
];

export interface ResolvedSubNav {
  items: SubNavItem[];
  kind: SubNavKind;
}

/** Повертає sub-nav для pathname або null, якщо sub-header не потрібен. */
export function resolveSubNav(pathname: string): ResolvedSubNav | null {
  if (pathname === "/") return { items: BUSINESS_ITEMS, kind: "audience" };
  if (pathname.startsWith("/individuals")) return { items: INDIVIDUAL_ITEMS, kind: "audience" };
  if (pathname.startsWith("/partners")) return { items: PARTNERS_ITEMS, kind: "audience" };

  if (RESOURCE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return { items: RESOURCES_ITEMS, kind: "resources" };
  }
  return null;
}
