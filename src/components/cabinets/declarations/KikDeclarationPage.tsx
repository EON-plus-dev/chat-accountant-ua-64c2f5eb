import { useMemo, useState } from "react";
import {
  CalendarDays,
  Globe,
  Send,
  Building2,
  ShieldCheck,
  Sparkles,
  FileText,
  Calculator,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getDemoReportsForCabinet } from "@/config/demoCabinets/getters";
import { KikRegistryPanel } from "./KikRegistryPanel";
import { NbuFxPanel } from "./NbuFxPanel";
import {
  getKikEntitiesForCabinet,
  JURISDICTION_LABELS,
} from "@/config/demoCabinets/kikRegistryConfig";
import { SummaryTile } from "./shared/SummaryTile";
import { DeclarationDetailShell } from "./shared/DeclarationDetailShell";
import { DeclarationJournalTab, type JournalEntry } from "./shared/DeclarationJournalTab";
import { GeneratedDocumentsBlock } from "./shared/GeneratedDocumentsBlock";
import { PrepareSubmissionSheet } from "./shared/PrepareSubmissionSheet";

interface Props {
  cabinetId: string;
  reportId: string;
  onBack: () => void;
}

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("uk-UA") : "—";
const fmtUah = (n: number) => `${Math.round(n).toLocaleString("uk-UA")} ₴`;
const fmtCcy = (n: number, ccy: string) =>
  `${n.toLocaleString("uk-UA", { maximumFractionDigits: 0 })} ${ccy}`;

// Демо-курси НБУ (середньорічні).
const DEMO_FX: Record<string, number> = {
  EUR: 44.5,
  USD: 41.2,
  GBP: 51.8,
  CZK: 1.78,
  PLN: 10.4,
};

export function KikDeclarationPage({ cabinetId, reportId, onBack }: Props) {
  const reports = getDemoReportsForCabinet(cabinetId);
  const report = reports.find((r) => r.id === reportId);
  const [prepareOpen, setPrepareOpen] = useState(false);

  const entities = useMemo(
    () =>
      report
        ? getKikEntitiesForCabinet(cabinetId).filter((k) => k.reportingYear === report.year)
        : [],
    [cabinetId, report],
  );

  if (!report) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <Globe className="size-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Звіт не знайдено</p>
          <Button variant="outline" onClick={onBack}>Назад</Button>
        </CardContent>
      </Card>
    );
  }

  const reportingYear = report.year ?? new Date().getFullYear() - 1;
  const jurisdictions = new Set(entities.map((e) => e.jurisdiction)).size;
  const completedEntities = entities.filter(
    (e) => (e as { documentsComplete?: boolean }).documentsComplete !== false,
  ).length;
  const progressPct = entities.length > 0
    ? Math.round((completedEntities / entities.length) * 100)
    : 0;

  const status: "draft" | "ready" | "submitted" | "accepted" =
    report.status === "submitted" || report.status === "accepted" ? report.status : "draft";
  const isFinal = status === "submitted" || status === "accepted";

  // Розрахунок бази ПДФО з прибутку КІК
  const profitRows = useMemo(
    () =>
      entities.map((e) => {
        const fx = DEMO_FX[e.financials.currency] ?? 1;
        const adjusted = e.financials.adjustedProfit;
        const share = e.controlShare / 100;
        const exempt = e.financials.exemptUnderTreaty;
        const baseUah = exempt ? 0 : adjusted * share * fx;
        return {
          id: e.id,
          name: e.name,
          jurisdiction: e.jurisdiction,
          currency: e.financials.currency,
          adjusted,
          share,
          fx,
          exempt: !!exempt,
          exemptionReason: e.financials.exemptionReason,
          baseUah,
        };
      }),
    [entities],
  );

  const totalBase = profitRows.reduce((s, r) => s + r.baseUah, 0);
  const totalTax = totalBase * 0.18; // ПДФО 18%

  const journalEntries: JournalEntry[] = useMemo(
    () =>
      (report.history ?? []).map<JournalEntry>((h) => ({
        at: h.date,
        label: h.action,
        eventType: h.action.includes("Подано") ? "submitted" : "field_changed",
      })),
    [report.history],
  );

  return (
    <DeclarationDetailShell
      onBack={onBack}
      breadcrumb="Декларації / Звіт про КІК"
      title={report.name}
      badges={<Badge variant="outline" className="font-mono">{report.year}</Badge>}
      status={status}
      statusLabel={report.statusLabel}
      deadline={report.deadline}
      progressTone="blue"
      progressPercent={entities.length > 0 ? progressPct : undefined}
      metaSlots={
        <>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" /> Дедлайн: {fmtDate(report.deadline)}
          </span>
          <span>ст. 39² ПКУ</span>
          <span className="inline-flex items-center gap-1">
            <Building2 className="size-3" /> Компаній: {entities.length}
          </span>
        </>
      }
      actions={
        !isFinal ? (
          <Button size="sm" onClick={() => setPrepareOpen(true)} className="gap-1">
            <Send className="size-3.5" /> Підготувати до подання
          </Button>
        ) : (
          <Button size="sm" disabled className="gap-1">
            <Send className="size-3.5" /> Подано
          </Button>
        )
      }
      sidebar={
        <>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-blue-600" /> Що далі
              </h3>
              {!isFinal ? (
                <Button size="sm" className="w-full justify-start" onClick={() => setPrepareOpen(true)}>
                  Підготувати до подання
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Подано до ДПС.</p>
              )}
            </CardContent>
          </Card>

          <GeneratedDocumentsBlock
            docs={[
              {
                formCode: "J0108601",
                title: "Звіт про контрольовані іноземні компанії",
                status: isFinal ? "submitted" : completedEntities === entities.length && entities.length > 0 ? "ready" : "draft",
              },
              {
                formCode: "J0108602",
                title: "Скорочений звіт КІК",
                status: "not_ready",
              },
            ]}
          />

          <Card>
            <CardContent className="p-4 space-y-1.5">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Building2 className="size-4" /> Компанії
              </h3>
              <p className="text-2xl font-bold tabular-nums">{entities.length}</p>
              <p className="text-xs text-muted-foreground">
                {jurisdictions} {jurisdictions === 1 ? "юрисдикція" : "юрисдикцій"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1.5 text-xs">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <ShieldCheck className="size-4" /> Версія форми
              </h3>
              <Row label="Норматив" value="ст. 39² ПКУ" />
              <Row label="Форма" value="J0108601" />
              <Row label="Звітний рік" value={String(report.year)} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1.5">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <FileText className="size-4" /> Документи
              </h3>
              <p className="text-2xl font-bold tabular-nums">{completedEntities}/{entities.length}</p>
              <p className="text-xs text-muted-foreground">компаній з повним пакетом</p>
            </CardContent>
          </Card>
        </>
      }
    >
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="overflow-x-auto">
          <TabsTrigger value="overview">Огляд</TabsTrigger>
          <TabsTrigger value="calc">Розрахунок ({entities.length})</TabsTrigger>
          <TabsTrigger value="entities">Компанії</TabsTrigger>
          <TabsTrigger value="fx">Курси НБУ</TabsTrigger>
          <TabsTrigger value="audit">Журнал ({journalEntries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryTile label="Контрольованих компаній" value={entities.length} tone="info" />
            <SummaryTile label="База ПДФО (UAH)" value={fmtUah(totalBase)} tone="primary" hint="Сума скоригованого прибутку × частка × курс НБУ" />
            <SummaryTile label="Орієнтовний ПДФО" value={fmtUah(totalTax)} tone="warning" hint="18% від бази КІК" />
          </div>
        </TabsContent>

        <TabsContent value="calc" className="space-y-3 mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calculator className="size-4" /> Розрахунок бази ПДФО з прибутку КІК
                </span>
                <Badge variant="outline" className="text-xs">{profitRows.length}</Badge>
              </div>
              {profitRows.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Жодної контрольованої компанії за {report.year} рік.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Компанія</TableHead>
                      <TableHead numeric>Прибуток</TableHead>
                      <TableHead numeric>Частка</TableHead>
                      <TableHead numeric>Курс НБУ</TableHead>
                      <TableHead numeric>База, ₴</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitRows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="text-sm font-medium leading-tight">{r.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {JURISDICTION_LABELS[r.jurisdiction]}
                            {r.exempt && (
                              <Badge variant="outline" className="ml-2 text-[10px] h-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                Звільнено
                              </Badge>
                            )}
                          </div>
                          {r.exempt && r.exemptionReason && (
                            <div className="text-[10px] text-muted-foreground italic mt-0.5">{r.exemptionReason}</div>
                          )}
                        </TableCell>
                        <TableCell numeric className="text-sm">
                          {fmtCcy(r.adjusted, r.currency)}
                        </TableCell>
                        <TableCell numeric className="text-sm">
                          {(r.share * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell numeric className="text-sm font-mono">
                          {r.fx.toFixed(2)}
                        </TableCell>
                        <TableCell numeric className="font-semibold">
                          {r.exempt ? <span className="text-muted-foreground">—</span> : fmtUah(r.baseUah)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-semibold">
                      <TableCell colSpan={4} className="text-right">Разом база ПДФО:</TableCell>
                      <TableCell numeric>{fmtUah(totalBase)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-amber-500/5">
                      <TableCell colSpan={4} className="text-right text-amber-700 dark:text-amber-400">
                        ПДФО 18%:
                      </TableCell>
                      <TableCell numeric className="text-amber-700 dark:text-amber-400 font-semibold">
                        {fmtUah(totalTax)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Формула: <span className="font-mono">скоригований прибуток × частка контролю × середньорічний курс НБУ × 18%</span>.
            База включається у ПДФО-декларацію за {report.year} рік (ст. 39².3 ПКУ).
          </p>
        </TabsContent>

        <TabsContent value="entities" className="mt-0">
          <KikRegistryPanel cabinetId={cabinetId} reportingYear={reportingYear} />
        </TabsContent>

        <TabsContent value="fx" className="mt-0">
          <NbuFxPanel reportingYear={reportingYear} />
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <DeclarationJournalTab entries={journalEntries} />
        </TabsContent>
      </Tabs>

      <PrepareSubmissionSheet
        open={prepareOpen}
        onOpenChange={setPrepareOpen}
        title="Підготувати звіт КІК"
        description={`${entities.length} компаній · база ${fmtUah(totalBase)}`}
        formCode="J0108601"
        summaryRows={[
          { label: "Звітний рік", value: String(report.year) },
          { label: "Компаній", value: String(entities.length) },
          { label: "Юрисдикцій", value: String(jurisdictions) },
          { label: "База ПДФО", value: fmtUah(totalBase) },
          { label: "ПДФО 18%", value: fmtUah(totalTax) },
        ]}
        checklist={[
          { id: "fin", label: "Фінансові звіти всіх КІК завантажено", required: true, done: completedEntities === entities.length && entities.length > 0 },
          { id: "fx", label: "Підтверджую курси НБУ за звітний період", required: true },
          { id: "share", label: "Структура володіння актуальна", required: true },
          { id: "exempt", label: "Перевірено підстави для звільнення (за наявності)" },
        ]}
        onSubmit={() => toast({ title: "J0108601 готовий", description: "Демо: файл сформовано для подачі через Кабінет ДПС." })}
      />
    </DeclarationDetailShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
