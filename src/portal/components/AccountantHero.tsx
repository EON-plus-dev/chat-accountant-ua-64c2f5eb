import { Globe, Clock, Award, Send, MessageCircle, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EngagementRequestDialog } from "@/components/marketplace/EngagementRequestDialog";
import type { AccountantProfile } from "@/portal/data/accountants";

interface Props {
  acc: AccountantProfile;
  headlineTags: string[];
  availabilityLabel: string;
  availabilityClasses: string;
  availabilityStatus: "accepting" | "waitlist" | "closed";
  waitlistDays?: number;
}

const scrollToContact = () => {
  const el = document.getElementById("contact");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/**
 * Hero block: photo + identity + availability + CTA row.
 */
export function AccountantHero({
  acc,
  headlineTags,
  availabilityLabel,
  availabilityClasses,
  availabilityStatus,
  waitlistDays,
}: Props) {
  const isAgency = acc.entityType === "agency";
  const isClosed = availabilityStatus === "closed";

  const ctaHint =
    availabilityStatus === "accepting"
      ? `Зазвичай відповідає ${acc.responseTime}`
      : availabilityStatus === "waitlist"
      ? `Зараз лист очікування — ${waitlistDays ?? "?"} дн.`
      : "Зараз не приймає нових клієнтів";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* Photo / logo / fallback initials */}
        {acc.photoUrl ? (
          <img
            src={acc.photoUrl}
            alt={`${acc.name} — фото`}
            width={96}
            height={96}
            className={`w-24 h-24 object-cover shrink-0 border border-border ${
              isAgency ? "rounded-lg bg-white p-1" : "rounded-full"
            }`}
          />
        ) : (
          <div
            className={`w-24 h-24 flex items-center justify-center text-2xl font-bold text-white shrink-0 ${
              isAgency ? "rounded-lg" : "rounded-full"
            }`}
            style={{ backgroundColor: acc.initialsColor }}
            aria-label={`${acc.name} — ініціали`}
          >
            {acc.initials}
          </div>
        )}

        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{acc.name}</h1>
            {acc.isVerified && <Badge variant="info" className="text-[10px]">Підтверджено</Badge>}
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${availabilityClasses}`}>
              {availabilityLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span>{acc.city}, {acc.region}</span>
            {acc.isOnline && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Globe className="h-3.5 w-3.5" /> Приймає онлайн
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Відповідає {acc.responseTime}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {acc.isFintodoCertified && (
              <Badge variant="success" className="gap-1">
                <Award className="h-3.5 w-3.5" /> FINTODO Certified
              </Badge>
            )}
            {acc.certifications.filter((c) => !c.includes("FINTODO")).slice(0, 3).map((c) => (
              <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xs text-muted-foreground">{ctaHint}</p>
          {acc.isFintodoCertified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] text-success hover:underline"
                  >
                    <Percent className="h-3 w-3" />
                    Reseller FINTODO · знижка −25/30/35% на тариф
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  Як сертифікований Reseller, партнер дає клієнтам знижку залежно від його тарифу:
                  Solo (−25%), Agency (−30%), Firm (−35%). Застосується автоматично після прийняття запиту.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={scrollToContact}>
            <MessageCircle className="h-4 w-4" /> Написати
          </Button>
          {isClosed ? (
            <Button size="sm" disabled className="gap-1.5 hidden md:inline-flex">
              <Send className="h-4 w-4" /> Не приймає
            </Button>
          ) : (
            <EngagementRequestDialog
              accountantSlug={acc.slug}
              accountantName={acc.name}
              trigger={
                <Button size="sm" className="gap-1.5 hidden md:inline-flex">
                  <Send className="h-4 w-4" /> Запросити в кабінет
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Headline tags — at-a-glance */}
      {headlineTags.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground border-y border-border/60 py-2">
          {headlineTags.map((t, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-primary/60" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
