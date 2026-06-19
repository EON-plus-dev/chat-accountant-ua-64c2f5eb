import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const Separator = () => (
  <span aria-hidden className="text-muted-foreground/40 select-none px-0.5">
    /
  </span>
);

export const BreadcrumbNav = ({ items }: Props) => {
  if (!items.length) return null;

  const last = items[items.length - 1];
  const prev = items.length > 1 ? items[items.length - 2] : null;

  // Desktop collapse: keep first + … + last two if more than 4 levels.
  const desktopVisible: Array<BreadcrumbItem | { collapsed: BreadcrumbItem[] }> =
    items.length <= 4
      ? items
      : [
          items[0],
          { collapsed: items.slice(1, -2) },
          ...items.slice(-2),
        ];

  return (
    <nav
      aria-label="Хлібні крихти"
      className="py-2 sm:py-2.5"
    >
      {/* Mobile: ‹ Prev / Current */}
      <ol className="flex sm:hidden items-center gap-1.5 text-xs h-7 min-w-0">
        {prev?.to ? (
          <li className="flex items-center min-w-0 shrink-0">
            <Link
              to={prev.to}
              className="inline-flex items-center gap-0.5 -ml-1 px-1 py-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors max-w-[40vw]"
              aria-label={`Назад до ${prev.label}`}
            >
              <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{prev.label}</span>
            </Link>
            <Separator />
          </li>
        ) : null}
        <li className="min-w-0 flex-1">
          <span
            aria-current="page"
            className="block truncate text-foreground"
            title={last.label}
          >
            {last.label}
          </span>
        </li>
      </ol>

      {/* Desktop: full path with mid-collapse */}
      <ol className="hidden sm:flex items-center gap-1.5 text-sm h-8 min-w-0">
        {desktopVisible.map((entry, idx) => {
          const isLast = idx === desktopVisible.length - 1;
          const isCollapsed = "collapsed" in entry;

          return (
            <li
              key={idx}
              className={`flex items-center gap-1.5 min-w-0 ${
                isLast ? "flex-1" : "shrink-0"
              }`}
            >
              {idx > 0 && <Separator />}
              {isCollapsed ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    aria-label="Показати приховані рівні"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[12rem]">
                    {entry.collapsed.map((c, i) =>
                      c.to ? (
                        <DropdownMenuItem key={i} asChild>
                          <Link to={c.to}>{c.label}</Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem key={i} disabled>
                          {c.label}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isLast ? (
                <span
                  aria-current="page"
                  className="truncate text-foreground"
                  title={entry.label}
                >
                  {entry.label}
                </span>
              ) : entry.to ? (
                <Link
                  to={entry.to}
                  className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap max-w-[12rem] truncate"
                  title={entry.label}
                >
                  {entry.label}
                </Link>
              ) : (
                <span className="text-muted-foreground whitespace-nowrap max-w-[12rem] truncate">
                  {entry.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
