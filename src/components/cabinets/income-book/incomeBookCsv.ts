// CSV export helpers for Income Book records (RFC 4180 with `;` separator + BOM for Excel UA).
import {
  type IncomeBookRecord,
  getStatusLabel,
  getSourceLabel,
} from "@/config/incomeBookConfig";

const csvCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const formatDateForCsv = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

export const buildIncomeBookCsv = (records: IncomeBookRecord[]): string => {
  const headers = [
    "Дата",
    "Опис",
    "Контрагент",
    "Код",
    "Сума",
    "Знак",
    "У книзі доходу",
    "Тип оплати",
    "Джерело",
    "Статус",
    "Категорія",
    "ID операції",
  ];
  const rows = records.map((r) => {
    const sign = r.status === "return" ? "−" : "+";
    const inBook = r.status === "income" || r.status === "return" ? "так" : "ні";
    return [
      formatDateForCsv(r.date),
      r.description,
      r.contractor || "",
      r.contractorCode || "",
      r.amount.toFixed(2).replace(".", ","),
      sign,
      inBook,
      r.paymentType,
      getSourceLabel(r.source),
      getStatusLabel(r.status),
      r.categoryCode || "",
      r.txnId || r.id,
    ].map(csvCell).join(";");
  });
  return "\uFEFF" + [headers.map(csvCell).join(";"), ...rows].join("\r\n");
};

export const downloadCsvBlob = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const sanitizeFilenameFragment = (label: string): string =>
  label.replace(/[^\p{L}\p{N}_-]+/gu, "_").toLowerCase();
