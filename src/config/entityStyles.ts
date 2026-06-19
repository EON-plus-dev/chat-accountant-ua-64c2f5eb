import { User, Building2, IdCard, Users } from "lucide-react";
import type { EntityStyle, CabinetType } from "@/types/cabinet";

export const entityStyles: Record<CabinetType, EntityStyle> = {
  fop: {
    icon: User,
    label: "ФОП",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-l-blue-500",
    badgeClass: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300",
    dotColor: "bg-blue-500",
    accentBorder: "bg-blue-500",
    chipBorderColor: "border-blue-200/60 dark:border-blue-700/50",
    pillActiveClass: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800",
  },
  tov: {
    icon: Building2,
    label: "ТОВ",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-l-purple-500",
    badgeClass: "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/50 dark:text-purple-300",
    dotColor: "bg-purple-500",
    accentBorder: "bg-purple-500",
    chipBorderColor: "border-purple-200/60 dark:border-purple-700/50",
    pillActiveClass: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-800",
  },
  individual: {
    icon: IdCard,
    label: "Фіз. особа",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-l-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300",
    dotColor: "bg-emerald-500",
    accentBorder: "bg-emerald-500",
    chipBorderColor: "border-emerald-200/60 dark:border-emerald-700/50",
    pillActiveClass: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800",
  },
  "fop-group": {
    icon: Users,
    label: "Група",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-l-orange-500",
    badgeClass: "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300",
    dotColor: "bg-orange-500",
    accentBorder: "bg-orange-500",
    chipBorderColor: "border-orange-200/60 dark:border-orange-700/50",
    pillActiveClass: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:ring-orange-800",
  },
};

export const getEntityStyle = (type: CabinetType): EntityStyle => {
  return entityStyles[type];
};
