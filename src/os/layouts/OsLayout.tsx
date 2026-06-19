import { useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { OsHeader } from "./OsHeader";
import { OsFooter } from "./OsFooter";
import { useAudience } from "@/contexts/AudienceContext";

export const OsLayout = () => {
  const { audience, setAudience } = useAudience();
  const [params] = useSearchParams();

  // Sync audience from ?audience= для shareable links
  useEffect(() => {
    const q = params.get("audience");
    if (q === "business" || q === "individual") {
      if (q !== audience) setAudience(q);
    }
  }, [params, audience, setAudience]);

  // Adaptive accent CSS-var via data-audience (set by AudienceContext)
  // Individual = soft teal, Business = default primary (emerald)
  return (
    <div className="min-h-screen bg-background text-foreground os-shell">
      <style>{`
        html[data-audience="individual"] .os-shell {
          --os-accent: 180 60% 45%;
        }
        html[data-audience="business"] .os-shell, .os-shell {
          --os-accent: var(--primary);
        }
      `}</style>
      <OsHeader />
      <main>
        <Outlet />
      </main>
      <OsFooter />
    </div>
  );
};

export default OsLayout;
