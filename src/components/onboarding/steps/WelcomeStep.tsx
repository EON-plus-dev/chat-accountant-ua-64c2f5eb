import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sparkles, 
  FileText, 
  Shield, 
  Clock, 
  ArrowRight, 
  Calculator, 
  Users, 
  BarChart3,
  Check,
} from "lucide-react";
import { getAIGreeting } from "@/lib/onboardingAI";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface WelcomeStepProps {
  onContinue: (selectedNeeds?: string[]) => void;
  userType?: 'business' | 'fop' | 'individual';
  isPartner?: boolean;
}

type Stage = 'greeting' | 'features' | 'needs' | 'ready';

interface NeedOption {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
}

const NEEDS_BUSINESS: NeedOption[] = [
  { id: 'documents', icon: FileText, label: 'Документи', description: 'Рахунки, акти, договори' },
  { id: 'taxes', icon: Calculator, label: 'Податки', description: 'ПДВ, ЄП, звітність' },
  { id: 'payroll', icon: Users, label: 'Зарплата', description: 'Нарахування, виплати' },
  { id: 'analytics', icon: BarChart3, label: 'Аналітика', description: 'Звіти та прогнози' },
];

const NEEDS_FOP: NeedOption[] = [
  { id: 'income-book', icon: FileText, label: 'Книга обліку', description: 'Доходи та витрати' },
  { id: 'single-tax', icon: Calculator, label: 'ЄП та ЄСВ', description: 'Розрахунок і сплата' },
  { id: 'reports', icon: BarChart3, label: 'Звітність', description: 'Декларації та реєстри' },
  { id: 'expenses', icon: Users, label: 'Контрагенти', description: 'Клієнти та підрядники' },
];

const NEEDS_INDIVIDUAL: NeedOption[] = [
  { id: 'declaration', icon: FileText, label: 'Декларація', description: 'Про майновий стан' },
  { id: 'foreign-income', icon: Calculator, label: 'Іноземні доходи', description: 'Залік КУПО' },
  { id: 'investments', icon: BarChart3, label: 'Інвестиції', description: 'FIFO, P&L, дивіденди' },
  { id: 'property', icon: Users, label: 'Майно та авто', description: 'Облік і податки' },
];

const NEEDS_PARTNER: NeedOption[] = [
  { id: 'client-cabinets', icon: FileText, label: 'Кабінети клієнтів', description: 'Ведення кількох ФОП/ТОВ' },
  { id: 'delegations', icon: Calculator, label: 'Делегації та підпис', description: 'КЕП від імені клієнта' },
  { id: 'billing', icon: BarChart3, label: 'Тарифи та білінг', description: 'Знижки, реселер-режим' },
  { id: 'certification', icon: Users, label: 'Сертифікація', description: 'Партнерський статус' },
];

export const WelcomeStep = ({ onContinue, userType = 'business', isPartner = false }: WelcomeStepProps) => {
  const [stage, setStage] = useState<Stage>('greeting');
  const [displayedText, setDisplayedText] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const greetingLines = useMemo(() => getAIGreeting(userType), [userType]);
  const needsOptions =
    isPartner ? NEEDS_PARTNER :
    userType === 'individual' ? NEEDS_INDIVIDUAL :
    userType === 'fop' ? NEEDS_FOP :
    NEEDS_BUSINESS;
  
  const charIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Typewriter effect for greeting
  useEffect(() => {
    if (currentLineIndex >= greetingLines.length) {
      const timer = setTimeout(() => setStage('features'), 400);
      return () => clearTimeout(timer);
    }
    
    const currentLine = greetingLines[currentLineIndex];
    const prefix = currentLineIndex > 0 
      ? greetingLines.slice(0, currentLineIndex).join('\n') + '\n' 
      : '';
    
    charIndexRef.current = 0;
    
    intervalRef.current = setInterval(() => {
      if (charIndexRef.current <= currentLine.length) {
        setDisplayedText(prefix + currentLine.substring(0, charIndexRef.current));
        charIndexRef.current++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setTimeout(() => setCurrentLineIndex(prev => prev + 1), 300);
      }
    }, 22);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentLineIndex, greetingLines]);
  
  // Show needs assessment after features appear
  useEffect(() => {
    if (stage === 'features') {
      const timer = setTimeout(() => setStage('needs'), 600);
      return () => clearTimeout(timer);
    }
    if (stage === 'needs') {
      const timer = setTimeout(() => setStage('ready'), 400);
      return () => clearTimeout(timer);
    }
  }, [stage]);
  
  // Toggle need selection
  const toggleNeed = (needId: string) => {
    setSelectedNeeds(prev => 
      prev.includes(needId)
        ? prev.filter(id => id !== needId)
        : [...prev, needId]
    );
  };
  
  // Handle continue with needs
  const handleContinue = () => {
    // Store selected needs for later personalization
    if (selectedNeeds.length > 0) {
      localStorage.setItem('user_needs', JSON.stringify(selectedNeeds));
    }
    onContinue(selectedNeeds);
  };
  
  // Value-focused features with concrete benefits
  const features = [
    {
      icon: FileText,
      title: "Документи без рутини",
      description: "AI заповнює та перевіряє",
    },
    {
      icon: Shield,
      title: "Податки під контролем",
      description: "Дедлайни та звітність",
    },
    {
      icon: Clock,
      title: "80% економії часу",
      description: "На рутинних операціях",
    },
  ];
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-4 sm:px-8">
      {/* AI Avatar with soft glow */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-5 sm:mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
          <Sparkles className="w-9 h-9 sm:w-11 sm:h-11 text-primary-foreground" />
        </div>
      </div>
      
      {/* AI Greeting Card - centered, minimal */}
      <Card className="mb-6 sm:mb-8 max-w-md w-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-4 sm:p-5">
          <div className="min-h-[72px] sm:min-h-[80px] flex items-center justify-center">
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line text-center">
              {displayedText}
              {currentLineIndex < greetingLines.length && (
                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-[pulse_1s_ease-in-out_infinite]" />
              )}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Feature cards - stagger animation */}
      <div 
        className={cn(
          "grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-2xl w-full transition-all duration-500 ease-out",
          stage === 'greeting' 
            ? "opacity-0 translate-y-6" 
            : "opacity-100 translate-y-0"
        )}
      >
        {features.map((feature, index) => (
          <Card
            key={index}
            className={cn(
              "border-border/50 bg-card/80 transition-all duration-300 ease-out",
              stage !== 'greeting' && "hover:border-primary/30 hover:shadow-sm"
            )}
            style={{
              transitionDelay: stage !== 'greeting' ? `${index * 80}ms` : '0ms',
              opacity: stage === 'greeting' ? 0 : 1,
              transform: stage === 'greeting' ? 'translateY(12px)' : 'translateY(0)',
            }}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm sm:text-base mb-0.5">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Needs Assessment - appears after features */}
      <div
        className={cn(
          "max-w-md w-full mb-6 transition-all duration-500 ease-out",
          stage === 'greeting' || stage === 'features'
            ? "opacity-0 translate-y-6 pointer-events-none"
            : "opacity-100 translate-y-0"
        )}
      >
        <p className="text-sm text-muted-foreground text-center mb-3">
          Що вас найбільше цікавить?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {needsOptions.map((need) => {
            const isSelected = selectedNeeds.includes(need.id);
            return (
              <button
                key={need.id}
                onClick={() => toggleNeed(need.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-200",
                  "hover:border-primary/50 hover:bg-primary/5",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-card/80"
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <need.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{need.label}</p>
                    <p className="text-xs text-muted-foreground">{need.description}</p>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* CTA Button - appears last with subtle animation */}
      <Button
        size="lg"
        onClick={handleContinue}
        className={cn(
          "min-w-[200px] min-h-[48px] sm:min-h-[44px] group transition-all duration-300 ease-out",
          stage !== 'ready' 
            ? "opacity-0 translate-y-3 pointer-events-none" 
            : "opacity-100 translate-y-0"
        )}
      >
        {selectedNeeds.length > 0 ? "Продовжити" : "Розпочати"}
        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
};