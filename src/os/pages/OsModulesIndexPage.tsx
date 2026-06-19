// /os/modules — модулі згруповані за JTBD (Гроші · Робота · Артефакти · Мозок).
import { Link } from "react-router-dom";
import { ArrowRight, Coins, Briefcase, Archive, Brain } from "lucide-react";
import { osModules, osModulesById } from "@/os/config/osModules";
import { useAudience } from "@/contexts/AudienceContext";
import { Section } from "@/os/blocks/SectionShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BentoFinanceTile, BentoBookingsTile, BentoDocsTile, BentoTaxTile,
  BentoCrmTile, BentoTasksTile, BentoOrdersTile,
} from "@/os/mockups/CabinetMockups";
import { Sparkles } from "lucide-react";

const TILES: Record<string, React.ComponentType> = {
  finance: BentoFinanceTile,
  bookings: BentoBookingsTile,
  documents: BentoDocsTile,
  tax: BentoTaxTile,
  contacts: BentoCrmTile,
  tasks: BentoTasksTile,
  orders: BentoOrdersTile,
  ai: () => (
    <div className="h-full p-5 flex flex-col justify-between">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">AI-мозок</div>
        <div className="text-lg font-semibold tracking-tight">Один директор. Усі дані.</div>
      </div>
      <div className="text-[11px] text-muted-foreground space-y-1">
        <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> Morning Brief</div>
        <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> Conversational BI</div>
        <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> Next-step рекомендації</div>
      </div>
    </div>
  ),
};

const GROUPS = [
  { id: "money", icon: Coins, title: "Гроші", desc: "Усе, що рухається через рахунки.", ids: ["finance", "tax"] },
  { id: "work", icon: Briefcase, title: "Робота", desc: "Люди, продажі, замовлення, час.", ids: ["contacts", "orders", "bookings"] },
  { id: "artifacts", icon: Archive, title: "Артефакти", desc: "Документи, справи, делегації.", ids: ["documents", "tasks"] },
  { id: "brain", icon: Brain, title: "Мозок", desc: "AI, що бачить решту трьох.", ids: ["ai"] },
];

export default function OsModulesIndexPage() {
  const { audience } = useAudience();
  return (
    <>
      <Section
        eyebrow="Модулі"
        title="8 модулів. 4 наміри. Одна архітектура."
        intro="Кожен модуль робить одну річ дуже добре — і знає про сусідів. Перемикайте аудиторію у шапці, щоб побачити свій бік."
      >
        <div className="space-y-14">
          {GROUPS.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.id}>
                <div className="flex items-end justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="text-2xl font-semibold tracking-tight">{g.title}</div>
                      <div className="text-sm text-muted-foreground">{g.desc}</div>
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {g.ids.map((id) => {
                    const m = osModulesById[id];
                    const T = TILES[id];
                    const side = m[audience];
                    return (
                      <Link
                        key={id}
                        to={`/os/modules/${id}`}
                        className="group rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-colors overflow-hidden flex flex-col"
                      >
                        <div className="h-[180px] border-b border-border/40">
                          <T />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="font-semibold text-base mb-1">{m.name}</div>
                          <div className="text-xs text-primary/80 mb-2">{side.caption}</div>
                          <p className="text-sm text-muted-foreground flex-1">{m.jtbd}</p>
                          <div className="mt-4 text-xs text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Подивитись модуль <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section>
        <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/[0.06] via-background to-background border-primary/20 text-center">
          <div className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Не модулі вибирають вас, а ви — потік
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            FINTODO OS — це не набір застосунків. Це один кабінет, у якому всі модулі вже знайомі.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild className="rounded-full">
              <Link to={audience === "business" ? "/checkout?plan=start" : "/checkout?plan=free"}>
                Створити кабінет <ArrowRight className="ml-1.5 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/os/scenarios">Подивитись сценарії</Link>
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}
