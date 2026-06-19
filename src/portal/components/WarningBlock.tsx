import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  items: string[];
  title?: string;
}

export const WarningBlock = ({ items, title = "Зверніть увагу" }: Props) => (
  <Card className="border-l-4 border-l-amber-500 bg-amber-500/5 p-3 sm:p-5 space-y-2 sm:space-y-3">
    <div className="flex items-center gap-2">
      <ShieldAlert className="h-5 w-5 text-amber-600" />
      <h2 className="text-base sm:text-lg font-semibold text-foreground">⚠️ {title}</h2>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span className="text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  </Card>
);
