import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MOCK_PARTNERS, type PartnerMock } from "@/admin/system/data/mocks";
import { MoreHorizontal, Search, ArrowRight, BadgeCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const TIER_META: Record<PartnerMock["tier"], { label: string; range: string; cls: string; discountPct: number }> = {
  1: { label: "Tier 1", range: "1–10 клієнтів",  cls: "bg-sky-500/15 text-sky-700 border-sky-500/30",        discountPct: 25 },
  2: { label: "Tier 2", range: "11–50 клієнтів", cls: "bg-violet-500/15 text-violet-700 border-violet-500/30", discountPct: 30 },
  3: { label: "Tier 3", range: "51+ клієнтів",   cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", discountPct: 35 },
};

const fmtUah = (n: number) => new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(n);

export default function SystemPartnersPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("registry");

  const partners = useMemo(
    () => MOCK_PARTNERS.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const kpis = useMemo(() => {
    const active = MOCK_PARTNERS.filter((p) => p.status === "active").length;
    const clients = MOCK_PARTNERS.reduce((a, p) => a + p.clientsCount, 0);
    const tierDist = { 1: 0, 2: 0, 3: 0 } as Record<1 | 2 | 3, number>;
    MOCK_PARTNERS.forEach((p) => (tierDist[p.tier] += 1));
    const pending = MOCK_PARTNERS.reduce((a, p) => a + p.pendingPayout, 0);
    const paidMtd = MOCK_PARTNERS.reduce((a, p) => a + p.paidMtd, 0);
    return { active, clients, tierDist, pending, paidMtd };
  }, []);

  const act = (label: string, p: PartnerMock) =>
    toast.success(`${label}: ${p.name}`, { description: "Демо-дія. Журнал аудиту оновлено." });

  return (
    <SystemPageShell
      title="Партнерська мережа"
      description="Реєстр reseller-партнерів, тіри (1–10 / 11–50 / 51+), знижки клієнтам, виплати винагород."
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {[
          { label: "Активних партнерів", value: kpis.active, hint: "з усіх зареєстрованих" },
          { label: "Клієнтів у мережі",   value: kpis.clients, hint: "сумарно" },
          { label: "Розподіл по тірах",   value: `${kpis.tierDist[1]} / ${kpis.tierDist[2]} / ${kpis.tierDist[3]}`, hint: "T1 / T2 / T3" },
          { label: "Pending payouts",     value: `${fmtUah(kpis.pending)} ₴`, hint: "до виплати", warn: kpis.pending > 0 },
          { label: "Paid MTD",            value: `${fmtUah(kpis.paidMtd)} ₴`, hint: "за поточний місяць" },
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="registry">Реєстр партнерів</TabsTrigger>
          <TabsTrigger value="payouts">Виплати</TabsTrigger>
          <TabsTrigger value="commissions">Нарахування</TabsTrigger>
        </TabsList>

        {/* Registry */}
        <TabsContent value="registry" className="space-y-3">
          <Card>
            <CardContent className="p-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук партнера…" className="pl-8 h-9" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="hidden md:grid grid-cols-[1.6fr_0.8fr_0.7fr_1fr_1fr_0.8fr_40px] gap-3 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border">
                <div>Партнер</div><div>Тір</div><div className="text-right">Клієнтів</div>
                <div className="text-right">MRR клієнтів</div><div>Режим</div><div>Статус</div><div />
              </div>
              <div className="divide-y divide-border/60">
                {partners.map((p) => {
                  const t = TIER_META[p.tier];
                  return (
                    <div key={p.id} className="grid grid-cols-1 md:grid-cols-[1.6fr_0.8fr_0.7fr_1fr_1fr_0.8fr_40px] gap-2 md:gap-3 px-3 py-3 items-center hover:bg-muted/40">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate flex items-center gap-1.5">
                          {p.name}
                          {p.verified
                            ? <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" aria-label="Верифікований" />
                            : <AlertCircle className="h-3.5 w-3.5 text-amber-600" aria-label="Не верифікований" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{p.email}</div>
                      </div>
                      <div>
                        <Badge variant="outline" className={`text-[10px] ${t.cls}`}>{t.label} · −{t.discountPct}%</Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{t.range}</div>
                      </div>
                      <div className="text-sm font-mono tabular-nums text-right">{p.clientsCount}</div>
                      <div className="text-sm font-mono tabular-nums text-right">{fmtUah(p.clientsMrr)} ₴</div>
                      <div className="text-xs">{p.mode === "to_client" ? "Знижка клієнту" : "Revenue share"}</div>
                      <div>
                        {p.status === "active"
                          ? <Badge variant="outline" className="text-[10px] bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Активний</Badge>
                          : <Badge variant="outline" className="text-[10px] bg-rose-500/15 text-rose-700 border-rose-500/30">Suspended</Badge>}
                      </div>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => act("Перегляд клієнтів партнера", p)}>Перегляд клієнтів</DropdownMenuItem>
                            {!p.verified && <DropdownMenuItem onClick={() => act("Верифіковано", p)}>Верифікувати</DropdownMenuItem>}
                            <DropdownMenuItem onClick={() => act("Зміна тіру", p)}>Змінити тір</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {p.status === "active"
                              ? <DropdownMenuItem className="text-destructive" onClick={() => act("Suspended", p)}>Suspend</DropdownMenuItem>
                              : <DropdownMenuItem onClick={() => act("Reactivated", p)}>Reactivate</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts shortcut */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Заявки на виплати</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Реальні дані виплат партнерам — у відповідному модулі.</p>
              </div>
              <Button size="sm" onClick={() => navigate("/admin/partner-payouts")}>
                Відкрити модуль виплат <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground">Pending: <span className="font-semibold text-foreground">{fmtUah(kpis.pending)} ₴</span> · Paid MTD: <span className="font-semibold text-foreground">{fmtUah(kpis.paidMtd)} ₴</span></div>
              <div className="divide-y divide-border/60 border border-border rounded-md">
                {MOCK_PARTNERS.filter((p) => p.pendingPayout > 0).slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5">
                    <div className="flex-1 min-w-0 text-sm truncate">{p.name}</div>
                    <Badge variant="outline" className="text-[10px]">{TIER_META[p.tier].label}</Badge>
                    <div className="text-sm font-mono tabular-nums text-amber-700">{fmtUah(p.pendingPayout)} ₴</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions shortcut */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Нарахування комісій</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Деталізація нарахувань, періоди закриття, експорт — у спеціалізованому модулі.</p>
              </div>
              <Button size="sm" onClick={() => navigate("/admin/partner-commissions")}>
                Відкрити модуль нарахувань <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Знижки клієнтам партнерів: <strong className="text-foreground">−25%</strong> (T1), <strong className="text-foreground">−30%</strong> (T2), <strong className="text-foreground">−35%</strong> (T3). Режими розрахунку: «Знижка клієнту» (to_client) або «Revenue share» (партнер отримує різницю).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SystemPageShell>
  );
}
