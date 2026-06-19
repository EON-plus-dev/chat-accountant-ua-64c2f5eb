/**
 * TypeAnchorCard Component
 * Card for selecting document type with dropdown
 */

import { useState, useMemo } from "react";
import { FileText, FileCheck2, Truck, ScrollText, Receipt, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { type DocumentType, documentTypeConfigs } from "@/config/documentFlowConfig";
import { AnchorCard, type AnchorCardStatus } from "./AnchorCard";

interface TypeAnchorCardProps {
  value: DocumentType;
  onChange: (type: DocumentType) => void;
  highlightedCardId: string | null;
  onHover?: (id: string | null) => void;
  onNavigate?: () => void;
  disabled?: boolean;
}

// Creatable document types
const creatableTypes: DocumentType[] = [
  "invoice",
  "act",
  "contract",
  "waybill",
  "tax-invoice",
  "reconciliation",
  "rental-agreement",
  "sale-agreement",
  "supply-contract",
  "fop-service-contract",
];

const iconMap: Partial<Record<DocumentType, typeof FileText>> = {
  invoice: Receipt,
  act: FileCheck2,
  contract: FileText,
  waybill: Truck,
  "tax-invoice": ScrollText,
};

export function TypeAnchorCard({
  value,
  onChange,
  highlightedCardId,
  onHover,
  onNavigate,
  disabled,
}: TypeAnchorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const typeConfig = documentTypeConfigs[value];
  const status: AnchorCardStatus = disabled ? "locked" : (value ? "filled" : "empty");

  const filteredTypes = useMemo(() => {
    return creatableTypes
      .map((type) => documentTypeConfigs[type])
      .filter((config) =>
        config.label.toLowerCase().includes(search.toLowerCase())
      );
  }, [search]);

  const handleSelect = (type: DocumentType) => {
    onChange(type);
    setIsOpen(false);
    setSearch("");
  };

  // If disabled (locked), render without popover
  if (disabled) {
    return (
      <AnchorCard
        id="type"
        icon={iconMap[value] || FileText}
        label="Тип"
        value={typeConfig?.label || "Оберіть"}
        status={status}
        isHighlighted={highlightedCardId === "type"}
        onHover={onHover}
        onNavigate={onNavigate}
        disabled
      />
    );
  }

  return (
    <AnchorCard
      id="type"
      icon={iconMap[value] || FileText}
      label="Тип"
      value={typeConfig?.label || "Оберіть"}
      status={status}
      isHighlighted={highlightedCardId === "type"}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onHover={onHover}
      onNavigate={onNavigate}
    >
      <Command className="border-0">
        <CommandInput
          placeholder="Пошук типу..."
          value={search}
          onValueChange={setSearch}
          className="h-10"
        />
        <CommandList className="max-h-[240px]">
          <CommandEmpty>Типи не знайдено</CommandEmpty>
          <CommandGroup>
            {filteredTypes.map((config) => {
              const Icon = iconMap[config.type] || FileText;
              return (
                <CommandItem
                  key={config.type}
                  value={config.type}
                  onSelect={() => handleSelect(config.type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
                    "min-h-[44px]", // Touch target
                    value === config.type && "bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1">{config.label}</span>
                  {value === config.type && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </AnchorCard>
  );
}
