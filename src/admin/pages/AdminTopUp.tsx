import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CREDIT_RATE = 11000; // credits per 1 грн

const topUpOptions = [
  { amount: 50, popular: false },
  { amount: 100, popular: true },
  { amount: 200, popular: false },
  { amount: 500, popular: false },
];

const currentModel = { label: "Gemini Flash", costPerKTokens: 1.0 };
const currentLength = { label: "Середня (~1500 слів)", tokens: 3000 };
const currentBalance = 148;

const calcCostPerArticle = (costPerKTokens: number, tokens: number) =>
  Math.ceil(costPerKTokens * (tokens / 1000));

const AdminTopUp = () => {
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = useState(100);

  const credits = selectedAmount * CREDIT_RATE;
  const costPerArticle = calcCostPerArticle(currentModel.costPerKTokens, currentLength.tokens);
  const articlesCount = costPerArticle > 0 ? Math.floor(credits / costPerArticle) : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/admin/editorial-settings")}>
          <ArrowLeft className="h-4 w-4" />
          Назад до налаштувань
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Поповнення балансу генерації</h1>
          <p className="text-muted-foreground text-sm">
            Кредити використовуються для генерації та верифікації контенту
          </p>
        </div>

        {/* Current balance */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Поточний баланс</p>
              <p className="text-2xl font-bold tabular-nums">{currentBalance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">кредитів</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Модель: {currentModel.label}</p>
              <p className="text-xs text-muted-foreground">~{costPerArticle} кр/стаття</p>
            </div>
          </CardContent>
        </Card>

        {/* Amount selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Оберіть суму поповнення</p>
          <div className="grid grid-cols-2 gap-3">
            {topUpOptions.map((opt) => {
              const optCredits = opt.amount * CREDIT_RATE;
              const optArticles = costPerArticle > 0 ? Math.floor(optCredits / costPerArticle) : 0;
              return (
                <button
                  key={opt.amount}
                  onClick={() => setSelectedAmount(opt.amount)}
                  className={cn(
                    "relative rounded-xl border-2 p-4 text-left transition-all",
                    selectedAmount === opt.amount
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  {opt.popular && (
                    <Badge className="absolute -top-2 right-3 text-[10px]">Популярний</Badge>
                  )}
                  <p className="text-lg font-bold">{opt.amount} грн</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{optCredits.toLocaleString()} кредитів</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    ~{optArticles} статей
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculator summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Що ви отримаєте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сума:</span>
              <span className="font-semibold">{selectedAmount} грн</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Кредити:</span>
              <span className="font-semibold tabular-nums">{credits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">≈ статей ({currentLength.label}):</span>
              <span className="font-bold text-primary tabular-nums">~{articlesCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pay button */}
        <Button
          size="lg"
          className="w-full gap-2 text-base"
          onClick={() => navigate(`/admin/top-up/success?amount=${selectedAmount}&credits=${credits}`)}
        >
          <CreditCard className="h-5 w-5" />
          Оплатити {selectedAmount} грн
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          Оплата обробляється захищеним платіжним шлюзом. Кредити нараховуються миттєво.
        </p>
      </div>
    </div>
  );
};

export default AdminTopUp;
