import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, FileText, Activity, Settings, 
  X, ArrowRight, ArrowLeft
} from "lucide-react";
import { TOUR_STEPS } from "@/config/onboardingConfig";
import { cn } from "@/lib/utils";

interface InteractiveTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

const iconMap = {
  sparkles: Sparkles,
  'file-text': FileText,
  activity: Activity,
  settings: Settings,
};

export const InteractiveTour = ({ onComplete, onSkip }: InteractiveTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const step = TOUR_STEPS[currentStep];
  const Icon = iconMap[step.icon as keyof typeof iconMap] || Sparkles;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;
  
  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 h-10 w-10"
        onClick={onSkip}
      >
        <X className="w-5 h-5" />
      </Button>
      
      <div className="w-full max-w-lg mx-4">
        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {currentStep + 1} з {TOUR_STEPS.length}
            </span>
            <Button variant="ghost" size="sm" onClick={onSkip} className="h-8">
              Пропустити
            </Button>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        
        {/* Step card */}
        <Card className="overflow-hidden">
          {/* Illustration area */}
          <div className="h-44 sm:h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
            </div>
            
            {/* Step indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentStep
                      ? "bg-primary w-6"
                      : index < currentStep
                      ? "bg-primary/50 w-2"
                      : "bg-muted w-2"
                  )}
                />
              ))}
            </div>
          </div>
          
          {/* Content */}
          <CardContent className="p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5 sm:mb-6">
              {step.description}
            </p>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="h-11 sm:h-10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              
              <Button onClick={handleNext} className="h-11 sm:h-10">
                {currentStep === TOUR_STEPS.length - 1 ? (
                  'Завершити'
                ) : (
                  <>
                    Далі
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};