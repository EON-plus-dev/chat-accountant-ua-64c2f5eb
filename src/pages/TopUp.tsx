import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { creditsForUah, PLAN_LIST, type PlanId } from "@/config/billingModel";

const topUpAmounts = [100, 300, 1000]; // ₴

const TopUp = () => {
  const navigate = useNavigate();
  const { plan, loading } = useUserSubscription();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(300);
  const [customAmount, setCustomAmount] = useState("");

  const activeAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  const creditsToReceive = creditsForUah(activeAmount, plan.id);

  // Compare what the same UAH would yield on a higher plan
  const upgradeHint = (() => {
    const idx = PLAN_LIST.findIndex((p) => p.id === plan.id);
    const next = PLAN_LIST[idx + 1];
    if (!next) return null;
    const credsOnNext = creditsForUah(activeAmount, next.id as PlanId);
    const diff = credsOnNext - creditsToReceive;
    if (diff <= 0) return null;
    return { plan: next, diff };
  })();

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleSubmit = () => {
    if (activeAmount <= 0) return;
    const success = Math.random() > 0.3;
    if (success) {
      navigate(`/top-up/success?amount=${activeAmount}&credits=${creditsToReceive}`);
    } else {
      navigate("/top-up/error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard?tab=user-settings&subtab=tariff&section=tariffs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Поповнення кредитів</h1>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="container mx-auto px-4 py-8 max-w-lg space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Поточний тариф</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">План:</span>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <Badge variant="secondary">{plan.label}</Badge>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Курс докупівлі:</span>
                <span className="font-semibold tabular-nums">
                  1 ₴ → {plan.topUpRatePerUah} кр
                </span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Чим вищий тариф — тим вигідніша ціна докупівлі кредитів понад квоту.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Сума поповнення</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {topUpAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    className="h-16 text-lg"
                    onClick={() => handleAmountSelect(amount)}
                  >
                    {amount} ₴
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customAmount">Інша сума (₴)</Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Введіть суму"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                />
              </div>

              {activeAmount > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg text-center space-y-1">
                  <p className="text-sm text-muted-foreground">
                    На тарифі «{plan.label}» за {activeAmount} ₴ ви отримаєте:
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {creditsToReceive.toLocaleString("uk-UA")} кредитів
                  </p>
                </div>
              )}

              {upgradeHint && (
                <div className="p-3 rounded-md border border-primary/30 bg-primary/5 text-xs flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    На тарифі «{upgradeHint.plan.label}» за ту саму суму ви отримали б{" "}
                    <span className="font-semibold">+{upgradeHint.diff.toLocaleString("uk-UA")} кредитів</span>.{" "}
                    <button
                      type="button"
                      className="underline underline-offset-2 hover:text-primary"
                      onClick={() => navigate("/pricing")}
                    >
                      Порівняти тарифи
                    </button>
                    .
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={activeAmount <= 0}
          >
            Перейти до оплати — {activeAmount || 0} ₴
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TopUp;
