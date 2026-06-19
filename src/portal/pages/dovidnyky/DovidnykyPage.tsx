import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { DOVIDNYKY_SECTIONS, type DovidnykySection } from "@/portal/data/dovidnyky";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";

import { KNOWLEDGE } from "@/portal/data/knowledge";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { LAWS } from "@/portal/data/laws";
import { GRANTS } from "@/portal/data/grants";
import { PENALTIES } from "@/portal/data/penalties";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { TEMPLATES } from "@/portal/data/templates";
import { REGISTERS } from "@/portal/data/registers";
import { RATE_TABLES } from "@/portal/data/rates";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { COURSES } from "@/portal/data/learn";
import { LICENSES } from "@/portal/data/licenses";
import { DEADLINES } from "@/portal/data/deadlines";
import { COURT_CASES } from "@/portal/data/courtCases";
import { CLARIFICATIONS, CLARIFICATION_KIND_LABEL } from "@/portal/data/taxClarifications";
import { AGENCIES } from "@/portal/data/agencies";
import { BUDGET_ACCOUNTS, BUDGET_TAX_LABEL, BUDGET_REGION_LABEL } from "@/portal/data/budgetAccounts";
import { ATSK_PROVIDERS, ATSK_CATEGORY_LABEL } from "@/portal/data/atskProviders";
import { KATOTTG_ENTRIES, KATOTTG_LEVEL_LABEL } from "@/portal/data/katottg";
import { PROFESII, PROFESIA_SECTION_LABEL } from "@/portal/data/profesii";
import { PLAN_RAKHUNKIV, ACCOUNT_CLASS_LABEL } from "@/portal/data/planRakhunkiv";
import { UKT_ZED, UKT_SECTION_LABEL } from "@/portal/data/uktZed";
import { VIYSKOVYY_OBLIK, VIYSKOVYY_TOPIC_LABEL } from "@/portal/data/viyskovyyOblik";
import { PDV_PILHY, PDV_PILHA_TYPE_SHORT, PDV_SECTOR_LABEL } from "@/portal/data/pdvPilhy";
import { NBU_RATES_HISTORY } from "@/portal/data/nbuRatesHistory";
import { INFLATION_INDEX } from "@/portal/data/inflationIndex";
import { REGIONAL_OFFICES, REGIONAL_AUTHORITY_LABEL } from "@/portal/data/regionalOffices";
import { LIMITY, LIMIT_CATEGORY_LABEL } from "@/portal/data/limity";
import { REPORTING_FORMS, FORM_CATEGORY_LABEL } from "@/portal/data/reportingForms";
import { DTT_TREATIES, DTT_REGION_LABEL } from "@/portal/data/dttTreaties";
import { INCOTERMS_2020 } from "@/portal/data/incoterms";
import { BANKS_MFO, BANK_TYPE_LABEL } from "@/portal/data/banksMfo";
import { CURRENCIES, CURRENCY_GROUP_LABEL } from "@/portal/data/currencies";
import { KKD_ENTRIES, KKD_CLASS_LABEL } from "@/portal/data/kkdCodes";
import { INCOME_CODES, INCOME_CATEGORY_LABEL } from "@/portal/data/incomeCodes";
import { COUNTRIES, COUNTRY_GROUP_LABEL } from "@/portal/data/countryCodes";
import { PSP_ENTRIES, PSP_CATEGORY_LABEL } from "@/portal/data/pspPilhy";
import { TAX_BENEFIT_CODES, TAX_LABEL as TB_TAX_LABEL, KIND_LABEL as TB_KIND_LABEL } from "@/portal/data/taxBenefitCodes";
import { CURRENCY_OP_CODES, CURRENCY_OP_CATEGORY_LABEL } from "@/portal/data/currencyOpCodes";
import { PRIMARY_DOCUMENTS, PRIMARY_DOC_CATEGORY_LABEL } from "@/portal/data/primaryDocuments";
import { CUSTOMS_DOCUMENTS, CUSTOMS_CATEGORY_LABEL } from "@/portal/data/customsDocs";
import { VAT_DOC_CODES, VAT_CODE_KIND_LABEL } from "@/portal/data/vatDocCodes";
import { RRO_DEVICES, RRO_KIND_LABEL } from "@/portal/data/rroDevices";
import { LABOR_PAYMENTS, LABOR_CATEGORY_LABEL } from "@/portal/data/laborPayments";
import { TCO_ENTRIES, TCO_KIND_LABEL } from "@/portal/data/tcoRules";
import { DIIA_CITY_ENTRIES, DIIA_CITY_KIND_LABEL } from "@/portal/data/diiaCity";
import { SANCTIONS_SOURCES } from "@/portal/data/sanctionsSources";
import { BUSINESS_AUDITS, AUDIT_KIND_LABEL } from "@/portal/data/businessAudits";
import { CASH_LIMITS, CASH_LIMIT_CATEGORY_LABEL } from "@/portal/data/cashLimits";
import { CURRENCY_CONTROL, CC_CATEGORY_LABEL } from "@/portal/data/currencyControl";
import { CONTRACT_TYPES, CONTRACT_CATEGORY_LABEL } from "@/portal/data/contractTypes";
import { CORPORATE_LAW, CORP_CATEGORY_LABEL } from "@/portal/data/corporateLaw";
import { IP_RIGHTS, IP_KIND_LABEL } from "@/portal/data/ipRights";
import { POSTAL_OPERATORS, POSTAL_OPERATOR_KIND_LABEL } from "@/portal/data/postalOperators";
import { POSTAL_INDICES } from "@/portal/data/postalIndices";
import { FUEL_CHAINS, FUEL_CHAIN_KIND_LABEL, FUEL_PRICES, FUEL_TYPE_LABEL, type FuelType } from "@/portal/data/fuelStations";
import { EDU_CENTERS, EDU_CENTER_KIND_LABEL } from "@/portal/data/educationCenters";
import { CERTIFICATIONS, CERT_CATEGORY_LABEL } from "@/portal/data/certifications";
import { EDU_GRANTS, GRANT_REGION_LABEL } from "@/portal/data/eduGrants";
import { UTILITY_TARIFFS, UTILITY_KIND_LABEL, SEGMENT_LABEL } from "@/portal/data/utilityTariffs";
import { COMMERCIAL_RENT_ROWS, RENT_SEGMENT_LABEL } from "@/portal/data/commercialRent";
import { Search, ArrowRight, Sparkles, Handshake } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";
import { useAudience } from "@/contexts/AudienceContext";
import { DOVIDNYKY_GROUPS, SECTION_TO_GROUP, PINNED_SECTION_IDS } from "@/portal/data/dovidnykyGroups";
import { DIRECTORY_PARTNER_MAP, getDirectoryPartnerConfig } from "@/portal/data/directoryPartnerMap";
import { RelatedPartnersBlock, getPartnerCountForDirectory } from "@/portal/components/RelatedPartnersBlock";
import { DovidnykyDeskRail, type RailSection } from "@/portal/components/dovidnyky/DovidnykyDeskRail";
import { DovidnykyMobileNavBar } from "@/portal/components/dovidnyky/DovidnykyMobileNavBar";
import { useRecentDirectories } from "@/portal/hooks/useRecentDirectories";

const POPULAR_FREE_COURSES = COURSES.filter(c => c.isPopular && c.isFree).slice(0, 3);

/* ── Search index ── */
const INST_TYPE_LABEL: Record<string, string> = {
  bank: "Банк",
  neobank: "Необанк",
  accounting_software: "Бухгалтерія",
  insurance: "Страхування",
  logistics: "Логістика",
  payment_system: "Платежі",
  money_transfer: "Перекази",
  erp: "ERP",
  registrar: "Реєстратор",
};

interface SearchItem {
  type: string;
  typeLabel: string;
  label: string;
  sub: string;
  href: string;
  score: number;
}

const SEARCH_INDEX: SearchItem[] = [
  ...INSTITUTION_PROFILES.map((i) => ({
    type: "установа",
    typeLabel: INST_TYPE_LABEL[i.types[0]] || "Установа",
    label: i.name,
    sub: i.products?.[0]?.tagline || i.types.join(", "),
    href: `/dovidnyky/ustanovy/profile/${i.slug}`,
    score: i.ratings.fintodo.overall,
  })),
  ...KNOWLEDGE.map((k) => ({
    type: "термін",
    typeLabel: "Термін",
    label: k.term,
    sub: k.shortDefinition,
    href: `/dovidnyky/slovnyk/${k.slug}`,
    score: 70,
  })),
  ...KVED_ENTRIES.map((k) => ({
    type: "КВЕД",
    typeLabel: "КВЕД",
    label: `${k.code} — ${k.name}`,
    sub: k.description,
    href: `/dovidnyky/kved/${k.code}`,
    score: 65,
  })),
  ...LAWS.map((l) => ({
    type: "закон",
    typeLabel: "Закон",
    label: l.shortName,
    sub: l.description,
    href: `/dovidnyky/zakony/${l.slug}`,
    score: 75,
  })),
  ...GRANTS.map((g) => ({
    type: "грант",
    typeLabel: "Грант",
    label: g.name,
    sub: g.description,
    href: `/dovidnyky/granty/${g.slug}`,
    score: 72,
  })),
  ...PENALTIES.map((p) => ({
    type: "штраф",
    typeLabel: "Штраф",
    label: p.title,
    sub: p.penaltyAmount,
    href: `/dovidnyky/penalties/${p.slug}`,
    score: 78,
  })),
  ...COURT_CASES.map((c) => ({
    type: "судова-практика",
    typeLabel: "Судова практика",
    label: c.title,
    sub: c.summary,
    href: `/dovidnyky/sudy/${c.slug}`,
    score: 74,
  })),
  ...CLARIFICATIONS.map((c) => ({
    type: "розʼяснення",
    typeLabel: `Розʼяснення (${CLARIFICATION_KIND_LABEL[c.kind]})`,
    label: c.title,
    sub: c.summary,
    href: `/dovidnyky/rozyasnennia/${c.slug}`,
    score: 73,
  })),
  ...AGENCIES.map((a) => ({
    type: "держорган",
    typeLabel: "Держорган",
    label: `${a.shortName} — ${a.fullName}`,
    sub: a.summary,
    href: `/dovidnyky/derzhorgany/${a.slug}`,
    score: 70,
  })),
  ...BUDGET_ACCOUNTS.map((b) => ({
    type: "бюджетний-рахунок",
    typeLabel: "Бюджетний рахунок",
    label: `${BUDGET_TAX_LABEL[b.taxType]} — ${BUDGET_REGION_LABEL[b.region]}`,
    sub: `IBAN ${b.iban}`,
    href: `/dovidnyky/biudzhetni-rakhunky/${b.slug}`,
    score: 71,
  })),
  ...ATSK_PROVIDERS.map((a) => ({
    type: "АЦСК",
    typeLabel: "АЦСК / КЕП",
    label: a.shortName,
    sub: `${ATSK_CATEGORY_LABEL[a.category]} · ${a.summary.slice(0, 80)}`,
    href: `/dovidnyky/atsk-kep/${a.slug}`,
    score: 72,
  })),
  ...KATOTTG_ENTRIES.map((k) => ({
    type: "КАТОТТГ",
    typeLabel: "КАТОТТГ",
    label: `${k.name} — ${k.code}`,
    sub: `${KATOTTG_LEVEL_LABEL[k.level]} · ${k.oblast}`,
    href: `/dovidnyky/katottg/${k.slug}`,
    score: 69,
  })),
  ...PROFESII.map((p) => ({
    type: "професія",
    typeLabel: "Професія",
    label: `${p.code} — ${p.name}`,
    sub: `${PROFESIA_SECTION_LABEL[p.section]}${p.typicalSalary ? ` · ${p.typicalSalary}` : ""}`,
    href: `/dovidnyky/profesii/${p.slug}`,
    score: 67,
  })),
  ...PLAN_RAKHUNKIV.map((p) => ({
    type: "рахунок",
    typeLabel: "План рахунків",
    label: `${p.code} — ${p.name}`,
    sub: `Клас ${p.class}. ${ACCOUNT_CLASS_LABEL[p.class]}`,
    href: `/dovidnyky/plan-rakhunkiv/${p.slug}`,
    score: 68,
  })),
  ...UKT_ZED.map((u) => ({
    type: "УКТ ЗЕД",
    typeLabel: "УКТ ЗЕД",
    label: `${u.code} — ${u.name}`,
    sub: `${UKT_SECTION_LABEL[u.section]} · мито ${u.duty.importRate}, ПДВ ${u.duty.vatRate}`,
    href: `/dovidnyky/ukt-zed/${u.slug}`,
    score: 70,
  })),
  ...VIYSKOVYY_OBLIK.map((v) => ({
    type: "військовий облік",
    typeLabel: "Військовий облік",
    label: v.title,
    sub: VIYSKOVYY_TOPIC_LABEL[v.topic],
    href: `/dovidnyky/viyskovyy-oblik/${v.slug}`,
    score: 73,
  })),
  ...PDV_PILHY.map((p) => ({
    type: "пільга ПДВ",
    typeLabel: "Пільга з ПДВ",
    label: p.title,
    sub: `${PDV_PILHA_TYPE_SHORT[p.type]} · ${PDV_SECTOR_LABEL[p.sector]} · ${p.articleRef}`,
    href: `/dovidnyky/pdv-pilhy/${p.slug}`,
    score: 72,
  })),
  ...ACCOUNTANTS.map((a) => ({
    type: "бухгалтер",
    typeLabel: "Бухгалтер",
    label: a.name,
    sub: `${a.city} · ${a.priceDisplay}`,
    href: `/dovidnyky/accountants/${a.slug}`,
    score: 68,
  })),
  ...TEMPLATES.map((t) => ({
    type: "шаблон",
    typeLabel: "Шаблон",
    label: t.name,
    sub: t.description,
    href: `/dovidnyky/templates/${t.slug}`,
    score: 66,
  })),
  ...REGISTERS.map((r) => ({
    type: "реєстр",
    typeLabel: "Реєстр",
    label: r.shortName,
    sub: r.description,
    href: `/dovidnyky/reestry/${r.slug}`,
    score: 64,
  })),
  ...RATE_TABLES.map((r) => ({
    type: "ставка",
    typeLabel: "Ставка",
    label: r.name,
    sub: r.description,
    href: `/dovidnyky/stavky/${r.slug}`,
    score: 62,
  })),
  ...BUSINESS_FORMS.map((f) => ({
    type: "форма",
    typeLabel: "Форма бізнесу",
    label: f.name,
    sub: f.fullName,
    href: `/dovidnyky/formy-biznesu/${f.slug}`,
    score: 60,
  })),
  ...LICENSES.map((l) => ({
    type: "ліцензія",
    typeLabel: "Ліцензія",
    label: l.name,
    sub: `${l.cost} · ${l.issuingAuthority}`,
    href: `/dovidnyky/litsenziyi/${l.slug}`,
    score: 74,
  })),
  ...DEADLINES.map((d) => ({
    type: "дедлайн",
    typeLabel: "Дедлайн",
    label: d.title,
    sub: `${d.date} · ${d.legalBasis}`,
    href: `/dovidnyky/kalendar`,
    score: 70,
  })),
  ...REGIONAL_OFFICES.map((o) => ({
    type: "регіональний-контакт",
    typeLabel: REGIONAL_AUTHORITY_LABEL[o.authority],
    label: o.name,
    sub: `${o.oblast} · ${o.phone ?? o.address}`,
    href: `/dovidnyky/regionalni-kontakty`,
    score: 71,
  })),
  ...LIMITY.map((l) => ({
    type: "ліміт",
    typeLabel: LIMIT_CATEGORY_LABEL[l.category],
    label: l.title,
    sub: `${l.value} · ${l.basis}`,
    href: `/dovidnyky/limity`,
    score: 72,
  })),
  ...REPORTING_FORMS.map((f) => ({
    type: "звітна-форма",
    typeLabel: FORM_CATEGORY_LABEL[f.category],
    label: f.code,
    sub: `${f.deadline} · ${f.submitTo}`,
    href: `/dovidnyky/zvitni-formy`,
    score: 73,
  })),
  ...DTT_TREATIES.map((t) => ({
    type: "дпо",
    typeLabel: DTT_REGION_LABEL[t.region],
    label: `${t.flag} ${t.country} — ДПО`,
    sub: `Дивіденди ${t.dividends} · Проценти ${t.interest} · Роялті ${t.royalties}`,
    href: `/dovidnyky/dpo`,
    score: t.popular ? 75 : 74,
  })),
  ...INCOTERMS_2020.map((i) => ({
    type: "incoterm",
    typeLabel: "Incoterms 2020",
    label: `${i.code} — ${i.name}`,
    sub: i.shortDescription,
    href: `/dovidnyky/incoterms`,
    score: 76,
  })),
  ...BANKS_MFO.map((b) => ({
    type: "банк",
    typeLabel: BANK_TYPE_LABEL[b.type],
    label: `${b.shortName} — МФО ${b.mfo}`,
    sub: `SWIFT ${b.swift ?? '—'} · ЄДРПОУ ${b.edrpou} · ${b.city}`,
    href: `/dovidnyky/banky-mfo`,
    score: b.popular ? 78 : 77,
  })),
  ...CURRENCIES.map((c) => ({
    type: "валюта",
    typeLabel: CURRENCY_GROUP_LABEL[c.group],
    label: `${c.flag} ${c.code} — ${c.name}`,
    sub: `Цифровий ${c.numeric} · ${c.country}`,
    href: `/dovidnyky/valyuty`,
    score: c.popular ? 80 : 79,
  })),
  ...KKD_ENTRIES.map((k) => ({
    type: "ккд",
    typeLabel: KKD_CLASS_LABEL[k.class],
    label: `${k.code} — ${k.name}`,
    sub: k.payers.join('; '),
    href: `/dovidnyky/kkd`,
    score: k.popular ? 82 : 81,
  })),
  ...INCOME_CODES.map((i, idx) => ({
    type: "ознака-доходу",
    typeLabel: INCOME_CATEGORY_LABEL[i.category],
    label: `${i.code} — ${i.name}`,
    sub: i.description.slice(0, 90),
    href: `/dovidnyky/oznaky-dohodu`,
    score: i.popular ? 84 : 83 - idx * 0.001,
  })),
  ...COUNTRIES.map((c, idx) => ({
    type: "країна",
    typeLabel: COUNTRY_GROUP_LABEL[c.group],
    label: `${c.flag} ${c.name} — ${c.alpha2} / ${c.alpha3} / ${c.numeric}`,
    sub: c.fullName ?? c.name,
    href: `/dovidnyky/krayiny`,
    score: c.popular ? 86 : 85 - idx * 0.001,
  })),
  ...PSP_ENTRIES.map((p, idx) => ({
    type: "псп",
    typeLabel: `ПСП — ${PSP_CATEGORY_LABEL[p.category]}`,
    label: p.title,
    sub: `${p.legalRef} · ${p.amount2026} ₴/міс${p.perChild ? ' × дітей' : ''}`,
    href: `/dovidnyky/psp`,
    score: p.popular ? 88 : 87 - idx * 0.001,
  })),
  ...TAX_BENEFIT_CODES.map((t, idx) => ({
    type: "код-пільги",
    typeLabel: `Пільга ${TB_TAX_LABEL[t.tax]}`,
    label: `${t.code} — ${t.name}`,
    sub: `${TB_KIND_LABEL[t.kind]} · ${t.legalRef}`,
    href: `/dovidnyky/kody-pilg`,
    score: t.popular ? 90 : 89 - idx * 0.001,
  })),
  ...CURRENCY_OP_CODES.map((o, idx) => ({
    type: "квоп",
    typeLabel: `Вал. операція — ${CURRENCY_OP_CATEGORY_LABEL[o.category]}`,
    label: `${o.code} — ${o.name}`,
    sub: `${o.legalRef}${o.underSupervision ? ' · нагляд 180 днів' : ''}`,
    href: `/dovidnyky/kvo`,
    score: o.popular ? 92 : 91 - idx * 0.001,
  })),
  ...PRIMARY_DOCUMENTS.map((d, idx) => ({
    type: "первинка",
    typeLabel: `Первинка — ${PRIMARY_DOC_CATEGORY_LABEL[d.category]}`,
    label: `${d.code} — ${d.name}`,
    sub: `${d.legalRef}`,
    href: `/dovidnyky/pervynni-dokumenty`,
    score: d.popular ? 94 : 93 - idx * 0.001,
  })),
  ...CUSTOMS_DOCUMENTS.map((d, idx) => ({
    type: "митниця",
    typeLabel: `Митниця — ${CUSTOMS_CATEGORY_LABEL[d.category]}`,
    label: `${d.code} — ${d.name}`,
    sub: `${d.legalRef}`,
    href: `/dovidnyky/mytni-dokumenty`,
    score: d.popular ? 96 : 95 - idx * 0.001,
  })),
  ...VAT_DOC_CODES.map((d, idx) => ({
    type: "пдв-код",
    typeLabel: `ПДВ — ${VAT_CODE_KIND_LABEL[d.kind]}`,
    label: `${d.code} — ${d.name}`,
    sub: `${d.legalRef}`,
    href: `/dovidnyky/kody-pdv`,
    score: d.popular ? 98 : 97 - idx * 0.001,
  })),
  ...RRO_DEVICES.map((d, idx) => ({
    type: "ррo",
    typeLabel: `РРО/ПРРО — ${RRO_KIND_LABEL[d.kind]}`,
    label: `${d.name}`,
    sub: `${d.vendor} · ${d.priceUah}`,
    href: `/dovidnyky/rro-pprro`,
    score: d.popular ? 100 : 99 - idx * 0.001,
  })),
  ...LABOR_PAYMENTS.map((p, idx) => ({
    type: "трудові",
    typeLabel: `Трудові — ${LABOR_CATEGORY_LABEL[p.category]}`,
    label: `${p.name}`,
    sub: `${p.legalRef}`,
    href: `/dovidnyky/trudovi-vyplaty`,
    score: p.popular ? 102 : 101 - idx * 0.001,
  })),
  ...TCO_ENTRIES.map((e, idx) => ({
    type: "тцо",
    typeLabel: `ТЦО — ${TCO_KIND_LABEL[e.kind]}`,
    label: e.shortName ? `${e.shortName} — ${e.name}` : e.name,
    sub: e.legalRef,
    href: `/dovidnyky/tco`,
    score: e.popular ? 104 : 103 - idx * 0.001,
  })),
  ...DIIA_CITY_ENTRIES.map((e, idx) => ({
    type: "дія city",
    typeLabel: `Дія City — ${DIIA_CITY_KIND_LABEL[e.kind]}`,
    label: e.shortName ? `${e.shortName} — ${e.name}` : e.name,
    sub: e.legalRef,
    href: `/dovidnyky/diia-city`,
    score: e.popular ? 106 : 105 - idx * 0.001,
  })),
  ...SANCTIONS_SOURCES.map((s, idx) => ({
    type: "санкції",
    typeLabel: `Санкції — ${s.jurisdiction}`,
    label: `${s.shortLabel} — ${s.fullLabel}`,
    sub: s.authority,
    href: `/dovidnyky/sanctions`,
    score: 108 - idx * 0.001,
  })),
  ...BUSINESS_AUDITS.map((e, idx) => ({
    type: "перевірки",
    typeLabel: `Перевірки — ${AUDIT_KIND_LABEL[e.kind]}`,
    label: e.name,
    sub: e.legalRef,
    href: `/dovidnyky/perevirky-biznesu`,
    score: e.popular ? 110 : 109 - idx * 0.001,
  })),
  ...CASH_LIMITS.map((e, idx) => ({
    type: "каса",
    typeLabel: `Каса — ${CASH_LIMIT_CATEGORY_LABEL[e.category]}`,
    label: e.name,
    sub: `${e.amount} · ${e.legalRef}`,
    href: `/dovidnyky/kasovi-limity`,
    score: e.popular ? 112 : 111 - idx * 0.001,
  })),
  ...CURRENCY_CONTROL.map((e, idx) => ({
    type: "валютний-контроль",
    typeLabel: `ЗЕД — ${CC_CATEGORY_LABEL[e.category]}`,
    label: e.name,
    sub: `${e.value} · ${e.legalRef}`,
    href: `/dovidnyky/valyutnyy-kontrol`,
    score: e.popular ? 114 : 113 - idx * 0.001,
  })),
  ...CONTRACT_TYPES.map((e, idx) => ({
    type: "договір",
    typeLabel: `Договір — ${CONTRACT_CATEGORY_LABEL[e.category]}`,
    label: e.name,
    sub: e.legalRef,
    href: `/dovidnyky/dohovory`,
    score: e.popular ? 116 : 115 - idx * 0.001,
  })),
  ...CORPORATE_LAW.map((e, idx) => ({
    type: "корпоративне",
    typeLabel: `Корпоративне — ${CORP_CATEGORY_LABEL[e.category]}`,
    label: e.name,
    sub: `${e.thresholds} · ${e.legalRef}`,
    href: `/dovidnyky/korporatyvne-pravo`,
    score: e.popular ? 118 : 117 - idx * 0.001,
  })),
  ...IP_RIGHTS.map((e, idx) => ({
    type: "ip",
    typeLabel: `IP — ${IP_KIND_LABEL[e.kind]}`,
    label: e.name,
    sub: `${e.term || e.summary} · ${e.legalRef}`,
    href: `/dovidnyky/ip-prava`,
    score: e.popular ? 120 : 119 - idx * 0.001,
  })),
  ...POSTAL_OPERATORS.map((e, idx) => ({
    type: "пошта",
    typeLabel: `Поштовий оператор — ${POSTAL_OPERATOR_KIND_LABEL[e.kind]}`,
    label: e.name,
    sub: `${e.coverage} · ${e.hotline}`,
    href: `/dovidnyky/poshtovi-operatory`,
    score: e.popular ? 122 : 121 - idx * 0.001,
  })),
  ...POSTAL_INDICES.map((e, idx) => ({
    type: "індекс",
    typeLabel: `Індекс — ${e.region}`,
    label: `${e.index} · ${e.city}`,
    sub: e.district ? `${e.district} р-н, ${e.region} обл.` : `${e.region} обл.`,
    href: `/dovidnyky/poshtovi-indeksy`,
    score: 100 - idx * 0.0001,
  })),
  ...FUEL_CHAINS.map((e, idx) => ({
    type: "АЗС",
    typeLabel: `АЗС — ${FUEL_CHAIN_KIND_LABEL[e.kind]}`,
    label: e.name,
    sub: `${e.stationCount.toLocaleString('uk')} станцій · ${e.regions} обл.`,
    href: `/dovidnyky/azs`,
    score: e.popular ? 124 : 123 - idx * 0.001,
  })),
  ...FUEL_PRICES.flatMap((row) => {
    const chain = FUEL_CHAINS.find((c) => c.id === row.chainId);
    if (!chain) return [];
    return (Object.keys(row.prices) as FuelType[]).map((fuel, idx) => ({
      type: "паливо",
      typeLabel: `Ціна палива — ${chain.name}`,
      label: `${FUEL_TYPE_LABEL[fuel]} · ${row.prices[fuel]?.toFixed(2)} ₴/л`,
      sub: `${chain.name}`,
      href: `/dovidnyky/tsiny-palyva`,
      score: 90 - idx * 0.0001,
    }));
  }),
  ...EDU_CENTERS.map((e, idx) => ({
    type: "освіта",
    typeLabel: `Освіта — ${EDU_CENTER_KIND_LABEL[e.kind]}`,
    label: e.name,
    sub: `${e.city} · ${e.programs.slice(0, 2).join(', ')}`,
    href: `/dovidnyky/navchalni-tsentry`,
    score: e.popular ? 126 : 125 - idx * 0.001,
  })),
  ...CERTIFICATIONS.map((e, idx) => {
    const isBiz = (e.scope ?? (['quality','food','product','esg','privacy','industry'].includes(e.category) ? 'business' : 'professional')) === 'business';
    return {
      type: "сертифікація",
      typeLabel: isBiz ? `Сертифікація — Бізнесова (${CERT_CATEGORY_LABEL[e.category]})` : `Сертифікація — ${CERT_CATEGORY_LABEL[e.category]}`,
      label: `${e.code} — ${e.name}`,
      sub: `${e.issuer} · ${e.costUsd}`,
      href: `/dovidnyky/sertyfikatsii`,
      score: e.popular ? 128 : 127 - idx * 0.001,
    };
  }),
  ...EDU_GRANTS.map((e, idx) => ({
    type: "грант",
    typeLabel: `Грант — ${GRANT_REGION_LABEL[e.region]}`,
    label: e.shortName ?? e.name,
    sub: `${e.funder} · ${e.applicationPeriod}`,
    href: `/dovidnyky/granty-na-navchannya`,
    score: e.popular ? 130 : 129 - idx * 0.001,
  })),
  ...UTILITY_TARIFFS.map((t, idx) => ({
    type: "тариф",
    typeLabel: `Тариф — ${UTILITY_KIND_LABEL[t.kind]}`,
    label: `${t.name} — ${t.price} ${t.unit}`,
    sub: `${t.region} · ${SEGMENT_LABEL[t.segment]}`,
    href: `/dovidnyky/komunalni-taryfy`,
    score: 131 - idx * 0.001,
  })),
  ...COMMERCIAL_RENT_ROWS.map((r, idx) => ({
    type: "оренда",
    typeLabel: `Оренда — ${RENT_SEGMENT_LABEL[r.segment]}`,
    label: `${r.city} · ${r.classOrZone}`,
    sub: `$${r.primeUsd} прайм · $${r.avgUsd} середня · ваканс. ${r.vacancy}%`,
    href: `/dovidnyky/komertsiyna-orenda`,
    score: 132 - idx * 0.001,
  })),
];


/* ── Dynamic entry counts ── */
const DYNAMIC_COUNTS: Record<string, number> = {
  ustanovy: INSTITUTION_PROFILES.length,
  slovnyk: KNOWLEDGE.length,
  kved: KVED_ENTRIES.length,
  zakony: LAWS.length,
  granty: GRANTS.length,
  penalties: PENALTIES.length,
  accountants: ACCOUNTANTS.length,
  templates: TEMPLATES.length,
  reestry: REGISTERS.length,
  stavky: RATE_TABLES.length,
  'formy-biznesu': BUSINESS_FORMS.length,
  litsenziyi: LICENSES.length,
  kalendar: DEADLINES.length,
  'biudzhetni-rakhunky': BUDGET_ACCOUNTS.length,
  'atsk-kep': ATSK_PROVIDERS.length,
  katottg: KATOTTG_ENTRIES.length,
  profesii: PROFESII.length,
  'plan-rakhunkiv': PLAN_RAKHUNKIV.length,
  'ukt-zed': UKT_ZED.length,
  'viyskovyy-oblik': VIYSKOVYY_OBLIK.length,
  'pdv-pilhy': PDV_PILHY.length,
  'kursy-nbu': NBU_RATES_HISTORY.length,
  'indeks-infliatsii': INFLATION_INDEX.length,
  'regionalni-kontakty': REGIONAL_OFFICES.length,
  limity: LIMITY.length,
  'zvitni-formy': REPORTING_FORMS.length,
  dpo: DTT_TREATIES.length,
  incoterms: INCOTERMS_2020.length,
  'banky-mfo': BANKS_MFO.length,
  valyuty: CURRENCIES.length,
  kkd: KKD_ENTRIES.length,
  'oznaky-dohodu': INCOME_CODES.length,
  krayiny: COUNTRIES.length,
  psp: PSP_ENTRIES.length,
  'kody-pilg': TAX_BENEFIT_CODES.length,
  kvo: CURRENCY_OP_CODES.length,
  'pervynni-dokumenty': PRIMARY_DOCUMENTS.length,
  'mytni-dokumenty': CUSTOMS_DOCUMENTS.length,
  'kody-pdv': VAT_DOC_CODES.length,
  'rro-pprro': RRO_DEVICES.length,
  'trudovi-vyplaty': LABOR_PAYMENTS.length,
  tco: TCO_ENTRIES.length,
  'diia-city': DIIA_CITY_ENTRIES.length,
  sanctions: SANCTIONS_SOURCES.length,
  'perevirky-biznesu': BUSINESS_AUDITS.length,
  'kasovi-limity': CASH_LIMITS.length,
  'valyutnyy-kontrol': CURRENCY_CONTROL.length,
  'dohovory': CONTRACT_TYPES.length,
  'korporatyvne-pravo': CORPORATE_LAW.length,
  'ip-prava': IP_RIGHTS.length,
  'poshtovi-operatory': POSTAL_OPERATORS.length,
  'poshtovi-indeksy': POSTAL_INDICES.length,
  'azs': FUEL_CHAINS.length,
  'tsiny-palyva': FUEL_PRICES.length,
  'navchalni-tsentry': EDU_CENTERS.length,
  'sertyfikatsii': CERTIFICATIONS.length,
  'granty-na-navchannya': EDU_GRANTS.length,
  'komunalni-taryfy': UTILITY_TARIFFS.length,
  'komertsiyna-orenda': COMMERCIAL_RENT_ROWS.length,
};

const enrichedSections = DOVIDNYKY_SECTIONS.map((s) => ({
  ...s,
  entryCount: DYNAMIC_COUNTS[s.id] ?? s.entryCount,
}));

const liveSections = enrichedSections.filter((s) => s.isLive);
const disabledSections = enrichedSections.filter((s) => !s.isLive);
const totalEntries = liveSections.reduce((s, sec) => s + sec.entryCount, 0);

/* ── Component ── */
const DovidnykyPage = () => {
  const navigate = useNavigate();
  const { audience, setAudience } = useAudience();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { recent: recentIds, record: recordRecent } = useRecentDirectories();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ⌘K / Ctrl+K → focus search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const searchResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.sub.toLowerCase().includes(q)
    )
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [query]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchResults]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    searchResults.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return groups;
  }, [searchResults]);

  const flatResults = useMemo(() => {
    const flat: SearchItem[] = [];
    Object.values(groupedResults).forEach((items) => flat.push(...items));
    return flat;
  }, [groupedResults]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!searchOpen || flatResults.length === 0) {
        if (e.key === "Escape") setSearchOpen(false);
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && flatResults[activeIndex]) {
            setSearchOpen(false);
            navigate(flatResults[activeIndex].href);
          }
          break;
        case "Escape":
          setSearchOpen(false);
          break;
      }
    },
    [searchOpen, flatResults, activeIndex, navigate]
  );

  const showDropdown = searchOpen && query.length >= 2;
  let flatIdx = -1;

  return (
    <PortalLayout
      meta={{
        title: "Ділові довідники — установи, КВЕД, закони, гранти | FINTODO",
        description: `Ділові довідники України — ${liveSections.length} розділів, ${totalEntries}+ записів: каталог установ, рейтинги сервісів, діловий словник, КВЕД-коди, законодавство та гранти для бізнесу.`,
        canonical: `${SITE_URL}/dovidnyky`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Довідники", url: `${SITE_URL}/dovidnyky` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Ділові довідники FINTODO",
          itemListElement: liveSections.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.name,
            url: `${SITE_URL}${s.href}`,
          })),
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Довідники" }]} />

        {/* ── Header ── */}
        <header className="py-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground lg:text-3xl tracking-tight">
              Ділові довідники України
            </h1>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              {totalEntries}+ записів у {liveSections.length} розділах — установи, рейтинги, законодавство, КВЕД і гранти
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-xs shrink-0">
            <button
              onClick={() => setAudience("business")}
              className={`px-3 py-1.5 rounded-md transition-colors ${audience === "business" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Для бізнесу
            </button>
            <button
              onClick={() => setAudience("individual")}
              className={`px-3 py-1.5 rounded-md transition-colors ${audience === "individual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Для фізособи
            </button>
          </div>
        </header>

        {/* ── Info-box ── */}
        <div className="bg-muted/30 border rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground font-medium">Що тут знайдете:</strong>{' '}
            Структурована довідкова інформація — адреси установ, тексти законів,
            коди КВЕД, паспорти грантів, штрафи.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Новини, гайди та рейтинги як редакційні матеріали —{' '}
            <Link to="/publications" className="text-primary hover:underline">
              розділ Публікації →
            </Link>
          </p>
        </div>

        {/* ── Search ── */}
        <div ref={searchRef} className="relative mb-8" role="combobox" aria-expanded={showDropdown} aria-haspopup="listbox">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Пошук розділу, терміна, КВЕД, закону…"
              className="pl-9 pr-16"
              role="searchbox"
              aria-autocomplete="list"
              aria-controls="dovidnyky-search-listbox"
            />
            <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 h-5 rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground pointer-events-none">
              ⌘K
            </kbd>
          </div>

          {showDropdown && (
            <div id="dovidnyky-search-listbox" role="listbox" className="absolute left-0 right-0 top-full mt-2 z-50 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
              {searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {Object.entries(groupedResults).map(([type, items]) => (
                    <div key={type} className="p-3 space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">{type}</p>
                      {items.map((item) => {
                        flatIdx++;
                        const isActive = flatIdx === activeIndex;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setSearchOpen(false)}
                            role="option"
                            aria-selected={isActive}
                            className={`flex items-start gap-2 py-1.5 px-1 rounded group transition-colors ${isActive ? "bg-accent" : ""}`}
                          >
                            <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">{item.typeLabel}</Badge>
                            <div className="min-w-0">
                              <span className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{item.label}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1 block">{item.sub}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                  <div className="p-2 text-center">
                    <span className="text-xs text-muted-foreground">Знайдено {searchResults.length} результатів</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Нічого не знайдено за «{query}»</p>
                  <p className="text-xs text-muted-foreground mt-1">Спробуйте: ЄСВ, ФОП, ПДВ, КВЕД</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Audience-filtered live sections ── */}
        {(() => {
          const filteredLive = liveSections.filter((s) => {
            if (s.audience === 'both') return true;
            if (audience === 'business') return s.audience === 'business';
            return s.audience === 'personal';
          });

          const pinned = PINNED_SECTION_IDS
            .map((id) => filteredLive.find((s) => s.id === id))
            .filter(Boolean) as typeof filteredLive;

          const sectionsByGroup: Record<string, typeof filteredLive> = {};
          const ungrouped: typeof filteredLive = [];
          filteredLive.forEach((s) => {
            const g = SECTION_TO_GROUP[s.id];
            if (!g) { ungrouped.push(s); return; }
            (sectionsByGroup[g] = sectionsByGroup[g] || []).push(s);
          });

          const renderCard = (section: typeof filteredLive[number]) => {
            const partnerCount = getPartnerCountForDirectory(section.id, audience);
            return (
              <div key={section.id}>
                <Link to={section.href} onClick={() => recordRecent(section.id)}>
                  <Card className={`p-4 h-full flex flex-col gap-2 hover:border-primary/40 transition-colors cursor-pointer ${section.isNew ? "ring-1 ring-primary/20" : ""}`}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl shrink-0">{section.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm">{section.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{section.tagline}</p>
                      </div>
                      {section.badge && (
                        <Badge variant="default" className="text-[10px] shrink-0">{section.badge}</Badge>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between gap-2 mt-auto">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-bold font-mono text-foreground">{section.entryCount || "—"}</span>
                        <span className="text-xs text-muted-foreground">{section.entryLabel}</span>
                      </div>
                      {partnerCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium shrink-0">
                          <Handshake className="h-3 w-3" />
                          +{partnerCount} партн.
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
                {section.note && section.noteHref && (
                  <Link to={section.noteHref} className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1 block px-1">
                    {section.note} →
                  </Link>
                )}
              </div>
            );
          };

          // Build rail data
          const liveGroups = DOVIDNYKY_GROUPS
            .filter((g) => (sectionsByGroup[g.id]?.length ?? 0) > 0)
            .map((g) => ({
              id: g.id,
              emoji: g.emoji,
              label: g.label,
              sections: (sectionsByGroup[g.id] ?? []).map((s) => ({
                id: s.id,
                name: s.name,
                emoji: s.emoji,
                href: s.href,
              })) as RailSection[],
            }));

          const pinnedRail: RailSection[] = pinned.map((s) => ({
            id: s.id, name: s.name, emoji: s.emoji, href: s.href,
          }));

          const recentRail: RailSection[] = recentIds
            .map((id) => filteredLive.find((s) => s.id === id))
            .filter(Boolean)
            .map((s) => ({ id: s!.id, name: s!.name, emoji: s!.emoji, href: s!.href }));

          const focusSearch = () => {
            searchInputRef.current?.focus();
            searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            setSearchOpen(true);
          };

          return (
            <>
              {/* Mobile-only sticky toolbar + bottom-sheet navigator */}
              <DovidnykyMobileNavBar
                groups={liveGroups}
                pinned={pinnedRail}
                recent={recentRail}
                totalCount={filteredLive.length}
                onOpenSearch={focusSearch}
                onNavigate={recordRecent}
              />

              {/* Desktop: sticky rail + content; Mobile: stacked */}
              <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8 lg:items-start">
                <DovidnykyDeskRail
                  groups={liveGroups}
                  pinned={pinnedRail}
                  recent={recentRail}
                  totalCount={filteredLive.length}
                  onNavigate={recordRecent}
                />

                <div className="min-w-0">
                  {/* Pinned */}
                  {pinned.length > 0 && (
                    <section id="pinned" className="mb-10 scroll-mt-24">
                      <div className="flex items-baseline justify-between mb-3">
                        <h2 className="text-base font-semibold text-foreground">⭐ Найзатребуваніше зараз</h2>
                        <span className="text-xs text-muted-foreground">{pinned.length} розділів</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {pinned.map(renderCard)}
                      </div>
                    </section>
                  )}

                  {/* Recent (only when populated) */}
                  {recentRail.length > 0 && (
                    <section id="recent" className="mb-10 scroll-mt-24">
                      <div className="flex items-baseline justify-between mb-3">
                        <h2 className="text-base font-semibold text-foreground">🕒 Нещодавно відкриті</h2>
                        <span className="text-xs text-muted-foreground">{recentRail.length}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {recentRail
                          .map((r) => filteredLive.find((s) => s.id === r.id))
                          .filter(Boolean)
                          .map((s) => renderCard(s as typeof filteredLive[number]))}
                      </div>
                    </section>
                  )}

                  {/* Per-group sections */}
                  {DOVIDNYKY_GROUPS.map((group) => {
                    const items = (sectionsByGroup[group.id] ?? []).filter((s) => !PINNED_SECTION_IDS.includes(s.id));
                    if (items.length === 0) return null;
                    return (
                      <section key={group.id} id={`g-${group.id}`} className="mb-10 scroll-mt-24">
                        <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
                          <div>
                            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                              <span className="text-lg">{group.emoji}</span> {group.label}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{items.length} розділів</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {items.map(renderCard)}
                        </div>
                      </section>
                    );
                  })}

                  {/* Ungrouped */}
                  {ungrouped.length > 0 && (
                    <section className="mb-10">
                      <h2 className="text-base font-semibold text-foreground mb-3">Інше</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {ungrouped.map(renderCard)}
                      </div>
                    </section>
                  )}

                  {/* Cross-directory partners teaser */}
                  <RelatedPartnersBlock directoryId="ustanovy" limit={6} className="mb-10" />
                </div>
              </div>
            </>

          );
        })()}

        {/* ── Disabled ("Скоро") ── */}
        {disabledSections.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Незабаром</p>
            <div className="flex flex-wrap gap-2">
              {disabledSections.map((section) => (
                <div key={section.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border opacity-50">
                  <span className="text-base">{section.emoji}</span>
                  <span className="text-sm text-muted-foreground">{section.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Learning center ── */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Навчальний центр</h2>
          <p className="text-sm text-muted-foreground mb-4">Безкоштовні курси та вебінари для підприємців і бухгалтерів</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {POPULAR_FREE_COURSES.map(course => (
              <Link key={course.id} to={`/learn/${course.category}/${course.slug}`}>
                <Card className="p-4 h-full hover:border-primary/40 transition-colors">
                  <span className="text-2xl block mb-2">{course.emoji}</span>
                  <p className="font-semibold text-sm text-foreground">{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.tagline}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">Безкоштовно</Badge>
                    <span>👤 {course.enrolled.toLocaleString("uk-UA")}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <Link to="/learn" className="text-sm text-primary font-medium hover:underline">
            Всі курси →
          </Link>
        </section>

        {/* ── CTA ── */}
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">FINTODO автоматизує все що ви знайдете тут</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>🏛 Знайшли установу? FINTODO інтегрується з нею автоматично.</li>
            <li>🗂 Вивчили КВЕД? FINTODO підкаже оптимальну групу ФОП.</li>
            <li>💰 Розібрались з ЄСВ? FINTODO рахує автоматично.</li>
          </ul>
          <Link to={CTA_CHECKOUT_URL}>
            <Button className="mt-1">Почати безкоштовно <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </section>
      </div>
    </PortalLayout>
  );
};

export default DovidnykyPage;
