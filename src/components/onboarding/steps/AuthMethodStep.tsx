import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Key, Smartphone, Landmark, Edit, Check, ArrowLeft, ChevronDown, Users } from "lucide-react";
import { PRIMARY_AUTH_METHODS, SECONDARY_AUTH_METHODS, AuthMethod } from "@/config/onboardingConfig";
import { cn } from "@/lib/utils";

interface AuthMethodStepProps {
  onSelectMethod: (method: AuthMethod) => void;
  onBack: () => void;
}

const iconMap = {
  key: Key,
  smartphone: Smartphone,
  landmark: Landmark,
  edit: Edit,
};

export const AuthMethodStep = ({ onSelectMethod, onBack }: AuthMethodStepProps) => {
  const [showSecondary, setShowSecondary] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-4 sm:px-6">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Оберіть спосіб входу</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Рекомендуємо КЕП або Дія для автозаповнення даних
          </p>
        </div>
        
        {/* Primary auth methods - large prominent cards */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5">
          {PRIMARY_AUTH_METHODS.map((method) => {
            const Icon = iconMap[method.icon as keyof typeof iconMap] || Key;
            
            return (
              <Card
                key={method.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] border-primary/40 hover:border-primary bg-gradient-to-r from-primary/5 to-transparent"
                onClick={() => onSelectMethod(method.id)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base">{method.title}</h3>
                        <Badge variant="default" className="text-xs h-5">
                          Рекомендовано
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2.5">
                        {method.description}
                      </p>
                      
                      {/* Benefits list */}
                      <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {method.benefits.map((benefit, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground"
                          >
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Social proof */}
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs text-muted-foreground/80">
                        <Users className="w-3 h-3" />
                        <span>Обирають {method.socialProof}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Secondary methods - collapsible */}
        <Collapsible open={showSecondary} onOpenChange={setShowSecondary}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between h-11 text-muted-foreground hover:text-foreground"
            >
              <span className="text-sm">Інші способи входу</span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform duration-200",
                showSecondary && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 mt-2">
            {SECONDARY_AUTH_METHODS.map((method) => {
              const Icon = iconMap[method.icon as keyof typeof iconMap] || Key;
              
              return (
                <Card
                  key={method.id}
                  className="cursor-pointer transition-all duration-200 hover:border-border active:scale-[0.99]"
                  onClick={() => onSelectMethod(method.id)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base">{method.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
        
        {/* Back button */}
        <div className="flex justify-center mt-5 sm:mt-6">
          <Button variant="ghost" onClick={onBack} className="h-11 sm:h-10 min-w-[48px]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
};