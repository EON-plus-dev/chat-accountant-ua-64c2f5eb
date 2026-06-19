import * as React from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  value?: Date;
  onChange: (d: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  className?: string;
}

export function AsOfDatePicker({
  value,
  onChange,
  minDate,
  maxDate = new Date(),
  label = "Дані станом на",
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("h-9 justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">
              {label}: <span className="font-medium text-foreground">
                {value ? format(value, "d MMM yyyy", { locale: uk }) : "сьогодні"}
              </span>
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => { onChange(d); setOpen(false); }}
            locale={uk}
            disabled={(date) => (maxDate && date > maxDate) || (minDate ? date < minDate : false)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(undefined)} title="Скинути">
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
