import { useNavigate } from "react-router-dom";
import { getInstitutionBySlug } from "@/portal/data/institutionProfiles";
import { ExternalLink, ArrowRight } from "lucide-react";

interface InternalLinkCardProps {
  href: string;
  label: string;
}

export const InternalLinkCard = ({ href, label }: InternalLinkCardProps) => {
  const navigate = useNavigate();

  // Extract slug for institution profiles
  const instMatch = href.match(/\/dovidnyky\/ustanovy\/profile\/([\w-]+)/);
  const institution = instMatch ? getInstitutionBySlug(instMatch[1]) : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href.startsWith("/")) {
      navigate(href);
    } else {
      window.open(href, "_blank", "noopener");
    }
  };

  if (institution) {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 my-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left max-w-full"
      >
        <span className="shrink-0 w-7 h-7 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
          {institution.logo?.initials || institution.name.slice(0, 2)}
        </span>
        <span className="truncate text-sm font-medium text-foreground">{institution.name}</span>
        {institution.ratings?.fintodo?.overall && (
          <span className="shrink-0 text-xs text-muted-foreground">{institution.ratings.fintodo.overall}/10</span>
        )}
        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  // Generic internal or external link
  const isInternal = href.startsWith("/");
  return (
    <a
      href={href}
      onClick={isInternal ? handleClick : undefined}
      target={isInternal ? undefined : "_blank"}
      rel={isInternal ? undefined : "noopener noreferrer"}
      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
    >
      {!isInternal && <ExternalLink className="w-3 h-3 shrink-0" />}
      {label}
    </a>
  );
};
