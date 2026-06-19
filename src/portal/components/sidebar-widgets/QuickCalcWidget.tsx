import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Group = "1" | "2" | "3-no-vat" | "3-vat" | "employee";

const OPTIONS: { value: Group; label: string }[] = [
  { value: "1", label: "ФОП 1 група" },
  { value: "2", label: "ФОП 2 група" },
  { value: "3-no-vat", label: "ФОП 3 (без ПДВ)" },
  { value: "3-vat", label: "ФОП 3 (з ПДВ)" },
  { value: "employee", label: "Найманий працівник" },
];

// 2026 rates from memory
const MZP = 8647;
const PM = 3328;
const ESV_MIN = Math.round(MZP * 0.22); // 1902
const EP_G1 = 332.80;
const EP_G2 = 1729.40;
const VZ_FIXED = Math.round(MZP * 0.10 * 100) / 100; // 864.70

export const QuickCalcWidget = () => {
  const [group, setGroup] = useState<Group>("3-no-vat");
  const [income, setIncome] = useState(50000);

  const showIncome = group === "3-no-vat" || group === "3-vat" || group === "employee";

  const results = useMemo(() => {
    if (group === "1") {
      const total = EP_G1 + ESV_MIN + VZ_FIXED;
      return [
        { label: "ЄП (фікс)", value: fmt(EP_G1) },
        { label: "ЄСВ (мін)", value: fmt(ESV_MIN) },
        { label: "ВЗ (10% МЗП)", value: fmt(VZ_FIXED) },
        { label: "Разом/міс", value: fmt(total), bold: true },
      ];
    }
    if (group === "2") {
      const total = EP_G2 + ESV_MIN + VZ_FIXED;
      return [
        { label: "ЄП (фікс)", value: fmt(EP_G2) },
        { label: "ЄСВ (мін)", value: fmt(ESV_MIN) },
        { label: "ВЗ (10% МЗП)", value: fmt(VZ_FIXED) },
        { label: "Разом/міс", value: fmt(total), bold: true },
      ];
    }
    if (group === "3-no-vat") {
      const ep = Math.round(income * 0.05);
      const vz = Math.round(income * 0.05);
      const net = income - ep - ESV_MIN - vz;
      return [
        { label: "ЄП (5%)", value: fmt(ep) },
        { label: "ЄСВ (мін)", value: fmt(ESV_MIN) },
        { label: "ВЗ (5%)", value: fmt(vz) },
        { label: "На руки", value: fmt(net), bold: true },
      ];
    }
    if (group === "3-vat") {
      const ep = Math.round(income * 0.03);
      const vz = Math.round(income * 0.05);
      const net = income - ep - ESV_MIN - vz;
      return [
        { label: "ЄП (3%)", value: fmt(ep) },
        { label: "ЄСВ (мін)", value: fmt(ESV_MIN) },
        { label: "ВЗ (5%)", value: fmt(vz) },
        { label: "На руки", value: fmt(net), bold: true },
      ];
    }
    // employee
    const pdfo = Math.round(income * 0.18);
    const vz = Math.round(income * 0.05);
    const net = income - pdfo - vz;
    const esvEmployer = Math.round(income * 0.22);
    return [
      { label: "ПДФО (18%)", value: fmt(pdfo) },
      { label: "ВЗ (5%)", value: fmt(vz) },
      { label: "На руки", value: fmt(net), bold: true },
      { label: "ЄСВ роботодавця", value: fmt(esvEmployer) },
    ];
  }, [group, income]);

  const explainer = useMemo(() => {
    const mzpFmt = MZP.toLocaleString("uk-UA");
    if (group === "1") {
      return [
        `ЄП — фіксована ставка для 1 групи: до 10% прожиткового мінімуму. У 2026 це ${fmt(EP_G1)}/міс.`,
        `ЄСВ — мінімум 22% від мінімальної зарплати (${mzpFmt} ₴): ${fmt(ESV_MIN)}/міс. Платиться навіть без доходу.`,
        `ВЗ — 10% мінімальної зарплати: ${fmt(VZ_FIXED)}/міс.`,
        `Разом — сума всіх трьох податків, які треба сплатити за місяць.`,
      ];
    }
    if (group === "2") {
      return [
        `ЄП — фіксована ставка: 20% мінімальної зарплати. У 2026 це ${fmt(EP_G2)}/міс.`,
        `ЄСВ — мінімум 22% від МЗП (${mzpFmt} ₴): ${fmt(ESV_MIN)}/міс. Платиться навіть без доходу.`,
        `ВЗ — 10% мінімальної зарплати: ${fmt(VZ_FIXED)}/міс.`,
        `Разом — сума всіх трьох податків за місяць.`,
      ];
    }
    if (group === "3-no-vat") {
      return [
        `ЄП — 5% від доходу (вашого обороту), без врахування витрат.`,
        `ЄСВ — мінімум 22% від МЗП (${mzpFmt} ₴): ${fmt(ESV_MIN)}/міс. Сплачується незалежно від доходу.`,
        `ВЗ — 5% від доходу.`,
        `На руки — дохід мінус ЄП, ЄСВ і ВЗ. Те, що залишається вам після податків.`,
      ];
    }
    if (group === "3-vat") {
      return [
        `ЄП — 3% від доходу (бо ПДВ платиться окремо).`,
        `ЄСВ — мінімум 22% від МЗП (${mzpFmt} ₴): ${fmt(ESV_MIN)}/міс.`,
        `ВЗ — 5% від доходу.`,
        `На руки — дохід мінус ЄП, ЄСВ і ВЗ. ПДВ тут не враховується (це окремий розрахунок).`,
      ];
    }
    return [
      `ПДФО — 18% від нарахованої (gross) зарплати, утримує роботодавець.`,
      `ВЗ — 5% від нарахованої зарплати, теж утримує роботодавець.`,
      `На руки — gross мінус ПДФО і ВЗ. Це сума, яку ви отримуєте на картку.`,
      `ЄСВ роботодавця — 22% від gross. Не відраховується з вашої зарплати — платить роботодавець зверху.`,
    ];
  }, [group]);

  const handleChange = (val: string) => {
    const n = parseInt(val.replace(/\D/g, ""), 10);
    if (!isNaN(n)) setIncome(n);
    else if (val === "") setIncome(0);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Calculator className="h-4 w-4 text-muted-foreground" />
        Швидкий розрахунок
      </h4>

      <div className="space-y-1.5">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Тип платника</label>
        <Select value={group} onValueChange={(v) => setGroup(v as Group)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showIncome && (
        <div className="space-y-1.5">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {group === "employee" ? "Зарплата (gross), ₴" : "Дохід, ₴"}
          </label>
          <Input
            type="text"
            value={income.toLocaleString("uk-UA")}
            onChange={(e) => handleChange(e.target.value)}
            className="h-8 text-sm font-mono"
          />
        </div>
      )}

      <div className="space-y-1 text-xs">
        {results.map((r, i) => (
          <div
            key={r.label}
            className={`flex justify-between ${r.bold ? "pt-1 border-t border-border" : ""}`}
          >
            <span className={`text-muted-foreground ${r.bold ? "font-medium" : ""}`}>{r.label}</span>
            <span className={`font-mono ${r.bold ? "font-bold text-primary" : "font-semibold text-foreground"}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>

      <details className="group">
        <summary className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer select-none flex items-center gap-1 list-none">
          <span className="inline-block transition-transform group-open:rotate-90">›</span>
          Як це рахується?
        </summary>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground pl-3">
          {explainer.map((line, i) => (
            <li
              key={i}
              className="relative before:content-['•'] before:absolute before:-left-3 before:text-muted-foreground/60"
            >
              {line}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
};

function fmt(n: number): string {
  return n.toLocaleString("uk-UA", { maximumFractionDigits: 2 }) + " ₴";
}
