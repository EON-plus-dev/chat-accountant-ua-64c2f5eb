/**
 * MasterFilter — компактний фільтр «по майстру» для табів Бронювань.
 * Один вибір; синхронізується з ?masterId= у BookingsPage.
 */

import { useState } from "react";
import { ChevronsUpDown, Filter, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { StaffMember as SalonMaster } from "@/core";

interface Props {
  masters: SalonMaster[];
  value: string | null;
  onChange: (id: string | null) => void;
  /** Дні робочого тижня (0..6) — для підказки «вихідний» біля майстра. */
  workingDow?: number;
  size?: "sm" | "md";
  className?: string;
}

export function MasterFilter({ masters, value, onChange, workingDow, size = "sm", className }: Props) {
  const [open, setOpen] = useState(false);
  const selected = value ? masters.find((m) => m.id === value) ?? null : null;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selected ? "secondary" : "outline"}
            size={size === "sm" ? "sm" : "default"}
            className={cn(
              "gap-1.5",
              size === "sm" && "h-8 text-xs",
            )}
            aria-label="Фільтр по майстру"
          >
            {selected ? (
              <>
                <span
                  className="w-3 h-3 rounded-full flex-none"
                  style={{ backgroundColor: selected.color }}
                />
                <span className="truncate max-w-[140px]">{selected.shortName}</span>
              </>
            ) : (
              <>
                <Filter className="w-3.5 h-3.5" />
                <span>Усі майстри</span>
              </>
            )}
            <ChevronsUpDown className="w-3 h-3 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="end">
          <Command>
            <CommandInput placeholder="Пошук майстра..." className="h-9" />
            <CommandList>
              <CommandEmpty>Нікого не знайдено</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="__all__"
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  Усі майстри
                  {!selected && <Check className="ml-auto w-3.5 h-3.5" />}
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Майстри">
                {masters.map((m) => {
                  const isWorking =
                    workingDow === undefined || m.schedule.workDays.includes(workingDow);
                  return (
                    <CommandItem
                      key={m.id}
                      value={`${m.fullName} ${m.shortName}`}
                      onSelect={() => {
                        onChange(m.id);
                        setOpen(false);
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full mr-2 flex-none"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="truncate">{m.shortName}</span>
                      {!isWorking && (
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          вихідний
                        </span>
                      )}
                      {selected?.id === m.id && <Check className="ml-auto w-3.5 h-3.5" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(null)}
          aria-label="Скинути фільтр майстра"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
