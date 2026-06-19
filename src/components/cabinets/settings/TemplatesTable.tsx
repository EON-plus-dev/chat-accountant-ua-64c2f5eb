import { useState, useCallback } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Eye,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useSortState, type SortDirection } from "@/hooks/use-sort-state";
import { SortableHeader } from "@/components/ui/sortable-header";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";

type TemplateSortKey = "name" | "type" | "category" | "usageCount" | "lastModified";

interface TemplatesTableProps {
  templates: DocumentTemplate[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onNavigateToDetail?: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
  onDuplicate?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
}

const categoryLabels: Record<string, string> = {
  system: "Системний",
  custom: "Мій",
};

const typeLabels: Record<string, string> = {
  invoice: "Рахунок",
  act: "Акт",
  waybill: "Накладна",
  ttn: "ТТН",
  "tax-invoice": "Податкова накладна",
  contract: "Договір",
  "rental-agreement": "Оренда",
  "sale-agreement": "Купівля-продаж",
  "supply-contract": "Поставка",
  "fop-service-contract": "ФОП-послуги",
  "employment-order": "Наказ прийняття",
  "dismissal-order": "Наказ звільнення",
  "vacation-order": "Наказ відпустка",
  "power-of-attorney": "Довіреність",
  reconciliation: "Акт звірки",
};

export const TemplatesTable = ({
  templates,
  selectedIds,
  onSelectionChange,
  onNavigateToDetail,
  onEdit,
  onDuplicate,
  onDelete,
}: TemplatesTableProps) => {
  const isMobile = useIsMobile();
  const { sort, handleSort } = useSortState<TemplateSortKey>("name", "asc");

  // Sort templates
  const sortedTemplates = [...templates].sort((a, b) => {
    const dir = sort.direction === "asc" ? 1 : -1;
    
    switch (sort.key) {
      case "name":
        return a.name.localeCompare(b.name, "uk") * dir;
      case "type":
        return (typeLabels[a.type] || a.type).localeCompare(typeLabels[b.type] || b.type, "uk") * dir;
      case "category":
        return a.category.localeCompare(b.category) * dir;
      case "usageCount":
        return (a.usageCount - b.usageCount) * dir;
      case "lastModified":
        return (new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()) * dir;
      default:
        return 0;
    }
  });

  const allSelected = templates.length > 0 && selectedIds.size === templates.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < templates.length;

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(templates.map(t => t.id)));
    }
  }, [allSelected, templates, onSelectionChange]);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);

  // Mobile: Card view
  if (isMobile) {
    return (
      <div className="space-y-2">
        {sortedTemplates.map((template) => {
          const TemplateIcon = template.icon;
          return (
            <div
              key={template.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onNavigateToDetail?.(template.id)}
            >
              <Checkbox
                checked={selectedIds.has(template.id)}
                onCheckedChange={(checked) => {
                  handleSelectOne(template.id, !!checked);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="rounded-lg bg-muted p-2 shrink-0">
                <TemplateIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{template.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {typeLabels[template.type] || template.type}
                  </Badge>
                  {template.category === "system" && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Системний
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop: Table view
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table containerClassName="max-h-[400px] overflow-auto">
        <TableHeader sticky>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
                aria-label="Обрати всі"
              />
            </TableHead>
            <SortableHeader<TemplateSortKey>
              field="name"
              label="Назва"
              currentField={sort.key}
              direction={sort.direction}
              onSort={handleSort}
            />
            <SortableHeader<TemplateSortKey>
              field="type"
              label="Тип"
              currentField={sort.key}
              direction={sort.direction}
              onSort={handleSort}
              className="w-[120px]"
            />
            <SortableHeader<TemplateSortKey>
              field="category"
              label="Категорія"
              currentField={sort.key}
              direction={sort.direction}
              onSort={handleSort}
              className="w-[100px]"
            />
            <SortableHeader<TemplateSortKey>
              field="usageCount"
              label="Використано"
              currentField={sort.key}
              direction={sort.direction}
              onSort={handleSort}
              className="w-[100px]"
              numeric
            />
            <SortableHeader<TemplateSortKey>
              field="lastModified"
              label="Оновлено"
              currentField={sort.key}
              direction={sort.direction}
              onSort={handleSort}
              className="w-[120px]"
            />
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTemplates.map((template) => {
            const TemplateIcon = template.icon;
            return (
              <TableRow
                key={template.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onNavigateToDetail?.(template.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(template.id)}
                    onCheckedChange={(checked) => handleSelectOne(template.id, !!checked)}
                    aria-label={`Обрати ${template.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg bg-muted p-2 shrink-0">
                      <TemplateIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[template.type] || template.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={template.category === "system" ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {categoryLabels[template.category]}
                  </Badge>
                </TableCell>
                <TableCell numeric>
                  <span className="text-sm text-muted-foreground">
                    {template.usageCount.toLocaleString("uk")}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(template.lastModified).toLocaleDateString("uk")}
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onNavigateToDetail?.(template.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Переглянути
                      </DropdownMenuItem>
                      {template.category === "custom" && (
                        <DropdownMenuItem onClick={() => onEdit?.(template.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редагувати
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onDuplicate?.(template.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Дублювати
                      </DropdownMenuItem>
                      {template.category === "custom" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(template.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Видалити
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
