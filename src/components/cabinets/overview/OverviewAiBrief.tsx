import { useMemo } from "react";
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Cabinet } from "@/types/cabinet";
import type { TabType } from "@/components/dashboard/WorkspacePanel";

interface OverviewAiBriefProps {
  cabinet: Cabinet;
  onTabChange?: (tab: TabType, subTab?: string) => void;
  onChatPromptInsert?: (prompt: string) => void;
}

interface BriefLine {
  tone: "positive" | "neutral" | "warning";
  icon: React.ReactNode;
  text: string;
  cta?: { label: string; onClick: () => void };
}

/**
 * Phase A4 — deterministic AI-style morning brief for individual cabinets.
 * Pure presentation: pulls a few mock signals and renders 3-4 lines that read
 * like a personal financial assistant ("я зробив за вас", "вам варто звернути увагу").
 */
export function OverviewAiBrief({
  cabinet,
  onTabChange,
  onChatPromptInsert,
}: OverviewAiBriefProps) {
  const lines = useMemo<BriefLine[]>(() => {
    const seed = cabinet.id.charCodeAt(0) + cabinet.id.length;
    const items: BriefLine[] = [
      {
        tone: "positive",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        text: `За тиждень AI обробив ${10 + (seed % 8)} вхідних документів і списав ${3 + (seed % 4)} платежі за підписками.`,
        cta: {
          label: "AI-центр",
          onClick: () => onTabChange?.("ai-center" as TabType, "auto-actions"),
        },
      },
      {
        tone: "warning",
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        text: "До дедлайну подання декларації про доходи — 24 дні. Усі базові поля вже заповнено, потрібен ваш підпис.",
        cta: {
          label: "Декларації",
          onClick: () => onTabChange?.("operations" as TabType, "declarations"),
        },
      },
      {
        tone: "neutral",
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        text: "Ваш інвестиційний портфель за місяць +2,8%. Ціль «Подорож» виконано на 64% — ідете в графіку.",
        cta: {
          label: "Заощадження",
          onClick: () => onTabChange?.("savings" as TabType, "goals"),
        },
      },
    ];
    return items;
  }, [cabinet.id, onTabChange]);

  const toneClass = (t: BriefLine["tone"]) =>
    t === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : t === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-primary";

  return (
    <Card className="p-4 md:p-5 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="text-sm font-semibold">Ранковий брифінг від AI</div>
              <div className="text-xs text-muted-foreground">
                Що відбулось, поки вас не було, і що варто зробити сьогодні
              </div>
            </div>
            {onChatPromptInsert && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() =>
                  onChatPromptInsert(
                    "Розкажи коротко, що змінилось у моєму кабінеті за тиждень і що мені варто зробити.",
                  )
                }
              >
                Запитати більше
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
          <ul className="space-y-2">
            {lines.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 ${toneClass(line.tone)}`}>{line.icon}</span>
                <span className="flex-1 text-foreground/85">{line.text}</span>
                {line.cta && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs gap-0.5 shrink-0"
                    onClick={line.cta.onClick}
                  >
                    {line.cta.label}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
