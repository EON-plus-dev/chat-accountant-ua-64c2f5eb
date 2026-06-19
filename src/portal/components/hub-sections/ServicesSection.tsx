import { Link } from "react-router-dom";
import type { ServicesData } from "@/portal/types/hub";

interface Props {
  data: ServicesData;
}

const GRID_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export const ServicesSection = ({ data }: Props) => (
  <div className={`grid grid-cols-1 ${GRID_COLS[data.columns ?? 2] ?? "sm:grid-cols-2"} gap-3`}>
    {data.items.map((item) => (
      <Link
        key={item.href}
        to={item.href}
        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors"
      >
        <span className="text-lg">{item.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{item.name}</p>
          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
        </div>
      </Link>
    ))}
  </div>
);
