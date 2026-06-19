import { useState } from "react";
import { Check, X, BarChart3, Building2, Users, MapPin, Banknote, ChevronDown, FlaskConical, ClipboardCheck, AlertTriangle, Shield, Globe, Clock, Smartphone, Calculator } from "lucide-react";

import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import { Progress } from "@/components/ui/progress";

const barColor = (pct: number) => {
  if (pct >= 85) return "bg-emerald-500";
  if (pct >= 70) return "bg-amber-500";
  return "bg-red-500";
};

const barTextColor = (pct: number) => {
  if (pct >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

interface Props {
  profile: FullInstitutionProfile;
}

export const ProfileOverview = ({ profile }: Props) => {
  const [expandedScore, setExpandedScore] = useState<number | null>(null);
  return (
    <section id="overview" className="mt-6 scroll-mt-28">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" /> Огляд
      </h2>

      {/* Editorial take — compact border-l */}
      <div className="border-l-2 border-primary pl-4 mt-3">
        <p className="text-xs text-muted-foreground mb-1">{profile.editorial.methodology.testingPeriod}</p>
        <p className="text-sm text-foreground leading-relaxed">
          <strong>{profile.editorial.shortTake.split(". ")[0]}.</strong>
          {profile.editorial.shortTake.includes(". ") && " " + profile.editorial.shortTake.split(". ").slice(1).join(". ")}
        </p>
      </div>

      {/* Key Information — contextual metrics */}
      {(() => {
        const cs = profile.ratings.fintodo.categorySlug;
        type Metric = { icon: React.ReactNode; label: string; value: string };
        let metrics: Metric[] = [];

        if (cs.startsWith('banks')) {
          metrics = [
            ...(profile.company.assets ? [{ icon: <Banknote className="w-3.5 h-3.5 text-primary" />, label: 'Активи', value: profile.company.assets }] : []),
            ...(profile.company.capitalAdequacy ? [{ icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: 'Достатність капіталу', value: profile.company.capitalAdequacy }] : []),
            { icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: 'Ліцензія', value: profile.legal.licenses[0] ? 'Активна' : '—' },
            { icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: 'ФГВФО', value: profile.compliance.dia ? 'Учасник' : 'Ні' },
          ];
        } else if (cs.startsWith('insurance')) {
          metrics = [
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Рік заснування', value: String(profile.company.foundedYear) },
            { icon: <Users className="w-3.5 h-3.5 text-primary" />, label: 'Працівники', value: profile.company.employeesCount },
            { icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: 'Ліцензія', value: profile.legal.licenses[0] ? 'Активна' : '—' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Відділення', value: String(profile.branches.totalCount || '—') },
          ];
        } else if (cs.startsWith('credit')) {
          const creditProd = profile.products.find(p => /кредит|позик|loan/i.test(p.name + ' ' + p.category));
          metrics = [
            ...(creditProd?.interestRate ? [{ icon: <Calculator className="w-3.5 h-3.5 text-primary" />, label: 'Ставка від', value: creditProd.interestRate }] : []),
            ...(creditProd?.coverageLimits ? [{ icon: <Banknote className="w-3.5 h-3.5 text-primary" />, label: 'Макс. сума', value: creditProd.coverageLimits }] : []),
            { icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: 'Ліцензія', value: profile.legal.licenses[0] ? 'Активна' : '—' },
            { icon: <Smartphone className="w-3.5 h-3.5 text-primary" />, label: 'Онлайн заявка', value: profile.website ? 'Так' : '—' },
          ];
        } else if (cs.startsWith('invest')) {
          metrics = [
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Рік заснування', value: String(profile.company.foundedYear) },
            { icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: 'Ліцензія', value: profile.legal.licenses[0] ? 'Активна' : '—' },
            { icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: 'Регулятор', value: 'НКЦПФР' },
            { icon: <Smartphone className="w-3.5 h-3.5 text-primary" />, label: 'Онлайн торгівля', value: profile.website ? 'Так' : '—' },
          ];
        } else if (cs.startsWith('gov')) {
          metrics = [
            { icon: <Clock className="w-3.5 h-3.5 text-primary" />, label: 'Режим роботи', value: 'Пн-Пт' },
            { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Онлайн доступ', value: profile.website ? 'Сайт' : '—' },
            { icon: <Shield className="w-3.5 h-3.5 text-primary" />, label: 'КЕП', value: profile.compliance.dia ? 'Дія.Підпис' : 'Потрібен' },
          ];
        } else if (cs.startsWith('hr')) {
          const hrProd = profile.products[0];
          metrics = [
            ...(hrProd?.price?.monthly ? [{ icon: <Banknote className="w-3.5 h-3.5 text-primary" />, label: 'Тарифи від', value: hrProd.price.monthly }] : []),
            { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Безкоштовний план', value: hrProd?.price?.isFree ? 'Так' : 'Ні' },
            { icon: <Smartphone className="w-3.5 h-3.5 text-primary" />, label: 'API', value: profile.website ? 'Так' : '—' },
          ];
        } else if (cs.startsWith('legal')) {
          metrics = [
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Засновано', value: String(profile.company.foundedYear) },
            { icon: <Users className="w-3.5 h-3.5 text-primary" />, label: 'Працівники', value: profile.company.employeesCount },
            { icon: <MapPin className="w-3.5 h-3.5 text-primary" />, label: 'Штаб-квартира', value: profile.company.headquarters.split(',')[0] },
            { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Онлайн-послуги', value: profile.website ? 'Так' : '—' },
          ];
        } else if (cs.startsWith('payments')) {
          const prod = profile.products[0];
          metrics = [
            ...(prod?.price?.perTransaction ? [{ icon: <Banknote className="w-3.5 h-3.5 text-primary" />, label: 'Комісія', value: prod.price.perTransaction }] : []),
            { icon: <Clock className="w-3.5 h-3.5 text-primary" />, label: 'Час підключення', value: prod?.processingTime || '1-5 днів' },
            { icon: <Smartphone className="w-3.5 h-3.5 text-primary" />, label: 'API', value: profile.website ? 'Так' : '—' },
            { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Міжнародні', value: 'SWIFT / SEPA' },
          ];
        } else if (cs.startsWith('fintech')) {
          const isHub = profile.types?.some(t => ['startup_hub', 'coworking'].includes(t));
          if (isHub) {
            metrics = [
              { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Засновано', value: String(profile.company.foundedYear) },
              { icon: <MapPin className="w-3.5 h-3.5 text-primary" />, label: 'Локація', value: profile.company.headquarters.split(',')[0] },
              { icon: <Users className="w-3.5 h-3.5 text-primary" />, label: 'Працівники', value: profile.company.employeesCount },
              { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Сайт', value: profile.website ? 'Так' : '—' },
            ];
          } else {
            const prod = profile.products[0];
            metrics = [
              { icon: <Users className="w-3.5 h-3.5 text-primary" />, label: 'Засновано', value: String(profile.company.foundedYear) },
              { icon: <Clock className="w-3.5 h-3.5 text-primary" />, label: 'Реєстрація', value: '< 5 хв' },
              { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Безкоштовний план', value: prod?.price?.isFree ? 'Так' : 'Ні' },
              { icon: <Smartphone className="w-3.5 h-3.5 text-primary" />, label: 'API', value: profile.website ? 'Так' : '—' },
            ];
          }
        } else if (cs.startsWith('logistics')) {
          metrics = [
            { icon: <MapPin className="w-3.5 h-3.5 text-primary" />, label: 'Покриття', value: String(profile.branches?.totalCount || '—') + ' відділень' },
            { icon: <Clock className="w-3.5 h-3.5 text-primary" />, label: 'Час доставки', value: '1-2 дні' },
            { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Відстеження', value: profile.website ? 'Онлайн' : '—' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Засновано', value: String(profile.company.foundedYear) },
          ];
        } else if (cs.startsWith('grants')) {
          metrics = [
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Засновано', value: String(profile.company.foundedYear) },
            { icon: <Users className="w-3.5 h-3.5 text-primary" />, label: 'Працівники', value: profile.company.employeesCount },
            { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Онлайн подача', value: profile.website ? 'Так' : '—' },
            { icon: <MapPin className="w-3.5 h-3.5 text-primary" />, label: 'Штаб-квартира', value: profile.company.headquarters.split(',')[0] },
          ];
        } else if (cs.startsWith('accounting') || cs.startsWith('digital')) {
          const prod = profile.products[0];
          metrics = [
            ...(prod?.price?.monthly ? [{ icon: <Banknote className="w-3.5 h-3.5 text-primary" />, label: 'Тариф від', value: prod.price.monthly }] : []),
            { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Безкоштовний план', value: prod?.price?.isFree ? 'Так' : 'Ні' },
            { icon: <Smartphone className="w-3.5 h-3.5 text-primary" />, label: 'Платформа', value: profile.website ? 'Web' : 'Desktop' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Засновано', value: String(profile.company.foundedYear) },
          ];
        } else if (cs.startsWith('registration')) {
          metrics = [
            { icon: <Clock className="w-3.5 h-3.5 text-primary" />, label: 'Час реєстрації', value: '1-3 дні' },
            { icon: <Globe className="w-3.5 h-3.5 text-primary" />, label: 'Онлайн', value: profile.website ? 'Так' : '—' },
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Засновано', value: String(profile.company.foundedYear) },
            { icon: <Users className="w-3.5 h-3.5 text-primary" />, label: 'Працівники', value: profile.company.employeesCount },
          ];
        } else {
          metrics = [
            { icon: <Building2 className="w-3.5 h-3.5 text-primary" />, label: 'Засновано', value: String(profile.company.foundedYear) },
            { icon: <Users className="w-3.5 h-3.5 text-primary" />, label: 'Працівники', value: profile.company.employeesCount },
            { icon: <MapPin className="w-3.5 h-3.5 text-primary" />, label: 'Штаб-квартира', value: profile.company.headquarters.split(',')[0] },
          ];
        }

        metrics = metrics.filter(m => m.value && m.value !== '—' && m.value !== 'undefined');
        if (metrics.length === 0) return null;

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {metrics.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border bg-card text-center">
                {m.icon}
                <span className="text-[11px] text-muted-foreground">{m.label}</span>
                <span className="text-sm font-bold text-primary font-mono">{m.value}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Score Breakdown Details — compact accordion */}
      {profile.editorial.scores && profile.editorial.scores.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4 text-primary" /> Деталі оцінки
          </h3>
          <div className={`rounded-lg border divide-y divide-border ${profile.editorial.scores.every(s => Math.round((s.score / s.maxScore) * 100) >= 85) ? "border-emerald-500/30" : "border-border"}`}>
            {profile.editorial.scores.map((s, i) => {
              const pct = Math.round((s.score / s.maxScore) * 100);
              const isOpen = expandedScore === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setExpandedScore(isOpen ? null : i)}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    <span className="text-sm font-medium text-foreground w-32 shrink-0 truncate text-left">{s.category}</span>
                    <Progress 
                      value={pct} 
                      className="flex-1 h-2 group-hover:opacity-90 transition-opacity"
                      indicatorClassName={barColor(pct)}
                    />
                    <span className={`font-mono text-sm font-bold ${barTextColor(pct)} w-14 text-right shrink-0`}>{pct}/100</span>
                  </button>
                  <div className="grid transition-all duration-200" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                      <div className="px-3 pb-3 pl-10 space-y-1.5">
                        {s.rationale && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{s.rationale}</p>
                        )}
                        {s.whatWeTested && s.whatWeTested.length > 0 && (
                          <div className="flex items-start gap-1.5 text-xs">
                            <FlaskConical className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground"><span className="font-medium text-foreground">Тестували:</span> {s.whatWeTested.join(" · ")}</span>
                          </div>
                        )}
                        {s.howWeScored && (
                          <div className="flex items-start gap-1.5 text-xs">
                            <ClipboardCheck className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground"><span className="font-medium text-foreground">Методика:</span> {s.howWeScored}</span>
                          </div>
                        )}
                        {s.penaltyReasons && s.penaltyReasons.length > 0 && (
                          <div className="flex items-start gap-1.5 text-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground"><span className="font-medium text-foreground">Штрафи:</span> {s.penaltyReasons.join(" · ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pros & Cons — compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
          <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-500" /> Переваги
          </p>
          <ul className="space-y-1">
            {profile.editorial.bestFor.map((b, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                <span className="text-emerald-500 shrink-0 mt-0.5 text-xs">✓</span>
                <span><strong className="text-xs">{b.segment}</strong> — <span className="text-xs text-muted-foreground">{b.reason}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
          <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
            <X className="w-3.5 h-3.5 text-amber-500" /> Обмеження
          </p>
          <ul className="space-y-1">
            {profile.editorial.notFor.map((n, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                <span className="text-amber-500 shrink-0 mt-0.5 text-xs">✗</span>
                <span><strong className="text-xs">{n.segment}</strong> — <span className="text-xs text-muted-foreground">{n.reason}{n.alternative ? ` → ${n.alternative}` : ""}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
