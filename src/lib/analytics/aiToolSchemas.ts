/**
 * AI Tool Registry для Conversational BI кабінетної аналітики.
 *
 * 6 інструментів для різних класів запитів користувача:
 * 1. apply_analytics_filters — налаштувати sidebar фільтри (період, метрики, view)
 * 2. query_cashflow_forecast — прогноз по cash flow / залишках
 * 3. compare_to_benchmark — порівняння з ринком/категорією/попереднім періодом
 * 4. explain_health_score — деталізація pillar/score
 * 5. propose_action — пропозиція дії (платіжка, нагадування, подія)
 * 6. ask_clarification — уточнення коли запит неоднозначний
 */

export type AnalyticsToolName =
  | "apply_analytics_filters"
  | "query_cashflow_forecast"
  | "compare_to_benchmark"
  | "explain_health_score"
  | "propose_action"
  | "ask_clarification";

// ────────────────────────────────────────────────────────────────
// 1. apply_analytics_filters
// ────────────────────────────────────────────────────────────────
export interface ApplyFiltersArgs {
  period?: "today" | "week" | "month" | "quarter" | "year" | "custom";
  customRange?: { from: string; to: string }; // ISO dates
  viewMode?: "table" | "chart";
  metrics?: string[]; // MetricId[]
  /** today/period — legacy aliases; compare = увімкнути порівняння з минулим */
  analysisMode?: "today" | "period" | "compare" | "passive";
  /** Базова лінія для порівняння. Встановлення цього параметра автоматично вмикає compare. */
  compareBaseline?: "previous_period" | "previous_year" | "custom";
  /** Власний діапазон базової лінії — використовується при compareBaseline = "custom" */
  compareBaselineRange?: { from: string; to: string };
  activeTab?: string;
  /**
   * Як рендерити центральну зону. AI має право встановити явно
   * (focus/gauge/compliance/forecast/score). Якщо не задано — застосовуємо
   * автодетект на стороні registry на основі metrics + analysisMode.
   */
  displayMode?: "multi" | "focus" | "comparison" | "gauge" | "compliance" | "forecast" | "score";
  reasoning?: string;
}

// ────────────────────────────────────────────────────────────────
// 2. query_cashflow_forecast
// ────────────────────────────────────────────────────────────────
export interface CashflowForecastArgs {
  horizonDays: number; // 7, 30, 90
  includeUpcomingTaxes?: boolean;
  includeRecurringExpenses?: boolean;
  scenario?: "base" | "optimistic" | "pessimistic";
}

// ────────────────────────────────────────────────────────────────
// 3. compare_to_benchmark
// ────────────────────────────────────────────────────────────────
export interface CompareBenchmarkArgs {
  metric: string; // "income" | "expenses" | "taxes" | "margin"
  benchmarkType: "market" | "category" | "previous_period" | "year_over_year";
  period?: "month" | "quarter" | "year";
}

// ────────────────────────────────────────────────────────────────
// 4. explain_health_score
// ────────────────────────────────────────────────────────────────
export interface ExplainHealthArgs {
  pillar?: "liquidity" | "compliance" | "growth" | "efficiency" | "all";
  includeActionPlan?: boolean;
}

// ────────────────────────────────────────────────────────────────
// 5. propose_action
// ────────────────────────────────────────────────────────────────
export interface ProposeActionArgs {
  type: "payment_slip" | "reminder" | "calendar_event" | "tax_report" | "expense_log";
  title: string;
  description?: string;
  dueDate?: string; // ISO
  amount?: number;
  payload?: Record<string, unknown>;
}

// ────────────────────────────────────────────────────────────────
// 6. ask_clarification
// ────────────────────────────────────────────────────────────────
export interface AskClarificationArgs {
  question: string;
  options: Array<{ label: string; value: string }>;
}

// ────────────────────────────────────────────────────────────────
// Union type для tool_calls
// ────────────────────────────────────────────────────────────────
export type AnalyticsToolCall =
  | { name: "apply_analytics_filters"; args: ApplyFiltersArgs }
  | { name: "query_cashflow_forecast"; args: CashflowForecastArgs }
  | { name: "compare_to_benchmark"; args: CompareBenchmarkArgs }
  | { name: "explain_health_score"; args: ExplainHealthArgs }
  | { name: "propose_action"; args: ProposeActionArgs }
  | { name: "ask_clarification"; args: AskClarificationArgs };

// ────────────────────────────────────────────────────────────────
// OpenAI/Lovable AI tool definitions (function-calling spec)
// ────────────────────────────────────────────────────────────────
export const ANALYTICS_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "apply_analytics_filters",
      description:
        "Налаштувати фільтри аналітики кабінету (період, метрики, view). Викликати коли користувач просить показати/проаналізувати конкретні дані.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["today", "week", "month", "quarter", "year", "custom"] },
          customRange: {
            type: "object",
            properties: { from: { type: "string" }, to: { type: "string" } },
          },
          viewMode: { type: "string", enum: ["table", "chart"] },
          metrics: { type: "array", items: { type: "string" } },
          analysisMode: { type: "string", enum: ["today", "period", "compare", "passive"] },
          compareBaseline: {
            type: "string",
            enum: ["previous_period", "previous_year", "custom"],
            description: "previous_period = той самий тип попереднього періоду; previous_year = торік (YoY); custom = власний діапазон через compareBaselineRange",
          },
          compareBaselineRange: {
            type: "object",
            properties: { from: { type: "string" }, to: { type: "string" } },
          },
          activeTab: { type: "string" },
          displayMode: {
            type: "string",
            enum: ["multi", "focus", "comparison", "gauge", "compliance", "forecast", "score"],
            description:
              "Як рендерити центральну зону: multi = overview KPI+таби (за замовчуванням); focus = глибокий аналіз однієї метрики (використовуй коли користувач просить деталі по ОДНІЙ метриці); gauge = використання лімітів; compliance = checklist податків/звітів; forecast = прогноз cash flow / runway; score = Health Score з pillar-ами; comparison = синонім multi+analysisMode=compare.",
          },
          reasoning: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "query_cashflow_forecast",
      description:
        "Запит прогнозу cash flow на N днів. Викликати коли користувач питає 'чи вистачить грошей', 'що буде далі', 'прогноз залишку'.",
      parameters: {
        type: "object",
        required: ["horizonDays"],
        properties: {
          horizonDays: { type: "number", enum: [7, 30, 90] },
          includeUpcomingTaxes: { type: "boolean" },
          includeRecurringExpenses: { type: "boolean" },
          scenario: { type: "string", enum: ["base", "optimistic", "pessimistic"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_to_benchmark",
      description:
        "Порівняння метрики з бенчмарком (ринок, категорія, попередній період). Викликати на 'порівняй', 'як у інших', 'краще/гірше ніж'.",
      parameters: {
        type: "object",
        required: ["metric", "benchmarkType"],
        properties: {
          metric: { type: "string" },
          benchmarkType: {
            type: "string",
            enum: ["market", "category", "previous_period", "year_over_year"],
          },
          period: { type: "string", enum: ["month", "quarter", "year"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "explain_health_score",
      description:
        "Пояснити Health Score та pillar-и. Викликати на 'чому такий score', 'що покращити', 'слабкі місця'.",
      parameters: {
        type: "object",
        properties: {
          pillar: {
            type: "string",
            enum: ["liquidity", "compliance", "growth", "efficiency", "all"],
          },
          includeActionPlan: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_action",
      description:
        "Запропонувати дію користувачу (платіжка, нагадування, подія). НЕ виконує — лише пропозиція з ActionCard.",
      parameters: {
        type: "object",
        required: ["type", "title"],
        properties: {
          type: {
            type: "string",
            enum: ["payment_slip", "reminder", "calendar_event", "tax_report", "expense_log"],
          },
          title: { type: "string" },
          description: { type: "string" },
          dueDate: { type: "string" },
          amount: { type: "number" },
          payload: { type: "object" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ask_clarification",
      description:
        "Поставити уточнююче питання з варіантами вибору. Викликати коли запит неоднозначний (не зрозуміло який період / який тип податку / яка категорія).",
      parameters: {
        type: "object",
        required: ["question", "options"],
        properties: {
          question: { type: "string" },
          options: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "value"],
              properties: {
                label: { type: "string" },
                value: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
];
