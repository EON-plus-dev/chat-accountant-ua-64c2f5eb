import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Loader2, Database, FileText, CreditCard, Building2, User, ShieldCheck, Briefcase } from "lucide-react";
import { simulateRegistrySync, RegistryData, RegistrySyncProgress, RegistryEntityType } from "@/lib/registryIntegration";
import { cn } from "@/lib/utils";

interface RegistrySyncStepProps {
  entityType: RegistryEntityType;
  onComplete: (data: RegistryData) => void;
}

const SYNC_STAGES_BUSINESS = [
  { id: 'edr', label: 'Єдиний державний реєстр', icon: Database },
  { id: 'vat', label: 'Реєстр платників ПДВ', icon: FileText },
  { id: 'singleTax', label: 'Реєстр єдиного податку', icon: CreditCard },
  { id: 'bank', label: 'Банківські реквізити', icon: Building2 },
];

const SYNC_STAGES_INDIVIDUAL = [
  { id: 'edr', label: 'ДРФО за ІПН', icon: User },
  { id: 'vat', label: 'Статус резидентства', icon: ShieldCheck },
  { id: 'singleTax', label: 'Пов\u02bcязаний ФОП', icon: Briefcase },
];

export const RegistrySyncStep = ({ entityType, onComplete }: RegistrySyncStepProps) => {
  const SYNC_STAGES = entityType === 'individual' ? SYNC_STAGES_INDIVIDUAL : SYNC_STAGES_BUSINESS;
  const [progress, setProgress] = useState<RegistrySyncProgress>({
    stage: 'edr',
    progress: 0,
    currentAction: 'Ініціалізація...',
  });
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<Partial<RegistryData>>({});
  
  useEffect(() => {
    const runSync = async () => {
      const data = await simulateRegistrySync(entityType, (progressUpdate) => {
        setProgress(progressUpdate);
        
        // Mark stages as completed
        const stageOrder = ['edr', 'vat', 'singleTax', 'bank'];
        const currentIndex = stageOrder.indexOf(progressUpdate.stage);
        if (currentIndex > 0) {
          setCompletedStages(stageOrder.slice(0, currentIndex));
        }
        
        // Update preview data - show early after EDR
        if (progressUpdate.data) {
          setPreviewData(progressUpdate.data);
        }
        
        // Handle completion
        if (progressUpdate.stage === 'complete') {
          setCompletedStages(stageOrder);
        }
      });
      
      setTimeout(() => onComplete(data), 800);
    };
    
    runSync();
  }, [entityType, onComplete]);
  
  const getStageStatus = (stageId: string) => {
    if (completedStages.includes(stageId)) return 'completed';
    if (progress.stage === stageId) return 'active';
    return 'pending';
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Завантажуємо дані</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Зазвичай це займає ~10 секунд
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="mb-5 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="text-muted-foreground truncate mr-2">{progress.currentAction}</span>
            <span className="font-medium shrink-0">{progress.progress}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>
        
        {/* Preview of found data - show early */}
        {previewData.basic && (
          <Card className="mb-4 sm:mb-5 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-primary animate-scale-in" />
                <p className="text-xs sm:text-sm text-muted-foreground">Знайдено:</p>
              </div>
              <p className="font-semibold text-sm sm:text-base">{previewData.basic.shortName || previewData.basic.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {entityType === 'tov' ? 'ЄДРПОУ' : 'ІПН'}: {previewData.basic.code}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Sync stages */}
        <Card>
          <CardContent className="p-3 sm:p-4 space-y-2">
            {SYNC_STAGES.map((stage) => {
              const status = getStageStatus(stage.id);
              const Icon = stage.icon;
              
              return (
                <div
                  key={stage.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-all duration-300",
                    status === 'active' && "bg-primary/5",
                    status === 'completed' && "opacity-60"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                      status === 'completed' && "bg-primary text-primary-foreground",
                      status === 'active' && "bg-primary/20 text-primary",
                      status === 'pending' && "bg-muted text-muted-foreground"
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-scale-in" />
                    ) : status === 'active' ? (
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs sm:text-sm transition-all duration-300",
                      status === 'active' && "font-medium",
                      status === 'pending' && "text-muted-foreground"
                    )}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};