import type { LucideIcon } from "lucide-react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  AlertTriangle,
  Building2,
  Calendar,
  ShieldAlert,
  Target,
  Percent,
  BarChart3,
  FileCheck,
  Clock,
  AlertCircle,
  Briefcase,
} from "lucide-react";
import type { Cabinet } from "@/types/cabinet";

// ============ TYPES ============

export type PortfolioKPIId = 
  | "total-income" 
  | "active-cabinets" 
  | "attention-required" 
  | "upcoming-deadlines"
  | "tax-burden"
  | "salary-payments";

export type PortfolioSectionId = 
  | "kpi" 
  | "finance" 
  | "compliance" 
  | "risks" 
  | "insights";

export interface PortfolioKPI {
  id: PortfolioKPIId;
  title: string;
  getValue: (cabinets: Cabinet[]) => number | string;
  format: "currency" | "number" | "percent" | "days";
  getTrend?: (cabinets: Cabinet[]) => { value: number; direction: "up" | "down" } | undefined;
  getDescription: (cabinets: Cabinet[]) => string;
  icon: LucideIcon;
  semantic: "income" | "expense" | "neutral" | "warning";
  getDetails?: (cabinets: Cabinet[]) => { label: string; value: string }[];
}

export interface PortfolioRiskItem {
  id: string;
  cabinetId: string;
  cabinetName: string;
  type: "limit" | "deadline" | "audit" | "data-quality" | "cashflow";
  severity: "high" | "medium" | "low";
  title: string;
  value?: string;
  icon: LucideIcon;
}

export interface PortfolioDeadline {
  id: string;
  cabinetId: string;
  cabinetName: string;
  date: string;
  label: string;
  type: "report" | "tax" | "payment" | "other";
  urgency: "urgent" | "warning" | "normal";
}

export interface PortfolioCabinetRank {
  cabinet: Cabinet;
  rank: number;
  monthlyIncome: number;
  trend: { value: number; direction: "up" | "down" };
  riskCount: number;
}

export interface PortfolioChartDataPoint {
  month: string;
  income: number;
  expenses?: number;
  profit?: number;
}

export interface PortfolioTypeDistribution {
  type: string;
  label: string;
  value: number;
  count: number;
  color: string;
}

// ============ FOP LIMITS ============

import { FOP_INCOME_LIMITS, type TaxGroup } from "@/config/taxConstantsConfig";

/**
 * @deprecated Використовуйте FOP_INCOME_LIMITS з taxConstantsConfig.ts
 * Залишено для зворотної сумісності
 */
export const FOP_LIMITS = FOP_INCOME_LIMITS;

export function getFopLimitPercent(cabinet: Cabinet): number | null {
  if (cabinet.type !== "fop" || !cabinet.fopGroup || !cabinet.yearlyIncome) return null;
  const group = cabinet.fopGroup as TaxGroup;
  const limit = FOP_INCOME_LIMITS[group];
  if (!limit) return null;
  return Math.round((cabinet.yearlyIncome / limit) * 100);
}

export function getLimitSeverity(percent: number): "high" | "medium" | "low" {
  if (percent >= 90) return "high";
  if (percent >= 75) return "medium";
  return "low";
}

// ============ KPI CONFIGURATION ============

export const portfolioKPIs: PortfolioKPI[] = [
  {
    id: "total-income",
    title: "Загальний дохід",
    getValue: (cabinets) => cabinets
      .filter(c => c.status === "active")
      .reduce((sum, c) => sum + (c.monthlyIncome || 0), 0),
    format: "currency",
    getTrend: () => ({ value: 12, direction: "up" }),
    getDescription: () => "сумарно за місяць",
    icon: TrendingUp,
    semantic: "income",
    getDetails: (cabinets) => {
      const active = cabinets.filter(c => c.status === "active");
      const byType: Record<string, number> = {};
      active.forEach(c => {
        const type = c.type === "fop" ? "ФОП" : c.type === "tov" ? "ТОВ" : c.type === "individual" ? "Фізособи" : "Групи";
        byType[type] = (byType[type] || 0) + (c.monthlyIncome || 0);
      });
      return Object.entries(byType).map(([label, value]) => ({
        label,
        value: new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(value),
      }));
    },
  },
  {
    id: "active-cabinets",
    title: "Активних кабінетів",
    getValue: (cabinets) => cabinets.filter(c => c.status === "active").length,
    format: "number",
    getDescription: (cabinets) => {
      const total = cabinets.length;
      const archived = cabinets.filter(c => c.status === "archived").length;
      return archived > 0 ? `+ ${archived} архівних` : `з ${total} загалом`;
    },
    icon: Briefcase,
    semantic: "neutral",
  },
  {
    id: "attention-required",
    title: "Потребують уваги",
    getValue: (cabinets) => cabinets.filter(c => c.reportStatus === "tasks").length,
    format: "number",
    getDescription: () => "кабінетів з завданнями",
    icon: AlertTriangle,
    semantic: "warning",
  },
  {
    id: "upcoming-deadlines",
    title: "Дедлайнів",
    getValue: (cabinets) => cabinets.filter(c => c.nextDeadline).length,
    format: "number",
    getDescription: () => "на найближчі 30 днів",
    icon: Calendar,
    semantic: "neutral",
  },
];

// ============ SECTION CONFIGURATION ============

export interface PortfolioSection {
  id: PortfolioSectionId;
  label: string;
  icon: LucideIcon;
}

export const portfolioSections: PortfolioSection[] = [
  { id: "kpi", label: "KPI", icon: BarChart3 },
  { id: "finance", label: "Фінанси", icon: Wallet },
  { id: "compliance", label: "Звітність", icon: FileCheck },
  { id: "risks", label: "Ризики", icon: ShieldAlert },
  { id: "insights", label: "Інсайти", icon: Target },
];

// ============ CHART COLORS ============

export const portfolioChartColors = {
  fop: "hsl(var(--chart-1))",
  tov: "hsl(var(--chart-2))",
  individual: "hsl(var(--chart-3))",
  "fop-group": "hsl(var(--chart-4))",
} as const;

export const typeLabels: Record<string, string> = {
  fop: "ФОП",
  tov: "ТОВ",
  individual: "Фізособи",
  "fop-group": "Групи ФОП",
};

// ============ AI PROMPTS ============

export const portfolioAIPrompts = [
  "Порівняй ефективність всіх моїх ФОП",
  "Які кабінети мають найвищий ризик?",
  "Покажи зведений фінансовий звіт за квартал",
  "Сформуй календар дедлайнів на місяць",
  "Оптимізуй податкове навантаження портфеля",
  "Хто з ФОП наближається до ліміту?",
];

// ============ INSIGHTS GENERATORS ============

export interface PortfolioInsightAction {
  label: string;
  scrollTo?: string;
  navigateTo?: string;
  cabinetId?: string;
  promptText?: string;
}

export interface PortfolioInsight {
  id: string;
  type: "success" | "warning" | "info";
  icon: LucideIcon;
  title: string;
  description: string;
  action?: PortfolioInsightAction;
}

export function generatePortfolioInsights(cabinets: Cabinet[]): PortfolioInsight[] {
  const insights: PortfolioInsight[] = [];
  const active = cabinets.filter(c => c.status === "active");
  
  // FOP limit warnings
  const fopsNearLimit = active.filter(c => {
    const percent = getFopLimitPercent(c);
    return percent !== null && percent >= 85;
  });
  
  if (fopsNearLimit.length > 0) {
    insights.push({
      id: "fop-limits",
      type: "warning",
      icon: AlertCircle,
      title: `${fopsNearLimit.length} ФОП наближаються до ліміту`,
      description: "Рекомендовано розглянути реструктуризацію або перехід на загальну систему",
      action: {
        label: "Переглянути ліміти",
        scrollTo: "risks-section",
      },
    });
  }
  
  // Total income growth
  const totalIncome = active.reduce((sum, c) => sum + (c.monthlyIncome || 0), 0);
  if (totalIncome > 2000000) {
    insights.push({
      id: "income-growth",
      type: "success",
      icon: TrendingUp,
      title: "Стабільне зростання доходу",
      description: `Загальний дохід портфеля перевищує 2 млн ₴/міс`,
      action: {
        label: "Переглянути динаміку",
        scrollTo: "income-chart-section",
      },
    });
  }
  
  // Upcoming deadlines
  const withDeadlines = active.filter(c => c.nextDeadline);
  const urgentDeadlines = withDeadlines.filter(c => {
    const days = Math.ceil((new Date(c.nextDeadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 7;
  });
  
  if (urgentDeadlines.length > 0) {
    insights.push({
      id: "urgent-deadlines",
      type: "warning",
      icon: Clock,
      title: `${urgentDeadlines.length} термінових дедлайнів`,
      description: "Дедлайни протягом найближчих 7 днів потребують уваги",
      action: {
        label: "Переглянути дедлайни",
        scrollTo: "deadlines-section",
      },
    });
  }
  
  // Attention required
  const attentionCount = active.filter(c => c.reportStatus === "tasks").length;
  if (attentionCount === 0) {
    insights.push({
      id: "all-ok",
      type: "success",
      icon: FileCheck,
      title: "Всі кабінети в нормі",
      description: "Немає термінових завдань або проблем",
      action: {
        label: "Порівняти з бенчмарком",
        promptText: "Порівняй мій портфель з галузевими бенчмарками",
      },
    });
  } else {
    insights.push({
      id: "attention-required",
      type: "warning",
      icon: AlertCircle,
      title: `${attentionCount} кабінетів потребують уваги`,
      description: "Є активні завдання або проблеми, які потребують вирішення",
      action: {
        label: "Переглянути завдання",
        scrollTo: "risks-section",
      },
    });
  }
  
  return insights;
}
