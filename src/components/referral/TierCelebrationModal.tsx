import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Share2, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ReferralTier } from "@/config/referralConfig";

interface TierCelebrationModalProps {
  tier: ReferralTier | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export const TierCelebrationModal = ({
  tier,
  isOpen,
  onClose,
  onShare,
}: TierCelebrationModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!tier) return null;

  const formatCredits = (credits: number) => {
    if (credits >= 1000) {
      return `${(credits / 1000).toFixed(0)}K`;
    }
    return credits.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-2 h-2 rounded-full animate-bounce",
                  i % 4 === 0 && "bg-primary",
                  i % 4 === 1 && "bg-amber-400",
                  i % 4 === 2 && "bg-emerald-400",
                  i % 4 === 3 && "bg-rose-400"
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                  transform: `translateY(${100 + Math.random() * 200}px)`,
                }}
              />
            ))}
          </div>
        )}

        <DialogHeader className="text-center space-y-4 pt-4">
          {/* Badge animation */}
          <div className="relative mx-auto">
            <div className="text-6xl animate-pulse">{tier.badge || "🎉"}</div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-spin" style={{ animationDuration: "3s" }} />
            <Sparkles className="absolute -bottom-1 -left-2 h-4 w-4 text-primary animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
          </div>

          <DialogTitle className="text-xl font-bold">
            <PartyPopper className="inline h-5 w-5 mr-2 text-amber-500" />
            Вітаємо!
          </DialogTitle>

          <DialogDescription className="text-base">
            Ви досягли рівня{" "}
            <span className="font-semibold text-foreground">"{tier.name}"</span>!
          </DialogDescription>
        </DialogHeader>

        {/* Benefits section */}
        <div className="mt-4 space-y-3 bg-gradient-to-br from-primary/10 to-amber-500/10 rounded-lg p-4">
          <p className="text-sm font-medium text-center">Тепер ви отримуєте:</p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="shrink-0">
                +{formatCredits(tier.creditsPerReferral)}
              </Badge>
              <span className="text-muted-foreground">кредитів за кожного реферала</span>
            </div>

            {tier.bonus && (
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-emerald-600 shrink-0">Бонус</Badge>
                <span className="text-muted-foreground">{tier.bonus}</span>
              </div>
            )}

            {tier.bonusDetails && (
              <p className="text-xs text-muted-foreground pl-1 border-l-2 border-primary/30">
                {tier.bonusDetails}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Продовжити
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onShare?.();
              onClose();
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Поділитись
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TierCelebrationModal;
