/**
 * Document Template Generator
 * Generates HTML documents from templates with field highlighting
 */

import type { DocumentType } from "./documentFlowConfig";
import type { DocumentTemplate } from "./documentTemplatesConfig";
import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "./settingsConfig";
import { getCabinetRequisites, type CabinetRequisites } from "./cabinetRequisitesDemo";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { calculatePositionTotals, calculatePositionAmounts, type ExtendedDocumentPosition } from "@/types/extendedPosition";

// ============= TYPES =============

export interface DocumentPosition {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  amount: number;
  weight?: number;
  places?: number;
  sku?: string;
  packaging?: string;
}

export type FieldStatus = "filled" | "empty" | "needs_review";
export type FieldSource = "cabinet" | "contractor" | "computed" | "manual";

export interface GeneratedField {
  id: string;
  key: string;
  label: string;
  value: string;
  source: FieldSource;
  status: FieldStatus;
  textRef: string;
  htmlId: string;
}

export interface GeneratedDocumentData {
  html: string;
  fields: GeneratedField[];
  readinessPercent: number;
  missingFields: string[];
  documentNumber: string;
}

// ============= HELPER FUNCTIONS =============

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("uk-UA", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " грн";
};

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, "dd.MM.yyyy", { locale: uk });
  } catch {
    return dateStr;
  }
};

const numberToWords = (num: number): string => {
  // Simplified implementation for demo
  const units = ["", "одна", "дві", "три", "чотири", "п'ять", "шість", "сім", "вісім", "дев'ять"];
  const teens = ["десять", "одинадцять", "дванадцять", "тринадцять", "чотирнадцять", "п'ятнадцять", "шістнадцять", "сімнадцять", "вісімнадцять", "дев'ятнадцять"];
  const tens = ["", "", "двадцять", "тридцять", "сорок", "п'ятдесят", "шістдесят", "сімдесят", "вісімдесят", "дев'яносто"];
  const thousands = ["", "тисяча", "тисячі", "тисяч"];
  
  if (num < 10) return units[num] || "нуль";
  if (num < 20) return teens[num - 10];
  if (num < 100) return `${tens[Math.floor(num / 10)]} ${units[num % 10]}`.trim();
  if (num < 1000) {
    const hundreds = ["", "сто", "двісті", "триста", "чотириста", "п'ятсот", "шістсот", "сімсот", "вісімсот", "дев'ятсот"];
    return `${hundreds[Math.floor(num / 100)]} ${numberToWords(num % 100)}`.trim();
  }
  if (num < 10000) {
    const th = Math.floor(num / 1000);
    const thIdx = th === 1 ? 1 : (th >= 2 && th <= 4 ? 2 : 3);
    return `${numberToWords(th)} ${thousands[thIdx]} ${numberToWords(num % 1000)}`.trim();
  }
  return num.toLocaleString("uk-UA");
};

const amountToWords = (amount: number): string => {
  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);
  const hryvniaForms = ["гривня", "гривні", "гривень"];
  const kopForms = ["копійка", "копійки", "копійок"];
  
  const getForm = (n: number, forms: string[]) => {
    const lastTwo = n % 100;
    if (lastTwo >= 11 && lastTwo <= 19) return forms[2];
    const last = n % 10;
    if (last === 1) return forms[0];
    if (last >= 2 && last <= 4) return forms[1];
    return forms[2];
  };
  
  return `${numberToWords(intPart)} ${getForm(intPart, hryvniaForms)} ${decPart.toString().padStart(2, "0")} ${getForm(decPart, kopForms)}`;
};

// ============= FIELD EXTRACTION =============

const extractFieldValue = (
  key: string,
  formValues: Record<string, string | number | boolean>,
  requisites: CabinetRequisites,
  contractor: Contractor | null
): { value: string; source: FieldSource } => {
  // Check form values first
  if (formValues[key] !== undefined && formValues[key] !== "") {
    const val = formValues[key];
    
    // Determine source from key prefix
    if (key.startsWith("supplier") || key === "executorName" || key === "executorCode") {
      return { value: String(val), source: "cabinet" };
    }
    if (key.startsWith("buyer") || key.startsWith("customer") || key.startsWith("recipient")) {
      return { value: String(val), source: "contractor" };
    }
    if (key === "documentNumber" || key === "total" || key === "subtotal" || key === "vatAmount") {
      return { value: String(val), source: "computed" };
    }
    return { value: String(val), source: "manual" };
  }
  
  // Cabinet fields
  const cabinetMapping: Record<string, keyof CabinetRequisites> = {
    supplierName: "name",
    supplierCode: "edrpou",
    supplierIban: "iban",
    supplierBank: "bankName",
    supplierMfo: "mfo",
    supplierAddress: "legalAddress",
    supplierPhone: "phone",
    executorName: "name",
    executorCode: "edrpou",
    executorDirector: "director",
  };
  
  if (cabinetMapping[key]) {
    const reqKey = cabinetMapping[key];
    let val = requisites[reqKey];
    // For code, try ipn if edrpou is empty
    if (!val && reqKey === "edrpou") {
      val = requisites.ipn;
    }
    if (val) {
      return { value: String(val), source: "cabinet" };
    }
  }
  
  // Contractor fields
  if (contractor) {
    const contractorMapping: Record<string, keyof Contractor> = {
      buyerName: "name",
      buyerCode: "code",
      buyerIban: "iban",
      buyerAddress: "address",
      customerName: "name",
      customerCode: "code",
      recipientName: "name",
      recipientCode: "code",
    };
    
    if (contractorMapping[key]) {
      const cKey = contractorMapping[key];
      const val = contractor[cKey];
      if (val) {
        return { value: String(val), source: "contractor" };
      }
    }
  }
  
  return { value: "", source: "manual" };
};

// ============= HTML GENERATORS =============

const generateInvoiceHtml = (
  formValues: Record<string, string | number | boolean>,
  positions: DocumentPosition[],
  requisites: CabinetRequisites,
  contractor: Contractor | null,
  fields: GeneratedField[]
): string => {
  const addField = (key: string, label: string, required: boolean = true, editable: boolean = false): string => {
    const { value, source } = extractFieldValue(key, formValues, requisites, contractor);
    const status: FieldStatus = value ? "filled" : (required ? "empty" : "needs_review");
    const id = `field-${key}`;
    
    fields.push({
      id,
      key,
      label,
      value: value || (required ? "Не заповнено" : "—"),
      source,
      status,
      textRef: value || `[${label}]`,
      htmlId: id,
    });
    
    const statusClass = status === "filled" 
      ? `data-field-status="filled"` 
      : `data-field-status="empty"`;
    
    const editableAttr = editable ? `data-editable="true"` : "";
    
    return `<span id="${id}" data-field-key="${key}" ${statusClass} ${editableAttr}>${value || `<span class="placeholder">[${label}]</span>`}</span>`;
  };
  
  const docNumber = addField("documentNumber", "Номер");
  const docDate = formValues.documentDate 
    ? formatDate(String(formValues.documentDate)) 
    : addField("documentDate", "Дата");
  
  // Use calculatePositionTotals for proper currency/discount/VAT handling
  const totals = calculatePositionTotals(positions as ExtendedDocumentPosition[]);
  const total = totals.totalGrossUAH;
  
  const positionsHtml = positions.length > 0 
    ? positions.map((pos, idx) => {
        const ext = pos as ExtendedDocumentPosition;
        const calculated = calculatePositionAmounts(ext);
        const displayAmount = calculated.grossAmountInUAH || calculated.grossAmount || pos.amount;
        return `
          <tr>
            <td class="border px-2 py-1 text-center">${idx + 1}</td>
            <td class="border px-2 py-1">${pos.name}</td>
            <td class="border px-2 py-1 text-center">${pos.unit}</td>
            <td class="border px-2 py-1 text-right">${pos.quantity}</td>
            <td class="border px-2 py-1 text-right">${formatCurrency(calculated.priceInUAH || pos.price)}</td>
            <td class="border px-2 py-1 text-right">${formatCurrency(displayAmount)}</td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="6" class="border px-2 py-4 text-center text-muted-foreground" data-field-status="empty">[Додайте позиції]</td></tr>`;

  return `
    <div class="document-content" style="font-family: 'Times New Roman', serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold mb-2">РАХУНОК-ФАКТУРА</h1>
        <p class="text-lg">№ ${docNumber} від ${docDate}</p>
      </div>
      
      <div class="mb-6">
        <h3 class="font-bold mb-2">Постачальник:</h3>
        <p>${addField("supplierName", "Назва постачальника")}</p>
        <p>ЄДРПОУ/ІПН: ${addField("supplierCode", "Код")}</p>
        <p>IBAN: ${addField("supplierIban", "IBAN")}</p>
        <p>Банк: ${addField("supplierBank", "Банк", false)}, МФО: ${addField("supplierMfo", "МФО", false)}</p>
        <p>Адреса: ${addField("supplierAddress", "Адреса", false)}</p>
        <p>Тел.: ${addField("supplierPhone", "Телефон", false)}</p>
      </div>
      
      <div class="mb-6">
        <h3 class="font-bold mb-2">Покупець:</h3>
        <p>${addField("buyerName", "Назва покупця")}</p>
        <p>ЄДРПОУ/ІПН: ${addField("buyerCode", "Код покупця")}</p>
        ${contractor?.iban ? `<p>IBAN: ${addField("buyerIban", "IBAN покупця", false)}</p>` : ""}
        <p>Адреса: ${addField("buyerAddress", "Адреса покупця", false)}</p>
      </div>
      
      <table class="w-full border-collapse mb-6" id="positions-table" data-field-key="positions" data-field-status="${positions.length > 0 ? 'filled' : 'empty'}">
        <thead>
          <tr class="bg-muted/30">
            <th class="border px-2 py-1 text-center w-12">№</th>
            <th class="border px-2 py-1 text-left">Найменування товару/послуги</th>
            <th class="border px-2 py-1 text-center w-16">Од.</th>
            <th class="border px-2 py-1 text-center w-20">К-ть</th>
            <th class="border px-2 py-1 text-right w-28">Ціна</th>
            <th class="border px-2 py-1 text-right w-28">Сума</th>
          </tr>
        </thead>
        <tbody>
          ${positionsHtml}
        </tbody>
      </table>
      
      <div class="text-right mb-6">
        <p class="text-lg"><strong>Всього:</strong> <span id="field-total" data-field-key="total" data-field-status="${total > 0 ? 'filled' : 'empty'}">${total > 0 ? formatCurrency(total) : "[Сума]"}</span></p>
        ${total > 0 ? `<p class="text-sm text-muted-foreground">(${amountToWords(total)})</p>` : ""}
      </div>
      
      ${formValues.dueDate ? `
        <div class="mb-6">
          <p><strong>Оплатити до:</strong> ${formatDate(String(formValues.dueDate))}</p>
        </div>
      ` : ""}
      
      <div class="mb-6">
        <p><strong>Умови оплати:</strong> ${addField("paymentTerms", "Умови оплати", false, true)}</p>
      </div>
      
      <div class="mb-6">
        <p><strong>Примітки:</strong> ${addField("notes", "Примітки", false, true)}</p>
      </div>
      
      <div class="mt-8 pt-4 border-t">
        <p class="mb-4"><strong>Постачальник:</strong> ___________________ ${requisites.director || "[ПІБ]"}</p>
      </div>
    </div>
  `;
};

const generateActHtml = (
  formValues: Record<string, string | number | boolean>,
  positions: DocumentPosition[],
  requisites: CabinetRequisites,
  contractor: Contractor | null,
  fields: GeneratedField[]
): string => {
  const addField = (key: string, label: string, required: boolean = true, editable: boolean = false): string => {
    const { value, source } = extractFieldValue(key, formValues, requisites, contractor);
    const status: FieldStatus = value ? "filled" : (required ? "empty" : "needs_review");
    const id = `field-${key}`;
    
    fields.push({
      id,
      key,
      label,
      value: value || (required ? "Не заповнено" : "—"),
      source,
      status,
      textRef: value || `[${label}]`,
      htmlId: id,
    });
    
    const statusClass = status === "filled" 
      ? `data-field-status="filled"` 
      : `data-field-status="empty"`;
    
    const editableAttr = editable ? `data-editable="true"` : "";
    
    return `<span id="${id}" data-field-key="${key}" ${statusClass} ${editableAttr}>${value || `<span class="placeholder">[${label}]</span>`}</span>`;
  };
  
  const docNumber = addField("documentNumber", "Номер");
  const docDate = formValues.documentDate 
    ? formatDate(String(formValues.documentDate)) 
    : addField("documentDate", "Дата");
  
  // Use calculatePositionTotals for proper currency/discount/VAT handling
  const totals = calculatePositionTotals(positions as ExtendedDocumentPosition[]);
  const total = totals.totalGrossUAH;
  
  const positionsHtml = positions.length > 0 
    ? positions.map((pos, idx) => {
        const ext = pos as ExtendedDocumentPosition;
        const calculated = calculatePositionAmounts(ext);
        const displayAmount = calculated.grossAmountInUAH || calculated.grossAmount || pos.amount;
        return `
          <tr>
            <td class="border px-2 py-1 text-center">${idx + 1}</td>
            <td class="border px-2 py-1">${pos.name}</td>
            <td class="border px-2 py-1 text-center">${pos.unit}</td>
            <td class="border px-2 py-1 text-right">${pos.quantity}</td>
            <td class="border px-2 py-1 text-right">${formatCurrency(calculated.priceInUAH || pos.price)}</td>
            <td class="border px-2 py-1 text-right">${formatCurrency(displayAmount)}</td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="6" class="border px-2 py-4 text-center text-muted-foreground" data-field-status="empty">[Додайте роботи/послуги]</td></tr>`;

  return `
    <div class="document-content" style="font-family: 'Times New Roman', serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold mb-2">АКТ ВИКОНАНИХ РОБІТ</h1>
        <p class="text-lg">№ ${docNumber} від ${docDate}</p>
        ${formValues.contractRef ? `<p class="text-sm">до Договору ${formValues.contractRef}</p>` : ""}
      </div>
      
      <div class="mb-6">
        <h3 class="font-bold mb-2">Виконавець:</h3>
        <p>${addField("executorName", "Виконавець")}</p>
        <p>ЄДРПОУ/ІПН: ${addField("executorCode", "Код")}</p>
        <p>В особі: ${addField("executorDirector", "Представник")}</p>
      </div>
      
      <div class="mb-6">
        <h3 class="font-bold mb-2">Замовник:</h3>
        <p>${addField("customerName", "Замовник")}</p>
        <p>ЄДРПОУ/ІПН: ${addField("customerCode", "Код замовника")}</p>
      </div>
      
      <p class="mb-4">Виконавець передає, а Замовник приймає виконані роботи/послуги:</p>
      
      <table class="w-full border-collapse mb-6" id="positions-table" data-field-key="positions" data-field-status="${positions.length > 0 ? 'filled' : 'empty'}">
        <thead>
          <tr class="bg-muted/30">
            <th class="border px-2 py-1 text-center w-12">№</th>
            <th class="border px-2 py-1 text-left">Найменування робіт/послуг</th>
            <th class="border px-2 py-1 text-center w-16">Од.</th>
            <th class="border px-2 py-1 text-center w-20">К-ть</th>
            <th class="border px-2 py-1 text-right w-28">Ціна</th>
            <th class="border px-2 py-1 text-right w-28">Сума</th>
          </tr>
        </thead>
        <tbody>
          ${positionsHtml}
        </tbody>
      </table>
      
      <div class="text-right mb-6">
        <p class="text-lg"><strong>Всього:</strong> <span id="field-total" data-field-key="total" data-field-status="${total > 0 ? 'filled' : 'empty'}">${total > 0 ? formatCurrency(total) : "[Сума]"}</span></p>
        ${total > 0 ? `<p class="text-sm text-muted-foreground">(${amountToWords(total)})</p>` : ""}
      </div>
      
      <p class="mb-6">Сторони претензій одна до одної не мають.</p>
      
      <div class="grid grid-cols-2 gap-8 mt-8 pt-4 border-t">
        <div>
          <p class="font-bold mb-4">ВИКОНАВЕЦЬ:</p>
          <p class="mb-2">${requisites.name}</p>
          <p>___________________ ${requisites.director || "[ПІБ]"}</p>
        </div>
        <div>
          <p class="font-bold mb-4">ЗАМОВНИК:</p>
          <p class="mb-2">${contractor?.name || "[Назва замовника]"}</p>
          <p>___________________ ${contractor?.director || "[ПІБ]"}</p>
        </div>
      </div>
    </div>
  `;
};

const generateGenericHtml = (
  documentType: DocumentType,
  formValues: Record<string, string | number | boolean>,
  positions: DocumentPosition[],
  requisites: CabinetRequisites,
  contractor: Contractor | null,
  fields: GeneratedField[]
): string => {
  const typeTitles: Record<DocumentType, string> = {
    invoice: "РАХУНОК-ФАКТУРА",
    act: "АКТ ВИКОНАНИХ РОБІТ",
    contract: "ДОГОВІР",
    waybill: "ВИДАТКОВА НАКЛАДНА",
    ttn: "ТОВАРНО-ТРАНСПОРТНА НАКЛАДНА",
    "tax-invoice": "ПОДАТКОВА НАКЛАДНА",
    "prro-receipt": "ЧЕК ПРРО",
    reconciliation: "АКТ ЗВІРКИ",
    certificate: "ДОВІДКА",
    receipt: "КВИТАНЦІЯ",
    "power-of-attorney": "ДОВІРЕНІСТЬ",
    order: "НАКАЗ",
    "employment-order": "НАКАЗ ПРО ПРИЙНЯТТЯ",
    "dismissal-order": "НАКАЗ ПРО ЗВІЛЬНЕННЯ",
    "vacation-order": "НАКАЗ ПРО ВІДПУСТКУ",
    "payment-order": "ПЛАТІЖНЕ ДОРУЧЕННЯ",
    "bank-statement": "ВИПИСКА БАНКУ",
    "rental-agreement": "ДОГОВІР ОРЕНДИ",
    "sale-agreement": "ДОГОВІР КУПІВЛІ-ПРОДАЖУ",
    "supply-contract": "ДОГОВІР ПОСТАВКИ",
    "fop-service-contract": "ДОГОВІР НА НАДАННЯ ПОСЛУГ",
    "discrepancy-act": "АКТ РОЗБІЖНОСТЕЙ",
    other: "ДОКУМЕНТ",
  };
  
  const title = typeTitles[documentType] || "ДОКУМЕНТ";
  const docNumber = formValues.documentNumber || "[Номер]";
  const docDate = formValues.documentDate ? formatDate(String(formValues.documentDate)) : "[Дата]";
  
  return `
    <div class="document-content" style="font-family: 'Times New Roman', serif; padding: 2rem; max-width: 800px; margin: 0 auto;">
      <div class="text-center mb-6">
        <h1 class="text-xl font-bold mb-2">${title}</h1>
        <p class="text-lg">№ ${docNumber} від ${docDate}</p>
      </div>
      
      <div class="mb-6">
        <p><strong>Від:</strong> ${requisites.name}</p>
        <p><strong>ЄДРПОУ/ІПН:</strong> ${requisites.edrpou || requisites.ipn || "[Код]"}</p>
      </div>
      
      ${contractor ? `
        <div class="mb-6">
          <p><strong>Для:</strong> ${contractor.name}</p>
          <p><strong>ЄДРПОУ/ІПН:</strong> ${contractor.code}</p>
        </div>
      ` : ""}
      
      <div class="mb-6 p-4 border rounded bg-muted/20 text-center">
        <p class="text-muted-foreground">Виберіть шаблон для генерації повного документа</p>
      </div>
    </div>
  `;
};

// ============= MAIN GENERATOR =============

export const generateDocumentFromForm = (
  documentType: DocumentType,
  template: DocumentTemplate | null,
  formValues: Record<string, string | number | boolean>,
  positions: DocumentPosition[],
  cabinet: Cabinet,
  contractor: Contractor | null
): GeneratedDocumentData => {
  const requisites = getCabinetRequisites(cabinet);
  const fields: GeneratedField[] = [];
  
  let html: string;
  
  switch (documentType) {
    case "invoice":
      html = generateInvoiceHtml(formValues, positions, requisites, contractor, fields);
      break;
    case "act":
      html = generateActHtml(formValues, positions, requisites, contractor, fields);
      break;
    default:
      html = generateGenericHtml(documentType, formValues, positions, requisites, contractor, fields);
  }
  
  // Add positions field if there are position columns
  if (positions.length === 0) {
    fields.push({
      id: "field-positions",
      key: "positions",
      label: "Позиції",
      value: "Не додано",
      source: "manual",
      status: "empty",
      textRef: "[Додайте позиції]",
      htmlId: "positions-table",
    });
  } else {
    fields.push({
      id: "field-positions",
      key: "positions",
      label: "Позиції",
      value: `${positions.length} поз. на ${formatCurrency(positions.reduce((s, p) => s + p.amount, 0))}`,
      source: "manual",
      status: "filled",
      textRef: "Позиції",
      htmlId: "positions-table",
    });
  }
  
  // Calculate readiness
  const requiredFields = fields.filter(f => 
    ["documentNumber", "documentDate", "supplierName", "supplierCode", "buyerName", "buyerCode", "customerName", "customerCode", "executorName", "executorCode", "positions"].includes(f.key)
  );
  const filledRequired = requiredFields.filter(f => f.status === "filled");
  const readinessPercent = requiredFields.length > 0 
    ? Math.round((filledRequired.length / requiredFields.length) * 100)
    : 100;
  
  const missingFields = fields
    .filter(f => f.status === "empty")
    .map(f => f.label);
  
  return {
    html,
    fields,
    readinessPercent,
    missingFields,
    documentNumber: String(formValues.documentNumber || ""),
  };
};

// ============= READINESS CALCULATOR =============

export interface ReadinessResult {
  percent: number;
  filledCount: number;
  totalCount: number;
  missingFields: string[];
  isReady: boolean;
}

export const calculateReadiness = (
  documentType: DocumentType,
  formValues: Record<string, string | number | boolean>,
  contractor: Contractor | null,
  positions: DocumentPosition[],
  cabinet: Cabinet
): ReadinessResult => {
  const requisites = getCabinetRequisites(cabinet);
  const checks: { key: string; label: string; isFilled: boolean }[] = [];
  
  // Type always filled
  checks.push({ key: "type", label: "Тип документа", isFilled: true });
  
  // Document number
  checks.push({ 
    key: "documentNumber", 
    label: "Номер документа", 
    isFilled: !!formValues.documentNumber 
  });
  
  // Document date
  checks.push({ 
    key: "documentDate", 
    label: "Дата документа", 
    isFilled: !!formValues.documentDate 
  });
  
  // Supplier info (from cabinet)
  checks.push({ 
    key: "supplier", 
    label: "Дані постачальника", 
    isFilled: !!(requisites.name && (requisites.edrpou || requisites.ipn)) 
  });
  
  // Contractor (for types that need it)
  const contractorTypes: DocumentType[] = ["invoice", "act", "contract", "waybill", "ttn"];
  if (contractorTypes.includes(documentType)) {
    checks.push({ 
      key: "contractor", 
      label: "Контрагент", 
      isFilled: !!contractor 
    });
  }
  
  // Positions (for types that need them)
  const positionTypes: DocumentType[] = ["invoice", "act", "waybill", "ttn"];
  if (positionTypes.includes(documentType)) {
    checks.push({ 
      key: "positions", 
      label: "Позиції", 
      isFilled: positions.length > 0 
    });
  }
  
  const filledCount = checks.filter(c => c.isFilled).length;
  const totalCount = checks.length;
  const percent = Math.round((filledCount / totalCount) * 100);
  const missingFields = checks.filter(c => !c.isFilled).map(c => c.label);
  
  return {
    percent,
    filledCount,
    totalCount,
    missingFields,
    isReady: percent === 100,
  };
};
