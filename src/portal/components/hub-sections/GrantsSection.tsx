import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GrantsData } from "@/portal/types/hub";

interface Props {
  data: GrantsData;
}

export const GrantsSection = ({ data }: Props) => (
  <div className="grid md:grid-cols-2 gap-4">
    {data.items.map((g) => (
      <Card key={g.name} className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{g.org}</Badge>
          <Badge variant={g.type === 'grant' ? 'success' : 'info'} size="sm">
            {g.type === 'grant' ? 'Грант' : 'Кредит'}
          </Badge>
        </div>
        <p className="font-semibold text-foreground">{g.name}</p>
        <p className="text-xl font-bold text-primary font-mono">{g.amount}</p>
        <p className="text-xs text-muted-foreground">Дедлайн: {g.deadline}</p>
      </Card>
    ))}
  </div>
);
