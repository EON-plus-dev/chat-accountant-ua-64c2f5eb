import { useAudience } from "@/contexts/AudienceContext";
import type { Audience } from "@/os/config/osCopy";

/** Тонкий type-safe wrapper над useAudience(). */
export const useAudienceCopy = <T,>(byAudience: Record<Audience, T>): T => {
  const { audience } = useAudience();
  return byAudience[audience];
};

export const useOsAudience = () => useAudience().audience;
