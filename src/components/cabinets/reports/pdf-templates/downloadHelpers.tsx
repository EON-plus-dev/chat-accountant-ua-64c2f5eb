import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { Report } from "@/config/reportsConfig";
import type { Cabinet } from "@/types/cabinet";
import { EPDeclarationPDF } from "./EPDeclarationPDF";
import { ESVReportPDF } from "./ESVReportPDF";
import { OnedfReportPDF } from "./OnedfReportPDF";
import { ReceiptPDF } from "./ReceiptPDF";
import { RejectionNoticePDF } from "./RejectionNoticePDF";

function getReportTemplate(report: Report, cabinet: Cabinet): ReactElement {
  switch (report.type) {
    case "ep":
      return <EPDeclarationPDF report={report} cabinet={cabinet} />;
    case "1df":
      return <OnedfReportPDF report={report} cabinet={cabinet} />;
    case "esv":
      return <ESVReportPDF report={report} cabinet={cabinet} />;
    default:
      return <EPDeclarationPDF report={report} cabinet={cabinet} />;
  }
}

function sanitize(s: string): string {
  return s.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9]/g, "_").slice(0, 24);
}

async function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadReportPdf(report: Report, cabinet: Cabinet) {
  const blob = await pdf(getReportTemplate(report, cabinet)).toBlob();
  const fileName = `Zvit_${report.type.toUpperCase()}_${report.period.replace("-", "_")}_${sanitize(cabinet.name)}.pdf`;
  await triggerDownload(blob, fileName);
}

export async function downloadReceiptPdf(
  report: Report,
  cabinet: Cabinet,
  receiptNumber: 1 | 2,
) {
  const blob = await pdf(
    <ReceiptPDF report={report} cabinet={cabinet} receiptNumber={receiptNumber} />
  ).toBlob();
  const fileName = `Kvytancia_N${receiptNumber}_${report.type.toUpperCase()}_${report.period.replace("-", "_")}.pdf`;
  await triggerDownload(blob, fileName);
}

export async function downloadRejectionNoticePdf(
  report: Report,
  cabinet: Cabinet,
) {
  const blob = await pdf(
    <RejectionNoticePDF report={report} cabinet={cabinet} />
  ).toBlob();
  const fileName = `Vidkhylennya_${report.type.toUpperCase()}_${report.period.replace("-", "_")}.pdf`;
  await triggerDownload(blob, fileName);
}
