/**
 * DateAnchorCard Component
 * Card for selecting date with calendar popover
 */

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { AnchorCard, type AnchorCardStatus } from "./AnchorCard";

interface DateAnchorCardProps {
  id: string;
  label: string;
  value: string; // ISO date string
  onChange: (date: string) => void;
  highlightedCardId: string | null;
  onHover?: (id: string | null) => void;
  onNavigate?: () => void;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
}

export function DateAnchorCard({
  id,
  label,
  value,
  onChange,
  highlightedCardId,
  onHover,
  onNavigate,
  minDate,
  maxDate,
  required = false,
}: DateAnchorCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse value to Date
  const dateValue = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const isValidDate = dateValue && isValid(dateValue);
  
  const status: AnchorCardStatus = isValidDate 
    ? "filled" 
    : required 
      ? "empty" 
      : "filled";

  const displayValue = isValidDate
    ? format(dateValue, "dd.MM.yyyy", { locale: uk })
    : "—";

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
      setIsOpen(false);
    }
  };

  return (
    <AnchorCard
      id={id}
      icon={CalendarIcon}
      label={label}
      value={displayValue}
      status={status}
      isHighlighted={highlightedCardId === id}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onHover={onHover}
      onNavigate={onNavigate}
    >
      <div className="p-3">
        <Calendar
          mode="single"
          selected={isValidDate ? dateValue : undefined}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          locale={uk}
          initialFocus
          className="rounded-md"
        />
      </div>
    </AnchorCard>
  );
}
