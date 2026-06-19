import { useState, useCallback } from "react";

const MRU_KEY = "template-selector-mru";
const MAX_MRU = 3;

export function useRecentlyUsedTemplates() {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(MRU_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const addRecent = useCallback((templateId: string) => {
    setRecentIds(prev => {
      const filtered = prev.filter(id => id !== templateId);
      const updated = [templateId, ...filtered].slice(0, MAX_MRU);
      try {
        localStorage.setItem(MRU_KEY, JSON.stringify(updated));
      } catch {
        // Ignore localStorage errors
      }
      return updated;
    });
  }, []);
  
  const clearRecent = useCallback(() => {
    setRecentIds([]);
    try {
      localStorage.removeItem(MRU_KEY);
    } catch {
      // Ignore localStorage errors
    }
  }, []);
  
  return { recentIds, addRecent, clearRecent };
}
