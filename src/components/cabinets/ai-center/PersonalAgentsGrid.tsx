import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Wallet, PiggyBank, Heart, Users, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAgentsForCabinet, type AgentStatus, type PersonalAgent } from "@/personal/aiCenter/personalAgentsMock";

const ICON_MAP = {
  assistant: Bot,
  budget: Wallet,
  savings: PiggyBank,
  health: Heart,
  family: Users,
} as const;

const STATUS_BADGE: Record<AgentStatus, { label: string; className: string }> = {
  active: { label: "Активний", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
  paused: { label: "Пауза", className: "bg-muted text-muted-foreground border" },
  setup_required: { label: "Потребує налаштування", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
};

interface Props {
  cabinetId: string;
  onConfigure?: (agentId: string) => void;
}

export function PersonalAgentsGrid({ cabinetId, onConfigure }: Props) {
  const agents = getAgentsForCabinet(cabinetId);
  if (agents.length === 0) {
    return <p className="text-sm text-muted-foreground">AI-агентів ще не запущено.</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {agents.map((a) => (
        <AgentCard key={a.id} agent={a} onConfigure={() => onConfigure?.(a.id)} />
      ))}
    </div>
  );
}

function AgentCard({ agent, onConfigure }: { agent: PersonalAgent; onConfigure: () => void }) {
  const Icon = ICON_MAP[agent.icon] ?? Bot;
  const badge = STATUS_BADGE[agent.status];
  return (
    <Card className="p-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{agent.name}</span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded", badge.className)}>{badge.label}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{agent.role}</p>
          <p className="text-xs text-foreground/80 mt-2 line-clamp-2">{agent.description}</p>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Остання дія: <span className="text-foreground">{agent.lastAction}</span>
            <span className="block">{agent.lastActionAt} · {agent.monthlyActions} дій/міс</span>
          </div>
          <div className="mt-3">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={onConfigure}>
              <SettingsIcon className="w-3 h-3" /> Налаштувати
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
