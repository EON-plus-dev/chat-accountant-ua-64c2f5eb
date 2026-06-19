import { type ReactNode, useState } from "react";
import { ArrowLeft, MoreVertical, PanelRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UrgencyPill } from "./UrgencyPill";
import type { UnifiedStatus } from "@/lib/declarations/unifiedDeclarations";

const STATUS_TONE: Record<UnifiedStatus, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",
  in_review: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  ready: "bg-primary/10 text-primary border-primary/30",
  scheduled: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  submitted: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
};

interface DeclarationDetailShellProps {
  onBack: () => void;
  breadcrumb: string;
  title: string;
  badges?: ReactNode;
  status: UnifiedStatus;
  statusLabel: string;
  deadline: string;
  /** Метарядок: правова основа, версія форми, ставка тощо. */
  metaSlots?: ReactNode;
  /** Кнопки дій. На мобільному — згортаються в DropdownMenu. */
  actions?: ReactNode;
  /** 0–100. Якщо undefined — прогрес-бар прихований. */
  progressPercent?: number;
  progressTone?: "primary" | "blue" | "amber" | "emerald";
  /** Notice-блок (lock, on-review, fx-warning…). */
  notice?: ReactNode;
  /** Контентна частина (таби). */
  children: ReactNode;
  /** Sidebar. На мобільному — Drawer. */
  sidebar: ReactNode;
}

const PROGRESS_TONE: Record<NonNullable<DeclarationDetailShellProps["progressTone"]>, string> = {
  primary: "bg-primary",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
};

const HEADER_TONE: Record<NonNullable<DeclarationDetailShellProps["progressTone"]>, string> = {
  primary: "border-primary/20",
  blue: "border-blue-500/20",
  amber: "border-amber-500/20",
  emerald: "border-emerald-500/20",
};

export function DeclarationDetailShell({
  onBack,
  breadcrumb,
  title,
  badges,
  status,
  statusLabel,
  deadline,
  metaSlots,
  actions,
  progressPercent,
  progressTone = "primary",
  notice,
  children,
  sidebar,
}: DeclarationDetailShellProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Card className={cn("sticky top-0 z-10 shadow-sm", HEADER_TONE[progressTone])}>
        <CardContent className="p-4 md:p-6 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onBack} className="h-7 px-2 -ml-2">
                  <ArrowLeft className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground truncate">{breadcrumb}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg md:text-2xl font-semibold leading-tight">{title}</h2>
                {badges}
                <Badge className={cn("gap-1", STATUS_TONE[status])} variant="outline">
                  {statusLabel}
                </Badge>
                <UrgencyPill deadline={deadline} status={status} />
              </div>
              {metaSlots && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {metaSlots}
                </div>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <>
                <div className="hidden md:flex flex-wrap items-center gap-2">
                  {actions}
                  {isMobile === false && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden gap-1"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <PanelRight className="size-3.5" /> Деталі
                    </Button>
                  )}
                </div>
                <div className="flex md:hidden items-center gap-1">
                  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <PanelRight className="size-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[88vw] sm:w-[380px] overflow-y-auto">
                      <SheetHeader className="mb-3">
                        <SheetTitle>Деталі</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-3">{sidebar}</div>
                    </SheetContent>
                  </Sheet>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[220px] p-2 space-y-1">
                      {actions}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>

          {progressPercent !== undefined && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full transition-all", PROGRESS_TONE[progressTone])}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">{progressPercent}%</span>
            </div>
          )}

          {notice}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="min-w-0">{children}</div>
        <div className="hidden lg:block space-y-3">{sidebar}</div>
      </div>
    </div>
  );
}
