/**
 * SalonHoursSection — графік роботи салону.
 * Обмежує сітку часу у модулі «Бронювання → Сьогодні/Календар».
 */

import { useState } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import { SectionShell } from "../shared/SectionShell";
import { getSettingsSectionLabel } from "@/core";

interface DayConfig {
  id: number;
  label: string;
  enabled: boolean;
  open: string;
  close: string;
}

const DEFAULT_DAYS: DayConfig[] = [
  { id: 1, label: "Понеділок", enabled: true, open: "09:00", close: "20:00" },
  { id: 2, label: "Вівторок", enabled: true, open: "09:00", close: "20:00" },
  { id: 3, label: "Середа", enabled: true, open: "09:00", close: "20:00" },
  { id: 4, label: "Четвер", enabled: true, open: "09:00", close: "20:00" },
  { id: 5, label: "П'ятниця", enabled: true, open: "09:00", close: "21:00" },
  { id: 6, label: "Субота", enabled: true, open: "10:00", close: "20:00" },
  { id: 0, label: "Неділя", enabled: false, open: "10:00", close: "18:00" },
];

export function SalonHoursSection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const [days, setDays] = useState<DayConfig[]>(DEFAULT_DAYS);
  const [holidaysShifted, setHolidaysShifted] = useState(true);

  const patch = (id: number, p: Partial<DayConfig>) => {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...p } : d)));
    toast({ title: "Збережено локально", description: "Демо-режим: зміни не зберігаються на сервер." });
  };

  const label = getSettingsSectionLabel(cabinet, "hours", {
    title: "Розклад роботи салону",
    description: "Глобальні години роботи. Обмежують сітку часу у «Сьогодні/Календар», публічний онлайн-запис і допустимі години змін майстрів.",
  });
  return (
    <SectionShell
      title={label.title}
      description={label.description}
    >
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {days.map((d) => (
              <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Switch
                    checked={d.enabled}
                    onCheckedChange={(v) => patch(d.id, { enabled: v })}
                    aria-label={`Працює в ${d.label}`}
                  />
                  <span className={d.enabled ? "text-sm font-medium" : "text-sm text-muted-foreground line-through"}>
                    {d.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Input
                    type="time"
                    value={d.open}
                    onChange={(e) => patch(d.id, { open: e.target.value })}
                    disabled={!d.enabled}
                    className="h-8 w-24 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">—</span>
                  <Input
                    type="time"
                    value={d.close}
                    onChange={(e) => patch(d.id, { close: e.target.value })}
                    disabled={!d.enabled}
                    className="h-8 w-24 text-sm"
                  />
                  {d.enabled && (
                    <Badge variant="secondary" className="text-[10px] ml-2 hidden md:inline-flex">
                      {calcHours(d.open, d.close)} год
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Label className="text-sm">Автоматичні переноси державних свят</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Святкові й перенесені дні підтягуються з державного календаря України.
                Можна перевизначити вручну.
              </p>
            </div>
            <Switch checked={holidaysShifted} onCheckedChange={setHolidaysShifted} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-[11px] text-muted-foreground p-2.5 rounded-md bg-muted/30 border">
        <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          Загальні години = {days.filter((d) => d.enabled).length} робочих днів на тиждень,
          максимум {Math.max(...days.filter((d) => d.enabled).map((d) => calcHours(d.open, d.close)))} год/день.
        </span>
      </div>
    </SectionShell>
  );
}

function calcHours(open: string, close: string): number {
  const [oH, oM] = open.split(":").map(Number);
  const [cH, cM] = close.split(":").map(Number);
  return Math.max(0, Math.round(((cH * 60 + cM) - (oH * 60 + oM)) / 60));
}
