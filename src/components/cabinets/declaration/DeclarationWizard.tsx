import { useState, useMemo } from "react";
import { CheckCircle2, ChevronRight, Download, Eye, FileText, Gift, Sparkles, Code, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  investmentPositions,
  calculateFifoResult,
  type InvestmentPosition,
} from "@/config/demoCabinets/investmentData";

interface DeclarationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Demo income sources
const incomeSources = [
  { id: "src-1", label: "Інвестиції IBKR (акції)", amount: 164800, tax: 29664, checked: true },
  { id: "src-2", label: "Дивіденди IBKR (MSFT)", amount: 16480, tax: 494, checked: true },
  { id: "src-3", label: "Зарплата Польща (КУПО)", amount: 720000, tax: 43200, checked: true },
  { id: "src-4", label: "Оренда квартири", amount: 96000, tax: 17280, checked: true },
  { id: "src-5", label: "Продаж авто (0%)", amount: 380000, tax: 0, checked: true },
  { id: "src-6", label: "Фріланс ЦПД", amount: 45000, tax: 0, checked: true },
  { id: "src-7", label: "Подарунок від матері (0%)", amount: 50000, tax: 0, checked: true },
];

const taxDiscountItems = [
  { id: "disc-1", label: "Навчання (Діджитал Академія)", amount: 66000, discount: 11880 },
  { id: "disc-2", label: "Медицина (стоматологія)", amount: 18500, discount: 720 },
];

const fmt = (n: number) =>
  n.toLocaleString("uk-UA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const STEPS = [
  { label: "Джерела доходу", description: "Оберіть джерела" },
  { label: "Розрахунки", description: "Перевірте суми" },
  { label: "Податкова знижка", description: "Витрати на знижку" },
  { label: "Підсумок", description: "Формування" },
];

function generateXmlBlob(
  sources: typeof incomeSources,
  totalIncome: number,
  totalTax: number,
  totalDiscount: number,
): Blob {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DECLAR xmlns="http://tax.gov.ua/F0100114">
  <DECLARHEAD>
    <TIN>1234567890</TIN>
    <C_DOC>F01</C_DOC>
    <C_DOC_SUB>001</C_DOC_SUB>
    <C_DOC_VER>14</C_DOC_VER>
    <C_DOC_STAN>1</C_DOC_STAN>
    <PERIOD_YEAR>2025</PERIOD_YEAR>
    <D_FILL>${new Date().toISOString().split("T")[0]}</D_FILL>
  </DECLARHEAD>
  <DECLARBODY>
    <HNAME>Ткаченко Ольга Вікторівна</HNAME>
    <HTIN>1234567890</HTIN>
${sources
  .filter((s) => s.checked)
  .map(
    (s, i) => `    <R0${String(i + 1).padStart(2, "0")}>
      <C1>${s.label}</C1>
      <C2>${s.amount}</C2>
      <C3>${s.tax}</C3>
    </R0${String(i + 1).padStart(2, "0")}>`
  )
  .join("\n")}
    <R_TOTAL_INCOME>${totalIncome}</R_TOTAL_INCOME>
    <R_TOTAL_TAX>${totalTax}</R_TOTAL_TAX>
    <R_DISCOUNT>${totalDiscount}</R_DISCOUNT>
    <R_NET_TAX>${Math.max(0, totalTax - totalDiscount)}</R_NET_TAX>
  </DECLARBODY>
</DECLAR>`;
  return new Blob([xml], { type: "application/xml" });
}

function generatePdfPreviewHtml(
  sources: typeof incomeSources,
  totalIncome: number,
  totalTax: number,
  totalDiscount: number,
): string {
  const netTax = Math.max(0, totalTax - totalDiscount);
  return `
<html><head><style>
  body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 40px auto; font-size: 13px; color: #222; }
  h1 { text-align: center; font-size: 16px; margin-bottom: 4px; }
  h2 { text-align: center; font-size: 13px; font-weight: normal; color: #555; margin-top: 0; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; font-size: 12px; }
  th { background: #f5f5f5; }
  .right { text-align: right; }
  .total { font-weight: bold; background: #fafafa; }
  .footer { margin-top: 40px; font-size: 11px; color: #888; text-align: center; }
</style></head><body>
  <h1>ДЕКЛАРАЦІЯ ПРО МАЙНОВИЙ СТАН І ДОХОДИ</h1>
  <h2>Форма F0100114 · Звітний рік: 2025</h2>
  <p><strong>ПІБ:</strong> Ткаченко Ольга Вікторівна &nbsp; <strong>РНОКПП:</strong> 1234567890</p>
  <table>
    <thead><tr><th>Джерело доходу</th><th class="right">Дохід (₴)</th><th class="right">ПДФО (₴)</th></tr></thead>
    <tbody>
      ${sources.filter(s => s.checked).map(s => `<tr><td>${s.label}</td><td class="right">${fmt(s.amount)}</td><td class="right">${fmt(s.tax)}</td></tr>`).join("")}
      <tr class="total"><td>РАЗОМ</td><td class="right">${fmt(totalIncome)}</td><td class="right">${fmt(totalTax)}</td></tr>
    </tbody>
  </table>
  ${totalDiscount > 0 ? `<p><strong>Податкова знижка (ст. 166 ПКУ):</strong> −${fmt(totalDiscount)} ₴</p>` : ""}
  <p><strong>ПДФО до сплати:</strong> ${fmt(netTax)} ₴</p>
  <p><strong>Дедлайн подання:</strong> 01.05.2026 &nbsp; <strong>Дедлайн сплати:</strong> 31.07.2026</p>
  <div class="footer">Автоматично сформовано системою · Демо-режим</div>
</body></html>`;
}

export function DeclarationWizard({ open, onOpenChange }: DeclarationWizardProps) {
  const [step, setStep] = useState(0);
  const [sources, setSources] = useState(incomeSources);
  const [discounts, setDiscounts] = useState(taxDiscountItems.map(d => ({ ...d, checked: true })));
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);

  const toggleSource = (id: string) => {
    setSources(s => s.map(src => src.id === id ? { ...src, checked: !src.checked } : src));
  };
  const toggleDiscount = (id: string) => {
    setDiscounts(d => d.map(disc => disc.id === id ? { ...disc, checked: !disc.checked } : disc));
  };

  const checkedSources = sources.filter(s => s.checked);
  const totalIncome = checkedSources.reduce((s, r) => s + r.amount, 0);
  const totalTax = checkedSources.reduce((s, r) => s + r.tax, 0);
  const totalDiscount = discounts.filter(d => d.checked).reduce((s, d) => s + d.discount, 0);
  const netTax = Math.max(0, totalTax - totalDiscount);

  const handleDownloadXml = () => {
    const blob = generateXmlBlob(sources, totalIncome, totalTax, totalDiscount);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "F0100114_2025_Tkachenko.xml";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "XML F0100114", description: "Файл декларації завантажено" });
  };

  const handlePreviewPdf = () => {
    const html = generatePdfPreviewHtml(sources, totalIncome, totalTax, totalDiscount);
    setPdfPreview(html);
  };

  const closePdfPreview = () => setPdfPreview(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Формування декларації F0100114
          </SheetTitle>
          <p className="text-sm text-muted-foreground">2025 рік · Ткаченко О.В.</p>
        </SheetHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 transition-colors",
                  i === step && "bg-primary text-primary-foreground",
                  i < step && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                  i > step && "text-muted-foreground"
                )}
              >
                {i < step ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-4 text-center">{i + 1}</span>}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />}
            </div>
          ))}
        </div>

        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1 mb-4" />

        <div className="flex-1 space-y-4">
          {/* Step 1: Income sources */}
          {step === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Оберіть джерела доходу для декларації:</h3>
              {sources.map((src) => (
                <label
                  key={src.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    src.checked ? "border-primary/40 bg-primary/5" : "border-border"
                  )}
                >
                  <Checkbox
                    checked={src.checked}
                    onCheckedChange={() => toggleSource(src.id)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{src.label}</div>
                    <div className="text-xs text-muted-foreground">
                      Дохід: {fmt(src.amount)} ₴ · ПДФО: {fmt(src.tax)} ₴
                    </div>
                  </div>
                </label>
              ))}
              <div className="text-sm font-semibold p-3 bg-muted/50 rounded-lg flex justify-between">
                <span>Обрано джерел: {checkedSources.length}</span>
                <span>Загальний дохід: {fmt(totalIncome)} ₴</span>
              </div>
            </div>
          )}

          {/* Step 2: Calculations */}
          {step === 1 && (
            <InvestmentDetailStep checkedSources={checkedSources} totalTax={totalTax} />
          )}

          {/* Step 3: Tax discount */}
          {step === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Податкова знижка (ст. 166 ПКУ)
              </h3>
              {discounts.map((d) => (
                <label
                  key={d.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    d.checked ? "border-emerald-400/40 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border"
                  )}
                >
                  <Checkbox
                    checked={d.checked}
                    onCheckedChange={() => toggleDiscount(d.id)}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="text-xs text-muted-foreground">
                      Витрати: {fmt(d.amount)} ₴ · Знижка: {fmt(d.discount)} ₴
                    </div>
                  </div>
                </label>
              ))}
              <div className="text-sm font-semibold p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>Потенційне повернення:</span>
                <span>{fmt(totalDiscount)} ₴</span>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Підсумок декларації
              </h3>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Загальний дохід:</span>
                    <span className="font-semibold">{fmt(totalIncome)} ₴</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ПДФО нарахований:</span>
                    <span>{fmt(totalTax)} ₴</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Податкова знижка:</span>
                    <span>−{fmt(totalDiscount)} ₴</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>До сплати ПДФО:</span>
                    <span>{fmt(netTax)} ₴</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2">
                <Button onClick={handleDownloadXml} className="gap-2">
                  <Download className="w-4 h-4" />
                  Завантажити XML (F0100114)
                </Button>
                <Button variant="outline" onClick={handlePreviewPdf} className="gap-2">
                  <Eye className="w-4 h-4" />
                  PDF-прев'ю декларації
                </Button>
              </div>

              {/* PDF Preview iframe */}
              {pdfPreview && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Code className="w-3 h-3" />
                      Попередній перегляд
                    </span>
                    <Button variant="ghost" size="sm" onClick={closePdfPreview} className="h-6 text-xs">
                      Закрити
                    </Button>
                  </div>
                  <iframe
                    srcDoc={pdfPreview}
                    className="w-full h-[400px] border rounded-lg bg-white"
                    title="PDF Preview"
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                <strong>Форма:</strong> F0100114 · <strong>Дедлайн:</strong> 01.05.2026 · <strong>Подання:</strong> Кабінет платника ДПС або Дія
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            Назад
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Далі
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Готово
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---- D.2: Investment Detail Step with itemized closed positions ----

function InvestmentDetailStep({ checkedSources, totalTax }: { checkedSources: typeof incomeSources; totalTax: number }) {
  const [expandInvestments, setExpandInvestments] = useState(false);

  const closedPositions = useMemo(() => {
    return investmentPositions
      .filter(p => p.operationType === "sell")
      .map(p => {
        const r = calculateFifoResult(p);
        return { ticker: p.ticker, buyDate: p.buyDate, sellDate: p.sellDate || "—", plUah: r?.plUah ?? 0, pit: r?.pit18 ?? 0 };
      });
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Перевірте розрахунки по кожній категорії:</h3>
      {checkedSources.map((src) => (
        <div key={src.id}>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm">
            <div className="flex items-center gap-2">
              <span>{src.label}</span>
              {src.id === "src-1" && closedPositions.length > 0 && (
                <button
                  onClick={() => setExpandInvestments(!expandInvestments)}
                  className="text-xs text-primary flex items-center gap-0.5"
                >
                  <ChevronDown className={cn("w-3 h-3 transition-transform", expandInvestments && "rotate-180")} />
                  Деталі
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">{fmt(src.amount)} ₴</span>
              <Badge variant={src.tax > 0 ? "destructive" : "success"} size="sm">
                {src.tax > 0 ? fmt(src.tax) + " ₴" : "0% ПДФО"}
              </Badge>
            </div>
          </div>
          {src.id === "src-1" && expandInvestments && (
            <div className="ml-4 mt-1 space-y-1">
              {closedPositions.map((cp, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/20">
                  <span className="font-medium">{cp.ticker}</span>
                  <span className="text-muted-foreground">{cp.buyDate} → {cp.sellDate}</span>
                  <span className={cp.plUah >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                    {cp.plUah >= 0 ? "+" : ""}{fmt(cp.plUah)} ₴
                  </span>
                  <span className="text-muted-foreground">{fmt(cp.pit)} ₴</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <Separator />
      <div className="flex justify-between p-3 bg-muted/50 rounded-lg font-semibold text-sm">
        <span>Разом ПДФО:</span>
        <span>{fmt(totalTax)} ₴</span>
      </div>
    </div>
  );
}
