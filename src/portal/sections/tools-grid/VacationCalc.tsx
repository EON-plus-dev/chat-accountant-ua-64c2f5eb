import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Palmtree } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/lib/utils";

const HOLIDAYS_2025 = [
  "1 січня", "7 січня", "8 березня", "20-21 квітня (Великдень)",
  "1 травня", "9 травня", "28 червня", "24 серпня", "14 жовтня", "25 грудня",
];

export const VacationCalc = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [days, setDays] = useState(24);
  const [useAvg, setUseAvg] = useState(true);
  const [avgSalary, setAvgSalary] = useState(25000);
  const [monthlySalaries, setMonthlySalaries] = useState<number[]>(Array(12).fill(25000));

  const result = useMemo(() => {
    const totalSalary = useAvg ? avgSalary * 12 : monthlySalaries.reduce((s, v) => s + v, 0);
    const avgDaily = totalSalary / (12 * 29.3);
    const gross = avgDaily * days;
    const pdfo = gross * 0.18;
    const warLevy = gross * 0.05;
    const net = gross - pdfo - warLevy;
    return {
      avgDaily: Math.round(avgDaily * 100) / 100,
      gross: Math.round(gross * 100) / 100,
      pdfo: Math.round(pdfo * 100) / 100,
      warLevy: Math.round(warLevy * 100) / 100,
      net: Math.round(net * 100) / 100,
    };
  }, [useAvg, avgSalary, monthlySalaries, days]);

  const fmt = (n: number) => n.toLocaleString("uk-UA", { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Дата початку відпустки</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd.MM.yyyy") : "Обрати дату"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={uk}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Кількість календарних днів</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={days || ""}
                onChange={(e) => setDays(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Зарплата</Label>
              <div className="flex gap-1">
                <Button variant={useAvg ? "default" : "outline"} size="sm" className="text-xs h-6" onClick={() => setUseAvg(true)}>
                  Середня
                </Button>
                <Button variant={!useAvg ? "default" : "outline"} size="sm" className="text-xs h-6" onClick={() => setUseAvg(false)}>
                  По місяцях
                </Button>
              </div>
            </div>

            {useAvg ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Середня зарплата за 12 міс, ₴</Label>
                <Input
                  type="number"
                  value={avgSalary || ""}
                  onChange={(e) => setAvgSalary(Number(e.target.value) || 0)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {monthlySalaries.map((s, i) => (
                  <div key={i} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Міс {i + 1}</Label>
                    <Input
                      type="number"
                      className="text-xs h-8"
                      value={s || ""}
                      onChange={(e) => {
                        const next = [...monthlySalaries];
                        next[i] = Number(e.target.value) || 0;
                        setMonthlySalaries(next);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-t-2 border-t-info">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Palmtree className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Результат розрахунку</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Середньоденний заробіток</span>
              <span className="font-mono font-semibold text-foreground">{fmt(result.avgDaily)} ₴</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сума відпускних (gross)</span>
              <span className="font-mono font-semibold text-foreground">{fmt(result.gross)} ₴</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">ПДФО 18%</span>
              <span className="font-mono text-destructive">−{fmt(result.pdfo)} ₴</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Військовий збір 5%</span>
              <span className="font-mono text-destructive">−{fmt(result.warLevy)} ₴</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-foreground">На руки</span>
              <span className="font-mono font-bold text-primary">{fmt(result.net)} ₴</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holidays note */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">Святкові дні 2025 (не враховуються)</h3>
          <div className="flex flex-wrap gap-1.5">
            {HOLIDAYS_2025.map((h) => (
              <span key={h} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {h}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Формула: середньоденний = сума ЗП за 12 міс ÷ (12 × 29.3). Відповідно до КЗпП України.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-xl bg-muted/50 border border-border p-6 text-center">
        <p className="font-semibold text-foreground">FINTODO автоматично розраховує відпускні</p>
        <p className="mt-1 text-sm text-muted-foreground">
          І нагадує про виплату за 3 дні до початку відпустки, як того вимагає закон.
        </p>
      </div>
    </div>
  );
};
