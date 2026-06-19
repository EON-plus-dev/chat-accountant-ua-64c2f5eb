import { useMemo } from "react";
import { 
  Building2, 
  Briefcase, 
  User, 
  CheckCircle, 
  Clock, 
  Shield, 
  Ban,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { SortIndicator } from "@/components/ui/sort-indicator";
import { useSortState, type SortDirection } from "@/hooks/use-sort-state";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Contractor, ContractorRole } from "@/config/settingsConfig";
import { FinMonBadge } from "./FinMonBadge";

export type ContractorSortField = "name" | "balance";

interface ContractorsTableProps {
  contractors: Contractor[];
  onNavigate?: (contractorId: string) => void;
  onEdit?: (contractor: Contractor) => void;
  onDelete?: (contractor: Contractor) => void;
  onReconciliationAct?: (contractor: Contractor) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

// Helper functions
const getTypeIcon = (type: Contractor["type"]) => {
  switch (type) {
    case "legal": return <Building2 className="h-4 w-4" />;
    case "fop": return <Briefcase className="h-4 w-4" />;
    default: return <User className="h-4 w-4" />;
  }
};

const getRoleBadge = (role?: ContractorRole) => {
  if (!role) return null;
  const labels: Record<ContractorRole, string> = {
    buyer: "Покупець",
    supplier: "Постачальник",
    both: "Обидва",
    master: "Майстер-партнер",
  };
  return (
    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
      {labels[role]}
    </Badge>
  );
};

const getStatusBadge = (contractor: Contractor) => {
  if (contractor.status === "blocked") {
    return (
      <Badge variant="outline" className="gap-1 text-destructive border-destructive/30 bg-destructive/10 text-xs h-5">
        <Ban className="h-3 w-3" />
        Заблок.
      </Badge>
    );
  }
  if (contractor.status === "inactive") {
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground text-xs h-5">
        <Clock className="h-3 w-3" />
        Неактивний
      </Badge>
    );
  }
  // Unverified status badge
  if (contractor.verificationStatus === "unverified") {
    return (
      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-xs h-5">
        <AlertTriangle className="h-3 w-3" />
        Неверифік.
      </Badge>
    );
  }
  if (contractor.verificationStatus === "warning") {
    return (
      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-xs h-5">
        <AlertTriangle className="h-3 w-3" />
        Увага
      </Badge>
    );
  }
  if (contractor.isSynced) {
    return (
      <Badge variant="outline" className="gap-1 text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 text-xs h-5">
        <CheckCircle className="h-3 w-3" />
        Синхр.
      </Badge>
    );
  }
  if (contractor.isPending) {
    // Calculate days pending
    const invitedAt = contractor.invitedAt ? new Date(contractor.invitedAt) : null;
    const now = new Date();
    const daysPending = invitedAt 
      ? Math.floor((now.getTime() - invitedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    return (
      <Badge 
        variant="outline" 
        className="gap-1 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-xs h-5 whitespace-nowrap"
      >
        <Clock className="h-3 w-3 shrink-0" />
        Очікує {daysPending}д
      </Badge>
    );
  }
  if (contractor.isEdrsVerified) {
    return (
      <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30 text-xs h-5">
        <Shield className="h-3 w-3" />
        ЄДРС
      </Badge>
    );
  }
  return null;
};

const formatBalance = (balance: number | undefined) => {
  if (balance === undefined) return <span className="text-muted-foreground">—</span>;
  const formatted = Math.abs(balance).toLocaleString("uk-UA");
  if (balance > 0) {
    return (
      <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
        <TrendingUp className="h-3 w-3" />
        +{formatted} ₴
      </span>
    );
  }
  if (balance < 0) {
    return (
      <span className="flex items-center gap-1 text-destructive font-medium whitespace-nowrap">
        <TrendingDown className="h-3 w-3" />
        -{formatted} ₴
      </span>
    );
  }
  return <span className="text-muted-foreground">0 ₴</span>;
};


// Sorting helper
const sortContractors = (
  contractors: Contractor[], 
  sortKey: ContractorSortField, 
  sortDirection: SortDirection
): Contractor[] => {
  return [...contractors].sort((a, b) => {
    let comparison = 0;
    switch (sortKey) {
      case "name":
        comparison = a.name.localeCompare(b.name, "uk");
        break;
      case "balance":
        comparison = (a.balance || 0) - (b.balance || 0);
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });
};

// Mobile Card Component
const ContractorCard = ({ 
  contractor, 
  onClick 
}: { 
  contractor: Contractor; 
  onClick?: () => void;
}) => (
  <Card 
    className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98] min-h-[72px]" 
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className={cn(
          "rounded-full p-2 shrink-0",
          contractor.status === "inactive" 
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary"
        )}>
          {getTypeIcon(contractor.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-medium text-sm truncate",
              contractor.status === "inactive" && "text-muted-foreground"
            )}>
              {contractor.name}
            </p>
            {getStatusBadge(contractor)}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {contractor.code}
          </p>
          {(contractor.email || contractor.phone) && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {contractor.email || contractor.phone}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {getRoleBadge(contractor.role)}
            {contractor.finMonStatus && contractor.finMonStatus !== "not-required" && (
              <FinMonBadge 
                status={contractor.finMonStatus} 
                dueDate={contractor.finMonDueDate}
                size="sm"
              />
            )}
            {contractor.reliabilityScore !== undefined && (
              <Badge variant="outline" className={cn(
                "text-[10px] h-5 px-1.5",
                contractor.reliabilityScore >= 80 ? "text-green-600 border-green-200" :
                contractor.reliabilityScore >= 50 ? "text-amber-600 border-amber-200" :
                "text-destructive border-destructive/30"
              )}>
                {contractor.reliabilityScore}%
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm">{formatBalance(contractor.balance)}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Table Component
export const ContractorsTable = ({
  contractors,
  onNavigate,
  onEdit,
  onDelete,
  onReconciliationAct,
  searchQuery,
  onClearSearch,
}: ContractorsTableProps) => {
  const isMobile = useIsMobile();
  const { sort, handleSort } = useSortState<ContractorSortField>("name", "asc");

  const sortedContractors = useMemo(
    () => sortContractors(contractors, sort.key, sort.direction),
    [contractors, sort.key, sort.direction]
  );

  // Mobile: Card list
  if (isMobile) {
    if (sortedContractors.length === 0) {
      return (
        <TableEmptyState
          icon={User}
          title="Контрагентів не знайдено"
          description={searchQuery ? "Спробуйте змінити параметри пошуку" : undefined}
          action={searchQuery && onClearSearch ? {
            label: "Очистити пошук",
            onClick: onClearSearch,
          } : undefined}
        />
      );
    }

    return (
      <div className="space-y-3">
        {sortedContractors.map((contractor) => (
          <ContractorCard
            key={contractor.id}
            contractor={contractor}
            onClick={() => onNavigate?.(contractor.id)}
          />
        ))}
      </div>
    );
  }

  // Desktop: Table
  return (
    <Card>
      <Table containerClassName="max-h-[calc(100vh-320px)] overflow-auto">
        <TableHeader sticky>
          <TableRow>
            <TableHead 
              compact 
              sortable 
              sorted={sort.key === "name"}
              sortDirection={sort.direction}
              onSort={() => handleSort("name")}
              className="min-w-[200px]"
            >
              <span className="inline-flex items-center">
                Контрагент
                <SortIndicator active={sort.key === "name"} direction={sort.direction} />
              </span>
            </TableHead>
            <TableHead compact className="w-[80px]">
              Роль
            </TableHead>
            <TableHead compact className="w-[120px]">
              Статус
            </TableHead>
            <TableHead compact className="w-[140px] hidden lg:table-cell">
              Контакти
            </TableHead>
            <TableHead 
              compact 
              numeric
              sortable 
              sorted={sort.key === "balance"}
              sortDirection={sort.direction}
              onSort={() => handleSort("balance")}
              className="w-[110px]"
              title="Поточна заборгованість. + нам винні, − ми винні"
            >
              <span className="inline-flex items-center justify-end">
                Сальдо
                <SortIndicator active={sort.key === "balance"} direction={sort.direction} />
              </span>
            </TableHead>
            <TableHead compact className="w-[90px] hidden md:table-cell">
              Рейтинг
            </TableHead>
            <TableHead compact className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedContractors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32">
                <TableEmptyState
                  icon={User}
                  title="Контрагентів не знайдено"
                  description={searchQuery ? "Спробуйте змінити параметри пошуку" : undefined}
                  action={searchQuery && onClearSearch ? {
                    label: "Очистити пошук",
                    onClick: onClearSearch,
                  } : undefined}
                />
              </TableCell>
            </TableRow>
          ) : (
            sortedContractors.map((contractor) => (
              <TableRow 
                key={contractor.id} 
                className="cursor-pointer"
                onClick={() => onNavigate?.(contractor.id)}
              >
                <TableCell compact>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded-full p-2 shrink-0",
                      contractor.status === "inactive" 
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/10 text-primary"
                    )}>
                      {getTypeIcon(contractor.type)}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        contractor.status === "inactive" && "text-muted-foreground"
                      )}>
                        {contractor.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {contractor.code || "—"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell compact>
                  <div className="flex items-center gap-1.5">
                    {getRoleBadge(contractor.role)}
                    {contractor.finMonStatus && contractor.finMonStatus !== "not-required" && (
                      <FinMonBadge 
                        status={contractor.finMonStatus} 
                        dueDate={contractor.finMonDueDate}
                        size="sm"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell compact>
                  {getStatusBadge(contractor)}
                </TableCell>
                <TableCell compact className="hidden lg:table-cell">
                  <div className="space-y-0.5">
                    {contractor.email && (
                      <p className="text-xs text-muted-foreground truncate max-w-[120px] flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{contractor.email}</span>
                      </p>
                    )}
                    {contractor.phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0" />
                        {contractor.phone}
                      </p>
                    )}
                    {!contractor.email && !contractor.phone && (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell compact numeric>
                  {formatBalance(contractor.balance)}
                </TableCell>
                <TableCell compact className="hidden md:table-cell">
                  {contractor.reliabilityScore !== undefined ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-10 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all",
                            contractor.reliabilityScore >= 80 ? "bg-green-500" :
                            contractor.reliabilityScore >= 50 ? "bg-amber-500" : "bg-destructive"
                          )}
                          style={{ width: `${contractor.reliabilityScore}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground w-6">
                        {contractor.reliabilityScore}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell compact onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem onClick={() => onNavigate?.(contractor.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Переглянути
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReconciliationAct?.(contractor)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Акт звірки
                      </DropdownMenuItem>
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(contractor)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Редагувати
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(contractor)}
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
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
};
