import { useNavigate } from "react-router-dom";
import { SystemPageShell } from "./SystemPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MOCK_AI_COST_BY_MODEL,
  MOCK_AI_COST_BY_OPERATION,
  MOCK_AI_COST_BY_CABINET,
  MOCK_AI_COST_SUMMARY,
} from "@/admin/system/data/mocks";
import { AlertTriangle, EyeOff, ArrowRight, Download } from "lucide-react";

const fmtUsd = (n: number) => `$${n.toFixed(2)}`;
const fmtUah = (n: number) => `${new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(n)} ₴`;
const fmtInt = (n: number) => new Intl.NumberFormat("uk-UA").format(n);
const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const marginCls = (n: number) =>
  n >= 40 ? "text-emerald-700" : n >= 15 ? "text-amber-700" : "text-rose-700";

export default function SystemAiCostPage() {
  const navigate = useNavigate();
  const s = MOCK_AI_COST_SUMMARY;

  return (
    <SystemPageShell
      title="AI-собівартість (COGS)"
      description="Внутрішні витрати платформи на AI Gateway у USD та маржа відносно нарахованих клієнтам кредитів. Не плутати з клієнтським «Витрати на AI» (кредити), що відображається в кабінеті."
      actions={<Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" />Експорт CSV</Button>}
    >
      {/* Confidential banner */}
      <div className="flex items-start gap-2 rounded-md border border-violet-500/30 bg-violet-500/10 p-2.5 text-xs">
        <EyeOff className="h-3.5 w-3.5 mt-0.5 text-violet-700 shrink-0" />
        <div className="text-violet-900 dark:text-violet-200">
          <strong>Внутрішні дані FINTODO.</strong> Не відображаються клієнтам у кабінетах. Для клієнтського перегляду витрат див. розділ «Витрати на AI» (кредити) у відповідному кабінеті.
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <Card><CardContent className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Revenue (кредити, ₴)</div>
          <div className="text-lg font-semibold tabular-nums">{fmtUah(s.revenueUah)}</div>
          <div className="text-[10px] text-muted-foreground">за період</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">COGS (USD)</div>
          <div className="text-lg font-semibold tabular-nums">{fmtUsd(s.cogsUsd)}</div>
          <div className="text-[10px] text-muted-foreground">≈ {fmtUah(s.cogsUsd * s.fxRate)} (FX {s.fxRate})</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Gross margin</div>
          <div className={`text-lg font-semibold tabular-nums ${marginCls(s.grossMarginPct)}`}>{fmtPct(s.grossMarginPct)}</div>
          <div className="text-[10px] text-muted-foreground">Revenue − COGS</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Cost / active cabinet</div>
          <div className="text-lg font-semibold tabular-nums">{fmtUsd(s.costPerActiveCabinetUsd)}</div>
          <div className="text-[10px] text-muted-foreground">за період</div>
        </CardContent></Card>
        <Card><CardContent className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Anomalies 24h</div>
          <div className={`text-lg font-semibold tabular-nums ${s.anomalies24h > 0 ? "text-amber-700" : ""}`}>{s.anomalies24h}</div>
          <Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={() => navigate("/admin/system/billing/anomalies")}>
            Деталізація <ArrowRight className="h-3 w-3 ml-0.5" />
          </Button>
        </CardContent></Card>
      </div>

      {/* By model */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">По моделях</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[2fr_0.7fr_1fr_1fr_0.9fr_0.7fr_0.8fr] gap-3 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border">
            <div>Модель</div><div className="text-right">Calls</div><div className="text-right">Input tok</div>
            <div className="text-right">Output tok</div><div className="text-right">USD</div>
            <div className="text-right">Latency</div><div className="text-right">Success</div>
          </div>
          <div className="divide-y divide-border/60">
            {MOCK_AI_COST_BY_MODEL.map((m) => (
              <div key={m.model} className="grid grid-cols-1 md:grid-cols-[2fr_0.7fr_1fr_1fr_0.9fr_0.7fr_0.8fr] gap-2 md:gap-3 px-3 py-2.5 items-center text-sm">
                <div className="font-mono text-xs truncate">{m.model}</div>
                <div className="font-mono tabular-nums text-right">{fmtInt(m.calls)}</div>
                <div className="font-mono tabular-nums text-right text-muted-foreground">{fmtInt(m.inputTokens)}</div>
                <div className="font-mono tabular-nums text-right text-muted-foreground">{fmtInt(m.outputTokens)}</div>
                <div className="font-mono tabular-nums text-right font-semibold">{fmtUsd(m.usdSpent)}</div>
                <div className="font-mono tabular-nums text-right text-muted-foreground">{m.avgLatencyMs}мс</div>
                <div className="font-mono tabular-nums text-right">{(m.successRate * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By operation */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">По операціях (OPERATION_CATALOG)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[2fr_0.8fr_1fr_1fr_0.9fr_0.8fr] gap-3 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border">
            <div>Операція</div><div className="text-right">Calls</div><div className="text-right">Кредити</div>
            <div className="text-right">Revenue ₴</div><div className="text-right">COGS USD</div><div className="text-right">Margin</div>
          </div>
          <div className="divide-y divide-border/60">
            {MOCK_AI_COST_BY_OPERATION.map((o) => (
              <div key={o.operationType} className="grid grid-cols-1 md:grid-cols-[2fr_0.8fr_1fr_1fr_0.9fr_0.8fr] gap-2 md:gap-3 px-3 py-2.5 items-center text-sm">
                <div className="min-w-0">
                  <div className="truncate">{o.label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">{o.operationType}</div>
                </div>
                <div className="font-mono tabular-nums text-right">{fmtInt(o.calls)}</div>
                <div className="font-mono tabular-nums text-right text-muted-foreground">{fmtInt(o.creditsCharged)}</div>
                <div className="font-mono tabular-nums text-right">{fmtUah(o.revenueUah)}</div>
                <div className="font-mono tabular-nums text-right">{fmtUsd(o.usdCost)}</div>
                <div className={`font-mono tabular-nums text-right font-semibold ${marginCls(o.marginPct)}`}>{fmtPct(o.marginPct)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By cabinet */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Топ кабінетів за COGS</CardTitle>
          <span className="text-xs text-muted-foreground">від'ємна маржа = клієнт коштує дорожче, ніж платить</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[1.6fr_0.9fr_0.7fr_0.9fr_0.9fr_0.8fr] gap-3 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border">
            <div>Кабінет</div><div>План</div><div className="text-right">Calls</div>
            <div className="text-right">COGS USD</div><div className="text-right">Кредити</div><div className="text-right">Margin</div>
          </div>
          <div className="divide-y divide-border/60">
            {MOCK_AI_COST_BY_CABINET.map((c) => (
              <div
                key={c.cabinetId}
                className="grid grid-cols-1 md:grid-cols-[1.6fr_0.9fr_0.7fr_0.9fr_0.9fr_0.8fr] gap-2 md:gap-3 px-3 py-2.5 items-center text-sm hover:bg-muted/40 cursor-pointer"
                onClick={() => navigate(`/admin/system/cabinets/${c.cabinetId}`)}
              >
                <div className="font-medium truncate flex items-center gap-1.5">
                  {c.marginPct < 0 && <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
                  {c.cabinetName}
                </div>
                <div className="text-xs"><Badge variant="outline" className="text-[10px]">{c.plan}</Badge></div>
                <div className="font-mono tabular-nums text-right">{fmtInt(c.calls)}</div>
                <div className="font-mono tabular-nums text-right font-semibold">{fmtUsd(c.usdCost)}</div>
                <div className="font-mono tabular-nums text-right text-muted-foreground">{fmtInt(c.creditsCharged)}</div>
                <div className={`font-mono tabular-nums text-right font-semibold ${marginCls(c.marginPct)}`}>{fmtPct(c.marginPct)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SystemPageShell>
  );
}
