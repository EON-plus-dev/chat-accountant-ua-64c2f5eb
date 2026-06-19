// Centralized semantic styling for status badges, indicators, and colors
// Follows FinTech industry standards (Stripe, Mercury, Wise)

export type SemanticStatus = 
  | "success" | "warning" | "error" | "info" | "neutral"
  | "draft" | "signed" | "sent" | "paid" | "pending" | "overdue" 
  | "approved" | "ready" | "submitted" | "ok";

export interface StatusStyle {
  bg: string;
  text: string;
  border?: string;
  label: string;
}

// Status to semantic mapping
const statusToSemantic: Record<string, SemanticStatus> = {
  // Direct mappings
  success: "success",
  ok: "success",
  paid: "success",
  approved: "success",
  ready: "success",
  
  warning: "warning",
  pending: "warning",
  
  error: "error",
  overdue: "error",
  
  info: "info",
  signed: "info",
  sent: "info",
  submitted: "info",
  
  neutral: "neutral",
  draft: "neutral",
};

// Semantic color system using HSL design tokens
const semanticColors: Record<SemanticStatus, { bg: string; text: string; border: string }> = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800/50",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/50",
  },
  neutral: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  },
  // Extended statuses
  draft: {
    bg: "bg-slate-100 dark:bg-slate-800/40",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
  },
  signed: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/50",
  },
  sent: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-400",
    border: "border-sky-200 dark:border-sky-800/50",
  },
  paid: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
  pending: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  overdue: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800/50",
  },
  approved: {
    bg: "bg-green-50 dark:bg-green-950/40",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800/50",
  },
  ready: {
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-200 dark:border-teal-800/50",
  },
  submitted: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-700 dark:text-violet-400",
    border: "border-violet-200 dark:border-violet-800/50",
  },
  ok: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
};

// Status labels in Ukrainian
const statusLabels: Record<string, string> = {
  success: "Успішно",
  warning: "Увага",
  error: "Помилка",
  info: "Інфо",
  neutral: "—",
  draft: "Чернетка",
  signed: "Підписано",
  sent: "Відправлено",
  paid: "Оплачено",
  pending: "Очікує",
  overdue: "Прострочено",
  approved: "Погоджено",
  ready: "Готово",
  submitted: "Подано",
  ok: "Норма",
};

/**
 * Get semantic style classes for a status
 * @param status - Status string (e.g., "paid", "pending", "error")
 * @returns Object with bg, text, border classes and label
 */
export function getStatusStyle(status: string): StatusStyle {
  const normalizedStatus = status.toLowerCase() as SemanticStatus;
  const colors = semanticColors[normalizedStatus] || semanticColors.neutral;
  
  return {
    bg: colors.bg,
    text: colors.text,
    border: colors.border,
    label: statusLabels[normalizedStatus] || status,
  };
}

/**
 * Get combined className string for status badge
 * @param status - Status string
 * @param withBorder - Include border styling
 * @returns Combined className string
 */
export function getStatusClassName(status: string, withBorder = false): string {
  const style = getStatusStyle(status);
  return withBorder 
    ? `${style.bg} ${style.text} ${style.border} border`
    : `${style.bg} ${style.text}`;
}

/**
 * Get semantic color for numeric values (positive/negative)
 * @param value - Numeric value or string containing number
 * @returns Tailwind text color class
 */
export function getAmountColor(value: string | number): string {
  const strValue = String(value);
  if (strValue.includes("+") || parseFloat(strValue.replace(/[^\d.-]/g, "")) > 0) {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (strValue.includes("-") || parseFloat(strValue.replace(/[^\d.-]/g, "")) < 0) {
    return "text-red-600 dark:text-red-400";
  }
  return "";
}

/**
 * Badge variant mapping for different operation types
 */
export const operationTypeVariants: Record<string, { label: string; variant: "info" | "success" | "warning" }> = {
  subscription: { label: "Підписка", variant: "info" },
  topup: { label: "Поповнення", variant: "success" },
  plan_change: { label: "Зміна тарифу", variant: "warning" },
};

// ============================================
// UNIFIED BADGE COLOR SYSTEM (by color name)
// For issue types, status badges, and indicators
// ============================================

export type BadgeColor = 
  | "red" | "orange" | "amber" | "yellow" 
  | "green" | "emerald" | "teal" | "cyan"
  | "blue" | "indigo" | "purple" | "pink"
  | "slate" | "gray";

export interface BadgeColorStyle {
  bg: string;      // Background class
  text: string;    // Text color class  
  border: string;  // Border color class
}

/**
 * Unified color palette for badges across all components
 * Pattern: bg-{color}-50/100 text-{color}-700 dark:bg-{color}-950/40 dark:text-{color}-400
 */
export const badgeColors: Record<BadgeColor, BadgeColorStyle> = {
  red: {
    bg: "bg-red-100 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800/50",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800/50",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-950/40",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800/50",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-950/40",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800/50",
  },
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/50",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800/50",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800/50",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800/50",
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800/50",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950/40",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800/50",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-950/40",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800/50",
  },
  slate: {
    bg: "bg-slate-100 dark:bg-slate-800/40",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
  },
  gray: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  },
};

/**
 * Get badge color classes by color name
 * @param color - Color name (e.g., "red", "amber", "blue")
 * @param withBorder - Include border styling
 * @returns Combined className string
 */
export function getBadgeColorClasses(color: string, withBorder = true): string {
  const colorStyle = badgeColors[color as BadgeColor] || badgeColors.gray;
  return withBorder 
    ? `${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} border`
    : `${colorStyle.bg} ${colorStyle.text}`;
}

// ============================================
// STATUS-FIRST ROW STYLING SYSTEM
// Synchronized border ↔ badge colors for tables
// Following FinTech best practices (Stripe, Linear, Wise)
// ============================================

export interface StatusRowStyle {
  border: string;      // Border-left color
  badge: string;       // Badge background + text classes
  bg: string;          // Row background (light mode)
  bgDark: string;      // Row background (dark mode)
  stickyBg?: string;   // Opaque background for sticky columns (light)
  stickyBgDark?: string; // Opaque background for sticky columns (dark)
}

/**
 * Unified row styles with synchronized border ↔ badge colors
 * Critical rule: border color MUST match badge color for visual consistency
 */
export const statusRowStyles: Record<string, StatusRowStyle> = {
  // === Income Book Statuses ===
  "income": {
    border: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    bg: "bg-emerald-50/15",
    bgDark: "dark:bg-emerald-950/12",
    stickyBg: "bg-emerald-50",
    stickyBgDark: "dark:bg-card",
  },
  "needs-clarification": {
    border: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    bg: "bg-amber-50/15",
    bgDark: "dark:bg-amber-950/12",
    stickyBg: "bg-amber-50",
    stickyBgDark: "dark:bg-card",
  },
  "needs-clarification-critical": { // Escalated severity!
    border: "border-l-red-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", // Badge stays amber
    bg: "bg-red-50/15",
    bgDark: "dark:bg-red-950/12",
    stickyBg: "bg-red-50",
    stickyBgDark: "dark:bg-card",
  },
  "return": {
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    bg: "bg-blue-50/15",
    bgDark: "dark:bg-blue-950/12",
    stickyBg: "bg-blue-50",
    stickyBgDark: "dark:bg-card",
  },
  "not-income": {
    border: "",
    badge: "bg-muted text-muted-foreground",
    bg: "",
    bgDark: "",
    stickyBg: "bg-card",
    stickyBgDark: "dark:bg-card",
  },

  // === Document Flow Statuses ===
  "draft": {
    border: "border-l-slate-400",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    bg: "bg-slate-50/15",
    bgDark: "dark:bg-slate-950/12",
    stickyBg: "bg-slate-50",
    stickyBgDark: "dark:bg-card",
  },
  "pending-sign": {
    border: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    bg: "bg-amber-50/15",
    bgDark: "dark:bg-amber-950/12",
    stickyBg: "bg-amber-50",
    stickyBgDark: "dark:bg-card",
  },
  "signed": {
    border: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    bg: "bg-emerald-50/15",
    bgDark: "dark:bg-emerald-950/12",
    stickyBg: "bg-emerald-50",
    stickyBgDark: "dark:bg-card",
  },
  "sent": {
    border: "border-l-sky-500",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    bg: "bg-sky-50/15",
    bgDark: "dark:bg-sky-950/12",
    stickyBg: "bg-sky-50",
    stickyBgDark: "dark:bg-card",
  },
  "confirmed": {
    border: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    bg: "bg-emerald-50/15",
    bgDark: "dark:bg-emerald-950/12",
    stickyBg: "bg-emerald-50",
    stickyBgDark: "dark:bg-card",
  },
  "paid": {
    border: "border-l-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    bg: "bg-emerald-50/15",
    bgDark: "dark:bg-emerald-950/12",
    stickyBg: "bg-emerald-50",
    stickyBgDark: "dark:bg-card",
  },
  "partially-paid": {
    border: "border-l-yellow-500",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300",
    bg: "bg-yellow-50/15",
    bgDark: "dark:bg-yellow-950/12",
    stickyBg: "bg-yellow-50",
    stickyBgDark: "dark:bg-card",
  },
  "registered": {
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    bg: "bg-blue-50/15",
    bgDark: "dark:bg-blue-950/12",
    stickyBg: "bg-blue-50",
    stickyBgDark: "dark:bg-card",
  },
  "archived": {
    border: "",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    bg: "",
    bgDark: "",
    stickyBg: "bg-card",
    stickyBgDark: "dark:bg-card",
  },
  "cancelled": {
    border: "",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 line-through",
    bg: "",
    bgDark: "",
    stickyBg: "bg-card",
    stickyBgDark: "dark:bg-card",
  },

  // === Critical/Overdue escalation ===
  "overdue": {
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    bg: "bg-red-50/15",
    bgDark: "dark:bg-red-950/12",
    stickyBg: "bg-red-50",
    stickyBgDark: "dark:bg-card",
  },
  "critical": {
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    bg: "bg-red-50/15",
    bgDark: "dark:bg-red-950/12",
    stickyBg: "bg-red-50",
    stickyBgDark: "dark:bg-card",
  },

  // === Default fallback ===
  "neutral": {
    border: "",
    badge: "bg-muted text-muted-foreground",
    bg: "",
    bgDark: "",
    stickyBg: "bg-card",
    stickyBgDark: "dark:bg-card",
  },
};

/**
 * Get row styles by status key
 */
export function getStatusRowStyle(status: string): StatusRowStyle {
  return statusRowStyles[status] || statusRowStyles.neutral;
}
