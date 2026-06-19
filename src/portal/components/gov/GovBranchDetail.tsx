import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, ExternalLink, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GovWorkingHours } from './GovWorkingHours';
import { GovServiceAccordion } from './GovServiceAccordion';
import { GovReviewSection } from './GovReviewSection';
import { useGovBranch, useGovServices, useGovBranchRating } from '@/portal/hooks/useGovBranches';
import { Loader2 } from 'lucide-react';

const AGENCY_META: Record<string, { emoji: string; name: string; fullName: string }> = {
  dps: { emoji: '🏛', name: 'ДПС', fullName: 'Державна податкова служба' },
  pfu: { emoji: '🏥', name: 'ПФУ', fullName: 'Пенсійний фонд України' },
  cnap: { emoji: '📋', name: 'ЦНАП', fullName: 'Центр надання адміністративних послуг' },
  dracs: { emoji: '📝', name: 'ДРАЦС', fullName: 'Відділ державної реєстрації актів цивільного стану' },
  court: { emoji: '⚖️', name: 'Суд', fullName: 'Адміністративний суд' },
};

const BRANCH_TYPE_LABELS: Record<string, string> = {
  main: 'Головний офіс',
  regional: 'Обласне управління',
  district: 'Районне відділення',
  cnap: 'ЦНАП',
  court: 'Суд',
  other: 'Інше',
};

const ANCHOR_SECTIONS = [
  { id: 'overview', label: 'Огляд' },
  { id: 'services', label: 'Послуги' },
  { id: 'contacts', label: 'Контакти' },
  { id: 'reviews', label: 'Відгуки' },
];

interface Props {
  branchId: string;
}

export function GovBranchDetail({ branchId }: Props) {
  const { data: branch, isLoading } = useGovBranch(branchId);
  const { data: services = [] } = useGovServices(branch?.agency_slug);
  const { data: ratingData } = useGovBranchRating(branchId);

  const heroRef = useRef<HTMLDivElement>(null);
  const [showMiniBar, setShowMiniBar] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setShowMiniBar(!e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [branch]);

  useEffect(() => {
    const els = ANCHOR_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      entries => { for (const e of entries) { if (e.isIntersecting) setActiveSection(e.target.id); } },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [branch]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-muted-foreground">Відділення не знайдено</p>
        <Button asChild variant="outline">
          <Link to="/dovidnyky/ustanovy?cat=gov">← Повернутися до каталогу</Link>
        </Button>
      </div>
    );
  }

  const agency = AGENCY_META[branch.agency_slug] || { emoji: '🏢', name: branch.agency_slug, fullName: branch.agency_slug };
  const embedSrc = branch.lat && branch.lng
    ? `https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=15&output=embed`
    : null;
  const avgRating = ratingData?.avg || 0;
  const reviewCount = ratingData?.count || 0;

  // Avoid duplicating agency name in the type badge (e.g. ЦНАП/ЦНАП, Суд/Суд)
  // and hide the noisy "Інше" label.
  const typeLabel = BRANCH_TYPE_LABELS[branch.branch_type] ?? branch.branch_type;
  const showTypeBadge =
    !!typeLabel &&
    typeLabel.trim().toLowerCase() !== agency.name.trim().toLowerCase() &&
    branch.branch_type !== 'other';

  return (
    <>
      {/* Sticky Mini-Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm transition-transform duration-300 ${showMiniBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-6xl mx-auto px-4 h-[48px] flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm shrink-0">
            {agency.emoji}
          </div>
          <span className="font-semibold text-foreground text-sm truncate">{branch.name}</span>
          {avgRating > 0 && (
            <>
              <span className="text-muted-foreground text-xs hidden sm:inline">·</span>
              <span className="text-sm text-primary hidden sm:inline">★ {avgRating.toFixed(1)}</span>
            </>
          )}
          <div className="hidden md:flex gap-1 ml-2 overflow-x-auto no-scrollbar">
            {ANCHOR_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-2 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  activeSection === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hero */}
        <div ref={heroRef} className="space-y-3">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-xl sm:text-2xl shrink-0">
              {agency.emoji}
            </div>
            <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="secondary" className="text-[11px] sm:text-xs px-2 py-0.5">
                  {agency.name}
                </Badge>
                {showTypeBadge && (
                  <Badge variant="outline" className="text-[11px] sm:text-xs px-2 py-0.5">
                    {typeLabel}
                  </Badge>
                )}
                {branch.status !== 'active' && (
                  <Badge variant="destructive" className="text-[11px] sm:text-xs px-2 py-0.5">
                    {branch.status === 'temporarily_closed' ? 'Тимчасово зачинено' : 'Зруйновано'}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {branch.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                {agency.fullName}
              </p>
              {avgRating > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">{avgRating.toFixed(1)}</span>
                  <span className="text-[11px] sm:text-xs text-muted-foreground">({reviewCount} відгуків)</span>
                </div>
              )}
            </div>
          </div>
          {branch.war_note && (
            <p className="text-xs sm:text-sm text-destructive bg-destructive/5 rounded-md p-2 sm:p-3">⚠️ {branch.war_note}</p>
          )}
        </div>

        {/* Anchor Navigation */}
        <div className={`sticky z-40 bg-background/95 backdrop-blur border-b border-border -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${showMiniBar ? 'top-12 md:hidden' : 'top-0'}`}>
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {ANCHOR_SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeSection === s.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid md:grid-cols-[1fr_300px] gap-6 mt-2">
          {/* Main Content */}
          <div className="min-w-0 space-y-6">
            {/* Overview */}
            <section id="overview" className="scroll-mt-20">
              <h2 className="text-lg font-semibold text-foreground mb-3">Огляд</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <OverviewItem label="Тип" value={BRANCH_TYPE_LABELS[branch.branch_type] || branch.branch_type} />
                <OverviewItem label="Місто" value={branch.city} />
                <OverviewItem label="Область" value={`${branch.region} обл.`} />
                <OverviewItem label="Послуг" value={`${services.length}`} />
                <OverviewItem label="Е-черга" value={branch.has_queue_system ? '✅ Так' : '❌ Ні'} />
                <OverviewItem label="Безбар'єрність" value={branch.has_accessibility ? '✅ Так' : '❌ Ні'} />
              </div>
            </section>

            {/* Map */}
            {embedSrc && (
              <div className="rounded-xl overflow-hidden border border-border">
                <iframe
                  title={branch.name}
                  src={embedSrc}
                  width="100%"
                  height="250"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {/* Services */}
            <section id="services" className="scroll-mt-20">
              <GovServiceAccordion services={services} />
            </section>

            {/* Reviews */}
            <section id="reviews" className="scroll-mt-20">
              <GovReviewSection branchId={branchId} agencySlug={branch.agency_slug} />
            </section>

            {/* Bottom CTA */}
            <div className="mt-8 flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-foreground flex-1">
                Знайдіть найближче відділення {agency.name} у вашому місті.
              </p>
              <Button size="sm" asChild>
                <Link to="/dovidnyky/ustanovy?cat=gov">Каталог →</Link>
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Working hours */}
            <Card>
              <CardContent className="p-4">
                <GovWorkingHours workingHours={branch.working_hours} isOpen24h={branch.is_open_24h} />
              </CardContent>
            </Card>

            {/* Contacts */}
            <section id="contacts" className="scroll-mt-20">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Контакти</h3>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{branch.address}</p>
                      <p className="text-xs text-muted-foreground">{branch.city}, {branch.region} обл.</p>
                    </div>
                  </div>

                  {branch.map_url && (
                    <a href={branch.map_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="w-3 h-3" /> Відкрити на Google Maps
                    </a>
                  )}

                  {branch.phones && branch.phones.length > 0 && (
                    <div className="space-y-1">
                      {branch.phones.map((phone, i) => (
                        <a key={i} href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Phone className="w-3.5 h-3.5" /> {phone}
                        </a>
                      ))}
                    </div>
                  )}

                  {branch.email && (
                    <a href={`mailto:${branch.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Mail className="w-3.5 h-3.5" /> {branch.email}
                    </a>
                  )}

                  {branch.website && (
                    <a href={branch.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Globe className="w-3.5 h-3.5" /> Офіційний сайт
                    </a>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Head */}
            {branch.head_name && (
              <Card>
                <CardContent className="p-4 space-y-1">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Керівник
                  </h3>
                  <p className="text-sm text-foreground">{branch.head_name}</p>
                  {branch.head_position && (
                    <p className="text-xs text-muted-foreground">{branch.head_position}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Floating mobile CTA */}
      {showMiniBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t border-border p-3 flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground truncate">{branch.name}</span>
          <Button size="sm" className="ml-auto shrink-0" asChild>
            <Link to="/dovidnyky/ustanovy?cat=gov">Каталог →</Link>
          </Button>
        </div>
      )}
    </>
  );
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}
