/**
 * DiaryPage — «Щоденник» у власному `individual` кабінеті майстра.
 *
 * Агрегує всі активні делегації (employment + services) і показує:
 *   - Сьогодні: список записів на сьогодні
 *   - Графік: майбутні записи (наступні 30)
 *   - Заробіток: за останні 30 днів з розбивкою за салонами/контрактами
 *   - Оренда: інвойси за оренду робочого місця (для ФОП з workspace_rental/hybrid)
 *
 * Read-only. Майстер не редагує бронювання тут — це робить салон-власник
 * (з кабінету `demo-salon-3`). Зміни синхронізуються через `bookingsStore`.
 */

import { useMemo, useState } from "react";
import { Calendar, Wallet, Receipt, Clock, FileSignature, Eye, ShieldCheck, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { formatCurrency } from "@/lib/formatters";
import type { Cabinet } from "@/types/cabinet";
import { buildContractCopy } from "@/lib/salonMasterContractCopy";
import type { SalonMasterDelegationContract } from "@/config/demoCabinets/salonMasterDelegations";
import { salonMasters } from "@/config/demoCabinets/salonData";
import { useDrillStack } from "@/components/shared/drill-stack/DrillStackProvider";
import {
  useMasterDiary,
  getServiceNames,
  getClientName,
  getWorkstationName,
  type DiaryBooking,
} from "./useMasterDiary";

interface DiaryPageProps {
  cabinet: Cabinet;
}

const STATUS_LABEL: Record<DiaryBooking["status"], string> = {
  scheduled: "Заплановано",
  confirmed: "Підтверджено",
  done: "Виконано",
  canceled: "Скасовано",
  "no-show": "Не з'явився",
};

const STATUS_VARIANT: Record<DiaryBooking["status"], "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "secondary",
  confirmed: "default",
  done: "outline",
  canceled: "destructive",
  "no-show": "destructive",
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

function BookingRow({ b }: { b: DiaryBooking }) {
  const contractLabel =
    b.contract.terms.kind === "employment"
      ? "Зарплата"
      : b.contract.terms.kind === "revenue_split"
        ? `Комісія ${(b.contract.terms as { commission_pct: number }).commission_pct}%`
        : b.contract.terms.kind === "workspace_rental"
          ? "Оренда місця"
          : "Гібрид";

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {b.startTime} · {getServiceNames(b.serviceIds)}
          </span>
          <Badge variant={STATUS_VARIANT[b.status]} className="text-[10px]">
            {STATUS_LABEL[b.status]}
          </Badge>
          {b.origin === "master_direct" && (
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
              Прямий клієнт
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1 truncate">
          {getClientName(b.clientId)} · {getWorkstationName(b.workstationId)} · {b.salonName}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold">{formatCurrency(b.masterEarning)}</div>
        <div className="text-[10px] text-muted-foreground">{contractLabel}</div>
      </div>
    </div>
  );
}

export function DiaryPage({ cabinet }: DiaryPageProps) {
  const data = useMasterDiary(cabinet.id);
  const [contractPreviewId, setContractPreviewId] = useState<string | null>(null);
  const previewContract =
    (data.delegations.find((d) => d.id === contractPreviewId) ?? null) as
      | SalonMasterDelegationContract
      | null;

  const drill = useDrillStack();
  const linkedMaster = useMemo(
    () =>
      salonMasters.find(
        (m) => m.masterCabinetId === cabinet.id || m.fopCabinetId === cabinet.id,
      ),
    [cabinet.id],
  );

  const earningsTrend = useMemo(() => {
    if (data.earningsPrev30 === 0) return null;
    const delta = ((data.earnings30 - data.earningsPrev30) / data.earningsPrev30) * 100;
    return Math.round(delta);
  }, [data.earnings30, data.earningsPrev30]);

  if (data.delegations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          У вас поки немає активних делегацій від салонів. Коли салон надішле запрошення
          на трудовий договір або договір послуг — ваш Щоденник почне наповнюватися.
        </CardContent>
      </Card>
    );
  }

  // Згрупувати майбутні за датою
  const upcomingByDate = data.upcomingBookings.reduce<Record<string, DiaryBooking[]>>(
    (acc, b) => {
      (acc[b.date] ||= []).push(b);
      return acc;
    },
    {},
  );

  // Контекстне пояснення режиму роботи — складається з активних контрактів.
  const contextLabels = Array.from(
    new Set(
      data.delegations.map((d) => {
        switch (d.terms.kind) {
          case "employment":
            return "Трудовий договір із салоном — зарплата фіксована, записи призначає салон.";
          case "revenue_split":
            return `Договір послуг із салоном — виплата ${
              (d.terms as { commission_pct: number }).commission_pct
            }% від чека.`;
          case "workspace_rental":
            return "Оренда робочого місця — клієнтські записи ваші, оренда сплачується салону.";
          case "hybrid":
            return "Гібрид — комісія від чека + оренда робочого місця.";
        }
      }),
    ),
  );

  return (
    <div className="space-y-5">
      {linkedMaster && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs text-muted-foreground">
            Кабінет звʼязано з профілем майстра:{" "}
            <span className="text-foreground font-medium">{linkedMaster.fullName}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5"
            onClick={() =>
              drill.push({
                kind: "salon-master",
                id: linkedMaster.id,
                displayName: linkedMaster.fullName,
              })
            }
          >
            <User className="w-3.5 h-3.5" />
            Мій профіль
          </Button>
        </div>
      )}
      {contextLabels.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-4 pb-4 space-y-1">
            {contextLabels.map((l) => (
              <div key={l} className="text-xs text-muted-foreground flex gap-2">
                <ShieldCheck className="h-3.5 w-3.5 mt-[1px] shrink-0 text-primary/70" />
                <span>{l}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <UniversalKPICard
          density="compact"
          icon={Clock}
          title="Сьогодні"
          value={`${data.todayBookings.length} зап.`}
        />
        <UniversalKPICard
          density="compact"
          icon={Calendar}
          title="Найближчі"
          value={`${data.upcomingBookings.length} зап.`}
        />
        <UniversalKPICard
          density="compact"
          icon={Wallet}
          title="Заробіток (30д)"
          value={formatCurrency(data.earnings30)}
          trend={
            earningsTrend != null
              ? { value: earningsTrend, direction: earningsTrend >= 0 ? "up" : "down" }
              : undefined
          }
        />
        <UniversalKPICard
          density="compact"
          icon={Receipt}
          title="Оренда до сплати"
          value={formatCurrency(data.rentDue.reduce((s, r) => s + r.amount, 0))}
        />
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Сьогодні</TabsTrigger>
          <TabsTrigger value="upcoming">Графік</TabsTrigger>
          <TabsTrigger value="earnings">Заробіток</TabsTrigger>
          <TabsTrigger value="rent">Оренда</TabsTrigger>
          <TabsTrigger value="contracts">Контракти</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardContent className="pt-4">
              {data.todayBookings.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-6">
                  На сьогодні записів немає.
                </div>
              ) : (
                data.todayBookings.map((b) => <BookingRow key={b.id} b={b} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          {Object.keys(upcomingByDate).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground text-center">
                Майбутніх записів немає.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {Object.entries(upcomingByDate).map(([date, items]) => (
                <Card key={date}>
                  <CardContent className="pt-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      {formatDate(date)} · {items.length} зап.
                    </div>
                    {items.map((b) => (
                      <BookingRow key={b.id} b={b} />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardContent className="pt-4 space-y-1">
              <div className="text-sm text-muted-foreground mb-3">
                {data.last30DoneBookings.length} виконаних записів за 30 днів
              </div>
              {data.last30DoneBookings.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Поки немає завершених записів за цей період.
                </div>
              ) : (
                data.last30DoneBookings.map((b) => <BookingRow key={b.id} b={b} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rent">
          {data.rentDue.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground text-center">
                Оренда не нараховується — ви на трудовому договорі або відсотку від чека.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {data.rentDue.map((r) => (
                  <Card key={r.contractId}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Поточна оренда робочого місця</div>
                        <div className="text-xs text-muted-foreground">
                          {r.salonName} · період: {r.period === "month" ? "місяць" : r.period === "day" ? "день" : "зміна"} · до {formatDate(r.dueDate)}
                        </div>
                      </div>
                      <div className="text-lg font-bold">{formatCurrency(r.amount)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-1">
                  Інвойси за оренду
                </div>
                <Card>
                  <CardContent className="pt-4">
                    {data.rentInvoices.map((inv) => {
                      const variant: "default" | "secondary" | "outline" | "destructive" =
                        inv.status === "paid"
                          ? "outline"
                          : inv.status === "due"
                            ? "default"
                            : inv.status === "overdue"
                              ? "destructive"
                              : "secondary";
                      const label =
                        inv.status === "paid"
                          ? "Сплачено"
                          : inv.status === "due"
                            ? "До сплати"
                            : inv.status === "overdue"
                              ? "Прострочено"
                              : "Майбутній";
                      return (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between gap-3 py-2.5 border-b last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium capitalize">{inv.periodLabel}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {inv.salonName} · видано {formatDate(inv.issuedDate)} · до {formatDate(inv.dueDate)}
                            </div>
                          </div>
                          <div className="text-sm font-semibold shrink-0">
                            {formatCurrency(inv.amount)}
                          </div>
                          <Badge variant={variant} className="text-[10px] shrink-0">
                            {label}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contracts">
          <div className="space-y-3">
            {data.delegations.map((d) => {
              const kindLabel =
                d.contract_kind === "employment" ? "Трудовий договір" : "Договір послуг (ФОП)";
              const termsLabel =
                d.terms.kind === "employment"
                  ? `${d.terms.position} · ${formatCurrency(d.terms.salary_uah)}/міс`
                  : d.terms.kind === "revenue_split"
                    ? `Комісія ${d.terms.commission_pct}% · виплати ${d.terms.payout_period === "weekly" ? "щотижня" : d.terms.payout_period === "monthly" ? "щомісяця" : "після візиту"}`
                    : d.terms.kind === "workspace_rental"
                      ? `Оренда ${formatCurrency(d.terms.rent_amount)}/${d.terms.rent_period === "month" ? "міс" : d.terms.rent_period}`
                      : `Гібрид: ${d.terms.commission_pct}% + оренда ${formatCurrency(d.terms.rent_amount)}/${d.terms.rent_period === "month" ? "міс" : d.terms.rent_period}`;
              return (
                <Card key={d.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm">№ {d.contract_number}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {kindLabel} · з {new Date(d.valid_from).toLocaleDateString("uk-UA")}
                        </div>
                        <div className="text-xs mt-2">{termsLabel}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {d.status === "active" ? "Активний" : d.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1.5 text-xs"
                          onClick={() => setContractPreviewId(d.id)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Договір
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={previewContract !== null} onOpenChange={(o) => !o && setContractPreviewId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {previewContract && (() => {
            const copy = buildContractCopy(previewContract);
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <FileSignature className="w-4 h-4" />
                    {copy.title}
                  </SheetTitle>
                  <SheetDescription>{copy.subtitle}</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4 text-sm">
                  {copy.sections.map((s) => (
                    <section key={s.heading} className="space-y-1">
                      <div className="font-semibold">{s.heading}</div>
                      <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                    </section>
                  ))}
                  <section className="space-y-1.5 border-t pt-4">
                    <div className="font-semibold">{copy.permissionsTitle}</div>
                    <ul className="space-y-1">
                      {copy.permissions.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-muted-foreground">
                          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
