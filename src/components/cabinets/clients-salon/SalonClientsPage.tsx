/**
 * SalonClientsPage — корінь модуля «Клієнти» в Операціях салонного кабінету.
 *
 * Дані: `useSalonClients` (seed + локальний стор + privacy boundary).
 * Drill-flow: клік по рядку → push `kind: "client"` (через DrillStackProvider батьківського layout).
 *
 * Розкладка:
 *   Hero (CTA: додати / імпорт / експорт / AI-меню) →
 *   AttentionInbox (ДН цього тижня, churn-risk, CRM sync-помилки) →
 *   KPIStrip 6 шт →
 *   Filters bar (пошук + segment tabs) →
 *   Таблиця (desktop) / mobile cards.
 */

import { useMemo, useState } from "react";
import { Plus, Upload, Download, Sparkles, Search, Users, Crown, Snowflake, AlertTriangle, Receipt, UserMinus, RefreshCw, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIStrip, type KPIStripItem } from "@/components/ui/KPIStrip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useDrillStack } from "@/components/shared/drill-stack";
import type { Cabinet } from "@/types/cabinet";
import { formatCurrency } from "@/lib/formatters";
import { useSalonClients, type EnrichedClient } from "./useSalonClients";
import { SEGMENT_LABEL, type ClientSegment } from "./rfm";
import { normalizePhone, maskPhone, formatPhone } from "./phoneNormalize";
import { ImportClientsSheet } from "./_ImportClientsSheet";
import { createClient } from "./clientsStore";
import { salonMasters } from "@/config/demoCabinets/salonData";
import { SubscribedClientsPanel } from "./SubscribedClientsPanel";

const SEGMENT_TABS: { id: "all" | ClientSegment; label: string }[] = [
  { id: "all", label: "Усі" },
  { id: "champions", label: "VIP" },
  { id: "loyal", label: "Лояльні" },
  { id: "new", label: "Нові" },
  { id: "at-risk", label: "Сплячі" },
  { id: "lost", label: "Втрачені" },
  { id: "blacklist", label: "Чорний список" },
];

interface Props {
  cabinet: Cabinet;
}

export function SalonClientsPage({ cabinet }: Props) {
  const { toast } = useToast();
  const { list } = useSalonClients(cabinet.id);
  const { push } = useDrillStack();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<"all" | ClientSegment>("all");
  const [importOpen, setImportOpen] = useState(false);

  const isAuditor = cabinet.role === "auditor";

  // ───── KPI ─────
  const kpis = useMemo<KPIStripItem[]>(() => {
    const total = list.length;
    const champions = list.filter((c) => c.segment === "champions").length;
    const active30 = list.filter((c) => c.rfm.recencyDays <= 30 && !c.client.blacklist).length;
    const churnRisk = list.filter((c) => c.segment === "at-risk" || c.segment === "lost").length;
    const noShow90 = list.reduce((s, c) => s + (c.client.noShowCount ?? 0), 0);
    const ltvSum = list.reduce((s, c) => s + c.ltv, 0);
    const visitsSum = list.reduce((s, c) => s + c.rfm.frequency, 0);
    const avgCheck = visitsSum ? Math.round(ltvSum / visitsSum) : 0;
    return [
      { id: "total", title: "База", value: total.toLocaleString("uk-UA"), icon: Users },
      { id: "vip", title: "VIP", value: String(champions), icon: Crown, variant: "warning" },
      { id: "active", title: "Активних 30д", value: String(active30), icon: Sparkles, variant: "success" },
      { id: "churn", title: "Churn-risk", value: String(churnRisk), icon: Snowflake, variant: churnRisk > 3 ? "warning" : "default" },
      { id: "noshow", title: "No-show всього", value: String(noShow90), icon: AlertTriangle, variant: noShow90 > 5 ? "danger" : "default" },
      { id: "avg", title: "Сер. чек", value: formatCurrency(avgCheck), icon: Receipt },
    ];
  }, [list]);

  // ───── Attention inbox ─────
  const attentions = useMemo(() => {
    const items: { id: string; label: string; tone: "warning" | "success" | "danger"; segment?: ClientSegment }[] = [];
    const birthdayWeek = list.filter((c) => isBirthdayWithinDays(c.client.birthDate, 7)).length;
    if (birthdayWeek > 0) items.push({ id: "bday", label: `${birthdayWeek} клієнт${birthdayWeek === 1 ? "" : "и"} з ДН цього тижня`, tone: "success" });
    const churn = list.filter((c) => c.segment === "at-risk").length;
    if (churn > 0) items.push({ id: "churn", label: `${churn} клієнт${churn === 1 ? "" : "и"} у зоні відтоку — час нагадати`, tone: "warning", segment: "at-risk" });
    const crmSync = list.filter((c) => c.client.externalCrmId).length;
    if (crmSync > 0) items.push({ id: "crm", label: `Sync з Altegio: ${crmSync} карток · оновлено ${Math.floor(Math.random() * 12) + 3} хв тому`, tone: "success" });
    return items;
  }, [list]);

  // ───── Filter ─────
  const filtered = useMemo(() => {
    const norm = normalizePhone(search);
    const text = search.trim().toLowerCase();
    return list.filter((e) => {
      if (segmentFilter !== "all" && e.segment !== segmentFilter) return false;
      if (!text) return true;
      const c = e.client;
      if (c.fullName.toLowerCase().includes(text)) return true;
      if (c.email?.toLowerCase().includes(text)) return true;
      if (norm.length >= 6 && normalizePhone(c.phone).includes(norm)) return true;
      return false;
    });
  }, [list, search, segmentFilter]);

  const handleAdd = () => {
    const newId = `cli-new-${Date.now().toString(36)}`;
    createClient(cabinet.id, {
      id: newId,
      fullName: "Новий клієнт",
      phone: "",
      totalVisits: 0,
      source: "walk-in",
      bonusBalance: 0,
      noShowCount: 0,
      consents: { gdprAcceptedAt: new Date().toISOString() },
    });
    toast({ title: "Картку створено", description: "Заповніть деталі у вікні клієнта." });
    push({ kind: "client", id: newId, sourceLabel: "Клієнти" });
  };

  const handleExport = () => {
    const rows = [
      ["fullName", "phone", "email", "birthDate", "tags", "bonusBalance", "totalVisits", "lastVisit", "segment", "ltv"],
      ...list.map((e) => [
        e.client.fullName,
        normalizePhone(e.client.phone),
        e.client.email ?? "",
        e.client.birthDate ?? "",
        (e.client.tags ?? []).join(";"),
        String(e.client.bonusBalance ?? 0),
        String(e.client.totalVisits),
        e.client.lastVisitDate ?? "",
        e.segment,
        String(e.ltv),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salon-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Базу клієнтів експортовано", description: `${list.length} карток у CSV-файлі.` });
  };

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Hero */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Клієнти</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            База клієнтів салону: картки, історія візитів, RFM-сегменти, лояльність і синхронізація з зовнішньою CRM.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5 h-11 md:h-9">
            <Upload className="w-3.5 h-3.5" /> Імпорт CSV
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5 h-11 md:h-9">
            <Download className="w-3.5 h-3.5" /> Експорт
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" className="gap-1.5 h-11 md:h-9 w-full md:w-auto">
                <Sparkles className="w-3.5 h-3.5" /> AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">AI-дії (демо)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSegmentFilter("at-risk"); toast({ title: "AI: Знайдено клієнтів у зоні відтоку", description: "Відфільтровано «Сплячі». Виберіть рядки для масової win-back розсилки." }); }}>
                <Snowflake className="w-3.5 h-3.5 mr-2" /> Знайти churn-risk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "AI: Привітати з ДН", description: "Знайдено клієнтів з ДН на цьому тижні. Шаблон згенеровано." })}>
                <Cake className="w-3.5 h-3.5 mr-2" /> Привітати з ДН
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "AI: Ребукінг", description: "Знайдено клієнтів, у яких настав типовий цикл повторної процедури." })}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Рекомендувати ребукінг
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "AI: Персональний месседж", description: "Спочатку оберіть клієнтів у таблиці (~1 кр./клієнт)." })}>
                <Sparkles className="w-3.5 h-3.5 mr-2" /> Згенерувати месседж
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleAdd} className="gap-1.5 h-11 md:h-9 col-span-2 md:col-span-1" disabled={isAuditor}>
            <Plus className="w-3.5 h-3.5" /> Додати клієнта
          </Button>
        </div>
      </header>

      {/* AttentionInbox */}
      {attentions.length > 0 && (
        <div className="rounded-lg border bg-card divide-y">
          {attentions.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => a.segment && setSegmentFilter(a.segment)}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
            >
              <span
                className={
                  a.tone === "warning"
                    ? "w-1.5 h-1.5 rounded-full bg-amber-500"
                    : a.tone === "danger"
                    ? "w-1.5 h-1.5 rounded-full bg-red-500"
                    : "w-1.5 h-1.5 rounded-full bg-emerald-500"
                }
              />
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* KPIs */}
      <KPIStrip items={kpis} ariaLabel="KPI клієнтської бази" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за іменем, телефоном, email…"
            className="pl-8 h-11 md:h-9 text-base md:text-sm"
          />
        </div>
        <Tabs value={segmentFilter} onValueChange={(v) => setSegmentFilter(v as typeof segmentFilter)}>
          <TabsList className="h-9 flex w-full overflow-x-auto snap-x scrollbar-hide sm:w-auto">
            {SEGMENT_TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="shrink-0 snap-start text-xs">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Показано {filtered.length} з {list.length} клієнтів
      </p>

      {/* Table (desktop) / cards (mobile) */}
      <ClientsTable enrichedList={filtered} isAuditor={isAuditor} cabinetId={cabinet.id} />

      {/* L3 — Підписники мережі (Cabinet Network Protocol, privacy-VIEW) */}
      <SubscribedClientsPanel cabinetId={cabinet.id} />

      <ImportClientsSheet open={importOpen} onClose={() => setImportOpen(false)} cabinetId={cabinet.id} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────

function ClientsTable({
  enrichedList,
  isAuditor,
  cabinetId,
}: {
  enrichedList: EnrichedClient[];
  isAuditor: boolean;
  cabinetId: string;
}) {
  const { push } = useDrillStack();

  if (enrichedList.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">За цими критеріями клієнтів не знайдено.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Клієнт</th>
              <th className="text-left px-3 py-2 font-medium">Телефон</th>
              <th className="text-left px-3 py-2 font-medium">RFM</th>
              <th className="text-left px-3 py-2 font-medium">Останній візит</th>
              <th className="text-right px-3 py-2 font-medium">LTV</th>
              <th className="text-right px-3 py-2 font-medium">Бонуси</th>
              <th className="text-center px-3 py-2 font-medium">No-show</th>
              <th className="text-left px-3 py-2 font-medium">Майстер</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {enrichedList.map((e) => {
              const topMaster = e.topMasterId ? salonMasters.find((m) => m.id === e.topMasterId) : null;
              return (
                <tr
                  key={e.client.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => push({ kind: "client", id: e.client.id, sourceLabel: "Клієнти" })}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate">{e.client.fullName}</span>
                      <SegmentBadge segment={e.segment} isVip={e.client.isVip} />
                      {e.client.linkedUserId && (
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase bg-sky-500/10 text-sky-600 border-sky-500/20 gap-1"
                          title={`Має Fintodo-кабінет · ${e.client.linkedVerification ?? "verified"}`}
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Fintodo
                        </Badge>
                      )}
                      {e.client.externalCrmId && (
                        <Badge variant="outline" className="text-[9px] uppercase">
                          {e.client.externalCrmId.provider}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs tabular-nums text-muted-foreground">
                    {e.client.phone === "—" ? "—" : isAuditor ? maskPhone(e.client.phone) : formatPhone(e.client.phone)}
                  </td>
                  <td className="px-3 py-2">
                    <RfmDots r={e.rfm.r} f={e.rfm.f} m={e.rfm.m} />
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {e.rfm.recencyDays === 9999 ? "—" : `${e.rfm.recencyDays}д тому`}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.ltv)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {(e.client.bonusBalance ?? 0) > 0 ? formatCurrency(e.client.bonusBalance ?? 0) : "—"}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums">
                    {(e.client.noShowCount ?? 0) > 0 ? (
                      <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/20">
                        {e.client.noShowCount}
                      </Badge>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{topMaster?.shortName ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {enrichedList.map((e) => (
          <button
            key={e.client.id}
            type="button"
            onClick={() => push({ kind: "client", id: e.client.id, sourceLabel: "Клієнти" })}
            className="w-full text-left rounded-lg border bg-card p-3 space-y-1.5 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium truncate flex items-center gap-2 min-w-0">
                <span className="truncate">{e.client.fullName}</span>
                {e.client.linkedUserId && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"
                    title="Має Fintodo-кабінет"
                  />
                )}
              </div>
              <SegmentBadge segment={e.segment} isVip={e.client.isVip} />
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-3">
              <span className="tabular-nums">{e.client.phone === "—" ? "—" : isAuditor ? maskPhone(e.client.phone) : formatPhone(e.client.phone)}</span>
              <RfmDots r={e.rfm.r} f={e.rfm.f} m={e.rfm.m} />
            </div>
            <div className="text-xs flex items-center justify-between text-muted-foreground">
              <span>{e.rfm.recencyDays === 9999 ? "—" : `${e.rfm.recencyDays}д тому`}</span>
              <span className="tabular-nums">LTV {formatCurrency(e.ltv)}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function SegmentBadge({ segment, isVip }: { segment: ClientSegment; isVip?: boolean }) {
  if (isVip || segment === "champions") {
    return <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 gap-0.5"><Crown className="w-2.5 h-2.5" />VIP</Badge>;
  }
  if (segment === "at-risk") return <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20">сплячий</Badge>;
  if (segment === "lost") return <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-600 border-rose-500/20">втрачений</Badge>;
  if (segment === "new") return <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">новий</Badge>;
  if (segment === "loyal") return <Badge variant="outline" className="text-[9px] bg-sky-500/10 text-sky-600 border-sky-500/20">лояльний</Badge>;
  if (segment === "blacklist") return <Badge variant="outline" className="text-[9px] bg-rose-500/10 text-rose-600 border-rose-500/20 gap-0.5"><UserMinus className="w-2.5 h-2.5" />blacklist</Badge>;
  return null;
}

function RfmDots({ r, f, m }: { r: number; f: number; m: number }) {
  const dot = (v: number, label: string) => (
    <span title={`${label}=${v}`} className="inline-flex flex-col items-center gap-0.5">
      <span className={`w-1.5 h-1.5 rounded-full ${v >= 4 ? "bg-emerald-500" : v >= 3 ? "bg-amber-500" : "bg-muted-foreground/40"}`} />
      <span className="text-[9px] text-muted-foreground tabular-nums">{label}{v}</span>
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5">
      {dot(r, "R")}
      {dot(f, "F")}
      {dot(m, "M")}
    </span>
  );
}

function isBirthdayWithinDays(birthDate: string | undefined, days: number): boolean {
  if (!birthDate) return false;
  const today = new Date();
  const bd = new Date(birthDate);
  const thisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
  const diff = (thisYear.getTime() - today.getTime()) / 86_400_000;
  return diff >= 0 && diff <= days;
}
