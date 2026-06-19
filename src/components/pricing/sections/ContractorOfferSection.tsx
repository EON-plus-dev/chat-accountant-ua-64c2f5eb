import { Gift, Percent, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ContractorOfferSectionProps {
  partnerName: string;
  partnerPlan: string;
  onScrollToSection: (id: string) => void;
}

export const ContractorOfferSection = ({ 
  partnerName, 
  partnerPlan, 
  onScrollToSection 
}: ContractorOfferSectionProps) => {
  return (
    <section className="bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30 rounded-xl p-6 border border-emerald-200/50 dark:border-emerald-800/50">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-900/50 dark:to-sky-900/50 shrink-0">
          <Gift className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            Спеціальна пропозиція для контрагентів
          </h3>
          <p className="text-muted-foreground mb-4">
            Ви прийшли за запрошенням від <strong>{partnerName}</strong>, 
            який використовує план <Badge variant="secondary">{partnerPlan}</Badge>
          </p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-sm">
              <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Percent className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span>Перший місяць <strong className="text-emerald-600 dark:text-emerald-400">-50%</strong></span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span><strong>+5K бонусних кредитів</strong> при старті</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span>Синхронізація реквізитів з партнером</span>
            </li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onScrollToSection("tariffs")}
            >
              Активувати знижку
            </Button>
            <Button 
              variant="outline"
              onClick={() => onScrollToSection("roi-calculator")}
            >
              Розрахувати вигоду
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
