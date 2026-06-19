import { useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  RefreshCw,
  Settings,
  FileText,
  Pause,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { type DataSource, type DataSourceStatus, categoryLabels, type DataSourceCategory } from "@/config/dataSourcesConfig";
import { useSortState } from "@/hooks/use-sort-state";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { cn } from "@/lib/utils";

interface ConnectionsTableProps {
  connections: DataSource[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onSettingsClick: (connection: DataSource) => void;
  onSyncClick: (connection: DataSource) => void;
  onLogClick: (connectionId: string, connectionName: string) => void;
  onPauseClick: (connection: DataSource) => void;
  onDisconnectClick: (connection: DataSource) => void;
}

const statusConfig: Record<DataSourceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle; dotColor: string }> = {
  active: { label: "Активне", variant: "default", icon: CheckCircle, dotColor: "bg-green-500" },
  pending: { label: "Очікує", variant: "outline", icon: Clock, dotColor: "bg-yellow-500" },
  inactive: { label: "Неактивне", variant: "secondary", icon: XCircle, dotColor: "bg-muted-foreground" },
  error: { label: "Помилка", variant: "destructive", icon: AlertCircle, dotColor: "bg-destructive" },
};

export const ConnectionsTable = ({
  connections,
  selectedIds,
  onSelectionChange,
  onSettingsClick,
  onSyncClick,
  onLogClick,
  onPauseClick,
  onDisconnectClick,
}: ConnectionsTableProps) => {
  const { sort, handleSort } = useSortState<string>("name", "asc");

  const sortedConnections = useMemo(() => {
    return [...connections].sort((a, b) => {
      let comparison = 0;
      switch (sort.key) {
        case "name":
          comparison = a.name.localeCompare(b.name, "uk");
          break;
        case "category":
          comparison = (categoryLabels[a.category] || "").localeCompare(categoryLabels[b.category] || "", "uk");
          break;
        case "status":
          const statusOrder = { active: 0, pending: 1, error: 2, inactive: 3 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "records":
          comparison = (a.recordsCount || 0) - (b.recordsCount || 0);
          break;
        case "lastSync":
          comparison = new Date(a.lastSync || 0).getTime() - new Date(b.lastSync || 0).getTime();
          break;
        case "quality":
          comparison = (a.dataQualityPercent || 0) - (b.dataQualityPercent || 0);
          break;
      }
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [connections, sort.key, sort.direction]);

  const allSelected = connections.length > 0 && selectedIds.size === connections.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < connections.length;

  const toggleAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(connections.map(c => c.id)));
    }
  }, [allSelected, connections, onSelectionChange]);

  const toggleOne = useCallback((id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    onSelectionChange(newSet);
  }, [selectedIds, onSelectionChange]);

  return (
    <Table containerClassName="max-h-[calc(100vh-380px)] overflow-auto rounded-lg border">
      <TableHeader sticky>
        <TableRow>
          <TableHead className="w-[40px]">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) (el as HTMLButtonElement).dataset.indeterminate = someSelected ? "true" : "false";
              }}
              onCheckedChange={toggleAll}
              aria-label="Обрати всі"
            />
          </TableHead>
          <TableHead
            sortable
            sorted={sort.key === "name"}
            sortDirection={sort.key === "name" ? sort.direction : null}
            onSort={() => handleSort("name")}
          >
            Підключення
          </TableHead>
          <TableHead
            className="w-[110px]"
            sortable
            sorted={sort.key === "category"}
            sortDirection={sort.key === "category" ? sort.direction : null}
            onSort={() => handleSort("category")}
          >
            Категорія
          </TableHead>
          <TableHead
            className="w-[100px]"
            sortable
            sorted={sort.key === "status"}
            sortDirection={sort.key === "status" ? sort.direction : null}
            onSort={() => handleSort("status")}
          >
            Статус
          </TableHead>
          <TableHead
            className="w-[90px]"
            numeric
            sortable
            sorted={sort.key === "records"}
            sortDirection={sort.key === "records" ? sort.direction : null}
            onSort={() => handleSort("records")}
          >
            Записів
          </TableHead>
          <TableHead
            className="w-[110px]"
            sortable
            sorted={sort.key === "lastSync"}
            sortDirection={sort.key === "lastSync" ? sort.direction : null}
            onSort={() => handleSort("lastSync")}
          >
            Синхр.
          </TableHead>
          <TableHead
            className="w-[90px]"
            sortable
            sorted={sort.key === "quality"}
            sortDirection={sort.key === "quality" ? sort.direction : null}
            onSort={() => handleSort("quality")}
          >
            Якість
          </TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedConnections.map((connection) => {
          const status = statusConfig[connection.status];
          const ConnectionIcon = connection.icon;
          const isSelected = selectedIds.has(connection.id);

          return (
            <TableRow
              key={connection.id}
              className={cn(
                "cursor-pointer",
                isSelected && "bg-muted/60"
              )}
              onClick={() => onSettingsClick(connection)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleOne(connection.id)}
                  aria-label={`Обрати ${connection.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="rounded-md bg-muted p-1.5 shrink-0">
                    <ConnectionIcon className="h-4 w-4" />
                  </div>
                  <span className="font-medium truncate max-w-[180px]">{connection.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[connection.category as DataSourceCategory] || connection.category}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", status.dotColor)} />
                  <span className="text-xs">{status.label}</span>
                </div>
              </TableCell>
              <TableCell numeric>
                {connection.recordsCount !== undefined
                  ? connection.recordsCount.toLocaleString("uk-UA")
                  : "—"}
              </TableCell>
              <TableCell>
                {connection.lastSync ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground cursor-default">
                        {formatDistanceToNow(new Date(connection.lastSync), { addSuffix: false, locale: uk })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {new Date(connection.lastSync).toLocaleString("uk-UA")}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {connection.dataQualityPercent !== undefined ? (
                  <div className="flex items-center gap-1.5">
                    <Progress
                      value={connection.dataQualityPercent}
                      className="h-1.5 w-12"
                    />
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        connection.dataQualityPercent >= 90
                          ? "text-green-600"
                          : connection.dataQualityPercent >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                      )}
                    >
                      {connection.dataQualityPercent}%
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onSyncClick(connection)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Синхронізувати
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onLogClick(connection.id, connection.name)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Журнал
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSettingsClick(connection)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Налаштування
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onPauseClick(connection)}>
                      <Pause className="h-4 w-4 mr-2" />
                      Призупинити
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDisconnectClick(connection)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Відключити
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ConnectionsTable;
