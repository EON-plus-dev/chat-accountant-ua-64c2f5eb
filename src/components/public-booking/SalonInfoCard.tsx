import { MapPin, Phone, Star, Clock } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import type { SalonPublicProfile } from "@/lib/publicBooking/types";
import { getSalonPublicProfile } from "@/lib/publicBooking/slugMap";

interface Props {
  cabinet: Cabinet;
  profile?: SalonPublicProfile;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function SalonInfoCard({ cabinet, profile }: Props) {
  const p = profile ?? getSalonPublicProfile(cabinet);
  const initials = p.logoInitials || initialsOf(p.brandName);
  const tagline = p.tagline || "Салон краси · перукарські, манікюр, масаж, брови";

  const isOpen = (() => {
    const h = new Date().getHours();
    return h >= 9 && h < 21;
  })();

  return (
    <div className="rounded-xl border bg-card p-3 md:p-6 shadow-sm">
      <div className="flex items-start gap-3 md:gap-4">
        <div
          className="w-10 h-10 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border flex items-center justify-center shrink-0"
          aria-hidden
        >
          <span className="text-sm md:text-2xl font-semibold text-primary">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-xl font-semibold tracking-tight truncate">
            {p.brandName}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{tagline}</p>
          <div className="mt-1.5 md:mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-foreground font-medium">
              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              4.9
              <span className="text-muted-foreground font-normal">(217)</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {isOpen ? (
                <span className="text-success">До 21:00</span>
              ) : (
                <span>З 09:00</span>
              )}
            </span>
            <a
              href="https://maps.google.com/?q=Київ,+вул.+Хрещатик,+22"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground active:text-foreground"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[160px] sm:max-w-none">Хрещатик, 22</span>
            </a>
            <a
              href="tel:+380442000000"
              className="inline-flex items-center gap-1 hover:text-foreground active:text-foreground"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+380 44 200 00 00</span>
              <span className="sm:hidden">Подзвонити</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
