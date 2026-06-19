import { TOOLS } from "@/portal/data/tools";

const STATS = [
  { value: String(TOOLS.length) + "+", label: "інструментів" },
  { value: "2025-2026", label: "актуальні ставки" },
  { value: "24/7", label: "AI-консультант" },
  { value: "₴0", label: "безкоштовний старт" },
];

export const SocialProofBar = () => (
  <div className="bg-muted/30 border-y border-border/40">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
        {STATS.map((s) => (
          <div key={s.label} className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-foreground">{s.value}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
