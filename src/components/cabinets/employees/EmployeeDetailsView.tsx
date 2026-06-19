import { Sparkles, FileText, Building2, MapPin, Clock, Calendar, User, Briefcase, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import type { Employee } from "@/config/employeesConfig";
import {
  contractTypeConfig,
  employeeStatusConfig,
  employmentModeConfig,
  workLocationConfig,
} from "@/config/employeesConfig";
import { MilitaryStatusBadge } from "./MilitaryStatusBadge";

interface EmployeeDetailsViewProps {
  employee: Employee;
  /** Залишено для backward-compat; навігація назад тепер через breadcrumb. */
  onBack?: () => void;
  onChatPromptInsert?: (prompt: string) => void;
}

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "dd MMMM yyyy", { locale: uk });
  } catch {
    return dateStr;
  }
};

const formatShortDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "dd.MM.yyyy", { locale: uk });
  } catch {
    return dateStr;
  }
};

// Рядок інформації
const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) => (
  <div className="flex items-start justify-between py-2">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </div>
    <p className="text-sm font-medium text-right max-w-[60%]">{value}</p>
  </div>
);

export const EmployeeDetailsView = ({
  employee,
  onChatPromptInsert,
}: EmployeeDetailsViewProps) => {
  const statusConfig = employeeStatusConfig[employee.status];
  const contractConfig = contractTypeConfig[employee.contractType];
  const employmentConfig = employmentModeConfig[employee.employmentMode];
  const locationConfig = workLocationConfig[employee.location];
  const StatusIcon = statusConfig.icon;

  const handleChatPrompt = (prompt: string) => {
    onChatPromptInsert?.(prompt);
  };

  return (
    <div className="space-y-6">
      {/* Хедер — навігація через breadcrumb зверху, локальної кнопки «Назад» немає */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="hidden sm:block text-lg font-semibold truncate">{employee.fullName}</h2>
          <p className="text-sm text-muted-foreground">{employee.position}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className={cn("text-xs", statusConfig.className)}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {contractConfig.shortLabel}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Блок 1: Основна інформація */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Основна інформація
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow label="ПІБ" value={employee.fullName} />
            <Separator />
            <InfoRow label="Посада" value={employee.position} icon={Briefcase} />
            <Separator />
            <InfoRow label="Тип договору" value={contractConfig.label} icon={FileText} />
            <Separator />
            <InfoRow label="Дата початку" value={formatDate(employee.startDate)} icon={Calendar} />
            {employee.endDate && (
              <>
                <Separator />
                <InfoRow label="Дата завершення" value={formatDate(employee.endDate)} icon={Calendar} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Блок 2: Умови праці */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Умови праці
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow 
              label="Режим зайнятості" 
              value={`${employmentConfig.label}${employee.fte ? ` (${employee.fte} ставки)` : ""}`} 
            />
            <Separator />
            {employee.schedule && (
              <>
                <InfoRow label="Графік" value={employee.schedule} />
                <Separator />
              </>
            )}
            <InfoRow label="Локація" value={locationConfig.label} icon={MapPin} />
            {employee.comments && (
              <>
                <Separator />
                <div className="py-2">
                  <p className="text-sm text-muted-foreground mb-1">Коментарі</p>
                  <p className="text-sm">{employee.comments}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Блок 3: Договір та документи */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Договір та документи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {employee.contractNumber && (
              <>
                <InfoRow label="Номер договору" value={employee.contractNumber} />
                <Separator />
              </>
            )}
            {employee.contractDate && (
              <>
                <InfoRow label="Дата договору" value={formatDate(employee.contractDate)} />
                <Separator />
              </>
            )}
            <div className="py-2">
              <p className="text-sm text-muted-foreground mb-2">Документи</p>
              <Button variant="outline" size="sm" className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Переглянути в документообіг
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Блок 4: Військовий облік */}
        {employee.militaryStatus && employee.militaryStatus !== "not-applicable" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Військовий облік
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Статус</span>
                <MilitaryStatusBadge 
                  status={employee.militaryStatus} 
                  documentDate={employee.militaryDocumentDate}
                  showLabel 
                />
              </div>
              {employee.militaryDocumentDate && (
                <>
                  <Separator />
                  <InfoRow 
                    label="Дата документа" 
                    value={formatDate(employee.militaryDocumentDate)} 
                    icon={Calendar} 
                  />
                </>
              )}
              {employee.militaryRegistrationNumber && (
                <>
                  <Separator />
                  <InfoRow 
                    label="Номер обл. картки" 
                    value={employee.militaryRegistrationNumber} 
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Блок 5: Історія змін */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Історія змін</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.history && employee.history.length > 0 ? (
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-3">
                  {employee.history.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{item.action}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatShortDate(item.date)}</span>
                          {item.role && (
                            <>
                              <span>·</span>
                              <span>{item.role}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Історія змін відсутня
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI підказки */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleChatPrompt(`Поясни умови договору для ${employee.fullName}`)}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Поясни умови договору
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleChatPrompt(`Які документи потрібні для ${employee.fullName}?`)}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Які документи потрібні?
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleChatPrompt(`Розрахуй ЄСВ за працівника ${employee.fullName}`)}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Розрахуй ЄСВ
        </Button>
      </div>
    </div>
  );
};
