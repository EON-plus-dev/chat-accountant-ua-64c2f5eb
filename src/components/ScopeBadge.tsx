import { Badge } from "@/components/ui/badge";
import { User, Building2, Server } from "lucide-react";
import { cn } from "@/lib/utils";

export type Scope = "profile" | "cabinet" | "platform";

const MAP: Record<Scope, { label: string; icon: typeof User; className: string }> = {
  profile: { label: "Рівень профілю", icon: User, className: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30" },
  cabinet: { label: "Рівень кабінету", icon: Building2, className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  platform: { label: "Рівень платформи", icon: Server, className: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30" },
};

interface Props {
  scope: Scope;
  className?: string;
}

export function ScopeBadge({ scope, className }: Props) {
  const cfg = MAP[scope];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-normal", cfg.className, className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}
