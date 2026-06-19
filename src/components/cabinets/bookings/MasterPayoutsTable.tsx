/**
 * MasterPayoutsTable — реєстр винагород майстрам за період.
 * Групування by master: к-сть бронювань, обсяг чеків, винагорода (% × сума),
 * статус виплати (paid / pending) — для штатних показуємо як «премію до ЗП»,
 * для ФОП — як платіж контрагенту.
 */

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "@/hooks/use-toast";
import type { StaffMember as SalonMaster, Booking as SalonBooking, BookableService as SalonService } from "@/core";

interface Props {
  masters: SalonMaster[];
  bookings: SalonBooking[];
  services?: SalonService[];
}

type Period = "7d" | "30d" | "month";
type TypeFilter = "all" | "staff" | "fop";

export function MasterPayoutsTable({ masters, bookings, services = [] }: Props) {
  const [period, setPeriod] = useState<Period>("30d");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const range = useMemo(() => {
    const today = new Date();
    const end = today.toISOString().split("T")[0];
    let start: Date;
    if (period === "7d") {
      start = new Date(today);
      start.setDate(start.getDate() - 7);
    } else if (period === "30d") {
      start = new Date(today);
      start.setDate(start.getDate() - 30);
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    return { startIso: start.toISOString().split("T")[0], endIso: end };
  }, [period]);

  const rows = useMemo(() => {
    return masters
      .filter((m) => typeFilter === "all" || m.type === typeFilter)
      .map((m) => {
        const done = bookings.filter(
          (b) => b.masterId === m.id && b.status === "done" && b.date >= range.startIso && b.date <= range.endIso,
        );
        const revenue = done.reduce((s, b) => s + b.totalPrice, 0);
        const commission = done.reduce((s, b) => s + b.commissionAmount, 0);
        return {
          master: m,
          count: done.length,
          revenue,
          commission,
          avgPerBooking: done.length > 0 ? Math.round(commission / done.length) : 0,
        };
      })
      .sort((a, b) => b.commission - a.commission);
  }, [masters, bookings, range, typeFilter]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        count: acc.count + r.count,
        revenue: acc.revenue + r.revenue,
        commission: acc.commission + r.commission,
        fopCommission: acc.fopCommission + (r.master.type === "fop" ? r.commission : 0),
        staffCommission: acc.staffCommission + (r.master.type === "staff" ? r.commission : 0),
      }),
      { count: 0, revenue: 0, commission: 0, fopCommission: 0, staffCommission: 0 },
    );
  }, [rows]);

  const top3 = rows.filter((r) => r.commission > 0).slice(0, 3);

  const generateAct = (row: (typeof rows)[number]): string => {
    const today = new Date().toLocaleDateString("uk-UA");
    const periodLabel = `${range.startIso} – ${range.endIso}`;
    const lines: string[] = [];
    lines.push(`АКТ № A-${row.master.id.toUpperCase()}-${range.endIso.replace(/-/g, "")}`);
    lines.push(`про надання послуг від ${today}`);
    lines.push("");
    lines.push("ВИКОНАВЕЦЬ: " + row.master.fullName + (row.master.type === "fop" ? " (ФОП-партнер)" : " (штатний майстер)"));
    lines.push("ЗАМОВНИК: ФОП Романюк І.В. (салон краси «Beauty Lab»)");
    lines.push("ПЕРІОД: " + periodLabel);
    lines.push("");
    lines.push(`Виконано бронювань: ${row.count}`);
    lines.push(`Загальний виторг: ${formatCurrency(row.revenue)}`);
    lines.push(`Винагорода (${row.master.commissionPct}%): ${formatCurrency(row.commission)}`);
    lines.push("");
    // Послуги-розшифровка
    const masterBookings = bookings.filter(
      (b) =>
        b.masterId === row.master.id &&
        b.status === "done" &&
        b.date >= range.startIso &&
        b.date <= range.endIso,
    );
    const svcCounts = new Map<string, { count: number; revenue: number }>();
    for (const b of masterBookings) {
      for (const sid of b.serviceIds) {
        const cur = svcCounts.get(sid) ?? { count: 0, revenue: 0 };
        const svc = services.find((s) => s.id === sid);
        cur.count += 1;
        cur.revenue += svc?.price ?? 0;
        svcCounts.set(sid, cur);
      }
    }
    if (svcCounts.size > 0) {
      lines.push("ДЕТАЛІЗАЦІЯ ПО ПОСЛУГАХ:");
      for (const [sid, info] of svcCounts) {
        const svc = services.find((s) => s.id === sid);
        if (!svc) continue;
        lines.push(`  · ${svc.name} — ${info.count} шт. × ${formatCurrency(svc.price)} = ${formatCurrency(info.revenue)}`);
      }
      lines.push("");
    }
    lines.push("Сторони не мають взаємних претензій щодо обсягу та якості наданих послуг.");
    lines.push("");
    lines.push("Виконавець: _____________________ / " + row.master.fullName + " /");
    lines.push("Замовник:   _____________________ / Романюк І.В. /");
    return lines.join("\n");
  };

  const downloadText = (filename: string, content: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateAllFopActs = () => {
    const fopRows = rows.filter((r) => r.master.type === "fop" && r.commission > 0);
    if (fopRows.length === 0) {
      toast({ title: "Немає актів", description: "За цей період немає виплат ФОП-майстрам." });
      return;
    }
    const content = fopRows
      .map((r) => generateAct(r))
      .join("\n\n" + "=".repeat(72) + "\n\n");
    downloadText(`acts-fop-${range.startIso}_${range.endIso}.txt`, content);
    toast({
      title: "Акти ФОП сформовано",
      description: `${fopRows.length} акт(и) у файлі. У production — PDF з підписом КЕП.`,
    });
  };

  return (
    <Card>
      <CardContent className="p-3 md:p-4 space-y-3">
        {/* Period switcher + summary */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {(["7d", "30d", "month"] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === "7d" ? "7 днів" : p === "30d" ? "30 днів" : "Цей місяць"}
              </Button>
            ))}
            <span className="mx-1 w-px bg-border self-stretch" />
            {(["all", "staff", "fop"] as TypeFilter[]).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(t)}
              >
                {t === "all" ? "Усі" : t === "staff" ? "Штатні" : "ФОП-партнери"}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] gap-1"
              onClick={() => {
                const headers = ["Майстер", "Тип", "Бронювань", "Виторг", "Винагорода (%)", "Винагорода (₴)", "Сер. за запис"];
                const csvRows = rows.map((r) =>
                  [
                    r.master.fullName,
                    r.master.type === "staff" ? "Штатний" : "ФОП",
                    r.count,
                    r.revenue,
                    r.master.commissionPct,
                    r.commission,
                    r.avgPerBooking,
                  ].join(","),
                );
                const csv = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `payouts-${range.startIso}_${range.endIso}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast({ title: "Експорт CSV", description: "Файл збережено в Завантаженнях." });
              }}
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] gap-1"
              onClick={generateAllFopActs}
            >
              <FileText className="w-3.5 h-3.5" /> Акти ФОП
            </Button>
            <div className="text-[11px] text-muted-foreground tabular-nums">
              Період: {range.startIso} – {range.endIso}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <Summary label="Бронювань" value={totals.count.toString()} />
          <Summary label="Виторг" value={formatCurrency(totals.revenue)} />
          <Summary label="ФОП-майстри" value={formatCurrency(totals.fopCommission)} hint="до виплати на IBAN" />
          <Summary label="Штатні (премії)" value={formatCurrency(totals.staffCommission)} hint="у наступну ЗП" />
        </div>

        {/* Top-3 podium */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {top3.map((r, i) => {
              const share = totals.commission > 0 ? Math.round((r.commission / totals.commission) * 100) : 0;
              const medalColor =
                i === 0
                  ? "text-amber-500"
                  : i === 1
                    ? "text-slate-400"
                    : "text-amber-700";
              const Icon = i === 0 ? Trophy : Medal;
              return (
                <div
                  key={r.master.id}
                  className={cn(
                    "border rounded-md p-3 flex items-center gap-3 relative overflow-hidden",
                    i === 0 && "ring-1 ring-amber-500/40 bg-amber-500/5",
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", medalColor)} />
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: r.master.color }}
                  >
                    {r.master.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{r.master.shortName}</div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      {r.count} запис(и) · {share}% від винагород
                    </div>
                  </div>
                  <div className="text-right tabular-nums shrink-0">
                    <div className="text-sm font-semibold">{formatCurrency(r.commission)}</div>
                    <div className="text-[10px] text-muted-foreground">{formatCurrency(r.avgPerBooking)}/зап.</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Per-master table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-2">Майстер</th>
                <th className="py-2 pr-2">Тип</th>
                <th className="py-2 pr-2 text-right">Бронювань</th>
                <th className="py-2 pr-2 text-right">Виторг</th>
                <th className="py-2 pr-2 text-right">%</th>
                <th className="py-2 pr-2 text-right">Винагорода</th>
                <th className="py-2 pr-2 text-right">Сер. за запис</th>
                <th className="py-2 pr-2 text-right">Акт</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.master.id} className="border-b last:border-b-0 hover:bg-muted/30">
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-white"
                        style={{ backgroundColor: r.master.color }}
                      >
                        {r.master.avatarInitials}
                      </span>
                      <span className="font-medium">{r.master.shortName}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <Badge variant={r.master.type === "fop" ? "secondary" : "outline"} size="sm" className="text-[10px]">
                      {r.master.type === "staff" ? "Штатний" : "ФОП-партнер"}
                    </Badge>
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">{r.count}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{formatCurrency(r.revenue)}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-muted-foreground">{r.master.commissionPct}%</td>
                  <td className="py-2 pr-2 text-right tabular-nums font-semibold">{formatCurrency(r.commission)}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-muted-foreground">{formatCurrency(r.avgPerBooking)}</td>
                  <td className="py-2 pr-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={r.count === 0}
                      className="h-7 px-2 text-[11px] gap-1"
                      onClick={() => {
                        const content = generateAct(r);
                        downloadText(
                          `act-${r.master.id}-${range.startIso}_${range.endIso}.txt`,
                          content,
                        );
                        toast({
                          title: "Акт сформовано",
                          description: `${r.master.shortName} · ${formatCurrency(r.commission)}`,
                        });
                      }}
                    >
                      <FileText className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold border-t">
                <td className="py-2 pr-2" colSpan={2}>Разом</td>
                <td className="py-2 pr-2 text-right tabular-nums">{totals.count}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{formatCurrency(totals.revenue)}</td>
                <td className="py-2 pr-2"></td>
                <td className="py-2 pr-2 text-right tabular-nums">{formatCurrency(totals.commission)}</td>
                <td className="py-2 pr-2" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-[11px] text-muted-foreground border-t pt-2">
          Винагорода ФОП-майстрів автоматично потрапляє в «Платежі → Контрагентам» згрупованими тижневими платежами.
          Премії штатним додаються до нарахування зарплати наступного періоду (з утриманням ПДФО 18% та ВЗ 5%).
        </div>
      </CardContent>
    </Card>
  );
}

function Summary({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border rounded-md p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
