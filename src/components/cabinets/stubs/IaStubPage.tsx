import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface IaStubPageProps {
  icon: ReactNode;
  title: string;
  question: string;
  description: string;
  /** Planned sub-tabs / capabilities of the section. */
  capabilities: { label: string; description: string }[];
  /**
   * Where the functionality currently lives, so the user can still reach it
   * during the migration. Optional.
   */
  currentLocations?: { label: string; onClick: () => void }[];
  badge?: string;
}

/**
 * Honest placeholder used during the AI-OS information-architecture migration.
 * Shows: what this section will answer, what will live here, and where the
 * underlying features still live today.
 */
export function IaStubPage({
  icon,
  title,
  question,
  description,
  capabilities,
  currentLocations,
  badge = "Незабаром",
}: IaStubPageProps) {
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

      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-base font-medium">Що буде в цьому розділі</h2>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {capabilities.map((cap) => (
            <li
              key={cap.label}
              className="rounded-lg border bg-card p-3 hover:bg-accent/30 transition-colors"
            >
              <div className="font-medium text-sm">{cap.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{cap.description}</div>
            </li>
          ))}
        </ul>
      </Card>

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
