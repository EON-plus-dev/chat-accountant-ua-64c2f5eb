import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { CabinetRequisites } from "@/config/cabinetRequisitesDemo";
import { getEntityStyle } from "@/config/entityStyles";

interface Props {
  cabinet: Cabinet;
  requisites: CabinetRequisites;
  shortTax?: string | null;
}

/** OG-style mini preview of the share link, as seen in messenger snippets. */
export function LinkPreviewCard({ cabinet, requisites, shortTax }: Props) {
  const style = getEntityStyle(cabinet.type);
  const Icon = style.icon;
  const code = requisites.edrpou || requisites.ipn;
  const codeLabel = requisites.edrpou ? "ЄДРПОУ" : "ІПН";

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/70 bg-muted/20">
      <div className={cn("rounded-md flex items-center justify-center shrink-0 w-9 h-9", style.bgColor)}>
        <Icon className={cn("w-4 h-4", style.color)} />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="text-sm font-semibold truncate">{requisites.name || cabinet.name}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          {code && (
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              {codeLabel} {code}
              <Lock className="w-3 h-3 text-muted-foreground/50" />
            </span>
          )}
          {shortTax && <span>· {shortTax}</span>}
        </div>
        <div className="text-[10px] text-muted-foreground/70">fintodo.com.ua · реквізити контрагента</div>
      </div>
    </div>
  );
}
