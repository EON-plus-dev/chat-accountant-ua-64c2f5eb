import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check, X, Equal, ArrowRight, ArrowLeftRight, Star, Users, CalendarDays,
  Smartphone, Building2, Globe, Headphones, Package, Share2, Plus, Minus, Banknote, Gauge,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { INSTITUTION_PROFILES, getInstitutionBySlug } from "@/portal/data/institutionProfiles";
import type { FullInstitutionProfile, CompetitorComparison, InstitutionProduct } from "@/portal/data/institutionProfiles";
import { SITE_URL } from "@/portal/seo/structuredData";
import { MobileScrollHint } from "@/components/ui/mobile-scroll-hint";

/* ─── helpers ─── */

function findComparison(
  p1: FullInstitutionProfile,
  p2: FullInstitutionProfile
): { comparison: CompetitorComparison; swapped: boolean } | null {
  const direct = p1.comparisons.find(
    (c) => c.competitorId === p2.slug || c.competitorId === p2.id
  );
  if (direct) return { comparison: direct, swapped: false };
  const reverse = p2.comparisons.find(
    (c) => c.competitorId === p1.slug || c.competitorId === p1.id
  );
  if (reverse) return { comparison: reverse, swapped: true };
  return null;
}

const verdictLabel = (score: number) => {
  if (score >= 80) return { label: "Відмінно", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
  if (score >= 60) return { label: "Добре", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" };
  return { label: "Слабко", cls: "bg-red-500/10 text-red-700 dark:text-red-400" };
};

const parseNumeric = (v: string): number | null => {
  const n = parseFloat(v.replace(/[^\d.,]/g, "").replace(",", "."));
  return isNaN(n) ? null : n;
};

interface Metric {
  label: string;
  icon: React.ElementType;
  left: string;
  right: string;
  leftNum: number | null;
  rightNum: number | null;
  higherIsBetter: boolean | null;
}

function buildMetrics(left: FullInstitutionProfile, right: FullInstitutionProfile): Metric[] {
  const lProduct = left.products[0];
  const rProduct = right.products[0];
  const lPrice = lProduct?.price?.monthly || lProduct?.price?.perTransaction || "—";
  const rPrice = rProduct?.price?.monthly || rProduct?.price?.perTransaction || "—";

  const iosReviews = (p: FullInstitutionProfile) =>
    p.platforms.ios.reviewCount ? ` (${(p.platforms.ios.reviewCount / 1000).toFixed(0)}K)` : "";

  return [
    {
      label: "Рейтинг FINTODO",
      icon: Star,
      left: `${left.ratings.fintodo.overall}/100`,
      right: `${right.ratings.fintodo.overall}/100`,
      leftNum: left.ratings.fintodo.overall,
      rightNum: right.ratings.fintodo.overall,
      higherIsBetter: true,
    },
    {
      label: "Ціна (від)",
      icon: Package,
      left: lProduct?.price?.isFree ? "Безкоштовно" : lPrice,
      right: rProduct?.price?.isFree ? "Безкоштовно" : rPrice,
      leftNum: lProduct?.price?.isFree ? 0 : parseNumeric(lPrice),
      rightNum: rProduct?.price?.isFree ? 0 : parseNumeric(rPrice),
      higherIsBetter: false,
    },
    {
      label: "iOS рейтинг",
      icon: Smartphone,
      left: left.platforms.ios.rating ? `${left.platforms.ios.rating}★${iosReviews(left)}` : "—",
      right: right.platforms.ios.rating ? `${right.platforms.ios.rating}★${iosReviews(right)}` : "—",
      leftNum: left.platforms.ios.rating ?? null,
      rightNum: right.platforms.ios.rating ?? null,
      higherIsBetter: true,
    },
    {
      label: "Android рейтинг",
      icon: Smartphone,
      left: left.platforms.android.rating ? `${left.platforms.android.rating}★` : "—",
      right: right.platforms.android.rating ? `${right.platforms.android.rating}★` : "—",
      leftNum: left.platforms.android.rating ?? null,
      rightNum: right.platforms.android.rating ?? null,
      higherIsBetter: true,
    },
    {
      label: "Відгуки",
      icon: Users,
      left: left.ratings.totalReviewsAllSources
        ? `${(left.ratings.totalReviewsAllSources / 1000).toFixed(0)}K`
        : "—",
      right: right.ratings.totalReviewsAllSources
        ? `${(right.ratings.totalReviewsAllSources / 1000).toFixed(0)}K`
        : "—",
      leftNum: left.ratings.totalReviewsAllSources ?? null,
      rightNum: right.ratings.totalReviewsAllSources ?? null,
      higherIsBetter: true,
    },
    {
      label: "Підтримка 24/7",
      icon: Headphones,
      left: left.contacts.support.is247 ? "✓" : "✗",
      right: right.contacts.support.is247 ? "✓" : "✗",
      leftNum: left.contacts.support.is247 ? 1 : 0,
      rightNum: right.contacts.support.is247 ? 1 : 0,
      higherIsBetter: true,
    },
    {
      label: "Рік заснування",
      icon: CalendarDays,
      left: String(left.company.foundedYear),
      right: String(right.company.foundedYear),
      leftNum: left.company.foundedYear,
      rightNum: right.company.foundedYear,
      higherIsBetter: null,
    },
    {
      label: "Працівники",
      icon: Users,
      left: left.company.employeesCount,
      right: right.company.employeesCount,
      leftNum: null,
      rightNum: null,
      higherIsBetter: null,
    },
    {
      label: "Відділення",
      icon: Building2,
      left: left.branches.totalCount > 0 ? String(left.branches.totalCount) : "Онлайн",
      right: right.branches.totalCount > 0 ? String(right.branches.totalCount) : "Онлайн",
      leftNum: null,
      rightNum: null,
      higherIsBetter: null,
    },
    {
      label: "Продуктів",
      icon: Package,
      left: String(left.products.length),
      right: String(right.products.length),
      leftNum: null,
      rightNum: null,
      higherIsBetter: null,
    },
  ];
}

function getWinnerCls(m: Metric, side: "left" | "right"): string {
  if (m.higherIsBetter === null || m.leftNum === null || m.rightNum === null) return "";
  if (m.leftNum === m.rightNum) return "";
  const leftWins = m.higherIsBetter ? m.leftNum > m.rightNum : m.leftNum < m.rightNum;
  if (side === "left" && leftWins) return "font-bold text-emerald-700 dark:text-emerald-400";
  if (side === "right" && !leftWins) return "font-bold text-emerald-700 dark:text-emerald-400";
  return "";
}

interface FeatureRow {
  name: string;
  left: boolean | "partial";
  leftNote?: string;
  right: boolean | "partial";
  rightNote?: string;
}

function buildFeatureComparison(left: FullInstitutionProfile, right: FullInstitutionProfile): FeatureRow[] {
  const lFeatures = left.products[0]?.features ?? [];
  const rFeatures = right.products[0]?.features ?? [];
  const allNames = Array.from(new Set([...lFeatures.map((f) => f.name), ...rFeatures.map((f) => f.name)]));

  return allNames.map((name) => {
    const lf = lFeatures.find((f) => f.name === name);
    const rf = rFeatures.find((f) => f.name === name);
    return {
      name,
      left: lf?.included ?? false,
      leftNote: lf?.note || lf?.limit,
      right: rf?.included ?? false,
      rightNote: rf?.note || rf?.limit,
    };
  });
}

/* ─── Pricing comparison ─── */

const feeRegex = /комісі|fee|%|вартість|плата|оплата|тариф|грн|₴/i;
const limitRegex = /ліміт|макс|min|max|обмеж|день|доба|раз|операц/i;

interface PricingCategory {
  category: string;
  leftProduct?: InstitutionProduct;
  rightProduct?: InstitutionProduct;
}

function buildPricingComparison(left: FullInstitutionProfile, right: FullInstitutionProfile): PricingCategory[] {
  const allCategories = Array.from(new Set([
    ...left.products.map(p => p.category),
    ...right.products.map(p => p.category),
  ]));
  return allCategories.map(cat => ({
    category: cat,
    leftProduct: left.products.find(p => p.category === cat),
    rightProduct: right.products.find(p => p.category === cat),
  })).filter(c => c.leftProduct || c.rightProduct);
}

interface FeeRow {
  name: string;
  category: string;
  leftValue: string;
  rightValue: string;
}

function buildFeeComparison(left: FullInstitutionProfile, right: FullInstitutionProfile): FeeRow[] {
  const extract = (profile: FullInstitutionProfile) =>
    profile.products.flatMap(p =>
      p.features
        .filter(f => (f.note || f.limit) && (feeRegex.test(f.name + (f.note || "") + (f.limit || "")) || limitRegex.test(f.name + (f.limit || ""))))
        .map(f => ({ product: p.category, name: f.name, value: f.note || f.limit || "" }))
    );

  const leftFees = extract(left);
  const rightFees = extract(right);
  const allNames = Array.from(new Set([...leftFees.map(f => f.name), ...rightFees.map(f => f.name)]));

  return allNames.map(name => {
    const lf = leftFees.find(f => f.name === name);
    const rf = rightFees.find(f => f.name === name);
    return {
      name,
      category: lf?.product || rf?.product || "",
      leftValue: lf?.value || "—",
      rightValue: rf?.value || "—",
    };
  });
}

const PriceRow = ({ label, left, right }: { label: string; left: string; right: string }) => (
  <div className="grid grid-cols-3 px-4 py-2 text-sm items-center">
    <div className="text-muted-foreground pl-4">{label}</div>
    <div className="text-center tabular-nums font-medium text-foreground">{left}</div>
    <div className="text-center tabular-nums font-medium text-foreground">{right}</div>
  </div>
);
const LogoPill = ({ profile, size = "lg" }: { profile: FullInstitutionProfile; size?: "sm" | "lg" }) => {
  const s = size === "sm" ? "w-8 h-8 text-xs" : "w-14 h-14 text-lg";
  return (
    <div
      className={`${s} rounded-xl flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: profile.logo.color }}
    >
      {profile.logo.initials}
    </div>
  );
};

/* ─── Feature Cell ─── */
const FeatureCell = ({ value, note }: { value: boolean | "partial"; note?: string }) => {
  if (value === true) return <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mx-auto" />;
  if (value === "partial") return (
    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{note || "Частково"}</span>
  );
  return <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
};

/* ═══════════════════════════════════════════ */
/* ── MAIN COMPONENT ── */
/* ═══════════════════════════════════════════ */

const InstitutionComparePage = () => {
  const { slug1, slug2 } = useParams<{ slug1: string; slug2: string }>();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const profile1 = slug1 ? getInstitutionBySlug(slug1) : undefined;
  const profile2 = slug2 ? getInstitutionBySlug(slug2) : undefined;

  // Sticky header observer
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyHeader(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!profile1 || !profile2) {
    return <Navigate to="/dovidnyky/ustanovy" replace />;
  }

  const left = profile1;
  const right = profile2;
  const result = findComparison(left, right);
  const comparison = result?.comparison;

  // Resolve editorial data respecting swap direction
  const leftAdvantages = comparison
    ? result?.swapped ? comparison.theirAdvantages : comparison.ourAdvantages
    : [];
  const rightAdvantages = comparison
    ? result?.swapped ? comparison.ourAdvantages : comparison.theirAdvantages
    : [];
  const equalAreas = comparison?.equalAreas ?? [];
  const whenChooseLeft = comparison
    ? result?.swapped ? comparison.whenChooseThem : comparison.whenChooseUs
    : "";
  const whenChooseRight = comparison
    ? result?.swapped ? comparison.whenChooseUs : comparison.whenChooseThem
    : "";

  const metrics = buildMetrics(left, right);
  const features = buildFeatureComparison(left, right);
  const leftVerdict = verdictLabel(left.ratings.fintodo.overall);
  const rightVerdict = verdictLabel(right.ratings.fintodo.overall);
  const winner = left.ratings.fintodo.overall >= right.ratings.fintodo.overall ? "left" : "right";

  const handleSwap = () => {
    navigate(`/dovidnyky/ustanovy/compare/${slug2}/${slug1}`, { replace: true });
  };

  const handleShare = async () => {
    const url = `${SITE_URL}/dovidnyky/ustanovy/compare/${slug1}/${slug2}`;
    const title = `${left.name} vs ${right.name} — Порівняння`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const totalProfiles = INSTITUTION_PROFILES.filter(
    (p) => p.ratings.fintodo.categorySlug === left.ratings.fintodo.categorySlug
  ).length;

  // JSON-LD ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${left.name} vs ${right.name}`,
    numberOfItems: 2,
    itemListElement: [left, right].map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Organization",
        name: p.name,
        url: `${SITE_URL}/dovidnyky/ustanovy/profile/${p.slug}`,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: p.ratings.fintodo.overall,
          bestRating: 100,
          worstRating: 0,
        },
      },
    })),
  };

  return (
    <PortalLayout
      meta={{
        title: `${left.name} vs ${right.name} — Порівняння | FINTODO`,
        description: `Порівняння ${left.name} (${left.ratings.fintodo.overall}/100) та ${right.name} (${right.ratings.fintodo.overall}/100): рейтинг, ціни, функції, відгуки.`,
        canonical: `${SITE_URL}/dovidnyky/ustanovy/compare/${slug1}/${slug2}`,
        type: "article",
      }}
    >
      <JsonLd data={jsonLd} />

      {/* ── Sticky Header ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border transition-transform duration-200 ${
          showStickyHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container max-w-4xl flex items-center justify-between py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex"><LogoPill profile={left} size="sm" /></div>
            <span className="text-sm font-semibold text-foreground truncate">{left.name}</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">vs</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm font-semibold text-foreground truncate">{right.name}</span>
            <div className="hidden sm:flex"><LogoPill profile={right} size="sm" /></div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl py-6 space-y-8">
        <BreadcrumbNav
          items={[
            { label: "Довідники", to: "/dovidnyky" },
            { label: "Установи", to: "/dovidnyky/ustanovy" },
            { label: `${left.name} vs ${right.name}` },
          ]}
        />

        {/* ── Hero ── */}
        <section ref={heroRef} className="text-center space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {left.name} <span className="text-muted-foreground font-normal">vs</span> {right.name}
          </h1>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {/* Left */}
            <div className="flex flex-col items-center gap-2">
              <LogoPill profile={left} />
              <Badge variant="secondary" className="tabular-nums">{left.ratings.fintodo.overall}/100</Badge>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${leftVerdict.cls}`}>
                {leftVerdict.label}
              </span>
              <span className="text-xs text-muted-foreground">
                #{left.ratings.fintodo.rank} з {totalProfiles}
              </span>
            </div>

            {/* Swap + Share */}
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSwap} title="Поміняти місцями">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleShare} title="Поділитися">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Right */}
            <div className="flex flex-col items-center gap-2">
              <LogoPill profile={right} />
              <Badge variant="secondary" className="tabular-nums">{right.ratings.fintodo.overall}/100</Badge>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rightVerdict.cls}`}>
                {rightVerdict.label}
              </span>
              <span className="text-xs text-muted-foreground">
                #{right.ratings.fintodo.rank} з {totalProfiles}
              </span>
            </div>
          </div>
        </section>

        {/* ── Metrics Table ── */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid grid-cols-3 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div>Метрика</div>
                <div className="text-center">{left.name}</div>
                <div className="text-center">{right.name}</div>
              </div>
              <div className="divide-y divide-border">
                {metrics.map((m, i) => (
                  <div key={i} className="grid grid-cols-3 px-4 py-3 text-sm items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <m.icon className="h-4 w-4 shrink-0" />
                      {m.label}
                    </div>
                    <div className={`text-center tabular-nums ${getWinnerCls(m, "left")}`}>
                      {m.left}
                    </div>
                    <div className={`text-center tabular-nums ${getWinnerCls(m, "right")}`}>
                      {m.right}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ── Feature Comparison ── */}
        {features.length > 0 && (
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">⚙️ Порівняння функцій</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Основний продукт: {left.products[0]?.name} vs {right.products[0]?.name}
              </p>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[480px]">
                <div className="grid grid-cols-3 px-4 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div>Функція</div>
                  <div className="text-center">{left.name}</div>
                  <div className="text-center">{right.name}</div>
                </div>
                <div className="divide-y divide-border">
                  {features.map((f, i) => (
                    <div key={i} className="grid grid-cols-3 px-4 py-2.5 text-sm items-center">
                      <div className="text-foreground">{f.name}</div>
                      <div className="text-center">
                        <FeatureCell value={f.left} note={f.leftNote} />
                      </div>
                      <div className="text-center">
                        <FeatureCell value={f.right} note={f.rightNote} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── Pricing Comparison ── */}
        {(() => {
          const pricing = buildPricingComparison(left, right);
          const hasPricing = pricing.some(c => c.leftProduct?.price || c.rightProduct?.price);
          if (!hasPricing) return null;
          return (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-primary" /> Ціни та тарифи
                </h2>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[480px]">
                  <div className="grid grid-cols-3 px-4 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div>Послуга</div>
                    <div className="text-center">{left.name}</div>
                    <div className="text-center">{right.name}</div>
                  </div>
                  <div className="divide-y divide-border">
                    {pricing.map((cat) => {
                      const lp = cat.leftProduct?.price;
                      const rp = cat.rightProduct?.price;
                      const lTariffs = cat.leftProduct?.tariffPlans;
                      const rTariffs = cat.rightProduct?.tariffPlans;
                      return (
                        <div key={cat.category}>
                          <div className="grid grid-cols-3 px-4 py-2.5 bg-muted/20">
                            <div className="font-semibold text-sm text-foreground">{cat.category}</div>
                            <div className="text-center text-xs text-muted-foreground">
                              {cat.leftProduct?.name || "—"}
                            </div>
                            <div className="text-center text-xs text-muted-foreground">
                              {cat.rightProduct?.name || "—"}
                            </div>
                          </div>
                          {(lp?.setup || rp?.setup) && (
                            <PriceRow label="Відкриття" left={lp?.isFree ? "Безкоштовно" : lp?.setup || "—"} right={rp?.isFree ? "Безкоштовно" : rp?.setup || "—"} />
                          )}
                          {(lp?.monthly || rp?.monthly) && (
                            <PriceRow label="Обслуг./міс" left={lp?.isFree ? "0 ₴" : lp?.monthly || "—"} right={rp?.isFree ? "0 ₴" : rp?.monthly || "—"} />
                          )}
                          {(lp?.perTransaction || rp?.perTransaction) && (
                            <PriceRow label="За операцію" left={lp?.perTransaction || "—"} right={rp?.perTransaction || "—"} />
                          )}
                          {(lp?.pricingNote || rp?.pricingNote) && (
                            <div className="grid grid-cols-3 px-4 py-1.5 text-xs text-muted-foreground">
                              <div className="pl-4">Примітка</div>
                              <div className="text-center">{lp?.pricingNote || "—"}</div>
                              <div className="text-center">{rp?.pricingNote || "—"}</div>
                            </div>
                          )}
                          {(lTariffs?.length || rTariffs?.length) && (
                            <>
                              <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground pl-8">Тарифні плани:</div>
                              {(() => {
                                const maxLen = Math.max(lTariffs?.length || 0, rTariffs?.length || 0);
                                return Array.from({ length: maxLen }).map((_, i) => {
                                  const lt = lTariffs?.[i];
                                  const rt = rTariffs?.[i];
                                  return (
                                    <div key={i} className="grid grid-cols-3 px-4 py-1.5 text-xs items-center">
                                      <div className="pl-8 text-muted-foreground">{lt?.name || rt?.name || ""}</div>
                                      <div className="text-center font-mono font-medium text-foreground">
                                        {lt ? `${lt.name}: ${lt.price}` : "—"}
                                      </div>
                                      <div className="text-center font-mono font-medium text-foreground">
                                        {rt ? `${rt.name}: ${rt.price}` : "—"}
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* ── Fees & Limits Comparison ── */}
        {(() => {
          const fees = buildFeeComparison(left, right);
          if (fees.length === 0) return null;
          return (
            <Card className="p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" /> Комісії та ліміти
                </h2>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[480px]">
                  <div className="grid grid-cols-3 px-4 py-2 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <div>Параметр</div>
                    <div className="text-center">{left.name}</div>
                    <div className="text-center">{right.name}</div>
                  </div>
                  <div className="divide-y divide-border">
                    {fees.map((f, i) => (
                      <div key={i} className="grid grid-cols-3 px-4 py-2.5 text-sm items-center">
                        <div className="text-foreground">{f.name}</div>
                        <div className="text-center tabular-nums font-medium text-foreground">{f.leftValue}</div>
                        <div className="text-center tabular-nums font-medium text-foreground">{f.rightValue}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })()}


        {comparison && (leftAdvantages.length > 0 || rightAdvantages.length > 0) && (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">💪 Переваги кожного</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="font-semibold text-foreground border-b border-border pb-2">{left.name}</p>
                {leftAdvantages.map((adv, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="font-medium text-foreground">{adv.area}:</span>{" "}
                      <span className="text-muted-foreground">{adv.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-foreground border-b border-border pb-2">{right.name}</p>
                {rightAdvantages.map((adv, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Minus className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-foreground">{adv.area}:</span>{" "}
                      <span className="text-muted-foreground">{adv.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* ── Equal areas ── */}
        {equalAreas.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-3">🤝 Спільні сильні сторони</h2>
            <div className="flex flex-wrap gap-2">
              {equalAreas.map((area, i) => (
                <Badge key={i} variant="outline" className="text-sm">
                  <Equal className="h-3 w-3 mr-1" />
                  {area}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* ── When to choose ── */}
        {comparison && (whenChooseLeft || whenChooseRight) && (
          <div className="grid md:grid-cols-2 gap-4">
            {whenChooseLeft && (
              <Card className="p-5 space-y-2 bg-emerald-500/5 border-emerald-500/20">
                <h3 className="font-semibold text-foreground">🟢 Обирайте {left.name}</h3>
                <p className="text-sm text-muted-foreground">{whenChooseLeft}</p>
              </Card>
            )}
            {whenChooseRight && (
              <Card className="p-5 space-y-2 bg-amber-500/5 border-amber-500/20">
                <h3 className="font-semibold text-foreground">🔵 Обирайте {right.name}</h3>
                <p className="text-sm text-muted-foreground">{whenChooseRight}</p>
              </Card>
            )}
          </div>
        )}

        {/* ── Bottom line ── */}
        {comparison?.bottomLine && (
          <Card className="p-6 bg-muted/50">
            <h2 className="text-lg font-bold text-foreground mb-2">📝 Висновок</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{comparison.bottomLine}</p>
          </Card>
        )}

        {/* ── Decision CTA ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { profile: left, isWinner: winner === "left" },
            { profile: right, isWinner: winner === "right" },
          ].map(({ profile, isWinner }) => {
            const v = verdictLabel(profile.ratings.fintodo.overall);
            return (
              <Card key={profile.slug} className={`p-5 space-y-3 ${isWinner ? "ring-2 ring-primary/30" : ""}`}>
                <div className="flex items-center gap-3">
                  <LogoPill profile={profile} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{profile.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs tabular-nums">{profile.ratings.fintodo.overall}/100</Badge>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${v.cls}`}>{v.label}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" variant={isWinner ? "default" : "outline"} asChild>
                    <a href={profile.cta.primary.href} target={profile.cta.primary.isInternal ? undefined : "_blank"} rel="noopener noreferrer">
                      {profile.cta.primary.label}
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/dovidnyky/ustanovy/profile/${profile.slug}`} title="Профіль">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── Add more (future) ── */}
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" disabled className="gap-1.5 opacity-60">
                  <Plus className="h-4 w-4" />
                  Додати ще установу
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Скоро — порівняння до 3 установ</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </PortalLayout>
  );
};

export default InstitutionComparePage;
