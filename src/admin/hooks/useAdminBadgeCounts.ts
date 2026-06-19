import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Fetch pending count from a table with status filter */
function usePendingCount(table: "gov_reviews" | "institution_reviews" | "ai_chat_queries" | "consultations", status: string) {
  return useQuery({
    queryKey: ["admin-badge", table, status],
    queryFn: async () => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("status", status);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });
}

/** Count tax deadlines within 3 days from now */
function useUrgentDeadlineCount(): number {
  return useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    // Hardcoded 2026 deadlines matching TaxCalendarPage
    const dates = [
      new Date(2026, 0, 19), new Date(2026, 0, 20), new Date(2026, 0, 20),
      new Date(2026, 1, 19), new Date(2026, 1, 20), new Date(2026, 2, 2),
      new Date(2026, 2, 19), new Date(2026, 2, 20), new Date(2026, 3, 20),
      new Date(2026, 3, 30), new Date(2026, 4, 19), new Date(2026, 4, 20),
      new Date(2026, 5, 19), new Date(2026, 5, 30), new Date(2026, 6, 20),
      new Date(2026, 7, 10), new Date(2026, 7, 19), new Date(2026, 7, 20),
      new Date(2026, 8, 19), new Date(2026, 8, 20), new Date(2026, 9, 20),
      new Date(2026, 10, 19), new Date(2026, 10, 20), new Date(2026, 11, 20),
      // Individual deadlines
      new Date(2026, 3, 1), new Date(2026, 4, 1), new Date(2026, 6, 1),
      new Date(2026, 7, 1), new Date(2026, 7, 2),
    ];
    return dates.filter(d => d >= now && d <= cutoff).length;
  }, []);
}

export function useAdminBadgeCounts(): Record<string, number> {
  const { data: govReviews = 0 } = usePendingCount("gov_reviews", "pending");
  const { data: instReviews = 0 } = usePendingCount("institution_reviews", "pending");
  const { data: aiPending = 0 } = usePendingCount("ai_chat_queries", "pending");
  const { data: draftConsultations = 0 } = usePendingCount("consultations", "draft");
  const urgentDeadlines = useUrgentDeadlineCount();

  return useMemo(() => ({
    "/admin/gov-reviews": govReviews + instReviews,
    "/admin/ai-consultations": aiPending,
    "/admin/autocontent": draftConsultations,
    "/admin/tax-calendar": urgentDeadlines,
    "/admin/seo": 0,
    "/admin/questions": 0,
  }), [govReviews, instReviews, aiPending, draftConsultations, urgentDeadlines]);
}
