import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Minus, X, TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { plans, demoUserData, demoUserSubscription, comparisonFeatures } from "@/config/pricingData";
import { ConfirmDowngradeDialog } from "@/components/pricing/ConfirmDowngradeDialog";

const ChangePlan = () => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  
  const currentPlan = plans.find(p => p.id === demoUserData.currentPlan) || plans[1];
  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  
  const getComparison = (newPlan: typeof plans[0]) => {
    const priceDiff = newPlan.price - currentPlan.price;
    const creditsDiff = newPlan.credits - currentPlan.credits;
    const actionsDiff = newPlan.actions - currentPlan.actions;
    const topUpRateDiff = newPlan.topUpRate - currentPlan.topUpRate;
    
    return {
      priceDiff,
      creditsDiff,
      actionsDiff,
      topUpRateDiff,
      isUpgrade: newPlan.price > currentPlan.price,
      isDowngrade: newPlan.price < currentPlan.price,
    };
  };

  const handleConfirmChange = () => {
    if (!selectedPlan) return;
    const comp = getComparison(selectedPlan);
    if (comp.isDowngrade) {
      setDowngradeDialogOpen(true);
    } else {
      navigate(`/checkout?plan=${selectedPlan.id}&mode=change`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard?tab=user-settings&subtab=tariff&section=tariffs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Зміна тарифу</h1>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
          {/* Current Plan */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ваш поточний тариф</CardTitle>
                <Badge>Активний</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                  <p className="text-muted-foreground">{currentPlan.badge}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{currentPlan.price} грн</p>
                  <p className="text-sm text-muted-foreground">на місяць</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Кредитів</p>
                  <p className="font-semibold tabular-nums">{currentPlan.credits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Дій у системі</p>
                  <p className="font-semibold">~{currentPlan.actions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Поповнення</p>
                  <p className="font-semibold">1 грн = {currentPlan.topUpRate.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Баланс</p>
                  <p className="font-semibold tabular-nums">{demoUserData.balance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Selection */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Оберіть новий тариф</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {plans.map((plan) => {
                const isCurrentPlan = plan.id === currentPlan.id;
                const isSelected = plan.id === selectedPlanId;
                const comparison = getComparison(plan);
                
                return (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      isCurrentPlan 
                        ? "opacity-50 cursor-not-allowed" 
                        : isSelected 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "hover:border-primary/50"
                    }`}
                    onClick={() => !isCurrentPlan && setSelectedPlanId(plan.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        {isCurrentPlan && <Badge variant="secondary">Поточний</Badge>}
                        {!isCurrentPlan && comparison.isUpgrade && (
                          <Badge className="bg-success/10 text-success border-success/20">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Апгрейд
                          </Badge>
                        )}
                        {!isCurrentPlan && comparison.isDowngrade && (
                          <Badge variant="outline">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Даунгрейд
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.badge}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold">{plan.price} грн</p>
                        <p className="text-xs text-muted-foreground">на місяць</p>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Кредитів:</span>
                          <span className="font-medium tabular-nums">{plan.credits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Дій:</span>
                          <span className="font-medium">~{plan.actions}</span>
                        </div>
                      </div>

                      {!isCurrentPlan && (
                        <div className="pt-2 border-t text-xs space-y-1">
                          <div className={`flex items-center gap-1 ${comparison.creditsDiff > 0 ? "text-success" : "text-destructive"}`}>
                            {comparison.creditsDiff > 0 ? (
                              <>
                                <TrendingUp className="h-3 w-3" />
                                +{comparison.creditsDiff.toLocaleString()} кредитів
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-3 w-3" />
                                {comparison.creditsDiff.toLocaleString()} кредитів
                              </>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 ${comparison.priceDiff > 0 ? "text-muted-foreground" : "text-success"}`}>
                            {comparison.priceDiff > 0 ? (
                              <>+{comparison.priceDiff.toFixed(2)} грн/міс</>
                            ) : (
                              <>-{Math.abs(comparison.priceDiff).toFixed(2)} грн/міс</>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Comparison Details */}
          {selectedPlan && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Порівняння тарифів</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="font-medium text-muted-foreground">Параметр</div>
                  <div className="font-medium text-center">{currentPlan.name}</div>
                  <div className="font-medium text-center text-primary">{selectedPlan.name}</div>
                  
                  <Separator className="col-span-3" />
                  
                  <div className="text-muted-foreground">Ціна</div>
                  <div className="text-center">{currentPlan.price} грн/міс</div>
                  <div className="text-center font-medium">{selectedPlan.price} грн/міс</div>
                  
                  <div className="text-muted-foreground">Кредитів</div>
                  <div className="text-center tabular-nums">{currentPlan.credits.toLocaleString()}</div>
                  <div className="text-center tabular-nums font-medium">{selectedPlan.credits.toLocaleString()}</div>
                  
                  <div className="text-muted-foreground">Дій у системі</div>
                  <div className="text-center">~{currentPlan.actions}</div>
                  <div className="text-center font-medium">~{selectedPlan.actions}</div>
                  
                  <div className="text-muted-foreground">Поповнення 1 грн</div>
                  <div className="text-center tabular-nums">{currentPlan.topUpRate.toLocaleString()}</div>
                  <div className="text-center tabular-nums font-medium">{selectedPlan.topUpRate.toLocaleString()}</div>
                  
                  <Separator className="col-span-3" />
                  
                  <div className="text-muted-foreground">Різниця</div>
                  <div className="col-span-2 text-center">
                    {(() => {
                      const comp = getComparison(selectedPlan);
                      return (
                        <div className="space-y-1">
                          <p className={comp.priceDiff > 0 ? "" : "text-success"}>
                            {comp.priceDiff > 0 ? `+${comp.priceDiff.toFixed(2)} грн` : `-${Math.abs(comp.priceDiff).toFixed(2)} грн`} / місяць
                          </p>
                          <p className={comp.creditsDiff > 0 ? "text-success" : "text-destructive"}>
                            {comp.creditsDiff > 0 ? "+" : ""}{comp.creditsDiff.toLocaleString()} кредитів
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Feature comparison table */}
                <div className="space-y-3">
                  <h4 className="font-medium">Функції, які зміняться:</h4>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-3 gap-0 text-sm">
                      <div className="font-medium text-muted-foreground p-2 bg-muted/50">Функція</div>
                      <div className="font-medium text-center p-2 bg-muted/50">{currentPlan.name}</div>
                      <div className="font-medium text-center p-2 bg-muted/50 text-primary">{selectedPlan.name}</div>
                      {comparisonFeatures.map((f) => {
                        const currentHas = f[currentPlan.id as keyof typeof f] as boolean;
                        const newHas = f[selectedPlan.id as keyof typeof f] as boolean;
                        const isLost = currentHas && !newHas;
                        const isGained = !currentHas && newHas;
                        return (
                          <div key={f.feature} className="contents">
                            <div className={`p-2 border-t text-sm ${isLost ? "bg-destructive/5 font-medium" : ""}`}>
                              {f.feature}
                            </div>
                            <div className={`p-2 border-t text-center ${isLost ? "bg-destructive/5" : ""}`}>
                              {currentHas ? (
                                <Check className="h-4 w-4 text-success mx-auto" />
                              ) : (
                                <Minus className="h-4 w-4 text-muted-foreground mx-auto" />
                              )}
                            </div>
                            <div className={`p-2 border-t text-center ${isLost ? "bg-destructive/5" : isGained ? "bg-success/5" : ""}`}>
                              {newHas ? (
                                <Check className="h-4 w-4 text-success mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-destructive mx-auto" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Detailed consequences */}
                <div className="mt-4">
                  {getComparison(selectedPlan).isUpgrade ? (
                    <Alert className="border-primary/30 bg-primary/5">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertDescription>
                        <ul className="space-y-1.5 text-sm mt-1">
                          <li>Зміна набуде чинності з <strong>наступного розрахункового періоду</strong></li>
                          <li>Ваш баланс <strong>{demoUserData.balance.toLocaleString()} кредитів</strong> збережеться</li>
                          <li>Нові кредити (<strong>{selectedPlan.credits.toLocaleString()}</strong> замість <strong>{currentPlan.credits.toLocaleString()}</strong>) нарахуються при наступному списанні</li>
                          <li>Щомісячна оплата зміниться з <strong>{currentPlan.price} грн</strong> на <strong>{selectedPlan.price} грн</strong></li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription>
                        <ul className="space-y-1.5 text-sm mt-1">
                          <li>Зміна набуде чинності з <strong>наступного розрахункового періоду</strong></li>
                          <li>Ваш баланс <strong>{demoUserData.balance.toLocaleString()} кредитів</strong> збережеться</li>
                          <li>При наступному списанні нарахується менше кредитів (<strong>{selectedPlan.credits.toLocaleString()}</strong> замість <strong>{currentPlan.credits.toLocaleString()}</strong>)</li>
                          {(() => {
                            // Find features unavailable on the new plan
                            const unavailable = comparisonFeatures.filter(f => {
                              const currentHas = f[currentPlan.id as keyof typeof f] as boolean;
                              const newHas = f[selectedPlan.id as keyof typeof f] as boolean;
                              return currentHas && !newHas;
                            });
                            if (unavailable.length > 0) {
                              return (
                                <li>Функції, недоступні на тарифі «{selectedPlan.name}» ({unavailable.map(f => f.feature.toLowerCase()).join(", ")}), будуть <strong>деактивовані</strong></li>
                              );
                            }
                            return null;
                          })()}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {selectedPlan && getComparison(selectedPlan).isDowngrade ? (
              <Button 
                size="lg" 
                variant="outline"
                className="flex-1 border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30"
                onClick={handleConfirmChange}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Перейти на тариф «{selectedPlan.name}» (даунгрейд)
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="flex-1"
                disabled={!selectedPlanId}
                onClick={handleConfirmChange}
              >
                {selectedPlan ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Перейти на тариф «{selectedPlan.name}»
                  </>
                ) : (
                  "Оберіть тариф"
                )}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/dashboard?tab=user-settings&subtab=tariff&section=tariffs")}
            >
              Скасувати
            </Button>
          </div>

          {/* Downgrade confirmation dialog */}
          {selectedPlan && getComparison(selectedPlan).isDowngrade && (
            <ConfirmDowngradeDialog
              open={downgradeDialogOpen}
              onOpenChange={setDowngradeDialogOpen}
              currentPlan={currentPlan}
              newPlan={selectedPlan}
            />
          )}

          {/* Info Note */}
          <p className="text-xs text-muted-foreground text-center">
            Зміна тарифу набуде чинності з наступного розрахункового періоду. 
            Невикористані кредити збережуться на вашому балансі.
          </p>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChangePlan;
