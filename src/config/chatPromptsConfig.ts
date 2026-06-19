import type { Cabinet } from "@/types/cabinet";
import type { TabType } from "@/components/dashboard/WorkspacePanel";

export interface QuickPrompt {
  text: string;
  action?: string;
}

// Prompts for general mode (no cabinet selected)
const generalPrompts: QuickPrompt[] = [
  { text: "Покажи загальну статистику по кабінетах" },
  { text: "Які кабінети потребують уваги?" },
  { text: "Найближчі дедлайни по всіх кабінетах" },
  { text: "Порівняй доходи за місяць" },
];

// Prompts by cabinet type
const cabinetTypePrompts: Record<string, QuickPrompt[]> = {
  fop: [
    { text: "Покажи мій дохід за місяць" },
    { text: "Скільки залишилось ліміту ЄП?" },
    { text: "Створи рахунок для клієнта" },
    { text: "Додай витрату" },
  ],
  tov: [
    { text: "Покажи фінансовий стан" },
    { text: "Хто найбільші боржники?" },
    { text: "Сформуй звіт по ПДВ" },
    { text: "Покажи структуру витрат" },
  ],
  "fop-group": [
    { text: "Порівняй доходи ФОП у групі" },
    { text: "Хто ближче до ліміту?" },
    { text: "Зведена аналітика групи" },
  ],
  individual: [
    { text: "Підготуй декларацію" },
    { text: "Покажи моє майно" },
    { text: "Розрахуй податки" },
  ],
};

// Prompts by section
const sectionPrompts: Record<string, QuickPrompt[]> = {
  overview: [
    { text: "Що важливо зараз?" },
    { text: "Покажи останні дії" },
  ],
  operations: [
    { text: "Створи новий документ" },
    { text: "Покажи неоплачені рахунки" },
    { text: "Додай операцію" },
  ],
  employees: [
    { text: "Додай нового працівника" },
    { text: "Покажи всіх активних працівників" },
    { text: "Хто працює за ЦПД?" },
    { text: "Покажи картку працівника Петренко" },
  ],
  payments: [
    { text: "Покажи, що мені треба оплатити" },
    { text: "Сформуй платіж на ЄП за цей квартал" },
    { text: "Чому така сума ЄСВ?" },
    { text: "Коли наступний дедлайн?" },
    { text: "Скільки я сплатив податків цього року?" },
  ],
  reports: [
    { text: "Підготуй декларацію ЄП за II квартал" },
    { text: "Покажи всі звіти за 2025" },
    { text: "Що мені треба подати цього кварталу?" },
    { text: "Поясни як розраховується ЄСВ" },
  ],
  analytics: [
    { text: "Проаналізуй загальний стан портфеля" },
    { text: "Порівняй з минулим періодом" },
    { text: "Знайди проблемні кабінети" },
    { text: "Оптимізуй податкове навантаження" },
    { text: "Як підвищити Health Score?" },
  ],
  settings: [
    { text: "Як налаштувати інтеграції?" },
    { text: "Поясни систему оподаткування" },
  ],
};

// Prompts by user role within cabinet
const rolePrompts: Record<string, QuickPrompt[]> = {
  owner: [
    { text: "Огляд бізнесу за тиждень" },
  ],
  accountant: [
    { text: "Які операції без проводок?" },
    { text: "Статус звітності" },
  ],
  auditor: [
    { text: "Покажи аномалії" },
    { text: "Ризики в обліку" },
  ],
};

// Prompts for passive cabinets (marketing-focused)
const passiveCabinetPrompts: QuickPrompt[] = [
  { text: "Що я можу робити в цьому кабінеті?", action: "explain_passive_features" },
  { text: "Як отримати повний доступ?", action: "explain_upgrade_path" },
  { text: "Скільки я економлю з системою?", action: "show_roi_calculator" },
  { text: "Які переваги активного кабінету?", action: "compare_passive_active" },
];

export function getContextualPrompts(
  activeCabinet: Cabinet | null | undefined,
  activeTab?: TabType,
  maxPrompts: number = 4
): QuickPrompt[] {
  const prompts: QuickPrompt[] = [];
  
  // If no cabinet selected - show general prompts
  if (!activeCabinet) {
    return generalPrompts.slice(0, maxPrompts);
  }
  
  // If passive cabinet - show marketing prompts
  if (activeCabinet.accessMode === "passive") {
    return passiveCabinetPrompts.slice(0, maxPrompts);
  }
  
  // Add cabinet type specific prompts
  const typePrompts = cabinetTypePrompts[activeCabinet.type] || [];
  prompts.push(...typePrompts);
  
  // Add section specific prompts if tab is known
  if (activeTab && sectionPrompts[activeTab]) {
    prompts.push(...sectionPrompts[activeTab]);
  }
  
  // Add role specific prompts
  const userRole = activeCabinet.roleLabel?.toLowerCase() || "";
  if (userRole.includes("власник") || userRole.includes("директор")) {
    prompts.push(...(rolePrompts.owner || []));
  } else if (userRole.includes("бухгалтер")) {
    prompts.push(...(rolePrompts.accountant || []));
  } else if (userRole.includes("аудитор")) {
    prompts.push(...(rolePrompts.auditor || []));
  }
  
  // Remove duplicates and limit
  const uniquePrompts = prompts.filter((prompt, index, self) =>
    index === self.findIndex((p) => p.text === prompt.text)
  );
  
  return uniquePrompts.slice(0, maxPrompts);
}

export { passiveCabinetPrompts };
export default getContextualPrompts;
