import { useState } from "react";
import { Globe, ChevronDown, Check, ArrowRight } from "lucide-react";
import { getEntityStyle } from "@/config/entityStyles";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Cabinet } from "@/types/cabinet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface CabinetContextChipProps {
  activeCabinet: Cabinet | null;
  cabinets?: Cabinet[];
  onCabinetEnter?: (cabinet: Cabinet) => void;
  onViewAllCabinets?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CabinetContextChip = ({
  activeCabinet,
  cabinets = [],
  onCabinetEnter,
  onViewAllCabinets,
  isOpen,
  onOpenChange,
}: CabinetContextChipProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const isMobile = useIsMobile();

  const hasSwitcher = cabinets.length > 0;

  const baseClasses =
    "flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-primary/20 shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.03),0_2px_4px_0_hsl(var(--foreground)/0.08)]";

  const chipContent = () => {
    if (!activeCabinet) {
      return (
        <>
          <Globe className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Загальний режим</span>
        </>
      );
    }
    const entityStyle = getEntityStyle(activeCabinet.type);
    const IconComponent = entityStyle.icon;
    return (
      <>
        <IconComponent className={cn("w-3.5 h-3.5 flex-shrink-0", entityStyle.color)} />
        <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
          {activeCabinet.name}
        </span>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          · {activeCabinet.roleLabel}
        </span>
      </>
    );
  };

  if (!hasSwitcher) {
    return (
      <div className={baseClasses}>
        {chipContent()}
      </div>
    );
  }

  const triggerButton = (
    <button
      className={cn(
        baseClasses,
        "cursor-pointer hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]"
      )}
      aria-label="Перемикач кабінетів"
    >
      {chipContent()}
      <ChevronDown className={cn(
        "w-3 h-3 text-muted-foreground flex-shrink-0 transition-transform duration-200",
        open && "rotate-180"
      )} />
    </button>
  );

  const cabinetList = (
    <CommandGroup heading="Кабінети">
      {cabinets.map((cabinet) => {
        const style = getEntityStyle(cabinet.type);
        const Icon = style.icon;
        const isActive = activeCabinet?.id === cabinet.id;
        return (
          <CommandItem
            key={cabinet.id}
            value={`${cabinet.name} ${cabinet.taxId || ""}`}
            onSelect={() => {
              onCabinetEnter?.(cabinet);
              setOpen(false);
            }}
            className="flex items-center gap-2.5 py-2"
          >
            <Icon className={cn("w-4 h-4 flex-shrink-0", style.color)} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">{cabinet.name}</span>
              <span className="text-[11px] text-muted-foreground">{cabinet.roleLabel}</span>
            </div>
            {isActive && (
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </CommandItem>
        );
      })}
    </CommandGroup>
  );

  const allCabinetsFooter = (
    <div className="border-t border-border p-1 bg-popover">
      <button
        type="button"
        onClick={() => {
          onViewAllCabinets?.();
          setOpen(false);
        }}
        className="w-full flex items-center gap-2 py-2 px-2 rounded-sm text-primary hover:bg-accent active:scale-[0.99] transition"
      >
        <ArrowRight className="w-4 h-4" />
        <span className="text-sm font-medium">Усі кабінети</span>
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{triggerButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="p-0 flex flex-col max-h-[85dvh] gap-0"
        >
          <SheetTitle className="sr-only">Перемикач кабінетів</SheetTitle>
          <Command className="flex-1 min-h-0 flex flex-col">
            <CommandInput placeholder="Пошук кабінету..." />
            <CommandList className="flex-1 min-h-0 max-h-none overflow-y-auto overscroll-contain">
              <CommandEmpty>Кабінет не знайдено</CommandEmpty>
              {cabinetList}
            </CommandList>
          </Command>
          {allCabinetsFooter}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 flex flex-col max-h-[70vh]"
        align="start"
        sideOffset={8}
      >
        <Command className="flex-1 min-h-0 flex flex-col">
          <CommandInput placeholder="Пошук кабінету..." />
          <CommandList className="flex-1 min-h-0 max-h-none overflow-y-auto">
            <CommandEmpty>Кабінет не знайдено</CommandEmpty>
            {cabinetList}
          </CommandList>
        </Command>
        {allCabinetsFooter}
      </PopoverContent>
    </Popover>
  );
};
