import { MoreHorizontal, Eye, Pencil, UserMinus, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { useSortState } from "@/hooks/use-sort-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import type { Employee } from "@/config/employeesConfig";
import { 
  contractTypeConfig, 
  employeeStatusConfig,
  isMilitaryDocumentOutdated,
} from "@/config/employeesConfig";
import { MilitaryStatusBadge } from "./MilitaryStatusBadge";

interface EmployeesTableProps {
  employees: Employee[];
  onOpenEmployee: (employee: Employee) => void;
  onEditEmployee?: (employee: Employee) => void;
}

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "dd.MM.yyyy", { locale: uk });
  } catch {
    return dateStr;
  }
};

// Мобільна картка працівника
const EmployeeCard = ({ 
  employee, 
  onOpen, 
  onEdit,
  onTerminate,
  isOutdated,
}: { 
  employee: Employee; 
  onOpen: () => void;
  onEdit: () => void;
  onTerminate: () => void;
  isOutdated: boolean;
}) => {
  const statusConfig = employeeStatusConfig[employee.status];
  const contractConfig = contractTypeConfig[employee.contractType];
  const StatusIcon = statusConfig.icon;

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-all",
        isOutdated 
          ? "border-amber-300 bg-amber-50/50 dark:border-amber-700 dark:bg-amber-950/20 hover:border-amber-400" 
          : "hover:border-primary/50"
      )}
      onClick={onOpen}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="font-medium text-sm truncate">{employee.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{employee.position}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge 
                variant="secondary" 
                size="sm"
                className={cn("text-[11px]", statusConfig.className)}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <Badge 
                variant="outline" 
                size="sm"
                className="text-[11px]"
              >
                {contractConfig.shortLabel}
              </Badge>
              {employee.militaryStatus && 
               employee.militaryStatus !== "not-applicable" && 
               employee.militaryStatus !== "exempt" && (
                <MilitaryStatusBadge 
                  status={employee.militaryStatus}
                  documentDate={employee.militaryDocumentDate}
                  size="sm"
                />
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">з {formatDate(employee.startDate)}</p>
            {employee.endDate && (
              <p className="text-xs text-muted-foreground">до {formatDate(employee.endDate)}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EmployeesTable = ({ 
  employees, 
  onOpenEmployee,
  onEditEmployee,
}: EmployeesTableProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { sort, handleSort } = useSortState<string>("");

  // Сортування
  const sortedEmployees = [...employees].sort((a, b) => {
    if (!sort.key) return 0;
    
    let aVal: string;
    let bVal: string;
    
    switch (sort.key) {
      case "fullName":
        aVal = a.fullName;
        bVal = b.fullName;
        break;
      case "position":
        aVal = a.position;
        bVal = b.position;
        break;
      case "contractType":
        aVal = contractTypeConfig[a.contractType].label;
        bVal = contractTypeConfig[b.contractType].label;
        break;
      case "status":
        aVal = employeeStatusConfig[a.status].label;
        bVal = employeeStatusConfig[b.status].label;
        break;
      case "startDate":
        aVal = a.startDate;
        bVal = b.startDate;
        break;
      default:
        return 0;
    }
    
    const comparison = aVal.localeCompare(bVal, "uk");
    return sort.direction === "asc" ? comparison : -comparison;
  });

  const handleEdit = (employee: Employee) => {
    if (onEditEmployee) {
      onEditEmployee(employee);
    } else {
      toast({
        title: "Демо-режим",
        description: "Редагування буде доступне після запуску",
      });
    }
  };

  const handleTerminate = (employee: Employee) => {
    toast({
      title: "Демо-режим",
      description: `Позначення як звільненого: ${employee.fullName}`,
    });
  };

  if (employees.length === 0) {
    return (
      <div className="border rounded-lg">
        <TableEmptyState
          title="Працівників не знайдено"
          description="Додайте першого працівника або змініть фільтри"
        />
      </div>
    );
  }

  // Мобільний вигляд
  if (isMobile) {
    return (
      <div className="space-y-2">
        {sortedEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onOpen={() => onOpenEmployee(employee)}
            onEdit={() => handleEdit(employee)}
            onTerminate={() => handleTerminate(employee)}
            isOutdated={isMilitaryDocumentOutdated(employee)}
          />
        ))}
      </div>
    );
  }

  // Десктоп вигляд
  return (
    <div className="border border-border/70 rounded-lg overflow-hidden">
      <Table>
        <TableHeader sticky>
          <TableRow className="hover:bg-muted/80">
            <TableHead 
              compact 
              sortable
              onSort={() => handleSort("fullName")}
              sorted={sort.key === "fullName"}
              sortDirection={sort.key === "fullName" ? sort.direction : null}
              style={{ width: "30%" }}
            >
              <span className="inline-flex items-center">
                Працівник
                <SortIndicator active={sort.key === "fullName"} direction={sort.direction} />
              </span>
            </TableHead>
            <TableHead 
              compact 
              sortable
              onSort={() => handleSort("contractType")}
              sorted={sort.key === "contractType"}
              sortDirection={sort.key === "contractType" ? sort.direction : null}
              style={{ width: "18%" }}
            >
              <span className="inline-flex items-center">
                Тип договору
                <SortIndicator active={sort.key === "contractType"} direction={sort.direction} />
              </span>
            </TableHead>
            <TableHead 
              compact 
              sortable
              onSort={() => handleSort("status")}
              sorted={sort.key === "status"}
              sortDirection={sort.key === "status" ? sort.direction : null}
              style={{ width: "18%" }}
            >
              <span className="inline-flex items-center">
                Статус
                <SortIndicator active={sort.key === "status"} direction={sort.direction} />
              </span>
            </TableHead>
            <TableHead 
              compact 
              sortable
              onSort={() => handleSort("startDate")}
              sorted={sort.key === "startDate"}
              sortDirection={sort.key === "startDate" ? sort.direction : null}
              style={{ width: "12%" }}
            >
              <span className="inline-flex items-center">
                Початок
                <SortIndicator active={sort.key === "startDate"} direction={sort.direction} />
              </span>
            </TableHead>
            <TableHead compact style={{ width: "10%" }}>
              Військ. облік
            </TableHead>
            <TableHead compact style={{ width: "6%" }} className="text-right">
              Дії
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEmployees.map((employee) => {
            const statusConfig = employeeStatusConfig[employee.status];
            const contractConfig = contractTypeConfig[employee.contractType];
            const StatusIcon = statusConfig.icon;
            const isOutdated = isMilitaryDocumentOutdated(employee);
            
            return (
              <TableRow 
                key={employee.id}
                className={cn(
                  "cursor-pointer",
                  isOutdated && "bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30"
                )}
                onClick={() => onOpenEmployee(employee)}
              >
                <TableCell compact>
                  <div className="flex items-start gap-2">
                    {isOutdated && (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{employee.fullName}</p>
                      <p className="text-xs text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell compact>
                  <Badge variant="outline" size="sm" className="text-xs">
                    {contractConfig.shortLabel}
                  </Badge>
                </TableCell>
                <TableCell compact>
                  <Badge 
                    variant="secondary" 
                    size="sm"
                    className={cn("text-xs", statusConfig.className)}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell compact className="text-sm">
                  {formatDate(employee.startDate)}
                </TableCell>
                <TableCell compact>
                  {employee.militaryStatus && employee.militaryStatus !== "not-applicable" ? (
                    <MilitaryStatusBadge 
                      status={employee.militaryStatus}
                      documentDate={employee.militaryDocumentDate}
                      size="sm"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell compact className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onOpenEmployee(employee);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Відкрити
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(employee);
                      }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Редагувати
                      </DropdownMenuItem>
                      {employee.status !== "terminated" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTerminate(employee);
                            }}
                            className="text-destructive"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Звільнити
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
