import { useState } from "react";
import { FixedSizeList as VirtualList } from "react-window";
import { Users, User, ExternalLink, Search, Download, Printer, Info, Layers } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { getMilitaryTaxRate, formatTaxRate } from "@/config/taxRatesByPeriod";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { Report, ReportCalculation } from "@/config/reportsConfig";
import {
  getEmployeesForCabinet,
  contractTypeConfig,
  employeeStatusConfig,
  type Employee,
  type ContractType,
} from "@/config/employeesConfig";

interface EmployeesLinkedSectionProps {
  report: Report;
  onNavigateToEmployee?: (employeeId: string) => void;
}

interface LinkedEmployee extends Employee {
  salary: number;
  pdfo: number;
  vz: number;
  esv: number;
}

const TABLE_THRESHOLD = 10;
const PAGE_SIZE = 25;
const VIRTUALIZE_THRESHOLD = 200;
const ROW_HEIGHT = 40;
const VIRTUAL_HEIGHT = 480;

function is1dfCalculation(
  calc: ReportCalculation,
): calc is {
  type: "1df";
  data: {
    employeesCount: number;
    totalSalary: number;
    pdfo: number;
    vz: number;
    esv: number;
    totalTaxes: number;
  };
} {
  return calc.type === "1df";
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (/[",\n;]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(";"),
    )
    .join("\n");
  // BOM for Excel UTF-8 detection
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function EmployeesLinkedSection({
  report,
  onNavigateToEmployee,
}: EmployeesLinkedSectionProps) {
  const [search, setSearch] = useState("");
  const [contractFilter, setContractFilter] = useState<ContractType | "all">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [groupByContract, setGroupByContract] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 200);

  // Show only for 4ДФ reports
  if (report.type !== "1df" || !report.calculation) return null;

  const calculation = report.calculation;
  if (!is1dfCalculation(calculation)) return null;
  const calcData = calculation.data;

  const allEmployees = getEmployeesForCabinet(report.cabinetId);

  const activeEmployees = allEmployees.filter((emp) => {
    if (emp.status === "terminated" && emp.endDate) {
      const endDate = new Date(emp.endDate);
      const reportMonth = report.month || 1;
      const reportYear = report.year || 2025;
      const periodStart = new Date(reportYear, reportMonth - 1, 1);
      return endDate >= periodStart;
    }
    return emp.status === "active" || emp.status === "probation";
  });

  if (activeEmployees.length === 0) return null;

  const employeesCount = activeEmployees.length;
  const perEmployeeSalary = calcData.totalSalary / employeesCount;
  const perEmployeePdfo = calcData.pdfo / employeesCount;
  const perEmployeeVz = calcData.vz / employeesCount;
  const perEmployeeEsv = calcData.esv / employeesCount;

  const linkedEmployees: LinkedEmployee[] = activeEmployees.map((emp) => ({
    ...emp,
    salary: perEmployeeSalary,
    pdfo: perEmployeePdfo,
    vz: perEmployeeVz,
    esv: perEmployeeEsv,
  }));

  // Bulk metrics
  const contractCounts = linkedEmployees.reduce(
    (acc, emp) => {
      acc[emp.contractType] = (acc[emp.contractType] || 0) + 1;
      return acc;
    },
    {} as Record<ContractType, number>,
  );
  const probationCount = linkedEmployees.filter((e) => e.status === "probation").length;
  const avgSalary = calcData.totalSalary / employeesCount;

  // Filtering (plain compute — hooks must stay above early returns)
  const term = debouncedSearch.trim().toLowerCase();
  const filteredEmployees = linkedEmployees.filter((emp) => {
    if (contractFilter !== "all" && emp.contractType !== contractFilter) return false;
    if (!term) return true;
    return (
      emp.fullName.toLowerCase().includes(term) ||
      emp.position.toLowerCase().includes(term)
    );
  });

  const useTable = employeesCount > TABLE_THRESHOLD;
  const showFilters = employeesCount > TABLE_THRESHOLD;
  const defaultOpen = employeesCount <= TABLE_THRESHOLD;
  const isClickable = !!onNavigateToEmployee;
  const useVirtualization = useTable && filteredEmployees.length > VIRTUALIZE_THRESHOLD && !groupByContract;

  const visibleEmployees = useTable && !useVirtualization
    ? filteredEmployees.slice(0, visibleCount)
    : filteredEmployees;

  // Group filtered employees by contract type (when toggle on)
  const groupedEmployees = groupByContract
    ? (Object.keys(contractTypeConfig) as ContractType[])
        .map((type) => ({
          type,
          employees: filteredEmployees.filter((e) => e.contractType === type),
        }))
        .filter((g) => g.employees.length > 0)
    : [];

  const militaryRate = getMilitaryTaxRate(
    report.year || new Date().getFullYear(),
    report.month || 1,
    "employee",
  );

  const handleExportCsv = () => {
    const period = `${report.year || ""}-${String(report.month || "").padStart(2, "0")}`;
    const headers = ["ПІБ", "Посада", "Тип договору", "ЗП", "ПДФО", "ВЗ", "ЄСВ"];
    const rows: (string | number)[][] = [
      headers,
      ...filteredEmployees.map((emp) => [
        emp.fullName,
        emp.position,
        contractTypeConfig[emp.contractType].label,
        emp.salary.toFixed(2),
        emp.pdfo.toFixed(2),
        emp.vz.toFixed(2),
        emp.esv.toFixed(2),
      ]),
      [],
      ["Разом", "", "", calcData.totalSalary.toFixed(2), calcData.pdfo.toFixed(2), calcData.vz.toFixed(2), calcData.esv.toFixed(2)],
    ];
    downloadCsv(`4DF-employees-${period}.csv`, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  // Summary chips for header
  const contractSummary = (Object.entries(contractCounts) as [ContractType, number][])
    .map(([type, count]) => `${count} ${contractTypeConfig[type].shortLabel.toLowerCase()}`)
    .join(" · ");

  return (
    <Card>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ? "employees" : undefined}
      >
        <AccordionItem value="employees" className="border-b-0">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]]:pb-3">
            <div className="flex flex-1 items-center justify-between gap-3 pr-2">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <CardTitle className="text-base truncate">Працівники у звіті</CardTitle>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="font-medium">
                  {employeesCount} {employeesCount === 1 ? "особа" : "осіб"}
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:inline tabular-nums">
                  {formatCurrency(calcData.totalSalary)}
                </span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <CardContent className="space-y-3 pt-0">
              {/* Bulk metrics bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Середня ЗП:</span>
                  <span className="font-medium tabular-nums">{formatCurrency(avgSalary)}</span>
                </div>
                {contractSummary && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{contractSummary}</span>
                  </>
                )}
                {probationCount > 0 && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      на випробуванні: <span className="font-medium text-foreground">{probationCount}</span>
                    </span>
                  </>
                )}
                <div className="ml-auto flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleExportCsv}
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="sr-only">Експорт CSV</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Експорт CSV</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handlePrint}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span className="sr-only">Друкувати</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Друкувати список</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Search + filter */}
              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      placeholder="Пошук за ПІБ або посадою…"
                      className="h-9 pl-8 text-sm"
                    />
                  </div>
                  <Select
                    value={contractFilter}
                    onValueChange={(v) => {
                      setContractFilter(v as ContractType | "all");
                      setVisibleCount(PAGE_SIZE);
                    }}
                  >
                    <SelectTrigger className="h-9 sm:w-[180px]">
                      <SelectValue placeholder="Тип договору" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Усі типи</SelectItem>
                      {(Object.keys(contractTypeConfig) as ContractType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {contractTypeConfig[type].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {showFilters && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">
                    Показано{" "}
                    {groupByContract || useVirtualization
                      ? filteredEmployees.length
                      : Math.min(visibleEmployees.length, filteredEmployees.length)}{" "}
                    з {filteredEmployees.length}
                    {filteredEmployees.length !== employeesCount && ` (відфільтровано з ${employeesCount})`}
                    {useVirtualization && (
                      <span className="ml-2 text-primary">· віртуалізовано</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label htmlFor="group-by-contract" className="text-xs cursor-pointer">
                      Групувати за типом
                    </Label>
                    <Switch
                      id="group-by-contract"
                      checked={groupByContract}
                      onCheckedChange={setGroupByContract}
                    />
                  </div>
                </div>
              )}

              {/* Disclaimer about distribution */}
              <div className="flex items-start gap-2 rounded-md border border-dashed border-muted-foreground/20 bg-muted/20 p-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>
                  Розподіл сум орієнтовний (рівномірний). Фактичні нарахування — у профілі працівника.
                </span>
              </div>

              {/* Empty state */}
              {filteredEmployees.length === 0 && (
                <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Нічого не знайдено за вашим запитом.
                </div>
              )}

              {/* Compact table for N>10 OR mobile */}
              {filteredEmployees.length > 0 && useTable && !groupByContract && !useVirtualization && (
                <div className="rounded-md border">
                  <Table containerClassName="max-h-[480px]">
                    <TableHeader sticky>
                      <TableRow>
                        <TableHead
                          compact
                          className="sticky left-0 z-10 bg-muted min-w-[180px]"
                        >
                          ПІБ
                        </TableHead>
                        <TableHead compact className="hidden md:table-cell">Посада</TableHead>
                        <TableHead compact className="hidden sm:table-cell">Тип</TableHead>
                        <TableHead compact numeric>ЗП</TableHead>
                        <TableHead compact numeric className="hidden lg:table-cell">ПДФО</TableHead>
                        <TableHead compact numeric className="hidden lg:table-cell">ВЗ</TableHead>
                        <TableHead compact numeric className="hidden lg:table-cell">ЄСВ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleEmployees.map((emp) => {
                        const contractConfig = contractTypeConfig[emp.contractType];
                        return (
                          <TableRow
                            key={emp.id}
                            className={cn(isClickable && "cursor-pointer")}
                            onClick={() => isClickable && onNavigateToEmployee?.(emp.id)}
                          >
                            <TableCell
                              compact
                              className="sticky left-0 z-[1] bg-card font-medium truncate max-w-[200px]"
                            >
                              {emp.fullName}
                            </TableCell>
                            <TableCell compact className="hidden md:table-cell text-muted-foreground truncate max-w-[180px]">
                              {emp.position}
                            </TableCell>
                            <TableCell compact className="hidden sm:table-cell">
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {contractConfig.shortLabel}
                              </Badge>
                            </TableCell>
                            <TableCell compact numeric>{formatCurrency(emp.salary)}</TableCell>
                            <TableCell compact numeric className="hidden lg:table-cell text-muted-foreground">
                              {formatCurrency(emp.pdfo)}
                            </TableCell>
                            <TableCell compact numeric className="hidden lg:table-cell text-muted-foreground">
                              {formatCurrency(emp.vz)}
                            </TableCell>
                            <TableCell compact numeric className="hidden lg:table-cell text-muted-foreground">
                              {formatCurrency(emp.esv)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Virtualized list for N>200 (flat) */}
              {filteredEmployees.length > 0 && useVirtualization && (
                <div className="rounded-md border overflow-hidden">
                  <div className="grid grid-cols-[1fr_90px] sm:grid-cols-[1fr_70px_110px] lg:grid-cols-[1fr_180px_70px_110px_100px_100px_100px] gap-2 px-3 py-2 bg-muted text-xs font-medium border-b">
                    <div>ПІБ</div>
                    <div className="hidden lg:block">Посада</div>
                    <div className="hidden sm:block">Тип</div>
                    <div className="text-right">ЗП</div>
                    <div className="hidden lg:block text-right">ПДФО</div>
                    <div className="hidden lg:block text-right">ВЗ</div>
                    <div className="hidden lg:block text-right">ЄСВ</div>
                  </div>
                  <VirtualList
                    height={VIRTUAL_HEIGHT}
                    itemCount={filteredEmployees.length}
                    itemSize={ROW_HEIGHT}
                    width="100%"
                  >
                    {({ index, style }) => {
                      const emp = filteredEmployees[index];
                      const cfg = contractTypeConfig[emp.contractType];
                      return (
                        <div
                          style={style}
                          className={cn(
                            "grid grid-cols-[1fr_90px] sm:grid-cols-[1fr_70px_110px] lg:grid-cols-[1fr_180px_70px_110px_100px_100px_100px] gap-2 px-3 items-center text-xs border-b last:border-b-0",
                            isClickable && "cursor-pointer hover:bg-accent/50",
                          )}
                          onClick={() => isClickable && onNavigateToEmployee?.(emp.id)}
                        >
                          <div className="font-medium truncate">{emp.fullName}</div>
                          <div className="hidden lg:block text-muted-foreground truncate">{emp.position}</div>
                          <div className="hidden sm:block">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{cfg.shortLabel}</Badge>
                          </div>
                          <div className="text-right tabular-nums">{formatCurrency(emp.salary)}</div>
                          <div className="hidden lg:block text-right tabular-nums text-muted-foreground">{formatCurrency(emp.pdfo)}</div>
                          <div className="hidden lg:block text-right tabular-nums text-muted-foreground">{formatCurrency(emp.vz)}</div>
                          <div className="hidden lg:block text-right tabular-nums text-muted-foreground">{formatCurrency(emp.esv)}</div>
                        </div>
                      );
                    }}
                  </VirtualList>
                </div>
              )}

              {/* Grouped view by contract type */}
              {filteredEmployees.length > 0 && useTable && groupByContract && (
                <div className="space-y-3">
                  {groupedEmployees.map((group) => {
                    const groupTotal = group.employees.reduce((s, e) => s + e.salary, 0);
                    const cfg = contractTypeConfig[group.type];
                    return (
                      <div key={group.type} className="rounded-md border">
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Badge variant="outline">{cfg.shortLabel}</Badge>
                            <span>{cfg.label}</span>
                            <span className="text-xs text-muted-foreground">· {group.employees.length} осіб</span>
                          </div>
                          <span className="text-xs font-semibold tabular-nums">{formatCurrency(groupTotal)}</span>
                        </div>
                        <Table>
                          <TableBody>
                            {group.employees.map((emp) => (
                              <TableRow
                                key={emp.id}
                                className={cn(isClickable && "cursor-pointer")}
                                onClick={() => isClickable && onNavigateToEmployee?.(emp.id)}
                              >
                                <TableCell compact className="font-medium truncate max-w-[200px]">{emp.fullName}</TableCell>
                                <TableCell compact className="hidden md:table-cell text-muted-foreground truncate max-w-[180px]">{emp.position}</TableCell>
                                <TableCell compact numeric>{formatCurrency(emp.salary)}</TableCell>
                                <TableCell compact numeric className="hidden lg:table-cell text-muted-foreground">{formatCurrency(emp.pdfo)}</TableCell>
                                <TableCell compact numeric className="hidden lg:table-cell text-muted-foreground">{formatCurrency(emp.vz)}</TableCell>
                                <TableCell compact numeric className="hidden lg:table-cell text-muted-foreground">{formatCurrency(emp.esv)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredEmployees.length > 0 && useTable && !groupByContract && !useVirtualization && visibleCount < filteredEmployees.length && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Показати ще {Math.min(PAGE_SIZE, filteredEmployees.length - visibleCount)}
                  </Button>
                </div>
              )}

              {/* Card view for N≤10 */}
              {filteredEmployees.length > 0 && !useTable &&
                visibleEmployees.map((employee) => {
                  const contractConfig = contractTypeConfig[employee.contractType];
                  const statusConfig = employeeStatusConfig[employee.status];

                  return (
                    <div
                      key={employee.id}
                      className={cn(
                        "p-4 rounded-lg border bg-card transition-colors",
                        isClickable && "hover:bg-accent/50 cursor-pointer",
                      )}
                      onClick={() => isClickable && onNavigateToEmployee?.(employee.id)}
                      role={isClickable ? "button" : undefined}
                      tabIndex={isClickable ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (isClickable && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onNavigateToEmployee?.(employee.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-full bg-muted flex-shrink-0">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{employee.fullName}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-muted-foreground">{employee.position}</span>
                              <span className="text-muted-foreground">·</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs px-1.5 py-0",
                                  `border-${contractConfig.color}-500/30`,
                                )}
                              >
                                {contractConfig.shortLabel}
                              </Badge>
                              {employee.fte && employee.fte < 1 && (
                                <>
                                  <span className="text-muted-foreground">·</span>
                                  <span className="text-xs text-muted-foreground">
                                    {employee.fte} ставки
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {isClickable && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Профіль працівника</span>
                          </Button>
                        )}
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">ЗП за період</span>
                          <span className="font-medium tabular-nums">
                            {formatCurrency(employee.salary)}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <p className="text-muted-foreground mb-0.5">ПДФО 18%</p>
                            <p className="font-medium tabular-nums">{formatCurrency(employee.pdfo)}</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <p className="text-muted-foreground mb-0.5">
                              ВЗ {formatTaxRate(militaryRate)}
                            </p>
                            <p className="font-medium tabular-nums">{formatCurrency(employee.vz)}</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50 text-center">
                            <p className="text-muted-foreground mb-0.5">ЄСВ 22%</p>
                            <p className="font-medium tabular-nums">{formatCurrency(employee.esv)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Footer total */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Разом нараховано ЗП</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(calcData.totalSalary)}
                </span>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
