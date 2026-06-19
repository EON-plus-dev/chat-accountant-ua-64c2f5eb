import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { TopicsData } from "@/portal/types/hub";

interface Props {
  data: TopicsData;
}

export const TopicsSection = ({ data }: Props) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
    {data.items.map((item) => (
      <Link key={item.slug} to={`${data.linkPrefix ?? ''}${item.slug}`}>
        <Card className="p-3 space-y-1 h-full cursor-pointer hover:border-primary/40 transition-colors border-l-2 border-l-primary/30">
          <p className="font-semibold text-xs text-foreground truncate">{item.label}</p>
          {item.count !== undefined && (
            <p className="text-[10px] text-muted-foreground font-mono">{item.count}</p>
          )}
        </Card>
      </Link>
    ))}
  </div>
);
