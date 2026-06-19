import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Plug, Bot, AlertTriangle, CreditCard, ChevronRight, Sparkles, Activity, FlaskConical } from "lucide-react";
import { SystemPageShell } from "./SystemPageShell";
import { MOCK_INCIDENTS, MOCK_AI_QA, MOCK_REGULATORY } from "@/admin/system/data/mocks";

const KPI_BLOCKS = [
  { key: "users", icon: Users, title: "Користувачі", to: "/admin/system/users" },
  { key: "cabinets", icon: Building2, title: "Кабінети", to: "/admin/system/cabinets" },
  { key: "integrations", icon: Plug, title: "Інтеграції", to: "/admin/system/integrations/connectors" },
  { key: "ai", icon: Bot, title: "AI здоровʼя", to: "/admin/system/ai/qa" },
  { key: "incidents", icon: AlertTriangle, title: "Інциденти", to: "/admin/system/incidents" },
  { key: "billing", icon: CreditCard, title: "Білінг", to: "/admin/system/billing/transactions" },
] as const;

const MORE_LINKS = [
  { to: "/admin/system/rules", icon: FlaskConical, title: "Rules & Testing Studio", desc: "Події, IF→THEN правила, тест-лабораторія, AI Rules Assistant" },
  { to: "/admin/system/comms", icon: Bot, title: "AI Комунікації (Chat + Voice)", desc: "Оркестрація чату й телефонії, інтенти, ескалації" },
  { to: "/admin/system/audit", icon: Activity, title: "Аудит і комплаєнс", desc: "Хто/коли змінював знання, політики, фінансові коригування" },
  { to: "/admin/system/settings/roles", icon: Sparkles, title: "Налаштування платформи", desc: "RBAC, фіче-флаги, статус-сторінка" },
];

interface Stats {
  users: number | null;
  subscriptions: number | null;
  cabinets: number | null;
}

export default function SystemOverviewPage() {
  const [stats, setStats] = useState<Stats>({ users: null, subscriptions: null, cabinets: null });
  const incidentsActive = MOCK_INCIDENTS.filter((i) => i.status !== "resolved").length;
  const aiNeedsFix = MOCK_AI_QA.filter((q) => q.status === "needs_fix").length;
  const regulatoryPending = MOCK_REGULATORY.filter((r) => r.stage !== "deployed").length;

  useEffect(() => {
    (async () => {
      const [s, c] = await Promise.all([
        supabase.from("user_subscriptions").select("id", { count: "exact", head: true }),
        supabase.from("cabinet_members").select("cabinet_id", { count: "exact", head: true }),
      ]);
      setStats({
        users: s.count ?? null,
        subscriptions: s.count ?? null,
        cabinets: c.count ?? null,
      });
    })();
  }, []);

  const kpiValue: Record<string, string | number> = {
    users: stats.users ?? "—",
    cabinets: stats.cabinets ?? "—",
    integrations: "12 / 14",
    ai: `${aiNeedsFix} fix`,
    incidents: incidentsActive,
    billing: stats.subscriptions ?? "—",
  };

  const kpiHint: Record<string, string> = {
    users: "активних акаунтів",
    cabinets: "членств у кабінетах",
    integrations: "стабільних / усього",
    ai: "діалогів до виправлення",
    incidents: "відкритих інцидентів",
    billing: "активних підписок",
  };

  return (
    <SystemPageShell
      title="Операційний центр"
      description="Щоденний моніторинг платформи: користувачі, кабінети, інтеграції, AI, інциденти, білінг та регуляторика."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_BLOCKS.map((b) => {
          const Icon = b.icon;
          return (
            <NavLink
              key={b.key}
              to={b.to}
              className="group rounded-lg border border-border/70 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {b.title}
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{kpiValue[b.key]}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{kpiHint[b.key]}</div>
            </NavLink>
          );
        })}
      </div>

      {regulatoryPending > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="flex-1 text-sm">
              <div className="font-medium">AI Rules Assistant: {regulatoryPending} оновлень регуляторики в роботі</div>
              <div className="text-muted-foreground text-xs mt-0.5">Перегляньте пропозиції правил, які чекають на затвердження методолога.</div>
            </div>
            <NavLink to="/admin/system/rules/assistant" className="text-xs font-medium text-primary hover:underline shrink-0">
              Відкрити →
            </NavLink>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="text-sm font-semibold mb-2">Розширені модулі</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MORE_LINKS.map((s) => {
            const Icon = s.icon;
            return (
              <NavLink
                key={s.to}
                to={s.to}
                className="group rounded-lg border border-border/70 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all flex items-start gap-3"
              >
                <div className="rounded-md bg-primary/10 p-2 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{s.title}</span>
                    <Badge variant="outline" className="text-[10px]">Демо</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </NavLink>
            );
          })}
        </div>
      </div>
    </SystemPageShell>
  );
}
