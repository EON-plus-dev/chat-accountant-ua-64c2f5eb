import { ReactNode } from "react";
import { Sparkles, Lock } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { SalonInfoCard } from "./SalonInfoCard";
import { ModeSwitcher } from "./ModeSwitcher";
import type { BookingMode, SalonPublicProfile } from "@/lib/publicBooking/types";

interface Props {
  cabinet: Cabinet;
  profile?: SalonPublicProfile;
  mode: BookingMode;
  onModeChange: (m: BookingMode) => void;
  isDemoFallback?: boolean;
  enabledModes: BookingMode[];
  children: ReactNode;
}

export function PublicBookingLayout({
  cabinet,
  profile,
  mode,
  onModeChange,
  isDemoFallback,
  enabledModes,
  children,
}: Props) {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-muted/30 to-background">
      <div
        className="max-w-3xl mx-auto px-3 md:px-4 pt-3 md:pt-10 pb-4 md:pb-10"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {isDemoFallback && (
          <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Демо-режим. Це публічна сторінка-приклад салону Beauty Lab.</span>
          </div>
        )}

        <SalonInfoCard cabinet={cabinet} profile={profile} />

        <div className="mt-3">
          <ModeSwitcher value={mode} onChange={onModeChange} enabled={enabledModes} />
        </div>

        <div className="mt-3 rounded-xl border bg-card shadow-sm overflow-hidden">
          {children}
        </div>

        <footer className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="w-3 h-3" />
          Безпечний запис через Fintodo · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
