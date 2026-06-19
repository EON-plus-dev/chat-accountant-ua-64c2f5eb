import { UserCog, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFamilyMembersForCabinet, type FamilyMember } from "@/personal/family/familyMembersMock";

const ACCENT: Record<FamilyMember["accent"], string> = {
  primary: "bg-primary/15 text-primary",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
};

const ACCESS_LABELS: Record<string, string> = {
  budget: "Бюджет",
  documents: "Документи",
  goals: "Цілі",
  health: "Здоров'я",
  calendar: "Календар",
};

interface Props {
  cabinetId: string;
}

export function FamilyMembersGrid({ cabinetId }: Props) {
  const members = getFamilyMembersForCabinet(cabinetId);

  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Сім'я ще не додана. Додайте дружину, дітей чи батьків — і керуйте спільними документами,
          бюджетом і цілями в одному місці.
        </p>
        <Button size="sm" variant="outline" className="gap-1.5">
          <UserCog className="w-4 h-4" /> Додати члена сім'ї
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <Card key={m.id} className="p-3 flex items-start gap-3">
            <div
              className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0",
                ACCENT[m.accent],
              )}
            >
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate">{m.name}</span>
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {m.roleLabel}
                </span>
                {m.age && (
                  <span className="text-xs text-muted-foreground">{m.age} р.</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {m.sharedAccess.map((acc) => (
                  <span
                    key={acc}
                    className="text-[10px] px-1.5 py-0.5 rounded border bg-card text-muted-foreground"
                  >
                    {ACCESS_LABELS[acc] ?? acc}
                  </span>
                ))}
              </div>
              {m.lastSeenLabel && (
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Останній вхід: {m.lastSeenLabel}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5">
          <UserCog className="w-4 h-4" /> Делегувати доступ
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5">
          <Mail className="w-4 h-4" /> Запросити члена сім'ї
        </Button>
      </div>
    </div>
  );
}
