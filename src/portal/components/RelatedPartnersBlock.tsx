import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Handshake } from "lucide-react";
import { useAudience } from "@/contexts/AudienceContext";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { DIRECTORY_PARTNER_MAP } from "@/portal/data/directoryPartnerMap";

const TYPE_LABEL: Record<string, string> = {
  bank: 'Банк',
  neobank: 'Необанк',
  fintech: 'Фінтех',
  payment_system: 'Платежі',
  money_transfer: 'Перекази',
  broker: 'Брокер',
  logistics: 'Логістика',
  insurance: 'Страхування',
  accounting_software: 'Бухгалтерія',
  tax_automation: 'Податки',
  edo: 'ЕДО / Звітність',
  reporting: 'Звітність',
  cashier_software: 'Каса / ПРРО',
  prro: 'ПРРО',
  digital_signature: 'КЕП / Дія.Підпис',
  notary: 'Нотаріус',
  legal_service: 'Юрфірма',
  legal_consulting: 'Юр-консалтинг',
  legal_database: 'Юр-база',
  business_registration: 'Реєстрація',
  hr_platform: 'HR-платформа',
  recruiting: 'Рекрутинг',
  hiring: 'Найм',
  hrm: 'HRM',
  payroll: 'Розрахунок з/п',
  leasing: 'Лізинг',
  leasing_equipment: 'Лізинг обл.',
  mortgage: 'Іпотека',
  investment: 'Інвестиції',
  grant_program: 'Грант',
  international_grant: 'Грант (міжн.)',
  startup_fund: 'Фонд',
  startup_hub: 'Хаб',
  registry: 'Реєстр',
  monitoring: 'Моніторинг',
  gov_service: 'Держпослуги',
  diia: 'Дія',
};

interface RelatedPartnersBlockProps {
  directoryId: string;
  limit?: number;
  /** compact = вужча картка для entry-сторінок (limit≤3) */
  compact?: boolean;
  /** Прихований заголовок (рендерить тільки сітку, якщо false) */
  showHeader?: boolean;
  className?: string;
}

export const RelatedPartnersBlock = ({
  directoryId,
  limit = 6,
  compact = false,
  showHeader = true,
  className = "",
}: RelatedPartnersBlockProps) => {
  const { audience } = useAudience();
  const config = DIRECTORY_PARTNER_MAP[directoryId];

  const partners = useMemo(() => {
    if (!config) return [];
    if (config.hideForAudience === audience) return [];

    const matched = INSTITUTION_PROFILES.filter((p) =>
      p.types.some((t) => config.partnerTypes.includes(t))
    );

    const pinned = (config.partnerSlugs ?? [])
      .map((slug) => matched.find((m) => m.slug === slug))
      .filter(Boolean) as typeof matched;

    const rest = matched
      .filter((m) => !config.partnerSlugs?.includes(m.slug))
      .sort((a, b) => (b.ratings?.fintodo?.overall ?? 0) - (a.ratings?.fintodo?.overall ?? 0));

    return [...pinned, ...rest].slice(0, limit);
  }, [config, audience, limit]);

  // Якщо мапінгу взагалі немає — нічого не рендеримо (стара поведінка)
  if (!config) return null;

  const primaryType = config.partnerTypes[0];
  const gridCols = compact
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  const isEmpty = partners.length === 0;
  // Скільки плейсхолдер-карток «Стати партнером» додати, щоб блок виглядав збалансовано
  const placeholderCount = isEmpty ? 1 : partners.length < 3 ? 1 : 0;

  return (
    <section className={`mt-10 ${className}`} aria-label="Релевантні партнери">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Handshake className="h-4 w-4 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  Хто може допомогти
                </h2>
                {!isEmpty && (
                  <Badge variant="outline" className="text-[10px]">{partners.length}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isEmpty
                  ? 'Поки немає партнерів у цій категорії — станьте першим у FINTODO.'
                  : (config.ctaSubLabel ?? `${config.ctaLabel} серед перевірених FINTODO-партнерів`)}
              </p>
            </div>
            {!isEmpty && (
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex shrink-0">
                <Link to={`/dovidnyky/ustanovy?type=${primaryType}`}>
                  Усі партнери <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        )}

        <div className={`grid gap-3 ${gridCols}`}>
          {partners.map((p) => {
            const rating = p.ratings?.fintodo?.overall;
            const firstProduct = p.products?.[0];
            const typeChips = p.types.slice(0, 2);
            return (
              <Link
                key={p.slug}
                to={`/dovidnyky/ustanovy/profile/${p.slug}`}
                className="group"
              >
                <Card className="h-full p-3.5 hover:border-primary/50 hover:shadow-sm transition-all flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: p.logo.color }}
                    >
                      {p.logo.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {p.shortName ?? p.name}
                        </p>
                        {p.verified && (
                          <span className="text-[9px] font-medium text-primary shrink-0">✓</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {typeChips.map((t) => TYPE_LABEL[t] ?? t).join(' · ')}
                      </p>
                    </div>
                  </div>

                  {!compact && firstProduct?.tagline && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {firstProduct.tagline}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-1">
                    {typeof rating === 'number' && (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-mono font-semibold">{(rating / 20).toFixed(1)}</span>
                        <span className="text-muted-foreground">/ 5</span>
                      </span>
                    )}
                    <span className="text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Профіль →
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}

          {/* Плейсхолдер «Стати партнером» — коли категорія порожня або карток мало */}
          {placeholderCount > 0 &&
            Array.from({ length: placeholderCount }).map((_, i) => (
              <Link key={`placeholder-${i}`} to="/partners/program" className="group">
                <Card className="h-full p-3.5 border-dashed border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.06] hover:border-primary/60 transition-all flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                      <Handshake className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        Стати партнером
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        FINTODO-програма
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {isEmpty
                      ? `Ваша організація надає послуги "${config.ctaLabel.toLowerCase()}"? Розмістіть профіль тут.`
                      : 'Розмістіть профіль вашої організації у цьому довіднику.'}
                  </p>
                  <div className="flex items-center justify-end mt-auto pt-1">
                    <span className="text-[11px] text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                      Дізнатися більше →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
        </div>

        {!isEmpty && (
          <div className="sm:hidden mt-3 text-center">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/dovidnyky/ustanovy?type=${primaryType}`}>
                Усі партнери <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * Лічильник партнерів для конкретного довідника (для індексу /dovidnyky).
 * Враховує hideForAudience.
 */
export const getPartnerCountForDirectory = (
  directoryId: string,
  audience: 'business' | 'individual'
): number => {
  const cfg = DIRECTORY_PARTNER_MAP[directoryId];
  if (!cfg || cfg.hideForAudience === audience) return 0;
  return INSTITUTION_PROFILES.filter((p) =>
    p.types.some((t) => cfg.partnerTypes.includes(t))
  ).length;
};
