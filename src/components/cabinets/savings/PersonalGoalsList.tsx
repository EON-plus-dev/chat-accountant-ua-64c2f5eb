import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getGoalsForCabinet, getGoalProgress } from "@/personal/goals/personalGoalsMock";
import { Plane, Shield, Home, GraduationCap, Car, Sparkles } from "lucide-react";

const CATEGORY_ICON = {
  travel: Plane,
  reserve: Shield,
  home: Home,
  education: GraduationCap,
  vehicle: Car,
} as const;

function formatUah(n: number) {
  return new Intl.NumberFormat("uk-UA").format(n) + " ₴";
}

export function PersonalGoalsList({ cabinetId }: { cabinetId: string }) {
  const goals = getGoalsForCabinet(cabinetId);
  if (goals.length === 0) {
    return <p className="text-sm text-muted-foreground">У вас ще немає особистих цілей.</p>;
  }
  return (
    <div className="grid gap-3">
      {goals.map((g) => {
        const Icon = CATEGORY_ICON[g.category] ?? Plane;
        const progress = getGoalProgress(g);
        return (
          <Card key={g.id} className="p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="font-medium text-sm">{g.title}</span>
                  <span className="text-xs text-muted-foreground">до {g.dueDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="text-foreground font-medium">{formatUah(g.currentUah)}</span>
                  <span>/</span>
                  <span>{formatUah(g.targetUah)}</span>
                  <span className="text-foreground font-medium ml-auto">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5 mt-2" />
                {g.aiHint && (
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    {g.aiHint}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
