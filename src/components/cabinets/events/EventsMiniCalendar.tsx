import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { uk } from "date-fns/locale";
import type { EventChannel } from "@/config/individualEventsRich";
import { Button } from "@/components/ui/button";

export interface MiniCalEvent {
  at: Date;
  channel: EventChannel;
  isOverdue?: boolean;
  isDeadline?: boolean;
}

interface Props {
  events: MiniCalEvent[];
  selectedDate?: Date;
  onSelect: (d: Date | undefined) => void;
}

/**
 * Mini calendar with density indicators per day:
 *  - dot under day = has any events
 *  - red dot       = has overdue
 *  - amber dot     = has deadline
 *  - primary dot   = has regular events
 */
export function EventsMiniCalendar({ events, selectedDate, onSelect }: Props) {
  const { overdueDays, deadlineDays, regularDays } = useMemo(() => {
    const overdue = new Set<string>();
    const deadline = new Set<string>();
    const regular = new Set<string>();
    for (const e of events) {
      const k = keyOf(e.at);
      if (e.isOverdue) overdue.add(k);
      else if (e.isDeadline) deadline.add(k);
      else regular.add(k);
    }
    const toDates = (s: Set<string>) => Array.from(s).map(parseKey);
    // Remove from "regular" any day that is already overdue/deadline (priority).
    overdue.forEach((k) => regular.delete(k));
    deadline.forEach((k) => regular.delete(k));
    return {
      overdueDays: toDates(overdue),
      deadlineDays: toDates(deadline),
      regularDays: toDates(regular),
    };
  }, [events]);

  return (
    <div className="bg-card border rounded-lg p-2 self-start">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        modifiers={{
          hasOverdue: overdueDays,
          hasDeadline: deadlineDays,
          hasRegular: regularDays,
        }}
        modifiersClassNames={{
          hasOverdue:
            "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-destructive",
          hasDeadline:
            "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-warning",
          hasRegular:
            "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
        }}
        locale={uk}
      />
      <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Прострочено
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-warning" /> Дедлайн
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-primary" /> Подія
        </span>
      </div>
      {selectedDate && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 text-xs"
          onClick={() => onSelect(undefined)}
        >
          Показати всі дні
        </Button>
      )}
    </div>
  );
}

function keyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
function parseKey(k: string): Date {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m, d);
}
