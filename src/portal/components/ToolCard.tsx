import { UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/portal/data/tools";

const CATEGORY_COLORS: Record<string, string> = {
  calculator: "border-t-blue-500",
  calendar: "border-t-amber-500",
  constructor: "border-t-violet-500",
  reference: "border-t-emerald-500",
  management: "border-t-orange-500",
  hr: "border-t-pink-500",
  documents: "border-t-cyan-500",
  generator: "border-t-teal-500",
};

interface Props {
  tool: Tool;
}

export const ToolCard = ({ tool }: Props) => {
  const borderColor = CATEGORY_COLORS[tool.category] ?? "border-t-primary";

  if (tool.isPremium) {
    return (
      <Link to="/register" className="block group">
        <Card className={`relative p-4 sm:p-5 border-t-2 ${borderColor} backdrop-blur-sm h-full flex flex-col transition-colors group-hover:border-primary/40`}>
          <UserPlus className="absolute top-4 right-4 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <div className="flex items-center gap-2.5">
            <span className="text-xl leading-none">{tool.emoji}</span>
            <h3 className="font-bold text-foreground text-sm">{tool.name}</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2 flex-1">{tool.description}</p>
          <div className="mt-3">
            <p className="text-[11px] text-primary font-medium">Доступно в кабінеті</p>
            <p className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">Зареєструйтесь →</p>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/tools/${tool.slug}`} className="block group">
      <Card className={`p-4 sm:p-5 border-t-2 ${borderColor} h-full flex flex-col transition-colors group-hover:border-primary/40`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-lg sm:text-xl leading-none">{tool.emoji}</span>
            <h3 className="font-bold text-foreground text-sm">{tool.name}</h3>
          </div>
          {tool.isNew && (
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider shrink-0">
              New
            </Badge>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2 flex-1">{tool.description}</p>
        {tool.usageCount > 0 && (
          <p className="mt-3 text-[11px] font-mono text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {tool.usageCount.toLocaleString("uk-UA")}
          </p>
        )}
      </Card>
    </Link>
  );
};
