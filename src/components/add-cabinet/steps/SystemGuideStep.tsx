import { Button } from "@/components/ui/button";
import { ArrowRight, Info, Lightbulb } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { SYSTEM_GUIDE_ITEMS } from "@/config/individualOnboardingConfig";
import { motion } from "framer-motion";

interface SystemGuideStepProps {
  onContinue: () => void;
}

export const SystemGuideStep = ({ onContinue }: SystemGuideStepProps) => {
  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName.split('-').map((s: string, i: number) => 
      i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s.charAt(0).toUpperCase() + s.slice(1)
    ).join('')];
    return Icon || LucideIcons.Circle;
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Як працює система</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Завантажуйте документи — система автоматично оброблятиме дані для вашої декларації
        </p>
      </div>

      {/* Guide items */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {SYSTEM_GUIDE_ITEMS.map((item, index) => {
          const Icon = getIcon(item.icon);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground">{item.documentName}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.purpose}</p>
                  <div className="flex items-start gap-1.5 mt-2 bg-muted/50 rounded-lg px-2.5 py-1.5">
                    <ArrowRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-foreground/80 leading-relaxed">{item.automation}</span>
                  </div>
                  {item.hint && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <Info className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-[11px] text-muted-foreground italic">{item.hint}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="pt-4 border-t">
        <Button onClick={onContinue} className="w-full gap-2" size="lg">
          Зрозуміло, почнемо!
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
