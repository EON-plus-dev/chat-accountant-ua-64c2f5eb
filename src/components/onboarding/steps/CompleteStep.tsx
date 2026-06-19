import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { PersonalizationResult } from "@/lib/onboardingAI";
import Confetti from "@/components/onboarding/Confetti";

interface CompleteStepProps {
  personalization: PersonalizationResult;
  onStartTour: () => void;
  onSkipTour: () => void;
  userType?: 'business' | 'fop' | 'individual';
  isPartner?: boolean;
}

export const CompleteStep = ({ personalization, onStartTour, onSkipTour, userType = 'business', isPartner = false }: CompleteStepProps) => {
  const ctaLabel = isPartner
    ? 'Перейти до партнерського кабінету'
    : userType === 'individual'
      ? 'Відкрити мій кабінет'
      : 'Перейти до кабінету';
  const sourceLabel = userType === 'individual' ? 'Реквізити завантажено з ДРФО' : 'Реквізити завантажено з ЄДР';
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-4 relative">
      <Confetti />
      
      <div className="max-w-md w-full text-center">
        {/* Success icon with soft glow */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-5">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
          </div>
        </div>
        
        {/* Title - no emoji, professional */}
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Все готово!</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-5 sm:mb-6">
          Ваш кабінет налаштовано та персоналізовано
        </p>
        
        {/* Summary card - personalized */}
        <Card className="mb-6 sm:mb-8 text-left">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ваш профіль</p>
                <p className="font-medium text-sm sm:text-base">{personalization.industryProfile}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>{sourceLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>AI налаштовано під вашу діяльність</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                <span>{personalization.suggestedTemplates.length} шаблонів підготовлено</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Single primary CTA */}
        <Button
          size="lg"
          className="w-full min-h-[48px] sm:min-h-[44px] group"
          onClick={onSkipTour}
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        {userType === 'individual' && !isPartner && (
          <p className="mt-3 text-xs text-muted-foreground">
            Згодом можна додати власний кабінет ФОП — він зв'яжеться за вашим ІПН.
          </p>
        )}
        
        {/* Tour as secondary text link */}
        <button
          className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          onClick={onStartTour}
        >
          Пройти огляд системи
        </button>
      </div>
    </div>
  );
};