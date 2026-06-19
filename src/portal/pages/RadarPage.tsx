import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { AlertTriangle, ArrowRight, Calendar, FileText, Radar, Sparkles } from "lucide-react";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

type Audience = "all" | "fop" | "tov" | "personal";
type Severity = "critical" | "important" | "info";

interface Change {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  audience: Exclude<Audience, "all">[];
  severity: Severity;
  source: string;
  effectiveFrom?: string;
  link?: string;
  tags: string[];
}

const CHANGES: Change[] = [
  {
    id: "minwage-2026-04",
    date: "2026-04-22",
    title: "Мінімальна зарплата зросте до 9 200 грн з 1 липня 2026",
    summary:
      "Кабмін підтвердив підвищення мінімалки на ІІІ квартал. ЄСВ для ФОП 1–3 групи, мінімальний податок із зарплат — усе перераховується автоматично.",
    audience: ["fop", "tov", "personal"],
    severity: "critical",
    source: "Постанова КМУ №312",
    effectiveFrom: "2026-07-01",
    tags: ["мінімалка", "ЄСВ", "зарплата"],
  },
  {
    id: "ep-3group-limit-2026",
    date: "2026-04-18",
    title: "Ліміт доходу для 3 групи ЄП піднято до 9,5 млн грн",
    summary:
      "Зміни до п. 291.4 ПКУ. Ті, хто наближається до старого ліміту, тепер мають запас. Перевірте свій річний обсяг у кабінеті.",
    audience: ["fop"],
    severity: "important",
    source: "ЗУ №3215-IX",
    effectiveFrom: "2026-01-01",
    tags: ["ЄП", "3 група", "ліміт"],
  },
  {
    id: "dps-edocs-2026",
    date: "2026-04-15",
    title: "ДПС переходить на новий формат e-документів",
    summary:
      "З 1 червня старий XML-формат для звітів ФОП-2 і ФОП-3 не приймається. У FINTODO формат оновлено автоматично.",
    audience: ["fop", "tov"],
    severity: "important",
    source: "Наказ ДПС №88",
    effectiveFrom: "2026-06-01",
    tags: ["ДПС", "звітність", "e-doc"],
  },
  {
    id: "vz-individuals-2026",
    date: "2026-04-10",
    title: "Військовий збір для фізосіб залишається 5%",
    summary:
      "Парламент відхилив пропозицію зменшити ВЗ до 1.5%. Розрахунки з зарплат і дивідендів — без змін.",
    audience: ["personal", "tov"],
    severity: "info",
    source: "Сесія ВРУ 09.04.2026",
    tags: ["ВЗ", "ПДФО"],
  },
  {
    id: "property-tax-2026",
    date: "2026-04-05",
    title: "Податок на нерухомість: ставку прив'язали до МЗП",
    summary:
      "З 2027 року максимальна ставка — 1.5% мінімалки за м². Перевірте чи ваші об'єкти підпадають під пільги.",
    audience: ["personal", "tov"],
    severity: "important",
    source: "ЗУ №3290-IX",
    effectiveFrom: "2027-01-01",
    tags: ["нерухомість", "податок"],
  },
  {
    id: "iban-format-2026",
    date: "2026-04-02",
    title: "НБУ оновив правила форматування IBAN у звітах",
    summary:
      "У платіжках і деклараціях IBAN тепер обов'язково з суцільним записом без пробілів. У FINTODO — без змін, валідація вже підлаштована.",
    audience: ["fop", "tov"],
    severity: "info",
    source: "Постанова НБУ №45",
    effectiveFrom: "2026-05-15",
    tags: ["IBAN", "НБУ"],
  },
  {
    id: "edrpou-checksum-2026",
    date: "2026-03-28",
    title: "Нова контрольна сума ЄДРПОУ для нових ТОВ",
    summary:
      "Алгоритм розрахунку контрольної цифри змінено. Це стосується лише компаній, зареєстрованих після 1 квітня 2026.",
    audience: ["tov"],
    severity: "info",
    source: "Мін'юст",
    effectiveFrom: "2026-04-01",
    tags: ["ЄДРПОУ", "реєстрація"],
  },
  {
    id: "diia-fop-2026",
    date: "2026-03-25",
    title: "Дія: онлайн-зміна КВЕД для ФОП за 5 хвилин",
    summary:
      "Тепер додавання чи видалення КВЕД доступне в мобільному застосунку. Раніше — лише через ЦНАП або портал ДРС.",
    audience: ["fop"],
    severity: "important",
    source: "Дія",
    effectiveFrom: "2026-03-25",
    tags: ["Дія", "КВЕД"],
  },
];

const SEVERITY_CONFIG: Record<Severity, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  critical: { label: "Критично", className: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertTriangle },
  important: { label: "Важливо", className: "bg-warning/10 text-warning border-warning/30", icon: Sparkles },
  info: { label: "Інфо", className: "bg-muted text-muted-foreground border-border", icon: FileText },
};

const AUDIENCE_LABELS: Record<Exclude<Audience, "all">, string> = {
  fop: "ФОП",
  tov: "ТОВ",
  personal: "Фізособам",
};

const RadarPage = () => {
  const [audience, setAudience] = useState<Audience>("all");
  const [severity, setSeverity] = useState<Severity | "all">("all");

  const filtered = useMemo(() => {
    return CHANGES.filter((c) => {
      if (audience !== "all" && !c.audience.includes(audience)) return false;
      if (severity !== "all" && c.severity !== severity) return false;
      return true;
    });
  }, [audience, severity]);

  return (
    <PortalLayout
      meta={{
        title: "Радар змін у законодавстві — податки, ЄСВ, звітність | FINTODO",
        description:
          "Щоденний моніторинг змін у податках, бухгалтерії та фінансах України. Що змінилося, з якої дати, кого стосується — без води.",
        canonical: `${SITE_URL}/radar`,
      }}
    >
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Радар змін", url: `${SITE_URL}/radar` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Радар змін" }]} />

        <div className="space-y-6 pb-16">
          <header className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Radar className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                Радар змін у законодавстві
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Що змінилося у податках, ЄСВ, звітності та фінансах. AI відстежує закони, постанови КМУ, накази
              ДПС/НБУ та одразу оцінює, кого це стосується.
            </p>
          </header>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(["all", "fop", "tov", "personal"] as Audience[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    audience === a
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {a === "all" ? "Усі" : AUDIENCE_LABELS[a]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "critical", "important", "info"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    severity === s
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {s === "all" ? "Будь-яка важливість" : SEVERITY_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                За цими фільтрами змін поки немає.
              </Card>
            )}
            {filtered.map((c) => {
              const sev = SEVERITY_CONFIG[c.severity];
              const Icon = sev.icon;
              return (
                <Card key={c.id} className="p-4 sm:p-5 space-y-3 hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${sev.className}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(c.date).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                        </span>
                        <span>·</span>
                        <span>{c.source}</span>
                        {c.effectiveFrom && (
                          <>
                            <span>·</span>
                            <span>чинно з {new Date(c.effectiveFrom).toLocaleDateString("uk-UA")}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground text-base sm:text-lg leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{c.summary}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pl-12">
                    <Badge variant="outline" className={sev.className}>{sev.label}</Badge>
                    {c.audience.map((a) => (
                      <Badge key={a} variant="secondary" className="text-xs">
                        {AUDIENCE_LABELS[a]}
                      </Badge>
                    ))}
                    {c.tags.map((t) => (
                      <span key={t} className="text-xs text-muted-foreground">#{t}</span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Хочете отримувати лише ті зміни, що стосуються вас?
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl">
                  У FINTODO AI читає закони за вас і пише в Telegram тільки про критичне для вашого бізнесу.
                </p>
              </div>
              <Button asChild size="lg">
                <Link to={CTA_CHECKOUT_URL}>
                  Спробувати безкоштовно <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
};

export default RadarPage;
