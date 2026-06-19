/**
 * PositionsAnchorCard Component
 * Card for positions summary that opens the positions sheet
 */

import { Package } from "lucide-react";
import { type DocumentPosition } from "@/config/documentTemplateGenerator";
import { AnchorCard, type AnchorCardStatus } from "./AnchorCard";

interface PositionsAnchorCardProps {
  positions: DocumentPosition[];
  totalAmount: number;
  highlightedCardId: string | null;
  onHover?: (id: string | null) => void;
  onNavigate?: () => void;
  onEdit: () => void;
  required?: boolean;
}

export function PositionsAnchorCard({
  positions,
  totalAmount,
  highlightedCardId,
  onHover,
  onNavigate,
  onEdit,
  required = true,
}: PositionsAnchorCardProps) {
  const hasPositions = positions.length > 0;
  const status: AnchorCardStatus = hasPositions 
    ? "filled" 
    : required 
      ? "empty" 
      : "locked";

  const displayValue = hasPositions
    ? `${positions.length} поз. • ${totalAmount.toLocaleString("uk-UA")} ₴`
    : "Додати";

  return (
    <AnchorCard
      id="positions"
      icon={Package}
      label="Позиції"
      value={displayValue}
      status={status}
      isHighlighted={highlightedCardId === "positions"}
      onHover={onHover}
      onNavigate={onNavigate}
      onClick={onEdit}
    />
  );
}
