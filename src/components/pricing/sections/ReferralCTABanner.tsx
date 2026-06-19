import { useNavigate } from "react-router-dom";
import { Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralCTABannerProps {
  onNavigateToReferral?: () => void;
}

export const ReferralCTABanner = ({ onNavigateToReferral }: ReferralCTABannerProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onNavigateToReferral) {
      onNavigateToReferral();
    } else {
      navigate("/dashboard?tab=user-settings&subtab=earnings");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary/10 shrink-0">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              Запросіть партнера — отримайте +5K кредитів
            </h3>
            <p className="text-sm text-muted-foreground">
              За кожного нового користувача, який активує підписку
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="gap-2 shrink-0"
          onClick={handleClick}
        >
          Як це працює
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};
