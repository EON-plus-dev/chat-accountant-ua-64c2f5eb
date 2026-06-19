import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import type { Report } from "@/config/reportsConfig";
import type { ScheduledGeneration } from "@/lib/reportGenerationScheduler";
import { shouldGenerateReport, isOverdueForGeneration } from "@/lib/reportGenerationScheduler";
import { autoGenerateReport } from "@/lib/reportAutoGenerationEngine";
import {
  isReportAlreadyGenerated,
  markReportAsGenerated,
  markFailedAttempt,
  shouldAttemptGeneration,
  resetFailedAttempts,
  updateLastCheck,
} from "@/lib/reportGenerationState";
import type { ReportAutomationSettings } from "@/config/settingsConfig";

interface UseAutoReportGenerationProps {
  cabinet: Cabinet;
  scheduledGenerations: ScheduledGeneration[];
  automationSettings: ReportAutomationSettings;
  onReportsGenerated?: (reports: Report[]) => void;
  enabled?: boolean;
}

interface UseAutoReportGenerationReturn {
  isAutoGenerating: boolean;
  generatingReportType: string | null;
  pendingCount: number;
  lastGeneratedReport: Report | null;
  triggerNow: () => void;
  hasError: boolean;
  errorMessage: string | null;
}

export function useAutoReportGeneration({
  cabinet,
  scheduledGenerations,
  automationSettings,
  onReportsGenerated,
  enabled = true,
}: UseAutoReportGenerationProps): UseAutoReportGenerationReturn {
  const { toast } = useToast();
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [generatingReportType, setGeneratingReportType] = useState<string | null>(null);
  const [lastGeneratedReport, setLastGeneratedReport] = useState<Report | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const isGeneratingRef = useRef(false);
  const hasRunInitialCheck = useRef(false);

  // Get pending generations count
  const pendingCount = scheduledGenerations.filter(
    s => s.status === "pending" && shouldGenerateReport(s)
  ).length;

  // Generate a single report
  const generateReport = useCallback(async (scheduled: ScheduledGeneration): Promise<Report | null> => {
    const scheduleId = `${scheduled.reportType}-${scheduled.period}-${scheduled.year}`;
    
    // Check if already generated in this session
    if (isReportAlreadyGenerated(cabinet.id, scheduleId)) {
      return null;
    }

    // Check if we should attempt (max retries not exceeded)
    if (!shouldAttemptGeneration(cabinet.id, scheduleId, automationSettings.maxRetries)) {
      return null;
    }

    try {
      setGeneratingReportType(scheduled.reportType.toUpperCase());
      
      // Simulate async generation (in real app this would call API)
      const result = await new Promise<ReturnType<typeof autoGenerateReport>>((resolve) => {
        setTimeout(() => {
          resolve(autoGenerateReport({
            cabinet,
            reportType: scheduled.reportType,
            period: scheduled.period,
            year: scheduled.year,
          }));
        }, 1500); // Simulate processing time
      });

      if (result.report) {
        markReportAsGenerated(cabinet.id, scheduleId);
        resetFailedAttempts(cabinet.id, scheduleId);
        return result.report;
      } else {
        throw new Error("Failed to generate report");
      }
    } catch (error) {
      const attempts = markFailedAttempt(cabinet.id, scheduleId);
      console.error(`Report generation failed (attempt ${attempts}):`, error);
      
      if (attempts >= automationSettings.maxRetries) {
        setHasError(true);
        setErrorMessage(`Не вдалося згенерувати ${scheduled.reportType.toUpperCase()} після ${attempts} спроб`);
        
        if (automationSettings.fallbackBehavior === "notify-only") {
          toast({
            title: "Помилка генерації",
            description: `${scheduled.reportType.toUpperCase()} потребує ручного створення`,
            variant: "destructive",
          });
        }
      }
      
      return null;
    }
  }, [cabinet, automationSettings, toast]);

  // Process all overdue generations
  const processOverdueGenerations = useCallback(async () => {
    if (!enabled || isGeneratingRef.current) return;
    
    const overdueGenerations = scheduledGenerations.filter(
      s => s.status === "pending" && (shouldGenerateReport(s) || isOverdueForGeneration(s))
    );

    if (overdueGenerations.length === 0) {
      updateLastCheck(cabinet.id);
      return;
    }

    isGeneratingRef.current = true;
    setIsAutoGenerating(true);
    setHasError(false);
    setErrorMessage(null);

    const generatedReports: Report[] = [];

    for (const scheduled of overdueGenerations) {
      // Check if automation is paused due to error
      if (hasError && automationSettings.fallbackBehavior === "pause") {
        break;
      }

      const report = await generateReport(scheduled);
      if (report) {
        generatedReports.push(report);
        setLastGeneratedReport(report);
        
        toast({
          title: "Звіт згенеровано",
          description: `${report.typeLabel} ${report.periodLabel} готовий до перевірки`,
        });

        // Cooldown between generations
        if (automationSettings.cooldownMinutes > 0 && overdueGenerations.indexOf(scheduled) < overdueGenerations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, automationSettings.cooldownMinutes * 100)); // Reduced for demo
        }
      }
    }

    setIsAutoGenerating(false);
    setGeneratingReportType(null);
    isGeneratingRef.current = false;
    updateLastCheck(cabinet.id);

    if (generatedReports.length > 0) {
      onReportsGenerated?.(generatedReports);
    }
  }, [
    enabled,
    scheduledGenerations,
    cabinet.id,
    generateReport,
    automationSettings,
    hasError,
    toast,
    onReportsGenerated,
  ]);

  // Trigger generation manually
  const triggerNow = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    processOverdueGenerations();
  }, [processOverdueGenerations]);

  // Run initial check on mount
  useEffect(() => {
    if (!hasRunInitialCheck.current && enabled) {
      hasRunInitialCheck.current = true;
      // Small delay to allow UI to render first
      const timer = setTimeout(() => {
        processOverdueGenerations();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [enabled, processOverdueGenerations]);

  return {
    isAutoGenerating,
    generatingReportType,
    pendingCount,
    lastGeneratedReport,
    triggerNow,
    hasError,
    errorMessage,
  };
}
