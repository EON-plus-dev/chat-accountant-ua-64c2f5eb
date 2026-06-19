import { useMemo } from "react";
import { ClipboardCheck, MessageSquare, CheckCircle2 } from "lucide-react";
import { 
  TaxAudit, 
  getActiveAuditsCount, 
  getResponseRequiredCount,
  getCompletedAuditsCount,
  getNearestDeadline,
  getPendingRequestsCount,
} from "@/config/taxAuditsConfig";
import { differenceInDays, parseISO, format } from "date-fns";
import { uk } from "date-fns/locale";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";

interface AuditsKPISectionProps {
  audits: TaxAudit[];
  onFilterChange?: (filter: string) => void;
  activeFilter?: string | null;
}

export const AuditsKPISection = ({ audits, onFilterChange, activeFilter }: AuditsKPISectionProps) => {
  const toggleFilter = (filter: string) => {
    if (activeFilter === filter) {
      onFilterChange?.("all");
    } else {
      onFilterChange?.(filter);
    }
  };

  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    const active = getActiveAuditsCount(audits);
    const responseRequired = getResponseRequiredCount(audits);
    const completed = getCompletedAuditsCount(audits, currentYear);
    const pendingRequests = getPendingRequestsCount(audits);
    const nearestDeadline = getNearestDeadline(audits);

    // Розбивка завершених у поточному році на чисті vs з порушеннями (ППР)
    const completedThisYear = audits.filter(
      (a) =>
        a.status === "completed" &&
        new Date(a.endDate || a.startDate).getFullYear() === currentYear,
    );
    const completedClean = completedThisYear.filter((a) => !a.result?.hasViolations).length;
    const completedWithViolations = completedThisYear.filter((a) => a.result?.hasViolations).length;

    return {
      active,
      responseRequired,
      completed,
      pendingRequests,
      nearestDeadline,
      completedClean,
      completedWithViolations,
    };
  }, [audits, currentYear]);

  // Визначення терміновості дедлайну
  const deadlineInfo = useMemo(() => {
    if (!stats.nearestDeadline) return null;
    
    const deadline = parseISO(stats.nearestDeadline.deadline);
    const daysUntil = differenceInDays(deadline, new Date());
    
    let colorVariant: "default" | "warning" | "danger" | "success" = "default";
    if (daysUntil <= 3) colorVariant = "danger";
    else if (daysUntil <= 7) colorVariant = "warning";
    
    return {
      date: format(deadline, "dd.MM.yyyy", { locale: uk }),
      daysUntil,
      colorVariant,
    };
  }, [stats.nearestDeadline]);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
      <UniversalKPICard
        title="Активних перевірок"
        value={stats.active}
        format="number"
        icon={ClipboardCheck}
        variant={stats.active > 0 ? "warning" : "success"}
        description={stats.pendingRequests > 0 ? `${stats.pendingRequests} запитів без відповіді` : "Немає активних запитів"}
        density="compact"
        onClick={() => toggleFilter("active")}
        isActive={activeFilter === "active"}
      />
      
      <UniversalKPICard
        title="Очікують відповіді"
        value={stats.responseRequired}
        format="number"
        icon={MessageSquare}
        variant={deadlineInfo?.colorVariant || "default"}
        description={
          deadlineInfo
            ? `Дедлайн: ${deadlineInfo.date} · ${deadlineInfo.daysUntil} дн.`
            : "Немає термінових"
        }
        density="compact"
        onClick={() => toggleFilter("response-required")}
        isActive={activeFilter === "response-required"}
      />
      
      <UniversalKPICard
        title={`Завершено у ${currentYear}`}
        value={stats.completed}
        format="number"
        icon={CheckCircle2}
        variant={stats.completedWithViolations > 0 ? "warning" : "success"}
        description={
          stats.completed === 0
            ? "Немає завершених"
            : stats.completedWithViolations === 0
              ? `${stats.completedClean} ${stats.completedClean === 1 ? "чиста" : "чистих"}`
              : `${stats.completedClean} ${stats.completedClean === 1 ? "чиста" : "чистих"}, ${stats.completedWithViolations} з ППР`
        }
        density="compact"
        onClick={() => toggleFilter("completed")}
        isActive={activeFilter === "completed"}
      />
    </div>
  );
};
