import { Link2, Building2, FileText, FileSignature, ArrowRight, Sparkles, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { mockCabinets } from "@/config/cabinetsData";
import { getDocumentsForCabinet } from "@/config/documentFlowConfig";
import { getContractorPaymentsForCabinet } from "@/config/paymentsConfig";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { plans } from "@/config/pricingData";

interface PassiveCabinetBannerProps {
  cabinet: Cabinet;
  className?: string;
  onViewPartner?: (cabinetId: string) => void;
  onNavigateToDocuments?: () => void;
}

export function PassiveCabinetBanner({ 
  cabinet, 
  className,
  onViewPartner,
  onNavigateToDocuments,
}: PassiveCabinetBannerProps) {
  const navigate = useNavigate();
  
  // Only show for passive cabinets
  if (cabinet.accessMode !== "passive") return null;

  // Get partner cabinet name by ID
  const partnerCabinet = cabinet.invitedByCabinetId 
    ? mockCabinets.find(c => c.id === cabinet.invitedByCabinetId)
    : null;
  
  const partnerName = partnerCabinet?.name || "Невідомий партнер";
  const invitedDate = cabinet.invitedAt 
    ? format(new Date(cabinet.invitedAt), "d MMMM yyyy", { locale: uk })
    : null;

  // Get partner's plan (demo: assume "smart" for now)
  const partnerPlanId = "smart";
  const partnerPlan = plans.find(p => p.id === partnerPlanId);

  // Calculate dynamic statistics from actual data
  const stats = useMemo(() => {
    const documents = getDocumentsForCabinet(cabinet);
    const payments = getContractorPaymentsForCabinet(cabinet.id);
    
    const totalDocuments = documents.length;
    const pendingSignature = documents.filter(d => d.status === "pending-sign").length;
    
    // Calculate turnover from completed payments
    const turnover = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    
    return { totalDocuments, pendingSignature, turnover };
  }, [cabinet]);

  // Format turnover for display
  const formatTurnover = (value: number) => {
    if (value >= 1000000) {
      return `₴${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `₴${Math.round(value / 1000)}K`;
    }
    return `₴${value}`;
  };

  const handleNavigateToPricing = (source: string) => {
    navigate(`/pricing?source=${source}`);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg",
        className
      )}
      role="status"
      aria-label="Інформація про пасивний режим кабінету"
    >
      {/* Header Row */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50 shrink-0">
          <Link2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm text-sky-800 dark:text-sky-200">
              Пасивний кабінет
            </h4>
            <Badge 
              variant="secondary" 
              className="text-xs bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
            >
              Обмежений доступ
            </Badge>
          </div>

          <p className="text-sm text-sky-700 dark:text-sky-300">
            Цей кабінет створено для співпраці з{" "}
            <span className="font-medium">{partnerName}</span>
          </p>

          {invitedDate && (
            <p className="text-xs text-sky-600/70 dark:text-sky-400/70">
              Приєднання: {invitedDate}
            </p>
          )}

          {/* Explanation */}
          <p className="text-xs text-muted-foreground pt-1">
            Ви можете керувати реквізитами, підписами КЕП та переглядати документи від партнера.
            Зміни автоматично синхронізуються.
          </p>
        </div>

        {/* Partner Action */}
        {partnerCabinet && onViewPartner && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-sky-700 hover:text-sky-900 hover:bg-sky-100 dark:text-sky-300 dark:hover:text-sky-100 dark:hover:bg-sky-800/50"
            onClick={() => onViewPartner(partnerCabinet.id)}
          >
            <Building2 className="h-4 w-4 mr-1.5" />
            Про партнера
          </Button>
        )}
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-sky-200/50 dark:border-sky-700/50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <FileText className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <p className="text-lg font-semibold text-sky-700 dark:text-sky-300">{stats.totalDocuments}</p>
          </div>
          <p className="text-xs text-sky-600/80 dark:text-sky-400/80">Документів</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <FileSignature className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">{stats.pendingSignature}</p>
          </div>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Очікують підпису</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatTurnover(stats.turnover)}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Оборот</p>
        </div>
      </div>

      {/* Documents Action */}
      {onNavigateToDocuments && stats.pendingSignature > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-sky-200 bg-white/80 hover:bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:hover:bg-sky-800/50 dark:text-sky-300"
          onClick={onNavigateToDocuments}
        >
          Переглянути документи
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}

      {/* Upgrade Promotion Section */}
      <div className="pt-4 border-t border-sky-200/50 dark:border-sky-700/50">
        <div className="flex items-start gap-3">
          {/* Promo Icon */}
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-900/30 dark:to-sky-900/30 shrink-0">
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* Promo Content */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1.5">Хочете більше?</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Створюйте власні документи
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Автоматичні податкові звіти
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  AI-помічник 24/7
                </li>
              </ul>
            </div>

            {/* Social Proof */}
            {partnerPlan && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Gift className="h-3.5 w-3.5 text-purple-500" />
                <span>
                  Ваш партнер <span className="font-medium">{partnerName.split(" ")[0]}</span> використовує план{" "}
                  <Badge variant="secondary" size="sm" className="ml-0.5">
                    {partnerPlan.name}
                  </Badge>
                </span>
              </div>
            )}

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                size="sm" 
                className="flex-1 h-8 text-xs gap-1.5"
                onClick={() => handleNavigateToPricing("passive-banner-trial")}
              >
                <Sparkles className="h-3 w-3" />
                Спробувати безкоштовно
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => handleNavigateToPricing("passive-banner-compare")}
              >
                Порівняти тарифи
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
