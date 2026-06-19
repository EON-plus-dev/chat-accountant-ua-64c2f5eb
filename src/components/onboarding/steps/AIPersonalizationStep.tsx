import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, FileText, AlertTriangle, Lightbulb, 
  Zap, ArrowRight, Loader2
} from "lucide-react";
import { RegistryData } from "@/lib/registryIntegration";
import { generatePersonalization, PersonalizationResult, AIRecommendation } from "@/lib/onboardingAI";
import { cn } from "@/lib/utils";

interface AIPersonalizationStepProps {
  data: RegistryData;
  onContinue: (personalization: PersonalizationResult) => void;
}

const typeIcons = {
  template: FileText,
  tax: Lightbulb,
  integration: Zap,
  tip: Sparkles,
  warning: AlertTriangle,
};

export const AIPersonalizationStep = ({ data, onContinue }: AIPersonalizationStepProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [personalization, setPersonalization] = useState<PersonalizationResult | null>(null);
  const [displayedMessage, setDisplayedMessage] = useState("");
  
  const charIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    // Simulate AI analysis
    const analyzeTimer = setTimeout(() => {
      const result = generatePersonalization(data);
      setPersonalization(result);
      setIsAnalyzing(false);
      
      // Stable typewriter effect using ref
      charIndexRef.current = 0;
      intervalRef.current = setInterval(() => {
        if (charIndexRef.current <= result.welcomeMessage.length) {
          setDisplayedMessage(result.welcomeMessage.substring(0, charIndexRef.current));
          charIndexRef.current++;
        } else {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 18);
    }, 1800);
    
    return () => {
      clearTimeout(analyzeTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [data]);
  
  const handleContinue = () => {
    if (personalization) {
      onContinue(personalization);
    }
  };
  
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] px-4">
        <div className="text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-2">AI аналізує вашу діяльність</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Персоналізуємо систему...
          </p>
          
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              Аналіз КВЕДів
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  if (!personalization) return null;
  
  return (
    <div className="flex flex-col min-h-[60dvh] px-4 py-4 sm:py-6">
      <div className="max-w-xl mx-auto w-full">
        {/* AI Welcome message */}
        <Card className="mb-4 sm:mb-5 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-h-[48px]">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">AI-асистент</p>
                <p className="text-sm sm:text-base leading-relaxed">
                  {displayedMessage}
                  {charIndexRef.current < (personalization?.welcomeMessage.length || 0) && (
                    <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-[pulse_1s_ease-in-out_infinite]" />
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Industry and entity badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="outline" className="text-xs sm:text-sm py-1">
            {personalization.industryProfile}
          </Badge>
          <Badge variant="secondary" className="text-xs sm:text-sm py-1">
            {data.entityType === 'tov' ? 'ТОВ' : 'ФОП'}
          </Badge>
        </div>
        
        {/* Recommendations - read-only cards, max 3 */}
        <div className="mb-5 sm:mb-6">
          <h3 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            Що налаштовано для вас
          </h3>
          
          <div className="space-y-2">
            {personalization.recommendations.slice(0, 3).map((rec, index) => {
              const Icon = typeIcons[rec.type];
              
              return (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-3 sm:p-4 flex items-start gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{rec.title}</p>
                        {rec.priority === 'high' && (
                          <Badge variant="default" className="text-xs h-5 px-1.5">
                            Важливо
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {rec.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Детальніше в налаштуваннях після входу
          </p>
        </div>
        
        {/* Suggested templates - compact badges */}
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-sm sm:text-base mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Шаблони для вас
          </h3>
          <div className="flex flex-wrap gap-2">
            {personalization.suggestedTemplates.map((template, index) => (
              <Badge key={index} variant="outline" className="py-1 px-2 sm:px-3 text-xs sm:text-sm">
                {template}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Continue button */}
        <div className="flex justify-center">
          <Button size="lg" onClick={handleContinue} className="min-w-[200px] min-h-[48px] sm:min-h-[44px]">
            Продовжити
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};