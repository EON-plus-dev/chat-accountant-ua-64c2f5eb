import { Link } from "react-router-dom";
import { Shield, CheckCircle, ExternalLink, TrendingUp, Calculator, Heart, PiggyBank, FileText, Landmark, Scale, Users, ClipboardList, Gift, Truck, CreditCard, Rocket, Phone, Mail, MessageCircle, Clock, MapPin, Globe, Send, Music, Star, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComparePickerPopover } from "./ComparePickerPopover";
import { SidebarMiniCalc } from "./SidebarMiniCalc";
import { INSTITUTION_PROFILES, type FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import { getCurrencySnapshot } from "@/portal/data/dailyDigest";

interface Props {
  profile: FullInstitutionProfile;
}

export const ProfileSidebar = ({ profile }: Props) => {
  const categorySlug = profile.ratings.fintodo.categorySlug;

  const trustItems = [
    ...profile.security.certifications.slice(0, 3).map(c => ({ label: c, ok: true })),
    ...(profile.security.uptime ? [{ label: `Uptime ${profile.security.uptime}`, ok: true }] : []),
    
  ];

  const similar = INSTITUTION_PROFILES
    .filter(p => p.id !== profile.id && p.ratings.fintodo.categorySlug === categorySlug)
    .sort((a, b) => b.ratings.fintodo.overall - a.ratings.fintodo.overall)
    .slice(0, 3);

  const creditRegex = /кредит|позик|loan|овердрафт|розстрочк/i;
  const depositRegex = /депозит|вклад|deposit|ощадн|накопичувальн/i;
  const creditProd = profile.products.find(p => creditRegex.test(`${p.name} ${p.category} ${p.description} ${p.tagline}`));
  const depositProd = profile.products.find(p => depositRegex.test(`${p.name} ${p.category} ${p.description} ${p.tagline}`));
  const parseRate = (s?: string) => { const m = s?.match(/[\d.,]+/); return m ? parseFloat(m[0].replace(",", ".")) : 0; };

  const { usd, eur, meta } = getCurrencySnapshot();

  /** Contextual external links per category */
  const categoryLinks: Record<string, { icon: React.ReactNode; label: string; href: string; external?: boolean }[]> = {
    gov: [
      { icon: <Landmark className="w-3.5 h-3.5" />, label: 'Портал Дія', href: 'https://diia.gov.ua', external: true },
      { icon: <FileText className="w-3.5 h-3.5" />, label: 'Кабінет ДПС', href: 'https://cabinet.tax.gov.ua', external: true },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'Пенсійний фонд', href: 'https://portal.pfu.gov.ua', external: true },
    ],
    legal: [
      { icon: <Scale className="w-3.5 h-3.5" />, label: 'Реєстр судових рішень', href: 'https://reyestr.court.gov.ua', external: true },
      { icon: <Calculator className="w-3.5 h-3.5" />, label: 'Калькулятор судового збору', href: '/tools/court-fee-calc' },
    ],
    hr: [
      { icon: <FileText className="w-3.5 h-3.5" />, label: 'КЗпП онлайн', href: 'https://zakon.rada.gov.ua/laws/show/322-08', external: true },
      { icon: <Calculator className="w-3.5 h-3.5" />, label: 'Калькулятор зарплати', href: '/tools/salary-calc' },
    ],
    registration: [
      { icon: <ClipboardList className="w-3.5 h-3.5" />, label: 'Єдиний держреєстр (ЄДР)', href: 'https://usr.minjust.gov.ua', external: true },
      { icon: <Calculator className="w-3.5 h-3.5" />, label: 'Калькулятор реєстрації', href: '/tools/registration-calc' },
    ],
    grants: [
      { icon: <Gift className="w-3.5 h-3.5" />, label: 'Каталог грантів', href: '/dovidnyky/ustanovy/grants' },
      { icon: <Users className="w-3.5 h-3.5" />, label: 'єРобота', href: 'https://erobota.diia.gov.ua', external: true },
    ],
    logistics: [
      { icon: <Truck className="w-3.5 h-3.5" />, label: 'Відстеження посилки', href: 'https://novaposhta.ua/tracking', external: true },
      { icon: <Calculator className="w-3.5 h-3.5" />, label: 'Калькулятор доставки', href: '/tools/delivery-calc' },
    ],
    payments: [
      { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Порівняння еквайрингу', href: '/dovidnyky/ustanovy/payments' },
    ],
    fintech: [
      { icon: <Rocket className="w-3.5 h-3.5" />, label: 'Стартап-ресурси', href: '/dovidnyky/ustanovy/fintech' },
    ],
  };

  const extraLinks = categoryLinks[categorySlug];

  return (
    <div className="hidden md:block md:sticky md:top-[var(--sidebar-top,108px)] self-start space-y-4 min-w-0 overflow-hidden">
      {/* Action Card */}
      <Card className="p-5 space-y-3">
        <Button className="w-full" asChild>
          <a href={profile.cta.primary.href} target={profile.cta.primary.isInternal ? undefined : "_blank"} rel="noopener noreferrer">
            {profile.cta.primary.label} →
          </a>
        </Button>
        <ComparePickerPopover currentProfile={profile} />
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p>ЄДРПОУ: {profile.legal.edrpou}</p>
          {profile.legal.licenses[0] && <p>Ліцензія: {profile.legal.licenses[0].number}</p>}
        </div>
      </Card>

      {/* Contacts Card */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-primary" /> Контакти
        </p>
        {profile.contacts.support.freePhone && (
          <div className="flex items-center gap-2 text-xs">
            <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-foreground">{profile.contacts.support.freePhone}</span>
          </div>
        )}
        {profile.contacts.support.email && (
          <div className="flex items-center gap-2 text-xs">
            <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
            <a href={`mailto:${profile.contacts.support.email}`} className="text-foreground hover:text-primary transition-colors truncate">{profile.contacts.support.email}</a>
          </div>
        )}
        {(profile.contacts.support.chatWidget || profile.contacts.support.telegram) && (
          <div className="flex items-center gap-2 text-xs">
            <MessageCircle className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-foreground truncate">
              {profile.contacts.support.chatWidget && "Чат"}
              {profile.contacts.support.chatWidget && profile.contacts.support.telegram && " · "}
              {profile.contacts.support.telegram}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-muted-foreground">
            {profile.contacts.support.is247 ? "24/7" : profile.contacts.support.workingHours}
          </span>
        </div>
        {profile.branches.totalCount > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-foreground">{profile.branches.totalCount} відділень</span>
            {profile.branches.findBranchUrl && (
              <a href={profile.branches.findBranchUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-auto text-[10px]">
                Знайти ↗
              </a>
            )}
          </div>
        )}
        {/* Social icons */}
        {Object.entries(profile.contacts.social).some(([, v]) => v) && (
          <div className="flex gap-1 pt-1.5 border-t border-border/40">
            {Object.entries(profile.contacts.social).filter(([, v]) => v).map(([key, url]) => {
              const icons: Record<string, React.ReactNode> = {
                telegram: <Send className="w-3.5 h-3.5" />, instagram: <Globe className="w-3.5 h-3.5" />,
                facebook: <Globe className="w-3.5 h-3.5" />, linkedin: <Globe className="w-3.5 h-3.5" />,
                youtube: <Globe className="w-3.5 h-3.5" />, twitter: <Globe className="w-3.5 h-3.5" />,
                tiktok: <Music className="w-3.5 h-3.5" />,
              };
              return (
                <a key={key} href={url!} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted"
                  title={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  {icons[key] || <Globe className="w-3.5 h-3.5" />}
                </a>
              );
            })}
          </div>
        )}
      </Card>

      {/* Platforms Card */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Headphones className="w-4 h-4 text-primary" /> Платформи
        </p>
        <div className="border border-border rounded-lg overflow-hidden">
          {[
            { label: "Web", icon: "🌐", url: profile.platforms.web.url, rating: undefined, reviews: undefined },
            { label: "iOS", icon: "📱", url: profile.platforms.ios.url, rating: profile.platforms.ios.rating, reviews: profile.platforms.ios.reviewCount },
            { label: "Android", icon: "🤖", url: profile.platforms.android.url, rating: profile.platforms.android.rating, reviews: profile.platforms.android.reviewCount },
          ].map((plat, i) => (
            <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs ${i > 0 ? "border-t border-border/50" : ""}`}>
              <span className="shrink-0 font-medium text-foreground">{plat.icon} {plat.label}</span>
              {plat.rating && (
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-current" /> {plat.rating}
                </span>
              )}
              {plat.reviews && <span className="text-[10px] text-muted-foreground">{plat.reviews.toLocaleString()}</span>}
              <span className="ml-auto">
                {plat.url ? (
                  <a href={plat.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-[10px] inline-flex items-center gap-0.5">
                    Перейти <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-muted-foreground text-[10px]">—</span>
                )}
              </span>
            </div>
          ))}
        </div>
        {profile.platforms.api.available && (
          <div className="text-[10px] text-muted-foreground">
            API: Доступне{profile.platforms.api.sandbox ? " · Sandbox" : ""}
            {profile.platforms.api.docsUrl && (
              <a href={profile.platforms.api.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1.5 inline-flex items-center gap-0.5">
                Docs <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        )}
        {profile.integrations.length > 0 && (
          <div>
            <p className="text-[10px] font-medium text-foreground mb-1">Інтеграції</p>
            <div className="flex flex-wrap gap-1">
              {profile.integrations.slice(0, 5).map((int, i) => (
                <Badge key={i} variant={int.isOfficial ? "success" : "secondary"} size="sm" className="text-[9px]">
                  {int.name}
                </Badge>
              ))}
              {profile.integrations.length > 5 && (
                <span className="text-[9px] text-muted-foreground self-center">+{profile.integrations.length - 5}</span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Trust Badges */}
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Довіра</p>
        {trustItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-foreground">{item.label}</span>
          </div>
        ))}
      </Card>

      {/* Contextual sidebar widget based on category */}
      {categorySlug === 'banks' && (
        <>
          <SidebarMiniCalc
            defaultCreditRate={parseRate(creditProd?.interestRate) || 24}
            defaultDepositRate={parseRate(depositProd?.interestRate) || 15}
          />
          <Card className="p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> Курси НБУ
            </p>
            <div className="space-y-1.5">
              {usd && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">USD</span>
                  <span className="font-mono font-medium text-foreground">{usd.nbuRate.toFixed(2)} ₴</span>
                </div>
              )}
              {eur && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">EUR</span>
                  <span className="font-mono font-medium text-foreground">{eur.nbuRate.toFixed(2)} ₴</span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">{meta.source} · {meta.lastUpdated}</p>
            </div>
          </Card>
        </>
      )}

      {categorySlug === 'credit' && (
        <SidebarMiniCalc
          defaultCreditRate={parseRate(creditProd?.interestRate) || 24}
          defaultDepositRate={0}
        />
      )}

      {categorySlug === 'insurance' && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-primary" /> Інструменти
          </p>
          <Link to="/tools/insurance-calc" className="text-xs text-primary hover:underline flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" /> Страховий калькулятор →
          </Link>
        </Card>
      )}

      {categorySlug === 'invest' && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-primary" /> Інструменти
          </p>
          <Link to="/tools/invest-calc" className="text-xs text-primary hover:underline flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" /> Інвестиційний калькулятор →
          </Link>
        </Card>
      )}

      {categorySlug === 'accounting' && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" /> Інструменти
          </p>
          <Link to="/tools/tax-calc" className="text-xs text-primary hover:underline flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" /> Податковий калькулятор →
          </Link>
        </Card>
      )}

      {/* Category-specific external links */}
      {extraLinks && extraLinks.length > 0 && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-primary" /> Корисні ресурси
          </p>
          {extraLinks.map((link, i) =>
            link.external ? (
              <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1.5">
                {link.icon} {link.label} <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <Link key={i} to={link.href} className="text-xs text-primary hover:underline flex items-center gap-1.5">
                {link.icon} {link.label} →
              </Link>
            )
          )}
        </Card>
      )}

      {/* Similar Institutions */}
      {similar.length > 0 && (
        <Card className="p-4 space-y-2.5">
          <p className="text-sm font-semibold text-foreground">Схожі установи</p>
          {similar.map(s => (
            <Link
              key={s.id}
              to={`/dovidnyky/ustanovy/profile/${s.slug}`}
              className="flex items-center gap-2.5 p-2 -mx-1 rounded-lg hover:bg-muted transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: s.logo.color }}
              >
                {s.logo.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.ratings.fintodo.overall}/100</p>
              </div>
            </Link>
          ))}
        </Card>
      )}


      {/* Useful links */}
      {profile.aiUsefulLinks && profile.aiUsefulLinks.length > 0 && (
        <Card className="p-4 space-y-1.5">
          <p className="text-sm font-semibold text-foreground">Корисні посилання</p>
          {profile.aiUsefulLinks.map((link, i) =>
            link.isInternal ? (
              <Link key={i} to={link.url} className="text-xs text-primary hover:underline flex items-center gap-1">
                {link.label} →
              </Link>
            ) : (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                {link.label} <ExternalLink className="w-3 h-3" />
              </a>
            )
          )}
        </Card>
      )}
    </div>
  );
};
