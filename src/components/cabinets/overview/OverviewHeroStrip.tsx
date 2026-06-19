import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { useOverviewBp } from "./OverviewBpContext";
import { OverviewQuickActions, type QuickAction } from "./OverviewQuickActions";
import { expandLegalName } from "@/lib/cabinet/expandLegalName";

interface Props {
  cabinet: Cabinet;
  actions: QuickAction[];
}

export function OverviewHeroStrip({ cabinet, actions }: Props) {
  const { isAtLeast } = useOverviewBp();
  const stack = !isAtLeast("md");
  const fullName = expandLegalName(cabinet.name);

  return (
    <header
      className={cn(
        "flex gap-3 items-start",
        stack ? "flex-col" : "flex-row items-center",
        "rounded-lg border border-border/70 bg-card",
        isAtLeast("md") ? "p-4" : "p-3",
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
            <h1
              className={cn(
                "font-semibold tracking-tight min-w-0 break-words",
                isAtLeast("md") ? "text-lg" : "text-base",
              )}
              title={fullName}
            >
              {fullName}
            </h1>
            {cabinet.taxId && isAtLeast("md") && (
              <span className="text-xs text-muted-foreground font-mono tabular-nums shrink-0">
                · {cabinet.taxId}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={cn(stack && "w-full")}>
        <OverviewQuickActions actions={actions} />
      </div>
    </header>
  );
}
