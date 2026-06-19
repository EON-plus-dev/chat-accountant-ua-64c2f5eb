import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MOCK_SUBSCRIPTIONS, type SubscriptionMock } from "@/admin/system/data/mocks";
import { MoreHorizontal, Download, Search } from "lucide-react";
import { toast } from "sonner";

const STATUS_META: Record<SubscriptionMock["status"], { label: string; cls: string }> = {
  active:   { label: "Активна",    cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  trial:    { label: "Trial",      cls: "bg-sky-500/15 text-sky-700 border-sky-500/30" },
  past_due: { label: "Прострочена",cls: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  canceled: { label: "Скасована",  cls: "bg-muted text-muted-foreground border-border" },
};

const fmtUah = (n: number) => new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(n);

export default function SystemSubscriptionsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"all" | SubscriptionMock["status"]>("all");
  const [plan, setPlan] = useState<string>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => MOCK_SUBSCRIPTIONS.filter((s) => {
    if (status !== "all" && s.status !== status) return false;
    if (plan !== "all" && s.plan !== plan) return false;
    if (q && !s.cabinetName.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [status, plan, q]);

  const kpis = useMemo(() => {
    const active = MOCK_SUBSCRIPTIONS.filter((s) => s.status === "active").length;
    const trial = MOCK_SUBSCRIPTIONS.filter((s) => s.status === "trial").length;
    const pastDue = MOCK_SUBSCRIPTIONS.filter((s) => s.status === "past_due").length;
    const canceled = MOCK_SUBSCRIPTIONS.filter((s) => s.status === "canceled").length;
    const mrr = MOCK_SUBSCRIPTIONS.filter((s) => s.status === "active").reduce((a, s) => a + s.mrr, 0);
    const arpu = active > 0 ? Math.round(mrr / active) : 0;
    return { active, trial, pastDue, canceled, mrr, arpu, churn30d: 2.4 };
  }, []);

  const act = (label: string, sub: SubscriptionMock) => toast.success(`${label}: ${sub.cabinetName}`, { description: "Демо-дія. Журнал аудиту оновлено." });

  return (
    <SystemPageShell
      title="Підписки клієнтів"
      description="Cross-tenant реєстр активних підписок усіх кабінетів платформи. Для каталогу планів див. «Тарифні плани»."
      actions={<Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" />Експорт CSV</Button>}
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: "Active", value: kpis.active, hint: "підписок" },
          { label: "Trial", value: kpis.trial, hint: "у пробному" },
          { label: "Past due", value: kpis.pastDue, hint: "прострочені", warn: kpis.pastDue > 0 },
          { label: "Canceled", value: kpis.canceled, hint: "за 30 днів" },
          { label: "MRR", value: `${fmtUah(kpis.mrr)} ₴`, hint: "повторюваний" },
          { label: "ARPU", value: `${fmtUah(kpis.arpu)} ₴`, hint: "/ active" },
          { label: "Churn 30d", value: `${kpis.churn30d}%`, hint: "відтік" },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
              <div className={`text-lg font-semibold tabular-nums ${k.warn ? "text-amber-700" : ""}`}>{k.value}</div>
              <div className="text-[10px] text-muted-foreground">{k.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-col md:flex-row gap-2 md:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук кабінету…" className="pl-8 h-9" />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="h-9 md:w-44"><SelectValue placeholder="Статус" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі статуси</SelectItem>
              <SelectItem value="active">Активні</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="past_due">Прострочені</SelectItem>
              <SelectItem value="canceled">Скасовані</SelectItem>
            </SelectContent>
          </Select>
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger className="h-9 md:w-44"><SelectValue placeholder="План" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Усі плани</SelectItem>
              <SelectItem value="free">Free Start</SelectItem>
              <SelectItem value="start">Start</SelectItem>
              <SelectItem value="smart">Smart</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="pro_agency">Pro Agency</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_0.8fr_1fr_1fr_0.8fr_40px] gap-3 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border">
            <div>Кабінет</div><div>План</div><div>Статус</div><div className="text-right">MRR</div>
            <div>Наступне списання</div><div>Trial до</div><div>Оплата</div><div />
          </div>
          <div className="divide-y divide-border/60">
            {rows.map((s) => {
              const st = STATUS_META[s.status];
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_0.8fr_1fr_1fr_0.8fr_40px] gap-2 md:gap-3 px-3 py-3 hover:bg-muted/40 cursor-pointer items-center"
                  onClick={() => navigate(`/admin/system/cabinets/${s.cabinetId}`)}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.cabinetName}</div>
                    <div className="text-[11px] text-muted-foreground uppercase">{s.cabinetType}</div>
                  </div>
                  <div className="text-sm">{s.planLabel}</div>
                  <div><Badge variant="outline" className={`text-[10px] ${st.cls}`}>{st.label}</Badge></div>
                  <div className="text-sm font-mono tabular-nums text-right">{fmtUah(s.mrr)} ₴</div>
                  <div className="text-xs text-muted-foreground">{s.nextRenewal ? new Date(s.nextRenewal).toLocaleDateString("uk-UA") : "—"}</div>
                  <div className="text-xs text-muted-foreground">{s.trialEndsAt ? new Date(s.trialEndsAt).toLocaleDateString("uk-UA") : "—"}</div>
                  <div className="text-xs text-muted-foreground">{s.paymentMethod === "card" ? "Картка" : s.paymentMethod === "invoice" ? "Рахунок" : "—"}</div>
                  <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/system/cabinets/${s.cabinetId}`)}>Перейти в кабінет</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => act("Зміна плану", s)}>Змінити план</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => act("Подовжено trial на 14 днів", s)}>Подовжити trial</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => act("Refund ініційовано", s)}>Refund</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => act("Force cancel", s)} className="text-destructive">Force cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && (
              <div className="p-6 text-sm text-muted-foreground text-center">За фільтрами нічого не знайдено</div>
            )}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
