import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowLeftRight, Check, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import type { FullInstitutionProfile, InstitutionProduct } from "@/portal/data/institutionProfiles";
import { PortalLayout } from "@/portal/layouts/PortalLayout";

import { SITE_URL } from "@/portal/seo/structuredData";

const findProfileAndProduct = (slug: string, productId: string) => {
  const profile = INSTITUTION_PROFILES.find((p) => p.slug === slug);
  const product = profile?.products.find((p) => p.id === productId);
  return { profile, product };
};

const PriceRow = ({ label, left, right }: { label: string; left?: string; right?: string }) => {
  if (!left && !right) return null;
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 py-1.5 border-b border-border/30 last:border-0 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground text-center">{left || "—"}</span>
      <span className="font-mono font-medium text-foreground text-center">{right || "—"}</span>
    </div>
  );
};

const ProductComparePage = () => {
  const { slug1, productId1, slug2, productId2 } = useParams<{
    slug1: string;
    productId1: string;
    slug2: string;
    productId2: string;
  }>();
  const navigate = useNavigate();

  const { profile: leftProfile, product: leftProduct } = findProfileAndProduct(slug1!, productId1!);
  const { profile: rightProfile, product: rightProduct } = findProfileAndProduct(slug2!, productId2!);

  if (!leftProfile || !leftProduct || !rightProfile || !rightProduct) {
    return (
      <PortalLayout meta={{ title: "Продукт не знайдено", description: "", canonical: "" }}>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Продукт не знайдено</h1>
          <p className="text-muted-foreground mb-4">Один з продуктів для порівняння не існує.</p>
          <Button onClick={() => navigate("/dovidnyky/ustanovy")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> До каталогу
          </Button>
        </div>
      </PortalLayout>
    );
  }

  const handleSwap = () => {
    navigate(`/dovidnyky/ustanovy/compare-products/${slug2}/${productId2}/${slug1}/${productId1}`, { replace: true });
  };

  // Build feature comparison
  const allFeatureNames = Array.from(
    new Set([
      ...leftProduct.features.map((f) => f.name),
      ...rightProduct.features.map((f) => f.name),
    ])
  );

  const featureRows = allFeatureNames.map((name) => {
    const lf = leftProduct.features.find((f) => f.name === name);
    const rf = rightProduct.features.find((f) => f.name === name);
    return { name, left: lf, right: rf };
  });

  const leftIncluded = leftProduct.features.filter((f) => f.included === true).length;
  const rightIncluded = rightProduct.features.filter((f) => f.included === true).length;

  return (
      <PortalLayout meta={{
        title: `${leftProduct.name} vs ${rightProduct.name} — Порівняння | FINTODO`,
        description: `Порівняння ${leftProduct.name} (${leftProfile.name}) та ${rightProduct.name} (${rightProfile.name}): ціни, тарифи, можливості.`,
        canonical: `${SITE_URL}/dovidnyky/ustanovy/compare-products/${slug1}/${productId1}/${slug2}/${productId2}`,
      }}>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/dovidnyky/ustanovy" className="hover:text-foreground transition-colors">Установи</Link>
          <span>/</span>
          <span className="text-foreground">Порівняння продуктів</span>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="text-center space-y-1">
            <div
              className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: leftProfile.logo.color }}
            >
              {leftProfile.logo.initials}
            </div>
            <h2 className="text-sm font-bold text-foreground">{leftProduct.name}</h2>
            <Link to={`/dovidnyky/ustanovy/profile/${leftProfile.slug}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {leftProfile.name}
            </Link>
          </div>

          <Button variant="ghost" size="icon" onClick={handleSwap} className="rounded-full">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-1">
            <div
              className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: rightProfile.logo.color }}
            >
              {rightProfile.logo.initials}
            </div>
            <h2 className="text-sm font-bold text-foreground">{rightProduct.name}</h2>
            <Link to={`/dovidnyky/ustanovy/profile/${rightProfile.slug}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {rightProfile.name}
            </Link>
          </div>
        </div>

        {/* Pricing comparison */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            💰 Ціни та тарифи
          </h3>
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 pb-1.5 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            <span></span>
            <span className="text-center">{leftProfile.name}</span>
            <span className="text-center">{rightProfile.name}</span>
          </div>
          <PriceRow label="Підключення" left={leftProduct.price.setup || (leftProduct.price.isFree ? "Безкоштовно" : undefined)} right={rightProduct.price.setup || (rightProduct.price.isFree ? "Безкоштовно" : undefined)} />
          <PriceRow label="Щомісяця" left={leftProduct.price.monthly} right={rightProduct.price.monthly} />
          <PriceRow label="За операцію" left={leftProduct.price.perTransaction} right={rightProduct.price.perTransaction} />
          <PriceRow label="Щорічно" left={leftProduct.price.annual} right={rightProduct.price.annual} />

          {/* Tariff plans */}
          {(leftProduct.tariffPlans?.length || rightProduct.tariffPlans?.length) ? (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Тарифні плани</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  {leftProduct.tariffPlans?.map((tp, i) => (
                    <div key={i} className={`rounded-md border p-2 text-xs ${tp.isPopular ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                      <span className="font-medium">{tp.name}</span>
                      <span className="font-mono font-bold text-primary ml-2">{tp.price}</span>
                      {tp.conditions && <p className="text-[10px] text-muted-foreground mt-0.5">{tp.conditions}</p>}
                    </div>
                  )) || <p className="text-xs text-muted-foreground">—</p>}
                </div>
                <div className="space-y-1.5">
                  {rightProduct.tariffPlans?.map((tp, i) => (
                    <div key={i} className={`rounded-md border p-2 text-xs ${tp.isPopular ? 'border-primary bg-primary/5' : 'border-border/50'}`}>
                      <span className="font-medium">{tp.name}</span>
                      <span className="font-mono font-bold text-primary ml-2">{tp.price}</span>
                      {tp.conditions && <p className="text-[10px] text-muted-foreground mt-0.5">{tp.conditions}</p>}
                    </div>
                  )) || <p className="text-xs text-muted-foreground">—</p>}
                </div>
              </div>
            </div>
          ) : null}

          {/* Pricing notes */}
          {(leftProduct.price.pricingNote || rightProduct.price.pricingNote) && (
            <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-3">
              {leftProduct.price.pricingNote && (
                <p className="text-[10px] text-muted-foreground italic bg-muted/30 rounded-md p-2">{leftProduct.price.pricingNote}</p>
              )}
              {!leftProduct.price.pricingNote && <div />}
              {rightProduct.price.pricingNote && (
                <p className="text-[10px] text-muted-foreground italic bg-muted/30 rounded-md p-2">{rightProduct.price.pricingNote}</p>
              )}
            </div>
          )}
        </Card>

        {/* Features comparison */}
        {featureRows.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              📋 Можливості
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                {leftIncluded}/{leftProduct.features.length} vs {rightIncluded}/{rightProduct.features.length}
              </span>
            </h3>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pb-1.5 border-b border-border">Функція</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pb-1.5 border-b border-border text-center w-20">{leftProfile.name.split(' ')[0]}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium pb-1.5 border-b border-border text-center w-20">{rightProfile.name.split(' ')[0]}</div>

              {featureRows.map((row, i) => (
                <>
                  <div key={`n-${i}`} className={`text-xs text-foreground py-1.5 ${i % 2 === 1 ? 'bg-muted/20' : ''} px-1 rounded-l-md`}>{row.name}</div>
                  <div key={`l-${i}`} className={`flex items-center justify-center py-1.5 ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    {row.left ? (
                      row.left.included === true ? <Check className="w-3.5 h-3.5 text-emerald-500" /> :
                      row.left.included === "partial" ? <span className="text-amber-500 text-xs">◐</span> :
                      <X className="w-3.5 h-3.5 text-muted-foreground/40" />
                    ) : <span className="text-muted-foreground/30">—</span>}
                  </div>
                  <div key={`r-${i}`} className={`flex items-center justify-center py-1.5 ${i % 2 === 1 ? 'bg-muted/20' : ''} rounded-r-md`}>
                    {row.right ? (
                      row.right.included === true ? <Check className="w-3.5 h-3.5 text-emerald-500" /> :
                      row.right.included === "partial" ? <span className="text-amber-500 text-xs">◐</span> :
                      <X className="w-3.5 h-3.5 text-muted-foreground/40" />
                    ) : <span className="text-muted-foreground/30">—</span>}
                  </div>
                </>
              ))}
            </div>
          </Card>
        )}

        {/* Pros / Cons */}
        {(leftProduct.pros.length > 0 || rightProduct.pros.length > 0 || leftProduct.cons.length > 0 || rightProduct.cons.length > 0) && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">⚖️ Переваги та недоліки</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{leftProfile.name}</p>
                {leftProduct.pros.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">✅ Переваги</p>
                    {leftProduct.pros.map((p, i) => (
                      <p key={i} className="text-[11px] text-foreground flex items-start gap-1">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />{p}
                      </p>
                    ))}
                  </div>
                )}
                {leftProduct.cons.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">⚠️ Недоліки</p>
                    {leftProduct.cons.map((c, i) => (
                      <p key={i} className="text-[11px] text-foreground flex items-start gap-1">
                        <X className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />{c}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{rightProfile.name}</p>
                {rightProduct.pros.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">✅ Переваги</p>
                    {rightProduct.pros.map((p, i) => (
                      <p key={i} className="text-[11px] text-foreground flex items-start gap-1">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />{p}
                      </p>
                    ))}
                  </div>
                )}
                {rightProduct.cons.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">⚠️ Недоліки</p>
                    {rightProduct.cons.map((c, i) => (
                      <p key={i} className="text-[11px] text-foreground flex items-start gap-1">
                        <X className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />{c}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* CTA */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="gap-2" asChild>
            <a href={leftProduct.ctaUrl} target="_blank" rel="noopener noreferrer">
              {leftProduct.ctaLabel} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <a href={rightProduct.ctaUrl} target="_blank" rel="noopener noreferrer">
              {rightProduct.ctaLabel} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </PortalLayout>
  );
};

export default ProductComparePage;
