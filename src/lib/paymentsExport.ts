/**
 * Експорт платежів у CSV / XLSX.
 * CSV з BOM для коректного відкриття в Excel з кирилицею.
 * XLSX через SheetJS зі збереженням числових типів.
 */

import { format } from "date-fns";
import * as XLSX from "xlsx";
import {
  type UnifiedPayment,
  paymentTypeConfig,
  isContractorPayment,
  isIncomeBookRecord,
  isTaxPayment,
} from "@/config/unifiedPaymentsConfig";

function getCounterparty(payment: UnifiedPayment): string {
  const data = payment.sourceData;
  if (isContractorPayment(data)) return data.contractor;
  if (isIncomeBookRecord(data)) return data.contractor || "—";
  if (isTaxPayment(data)) return "ДПС України";
  return payment.entityName;
}

function getBasis(payment: UnifiedPayment): string {
  if (payment.relatedDocumentNumber) return `Док. №${payment.relatedDocumentNumber}`;
  if (payment.relatedReportId) return `Звіт ${payment.relatedReportId}`;
  return "";
}

function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes(";")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  "Дата",
  "Контрагент",
  "Код (ЄДРПОУ/ІПН)",
  "Призначення",
  "Підстава",
  "Тип",
  "Напрямок",
  "Сума, ₴",
  "Статус",
];

function buildRows(payments: UnifiedPayment[]) {
  return payments.map((p) => ({
    date: format(new Date(p.date), "dd.MM.yyyy"),
    counterparty: getCounterparty(p),
    code: p.entityCode ?? "",
    purpose: p.description ?? p.entityName,
    basis: getBasis(p),
    type: paymentTypeConfig[p.paymentType]?.label ?? p.paymentType,
    direction: p.direction === "in" ? "Надходження" : "Витрата",
    amountSigned: p.direction === "in" ? p.amount : -p.amount,
    status: p.statusLabel,
  }));
}

export function exportPaymentsToCSV(payments: UnifiedPayment[], filename = "payments.csv"): void {
  const rows = buildRows(payments).map((r) => [
    r.date,
    r.counterparty,
    r.code,
    r.purpose,
    r.basis,
    r.type,
    r.direction,
    (r.amountSigned >= 0 ? "+" : "") + r.amountSigned.toFixed(2),
    r.status,
  ]);

  const csvLines = [HEADERS, ...rows].map((row) => row.map(escapeCSV).join(";"));
  const csv = "\uFEFF" + csvLines.join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

export function exportPaymentsToXLSX(payments: UnifiedPayment[], filename = "payments.xlsx"): void {
  const rows = buildRows(payments);

  const aoa: (string | number)[][] = [
    HEADERS,
    ...rows.map((r) => [
      r.date,
      r.counterparty,
      r.code,
      r.purpose,
      r.basis,
      r.type,
      r.direction,
      r.amountSigned, // numeric, not string — Excel-friendly
      r.status,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths
  ws["!cols"] = [
    { wch: 12 }, // date
    { wch: 28 }, // counterparty
    { wch: 14 }, // code
    { wch: 40 }, // purpose
    { wch: 18 }, // basis
    { wch: 14 }, // type
    { wch: 13 }, // direction
    { wch: 14 }, // amount
    { wch: 16 }, // status
  ];

  // Format amount column as currency UAH
  const amountColIdx = 7; // 0-based
  for (let i = 1; i <= rows.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: i, c: amountColIdx });
    if (ws[cellRef]) {
      ws[cellRef].t = "n";
      ws[cellRef].z = '#,##0.00\\ "₴";[Red]\\-#,##0.00\\ "₴"';
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Платежі");

  // Summary sheet
  const totalIn = rows.filter(r => r.amountSigned > 0).reduce((s, r) => s + r.amountSigned, 0);
  const totalOut = rows.filter(r => r.amountSigned < 0).reduce((s, r) => s + Math.abs(r.amountSigned), 0);
  const summaryAoa: (string | number)[][] = [
    ["Показник", "Значення"],
    ["Кількість операцій", rows.length],
    ["Надходження, ₴", totalIn],
    ["Витрати, ₴", totalOut],
    ["Чистий потік, ₴", totalIn - totalOut],
    ["Дата експорту", format(new Date(), "dd.MM.yyyy HH:mm")],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(summaryAoa);
  ws2["!cols"] = [{ wch: 24 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Підсумок");

  XLSX.writeFile(wb, filename);
}

/**
 * Експорт у формат iBank2UA для пакетного імпорту в інтернет-банк.
 * Спрощений TSV-формат з ключовими полями платіжки.
 * Тільки для `direction === "out"`.
 */
export function exportPaymentsToIBank2UA(
  payments: UnifiedPayment[],
  filename = "payments_ibank2ua.txt",
): void {
  const outOnly = payments.filter((p) => p.direction === "out");
  if (outOnly.length === 0) {
    throw new Error("Немає вихідних платежів для експорту в iBank2UA");
  }

  const header = [
    "# iBank2UA Batch Payment File v1.0",
    `# Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
    `# Records: ${outOnly.length}`,
    "# Fields: DATE\tIBAN_RECEIVER\tEDRPOU\tAMOUNT\tPURPOSE",
    "",
  ].join("\r\n");

  const lines = outOnly.map((p) => {
    const date = format(new Date(p.date), "dd.MM.yyyy");
    const iban = ""; // TODO: брати з sourceData коли модель розширить IBAN отримувача
    const code = p.entityCode ?? "";
    const amount = p.amount.toFixed(2);
    const purpose = (p.description ?? p.entityName).replace(/[\t\r\n]/g, " ");
    return [date, iban, code, amount, purpose].join("\t");
  });

  const content = "\uFEFF" + header + lines.join("\r\n") + "\r\n";
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
