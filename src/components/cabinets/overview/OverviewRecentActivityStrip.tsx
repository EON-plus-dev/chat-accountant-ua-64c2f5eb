import { Calendar, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecentEvent } from "@/config/overviewConfig";
import { useOverviewBp } from "./OverviewBpContext";

interface Props {
  title: string;
  events: RecentEvent[];
  onOpenAll: () => void;
  ctaLabel: string;
}

export function OverviewRecentActivityStrip({ title, events, onOpenAll, ctaLabel }: Props) {
  const { isAtLeast } = useOverviewBp();
  if (!events.length) return null;
  const wrapper = isAtLeast("lg")
    ? "rounded-lg"
    : "rounded-lg border border-border/60 bg-card";
  return (
    <section className={cn("p-3 md:p-4", wrapper)}>
      <header className="flex items-center justify-between mb-2">
        <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Calendar className="w-4 h-4 text-primary" />
          {title}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 text-muted-foreground hover:text-foreground"
          onClick={onOpenAll}
        >
          {ctaLabel}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </header>
      <ul className="divide-y divide-border/50">
        {events.map((ev) => (
          <li
            key={ev.id}
            className="flex items-center gap-3 py-2 group cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded-md transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
              <ev.icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{ev.text}</p>
              <p className="text-xs text-muted-foreground">{ev.time}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          </li>
        ))}
      </ul>
    </section>
  );
}
