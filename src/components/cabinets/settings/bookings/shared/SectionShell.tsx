/**
 * SectionShell — спільна обгортка для секцій налаштувань салону.
 * Стандартизує заголовок, опис, інлайн-дії та демо-бейдж.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Бейдж «Демо-режим» у правому верхньому куті */
  demoMode?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SectionShell({
  title,
  description,
  actions,
  demoMode = true,
  className,
  children,
}: SectionShellProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            {demoMode && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide font-medium">
                Демо
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

interface ComingSoonNoteProps {
  children: React.ReactNode;
}

/** Маленька картка-нотатка «скоро» для секцій-стабів. */
export function ComingSoonNote({ children }: ComingSoonNoteProps) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
