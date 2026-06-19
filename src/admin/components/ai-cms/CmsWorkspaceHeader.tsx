import { RefreshCw, Eye, Pencil, Search, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CmsUrlChip from "./CmsUrlChip";
import type { CmsWorkspaceTab, PreviewMode } from "./CmsWorkspaceTabs";

interface CmsWorkspaceHeaderProps {
  activeTab: CmsWorkspaceTab;
  currentPath: string;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
}

const MODES: { id: PreviewMode; label: string; icon: typeof Eye }[] = [
  { id: "page", label: "Перегляд", icon: Eye },
  { id: "edit", label: "Редагувати", icon: Pencil },
  { id: "seo", label: "SEO", icon: Search },
  { id: "analytics", label: "Аналітика", icon: BarChart3 },
];

export default function CmsWorkspaceHeader({
  activeTab,
  currentPath,
  previewMode,
  onPreviewModeChange,
  onNavigate,
  onRefresh,
}: CmsWorkspaceHeaderProps) {
  if (activeTab !== "preview") return null;

  return (
    <div className="flex-shrink-0 min-h-10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-2 sm:px-3 py-1.5 sm:py-0 border-b border-border/60 bg-muted/30">
      <div className="flex items-center gap-2 min-w-0">
        <CmsUrlChip currentPath={currentPath} onNavigate={onNavigate} />
      </div>

      <div className="flex items-center gap-1 bg-background/80 border border-border/60 rounded-md p-0.5">
        {MODES.map((m) => {
          const isActive = previewMode === m.id;
          return (
            <Button
              key={m.id}
              variant="ghost"
              size="sm"
              onClick={() => onPreviewModeChange(m.id)}
              className={cn(
                "h-7 px-2 gap-1.5 text-xs rounded-sm",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={m.label}
            >
              <m.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{m.label}</span>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        {previewMode === "page" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 px-2 text-xs gap-1.5"
            aria-label="Оновити перегляд"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Оновити</span>
          </Button>
        )}
      </div>
    </div>
  );
}
