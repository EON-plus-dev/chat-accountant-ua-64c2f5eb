import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!show) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg bg-card/90 backdrop-blur-sm border-border/70 hover:bg-primary hover:text-primary-foreground transition-all duration-200 animate-fade-in"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="На початок"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
};
