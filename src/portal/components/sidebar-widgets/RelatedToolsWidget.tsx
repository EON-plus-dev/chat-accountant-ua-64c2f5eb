import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import { TOOLS, type Tool } from "@/portal/data/tools";

interface Props {
  /** Tool IDs to show. If omitted, shows first 3 non-premium tools */
  toolIds?: string[];
}

export const RelatedToolsWidget = ({ toolIds }: Props) => {
  const tools: Tool[] = toolIds
    ? toolIds.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean) as Tool[]
    : TOOLS.filter((t) => !t.isPremium).slice(0, 3);

  if (tools.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        Інструменти
      </h4>
      <div className="space-y-2">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            to={`/tools/${tool.slug}`}
            className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors group"
          >
            <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs shrink-0">
              {tool.emoji}
            </span>
            <span className="truncate group-hover:underline">{tool.name}</span>
            {tool.usageCount > 0 && (
              <span className="ml-auto text-[10px] font-mono text-muted-foreground shrink-0">
                {(tool.usageCount / 1000).toFixed(1)}k
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
