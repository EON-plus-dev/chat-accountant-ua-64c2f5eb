// /os/modules/:id — детальна сторінка модуля.
// Hero → Anatomy (велика картка-mockup) → Two-worlds (паралель, не таб) → Integrations → Related scenarios → CTA.
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { osModulesById, osModules } from "@/os/config/osModules";
import { osScenarios } from "@/os/config/osScenarios";
import { useAudience } from "@/contexts/AudienceContext";
import { Section } from "@/os/blocks/SectionShell";
import {
  BentoFinanceTile, BentoBookingsTile, BentoDocsTile, BentoTaxTile,
  BentoCrmTile, BentoTasksTile, BentoOrdersTile,
  MorningBriefMockup, PaymentsMockup, AiChatMockup,
} from "@/os/mockups/CabinetMockups";

const ANATOMY: Record<string, React.ComponentType<{ audience: "business" | "individual" }>> = {
  finance: PaymentsMockup,
  ai: AiChatMockup,
};

const TILE: Record<string, React.ComponentType> = {
  finance: BentoFinanceTile, bookings: BentoBookingsTile, documents: BentoDocsTile,
  tax: BentoTaxTile, contacts: BentoCrmTile, tasks: BentoTasksTile, orders: BentoOrdersTile,
};

export default function OsModulePage() {
  const { id } = useParams();
  const { audience } = useAudience();
  const m = id ? osModulesById[id] : undefined;
  if (!m) return <Navigate to="/os/modules" replace />;
  const Icon = m.icon;
  const Anatomy = id && ANATOMY[id];
  const Tile = id && TILE[id];

  const related = osScenarios.filter(
    (s) => s.audience === audience && (s.outcomes.join(" ") + s.pains.join(" ")).toLowerCase().includes(m.name.toLowerCase().slice(0, 4))
  ).slice(0, 3);
  const fallbackScenarios = osScenarios.filter((s) => s.audience === audience).slice(0, 3);
  const scenarios = related.length >= 2 ? related : fallbackScenarios;

  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.04] via-background to-background" />
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-14 md:pt-14 md:pb-20">
          <Link to="/os/modules" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" /> Усі модулі
          </Link>
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-primary/15 text-primary">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium">Модуль</div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.05] mb-5">
                {m.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                {m.jtbd}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full h-12 px-6 shadow-lg shadow-primary/20">
                  <Link to={audience === "business" ? "/checkout?plan=start" : "/checkout?plan=free"}>
                    Спробувати безкоштовно <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6">
                  <Link to={audience === "business" ? "/dashboard?cabinet=demo-salon-3" : "/dashboard?cabinet=demo-individual-declarant"}>
                    Відкрити в демо
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              {Anatomy ? (
                <Anatomy audience={audience} />
              ) : Tile ? (
                <Card className="overflow-hidden h-[340px]">
                  <Tile />
                </Card>
              ) : (
                <MorningBriefMockup audience={audience} />
              )}
              <div className="absolute -inset-6 -z-10 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Two-worlds paralel — не таб, а порівняння */}
      <Section eyebrow="Два світи · одна логіка" title={`${m.name} — у вашому контексті`}>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { key: "business" as const, Icon: Briefcase, title: "У бізнесі", side: m.business },
            { key: "individual" as const, Icon: User, title: "У фізособи", side: m.individual },
          ].map((col) => {
            const ColIcon = col.Icon;
            const active = audience === col.key;
            return (
              <Card
                key={col.key}
                className={`p-7 md:p-8 transition-all ${
                  active ? "border-primary/40 ring-1 ring-primary/20 shadow-lg shadow-primary/5" : "opacity-90"
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium mb-4">
                  <ColIcon className="w-3.5 h-3.5" /> {col.title}
                </div>
                <div className="text-xl font-semibold tracking-tight mb-2">{col.side.caption}</div>
                <ul className="space-y-2.5 mt-5">
                  {col.side.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Integrations diagram */}
      {m.integrations.length > 0 && (
        <Section eyebrow="Звʼязки" title="Цей модуль знає про сусідів">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-muted/30 via-background to-background">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <span className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <Icon className="w-6 h-6" />
                </span>
                <div className="text-sm font-semibold mt-2">{m.name}</div>
              </div>
              <div className="text-2xl text-muted-foreground/40 font-light">↔</div>
              <div className="flex flex-wrap gap-3 justify-center">
                {m.integrations.map((iid) => {
                  const im = osModulesById[iid];
                  if (!im) return null;
                  const II = im.icon;
                  return (
                    <Link
                      key={iid}
                      to={`/os/modules/${iid}`}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-card border border-border/60 text-foreground/70 group-hover:border-primary/40 group-hover:text-primary transition-colors">
                        <II className="w-4 h-4" />
                      </span>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{im.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            <p className="mt-8 text-sm text-muted-foreground text-center max-w-xl mx-auto">
              Дані течуть автоматично між модулями. Не потрібно копіювати, експортувати або синхронізувати — все це робить ядро OS.
            </p>
          </Card>
        </Section>
      )}

      {/* Related scenarios */}
      <Section eyebrow="Сценарії" title={`Де ${m.name.toLowerCase()} вирішують реальні задачі`}>
        <div className="grid md:grid-cols-3 gap-4">
          {scenarios.map((s) => (
            <Link
              key={s.id}
              to={`/os/scenarios/${s.id}`}
              className="block p-6 rounded-2xl border border-border/40 hover:border-primary/40 hover:bg-muted/20 transition-all"
            >
              <div className="text-[11px] uppercase tracking-widest text-primary/80 font-medium mb-2">{s.vertical}</div>
              <div className="font-semibold mb-1.5">{s.title}</div>
              <div className="text-xs text-muted-foreground mb-3">{s.persona}</div>
              <div className="text-xs text-primary inline-flex items-center gap-1">
                Відкрити кейс <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Other modules */}
      <Section eyebrow="Інші модулі" title="Решта 7 — поруч">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {osModules.filter((x) => x.id !== m.id).map((x) => {
            const XI = x.icon;
            return (
              <Link
                key={x.id}
                to={`/os/modules/${x.id}`}
                className="p-4 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-muted/20 transition-colors"
              >
                <XI className="w-4 h-4 text-primary mb-2" />
                <div className="font-medium text-sm mb-0.5">{x.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{x.jtbd}</div>
              </Link>
            );
          })}
        </div>
      </Section>
    </>
  );
}
