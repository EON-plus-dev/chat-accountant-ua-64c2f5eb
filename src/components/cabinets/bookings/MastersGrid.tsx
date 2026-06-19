/**
 * MastersGrid — картки майстрів з утилізацією тижня та середнім чеком.
 * Розрізнює штатних (трудовий договір) та ФОП-партнерів (Contractor.role="master").
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Briefcase, Users as UsersIcon, Pencil, Check, X, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { StaffMember as SalonMaster, Booking as SalonBooking, BookableService as SalonService, BookableResource as SalonWorkstation } from "@/core";
import { salonWorkstations } from "@/config/demoCabinets/salonData";
import { MapPin } from "lucide-react";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";

interface Props {
  masters: SalonMaster[];
  bookings: SalonBooking[];
  services: SalonService[];
  workstations?: SalonWorkstation[];
}


const CAT_LABEL: Record<string, string> = {
  hair: "перукарські",
  nails: "манікюр/педикюр",
  massage: "масаж",
  spa: "SPA",
  brows: "брови",
};

export function MastersGrid({ masters, bookings, services, workstations = salonWorkstations }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const last7Start = new Date();
  last7Start.setDate(last7Start.getDate() - 7);
  const last7Iso = last7Start.toISOString().split("T")[0];

  const drill = useDrillStack();

  // local override of commission % (demo)
  const [commissionOverrides, setCommissionOverrides] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPct, setDraftPct] = useState<string>("");

  const getPct = (m: SalonMaster) => commissionOverrides[m.id] ?? m.commissionPct;

  const openProfile = (m: SalonMaster) =>
    drill.push({ kind: "salon-master", id: m.id, displayName: m.fullName });

  return (
    <div className="space-y-3">
      {/* Help block: staff vs FOP-partner */}
      <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-xs leading-relaxed">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Info className="w-3.5 h-3.5 text-primary" />
          Як налаштовуються ролі майстрів
        </div>
        <div className="grid md:grid-cols-2 gap-2 text-muted-foreground">
          <div className="rounded border bg-background p-2.5">
            <div className="flex items-center gap-1.5 text-foreground font-medium mb-1">
              <UsersIcon className="w-3 h-3" /> Штатні майстри
            </div>
            Трудовий договір, оклад через <b>HR / Payroll</b>. Винагорода % від чека —
            як <i>премія до ЗП</i> (з утриманням ПДФО 18% + ВЗ 5% + ЄСВ 22% коштом салону).
          </div>
          <div className="rounded border bg-background p-2.5">
            <div className="flex items-center gap-1.5 text-foreground font-medium mb-1">
              <Briefcase className="w-3 h-3" /> ФОП-партнери
            </div>
            Заведені в <b>Контрагенти</b> з роллю <Badge variant="outline" size="sm" className="text-[10px] mx-0.5">Майстер-партнер</Badge>.
            Винагорода виплачується як платіж контрагенту за актом, без ЄСВ/ПДФО з боку салону —
            кожен ФОП звітує сам (3 гр. ЄП).
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {masters.map((m) => {
          const mBookings = bookings.filter((b) => b.masterId === m.id);
          const last7 = mBookings.filter((b) => b.date >= last7Iso && b.date <= today && b.status === "done");
          const revenue7 = last7.reduce((s, b) => s + b.totalPrice, 0);
          const commission7 = last7.reduce((s, b) => s + b.commissionAmount, 0);
          const avg = last7.length > 0 ? Math.round(revenue7 / last7.length) : 0;
          const upcoming = mBookings.filter((b) => b.date >= today && (b.status === "scheduled" || b.status === "confirmed")).length;

          const availableMinPerWeek = m.schedule.workDays.length * (m.schedule.endHour - m.schedule.startHour) * 60;
          const minutesBooked = last7.reduce((s, b) => s + b.durationMin, 0);
          const utilization = availableMinPerWeek > 0 ? Math.round((minutesBooked / availableMinPerWeek) * 100) : 0;

          const isStaff = m.type === "staff";
          const pct = getPct(m);

          return (
            <Card key={m.id} className="group transition-shadow hover:shadow-md">
              <CardContent className="p-3 md:p-4 space-y-3">
                <header className="flex items-start gap-3">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-none cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    style={{ backgroundColor: m.color }}
                    onClick={() => openProfile(m)}
                    aria-label={`Профіль майстра ${m.fullName}`}
                  >
                    {m.avatarInitials}
                  </button>
                  <button
                    type="button"
                    onClick={() => openProfile(m)}
                    className="flex-1 min-w-0 text-left group/name"
                  >
                    <div className="text-sm font-semibold truncate group-hover/name:text-primary transition-colors">
                      {m.fullName}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {m.specialties.map((s) => CAT_LABEL[s]).join(", ")}
                    </div>
                  </button>
                  {isStaff ? (
                    <Badge variant="outline" size="sm" className="text-[10px] flex-none gap-1">
                      <UsersIcon className="w-2.5 h-2.5" /> Штатний
                    </Badge>
                  ) : (
                    <Badge variant="secondary" size="sm" className="text-[10px] flex-none gap-1">
                      <Briefcase className="w-2.5 h-2.5" /> ФОП-партнер
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 flex-none opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openProfile(m)}
                    title="Відкрити профіль"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </header>


                {m.preferredWorkstationIds && m.preferredWorkstationIds.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground -mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>Постійне місце:</span>
                    <span className="text-foreground font-medium">
                      {m.preferredWorkstationIds
                        .map((wid) => workstations.find((w) => w.id === wid)?.name)
                        .filter(Boolean)
                        .join(" / ")}
                    </span>
                  </div>
                )}



                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="Записів 7д" value={last7.length.toString()} />
                  <Stat label="Виторг 7д" value={formatCurrency(revenue7)} />
                  <Stat label="Сер. чек" value={formatCurrency(avg)} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Завантаженість тижня</span>
                    <span className="tabular-nums font-medium">{utilization}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, utilization)}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t">
                  <div className="flex items-center gap-1 min-w-0">
                    <span>Винагорода</span>
                    {editingId === m.id ? (
                      <>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={draftPct}
                          onChange={(e) => setDraftPct(e.target.value)}
                          className="h-6 w-14 text-[11px] px-1.5"
                        />
                        <span>%</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            const n = Math.max(0, Math.min(100, Number(draftPct)));
                            if (!Number.isNaN(n)) setCommissionOverrides((x) => ({ ...x, [m.id]: n }));
                            setEditingId(null);
                          }}
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-foreground font-medium tabular-nums">{pct}%</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            setDraftPct(String(pct));
                            setEditingId(m.id);
                          }}
                          title="Змінити % винагороди"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <span className="truncate">= <span className="text-foreground font-medium tabular-nums">{formatCurrency(commission7)}</span> за 7д</span>
                      </>
                    )}
                  </div>
                  <span className="flex-none">Майбутні: <span className="text-foreground font-medium">{upcoming}</span></span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-md py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
