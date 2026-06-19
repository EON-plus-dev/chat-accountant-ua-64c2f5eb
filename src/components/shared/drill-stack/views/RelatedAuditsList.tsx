/**
 * RelatedAuditsList — перевикористовуваний блок «Згадується в перевірках ДПС».
 * Шукає у demoAudits перевірки, де фігурує контрагент / платіж / документ,
 * і дозволяє drill push до картки перевірки.
 */

import { ShieldAlert, ArrowRight, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { demoAudits, TaxAudit, auditTypeConfig } from "@/config/taxAuditsConfig";
import { useDrillStack } from "../DrillStackProvider";

type Match = "contractor" | "documentFlowId" | "pprId";

interface Props {
  match: Match;
  /** EDRPOU/IPN для contractor; documentFlowId для документа; ID ППР */
  value: string;
}

function findRelatedAudits(match: Match, value: string): TaxAudit[] {
  if (!value) return [];
  return demoAudits.filter((a) => {
    if (match === "contractor") {
      return a.requests.some(
        (r) =>
          r.relatedCounterparty?.code === value ||
          r.relatedCounterparty?.name?.toLowerCase().includes(value.toLowerCase()),
      );
    }
    if (match === "documentFlowId") {
      return a.documents.some((d) => d.documentFlowId === value || d.id === value);
    }
    if (match === "pprId") {
      return a.result?.actNumber === value;
    }
    return false;
  });
}

export function RelatedAuditsList({ match, value }: Props) {
  const { push } = useDrillStack();
  const audits = findRelatedAudits(match, value);

  if (audits.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <FileSearch className="w-3.5 h-3.5" />
        Згадується в перевірках ДПС
      </p>
      <div className="space-y-1.5">
        {audits.map((a) => {
          const t = auditTypeConfig[a.type];
          const TIcon = t.icon;
          const hasViolations = a.result?.hasViolations;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() =>
                push({
                  kind: "audit",
                  id: a.id,
                  displayName: `${t.label} · ${a.orderNumber}`,
                  meta: { title: t.label, period: a.period },
                })
              }
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-md border text-left transition",
                "hover:bg-muted/60",
                hasViolations
                  ? "border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20"
                  : "border-border/60 bg-muted/30",
              )}
            >
              <TIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">
                  {t.label} · {a.orderNumber}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Період: {a.period}
                </p>
              </div>
              {hasViolations && (
                <Badge variant="outline" className="text-[10px] gap-1 text-red-700 border-red-300 bg-red-100/50 dark:bg-red-950/40">
                  <ShieldAlert className="w-3 h-3" />
                  ППР
                </Badge>
              )}
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
