import type { Cabinet } from "@/types/cabinet";
import type { CabinetRequisites } from "@/config/cabinetRequisitesDemo";

interface BuildOptions {
  shareUrl?: string;
  taxSystemLabel?: string | null;
}

/**
 * Plain-text requisites block for messengers / email.
 * Optimised for direct paste — readable as-is, no markdown.
 */
export function buildRequisitesText(
  cabinet: Cabinet,
  req: CabinetRequisites,
  opts: BuildOptions = {},
): string {
  const lines: string[] = [];
  lines.push("Реквізити для договору:");
  lines.push(req.name || cabinet.name);

  if (req.edrpou) lines.push(`ЄДРПОУ: ${req.edrpou}`);
  if (req.ipn) lines.push(`ІПН (РНОКПП): ${req.ipn}`);
  if (req.isVatPayer && req.vatNumber) lines.push(`ІПН ПДВ: ${req.vatNumber}`);
  if (opts.taxSystemLabel) lines.push(`Система оподаткування: ${opts.taxSystemLabel}`);
  if (req.legalAddress) lines.push(`Юр. адреса: ${req.legalAddress}`);
  if (req.director) {
    const pos = req.directorPosition ? `${req.directorPosition} ` : "";
    lines.push(`Керівник: ${pos}${req.director}`);
  }
  if (req.iban) lines.push(`IBAN: ${req.iban}`);
  if (req.bankName) lines.push(`Банк: ${req.bankName}`);
  if (req.email) lines.push(`Email: ${req.email}`);
  if (req.phone) lines.push(`Телефон: ${req.phone}`);

  if (opts.shareUrl) {
    lines.push("");
    lines.push(`Повна картка: ${opts.shareUrl}`);
  }

  return lines.join("\n");
}
