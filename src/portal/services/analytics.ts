declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

export function track(event: string, props?: Record<string, string | number>) {
  window.plausible?.(event, { props });
}

export const analytics = {
  ctaClick: (location: string, articleSlug?: string) =>
    track('CTA Click', { location, ...(articleSlug && { article: articleSlug }) }),

  calculatorUsed: (type: 'esv' | 'tax' | 'salary') =>
    track('Calculator Used', { type }),

  articleViewed: (slug: string, category: string) =>
    track('Article View', { slug, category }),

  articleCompleted: (slug: string) =>
    track('Article Read', { slug }),

  subscriptionCompleted: (source: string) =>
    track('Subscription', { source }),

  wizardCompleted: (recommendation: string) =>
    track('Wizard Done', { recommendation }),

  rankingViewed: (category: string) =>
    track('Ranking View', { category }),

  searchUsed: (query: string, count: number) =>
    track('Search', { query: query.slice(0, 50), results: count }),

  aiChatStarted: () =>
    track('AI Chat Started'),
};
