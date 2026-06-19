import { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { ScopeBadge } from "@/components/ScopeBadge";



interface SystemPageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Спільний контейнер для всіх сторінок розділу «Система». */
export function SystemPageShell({ title, description, actions, children }: SystemPageShellProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <nav className="text-xs text-muted-foreground flex items-center gap-1">
        <NavLink to="/admin" className="hover:text-foreground">Адмін</NavLink>
        <ChevronRight className="h-3 w-3" />
        <NavLink to="/admin/system" className="hover:text-foreground">Система</NavLink>
        {title !== "Огляд системи" && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{title}</span>
          </>
        )}
      </nav>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <ScopeBadge scope="platform" />
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
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
