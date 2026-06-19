// Phase 3 — § 14 КІК (Контрольовані іноземні компанії). Demo-only data.
// Models ownership chain, financials snapshot, deadlines, and review triggers.

export type KikJurisdiction = "EE" | "CY" | "AE" | "GB" | "DE" | "PL" | "BVI" | "US" | "CZ" | "LT";

export type KikStatus = "active" | "dormant" | "in_liquidation" | "liquidated";
export type KikReportingStatus =
  | "draft"
  | "ready"
  | "submitted_kik_report"
  | "submitted_with_declaration"
  | "exempt";

export interface KikOwnerNode {
  id: string;
  name: string;
  type: "individual" | "legal";
  share: number; // % at this level
  jurisdiction?: KikJurisdiction;
  isOwnerSelf?: boolean;
  children?: KikOwnerNode[];
}

export interface KikDeadline {
  id: string;
  label: string;
  dueDate: string; // ISO
  kind: "kik_report" | "declaration_addon" | "financial_report" | "audit";
  status: "upcoming" | "due_soon" | "overdue" | "done";
}

export interface KikFinancials {
  currency: string;
  revenue: number;
  netProfit: number;
  adjustedProfit: number; // ст. 39².3 ПКУ — скоригований прибуток
  effectiveTaxRate: number; // local tax %
  exemptUnderTreaty?: boolean;
  exemptionReason?: string;
}

export interface KikEntity {
  id: string;
  cabinetId: string;
  name: string;
  legalForm: string;
  jurisdiction: KikJurisdiction;
  registrationNumber: string;
  incorporatedAt: string;
  status: KikStatus;
  reportingStatus: KikReportingStatus;
  controlShare: number; // effective share of self
  controlType: "direct" | "indirect" | "actual";
  reportingYear: number;
  ownership: KikOwnerNode; // root node (the КІК itself with chain upstream)
  financials: KikFinancials;
  deadlines: KikDeadline[];
  reviewRequired: boolean;
  reviewReason?: string;
  notes?: string;
}

export const JURISDICTION_LABELS: Record<KikJurisdiction, string> = {
  EE: "🇪🇪 Естонія",
  CY: "🇨🇾 Кіпр",
  AE: "🇦🇪 ОАЕ",
  GB: "🇬🇧 Велика Британія",
  DE: "🇩🇪 Німеччина",
  PL: "🇵🇱 Польща",
  BVI: "🇻🇬 BVI",
  US: "🇺🇸 США",
  CZ: "🇨🇿 Чехія",
  LT: "🇱🇹 Литва",
};

export const KIK_STATUS_LABELS: Record<KikStatus, string> = {
  active: "Активна",
  dormant: "Не веде діяльність",
  in_liquidation: "У ліквідації",
  liquidated: "Ліквідована",
};

export const KIK_REPORTING_STATUS_LABELS: Record<KikReportingStatus, string> = {
  draft: "Чернетка звіту",
  ready: "Готовий до подання",
  submitted_kik_report: "Звіт КІК подано",
  submitted_with_declaration: "Подано з декларацією",
  exempt: "Звільнено від звітування",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function chainDepth(node: KikOwnerNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(chainDepth));
}

export function effectiveShare(node: KikOwnerNode): number {
  // Walk down the tree multiplying shares to find self's effective control
  function walk(n: KikOwnerNode, acc: number): number {
    if (n.isOwnerSelf) return acc * (n.share / 100);
    if (!n.children) return 0;
    return n.children.reduce((max, c) => Math.max(max, walk(c, acc * (n.share / 100))), 0);
  }
  // Root is the KIK itself with share=100
  if (!node.children) return 0;
  return node.children.reduce((max, c) => Math.max(max, walk(c, 1)), 0) * 100;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

export const demoKikEntities: KikEntity[] = [
  {
    id: "kik-ee-1",
    cabinetId: "individual",
    name: "Northwave OÜ",
    legalForm: "OÜ (Osaühing)",
    jurisdiction: "EE",
    registrationNumber: "14782301",
    incorporatedAt: "2021-06-12",
    status: "active",
    reportingStatus: "draft",
    controlShare: 75,
    controlType: "direct",
    reportingYear: 2025,
    ownership: {
      id: "n0",
      name: "Northwave OÜ",
      type: "legal",
      share: 100,
      jurisdiction: "EE",
      children: [
        { id: "n1", name: "Власник (ви)", type: "individual", share: 75, isOwnerSelf: true },
        { id: "n2", name: "Tarmo Kask", type: "individual", share: 25 },
      ],
    },
    financials: {
      currency: "EUR",
      revenue: 412_000,
      netProfit: 184_500,
      adjustedProfit: 192_300,
      effectiveTaxRate: 0,
      exemptUnderTreaty: false,
    },
    deadlines: [
      { id: "d1", label: "Звіт про КІК за 2025", dueDate: "2026-05-01", kind: "kik_report", status: "due_soon" },
      { id: "d2", label: "Фінансова звітність OÜ", dueDate: "2026-06-30", kind: "financial_report", status: "upcoming" },
      { id: "d3", label: "Подання з декларацією", dueDate: "2026-05-01", kind: "declaration_addon", status: "due_soon" },
    ],
    reviewRequired: false,
    notes: "Прямий контроль 75% — ланцюг 1 рівень, без проміжних структур.",
  },
  {
    id: "kik-cy-bvi",
    cabinetId: "individual",
    name: "Sapphire Holdings Ltd",
    legalForm: "Limited",
    jurisdiction: "CY",
    registrationNumber: "HE 412903",
    incorporatedAt: "2019-03-22",
    status: "active",
    reportingStatus: "draft",
    controlShare: 51,
    controlType: "indirect",
    reportingYear: 2025,
    ownership: {
      id: "r0",
      name: "Sapphire Holdings Ltd",
      type: "legal",
      share: 100,
      jurisdiction: "CY",
      children: [
        {
          id: "r1",
          name: "Atlas Capital Inc",
          type: "legal",
          share: 100,
          jurisdiction: "BVI",
          children: [
            { id: "r2", name: "Власник (ви)", type: "individual", share: 51, isOwnerSelf: true },
            { id: "r3", name: "Mark Doyle", type: "individual", share: 49 },
          ],
        },
      ],
    },
    financials: {
      currency: "USD",
      revenue: 2_140_000,
      netProfit: 612_000,
      adjustedProfit: 658_400,
      effectiveTaxRate: 12.5,
      exemptUnderTreaty: false,
    },
    deadlines: [
      { id: "e1", label: "Звіт про КІК за 2025", dueDate: "2026-05-01", kind: "kik_report", status: "due_soon" },
      { id: "e2", label: "Аудиторський висновок", dueDate: "2026-04-15", kind: "audit", status: "due_soon" },
      { id: "e3", label: "Фінансова звітність CY", dueDate: "2026-06-30", kind: "financial_report", status: "upcoming" },
    ],
    reviewRequired: true,
    reviewReason:
      "Структура власності 2 рівні (BVI → Cyprus). Юрисдикція BVI — низькоподаткова. Потрібна перевірка джерел доходу та застосування звільнень.",
  },
  {
    id: "kik-ae-dormant",
    cabinetId: "individual",
    name: "Dune Trade FZ-LLC",
    legalForm: "Free Zone LLC",
    jurisdiction: "AE",
    registrationNumber: "FZE-92831",
    incorporatedAt: "2022-11-05",
    status: "dormant",
    reportingStatus: "exempt",
    controlShare: 100,
    controlType: "direct",
    reportingYear: 2025,
    ownership: {
      id: "a0",
      name: "Dune Trade FZ-LLC",
      type: "legal",
      share: 100,
      jurisdiction: "AE",
      children: [
        { id: "a1", name: "Власник (ви)", type: "individual", share: 100, isOwnerSelf: true },
      ],
    },
    financials: {
      currency: "AED",
      revenue: 0,
      netProfit: 0,
      adjustedProfit: 0,
      effectiveTaxRate: 9,
      exemptUnderTreaty: true,
      exemptionReason: "Дохід <2 млн €, відсутність діяльності — звільнення за пп. 392.4.1 ПКУ.",
    },
    deadlines: [
      { id: "f1", label: "Скорочений звіт КІК", dueDate: "2026-05-01", kind: "kik_report", status: "due_soon" },
    ],
    reviewRequired: false,
    notes: "Компанія не вела діяльність — подається скорочений звіт.",
  },
];

export const getKikEntitiesForCabinet = (cabinetId: string) =>
  demoKikEntities.filter((k) => k.cabinetId === cabinetId);

export const getKikEntityById = (id: string) =>
  demoKikEntities.find((k) => k.id === id);
