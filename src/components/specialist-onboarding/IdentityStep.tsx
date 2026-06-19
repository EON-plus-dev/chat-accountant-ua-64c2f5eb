import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  KeyRound, 
  Smartphone, 
  Mail,
  CheckCircle2,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamInvitation } from "@/config/teamMembersConfig";

export type AuthMethod = "kep" | "diia" | "email";

export interface IdentityResult {
  method: AuthMethod;
  autoFilledData?: {
    fullName?: string;
    taxId?: string;
  };
}

interface IdentityStepProps {
  invitation: TeamInvitation;
  onNext: (result: IdentityResult) => void;
  onBack: () => void;
}

const authMethods: { 
  id: AuthMethod; 
  label: string; 
  description: string; 
  icon: typeof KeyRound;
  recommended?: boolean;
  autoFills?: string[];
  benefits?: string[];
}[] = [
  { 
    id: "kep", 
    label: "КЕП (Електронний підпис)", 
    description: "Автозаповнення ПІБ та РНОКПП з ключа",
    icon: KeyRound,
    recommended: true,
    autoFills: ["ПІБ", "РНОКПП"],
    benefits: ["Автозаповнення", "Для документів"],
  },
  { 
    id: "diia", 
    label: "Дія.Підпис", 
    description: "Авторизація через телефон + автозаповнення",
    icon: Smartphone,
    autoFills: ["ПІБ", "РНОКПП"],
    benefits: ["Без носіїв", "Дані з реєстрів"],
  },
  { 
    id: "email", 
    label: "Email-підтвердження", 
    description: "Швидко та просто — потрібно ввести дані вручну",
    icon: Mail,
    benefits: ["Швидко", "Без носіїв"],
  },
];

export const IdentityStep = ({ invitation, onNext, onBack }: IdentityStepProps) => {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const handleVerify = async () => {
    if (!selectedMethod) return;
    
    setIsVerifying(true);
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate data extraction from KEP/Diia
    let autoFilledData: IdentityResult["autoFilledData"] = undefined;
    
    if (selectedMethod === "kep" || selectedMethod === "diia") {
      // Demo data - in production would come from the signature/Diia service
      // Using valid IPN that passes checksum validation
      autoFilledData = {
        fullName: "Коваленко Олена Петрівна",
        taxId: "3184710691", // Valid IPN (passes checksum)
      };
    }
    
    setIsVerifying(false);
    setIsVerified(true);
    
    // Auto-proceed after verification
    setTimeout(() => {
      onNext({ method: selectedMethod, autoFilledData });
    }, 1000);
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Підтвердження особи</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Оберіть спосіб авторизації для безпечного доступу до кабінету
        </p>
      </div>
      
      {/* Verification success state */}
      {isVerified ? (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
              Особу підтверджено!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Переходимо до наступного кроку...
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Benefits banner */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Рекомендуємо КЕП або Дія.Підпис
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Автоматичне заповнення ПІБ та РНОКПП — менше помилок, швидший онбординг
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auth methods */}
          <div className="space-y-3">
            {authMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <Card
                  key={method.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "hover:border-primary/50"
                  )}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{method.label}</p>
                          {method.recommended && (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                              Рекомендовано
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                        {/* Auto-fill badges */}
                        {method.autoFills && method.autoFills.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Badge variant="outline" className="text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800">
                              <Sparkles className="h-3 w-3" />
                              Автозаповнення
                            </Badge>
                            {method.autoFills.map(field => (
                              <Badge key={field} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 shrink-0 transition-colors",
                        isSelected 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground/30"
                      )}>
                        {isSelected && (
                          <CheckCircle2 className="w-full h-full text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>87% користувачів обирають КЕП або Дія.Підпис</span>
          </div>

          {/* Info box */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p>
                <strong>Для демонстрації:</strong> Оберіть будь-який метод та натисніть 
                "Підтвердити". При виборі КЕП або Дія.Підпис дані профілю заповняться автоматично.
              </p>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Actions */}
      <div className="flex justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        
        {!isVerified && (
          <Button 
            onClick={handleVerify} 
            disabled={!selectedMethod || isVerifying}
            className="gap-2"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Перевірка...
              </>
            ) : (
              <>
                Підтвердити
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
