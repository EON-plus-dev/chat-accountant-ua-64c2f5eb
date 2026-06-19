import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export type AgentStatus = "active" | "paused" | "setup_required";

export interface PersonalAgent {
  id: string;
  name: string;
  role: string;
  icon: "assistant" | "budget" | "savings" | "health" | "family";
  status: AgentStatus;
  lastAction: string;
  lastActionAt: string;
  monthlyActions: number;
  description: string;
}

const FULL: PersonalAgent[] = [
  {
    id: "agent-assistant",
    name: "AI Personal Assistant",
    role: "Головний агент-координатор",
    icon: "assistant",
    status: "active",
    lastAction: "Підготував ранковий брифінг",
    lastActionAt: "сьогодні о 07:30",
    monthlyActions: 184,
    description: "Координує всіх інших агентів, готує брифінги, відповідає на запити.",
  },
  {
    id: "agent-budget",
    name: "AI Budget Manager",
    role: "Контроль витрат і бюджету",
    icon: "budget",
    status: "active",
    lastAction: "Сповістив про перевищення категорії «Ресторани» на 18%",
    lastActionAt: "вчора о 21:14",
    monthlyActions: 42,
    description: "Стежить за бюджетом, попереджає про перевитрати, пропонує оптимізацію.",
  },
  {
    id: "agent-savings",
    name: "AI Savings Planner",
    role: "Цілі та накопичення",
    icon: "savings",
    status: "active",
    lastAction: "Перевів 7 200 ₴ на ціль «Подорож»",
    lastActionAt: "1 квіт. о 09:00",
    monthlyActions: 8,
    description: "Авто-перекази на цілі, перевірка дохідності, what-if симуляції.",
  },
  {
    id: "agent-health",
    name: "AI Health Coordinator",
    role: "Медичні візити та страховка",
    icon: "health",
    status: "setup_required",
    lastAction: "Очікує підключення Helsi/Дія",
    lastActionAt: "—",
    monthlyActions: 0,
    description: "Нагадує про візити, веде картки родини, відстежує дію поліса ДМС.",
  },
  {
    id: "agent-family",
    name: "AI Family Assistant",
    role: "Сімейні справи",
    icon: "family",
    status: "active",
    lastAction: "Створив нагадування про батьківські збори",
    lastActionAt: "2 квіт. о 11:42",
    monthlyActions: 27,
    description: "Координує родинний календар, делегує доступи, нагадує про дні народження.",
  },
];

const DATA: Partial<Record<PersonalPreset, PersonalAgent[]>> = {
  declarant: FULL,
  renter: [
    FULL[0], // Assistant
    {
      ...FULL[1],
      lastAction: "Розрахував чистий дохід з оренди за березень",
      lastActionAt: "1 квіт. о 08:10",
      monthlyActions: 18,
    },
    {
      ...FULL[2],
      lastAction: "Поповнив резерв на простій оренди",
      lastActionAt: "30 бер. о 10:00",
      monthlyActions: 3,
    },
    { ...FULL[3], status: "paused", lastAction: "Поставлено на паузу" },
    { ...FULL[4], status: "paused", lastAction: "Поставлено на паузу" },
  ],
  master: [
    FULL[0],
    {
      ...FULL[1],
      lastAction: "Нагадав про щомісячний внесок ЄСВ",
      lastActionAt: "вчора о 19:00",
      monthlyActions: 22,
    },
    {
      ...FULL[2],
      lastAction: "Поповнив ціль «Набір інструментів»",
      lastActionAt: "28 бер. о 14:20",
      monthlyActions: 4,
    },
    { ...FULL[3], status: "setup_required" },
    { ...FULL[4], status: "paused", lastAction: "Поставлено на паузу" },
  ],
};

export function getAgentsForCabinet(cabinetId: string): PersonalAgent[] {
  return pickByPreset(cabinetId, DATA, []);
}
