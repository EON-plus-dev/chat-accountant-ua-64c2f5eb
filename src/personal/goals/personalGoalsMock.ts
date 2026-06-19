import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export interface PersonalGoal {
  id: string;
  title: string;
  category: "travel" | "reserve" | "home" | "education" | "vehicle";
  targetUah: number;
  currentUah: number;
  /** ISO date — коли ціль має бути досягнута. */
  dueDate: string;
  monthlyPlanUah?: number;
  aiHint?: string;
}

const DATA: Partial<Record<PersonalPreset, PersonalGoal[]>> = {
  declarant: [
    {
      id: "goal-1",
      title: "Подорож до Японії",
      category: "travel",
      targetUah: 80_000,
      currentUah: 51_200,
      dueDate: "2026-08-15",
      monthlyPlanUah: 7_200,
      aiHint: "Виконано на 64%. Якщо +1 200 ₴/міс — встигнете на 3 тижні раніше.",
    },
    {
      id: "goal-2",
      title: "Резервний фонд (6 міс. витрат)",
      category: "reserve",
      targetUah: 180_000,
      currentUah: 95_000,
      dueDate: "2026-12-31",
      monthlyPlanUah: 9_500,
      aiHint: "Зараз покриває 3,2 міс. витрат — нижче за безпечний поріг.",
    },
    {
      id: "goal-3",
      title: "Перший внесок на квартиру",
      category: "home",
      targetUah: 600_000,
      currentUah: 142_000,
      dueDate: "2028-06-30",
      monthlyPlanUah: 18_000,
      aiHint: "В графіку. Розгляньте OVDP на 12 міс — +14 200 ₴ за рік.",
    },
    {
      id: "goal-4",
      title: "Освіта Софії",
      category: "education",
      targetUah: 250_000,
      currentUah: 38_000,
      dueDate: "2030-09-01",
      monthlyPlanUah: 4_500,
    },
  ],
  renter: [
    {
      id: "goal-r-1",
      title: "Ремонт квартири під оренду",
      category: "home",
      targetUah: 120_000,
      currentUah: 47_500,
      dueDate: "2026-10-01",
      monthlyPlanUah: 9_000,
      aiHint: "З поточним темпом орендних надходжень — встигаєте до жовтня.",
    },
    {
      id: "goal-r-2",
      title: "Резерв на простій оренди (3 міс.)",
      category: "reserve",
      targetUah: 60_000,
      currentUah: 22_000,
      dueDate: "2026-12-31",
      monthlyPlanUah: 4_500,
    },
  ],
  master: [
    {
      id: "goal-m-1",
      title: "Професійний набір інструментів",
      category: "education",
      targetUah: 35_000,
      currentUah: 12_400,
      dueDate: "2026-09-01",
      monthlyPlanUah: 3_500,
      aiHint: "З поточним темпом — на 2 тижні раніше за дедлайн.",
    },
    {
      id: "goal-m-2",
      title: "Курс підвищення кваліфікації",
      category: "education",
      targetUah: 18_000,
      currentUah: 4_200,
      dueDate: "2026-11-15",
      monthlyPlanUah: 2_000,
    },
  ],
};

export function getGoalsForCabinet(cabinetId: string): PersonalGoal[] {
  return pickByPreset(cabinetId, DATA, []);
}

export function getGoalProgress(goal: PersonalGoal): number {
  if (goal.targetUah <= 0) return 0;
  return Math.min(100, Math.round((goal.currentUah / goal.targetUah) * 100));
}
