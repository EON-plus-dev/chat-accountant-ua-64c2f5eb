import { useState, useCallback, useMemo, useRef } from "react";
import { RATES_2025 } from "@/portal/data/rates2025";
import { analytics } from "@/portal/services/analytics";

export type BusinessType = "trade" | "it" | "manufacturing" | "restaurant" | "construction" | "education";
export type Employees = "solo" | "small" | "large";
export type Clients = "individuals" | "businesses" | "both";
export type Priority = "min-tax" | "simplicity" | "scaling";

export interface WizardState {
  businessType: BusinessType | null;
  income: number;
  employees: Employees | null;
  clients: Clients | null;
  priority: Priority | null;
}

export interface WizardResult {
  recommendation: "fop-1" | "fop-2" | "fop-3" | "tov" | "tov-general";
  title: string;
  reason: string;
  monthlyTax: number;
  monthlyEsv: number;
  monthlyTotal: number;
  monthlyIncome: number;
  pros: string[];
  cons: string[];
  alternatives: string;
}

const TOTAL_STEPS = 5;

function getRecommendation(state: WizardState): WizardResult {
  const monthlyIncome = Math.round(state.income / 12);
  const annualIncome = state.income;
  const esv = Math.round(RATES_2025.minWage * RATES_2025.esv);

  // Large teams → ТОВ
  if (state.employees === "large") {
    const tax = Math.round(monthlyIncome * 0.05);
    return {
      recommendation: "tov",
      title: "ТОВ на спрощеній системі",
      reason: "При більше 10 найманих працівників ФОП обмежений. ТОВ дає необмежену кількість співробітників.",
      monthlyIncome,
      monthlyTax: tax,
      monthlyEsv: esv,
      monthlyTotal: tax + esv,
      pros: ["Необмежена кількість працівників", "Захист особистого майна", "Можливість залучити інвесторів"],
      cons: ["Складніша реєстрація", "Вища вартість обслуговування", "Обов'язковий статутний капітал"],
      alternatives: "ФОП 3 групи якщо плануєте скоротити команду до 10 осіб",
    };
  }

  // Over ФОП 3 limit → ТОВ загальна
  if (annualIncome > 9336000) {
    const tax = Math.round(monthlyIncome * 0.18);
    return {
      recommendation: "tov-general",
      title: "ТОВ на загальній системі",
      reason: "Дохід перевищує ліміт ФОП 3 групи (9 336 000 ₴). Необхідна загальна система або ТОВ.",
      monthlyIncome,
      monthlyTax: tax,
      monthlyEsv: esv,
      monthlyTotal: tax + esv,
      pros: ["Без обмежень доходу", "Необмежені працівники", "Можливість залучення інвестицій"],
      cons: ["Складна звітність", "Вищі податки", "Обов'язковий бухгалтер"],
      alternatives: "ФОП 3 групи якщо дохід знизиться до 9.3 млн/рік",
    };
  }

  // Low income + small team + simplicity → ФОП 2
  if (annualIncome <= 5587800 && state.employees === "small" && state.priority === "simplicity") {
    return {
      recommendation: "fop-2",
      title: "ФОП 2 група",
      reason: "При невеликому доході і пріоритеті простоти — фіксований податок 2 групи зручніший.",
      monthlyIncome,
      monthlyTax: RATES_2025.esnGroup2,
      monthlyEsv: esv,
      monthlyTotal: RATES_2025.esnGroup2 + esv,
      pros: ["Фіксований податок", "Річна звітність", "Простота"],
      cons: ["Ліміт доходу 5.5 млн", "Обмеження по видах діяльності для юросіб"],
      alternatives: "ФОП 3 групи якщо потрібна більша гнучкість",
    };
  }

  // Solo IT/services → ФОП 3
  if (state.employees === "solo" && (state.businessType === "it" || state.businessType === "education")) {
    const tax = Math.round(monthlyIncome * RATES_2025.esnGroup3NoVat);
    return {
      recommendation: "fop-3",
      title: "ФОП 3 група",
      reason: "Для IT-фрілансера чи консультанта без найманих — оптимальний вибір.",
      monthlyIncome,
      monthlyTax: tax,
      monthlyEsv: esv,
      monthlyTotal: tax + esv,
      pros: ["5% від доходу", "Проста квартальна звітність", "Без обмежень по клієнтах"],
      cons: ["Особиста відповідальність", "Не можна продавати частки"],
      alternatives: "ФОП 2 гр. якщо дохід стабільний і < 5.5 млн/рік",
    };
  }

  // Very low income solo → ФОП 1
  if (state.employees === "solo" && annualIncome <= 1085500 && state.clients === "individuals") {
    return {
      recommendation: "fop-1",
      title: "ФОП 1 група",
      reason: "Мінімальний фіксований податок при роботі тільки з фізособами.",
      monthlyIncome,
      monthlyTax: Math.round(RATES_2025.esnGroup1),
      monthlyEsv: esv,
      monthlyTotal: Math.round(RATES_2025.esnGroup1) + esv,
      pros: ["Найнижчий фіксований податок", "Річна звітність", "Мінімум адміністрування"],
      cons: ["Ліміт доходу 1.08 млн", "Тільки фізособи-клієнти", "Заборонено наймати"],
      alternatives: "ФОП 2 або 3 групи для зростання",
    };
  }

  // Scaling priority → ТОВ спрощена
  if (state.priority === "scaling" && state.employees === "small") {
    const tax = Math.round(monthlyIncome * 0.05);
    return {
      recommendation: "tov",
      title: "ТОВ на спрощеній системі",
      reason: "Для масштабування бізнесу ТОВ дає більше можливостей: інвестори, партнери, захист майна.",
      monthlyIncome,
      monthlyTax: tax,
      monthlyEsv: esv,
      monthlyTotal: tax + esv,
      pros: ["Захист особистого майна", "Можливість залучити інвесторів", "Необмежене масштабування"],
      cons: ["Складніша реєстрація", "Вищі витрати на обслуговування"],
      alternatives: "ФОП 3 групи якщо масштабування не пріоритет",
    };
  }

  // Default → ФОП 3
  const tax = Math.round(monthlyIncome * RATES_2025.esnGroup3NoVat);
  return {
    recommendation: "fop-3",
    title: "ФОП 3 група",
    reason: "Найбільш гнучка форма для вашого типу бізнесу.",
    monthlyIncome,
    monthlyTax: tax,
    monthlyEsv: esv,
    monthlyTotal: tax + esv,
    pros: ["Гнучкість", "Проста звітність", "Підходить більшості видів діяльності"],
    cons: ["Особиста відповідальність", "ЄСВ навіть при нульовому доході"],
    alternatives: "ТОВ якщо плануєте залучати інвесторів або масштабуватись",
  };
}

export const useWizard = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [state, setState] = useState<WizardState>({
    businessType: null,
    income: 1200000,
    employees: null,
    clients: null,
    priority: null,
  });

  const setBusinessType = useCallback((v: BusinessType) => setState((s) => ({ ...s, businessType: v })), []);
  const setIncome = useCallback((v: number) => setState((s) => ({ ...s, income: v })), []);
  const setEmployees = useCallback((v: Employees) => setState((s) => ({ ...s, employees: v })), []);
  const setClients = useCallback((v: Clients) => setState((s) => ({ ...s, clients: v })), []);
  const setPriority = useCallback((v: Priority) => setState((s) => ({ ...s, priority: v })), []);

  const canNext = useMemo(() => {
    switch (step) {
      case 1: return !!state.businessType;
      case 2: return state.income > 0;
      case 3: return !!state.employees;
      case 4: return !!state.clients;
      case 5: return !!state.priority;
      default: return false;
    }
  }, [step, state]);

  const next = useCallback(() => {
    if (step < TOTAL_STEPS && canNext) {
      setDirection("right");
      setStep((s) => s + 1);
    }
  }, [step, canNext]);

  const back = useCallback(() => {
    if (step > 1) {
      setDirection("left");
      setStep((s) => s - 1);
    }
  }, [step]);

  const isComplete = step === TOTAL_STEPS && canNext;

  const showResult = useCallback(() => {
    if (isComplete) {
      setDirection("right");
      setStep(6);
    }
  }, [isComplete]);

  const trackedRef = useRef(false);

  const result = useMemo((): WizardResult | null => {
    if (step !== 6) return null;
    const r = getRecommendation(state);
    if (!trackedRef.current) {
      analytics.wizardCompleted(r.recommendation);
      trackedRef.current = true;
    }
    return r;
  }, [step, state]);

  const restart = useCallback(() => {
    setStep(1);
    setDirection("right");
    setState({ businessType: null, income: 1200000, employees: null, clients: null, priority: null });
  }, []);

  return {
    step,
    totalSteps: TOTAL_STEPS,
    direction,
    state,
    setBusinessType,
    setIncome,
    setEmployees,
    setClients,
    setPriority,
    canNext,
    next,
    back,
    isComplete,
    showResult,
    result,
    restart,
  };
};
