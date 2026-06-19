import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Gift, Percent, Sparkles, Users, Shield, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { contractorSpecialOffers } from "@/config/referralConfig";

const InviteLanding = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Demo: Extract partner name from code or use default
  const partnerName = searchParams.get("partner") || "Ваш партнер";
  
  const handleStartTrial = () => {
    navigate(`/checkout?plan=start&ref=${code}`);
  };

  const handleViewPricing = () => {
    navigate(`/pricing?source=invite&ref=${code}&partner=${encodeURIComponent(partnerName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Invite Badge */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="px-4 py-2 text-sm gap-2">
            <Gift className="h-4 w-4" />
            Персональне запрошення
          </Badge>
        </div>

        {/* Main Hero */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">
            <span className="text-primary">{partnerName}</span>
            <br />
            запрошує вас до FINAIDRIVE
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-платформа для автоматизації бухгалтерії, податків та документообігу.
            Отримайте спеціальні умови за запрошенням!
          </p>
        </div>

        {/* Special Offer Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mb-12">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Спеціальна пропозиція для вас</h2>
                <p className="text-muted-foreground">
                  Ексклюзивні бонуси, доступні тільки за запрошенням
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
              {/* Benefit 1 */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background/60">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <Percent className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold">-{contractorSpecialOffers.firstMonthDiscount}% перший місяць</p>
                  <p className="text-sm text-muted-foreground">На будь-який тариф</p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background/60">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">+{(contractorSpecialOffers.bonusCredits / 1000).toFixed(0)}K кредитів</p>
                  <p className="text-sm text-muted-foreground">Бонус при старті</p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-background/60">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-semibold">Безкоштовний Start</p>
                  <p className="text-sm text-muted-foreground">300 кредитів/міс, без картки</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="min-h-[52px] text-lg px-8 gap-2" onClick={handleStartTrial}>
                Почати безкоштовно
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="min-h-[52px]" onClick={handleViewPricing}>
                Переглянути тарифи
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Що ви отримуєте</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Shield,
                title: "AI-Бухгалтер 24/7",
                description: "Автоматичний розрахунок податків, генерація звітів та підказки",
              },
              {
                icon: Users,
                title: "Єдиний простір з партнером",
                description: "Спільна робота з документами, автоматична синхронізація реквізитів",
              },
              {
                icon: Star,
                title: "Всі документи в одному місці",
                description: "Рахунки, акти, договори, податкові звіти — все автоматизовано",
              },
              {
                icon: Clock,
                title: "Економія до 15 годин/місяць",
                description: "Система робить рутину за вас, ви лише затверджуєте",
              },
            ].map((feature, index) => (
              <Card key={index}>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="h-5 w-5 text-success" />Без прив'язки картки</span>
            <span className="flex items-center gap-1.5"><Check className="h-5 w-5 text-success" />Скасування в будь-який момент</span>
            <span className="flex items-center gap-1.5"><Check className="h-5 w-5 text-success" />Підтримка 24/7</span>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="min-h-[52px] text-lg px-10 gap-2"
            onClick={handleStartTrial}
          >
            <Gift className="h-5 w-5" />
            Активувати пропозицію
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Код запрошення: <code className="bg-muted px-2 py-1 rounded">{code || "DEMO"}</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteLanding;
