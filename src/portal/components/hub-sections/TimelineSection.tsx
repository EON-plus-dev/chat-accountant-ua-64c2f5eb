import { DEADLINES } from "@/portal/data/deadlines";
import { DeadlineCard } from "@/portal/components/DeadlineCard";
import type { TimelineData } from "@/portal/types/hub";

interface Props {
  data: TimelineData;
}

export const TimelineSection = ({ data }: Props) => {
  const deadlines = DEADLINES
    .filter((d) => !data.taxType || d.taxType === data.taxType || d.taxType === "all")
    .filter((d) => d.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, data.limit ?? 3);

  if (deadlines.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {deadlines.map((d) => (
        <DeadlineCard key={d.id} deadline={d} />
      ))}
    </div>
  );
};
