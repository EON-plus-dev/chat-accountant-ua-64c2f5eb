import { motion } from "framer-motion";
import { Briefcase, User } from "lucide-react";
import { useAudience } from "@/contexts/AudienceContext";

export const AudiencePillSwitcher = ({ size = "default" }: { size?: "default" | "mobile" | "compact" | "hero" }) => {
  const { audience, setAudience } = useAudience();
  const isMobile = size === "mobile";
  const isCompact = size === "compact";
  const isHero = size === "hero";

  const tabs = [
    {
      key: "business" as const,
      label: isHero ? "Для бізнесу" : (isMobile || isCompact ? "Бізнесу" : "Для бізнесу"),
      icon: Briefcase,
    },
    {
      key: "individual" as const,
      label: isHero ? "Для фізосіб" : (isMobile || isCompact ? "Фізособам" : "Для фізосіб"),
      icon: User,
    },
  ];

  const wrapperBase = isHero
    ? "h-9 p-1 bg-muted/70 border border-border/60 shadow-sm"
    : isCompact
      ? "p-0.5 bg-muted shadow-inner"
      : "p-1 bg-muted shadow-inner";
  const indicatorInset = isHero
    ? "inset-y-1 left-1"
    : isCompact ? "inset-y-0.5 left-0.5" : "inset-y-1 left-1";
  const indicatorWidth = isHero
    ? "calc(50% - 4px)"
    : isCompact ? "calc(50% - 2px)" : "calc(50% - 4px)";
  const indicatorClass = isHero
    ? "bg-background shadow-md ring-1 ring-primary/30"
    : "bg-primary/15";
  const buttonClasses = isHero
    ? "gap-1.5 px-4 h-7 text-sm"
    : isCompact
      ? "gap-1 px-2.5 py-1 text-xs"
      : "gap-1.5 px-4 py-2 text-sm";
  const iconSize = isCompact ? "w-3.5 h-3.5" : "w-4 h-4";
  const activeText = isHero
    ? "text-foreground font-semibold"
    : "text-primary font-semibold";
  const inactiveText = isHero
    ? "text-muted-foreground hover:text-foreground"
    : "text-foreground/60 hover:text-foreground";

  return (
    <div
      role="tablist"
      aria-label="Оберіть аудиторію"
      className={`relative inline-flex rounded-full ${wrapperBase}`}
    >
      <motion.div
        className={`absolute ${indicatorInset} rounded-full ${indicatorClass}`}
        style={{ width: indicatorWidth }}
        animate={{ x: audience === "business" ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setAudience(tab.key)}
          role="tab"
          aria-selected={audience === tab.key}
          className={`relative z-10 flex items-center justify-center font-medium rounded-full transition-colors ${buttonClasses} ${
            audience === tab.key ? activeText : inactiveText
          }`}
        >
          <tab.icon className={iconSize} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};
