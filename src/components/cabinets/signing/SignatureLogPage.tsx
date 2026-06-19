import { useMemo, useState } from "react";
import { useSignatureAuditLog, type SignatureAuditEntry } from "@/hooks/useSignatureAuditLog";
import type { DemoSignatureAuditEntry } from "@/config/demoSignatureAuditLog";
import type { Cabinet } from "@/types/cabinet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { KPIStrip } from "@/components/ui/KPIStrip";
import {
  ScrollText,
  Download,
  Search,
  Bot,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  ShieldCheck,
} from "lucide-react";

interface Props {
  cabinet: Cabinet;
}

const ACTION_LABELS: Record<string, string> = {
  init: "Запит підпису",
  signed: "Підписано",
  callback: "Підтвердження провайдера",
  cancel: "Скасовано",
  rule_changed: "Зміна правил автопідпису",
  auto_sign_executed: "Авто-підпис виконано",
};

const ACTION_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  signed: "default",
  init: "secondary",
  callback: "outline",
  cancel: "destructive",
  rule_changed: "outline",
  auto_sign_executed: "default",
};

const DOCUMENT_KIND_LABELS: Record<string, string> = {
  invoice: "Інвойс",
  contract: "Договір",
  act: "Акт",
  declaration: "Декларація",
  report: "Звіт",
  other: "Документ",
};

type Entry = SignatureAuditEntry | DemoSignatureAuditEntry;

function getActorName(e: Entry): string {
  if ("actor_name" in e && e.actor_name) return e.actor_name;
  return e.actor_user_id.slice(0, 8) + "…";
}

function isAutoSign(e: Entry): boolean {
  return e.action === "auto_sign_executed" || e.details?.is_auto_sign === true;
}

function getDocumentLabel(e: Entry): string {
  const kind = e.details?.document_kind as string | undefined;
  const id = e.details?.document_id as string | undefined;
  if (!kind && !id) return "—";
  return `${DOCUMENT_KIND_LABELS[kind ?? "other"] ?? kind ?? ""} ${id ?? ""}`.trim();
}

export const SignatureLogPage = ({ cabinet }: Props) => {
  const { data: entries, isLoading, isDemo } = useSignatureAuditLog(cabinet.id, 200);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [autoFilter, setAutoFilter] = useState<string>("all");
  const [detailEntry, setDetailEntry] = useState<Entry | null>(null);

  const actors = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => set.add(getActorName(e)));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (actorFilter !== "all" && getActorName(e) !== actorFilter) return false;
      if (autoFilter === "auto" && !isAutoSign(e)) return false;
      if (autoFilter === "manual" && isAutoSign(e)) return false;
      if (!q) return true;
      const hay = [
        getDocumentLabel(e),
        getActorName(e),
        ACTION_LABELS[e.action] ?? e.action,
        JSON.stringify(e.details ?? {}),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [entries, search, actionFilter, actorFilter, autoFilter]);

  // KPI
  const last30Cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const totalEvents = entries.length;
  const signedLast30 = entries.filter(
    (e) => e.action === "signed" && new Date(e.created_at).getTime() >= last30Cutoff,
  ).length;
  const autoSigned = entries.filter((e) => isAutoSign(e)).length;
  const cancellations = entries.filter((e) => e.action === "cancel").length;

  const exportCsv = () => {
    const header = ["Час", "Документ", "Дія", "Авто-підпис", "Виконавець", "IP"].join(",");
    const lines = filtered.map((e) =>
      [
        new Date(e.created_at).toISOString(),
        `"${getDocumentLabel(e).replace(/"/g, '""')}"`,
        ACTION_LABELS[e.action] ?? e.action,
        isAutoSign(e) ? "так" : "ні",
        `"${getActorName(e).replace(/"/g, '""')}"`,
        e.ip_address ?? "",
      ].join(","),
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signature-log-${cabinet.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ScrollText className="h-4 w-4 text-primary" />
                Журнал підписів
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Імутабельний аудит-trail КЕП-підписів. Відповідність ЗУ № 2155-VIII «Про електронні
                довірчі послуги». Записи не можна змінити чи видалити.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isDemo && (
                <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
                  ДЕМО — не має юридичної сили
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Експорт CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <KPIStrip
            ariaLabel="Метрики журналу підписів"
            items={[
              { id: "total", title: "Усього подій", value: totalEvents, icon: Activity },
              { id: "signed", title: "Підписано (30 днів)", value: signedLast30, icon: CheckCircle2, variant: "success" },
              { id: "auto", title: "Авто-підписів", value: autoSigned, icon: Bot },
              { id: "cancel", title: "Скасувань", value: cancellations, icon: XCircle, variant: cancellations > 0 ? "warning" : "default" },
            ]}
          />

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Пошук по документу, автору, ID…"
                className="pl-8 h-9"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="md:w-[200px] h-9"><SelectValue placeholder="Тип дії" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі дії</SelectItem>
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger className="md:w-[200px] h-9"><SelectValue placeholder="Автор" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі автори</SelectItem>
                {actors.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={autoFilter} onValueChange={setAutoFilter}>
              <SelectTrigger className="md:w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі підписи</SelectItem>
                <SelectItem value="auto">Лише авто</SelectItem>
                <SelectItem value="manual">Лише ручні</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Завантаження…</p>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground border rounded-md">
              <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
              {entries.length === 0
                ? "Поки немає подій підписання. Журнал заповнюється автоматично після першого КЕП-підпису."
                : "Немає подій за обраними фільтрами."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Час</TableHead>
                    <TableHead>Документ</TableHead>
                    <TableHead>Дія</TableHead>
                    <TableHead className="w-[120px]">Авто-підпис</TableHead>
                    <TableHead>Виконавець</TableHead>
                    <TableHead className="w-[120px]">IP</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id} className="cursor-pointer" onClick={() => setDetailEntry(e)}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString("uk-UA")}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="font-mono">{getDocumentLabel(e)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_VARIANT[e.action] ?? "outline"}>
                          {ACTION_LABELS[e.action] ?? e.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isAutoSign(e) ? (
                          <Badge className="gap-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/15">
                            <Bot className="h-3 w-3" /> Авто
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Ручний</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{getActorName(e)}</TableCell>
                      <TableCell className="text-xs font-mono">{e.ip_address ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">Деталі</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!detailEntry} onOpenChange={(o) => !o && setDetailEntry(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailEntry && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant={ACTION_VARIANT[detailEntry.action] ?? "outline"}>
                    {ACTION_LABELS[detailEntry.action] ?? detailEntry.action}
                  </Badge>
                  {isAutoSign(detailEntry) && (
                    <Badge className="gap-1 bg-primary/10 text-primary border-primary/30">
                      <Bot className="h-3 w-3" /> Авто
                    </Badge>
                  )}
                </SheetTitle>
                <SheetDescription>
                  {new Date(detailEntry.created_at).toLocaleString("uk-UA")} · {getActorName(detailEntry)}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Документ" value={getDocumentLabel(detailEntry)} />
                <Row label="ID запиту" value={detailEntry.signature_request_id ?? "—"} mono />
                <Row label="IP" value={detailEntry.ip_address ?? "—"} mono />
                <Row label="User-Agent" value={detailEntry.user_agent ?? "—"} />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Деталі (JSON)</div>
                  <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto">
{JSON.stringify(detailEntry.details ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={mono ? "text-xs font-mono text-right" : "text-xs text-right"}>{value}</span>
    </div>
  );
}

export default SignatureLogPage;
