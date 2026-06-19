import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Sparkles, Building2, User } from "lucide-react";
import { PersonalizationResult } from "@/lib/onboardingAI";
import Confetti from "@/components/onboarding/Confetti";
import { entityStyles } from "@/config/entityStyles";
import { cn } from "@/lib/utils";

interface AddCabinetCompleteStepProps {
  cabinetName: string;
  cabinetType: 'fop' | 'tov' | 'individual' | 'fop-group';
  personalization: PersonalizationResult | null;
  onEnterCabinet: () => void;
}

export const AddCabinetCompleteStep = ({
  cabinetName,
  cabinetType,
  personalization,
  onEnterCabinet,
}: AddCabinetCompleteStepProps) => {
  const typeStyle = entityStyles[cabinetType];
  const TypeIcon = typeStyle?.icon || Building2;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-60px)] px-4 relative">
      <Confetti />
      
      <div className="max-w-md w-full text-center">
        {/* Success icon with glow */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          Кабінет створено!
        </h2>
        <p className="text-muted-foreground mb-6">
          Усе готово до роботи
        </p>
        
        {/* Cabinet card */}
        <Card className="mb-6 text-left">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div 
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  typeStyle?.bgColor || "bg-primary/10"
                )}
              >
                <TypeIcon className={cn("w-6 h-6", typeStyle?.color || "text-primary")} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{cabinetName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn("text-xs", typeStyle?.badgeClass)}>
                    {typeStyle?.label || cabinetType.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Власник
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalization summary */}
        {personalization && (
          <Card className="mb-6 text-left">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI налаштування</p>
                  <p className="font-medium text-sm">{personalization.industryProfile}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>Реквізити заповнено</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>Шаблони підготовлено ({personalization.suggestedTemplates.length})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span>Дашборд персоналізовано</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* CTA */}
        <Button
          size="lg"
          className="w-full min-h-[48px] group"
          onClick={onEnterCabinet}
        >
          Перейти до кабінету
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
