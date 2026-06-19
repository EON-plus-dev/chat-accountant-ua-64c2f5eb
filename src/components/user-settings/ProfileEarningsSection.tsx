import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Building2, 
  Wallet,
  Info,
  ChevronDown,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ReferralDashboard } from "@/components/referral/ReferralDashboard";
import { CreditConversionCard } from "@/components/referral/CreditConversionCard";
import ReferralProgramSection from "@/components/marketing/ReferralProgramSection";
import { 
  getReferralStats,
  formatReferralCredits,
} from "@/config/referralConfig";
import { toast } from "sonner";

// Mock cabinet breakdown data
const mockCabinetBreakdown = [
  { cabinetId: "1", cabinetName: "ТОВ «Ромашка»", cabinetType: "tov" as const, referrals: 2, credits: 10000 },
  { cabinetId: "2", cabinetName: "ФОП Петренко І.І.", cabinetType: "fop" as const, referrals: 1, credits: 5000 },
  { cabinetId: "3", cabinetName: "ФОП Коваленко О.В.", cabinetType: "fop" as const, referrals: 2, credits: 10000 },
];

const mockOwnedCabinets = [
  { id: "1", name: "ТОВ «Ромашка»", currentCredits: 15000 },
  { id: "2", name: "ФОП Петренко І.І.", currentCredits: 8500 },
];

interface ProfileEarningsSectionProps {
  className?: string;
}

const ProfileEarningsSection = ({ className }: ProfileEarningsSectionProps) => {
  const [searchParams] = useSearchParams();
  const [programOpen, setProgramOpen] = useState(false);

  // Auto-open bonus program section when navigated with scrollTo=bonus-program
  useEffect(() => {
    if (searchParams.get("scrollTo") === "bonus-program") {
      setProgramOpen(true);
      setTimeout(() => {
        document.getElementById("bonus-program-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [searchParams]);
  
  const totalReferrals = mockCabinetBreakdown.reduce((sum, c) => sum + c.referrals, 0);
  const totalCreditsFromCabinets = mockCabinetBreakdown.reduce((sum, c) => sum + c.credits, 0);
  const paidConversions = 2;
  const availableCredits = 25000;
  
  const stats = getReferralStats(totalReferrals, paidConversions);

  const handleInviteContractor = () => {
    toast.info("Для запрошення контрагента перейдіть до налаштувань кабінету → Довідники → Контрагенти");
  };

  const handleInviteTeamMember = () => {
    toast.info("Для запрошення учасника перейдіть до налаштувань кабінету → Команда");
  };

  return (
    <div id="earnings-section" className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Заробіток</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Ваша реферальна статистика по всіх кабінетах
        </p>
      </div>

      {/* Main Dashboard */}
      <ReferralDashboard
        totalReferrals={totalReferrals}
        paidConversions={paidConversions}
        inviteCode="PROF-EARN-XYZ"
        onInviteContractor={handleInviteContractor}
        onInviteTeamMember={handleInviteTeamMember}
        onLearnMore={() => {
          setProgramOpen(true);
          setTimeout(() => {
            document.getElementById('bonus-program-section')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }}
      />

      <Separator />

      {/* Credit Conversion Section */}
      <CreditConversionCard
        availableCredits={availableCredits}
        ownedCabinets={mockOwnedCabinets}
      />

      <Separator />

      {/* Cabinet Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Статистика по кабінетах
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Звідки прийшли ваші реферали</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {mockCabinetBreakdown.map((cabinet) => (
              <div
                key={cabinet.cabinetId}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{cabinet.cabinetName}</p>
                    <p className="text-xs text-muted-foreground">
                      {cabinet.referrals} {cabinet.referrals === 1 ? "реферал" : "рефералів"}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {formatReferralCredits(cabinet.credits)}
                </Badge>
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Всього:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{totalReferrals} рефералів</span>
              <Badge variant="success">{formatReferralCredits(totalCreditsFromCabinets)}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card with Collapsible Referral Program */}
      <Card id="bonus-program-section" className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Wallet className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium">Як працює заробіток?</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Запрошуйте контрагентів чи учасників — отримуйте +5K за реєстрацію та +5K 
                при першій оплаті. Кредити накопичуються тут і можуть бути конвертовані 
                в кабінети, де ви є власником.
              </p>
              <Collapsible open={programOpen} onOpenChange={setProgramOpen}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs gap-1"
                  >
                    Детальніше про програму
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${programOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <ReferralProgramSection onStartReferring={() => {
                    setProgramOpen(false);
                    setTimeout(() => {
                      const el = document.getElementById('earnings-section');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 300);
                  }} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEarningsSection;
