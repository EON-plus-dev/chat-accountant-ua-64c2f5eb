import { useState } from "react";
import { Info, ChevronDown, FlaskConical } from "lucide-react";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

interface Props {
  profile: FullInstitutionProfile;
}

export const ProfileMethodology = ({ profile }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-10 border-t border-border pt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left"
      >
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        <FlaskConical className="w-4 h-4" />
        <span className="font-semibold">Як ми оцінювали — детальна методологія</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {profile.editorial.fullVerdict && (
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {profile.editorial.fullVerdict}
            </div>
          )}

          <p className="text-sm text-muted-foreground">{profile.editorial.methodology.approach}</p>

          <div className="rounded-lg bg-muted p-3 text-xs font-mono text-muted-foreground whitespace-pre-line">
            Загальна оцінка:{"\n"}{profile.editorial.totalFormula}
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <p>{profile.editorial.independenceStatement}</p>
              {profile.editorial.conflictOfInterest && <p className="mt-1">{profile.editorial.conflictOfInterest}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
