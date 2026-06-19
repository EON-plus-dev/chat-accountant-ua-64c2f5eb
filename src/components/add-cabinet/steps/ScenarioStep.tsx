import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, UserPlus, Sparkles, CheckCircle, Users, Key, AlertCircle } from "lucide-react";
import { AddCabinetScenario } from "@/config/addCabinetConfig";
import { cn } from "@/lib/utils";

interface ScenarioStepProps {
  onSelectScenario: (scenario: AddCabinetScenario) => void;
  onCancel: () => void;
}

export const ScenarioStep = ({ onSelectScenario, onCancel }: ScenarioStepProps) => {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [showContent, setShowContent] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const aiMessage = "Вітаю! Давайте додамо новий кабінет до вашого портфеля. Оберіть вашу роль:";

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    intervalRef.current = window.setInterval(() => {
      if (index < aiMessage.length) {
        setDisplayedMessage(aiMessage.slice(0, index + 1));
        index++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setTimeout(() => setShowContent(true), 200);
      }
    }, 25);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const scenarios = [
    {
      id: 'owner' as const,
      icon: Crown,
      title: 'Як Власник',
      subtitle: 'Маю КЕП та повний контроль над кабінетом',
      benefits: ['Право підпису документів', 'Управління командою', 'AI-персоналізація'],
      requirement: 'Обов\'язково: КЕП підприємства',
      socialProof: '85% користувачів',
      recommended: true,
    },
    {
      id: 'member' as const,
      icon: UserPlus,
      title: 'Як Учасник',
      subtitle: 'Мене запросили до існуючого кабінету',
      benefits: ['Робота в межах наданих прав', 'КЕП не обов\'язковий'],
      hint: 'Код запрошення надає власник кабінету',
      recommended: false,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-80px)] px-4 py-8">
      <div className="max-w-lg w-full">
        {/* AI Avatar and message */}
        <div className="flex items-start gap-3 mb-8">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium text-primary mb-1">AI-асистент</p>
            <p className="text-foreground leading-relaxed">
              {displayedMessage}
              {displayedMessage.length < aiMessage.length && (
                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
              )}
            </p>
          </div>
        </div>

        {/* Scenario cards */}
        <div 
          className={cn(
            "space-y-4 transition-all duration-500",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          {scenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                scenario.recommended
                  ? "border-primary/50 hover:border-primary bg-primary/5"
                  : "hover:border-primary/30"
              )}
              onClick={() => onSelectScenario(scenario.id)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      scenario.recommended
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <scenario.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{scenario.title}</h3>
                      {scenario.recommended && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Популярне
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {scenario.subtitle}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {scenario.benefits.map((benefit, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          <CheckCircle className="w-3 h-3 text-primary" />
                          {benefit}
                        </span>
                      ))}
                    </div>
                    
                    {/* KEP requirement for owner */}
                    {scenario.requirement && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-amber-600 dark:text-amber-500">
                        <Key className="w-3 h-3" />
                        {scenario.requirement}
                      </div>
                    )}
                    
                    {/* Hint for member */}
                    {scenario.hint && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                        <AlertCircle className="w-3 h-3" />
                        {scenario.hint}
                      </div>
                    )}
                    
                    {scenario.socialProof && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {scenario.socialProof}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cancel button */}
        <div 
          className={cn(
            "mt-8 text-center transition-all duration-500 delay-200",
            showContent ? "opacity-100" : "opacity-0"
          )}
        >
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            Скасувати
          </Button>
        </div>
      </div>
    </div>
  );
};