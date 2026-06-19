import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calculator, Search, ChevronDown, Check, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { analytics } from "@/portal/services/analytics";
import { HeaderSearch } from "@/portal/components/HeaderSearch";
import { useFontSize, type FontSize } from "@/hooks/useFontSize";
import { useTryCtaTarget } from "@/portal/hooks/useTryCtaTarget";
import { CertifiedTryDialog } from "@/portal/components/CertifiedTryDialog";
import { RESOURCES_ITEMS, resolveSubNav } from "@/portal/config/portalSubNav";

const FONT_SIZE_OPTIONS: { value: FontSize; label: string; aria: string; cls: string }[] = [
  { value: "sm", label: "A", aria: "Зменшити шрифт", cls: "text-[12px]" },
  { value: "base", label: "A", aria: "Стандартний шрифт", cls: "text-[14px]" },
  { value: "lg", label: "A", aria: "Збільшений шрифт", cls: "text-[17px]" },
];

const FontSizeSegmented = ({
  value,
  onChange,
}: {
  value: FontSize;
  onChange: (v: FontSize) => void;
}) => (
  <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
    {FONT_SIZE_OPTIONS.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          aria-label={opt.aria}
          aria-pressed={active}
          onPointerDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            onChange(opt.value);
          }}
          className={`flex-1 flex items-center justify-center min-w-9 h-9 rounded-md font-semibold leading-none transition-colors ${
            active
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
          } ${opt.cls}`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

/* ── Audience tabs (3 окремі лендинги) ── */
const AUDIENCE_TABS = [
  { label: "Бізнесу", short: "Бізнес", href: "/" },
  { label: "Фізособам", short: "Фіз", href: "/individuals" },
  { label: "Партнерам", short: "Партнер", href: "/partners" },
];

/* RESOURCES_ITEMS — імпортується з @/portal/config/portalSubNav */

const isAudienceActive = (href: string, pathname: string) => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
};

export const ln = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tryDialogOpen, setTryDialogOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { size: fontSize, setSize: setFontSize } = useFontSize();
  const tryCta = useTryCtaTarget();
  const subnav = useMemo(() => resolveSubNav(location.pathname), [location.pathname]);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const subnavRef = useRef<HTMLElement | null>(null);
  const anchorBtnRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const firstCenterRef = useRef(true);
  const programmaticScrollUntilRef = useRef(0);
  const prevContextRef = useRef<string | null>(null);

  // Reactive elevation when content scrolls under header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset firstCenterRef коли змінюється subnav (нова аудиторія/контекст)
  useEffect(() => {
    firstCenterRef.current = true;
  }, [subnav]);

  // Scrollspy через IntersectionObserver — стабільніше за scroll-listener
  useEffect(() => {
    if (subnav?.kind !== "audience") {
      setActiveAnchor(null);
      return;
    }
    const ids = subnav.items
      .map((it) => (it.href.startsWith("#") ? it.href.slice(1) : null))
      .filter((v): v is string => !!v);

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (elements.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        // Ігноруємо під час програмного smooth-скролу
        if (Date.now() < programmaticScrollUntilRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // Беремо найвищу в DOM-порядку секцію серед видимих
        for (const id of ids) {
          if (visible.has(id)) {
            setActiveAnchor(id);
            return;
          }
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: [0, 0.01] }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [subnav]);

  // Автоцентрування активної кнопки: перший раз — миттєво, далі — smooth
  useEffect(() => {
    if (!activeAnchor) return;
    const nav = subnavRef.current;
    const btn = anchorBtnRefs.current[activeAnchor];
    if (!nav || !btn) return;
    const target = btn.offsetLeft - nav.clientWidth / 2 + btn.clientWidth / 2;
    nav.scrollTo({
      left: Math.max(0, target),
      behavior: firstCenterRef.current ? "auto" : "smooth",
    });
    firstCenterRef.current = false;
  }, [activeAnchor]);

  // Скидання вертикального скролу при зміні контексту аудиторії
  useEffect(() => {
    const path = location.pathname;
    let context = "other";
    if (path === "/") context = "business";
    else if (path.startsWith("/individuals")) context = "individuals";
    else if (path.startsWith("/partners")) context = "partners";
    else if (subnav?.kind === "resources") context = "resources";

    if (prevContextRef.current !== null && prevContextRef.current !== context && !location.hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    prevContextRef.current = context;
  }, [location.pathname, location.hash, subnav]);

  const handleAnchorClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      // Блокуємо scrollspy на час smooth-анімації, одразу фіксуємо активну
      programmaticScrollUntilRef.current = Date.now() + 800;
      setActiveAnchor(id);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", hash);
    }
  }, []);


  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen]);

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const isResourceActive = useCallback(
    (href: string) => {
      if (href === "/") return location.pathname === "/";
      return location.pathname.startsWith(href);
    },
    [location.pathname]
  );

  const mobileLabel = useMemo(() => {
    const activeResource = RESOURCES_ITEMS.find((r) => {
      if (r.href === "/") return location.pathname === "/";
      return location.pathname.startsWith(r.href);
    });
    const activeAudience = AUDIENCE_TABS.find((t) => isAudienceActive(t.href, location.pathname));
    return activeResource?.label ?? activeAudience?.label ?? "Бізнесу";
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-200 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-[0_8px_24px_-12px_hsl(var(--foreground)/0.10)]"
          : "bg-background/70 backdrop-blur-md border-b border-border/40"
      }`}
    >
      <div className="border-b border-border/60">
        <div className="relative max-w-7xl mx-auto flex items-center justify-between min-h-12 lg:min-h-14 py-1 px-4 sm:px-6 lg:px-8 gap-2">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="hidden sm:inline font-sans font-semibold tracking-wide">FINTODO</span>
            </Link>
          </div>

          {/* Center: Audience tabs + Resources toggle */}
          <nav className="hidden lg:flex items-center gap-1">
            {AUDIENCE_TABS.map((tab) => {
              const active = isAudienceActive(tab.href, location.pathname);
              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
            <Link
              to="/overview"
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg ${
                subnav?.kind === "resources"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Ресурси
            </Link>
          </nav>

          {/* Mobile center: contextual dropdown (audience + resources) */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 z-20">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Навігація"
                  className="flex items-center justify-center gap-1 w-40 h-8 px-3 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium shadow-sm hover:bg-primary/15 transition-colors"
                >
                  <span className="truncate">{mobileLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-60">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Для кого</DropdownMenuLabel>
                {AUDIENCE_TABS.map((tab) => {
                  const active = isAudienceActive(tab.href, location.pathname);
                  return (
                    <DropdownMenuItem key={tab.href} asChild>
                      <Link to={tab.href} className="flex items-center justify-between w-full">
                        <span className={active ? "font-medium text-primary" : ""}>{tab.label}</span>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Ресурси</DropdownMenuLabel>
                {RESOURCES_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isResourceActive(item.href);
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center gap-2.5 w-full">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className={active ? "font-medium text-foreground" : ""}>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  Розмір шрифту
                </DropdownMenuLabel>
                <div className="px-2 pb-2 pt-1">
                  <FontSizeSegmented value={fontSize} onChange={setFontSize} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Search + Auth */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Пошук по порталу"
              className="h-8 w-8 lg:h-10 lg:w-10"
            >
              <Search className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>

            {/* Desktop: Font size */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Розмір шрифту"
                  className="hidden lg:inline-flex h-10 w-10"
                >
                  <Type className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  Розмір шрифту
                </DropdownMenuLabel>
                <div className="px-2 pb-2 pt-1">
                  <FontSizeSegmented value={fontSize} onChange={setFontSize} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Увійти
              </button>
              <Button
                size="sm"
                className="whitespace-nowrap min-w-[180px] justify-center"
                disabled={!tryCta.ready}
                onClick={() => {
                  analytics.ctaClick('header_cta');
                  if (tryCta.openCertifiedDialog) {
                    setTryDialogOpen(true);
                  } else if (tryCta.href) {
                    navigate(tryCta.href);
                  }
                }}
              >
                {tryCta.label}
              </Button>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="lg:hidden h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Увійти
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sub-header: висота завжди зарезервована, щоб уникнути CLS */}
      <div
        className={`hidden lg:block h-11 transition-colors duration-200 ${
          scrolled ? "bg-background/95" : "bg-muted/50"
        }`}
      >
        {subnav && (
          <nav
            ref={subnavRef}
            id="portal-subnav"
            aria-label={subnav.kind === "resources" ? "Ресурси порталу" : "Розділи сторінки"}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 h-11 overflow-x-auto no-scrollbar scroll-smooth"
          >
            {subnav.items.map((item) => {
              const Icon = item.icon;
              const isAnchor = item.href.startsWith("#");
              const anchorId = isAnchor ? item.href.slice(1) : null;
              const active = isAnchor
                ? activeAnchor === anchorId
                : isResourceActive(item.href);
              const cls = `relative flex items-center gap-2 px-3 h-11 text-sm whitespace-nowrap transition-colors rounded-t-md ${
                active
                  ? "text-foreground font-semibold bg-background"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`;
              const indicator = active ? (
                <motion.span
                  layoutId="subnav-indicator"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              ) : null;
              return isAnchor ? (
                <a
                  key={item.href}
                  href={item.href}
                  ref={(el) => {
                    if (anchorId) anchorBtnRefs.current[anchorId] = el;
                  }}
                  onClick={(e) => handleAnchorClick(e, item.href)}
                  aria-current={active ? "location" : undefined}
                  className={cls}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {item.label}
                  {indicator}
                </a>
              ) : (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cls}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {item.label}
                  {indicator}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Soft fade-shadow під header, щоб контент «заходив» під нього без жорсткої лінії */}
      <div
        aria-hidden
        className={`hidden lg:block h-2 -mb-2 bg-gradient-to-b from-foreground/[0.06] to-transparent pointer-events-none transition-opacity duration-200 ${
          scrolled ? "opacity-100" : "opacity-60"
        }`}
      />

      {/* Search sub-header */}
      <HeaderSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CertifiedTryDialog
        open={tryDialogOpen}
        onOpenChange={setTryDialogOpen}
        firstLessonHref="/learn/accountants/fintodo-certified/m1l1"
        courseUrl="/learn/accountants/fintodo-certified"
      />

    </header>
  );
};

export const PortalHeader = ln;
