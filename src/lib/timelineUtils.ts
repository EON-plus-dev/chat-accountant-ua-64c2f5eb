import { differenceInDays, addDays, isToday, isYesterday, format, getDay } from "date-fns";
import { uk } from "date-fns/locale";
import type { AuditAction, AuditEntry } from "@/config/documentVersioningConfig";

// ===========================================
// MILESTONE CONFIGURATION
// ===========================================

export const milestoneActions: AuditAction[] = [
  "created",
  "signed",
  "sent",
  "received",
  "paid",
  "archived",
];

// Expected days between milestones (action -> expected days from previous milestone)
export const expectedDaysConfig: Partial<Record<AuditAction, number>> = {
  signed: 3,     // Expected 3 days after created
  sent: 1,       // Expected 1 day after signed
  received: 7,   // Expected 7 days after sent
  paid: 14,      // Expected 14 days after received
  archived: 30,  // Expected 30 days after paid
};

// ===========================================
// DEVIATION CALCULATION
// ===========================================

export interface DeviationResult {
  type: "on-time" | "early" | "delayed";
  days: number;
  expectedDate: Date;
  actualDate: Date;
}

export function calculateDeviation(
  currentEntry: AuditEntry,
  previousMilestone: AuditEntry | null,
): DeviationResult | null {
  if (!previousMilestone) return null;
  
  const expectedDays = expectedDaysConfig[currentEntry.action];
  if (!expectedDays) return null;
  
  const expectedDate = addDays(new Date(previousMilestone.timestamp), expectedDays);
  const actualDate = new Date(currentEntry.timestamp);
  const diffDays = differenceInDays(actualDate, expectedDate);
  
  // Tolerance: within 1 day is considered on-time
  if (Math.abs(diffDays) <= 1) {
    return {
      type: "on-time",
      days: 0,
      expectedDate,
      actualDate,
    };
  }
  
  return {
    type: diffDays > 0 ? "delayed" : "early",
    days: Math.abs(diffDays),
    expectedDate,
    actualDate,
  };
}

// ===========================================
// DATE GROUPING
// ===========================================

const dayNames = ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "Пʼятниця", "Субота"];

export function getRelativeDateLabel(date: Date): string {
  if (isToday(date)) return "Сьогодні";
  if (isYesterday(date)) return "Вчора";
  
  const diffDays = differenceInDays(new Date(), date);
  
  // Within last week - show day name
  if (diffDays < 7) {
    return dayNames[getDay(date)];
  }
  
  // Otherwise show full date
  return format(date, "d MMMM yyyy", { locale: uk });
}

export function getCompactDateLabel(date: Date): string {
  if (isToday(date)) return "Сьогодні";
  if (isYesterday(date)) return "Вчора";
  
  const diffDays = differenceInDays(new Date(), date);
  
  if (diffDays < 7) {
    return dayNames[getDay(date)].slice(0, 3); // Short day name
  }
  
  return format(date, "d MMM", { locale: uk });
}

export interface GroupedEntry {
  dateLabel: string;
  fullDate: string;
  entries: AuditEntry[];
}

export function groupEntriesByDate(entries: AuditEntry[]): GroupedEntry[] {
  const groups = new Map<string, AuditEntry[]>();
  
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dateKey = format(date, "yyyy-MM-dd");
    
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(entry);
  });
  
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort by date desc
    .map(([dateKey, groupEntries]) => {
      const date = new Date(dateKey);
      return {
        dateLabel: getRelativeDateLabel(date),
        fullDate: format(date, "d MMMM yyyy", { locale: uk }),
        entries: groupEntries.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      };
    });
}

// ===========================================
// MILESTONE HELPERS
// ===========================================

export function isMilestoneAction(action: AuditAction): boolean {
  return milestoneActions.includes(action);
}

export function findPreviousMilestone(
  entries: AuditEntry[],
  currentIndex: number
): AuditEntry | null {
  // Search backwards for the previous milestone
  for (let i = currentIndex + 1; i < entries.length; i++) {
    if (isMilestoneAction(entries[i].action)) {
      return entries[i];
    }
  }
  return null;
}

export function formatTime(timestamp: string): string {
  return format(new Date(timestamp), "HH:mm");
}

// ===========================================
// LOCAL TIMELINE SUMMARY (Fallback)
// ===========================================

export interface TimelineSummaryResult {
  summary: string;
  highlights: string[];
  recommendations: string[];
  stats: {
    totalMilestones: number;
    totalDays: number;
    delaysCount: number;
    onTimeCount: number;
    fieldChanges: number;
  };
}

export function generateLocalTimelineSummary(
  entries: AuditEntry[]
): TimelineSummaryResult {
  if (entries.length === 0) {
    return {
      summary: "Немає записів для аналізу.",
      highlights: [],
      recommendations: [],
      stats: { totalMilestones: 0, totalDays: 0, delaysCount: 0, onTimeCount: 0, fieldChanges: 0 },
    };
  }

  // Sort entries by timestamp (oldest first for calculation)
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const firstEntry = sorted[0];
  const lastEntry = sorted[sorted.length - 1];
  const totalDays = differenceInDays(new Date(lastEntry.timestamp), new Date(firstEntry.timestamp));

  // Count milestones
  const milestones = sorted.filter(e => milestoneActions.includes(e.action));
  
  // Count delays and on-time
  let delaysCount = 0;
  let onTimeCount = 0;
  
  milestones.forEach((entry, index) => {
    if (index === 0) return; // Skip first milestone (created)
    
    const prevMilestone = milestones
      .slice(0, index)
      .reverse()
      .find(m => m);
    
    if (prevMilestone) {
      const deviation = calculateDeviation(entry, prevMilestone);
      if (deviation) {
        if (deviation.type === "delayed") delaysCount++;
        else if (deviation.type === "on-time" || deviation.type === "early") onTimeCount++;
      }
    }
  });

  // Count field changes
  const fieldChanges = sorted.filter(e => e.action === "field-changed").length;

  // Generate summary text
  const milestoneCount = milestones.length;
  const summaryParts: string[] = [];
  
  if (milestoneCount > 0) {
    summaryParts.push(`Документ пройшов ${milestoneCount} ключов${milestoneCount === 1 ? "ий етап" : milestoneCount < 5 ? "і етапи" : "их етапів"}`);
  }
  if (totalDays > 0) {
    summaryParts.push(`за ${totalDays} ${totalDays === 1 ? "день" : totalDays < 5 ? "дні" : "днів"}`);
  } else {
    summaryParts.push("за один день");
  }

  const summary = summaryParts.join(" ") + ".";

  // Generate highlights
  const highlights: string[] = [];
  
  if (onTimeCount > 0) {
    highlights.push(`✓ ${onTimeCount} ${onTimeCount === 1 ? "етап виконано" : "етапи виконано"} в термін`);
  }
  if (delaysCount > 0) {
    highlights.push(`⚠ Виявлено ${delaysCount} ${delaysCount === 1 ? "затримку" : "затримки"}`);
  }
  if (fieldChanges > 0) {
    highlights.push(`💰 ${fieldChanges} ${fieldChanges === 1 ? "зміна полів" : "зміни полів"} зафіксовано`);
  }

  // Check for specific milestones
  if (milestones.some(m => m.action === "signed")) {
    highlights.push("✓ Документ підписано");
  }
  if (milestones.some(m => m.action === "paid")) {
    highlights.push("✓ Оплату проведено");
  }

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (delaysCount > 1) {
    recommendations.push("Розгляньте причини систематичних затримок у документообігу");
  }
  if (!milestones.some(m => m.action === "archived") && totalDays > 30) {
    recommendations.push("Документ не архівовано понад 30 днів — перевірте статус");
  }

  return {
    summary,
    highlights: highlights.slice(0, 4), // Max 4 highlights
    recommendations: recommendations.slice(0, 2), // Max 2 recommendations
    stats: {
      totalMilestones: milestoneCount,
      totalDays,
      delaysCount,
      onTimeCount,
      fieldChanges,
    },
  };
}
