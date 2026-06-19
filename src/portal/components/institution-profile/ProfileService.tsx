import {
  Star, ExternalLink,
  MapPin, Headphones, Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InstitutionMapEmbed } from "@/portal/components/InstitutionMapEmbed";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

interface Props {
  profile: FullInstitutionProfile;
}

export const ProfileService = ({ profile }: Props) => {
  const isOnlineOnly = profile.branches.totalCount === 0;

  return (
    <section id="service" className="border-t border-border pt-6 mt-8 scroll-mt-28">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Headphones className="w-6 h-6 text-primary" /> Сервіс та доступність
      </h2>

      {/* Platforms & App ratings */}
      <Card className="p-4 space-y-2 mt-4">
        <p className="text-sm font-semibold text-foreground">Платформи</p>
        <div className="border border-border rounded-lg overflow-hidden">
          {[
            { label: "Web", icon: "🌐", available: profile.platforms.web.available, url: profile.platforms.web.url, rating: undefined, reviews: undefined },
            { label: "iOS", icon: "📱", available: profile.platforms.ios.available, url: profile.platforms.ios.url, rating: profile.platforms.ios.rating, reviews: profile.platforms.ios.reviewCount },
            { label: "Android", icon: "🤖", available: profile.platforms.android.available, url: profile.platforms.android.url, rating: profile.platforms.android.rating, reviews: profile.platforms.android.reviewCount },
          ].map((plat, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-1.5 text-sm ${i > 0 ? "border-t border-border/50" : ""}`}>
              <span className="w-16 shrink-0 font-medium text-foreground text-xs">{plat.icon} {plat.label}</span>
              {plat.rating && (
                <span className="flex items-center gap-0.5 text-amber-500 text-xs">
                  <Star className="w-3 h-3 fill-current" /> {plat.rating}
                </span>
              )}
              {plat.reviews && <span className="text-[11px] text-muted-foreground">{plat.reviews.toLocaleString()}</span>}
              <span className="ml-auto">
                {plat.url ? (
                  <a href={plat.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs inline-flex items-center gap-0.5">
                    Перейти <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs">{plat.available ? "Доступно" : "—"}</span>
                )}
              </span>
            </div>
          ))}
        </div>
        {/* API */}
        {profile.platforms.api.available && (
          <div className="text-xs text-muted-foreground mt-1">
            API: Доступне{profile.platforms.api.sandbox ? " · Sandbox" : ""}
            {profile.platforms.api.docsUrl && (
              <a href={profile.platforms.api.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-2 inline-flex items-center gap-0.5">
                Документація <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
        {/* Integrations */}
        {profile.integrations.length > 0 && (
          <div className="mt-1">
            <p className="text-xs font-medium text-foreground mb-1">Інтеграції</p>
            <div className="flex flex-wrap gap-1">
              {profile.integrations.slice(0, 8).map((int, i) => (
                <Badge key={i} variant={int.isOfficial ? "success" : "secondary"} size="sm" className="text-[10px]">
                  {int.name}
                </Badge>
              ))}
              {profile.integrations.length > 8 && (
                <span className="text-[10px] text-muted-foreground self-center">+{profile.integrations.length - 8}</span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Branches & Coverage */}
      <div className="mt-4">
        {isOnlineOnly ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Повністю онлайн — без фізичних відділень
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                {profile.branches.totalCount || profile.branches.branchList.length} відділень
              </p>
              <span className="text-xs text-muted-foreground">· {profile.branches.coverageNote}</span>
              {profile.branches.findBranchUrl && (
                <a href={profile.branches.findBranchUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline ml-auto">
                  Знайти найближче ↗
                </a>
              )}
            </div>
            {profile.branches.branchList.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {profile.branches.branchList.slice(0, 2).map((branch) => (
                  <InstitutionMapEmbed key={branch.id} branch={branch} institutionName={profile.name} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
