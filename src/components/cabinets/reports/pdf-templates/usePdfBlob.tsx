import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { Report } from "@/config/reportsConfig";
import type { Cabinet } from "@/types/cabinet";
import { EPDeclarationPDF } from "./EPDeclarationPDF";
import { ESVReportPDF } from "./ESVReportPDF";
import { OnedfReportPDF } from "./OnedfReportPDF";

/**
 * Підбирає PDF-шаблон React-PDF за типом звіту.
 * Спільна логіка для модального прев'ю (`ReportFormPreview`) та
 * inline-прев'ю в драфті (`ReportDraftPreview`).
 */
export function getReportPdfTemplate(report: Report, cabinet: Cabinet): ReactElement {
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

interface UsePdfBlobOptions {
  /** Якщо false — генерація відкладена (lazy). Викликати після першого розкриття UI. */
  enabled: boolean;
}

interface UsePdfBlobResult {
  pdfUrl: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Лінива генерація PDF blob URL для звіту. URL автоматично revoke-ається
 * при unmount або зміні `report`/`cabinet`.
 */
export function usePdfBlob(
  report: Report,
  cabinet: Cabinet,
  { enabled }: UsePdfBlobOptions,
): UsePdfBlobResult {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const template = getReportPdfTemplate(report, cabinet);
        const blob = await pdf(template).toBlob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = url;
        setPdfUrl(url);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, report, cabinet]);

  // Revoke on unmount
  useEffect(() => {
    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, []);

  return { pdfUrl, loading, error };
}
