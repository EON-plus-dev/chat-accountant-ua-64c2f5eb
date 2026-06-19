import type { SignatureAuditEntry } from "@/hooks/useSignatureAuditLog";

export interface DemoSignatureAuditEntry extends SignatureAuditEntry {
  actor_name: string;
}

const DAY = 24 * 60 * 60 * 1000;

function ts(daysAgo: number, hours = 10, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function entry(
  id: string,
  daysAgo: number,
  hour: number,
  action: SignatureAuditEntry["action"],
  actorName: string,
  details: Record<string, unknown>,
  reqId: string,
  ip = "192.168.1.42",
): DemoSignatureAuditEntry {
  return {
    id,
    cabinet_id: null,
    signature_request_id: reqId,
    actor_user_id: "demo-" + id,
    actor_name: actorName,
    action,
    details,
    ip_address: ip,
    user_agent: "Mozilla/5.0 (Demo)",
    created_at: ts(daysAgo, hour, Math.floor(Math.random() * 60)),
  };
}

export function getSignatureAuditLogForCabinet(_cabinetId: string): DemoSignatureAuditEntry[] {
  return [
    // Звичайний потік: інвойс
    entry("e01", 1, 14, "init", "Коваленко Марія Дмитрівна", {
      document_kind: "invoice",
      document_id: "INV-2026-0142",
      amount_uah: 48500,
      provider: "mock",
    }, "req-001"),
    entry("e02", 1, 14, "callback", "Коваленко Марія Дмитрівна", {
      document_kind: "invoice",
      document_id: "INV-2026-0142",
      provider: "mock",
      status: "confirmed",
    }, "req-001"),
    entry("e03", 1, 14, "signed", "Коваленко Марія Дмитрівна", {
      document_kind: "invoice",
      document_id: "INV-2026-0142",
      amount_uah: 48500,
      signer_role: "Бухгалтер",
      is_auto_sign: false,
    }, "req-001"),

    // Договір — підпис директором
    entry("e04", 2, 11, "init", "Шевченко Тарас Григорович", {
      document_kind: "contract",
      document_id: "CTR-2026-007",
      counterparty: "ТОВ «Альфа-Сервіс»",
    }, "req-002"),
    entry("e05", 2, 11, "signed", "Шевченко Тарас Григорович", {
      document_kind: "contract",
      document_id: "CTR-2026-007",
      signer_role: "Директор",
      is_auto_sign: false,
    }, "req-002"),

    // Авто-підпис: акт виконаних робіт (правило)
    entry("e06", 3, 9, "auto_sign_executed", "Система (auto-sign)", {
      document_kind: "act",
      document_id: "ACT-2026-031",
      amount_uah: 12300,
      auto_rule_id: "rule-acts-under-15k",
      reviewer: "Петренко Ігор Васильович",
      is_auto_sign: true,
    }, "req-003"),

    // Авто-підпис: податкова декларація 1ДФ
    entry("e07", 5, 8, "auto_sign_executed", "Система (auto-sign)", {
      document_kind: "declaration",
      document_id: "1DF-Q1-2026",
      auto_rule_id: "rule-1df-quarterly",
      reviewer: "Коваленко Марія Дмитрівна",
      is_auto_sign: true,
    }, "req-004"),

    // Скасування
    entry("e08", 6, 16, "init", "Бондаренко Анна Сергіївна", {
      document_kind: "invoice",
      document_id: "INV-2026-0138",
      amount_uah: 215000,
    }, "req-005"),
    entry("e09", 6, 16, "cancel", "Бондаренко Анна Сергіївна", {
      document_kind: "invoice",
      document_id: "INV-2026-0138",
      reason: "Помилка в реквізитах контрагента",
    }, "req-005"),

    // Зміна правил автопідпису
    entry("e10", 8, 12, "rule_changed", "Шевченко Тарас Григорович", {
      auto_rule_id: "rule-acts-under-15k",
      change: "max_amount_uah: 10000 → 15000",
      requires_trusted_review: true,
    }, null as unknown as string),

    // Декларація ПДВ — двоступенева
    entry("e11", 12, 10, "init", "Коваленко Марія Дмитрівна", {
      document_kind: "declaration",
      document_id: "PDV-03-2026",
      provider: "diia",
    }, "req-006"),
    entry("e12", 12, 11, "signed", "Шевченко Тарас Григорович", {
      document_kind: "declaration",
      document_id: "PDV-03-2026",
      signer_role: "Директор",
      is_auto_sign: false,
      provider: "diia",
    }, "req-006"),
  ];
}

export const ACTOR_NAME_MAP: Record<string, string> = {};
