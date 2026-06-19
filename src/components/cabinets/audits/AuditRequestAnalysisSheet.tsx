import { useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Scale,
  FileText,
  ListChecks,
  ShieldAlert,
  Copy,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditRequest } from "@/config/taxAuditsConfig";
import { analyzeAuditRequest, AnalysisRiskLevel } from "@/lib/mockAuditRequestAnalysis";
import { useToast } from "@/hooks/use-toast";

interface AuditRequestAnalysisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AuditRequest | null;
  onUseDraft?: (draft: string) => void;
}

const riskCfg: Record<
  AnalysisRiskLevel,
  { label: string; cls: string }
> = {
  low: {
    label: "Низький",
    cls: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  medium: {
    label: "Середній",
    cls: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  high: {
    label: "Високий",
    cls: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300",
  },
};

export const AuditRequestAnalysisSheet = ({
  open,
  onOpenChange,
  request,
  onUseDraft,
}: AuditRequestAnalysisSheetProps) => {
  const { toast } = useToast();
  const analysis = useMemo(
    () => (request ? analyzeAuditRequest(request) : null),
    [request],
  );

  if (!request || !analysis) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.draftResponse);
    toast({ title: "Чернетку скопійовано" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI-аналіз запиту
          </SheetTitle>
          <SheetDescription>
            Запит {request.number} · {request.subject}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Intent */}
          <section className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Що насправді хоче інспектор
            </p>
            <p className="text-sm">{analysis.intent}</p>
          </section>

          {/* Legal basis */}
          <section className="flex items-start gap-2 p-3 rounded-md bg-muted/40 border border-border/60">
            <Scale className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="text-xs text-muted-foreground">Юридична підстава</p>
              <p className="font-medium">{analysis.legalBasis}</p>
            </div>
          </section>

          {/* Required items */}
          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Що треба надати
            </p>
            <ul className="space-y-1.5">
              {analysis.requiredItems.map((it, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </section>

          <Separator />

          {/* Response outline */}
          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5" />
              План відповіді
            </p>
            <ol className="space-y-1.5">
              {analysis.responseOutline.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 font-medium">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Risks */}
          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              Ризики
            </p>
            <div className="space-y-2">
              {analysis.risks.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 p-2.5 rounded-md border text-sm",
                    riskCfg[r.level].cls,
                  )}
                >
                  <Badge variant="outline" className={cn("shrink-0", riskCfg[r.level].cls)}>
                    {riskCfg[r.level].label}
                  </Badge>
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Draft */}
          <section className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Чернетка відповіді
            </p>
            <div className="text-sm whitespace-pre-wrap p-3 rounded-md bg-muted/40 border border-border/60 font-mono leading-relaxed">
              {analysis.draftResponse}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                Скопіювати
              </Button>
              {onUseDraft && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    onUseDraft(analysis.draftResponse);
                    onOpenChange(false);
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  Використати у відповіді
                </Button>
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};
