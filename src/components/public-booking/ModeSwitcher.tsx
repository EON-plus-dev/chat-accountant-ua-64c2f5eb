import { Zap, MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingMode } from "@/lib/publicBooking/types";

interface Props {
  value: BookingMode;
  onChange: (m: BookingMode) => void;
  enabled: BookingMode[];
}

const ITEMS: Array<{
  id: BookingMode;
  label: string;
  shortLabel: string;
  icon: typeof Zap;
  hint: string;
}> = [
  { id: "wizard", label: "Швидкий запис", shortLabel: "Швидкий", icon: Zap, hint: "За 30 секунд" },
  { id: "ai-chat", label: "AI-консʼєрж", shortLabel: "AI-чат", icon: MessageSquare, hint: "Напишіть побажання" },
  { id: "ai-call", label: "Подзвонити AI", shortLabel: "Дзвінок", icon: Phone, hint: "Голосом у браузері" },
];

export function ModeSwitcher({ value, onChange, enabled }: Props) {
  const visible = ITEMS.filter((i) => enabled.includes(i.id));
  return (
    <div
      role="tablist"
      aria-label="Канали запису"
      className="grid grid-cols-3 gap-1 p-1 md:p-1.5 rounded-xl border bg-card shadow-sm"
    >
      {visible.map((item) => {
        const Icon = item.icon;
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 md:gap-1 rounded-lg px-2 py-2 md:py-2.5 transition-all text-center min-h-[52px] md:min-h-[64px]",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted text-foreground",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="text-[11px] md:text-xs font-semibold leading-tight">
              <span className="md:hidden">{item.shortLabel}</span>
              <span className="hidden md:inline">{item.label}</span>
            </span>
            <span
              className={cn(
                "text-[10px] leading-tight hidden md:block",
                active ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {item.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
