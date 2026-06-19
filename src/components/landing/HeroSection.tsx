import { useState, useEffect, Fragment, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Link, Brain, CheckCircle, Upload, Calculator, Send, Users, FileText, BarChart3, Activity, Plug, Headphones, LayoutDashboard, ArrowRight, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { heroData, socialProof, heroDataPro, socialProofPro } from "@/config/landingData";
import { PartnerLogos } from "@/components/landing/PartnerLogos";
import { useAudience } from "@/contexts/AudienceContext";
import { useIsMobile } from "@/hooks/use-mobile";


const icons: Record<string, React.ElementType> = { Link, Brain, CheckCircle, Upload, Calculator, Send, BarChart3 };
const metricIcons: Record<string, React.ElementType> = { Users, Activity, Plug, Headphones };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const contentSwap = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/* ── Counter animation hook ── */
const useCounter = (end: number, duration = 1.5, inView: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration, inView]);
  return count;
};

const formatMetricValue = (value: string, inView: boolean) => {
  if (/[^\d\s]/.test(value)) return value;
  const numeric = parseInt(value.replace(/\s/g, ""), 10);
  if (isNaN(numeric)) return value;
  const counted = useCounter(numeric, 1.2, inView);
  return counted.toLocaleString("uk-UA");
};

const UIMockup = ({ audience, data }: { audience: "business" | "individual"; data: typeof heroData["business"] | typeof heroDataPro }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => { setActiveTab(0); }, [audience, data]);

  const tabs = data.mockupTabs;
  const activeMessages = tabs[activeTab]?.messages || [];

  return (
    <div className="relative">
      {/* Glow effect behind card */}
      <div className="absolute -inset-6 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.12),transparent_70%)] blur-2xl pointer-events-none" />

      {/* Floating badges */}
      <motion.div
        className="absolute -top-3 -right-3 z-20 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        AI ✓
      </motion.div>
      <motion.div
        className="absolute -bottom-2 -left-2 z-20 w-3 h-3 rounded-full bg-primary/60 shadow-md"
        animate={{ y: [0, 5, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 -right-4 z-20 w-2 h-2 rounded-full bg-primary/40"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <div
        className="relative transition-transform duration-500 ease-out will-change-transform max-w-full"
        style={{
          transform: isHovered
            ? "perspective(1200px) rotateY(0deg) rotateX(0deg)"
            : isMobile
              ? "none"
              : "perspective(1200px) rotateY(-5deg) rotateX(2deg)",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className="border-border"
          style={{
            boxShadow: "0 4px 6px hsl(var(--primary) / 0.04), 0 12px 24px hsl(var(--primary) / 0.08), 0 32px 64px -12px hsl(var(--primary) / 0.15)",
          }}
        >
        <div className="flex">
          <div role="tablist" aria-label="Розділи кабінету" className="hidden md:flex w-52 flex-col border-r border-border bg-muted/50 p-3 gap-1">
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {audience === "business" ? "Кабінет" : "Мої доходи"}
              </span>
            </div>
            {tabs.map((tab, i) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(i)}
                role="tab"
                aria-selected={i === activeTab}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                  i === activeTab
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> {tab.key}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col">
            {/* Mobile horizontal tabs */}
            <div role="tablist" aria-label="Розділи кабінету" className="flex md:hidden border-b border-border overflow-x-auto gap-1 px-2 py-1.5 bg-muted/30">
              {tabs.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(i)}
                  role="tab"
                  aria-selected={i === activeTab}
                  className={`shrink-0 px-3 py-1.5 text-xs rounded-md transition-colors ${
                    i === activeTab
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tab.key}
                </button>
              ))}
            </div>
            <div className="flex-1 p-5 space-y-3 min-h-[260px] md:min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div key={`${audience}-${activeTab}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
                {activeMessages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.15, duration: 0.35 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            </div>
          </div>
        </div>
        </Card>
      </div>
    </div>
  );
};


/* ── Metric card with staggered animation ── */
const MetricCard = ({ s, index, inView }: { s: { value: string; label: string; icon: string }; index: number; inView: boolean }) => {
  const Icon = metricIcons[s.icon] || Users;
  const displayValue = formatMetricValue(s.value, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:gap-2 gap-1 rounded-lg border border-border/60 bg-muted/40 shadow-sm px-2 py-2 sm:px-3 sm:py-2.5"
    >
      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
      <div className="flex flex-col leading-tight">
        <span className="text-sm sm:text-base font-bold leading-tight tabular-nums">{displayValue}</span>
        <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{s.label}</span>
      </div>
    </motion.div>
  );
};

export const HeroSection = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { audience, businessMode } = useAudience();
  const isPro = audience === "business" && businessMode === "pro";
  const data = isPro ? heroDataPro : heroData[audience];
  const proof = isPro ? socialProofPro : socialProof[audience];
  const metricsRef = useRef<HTMLDivElement>(null);
  const metricsInView = useInView(metricsRef, { once: true, margin: "-50px" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPro) {
      navigate(`/learn/certification?email=${encodeURIComponent(email)}`);
      return;
    }
    if (!email) return;
    // Бізнес/Фізособа → безкоштовний Start (без trial), бо free tier вже існує.
    const planParam = audience === "individual" ? "free" : "start";
    navigate(`/checkout?plan=${planParam}&email=${encodeURIComponent(email)}`);
  };

  const modeKey = isPro ? "pro" : audience;

  return (
    <section id="hero" className="hero-gradient-bg pt-3 pb-8 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div variants={container} initial="hidden" animate="show" className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col space-y-4 md:space-y-6">
            <AnimatePresence mode="wait">
              <motion.div key={modeKey} {...contentSwap} className="space-y-4 md:space-y-6 order-1">
                <Badge variant="secondary" size="lg">{data.badge}</Badge>

                <h1 className="text-[1.75rem] leading-tight md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                  {data.headline}
                  <span className="bg-gradient-to-r from-primary via-info to-[hsl(190_80%_50%)] bg-clip-text text-transparent">
                    {data.headlineAccent}
                  </span>
                </h1>

                <p className="text-base md:hidden text-muted-foreground leading-snug">{(data as any).subtitleShort || data.subtitle}</p>
                <p className="hidden md:block text-lg text-muted-foreground leading-relaxed">{data.subtitle}</p>
              </motion.div>
            </AnimatePresence>

            <motion.div variants={item} className="order-2 md:order-3 border-t border-border/50 pt-4 md:pt-6 space-y-3">
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <Input id="hero-email" type="email" placeholder="ваш@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 flex-1 min-w-0" required aria-label="Ваш email для реєстрації" />
                <Button type="submit" size="lg" className="h-12 whitespace-nowrap">
                  {isPro ? "Стати партнером — безкоштовно →" : "Почати безкоштовно →"}
                </Button>
              </form>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-medium">
                {isPro ? (
                  <>
                    <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" />Сертифікація 0 ₴</span>
                    <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" />Без комісії з гонорару</span>
                    <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" />Reseller −25/30/35% для клієнтів</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" />Без картки</span>
                    <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" />Повний функціонал</span>
                    <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" />Скасувати будь-коли</span>
                  </>
                )}
              </div>
              {audience === "business" && !isPro && (
                <button type="button" onClick={() => navigate("/partners")} className="text-xs text-primary hover:underline font-medium">
                  Ви бухгалтер? Долучайтесь як партнер FINTODO →
                </button>
              )}
              {isPro && (
                <button type="button" onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground">
                  ← Ви власник бізнесу? Дивіться FINTODO для власників
                </button>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div key={`promises-${modeKey}`} {...contentSwap} className="order-3 md:order-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {data.promises.map((p, i) => {
                    const Icon = icons[p.icon] || CheckCircle;
                    return (
                      <div key={p.title} className="flex items-start gap-2.5 bg-card shadow-sm rounded-xl px-4 py-2.5 md:py-3 border border-border/60 min-h-[60px] md:min-h-[72px]">
                        <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold">{p.title}</div>
                          <div className="text-xs text-muted-foreground">{p.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div variants={item} className="lg:pl-4 max-w-full overflow-visible">
            <UIMockup audience={audience} data={data} />
          </motion.div>
        </motion.div>

        <div ref={metricsRef} className="mt-8 md:mt-10 space-y-2">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {proof.map((s, i) => (
              <MetricCard key={s.label} s={s} index={i} inView={metricsInView} />
            ))}
          </div>
        </div>

        <motion.div variants={item} initial="hidden" animate="show" className="mt-6">
          <PartnerLogos />
        </motion.div>
      </div>
    </section>
  );
};

