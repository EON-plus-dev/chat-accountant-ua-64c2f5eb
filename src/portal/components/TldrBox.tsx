import { Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  text: string;
  linkTo?: string;
  linkLabel?: string;
}

export const TldrBox = ({ text, linkTo, linkLabel = "Читати повну статтю →" }: Props) => (
  <div className="rounded-lg border-l-4 border-primary bg-muted/50 p-3 sm:p-4">
    <div className="flex gap-3">
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="space-y-2">
        <p className="text-sm text-foreground leading-relaxed">{text}</p>
        {linkTo && (
          <Link to={linkTo} className="text-sm font-medium text-primary hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
    </div>
  </div>
);
