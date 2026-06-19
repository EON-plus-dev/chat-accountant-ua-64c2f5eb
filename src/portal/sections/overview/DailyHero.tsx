import { CalendarDays } from "lucide-react";
import { SNAPSHOT_AS_OF } from "@/portal/data/knowledge/registry";
import { formatAsOf } from "@/portal/data/knowledge/resolvers";

export const DailyHero = () => {
  return (
    <section className="pt-8 pb-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>Станом на {formatAsOf(SNAPSHOT_AS_OF)}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Огляд дня
          </h1>
        </div>
      </div>
    </section>
  );
};
