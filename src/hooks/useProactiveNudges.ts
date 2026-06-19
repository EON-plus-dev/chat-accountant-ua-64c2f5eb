import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { nudgeTemplates, type NudgeTrigger } from "@/components/marketing/ContextualNudge";

export interface NudgeConfig {
  trigger: NudgeTrigger;
  title: string;
  description?: string;
  ctaLabel: string;
  ctaAction: () => void;
}

interface CabinetStats {
  documentsSignedCount?: number;
  createdAt?: string;
  accessMode?: "active" | "passive";
}

interface UseProactiveNudgesOptions {
  cabinetStats?: CabinetStats;
  partnerName?: string;
  partnerPlan?: string;
  enabled?: boolean;
}

const NUDGE_STORAGE_KEY = "seen_nudges";

// Get seen nudges from localStorage
const getSeenNudges = (): string[] => {
  try {
    const stored = localStorage.getItem(NUDGE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Mark nudge as seen
const markNudgeSeen = (nudgeId: string) => {
  try {
    const seen = getSeenNudges();
    if (!seen.includes(nudgeId)) {
      seen.push(nudgeId);
      localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify(seen));
    }
  } catch {
    // Ignore storage errors
  }
};

// Check if nudge was seen
const hasSeenNudge = (nudgeId: string): boolean => {
  return getSeenNudges().includes(nudgeId);
};

// Calculate days since date
const daysSince = (dateString: string): number => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const useProactiveNudges = ({
  cabinetStats,
  partnerName,
  partnerPlan,
  enabled = true,
}: UseProactiveNudgesOptions = {}) => {
  const navigate = useNavigate();
  const [activeNudge, setActiveNudge] = useState<NudgeConfig | null>(null);
  const [nudgeQueue, setNudgeQueue] = useState<NudgeConfig[]>([]);
  
  // Dismiss current nudge and show next if any
  const dismissNudge = useCallback((markAsSeen = true) => {
    if (activeNudge && markAsSeen) {
      // Use title as nudge identifier
      markNudgeSeen(activeNudge.title);
    }
    setActiveNudge(null);
    
    // Show next nudge from queue after delay
    if (nudgeQueue.length > 0) {
      const [next, ...rest] = nudgeQueue;
      setNudgeQueue(rest);
      setTimeout(() => setActiveNudge(next), 1000);
    }
  }, [activeNudge, nudgeQueue]);
  
  // Trigger a feature locked nudge manually
  const triggerFeatureLocked = useCallback((featureName: string, planRequired: string) => {
    const nudgeId = `feature_locked_${featureName}`;
    if (!hasSeenNudge(nudgeId)) {
      const config = nudgeTemplates.featureLocked(
        featureName, 
        planRequired, 
        () => {
          navigate("/pricing?source=feature-locked");
          dismissNudge();
        }
      );
      setActiveNudge(config);
    }
  }, [navigate, dismissNudge]);
  
  // Check and trigger nudges based on conditions
  useEffect(() => {
    if (!enabled || !cabinetStats) return;
    
    const isPassive = cabinetStats.accessMode === "passive";
    const docsCount = cabinetStats.documentsSignedCount || 0;
    const daysActive = cabinetStats.createdAt ? daysSince(cabinetStats.createdAt) : 0;
    
    const potentialNudges: NudgeConfig[] = [];
    
    // Milestone: 5 documents signed
    if (isPassive && docsCount >= 5 && !hasSeenNudge("milestone_5_docs")) {
      potentialNudges.push(
        nudgeTemplates.milestone5Docs(() => {
          navigate("/pricing?source=milestone-5-docs");
          dismissNudge();
        })
      );
    }
    
    // Time-based: 30 days in passive mode
    if (isPassive && daysActive >= 30 && !hasSeenNudge("day_30_passive")) {
      potentialNudges.push(
        nudgeTemplates.day30Passive(() => {
          navigate("/pricing?source=day-30-passive");
          dismissNudge();
        })
      );
    }
    
    // Partner action: partner upgraded (would need actual partner data)
    if (partnerName && partnerPlan && !hasSeenNudge(`partner_upgraded_${partnerPlan}`)) {
      // Only trigger if partner recently upgraded - this would need actual tracking
      // For now, we just prepare the nudge config
    }
    
    // Set first nudge as active, rest in queue
    if (potentialNudges.length > 0 && !activeNudge) {
      const [first, ...rest] = potentialNudges;
      setActiveNudge(first);
      setNudgeQueue(rest);
    }
  }, [cabinetStats, partnerName, partnerPlan, enabled, navigate, dismissNudge, activeNudge]);
  
  // Clear all seen nudges (for testing)
  const resetSeenNudges = useCallback(() => {
    localStorage.removeItem(NUDGE_STORAGE_KEY);
    setActiveNudge(null);
    setNudgeQueue([]);
  }, []);
  
  return {
    activeNudge,
    dismissNudge,
    triggerFeatureLocked,
    resetSeenNudges,
    hasActiveNudge: activeNudge !== null,
  };
};

export default useProactiveNudges;
