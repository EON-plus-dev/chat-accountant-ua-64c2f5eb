/**
 * ContractorAnchorCard Component
 * Card for selecting contractor with search combobox and EDR verification
 */

import { useState, useMemo } from "react";
import { Building2, Search, UserPlus, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Contractor } from "@/config/settingsConfig";
import { AnchorCard, type AnchorCardStatus } from "./AnchorCard";

interface ContractorAnchorCardProps {
  value: Contractor | null;
  contractors: Contractor[];
  onChange: (contractor: Contractor) => void;
  highlightedCardId: string | null;
  onHover?: (id: string | null) => void;
  onNavigate?: () => void;
  onInvite?: () => void;
}

// EDR status indicator
function EDRStatusBadge({ contractor }: { contractor: Contractor }) {
  // Demo: Random verification status
  const isVerified = contractor.id.charCodeAt(0) % 2 === 0;
  const isPending = contractor.isPending;
  
  if (isPending) {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300 bg-amber-50">
        <Clock className="w-2.5 h-2.5 mr-0.5" />
        Очікує
      </Badge>
    );
  }
  
  if (isVerified) {
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-emerald-600 border-emerald-300 bg-emerald-50">
        <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
        ЄДР
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300 bg-amber-50">
      <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
      Перевірити
    </Badge>
  );
}

export function ContractorAnchorCard({
  value,
  contractors,
  onChange,
  highlightedCardId,
  onHover,
  onNavigate,
  onInvite,
}: ContractorAnchorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const status: AnchorCardStatus = value ? "filled" : "empty";

  // Filter contractors by search
  const filteredContractors = useMemo(() => {
    if (!search) return contractors;
    const lowerSearch = search.toLowerCase();
    return contractors.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.code?.toLowerCase().includes(lowerSearch)
    );
  }, [contractors, search]);

  // Group by type
  const { legal, fop, individual } = useMemo(() => {
    return {
      legal: filteredContractors.filter((c) => c.type === "legal"),
      fop: filteredContractors.filter((c) => c.type === "fop"),
      individual: filteredContractors.filter((c) => c.type === "individual"),
    };
  }, [filteredContractors]);

  const handleSelect = (contractor: Contractor) => {
    onChange(contractor);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <AnchorCard
      id="contractor"
      icon={Building2}
      label="Контрагент"
      value={value?.name || "Оберіть"}
      status={status}
      isHighlighted={highlightedCardId === "contractor"}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onHover={onHover}
      onNavigate={onNavigate}
    >
      <Command className="border-0">
        <CommandInput
          placeholder="Пошук за назвою або ЄДРПОУ..."
          value={search}
          onValueChange={setSearch}
          className="h-10"
        />
        <CommandList className="max-h-[280px]">
          <CommandEmpty>
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Контрагентів не знайдено</p>
              {onInvite && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onInvite();
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Запросити нового контрагента
                </button>
              )}
            </div>
          </CommandEmpty>

          {/* Legal entities */}
          {legal.length > 0 && (
            <CommandGroup heading="Юридичні особи">
              {legal.map((contractor) => (
                <CommandItem
                  key={contractor.id}
                  value={contractor.id}
                  onSelect={() => handleSelect(contractor)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
                    "min-h-[44px]",
                    value?.id === contractor.id && "bg-accent"
                  )}
                >
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium">{contractor.name}</span>
                      <EDRStatusBadge contractor={contractor} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ЄДРПОУ: {contractor.code}
                    </p>
                  </div>
                  {value?.id === contractor.id && (
                    <span className="text-xs text-primary shrink-0">✓</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* FOP */}
          {fop.length > 0 && (
            <CommandGroup heading="ФОП">
              {fop.map((contractor) => (
                <CommandItem
                  key={contractor.id}
                  value={contractor.id}
                  onSelect={() => handleSelect(contractor)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
                    "min-h-[44px]",
                    value?.id === contractor.id && "bg-accent"
                  )}
                >
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium">{contractor.name}</span>
                      <EDRStatusBadge contractor={contractor} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ІПН: {contractor.code}
                    </p>
                  </div>
                  {value?.id === contractor.id && (
                    <span className="text-xs text-primary shrink-0">✓</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Individuals */}
          {individual.length > 0 && (
            <CommandGroup heading="Фізичні особи">
              {individual.map((contractor) => (
                <CommandItem
                  key={contractor.id}
                  value={contractor.id}
                  onSelect={() => handleSelect(contractor)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 cursor-pointer",
                    "min-h-[44px]",
                    value?.id === contractor.id && "bg-accent"
                  )}
                >
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="truncate font-medium">{contractor.name}</span>
                  </div>
                  {value?.id === contractor.id && (
                    <span className="text-xs text-primary shrink-0">✓</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Invite action */}
          {onInvite && filteredContractors.length > 0 && (
            <>
              <Separator className="my-1" />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setIsOpen(false);
                    onInvite();
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 cursor-pointer min-h-[44px] text-primary"
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  <span>Запросити контрагента</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </AnchorCard>
  );
}
