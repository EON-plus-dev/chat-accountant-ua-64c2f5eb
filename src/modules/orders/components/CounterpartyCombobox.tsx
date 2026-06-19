import { useState } from "react";
import { Check, ChevronsUpDown, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { OrderCounterparty } from "../data/types";
import type { OrderDirection } from "../types";

interface Props {
  items: OrderCounterparty[];
  value: string;
  onChange: (id: string) => void;
  direction: OrderDirection;
}

export function CounterpartyCombobox({ items, value, onChange, direction }: Props) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value);
  const Icon = direction === "sale" ? User : Building2;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between h-9 font-normal"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Icon className="w-3.5 h-3.5 text-muted-foreground flex-none" />
            <span className="truncate">
              {selected ? selected.name : (direction === "sale" ? "Оберіть клієнта" : "Оберіть постачальника")}
            </span>
          </span>
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground flex-none ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Пошук за назвою або кодом..." className="h-9" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Нічого не знайдено</CommandEmpty>
            <CommandGroup>
              {items.map((it) => (
                <CommandItem
                  key={it.id}
                  value={`${it.name} ${it.taxId ?? ""}`}
                  onSelect={() => {
                    onChange(it.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-3.5 w-3.5", value === it.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{it.name}</div>
                    {it.taxId && <div className="text-[10px] text-muted-foreground">{it.taxId} · {it.currency}</div>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
