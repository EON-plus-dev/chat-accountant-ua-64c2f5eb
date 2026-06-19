import { useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { uk } from "date-fns/locale";

export type DateRangeValue = { from?: Date; to?: Date } | undefined;

export type DateRangePresetKey =
  | "today"
  | "yesterday"
  | "this-week"
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "this-year";

interface PresetDef {
  key: DateRangePresetKey;
  label: string;
  getValue: () => { from: Date; to: Date };
}

const ALL_PRESETS: Record<DateRangePresetKey, PresetDef> = {
  today: {
    key: "today",
    label: "Сьогодні",
    getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  yesterday: {
    key: "yesterday",
    label: "Вчора",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  "this-week": {
    key: "this-week",
    label: "Цей тиждень",
    getValue: () => ({
      from: startOfWeek(new Date(), { locale: uk }),
      to: endOfWeek(new Date(), { locale: uk }),
    }),
  },
  "this-month": {
    key: "this-month",
    label: "Цей місяць",
    getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
  },
  "last-month": {
    key: "last-month",
    label: "Минулий місяць",
    getValue: () => {
      const lm = subMonths(new Date(), 1);
      return { from: startOfMonth(lm), to: endOfMonth(lm) };
    },
  },
  "this-quarter": {
    key: "this-quarter",
    label: "Цей квартал",
    getValue: () => ({ from: startOfQuarter(new Date()), to: endOfQuarter(new Date()) }),
  },
  "this-year": {
    key: "this-year",
    label: "Цей рік",
    getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
  },
};

const DEFAULT_PRESETS: DateRangePresetKey[] = [
  "today",
  "yesterday",
  "this-week",
  "this-month",
  "this-quarter",
];

export interface DateRangeFilterProps {
  value?: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  presets?: DateRangePresetKey[];
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export const DateRangeFilter = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  label = "Період",
  showLabel = true,
  className,
}: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);

  const presetDefs = presets.map((k) => ALL_PRESETS[k]).filter(Boolean);

  const isPresetActive = (preset: PresetDef) => {
    if (!value?.from) return false;
    const v = preset.getValue();
    return (
      value.from.getTime() === v.from.getTime() &&
      value.to?.getTime() === v.to.getTime()
    );
  };

  const formatRange = () => {
    if (!value?.from) return null;
    const from = format(value.from, "dd.MM.yy", { locale: uk });
    const to = value.to ? format(value.to, "dd.MM.yy", { locale: uk }) : from;
    return from === to ? from : `${from} – ${to}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <Label className="text-sm font-medium block">{label}</Label>
      )}
      <div className="flex flex-wrap gap-1.5">
        {presetDefs.map((preset) => (
          <Button
            key={preset.key}
            type="button"
            variant={isPresetActive(preset) ? "secondary" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => onChange(preset.getValue())}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-start gap-2",
              value?.from && "border-primary text-primary"
            )}
          >
            <CalendarIcon className="w-4 h-4" />
            {formatRange() || "Обрати дати"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="range"
            selected={value?.from ? { from: value.from, to: value.to } : undefined}
            onSelect={(range) =>
              onChange(
                range?.from || range?.to
                  ? { from: range?.from, to: range?.to }
                  : undefined
              )
            }
            locale={uk}
            numberOfMonths={1}
            className="p-3 pointer-events-auto"
          />
          {value?.from && (
            <div className="p-3 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                className="w-full text-muted-foreground"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Скинути період
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
