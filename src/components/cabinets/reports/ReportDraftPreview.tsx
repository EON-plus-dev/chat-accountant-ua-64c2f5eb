import { useState } from "react";
import { FileText, Building2, AlertTriangle, Info, ChevronDown, ChevronRight, Download, Printer, Loader2, Users, ExternalLink } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Report } from "@/config/reportsConfig";
import {
  reportFormConfigs,
  reportTypeConfig,
  legalBasisConfig,
  migrateReportStatus,
  getRequisitesMode,
} from "@/config/reportsConfig";
import { mockCabinets } from "@/config/cabinetsData";
import type { Cabinet } from "@/types/cabinet";
import { formatCurrency } from "@/lib/formatters";
import { getMilitaryTaxRate, formatTaxRate } from "@/config/taxRatesByPeriod";
import { getEmployeesForCabinet } from "@/config/employeesConfig";
import { PaymentRequisitesBlock } from "./PaymentRequisitesBlock";
import { ScheduledReportPlaceholder } from "./ScheduledReportPlaceholder";
import { usePdfBlob, getReportPdfTemplate } from "./pdf-templates/usePdfBlob";

interface ReportDraftPreviewProps {
  report: Report;
  /** Якщо передано — використовується замість дефолтного callback. Потрібен для статусу `scheduled`. */
  onCreateDraft?: (report: Report) => void;
  /** Якщо передано — ПІБ працівників у preview-списку стають клікабельними (відкривають профіль). */
  onNavigateToEmployee?: (employeeId: string) => void;
}

/**
 * Підбирає офіційну форму ДПС для типу/періоду звіту.
 * Для ЄП: квартальна (F0103308) для 3-ї групи, річна (F0103406) для 1-2 групи.
 */
function getFormConfig(report: Report) {
  if (report.formCode) {
    const direct = Object.values(reportFormConfigs).find((f) => f.formCode === report.formCode);
    if (direct) return direct;
  }
  if (report.type === "ep") {
    return report.fopGroup && report.fopGroup < 3
      ? reportFormConfigs["ep-y12"]
      : reportFormConfigs["ep-q3"];
  }
  if (report.type === "1df") return reportFormConfigs["1df"];
  if (report.type === "esv" || report.type === "esv-emp") return reportFormConfigs[report.type];
  if (report.type === "mpz") return reportFormConfigs["mpz"];
  if (report.type === "vz" || report.type === "vz-emp") return reportFormConfigs["vz"];
  return undefined;
}

function FieldRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-foreground" : "text-foreground font-medium"}>{value}</span>
    </div>
  );
}

export function ReportDraftPreview({ report, onCreateDraft, onNavigateToEmployee }: ReportDraftPreviewProps) {
  const cabinet = mockCabinets.find((c) => c.id === report.cabinetId);
  const form = getFormConfig(report);
  const typeConf = reportTypeConfig[report.type];
  const legal = legalBasisConfig[report.type];
  const normalizedStatus = migrateReportStatus(report.status);
  const requisitesMode = getRequisitesMode(report.status);

  // Inline-прев'ю офіційної форми ДПС (А1) — згорнуте за замовчуванням, lazy-генерація
  const [showInlinePdf, setShowInlinePdf] = useState(false);
  const { pdfUrl, loading: pdfLoading } = usePdfBlob(
    report,
    cabinet as Cabinet,
    { enabled: showInlinePdf && !!cabinet },
  );

  const taxIdLabel = cabinet?.type === "fop" || cabinet?.type === "individual" ? "ІПН" : "ЄДРПОУ";

  // Для запланованих та оброблюваних звітів показуємо плейсхолдер замість порожньої форми ДПС.
  // Це усуває джерело основної скарги: «на запланованих звітах вже QR і реквізити».
  if (normalizedStatus === "scheduled" || normalizedStatus === "processing") {
    return <ScheduledReportPlaceholder report={report} onCreateDraft={onCreateDraft} />;
  }

  // Динамічні підписи залежно від статусу — заголовок не повинен бути «Чернетка», коли звіт уже подано/прийнято
  const headerLabel =
    normalizedStatus === "accepted" ? "Прийнята форма · ДПС України"
    : normalizedStatus === "submitted" ? "Подана форма · ДПС України"
    : normalizedStatus === "rejected" ? "Відхилена форма · ДПС України"
    : "Чернетка звіту · ДПС України";

  return (
    <div className="border rounded-lg bg-background overflow-hidden">
      {/* Шапка офіційної форми */}
      <div className="bg-muted/40 border-b px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-md bg-background border shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                {headerLabel}
              </p>
              <h3 className="text-sm font-semibold leading-snug mt-0.5">
                {form?.formName ?? typeConf.label}
              </h3>
              {form?.formCode && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="outline" className="font-mono text-[11px] h-5">
                    Код: {form.formCode}
                  </Badge>
                  {form.formVersion && (
                    <span className="text-[11px] text-muted-foreground">
                      Версія {form.formVersion}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Платник */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Платник податків
            </h4>
          </div>
          <div className="space-y-0.5">
            {/* Найменування ФОП — вже у шапці кабінету; тут лише специфічні для форми реквізити */}
            <FieldRow label={taxIdLabel} value={cabinet?.taxId ?? "—"} mono />
            {cabinet?.type === "fop" && cabinet.fopGroup && (
              <FieldRow label="Група ФОП" value={`${cabinet.fopGroup} група`} />
            )}
            <FieldRow label="Звітний період" value={report.periodLabel} />
          </div>
        </section>

        <Separator />

        {/* Показники — залежно від типу */}
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Показники розрахунку
          </h4>

          {!report.calculation && !(typeof report.amountToPay === "number" && report.amountToPay > 0) && (
            <div className="text-sm text-muted-foreground italic p-3 bg-muted/30 rounded-md">
              Дані для розрахунку відсутні. Заповніть дохід / працівників у відповідному розділі.
            </div>
          )}

          {!report.calculation && typeof report.amountToPay === "number" && report.amountToPay > 0 && (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 font-semibold">Сума за поданою формою</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {formatCurrency(report.amountToPay)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[11px] text-muted-foreground px-3 py-2 bg-muted/10">
                Деталізацію розрахунку за позиціями збережено в архіві звіту.
              </p>
            </div>
          )}

          {report.calculation?.type === "ep" && (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  <tr>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">Рядок 08 — Загальний дохід</span>
                      <span className="text-[11px] text-muted-foreground/70 ml-1">· ст.292 ПКУ</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(report.calculation.data.totalIncome)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">Рядок 10 — Ставка ЄП</span>
                      <span className="text-[11px] text-muted-foreground/70 ml-1">· п.293.3</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {report.calculation.data.taxRate}%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">Рядок 11 — Сума податку</span>
                      <span className="text-[11px] text-muted-foreground/70 ml-1">· п.295.1</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {formatCurrency(report.calculation.data.calculatedTax)}
                    </td>
                  </tr>
                  {report.militaryTax && (
                    <tr>
                      <td className="px-3 py-2">
                        <span className="text-muted-foreground">
                          Військовий збір ({formatTaxRate(report.militaryTax.rate)})
                        </span>
                        <span className="text-[11px] text-muted-foreground/70 ml-1">· п.16¹ підрозд. 10</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatCurrency(report.militaryTax.calculatedVZ)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {report.calculation?.type === "1df" && (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  <tr>
                    <td className="px-3 py-2 text-muted-foreground">Кількість працівників</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {report.calculation.data.employeesCount}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-muted-foreground">Загальна нарахована ЗП</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(report.calculation.data.totalSalary)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">Рядок 3а — ПДФО (18%)</span>
                      <span className="text-[11px] text-muted-foreground/70 ml-1">· код доходу 101</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(report.calculation.data.pdfo)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">
                        Рядок 3б — ВЗ ({formatTaxRate(getMilitaryTaxRate(report.year, report.month ?? (report.quarter ? report.quarter * 3 : 1), "employee"))})
                      </span>
                      <span className="text-[11px] text-muted-foreground/70 ml-1">· код 101</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(report.calculation.data.vz)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">Рядок 1 — ЄСВ роботодавця (22%)</span>
                      <span className="text-[11px] text-muted-foreground/70 ml-1">· ЗУ №2464-VI</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(report.calculation.data.esv)}
                    </td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 font-semibold">Усього податків</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {formatCurrency(report.calculation.data.totalTaxes)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {report.calculation?.type === "esv" && (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  <tr>
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">Рядок 1 — Мінімальний страховий внесок</span>
                      <span className="text-[11px] text-muted-foreground/70 ml-1">· ЗУ №2464-VI</span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(report.calculation.data.minContribution)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-muted-foreground">Кількість місяців</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {report.calculation.data.monthsCount}
                    </td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 font-semibold">Сума ЄСВ до сплати</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {formatCurrency(report.calculation.data.toPay)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {report.calculation?.type === "vz" && (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  <tr>
                    <td className="px-3 py-2 text-muted-foreground">База оподаткування</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatCurrency(report.calculation.data.baseAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-muted-foreground">
                      Ставка ВЗ ({formatTaxRate(report.calculation.data.rate)})
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatTaxRate(report.calculation.data.rate)}
                    </td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="px-3 py-2 font-semibold">Сума ВЗ до сплати</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">
                      {formatCurrency(report.calculation.data.toPay)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* А3 — Розклад 4ДФ за розділами (тільки для типу `1df`).
            Без дублювання повної таблиці працівників — це робить EmployeesLinkedSection
            нижче. Тут — стислий «бланковий» recap із сумами по розділах I/II/III. */}
        {report.calculation?.type === "1df" && cabinet && (() => {
          const calc = report.calculation.data;
          const employees = getEmployeesForCabinet(report.cabinetId).filter(
            (e) => e.status === "active" || e.status === "probation",
          );
          const previewEmployees = employees.slice(0, 3);
          const restCount = Math.max(0, employees.length - previewEmployees.length);
          return (
            <>
              <Separator />
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Розклад за розділами форми 4ДФ
                  </h4>
                </div>

                <div className="rounded-md border divide-y text-sm">
                  {/* Розділ I */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Розділ I — Нараховано фізособам</span>
                      <span className="font-mono text-muted-foreground text-xs">
                        код доходу 101
                      </span>
                    </div>
                    {previewEmployees.length > 0 ? (
                      <ul className="space-y-1 pl-1">
                        {previewEmployees.map((emp) => (
                          <li
                            key={emp.id}
                            className="flex items-center justify-between text-xs"
                          >
                            {onNavigateToEmployee ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToEmployee(emp.id);
                                }}
                                className="text-left text-muted-foreground hover:text-primary hover:underline transition-colors inline-flex items-center gap-1 group min-w-0"
                              >
                                <span className="truncate">
                                  • {emp.fullName}
                                  <span className="text-muted-foreground/60 ml-1 group-hover:text-primary/70">
                                    ({emp.position})
                                  </span>
                                </span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </button>
                            ) : (
                              <span className="text-muted-foreground truncate">
                                • {emp.fullName}
                                <span className="text-muted-foreground/60 ml-1">
                                  ({emp.position})
                                </span>
                              </span>
                            )}
                            <span className="font-mono shrink-0 ml-2">
                              {formatCurrency(calc.totalSalary / employees.length)}
                            </span>
                          </li>
                        ))}
                        {restCount > 0 && (
                          <li className="text-xs text-muted-foreground italic pl-2">
                            … та ще {restCount} прац. — повний список нижче
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Працівники не додані до кабінету
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1.5 border-t text-xs">
                      <span className="font-medium">Усього по Розділу I</span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(calc.totalSalary)}
                      </span>
                    </div>
                  </div>

                  {/* Розділ II */}
                  <div className="p-3 flex items-center justify-between text-sm">
                    <span>
                      Розділ II — Військовий збір
                      <span className="text-[11px] text-muted-foreground/70 ml-1">· п.16¹ підрозд. 10</span>
                    </span>
                    <span className="font-mono">{formatCurrency(calc.vz)}</span>
                  </div>

                  {/* Розділ III */}
                  <div className="p-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Розділ III — Зміни/уточнення</span>
                    <span className="text-xs italic">не заповнюється</span>
                  </div>
                </div>
              </section>
            </>
          );
        })()}

        {/* А1 — Inline-прев'ю офіційної форми ДПС (PDF). Згорнуте за замовчуванням,
            генерація blob — тільки після першого розкриття (lazy через usePdfBlob). */}
        {cabinet && (
          <>
            <Separator />
            <section>
              <button
                type="button"
                onClick={() => setShowInlinePdf((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md border hover:bg-muted/50 transition-colors"
                aria-expanded={showInlinePdf}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">
                    Офіційна форма ДПС{form?.formCode ? ` · ${form.formCode}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {showInlinePdf ? "Сховати" : "Показати форму"}
                  </span>
                  {showInlinePdf ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {showInlinePdf && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-md border bg-muted/30 overflow-hidden h-[600px] flex items-center justify-center">
                    {pdfLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Генерація PDF…</p>
                      </div>
                    ) : pdfUrl ? (
                      <iframe
                        src={pdfUrl}
                        title={`Форма ДПС ${form?.formCode ?? ""}`}
                        className="w-full h-full border-0 bg-background"
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Не вдалося згенерувати PDF
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pdfUrl}
                      onClick={() => {
                        if (!pdfUrl) return;
                        const iframe = document.createElement("iframe");
                        iframe.style.display = "none";
                        iframe.src = pdfUrl;
                        document.body.appendChild(iframe);
                        iframe.onload = () => {
                          iframe.contentWindow?.print();
                          setTimeout(() => document.body.removeChild(iframe), 1000);
                        };
                      }}
                    >
                      <Printer className="h-3.5 w-3.5 mr-1.5" />
                      Друк
                    </Button>
                    <PDFDownloadLink
                      document={getReportPdfTemplate(report, cabinet as Cabinet)}
                      fileName={`Forma_${(form?.formCode ?? report.type).toUpperCase()}_${report.period.replace("-", "_")}.pdf`}
                    >
                      {({ loading }) => (
                        <Button variant="default" size="sm" disabled={loading}>
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          {loading ? "Генерація…" : "Завантажити PDF"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* Банер для МПЗ */}
        {report.type === "mpz" && (
          <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold">Мораторій на час воєнного стану</p>
              <p className="mt-0.5">
                Дія МПЗ призупинена для деяких категорій земель (ЗУ №2120-IX). Перевірте,
                чи поширюється звільнення на ваші ділянки перед поданням.
              </p>
            </div>
          </div>
        )}

        {/* Підсумок «До сплати» — показуємо ЛИШЕ для draft/review, де ще немає блоку «Платежі»
            праворуч. Для submitted/accepted сума живе у RelatedPaymentsSection, тож тут її ховаємо,
            щоб не дублювати на екрані тричі (D1). */}
        {requisitesMode !== "hidden"
          && !["submitted", "accepted"].includes(normalizedStatus)
          && typeof report.amountToPay === "number"
          && report.amountToPay > 0 && (
          <>
            <Separator />
            <section className="flex items-center justify-between p-3 rounded-md bg-primary/5 border border-primary/20">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Усього до сплати</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {requisitesMode === "preview"
                    ? "Сплачуйте після подання звіту та отримання квитанції №1"
                    : `Термін до ${new Date(report.deadline).toLocaleDateString("uk-UA")}`}
                </p>
              </div>
              <p className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(report.amountToPay)}
              </p>
            </section>
          </>
        )}

        {/* Реквізити для сплати — видимість контролюється через requisitesMode */}
        {requisitesMode !== "hidden" && <Separator />}
        <PaymentRequisitesBlock
          mode={requisitesMode}
          reportType={report.type}
          periodLabel={report.periodLabel}
          payerName={cabinet?.name}
          payerTaxId={cabinet?.taxId}
          amounts={{
            ep:
              report.calculation?.type === "ep"
                ? report.calculation.data.calculatedTax
                : undefined,
            militaryFop:
              report.calculation?.type === "ep"
                ? report.militaryTax?.calculatedVZ
                : undefined,
            esv:
              report.calculation?.type === "esv"
                ? report.calculation.data.toPay
                : undefined,
            pdfo:
              report.calculation?.type === "1df"
                ? report.calculation.data.pdfo
                : undefined,
            militaryEmp:
              report.calculation?.type === "1df"
                ? report.calculation.data.vz
                : report.calculation?.type === "vz"
                ? report.calculation.data.toPay
                : undefined,
            esvEmployer:
              report.calculation?.type === "1df"
                ? report.calculation.data.esv
                : undefined,
          }}
        />

        {/* Законодавча підстава. Дедлайн подання ховаємо для submitted/accepted —
            подання вже відбулось, нагадування про термін лише плутає (N7). */}
        {legal && (
          <div className="text-[11px] text-muted-foreground border-t pt-3">
            <span className="font-semibold">Підстава:</span> {legal.article}
            {legal.deadline && !["submitted", "accepted"].includes(normalizedStatus) && (
              <> · {legal.deadline}</>
            )}
          </div>
        )}

        {/* Disclaimer — лише для робочих статусів, не для поданих/прийнятих/відхилених */}
        {!["submitted", "accepted", "rejected"].includes(normalizedStatus) && (
          <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-md p-2.5">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              Чернетка сформована автоматично на основі даних кабінету. Перевірте всі показники
              перед поданням до Електронного кабінету ДПС. Подання потребує КЕП.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
