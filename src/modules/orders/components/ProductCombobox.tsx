import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { OrderableProduct } from "../data/types";

interface Props {
  items: OrderableProduct[];
  value: string;
  onChange: (id: string) => void;
}

export function ProductCombobox({ items, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === value);

  // Group by `group` field
  const grouped = useMemo(() => {
    const m = new Map<string, OrderableProduct[]>();
    for (const it of items) {
      const k = it.group ?? "Інше";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(it);
    }
    return m;
  }, [items]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between h-8 font-normal text-sm">
          <span className="flex items-center gap-2 min-w-0">
            <Package className="w-3.5 h-3.5 text-muted-foreground flex-none" />
            <span className="truncate">{selected ? selected.name : "Оберіть товар"}</span>
          </span>
          <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground flex-none ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Пошук за SKU або назвою..." className="h-9" />
          <CommandList className="max-h-[320px]">
            <CommandEmpty>Нічого не знайдено</CommandEmpty>
            {Array.from(grouped.entries()).map(([group, list]) => (
              <CommandGroup key={group} heading={group}>
                {list.map((it) => (
                  <CommandItem
                    key={it.id}
                    value={`${it.sku} ${it.name}`}
                    onSelect={() => {
                      onChange(it.id);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-3.5 w-3.5", value === it.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{it.name}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">
                        {it.sku} · {it.price} ₴ · залишок {it.stockQty} {it.unit}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
