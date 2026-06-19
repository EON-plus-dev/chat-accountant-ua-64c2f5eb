/**
 * Adapters that project existing directory data sources into the unified
 * `DirectoryEntry` contract from ./directoryTypes.
 *
 * Goal: a single shape for AI serialization, sitemaps, and SEO/JSON-LD generation
 * without rewriting hundreds of lines of source data. New directories should be
 * authored in `DirectoryEntry` form directly; legacy ones go through these adapters.
 */

import type { PenaltyEntry } from "@/portal/data/penalties";
import type { LawEntry } from "@/portal/data/laws";
import type { KvedEntry } from "@/portal/data/kved";
import type { GrantEntry } from "@/portal/data/grants";
import type { LicenseEntry } from "@/portal/data/licenses";
import type { StateRegister } from "@/portal/data/registers";
import type { DocumentTemplate } from "@/portal/data/templates";
import type { BusinessForm } from "@/portal/data/businessForms";
import type { KnowledgeEntry } from "@/portal/data/knowledge";
import type { RateTable } from "@/portal/data/rates";
import type { AccountantProfile } from "@/portal/data/accountants";
import type { Deadline } from "@/portal/data/deadlines";
import type { CourtCaseEntry } from "@/portal/data/courtCases";
import type { ClarificationEntry } from "@/portal/data/taxClarifications";
import type { AgencyEntry } from "@/portal/data/agencies";
import type { BudgetAccountEntry } from "@/portal/data/budgetAccounts";
import type { AtskEntry } from "@/portal/data/atskProviders";
import type { KatottgEntry } from "@/portal/data/katottg";
import type { ProfesiaEntry } from "@/portal/data/profesii";
import type { PlanRakhunkuEntry } from "@/portal/data/planRakhunkiv";
import type { UktZedEntry } from "@/portal/data/uktZed";
import type { ViyskovyyEntry } from "@/portal/data/viyskovyyOblik";
import type { PdvPilhaEntry } from "@/portal/data/pdvPilhy";

import { PENALTIES } from "@/portal/data/penalties";
import { LAWS, LAW_CATEGORY_MAP, LAW_TYPE_MAP } from "@/portal/data/laws";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { GRANTS } from "@/portal/data/grants";
import { LICENSES } from "@/portal/data/licenses";
import { REGISTERS } from "@/portal/data/registers";
import { TEMPLATES } from "@/portal/data/templates";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { RATE_TABLES } from "@/portal/data/rates";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { DEADLINES } from "@/portal/data/deadlines";
import { COURT_CASES, COURT_TOPIC_LABEL } from "@/portal/data/courtCases";
import {
  CLARIFICATIONS,
  CLARIFICATION_KIND_FULL_LABEL,
  CLARIFICATION_TOPIC_LABEL,
} from "@/portal/data/taxClarifications";
import { AGENCIES, AGENCY_CATEGORY_LABEL } from "@/portal/data/agencies";
import {
  BUDGET_ACCOUNTS,
  BUDGET_TAX_LABEL,
  BUDGET_REGION_LABEL,
} from "@/portal/data/budgetAccounts";
import { ATSK_PROVIDERS, ATSK_CATEGORY_LABEL } from "@/portal/data/atskProviders";
import { KATOTTG_ENTRIES, KATOTTG_LEVEL_LABEL } from "@/portal/data/katottg";
import { PROFESII, PROFESIA_SECTION_LABEL } from "@/portal/data/profesii";
import { PLAN_RAKHUNKIV, ACCOUNT_CLASS_LABEL, ACCOUNT_TYPE_LABEL } from "@/portal/data/planRakhunkiv";
import { UKT_ZED, UKT_SECTION_LABEL } from "@/portal/data/uktZed";
import { VIYSKOVYY_OBLIK, VIYSKOVYY_TOPIC_LABEL } from "@/portal/data/viyskovyyOblik";
import { PDV_PILHY, PDV_PILHA_TYPE_LABEL, PDV_SECTOR_LABEL } from "@/portal/data/pdvPilhy";

import type { DirectoryEntry, DirectoryCategory } from "./directoryTypes";
import { DIRECTORY_CATEGORY_LABEL } from "./directoryTypes";

const FALLBACK_AS_OF = "2026-04-01";

function audienceFrom<T extends { audience?: "business" | "personal" | "both" }>(p: T) {
  return p.audience;
}

function commonMeta(category: DirectoryCategory) {
  return { breadcrumbCategoryLabel: DIRECTORY_CATEGORY_LABEL[category] };
}

// ─── penalties ───────────────────────────────────────────────────────────────
export function penaltyToDirectoryEntry(p: PenaltyEntry): DirectoryEntry<PenaltyEntry> {
  return {
    id: p.id,
    slug: p.slug,
    category: "penalties",
    audience: p.audience,
    title: p.title,
    summary: p.description,
    payload: p,
    asOf: FALLBACK_AS_OF,
    source: p.legalBasis,
    sourceUrl: p.legalUrl,
    legalBasis: p.legalBasis,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: p.relatedToolId ? [p.relatedToolId] : undefined,
    faq: p.faq,
    seo: { title: p.seoTitle, description: p.seoDescription, keywords: p.seoKeywords },
    ...commonMeta("penalties"),
  };
}

// ─── laws ────────────────────────────────────────────────────────────────────
export function lawToDirectoryEntry(l: LawEntry): DirectoryEntry<LawEntry> {
  return {
    id: l.id,
    slug: l.slug,
    category: "laws",
    audience: l.audience,
    title: l.shortName,
    summary: l.description,
    payload: l,
    asOf: FALLBACK_AS_OF,
    effectiveFrom: l.effectiveDate,
    source: `${LAW_TYPE_MAP[l.type]} ${l.number} — ${l.fullName}`,
    sourceUrl: l.officialUrl,
    legalBasis: `${LAW_TYPE_MAP[l.type]} ${l.number} (${LAW_CATEGORY_MAP[l.category]})`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: l.relatedToolIds,
    faq: l.faq,
    seo: { title: l.seoTitle, description: l.seoDescription, keywords: l.seoKeywords },
    ...commonMeta("laws"),
  };
}

// ─── kved ────────────────────────────────────────────────────────────────────
export function kvedToDirectoryEntry(k: KvedEntry): DirectoryEntry<KvedEntry> {
  return {
    id: k.code,
    slug: k.code,
    category: "kved",
    audience: "business",
    title: `${k.code} — ${k.name}`,
    summary: k.description,
    payload: k,
    asOf: FALLBACK_AS_OF,
    source: "Класифікатор КВЕД ДК 009:2010",
    sourceUrl: "https://kved.ukrstat.gov.ua/",
    legalBasis: "ДК 009:2010 (наказ Держспоживстандарту № 457)",
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    faq: k.faq,
    seo: { title: k.seoTitle, description: k.seoDescription, keywords: k.seoKeywords },
    ...commonMeta("kved"),
  };
}

// ─── grants ──────────────────────────────────────────────────────────────────
export function grantToDirectoryEntry(g: GrantEntry): DirectoryEntry<GrantEntry> {
  return {
    id: g.id,
    slug: g.slug,
    category: "grants",
    audience: g.audience,
    title: g.name,
    summary: g.description,
    payload: g,
    asOf: FALLBACK_AS_OF,
    source: g.organization,
    sourceUrl: g.websiteUrl,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    faq: g.faq,
    seo: { title: g.seoTitle, description: g.seoDescription, keywords: g.seoKeywords },
    ...commonMeta("grants"),
  };
}

// ─── licenses ────────────────────────────────────────────────────────────────
export function licenseToDirectoryEntry(l: LicenseEntry): DirectoryEntry<LicenseEntry> {
  return {
    id: l.id,
    slug: l.slug,
    category: "licenses",
    audience: l.audience,
    title: l.name,
    summary: l.description,
    payload: l,
    asOf: FALLBACK_AS_OF,
    source: l.legalBasis,
    sourceUrl: l.legalUrl,
    legalBasis: l.legalBasis,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    faq: l.faq,
    seo: { title: l.seoTitle, description: l.seoDescription, keywords: l.seoKeywords },
    ...commonMeta("licenses"),
  };
}

// ─── registers ───────────────────────────────────────────────────────────────
export function registerToDirectoryEntry(r: StateRegister): DirectoryEntry<StateRegister> {
  return {
    id: r.id,
    slug: r.slug,
    category: "registers",
    audience: r.audience,
    title: r.name,
    summary: r.description,
    payload: r,
    asOf: FALLBACK_AS_OF,
    source: r.operator,
    sourceUrl: r.url,
    legalBasis: r.legalBasis,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    faq: r.faq,
    seo: { title: r.seoTitle, description: r.seoDescription, keywords: r.seoKeywords },
    ...commonMeta("registers"),
  };
}

// ─── templates ───────────────────────────────────────────────────────────────
export function templateToDirectoryEntry(t: DocumentTemplate): DirectoryEntry<DocumentTemplate> {
  return {
    id: t.id,
    slug: t.slug,
    category: "templates",
    audience: t.audience,
    title: t.name,
    summary: t.description,
    payload: t,
    asOf: FALLBACK_AS_OF,
    source: t.legalBasis ?? "FINTODO — редакція шаблонів",
    sourceUrl: "https://fintodo.com.ua/dovidnyky/templates",
    legalBasis: t.legalBasis,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    faq: t.faq,
    seo: { title: t.seoTitle, description: t.seoDescription, keywords: t.seoKeywords },
    ...commonMeta("templates"),
  };
}

// ─── businessForms ───────────────────────────────────────────────────────────
export function businessFormToDirectoryEntry(b: BusinessForm): DirectoryEntry<BusinessForm> {
  return {
    id: b.id,
    slug: b.slug,
    category: "businessForms",
    audience: "business",
    title: `${b.name} — ${b.fullName}`,
    summary: b.description,
    payload: b,
    asOf: FALLBACK_AS_OF,
    source: b.legalBasis ?? "Господарський кодекс України",
    sourceUrl: "https://zakon.rada.gov.ua/laws/show/436-15",
    legalBasis: b.legalBasis,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    faq: b.faq,
    seo: { title: b.seoTitle, description: b.seoDescription, keywords: b.seoKeywords },
    ...commonMeta("businessForms"),
  };
}

// ─── slovnyk (KnowledgeEntry) ────────────────────────────────────────────────
export function slovnykToDirectoryEntry(k: KnowledgeEntry): DirectoryEntry<KnowledgeEntry> {
  return {
    id: k.id,
    slug: k.slug,
    category: "slovnyk",
    title: k.term,
    summary: k.shortDefinition,
    payload: k,
    asOf: FALLBACK_AS_OF,
    source: "FINTODO — бухгалтерський словник",
    sourceUrl: `https://fintodo.com.ua/dovidnyky/slovnyk/${k.slug}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: k.relatedToolIds,
    faq: k.faq,
    seo: { title: k.seoTitle, description: k.seoDescription, keywords: k.seoKeywords },
    ...commonMeta("slovnyk"),
  };
}

// ─── stavky (RateTable) ──────────────────────────────────────────────────────
export function rateToDirectoryEntry(r: RateTable): DirectoryEntry<RateTable> {
  return {
    id: r.id,
    slug: r.slug,
    category: "stavky",
    title: r.name,
    summary: r.description,
    payload: r,
    asOf: FALLBACK_AS_OF,
    source: r.legalBasis ?? "FINTODO — реєстр ставок",
    sourceUrl: "https://fintodo.com.ua/dovidnyky/stavky",
    legalBasis: r.legalBasis,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    faq: r.faq,
    seo: { title: r.seoTitle, description: r.seoDescription, keywords: r.seoKeywords },
    ...commonMeta("stavky"),
  };
}

// ─── accountants ─────────────────────────────────────────────────────────────
export function accountantToDirectoryEntry(a: AccountantProfile): DirectoryEntry<AccountantProfile> {
  return {
    id: a.id,
    slug: a.slug,
    category: "accountants",
    audience: "business",
    title: a.name,
    summary: a.description,
    payload: a,
    asOf: FALLBACK_AS_OF,
    source: "FINTODO — каталог бухгалтерів-партнерів",
    sourceUrl: `https://fintodo.com.ua/dovidnyky/accountants/${a.slug}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    ...commonMeta("accountants"),
  };
}

// ─── calendar (Deadline) ─────────────────────────────────────────────────────
export function deadlineToDirectoryEntry(d: Deadline): DirectoryEntry<Deadline> {
  const slug = `${d.id}`;
  return {
    id: d.id,
    slug,
    category: "calendar",
    audience: d.taxType === "tov" ? "business" : d.taxType === "all" ? "both" : "business",
    title: d.title,
    summary: `${d.type === "payment" ? "Сплата" : "Звіт"} до ${d.date}. Штраф: ${d.penalty}`,
    payload: d,
    asOf: FALLBACK_AS_OF,
    effectiveFrom: d.date,
    source: d.legalBasis,
    sourceUrl: "https://zakon.rada.gov.ua/laws/show/2755-17",
    legalBasis: d.legalBasis,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    ...commonMeta("calendar"),
  };
}

// ─── sudy (CourtCaseEntry) ───────────────────────────────────────────────────
export function courtCaseToDirectoryEntry(c: CourtCaseEntry): DirectoryEntry<CourtCaseEntry> {
  const relatedEntryIds = [
    ...(c.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(c.relatedPenaltySlugs ?? []).map((s) => `penalties:${s}`),
    ...(c.relatedCaseSlugs ?? []),
  ];
  return {
    id: c.id,
    slug: c.slug,
    category: "sudy",
    audience: c.audience,
    title: c.title,
    summary: c.summary,
    payload: c,
    asOf: c.decisionDate,
    effectiveFrom: c.decisionDate,
    source: `${c.court} — справа № ${c.caseNumber}`,
    sourceUrl: c.registryUrl,
    legalBasis: `Рішення суду від ${c.decisionDate} у справі № ${c.caseNumber} (${COURT_TOPIC_LABEL[c.topic]})`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: c.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: c.faq,
    seo: { title: c.seoTitle, description: c.seoDescription, keywords: c.seoKeywords },
    ...commonMeta("sudy"),
  };
}

// ─── rozyasnennia (ClarificationEntry) ───────────────────────────────────────
export function clarificationToDirectoryEntry(
  c: ClarificationEntry,
): DirectoryEntry<ClarificationEntry> {
  const relatedEntryIds = [
    ...(c.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(c.relatedPenaltySlugs ?? []).map((s) => `penalties:${s}`),
    ...(c.relatedCaseSlugs ?? []).map((s) => `sudy:${s}`),
    ...(c.relatedClarificationSlugs ?? []).map((s) => `rozyasnennia:${s}`),
  ];
  return {
    id: c.id,
    slug: c.slug,
    category: "rozyasnennia",
    audience: c.audience,
    title: c.title,
    summary: c.summary,
    payload: c,
    asOf: c.docDate,
    effectiveFrom: c.docDate,
    effectiveTo: c.expiresAt,
    source: `${c.issuer} — ${c.docNumber}`,
    sourceUrl: c.sourceUrl,
    legalBasis: `${CLARIFICATION_KIND_FULL_LABEL[c.kind]} (${CLARIFICATION_TOPIC_LABEL[c.topic]})`,
    confidence: c.status === "active" ? "snapshot" : "estimate",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: c.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: c.faq,
    seo: { title: c.seoTitle, description: c.seoDescription, keywords: c.seoKeywords },
    ...commonMeta("rozyasnennia"),
  };
}

// ─── derzhorgany (AgencyEntry) ───────────────────────────────────────────────
export function agencyToDirectoryEntry(a: AgencyEntry): DirectoryEntry<AgencyEntry> {
  const relatedEntryIds = [
    ...(a.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(a.relatedPenaltySlugs ?? []).map((s) => `penalties:${s}`),
    ...(a.relatedClarificationSlugs ?? []).map((s) => `rozyasnennia:${s}`),
  ];
  return {
    id: a.id,
    slug: a.slug,
    category: "derzhorgany",
    audience: a.audience,
    title: `${a.shortName} — ${a.fullName}`,
    summary: a.summary,
    payload: a,
    asOf: FALLBACK_AS_OF,
    source: `${a.fullName} (офіційний сайт)`,
    sourceUrl: a.website,
    legalBasis: `Держорган — ${AGENCY_CATEGORY_LABEL[a.category]}${a.edrpou ? `, ЄДРПОУ ${a.edrpou}` : ""}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: a.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: a.faq,
    seo: { title: a.seoTitle, description: a.seoDescription, keywords: a.seoKeywords },
    ...commonMeta("derzhorgany"),
  };
}

// ─── biudzhetni-rakhunky (BudgetAccountEntry) ────────────────────────────────
export function budgetAccountToDirectoryEntry(
  b: BudgetAccountEntry,
): DirectoryEntry<BudgetAccountEntry> {
  const relatedEntryIds = [
    ...(b.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(b.relatedPenaltySlugs ?? []).map((s) => `penalties:${s}`),
    ...(b.relatedAgencySlugs ?? []).map((s) => `derzhorgany:${s}`),
  ];
  return {
    id: b.id,
    slug: b.slug,
    category: "biudzhetni-rakhunky",
    audience: b.audience,
    title: b.title,
    summary: b.summary,
    payload: b,
    asOf: b.asOf,
    effectiveFrom: b.asOf,
    source: `${b.recipientName} (Держказначейство)`,
    sourceUrl: b.officialUrl,
    legalBasis: `${BUDGET_TAX_LABEL[b.taxType]} — ${BUDGET_REGION_LABEL[b.region]}, код класифікації ${b.budgetCode}`,
    confidence: "estimate",
    lastVerifiedAt: b.asOf,
    relatedToolIds: b.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: b.faq,
    seo: { title: b.seoTitle, description: b.seoDescription, keywords: b.seoKeywords },
    ...commonMeta("biudzhetni-rakhunky"),
  };
}

// ─── atsk-kep (AtskEntry) ────────────────────────────────────────────────────
export function atskToDirectoryEntry(a: AtskEntry): DirectoryEntry<AtskEntry> {
  const relatedEntryIds = [
    ...(a.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(a.relatedAgencySlugs ?? []).map((s) => `derzhorgany:${s}`),
  ];
  const isFree = a.fees.some((f) => f.price.toLowerCase().includes("безкошт"));
  return {
    id: a.id,
    slug: a.slug,
    category: "atsk-kep",
    audience: a.audience,
    title: `${a.shortName} — ${a.fullName}`,
    summary: a.summary,
    payload: a,
    asOf: FALLBACK_AS_OF,
    source: `${a.fullName} (офіційний сайт)`,
    sourceUrl: a.website,
    legalBasis: `КНЕДП — ${ATSK_CATEGORY_LABEL[a.category]}${a.edrpou ? `, ЄДРПОУ ${a.edrpou}` : ""}${isFree ? ", безкоштовно" : ""}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: a.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: a.faq,
    seo: { title: a.seoTitle, description: a.seoDescription, keywords: a.seoKeywords },
    ...commonMeta("atsk-kep"),
  };
}

// ─── katottg (KatottgEntry) ──────────────────────────────────────────────────
export function katottgToDirectoryEntry(k: KatottgEntry): DirectoryEntry<KatottgEntry> {
  const relatedEntryIds = [
    ...(k.relatedAgencySlugs ?? []).map((s) => `derzhorgany:${s}`),
  ];
  return {
    id: k.id,
    slug: k.slug,
    category: "katottg",
    audience: k.audience,
    title: `${k.name} — ${k.unitType}`,
    summary: k.usageContext,
    payload: k,
    asOf: FALLBACK_AS_OF,
    source: "Кодифікатор КАТОТТГ (наказ Мінрозвитку громад № 290 від 26.11.2020)",
    sourceUrl: "https://decentralization.gov.ua/areas",
    legalBasis: `${KATOTTG_LEVEL_LABEL[k.level]} — ${k.oblast}, код ${k.code}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: k.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: k.faq,
    seo: { title: k.seoTitle, description: k.seoDescription, keywords: k.seoKeywords },
    ...commonMeta("katottg"),
  };
}

// ─── profesii (ProfesiaEntry) ────────────────────────────────────────────────
export function profesiaToDirectoryEntry(p: ProfesiaEntry): DirectoryEntry<ProfesiaEntry> {
  const relatedEntryIds = [
    ...(p.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(p.relatedPenaltySlugs ?? []).map((s) => `penalties:${s}`),
    ...(p.typicalKvedCodes ?? []).map((s) => `kved:${s}`),
  ];
  return {
    id: p.id,
    slug: p.slug,
    category: "profesii",
    audience: p.audience,
    title: `${p.name} — код ${p.code}`,
    summary: p.description,
    payload: p,
    asOf: FALLBACK_AS_OF,
    source: "Класифікатор професій ДК 003:2010 (наказ Держспоживстандарту № 327 від 28.07.2010)",
    sourceUrl: "https://zakon.rada.gov.ua/rada/show/va327609-10",
    legalBasis: `${PROFESIA_SECTION_LABEL[p.section]} — код ${p.code}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: p.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: p.faq,
    seo: { title: p.seoTitle, description: p.seoDescription, keywords: p.seoKeywords },
    ...commonMeta("profesii"),
  };
}

// ─── plan-rakhunkiv (PlanRakhunkuEntry) ──────────────────────────────────────
export function planRakhunkuToDirectoryEntry(
  p: PlanRakhunkuEntry,
): DirectoryEntry<PlanRakhunkuEntry> {
  const relatedEntryIds = [
    ...(p.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
  ];
  return {
    id: p.id,
    slug: p.slug,
    category: "plan-rakhunkiv",
    audience: p.audience,
    title: `${p.code} — ${p.name}`,
    summary: p.description,
    payload: p,
    asOf: FALLBACK_AS_OF,
    source: "План рахунків бухгалтерського обліку (наказ Мінфіну № 291 від 30.11.1999)",
    sourceUrl: "https://zakon.rada.gov.ua/laws/show/z0892-99",
    legalBasis: `Клас ${p.class} «${ACCOUNT_CLASS_LABEL[p.class]}», ${ACCOUNT_TYPE_LABEL[p.type]} рахунок ${p.code}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: p.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: p.faq,
    seo: { title: p.seoTitle, description: p.seoDescription, keywords: p.seoKeywords },
    ...commonMeta("plan-rakhunkiv"),
  };
}

// ─── ukt-zed (UktZedEntry) ───────────────────────────────────────────────────
export function uktZedToDirectoryEntry(u: UktZedEntry): DirectoryEntry<UktZedEntry> {
  const relatedEntryIds = [
    ...(u.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(u.relatedAgencySlugs ?? []).map((s) => `derzhorgany:${s}`),
    ...(u.relatedKvedCodes ?? []).map((s) => `kved:${s}`),
  ];
  return {
    id: u.id,
    slug: u.slug,
    category: "ukt-zed",
    audience: u.audience,
    title: `${u.code} — ${u.name}`,
    summary: u.description,
    payload: u,
    asOf: FALLBACK_AS_OF,
    source: "УКТ ЗЕД — Закон України № 674-IX від 04.06.2020 (на основі HS 2022)",
    sourceUrl: "https://customs.gov.ua/uktzed",
    legalBasis: `${UKT_SECTION_LABEL[u.section]} — мито ${u.duty.importRate}, ПДВ ${u.duty.vatRate}${u.duty.excise ? `, акциз ${u.duty.excise}` : ""}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: u.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: u.faq,
    seo: { title: u.seoTitle, description: u.seoDescription, keywords: u.seoKeywords },
    ...commonMeta("ukt-zed"),
  };
}

// ─── viyskovyy-oblik (ViyskovyyEntry) ────────────────────────────────────────
export function viyskovyyToDirectoryEntry(v: ViyskovyyEntry): DirectoryEntry<ViyskovyyEntry> {
  const relatedEntryIds = [
    ...(v.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(v.relatedAgencySlugs ?? []).map((s) => `derzhorgany:${s}`),
    ...(v.relatedPenaltySlugs ?? []).map((s) => `penalties:${s}`),
  ];
  return {
    id: v.id,
    slug: v.slug,
    category: "viyskovyy-oblik",
    audience: v.audience,
    title: v.title,
    summary: v.summary,
    payload: v,
    asOf: FALLBACK_AS_OF,
    source: v.legalBasis,
    sourceUrl: v.legalUrl,
    legalBasis: `${VIYSKOVYY_TOPIC_LABEL[v.topic]} — ${v.legalBasis}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: v.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: v.faq,
    seo: { title: v.seoTitle, description: v.seoDescription, keywords: v.seoKeywords },
    ...commonMeta("viyskovyy-oblik"),
  };
}

// ─── pdv-pilhy (PdvPilhaEntry) ───────────────────────────────────────────────
export function pdvPilhaToDirectoryEntry(p: PdvPilhaEntry): DirectoryEntry<PdvPilhaEntry> {
  const relatedEntryIds = [
    ...(p.relatedLawSlugs ?? []).map((s) => `laws:${s}`),
    ...(p.relatedAgencySlugs ?? []).map((s) => `derzhorgany:${s}`),
    ...(p.relatedKvedCodes ?? []).map((s) => `kved:${s}`),
  ];
  return {
    id: p.id,
    slug: p.slug,
    category: "pdv-pilhy",
    audience: p.audience,
    title: p.title,
    summary: p.summary,
    payload: p,
    asOf: FALLBACK_AS_OF,
    source: p.legalBasis,
    sourceUrl: p.legalUrl,
    legalBasis: `${PDV_PILHA_TYPE_LABEL[p.type]} · ${PDV_SECTOR_LABEL[p.sector]} — ${p.articleRef}`,
    confidence: "snapshot",
    lastVerifiedAt: FALLBACK_AS_OF,
    relatedToolIds: p.relatedToolIds,
    relatedEntryIds: relatedEntryIds.length > 0 ? relatedEntryIds : undefined,
    faq: p.faq,
    seo: { title: p.seoTitle, description: p.seoDescription, keywords: p.seoKeywords },
    ...commonMeta("pdv-pilhy"),
  };
}

/** All directory entries available to AI / sitemap / SEO layers. */
export function getAllDirectoryEntries(): DirectoryEntry<unknown>[] {
  return [
    ...PENALTIES.map(penaltyToDirectoryEntry),
    ...LAWS.map(lawToDirectoryEntry),
    ...KVED_ENTRIES.map(kvedToDirectoryEntry),
    ...GRANTS.map(grantToDirectoryEntry),
    ...LICENSES.map(licenseToDirectoryEntry),
    ...REGISTERS.map(registerToDirectoryEntry),
    ...TEMPLATES.map(templateToDirectoryEntry),
    ...BUSINESS_FORMS.map(businessFormToDirectoryEntry),
    ...KNOWLEDGE.map(slovnykToDirectoryEntry),
    ...RATE_TABLES.map(rateToDirectoryEntry),
    ...ACCOUNTANTS.map(accountantToDirectoryEntry),
    ...DEADLINES.map(deadlineToDirectoryEntry),
    ...COURT_CASES.map(courtCaseToDirectoryEntry),
    ...CLARIFICATIONS.map(clarificationToDirectoryEntry),
    ...AGENCIES.map(agencyToDirectoryEntry),
    ...BUDGET_ACCOUNTS.map(budgetAccountToDirectoryEntry),
    ...ATSK_PROVIDERS.map(atskToDirectoryEntry),
    ...KATOTTG_ENTRIES.map(katottgToDirectoryEntry),
    ...PROFESII.map(profesiaToDirectoryEntry),
    ...PLAN_RAKHUNKIV.map(planRakhunkuToDirectoryEntry),
    ...UKT_ZED.map(uktZedToDirectoryEntry),
    ...VIYSKOVYY_OBLIK.map(viyskovyyToDirectoryEntry),
    ...PDV_PILHY.map(pdvPilhaToDirectoryEntry),
  ];
}

/** Subset by category — handy for category index pages. */
export function getDirectoryEntries(category: DirectoryCategory): DirectoryEntry<unknown>[] {
  return getAllDirectoryEntries().filter((e) => e.category === category);
}
