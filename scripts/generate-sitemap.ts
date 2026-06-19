/**
 * Generates public/sitemap.xml at predev/prebuild time.
 *
 * Includes:
 *  - Static portal routes (landing, hubs, analytics, publications, tools, learn, etc.)
 *  - Dynamic entry pages for every directory:
 *      penalties, laws, kved, grants, licenses, registers, templates,
 *      businessForms, knowledge (slovnyk).
 *
 * BASE_URL = production domain (fintodo.com.ua).
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

import { PENALTIES } from "../src/portal/data/penalties";
import { LAWS } from "../src/portal/data/laws";
import { KVED_ENTRIES } from "../src/portal/data/kved";
import { GRANTS } from "../src/portal/data/grants";
import { LICENSES } from "../src/portal/data/licenses";
import { REGISTERS } from "../src/portal/data/registers";
import { TEMPLATES } from "../src/portal/data/templates";
import { BUSINESS_FORMS } from "../src/portal/data/businessForms";
import { KNOWLEDGE } from "../src/portal/data/knowledge";

const BASE_URL = "https://fintodo.com.ua";
const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// ── Static routes (only public, indexable) ───────────────────────────────────
const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/individuals", changefreq: "weekly", priority: "0.9" },
  { path: "/partners", changefreq: "weekly", priority: "0.8" },
  { path: "/partners/program", changefreq: "monthly", priority: "0.7" },
  { path: "/overview", changefreq: "daily", priority: "0.9" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },

  // Hubs
  { path: "/taxes", changefreq: "weekly", priority: "0.8" },
  { path: "/fop", changefreq: "weekly", priority: "0.8" },
  { path: "/personal", changefreq: "weekly", priority: "0.8" },
  { path: "/wartime", changefreq: "weekly", priority: "0.7" },
  { path: "/accounting", changefreq: "weekly", priority: "0.7" },
  { path: "/law", changefreq: "weekly", priority: "0.7" },

  // Analytics
  { path: "/analytics", changefreq: "daily", priority: "0.9" },
  { path: "/analytics/currency", changefreq: "daily", priority: "0.8" },
  { path: "/analytics/deposits", changefreq: "weekly", priority: "0.7" },
  { path: "/analytics/cards", changefreq: "weekly", priority: "0.7" },
  { path: "/analytics/insurance", changefreq: "weekly", priority: "0.7" },
  { path: "/analytics/fees", changefreq: "weekly", priority: "0.7" },
  { path: "/analytics/indices", changefreq: "daily", priority: "0.8" },
  { path: "/analytics/labor", changefreq: "weekly", priority: "0.7" },
  { path: "/analytics/mortgage", changefreq: "weekly", priority: "0.7" },
  { path: "/analytics/archive", changefreq: "monthly", priority: "0.6" },

  // Publications
  { path: "/publications", changefreq: "daily", priority: "0.8" },
  { path: "/publications/news", changefreq: "daily", priority: "0.8" },
  { path: "/publications/guides", changefreq: "weekly", priority: "0.7" },
  { path: "/publications/podcasts", changefreq: "weekly", priority: "0.7" },
  { path: "/publications/videos", changefreq: "weekly", priority: "0.7" },
  { path: "/publications/ratings", changefreq: "weekly", priority: "0.7" },
  { path: "/publications/consultations", changefreq: "weekly", priority: "0.7" },
  { path: "/publications/reviews", changefreq: "weekly", priority: "0.7" },

  // Newsletter
  { path: "/newsletter", changefreq: "weekly", priority: "0.7" },

  // Tools
  { path: "/tools", changefreq: "weekly", priority: "0.8" },

  // Learn
  { path: "/learn", changefreq: "weekly", priority: "0.8" },
  { path: "/learn/webinars", changefreq: "weekly", priority: "0.7" },
  { path: "/learn/webinars/archive", changefreq: "monthly", priority: "0.5" },
  { path: "/learn/certification", changefreq: "monthly", priority: "0.6" },

  // AI Consultant
  { path: "/consultant", changefreq: "daily", priority: "0.9" },
  { path: "/consultations", changefreq: "weekly", priority: "0.7" },

  // Directories — root pages
  { path: "/dovidnyky", changefreq: "weekly", priority: "0.8" },
  { path: "/dovidnyky/ustanovy", changefreq: "weekly", priority: "0.8" },
  { path: "/dovidnyky/slovnyk", changefreq: "weekly", priority: "0.7" },
  { path: "/dovidnyky/kved", changefreq: "monthly", priority: "0.7" },
  { path: "/dovidnyky/zakony", changefreq: "weekly", priority: "0.8" },
  { path: "/dovidnyky/granty", changefreq: "weekly", priority: "0.7" },
  { path: "/dovidnyky/penalties", changefreq: "weekly", priority: "0.8" },
  { path: "/dovidnyky/litsenziyi", changefreq: "monthly", priority: "0.7" },
  { path: "/dovidnyky/kalendar", changefreq: "weekly", priority: "0.8" },
  { path: "/dovidnyky/accountants", changefreq: "weekly", priority: "0.7" },
  { path: "/dovidnyky/templates", changefreq: "monthly", priority: "0.7" },
  { path: "/dovidnyky/reestry", changefreq: "monthly", priority: "0.7" },
  { path: "/dovidnyky/stavky", changefreq: "weekly", priority: "0.7" },
  { path: "/dovidnyky/formy-biznesu", changefreq: "monthly", priority: "0.7" },

  // Legal
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

// ── Dynamic directory entries ────────────────────────────────────────────────
const dynamicEntries: SitemapEntry[] = [
  ...PENALTIES.map((p) => ({
    path: `/dovidnyky/penalties/${p.id}`,
    changefreq: "monthly" as const,
    priority: "0.6",
    lastmod: TODAY,
  })),
  ...LAWS.map((l) => ({
    path: `/dovidnyky/zakony/${l.slug}`,
    changefreq: "monthly" as const,
    priority: "0.6",
    lastmod: l.lastAmendedDate || TODAY,
  })),
  ...KVED_ENTRIES.map((k) => ({
    path: `/dovidnyky/kved/${k.code}`,
    changefreq: "monthly" as const,
    priority: "0.5",
  })),
  ...GRANTS.map((g: any) => ({
    path: `/dovidnyky/granty/${g.slug}`,
    changefreq: "weekly" as const,
    priority: "0.6",
  })),
  ...LICENSES.map((l: any) => ({
    path: `/dovidnyky/litsenziyi/${l.slug}`,
    changefreq: "monthly" as const,
    priority: "0.5",
  })),
  ...REGISTERS.map((r: any) => ({
    path: `/dovidnyky/reestry/${r.slug}`,
    changefreq: "monthly" as const,
    priority: "0.5",
  })),
  ...TEMPLATES.map((t: any) => ({
    path: `/dovidnyky/templates/${t.slug}`,
    changefreq: "monthly" as const,
    priority: "0.5",
  })),
  ...BUSINESS_FORMS.map((b: any) => ({
    path: `/dovidnyky/formy-biznesu/${b.slug}`,
    changefreq: "monthly" as const,
    priority: "0.5",
  })),
  ...KNOWLEDGE.map((k: any) => ({
    path: `/dovidnyky/slovnyk/${k.slug}`,
    changefreq: "monthly" as const,
    priority: "0.4",
  })),
];

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const allEntries = [...staticEntries, ...dynamicEntries];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(allEntries));
console.log(`sitemap.xml written (${allEntries.length} entries: ${staticEntries.length} static + ${dynamicEntries.length} dynamic)`);
