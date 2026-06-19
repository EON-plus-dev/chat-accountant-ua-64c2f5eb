import { useState, useEffect } from "react";
import { Calculator, AlertCircle, CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, addDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { Report } from "@/config/reportsConfig";
import { formatCurrency } from "@/lib/formatters";
import { getMilitaryTaxRate, formatTaxRate } from "@/config/taxRatesByPeriod";

interface ReportPreviewDialogProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreviewCalculation {
  income: number;
  taxRate: number;
  taxAmount: number;
  militaryTax: number;
  totalTax: number;
  esv: number;
  generationDate: Date;
}

// Mock calculation based on report type
function calculatePreview(report: Report): PreviewCalculation {
  const baseIncome = 250000; // Mock income from Income Book
  
  switch (report.type) {
    case "ep": {
      const taxRate = 5; // 3rd group default
      const taxAmount = baseIncome * (taxRate / 100);
      const militaryTax = baseIncome * 0.01;
      return {
        income: baseIncome,
        taxRate,
        taxAmount,
        militaryTax,
        totalTax: taxAmount + militaryTax,
        esv: 0,
        generationDate: addDays(new Date(report.deadline), -10),
      };
    }
    case "esv": {
      const minEsv = 1760; // Min ESV for 2025
      return {
        income: baseIncome,
        taxRate: 22,
        taxAmount: 0,
        militaryTax: 0,
        totalTax: 0,
        esv: minEsv,
        generationDate: addDays(new Date(report.deadline), -10),
      };
    }
    case "1df": {
      const employees = 3; // Mock employee count
      const totalSalary = 150000;
      const pdfo = totalSalary * 0.18;
      // Динамічна ставка ВЗ із єдиного джерела правди
      const reportYear = report.year || new Date().getFullYear();
      const reportMonth = report.month || (report.quarter ? report.quarter * 3 : 1);
      const vzRate = getMilitaryTaxRate(reportYear, reportMonth, "employee");
      const vz = totalSalary * vzRate;
      return {
        income: totalSalary,
        taxRate: 18,
        taxAmount: pdfo,
        militaryTax: vz,
        totalTax: pdfo + vz,
        esv: totalSalary * 0.22,
        generationDate: addDays(new Date(report.deadline), -10),
      };
    }
    default:
      return {
        income: baseIncome,
        taxRate: 5,
        taxAmount: baseIncome * 0.05,
        militaryTax: baseIncome * 0.01,
        totalTax: baseIncome * 0.06,
        esv: 1760,
        generationDate: addDays(new Date(), 10),
      };
  }
}

function getReportTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ep: "Єдиний податок",
    esv: "ЄСВ",
    "1df": "Податковий розрахунок (4ДФ)",
  };
  return labels[type] || type.toUpperCase();
}

export function ReportPreviewDialog({ report, open, onOpenChange }: ReportPreviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState<PreviewCalculation | null>(null);

  useEffect(() => {
    if (open && report) {
      setLoading(true);
      // Simulate AI calculation delay
      const timer = setTimeout(() => {
        setCalculation(calculatePreview(report));
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setCalculation(null);
    }
  }, [open, report]);

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-muted-foreground" />
            Попередній розрахунок
          </DialogTitle>
          <DialogDescription>
            Орієнтовні дані на основі Книги доходів. Офіційний звіт буде згенеровано автоматично.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-2 animate-pulse">
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : calculation ? (
          <div className="space-y-4">
            {/* Preview warning */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Це попередній перегляд, не офіційний документ
              </span>
            </div>

            {/* Report info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{getReportTypeLabel(report.type)}</Badge>
                <span className="text-sm font-medium">
                  Q{report.quarter} {report.year}
                </span>
              </div>
              <Badge variant="outline" className="gap-1">
                <Calculator className="h-3 w-3" />
                Попередній розрахунок
              </Badge>
            </div>

            <Separator />

            {/* Calculation breakdown */}
            <div className="space-y-3">
              {report.type === "1df" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Нарахована ЗП</span>
                    <span className="font-medium">{formatCurrency(calculation.income)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ПДФО (18%)</span>
                    <span className="font-medium">{formatCurrency(calculation.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Військовий збір ({formatTaxRate(getMilitaryTaxRate(report.year || new Date().getFullYear(), report.month || (report.quarter ? report.quarter * 3 : 1), "employee"))})
                    </span>
                    <span className="font-medium">{formatCurrency(calculation.militaryTax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Разом утримань</span>
                    <span className="text-primary">{formatCurrency(calculation.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ЄСВ (22%)</span>
                    <span>{formatCurrency(calculation.esv)}</span>
                  </div>
                </>
              ) : report.type === "esv" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Мінімальний ЄСВ</span>
                    <span className="font-medium">{formatCurrency(calculation.esv)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Розраховано на основі мінімальної заробітної плати
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Дохід за період</span>
                    <span className="font-medium">{formatCurrency(calculation.income)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Єдиний податок ({calculation.taxRate}%)
                    </span>
                    <span className="font-medium">{formatCurrency(calculation.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Військовий збір (1%)</span>
                    <span className="font-medium">{formatCurrency(calculation.militaryTax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Разом податок</span>
                    <span className="text-primary">{formatCurrency(calculation.totalTax)}</span>
                  </div>
                </>
              )}
            </div>

            <Separator />

            {/* Auto-generation info */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                Офіційний звіт буде згенеровано{" "}
                <span className="font-medium text-foreground">
                  {format(calculation.generationDate, "d MMMM yyyy", { locale: uk })}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
