import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { getOrgsForCabinet, getExpertsForCabinet } from "@/personal/network/personalOrgsMock";

const CATEGORY_LABEL: Record<string, string> = {
  dental: "Стоматологія",
  restaurant: "Ресторан",
  sport: "Спорт",
  insurance: "Страхова",
  school: "Школа",
  auto: "Авто",
  beauty: "Краса",
};

function formatUah(n?: number): string {
  if (!n) return "—";
  return new Intl.NumberFormat("uk-UA").format(n) + " ₴";
}

export function PersonalOrgsList({ cabinetId }: { cabinetId: string }) {
  const orgs = getOrgsForCabinet(cabinetId);
  if (orgs.length === 0) {
    return <p className="text-sm text-muted-foreground">Поки що немає організацій у вашій мережі.</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {orgs.map((o) => (
        <Card key={o.id} className="p-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{o.name}</span>
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {CATEGORY_LABEL[o.category] ?? o.category}
              </span>
              {o.hasSubscription && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  підписка
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{o.city}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
              <span>Остання взаємодія: {o.lastInteraction}</span>
              <span>Витрачено YTD: <span className="text-foreground font-medium">{formatUah(o.amountSpentYtd)}</span></span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function PersonalExpertsList({ cabinetId }: { cabinetId: string }) {
  const experts = getExpertsForCabinet(cabinetId);
  if (experts.length === 0) {
    return <p className="text-sm text-muted-foreground">Експерти ще не залучені.</p>;
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {experts.map((e) => (
        <Card key={e.id} className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{e.name}</span>
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {e.speciality}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
            <span>★ {e.rating.toFixed(1)}</span>
            <span>{e.consultations} консультацій</span>
            {e.lastConsultation && <span>остання: {e.lastConsultation}</span>}
          </div>
          <div className="mt-2">
            <Button size="sm" variant="outline" className="h-7 text-xs">Запитати консультацію</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
