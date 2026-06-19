import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Building2, Clock, Check, Shield, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { plans, individualPlans } from "@/config/pricingData";
import { contractorSpecialOffers } from "@/config/referralConfig";

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "smart";
  // Free Start tier (Бізнес "start" / Фізособа "free") активується миттєво,
  // без trial-banner і без CVV — це постійний безкоштовний тариф.
  const isFreeTier = planId === "start" || planId === "free";
  const isTrial = !isFreeTier && searchParams.get("trial") === "true";
  const refCode = searchParams.get("ref");
  
  const plan = [...plans, ...individualPlans].find(p => p.id === planId) || plans[1];
  
  const emailFromUrl = searchParams.get("email") || "";
  
  const [formData, setFormData] = useState({
    companyName: "",
    email: emailFromUrl,
    fullName: "",
    isNewUser: true,
    paymentMethod: "card",
    agreeTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFreeTier) {
      // Безкоштовний Start — миттєва активація без оплати.
      navigate(`/checkout/success?plan=${planId}`);
      return;
    }
    
    if (isTrial) {
      // Trial activation - always success for demo
      navigate(`/checkout/success?plan=${planId}&trial=true`);
      return;
    }
    
    // Regular payment - randomly succeed or fail for demo
    const success = Math.random() > 0.3;
    if (success) {
      navigate(`/checkout/success?plan=${planId}`);
    } else {
      navigate(`/checkout/error?plan=${planId}`);
    }
  };

  // Calculate discounted price for referrals
  const hasReferralDiscount = !!refCode;
  const discountedPrice = hasReferralDiscount 
    ? (plan.price * (1 - contractorSpecialOffers.firstMonthDiscount / 100)).toFixed(2)
    : plan.price;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.length > 1 ? navigate(-1) : navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">
            {isFreeTier ? "Активація безкоштовного тарифу" : isTrial ? "Активація пробного періоду" : "Оформлення підписки"}
          </h1>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
          {/* Free Tier Banner (Start) */}
          {isFreeTier && (
            <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-6 w-6 text-success" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Безкоштовний тариф Start</h3>
                    <p className="text-sm text-muted-foreground">
                      300 кредитів на місяць назавжди — оновлюються 1-го числа. Без картки, без обмежень за часом.
                      Захочете більше — переходьте на Смарт або Преміум у будь-який момент.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>0 ₴/міс назавжди</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>Без картки</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>300 кредитів/міс</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trial Banner */}
          {isTrial && (
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">14 днів повного доступу</h3>
                    <p className="text-sm text-muted-foreground">
                      Випробуйте всі функції плану «{plan.name}» без прив'язки картки.
                      Після закінчення — рішення за вами: продовжити оплачено, перейти на безкоштовний Start, або скасувати.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>Без картки</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>Повний функціонал</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span>Скасувати будь-коли</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Referral Bonus Banner */}
          {hasReferralDiscount && !isTrial && (
            <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Gift className="h-5 w-5 text-success" />
                <div>
                  <span className="font-medium">Знижка за запрошенням: </span>
                  <span className="text-success font-bold">-{contractorSpecialOffers.firstMonthDiscount}% перший місяць</span>
                </div>
              </CardContent>
            </Card>
          )}


          {/* Selected Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Обраний тариф
                <Badge variant="secondary">{plan.name}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isFreeTier ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тариф:</span>
                    <span className="font-semibold">0 ₴/міс назавжди</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Кредитів на місяць:</span>
                    <span className="font-semibold tabular-nums">{plan.credits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Картка:</span>
                    <span className="font-medium">не потрібна</span>
                  </div>
                </>
              ) : isTrial ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Період:</span>
                    <span className="font-semibold">14 днів безкоштовно</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Кредитів у періоді:</span>
                    <span className="font-semibold tabular-nums">{plan.credits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">Після trial:</span>
                    <span className="font-medium">{plan.price} грн/міс або скасуйте</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Місячна ціна:</span>
                    <div className="flex items-center gap-2">
                      {hasReferralDiscount && (
                        <span className="text-muted-foreground line-through">{plan.price} грн</span>
                      )}
                      <span className="font-semibold">{discountedPrice} грн</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Кредитів у місяць:</span>
                    <span className="font-semibold tabular-nums">{plan.credits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Орієнтовно дій:</span>
                    <span>~{plan.actions}</span>
                  </div>
                  {hasReferralDiscount && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-muted-foreground">Бонус при старті:</span>
                      <span className="font-semibold text-success">
                        +{(contractorSpecialOffers.bonusCredits / 1000).toFixed(0)}K кредитів
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* User Data Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Дані користувача</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Назва компанії</Label>
                  <Input
                    id="companyName"
                    placeholder="ТОВ 'Назва компанії'"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ім'я та прізвище</Label>
                  <Input
                    id="fullName"
                    placeholder="Іван Петренко"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNewUser"
                    checked={formData.isNewUser}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isNewUser: checked as boolean }))
                    }
                  />
                  <Label htmlFor="isNewUser" className="text-sm font-normal">
                    Я новий користувач
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method - hide on trial and free tier */}
            {!isTrial && !isFreeTier && (
              <Card>
                <CardHeader>
                  <CardTitle>Спосіб оплати</CardTitle>
                  <CardDescription>
                    Оплата за перший місяць підписки. Підписка продовжується автоматично щомісяця, доки ви її не скасуєте.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-4 w-4" />
                        Банківська карта
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="invoice" id="invoice" />
                      <Label htmlFor="invoice" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building2 className="h-4 w-4" />
                        Рахунок для оплати
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Terms for trial */}
            {isTrial && (
              <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))
                  }
                  required
                />
                <Label htmlFor="agreeTerms" className="text-sm font-normal leading-relaxed">
                  Я погоджуюсь з <a href="#" className="text-primary underline">умовами використання</a> та 
                  <a href="#" className="text-primary underline"> політикою конфіденційності</a>. 
                  Розумію, що після 14 днів мені запропонують обрати платний тариф.
                </Label>
              </div>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full gap-2"
              disabled={isTrial && !formData.agreeTerms}
            >
              {isFreeTier ? (
                <>
                  <Sparkles className="h-5 w-5" />
                  Активувати Start безкоштовно
                </>
              ) : isTrial ? (
                <>
                  <Sparkles className="h-5 w-5" />
                  Активувати 14-денний пробний доступ
                </>
              ) : (
                <>
                  Перейти до оплати — {discountedPrice} грн
                </>
              )}
            </Button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Захищено SSL
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                GDPR Compliant
              </div>
            </div>
          </form>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Checkout;
