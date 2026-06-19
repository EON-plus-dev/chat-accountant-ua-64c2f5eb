import { ArrowRight, Gift, Users, Star, Crown, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { referralTiers } from "@/config/referralConfig";

interface ReferralProgramSectionProps {
  onStartReferring?: () => void;
}

const tierIcons = [Gift, Users, Star, Crown];
const tierColors = [
  "bg-muted text-muted-foreground",
  "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  "bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300",
  "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
];

export const ReferralProgramSection = ({ onStartReferring }: ReferralProgramSectionProps) => {
  return (
    <section className="space-y-8 py-4">
      <div className="text-center space-y-3">
        <Badge variant="outline" className="gap-2">
          <Sparkles className="h-3.5 w-3.5" />
          Бонусна програма
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold">Запрошуйте — заробляйте</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Запрошуйте партнерів та отримуйте кредити за кожного. 
          Чим більше рефералів — тим вищі бонуси.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {referralTiers.map((tier, index) => {
          const Icon = tierIcons[index];
          const isTopTier = index === referralTiers.length - 1;
          
          return (
            <Card 
              key={tier.level} 
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                isTopTier ? "border-primary shadow-md" : ""
              }`}
            >
              {isTopTier && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                  Найкращий
                </div>
              )}
              
              <CardContent className="p-6 space-y-4">
                {/* Icon & Badge */}
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${tierColors[index]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{tier.name}</span>
                      {tier.badge && <span className="text-lg">{tier.badge}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tier.minReferrals === 0 
                        ? "Базовий рівень" 
                        : `від ${tier.minReferrals} рефералів`}
                    </p>
                  </div>
                </div>

                {/* Credits */}
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">
                    +{tier.creditsPerReferral >= 1000 ? `${(tier.creditsPerReferral / 1000).toFixed(tier.creditsPerReferral % 1000 === 0 ? 0 : 1)}K` : tier.creditsPerReferral}
                  </p>
                  <p className="text-xs text-muted-foreground">кредитів за реферала</p>
                </div>

                {/* Bonus */}
                {tier.bonus ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Check className="h-4 w-4 text-success" />
                      {tier.bonus}
                    </div>
                    {tier.bonusDetails && (
                      <p className="text-xs text-muted-foreground pl-6">
                        {tier.bonusDetails}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Базові умови програми
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progression Arrow (desktop) */}
      <div className="hidden lg:flex items-center justify-center gap-2 -mt-2">
        {referralTiers.slice(0, -1).map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 h-0.5 bg-gradient-to-r from-muted to-primary/30" />
            <ArrowRight className="h-4 w-4 text-primary/50" />
          </div>
        ))}
      </div>

      {/* How It Works */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold">
                1
              </div>
              <h4 className="font-medium">Запросіть партнера</h4>
              <p className="text-sm text-muted-foreground">
                Надішліть персональне посилання контрагенту чи колезі
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold">
                2
              </div>
              <h4 className="font-medium">Він реєструється</h4>
              <p className="text-sm text-muted-foreground">
                Ви отримуєте кредити за реєстрацію та додаткові за оплату
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto font-bold">
                3
              </div>
              <h4 className="font-medium">Ростете разом</h4>
              <p className="text-sm text-muted-foreground">
                Чим більше рефералів — тим вищий рівень і більші бонуси
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highlight: Partner Level */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-800/30">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shrink-0">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold mb-2">
              Досягніть рівня "Партнер" — отримуйте 10% від платежів рефералів
            </h3>
            <p className="text-muted-foreground">
              Залучіть 50 активних користувачів і отримуйте пасивний дохід від їх підписок назавжди.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button 
              size="lg" 
              className="min-h-[48px] gap-2"
              onClick={onStartReferring}
            >
              <Gift className="h-5 w-5" />
              Мій прогрес та запрошення
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Перейти до мого прогресу
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralProgramSection;
