import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ZoomIn, ZoomOut, Printer, Download } from "lucide-react";
import type { Report } from "@/config/reportsConfig";
import type { Cabinet } from "@/types/cabinet";
import { getReportPdfTemplate, usePdfBlob } from "./pdf-templates/usePdfBlob";

interface ReportFormPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
  cabinet: Cabinet;
}

function getFormTitle(report: Report): string {
  const formCode = report.formCode || "";
  const typeNames: Record<string, string> = {
    ep: "Декларація платника єдиного податку",
    esv: "Звіт ЄСВ",
    "1df": "Податковий розрахунок (4ДФ)",
    vz: "Розрахунок військового збору",
  };
  return `${typeNames[report.type] || "Звіт"} ${formCode}`;
}

function getFileName(report: Report, cabinet: Cabinet): string {
  const periodPart = report.period.replace("-", "_");
  const typePart = report.type.toUpperCase();
  const namePart = cabinet.name.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9]/g, "_").slice(0, 20);
  return `${typePart}_${periodPart}_${namePart}.pdf`;
}

export function ReportFormPreview({
  open,
  onOpenChange,
  report,
  cabinet,
}: ReportFormPreviewProps) {
  const [zoom, setZoom] = useState(100);
  // PDF генерується тільки коли модалка відкрита
  const { pdfUrl, loading } = usePdfBlob(report, cabinet, { enabled: open });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const handlePrint = () => {
    if (pdfUrl) {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      };
    }
  };

  const template = getReportPdfTemplate(report, cabinet);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg">{getFormTitle(report)}</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-14 text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={loading || !pdfUrl}
            >
              <Printer className="h-4 w-4 mr-2" />
              Друк
            </Button>

            <PDFDownloadLink
              document={template}
              fileName={getFileName(report, cabinet)}
            >
              {({ loading: downloadLoading }) => (
                <Button
                  variant="default"
                  size="sm"
                  disabled={downloadLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloadLoading ? "Генерація..." : "Завантажити PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto bg-muted/50 p-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Генерація форми...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div
              className="flex justify-center"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
            >
              <iframe
                src={pdfUrl}
                className="w-[595px] h-[842px] bg-white shadow-lg border rounded"
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                Помилка генерації PDF
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
