import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalculatorProductHint } from "@/portal/components/CalculatorProductHint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCalculator } from "@/portal/hooks/useCalculator";

const TITLES: Record<string, string> = {
  esv: "🧮 Калькулятор ЄСВ",
  tax: "💰 Єдиний податок",
  salary: "💼 Зарплата",
};

const CARD_ACCENT: Record<string, string> = {
  esv: "border-t-2 border-t-info",
  tax: "border-t-2 border-t-warning",
  salary: "border-t-2 border-t-success",
};

const GROUP_OPTIONS: Record<string, { value: string; label: string }[]> = {
  esv: [
    { value: "1", label: "ФОП 1 група" },
    { value: "2", label: "ФОП 2 група" },
    { value: "3", label: "ФОП 3 група" },
    { value: "employee", label: "Найманий працівник" },
  ],
  tax: [
    { value: "1", label: "ФОП 1 група" },
    { value: "2", label: "ФОП 2 група" },
    { value: "3-no-vat", label: "ФОП 3 група (без ПДВ)" },
    { value: "3-vat", label: "ФОП 3 група (з ПДВ)" },
  ],
};

interface Props {
  type: "esv" | "tax" | "salary";
}

const AnimatedValue = ({ value }: { value: string }) => {
  const [animate, setAnimate] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setAnimate(true);
      prevRef.current = value;
      const t = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span className={`font-semibold text-foreground tabular-nums transition-transform duration-200 ${animate ? "scale-110 text-primary" : ""} inline-block`}>
      {value}
    </span>
  );
};

export const InlineCalculator = ({ type }: Props) => {
  const calc = useCalculator(type);

  return (
    <Card className={`${CARD_ACCENT[type]} flex flex-col h-full`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{TITLES[type]}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="space-y-3">
        {type !== "salary" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Група</Label>
            <Select value={calc.group} onValueChange={calc.setGroup}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GROUP_OPTIONS[type]?.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {(type === "salary" || type === "esv" && calc.group === "employee" || (calc as any).showIncome) && (
          <div className="space-y-1.5">
            <Label className="text-xs">{type === "salary" ? "Зарплата (gross)" : "Дохід, ₴"}</Label>
            <Input
              type="text"
              value={calc.income.toLocaleString("uk-UA")}
              onChange={(e) => calc.handleIncomeChange(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1 rounded-lg bg-muted/50 p-3">
          {calc.results.map((r) => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <AnimatedValue value={r.value} />
            </div>
          ))}
        </div>
        </div>
        <div className="mt-auto pt-3 border-t border-border">
          <CalculatorProductHint type={type} />
        </div>
      </CardContent>
    </Card>
  );
};
