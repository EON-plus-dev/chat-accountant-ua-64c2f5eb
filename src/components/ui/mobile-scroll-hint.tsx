import { useEffect, useState } from "react";
import { ChevronsRight } from "lucide-react";

/**
 * MobileScrollHint
 *
 * Невеликий чіп-підказка «свайпайте →», який відображається тільки на `<sm`
 * екранах і автоматично зникає через `autoHideMs` (за замовчуванням 5 с).
 * Ставиться поверх контейнера з `overflow-x-auto`.
 *
 * Використання:
 *   <div className="relative">
 *     <MobileScrollHint />
 *     <div className="overflow-x-auto"> ... </div>
 *   </div>
 */
interface Props {
  label?: string;
  autoHideMs?: number;
}

export const MobileScrollHint = ({ label = "свайпайте", autoHideMs = 5000 }: Props) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs]);

  if (!visible) return null;

  return (
    <div
      className="sm:hidden pointer-events-none absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-foreground/80 px-2 py-1 text-[10px] font-medium text-background shadow-sm backdrop-blur-sm"
      aria-hidden="true"
    >
      <ChevronsRight className="h-3 w-3 animate-pulse" />
      {label}
    </div>
  );
};

export default MobileScrollHint;

