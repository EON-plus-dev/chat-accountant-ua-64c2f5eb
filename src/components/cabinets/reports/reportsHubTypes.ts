import type { Report, ReportStatus } from "@/config/reportsConfig";

/**
 * Hub stats — single source of truth, computed in ReportsPage and consumed
 * by AttentionInbox via the useReportsAttentionItems adapter.
 */
export interface ReportsHubStats {
  upcoming: Array<Report & { normalizedStatus: ReportStatus }>;
  review: {
    total: number;
    fresh: number;
    firstReport: (Report & { normalizedStatus: ReportStatus }) | null;
  };
  submittedCount: number;
  discipline: {
    onTimeRate: number;
    totalPaid: number;
    lateCount: number;
  };
  /** Kept for backward-compat; no longer rendered. */
  sparkline: Array<{
    x: number;
    rate: number | null;
    label: string;
    ok: number;
    total: number;
  }>;
}
