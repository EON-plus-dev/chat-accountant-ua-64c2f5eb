import { useState } from "react";
import { Wand2, Loader2, AlertTriangle, CheckCircle2, Info, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Cabinet } from "@/types/cabinet";
import { Report, ReportType, ReportPeriod } from "@/config/reportsConfig";
import {
  autoGenerateReport,
  autoGenerateAllReportsForPeriod,
  GeneratedReport,
  GenerationWarning,
} from "@/lib/reportAutoGenerationEngine";
import { useToast } from "@/hooks/use-toast";
import { getEmployeesForCabinet } from "@/config/employeesConfig";

interface AutoGenerateReportButtonProps {
  cabinet: Cabinet;
  onGenerated: (reports: Report[]) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function AutoGenerateReportButton({
  cabinet,
  onGenerated,
  variant = "default",
  size = "default",
  className,
}: AutoGenerateReportButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"config" | "result">("config");
  
  // Config state
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [reportType, setReportType] = useState<ReportType>("ep");
  const [period, setPeriod] = useState<ReportPeriod>("Q2");
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(6);
  
  // Result state
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  
  const hasEmployees = getEmployeesForCabinet(cabinet.id).length > 0;
  
  const availableReportTypes: { value: ReportType; label: string; disabled?: boolean }[] = [
    { value: "ep", label: "Декларація ЄП" },
    { value: "esv", label: "Звіт ЄСВ" },
    { value: "vz", label: "Військовий збір" },
    { value: "1df", label: "Податковий розрахунок (4ДФ)", disabled: !hasEmployees },
  ];
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      if (mode === "batch") {
        const quarterNum = period === "Q1" ? 1 : period === "Q2" ? 2 : period === "Q3" ? 3 : period === "Q4" ? 4 : undefined;
        const result = await autoGenerateAllReportsForPeriod(cabinet, period, year, quarterNum);
        setGeneratedReports(result.reports);
        
        if (result.totalWarnings > 0) {
          toast({
            title: "Звіти згенеровано з попередженнями",
            description: `${result.reports.length} звіт(ів) створено, ${result.totalWarnings} попередження(нь)`,
          });
        } else {
          toast({
            title: "Звіти успішно згенеровано",
            description: `${result.reports.length} чернетк(ок) готові до перегляду`,
          });
        }
      } else {
        const quarterNum = period === "Q1" ? 1 : period === "Q2" ? 2 : period === "Q3" ? 3 : period === "Q4" ? 4 : undefined;
        const result = await autoGenerateReport({
          cabinet,
          reportType,
          period,
          year,
          quarter: quarterNum,
          month: period === "month" ? month : undefined,
        });
        setGeneratedReports([result]);
        
        if (result.warnings.length > 0) {
          toast({
            title: "Звіт згенеровано з попередженнями",
            description: `Знайдено ${result.warnings.length} питання(нь) щодо даних`,
          });
        } else {
          toast({
            title: "Звіт успішно згенеровано",
            description: "Чернетка готова до перегляду",
          });
        }
      }
      
      setStep("result");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Помилка генерації",
        description: error instanceof Error ? error.message : "Не вдалося згенерувати звіт",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleConfirm = () => {
    const reports = generatedReports.map(gr => gr.report);
    onGenerated(reports);
    handleClose();
  };
  
  const handleClose = () => {
    setOpen(false);
    setStep("config");
    setGeneratedReports([]);
  };
  
  const getWarningIcon = (severity: GenerationWarning["severity"]) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const totalWarnings = generatedReports.reduce((sum, r) => sum + r.warnings.length, 0);
  const averageQuality = generatedReports.length > 0
    ? Math.round(generatedReports.reduce((sum, r) => sum + r.dataQuality.score, 0) / generatedReports.length)
    : 0;
  
  const isQuarterPeriod = period === "Q1" || period === "Q2" || period === "Q3" || period === "Q4";
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Wand2 className="h-4 w-4 mr-2" />
        Автозаповнення
      </Button>
      
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Автоматична генерація звітів
            </DialogTitle>
            <DialogDescription>
              Система автоматично заповнить звіти на основі даних з Книги доходів та розділу Працівники
            </DialogDescription>
          </DialogHeader>
          
          {step === "config" && (
            <div className="space-y-4 py-4">
              {/* Mode selection */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={mode === "single" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setMode("single")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Один звіт
                </Button>
                <Button
                  type="button"
                  variant={mode === "batch" ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setMode("batch")}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Усі звіти
                </Button>
              </div>
              
              {/* Report type (only for single mode) */}
              {mode === "single" && (
                <div className="space-y-2">
                  <Label>Тип звіту</Label>
                  <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReportTypes.map((rt) => (
                        <SelectItem key={rt.value} value={rt.value} disabled={rt.disabled}>
                          {rt.label}
                          {rt.disabled && " (немає працівників)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Period */}
              <div className="space-y-2">
                <Label>Період</Label>
                <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">I квартал</SelectItem>
                    <SelectItem value="Q2">II квартал</SelectItem>
                    <SelectItem value="Q3">III квартал</SelectItem>
                    <SelectItem value="Q4">IV квартал</SelectItem>
                    <SelectItem value="year">Рік</SelectItem>
                    <SelectItem value="month">Місяць</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Year */}
              <div className="space-y-2">
                <Label>Рік</Label>
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Month (for month period) */}
              {period === "month" && (
                <div className="space-y-2">
                  <Label>Місяць</Label>
                  <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
                        "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"].map((m, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Info about data sources */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Джерела даних</AlertTitle>
                <AlertDescription className="text-xs">
                  {mode === "batch" ? (
                    "Система згенерує ЄП, ЄСВ, ВЗ" + (hasEmployees ? " та 4ДФ" : "") + " на основі Книги доходів" + (hasEmployees ? " та даних Працівників" : "")
                  ) : (
                    reportType === "1df" 
                      ? "Дані буде взято з розділу Працівники"
                      : "Дані буде взято з Книги доходів"
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          {step === "result" && (
            <div className="space-y-4 py-4">
              {/* Quality score */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Відповідність</div>
                  <div className="text-xs text-muted-foreground">
                    {averageQuality >= 80 ? "Добра" : averageQuality >= 50 ? "Задовільна" : "Потребує уваги"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={averageQuality} className="w-20 h-2" />
                  <span className="text-sm font-medium tabular-nums">{averageQuality}%</span>
                </div>
              </div>
              
              {/* Generated reports list */}
              <div className="space-y-2">
                <Label>Згенеровані звіти</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {generatedReports.map((gr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <div>
                          <div className="text-sm font-medium">{gr.report.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {gr.report.formCode && `Форма ${gr.report.formCode}`}
                          </div>
                        </div>
                      </div>
                      <Badge variant={gr.warnings.length > 0 ? "warning" : "success"} size="sm">
                        {gr.warnings.length > 0 ? `${gr.warnings.length} попер.` : "OK"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Warnings */}
              {totalWarnings > 0 && (
                <div className="space-y-2">
                  <Label>Попередження ({totalWarnings})</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {generatedReports.flatMap(gr => 
                      gr.warnings.map((w, idx) => (
                        <div key={`${gr.report.id}-${idx}`} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                          {getWarningIcon(w.severity)}
                          <span>{w.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {step === "config" ? (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Скасувати
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Генерація...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Згенерувати
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep("config")}>
                  Назад
                </Button>
                <Button onClick={handleConfirm}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Додати {generatedReports.length} звіт(ів)
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
