/**
 * Дані для «Особистого штабу» в Огляді individual-кабінету.
 * Дані прив'язані до пресету (declarant/renter/master) з `cabinetPreset.ts`.
 */
import { pickByPreset, type PersonalPreset } from "../cabinetPreset";

export interface BalanceBucket {
  label: string;
  amountUah: number;
  hint?: string;
}

export interface IncomeExpenseMtd {
  incomeUah: number;
  expenseUah: number;
  incomeDeltaPct: number;
  expenseDeltaPct: number;
  budgetUah: number;
}

export interface PersonalRisk {
  id: string;
  severity: "warning" | "danger" | "info";
  title: string;
  description: string;
}

export interface SystemStatusPill {
  id: string;
  label: string;
  state: "ok" | "warn" | "info";
  detail: string;
}

export interface PersonalOverviewSnapshot {
  balances: BalanceBucket[];
  totalUah: number;
  mtd: IncomeExpenseMtd;
  risks: PersonalRisk[];
  systemStatus: SystemStatusPill[];
}

const DATA: Partial<Record<PersonalPreset, PersonalOverviewSnapshot>> = {
  declarant: {
    balances: [
      { label: "Рахунки", amountUah: 142_300, hint: "ПриватБанк, monobank, UKRSIBBANK" },
      { label: "Картки", amountUah: 18_450, hint: "Зарплатна + 2 кредитні" },
      { label: "Готівка", amountUah: 6_600 },
      { label: "Е-гаманці", amountUah: 80_000, hint: "Wise, Revolut, USDT" },
    ],
    totalUah: 247_350,
    mtd: {
      incomeUah: 52_000,
      expenseUah: 38_400,
      incomeDeltaPct: 4,
      expenseDeltaPct: 11,
      budgetUah: 45_000,
    },
    risks: [
      {
        id: "r1",
        severity: "warning",
        title: "Перевищення категорії «Ресторани»",
        description: "Витратили 7 200 ₴ при ліміті 6 000 ₴ — на 18% більше норми.",
      },
      {
        id: "r2",
        severity: "danger",
        title: "Резервний фонд нижче безпечного порогу",
        description: "Покриває 3,2 міс. витрат при цілі 6. Підвищіть авто-переказ.",
      },
      {
        id: "r3",
        severity: "info",
        title: "Списання Netflix зірвалось",
        description: "Не вистачило коштів на карті *4521 — спробуємо повторно 5 квітня.",
      },
    ],
    systemStatus: [
      { id: "s1", label: "ПриватБанк", state: "ok", detail: "синхронізовано хв. тому" },
      { id: "s2", label: "Дія", state: "ok", detail: "підключено, дозволи активні" },
      { id: "s3", label: "Підписки", state: "warn", detail: "8 активних · 1 збій" },
      { id: "s4", label: "AI-агенти", state: "info", detail: "4 з 5 активні" },
    ],
  },
  renter: {
    balances: [
      { label: "Рахунки", amountUah: 84_500, hint: "ПриватБанк, monobank" },
      { label: "Картки", amountUah: 9_300 },
      { label: "Готівка", amountUah: 12_000 },
    ],
    totalUah: 105_800,
    mtd: {
      incomeUah: 24_000,
      expenseUah: 9_400,
      incomeDeltaPct: 0,
      expenseDeltaPct: -6,
      budgetUah: 15_000,
    },
    risks: [
      {
        id: "rr1",
        severity: "warning",
        title: "Договір оренди закінчується за 30 днів",
        description: "Орендар Іванов І.І. — продовжуємо чи шукаємо нового?",
      },
      {
        id: "rr2",
        severity: "info",
        title: "Декларація 4-ДФ за I квартал",
        description: "Кінцевий термін — 10 травня. Чернетка готова на 80%.",
      },
    ],
    systemStatus: [
      { id: "ss1", label: "ПриватБанк", state: "ok", detail: "синхронізовано хв. тому" },
      { id: "ss2", label: "Дія", state: "ok", detail: "підключено" },
      { id: "ss3", label: "Договори", state: "warn", detail: "1 закінчується" },
    ],
  },
  master: {
    balances: [
      { label: "Картки", amountUah: 14_200, hint: "monobank" },
      { label: "Готівка", amountUah: 3_500 },
    ],
    totalUah: 17_700,
    mtd: {
      incomeUah: 22_500,
      expenseUah: 14_800,
      incomeDeltaPct: 9,
      expenseDeltaPct: 4,
      budgetUah: 18_000,
    },
    risks: [
      {
        id: "rm1",
        severity: "info",
        title: "Медична книжка діє ще 7 місяців",
        description: "Запланувати огляд орієнтовно на жовтень.",
      },
    ],
    systemStatus: [
      { id: "sm1", label: "monobank", state: "ok", detail: "синхронізовано" },
      { id: "sm2", label: "Дія", state: "ok", detail: "підключено" },
    ],
  },
};

export function getOverviewSnapshot(cabinetId: string): PersonalOverviewSnapshot | null {
  return pickByPreset(cabinetId, DATA, null);
}
