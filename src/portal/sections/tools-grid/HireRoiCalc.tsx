import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Building2, Lightbulb } from "lucide-react";

export const HireRoiCalc = () => {
  // Employee
  const [grossSalary, setGrossSalary] = useState(25000);
  const [equipmentMonth, setEquipmentMonth] = useState(2000);
  const [trainingYear, setTrainingYear] = useState(5000);
  const [sickPercent, setSickPercent] = useState(3);

  // FOP contractor
  const [fopRate, setFopRate] = useState(400);
  const [fopHours, setFopHours] = useState(160);

  // Outsource
  const [outsourceMonth, setOutsourceMonth] = useState(35000);

  const employee = useMemo(() => {
    const esv = grossSalary * 0.22;
    const vacation = grossSalary * 0.08; // 24 days / 300 ~ 8%
    const sick = grossSalary * (sickPercent / 100);
    const monthly = grossSalary + esv + vacation + sick + equipmentMonth + trainingYear / 12;
    return {
      grossSalary,
      esv: Math.round(esv),
      vacation: Math.round(vacation),
      sick: Math.round(sick),
      equipment: equipmentMonth,
      training: Math.round(trainingYear / 12),
      monthly: Math.round(monthly),
      yearly: Math.round(monthly * 12),
      multiplier: (monthly / grossSalary).toFixed(2),
    };
  }, [grossSalary, equipmentMonth, trainingYear, sickPercent]);

  const fop = useMemo(() => {
    const monthly = fopRate * fopHours;
    return {
      monthly: Math.round(monthly),
      yearly: Math.round(monthly * 12),
      multiplier: "×1.0",
    };
  }, [fopRate, fopHours]);

  const outsource = useMemo(() => ({
    monthly: outsourceMonth,
    yearly: outsourceMonth * 12,
    multiplier: "×1.0",
  }), [outsourceMonth]);

  const cheapest = Math.min(employee.monthly, fop.monthly, outsource.monthly);

  const recommendation = useMemo(() => {
    if (fop.monthly <= employee.monthly && fop.monthly <= outsource.monthly) {
      return { text: "ФОП-виконавець — найвигідніший варіант за вашими параметрами", icon: Briefcase };
    }
    if (outsource.monthly <= employee.monthly) {
      return { text: "Аутсорс компанія — оптимальний варіант", icon: Building2 };
    }
    return { text: "Найманий працівник — вигідніший при повному завантаженні", icon: Users };
  }, [employee.monthly, fop.monthly, outsource.monthly]);

  const ResultCol = ({
    title,
    icon: Icon,
    data,
    isCheapest,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    data: { monthly: number; yearly: number; multiplier: string };
    isCheapest: boolean;
    children: React.ReactNode;
  }) => (
    <Card className={isCheapest ? "border-primary border-2" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="h-4 w-4" /> {title}
          </CardTitle>
          {isCheapest && <Badge variant="default" className="text-[10px]">Вигідніше</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
        <hr className="border-border" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">На місяць</span>
            <span className="font-mono font-bold text-foreground">{data.monthly.toLocaleString("uk-UA")} ₴</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">На рік</span>
            <span className="font-mono text-foreground">{data.yearly.toLocaleString("uk-UA")} ₴</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Коефіцієнт</span>
            <span className="font-mono text-muted-foreground">{data.multiplier}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Employee */}
        <ResultCol
          title="Найманий"
          icon={Users}
          data={{ monthly: employee.monthly, yearly: employee.yearly, multiplier: `×${employee.multiplier}` }}
          isCheapest={employee.monthly === cheapest}
        >
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Зарплата gross, ₴</Label>
              <Input type="number" value={grossSalary || ""} onChange={(e) => setGrossSalary(Number(e.target.value) || 0)} className="h-8 text-sm" />
            </div>
            <div className="text-xs space-y-0.5 text-muted-foreground">
              <div className="flex justify-between"><span>ЄСВ 22%</span><span className="font-mono">{employee.esv.toLocaleString("uk-UA")} ₴</span></div>
              <div className="flex justify-between"><span>Відпустка ~8%</span><span className="font-mono">{employee.vacation.toLocaleString("uk-UA")} ₴</span></div>
              <div className="flex justify-between"><span>Лікарняні ~{sickPercent}%</span><span className="font-mono">{employee.sick.toLocaleString("uk-UA")} ₴</span></div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Обладнання / міс, ₴</Label>
              <Input type="number" value={equipmentMonth || ""} onChange={(e) => setEquipmentMonth(Number(e.target.value) || 0)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Навчання / рік, ₴</Label>
              <Input type="number" value={trainingYear || ""} onChange={(e) => setTrainingYear(Number(e.target.value) || 0)} className="h-8 text-sm" />
            </div>
          </div>
        </ResultCol>

        {/* FOP */}
        <ResultCol
          title="ФОП-виконавець"
          icon={Briefcase}
          data={fop}
          isCheapest={fop.monthly === cheapest}
        >
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Ставка, ₴/год</Label>
              <Input type="number" value={fopRate || ""} onChange={(e) => setFopRate(Number(e.target.value) || 0)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Годин / місяць</Label>
              <Input type="number" value={fopHours || ""} onChange={(e) => setFopHours(Number(e.target.value) || 0)} className="h-8 text-sm" />
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>✓ Без ЄСВ роботодавця</p>
              <p>✓ Без відпусток і лікарняних</p>
              <p>✗ Менший контроль</p>
              <p>✗ Ризик визнання трудовими відносинами</p>
            </div>
          </div>
        </ResultCol>

        {/* Outsource */}
        <ResultCol
          title="Аутсорс компанія"
          icon={Building2}
          data={outsource}
          isCheapest={outsource.monthly === cheapest}
        >
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Місячна вартість, ₴</Label>
              <Input type="number" value={outsourceMonth || ""} onChange={(e) => setOutsourceMonth(Number(e.target.value) || 0)} className="h-8 text-sm" />
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>✓ Все включено (податки, заміна)</p>
              <p>✓ Не треба оформлювати</p>
              <p>✗ Найдорожчий варіант</p>
              <p>✗ Менше залучення</p>
            </div>
          </div>
        </ResultCol>
      </div>

      {/* Recommendation */}
      <Card className="border-t-2 border-t-primary">
        <CardContent className="pt-6 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">{recommendation.text}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Прихована вартість найманого працівника = ×{employee.multiplier} від gross зарплати.
              Враховуйте ЄСВ, відпустку, лікарняні, обладнання та навчання.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl bg-muted/50 border border-border p-6 text-center">
        <p className="font-semibold text-foreground">Для найнятих — FINTODO розраховує зарплату автоматично</p>
        <p className="mt-1 text-sm text-muted-foreground">
          ЄСВ, ПДФО, відпускні, лікарняні та звітність Д4 — все в одному місці.
        </p>
      </div>
    </div>
  );
};
