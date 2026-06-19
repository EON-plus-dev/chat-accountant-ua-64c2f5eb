const SITE_URL = "https://fintodo.com.ua";

export { SITE_URL };

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getArticleSchema(article: { title: string; excerpt: string; publishedAt: string; updatedAt: string; slug: string }, author: { name: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    url: `${SITE_URL}/articles/${article.slug}`,
    author: {
      "@type": "Person",
      name: author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "FINTODO",
      url: SITE_URL,
    },
  };
}

export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function getDefinedTermSchema(entry: { term: string; shortDefinition: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: entry.term,
    description: entry.shortDefinition,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "fintodo Діловий словник",
      url: `${SITE_URL}/dovidnyky/slovnyk`,
    },
  };
}

export function getReviewSchema(item: { name: string; score: number; fullReview?: { verdict: string }; review?: { fullVerdict: string } }, categoryName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: item.name,
      applicationCategory: categoryName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: item.score,
      bestRating: 100,
      worstRating: 0,
    },
    author: {
      "@type": "Organization",
      name: "FINTODO",
      url: SITE_URL,
    },
    reviewBody: item.review?.fullVerdict || item.fullReview?.verdict || "",
    datePublished: "2025-03-01",
    publisher: {
      "@type": "Organization",
      name: "FINTODO",
      url: SITE_URL,
    },
  };
}

export function getAggregateRatingSchema(item: { name: string }, categoryName: string, reviews: { rating: number }[]) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: item.name,
    applicationCategory: categoryName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Math.round(avg * 10) / 10,
      bestRating: 5,
      worstRating: 1,
      ratingCount: reviews.length,
    },
  };
}

export function getOrganizationSchema(profile: {
  name: string; legalName: string; brandNames: string[]; website: string;
  logo: { color: string }; slug: string;
  company: { foundedYear: number; employeesCount: string };
  contacts: {
    mainOffice: { address: string; city: string; zipCode?: string };
    support: { freePhone?: string };
    social: Record<string, string | undefined>;
  };
  legal: { edrpou: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: profile.name,
    legalName: profile.legalName,
    alternateName: profile.brandNames,
    url: profile.website,
    logo: `${SITE_URL}/logos/${profile.slug}.png`,
    foundingDate: profile.company.foundedYear.toString(),
    numberOfEmployees: { "@type": "QuantitativeValue", value: profile.company.employeesCount },
    address: {
      "@type": "PostalAddress",
      streetAddress: profile.contacts.mainOffice.address,
      addressLocality: profile.contacts.mainOffice.city,
      postalCode: profile.contacts.mainOffice.zipCode || "",
      addressCountry: "UA",
    },
    contactPoint: profile.contacts.support.freePhone ? [{
      "@type": "ContactPoint",
      telephone: profile.contacts.support.freePhone,
      contactType: "customer support",
      availableLanguage: "Ukrainian",
    }] : [],
    sameAs: Object.values(profile.contacts.social).filter(Boolean),
    identifier: { "@type": "PropertyValue", name: "ЄДРПОУ", value: profile.legal.edrpou },
  };
}

export function getFinancialServiceReviewSchema(profile: {
  name: string; slug: string;
  ratings: { fintodo: { overall: number }; totalReviewsAllSources?: number };
  editorial: { fullVerdict: string };
}) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      itemReviewed: { "@type": "FinancialService", name: profile.name },
      ratingValue: profile.ratings.fintodo.overall,
      bestRating: 100,
      worstRating: 0,
      ratingCount: profile.ratings.totalReviewsAllSources || 1,
      reviewCount: profile.ratings.totalReviewsAllSources || 1,
    },
    {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed: { "@type": "FinancialService", name: profile.name },
      reviewRating: { "@type": "Rating", ratingValue: profile.ratings.fintodo.overall, bestRating: 100 },
      author: { "@type": "Organization", name: "FINTODO", url: SITE_URL },
      publisher: { "@type": "Organization", name: "FINTODO" },
      datePublished: "2025-03-15",
      reviewBody: profile.editorial.fullVerdict,
    },
  ];
}

export function getLocalBusinessSchema(profile: {
  name: string;
  branches: { branchList: { name: string; address: { street: string; city: string }; phone?: string; workingHours: { weekdays: string } }[] };
}) {
  if (!profile.branches.branchList.length) return null;
  return profile.branches.branchList.map(branch => ({
    "@context": "https://schema.org",
    "@type": "BankOrCreditUnion",
    name: `${profile.name} — ${branch.name}`,
    address: { "@type": "PostalAddress", streetAddress: branch.address.street, addressLocality: branch.address.city },
    telephone: branch.phone,
    openingHours: `Mo-Fr ${branch.workingHours.weekdays}`,
  }));
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FINTODO",
    url: SITE_URL,
    description: "Фінансовий портал і AI-бухгалтерія для підприємців України",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/taxes?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getPodcastSeriesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: "FINTODO Подкаст",
    description: "Подкаст про податки, бухгалтерський облік та бізнес в Україні",
    url: `${SITE_URL}/publications/podcasts`,
    webFeed: `${SITE_URL}/publications/podcasts`,
    author: {
      "@type": "Organization",
      name: "FINTODO",
      url: SITE_URL,
    },
    inLanguage: "uk-UA",
  };
}

function durationToISO(duration?: string): string {
  if (!duration) return "PT0S";
  const parts = duration.split(':');
  if (parts.length === 3) return `PT${parseInt(parts[0])}H${parseInt(parts[1])}M${parseInt(parts[2])}S`;
  if (parts.length === 2) return `PT${parseInt(parts[0])}M${parseInt(parts[1])}S`;
  return "PT0S";
}

export function getPodcastEpisodeSchema(article: { title: string; excerpt: string; publishedAt: string; slug: string; mediaDuration?: string; episodeNumber?: number; mediaUrl?: string; transcript?: string }, author: { name: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    url: `${SITE_URL}/articles/${article.slug}`,
    timeRequired: durationToISO(article.mediaDuration),
    ...(article.episodeNumber && { episodeNumber: article.episodeNumber }),
    associatedMedia: article.mediaUrl && article.mediaUrl !== '#' ? {
      "@type": "MediaObject",
      contentUrl: article.mediaUrl,
    } : undefined,
    partOfSeries: getPodcastSeriesSchema(),
    ...(article.transcript && { transcript: article.transcript }),
    author: { "@type": "Person", name: author.name },
    publisher: { "@type": "Organization", name: "FINTODO", url: SITE_URL },
  };
}

export function getVideoObjectSchema(article: { title: string; excerpt: string; publishedAt: string; slug: string; mediaDuration?: string; mediaUrl?: string; transcript?: string }, author: { name: string }) {
  const isYouTube = article.mediaUrl?.includes('youtube') || article.mediaUrl?.includes('youtu.be');
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: article.title,
    description: article.excerpt,
    uploadDate: article.publishedAt,
    duration: durationToISO(article.mediaDuration),
    url: `${SITE_URL}/articles/${article.slug}`,
    thumbnailUrl: `${SITE_URL}/og-default.png`,
    ...(article.mediaUrl && article.mediaUrl !== '#' && isYouTube && { embedUrl: article.mediaUrl }),
    ...(article.mediaUrl && article.mediaUrl !== '#' && !isYouTube && { contentUrl: article.mediaUrl }),
    ...(article.transcript && { transcript: article.transcript }),
    author: { "@type": "Person", name: author.name },
    publisher: { "@type": "Organization", name: "FINTODO", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
  };
}

export function getMediaItemListSchema(articles: { title: string; excerpt: string; publishedAt: string; slug: string; mediaDuration?: string; mediaUrl?: string; episodeNumber?: number; transcript?: string }[], mediaType: 'podcast' | 'video') {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: articles.map((article, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: mediaType === 'podcast'
        ? {
            "@type": "PodcastEpisode",
            name: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt,
            url: `${SITE_URL}/articles/${article.slug}`,
            timeRequired: durationToISO(article.mediaDuration),
            ...(article.episodeNumber && { episodeNumber: article.episodeNumber }),
          }
        : {
            "@type": "VideoObject",
            name: article.title,
            description: article.excerpt,
            uploadDate: article.publishedAt,
            duration: durationToISO(article.mediaDuration),
            url: `${SITE_URL}/articles/${article.slug}`,
            thumbnailUrl: `${SITE_URL}/og-default.png`,
          },
    })),
  };
}

export function getSiteGraphSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getWebsiteSchema(),
      {
        "@type": "Organization",
        name: "FINTODO",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: ["https://t.me/fintodo"],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "support@fintodo.com.ua",
          availableLanguage: "Ukrainian",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "FINTODO",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "299",
          priceCurrency: "UAH",
          priceValidUntil: "2026-12-31",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "2400",
        },
      },
    ],
  };
}

// ──────────────────────────────────────────────────────────────────
// Schema factories для Кроку 4 (JSON-LD прогалини)
// ──────────────────────────────────────────────────────────────────

/**
 * HowTo — для крокових інструкцій. Підходить для калькуляторів /tools/*
 * (як скористатися: ввести → отримати → перевірити).
 */
export function getHowToSchema(opts: {
  name: string;
  description: string;
  url: string;
  steps: { name: string; text: string }[];
  totalTime?: string; // ISO 8601 duration, напр. "PT2M"
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

/**
 * SoftwareApplication — для калькуляторів як вебінструментів (Google Rich Results).
 */
export function getSoftwareApplicationSchema(opts: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string; // "FinanceApplication", "BusinessApplication"
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: opts.applicationCategory || "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "UAH",
    },
  };
}

/**
 * Dataset — для аналітичних сторінок з курсами/індексами/макро-даними.
 * Допомагає Google Dataset Search і LLM-ботам зрозуміти, що сторінка
 * містить структурований датасет з датою оновлення та джерелом.
 */
export function getDatasetSchema(opts: {
  name: string;
  description: string;
  url: string;
  /** ISO date останнього оновлення */
  dateModified: string;
  /** Назва джерела ("НБУ", "Держстат") */
  sourceName: string;
  /** Канонічне URL джерела */
  sourceUrl: string;
  /** Тематичні ключові слова */
  keywords?: string[];
  /** Тимчасове покриття ("2024-01/2026-04" або "2026") */
  temporalCoverage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    dateModified: opts.dateModified,
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(", ") } : {}),
    ...(opts.temporalCoverage ? { temporalCoverage: opts.temporalCoverage } : {}),
    creator: {
      "@type": "Organization",
      name: opts.sourceName,
      url: opts.sourceUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "FINTODO",
      url: SITE_URL,
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
  };
}

/**
 * GovernmentService — для державних реєстрів (ЄДРПОУ, ЄДР, Реєстр платників ПДВ тощо).
 */
export function getGovernmentServiceSchema(opts: {
  name: string;
  description: string;
  url: string;
  /** Офіційне URL реєстру */
  serviceUrl: string;
  /** Назва відомства-провайдера ("Міністерство юстиції України", "ДПС") */
  providerName: string;
  providerUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    serviceType: "Державний реєстр",
    audience: {
      "@type": "Audience",
      audienceType: "Громадяни та бізнес України",
    },
    provider: {
      "@type": "GovernmentOrganization",
      name: opts.providerName,
      ...(opts.providerUrl ? { url: opts.providerUrl } : {}),
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: opts.serviceUrl,
    },
  };
}

