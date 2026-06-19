import { ReactNode, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IaSubTab {
  id: string;
  label: string;
  question: string;
  description: string;
  capabilities: { label: string; description: string }[];
  footerLink?: { label: string; onClick: () => void };
  /** Якщо передано — рендериться замість stub-карток з capabilities. */
  renderContent?: () => ReactNode;
  /** Маркер «вже працює» — додає зелений бейдж «є дані». */
  ready?: boolean;
}

interface IaSectionShellProps {
  icon: ReactNode;
  title: string;
  question: string;
  description: string;
  badge?: string;
  subTabs: IaSubTab[];
  defaultSubTab?: string;
  currentLocations?: { label: string; onClick: () => void }[];
}

/**
 * Phase A3 shell: top intro + sub-tab strip + per-tab stub panel.
 * Used by Work Center, Network, AI Center, Savings.
 */
export function IaSectionShell({
  icon,
  title,
  question,
  description,
  badge = "Незабаром",
  subTabs,
  defaultSubTab,
  currentLocations,
}: IaSectionShellProps) {
  const [active, setActive] = useState<string>(defaultSubTab ?? subTabs[0]?.id);
  const tab = subTabs.find((t) => t.id === active) ?? subTabs[0];

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                {badge}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Питання користувача: <span className="italic">«{question}»</span>
            </p>
          </div>
        </div>
        <p className="text-sm md:text-base text-foreground/80 max-w-3xl">{description}</p>
      </header>

      <div className="flex gap-1 overflow-x-auto border-b scrollbar-hide">
        {subTabs.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={cn(
              "px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors",
              s.id === active
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {tab && (
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-base font-medium">{tab.label}</h2>
            {tab.ready && (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                є дані
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4 italic">«{tab.question}»</p>
          {tab.renderContent ? (
            tab.renderContent()
          ) : (
            <>
              <p className="text-sm text-foreground/80 mb-4 max-w-3xl">{tab.description}</p>
              <ul className="grid gap-3 md:grid-cols-2">
                {tab.capabilities.map((cap) => (
                  <li
                    key={cap.label}
                    className="rounded-lg border bg-card p-3 hover:bg-accent/30 transition-colors"
                  >
                    <div className="font-medium text-sm">{cap.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{cap.description}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {tab.footerLink && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="link" size="sm" className="gap-1.5 px-0" onClick={tab.footerLink.onClick}>
                {tab.footerLink.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {currentLocations && currentLocations.length > 0 && (
        <Card className="p-4 md:p-6 bg-muted/30">
          <h2 className="text-sm font-medium mb-3">Де це працює зараз</h2>
          <div className="flex flex-wrap gap-2">
            {currentLocations.map((loc) => (
              <Button
                key={loc.label}
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={loc.onClick}
              >
                {loc.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Жодну функціональність не видалено — лише перегруповано меню. Старі посилання
            працюють, нова навігація з’являється поетапно.
          </p>
        </Card>
      )}
    </div>
  );
}
