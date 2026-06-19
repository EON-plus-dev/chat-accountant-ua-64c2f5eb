import type { CabinetType } from "@/types/cabinet";
import type { CabinetGoals, GoalsMode } from "@/types/goals";
import { 
  Target, 
  TrendingUp, 
  Wallet, 
  Users, 
  Building2, 
  FileText,
  PiggyBank,
  AlertTriangle,
  type LucideIcon 
} from "lucide-react";

// Field configuration for UI
export interface GoalFieldConfig {
  id: keyof CabinetGoals;
  label: string;
  description?: string;
  inputType: "number" | "percent" | "currency" | "toggle" | "days" | "months";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}

// Card configuration for goals section
export interface GoalsCardConfig {
  id: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  fields: GoalFieldConfig[];
  showForTypes: CabinetType[];
  isReadOnly?: boolean;
}

// Goals mode options
export const goalsModeOptions: { value: GoalsMode; label: string; description: string }[] = [
  {
    value: "auto",
    label: "AI-розрахунок",
    description: "Цілі розраховуються автоматично на основі ваших даних (+10% до поточних показників)",
  },
  {
    value: "manual",
    label: "Ручне введення",
    description: "Встановіть власні цілі та бюджети вручну",
  },
];

// Cards configuration
export const goalsCardsConfig: GoalsCardConfig[] = [
  {
    id: "income-goals",
    title: "Цілі доходу",
    description: "Плановані показники виручки",
    icon: TrendingUp,
    showForTypes: ["fop", "tov", "fop-group", "individual"],
    fields: [
      {
        id: "monthlyIncomeTarget",
        label: "Місячна ціль",
        inputType: "currency",
        prefix: "₴",
        placeholder: "137 500",
      },
      {
        id: "quarterlyIncomeTarget",
        label: "Квартальна ціль",
        inputType: "currency",
        prefix: "₴",
        placeholder: "412 500",
      },
      {
        id: "growthFactor",
        label: "Коефіцієнт зростання",
        description: "Множник для auto-розрахунку (1.1 = +10%)",
        inputType: "number",
        min: 1,
        max: 2,
        step: 0.05,
        placeholder: "1.1",
      },
    ],
  },
  {
    id: "fop-limit",
    title: "Ліміт ЄП",
    description: "Законодавчий ліміт для групи ФОП",
    icon: AlertTriangle,
    showForTypes: ["fop", "fop-group"],
    isReadOnly: true,
    fields: [
      {
        id: "fopLimitWarningThreshold",
        label: "Попередження при",
        inputType: "percent",
        suffix: "%",
        min: 50,
        max: 95,
        placeholder: "70",
      },
      {
        id: "fopLimitCriticalThreshold",
        label: "Критичне попередження",
        inputType: "percent",
        suffix: "%",
        min: 70,
        max: 99,
        placeholder: "90",
      },
      {
        id: "fopLimitNotifyDays",
        label: "Сповіщати за",
        inputType: "days",
        suffix: "днів",
        min: 7,
        max: 90,
        placeholder: "30",
      },
    ],
  },
  {
    id: "salary-budget",
    title: "Бюджет ФОП",
    description: "Місячний бюджет на зарплати та винагороди",
    icon: Users,
    showForTypes: ["tov"],
    fields: [
      {
        id: "monthlySalaryBudget",
        label: "Місячний бюджет",
        inputType: "currency",
        prefix: "₴",
        placeholder: "150 000",
      },
      {
        id: "salaryOverrunWarning",
        label: "Попереджати при перевищенні",
        inputType: "toggle",
      },
    ],
  },
  {
    id: "opex-budget",
    title: "Бюджет OPEX",
    description: "Операційні витрати",
    icon: Building2,
    showForTypes: ["tov"],
    fields: [
      {
        id: "monthlyOpexBudget",
        label: "Загальний місячний бюджет",
        inputType: "currency",
        prefix: "₴",
        placeholder: "50 000",
      },
    ],
  },
  {
    id: "tax-budget",
    title: "Бюджет податків",
    description: "Буфер для податкових платежів",
    icon: Wallet,
    showForTypes: ["fop", "tov", "fop-group", "individual"],
    fields: [
      {
        id: "taxBudgetBuffer",
        label: "Буфер понад розрахунок",
        description: "1.05 = +5% до розрахованих податків",
        inputType: "number",
        min: 1,
        max: 1.5,
        step: 0.05,
        placeholder: "1.05",
      },
    ],
  },
  {
    id: "financial-goals",
    title: "Фінансові цілі",
    description: "Цілі ефективності бізнесу",
    icon: Target,
    showForTypes: ["tov"],
    fields: [
      {
        id: "targetProfitMargin",
        label: "Цільова маржа",
        inputType: "percent",
        suffix: "%",
        min: 0,
        max: 100,
        placeholder: "15",
      },
      {
        id: "targetArDays",
        label: "Цільовий AR",
        description: "Дні до отримання оплати",
        inputType: "days",
        suffix: "днів",
        min: 0,
        max: 180,
        placeholder: "30",
      },
      {
        id: "cashReserveMonths",
        label: "Резерв готівки",
        inputType: "months",
        suffix: "місяців",
        min: 1,
        max: 12,
        placeholder: "3",
      },
    ],
  },
  {
    id: "savings-goal",
    title: "Ціль заощаджень",
    description: "Річна ціль накопичень",
    icon: PiggyBank,
    showForTypes: ["individual"],
    fields: [
      {
        id: "yearlySavingsGoal",
        label: "Річна ціль",
        inputType: "currency",
        prefix: "₴",
        placeholder: "100 000",
      },
    ],
  },
  {
    id: "reporting",
    title: "Звітність",
    description: "Очікувана кількість звітів",
    icon: FileText,
    showForTypes: ["fop", "tov", "fop-group", "individual"],
    isReadOnly: true,
    fields: [
      {
        id: "expectedReportsPerYear",
        label: "Звітів на рік",
        description: "Розрахунок: кількість кварталів × типи звітів",
        inputType: "number",
        min: 1,
        max: 50,
        placeholder: "8",
      },
    ],
  },
];

// Get cards applicable for a cabinet type
export function getGoalsCardsForType(cabinetType: CabinetType): GoalsCardConfig[] {
  return goalsCardsConfig.filter((card) =>
    card.showForTypes.includes(cabinetType)
  );
}

// Default goals by cabinet type
export function getDefaultGoals(
  cabinetType: CabinetType,
  currentMonthlyIncome: number = 0
): Partial<CabinetGoals> {
  const baseGoals: Partial<CabinetGoals> = {
    mode: "auto",
    growthFactor: 1.1,
    taxBudgetBuffer: 1.05,
    monthlyIncomeTarget: Math.round(currentMonthlyIncome * 1.1),
    quarterlyIncomeTarget: Math.round(currentMonthlyIncome * 1.1 * 3),
  };

  switch (cabinetType) {
    case "fop":
      return {
        ...baseGoals,
        fopLimitWarningThreshold: 70,
        fopLimitCriticalThreshold: 90,
        fopLimitNotifyDays: 30,
        expectedReportsPerYear: 8,
      };
    case "tov":
      return {
        ...baseGoals,
        monthlySalaryBudget: 150000,
        salaryOverrunWarning: true,
        monthlyOpexBudget: 50000,
        targetProfitMargin: 15,
        targetArDays: 30,
        cashReserveMonths: 3,
        expectedReportsPerYear: 10,
      };
    case "fop-group":
      return {
        ...baseGoals,
        fopLimitWarningThreshold: 70,
        fopLimitCriticalThreshold: 90,
        expectedReportsPerYear: 24,
      };
    case "individual":
      return {
        ...baseGoals,
        yearlySavingsGoal: 100000,
        expectedReportsPerYear: 1,
      };
    default:
      return baseGoals;
  }
}

// Format value for display
export function formatGoalValue(
  value: number | boolean | undefined,
  inputType: GoalFieldConfig["inputType"],
  prefix?: string,
  suffix?: string
): string {
  if (value === undefined || value === null) return "—";
  
  if (typeof value === "boolean") {
    return value ? "Увімкнено" : "Вимкнено";
  }

  let formatted = "";
  switch (inputType) {
    case "currency":
      formatted = new Intl.NumberFormat("uk-UA").format(value);
      break;
    case "percent":
    case "number":
    case "days":
    case "months":
      formatted = String(value);
      break;
    default:
      formatted = String(value);
  }

  return `${prefix || ""}${formatted}${suffix ? ` ${suffix}` : ""}`;
}
