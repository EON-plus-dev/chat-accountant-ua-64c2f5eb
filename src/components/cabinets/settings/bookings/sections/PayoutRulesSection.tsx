import { useState } from "react";
import { Wallet, Plus, Gift, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Cabinet } from "@/types/cabinet";
import { SectionShell, ComingSoonNote } from "../shared/SectionShell";
import { getSettingsSectionLabel } from "@/core";

export function PayoutRulesSection({ cabinet }: { cabinet: Cabinet }) {
  const [staffDefault, setStaffDefault] = useState(35);
  const [fopDefault, setFopDefault] = useState(50);
  const [bonusUpsell, setBonusUpsell] = useState(true);
  const [bonusRetail, setBonusRetail] = useState(true);
  const [penaltyNoShow, setPenaltyNoShow] = useState(true);
  const [period, setPeriod] = useState("weekly");

  const label = getSettingsSectionLabel(cabinet, "payout-rules", {
    title: "Правила винагород",
    description: "Глобальні правила розрахунку комісії майстрам. Використовуються вкладкою «Бронювання → Винагороди».",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-medium">Штатні майстри</h4>
              <Badge variant="outline" className="text-[10px] bg-sky-500/10 text-sky-600 border-sky-500/20 ml-auto">
                Трудовий
              </Badge>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">% від виторгу за послугу</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={staffDefault}
                  onChange={(e) => setStaffDefault(Number(e.target.value))}
                  className="h-8 w-20 text-center tabular-nums"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                За замовч. для штатних. Перевизначається у картці майстра.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-violet-600" />
              <h4 className="text-sm font-medium">ФОП-орендарі</h4>
              <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 border-violet-500/20 ml-auto">
                ЦПХ / оренда
              </Badge>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">% від виторгу за послугу</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={fopDefault}
                  onChange={(e) => setFopDefault(Number(e.target.value))}
                  className="h-8 w-20 text-center tabular-nums"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                ФОП-майстер отримує цей % за кожну виконану послугу. Решта — салону за оренду місця.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-medium">Бонуси</h4>
          </div>
          <div className="space-y-2">
            <RuleRow
              label="Бонус за upsell (продаж додаткової послуги)"
              hint="+5% до комісії, коли середній чек > середнього майстра"
              checked={bonusUpsell}
              onCheckedChange={setBonusUpsell}
            />
            <RuleRow
              label="Бонус за продаж косметики"
              hint="10% від ціни проданої косметики"
              checked={bonusRetail}
              onCheckedChange={setBonusRetail}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-medium">Утримання</h4>
          </div>
          <RuleRow
            label="Утримання за no-show клієнта"
            hint="0 ₴ комісії, якщо клієнт не прийшов (no-show > 15 хв)"
            checked={penaltyNoShow}
            onCheckedChange={setPenaltyNoShow}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Період розрахунку</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Щотижнево</SelectItem>
                <SelectItem value="biweekly">Раз на 2 тижні</SelectItem>
                <SelectItem value="monthly">Щомісячно</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">День виплати</Label>
            <Select defaultValue="friday">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Понеділок</SelectItem>
                <SelectItem value="friday">П'ятниця</SelectItem>
                <SelectItem value="last-day">Останній день періоду</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <ComingSoonNote>
        Складніші правила (ставки по категоріях, накопичувальні бонуси за лояльність)
        будуть доступні у наступному релізі.
      </ComingSoonNote>
    </SectionShell>
  );
}

function RuleRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-2.5 rounded-md border bg-background">
      <div className="min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
    </div>
  );
}
