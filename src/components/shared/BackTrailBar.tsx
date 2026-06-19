/**
 * BackTrailBar — тонка смужка зверху, що показує «← Повернутись до: <label>»
 * коли користувач прийшов на сторінку через drill «Відкрити повну сторінку»
 * або через email-deep-link з параметром `?from=`.
 *
 * Якщо trail немає — компонент не рендерить нічого.
 *
 * Підключається в layout верхнього рівня (Dashboard, AdminLayout тощо).
 */

import { ChevronLeft } from "lucide-react";
import { useBackTrail } from "@/hooks/useBackTrail";
import { cn } from "@/lib/utils";

interface BackTrailBarProps {
  className?: string;
}

export function BackTrailBar({ className }: BackTrailBarProps) {
  const { trail, goBack } = useBackTrail();

  if (!trail) return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-30 w-full border-b bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40",
        className,
      )}
    >
      <button
        type="button"
        onClick={goBack}
        className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          Повернутися до: <span className="font-medium">{trail.label}</span>
        </span>
      </button>
    </div>
  );
}
