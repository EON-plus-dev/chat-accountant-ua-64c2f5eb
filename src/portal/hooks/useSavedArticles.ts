import { useState } from "react";

const STORAGE_KEY = 'fintodo_saved';

export function useSavedArticles() {
  const [saved, setSaved] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  const toggle = (articleId: string) => {
    setSaved(prev => {
      const next = prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isSaved = (id: string) => saved.includes(id);

  return { saved, toggle, isSaved, count: saved.length };
}
