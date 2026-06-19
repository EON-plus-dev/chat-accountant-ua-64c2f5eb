/**
 * DeclarationExportDialog — підготовка даних для декларації ФОП 3 групи (Wave 3).
 *
 * Не повна декларація — підготовка цифр для перенесення в Кабінет платника або передачі бухгалтеру.
 * Агрегати: дохід за квартал/рік, ЄП 5%, ВЗ 1%, залишок ліміту.
 */

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Download, Copy, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { demoIncomeRecords } from "@/config/incomeBookConfig";
import { getFopGroupLimit } from "@/config/fopGroupLimits";
import type { Cabinet } from "@/types/cabinet";

interface DeclarationExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinet: Cabinet;
}

type Period = "q1" | "q2" | "q3" | "q4" | "year";

const periodLabels: Record<Period, string> = {
  q1: "I квартал",
  q2: "II квартал",
  q3: "III квартал",
  q4: "IV квартал",
  year: "Рік",
};

function getPeriodMonths(period: Period): number[] {
  if (period === "q1") return [0, 1, 2];
  if (period === "q2") return [3, 4, 5];
  if (period === "q3") return [6, 7, 8];
  if (period === "q4") return [9, 10, 11];
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
}

export function DeclarationExportDialog({ open, onOpenChange, cabinet }: DeclarationExportDialogProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [period, setPeriod] = useState<Period>("q1");

  const data = useMemo(() => {
    const months = getPeriodMonths(period);
    const useDemoData = cabinet.id === "2";
    const records = useDemoData ? demoIncomeRecords : [];

    const filtered = records.filter((r) => {
      if (r.status !== "income") return false;
      const d = new Date(r.date);
      return d.getFullYear() === year && months.includes(d.getMonth());
    });

    const income = filtered.reduce((s, r) => s + r.inIncomeBook, 0);
    const ep = income * 0.05; // ФОП 3 група: 5% з доходу
    const vz = income * 0.01; // ВЗ 1.5% з 2026 — поки 1% (підготовка для Кабінету платника)
    const limit = getFopGroupLimit(cabinet.fopGroup) ?? 0;

    // Дохід за весь рік (для розрахунку залишку ліміту)
    const yearIncome = records
      .filter((r) => r.status === "income" && new Date(r.date).getFullYear() === year)
      .reduce((s, r) => s + r.inIncomeBook, 0);

    return {
      income,
      ep,
      vz,
      transactionCount: filtered.length,
      limit,
      yearIncome,
      remainingLimit: Math.max(0, limit - yearIncome),
      limitPercent: limit > 0 ? (yearIncome / limit) * 100 : 0,
    };
  }, [period, year, cabinet.id, cabinet.fopGroup]);

  const handleCopy = () => {
    const text = [
      `Декларація ФОП ${cabinet.fopGroup ?? "3"} група · ${periodLabels[period]} ${year}`,
      `Дохід: ${data.income.toLocaleString("uk-UA")} ₴`,
      `ЄП (5%): ${Math.round(data.ep).toLocaleString("uk-UA")} ₴`,
      `ВЗ (1%): ${Math.round(data.vz).toLocaleString("uk-UA")} ₴`,
      `Операцій: ${data.transactionCount}`,
      `Залишок ліміту року: ${data.remainingLimit.toLocaleString("uk-UA")} ₴`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Скопійовано в буфер обміну", {
      description: "Вставте в Кабінет платника або листі бухгалтеру",
    });
  };

  const handleExportXlsx = () => {
    // Простий CSV — XLSX потребує lib; для демо зберігаємо як .csv з UTF-8 BOM (Excel розпізнає)
    const lines = [
      "Показник;Значення",
      `Період;${periodLabels[period]} ${year}`,
      `ФОП група;${cabinet.fopGroup ?? "3"}`,
      `Дохід (₴);${data.income.toLocaleString("uk-UA")}`,
      `Кількість операцій;${data.transactionCount}`,
      `ЄП 5% (₴);${Math.round(data.ep).toLocaleString("uk-UA")}`,
      `ВЗ 1% (₴);${Math.round(data.vz).toLocaleString("uk-UA")}`,
      `Дохід року (₴);${data.yearIncome.toLocaleString("uk-UA")}`,
      `Ліміт групи (₴);${data.limit.toLocaleString("uk-UA")}`,
      `Залишок ліміту (₴);${data.remainingLimit.toLocaleString("uk-UA")}`,
      `% від ліміту;${data.limitPercent.toFixed(1)}%`,
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `declaration_fop${cabinet.fopGroup ?? 3}_${period}_${year}_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Файл збережено", { description: "Можна відкрити в Excel або передати бухгалтеру" });
  };

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Декларація ФОП {cabinet.fopGroup ?? 3} група</DialogTitle>
          <DialogDescription>
            Підготовка даних для перенесення в Кабінет платника або передачі бухгалтеру.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Period selector */}
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Період</Label>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={period}
                onValueChange={(v) => v && setPeriod(v as Period)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ToggleGroupItem value="q1" className="text-xs flex-1">I кв</ToggleGroupItem>
                <ToggleGroupItem value="q2" className="text-xs flex-1">II кв</ToggleGroupItem>
                <ToggleGroupItem value="q3" className="text-xs flex-1">III кв</ToggleGroupItem>
                <ToggleGroupItem value="q4" className="text-xs flex-1">IV кв</ToggleGroupItem>
                <ToggleGroupItem value="year" className="text-xs flex-1">Рік</ToggleGroupItem>
              </ToggleGroup>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-24 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Aggregates */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Загальний дохід</span>
              <span className="font-semibold tabular-nums">₴{data.income.toLocaleString("uk-UA")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Операцій</span>
              <span className="text-sm tabular-nums">{data.transactionCount}</span>
            </div>
            <div className="border-t border-border/60 pt-2 flex items-center justify-between">
              <span className="text-sm">ЄП (5%)</span>
              <span className="font-semibold tabular-nums text-foreground">
                ₴{Math.round(data.ep).toLocaleString("uk-UA")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">ВЗ (1%)</span>
              <span className="font-semibold tabular-nums text-foreground">
                ₴{Math.round(data.vz).toLocaleString("uk-UA")}
              </span>
            </div>
            <div className="border-t border-border/60 pt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Залишок ліміту року</span>
              <span className="tabular-nums">
                ₴{data.remainingLimit.toLocaleString("uk-UA")} ({(100 - data.limitPercent).toFixed(0)}%)
              </span>
            </div>
          </div>

          {data.transactionCount === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              За цей період операцій у Книзі доходів немає.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleCopy} disabled={data.income === 0}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Скопіювати цифри
          </Button>
          <Button onClick={handleExportXlsx} disabled={data.income === 0}>
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
            Експорт XLSX
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
