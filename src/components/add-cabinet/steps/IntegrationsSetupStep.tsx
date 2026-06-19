import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { 
  INTEGRATION_CATEGORIES, 
  INTEGRATION_OPTIONS, 
  IntegrationOption 
} from "@/config/individualOnboardingConfig";
import { motion } from "framer-motion";

interface IntegrationsSetupStepProps {
  onContinue: (selectedIntegrations: string[]) => void;
  onSkip: () => void;
  onBack: () => void;
}

export const IntegrationsSetupStep = ({ onContinue, onSkip, onBack }: IntegrationsSetupStepProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleIntegration = (id: string) => {
    const option = INTEGRATION_OPTIONS.find(o => o.id === id);
    if (option?.comingSoon) return;
    setSelected(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName.split('-').map((s: string, i: number) => 
      i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s.charAt(0).toUpperCase() + s.slice(1)
    ).join('')];
    return Icon || LucideIcons.Circle;
  };

  const renderCard = (option: IntegrationOption) => {
    const isSelected = selected.includes(option.id);
    const Icon = getIcon(option.icon);

    return (
      <motion.button
        key={option.id}
        whileTap={option.comingSoon ? undefined : { scale: 0.97 }}
        onClick={() => toggleIntegration(option.id)}
        disabled={option.comingSoon}
        className={`
          relative w-full text-left rounded-xl border p-3.5 transition-all duration-200
          ${option.comingSoon 
            ? 'border-border/50 bg-muted/30 opacity-60 cursor-not-allowed' 
            : isSelected 
              ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
              : 'border-border bg-card hover:border-primary/40 hover:shadow-sm cursor-pointer'
          }
        `}
      >
        <div className="flex items-start gap-3">
          <div className={`
            shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
            ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
          `}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground">{option.name}</span>
              {option.comingSoon && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  Скоро
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{option.description}</p>
          </div>
          {!option.comingSoon && (
            <div className={`
              shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all
              ${isSelected 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-muted-foreground/30'
              }
            `}>
              {isSelected && <Check className="w-3 h-3" />}
            </div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Ваші сервіси</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Оберіть платформи, які ви використовуєте — ми налаштуємо автоматичний імпорт даних
        </p>
      </div>

      {/* Integration categories */}
      <div className="flex-1 space-y-5 overflow-y-auto pb-4">
        {INTEGRATION_CATEGORIES.map(category => {
          const categoryOptions = INTEGRATION_OPTIONS.filter(o => o.category === category.id);
          const CategoryIcon = getIcon(category.icon);
          
          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-2.5">
                <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">{category.title}</h3>
                <span className="text-xs text-muted-foreground">— {category.description}</span>
              </div>
              <div className="space-y-2">
                {categoryOptions.map(renderCard)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t space-y-2.5">
        {selected.length > 0 && (
          <Button 
            onClick={() => onContinue(selected)} 
            className="w-full gap-2"
            size="lg"
          >
            Продовжити
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs">
              {selected.length}
            </Badge>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onBack} size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Button>
          <Button 
            variant="ghost" 
            onClick={onSkip} 
            size="sm"
            className="flex-1 text-muted-foreground"
          >
            Пропустити — підключу пізніше
          </Button>
        </div>
      </div>
    </div>
  );
};
