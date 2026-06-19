// Маркетингові бенчмарки: CPC, CPM, CPL, CAC, конверсії
// Джерела: WordStream Global (2025 H2), Meta Ads Manager benchmarks, локальні агентства (Netpeak/Promodo) + поправка на UA-ринок
// Курс ₴/$ для перерахунку: 42.0 (середній прогноз 2026)
export const MKT_AS_OF = "2026-01-15";
export const MKT_FX_USD = 42.0;

export type AdChannel =
  | "google_search"
  | "google_display"
  | "meta_facebook"
  | "meta_instagram"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "seo_organic"
  | "email";

export const CHANNEL_LABEL: Record<AdChannel, string> = {
  google_search: "Google Search",
  google_display: "Google Display (GDN)",
  meta_facebook: "Facebook Ads",
  meta_instagram: "Instagram Ads",
  tiktok: "TikTok Ads",
  youtube: "YouTube Ads",
  linkedin: "LinkedIn Ads",
  seo_organic: "SEO (органіка)",
  email: "Email-маркетинг",
};

export type IndustryNiche =
  | "ecommerce"
  | "saas_b2b"
  | "fintech"
  | "education"
  | "real_estate"
  | "auto"
  | "health"
  | "legal"
  | "hr_recruiting"
  | "travel";

export const NICHE_LABEL: Record<IndustryNiche, string> = {
  ecommerce: "E-commerce",
  saas_b2b: "SaaS / B2B",
  fintech: "Fintech",
  education: "Освіта / EdTech",
  real_estate: "Нерухомість",
  auto: "Автомобільний",
  health: "Медицина / Wellness",
  legal: "Юридичні послуги",
  hr_recruiting: "HR / Рекрутинг",
  travel: "Туризм",
};

export interface ChannelBenchmark {
  channel: AdChannel;
  niche: IndustryNiche;
  cpcUah: number;   // ціна за клік, ₴
  cpmUah: number;   // ціна за 1000 показів, ₴
  ctrPct: number;   // %
  cplUah: number;   // ціна ліда, ₴
  cvrPct: number;   // % конверсії з кліку в лід
  note?: string;
}

const usd = (v: number) => Math.round(v * MKT_FX_USD);

export const CHANNEL_BENCHMARKS: ChannelBenchmark[] = [
  // ─── Google Search ───
  { channel: "google_search", niche: "ecommerce",   cpcUah: usd(0.88), cpmUah: usd(38), ctrPct: 2.9, cplUah: usd(38),  cvrPct: 2.3 },
  { channel: "google_search", niche: "saas_b2b",    cpcUah: usd(3.80), cpmUah: usd(95), ctrPct: 3.8, cplUah: usd(108), cvrPct: 3.5 },
  { channel: "google_search", niche: "fintech",     cpcUah: usd(3.44), cpmUah: usd(88), ctrPct: 4.2, cplUah: usd(83),  cvrPct: 4.1 },
  { channel: "google_search", niche: "education",   cpcUah: usd(2.40), cpmUah: usd(58), ctrPct: 4.1, cplUah: usd(54),  cvrPct: 4.4 },
  { channel: "google_search", niche: "real_estate", cpcUah: usd(1.81), cpmUah: usd(52), ctrPct: 3.5, cplUah: usd(95),  cvrPct: 1.9 },
  { channel: "google_search", niche: "auto",        cpcUah: usd(2.46), cpmUah: usd(64), ctrPct: 4.0, cplUah: usd(48),  cvrPct: 5.1 },
  { channel: "google_search", niche: "health",      cpcUah: usd(2.62), cpmUah: usd(68), ctrPct: 3.3, cplUah: usd(72),  cvrPct: 3.6 },
  { channel: "google_search", niche: "legal",       cpcUah: usd(6.75), cpmUah: usd(125),ctrPct: 4.4, cplUah: usd(112), cvrPct: 6.0 },
  { channel: "google_search", niche: "hr_recruiting", cpcUah: usd(2.00), cpmUah: usd(45), ctrPct: 2.4, cplUah: usd(80), cvrPct: 2.5 },
  { channel: "google_search", niche: "travel",      cpcUah: usd(1.53), cpmUah: usd(44), ctrPct: 4.7, cplUah: usd(45),  cvrPct: 3.4 },

  // ─── Meta (Facebook + Instagram спільно) ───
  { channel: "meta_facebook", niche: "ecommerce",   cpcUah: usd(0.45), cpmUah: usd(7.2),ctrPct: 1.6, cplUah: usd(22),  cvrPct: 2.0 },
  { channel: "meta_facebook", niche: "saas_b2b",    cpcUah: usd(1.85), cpmUah: usd(18), ctrPct: 1.0, cplUah: usd(58),  cvrPct: 3.2 },
  { channel: "meta_facebook", niche: "fintech",     cpcUah: usd(1.62), cpmUah: usd(16), ctrPct: 1.0, cplUah: usd(42),  cvrPct: 3.8 },
  { channel: "meta_facebook", niche: "education",   cpcUah: usd(1.05), cpmUah: usd(11), ctrPct: 1.0, cplUah: usd(28),  cvrPct: 3.7 },
  { channel: "meta_facebook", niche: "real_estate", cpcUah: usd(1.20), cpmUah: usd(13), ctrPct: 1.1, cplUah: usd(35),  cvrPct: 3.4 },
  { channel: "meta_facebook", niche: "auto",        cpcUah: usd(0.92), cpmUah: usd(9.4),ctrPct: 1.0, cplUah: usd(26),  cvrPct: 3.5 },
  { channel: "meta_facebook", niche: "health",      cpcUah: usd(1.34), cpmUah: usd(14), ctrPct: 1.0, cplUah: usd(38),  cvrPct: 3.5 },
  { channel: "meta_facebook", niche: "legal",       cpcUah: usd(1.74), cpmUah: usd(17), ctrPct: 1.0, cplUah: usd(54),  cvrPct: 3.2 },
  { channel: "meta_facebook", niche: "travel",      cpcUah: usd(0.63), cpmUah: usd(6.5),ctrPct: 0.9, cplUah: usd(18),  cvrPct: 3.5 },

  // ─── Instagram (специфіка візуал-ніш) ───
  { channel: "meta_instagram", niche: "ecommerce", cpcUah: usd(0.70), cpmUah: usd(11), ctrPct: 1.5, cplUah: usd(28), cvrPct: 2.5 },
  { channel: "meta_instagram", niche: "travel",    cpcUah: usd(0.95), cpmUah: usd(13), ctrPct: 1.4, cplUah: usd(24), cvrPct: 4.0 },
  { channel: "meta_instagram", niche: "health",    cpcUah: usd(1.60), cpmUah: usd(18), ctrPct: 1.1, cplUah: usd(45), cvrPct: 3.6 },

  // ─── TikTok Ads ───
  { channel: "tiktok", niche: "ecommerce", cpcUah: usd(0.50), cpmUah: usd(6.5),ctrPct: 1.3, cplUah: usd(34), cvrPct: 1.5 },
  { channel: "tiktok", niche: "education", cpcUah: usd(0.85), cpmUah: usd(9),  ctrPct: 1.1, cplUah: usd(32), cvrPct: 2.7 },
  { channel: "tiktok", niche: "fintech",   cpcUah: usd(1.20), cpmUah: usd(12), ctrPct: 1.0, cplUah: usd(48), cvrPct: 2.5 },

  // ─── YouTube Ads ───
  { channel: "youtube", niche: "ecommerce", cpcUah: usd(0.42), cpmUah: usd(11), ctrPct: 0.5, cplUah: usd(58), cvrPct: 0.7 },
  { channel: "youtube", niche: "saas_b2b",  cpcUah: usd(0.85), cpmUah: usd(22), ctrPct: 0.5, cplUah: usd(95), cvrPct: 0.9 },
  { channel: "youtube", niche: "education", cpcUah: usd(0.55), cpmUah: usd(14), ctrPct: 0.5, cplUah: usd(45), cvrPct: 1.2 },

  // ─── LinkedIn (тільки B2B) ───
  { channel: "linkedin", niche: "saas_b2b",      cpcUah: usd(7.85), cpmUah: usd(36), ctrPct: 0.6, cplUah: usd(125), cvrPct: 6.3 },
  { channel: "linkedin", niche: "fintech",       cpcUah: usd(8.20), cpmUah: usd(38), ctrPct: 0.5, cplUah: usd(135), cvrPct: 6.1 },
  { channel: "linkedin", niche: "hr_recruiting", cpcUah: usd(6.40), cpmUah: usd(32), ctrPct: 0.7, cplUah: usd(115), cvrPct: 5.6 },

  // ─── SEO / Email (без CPC, але є CPL і CVR) ───
  { channel: "seo_organic", niche: "ecommerce", cpcUah: 0, cpmUah: 0, ctrPct: 0, cplUah: usd(10), cvrPct: 2.9, note: "CPL рахується як вартість контенту + лінкбілдингу ÷ кількість лідів" },
  { channel: "seo_organic", niche: "saas_b2b",  cpcUah: 0, cpmUah: 0, ctrPct: 0, cplUah: usd(28), cvrPct: 4.5, note: "Найкраща LTV з усіх каналів" },
  { channel: "email",       niche: "ecommerce", cpcUah: 0, cpmUah: 0, ctrPct: 2.2,cplUah: usd(2),  cvrPct: 3.0, note: "ROI 36–42x для warm-листів" },
  { channel: "email",       niche: "saas_b2b",  cpcUah: 0, cpmUah: 0, ctrPct: 2.5,cplUah: usd(4),  cvrPct: 4.0 },
];

// CAC / LTV бенчмарки
export interface CacBenchmark {
  niche: IndustryNiche;
  cacUah: number;       // середній CAC по платних каналах
  ltvUah: number;       // LTV (1 рік)
  ltvCacRatio: number;
  paybackMonths: number;
  note?: string;
}

export const CAC_BENCHMARKS: CacBenchmark[] = [
  { niche: "ecommerce",   cacUah: usd(28),  ltvUah: usd(110), ltvCacRatio: 3.9, paybackMonths: 2,  note: "Health-zone 3:1+; 1-st purchase margin ≥ CAC" },
  { niche: "saas_b2b",    cacUah: usd(420), ltvUah: usd(2400),ltvCacRatio: 5.7, paybackMonths: 8,  note: "Target payback ≤ 12 міс." },
  { niche: "fintech",     cacUah: usd(180), ltvUah: usd(950), ltvCacRatio: 5.3, paybackMonths: 10 },
  { niche: "education",   cacUah: usd(85),  ltvUah: usd(380), ltvCacRatio: 4.5, paybackMonths: 4,  note: "Cohort retention ≥ 60% на 6 міс." },
  { niche: "real_estate", cacUah: usd(220), ltvUah: usd(1100),ltvCacRatio: 5.0, paybackMonths: 6 },
  { niche: "health",      cacUah: usd(140), ltvUah: usd(620), ltvCacRatio: 4.4, paybackMonths: 7 },
  { niche: "travel",      cacUah: usd(45),  ltvUah: usd(180), ltvCacRatio: 4.0, paybackMonths: 3 },
  { niche: "legal",       cacUah: usd(280), ltvUah: usd(1400),ltvCacRatio: 5.0, paybackMonths: 9 },
];

// Конверсії на сайті (середні значення з GA4/HubSpot для UA-ринку)
export const SITE_CONVERSIONS = [
  { stage: "Landing → Lead (форма)",     ecommerce: "2.0–3.5%", b2b: "1.5–3.0%" },
  { stage: "Lead → MQL",                  ecommerce: "—",       b2b: "30–45%" },
  { stage: "MQL → SQL",                   ecommerce: "—",       b2b: "20–30%" },
  { stage: "SQL → Customer",              ecommerce: "—",       b2b: "20–25%" },
  { stage: "Cart → Purchase",             ecommerce: "30–45%",  b2b: "—" },
  { stage: "Email open rate",             ecommerce: "20–28%",  b2b: "25–35%" },
  { stage: "Email click rate (CTOR)",     ecommerce: "8–14%",   b2b: "10–18%" },
];
