/**
 * SALON-MASTER DELEGATIONS (demo, TS-only)
 *
 * Демо-моделювання `delegation_contracts` + `direct_delegations` для майстрів
 * салону `demo-salon-3`. Жодних DB-міграцій — тільки TS-конфіги.
 *
 * АРХІТЕКТУРНЕ ПРАВИЛО (див. mem://architecture/cabinets-ownership-and-access-model-uk):
 *   Staff-майстер ≠ член кабінету салону. Він — фізособа з власним ІПН і власним
 *   `individual` кабінетом, який ОТРИМУЄ ДОСТУП до календаря салону через
 *   `delegation_contract` з `contract_kind="employment"`.
 *   FOP-майстер — фізособа з `individual` + `fop` кабінетами, делегація з
 *   `contract_kind="services"` і `terms.kind` ∈ {revenue_split, workspace_rental, hybrid}.
 *
 * Жодних змін у RLS не потрібно — діє існуючий `has_effective_access`.
 */

export type SalonMasterContractKind = "employment" | "services";

export type SalonMasterTerms =
  | {
      kind: "employment";
      position: string;
      salary_uah: number;
      schedule?: string;
      workstation_ids?: string[];
    }
  | {
      kind: "revenue_split";
      commission_pct: number;
      payout_period: "per_visit" | "weekly" | "monthly";
      noshow_policy?: "client_pays" | "salon_pays" | "master_pays";
    }
  | {
      kind: "workspace_rental";
      rent_period: "shift" | "day" | "month";
      rent_amount: number;
      workstation_ids: string[];
      noshow_policy?: "salon_pays" | "master_pays";
    }
  | {
      kind: "hybrid";
      commission_pct: number;
      rent_period: "shift" | "day" | "month";
      rent_amount: number;
      workstation_ids: string[];
    };

export type SalonMasterPermission =
  | "bookings:read_own"
  | "schedule:read_own"
  | "clients:read_during_visit"
  | "workstation:book"
  | "invoices:read_own";

export interface SalonMasterDelegationContract {
  id: string;
  /** Кабінет салону (cabinet-owner у термінах `delegation_contracts`). */
  salonCabinetId: string;
  /** Кабінет майстра-делегата (фізособа = `individual`). */
  masterCabinetId: string;
  /** Локальний ID майстра в `salonMasters`. */
  masterId: string;
  contract_kind: SalonMasterContractKind;
  contract_number: string;
  status: "active" | "pending_sign" | "terminated";
  valid_from: string; // ISO
  valid_until?: string;
  terms: SalonMasterTerms;
  granted_permissions: SalonMasterPermission[];
  /** Хто платить за AI-операції майстра під час роботи в цьому салоні. */
  billing_payer: "cabinet_owner" | "delegate";
  signed_at?: string;
}

/**
 * Запрошення майстра в систему (для FOP, що ще не зареєстрував свій `individual` кабінет).
 * Моделює `cabinet_invitations` без `direct_delegations`.
 */
export interface SalonMasterInvitation {
  id: string;
  salonCabinetId: string;
  masterId: string;
  invitedEmail: string;
  status: "pending" | "expired";
  invitedAt: string;
  proposedContractKind: SalonMasterContractKind;
}

// ============================================
// DEMO SEED для demo-salon-3
// ============================================

const SALON = "demo-salon-3";

/** 3 staff + 2 зареєстровані FOP = 5 активних делегацій. */
export const salonMasterDelegations: SalonMasterDelegationContract[] = [
  // === STAFF: трудові договори ===
  {
    id: "dc-salon-m-s-1",
    salonCabinetId: SALON,
    masterCabinetId: "ind-master-s-1",
    masterId: "m-s-1",
    contract_kind: "employment",
    contract_number: "ТД-2025-001",
    status: "active",
    valid_from: "2024-01-15",
    terms: {
      kind: "employment",
      position: "Старший стиліст · керівник зміни",
      salary_uah: 28000,
      schedule: "пн–сб 9:00–19:00",
      workstation_ids: ["ws-h-1"],
    },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner",
    signed_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "dc-salon-m-s-2",
    salonCabinetId: SALON,
    masterCabinetId: "ind-master-s-2",
    masterId: "m-s-2",
    contract_kind: "employment",
    contract_number: "ТД-2025-002",
    status: "active",
    valid_from: "2024-03-01",
    terms: {
      kind: "employment",
      position: "Майстриня манікюру",
      salary_uah: 22000,
      schedule: "вт–сб 10:00–20:00",
      workstation_ids: ["ws-n-1"],
    },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner",
    signed_at: "2024-03-01T10:00:00Z",
  },
  {
    id: "dc-salon-m-s-3",
    salonCabinetId: SALON,
    masterCabinetId: "ind-master-s-3",
    masterId: "m-s-3",
    contract_kind: "employment",
    contract_number: "ТД-2025-003",
    status: "active",
    valid_from: "2023-09-10",
    terms: {
      kind: "employment",
      position: "Масажист-реабілітолог",
      salary_uah: 32000,
      schedule: "пн, ср, пт, сб 11:00–21:00",
      workstation_ids: ["ws-m-1"],
    },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner",
    signed_at: "2023-09-10T10:00:00Z",
  },
  // === FOP (зареєстровані): m-f-1 (revenue_split), m-f-7 (workspace_rental) ===
  {
    id: "dc-salon-m-f-1",
    salonCabinetId: SALON,
    masterCabinetId: "ind-master-f-1",
    masterId: "m-f-1",
    contract_kind: "services",
    contract_number: "ДП-2025-014",
    status: "active",
    valid_from: "2024-02-01",
    terms: {
      kind: "revenue_split",
      commission_pct: 55,
      payout_period: "weekly",
      noshow_policy: "salon_pays",
    },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "delegate",
    signed_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "dc-salon-m-f-7",
    salonCabinetId: SALON,
    masterCabinetId: "ind-master-f-7",
    masterId: "m-f-7",
    contract_kind: "services",
    contract_number: "ДП-2025-021",
    status: "active",
    valid_from: "2024-05-15",
    terms: {
      kind: "workspace_rental",
      rent_period: "month",
      rent_amount: 12000,
      workstation_ids: ["ws-m-1"],
      noshow_policy: "master_pays",
    },
    granted_permissions: [
      "bookings:read_own",
      "schedule:read_own",
      "workstation:book",
      "invoices:read_own",
    ],
    billing_payer: "delegate",
    signed_at: "2024-05-15T10:00:00Z",
  },
  // === TENNIS CLUB (demo-tennis-3): 3 staff + 2 fop ===
  {
    id: "dc-tennis-tc-m-1",
    salonCabinetId: "demo-tennis-3",
    masterCabinetId: "ind-coach-1",
    masterId: "tc-m-1",
    contract_kind: "employment",
    contract_number: "ТД-2023-T1",
    status: "active",
    valid_from: "2023-04-01",
    terms: { kind: "employment", position: "Головний тренер", salary_uah: 28000, schedule: "Вт–Нд 7:00–21:00 (плаваюча)" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner",
    signed_at: "2023-04-01T10:00:00Z",
  },
  {
    id: "dc-tennis-tc-m-2",
    salonCabinetId: "demo-tennis-3",
    masterCabinetId: "ind-coach-2",
    masterId: "tc-m-2",
    contract_kind: "employment",
    contract_number: "ТД-2024-T2",
    status: "active",
    valid_from: "2024-01-15",
    terms: { kind: "employment", position: "Тренер дитячої академії", salary_uah: 22000, schedule: "Пн–Пт 9:00–19:00" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner",
    signed_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "dc-tennis-tc-m-3",
    salonCabinetId: "demo-tennis-3",
    masterCabinetId: "ind-coach-3",
    masterId: "tc-m-3",
    contract_kind: "employment",
    contract_number: "ТД-2024-T3",
    status: "active",
    valid_from: "2024-09-01",
    terms: { kind: "employment", position: "Тренер фізпідготовки", salary_uah: 18000, schedule: "Вт–Сб 11:00–21:00" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner",
    signed_at: "2024-09-01T10:00:00Z",
  },
  {
    id: "dc-tennis-tc-m-4",
    salonCabinetId: "demo-tennis-3",
    masterCabinetId: "ind-coach-4",
    masterId: "tc-m-4",
    contract_kind: "services",
    contract_number: "ЦПХ-2026-T001",
    status: "active",
    valid_from: "2024-04-01",
    terms: { kind: "revenue_split", commission_pct: 55, payout_period: "weekly", noshow_policy: "salon_pays" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "delegate",
    signed_at: "2024-04-01T10:00:00Z",
  },
  {
    id: "dc-tennis-tc-m-5",
    salonCabinetId: "demo-tennis-3",
    masterCabinetId: "ind-coach-5",
    masterId: "tc-m-5",
    contract_kind: "services",
    contract_number: "ЦПХ-2026-T002",
    status: "active",
    valid_from: "2024-06-15",
    terms: { kind: "revenue_split", commission_pct: 55, payout_period: "weekly", noshow_policy: "salon_pays" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "delegate",
    signed_at: "2024-06-15T10:00:00Z",
  },
  // === RESTAURANT (demo-restaurant-3): 6 staff + 3 fop ===
  {
    id: "dc-rest-chef-1", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-chef-1",
    masterId: "rs-chef-1", contract_kind: "employment", contract_number: "ТД-2023-R1",
    status: "active", valid_from: "2023-03-01",
    terms: { kind: "employment", position: "Шеф-кухар", salary_uah: 42000, schedule: "Вт–Сб 10:00–23:00" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner", signed_at: "2023-03-01T10:00:00Z",
  },
  {
    id: "dc-rest-chef-2", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-chef-2",
    masterId: "rs-chef-2", contract_kind: "employment", contract_number: "ТД-2023-R2",
    status: "active", valid_from: "2023-05-15",
    terms: { kind: "employment", position: "Су-шеф (гаряча кухня)", salary_uah: 28000, schedule: "Пн–Нд 9:00–22:00 (плаваюча)" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner", signed_at: "2023-05-15T10:00:00Z",
  },
  {
    id: "dc-rest-chef-3", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-chef-3",
    masterId: "rs-chef-3", contract_kind: "services", contract_number: "ЦПХ-2026-R001",
    status: "active", valid_from: "2024-01-15",
    terms: { kind: "revenue_split", commission_pct: 0, payout_period: "monthly", noshow_policy: "salon_pays" },
    granted_permissions: ["bookings:read_own", "schedule:read_own"],
    billing_payer: "delegate", signed_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "dc-rest-wait-1", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-waiter-1",
    masterId: "rs-wait-1", contract_kind: "employment", contract_number: "ТД-2024-R3",
    status: "active", valid_from: "2024-02-01",
    terms: { kind: "employment", position: "Старший офіціант", salary_uah: 18000, schedule: "Вт–Нд 11:00–23:00" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner", signed_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "dc-rest-wait-2", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-waiter-2",
    masterId: "rs-wait-2", contract_kind: "employment", contract_number: "ТД-2024-R4",
    status: "active", valid_from: "2024-06-01",
    terms: { kind: "employment", position: "Офіціант", salary_uah: 14000, schedule: "Пн–Сб 10:00–22:00" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner", signed_at: "2024-06-01T10:00:00Z",
  },
  {
    id: "dc-rest-wait-3", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-waiter-3",
    masterId: "rs-wait-3", contract_kind: "services", contract_number: "ЦПХ-2026-R002",
    status: "active", valid_from: "2024-03-01",
    terms: { kind: "revenue_split", commission_pct: 10, payout_period: "weekly", noshow_policy: "salon_pays" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "delegate", signed_at: "2024-03-01T10:00:00Z",
  },
  {
    id: "dc-rest-wait-4", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-waiter-4",
    masterId: "rs-wait-4", contract_kind: "services", contract_number: "ЦПХ-2026-R003",
    status: "active", valid_from: "2024-05-15",
    terms: { kind: "revenue_split", commission_pct: 10, payout_period: "weekly", noshow_policy: "salon_pays" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "delegate", signed_at: "2024-05-15T10:00:00Z",
  },
  {
    id: "dc-rest-mgr-1", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-mgr-1",
    masterId: "rs-mgr-1", contract_kind: "employment", contract_number: "ТД-2023-R5",
    status: "active", valid_from: "2023-09-01",
    terms: { kind: "employment", position: "Хост-менеджер залу", salary_uah: 22000, schedule: "Пн–Пт 10:00–19:00" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner", signed_at: "2023-09-01T10:00:00Z",
  },
  {
    id: "dc-rest-mgr-2", salonCabinetId: "demo-restaurant-3", masterCabinetId: "ind-mgr-2",
    masterId: "rs-mgr-2", contract_kind: "employment", contract_number: "ТД-2023-R6",
    status: "active", valid_from: "2023-04-10",
    terms: { kind: "employment", position: "Менеджер вечірньої зміни", salary_uah: 24000, schedule: "Вт–Нд 14:00–23:00" },
    granted_permissions: ["bookings:read_own", "schedule:read_own", "clients:read_during_visit"],
    billing_payer: "cabinet_owner", signed_at: "2023-04-10T10:00:00Z",
  },
];

/** 5 ФОП-майстрів, які ще не прийняли запрошення. */
export const salonMasterInvitations: SalonMasterInvitation[] = [
  { id: "inv-m-f-2", salonCabinetId: SALON, masterId: "m-f-2", invitedEmail: "marina.kovalchuk@example.com", status: "pending", invitedAt: "2025-11-01T10:00:00Z", proposedContractKind: "services" },
  { id: "inv-m-f-3", salonCabinetId: SALON, masterId: "m-f-3", invitedEmail: "yulia.melnyk@example.com", status: "pending", invitedAt: "2025-11-05T10:00:00Z", proposedContractKind: "services" },
  { id: "inv-m-f-4", salonCabinetId: SALON, masterId: "m-f-4", invitedEmail: "oleksandr.zaytsev@example.com", status: "pending", invitedAt: "2025-12-01T10:00:00Z", proposedContractKind: "services" },
  { id: "inv-m-f-5", salonCabinetId: SALON, masterId: "m-f-5", invitedEmail: "tetyana.shevchuk@example.com", status: "pending", invitedAt: "2026-01-10T10:00:00Z", proposedContractKind: "services" },
  { id: "inv-m-f-6", salonCabinetId: SALON, masterId: "m-f-6", invitedEmail: "kateryna.polishchuk@example.com", status: "pending", invitedAt: "2026-02-15T10:00:00Z", proposedContractKind: "services" },
];

// ============================================
// SELECTORS
// ============================================

export function getDelegationsForSalon(salonCabinetId: string) {
  return salonMasterDelegations.filter((d) => d.salonCabinetId === salonCabinetId && d.status === "active");
}

export function getDelegationsForMaster(masterCabinetId: string) {
  return salonMasterDelegations.filter((d) => d.masterCabinetId === masterCabinetId && d.status === "active");
}

/**
 * Універсальний пошук активних делегацій для будь-якого кабінету майстра —
 * як `individual` (masterCabinetId), так і `fop` (через `salonMasters[].fopCabinetId`).
 * Використовується для capabilities і `useMasterDiary`, щоб ФОП-кабінет
 * майстра бачив той самий Щоденник, що і його `individual` кабінет.
 */
import { salonMasters } from "@/config/demoCabinets/salonData";
import { tennisCoaches } from "@/config/demoCabinets/tennisData";
import { restaurantStaff } from "@/config/demoCabinets/restaurantData";

export function getDelegationsForMasterCabinet(cabinetId: string) {
  const direct = getDelegationsForMaster(cabinetId);
  if (direct.length > 0) return direct;
  const allMasters = [...salonMasters, ...tennisCoaches, ...restaurantStaff];
  const masterIds = allMasters
    .filter((m) => m.fopCabinetId === cabinetId || m.masterCabinetId === cabinetId)
    .map((m) => m.id);
  if (masterIds.length === 0) return [];
  return salonMasterDelegations.filter(
    (d) => masterIds.includes(d.masterId) && d.status === "active",
  );
}

export function getActiveDelegationByMasterId(masterId: string) {
  return salonMasterDelegations.find((d) => d.masterId === masterId && d.status === "active");
}

export function getInvitationsForSalon(salonCabinetId: string) {
  return salonMasterInvitations.filter((i) => i.salonCabinetId === salonCabinetId && i.status === "pending");
}

/** Чи може цей FOP-майстер приймати прямі бронювання через персональний віджет у конкретному салоні? */
export function canMasterAcceptDirectBookings(masterId: string): boolean {
  const d = getActiveDelegationByMasterId(masterId);
  if (!d || d.contract_kind !== "services") return false;
  return d.terms.kind === "workspace_rental" || d.terms.kind === "hybrid";
}
