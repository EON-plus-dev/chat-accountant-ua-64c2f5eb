import { useState, useCallback } from 'react';
import { COMPETENCIES } from '@/portal/data/consultantCompetencies';

const STORAGE_KEY = 'consultant_usage';
const FREE_LIMIT = 3;

interface UsageMap {
  [competencyId: string]: number;
}

function loadUsage(): UsageMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsage(usage: UsageMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function useCompetencyAccess() {
  const [usage, setUsage] = useState<UsageMap>(loadUsage);

  const getAccess = useCallback((competencyId: string) => {
    const comp = COMPETENCIES.find((c) => c.id === competencyId);
    if (!comp) return { canSend: false, remaining: 0, isSponsored: false, sponsorName: undefined };

    if (comp.accessTier === 'sponsored') {
      return {
        canSend: true,
        remaining: Infinity,
        isSponsored: true,
        sponsorName: comp.sponsorName,
      };
    }

    const used = usage[competencyId] || 0;
    const remaining = Math.max(0, FREE_LIMIT - used);
    return {
      canSend: remaining > 0,
      remaining,
      isSponsored: false,
      sponsorName: undefined,
    };
  }, [usage]);

  const trackMessage = useCallback((competencyId: string) => {
    const comp = COMPETENCIES.find((c) => c.id === competencyId);
    if (!comp || comp.accessTier === 'sponsored') return;

    setUsage((prev) => {
      const next = { ...prev, [competencyId]: (prev[competencyId] || 0) + 1 };
      saveUsage(next);
      return next;
    });
  }, []);

  return { getAccess, trackMessage, FREE_LIMIT };
}
