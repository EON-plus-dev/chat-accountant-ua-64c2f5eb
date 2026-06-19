/**
 * Shared helpers for salon master delegation contracts & profile badges.
 * Used by MasterProfilePage and MastersSettingsSection so the settings table
 * and the public profile speak the same language.
 */
import { Star, ShieldCheck, Sparkles, Globe } from "lucide-react";
import type { MasterBadge } from "@/config/demoCabinets/salonData";
import type { SalonMasterDelegationContract } from "@/config/demoCabinets/salonMasterDelegations";
import { formatCurrency } from "@/lib/formatters";

export const BADGE_META: Record<MasterBadge, { label: string; icon: typeof Star; tone: string }> = {
  top_rated: { label: "Топ-рейтинг", icon: Star, tone: "border-warning/40 bg-warning/10 text-warning-foreground" },
  verified: { label: "Верифіковано", icon: ShieldCheck, tone: "border-success/30 bg-success/10 text-success" },
  new_talent: { label: "Новий талант", icon: Sparkles, tone: "border-primary/30 bg-primary/10 text-primary" },
  kids_friendly: { label: "Працює з дітьми", icon: Sparkles, tone: "border-muted bg-muted text-foreground" },
  eco: { label: "Eco-матеріали", icon: Sparkles, tone: "border-success/30 bg-success/10 text-success" },
  english_speaking: { label: "English-speaking", icon: Globe, tone: "border-muted bg-muted text-foreground" },
};

export function getDelegationTerms(d: SalonMasterDelegationContract | undefined): {
  kindLabel: string;
  detail: string;
} {
  if (!d) return { kindLabel: "—", detail: "Делегація відсутня" };
  if (d.contract_kind === "employment") {
    const t = d.terms as Extract<typeof d.terms, { kind: "employment" }>;
    return {
      kindLabel: "Трудовий договір",
      detail: `${t.position} · ${formatCurrency(t.salary_uah)}/міс`,
    };
  }
  if (d.terms.kind === "revenue_split") {
    const period =
      d.terms.payout_period === "weekly"
        ? "щотижня"
        : d.terms.payout_period === "monthly"
          ? "щомісяця"
          : "за візит";
    return {
      kindLabel: "Договір послуг · revenue split",
      detail: `Комісія майстру ${d.terms.commission_pct}% (виплати ${period})`,
    };
  }
  if (d.terms.kind === "workspace_rental") {
    const per =
      d.terms.rent_period === "month" ? "міс" : d.terms.rent_period === "day" ? "день" : "зміна";
    return {
      kindLabel: "Договір оренди робочого місця",
      detail: `${formatCurrency(d.terms.rent_amount)} / ${per}`,
    };
  }
  if (d.terms.kind === "hybrid") {
    return {
      kindLabel: "Гібридний договір",
      detail: `${d.terms.commission_pct}% + оренда ${formatCurrency(d.terms.rent_amount)}`,
    };
  }
  return { kindLabel: "—", detail: "" };
}

export function getShortContractKind(d: SalonMasterDelegationContract | undefined): string {
  if (!d) return "Без договору";
  if (d.contract_kind === "employment") return "Трудовий";
  if (d.terms.kind === "revenue_split") return `Послуги · ${d.terms.commission_pct}%`;
  if (d.terms.kind === "workspace_rental") return "Оренда місця";
  if (d.terms.kind === "hybrid") return `Гібрид · ${d.terms.commission_pct}%`;
  return "Договір послуг";
}
