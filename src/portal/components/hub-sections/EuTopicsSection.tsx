import { Card } from "@/components/ui/card";
import type { EuTopicsData } from "@/portal/types/hub";

interface Props {
  data: EuTopicsData;
}

export const EuTopicsSection = ({ data }: Props) => (
  <div className="grid md:grid-cols-3 gap-4">
    {data.items.map((t) => (
      <Card key={t.title} className="p-5 space-y-2">
        <p className="font-semibold text-foreground">{t.title}</p>
        <p className="text-sm text-muted-foreground">{t.desc}</p>
      </Card>
    ))}
  </div>
);
