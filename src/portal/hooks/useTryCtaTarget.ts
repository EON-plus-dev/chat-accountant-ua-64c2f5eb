import { useLocation } from "react-router-dom";
import { useAudience } from "@/contexts/AudienceContext";
import { useCertifiedAudience } from "@/portal/hooks/useCertifiedAudience";
import { useUserSubscription } from "@/hooks/useUserSubscription";

export type TryCtaVariant =
  | "loading"
  | "guest_business"
  | "guest_individual"
  | "guest_pro"
  | "auth_no_cabinet"
  | "auth_certified_partner"
  | "auth_uncertified_partner"
  | "auth_start_upgrade"
  | "auth_active_cabinet";

export interface TryCtaTarget {
  variant: TryCtaVariant;
  label: string;
  /** Якщо встановлено — натискання має відкрити CertifiedTryDialog (а не navigate). */
  openCertifiedDialog?: boolean;
  /** Цільовий URL для navigate(). */
  href?: string;
  /** Чи готові всі дані (не loading). */
  ready: boolean;
}

import {
  CTA_START_BUSINESS,
  CTA_START_INDIVIDUAL,
  CTA_TRIAL_PARTNER,
  CTA_TRIAL_SMART_UPGRADE,
} from "@/portal/constants";

const ME_OVERVIEW = "/me/overview";
const ME_CERT_PARTNER = "/me/overview?openPartnerProgram=1";
const ONBOARDING = "/onboarding";

/**
 * Resolver для універсального CTA «Спробувати» в Header.
 * Поєднує AudienceContext + CertifiedAudience + UserSubscription
 * і повертає правильну ціль/лейбл за станом користувача.
 */
export function useTryCtaTarget(): TryCtaTarget {
  const { audience, businessMode } = useAudience();
  const { state: certState } = useCertifiedAudience();
  const { subscription, loading: subLoading } = useUserSubscription();
  const { pathname } = useLocation();

  const isProContext = businessMode === "pro" || pathname.startsWith("/partners");

  if (certState === "loading" || subLoading) {
    return { variant: "loading", label: "Спробувати", href: CTA_START_BUSINESS, ready: false };
  }

  // ── Гість ────────────────────────────────────────────
  if (certState === "guest") {
    if (isProContext) {
      return {
        variant: "guest_pro",
        label: "Стати FINTODO Certified",
        openCertifiedDialog: true,
        ready: true,
      };
    }
    if (audience === "individual") {
      return { variant: "guest_individual", label: "Почати безкоштовно", href: CTA_START_INDIVIDUAL, ready: true };
    }
    return { variant: "guest_business", label: "Почати безкоштовно", href: CTA_START_BUSINESS, ready: true };
  }

  // ── Залогінений ──────────────────────────────────────
  if (certState === "partner_certified") {
    return {
      variant: "auth_certified_partner",
      label: "Перейти в кабінет",
      href: ME_CERT_PARTNER,
      ready: true,
    };
  }

  if (certState === "partner_uncertified" || certState === "accountant_no_profile") {
    return {
      variant: "auth_uncertified_partner",
      label: certState === "partner_uncertified" ? "Завершити сертифікацію" : "Стати FINTODO Certified",
      openCertifiedDialog: true,
      ready: true,
    };
  }

  if (certState === "no_cabinet") {
    return { variant: "auth_no_cabinet", label: "Створити кабінет", href: ONBOARDING, ready: true };
  }

  // accountant_no_profile вже оброблено вище; тут — звичайний користувач з кабінетом
  const planId = subscription?.plan_id ?? "start";
  if (planId === "start") {
    return { variant: "auth_start_upgrade", label: "Спробувати Смарт", href: CTA_TRIAL_SMART_UPGRADE, ready: true };
  }
  return { variant: "auth_active_cabinet", label: "Перейти в кабінет", href: ME_OVERVIEW, ready: true };
}
