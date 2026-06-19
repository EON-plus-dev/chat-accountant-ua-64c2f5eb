import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TICKER_ITEMS = [
  { text: "⚡ ФОП 3 гр.: нові ставки єдиного податку з 1 квітня", slug: "fop-novi-stavky-kvitenj" },
  { text: "📋 Нова форма ЄСВ для роботодавців", slug: "esv-pracivnyky-2025" },
  { text: "⚖️ ВСУ: рішення на користь платника по ПДВ", slug: "pdv-blokuvannya-pn" },
  { text: "🇺🇦 Гранти ЄС для МСБ: відкрито прийом заявок", slug: "grants-yes-msb-2025" },
  { text: "🧮 Калькулятор зарплати оновлено до ставок 2025", slug: null },
];

const INTERVAL_MS = 5000;

export const BreakingTicker = () => {
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem("ticker-dismissed") === "true"
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + TICKER_ITEMS.length) % TICKER_ITEMS.length);
  }, []);

  useEffect(() => {
    if (paused || dismissed) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(goNext, INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, dismissed, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      diff < 0 ? goNext() : goPrev();
    }
    touchStartX.current = null;
  };

  if (dismissed) return null;

  const item = TICKER_ITEMS[activeIndex];
  const animationProps = prefersReducedMotion.current
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.3 },
      };

  return (
    <div
      className="bg-primary/10 border-b border-primary/20 relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="status"
      aria-live="polite"
      aria-label="Стрічка новин"
    >
      <div className="border-l-4 border-l-primary flex items-center px-3 py-2 gap-2">
        {/* News badge */}
        <span className="hidden sm:inline-flex bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0">
          Новини
        </span>

        {/* Nav arrows — hidden on mobile */}
        <button
          onClick={goPrev}
          className="hidden sm:flex items-center justify-center p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Попередня новина"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Content area */}
        <div className="flex-1 min-w-0 overflow-hidden relative h-5 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div key={activeIndex} className="absolute inset-0 flex items-center" {...animationProps}>
              {item.slug ? (
                <Link
                  to={`/articles/${item.slug}`}
                  className="font-mono text-xs text-foreground/80 hover:text-primary transition-colors truncate"
                >
                  {item.text}
                </Link>
              ) : (
                <span className="font-mono text-xs text-foreground/80 truncate">{item.text}</span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav arrows — hidden on mobile */}
        <button
          onClick={goNext}
          className="hidden sm:flex items-center justify-center p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Наступна новина"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1">
          {TICKER_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full transition-colors ${
                i === activeIndex ? "bg-primary" : "bg-border hover:bg-muted-foreground/50"
              }`}
              aria-label={`Новина ${i + 1}`}
            />
          ))}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => {
            setDismissed(true);
            sessionStorage.setItem("ticker-dismissed", "true");
          }}
          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground ml-1"
          aria-label="Закрити стрічку"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
