import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Loader2, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from "date-fns";
import { uk } from "date-fns/locale";
import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "@/config/settingsConfig";
import type { ContractorPaymentRecord } from "@/config/contractorHistoryConfig";
import { ReconciliationActPDF } from "./ReconciliationActPDF";

interface ReconciliationActDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinet: Cabinet;
  contractor: Contractor;
  payments: ContractorPaymentRecord[];
  openingBalance?: number;
}

type PeriodPreset = "last-month" | "last-quarter" | "current-quarter" | "custom";

export const ReconciliationActDialog = ({
  open,
  onOpenChange,
  cabinet,
  contractor,
  payments,
  openingBalance = 0,
}: ReconciliationActDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>("last-quarter");
  const [customPeriod, setCustomPeriod] = useState({
    from: format(startOfQuarter(subMonths(new Date(), 3)), "yyyy-MM-dd"),
    to: format(endOfQuarter(subMonths(new Date(), 3)), "yyyy-MM-dd"),
  });

  // Calculate period based on preset
  const getPeriod = () => {
    const now = new Date();
    switch (periodPreset) {
      case "last-month":
        const lastMonth = subMonths(now, 1);
        return {
          from: format(startOfMonth(lastMonth), "yyyy-MM-dd"),
          to: format(endOfMonth(lastMonth), "yyyy-MM-dd"),
        };
      case "last-quarter":
        const lastQuarterStart = startOfQuarter(subMonths(now, 3));
        const lastQuarterEnd = endOfQuarter(subMonths(now, 3));
        return {
          from: format(lastQuarterStart, "yyyy-MM-dd"),
          to: format(lastQuarterEnd, "yyyy-MM-dd"),
        };
      case "current-quarter":
        return {
          from: format(startOfQuarter(now), "yyyy-MM-dd"),
          to: format(now, "yyyy-MM-dd"),
        };
      case "custom":
        return customPeriod;
      default:
        return customPeriod;
    }
  };

  const period = getPeriod();

  // Filter payments by period
  const filteredPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate >= new Date(period.from) && paymentDate <= new Date(period.to);
  });

  // Generate PDF
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <ReconciliationActPDF
          cabinet={cabinet}
          contractor={contractor}
          payments={filteredPayments}
          period={period}
          openingBalance={openingBalance}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      toast.success("Акт звірки згенеровано");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Помилка генерації PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download PDF
  const downloadPDF = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Акт_звірки_${contractor.name.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9]/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
    link.click();
    toast.success("PDF завантажено");
  };

  // Print PDF
  const printPDF = () => {
    if (!pdfUrl) return;
    
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  // Cleanup URL on close
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPdfUrl(null);
    }
  }, [open]);

  const periodLabel = () => {
    return `${format(new Date(period.from), "d MMM yyyy", { locale: uk })} — ${format(new Date(period.to), "d MMM yyyy", { locale: uk })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Акт звірки взаєморозрахунків
          </DialogTitle>
          <DialogDescription>
            Контрагент: <strong>{contractor.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Period Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Період</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: "last-month" as const, label: "Минулий місяць" },
                { value: "last-quarter" as const, label: "Минулий квартал" },
                { value: "current-quarter" as const, label: "Поточний квартал" },
                { value: "custom" as const, label: "Інший" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={periodPreset === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriodPreset(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {periodPreset === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Від</Label>
                  <Input
                    type="date"
                    value={customPeriod.from}
                    onChange={(e) => setCustomPeriod(p => ({ ...p, from: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">До</Label>
                  <Input
                    type="date"
                    value={customPeriod.to}
                    onChange={(e) => setCustomPeriod(p => ({ ...p, to: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{periodLabel()}</span>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Операцій за період:</span>
              <span className="font-medium">{filteredPayments.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Вхідне сальдо:</span>
              <span className="font-medium">{openingBalance.toLocaleString("uk-UA")} ₴</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Надходження:</span>
              <span className="font-medium text-green-600">
                +{filteredPayments
                  .filter(p => p.direction === "incoming" && p.status === "completed")
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString("uk-UA")} ₴
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Витрати:</span>
              <span className="font-medium text-orange-600">
                -{filteredPayments
                  .filter(p => p.direction === "outgoing" && p.status === "completed")
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString("uk-UA")} ₴
              </span>
            </div>
          </div>

          {/* PDF Preview */}
          {pdfUrl && (
            <div className="rounded-lg border overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-[300px]"
                title="Попередній перегляд акта звірки"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!pdfUrl ? (
            <Button onClick={generatePDF} disabled={isGenerating} className="w-full sm:w-auto">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Генерація...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Згенерувати
                </>
              )}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setPdfUrl(null)} className="w-full sm:w-auto">
                Змінити параметри
              </Button>
              <Button variant="outline" onClick={printPDF} className="w-full sm:w-auto">
                <Printer className="h-4 w-4 mr-2" />
                Друк
              </Button>
              <Button onClick={downloadPDF} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Завантажити PDF
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
