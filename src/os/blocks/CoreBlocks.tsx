// Core narrative blocks for /os: Pain, Method, AudienceChooser,
// BentoModules, HowItWorks, Comparison, Scenarios, Testimonials, Security, CTA.
//
// All blocks are pure presentation components driven by config.

import { Link } from "react-router-dom";
import { ArrowRight, Check, ShieldCheck, Sparkles, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAudience } from "@/contexts/AudienceContext";
import { Section, Eyebrow } from "./SectionShell";
import { osPain, osSolution, osFinalCta } from "@/os/config/osCopy";
import { osModules } from "@/os/config/osModules";
import { osScenariosByAudience } from "@/os/config/osScenarios";
import { osComparison } from "@/os/config/osComparison";
import { osHowItWorks, osTestimonials, osTrustBadges } from "@/os/config/osProof";
import {
  PainExcel, PainTabs, PainChat,
  BentoFinanceTile, BentoBookingsTile, BentoDocsTile, BentoTaxTile,
  BentoCrmTile, BentoTasksTile, BentoOrdersTile, BentoContactsTile,
  AiChatMockup,
} from "@/os/mockups/CabinetMockups";

/* ============================================================== Pain */

export const PainBlock = () => {
  const { audience } = useAudience();
  const pain = osPain[audience];
  const visuals = [PainExcel, PainTabs, PainChat];

  return (
    <Section
      eyebrow="Знайомо?"
      title={pain.title}
      intro={
        audience === "business"
          ? "Ви — єдина людина, яка тримає весь бізнес у голові. Це не масштабується. І, якщо чесно, виснажує."
          : "10 застосунків, 5 чатів і одна голова. Жоден сервіс не бачить ваші справи цілком. Через це переплати, прострочки і відчуття «знов щось забув»."
      }
    >
      <div className="grid md:grid-cols-3 gap-5">
        {pain.items.slice(0, 3).map((p, i) => {
          const Visual = visuals[i];
          return (
            <Card key={p.t} className="overflow-hidden border-border/40 hover:border-primary/30 transition-colors">
              <Visual />
              <div className="p-5">
                <div className="font-semibold text-base mb-1.5">{p.t}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{p.d}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
};

/* ============================================================== Method */

export const MethodBlock = () => {
  const { audience } = useAudience();
  const principles = [
    {
      n: "01",
      t: "Один контекст",
      d:
        audience === "business"
          ? "Усе про ваш бізнес — в одному кабінеті. CRM знає про фінанси, фінанси знають про склад, склад знає про податки."
          : "Усі ваші справи — в одному кабінеті. Гроші знають про цілі, документи знають про родину, податки знають про доходи.",
    },
    {
      n: "02",
      t: "Один AI",
      d:
        audience === "business"
          ? "Не 5 AI-помічників у 5 SaaS. Один директор, що бачить картину цілком і дає поради на ваших справжніх даних."
          : "Не 10 чат-ботів у 10 застосунках. Один помічник, що памʼятає ваш бюджет, ваші договори, ваш контекст.",
    },
    {
      n: "03",
      t: "Одна делегація",
      d:
        audience === "business"
          ? "Бухгалтер заходить у ваш кабінет — а не ви у його софт. Партнер бачить лише своє. Аудит-лог на все."
          : "Чоловік, дружина, дитина, батьки, юрист — кожен з власними правами. Ви — з повним аудит-логом.",
    },
  ];
  return (
    <Section eyebrow="The FINTODO Method" title="Три принципи замість пʼяти інструментів">
      <div className="grid md:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
        {principles.map((p) => (
          <div key={p.n}>
            <div className="font-mono text-xs text-primary/60 mb-3">{p.n}</div>
            <div className="text-2xl font-semibold tracking-tight mb-3">{p.t}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{p.d}</div>
          </div>
        ))}
      </div>
    </Section>
  );
};

/* ============================================================== Audience chooser */

export const AudienceChooserBlock = () => {
  const { setAudience } = useAudience();
  const choices = [
    {
      id: "business" as const,
      icon: Briefcase,
      eyebrow: "Якщо ви ведете бізнес",
      title: "FINTODO OS для бізнесу",
      desc: "ФОП або ТОВ. Каса, банки, ПРРО, CRM, замовлення, бронювання, документи, AI-директор — в одному кабінеті.",
      bullets: ["Безкоштовний старт за 30 секунд", "Делегація бухгалтеру з аудит-логом", "AI-директор на ваших даних"],
      cta: { label: "Дивитись бік для бізнесу", href: "/os?audience=business" },
    },
    {
      id: "individual" as const,
      icon: User,
      eyebrow: "Якщо ви керуєте власними справами",
      title: "FINTODO OS для фізособи",
      desc: "Бюджет, документи, родина, інвестиції, податки, здоровʼя, цілі — і AI-помічник, що тримає все в порядку.",
      bullets: ["Free без терміну — 200 AI-кредитів", "Дія.Підпис вбудовано", "Делегації родині з межами доступу"],
      cta: { label: "Дивитись бік для фізособи", href: "/os?audience=individual" },
    },
  ];
  return (
    <Section eyebrow="Два світи · одна система" title="Який ваш бік?">
      <div className="grid md:grid-cols-2 gap-5">
        {choices.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.id}
              className="group relative overflow-hidden p-7 md:p-9 hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-4">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium mb-2">{c.eyebrow}</div>
                <div className="text-2xl font-semibold tracking-tight mb-3">{c.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{c.desc}</p>
                <ul className="space-y-1.5 mb-6">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={() => setAudience(c.id)}
                  asChild
                >
                  <Link to={c.cta.href}>
                    {c.cta.label} <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
};

/* ============================================================== Bento modules */

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
        <div className="text-lg font-semibold tracking-tight">Один AI. Усі ваші дані.</div>
      </div>
      <div className="text-[11px] space-y-1.5 text-muted-foreground">
        <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> Morning Brief щоранку</div>
        <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> Питання-відповіді у чаті (BI)</div>
        <div className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-primary" /> Рекомендації наступного кроку</div>
      </div>
    </div>
  ),
};

// Bento layout (desktop):
//   row1: AI(2x2) | Finance(2x1)
//                 | Contacts(1x1) | Bookings(1x1)
//   row2: Tax(1x1) Orders(1x1) Documents(1x1) Tasks(1x1)
export const BentoModulesBlock = () => (
  <Section eyebrow="8 модулів · одна архітектура" title="Усі модулі. Один кабінет.">
    <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[170px] md:auto-rows-[180px] gap-3">
      {/* AI - big */}
      <Link
        to="/os/modules/ai"
        className="group col-span-2 row-span-2 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-transparent hover:border-primary/50 transition-all"
      >
        <AiChatMockup audience="business" />
      </Link>
      {/* Finance - wide */}
      <Link
        to="/os/modules/finance"
        className="group col-span-2 row-span-1 rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-colors"
      >
        {(() => { const T = TILES.finance; return <T />; })()}
      </Link>
      {/* Contacts */}
      <Link
        to="/os/modules/contacts"
        className="group col-span-1 row-span-1 rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-colors"
      >
        {(() => { const T = TILES.contacts; return <T />; })()}
      </Link>
      {/* Bookings */}
      <Link
        to="/os/modules/bookings"
        className="group col-span-1 row-span-1 rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-colors"
      >
        {(() => { const T = TILES.bookings; return <T />; })()}
      </Link>

      {/* row 2 - 4 small */}
      {["tax", "orders", "documents", "tasks"].map((id) => {
        const T = TILES[id];
        return (
          <Link
            key={id}
            to={`/os/modules/${id}`}
            className="group rounded-2xl border border-border/50 bg-card hover:border-primary/40 transition-colors"
          >
            <T />
          </Link>
        );
      })}
    </div>
    <div className="mt-6 flex justify-center">
      <Button asChild variant="ghost" className="rounded-full">
        <Link to="/os/modules">Глибше у модулі <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
      </Button>
    </div>
  </Section>
);

/* ============================================================== How it works */

export const HowItWorksBlock = () => (
  <Section eyebrow="Як це працює" title="Від реєстрації до першого Morning Brief — за один день">
    <div className="grid md:grid-cols-4 gap-5">
      {osHowItWorks.map((step, i) => (
        <div key={step.n} className="relative">
          {i < osHowItWorks.length - 1 && (
            <div className="hidden md:block absolute top-6 left-[calc(50%+24px)] right-0 h-px bg-gradient-to-r from-primary/40 to-transparent" />
          )}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-mono text-sm font-semibold mb-4">
              {step.n}
            </div>
            <div className="text-base font-semibold tracking-tight mb-2">{step.t}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{step.d}</div>
          </div>
        </div>
      ))}
    </div>
  </Section>
);

/* ============================================================== Comparison */

export const ComparisonBlock = () => {
  const { audience } = useAudience();
  const compare = osComparison[audience];
  return (
    <Section
      eyebrow="Порівняння"
      title={compare.title}
      intro="Ми не просимо вас вірити на слово. Подивіться на свій теперішній набір поруч."
    >
      <Card className="overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left py-4 px-5 font-medium text-muted-foreground text-xs uppercase tracking-wider"></th>
                {compare.columns.map((c, i) => (
                  <th
                    key={c}
                    className={`text-left py-4 px-5 font-semibold text-sm ${
                      i === 2 ? "text-primary bg-primary/[0.04]" : "text-muted-foreground"
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compare.rows.map((r) => (
                <tr key={r.feature} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-5 font-medium">{r.feature}</td>
                  <td className="py-3.5 px-5 text-muted-foreground text-xs md:text-sm">{r.a}</td>
                  <td className="py-3.5 px-5 text-muted-foreground text-xs md:text-sm">{r.b}</td>
                  <td className="py-3.5 px-5 font-medium bg-primary/[0.03] text-xs md:text-sm flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{r.c}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Section>
  );
};

/* ============================================================== Scenarios */

export const ScenariosShowcaseBlock = () => {
  const { audience } = useAudience();
  const scenarios = osScenariosByAudience(audience).slice(0, 6);
  return (
    <Section
      eyebrow="Сценарії"
      title={audience === "business" ? "Готові набори під ваш бізнес" : "Готові набори під ваші ролі"}
      intro="Кожен сценарій — це готовий кабінет з реальними даними, модулями та делегаціями. Відкрийте — і подивіться зсередини."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((s) => (
          <Link
            key={s.id}
            to={`/os/scenarios/${s.id}`}
            className="group block p-6 rounded-2xl border border-border/40 hover:border-primary/40 hover:bg-muted/20 transition-all"
          >
            <div className="text-[11px] uppercase tracking-widest text-primary/80 font-medium mb-2">{s.vertical}</div>
            <div className="font-semibold text-lg mb-1.5">{s.title}</div>
            <div className="text-xs text-muted-foreground mb-4">{s.persona}</div>
            <div className="space-y-1 mb-4">
              {s.outcomes.slice(0, 2).map((o) => (
                <div key={o} className="flex items-start gap-1.5 text-xs">
                  <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                  <span>{o}</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-primary font-medium group-hover:underline inline-flex items-center gap-1">
              Відкрити демо <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/os/scenarios">Усі сценарії <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
        </Button>
      </div>
    </Section>
  );
};

/* ============================================================== Testimonials */

export const TestimonialsBlock = () => {
  const { audience } = useAudience();
  const list = osTestimonials.filter((t) => t.audience === audience).slice(0, 3);
  return (
    <Section eyebrow="Голоси користувачів" title="Що змінилось у тих, хто перейшов">
      <div className="grid md:grid-cols-3 gap-5">
        {list.map((t) => (
          <Card key={t.author} className="p-7 flex flex-col">
            <Sparkles className="w-5 h-5 text-primary mb-4 opacity-60" />
            <blockquote className="text-base leading-relaxed flex-1 mb-5">
              «{t.quote}»
            </blockquote>
            <div className="flex items-center gap-3 pt-4 border-t border-border/40">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary text-sm font-semibold flex items-center justify-center">
                {t.initials}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-foreground">{t.author}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ============================================================== Security strip */

export const SecurityStripBlock = () => (
  <Section eyebrow="Безпека" title="Дані — ваші. Завжди.">
    <div className="grid md:grid-cols-4 gap-4">
      {osTrustBadges.map((b) => (
        <div
          key={b.t}
          className="p-5 rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-colors"
        >
          <ShieldCheck className="w-5 h-5 text-primary mb-3" />
          <div className="font-semibold mb-1">{b.t}</div>
          <div className="text-xs text-muted-foreground">{b.d}</div>
        </div>
      ))}
    </div>
    <div className="mt-6 text-center">
      <Button asChild variant="ghost" className="rounded-full">
        <Link to="/os/security">Повна архітектура безпеки <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
      </Button>
    </div>
  </Section>
);

/* ============================================================== Pricing teaser */

export const PricingTeaserBlock = () => {
  const { audience } = useAudience();
  const tiers = audience === "business"
    ? [
        { name: "Free Start", price: "0 ₴/міс", note: "300 кр. AI · базові модулі · 1 кабінет", href: "/checkout?plan=free", popular: false },
        { name: "Старт", price: "199 ₴/міс", note: "ПРРО · банки · КЕП · мультикаса", href: "/checkout?plan=start", popular: true },
        { name: "Pro", price: "499 ₴/міс", note: "AI-директор · команда · аналітика", href: "/checkout?plan=pro", popular: false },
      ]
    : [
        { name: "Free", price: "0 ₴", note: "200 кр./міс · усі базові модулі · родина до 2", href: "/checkout?plan=free", popular: true },
        { name: "Plus", price: "49 ₴/міс", note: "500 кр. · Document Hub Pro · родина 5", href: "/checkout?plan=plus", popular: false },
        { name: "Smart", price: "149 ₴/міс", note: "2000 кр. · інвестиції · ЗЕД · юрист-AI", href: "/checkout?plan=smart", popular: false },
      ];
  return (
    <Section
      eyebrow="Тарифи"
      title={audience === "business" ? "Старт — від 0 грн" : "Free — без терміну"}
      intro="Без картки на старт. Без прихованих лімітів. Перехід між тарифами — будь-коли."
    >
      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map((p) => (
          <Card key={p.name} className={`p-7 ${p.popular ? "border-primary/50 ring-1 ring-primary/30 shadow-lg shadow-primary/5" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-lg">{p.name}</div>
              {p.popular && <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">Популярний</span>}
            </div>
            <div className="text-3xl font-semibold tabular-nums my-3">{p.price}</div>
            <div className="text-sm text-muted-foreground mb-6 min-h-[2.5em]">{p.note}</div>
            <Button asChild variant={p.popular ? "default" : "outline"} className="w-full rounded-full">
              <Link to={p.href}>Обрати</Link>
            </Button>
          </Card>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button asChild variant="ghost" className="rounded-full">
          <Link to="/os/pricing">Повна сітка з порівнянням <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
        </Button>
      </div>
    </Section>
  );
};

/* ============================================================== Solution (Method bridge) */

export const SolutionBlock = () => {
  const { audience } = useAudience();
  const sol = osSolution[audience];
  return (
    <Section eyebrow="Наша обіцянка" title={sol.title}>
      <div className="grid md:grid-cols-3 gap-5">
        {sol.items.map((s, i) => (
          <Card key={s.t} className="p-7">
            <div className="font-mono text-xs text-primary/60 mb-3">0{i + 1}</div>
            <div className="font-semibold text-lg mb-2">{s.t}</div>
            <div className="text-sm text-muted-foreground leading-relaxed">{s.d}</div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

/* ============================================================== Final CTA */

export const FinalCtaBlock = () => {
  const { audience } = useAudience();
  const cta = osFinalCta[audience];
  return (
    <section className="relative overflow-hidden border-t border-border/40">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-background to-primary/[0.04]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-3xl mx-auto px-4 py-20 md:py-28 text-center">
        <Sparkles className="w-8 h-8 text-primary mx-auto mb-6" />
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-5 leading-[1.1]">{cta.title}</h2>
        <p className="text-lg text-muted-foreground mb-8">{cta.sub}</p>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <Button asChild size="lg" className="rounded-full h-12 px-7 shadow-lg shadow-primary/20">
            <Link to={cta.cta.href}>
              {cta.cta.label} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-7">
            <Link to={audience === "business" ? "/dashboard?cabinet=demo-salon-3" : "/dashboard?cabinet=demo-individual-declarant"}>
              Спершу подивитись демо
            </Link>
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Без банківської картки · {audience === "business" ? "300" : "200"} AI-кредитів · 30 секунд на старт
        </div>
      </div>
    </section>
  );
};

/* ============================================================== FAQ */

import { osFaq } from "@/os/config/osFaq";

export const FaqBlock = () => {
  const { audience } = useAudience();
  const items = [...osFaq.common, ...osFaq[audience]];
  return (
    <Section eyebrow="FAQ" title="Часті питання" align="center">
      <div className="space-y-2.5 max-w-3xl mx-auto">
        {items.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-border/40 px-5 py-4 open:bg-muted/20 open:border-primary/30 transition-colors"
          >
            <summary className="cursor-pointer font-medium list-none flex justify-between items-center gap-4">
              <span>{f.q}</span>
              <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl font-light flex-shrink-0">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
};
