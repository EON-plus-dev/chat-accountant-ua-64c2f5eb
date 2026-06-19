/**
 * Універсальний реєстраційний pitch для клієнтів ФОП.
 * 5 точок-дотиків (post-booking, receipt-banner, returning-client, multi-fop, tax-season).
 * 5 верстальних варіантів. Cooldown через localStorage.
 *
 * Див. .lovable/plan.md (v3) і mem://marketing/client-registration-funnel-uk.
 */

import { useEffect, useMemo, useState } from "react";
import { Sparkles, X, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  isEligibleToShow,
  markShown,
  markDismissed,
  markCompleted,
} from "@/lib/clientRegistrationPitch/eligibility";
import { logShown, logClicked, logCompleted, logDismissed } from "@/lib/clientRegistrationPitch/funnel";
import { resolveBenefit, getBenefitCopy } from "@/lib/clientRegistrationPitch/benefit";
import type { PitchSource, PitchVariant, PitchCtaMode } from "@/lib/clientRegistrationPitch/types";

export interface RegisterCabinetPitchProps {
  clientId: string;
  fopCabinetId: string;
  fopIndustry?: string;
  brandName?: string;
  source: PitchSource;
  variant?: PitchVariant;
  ctaMode?: PitchCtaMode;
  alreadyLinked?: boolean;
  hasMultiFop?: boolean;
  className?: string;
  onLinked?: () => void;
  onRequestEmailLink?: () => void;
}

export function RegisterCabinetPitch({
  clientId,
  fopCabinetId,
  fopIndustry,
  brandName,
  source,
  variant = "card",
  ctaMode = "diia-oneclick",
  alreadyLinked = false,
  hasMultiFop = false,
  className,
  onLinked,
  onRequestEmailLink,
}: RegisterCabinetPitchProps) {
  const { toast } = useToast();
  const benefit = useMemo(() => resolveBenefit(fopIndustry, source, hasMultiFop), [fopIndustry, source, hasMultiFop]);
  const copy = useMemo(() => getBenefitCopy(benefit, brandName), [benefit, brandName]);

  const [visible, setVisible] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!isEligibleToShow(clientId, source, alreadyLinked)) return;
    setVisible(true);
    markShown(clientId, source);
    setEventId(logShown({ clientId, fopCabinetId, source, variant, benefit }));
  }, [clientId, fopCabinetId, source, variant, benefit, alreadyLinked]);

  if (!visible) return null;

  const handlePrimary = () => {
    if (eventId) logClicked(eventId);
    toast({
      title: "Підключення через Дію (демо)",
      description:
        "У бойовій версії тут відкриється Дія.Підпис, після чого ваш кабінет створиться автоматично.",
    });
    if (eventId) logCompleted(eventId);
    markCompleted(clientId, source);
    setVisible(false);
    onLinked?.();
  };

  const handleEmailLink = () => {
    if (eventId) logClicked(eventId);
    if (onRequestEmailLink) {
      onRequestEmailLink();
    } else {
      toast({
        title: "Email-посилання надіслано (демо)",
        description:
          "У бойовій версії ми надішлемо на ваш email безпечне посилання — перейдіть і завершіть створення кабінету за 1 клік.",
      });
    }
    if (eventId) logCompleted(eventId);
    markCompleted(clientId, source);
    setVisible(false);
    onLinked?.();
  };

  const handleDismiss = () => {
    if (eventId) logDismissed(eventId, "user_dismissed");
    markDismissed(clientId, source);
    setVisible(false);
  };

  // Спільна шапка-зміст
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{copy.badge}</span>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Сховати пропозицію"
          className="text-muted-foreground hover:text-foreground transition-colors -mt-0.5 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <h3 className="text-base md:text-lg font-semibold leading-snug break-words">{copy.headline}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed break-words">{copy.subhead}</p>
      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={handlePrimary} className="w-full h-11 md:h-10 gap-1.5 justify-center">
          <span className="truncate">{copy.primaryCta}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Button>
        {copy.primaryHint && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Shield className="w-3 h-3 shrink-0" />
            <span>{copy.primaryHint}</span>
          </div>
        )}
        <button
          type="button"
          onClick={handleEmailLink}
          className="text-sm text-primary hover:underline underline-offset-4 font-medium mx-auto mt-1"
        >
          {copy.secondaryCta}
        </button>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-2 border-t border-border/50 mt-1">
        <Shield className="w-3 h-3 shrink-0" />
        <span>Кабінет — ваш. Заклад не бачить ваших інших чеків чи фінансів.</span>
      </div>
    </>
  );


  if (variant === "banner") {
    return (
      <div
        className={cn(
          "rounded-lg border border-primary/30 bg-primary/5 p-3 md:p-4 space-y-2",
          className,
        )}
      >
        {inner}
      </div>
    );
  }

  if (variant === "inline-step") {
    return (
      <div className={cn("rounded-md border bg-card p-3 space-y-2", className)}>{inner}</div>
    );
  }

  // default: card
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br from-primary/5 via-card to-card p-4 md:p-5 space-y-2.5 shadow-sm mx-auto max-w-md text-left",
        className,
      )}
    >
      {inner}
    </div>
  );
}

export default RegisterCabinetPitch;
