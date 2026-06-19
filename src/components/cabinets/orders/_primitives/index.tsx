import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, ChevronLeft, Star, Heart } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useRef } from "react";

/** Push `?inner=` while keeping current params; soft reload to re-render dispatcher. */
export function goToInner(id: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("inner", id);
  window.location.href = url.toString();
}

export const ORDERS_NUM = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 });
export const fmtUah = (n: number) => `${ORDERS_NUM.format(n)} ₴`;

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-5 lg:px-6 py-4 md:py-5 lg:py-6 space-y-5 md:space-y-7">
      {children}
    </div>
  );
}

/**
 * Wraps top page chrome (PageHeader + SearchBar + chips). Sticky on mobile,
 * static on tablet/desktop. Bleeds to viewport edges on mobile so the
 * background blur covers the full width under the page padding.
 */
export function StickyTopBar({
  enabled = true,
  children,
}: {
  enabled?: boolean;
  children: ReactNode;
}) {
  if (!enabled) return <div className="space-y-3">{children}</div>;
  return (
    <div className="md:static md:bg-transparent md:border-0 md:mx-0 md:px-0 md:py-0 sticky top-11 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur border-b border-border/60 space-y-3">
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </header>
  );
}

export function SearchBar({
  placeholder,
  trailing,
  value,
  onChange,
}: {
  placeholder: string;
  trailing?: ReactNode;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 h-11 bg-card"
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        />
      </div>
      {trailing}
    </div>
  );
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div className="min-w-0">
        <h2 className="text-base md:text-lg font-semibold">{title}</h2>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function CategoryChip({
  label,
  icon: Icon,
  onClick,
  active,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 md:gap-2 group focus:outline-none"
    >
      <span className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center transition-all ${
        active
          ? "bg-primary/15 border-primary/40"
          : "bg-gradient-to-br from-muted/40 to-muted/80 border-border/60 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:border-primary/30"
      }`}>
        <Icon className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${active ? "text-primary" : "text-foreground/80 group-hover:text-primary"}`} />
      </span>
      <span className={`text-[10px] md:text-[11px] text-center leading-tight transition-colors ${active ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"}`}>
        {label}
      </span>
    </button>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "warning";
}) {
  return (
    <Card className="p-4 border-border/70">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-xl md:text-2xl font-semibold tabular-nums",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "warning" && "text-amber-600 dark:text-amber-400"
        )}
      >
        {value}
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </Card>
  );
}

// ───────────────────────────────────────────── Brand-colored visuals (no real images)

const BRAND_PALETTES = [
  "from-rose-500/30 to-pink-500/20 text-rose-700 dark:text-rose-300",
  "from-amber-500/30 to-orange-500/20 text-amber-700 dark:text-amber-300",
  "from-emerald-500/30 to-teal-500/20 text-emerald-700 dark:text-emerald-300",
  "from-sky-500/30 to-blue-500/20 text-sky-700 dark:text-sky-300",
  "from-violet-500/30 to-fuchsia-500/20 text-violet-700 dark:text-violet-300",
  "from-indigo-500/30 to-blue-600/20 text-indigo-700 dark:text-indigo-300",
  "from-cyan-500/30 to-sky-500/20 text-cyan-700 dark:text-cyan-300",
  "from-lime-500/30 to-emerald-500/20 text-lime-700 dark:text-lime-300",
];

function hashIdx(seed: string, mod: number) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function brandPalette(seed: string) {
  return BRAND_PALETTES[hashIdx(seed, BRAND_PALETTES.length)];
}

export function BrandLogo({
  brand,
  size = 40,
  className,
}: {
  brand: string;
  size?: number;
  className?: string;
}) {
  const palette = brandPalette(brand);
  const initial = (brand || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-gradient-to-br flex items-center justify-center font-semibold shrink-0",
        palette,
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-label={brand}
    >
      {initial}
    </div>
  );
}

/** Hero / banner / promo image area — gradient + optional emoji/label, no external images. */
export function MediaTile({
  emoji,
  label,
  brand,
  className,
  ratio,
}: {
  emoji?: string;
  label?: string;
  brand?: string;
  className?: string;
  ratio?: "1:1" | "16:9" | "4:3";
}) {
  const palette = brand ? brandPalette(brand) : "from-muted/60 to-muted/80 text-foreground/60";
  const aspect = ratio === "16:9" ? "aspect-video" : ratio === "4:3" ? "aspect-[4/3]" : ratio === "1:1" ? "aspect-square" : "";
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-br border border-border/60 flex items-center justify-center text-2xl shrink-0 overflow-hidden",
        palette,
        aspect,
        className
      )}
      aria-label={label ?? brand}
    >
      {emoji ?? (brand ? brand.charAt(0).toUpperCase() : "🛍️")}
    </div>
  );
}

export function RailRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-none">
      <div className="flex gap-3 md:gap-4 snap-x snap-mandatory">{children}</div>
    </div>
  );
}

/** Horizontal scroller with desktop arrows. */
export function RailScroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(600, el.clientWidth * 0.9), behavior: "smooth" });
  };
  return (
    <div className="relative group">
      <div ref={ref} className="-mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-none scroll-smooth">
        <div className="flex gap-3 md:gap-4 snap-x snap-mandatory">{children}</div>
      </div>
      <button
        onClick={() => scroll(-1)}
        className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/95 border border-border/70 shadow-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Назад"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll(1)}
        className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/95 border border-border/70 shadow-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Вперед"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function MetaRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it, i) => (
        <span key={i}>
          <span className="text-foreground/70">{it.label}:</span> <span className="font-medium text-foreground tabular-nums">{it.value}</span>
        </span>
      ))}
    </div>
  );
}

export function LinkMore({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={onClick}>
      {label}
      <ChevronRight className="w-3.5 h-3.5" />
    </Button>
  );
}

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "active" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "bg-muted text-foreground/80 border-border/70",
    active: "bg-primary/10 text-primary border-primary/15",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  }[tone];
  return (
    <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-medium border", toneClass)}>
      {label}
    </Badge>
  );
}

export function RatingStars({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      <span className="tabular-nums font-medium">{value.toFixed(1)}</span>
      {count != null && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
}

export function PriceTag({
  price,
  oldPrice,
  prefix,
  suffix,
  className,
}: {
  price: number;
  oldPrice?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-1.5", className)}>
      <span className="text-sm font-semibold tabular-nums">
        {prefix ? `${prefix} ` : ""}{fmtUah(price)}{suffix ? ` ${suffix}` : ""}
      </span>
      {oldPrice != null && oldPrice > price && (
        <span className="text-[11px] text-muted-foreground line-through tabular-nums">{fmtUah(oldPrice)}</span>
      )}
    </div>
  );
}

export function FavoriteButton({ active, onClick }: { active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-7 h-7 rounded-full bg-background/90 border border-border/70 flex items-center justify-center hover:bg-background transition-colors",
        active && "text-rose-500"
      )}
      aria-label="В обране"
    >
      <Heart className={cn("w-3.5 h-3.5", active && "fill-current")} />
    </button>
  );
}

export function CounterTabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="-mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto scrollbar-none border-b border-border/70">
      <div className="flex gap-1 min-w-max">
        {tabs.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                "h-10 px-3 text-sm font-medium border-b-2 -mb-px transition-colors inline-flex items-center gap-1.5",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {t.count != null && (
                <span className={cn(
                  "text-[10px] px-1.5 h-4 rounded-full inline-flex items-center font-semibold",
                  active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function HeroBanner({
  eyebrow,
  title,
  subtitle,
  cta,
  brand,
  badge,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; onClick?: () => void };
  brand?: string;
  badge?: string;
  className?: string;
}) {
  const palette = brand ? brandPalette(brand) : "from-primary/30 to-primary/10 text-primary";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br p-5 md:p-7 min-h-[160px] md:min-h-[200px] flex flex-col justify-between",
        palette,
        className
      )}
    >
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10" />
      <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-black/5" />
      <div className="relative">
        {badge && (
          <span className="inline-flex text-[10px] uppercase tracking-wide font-semibold bg-background/80 text-foreground px-2 py-0.5 rounded-full mb-2">
            {badge}
          </span>
        )}
        {eyebrow && <div className="text-[11px] uppercase tracking-wide font-medium opacity-80">{eyebrow}</div>}
        <div className="text-lg md:text-2xl font-semibold leading-tight mt-1 text-foreground max-w-md">
          {title}
        </div>
        {subtitle && (
          <p className="text-xs md:text-sm text-foreground/70 mt-1.5 max-w-md">{subtitle}</p>
        )}
      </div>
      {cta && (
        <div className="relative mt-4">
          <Button size="sm" onClick={cta.onClick} className="h-9">
            {cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export function PromoCard({
  title,
  brand,
  discount,
  expiresHint,
  category,
  emoji,
  onClick,
}: {
  title: string;
  brand: string;
  discount: string;
  expiresHint?: string;
  category?: string;
  emoji?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-[220px] md:w-[240px] shrink-0 snap-start text-left rounded-xl border border-border/70 bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <MediaTile brand={brand} emoji={emoji} className="w-full h-24 rounded-none border-0" />
        <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-rose-500 text-white font-semibold">
          {discount}
        </span>
        {expiresHint && (
          <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-background/90 border border-border/60 text-foreground/80">
            {expiresHint}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <div className="text-xs font-semibold leading-tight line-clamp-2 min-h-[2rem]">{title}</div>
        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
          <BrandLogo brand={brand} size={16} className="rounded" />
          <span className="truncate">{brand}</span>
        </div>
        {category && <div className="text-[10px] text-muted-foreground mt-1">{category}</div>}
      </div>
    </button>
  );
}

/** Compact back header used on every inner section, replaces tabs/pills. */
export function BackHeader({ section, onBack }: { section: string; onBack?: () => void }) {
  return (
    <div className="md:sticky md:top-0 z-10 bg-background/95 backdrop-blur border-b border-border/70">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-11 flex items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => onBack?.()}
          disabled={!onBack}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-1.5 px-1.5 py-1 rounded disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Замовлення
        </button>
        <span className="text-muted-foreground/60">/</span>
        <span className="font-medium truncate">{section}</span>
      </div>
    </div>
  );
}

/** Large launcher tile used on Orders hub. */
export function LauncherTile({
  label,
  description,
  kpi,
  icon: Icon,
  accent = "muted",
  onClick,
}: {
  label: string;
  description: string;
  kpi?: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "primary" | "emerald" | "amber" | "rose" | "violet" | "sky" | "muted";
  onClick?: () => void;
}) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    muted: "bg-muted text-foreground/80",
  }[accent];
  return (
    <button
      onClick={onClick}
      className="group text-left p-4 rounded-xl border border-border/70 bg-card hover:border-border hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", accentClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3 text-sm font-semibold leading-tight">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 min-h-[2rem]">{description}</div>
      {kpi && (
        <div className="mt-2 text-[11px] font-medium text-foreground/80 tabular-nums">{kpi}</div>
      )}
    </button>
  );
}
