import { 
  Tags, RefreshCw, Bell, BarChart3, FileCheck, 
  Search, Settings, ArrowRight, ShieldCheck
} from "lucide-react";
import type { RiskCategory, ActionType } from "@/types/analyticsTypes";
import type { LucideIcon } from "lucide-react";

export interface ActionTemplate {
  id: string;
  label: string;
  icon: LucideIcon;
  effect: string;
  linkedRiskCategories: RiskCategory[];
  actionType: ActionType;
  actionPayload: string;
}

export const actionLibrary: ActionTemplate[] = [
  {
    id: "categorize-ops",
    label: "Категоризувати операції",
    icon: Tags,
    effect: "Зменшить кількість невизначених транзакцій",
    linkedRiskCategories: ["data"],
    actionType: "chat-prompt",
    actionPayload: "Покажи операції без категорії та допоможи їх класифікувати",
  },
  {
    id: "reconnect-integration",
    label: "Перепідключити інтеграцію",
    icon: RefreshCw,
    effect: "Відновить синхронізацію даних",
    linkedRiskCategories: ["data"],
    actionType: "chat-prompt",
    actionPayload: "Допоможи перепідключити інтеграцію з банком або ПРРО для синхронізації даних",
  },
  {
    id: "setup-limit-alert",
    label: "Налаштувати поріг ліміту",
    icon: Bell,
    effect: "Попередження при 80% та 95% ліміту",
    linkedRiskCategories: ["limit"],
    actionType: "scroll",
    actionPayload: "analytics-taxes",
  },
  {
    id: "reconcile-data",
    label: "Звірити дані",
    icon: Search,
    effect: "Виявить та усуне розбіжності між джерелами",
    linkedRiskCategories: ["data", "compliance"],
    actionType: "chat-prompt",
    actionPayload: "Порівняй дані з банком та обліковою системою, покажи розбіжності",
  },
  {
    id: "prepare-docs",
    label: "Підготувати документи",
    icon: FileCheck,
    effect: "Готовність до перевірки або звітності",
    linkedRiskCategories: ["compliance"],
    actionType: "chat-prompt",
    actionPayload: "Сформуй чек-лист документів для підготовки до звітного періоду",
  },
  {
    id: "analyze-concentration",
    label: "Аналіз джерел доходу",
    icon: BarChart3,
    effect: "Оцінить залежність від ключових клієнтів",
    linkedRiskCategories: ["finance"],
    actionType: "chat-prompt",
    actionPayload: "Проаналізуй концентрацію доходу по контрагентах та джерелах",
  },
  {
    id: "review-volatility",
    label: "Переглянути динаміку",
    icon: ArrowRight,
    effect: "Розуміння причин коливань доходу",
    linkedRiskCategories: ["finance"],
    actionType: "scroll",
    actionPayload: "analytics-chart",
  },
  {
    id: "compliance-check",
    label: "Перевірити відповідність",
    icon: ShieldCheck,
    effect: "Мінімізація ризиків при перевірці",
    linkedRiskCategories: ["compliance"],
    actionType: "chat-prompt",
    actionPayload: "Перевір відповідність документів та звітності вимогам законодавства",
  },
  {
    id: "resolve-overdue-payments",
    label: "Оплатити прострочене",
    icon: ArrowRight,
    effect: "Зменшить ризик штрафів та пені",
    linkedRiskCategories: ["compliance"],
    actionType: "chat-prompt",
    actionPayload: "Покажи прострочені платежі та допоможи сформувати платіжні доручення",
  },
  {
    id: "resolve-overdue-tax",
    label: "Сплатити податки",
    icon: ShieldCheck,
    effect: "Уникнення штрафних санкцій",
    linkedRiskCategories: ["compliance"],
    actionType: "chat-prompt",
    actionPayload: "Покажи прострочені податкові платежі та допоможи їх оплатити",
  },
];

// Get actions relevant to a specific risk category
export const getActionsForCategory = (category: RiskCategory): ActionTemplate[] => {
  return actionLibrary.filter(a => a.linkedRiskCategories.includes(category));
};
