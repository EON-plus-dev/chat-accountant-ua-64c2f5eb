// ============================================
// CONTRACTOR CSV EXPORT
// ============================================

import type { Contractor } from "@/config/settingsConfig";

/**
 * Export contractors to CSV file and trigger download
 */
export function exportContractorsToCSV(contractors: Contractor[]): void {
  const headers = [
    "Назва",
    "Код (ЄДРПОУ/ІПН)",
    "Тип",
    "Роль",
    "IBAN",
    "Email",
    "Телефон",
    "Адреса",
    "Баланс",
    "Статус",
    "Остання активність",
    "Мітки",
  ];

  const rows = contractors.map(c => [
    c.name,
    c.code,
    c.type === "legal" ? "Юр. особа" : c.type === "fop" ? "ФОП" : "Фіз. особа",
    c.role === "buyer" ? "Покупець" : c.role === "supplier" ? "Постачальник" : c.role === "both" ? "Обидва" : "",
    c.iban || "",
    c.email || "",
    c.phone || "",
    c.address || "",
    c.balance?.toString() || "0",
    c.status === "active" ? "Активний" : c.status === "inactive" ? "Неактивний" : c.status === "blocked" ? "Заблокований" : "",
    c.lastActivityDate || "",
    c.tags?.join(", ") || "",
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(";"))
  ].join("\n");

  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `contractors_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
