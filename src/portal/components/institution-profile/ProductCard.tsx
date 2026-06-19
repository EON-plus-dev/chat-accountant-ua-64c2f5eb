import { Check, X, Globe, ChevronDown, ExternalLink, Calculator } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { InstitutionProduct, FullInstitutionProfile } from "@/portal/data/institutionProfiles";
import { LoanCalculator } from "./LoanCalculator";
import { ProductDocuments } from "./ProductDocuments";
import { ProductComparePickerPopover } from "./ProductComparePickerPopover";

const isCreditProduct = (product: InstitutionProduct): boolean => {
  const text = [product.name, product.category, product.description || '', product.tagline || ''].join(' ');
  return /кредит|позик|loan|овердрафт|розстрочк/i.test(text);
};

const isZedProduct = (product: InstitutionProduct): boolean => {
  const text = [product.name, product.description, product.tagline, ...product.features.map(f => f.name)].join(' ');
  return /ЗЕД|валют|SWIFT|міжнародн|мультивалют|currency|international|foreign/i.test(text);
};

const isAcquiringProduct = (product: InstitutionProduct): boolean => {
  const text = [product.name, product.category, product.description || '', product.tagline || ''].join(' ');
  return /еквайринг|acquiring|POS|термінал/i.test(text);
};

const isRkoProduct = (product: InstitutionProduct): boolean => {
  const text = [product.name, product.category, product.description || '', product.tagline || ''].join(' ');
  return /РКО|рахунок|розрахунков|поточний рахунок|account/i.test(text);
};

const RATE_OPTIONS = [1.5, 2.0, 2.5];
const PLAN_OPTIONS = [
  { value: 0, label: "Старт" },
  { value: 250, label: "Бізнес" },
  { value: 500, label: "Преміум" },
];
const TX_PRICE_OPTIONS = [3, 5, 8];

const AcquiringCalculator = () => {
  const [turnover, setTurnover] = useState(500000);
  const [rate, setRate] = useState(1.5);

  const commission = turnover * rate / 100;
  const annual = commission * 12;
  const net = turnover - commission;
  const freePos = turnover >= 50000;

  const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";
  const parseNum = (val: string) => {
    const n = Number(val.replace(/[^\d]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-xs">Оборот/міс, ₴</Label>
          <Input
            type="text"
            value={turnover.toLocaleString("uk-UA")}
            onChange={e => setTurnover(parseNum(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Комісія, %</Label>
          <div className="flex gap-1.5">
            {RATE_OPTIONS.map(r => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  rate === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Комісія/міс</span>
          <span className="font-semibold text-foreground tabular-nums">{fmt(commission)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Комісія/рік</span>
          <span className="font-semibold text-foreground tabular-nums">{fmt(annual)}</span>
        </div>
        <div className="flex justify-between text-sm font-medium border-t border-border/50 pt-1">
          <span className="text-muted-foreground">Чистий дохід/міс</span>
          <span className="font-semibold text-foreground tabular-nums">{fmt(net)}</span>
        </div>
        <div className="flex justify-between text-sm pt-0.5">
          <span className="text-muted-foreground">POS-термінал</span>
          <span className={`text-xs font-medium ${freePos ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
            {freePos ? "Безкоштовно" : "Від 200 ₴/міс"}
          </span>
        </div>
      </div>
    </div>
  );
};

const RkoCalculator = () => {
  const [turnover, setTurnover] = useState(1000000);
  const [txCount, setTxCount] = useState(150);
  const [planFee, setPlanFee] = useState(250);
  const [txPrice, setTxPrice] = useState(5);

  const txTotal = txCount * txPrice;
  const turnoverFee = turnover * 0.001;
  const total = planFee + txTotal + turnoverFee;
  const annual = total * 12;

  const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";
  const parseNum = (val: string) => {
    const n = Number(val.replace(/[^\d]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-xs">Оборот/міс, ₴</Label>
          <Input type="text" value={turnover.toLocaleString("uk-UA")} onChange={e => setTurnover(parseNum(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Транзакції/міс</Label>
          <Input type="text" value={txCount.toString()} onChange={e => setTxCount(parseNum(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Тариф обслуговування</Label>
          <div className="flex gap-1.5">
            {PLAN_OPTIONS.map(p => (
              <button key={p.value} onClick={() => setPlanFee(p.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${planFee === p.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {p.label} {p.value > 0 ? `${p.value} ₴` : "0 ₴"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Ціна за транзакцію</Label>
          <div className="flex gap-1.5">
            {TX_PRICE_OPTIONS.map(p => (
              <button key={p} onClick={() => setTxPrice(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${txPrice === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {p} ₴
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Обслуговування</span>
          <span className="font-semibold text-foreground tabular-nums">{fmt(planFee)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Комісія за транзакції</span>
          <span className="font-semibold text-foreground tabular-nums">{fmt(txTotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Комісія за оборот (0,1%)</span>
          <span className="font-semibold text-foreground tabular-nums">{fmt(turnoverFee)}</span>
        </div>
        <div className="flex justify-between text-sm font-medium border-t border-border/50 pt-1">
          <span className="text-muted-foreground">Разом/міс</span>
          <span className="font-bold text-foreground tabular-nums">{fmt(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Разом/рік</span>
          <span className="font-semibold text-foreground tabular-nums">{fmt(annual)}</span>
        </div>
      </div>
    </div>
  );
};

interface Props {
  product: InstitutionProduct;
  profile: FullInstitutionProfile;
}

export const ProductCard = ({ product, profile }: Props) => {
  const [open, setOpen] = useState(false);
  const isFlagship = product.isHighlighted;
  const includedCount = product.features.filter(f => f.included === true).length;
  const totalFeatures = product.features.length;
  const featurePercent = totalFeatures > 0 ? Math.round((includedCount / totalFeatures) * 100) : 0;

  // Group features by status
  const includedFeatures = product.features.filter(f => f.included === true);
  const partialFeatures = product.features.filter(f => f.included === "partial");
  const excludedFeatures = product.features.filter(f => f.included === false);

  const hasDetails = (product.tariffPlans && product.tariffPlans.length > 0) ||
    totalFeatures > 0 ||
    (product.subProducts && product.subProducts.length > 0) ||
    product.pros.length > 0 || product.cons.length > 0 ||
    (product.promotions && product.promotions.length > 0) ||
    product.price.setup || product.price.hasFreeTrial || product.minAmount || product.price.pricingNote;

  return (
    <Card className={`p-3 ${isFlagship ? "border-2 border-primary bg-primary/5" : ""}`}>
      {/* Layer 1: Compact header */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{product.name}</h3>
            {isFlagship && <Badge variant="info" size="sm" className="text-[10px]">Флагман</Badge>}
            {isZedProduct(product) && <Badge variant="news" size="sm" className="text-[10px] flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> ЗЕД</Badge>}
            
          </div>
          {product.tagline && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{product.tagline}</p>}

          {/* Key metrics as chips */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1.5 text-[11px]">
            {product.interestRate && (
              <span className="text-foreground">Ставка <span className="font-mono font-semibold text-primary">{product.interestRate}</span></span>
            )}
            {product.processingTime && (
              <span className="text-muted-foreground">Термін: <strong className="text-foreground">{product.processingTime}</strong></span>
            )}
            {product.coverageLimits && (
              <span className="text-muted-foreground">Покриття: <strong className="text-foreground">{product.coverageLimits}</strong></span>
            )}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="font-mono text-primary font-bold text-sm">
            {product.price.isFree ? "Безкоштовно" : product.price.monthly || product.price.perTransaction}
          </span>
          <Button variant={isFlagship ? "default" : "secondary"} size="sm" className="h-7 text-[11px] px-3 min-w-[120px]" asChild>
            <a href={product.ctaUrl} target="_blank" rel="noopener noreferrer">{product.ctaLabel} →</a>
          </Button>
          <ProductComparePickerPopover currentProduct={product} currentProfile={profile} />
        </div>
      </div>

      {/* Layer 2: Collapsible details */}
      {hasDetails && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            <span>{open ? 'Згорнути' : 'Детальніше'}</span>
            {totalFeatures > 0 && !open && (
              <>
                <span className="text-muted-foreground/60 mx-1">·</span>
                <Progress value={featurePercent} className="h-1 w-16" />
                <span className="text-[10px] ml-1">{includedCount}/{totalFeatures}</span>
              </>
            )}
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2 space-y-3">
            {/* 1. Pros / Cons — prominent block with headers */}
            {(product.pros.length > 0 || product.cons.length > 0) && (
              <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.pros.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-emerald-600 dark:text-emerald-400 mb-1">✅ Переваги</p>
                      {product.pros.map((p, i) => (
                        <p key={i} className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
                          <Check className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  {product.cons.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wide font-semibold text-amber-600 dark:text-amber-400 mb-1">⚠️ Недоліки</p>
                      {product.cons.map((c, i) => (
                        <p key={i} className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                          <X className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Tariff plans */}
            {product.tariffPlans && product.tariffPlans.length > 0 && (
              <div className={`grid gap-2 ${product.tariffPlans.length >= 3 ? 'grid-cols-3' : product.tariffPlans.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {product.tariffPlans.map((plan, i) => (
                  <div key={i} className={`rounded-md border p-2 text-center ${plan.isPopular ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/20'}`}>
                    {plan.isPopular && <Badge variant="info" size="sm" className="mb-1 text-[10px]">Популярний</Badge>}
                    <p className="text-[11px] font-semibold text-foreground">{plan.name}</p>
                    <p className="text-sm font-mono font-bold text-primary mt-0.5">{plan.price}</p>
                    {plan.conditions && <p className="text-[10px] text-muted-foreground mt-0.5">{plan.conditions}</p>}
                    {plan.features && plan.features.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-left">
                        {plan.features.slice(0, 3).map((f, j) => (
                          <li key={j} className="text-[10px] text-muted-foreground flex items-start gap-1">
                            <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 3. Sub-products */}
            {product.subProducts && product.subProducts.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.subProducts.map((sp, i) => (
                  <Badge key={i} variant="secondary" size="sm" className="text-[10px] font-normal">
                    {sp.url ? (
                      <a href={sp.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5">
                        {sp.name} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : sp.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* 4. Features — grouped by status with section headers */}
            {totalFeatures > 0 && (
              <div className="border rounded-md border-border/50 overflow-hidden">
                {includedFeatures.length > 0 && (
                  <>
                    <div className="px-2.5 py-1 bg-muted/40">
                      <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Включено ({includedFeatures.length})</span>
                    </div>
                    {includedFeatures.map((f, j) => (
                      <div key={`inc-${j}`} className={`flex items-center gap-2 px-2.5 py-1 text-[11px] ${j % 2 === 1 ? "bg-muted/30" : ""}`}>
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="flex-1 text-foreground">{f.name}</span>
                        {(f.limit || f.note) && <span className="text-muted-foreground text-[10px] max-w-40 text-right">{f.limit || f.note}</span>}
                      </div>
                    ))}
                  </>
                )}
                {partialFeatures.length > 0 && (
                  <>
                    {includedFeatures.length > 0 && <div className="border-t border-border/30" />}
                    <div className="px-2.5 py-1 bg-amber-50/50 dark:bg-amber-950/10">
                      <span className="text-[10px] uppercase tracking-wide font-semibold text-amber-600 dark:text-amber-400">Частково ({partialFeatures.length})</span>
                    </div>
                    {partialFeatures.map((f, j) => (
                      <div key={`par-${j}`} className="flex items-center gap-2 px-2.5 py-1 text-[11px] bg-amber-50/50 dark:bg-amber-950/10">
                        <span className="w-3 h-3 text-amber-500 shrink-0">◐</span>
                        <span className="flex-1 text-foreground">{f.name}</span>
                        {(f.limit || f.note) && <span className="text-muted-foreground text-[10px] max-w-40 text-right">{f.limit || f.note}</span>}
                      </div>
                    ))}
                  </>
                )}
                {excludedFeatures.length > 0 && (
                  <>
                    {(includedFeatures.length > 0 || partialFeatures.length > 0) && <div className="border-t border-border/30" />}
                    <div className="px-2.5 py-1 bg-muted/20">
                      <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/70">Недоступно ({excludedFeatures.length})</span>
                    </div>
                    {excludedFeatures.map((f, j) => (
                      <div key={`exc-${j}`} className="flex items-center gap-2 px-2.5 py-1 text-[11px] opacity-60">
                        <X className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                        <span className="flex-1 text-foreground">{f.name}</span>
                        {(f.limit || f.note) && <span className="text-muted-foreground text-[10px] max-w-40 text-right">{f.limit || f.note}</span>}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* 5. Documents */}
            <ProductDocuments product={product} profile={profile} />

            {/* 6. Calculators */}
            {isCreditProduct(product) && (
              <div className="border-t border-border/50 pt-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <Calculator className="w-3.5 h-3.5 text-primary" /> Калькулятор
                </p>
                <LoanCalculator defaultRate={product.interestRate ? parseFloat(product.interestRate) || 24 : 24} />
              </div>
            )}

            {isAcquiringProduct(product) && (
              <div className="border-t border-border/50 pt-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <Calculator className="w-3.5 h-3.5 text-primary" /> Калькулятор комісії
                </p>
                <AcquiringCalculator />
              </div>
            )}

            {isRkoProduct(product) && (
              <div className="border-t border-border/50 pt-2">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <Calculator className="w-3.5 h-3.5 text-primary" /> Калькулятор вартості РКО
                </p>
                <RkoCalculator />
              </div>
            )}

            {/* 7. Promotions + Pricing */}
            {product.promotions && product.promotions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {product.promotions.map((promo, i) => (
                  <Badge key={i} variant="success" size="sm" className="text-[10px]">🎁 {promo}</Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
              {product.price.setup && <span>Підключення: <strong className="text-foreground">{product.price.setup}</strong></span>}
              {product.price.hasFreeTrial && <span>Пробний: <strong className="text-foreground">{product.price.freeTrialDays ? `${product.price.freeTrialDays} днів` : "Так"}</strong></span>}
              {product.minAmount && <span>Мін. сума: <strong className="text-foreground">{product.minAmount}</strong></span>}
              {product.price.pricingNote && (
                <span className="w-full rounded-md bg-muted/30 p-2 italic not-italic font-medium text-foreground/80">{product.price.pricingNote}</span>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};
