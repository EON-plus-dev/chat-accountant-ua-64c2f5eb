import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface ClarificationChipsProps {
  question: string;
  options: Array<{ label: string; value: string }>;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

/**
 * Інлайн уточнюючі чипи від AI коли запит неоднозначний.
 * Рендериться під повідомленням асистента в ChatOrchestrator.
 */
export const ClarificationChips = ({
  question,
  options,
  onSelect,
  disabled,
}: ClarificationChipsProps) => {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2.5">
      <div className="flex items-start gap-2 text-sm text-foreground">
        <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <span>{question}</span>
      </div>
      <div className="flex flex-wrap gap-2 pl-6">
        {options.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onSelect(opt.value)}
            className="h-7 text-xs"
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
