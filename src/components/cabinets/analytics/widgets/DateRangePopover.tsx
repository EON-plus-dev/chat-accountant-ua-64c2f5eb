import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { uk } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePopoverProps {
  value: { from: Date; to: Date } | null;
  onChange: (range: { from: Date; to: Date } | null) => void;
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
  size?: "sm" | "default";
}

const fmt = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

/**
 * Один range-picker (popover з двома місяцями).
 * Використовується для custom-period і custom-baseline.
 */
export const DateRangePopover = ({
  value,
  onChange,
  placeholder = "Оберіть діапазон…",
  className,
  align = "start",
  size = "sm",
}: DateRangePopoverProps) => {
  const [open, setOpen] = useState(false);

  const label = value ? `${fmt(value.from)} — ${fmt(value.to)}` : placeholder;

  const dateRange: DateRange | undefined = value
    ? { from: value.from, to: value.to }
    : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onChange({ from: range.from, to: range.to });
      // Авто-закриваємо коли обрано обидві дати
      setTimeout(() => setOpen(false), 100);
    } else if (range?.from) {
      // Перший клік — фіксуємо початок, чекаємо на другий
      onChange({ from: range.from, to: range.from });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className={cn(
            "w-full justify-start gap-1.5 text-xs h-8 font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          locale={uk}
          numberOfMonths={2}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};
