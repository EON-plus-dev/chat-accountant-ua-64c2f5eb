import { useMemo, useState } from "react";
import {
  TrendingUp, Users, DollarSign, Sparkles, Phone, Mail, Calendar as CalendarIcon,
  MessageSquare, ChevronRight, Search, AlertTriangle, CreditCard, Handshake, Cpu, Receipt,
  ChevronLeft,
} from "lucide-react";
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { cn } from "@/lib/utils";
import {
  FINTODO_SUBSCRIPTIONS,
  STAGE_LABEL,
  STAGE_COLOR,
  formatUAH as formatSubUAH,
} from "@/config/demoCabinets/fintodoSubscriptionsData";

// ──────────────────────────── ТИПИ ────────────────────────────
type Stage = "lead" | "demo" | "trial" | "paid" | "expand" | "lost";
type Plan = "Free" | "Start" | "Smart" | "Pro";
type Segment = "SMB" | "Mid" | "Enterprise" | "Партнер" | "Бухгалтерія";

interface CrmDeal {
  id: string;
  company: string;
  contact: string;
  plan: Plan;
  mrr: number;
  probability: number;
  expectedClose: string;
  stage: Stage;
  owner: string;
  nextStep: string;
  segment: Segment;
  region: string;
  lastTouch: string;
  aiUsage?: number;
  nps?: number;
  churnRisk?: "low" | "med" | "high";
}

// ──────────────────────────── ДЕМО-ДАНІ ────────────────────────────
import {
  FINTODO_DEALS, FINTODO_STAGES,
  getFintodoClientById, formatUAH as _formatUAH,
} from "@/config/demoCabinets/fintodoCrmData";

const stages: { id: Stage; label: string; color: string }[] = FINTODO_STAGES.map(s => ({
  id: s.id as Stage, label: s.label, color: s.color,
}));

const INITIAL_DEALS: CrmDeal[] = FINTODO_DEALS.map(d => {
  const client = getFintodoClientById(d.clientId);
  return {
    id: d.id,
    company: d.company,
    contact: d.contact,
    plan: d.plan as Plan,
    mrr: d.mrr,
    probability: d.probability,
    expectedClose: d.expectedCloseAt,
    stage: d.stage as Stage,
    owner: d.ownerId,
    nextStep: d.nextStep,
    segment: d.segment as Segment,
    region: d.region,
    lastTouch: d.lastTouch,
    aiUsage: client?.aiCreditsPerMonth,
    nps: client?.nps,
    churnRisk: client?.churnRisk,
  };
});

const planColors: Record<Plan, string> = {
  Free:  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Start: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Smart: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  Pro:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const formatUAH = _formatUAH;

// дефолтна ймовірність при переході в стадію
const STAGE_PROB: Record<Stage, number> = {
  lead: 10, demo: 30, trial: 55, paid: 100, expand: 100, lost: 0,
};

// ──────────────────────────── KPI ────────────────────────────
const CrmKpiStrip = ({ deals }: { deals: CrmDeal[] }) => {
  const totalMRR = deals.filter(d => d.stage === "paid").reduce((s, d) => s + d.mrr, 0);
  const activeClients = deals.filter(d => d.stage === "paid").length;
  const trials = deals.filter(d => d.stage === "trial").length;
  const churnRisk = deals.filter(d => d.churnRisk === "high").length;
  const arpu = activeClients ? Math.round(totalMRR / activeClients) : 0;
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <UniversalKPICard density="compact" title="MRR"        value={formatUAH(totalMRR)} icon={DollarSign} trend={{ value: 12, direction: "up" }} />
      <UniversalKPICard density="compact" title="Активних"   value={activeClients}        icon={Users}      trend={{ value: 8,  direction: "up" }} />
      <UniversalKPICard density="compact" title="ARPU"       value={formatUAH(arpu)}      icon={TrendingUp} />
      <UniversalKPICard density="compact" title="Тріалів"    value={trials}               icon={Sparkles} />
      <UniversalKPICard density="compact" title="Churn-ризик" value={churnRisk}           icon={AlertTriangle} variant={churnRisk > 0 ? "warning" : "default"} />
    </div>
  );
};

// ──────────────────────────── КАРТКА УГОДИ ────────────────────────────
const DealCardInner = ({ deal }: { deal: CrmDeal }) => (
  <div className="space-y-2">
    <div className="flex items-start justify-between gap-2">
      <div className="font-medium text-sm leading-tight truncate">{deal.company}</div>
      <Badge variant="secondary" className={cn("text-[10px] shrink-0", planColors[deal.plan])}>{deal.plan}</Badge>
    </div>
    <div className="text-xs text-muted-foreground truncate">{deal.contact} • {deal.region}</div>
    <div className="flex items-center justify-between text-xs">
      <span className="font-semibold tabular-nums">{formatUAH(deal.mrr)}/міс</span>
      <span className="text-muted-foreground">{deal.probability}%</span>
    </div>
    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
      <ChevronRight className="h-3 w-3 shrink-0" />
      {deal.nextStep}
    </div>
  </div>
);

const DraggableDealCard = ({ deal, onClick }: { deal: CrmDeal; onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-md border border-border/70 bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30"
      )}
    >
      <DealCardInner deal={deal} />
    </div>
  );
};

// ──────────────────────────── СТОВПЕЦЬ ────────────────────────────
const StageColumn = ({
  stage, deals, onPick,
}: { stage: typeof stages[number]; deals: CrmDeal[]; onPick: (d: CrmDeal) => void }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `stage:${stage.id}` });
  const sum = deals.reduce((s, d) => s + d.mrr, 0);
  const weighted = deals.reduce((s, d) => s + (d.mrr * d.probability) / 100, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg bg-muted/30 p-2 min-h-[200px] transition-colors",
        isOver && "bg-primary/10 ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("h-2 w-2 rounded-full shrink-0", stage.color)} />
          <span className="text-sm font-medium truncate">{stage.label}</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1">{deals.length}</Badge>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-muted-foreground tabular-nums">{formatUAH(sum)}</div>
          {stage.id !== "paid" && stage.id !== "lost" && stage.id !== "expand" && weighted > 0 && (
            <div className="text-[9px] text-muted-foreground/70 tabular-nums">~{formatUAH(Math.round(weighted))} зваж.</div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {deals.map(d => <DraggableDealCard key={d.id} deal={d} onClick={() => onPick(d)} />)}
      </div>
    </div>
  );
};

// ──────────────────────────── PIPELINE (DnD desktop + mobile swipe) ────────────────────────────
const CrmPipeline = ({
  deals, onPick, onMove,
}: { deals: CrmDeal[]; onPick: (d: CrmDeal) => void; onMove: (dealId: string, stage: Stage) => void }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileStageIdx, setMobileStageIdx] = useState(0);

  const handleStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const over = e.over?.id ? String(e.over.id) : "";
    if (!over.startsWith("stage:")) return;
    const stage = over.slice("stage:".length) as Stage;
    onMove(String(e.active.id), stage);
  };

  const active = activeId ? deals.find(d => d.id === activeId) : null;
  const mobileStage = stages[mobileStageIdx];
  const mobileDeals = deals.filter(d => d.stage === mobileStage.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleStart} onDragEnd={handleEnd}>
      {/* Desktop / tablet — 5+ колонок */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stages.map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            deals={deals.filter(d => d.stage === stage.id)}
            onPick={onPick}
          />
        ))}
      </div>

      {/* Mobile — карусель між стадіями */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
            onClick={() => setMobileStageIdx(i => Math.max(0, i - 1))} disabled={mobileStageIdx === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <span className={cn("h-2 w-2 rounded-full", mobileStage.color)} />
            <span className="text-sm font-medium">{mobileStage.label}</span>
            <Badge variant="outline" className="text-[10px] h-4 px-1">{mobileDeals.length}</Badge>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
            onClick={() => setMobileStageIdx(i => Math.min(stages.length - 1, i + 1))}
            disabled={mobileStageIdx === stages.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-1 px-1 overflow-x-auto scrollbar-hide">
          {stages.map((s, i) => (
            <button key={s.id} onClick={() => setMobileStageIdx(i)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border whitespace-nowrap",
                i === mobileStageIdx ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              )}>
              {s.label}
            </button>
          ))}
        </div>
        <StageColumn stage={mobileStage} deals={mobileDeals} onPick={onPick} />
      </div>

      <DragOverlay>
        {active && (
          <div className="rounded-md border border-primary bg-card p-3 shadow-lg w-64">
            <DealCardInner deal={active} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

// ──────────────────────────── FORECAST ────────────────────────────
const CrmForecast = ({ deals }: { deals: CrmDeal[] }) => {
  const buckets = useMemo(() => {
    const map = new Map<string, { month: string; pipeline: number; weighted: number; count: number }>();
    deals.filter(d => d.stage !== "paid" && d.stage !== "lost").forEach(d => {
      const m = d.expectedClose.slice(0, 7); // YYYY-MM
      const cur = map.get(m) ?? { month: m, pipeline: 0, weighted: 0, count: 0 };
      cur.pipeline += d.mrr;
      cur.weighted += (d.mrr * d.probability) / 100;
      cur.count += 1;
      map.set(m, cur);
    });
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  }, [deals]);

  const totalPipe = buckets.reduce((s, b) => s + b.pipeline, 0);
  const totalWeighted = buckets.reduce((s, b) => s + b.weighted, 0);
  const maxBar = Math.max(1, ...buckets.map(b => b.pipeline));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <UniversalKPICard density="compact" title="Pipeline (повний)" value={formatUAH(totalPipe) + "/міс"} icon={TrendingUp} />
        <UniversalKPICard density="compact" title="Forecast (зважений)" value={formatUAH(Math.round(totalWeighted)) + "/міс"} icon={Sparkles} variant="success" />
        <UniversalKPICard density="compact" title="Угод у роботі" value={buckets.reduce((s, b) => s + b.count, 0)} icon={Users} />
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-medium">Прогноз закриття по місяцях</div>
          {buckets.length === 0 ? (
            <div className="text-xs text-muted-foreground py-6 text-center">Немає активних угод для прогнозу</div>
          ) : (
            <div className="space-y-2">
              {buckets.map(b => (
                <div key={b.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium tabular-nums">{b.month}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatUAH(Math.round(b.weighted))} <span className="opacity-50">/ {formatUAH(b.pipeline)}</span> · {b.count} уг.
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-primary/20 rounded-full" style={{ width: `${(b.pipeline / maxBar) * 100}%` }} />
                    <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${(b.weighted / maxBar) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-2 border-t">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Зважено (MRR × ймовірність)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary/20" />Повний pipeline</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ──────────────────────────── СПИСОК КЛІЄНТІВ ────────────────────────────
const CrmClientsTable = ({ deals, onPick }: { deals: CrmDeal[]; onPick: (d: CrmDeal) => void }) => {
  const [q, setQ] = useState("");
  const clients = deals.filter(d => d.stage === "paid");
  const filtered = clients.filter(d =>
    !q || [d.company, d.contact, d.region].some(s => s.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Пошук клієнта…" className="pl-8 h-9" />
      </div>
      <div className="border rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Клієнт</th>
              <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Контакт</th>
              <th className="text-left px-3 py-2 font-medium">Тариф</th>
              <th className="text-right px-3 py-2 font-medium">MRR</th>
              <th className="text-right px-3 py-2 font-medium hidden md:table-cell">AI/міс</th>
              <th className="text-center px-3 py-2 font-medium hidden md:table-cell">NPS</th>
              <th className="text-left px-3 py-2 font-medium">Ризик</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => onPick(c)}>
                <td className="px-3 py-2 font-medium">{c.company}</td>
                <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">{c.contact}</td>
                <td className="px-3 py-2"><Badge variant="secondary" className={cn("text-[10px]", planColors[c.plan])}>{c.plan}</Badge></td>
                <td className="px-3 py-2 text-right tabular-nums font-semibold">{formatUAH(c.mrr)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground hidden md:table-cell">{c.aiUsage ?? "—"}</td>
                <td className="px-3 py-2 text-center hidden md:table-cell">{c.nps ?? "—"}</td>
                <td className="px-3 py-2">
                  {c.churnRisk === "high"  && <Badge variant="destructive" className="text-[10px]">Високий</Badge>}
                  {c.churnRisk === "med"   && <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">Середній</Badge>}
                  {c.churnRisk === "low"   && <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">Низький</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ──────────────────────────── ТАЙМЛАЙН ────────────────────────────
const activities = [
  { id: "a1", kind: "call",  icon: Phone,        who: "Анна (Sales)",  what: "Дзвінок з ТОВ «Біотек Україна» — погодили інтеграцію з ПриватБанком", when: "10:24" },
  { id: "a2", kind: "email", icon: Mail,         who: "Дмитро (CSM)",  what: "Лист до Бюро «БухОблік+» — комерційна пропозиція реселера 30%",        when: "09:50" },
  { id: "a3", kind: "demo",  icon: CalendarIcon, who: "Анна (Sales)",  what: "Демо для ТОВ «Гранд-Інвест» — CFO + бухгалтер, 45 хв",                 when: "Вчора, 16:00" },
  { id: "a4", kind: "note",  icon: MessageSquare,who: "AI-агент",      what: "Виявлено churn-ризик: ФОП Іван Олійник — активність ↓88% за 30 днів",  when: "Вчора, 11:12" },
  { id: "a5", kind: "call",  icon: Phone,        who: "Support",       what: "Тікет №1247 від ТОВ «Енергодом» — питання по декларації ПДВ",          when: "2 дні тому" },
];

const CrmTimeline = () => (
  <div className="space-y-2">
    {activities.map(a => {
      const Icon = a.icon;
      return (
        <Card key={a.id}>
          <CardContent className="py-3 flex gap-3">
            <div className="rounded-full bg-primary/10 p-2 h-fit"><Icon className="h-4 w-4 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm">{a.what}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{a.who} • {a.when}</div>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

// ──────────────────────────── ДЕТАЛЬНА КАРТКА ────────────────────────────
const DealDetailSheet = ({ deal, onOpenChange }: { deal: CrmDeal | null; onOpenChange: (o: boolean) => void }) => {
  const sub = useMemo(
    () => (deal ? FINTODO_SUBSCRIPTIONS.find(s => s.clientName === deal.company) : undefined),
    [deal]
  );

  return (
    <Sheet open={!!deal} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {deal && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-start gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback>{deal.company.slice(0, 2)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold truncate">{deal.company}</div>
                  <div className="text-xs text-muted-foreground font-normal">{deal.contact} • {deal.region}</div>
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Тариф</div><Badge variant="secondary" className={cn("text-[11px]", planColors[deal.plan])}>{deal.plan}</Badge></div>
                <div><div className="text-xs text-muted-foreground">MRR</div><div className="font-semibold tabular-nums">{formatUAH(deal.mrr)}/міс</div></div>
                <div><div className="text-xs text-muted-foreground">Ймовірність</div><div>{deal.probability}%</div></div>
                <div><div className="text-xs text-muted-foreground">Очік. закриття</div><div>{deal.expectedClose}</div></div>
                <div><div className="text-xs text-muted-foreground">Відповідальний</div><div>{deal.owner}</div></div>
                <div><div className="text-xs text-muted-foreground">Сегмент</div><div>{deal.segment}</div></div>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground mb-1">Наступний крок</div>
                <div className="text-sm">{deal.nextStep}</div>
              </div>

              {sub && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    360° огляд клієнта
                  </div>

                  <Card>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="rounded-md bg-primary/10 p-2"><CreditCard className="h-4 w-4 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Підписка {sub.planLabel}</span>
                          <span className={cn("h-1.5 w-1.5 rounded-full", STAGE_COLOR[sub.stage])} />
                          <span className="text-[11px] text-muted-foreground">{STAGE_LABEL[sub.stage]}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Наступна оплата: {sub.nextBillAt}
                          {sub.trialEndsAt && ` · trial до ${sub.trialEndsAt}`}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold tabular-nums">{formatSubUAH(sub.mrr)}</div>
                        <div className="text-[10px] text-muted-foreground">/міс</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="rounded-md bg-violet-500/10 p-2"><Cpu className="h-4 w-4 text-violet-600 dark:text-violet-400" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">AI-кредити</div>
                        <div className="text-[11px] text-muted-foreground">
                          Витрата: ~{deal.aiUsage ?? 0} кр./міс · залишок {sub.creditsBalance}
                        </div>
                      </div>
                      {sub.monthlyTopUps > 0 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{formatSubUAH(sub.monthlyTopUps)} топ-апів
                        </Badge>
                      )}
                    </CardContent>
                  </Card>

                  {sub.partnerId && (
                    <Card>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="rounded-md bg-amber-500/10 p-2"><Handshake className="h-4 w-4 text-amber-600 dark:text-amber-400" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">Партнер-канал</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            Привів: {sub.partnerName ?? sub.partnerId} · бюро/реселер
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="rounded-md bg-emerald-500/10 p-2"><Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">Платежі та документи</div>
                        <div className="text-[11px] text-muted-foreground">
                          Інвойси й рух коштів — у розділі «Фінанси» та «Документи»
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button size="sm"><Phone className="h-4 w-4 mr-1.5" />Дзвінок</Button>
                <Button size="sm" variant="outline"><Mail className="h-4 w-4 mr-1.5" />Лист</Button>
                <Button size="sm" variant="secondary"><Sparkles className="h-4 w-4 mr-1.5" />AI: Підготувати follow-up</Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

// ──────────────────────────── КОРІНЬ ────────────────────────────
const CrmSection = () => {
  const [picked, setPicked] = useState<CrmDeal | null>(null);
  const [deals, setDeals] = useState<CrmDeal[]>(INITIAL_DEALS);

  const handleMove = (dealId: string, stage: Stage) => {
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId || d.stage === stage) return d;
      return { ...d, stage, probability: STAGE_PROB[stage] };
    }));
  };

  return (
    <div className="px-4 md:px-6 space-y-5 min-w-0">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Клієнти Fintodo</h2>
          <p className="text-sm text-muted-foreground">Воронка продажів, активні підписки, активності команди</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary"><Sparkles className="h-4 w-4 mr-1.5" />AI: Churn-ризик</Button>
          <Button size="sm"><Users className="h-4 w-4 mr-1.5" />Новий лід</Button>
        </div>
      </div>

      <CrmKpiStrip deals={deals} />

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Воронка</TabsTrigger>
          <TabsTrigger value="forecast">Прогноз</TabsTrigger>
          <TabsTrigger value="clients">Клієнти</TabsTrigger>
          <TabsTrigger value="activity">Активності</TabsTrigger>
        </TabsList>
        <TabsContent value="pipeline" className="mt-4"><CrmPipeline deals={deals} onPick={setPicked} onMove={handleMove} /></TabsContent>
        <TabsContent value="forecast" className="mt-4"><CrmForecast deals={deals} /></TabsContent>
        <TabsContent value="clients"  className="mt-4"><CrmClientsTable deals={deals} onPick={setPicked} /></TabsContent>
        <TabsContent value="activity" className="mt-4"><CrmTimeline /></TabsContent>
      </Tabs>

      <DealDetailSheet deal={picked} onOpenChange={o => !o && setPicked(null)} />
    </div>
  );
};

export default CrmSection;
