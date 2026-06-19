// Composite React mockups simulating the FINTODO cabinet UI.
// Used as "product on screen" across /os marketing pages.
// Pure presentation: no real data, no hooks.

import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, Wallet, AlertCircle, ArrowUpRight, ArrowDownRight,
  Calendar, CheckCircle2, Clock, FileSignature, Receipt, Users, MessageSquare,
  BarChart3, Activity, ChevronRight,
} from "lucide-react";

/* ----------------------------- Chrome wrapper ----------------------------- */

export const BrowserChrome = ({ children, label = "fintodo.com.ua/dashboard" }: { children: React.ReactNode; label?: string }) => (
  <div className="rounded-xl border border-border/60 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/40">
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
      </div>
      <div className="flex-1 text-center">
        <span className="text-[10px] text-muted-foreground font-mono">{label}</span>
      </div>
      <div className="w-10" />
    </div>
    <div className="bg-background">{children}</div>
  </div>
);

/* --------------------------- Morning Brief mockup --------------------------- */

export const MorningBriefMockup = ({ audience = "business" as "business" | "individual" }) => (
  <BrowserChrome label="fintodo.com.ua/dashboard?cabinet=…">
    <div className="p-5 space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium">Morning Brief</div>
          <div className="text-base font-semibold tracking-tight">Доброго ранку. 4 справи на сьогодні.</div>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">07:32</div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-2">
        {(audience === "business"
          ? [
              { label: "Виторг учора", v: "₴ 47 320", d: "+18%", up: true },
              { label: "На рахунках", v: "₴ 247 320", d: "+₴ 12 400", up: true },
              { label: "До сплати ЄП", v: "19 квіт", d: "за 3 дні", up: false },
            ]
          : [
              { label: "Бюджет квітня", v: "73%", d: "у плані", up: true },
              { label: "Найближчий платіж", v: "22 квіт", d: "Іпотека", up: false },
              { label: "Знижка ПДФО", v: "₴ 4 200", d: "до отримання", up: true },
            ]
        ).map((k) => (
          <div key={k.label} className="rounded-md border border-border/40 p-2.5">
            <div className="text-[10px] text-muted-foreground mb-0.5">{k.label}</div>
            <div className="font-semibold tabular-nums">{k.v}</div>
            <div className={`text-[10px] flex items-center gap-0.5 mt-0.5 ${k.up ? "text-emerald-600" : "text-amber-600"}`}>
              {k.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
              {k.d}
            </div>
          </div>
        ))}
      </div>

      {/* AI recommendation */}
      <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary mb-1.5 font-medium">
          <Sparkles className="w-3 h-3" /> AI-директор · 1 рекомендація
        </div>
        <p className="text-[13px] leading-snug">
          {audience === "business"
            ? "Попит на топ-3 послуги стабільний 6 тижнів. Підняття ціни на 8% дасть +₴ 14 000/міс без втрати потоку."
            : "Подайте податкову знижку за навчання дитини — повернете 4 200 ₴ ПДФО до 31 грудня."}
        </p>
      </div>

      {/* Today's list */}
      <div className="space-y-1.5">
        {(audience === "business"
          ? [
              { t: "Підписати акт із Atlas Logistic", meta: "₴ 24 000 · КЕП", icon: FileSignature },
              { t: "Лист від ДПС: запит даних за Q1", meta: "Відповідь до 21 квіт", icon: AlertCircle },
              { t: "Сплатити ЄП за березень", meta: "₴ 1 690 · через ПриватБанк", icon: Wallet },
              { t: "Зарплата майстрам: 7 виплат", meta: "Чернетка готова", icon: Users },
            ]
          : [
              { t: "Підписати договір оренди", meta: "Дія.Підпис", icon: FileSignature },
              { t: "Платіж по іпотеці", meta: "₴ 14 200 · 22 квіт", icon: Wallet },
              { t: "Чек із Епіцентр — на повернення", meta: "₴ 1 240 · 14 днів", icon: Receipt },
              { t: "Декларація: 3 кроки залишилось", meta: "5 хв · знижка 4 200 ₴", icon: CheckCircle2 },
            ]
        ).map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.t} className="flex items-center gap-2.5 py-1.5 border-b border-border/20 last:border-0">
              <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] truncate">{row.t}</div>
                <div className="text-[10px] text-muted-foreground truncate">{row.meta}</div>
              </div>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </div>
          );
        })}
      </div>
    </div>
  </BrowserChrome>
);

/* ---------------------------- Payments mockup ---------------------------- */

export const PaymentsMockup = ({ audience = "business" as "business" | "individual" }) => (
  <BrowserChrome label="fintodo.com.ua/payments">
    <div className="p-5 space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium">Платежі</div>
          <div className="text-base font-semibold tracking-tight">Грошовий потік · квітень</div>
        </div>
        <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
          <Activity className="w-2.5 h-2.5" /> live
        </div>
      </div>

      {/* fake chart */}
      <div className="h-24 rounded-md border border-border/40 bg-gradient-to-b from-primary/10 to-transparent p-2 relative overflow-hidden">
        <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="cf" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,55 L20,48 L40,52 L60,40 L80,42 L100,32 L120,38 L140,25 L160,30 L180,22 L200,28 L220,18 L240,24 L260,15 L280,20 L300,12 L300,80 L0,80 Z"
            fill="url(#cf)"
          />
          <path
            d="M0,55 L20,48 L40,52 L60,40 L80,42 L100,32 L120,38 L140,25 L160,30 L180,22 L200,28 L220,18 L240,24 L260,15 L280,20 L300,12"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
        <div className="absolute top-2 right-2 text-[10px] text-muted-foreground">+₴ 247K</div>
      </div>

      {/* recent rows */}
      <div className="space-y-1">
        {(audience === "business"
          ? [
              { d: "сьогодні · 11:42", from: "ТОВ «Альфа Пак»", note: "Оплата за акт №47", v: "+₴ 24 000", inc: true },
              { d: "сьогодні · 10:15", from: "ПРРО Pro Shop", note: "Касовий звіт", v: "+₴ 8 420", inc: true },
              { d: "вчора · 18:00", from: "ФОП Кравченко", note: "Виплата майстру", v: "−₴ 12 800", inc: false },
              { d: "вчора · 09:30", from: "ДПС України", note: "ЄП за березень", v: "−₴ 1 690", inc: false },
              { d: "16 квіт · 14:22", from: "Stripe", note: "Виплата за послуги", v: "+€ 1 200", inc: true },
            ]
          : [
              { d: "сьогодні · 13:02", from: "Upwork Inc", note: "Гонорар, USD→UAH", v: "+₴ 38 400", inc: true },
              { d: "сьогодні · 09:12", from: "Сільпо", note: "Покупки", v: "−₴ 1 280", inc: false },
              { d: "вчора · 21:00", from: "Київстар", note: "Підписка", v: "−₴ 250", inc: false },
              { d: "вчора · 14:30", from: "Дружина", note: "Розподіл бюджету", v: "+₴ 4 000", inc: true },
              { d: "15 квіт", from: "ОСББ «Кварц»", note: "Платіж за квартиру", v: "−₴ 2 840", inc: false },
            ]
        ).map((r) => (
          <div key={r.d + r.from} className="flex items-center gap-3 py-1.5 border-b border-border/20 last:border-0">
            <div className="text-[10px] text-muted-foreground w-20 flex-shrink-0 font-mono">{r.d}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] truncate font-medium">{r.from}</div>
              <div className="text-[10px] text-muted-foreground truncate">{r.note}</div>
            </div>
            <div className={`text-[12px] font-mono tabular-nums ${r.inc ? "text-emerald-600" : "text-foreground"}`}>{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  </BrowserChrome>
);

/* ------------------------------- AI Chat mockup ------------------------------- */

export const AiChatMockup = ({ audience = "business" as "business" | "individual" }) => (
  <BrowserChrome label="fintodo.com.ua/ai">
    <div className="p-5 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <div className="text-[13px] font-semibold">{audience === "business" ? "AI-директор" : "AI-помічник"}</div>
            <div className="text-[10px] text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> читає ваші дані
            </div>
          </div>
        </div>
        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      <div className="space-y-2.5">
        {/* user */}
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3 py-2 text-[12px]">
          {audience === "business"
            ? "Покажи топ-5 клієнтів за виторгом у Q1 і скільки з них досі не підписали акти"
            : "Скільки я витратив на дітей цьогоріч і що з цього я можу включити в податкову знижку?"}
        </div>

        {/* ai */}
        <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5 space-y-2 text-[12px]">
          <p>
            {audience === "business"
              ? "У Q1 топ-5 клієнтів дали ₴ 487 200 (62% виторгу). Без підписаних актів — 2 із 5, на загальну суму ₴ 84 000."
              : "За рік ви витратили ₴ 76 400 на дітей. До податкової знижки можна включити ₴ 24 200 (навчання + лікування) — це поверне ₴ 4 356 ПДФО."}
          </p>
          <div className="rounded-md border border-border/60 bg-background p-2 space-y-1">
            {(audience === "business"
              ? [
                  { k: "Atlas Logistic", v: "₴ 142 000", warn: false },
                  { k: "ТОВ «Альфа Пак»", v: "₴ 118 400", warn: true },
                  { k: "ФОП Гриценко", v: "₴ 96 800", warn: false },
                  { k: "Diia Marketing", v: "₴ 78 000", warn: true },
                  { k: "Estate Lviv", v: "₴ 52 000", warn: false },
                ]
              : [
                  { k: "Навчання · школа", v: "₴ 18 400", warn: false },
                  { k: "Лікування · стоматологія", v: "₴ 5 800", warn: false },
                  { k: "Гуртки · музика, спорт", v: "₴ 32 200", warn: true },
                  { k: "Одяг та інше", v: "₴ 20 000", warn: true },
                ]
            ).map((r) => (
              <div key={r.k} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5">
                  {r.warn && <AlertCircle className="w-2.5 h-2.5 text-amber-500" />}
                  {r.k}
                </span>
                <span className="font-mono tabular-nums">{r.v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 pt-1">
            <button className="text-[10px] px-2 py-1 rounded-md border border-border/60 hover:bg-background">
              {audience === "business" ? "Надіслати нагадування" : "Згенерувати декларацію"}
            </button>
            <button className="text-[10px] px-2 py-1 rounded-md border border-border/60 hover:bg-background">Деталі</button>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border/40 px-3 py-2 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Спитайте словами…</span>
        <span className="font-mono text-[9px]">⌘K</span>
      </div>
    </div>
  </BrowserChrome>
);

/* ------------------------- Hero rotation: 3 mockups ------------------------- */

export const HeroMockupRotation = ({ audience }: { audience: "business" | "individual" }) => {
  const slides = [
    <MorningBriefMockup key="m" audience={audience} />,
    <PaymentsMockup key="p" audience={audience} />,
    <AiChatMockup key="a" audience={audience} />,
  ];
  return (
    <div className="relative">
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <HeroSlideshow slides={slides} />
      </motion.div>
      {/* glow */}
      <div className="absolute -inset-8 -z-10 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 blur-3xl" />
    </div>
  );
};

const HeroSlideshow = ({ slides }: { slides: React.ReactNode[] }) => {
  // simple CSS cycle via key-rotation
  // (lightweight: opacity cross-fade using framer)
  return (
    <div className="relative">
      {slides.map((s, i) => (
        <motion.div
          key={i}
          className={i === 0 ? "" : "absolute inset-0"}
          initial={{ opacity: i === 0 ? 1 : 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{
            duration: slides.length * 4,
            times: [
              (i) / slides.length - 0.05,
              (i) / slides.length,
              (i + 1) / slides.length - 0.05,
              (i + 1) / slides.length,
            ].map((t) => Math.max(0, Math.min(1, t))),
            repeat: Infinity,
            delay: i === 0 ? 0 : 0,
          }}
        >
          {s}
        </motion.div>
      ))}
    </div>
  );
};

/* --------------------------- Bento module tiles --------------------------- */

export const BentoFinanceTile = () => (
  <div className="h-full p-5 flex flex-col justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">Фінанси</div>
      <div className="text-lg font-semibold tracking-tight">Кеш-флоу у реальному часі</div>
    </div>
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-semibold tabular-nums">₴ 247 320</span>
        <span className="text-xs text-emerald-600 flex items-center gap-0.5">
          <TrendingUp className="w-3 h-3" /> +18%
        </span>
      </div>
      <svg viewBox="0 0 200 40" className="w-full h-10" preserveAspectRatio="none">
        <path
          d="M0,30 L20,28 L40,32 L60,22 L80,25 L100,18 L120,20 L140,12 L160,15 L180,8 L200,10"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0,30 L20,28 L40,32 L60,22 L80,25 L100,18 L120,20 L140,12 L160,15 L180,8 L200,10 L200,40 L0,40 Z"
          fill="hsl(var(--primary) / 0.15)"
        />
      </svg>
    </div>
  </div>
);

export const BentoBookingsTile = () => (
  <div className="h-full p-5 flex flex-col justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">Бронювання</div>
      <div className="text-lg font-semibold tracking-tight">Один календар на всіх</div>
    </div>
    <div className="space-y-1.5 text-[11px]">
      {[
        { t: "10:00", n: "Олена К. · стрижка", m: "Анна" },
        { t: "11:30", n: "Олег П. · корт #4", m: "1 год" },
        { t: "14:00", n: "Сімʼя Іщенко · номер №203", m: "2 ночі" },
      ].map((r) => (
        <div key={r.n} className="flex items-center gap-2 rounded border border-border/40 px-2 py-1.5 bg-card">
          <span className="font-mono text-[10px] w-10 text-primary">{r.t}</span>
          <span className="flex-1 truncate">{r.n}</span>
          <span className="text-muted-foreground text-[10px]">{r.m}</span>
        </div>
      ))}
    </div>
  </div>
);

export const BentoDocsTile = () => (
  <div className="h-full p-5 flex flex-col justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">Документи</div>
      <div className="text-lg font-semibold tracking-tight">КЕП + Дія в одному хабі</div>
    </div>
    <div className="space-y-1.5">
      {[
        { t: "Акт №47 · Atlas", s: "Підписано", ok: true },
        { t: "Договір оренди", s: "Очікує підпису", ok: false },
        { t: "Декларація 2025", s: "Чернетка", ok: false },
      ].map((d) => (
        <div key={d.t} className="flex items-center gap-2 text-[11px]">
          <FileSignature className={`w-3 h-3 ${d.ok ? "text-emerald-600" : "text-muted-foreground"}`} />
          <span className="flex-1 truncate">{d.t}</span>
          <span className={`text-[10px] ${d.ok ? "text-emerald-600" : "text-amber-600"}`}>{d.s}</span>
        </div>
      ))}
    </div>
  </div>
);

export const BentoTaxTile = () => (
  <div className="h-full p-5 flex flex-col justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">Податки</div>
      <div className="text-lg font-semibold tracking-tight">Без сюрпризів від ДПС</div>
    </div>
    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
      {[
        { k: "ЄП", v: "₴ 1 690", c: "19 квіт" },
        { k: "ПДВ", v: "₴ 8 400", c: "20 квіт" },
        { k: "ЄСВ", v: "₴ 1 760", c: "19 квіт" },
      ].map((t) => (
        <div key={t.k} className="rounded border border-border/40 p-1.5 text-center bg-card">
          <div className="text-[9px] text-muted-foreground">{t.k}</div>
          <div className="font-semibold tabular-nums">{t.v}</div>
          <div className="text-[9px] text-amber-600">{t.c}</div>
        </div>
      ))}
    </div>
  </div>
);

export const BentoCrmTile = () => (
  <div className="h-full p-5 flex flex-col justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">CRM</div>
      <div className="text-lg font-semibold tracking-tight">Воронка зі справжніми грошима</div>
    </div>
    <div className="flex gap-1.5 text-[10px]">
      {[
        { s: "Lead", n: 14, v: "₴ 0" },
        { s: "Quote", n: 7, v: "₴ 240K" },
        { s: "Won", n: 4, v: "₴ 178K" },
      ].map((c, i) => (
        <div key={c.s} className={`flex-1 rounded p-2 ${i === 2 ? "bg-primary/10 border border-primary/30" : "border border-border/40 bg-card"}`}>
          <div className="text-muted-foreground">{c.s}</div>
          <div className="font-semibold text-[13px]">{c.n}</div>
          <div className="text-[9px] font-mono">{c.v}</div>
        </div>
      ))}
    </div>
  </div>
);

export const BentoTasksTile = () => (
  <div className="h-full p-5 flex flex-col justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">Справи</div>
      <div className="text-lg font-semibold tracking-tight">Каденції + AI-нагадування</div>
    </div>
    <div className="space-y-1">
      {[
        { t: "Зателефонувати Atlas", d: "Сьогодні", ok: true },
        { t: "Запит у банк по випискам", d: "Завтра", ok: false },
        { t: "Підготувати акт", d: "21 квіт", ok: false },
      ].map((r) => (
        <div key={r.t} className="flex items-center gap-2 text-[11px]">
          <span className={`w-3 h-3 rounded-full border ${r.ok ? "bg-primary border-primary" : "border-border"}`} />
          <span className={`flex-1 truncate ${r.ok ? "line-through text-muted-foreground" : ""}`}>{r.t}</span>
          <span className="text-[10px] text-muted-foreground">{r.d}</span>
        </div>
      ))}
    </div>
  </div>
);

export const BentoOrdersTile = () => (
  <div className="h-full p-5 flex flex-col justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">Замовлення</div>
      <div className="text-lg font-semibold tracking-tight">Sales · Purchases · Returns</div>
    </div>
    <div className="space-y-1">
      {[
        { t: "Order #2847", d: "₴ 8 400 · ✓ shipped" },
        { t: "Purchase #114", d: "$ 1 200 · in transit" },
        { t: "Return #59", d: "−₴ 1 240" },
      ].map((r) => (
        <div key={r.t} className="flex items-center justify-between text-[11px] py-1 border-b border-border/20 last:border-0">
          <span className="font-medium">{r.t}</span>
          <span className="text-muted-foreground text-[10px]">{r.d}</span>
        </div>
      ))}
    </div>
  </div>
);

export const BentoContactsTile = () => (
  <div className="h-full p-5 flex flex-col justify-between">
    <div>
      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-1">Контакти</div>
      <div className="text-lg font-semibold tracking-tight">Люди з історією</div>
    </div>
    <div className="space-y-1.5">
      {[
        { n: "Atlas Logistic", l: "12 угод · ₴ 487K" },
        { n: "Beauty Group", l: "8 платежів · ₴ 240K" },
        { n: "Estate Lviv", l: "4 договори" },
      ].map((c) => (
        <div key={c.n} className="flex items-center gap-2 text-[11px]">
          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[9px] font-semibold flex items-center justify-center">
            {c.n[0]}
          </span>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium">{c.n}</div>
            <div className="text-[10px] text-muted-foreground truncate">{c.l}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ----------------------------- Pain visuals ----------------------------- */

export const PainExcel = () => (
  <div className="aspect-[4/3] rounded-lg border border-border/40 bg-gradient-to-br from-muted/60 to-muted/20 p-3 overflow-hidden">
    <div className="flex gap-1 mb-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-t bg-card border-x border-t border-border/40 text-muted-foreground">
          Лист{i + 1}
        </span>
      ))}
      <span className="text-[8px] px-1.5 py-0.5 text-muted-foreground">+47</span>
    </div>
    <div className="grid grid-cols-6 gap-px text-[8px] bg-border/40">
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className="bg-card px-1 py-0.5 truncate text-muted-foreground/70">
          {["₴1240", "Іванов", "12.04", "акт", "?", "—"][i % 6]}
        </div>
      ))}
    </div>
    <div className="mt-2 flex items-center gap-1 text-[9px] text-rose-500">
      <AlertCircle className="w-3 h-3" /> #REF! у 14 клітинках
    </div>
  </div>
);

export const PainTabs = () => (
  <div className="aspect-[4/3] rounded-lg border border-border/40 bg-card p-3 overflow-hidden">
    <div className="flex gap-1 mb-3 overflow-hidden">
      {["1C", "monobank", "Privat24", "ПРРО", "Bitrix24", "Bookly", "Gmail"].map((t) => (
        <span key={t} className="text-[9px] px-2 py-1 rounded-t border-x border-t border-border/40 bg-muted/40 truncate flex-shrink-0 max-w-[60px]">
          {t}
        </span>
      ))}
    </div>
    <div className="space-y-1.5">
      {[
        { l: "Звідки прийшли 12 400 ₴?", c: "rose" },
        { l: "Чий акт на 8 200?", c: "rose" },
        { l: "Ця оплата вже відображена?", c: "amber" },
        { l: "Хто закрив тікет клієнта?", c: "amber" },
        { l: "Виплатили майстру вчора?", c: "rose" },
      ].map((q) => (
        <div key={q.l} className={`text-[10px] px-2 py-1.5 rounded border ${q.c === "rose" ? "border-rose-500/30 bg-rose-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
          {q.l}
        </div>
      ))}
    </div>
  </div>
);

export const PainChat = () => (
  <div className="aspect-[4/3] rounded-lg border border-border/40 bg-card p-3 overflow-hidden">
    <div className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1.5">
      <MessageSquare className="w-3 h-3" /> Бухгалтер · Telegram
    </div>
    <div className="space-y-1.5">
      {[
        { me: false, t: "Скиньте виписку за квітень" },
        { me: true, t: "Зараз... десь була в пошті" },
        { me: false, t: "І акт від Atlas — підписаний?" },
        { me: true, t: "Не знаю, треба запитати юриста" },
        { me: false, t: "Дедлайн був вчора 😐" },
      ].map((m, i) => (
        <div key={i} className={`max-w-[80%] text-[10px] rounded-lg px-2 py-1 ${m.me ? "ml-auto bg-primary/15" : "bg-muted/60"}`}>
          {m.t}
        </div>
      ))}
    </div>
  </div>
);
