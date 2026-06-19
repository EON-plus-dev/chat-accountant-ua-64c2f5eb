import type { Plugin } from "vite";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { stripMarkdownNode, createMetaDescriptionNode, renderMarkdownNode, preprocessConsultationContentNode } from "./prerender-utils";

const BASE_URL = "https://fintodo.com.ua";

/**
 * Vite plugin that generates static HTML files for each consultation page
 * at build time (closeBundle hook). This ensures LLM bots, social media
 * scrapers, and search engines see full content without executing JS.
 */
export function consultationPrerender(): Plugin {
  return {
    name: "consultation-prerender",
    apply: "build",

    async closeBundle() {
      const distDir = resolve(process.cwd(), "dist");
      let indexHtml: string;

      try {
        indexHtml = readFileSync(join(distDir, "index.html"), "utf-8");
      } catch {
        console.warn("[consultation-prerender] dist/index.html not found, skipping.");
        return;
      }

      // Dynamic import of consultation data (compiled TS → JS via Vite)
      let consultations: Array<{
        question: string;
        answer: string;
        slug: string;
        date: string;
        updatedDate?: string;
        audience: string;
        tags: string[];
        seoTitle?: string;
        seoDescription?: string;
        seoKeywords?: string;
      }>;

      try {
        // Use glob to find the compiled consultationMockData in dist
        const { glob } = await import("glob");
        const dataFilePath = resolve(process.cwd(), "src/config/consultationMockData.ts");
        const rawTs = readFileSync(dataFilePath, "utf-8");

        // Parse consultations from the TS source directly
        consultations = parseConsultationsFromSource(rawTs);
        // Strip anchor fragments from zakon.rada.gov.ua URLs (same as runtime cleanup)
        for (const c of consultations) {
          c.answer = c.answer.replace(/(\bshow\/[\w-]+)#n\d+/g, '$1');
        }
      } catch (err) {
        console.warn("[consultation-prerender] Failed to load consultation data:", err);
        return;
      }

      console.log(`[consultation-prerender] Generating ${consultations.length} static pages...`);

      for (const item of consultations) {
        const slug = item.slug;
        const canonical = `${BASE_URL}/consultations/${slug}`;
        const hasCustomSeo = !!item.seoTitle;
        const pageTitle = hasCustomSeo
          ? `${item.seoTitle} | FINTODO`
          : `${item.question} | FINTODO`;
        const metaDesc = item.seoDescription || createMetaDescriptionNode(item.answer);
        const isHub = item.answer.split(/\s+/).filter(Boolean).length > 800;
        const processedAnswer = preprocessConsultationContentNode(item.answer, isHub, (item.audience as "business" | "individual") || "business");
        const articleHtml = renderMarkdownNode(processedAnswer);
        const plainAnswer = stripMarkdownNode(item.answer);

        // Use Article schema for entries with custom SEO, QAPage for standard entries
        const mainSchema = hasCustomSeo
          ? JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: item.seoTitle,
              description: metaDesc,
              datePublished: item.date,
              dateModified: item.updatedDate || item.date,
              inLanguage: "uk",
              url: canonical,
              publisher: {
                "@type": "Organization",
                name: "FINTODO",
                url: BASE_URL,
              },
            })
          : JSON.stringify({
              "@context": "https://schema.org",
              "@type": "QAPage",
              url: canonical,
              datePublished: item.date,
              dateModified: item.updatedDate || item.date,
              publisher: {
                "@type": "Organization",
                name: "FINTODO",
                url: BASE_URL,
              },
              mainEntity: {
                "@type": "Question",
                name: item.question,
                dateCreated: item.date,
                ...(item.updatedDate && { dateModified: item.updatedDate }),
                answerCount: 1,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: plainAnswer.slice(0, 500),
                  dateCreated: item.date,
                  ...(item.updatedDate && { dateModified: item.updatedDate }),
                  author: { "@type": "Organization", name: "FINTODO" },
                },
              },
            });

        const breadcrumbSchema = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Головна", item: BASE_URL },
            { "@type": "ListItem", position: 2, name: "Бібліотека", item: `${BASE_URL}/consultations` },
            { "@type": "ListItem", position: 3, name: item.question },
          ],
        });

        // pageTitle already defined above

        // Build the modified HTML
        let html = indexHtml;

        // Replace <title>
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);

        // Replace meta description
        html = html.replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
          `<meta name="description" content="${escapeAttr(metaDesc)}" />`
        );

        // Replace OG tags
        html = html.replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
          `<meta property="og:title" content="${escapeAttr(pageTitle)}" />`
        );
        html = html.replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
          `<meta property="og:description" content="${escapeAttr(metaDesc)}" />`
        );
        html = html.replace(
          /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
          `<meta property="og:type" content="article" />`
        );

        // Replace canonical
        html = html.replace(
          /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
          `<link rel="canonical" href="${canonical}" />`
        );

        // Add article meta tags + JSON-LD before </head>
        const extraHead = `
    <meta property="article:published_time" content="${item.date}" />
    <meta property="article:modified_time" content="${item.updatedDate || item.date}" />
    <meta property="og:locale" content="uk_UA" />
    <meta name="twitter:title" content="${escapeAttr(pageTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(metaDesc)}" />${item.seoKeywords ? `\n    <meta name="keywords" content="${escapeAttr(item.seoKeywords)}" />` : ""}
    <script type="application/ld+json">${mainSchema}</script>
    <script type="application/ld+json">${breadcrumbSchema}</script>`;

        html = html.replace("</head>", `${extraHead}\n  </head>`);

        // Inject article content into <div id="root">
        const staticContent = `<article><h1>${escapeHtml(item.question)}</h1><div>${articleHtml}</div></article>`;
        html = html.replace(
          '<div id="root"></div>',
          `<div id="root">${staticContent}</div>`
        );

        // Write file
        const outDir = join(distDir, "consultations", slug);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, "index.html"), html, "utf-8");
      }

      console.log(`[consultation-prerender] Done! Generated ${consultations.length} pages.`);

      // ── Generate sitemap.xml ──────────────────────────────────
      const staticPages: Array<{ path: string; priority: string; changefreq?: string }> = [
        { path: "/", priority: "1.0", changefreq: "weekly" },
        { path: "/overview", priority: "0.9", changefreq: "weekly" },
        { path: "/consultations", priority: "0.9", changefreq: "weekly" },
        { path: "/consultant", priority: "0.9", changefreq: "weekly" },
        { path: "/analytics", priority: "0.8", changefreq: "weekly" },
        { path: "/dovidnyky", priority: "0.8", changefreq: "weekly" },
        { path: "/dovidnyky/slovnyk", priority: "0.7", changefreq: "monthly" },
        { path: "/dovidnyky/litsenziyi", priority: "0.7", changefreq: "monthly" },
        { path: "/dovidnyky/templates", priority: "0.7", changefreq: "monthly" },
        { path: "/dovidnyky/reestry", priority: "0.7", changefreq: "monthly" },
        { path: "/dovidnyky/stavky", priority: "0.7", changefreq: "monthly" },
        { path: "/dovidnyky/formy-biznesu", priority: "0.7", changefreq: "monthly" },
        { path: "/dovidnyky/accountants", priority: "0.7", changefreq: "monthly" },
        { path: "/dovidnyky/kalendar", priority: "0.7", changefreq: "monthly" },
        { path: "/publications", priority: "0.8", changefreq: "weekly" },
        { path: "/publications/podcasts", priority: "0.7", changefreq: "weekly" },
        { path: "/publications/videos", priority: "0.7", changefreq: "weekly" },
        { path: "/publications/ratings", priority: "0.7", changefreq: "monthly" },
        { path: "/tools", priority: "0.8", changefreq: "monthly" },
        { path: "/learn", priority: "0.8", changefreq: "monthly" },
        { path: "/taxes", priority: "0.8", changefreq: "monthly" },
        { path: "/articles", priority: "0.8", changefreq: "weekly" },
        { path: "/ai-consultations", priority: "0.8", changefreq: "weekly" },
        { path: "/privacy", priority: "0.3" },
        { path: "/terms", priority: "0.3" },
      ];

      const urlEntries: string[] = [];

      for (const sp of staticPages) {
        urlEntries.push(
          `  <url>\n    <loc>${BASE_URL}${sp.path}</loc>\n    <priority>${sp.priority}</priority>${sp.changefreq ? `\n    <changefreq>${sp.changefreq}</changefreq>` : ""}\n  </url>`
        );
      }

      for (const item of consultations) {
        const lastmod = item.updatedDate || item.date;
        urlEntries.push(
          `  <url>\n    <loc>${BASE_URL}/consultations/${item.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>0.8</priority>\n    <changefreq>monthly</changefreq>\n  </url>`
        );
      }

      // ── Dynamic content routes from static data files ──
      try {
        const articlesRaw = readFileSync(resolve(process.cwd(), "src/portal/data/articles.ts"), "utf-8");
        const grantsRaw = readFileSync(resolve(process.cwd(), "src/portal/data/grants.ts"), "utf-8");
        const penaltiesRaw = readFileSync(resolve(process.cwd(), "src/portal/data/penalties.ts"), "utf-8");
        const lawsRaw = readFileSync(resolve(process.cwd(), "src/portal/data/laws.ts"), "utf-8");
        const knowledgeRaw = readFileSync(resolve(process.cwd(), "src/portal/data/knowledge.ts"), "utf-8");
        const kvedRaw = readFileSync(resolve(process.cwd(), "src/portal/data/kved.ts"), "utf-8");
        const learnRaw = readFileSync(resolve(process.cwd(), "src/portal/data/learn.ts"), "utf-8");
        const institutionsRaw = readFileSync(resolve(process.cwd(), "src/portal/data/institutionProfiles.ts"), "utf-8");
        const templatesRaw = readFileSync(resolve(process.cwd(), "src/portal/data/templates.ts"), "utf-8");
        const licensesRaw = readFileSync(resolve(process.cwd(), "src/portal/data/licenses.ts"), "utf-8");
        const registersRaw = readFileSync(resolve(process.cwd(), "src/portal/data/registers.ts"), "utf-8");
        const ratesRaw = readFileSync(resolve(process.cwd(), "src/portal/data/rates.ts"), "utf-8");
        const businessFormsRaw = readFileSync(resolve(process.cwd(), "src/portal/data/businessForms.ts"), "utf-8");
        const accountantsRaw = readFileSync(resolve(process.cwd(), "src/portal/data/accountants.ts"), "utf-8");
        const rankingsRaw = readFileSync(resolve(process.cwd(), "src/portal/data/rankings.ts"), "utf-8");
        const aiConsultationsRaw = readFileSync(resolve(process.cwd(), "src/config/aiConsultationMockData.ts"), "utf-8");

        const extractSlugs = (raw: string): string[] => {
          const matches = [...raw.matchAll(/slug:\s*["']([^"']+)["']/g)];
          return matches.map(m => m[1]);
        };
        const extractCodes = (raw: string): string[] => {
          const matches = [...raw.matchAll(/code:\s*["']([^"']+)["']/g)];
          return matches.map(m => m[1]);
        };

        // Hub pages
        for (const hub of ["/fop", "/personal", "/accounting", "/law", "/wartime"]) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}${hub}</loc>\n    <priority>0.8</priority>\n    <changefreq>weekly</changefreq>\n  </url>`);
        }

        // Articles
        for (const slug of extractSlugs(articlesRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/articles/${slug}</loc>\n    <priority>0.7</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Grants
        for (const slug of extractSlugs(grantsRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/granty/${slug}</loc>\n    <priority>0.6</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Penalties
        for (const slug of extractSlugs(penaltiesRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/shtrafy/${slug}</loc>\n    <priority>0.6</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Laws
        for (const slug of extractSlugs(lawsRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/zakony/${slug}</loc>\n    <priority>0.6</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Knowledge dictionary
        for (const slug of extractSlugs(knowledgeRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/slovnyk/${slug}</loc>\n    <priority>0.5</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // KVED
        for (const code of extractCodes(kvedRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/kved/${code}</loc>\n    <priority>0.5</priority>\n    <changefreq>yearly</changefreq>\n  </url>`);
        }

        // Courses
        for (const slug of extractSlugs(learnRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/learn/${slug}</loc>\n    <priority>0.6</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Institutions
        for (const slug of extractSlugs(institutionsRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/ustanovy/${slug}</loc>\n    <priority>0.5</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Templates
        for (const slug of extractSlugs(templatesRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/templates/${slug}</loc>\n    <priority>0.5</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Licenses
        for (const slug of extractSlugs(licensesRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/litsenziyi/${slug}</loc>\n    <priority>0.5</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Registers
        for (const slug of extractSlugs(registersRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/reestry/${slug}</loc>\n    <priority>0.5</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Rates
        for (const slug of extractSlugs(ratesRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/stavky/${slug}</loc>\n    <priority>0.5</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Business forms
        for (const slug of extractSlugs(businessFormsRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/formy-biznesu/${slug}</loc>\n    <priority>0.5</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Accountants
        for (const slug of extractSlugs(accountantsRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/dovidnyky/accountants/${slug}</loc>\n    <priority>0.5</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // Rankings
        for (const slug of extractSlugs(rankingsRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/publications/ratings/${slug}</loc>\n    <priority>0.6</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        // AI Consultations
        for (const slug of extractSlugs(aiConsultationsRaw)) {
          urlEntries.push(`  <url>\n    <loc>${BASE_URL}/ai-consultations/${slug}</loc>\n    <priority>0.7</priority>\n    <changefreq>monthly</changefreq>\n  </url>`);
        }

        console.log(`[consultation-prerender] Added dynamic content routes to sitemap.`);
      } catch (err) {
        console.warn("[consultation-prerender] Failed to parse some data files for sitemap:", err);
      }

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>\n`;

      writeFileSync(join(distDir, "sitemap.xml"), sitemapXml, "utf-8");
      console.log(`[consultation-prerender] Sitemap generated with ${urlEntries.length} URLs.`);
    },
  };
}

/** Escape HTML for text content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escape for HTML attributes */
function escapeAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Parse consultation data directly from the TypeScript source file.
 * This avoids needing to compile or import the TS file at build time.
 */
function parseConsultationsFromSource(source: string): Array<{
  question: string;
  answer: string;
  slug: string;
  date: string;
  updatedDate?: string;
  audience: string;
  tags: string[];
}> {
  const results: Array<{
    question: string;
    answer: string;
    slug: string;
    date: string;
    updatedDate?: string;
    audience: string;
    tags: string[];
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
  }> = [];

  // Match each object in the array using a regex-based approach
  // Find the array start
  const arrayMatch = source.match(/export\s+const\s+mockConsultations[^=]*=\s*\[/);
  if (!arrayMatch) return results;

  const startIdx = (arrayMatch.index ?? 0) + arrayMatch[0].length;

  // Parse each object by finding balanced braces
  let depth = 0;
  let objStart = -1;

  for (let i = startIdx; i < source.length; i++) {
    if (source[i] === "{") {
      if (depth === 0) objStart = i;
      depth++;
    } else if (source[i] === "}") {
      depth--;
      if (depth === 0 && objStart !== -1) {
        const objStr = source.slice(objStart, i + 1);
        const item = extractFields(objStr);
        if (item) results.push(item);
        objStart = -1;
      }
    } else if (source[i] === "]" && depth === 0) {
      break;
    }
  }

  return results;
}

function extractFields(objStr: string) {
  const getString = (key: string): string | undefined => {
    // Match key: "value" or key: 'value' — handles multiline with \n
    const re = new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"`, "s");
    const match = objStr.match(re);
    if (match) {
      return match[1]
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }
    return undefined;
  };

  const getArray = (key: string): string[] => {
    const re = new RegExp(`${key}:\\s*\\[([^\\]]*?)\\]`);
    const match = objStr.match(re);
    if (!match) return [];
    return match[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  };

  const question = getString("question");
  const answer = getString("answer");
  const slug = getString("slug");
  const date = getString("date");
  const audience = getString("audience");
  const tags = getArray("tags");

  if (!question || !answer || !slug || !date || !audience) return null;

  return {
    question,
    answer,
    slug,
    date,
    updatedDate: getString("updatedDate"),
    audience,
    tags,
    seoTitle: getString("seoTitle"),
    seoDescription: getString("seoDescription"),
    seoKeywords: getString("seoKeywords"),
  };
}
