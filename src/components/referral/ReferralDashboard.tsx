import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Copy, 
  Check, 
  TrendingUp,
  ChevronRight,
  Send,
  MessageCircle,
  Phone,
  Edit3,
  UserPlus,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  referralTypes,
  getReferralStats,
  generateMockTransactions,
  formatReferralCredits,
  type ReferralTransaction,
} from "@/config/referralConfig";
import { toast } from "sonner";
import { TierCelebrationModal } from "./TierCelebrationModal";
import { ReferralHistory } from "./ReferralHistory";
import { EarningsHero } from "./EarningsHero";
import { useNavigate } from "react-router-dom";

interface ReferralDashboardProps {
  totalReferrals?: number;
  paidConversions?: number;
  inviteCode?: string;
  onInviteContractor?: () => void;
  onInviteTeamMember?: () => void;
  onLearnMore?: () => void;
  transactions?: ReferralTransaction[];
  className?: string;
}

export const ReferralDashboard = ({
  totalReferrals = 5,
  paidConversions = 2,
  inviteCode = "ABC-123-XYZ",
  onInviteContractor,
  onInviteTeamMember,
  onLearnMore,
  transactions,
  className,
}: ReferralDashboardProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTier, setCelebrationTier] = useState<any>(null);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  
  const stats = getReferralStats(totalReferrals, paidConversions);
  
  // Use provided transactions or generate mock data
  const displayTransactions = transactions || generateMockTransactions(5);
  
  const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
  
  const defaultMessage = `Приєднуйся до FlowBiz та отримай знижку 50% на перший місяць! Реєструйся за моїм посиланням:`;
  const shareMessage = `${customMessage || defaultMessage} ${inviteUrl}`;
  
  // Check for tier upgrade
  useEffect(() => {
    const savedTierLevel = localStorage.getItem("referral_tier_level");
    const currentLevel = stats.currentTier.level;
    
    if (savedTierLevel && parseInt(savedTierLevel) < currentLevel) {
      setCelebrationTier(stats.currentTier);
      setShowCelebration(true);
    }
    
    localStorage.setItem("referral_tier_level", String(currentLevel));
  }, [stats.currentTier.level]);
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast.success("Повідомлення з посиланням скопійовано!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  };
  
  const handleShareTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(customMessage || defaultMessage)}`;
    window.open(telegramUrl, "_blank");
  };
  
  const handleShareViber = () => {
    const viberUrl = `viber://forward?text=${encodeURIComponent(shareMessage)}`;
    window.open(viberUrl, "_blank");
  };
  
  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, "_blank");
  };
  
  const handleSaveMessage = () => {
    setIsEditingMessage(false);
    toast.success("Повідомлення збережено");
  };

  // Empty state for new users
  if (totalReferrals === 0 && paidConversions === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <TierCelebrationModal
          tier={celebrationTier}
          isOpen={showCelebration}
          onClose={() => setShowCelebration(false)}
          onShare={handleShareTelegram}
        />
        
        {/* Empty State Hero */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-emerald-50/30 dark:to-emerald-950/10">
          <CardContent className="p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Почніть заробляти вже сьогодні!</h3>
              <p className="text-sm text-muted-foreground">
                Запрошуйте партнерів та отримуйте кредити за кожного
              </p>
            </div>
            
            {/* 3-Step Onboarding */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-sm font-bold">
                  1
                </div>
                <p className="text-xs text-muted-foreground">Скопіюйте посилання</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-sm font-bold">
                  2
                </div>
                <p className="text-xs text-muted-foreground">Надішліть партнеру</p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-sm font-bold">
                  3
                </div>
                <p className="text-xs text-muted-foreground">Отримайте +5K кредитів</p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:justify-end">
              <Button size="sm" className="h-9 gap-2" onClick={onInviteContractor}>
                <UserPlus className="h-4 w-4" />
                Запросити контрагента
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2"
                onClick={() => navigate("/dashboard?tab=pricing&section=referral-program")}
              >
                Як це працює?
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Share Section even for empty state */}
        <Card>
          <CardContent className="p-3 space-y-3">
            <p className="text-xs font-medium">Ваше реферальне посилання</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-md bg-muted text-xs font-mono truncate">
                {inviteUrl}
              </div>
              <Button 
                variant="outline" 
                size="icon"
                className="shrink-0"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 gap-2 text-[#0088cc] hover:text-[#0088cc] hover:bg-[#0088cc]/10"
                onClick={handleShareTelegram}
              >
                <Send className="h-4 w-4" />
                Telegram
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 gap-2 text-[#7360f2] hover:text-[#7360f2] hover:bg-[#7360f2]/10"
                onClick={handleShareViber}
              >
                <MessageCircle className="h-4 w-4" />
                Viber
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 gap-2 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
                onClick={handleShareWhatsApp}
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Celebration Modal */}
      <TierCelebrationModal
        tier={celebrationTier}
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        onShare={handleShareTelegram}
      />
      
      {/* Earnings Hero with Timeline */}
      <EarningsHero 
        stats={stats} 
        totalReferrals={totalReferrals}
        onNavigateToPricing={onLearnMore}
      />
      
      {/* Quick Actions - Inline with descriptions */}
      <div className="grid grid-cols-3 gap-2">
        {/* Контрагент */}
        <div className="relative">
          <Button 
            variant="outline" 
            className="flex-col items-start h-auto p-3 gap-1 w-full"
            onClick={onInviteContractor}
          >
            <Badge variant="secondary" className="text-xs mb-1">
              {formatReferralCredits(referralTypes.contractor.credits)}
            </Badge>
            <span className="text-sm font-medium flex items-center gap-1">
              <UserPlus className="h-3.5 w-3.5" />
              Контрагент
            </span>
            <span className="text-[10px] text-muted-foreground text-left leading-tight">
              Навіть за безкоштовну реєстрацію
            </span>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
              >
                <Info className="h-3 w-3 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              <p className="text-xs">
                Бонус за нового контрагента, який зареєструвався в системі (навіть з безкоштовним пасивним кабінетом)
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Учасник */}
        <div className="relative">
          <Button 
            variant="outline" 
            className="flex-col items-start h-auto p-3 gap-1 w-full"
            onClick={onInviteTeamMember}
          >
            <Badge variant="secondary" className="text-xs mb-1">
              {formatReferralCredits(referralTypes.teamMember.credits)}
            </Badge>
            <span className="text-sm font-medium flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Учасник
            </span>
            <span className="text-[10px] text-muted-foreground text-left leading-tight">
              Тільки для власника кабінету
            </span>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
              >
                <Info className="h-3 w-3 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              <p className="text-xs">
                Доступно тільки для Власника кабінету. Кредити нараховуються при реєстрації нового учасника системи.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Оплата */}
        <div className="relative">
          <Button 
            variant="outline" 
            className="flex-col items-start h-auto p-3 gap-1 w-full opacity-80 cursor-default"
            disabled
          >
            <Badge variant="success" className="text-xs mb-1">
              {formatReferralCredits(referralTypes.paidConversion.credits)}
            </Badge>
            <span className="text-sm font-medium flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              Оплата
            </span>
            <span className="text-[10px] text-muted-foreground text-left leading-tight">
              Додатково при першій оплаті
            </span>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
              >
                <Info className="h-3 w-3 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              <p className="text-xs">
                Додатковий бонус, коли ваш реферал оплатить першу підписку. Нараховується автоматично.
              </p>
            </TooltipContent>
          </Tooltip>
          <Badge 
            variant="outline" 
            className="absolute -top-2 -right-2 text-[9px] bg-background"
          >
            Авто
          </Badge>
        </div>
      </div>
      
      {/* Share Section with Message Preview */}
      <Card>
        <CardContent className="p-3 space-y-3">
          {/* Message Preview/Edit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <Send className="h-3 w-3 text-muted-foreground" />
                Ваше повідомлення для партнерів
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs gap-1 px-2"
                onClick={() => setIsEditingMessage(!isEditingMessage)}
              >
                <Edit3 className="h-3 w-3" />
                {isEditingMessage ? "Скасувати" : "Редагувати"}
              </Button>
            </div>
            
            {isEditingMessage ? (
              <div className="space-y-2">
                <Textarea 
                  value={customMessage || defaultMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Введіть ваше повідомлення..."
                  className="text-xs min-h-[60px] resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-7 text-xs" onClick={handleSaveMessage}>
                    Зберегти
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs"
                    onClick={() => {
                      setCustomMessage("");
                      setIsEditingMessage(false);
                    }}
                  >
                    Скинути
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-md bg-muted/50 border border-border/50">
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{customMessage || defaultMessage}"
                </p>
                <p className="text-xs font-mono text-primary mt-1.5 truncate">
                  {inviteUrl}
                </p>
              </div>
            )}
          </div>
          
          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 gap-2 text-[#0088cc] hover:text-[#0088cc] hover:bg-[#0088cc]/10"
              onClick={handleShareTelegram}
            >
              <Send className="h-4 w-4" />
              Telegram
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 gap-2 text-[#7360f2] hover:text-[#7360f2] hover:bg-[#7360f2]/10"
              onClick={handleShareViber}
            >
              <MessageCircle className="h-4 w-4" />
              Viber
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 gap-2 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
              onClick={handleShareWhatsApp}
            >
              <Phone className="h-4 w-4" />
              WhatsApp
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              className="shrink-0"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Referral History */}
      <ReferralHistory transactions={displayTransactions} />
    </div>
  );
};

export default ReferralDashboard;
