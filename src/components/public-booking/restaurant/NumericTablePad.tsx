/**
 * Велика touch-friendly цифрова клавіатура для введення номера столика.
 * Mobile-first, кнопки ≥56px.
 */

import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (next: string) => void;
  maxDigits?: number;
  accent?: string;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "<"] as const;

export function NumericTablePad({ value, onChange, maxDigits = 2, accent }: Props) {
  const press = (k: string) => {
    if (k === "C") return onChange("");
    if (k === "<") return onChange(value.slice(0, -1));
    if (value.length >= maxDigits) return;
    onChange((value + k).replace(/^0+/, ""));
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => {
        const isDigit = /^[0-9]$/.test(k);
        return (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className={cn(
              "min-h-[56px] rounded-xl border text-xl font-semibold transition-all",
              "active:scale-95 active:bg-muted",
              isDigit ? "bg-card hover:bg-muted" : "bg-muted/40 text-muted-foreground hover:bg-muted",
            )}
            style={isDigit && value && k === value.slice(-1) ? { borderColor: accent } : undefined}
            aria-label={k === "<" ? "Стерти" : k === "C" ? "Очистити" : `Цифра ${k}`}
          >
            {k === "<" ? <Delete className="w-5 h-5 mx-auto" /> : k}
          </button>
        );
      })}
    </div>
  );
}
