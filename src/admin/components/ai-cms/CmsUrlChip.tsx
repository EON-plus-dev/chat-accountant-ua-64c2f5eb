import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

const SITE_PAGES = [
  { path: "/overview", label: "Огляд порталу" },
  { path: "/dovidnyky", label: "Довідники" },
  { path: "/tools", label: "Інструменти" },
  { path: "/learn", label: "Навчання" },
  { path: "/analytics", label: "Аналітика" },
  { path: "/consultant", label: "AI Консультант" },
  { path: "/", label: "Головна (лендінг)" },
];

interface CmsUrlChipProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CmsUrlChip({ currentPath, onNavigate, isOpen: controlledOpen, onOpenChange }: CmsUrlChipProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [customPath, setCustomPath] = useState("");

  const currentLabel = SITE_PAGES.find(p => p.path === currentPath)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full",
            "bg-background border border-primary/20",
            "shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.03),0_2px_4px_0_hsl(var(--foreground)/0.08)]",
            "cursor-pointer hover:border-primary/40 hover:shadow-md transition-all active:scale-[0.98]"
          )}
          aria-label="Навігація по сайту"
        >
          <Globe className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
          <span className="text-xs font-medium text-foreground truncate max-w-[200px]">
            {currentPath}
          </span>
          {currentLabel && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              · {currentLabel}
            </span>
          )}
          <ChevronDown className={cn(
            "w-3 h-3 text-muted-foreground flex-shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" sideOffset={8}>
        <Command>
          <CommandInput
            placeholder="Введіть шлях або знайдіть..."
            value={customPath}
            onValueChange={setCustomPath}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customPath.startsWith("/")) {
                onNavigate(customPath);
                setOpen(false);
                setCustomPath("");
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              {customPath.startsWith("/") ? (
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    onNavigate(customPath);
                    setOpen(false);
                    setCustomPath("");
                  }}
                >
                  Перейти на {customPath}
                </button>
              ) : (
                "Сторінку не знайдено"
              )}
            </CommandEmpty>
            <CommandGroup heading="Сторінки сайту">
              {SITE_PAGES.map((page) => (
                <CommandItem
                  key={page.path}
                  value={`${page.path} ${page.label}`}
                  onSelect={() => {
                    onNavigate(page.path);
                    setOpen(false);
                    setCustomPath("");
                  }}
                  className="flex items-center gap-2.5 py-2"
                >
                  <span className="text-sm font-mono text-muted-foreground w-24 truncate">{page.path}</span>
                  <span className="text-sm flex-1">{page.label}</span>
                  {currentPath === page.path && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
