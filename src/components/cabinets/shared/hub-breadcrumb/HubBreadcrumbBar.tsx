import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { HubCrumb } from "./HubBreadcrumbContext";

interface Props {
  crumbs: HubCrumb[];
}

export function HubBreadcrumbBar({ crumbs }: Props) {
  const isMobile = useIsMobile();
  if (crumbs.length < 2) return null;

  return (
    <div className="sticky top-0 z-20 w-full px-4 md:px-6 py-1.5 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65 shadow-[0_1px_0_0_hsl(var(--border)/0.65)]">
      <div className="w-full max-w-6xl mx-auto">
        {isMobile ? <MobileTrail crumbs={crumbs} /> : <DesktopTrail crumbs={crumbs} />}
      </div>
    </div>
  );
}

function Sep() {
  return (
    <span
      aria-hidden
      className="inline-flex w-2.5 justify-center text-muted-foreground/60 select-none text-[11px] leading-none"
    >
      /
    </span>
  );
}

function CrumbLink({ c, isLast }: { c: HubCrumb; isLast: boolean }) {
  if (isLast || !c.onSelect) {
    return (
      <span
        aria-current={isLast ? "page" : undefined}
        className={cn(
          "inline-flex h-6 min-w-0 max-w-[28ch] items-center truncate rounded-md px-1.5 text-[12.5px] leading-none",
          isLast ? "text-foreground font-medium" : "text-muted-foreground",
        )}
      >
        {c.label}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={c.onSelect}
      className="inline-flex h-6 min-w-0 max-w-[28ch] items-center truncate rounded-md px-1.5 text-[12.5px] leading-none text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
    >
      {c.label}
    </button>
  );
}

function DesktopTrail({ crumbs }: { crumbs: HubCrumb[] }) {
  const collapse = crumbs.length > 4;
  if (!collapse) {
    return (
      <nav
        aria-label="breadcrumb"
        className="min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ol className="flex min-w-max items-center gap-0.5 whitespace-nowrap">
          {crumbs.map((c, i) => (
            <li key={c.id} className="flex items-center gap-0.5 min-w-0">
              {i > 0 && <Sep />}
              <CrumbLink c={c} isLast={i === crumbs.length - 1} />
            </li>
          ))}
        </ol>
      </nav>
    );
  }
  const first = crumbs[0];
  const middle = crumbs.slice(1, -2);
  const tail = crumbs.slice(-2);
  return (
    <nav
      aria-label="breadcrumb"
      className="flex min-w-0 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <CrumbLink c={first} isLast={false} />
      <Sep />
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-6 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground">
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {middle.map((c) => (
            <DropdownMenuItem key={c.id} onSelect={() => c.onSelect?.()}>
              {c.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {tail.map((c, i) => (
        <span key={c.id} className="flex items-center gap-0.5 min-w-0">
          <Sep />
          <CrumbLink c={c} isLast={i === tail.length - 1} />
        </span>
      ))}
    </nav>
  );
}

function MobileTrail({ crumbs }: { crumbs: HubCrumb[] }) {
  const last = crumbs[crumbs.length - 1];
  const prev = crumbs[crumbs.length - 2];
  // Mobile «‹» = повернення на попередній рівень (prev). Це симетрично
  // desktop-кліку по передостанній крихті: скидає extras і переходить угору
  // на батьківський підрозділ. Fallback на last.onSelect — лише якщо prev
  // невідомий (теоретично неможливо при crumbs.length >= 2).
  const handleBack = () => {
    if (prev?.onSelect) {
      prev.onSelect();
      return;
    }
    last?.onSelect?.();
  };
  return (
    <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1">
      <button
        type="button"
        onClick={handleBack}
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/70 hover:text-foreground before:absolute before:inset-[-6px] before:content-['']"
        aria-label={`Назад до ${prev?.label ?? ""}`}
      >
        <ChevronLeft className="w-5 h-5 shrink-0" />
      </button>
      <ol className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {crumbs.slice(1).map((c, i, arr) => (
          <li key={c.id} className="flex min-w-0 items-center gap-0.5">
            {i > 0 && <Sep />}
            <CrumbLink c={c} isLast={i === arr.length - 1} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
