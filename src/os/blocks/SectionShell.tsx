// Shared section wrapper for /os marketing pages.
import { ReactNode } from "react";

export const Section = ({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = "",
  bleed = false,
  align = "left",
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  bleed?: boolean;
  align?: "left" | "center";
}) => (
  <section id={id} className={`relative ${bleed ? "" : "max-w-6xl mx-auto px-4"} py-16 md:py-24 ${className}`}>
    {(eyebrow || title || intro) && (
      <header className={`max-w-3xl mb-10 md:mb-14 ${align === "center" ? "mx-auto text-center" : ""} ${bleed ? "px-4 mx-auto" : ""}`}>
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium mb-3 flex items-center gap-2 justify-inherit">
            <span className="inline-block w-6 h-px bg-primary/40" />
            {eyebrow}
          </div>
        )}
        {title && (
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1]">{title}</h2>
        )}
        {intro && <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed">{intro}</p>}
      </header>
    )}
    {children}
  </section>
);

export const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium flex items-center gap-2">
    <span className="inline-block w-6 h-px bg-primary/40" />
    {children}
  </div>
);
