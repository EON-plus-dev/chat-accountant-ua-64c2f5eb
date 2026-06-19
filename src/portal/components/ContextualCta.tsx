import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { analytics } from "@/portal/services/analytics";
import { Sparkles } from "lucide-react";

interface Props {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export const ContextualCta = ({ title, body, ctaLabel, ctaHref }: Props) => (
  <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-6 sm:p-8 text-center space-y-4">
    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
      <Sparkles className="h-5 w-5 text-primary" />
    </div>
    <p className="text-lg font-bold text-foreground">{title}</p>
    <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">{body}</p>
    <Button asChild onClick={() => analytics.ctaClick('contextual_cta')}>
      <Link to={ctaHref}>{ctaLabel}</Link>
    </Button>
  </div>
);
