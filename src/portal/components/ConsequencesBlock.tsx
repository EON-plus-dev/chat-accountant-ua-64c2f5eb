import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  text: string;
  title?: string;
}

export const ConsequencesBlock = ({ text, title = "Що буде, якщо проігнорувати" }: Props) => (
  <Card className="border-l-4 border-l-destructive/60 bg-destructive/5 p-3 sm:p-5 space-y-2">
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-5 w-5 text-destructive" />
      <h2 className="text-base sm:text-lg font-semibold text-foreground">🚫 {title}</h2>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
  </Card>
);
