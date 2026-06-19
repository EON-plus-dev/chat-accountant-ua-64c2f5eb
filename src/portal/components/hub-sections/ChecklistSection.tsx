import { CheckCircle2, Check } from "lucide-react";
import type { ChecklistData } from "@/portal/types/hub";

interface Props {
  data: ChecklistData;
}

export const ChecklistSection = ({ data }: Props) => {
  if (data.variant === "numbered") {
    return (
      <ol className="space-y-3 list-decimal list-inside">
        {data.items.map((item) => (
          <li key={item} className="text-sm text-muted-foreground">{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="space-y-2">
      {data.items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span className="text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
};
