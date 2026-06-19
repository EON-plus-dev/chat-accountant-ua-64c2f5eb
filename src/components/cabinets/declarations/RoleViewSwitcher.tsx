import { Eye, Crown, UserCog, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DEMO_ROLE_VIEW_DESCRIPTIONS,
  DEMO_ROLE_VIEW_LABELS,
  useDemoRoleView,
  type DemoRoleView,
} from "@/contexts/DemoRoleViewContext";

const ICONS: Record<DemoRoleView, typeof Crown> = {
  owner: Crown,
  trustee: UserCog,
  tax_consultant: ShieldCheck,
};

/**
 * Інлайн-перемикач ролі для демонстрації workflow декларацій.
 * Показує поточну роль + tooltip з описом її можливостей.
 */
export function RoleViewSwitcher({ compact = false }: { compact?: boolean }) {
  const { role, setRole } = useDemoRoleView();
  const Icon = ICONS[role];

  return (
    <TooltipProvider>
      <div className="inline-flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 cursor-help">
              <Eye className="size-3" /> Демо-режим
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Перемикайте роль, щоб побачити, як кабінет виглядає для власника, довіреної особи та податкового консультанта.
            У продакшні роль визначається авторизацією.
          </TooltipContent>
        </Tooltip>
        <Select value={role} onValueChange={(v) => setRole(v as DemoRoleView)}>
          <SelectTrigger className={compact ? "h-8 w-[200px] text-xs" : "h-9 w-[240px]"}>
            <span className="inline-flex items-center gap-2">
              <Icon className="size-3.5" />
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent align="end">
            {(Object.keys(DEMO_ROLE_VIEW_LABELS) as DemoRoleView[]).map((r) => {
              const RIcon = ICONS[r];
              return (
                <SelectItem key={r} value={r}>
                  <div className="flex items-start gap-2 py-0.5">
                    <RIcon className="size-3.5 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{DEMO_ROLE_VIEW_LABELS[r]}</div>
                      <div className="text-[11px] text-muted-foreground leading-tight">
                        {DEMO_ROLE_VIEW_DESCRIPTIONS[r]}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </TooltipProvider>
  );
}

export default RoleViewSwitcher;
