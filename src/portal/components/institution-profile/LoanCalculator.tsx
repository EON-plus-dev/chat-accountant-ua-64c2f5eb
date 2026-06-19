import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface LoanCalculatorProps {
  defaultRate?: number;
}

export const LoanCalculator = ({ defaultRate = 24 }: LoanCalculatorProps) => {
  const [amount, setAmount] = useState(100000);
  const [months, setMonths] = useState(12);
  const [rate, setRate] = useState(defaultRate);

  const parseNum = (val: string) => {
    const n = Number(val.replace(/[^\d.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const r = rate / 12 / 100;
  const monthly = r > 0
    ? amount * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1)
    : months > 0 ? amount / months : 0;
  const total = monthly * months;
  const overpay = total - amount;

  const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Сума, ₴</Label>
          <Input
            type="text"
            value={amount.toLocaleString("uk-UA")}
            onChange={e => setAmount(parseNum(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Термін, міс.</Label>
          <Input
            type="number"
            min={1}
            max={360}
            value={months}
            onChange={e => setMonths(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Ставка, %</Label>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={rate}
            onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
      </div>

      <div className="rounded-lg bg-muted/50 p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Щомісячний платіж</span>
          <AnimatedValue value={fmt(monthly)} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Переплата</span>
          <AnimatedValue value={fmt(overpay)} />
        </div>
        <div className="flex justify-between text-sm font-medium border-t border-border/50 pt-1">
          <span className="text-muted-foreground">Загальна сума</span>
          <AnimatedValue value={fmt(total)} />
        </div>
      </div>
    </div>
  );
};
