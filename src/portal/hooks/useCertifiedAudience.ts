import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Стан користувача стосовно курсу FINTODO Certified Accountant.
 * Один курс — різні entry points залежно від того, ким зараз є користувач.
 */
export type CertifiedAudienceState =
  | "loading"
  | "guest"                  // не залогінений
  | "no_cabinet"             // залогінений, нема жодного кабінет-членства
  | "accountant_no_profile"  // є кабінет, нема partner_profiles
  | "partner_uncertified"    // є partner_profiles, is_certified=false
  | "partner_certified";     // is_certified=true

export interface CertifiedAudience {
  state: CertifiedAudienceState;
  partnerProfile: { is_certified: boolean; accountant_slug: string | null } | null;
  primaryCabinetId: string | null;
}

const INITIAL: CertifiedAudience = {
  state: "loading",
  partnerProfile: null,
  primaryCabinetId: null,
};

export function useCertifiedAudience(): CertifiedAudience {
  const [info, setInfo] = useState<CertifiedAudience>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        if (!cancelled) setInfo({ ...INITIAL, state: "guest" });
        return;
      }

      const [profileRes, memberRes] = await Promise.all([
        supabase
          .from("partner_profiles")
          .select("is_certified, accountant_slug")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("cabinet_members")
          .select("cabinet_id, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      const profile = profileRes.data
        ? {
            is_certified: !!profileRes.data.is_certified,
            accountant_slug: profileRes.data.accountant_slug ?? null,
          }
        : null;
      const cabinetId = memberRes.data?.cabinet_id ?? null;

      let state: CertifiedAudienceState;
      if (profile?.is_certified) state = "partner_certified";
      else if (profile) state = "partner_uncertified";
      else if (cabinetId) state = "accountant_no_profile";
      else state = "no_cabinet";

      setInfo({ state, partnerProfile: profile, primaryCabinetId: cabinetId });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return info;
}

/* ── Audience-роль (вибирається у Step 1 модалки і прокидається у трек іспиту) ── */

export type AudienceRole = "solo" | "agency" | "firm" | "in_house" | "student";
export type ExamTrack = "solo" | "agency" | "firm";

const AUDIENCE_KEY = "fintodo.certified.audienceRole";

export function getStoredAudienceRole(): AudienceRole | null {
  try {
    const v = localStorage.getItem(AUDIENCE_KEY);
    if (v === "solo" || v === "agency" || v === "firm" || v === "in_house" || v === "student") return v;
    return null;
  } catch {
    return null;
  }
}

export function setStoredAudienceRole(role: AudienceRole) {
  try { localStorage.setItem(AUDIENCE_KEY, role); } catch { /* noop */ }
}

export function audienceToTrack(role: AudienceRole): ExamTrack {
  switch (role) {
    case "agency": return "agency";
    case "firm": return "firm";
    default: return "solo"; // solo / in_house / student → базовий трек
  }
}
