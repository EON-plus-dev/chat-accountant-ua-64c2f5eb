// /os/pricing — повна сітка тарифів + feature-matrix + ROI-блок + партнерська смуга.
import { Fragment } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAudience } from "@/contexts/AudienceContext";
import { Section } from "@/os/blocks/SectionShell";

type Tier = {
  name: string;
  priceM: number;
  priceY: number;
  badge?: string;
  note: string;
  features: string[];
  cta: { label: string; href: string };
  highlight?: boolean;
};

const TIERS: Record<"business" | "individual", Tier[]> = {
  business: [
    {
      name: "Free Start", priceM: 0, priceY: 0, note: "300 кр. AI · базові модулі · 1 кабінет",
      features: ["Усі базові модулі", "1 кабінет", "До 2 співробітників", "Email-підтримка"],
      cta: { label: "Почати безкоштовно", href: "/checkout?plan=free" },
    },
    {
      name: "Старт", priceM: 199, priceY: 1990, badge: "Популярний", highlight: true,
      note: "1000 кр. AI · ПРРО · банки · КЕП",
      features: ["Усе з Free", "ПРРО + банки sync", "КЕП-підпис", "До 5 співробітників", "Міграція з 1С/Excel", "Чат-підтримка"],
      cta: { label: "Старт за 30 секунд", href: "/checkout?plan=start" },
    },
    {
      name: "Pro", priceM: 499, priceY: 4990, note: "3000 кр. AI · AI-директор · команда",
      features: ["Усе зі Старт", "AI-директор", "Conversational BI", "До 25 співробітників", "Партнерські делегації", "Пріоритетна підтримка"],
      cta: { label: "Обрати Pro", href: "/checkout?plan=pro" },
    },
  ],
  individual: [
    {
      name: "Free", priceM: 0, priceY: 0, badge: "Назавжди", highlight: true,
      note: "200 кр./міс · усі базові модулі · родина до 2",
      features: ["Усі базові модулі", "Document Hub", "Дія.Підпис", "Родина до 2 людей", "Email-підтримка"],
      cta: { label: "Почати безкоштовно", href: "/checkout?plan=free" },
    },
    {
      name: "Plus", priceM: 49, priceY: 490, note: "500 кр. · родина 5 · ЗЕД",
      features: ["Усе з Free", "Родина до 5", "ЗЕД-доходи + FX", "Document Hub Pro", "Імпорт банку"],
      cta: { label: "Обрати Plus", href: "/checkout?plan=plus" },
    },
    {
      name: "Smart", priceM: 149, priceY: 1490, note: "2000 кр. · інвестиції · юрист-AI",
      features: ["Усе з Plus", "Інвестиції FIFO + ROC", "Foreign Tax Credit", "Юрист-AI", "Пріоритетна підтримка"],
      cta: { label: "Обрати Smart", href: "/checkout?plan=smart" },
    },
  ],
};

const MATRIX: Record<"business" | "individual", { group: string; rows: { name: string; v: (boolean | string)[] }[] }[]> = {
  business: [
    {
      group: "Облік та фінанси",
      rows: [
        { name: "Каса, банки, FX", v: [true, true, true] },
        { name: "ПРРО та kasa", v: [false, true, true] },
        { name: "Мульти-валюта з FX дня", v: [true, true, true] },
        { name: "Реконсиляція банк ↔ ПРРО", v: ["Базова", "Так", "Так + AI-аномалії"] },
      ],
    },
    {
      group: "Робота з клієнтами",
      rows: [
        { name: "CRM з воронкою", v: [true, true, true] },
        { name: "Бронювання + публічний віджет", v: [true, true, true] },
        { name: "Замовлення sales/purchases", v: ["До 50/міс", "Без лімітів", "Без лімітів"] },
        { name: "Каденції з playbookʼами", v: [false, false, true] },
      ],
    },
    {
      group: "Документи та КЕП",
      rows: [
        { name: "Document Hub", v: [true, true, true] },
        { name: "КЕП-підпис", v: [false, true, true] },
        { name: "Авто-підпис із trusted reviewer", v: [false, false, true] },
      ],
    },
    {
      group: "AI та аналітика",
      rows: [
        { name: "AI-кредити / міс", v: ["300", "1000", "3000"] },
        { name: "Morning Brief", v: [true, true, true] },
        { name: "Conversational BI", v: [false, false, true] },
        { name: "Аномалії й next-step", v: [false, "Базово", "Повно"] },
      ],
    },
    {
      group: "Команда та підтримка",
      rows: [
        { name: "Співробітники", v: ["2", "5", "25"] },
        { name: "Делегація бухгалтеру", v: [true, true, true] },
        { name: "Партнерські делегації", v: [false, false, true] },
        { name: "Підтримка", v: ["Email", "Чат", "Пріоритетна"] },
      ],
    },
  ],
  individual: [
    {
      group: "Гроші та бюджет",
      rows: [
        { name: "Гаманці + категорії", v: [true, true, true] },
        { name: "Імпорт банку", v: [false, true, true] },
        { name: "ЗЕД-доходи + FX", v: [false, true, true] },
        { name: "Інвестиції FIFO + ROC", v: [false, false, true] },
      ],
    },
    {
      group: "Документи",
      rows: [
        { name: "Document Hub", v: [true, true, true] },
        { name: "Document Hub Pro (теги, OCR)", v: [false, true, true] },
        { name: "Дія.Підпис", v: [true, true, true] },
      ],
    },
    {
      group: "Родина та делегації",
      rows: [
        { name: "Учасників родини", v: ["2", "5", "Без лімітів"] },
        { name: "Делегації з межами", v: [true, true, true] },
        { name: "Юрист-AI", v: [false, false, true] },
      ],
    },
    {
      group: "AI та податки",
      rows: [
        { name: "AI-кредити / міс", v: ["200", "500", "2000"] },
        { name: "Wizard декларації", v: [true, true, true] },
        { name: "Foreign Tax Credit", v: [false, false, true] },
        { name: "Підказки по знижці", v: ["Базово", "Так", "Так + AI"] },
      ],
    },
  ],
};

const Cell = ({ v }: { v: boolean | string }) => {
  if (v === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (v === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-xs tabular-nums">{v}</span>;
};

export default function OsPricingPage() {
  const { audience } = useAudience();
  const [yearly, setYearly] = useState(false);
  const tiers = TIERS[audience];
  const matrix = MATRIX[audience];

  return (
    <>
      <Section
        eyebrow="Тарифи"
        title={audience === "business" ? "Платіть лише за те, що працює" : "Безкоштовно — назавжди"}
        intro={
          audience === "business"
            ? "Старт безкоштовний. Тарифи ростуть із вашою командою — не з вашим страхом ризику."
            : "Free-tier для всіх. Платні — лише якщо потрібні розширені модулі або більше AI."
        }
      >
        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-full border border-border/60 bg-card">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-1.5 text-sm rounded-full transition-all ${!yearly ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Щомісяця
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-1.5 text-sm rounded-full transition-all flex items-center gap-1.5 ${yearly ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Щороку
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${yearly ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"}`}>−17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {tiers.map((t) => {
            const price = yearly ? Math.round(t.priceY / 12) : t.priceM;
            return (
              <Card
                key={t.name}
                className={`p-7 flex flex-col relative ${
                  t.highlight ? "border-primary/40 ring-1 ring-primary/30 shadow-xl shadow-primary/5" : ""
                }`}
              >
                {t.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider bg-primary text-primary-foreground font-semibold shadow-md">
                    {t.badge}
                  </div>
                )}
                <div className="font-semibold text-lg mb-2">{t.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-semibold tabular-nums">{price} ₴</span>
                  <span className="text-sm text-muted-foreground">/міс</span>
                </div>
                <div className="text-xs text-muted-foreground mb-5 min-h-[2.5em]">
                  {yearly && t.priceY > 0 ? `${t.priceY} ₴ при оплаті за рік · ` : ""}{t.note}
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={t.highlight ? "default" : "outline"} className="w-full rounded-full">
                  <Link to={t.cta.href}>{t.cta.label} <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
                </Button>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* ROI mini */}
      <Section bleed className="bg-muted/20 border-y border-border/40">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> ROI
            </div>
            <div className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
              {audience === "business"
                ? "Один тариф Старт замінює стек на ~3 200 ₴/міс"
                : "Free-tier покриває щоденні задачі без жодної копійки"}
            </div>
            <p className="text-sm text-muted-foreground">
              {audience === "business"
                ? "1С/BAS + CRM + ПРРО + Document Hub + AI = ₴ 3 200 / міс типово. FINTODO Старт — 199 ₴ / міс."
                : "Monobank + Notion + папки з фото + чек-боти — нескінченно безкоштовно та нескінченно безладно."}
            </p>
          </div>
          <Card className="p-5 text-center border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent">
            <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">Економія / міс</div>
            <div className="text-3xl font-semibold tabular-nums text-primary">
              {audience === "business" ? "≈ 3 000 ₴" : "Час · нерви"}
            </div>
          </Card>
        </div>
      </Section>

      {/* Feature matrix */}
      <Section eyebrow="Що входить" title="Деталі по модулях">
        <Card className="overflow-hidden border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left py-3.5 px-5 font-medium text-muted-foreground text-xs uppercase tracking-wider min-w-[220px]"></th>
                  {tiers.map((t, i) => (
                    <th
                      key={t.name}
                      className={`text-center py-3.5 px-4 font-semibold text-sm ${
                        t.highlight ? "text-primary bg-primary/[0.04]" : ""
                      }`}
                    >
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((g) => (
                  <Fragment key={g.group}>
                    <tr className="bg-muted/10">
                      <td colSpan={4} className="py-2.5 px-5 text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                        {g.group}
                      </td>
                    </tr>
                    {g.rows.map((r) => (
                      <tr key={r.name} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-5 text-sm">{r.name}</td>
                        {r.v.map((v, i) => (
                          <td key={i} className={`py-3 px-4 text-center ${tiers[i]?.highlight ? "bg-primary/[0.03]" : ""}`}>
                            <Cell v={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      {/* Partner CTA */}
      <Section>
        <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/[0.06] via-background to-background border-primary/20 text-center">
          <div className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Ви — бухгалтер, юрист або агенція?
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Партнерська програма дає вашим клієнтам знижку до −35%, а вам — 0% комісії з гонорару та власний marketplace.
          </p>
          <Button asChild className="rounded-full">
            <Link to="/partners">Дізнатися про партнерство <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
          </Button>
        </Card>
      </Section>
    </>
  );
}
