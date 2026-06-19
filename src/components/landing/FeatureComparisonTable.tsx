import { motion } from "framer-motion";
import { Check, X, Info } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAudience } from "@/contexts/AudienceContext";
import {
  comparisonFeatures,
  individualComparisonFeatures,
  partnerComparisonFeatures,
  type ComparisonFeature,
} from "@/config/pricingData";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CheckIcon = () => (
  <Check className="w-4.5 h-4.5 text-success mx-auto" aria-label="Включено" />
);

const XIcon = () => (
  <X className="w-4 h-4 text-muted-foreground/40 mx-auto" aria-label="Не включено" />
);

const renderCell = (value: boolean | string | undefined, popular?: boolean) => {
  if (typeof value === "string") {
    return (
      <span className={`text-xs md:text-sm font-medium ${popular ? "text-primary" : "text-foreground"}`}>
        {value}
      </span>
    );
  }
  return value ? <CheckIcon /> : <XIcon />;
};

const businessCols = [
  { key: "start" as const, label: "Старт", popular: false },
  { key: "smart" as const, label: "Смарт", popular: true },
  { key: "premium" as const, label: "Преміум", popular: false },
];

const individualCols = [
  { key: "free" as const, label: "Старт", popular: false },
  { key: "start" as const, label: "Базовий", popular: false },
  { key: "smart" as const, label: "Стандарт", popular: true },
  { key: "premium" as const, label: "Професійний", popular: false },
];

const partnerCols = [
  { key: "start" as const, label: "Solo", popular: false },
  { key: "smart" as const, label: "Agency", popular: true },
  { key: "premium" as const, label: "Firm", popular: false },
];

export const FeatureComparisonTable = () => {
  const { audience, businessMode } = useAudience();
  const isPartner = audience === "business" && businessMode === "pro";

  const features: ComparisonFeature[] = isPartner
    ? partnerComparisonFeatures
    : audience === "business"
      ? comparisonFeatures
      : individualComparisonFeatures;

  const cols = isPartner
    ? partnerCols
    : audience === "business"
      ? businessCols
      : individualCols;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={fadeUp}
      className="pt-8"
    >
      <TooltipProvider delayDuration={200}>
        <Table containerClassName="border border-border/70 rounded-lg [touch-action:pan-x_pan-y] [-webkit-overflow-scrolling:touch]">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-muted min-w-[180px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                {isPartner ? "Що порівнюємо" : "Функція"}
              </TableHead>
              {cols.map((col) => (
                <TableHead
                  key={col.key}
                  className={`text-center min-w-[110px] ${
                    col.popular ? "text-primary font-semibold" : ""
                  }`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((f) => (
              <TableRow key={f.feature}>
                <TableCell className="sticky left-0 z-10 bg-background font-medium shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <span className="flex items-center gap-1.5">
                    {f.feature}
                    {f.tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px]">
                          {f.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </TableCell>
                {cols.map((col) => (
                  <TableCell key={col.key} className="text-center">
                    {renderCell(f[col.key], col.popular)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
    </motion.div>
  );
};
