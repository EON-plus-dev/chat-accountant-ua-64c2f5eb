/**
 * Capability resolver — визначає, чи активувати CRM/Tasks-модулі у кабінеті
 * і який preset застосувати.
 *
 * Cabinet-agnostic: ТОВ Fintodo → SaaS preset, ТОВ-торгівля → B2B,
 * бюро → bureau, ФОП-послуги → b2b_trade (без SaaS-метрик),
 * фізособа → personal (тільки особисті задачі, CRM прихований).
 */

import type { Cabinet } from "@/types/cabinet";
import type { CrmCapability } from "./crm/types";
import type { TasksCapability } from "./tasks/types";

interface ResolveOptions {
  /** Кількість учасників кабінету (з useCabinetMembers). Використовується для tasks-логіки. */
  memberCount?: number;
}

// ──────────────────────────── CRM ────────────────────────────

export function resolveCrmCapability(
  cabinet: Cabinet | null | undefined,
  _opts: ResolveOptions = {},
): CrmCapability {
  if (!cabinet) {
    return { enabled: false, presetId: "saas" };
  }

  // Фізособи: CRM прихований за замовчуванням
  if (cabinet.type === "individual") {
    return { enabled: false, presetId: "personal" };
  }

  // SaaS-капабіліті — повний CRM з SaaS-пресетом
  if (cabinet.capabilities?.includes("saas_business")) {
    return { enabled: true, presetId: "saas", reason: "saas_business" };
  }

  // Бухгалтерські бюро — за industry "consulting" + role "accountant" / бюро-маркером
  // Поки що — простий хінт через industry
  if (cabinet.industry === "consulting" && cabinet.role === "accountant") {
    return { enabled: true, presetId: "bureau", reason: "default_b2b" };
  }

  // ТОВ-торгівля / послуги
  if (cabinet.type === "tov") {
    if (cabinet.industry === "trade") {
      return { enabled: true, presetId: "b2b_trade", reason: "default_b2b" };
    }
    return { enabled: true, presetId: "b2b_trade", reason: "default_b2b" };
  }

  // ФОП: CRM-lite через b2b_trade-пресет (опційно, лише якщо явно увімкнено)
  if (cabinet.type === "fop") {
    return { enabled: false, presetId: "b2b_trade" };
  }

  return { enabled: false, presetId: "saas" };
}

// ──────────────────────────── Tasks ────────────────────────────

export function resolveTasksCapability(
  cabinet: Cabinet | null | undefined,
  opts: ResolveOptions = {},
): TasksCapability {
  if (!cabinet) {
    return { enabled: false, presetId: "personal" };
  }

  const memberCount = opts.memberCount ?? 0;
  const hasEmployees = cabinet.hasEmployees === true;

  // Фізособа — лише personal
  if (cabinet.type === "individual") {
    return { enabled: true, presetId: "personal", reason: "solo_personal" };
  }

  // SaaS-кабінет — dev_team preset
  if (cabinet.capabilities?.includes("saas_business")) {
    return { enabled: true, presetId: "dev_team", reason: "employees" };
  }

  // Бухгалтерське бюро
  if (cabinet.industry === "consulting" && cabinet.role === "accountant") {
    return { enabled: true, presetId: "accounting_firm", reason: "employees" };
  }

  // ТОВ без явного employees — sales_ops як default для бізнесу
  if (cabinet.type === "tov") {
    if (hasEmployees || memberCount > 1) {
      return { enabled: true, presetId: "sales_ops", reason: "employees" };
    }
    return { enabled: true, presetId: "sales_ops", reason: "multi_member" };
  }

  // ФОП: якщо є наймані → accounting_firm-lite, інакше personal
  if (cabinet.type === "fop") {
    if (hasEmployees || memberCount > 1) {
      return { enabled: true, presetId: "accounting_firm", reason: "employees" };
    }
    return { enabled: true, presetId: "personal", reason: "solo_personal" };
  }

  return { enabled: true, presetId: "personal", reason: "default" };
}
