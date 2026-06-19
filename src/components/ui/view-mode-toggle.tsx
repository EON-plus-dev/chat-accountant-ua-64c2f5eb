import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Network, FileText, PanelLeftClose, LayoutGrid, BarChart3, Table as TableIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavigationViewMode = "list" | "graph";
export type DocumentViewMode = "text" | "split";
export type TemplateViewMode = "list" | "grid";
export type CreditViewMode = "list" | "analytics";
export type AnalyticsViewMode = "chart" | "table";

// Props for navigation mode (list/graph)
interface NavigationViewModeToggleProps {
  value: NavigationViewMode;
  onChange: (value: NavigationViewMode) => void;
  mode?: "navigation";
  listLabel?: string;
  graphLabel?: string;
  className?: string;
}

// Props for document mode (text/split)
interface DocumentViewModeToggleProps {
  value: DocumentViewMode;
  onChange: (value: DocumentViewMode) => void;
  mode: "document";
  textLabel?: string;
  splitLabel?: string;
  className?: string;
}

// Props for template mode (list/grid)
interface TemplateViewModeToggleProps {
  value: TemplateViewMode;
  onChange: (value: TemplateViewMode) => void;
  mode: "templates";
  listLabel?: string;
  gridLabel?: string;
  className?: string;
}

// Props for credit usage mode (list/analytics)
interface CreditViewModeToggleProps {
  value: CreditViewMode;
  onChange: (value: CreditViewMode) => void;
  mode: "credits";
  listLabel?: string;
  analyticsLabel?: string;
  className?: string;
}

// Props for analytics mode (chart/table)
interface AnalyticsViewModeToggleProps {
  value: AnalyticsViewMode;
  onChange: (value: AnalyticsViewMode) => void;
  mode: "analytics";
  chartLabel?: string;
  tableLabel?: string;
  showLabels?: boolean;
  className?: string;
}

type ViewModeToggleProps =
  | NavigationViewModeToggleProps
  | DocumentViewModeToggleProps
  | TemplateViewModeToggleProps
  | CreditViewModeToggleProps
  | AnalyticsViewModeToggleProps;

/**
 * Уніфікований компонент для перемикання view modes.
 * mode="navigation": list/graph (для DocumentRelationshipsTab)
 * mode="document": text/split (для DocumentViewerTab)
 * mode="templates": list/grid (для TemplateSelector)
 */
export const ViewModeToggle = (props: ViewModeToggleProps) => {
  // Credits mode: list/analytics
  if (props.mode === "credits") {
    const { value, onChange, className } = props;
    return (
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={(v) => v && onChange(v as CreditViewMode)}
        className={cn("bg-muted p-0.5 rounded-lg", className)}
      >
        <ToggleGroupItem 
          value="list" 
          aria-label="Список"
          className="gap-1 text-xs h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <List className="w-3.5 h-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="analytics" 
          aria-label="Аналітика"
          className="gap-1 text-xs h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <BarChart3 className="w-3.5 h-3.5" />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

  // Template mode: list/grid
  if (props.mode === "templates") {
    const { value, onChange, listLabel = "Список", gridLabel = "Сітка", className } = props;
    return (
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={(v) => v && onChange(v as TemplateViewMode)}
        className={cn("bg-muted p-0.5 rounded-lg", className)}
      >
        <ToggleGroupItem 
          value="list" 
          aria-label={listLabel}
          className="gap-1 text-xs h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <List className="w-3.5 h-3.5" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="grid" 
          aria-label={gridLabel}
          className="gap-1 text-xs h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

  // Document mode: text/split
  if (props.mode === "document") {
    const { value, onChange, textLabel = "Текст", splitLabel = "Порівняння", className } = props;
    return (
      <ToggleGroup 
        type="single" 
        value={value} 
        onValueChange={(v) => v && onChange(v as DocumentViewMode)}
        className={cn("bg-muted p-0.5 rounded-lg", className)}
      >
        <ToggleGroupItem 
          value="text" 
          aria-label={textLabel}
          className="gap-1.5 text-xs h-7 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          {textLabel}
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="split" 
          aria-label={splitLabel}
          className="gap-1.5 text-xs h-7 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
          {splitLabel}
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

  // Analytics mode: chart/table
  if (props.mode === "analytics") {
    const { value, onChange, chartLabel = "Графік", tableLabel = "Таблиця", showLabels = false, className } = props;
    return (
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as AnalyticsViewMode)}
        className={cn("bg-muted p-0.5 rounded-lg", className)}
      >
        <ToggleGroupItem
          value="chart"
          aria-label={chartLabel}
          className="gap-1.5 text-xs h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          {showLabels && chartLabel}
        </ToggleGroupItem>
        <ToggleGroupItem
          value="table"
          aria-label={tableLabel}
          className="gap-1.5 text-xs h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <TableIcon className="w-3.5 h-3.5" />
          {showLabels && tableLabel}
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }

  // Navigation mode: list/graph (default)
  const { value, onChange, listLabel = "Список", graphLabel = "Граф", className } = props;
  return (
    <ToggleGroup 
      type="single" 
      value={value} 
      onValueChange={(v) => v && onChange(v as NavigationViewMode)}
      className={cn("bg-muted p-0.5 rounded-lg", className)}
    >
      <ToggleGroupItem 
        value="list" 
        aria-label={listLabel}
        className="gap-1.5 text-xs h-7 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <List className="w-3.5 h-3.5" />
        {listLabel}
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="graph" 
        aria-label={graphLabel}
        className="gap-1.5 text-xs h-7 px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
      >
        <Network className="w-3.5 h-3.5" />
        {graphLabel}
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
