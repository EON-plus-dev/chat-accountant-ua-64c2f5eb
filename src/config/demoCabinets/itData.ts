/**
 * IT CABINET (demo-it-3)
 * ФОП Коваль А.С. — IT, 3 група, solo
 */

import type { Document } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { TaxPayment, ContractorPayment } from "@/config/paymentsConfig";
import type { Contractor } from "@/config/settingsConfig";
import type { Report, ReportStatus } from "@/config/reportsConfig";
import { getDateFromNow, getDateInPast } from "./helpers";

// ============================================
// DOCUMENTS
// ============================================

// Cabinet identity for all IT documents
const IT_CABINET = {
  cabinetId: "demo-it-3",
  cabinetName: "ФОП Коваль А.С.",
  cabinetCode: "3112345678",
};

export const itDocuments: Document[] = [
  // Контракт з іноземним клієнтом (EN/UA)
  {
    id: "doc-it-001",
    ...IT_CABINET,
    number: "SA-2025-001",
    type: "contract",
    category: "contract",
    title: "Service Agreement — TechCorp Inc.",
    date: "2025-01-01",
    dueDate: "2025-12-31",
    amount: 4500,
    currency: "USD",
    contractor: { id: "c-it-1", name: "TechCorp Inc.", code: "US12345678" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2025-01-01T08:00:00Z",
    createdBy: "owner",
    updatedAt: "2025-01-05T14:00:00Z",
    aiSummary: "Договір на розробку програмного забезпечення з TechCorp Inc. на $4 500/міс. Умови оплати NET30. Термін дії: до 31.12.2025.",
    tags: ["foreign", "USD", "IT", "en"],
    // Template-based fieldValues for unified display
    templateId: "sys-contract-services",
    fieldValues: {
      documentNumber: "SA-2025-001",
      documentDate: "2025-01-01",
      executorName: "ФОП Коваль А.С.",
      executorCode: "3112345678",
      customerName: "TechCorp Inc.",
      customerCode: "US12345678",
      subject: "Software development services. $4500/month. NET30 payment terms.",
      total: "4500",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
    },
    aiRisks: [
      {
        id: "r-it-001-1",
        category: "financial",
        title: "NET30 — ризик курсових різниць",
        description: "30-денний термін оплати може призвести до втрат при коливаннях курсу USD/UAH.",
        severity: "medium",
        sourceSection: "Payment Terms",
        suggestion: {
          text: "Рекомендую фіксувати курс НБУ на дату виставлення інвойсу або додати пункт про перерахунок при відхиленні курсу більше ніж на 5%.",
          targetSection: "Payment Terms",
          insertPosition: "append",
          confidence: 84,
        },
      },
    ],
  },
  // Другий іноземний контракт (EUR)
  {
    id: "doc-it-002",
    ...IT_CABINET,
    number: "DEV-2025-001",
    type: "contract",
    category: "contract",
    title: "Development Contract — EuroSoft GmbH",
    date: "2025-02-01",
    dueDate: "2025-07-31",
    amount: 3200,
    currency: "EUR",
    contractor: { id: "c-it-2", name: "EuroSoft GmbH", code: "DE987654321" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2025-02-01T10:00:00Z",
    createdBy: "owner",
    updatedAt: "2025-02-03T12:00:00Z",
    aiSummary: "Проектний договір з EuroSoft GmbH на 6 місяців за €3 200/міс. Оплата за milestone-ами. Термін дії: до 31.07.2025.",
    tags: ["foreign", "EUR", "IT", "en"],
    aiRisks: [
      {
        id: "r-it-002-1",
        category: "legal",
        title: "Milestone без чітких критеріїв",
        description: "Опис Deliverables для кожного Milestone недостатньо деталізований.",
        severity: "medium",
        sourceSection: "Scope of Work",
        suggestion: {
          text: "Додайте чіткий опис Deliverables для кожного Milestone з критеріями приймання (acceptance criteria) для уникнення спорів.",
          targetSection: "Deliverables",
          insertPosition: "append",
          confidence: 87,
        },
      },
    ],
  },
  // Інвойс (з PNG підписом)
  {
    id: "doc-it-003",
    ...IT_CABINET,
    number: "INV-2025-001",
    type: "invoice",
    category: "primary",
    title: "Invoice #001 — TechCorp Inc. (January)",
    date: getDateInPast(10),
    dueDate: getDateFromNow(20),
    amount: 4500,
    currency: "USD",
    contractor: { id: "c-it-1", name: "TechCorp Inc.", code: "US12345678" },
    status: "sent",
    retentionPeriod: 3,
    createdAt: getDateInPast(10) + "T09:00:00Z",
    createdBy: "owner",
    updatedAt: getDateInPast(10) + "T09:00:00Z",
    signatures: [
      { id: "s1", signedBy: "ФОП Коваль А.С.", signedAt: getDateInPast(10) + "T09:00:00Z", signatureType: "manual", isValid: true },
    ],
    tags: ["foreign", "en"],
    aiSummary: "Інвойс на розробку ПЗ за січень 2025 на $4 500 для TechCorp Inc. Очікується оплата до NET30. Підпис: manual PNG.",
    // Template-based fieldValues for unified display
    templateId: "sys-invoice-standard",
    fieldValues: {
      documentNumber: "INV-2025-001",
      documentDate: getDateInPast(10),
      total: "4500",
      supplierName: "ФОП Коваль А.С.",
      supplierCode: "3112345678",
      buyerName: "TechCorp Inc.",
      buyerCode: "US12345678",
      subject: "Software development services for January 2025",
    },
    aiRisks: [
      {
        id: "r-it-003-1",
        category: "financial",
        title: "Перевірка надходження валюти",
        description: "Очікується надходження $4500 — контролюйте зарахування через валютний контроль.",
        severity: "low",
        sourceSection: "Payment",
        suggestion: {
          text: "Після зарахування валюти перевірте довідку про надходження валютної виручки та коректність курсу конвертації.",
          targetSection: "Валютний контроль",
          insertPosition: "append",
          confidence: 82,
        },
      },
    ],
  },
  {
    id: "doc-it-004",
    ...IT_CABINET,
    number: "INV-2025-002",
    type: "invoice",
    category: "primary",
    title: "Invoice #002 — EuroSoft GmbH (February)",
    date: getDateInPast(5),
    dueDate: getDateFromNow(25),
    amount: 3200,
    currency: "EUR",
    contractor: { id: "c-it-2", name: "EuroSoft GmbH", code: "DE987654321" },
    status: "sent",
    retentionPeriod: 3,
    createdAt: getDateInPast(5) + "T10:00:00Z",
    createdBy: "owner",
    updatedAt: getDateInPast(5) + "T10:00:00Z",
    signatures: [
      { id: "s1", signedBy: "ФОП Коваль А.С.", signedAt: getDateInPast(5) + "T10:00:00Z", signatureType: "manual", isValid: true },
    ],
    tags: ["foreign", "en"],
    aiSummary: "Інвойс на milestone-розробку за лютий 2025 на €3 200 для EuroSoft GmbH. Очікується оплата.",
    aiRisks: [
      {
        id: "r-it-004-1",
        category: "financial",
        title: "Контролюйте надходження EUR",
        description: "Очікується надходження €3200 — контролюйте зарахування через валютний контроль.",
        severity: "low",
        sourceSection: "Payment",
        suggestion: {
          text: "Після зарахування валюти перевірте курс конвертації та відповідність даті інвойсу. Курс EUR/UAH може коливатись.",
          targetSection: "Валютний контроль",
          insertPosition: "append",
          confidence: 80,
        },
      },
    ],
  },
  // Акт валютного контролю
  {
    id: "doc-it-005",
    ...IT_CABINET,
    number: "ВК-2025-001",
    type: "other",
    category: "bank",
    title: "Довідка про надходження валютної виручки",
    date: getDateInPast(8),
    amount: 4500,
    currency: "USD",
    status: "signed",
    retentionPeriod: 5,
    createdAt: getDateInPast(8) + "T14:00:00Z",
    createdBy: "bank",
    updatedAt: getDateInPast(8) + "T14:00:00Z",
    aiSummary: "Банківська довідка про зарахування валютної виручки $4 500 від TechCorp Inc. Курс НБУ на дату зарахування: 41.50 грн/$.",
    aiRisks: [
      {
        id: "r-it-005-1",
        category: "financial",
        title: "Перевірте курс конвертації",
        description: "Звірте курс конвертації в довідці з курсом НБУ на дату зарахування.",
        severity: "low",
        sourceSection: "Курс",
        suggestion: {
          text: "Курс конвертації має відповідати курсу НБУ ±0.5%. При значному відхиленні зверніться до банку.",
          targetSection: "Валютний контроль",
          insertPosition: "append",
          confidence: 75,
        },
      },
    ],
  },
  // Договір з українським субпідрядником
  {
    id: "doc-it-006",
    ...IT_CABINET,
    number: "СУБ-2025-001",
    type: "contract",
    category: "contract",
    title: "Договір субпідряду з ФОП Литвин",
    date: "2025-02-15",
    dueDate: "2025-06-30",
    amount: 25000,
    currency: "UAH",
    contractor: { id: "c-it-3", name: "ФОП Литвин І.О.", code: "3334445556" },
    status: "signed",
    retentionPeriod: 5,
    createdAt: "2025-02-15T11:00:00Z",
    createdBy: "contractor",
    updatedAt: "2025-02-16T09:00:00Z",
    aiSummary: "Договір субпідряду на частину робіт з розробки ПЗ з ФОП Литвин І.О. за 25 000 ₴/міс. Термін дії: 15.02.2025 — 30.06.2025.",
    // Template-based fieldValues for unified display
    templateId: "sys-fop-contractor-contract",
    fieldValues: {
      documentNumber: "СУБ-2025-001",
      documentDate: "2025-02-15",
      clientName: "ФОП Коваль А.С.",
      clientCode: "3112345678",
      fopName: "ФОП Литвин І.О.",
      fopCode: "3334445556",
      subject: "Субпідряд на виконання частини робіт з розробки ПЗ",
      monthlyFee: "25000",
      validFrom: "2025-02-15",
      validTo: "2025-06-30",
    },
    aiRisks: [
      {
        id: "r-it-006-1",
        category: "financial",
        title: "Субпідряд — перевірте рентабельність",
        description: "Субпідрядник отримує 25 000 ₴ при доході $4500. Перевірте маржинальність.",
        severity: "low",
        sourceSection: "Вартість робіт",
        suggestion: {
          text: "При курсі ~41 грн/$, ваш дохід ~184 500 грн. Витрата 25 000 грн = 13.5% на субпідряд. Це прийнятний рівень для аутсорсу.",
          targetSection: "Рентабельність",
          insertPosition: "append",
          confidence: 78,
        },
      },
    ],
  },
];

// ============================================
// INCOME RECORDS
// ============================================

export const itIncomeRecords: IncomeBookRecord[] = [
  {
    id: "inc-it-001",
    date: getDateInPast(8),
    description: "TechCorp Inc. — January invoice",
    contractor: "TechCorp Inc.",
    contractorCode: "US12345678",
    amount: 186750, // $4500 * 41.50
    inIncomeBook: 186750,
    paymentType: "bank",
    source: "monobank",
    status: "income",
    txnId: "TXN-IT-001",
    documentFlowId: "doc-it-003",
    aiNote: "Валютна виручка $4500 за курсом 41.50 грн/$.",
  },
  {
    id: "inc-it-002",
    date: getDateInPast(25),
    description: "TechCorp Inc. — December invoice",
    contractor: "TechCorp Inc.",
    contractorCode: "US12345678",
    amount: 184500,
    inIncomeBook: 184500,
    paymentType: "bank",
    source: "monobank",
    status: "income",
    txnId: "TXN-IT-002",
    aiNote: "Валютна виручка $4500 за курсом 41.00 грн/$.",
  },
];

// ============================================
// CONTRACTORS
// ============================================

export const itContractors: Contractor[] = [
  {
    id: "c-it-1",
    name: "TechCorp Inc.",
    code: "US12345678",
    email: "payments@techcorp.com",
    type: "legal",
    role: "buyer",
    status: "active",
    balance: 0,
    reliabilityScore: 95,
    activeContractsCount: 1,
    tags: ["USA", "USD", "IT"],
  },
  {
    id: "c-it-2",
    name: "EuroSoft GmbH",
    code: "DE987654321",
    email: "finance@eurosoft.de",
    type: "legal",
    role: "buyer",
    status: "active",
    balance: 0,
    reliabilityScore: 88,
    activeContractsCount: 1,
    tags: ["Germany", "EUR", "IT"],
  },
  {
    id: "c-it-3",
    name: "ФОП Литвин І.О.",
    code: "3334445556",
    type: "fop",
    role: "supplier",
    status: "active",
    balance: -25000,
    taxStatus: "Платник ЄП 3 група",
    tags: ["Субпідряд"],
  },
];

// ============================================
// TAX PAYMENTS
// ============================================

export const itTaxPayments: TaxPayment[] = [
  {
    id: "tax-it-001",
    cabinetId: "demo-it-3",
    taxType: "ep",
    taxTypeLabel: "ЄП",
    period: "І квартал 2025",
    year: 2025,
    quarter: 1,
    amountToPay: 16375,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2025-04-19",
    createdAt: "2025-03-01T08:00:00Z",
    calculatedFromIncome: 327550,
    taxRate: 5,
  },
  {
    id: "tax-it-002",
    cabinetId: "demo-it-3",
    taxType: "esv",
    taxTypeLabel: "ЄСВ ФОП",
    period: "І квартал 2025",
    year: 2025,
    quarter: 1,
    amountToPay: 5280,
    status: "scheduled",
    statusLabel: "Заплановано",
    deadline: "2025-04-19",
    createdAt: "2025-03-01T08:00:00Z",
  },
];

// ============================================
// REPORTS
// ============================================

export const itReports: Report[] = [
  {
    id: "rep-it-ep-q4-2024",
    cabinetId: "demo-it-3",
    type: "ep",
    typeLabel: "ЄП",
    name: "Декларація ЄП за IV квартал 2024",
    period: "Q4",
    periodLabel: "IV квартал 2024",
    year: 2024,
    quarter: 4,
    deadline: "2025-02-09",
    status: "accepted" as ReportStatus,
    statusLabel: "Прийнято",
    submittedDate: "2025-02-05",
    acceptedDate: "2025-02-06",
    amountToPay: 48000,
    dataSources: ["income-book"],
    fopGroup: 3,
    formCode: "F0103308",
    history: [],
  },
  {
    id: "rep-it-esv-q4-2024",
    cabinetId: "demo-it-3",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт з ЄСВ за IV квартал 2024",
    period: "Q4",
    periodLabel: "IV квартал 2024",
    year: 2024,
    quarter: 4,
    deadline: "2025-02-09",
    status: "accepted" as ReportStatus,
    statusLabel: "Прийнято",
    submittedDate: "2025-02-05",
    acceptedDate: "2025-02-06",
    amountToPay: 5808,
    dataSources: ["income-book"],
    fopGroup: 3,
    formCode: "F0133108",
    history: [],
  },
  {
    id: "rep-it-ep-q1-2025",
    cabinetId: "demo-it-3",
    type: "ep",
    typeLabel: "ЄП",
    name: "Декларація ЄП за І квартал 2025",
    period: "Q1",
    periodLabel: "І квартал 2025",
    year: 2025,
    quarter: 1,
    deadline: "2025-05-09",
    status: "scheduled" as ReportStatus,
    statusLabel: "Заплановано",
    dataSources: ["income-book"],
    fopGroup: 3,
    formCode: "F0103308",
    history: [],
  },
  {
    id: "rep-it-esv-q1-2025",
    cabinetId: "demo-it-3",
    type: "esv",
    typeLabel: "ЄСВ",
    name: "Звіт з ЄСВ за І квартал 2025",
    period: "Q1",
    periodLabel: "І квартал 2025",
    year: 2025,
    quarter: 1,
    deadline: "2025-05-09",
    status: "scheduled" as ReportStatus,
    statusLabel: "Заплановано",
    amountToPay: 5808,
    dataSources: ["income-book"],
    fopGroup: 3,
    formCode: "F0133108",
    history: [],
  },
];

// ============================================
// CONTRACTOR PAYMENTS
// ============================================

export const itContractorPayments: ContractorPayment[] = [
  {
    id: "cp-it-001",
    cabinetId: "demo-it-3",
    date: getDateInPast(10),
    contractor: "ФОП Литвин І.О.",
    contractorId: "c-it-3",
    purpose: "Субпідряд за лютий 2025",
    amount: 25000,
    status: "paid",
    statusLabel: "Оплачено",
    paymentPurposeType: "services",
  },
  {
    id: "cp-it-002",
    cabinetId: "demo-it-3",
    date: getDateInPast(40),
    contractor: "ФОП Литвин І.О.",
    contractorId: "c-it-3",
    purpose: "Субпідряд за січень 2025",
    amount: 25000,
    status: "paid",
    statusLabel: "Оплачено",
    paymentPurposeType: "services",
  },
];