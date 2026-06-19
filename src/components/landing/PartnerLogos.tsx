import {
  Wallet, CreditCard, FileText, Clock, Shield,
  TrendingUp, Building2, Landmark, Database, FileCheck,
  type LucideIcon,
} from "lucide-react";
import { partners } from "@/config/landingData";

const iconMap: Record<string, LucideIcon> = {
  Wallet, CreditCard, FileText, Clock, Shield,
  TrendingUp, Building2, Landmark, Database, FileCheck,
};

export const PartnerLogos = () => {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground text-center tracking-wide uppercase">
        Інтегруємося з:
      </p>
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, white 10%, white 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, white 10%, white 90%, transparent)",
        }}
      >
        <div
          className="flex gap-10 py-3 w-max hover:[animation-play-state:paused]"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {[...partners, ...partners].map((partner, i) => {
            const Icon = iconMap[partner.icon] || FileText;
            return (
              <div
                key={`${partner.name}-${i}`}
                className="flex items-center gap-2 shrink-0 grayscale opacity-40 hover:opacity-70 hover:grayscale-0 transition-all duration-300 cursor-default select-none"
                aria-hidden={i >= partners.length ? true : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm font-semibold whitespace-nowrap">{partner.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
