/**
 * Maps subtab id → launcher group + tone + demo metric for business/fop cabinets.
 * The groups themselves come from `getOperationsSubTabs(cabinet)` / `getSettingsSubTabs(...)`,
 * but the visual grouping is presentation-only (lives here, not in config).
 */
import type { OperationsSubTab } from "@/config/operationsConfig";
import type { SettingsSubTab } from "@/config/settingsConfig";
import type { CabinetType } from "@/types/cabinet";
import type { LauncherShellGroup } from "./CabinetLauncherShell";
import type { TileTone } from "./TileButton";

type GroupKey =
  | "accounting"
  | "sales"
  | "team"
  | "control"
  | "account"
  | "system"
  | "platform"
  | "other";

const GROUP_META: Record<GroupKey, { title: string; tone: TileTone; order: number }> = {
  accounting: { title: "Облік",                  tone: "indigo",  order: 1 },
  sales:      { title: "Продажі та клієнти",     tone: "emerald", order: 2 },
  team:       { title: "Команда",                tone: "violet",  order: 3 },
  control:    { title: "Звітність та контроль",  tone: "rose",    order: 4 },
  account:    { title: "Акаунт",                 tone: "indigo",  order: 1 },
  system:     { title: "Система",                tone: "blue",    order: 2 },
  platform:   { title: "Платформа",              tone: "violet",  order: 3 },
  other:      { title: "Інше",                   tone: "sky",     order: 9 },
};

// Per-id operations metrics (demo).
const OPS_METRIC: Record<string, { metric: string; sub?: string }> = {
  documents:    { metric: "12 нових · 3 чернетки" },
  "income-book": { metric: "84 записи цього кварталу" },
  finance:      { metric: "Залишок 142 800 ₴" },
  payments:     { metric: "18 платежів", sub: "2 протерміновано" },
  taxes:        { metric: "ЄП за Q1 — 15 днів", sub: "дедлайн скоро" },
  reports:      { metric: "4 звіти готові", sub: "1 потребує уваги" },
  audits:       { metric: "1 активна перевірка" },
  bookings:     { metric: "12 записів на тиждень" },
  clients:      { metric: "248 клієнтів" },
  sales:        { metric: "62 замовлення цього місяця" },
  purchases:    { metric: "18 закупок" },
  delivery:     { metric: "5 доставок у роботі" },
  warehouse:    { metric: "1 240 позицій" },
  employees:    { metric: "9 співробітників" },
  "hr-payroll": { metric: "9 співробітників · ЗП готова" },
  crm:          { metric: "32 угоди в роботі" },
  "team-tasks": { metric: "47 завдань · 6 сьогодні" },
};

// Per-id operations group assignment for business (tov).
const OPS_GROUP_BUSINESS: Record<string, GroupKey> = {
  documents: "accounting",
  finance: "accounting",
  payments: "accounting",
  taxes: "accounting",
  sales: "sales",
  purchases: "sales",
  warehouse: "sales",
  delivery: "sales",
  crm: "sales",
  "hr-payroll": "team",
  "team-tasks": "team",
  employees: "team",
  reports: "control",
  audits: "control",
};

// Per-id operations group assignment for fop.
const OPS_GROUP_FOP: Record<string, GroupKey> = {
  documents: "accounting",
  "income-book": "accounting",
  finance: "accounting",
  payments: "accounting",
  taxes: "accounting",
  clients: "sales",
  bookings: "sales",
  sales: "sales",
  purchases: "sales",
  delivery: "sales",
  warehouse: "sales",
  employees: "team",
  reports: "control",
  audits: "control",
};

// Per-id settings group assignment (shared between business/fop).
const SETTINGS_GROUP: Record<string, GroupKey> = {
  "profile-requisites": "account",
  "tax-profile": "account",
  "kep-signatures": "account",
  "kved-licensing": "account",
  notifications: "system",
  connections: "system",
  "document-policies": "system",
  "ai-actions": "system",
  "goals-budget": "platform",
  "team-access": "platform",
  "network-partners": "platform",
  references: "platform",
  "signature-log": "platform",
  salon: "platform",
};

function buildGroups(
  subtabs: { id: string; label: string; icon: any; description?: string }[],
  groupMap: Record<string, GroupKey>,
  metricMap?: Record<string, { metric: string; sub?: string }>,
): LauncherShellGroup[] {
  const buckets = new Map<GroupKey, LauncherShellGroup>();
  for (const tab of subtabs) {
    const key = groupMap[tab.id] ?? "other";
    const meta = GROUP_META[key];
    if (!buckets.has(key)) {
      buckets.set(key, { id: key, title: meta.title, tone: meta.tone, tiles: [] });
    }
    const m = metricMap?.[tab.id];
    buckets.get(key)!.tiles.push({
      id: tab.id,
      label: tab.label,
      icon: tab.icon,
      metric: m?.metric ?? tab.description ?? "Відкрити розділ",
      sub: m?.sub,
    });
  }
  return [...buckets.values()].sort(
    (a, b) => GROUP_META[a.id as GroupKey].order - GROUP_META[b.id as GroupKey].order,
  );
}

export function buildOperationsLauncherGroups(
  cabinetType: CabinetType,
  subtabs: OperationsSubTab[],
): LauncherShellGroup[] {
  const groupMap =
    cabinetType === "fop" || cabinetType === "fop-group"
      ? OPS_GROUP_FOP
      : OPS_GROUP_BUSINESS;
  return buildGroups(subtabs, groupMap, OPS_METRIC);
}

export function buildSettingsLauncherGroups(
  subtabs: SettingsSubTab[],
): LauncherShellGroup[] {
  return buildGroups(subtabs, SETTINGS_GROUP);
}
