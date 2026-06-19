import { useState } from "react";
import { Download, FileText, Eye, Code } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  investmentPositions,
  multiLotBuyLots,
  multiLotSellPosition,
  calculateFifoResult,
  calculateDividendResult,
  calculateBondResult,
  calculateEsopResult,
  calculateYieldResult,
  calculateMultiLotFifo,
  calculatePortfolioSummary,
  type InvestmentPosition,
} from "@/config/demoCabinets/investmentData";

interface InvestorAnnualReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const allPositions: InvestmentPosition[] = [...investmentPositions, ...multiLotBuyLots, multiLotSellPosition];

function getClosedPositionRows() {
  // Standard single-lot sells
  const singleLotRows = allPositions
    .filter(p => p.operationType === "sell" && !p.relatedLotIds)
    .map(p => {
      const r = calculateFifoResult(p);
      return {
        ticker: p.ticker,
        asset: p.asset,
        buyDate: p.buyDate,
        sellDate: p.sellDate || "—",
        qty: p.buyQty,
        plUah: r?.plUah ?? 0,
        pit: r?.pit18 ?? 0,
        mil: r?.mil5 ?? 0,
      };
    });

  // Multi-lot FIFO sell (Amazon)
  const multiLotResult = calculateMultiLotFifo(multiLotBuyLots, multiLotSellPosition);
  if (multiLotResult) {
    singleLotRows.push({
      ticker: multiLotSellPosition.ticker,
      asset: multiLotSellPosition.asset,
      buyDate: "01.03–01.08.2024",
      sellDate: multiLotSellPosition.sellDate || "—",
      qty: multiLotSellPosition.buyQty,
      plUah: multiLotResult.totalPlUah,
      pit: multiLotResult.pit18,
      mil: multiLotResult.mil5,
    });
  }

  return singleLotRows;
}

function getDividendRows() {
  return allPositions
    .filter(p => p.operationType === "dividend")
    .map(p => {
      const r = calculateDividendResult(p);
      return {
        ticker: p.ticker,
        date: p.dividendDate || "—",
        gross: r?.grossUah ?? 0,
        wht: r?.creditCapped ?? 0,
        toPay: r?.toPay ?? 0,
        mil: r?.milDue ?? 0,
      };
    });
}

function generateReportHtml(): string {
  const summary = calculatePortfolioSummary(allPositions);
  const closedRows = getClosedPositionRows();
  const divRows = getDividendRows();

  return `<html><head><style>
  body { font-family: 'Times New Roman', serif; max-width: 750px; margin: 40px auto; font-size: 13px; color: #222; }
  h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
  h2 { font-size: 14px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
  th, td { border: 1px solid #bbb; padding: 5px 7px; font-size: 11px; }
  th { background: #f0f0f0; text-align: left; }
  .r { text-align: right; }
  .green { color: #16a34a; }
  .red { color: #dc2626; }
  .total { font-weight: bold; background: #fafafa; }
  .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
  .summary-item { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
  .summary-label { font-size: 10px; color: #888; }
  .summary-value { font-size: 14px; font-weight: bold; }
</style></head><body>
  <h1>РІЧНИЙ ЗВІТ ІНВЕСТОРА — 2024</h1>
  <p style="text-align:center;color:#666;">Ткаченко Ольга Вікторівна · РНОКПП: 1234567890</p>

  <div class="summary-grid">
    <div class="summary-item"><div class="summary-label">Реалізований P&L</div><div class="summary-value green">+${fmt(summary.netRealizedUah)} ₴</div></div>
    <div class="summary-item"><div class="summary-label">Дивіденди (gross)</div><div class="summary-value">${fmt(summary.totalDividendsGrossUah)} ₴</div></div>
    <div class="summary-item"><div class="summary-label">Купонний дохід</div><div class="summary-value">${fmt(summary.totalCouponIncomeUah)} ₴</div></div>
    <div class="summary-item"><div class="summary-label">ESOP бенефіт</div><div class="summary-value">${fmt(summary.totalEsopBenefitUah)} ₴</div></div>
    <div class="summary-item"><div class="summary-label">DeFi/P2P Yield</div><div class="summary-value">${fmt(summary.totalYieldIncomeUah)} ₴</div></div>
    <div class="summary-item"><div class="summary-label">Загальний податок</div><div class="summary-value red">${fmt(summary.totalTaxDue)} ₴</div></div>
  </div>

  <h2>Закриті позиції (FIFO, ст. 170.2 ПКУ)</h2>
  <table>
    <tr><th>Тікер</th><th>Актив</th><th>Купівля</th><th>Продаж</th><th class="r">К-сть</th><th class="r">P&L (₴)</th><th class="r">ПДФО</th><th class="r">ВЗ</th></tr>
    ${closedRows.map(r => `<tr>
      <td><strong>${r.ticker}</strong></td><td>${r.asset}</td><td>${r.buyDate}</td><td>${r.sellDate}</td>
      <td class="r">${r.qty}</td>
      <td class="r ${r.plUah >= 0 ? 'green' : 'red'}">${r.plUah >= 0 ? '+' : ''}${fmt(r.plUah)}</td>
      <td class="r">${fmt(r.pit)}</td><td class="r">${fmt(r.mil)}</td>
    </tr>`).join("")}
    <tr class="total"><td colspan="5">РАЗОМ</td>
      <td class="r">${fmt(closedRows.reduce((s, r) => s + r.plUah, 0))}</td>
      <td class="r">${fmt(closedRows.reduce((s, r) => s + r.pit, 0))}</td>
      <td class="r">${fmt(closedRows.reduce((s, r) => s + r.mil, 0))}</td>
    </tr>
  </table>

  <h2>Дивіденди з WHT Credit</h2>
  <table>
    <tr><th>Тікер</th><th>Дата</th><th class="r">Gross (₴)</th><th class="r">WHT залік</th><th class="r">ПДФО до сплати</th><th class="r">ВЗ</th></tr>
    ${divRows.map(r => `<tr>
      <td><strong>${r.ticker}</strong></td><td>${r.date}</td>
      <td class="r">${fmt(r.gross)}</td><td class="r">-${fmt(r.wht)}</td>
      <td class="r">${fmt(r.toPay)}</td><td class="r">${fmt(r.mil)}</td>
    </tr>`).join("")}
  </table>

  <h2>Підсумок оподаткування</h2>
  <table>
    <tr><th>Категорія</th><th class="r">ПДФО 18%</th><th class="r">ВЗ 5%</th><th class="r">Разом</th></tr>
    <tr><td>Інвестиційний прибуток</td><td class="r">${fmt(summary.totalPitInvestments)}</td><td class="r">${fmt(summary.totalMilInvestments)}</td><td class="r">${fmt(summary.totalPitInvestments + summary.totalMilInvestments)}</td></tr>
    <tr><td>Дивіденди</td><td class="r">${fmt(summary.totalPitDividends)}</td><td class="r">${fmt(summary.totalMilDividends)}</td><td class="r">${fmt(summary.totalPitDividends + summary.totalMilDividends)}</td></tr>
    <tr><td>Інше (облігації, ESOP, yield)</td><td class="r">${fmt(summary.totalPitOther)}</td><td class="r">${fmt(summary.totalMilOther)}</td><td class="r">${fmt(summary.totalPitOther + summary.totalMilOther)}</td></tr>
    <tr class="total"><td>ЗАГАЛОМ</td><td class="r">${fmt(summary.totalPitInvestments + summary.totalPitDividends + summary.totalPitOther)}</td><td class="r">${fmt(summary.totalMilInvestments + summary.totalMilDividends + summary.totalMilOther)}</td><td class="r red">${fmt(summary.totalTaxDue)}</td></tr>
  </table>

  <div class="footer">Автоматично сформовано системою · Демо-режим · ${new Date().toLocaleDateString("uk-UA")}</div>
</body></html>`;
}

export const InvestorAnnualReport = ({ open, onOpenChange }: InvestorAnnualReportProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleDownload = () => {
    const html = generateReportHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Investment_Report_2024_Tkachenko.html";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Звіт завантажено", description: "Річний звіт інвестора збережено" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Річний звіт інвестора — 2024
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Зведений P&L, дивіденди, податки
          </p>
        </SheetHeader>

        <div className="flex-1 space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Завантажити звіт
            </Button>
            <Button variant="outline" onClick={() => setPreview(preview ? null : generateReportHtml())} className="gap-2">
              <Eye className="w-4 h-4" />
              {preview ? "Закрити" : "Переглянути"}
            </Button>
          </div>

          {preview && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Code className="w-3 h-3" />
                Попередній перегляд
              </span>
              <iframe
                srcDoc={preview}
                className="w-full h-[500px] border rounded-lg bg-white"
                title="Report Preview"
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
            <p>Звіт включає: закриті позиції (FIFO), дивіденди з WHT credit, купонний дохід, ESOP/RSU, DeFi/P2P yield.</p>
            <p>Формат: HTML (можна зберегти як PDF через друк браузера).</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
