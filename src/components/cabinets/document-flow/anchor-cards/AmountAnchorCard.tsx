/**
 * AmountAnchorCard Component
 * Interactive card showing total document amount with VAT calculator popover
 */

import { DollarSign, Link } from "lucide-react";
import { AnchorCard, type AnchorCardStatus } from "./AnchorCard";
import { AmountCalculatorPopover } from "./AmountCalculatorPopover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Currency = "UAH" | "USD" | "EUR";

interface AmountAnchorCardProps {
  totalAmount: number;
  highlightedCardId: string | null;
  onHover?: (id: string | null) => void;
  onNavigate?: () => void;
  date?: string;
  vatAmount?: number;
  currency?: Currency;
  onAmountChange?: (total: number, vatAmount: number, currency: Currency) => void;
}

export function AmountAnchorCard({
  totalAmount,
  highlightedCardId,
  onHover,
  onNavigate,
  date,
  vatAmount = 0,
  currency = "UAH",
  onAmountChange,
}: AmountAnchorCardProps) {
  const hasAmount = totalAmount > 0;
  const status: AnchorCardStatus = hasAmount ? "filled" : "empty";

  // Format currency symbol
  const currencySymbols: Record<Currency, string> = {
    UAH: "₴",
    USD: "$",
    EUR: "€",
  };
  const symbol = currencySymbols[currency];

  const displayValue = hasAmount
    ? `${totalAmount.toLocaleString("uk-UA")} ${symbol}`
    : "—";

  // Build secondary value with VAT info + currency badge
  const secondaryParts: string[] = [];
  
  if (vatAmount > 0) {
    secondaryParts.push(`ПДВ: ${vatAmount.toLocaleString("uk-UA")} ${symbol}`);
  }
  
  // Show currency badge if not default UAH
  if (currency !== "UAH") {
    secondaryParts.push(currency);
  }
  
  const secondaryValue = secondaryParts.length > 0 
    ? secondaryParts.join("  •  ") 
    : undefined;

  // Card content WITHOUT navigation icon (for popover wrapping)
  const cardContentWithoutNav = (
    <AnchorCard
      id="amount"
      icon={DollarSign}
      label="Сума"
      value={displayValue}
      secondaryValue={secondaryValue}
      status={status}
      isHighlighted={highlightedCardId === "amount"}
      onHover={onHover}
      showNavigationIcon={false}
    />
  );

  // Navigation button component (rendered outside popover)
  const navigationButton = onNavigate && (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-no-drag
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onNavigate();
          }}
          className={cn(
            "absolute bottom-2 right-2 p-1 rounded-full z-10",
            "opacity-100",
            "bg-primary/10 text-primary hover:bg-primary/20",
            "focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
        >
          <Link className="w-3 h-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Перейти до поля в документі
      </TooltipContent>
    </Tooltip>
  );

  // If no callback provided, render as non-interactive
  if (!onAmountChange || !hasAmount) {
    return (
      <div className="relative group">
        <AnchorCard
          id="amount"
          icon={DollarSign}
          label="Сума"
          value={displayValue}
          status={hasAmount ? "filled" : "locked"}
          isHighlighted={highlightedCardId === "amount"}
          onHover={onHover}
          showNavigationIcon={false}
          disabled={!hasAmount}
        />
        {hasAmount && navigationButton}
      </div>
    );
  }

  // Wrap with popover for interactive mode
  // Navigation button OUTSIDE popover to prevent click interception
  return (
    <div className="relative group">
      <AmountCalculatorPopover
        baseAmount={totalAmount - vatAmount}
        date={date || new Date().toISOString().split("T")[0]}
        onAmountChange={onAmountChange}
      >
        {cardContentWithoutNav}
      </AmountCalculatorPopover>
      {navigationButton}
    </div>
  );
}
