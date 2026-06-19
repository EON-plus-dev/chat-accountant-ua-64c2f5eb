import { BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  text: string;
  title?: string;
}

export const PracticalExampleBlock = ({ text, title = "Практичний приклад" }: Props) => (
  <Card className="bg-muted/40 border-muted p-3 sm:p-5 space-y-2">
    <div className="flex items-center gap-2">
      <BookOpen className="h-5 w-5 text-muted-foreground" />
      <h2 className="text-base sm:text-lg font-semibold text-foreground">💡 {title}</h2>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed italic">{text}</p>
  </Card>
);
