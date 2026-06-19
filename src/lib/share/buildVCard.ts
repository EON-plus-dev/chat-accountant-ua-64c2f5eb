import type { Cabinet } from "@/types/cabinet";
import type { CabinetRequisites } from "@/config/cabinetRequisitesDemo";

/** Build a vCard 3.0 string for downloading as `.vcf`. */
export function buildVCard(cabinet: Cabinet, req: CabinetRequisites, shareUrl?: string): string {
  const escape = (v: string) => v.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
  const name = req.name || cabinet.name;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(name)}`,
    `ORG:${escape(name)}`,
  ];
  if (req.director) lines.push(`N:${escape(req.director)};;;;`);
  if (req.directorPosition) lines.push(`TITLE:${escape(req.directorPosition)}`);
  if (req.email) lines.push(`EMAIL;TYPE=WORK:${escape(req.email)}`);
  if (req.phone) lines.push(`TEL;TYPE=WORK,VOICE:${escape(req.phone)}`);
  if (req.legalAddress) lines.push(`ADR;TYPE=WORK:;;${escape(req.legalAddress)};;;;`);
  if (shareUrl) lines.push(`URL:${escape(shareUrl)}`);
  const notes: string[] = [];
  if (req.edrpou) notes.push(`ЄДРПОУ: ${req.edrpou}`);
  if (req.ipn) notes.push(`ІПН: ${req.ipn}`);
  if (req.iban) notes.push(`IBAN: ${req.iban}`);
  if (req.bankName) notes.push(`Банк: ${req.bankName}`);
  if (req.isVatPayer && req.vatNumber) notes.push(`ІПН ПДВ: ${req.vatNumber}`);
  if (notes.length) lines.push(`NOTE:${escape(notes.join(" · "))}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(filename: string, vcard: string) {
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".vcf") ? filename : `${filename}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
