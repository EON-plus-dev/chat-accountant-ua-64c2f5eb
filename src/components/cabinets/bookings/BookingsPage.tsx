/**
 * BookingsPage — корінь модуля «Бронювання» для салонів (capability=bookings).
 *
 * Tabs: Сьогодні · Календар · Очікування · Майстри · Послуги · Винагороди
 * Дані — з `salonData` + admin store (`bookingsStore`) + публічні (widget).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Users,
  Sparkles,
  Receipt,
  CalendarDays,
  Clock,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UniversalKPICard, type BreakdownItem } from "@/components/ui/UniversalKPICard";
import { formatCurrency } from "@/lib/formatters";
import type { Cabinet } from "@/types/cabinet";
import {
  type SalonBooking,
} from "@/config/demoCabinets/salonData";
import { getBookableContext } from "@/core";
import { useSalonViewBookings } from "./useSalonViewBookings";

import { BookingsCalendar } from "./BookingsCalendar";
import { MastersGrid } from "./MastersGrid";
import { ServicesList } from "./ServicesList";
import { MasterPayoutsTable } from "./MasterPayoutsTable";
import { TodayAgenda } from "./TodayAgenda";
import { WaitlistTab } from "./WaitlistTab";
import { BookingEditorSheet } from "./BookingEditorSheet";
import { consumePendingAction, subscribeMasterAction } from "./masterActionBus";
import { MasterFilter } from "./MasterFilter";

interface BookingsPageProps {
  cabinet: Cabinet;
}

export function BookingsPage({ cabinet }: BookingsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("today");
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{ masterId?: string } | undefined>(undefined);
  const { masters: salonMasters, services: salonServices, clients: salonClients, workstations: salonWorkstations, shifts: salonShifts } = useMemo(
    () => getBookableContext(cabinet.id),
    [cabinet.id],
  );
  const salonBookings = useSalonViewBookings(cabinet.id);

  // Master filter (URL-synced via ?masterId=)
  const masterFilterId = searchParams.get("masterId");
  const setMasterFilterId = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (id) next.set("masterId", id);
      else next.delete("masterId");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Bookings/masters narrowed by active filter (passed to Today and Calendar tabs)
  const filteredBookings = useMemo(
    () => (masterFilterId ? salonBookings.filter((b) => b.masterId === masterFilterId) : salonBookings),
    [salonBookings, masterFilterId],
  );
  const filteredMasters = useMemo(
    () => (masterFilterId ? salonMasters.filter((m) => m.id === masterFilterId) : salonMasters),
    [masterFilterId],
  );

  // Consume pending master-driven actions (CTA from MasterProfilePage)
  useEffect(() => {
    const apply = () => {
      const action = consumePendingAction(cabinet.id);
      if (!action) return;
      if (action.kind === "calendar") {
        setTab("calendar");
        setMasterFilterId(action.masterId);
      } else if (action.kind === "create") {
        setCreateDefaults({ masterId: action.masterId });
        setCreateOpen(true);
      }
    };
    apply();
    return subscribeMasterAction(apply);
  }, [cabinet.id, setMasterFilterId]);

  // KPI: today / 30d + 30d trend vs prev 30d + sparkline
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const ymd = (d: Date) => d.toISOString().split("T")[0];

    const dShift = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return ymd(d);
    };
    const start7 = dShift(7);
    const start30 = dShift(30);
    const start60 = dShift(60);

    const todayBookings = salonBookings.filter((b) => b.date === today);
    const last7Done = salonBookings.filter((b) => b.status === "done" && b.date >= start7);
    const last30Done = salonBookings.filter((b) => b.status === "done" && b.date >= start30);
    const prev30Done = salonBookings.filter(
      (b) => b.status === "done" && b.date >= start60 && b.date < start30,
    );
    const upcoming = salonBookings.filter(
      (b) => b.date > today && (b.status === "scheduled" || b.status === "confirmed"),
    );

    const revenue30 = last30Done.reduce((s, b) => s + b.totalPrice, 0);
    const revenuePrev30 = prev30Done.reduce((s, b) => s + b.totalPrice, 0);
    const commissions30 = last30Done.reduce((s, b) => s + b.commissionAmount, 0);
    const commissionsPrev30 = prev30Done.reduce((s, b) => s + b.commissionAmount, 0);
    const avgCheck = last30Done.length > 0 ? Math.round(revenue30 / last30Done.length) : 0;
    const avgCheckPrev =
      prev30Done.length > 0 ? Math.round(revenuePrev30 / prev30Done.length) : 0;
    const noShow30 = salonBookings.filter(
      (b) => b.status === "no-show" && b.date >= start30,
    ).length;
    const noShowPrev = salonBookings.filter(
      (b) => b.status === "no-show" && b.date >= start60 && b.date < start30,
    ).length;
    const denom = last30Done.length + noShow30;
    const noShowRate = denom > 0 ? Math.round((noShow30 / denom) * 100) : 0;
    const denomPrev = prev30Done.length + noShowPrev;
    const noShowRatePrev = denomPrev > 0 ? Math.round((noShowPrev / denomPrev) * 100) : 0;

    // 30-day sparkline buckets (daily revenue & bookings)
    const dailyRevenue: { month: string; value: number }[] = [];
    const dailyBookings: { month: string; value: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = dShift(i);
      const dayDone = salonBookings.filter((b) => b.status === "done" && b.date === day);
      dailyRevenue.push({ month: day.slice(5), value: dayDone.reduce((s, b) => s + b.totalPrice, 0) });
      dailyBookings.push({
        month: day.slice(5),
        value: salonBookings.filter((b) => b.date === day).length,
      });
    }

    // Breakdown by master (revenue & commission, 30d)
    const byMaster = new Map<string, { revenue: number; commission: number }>();
    for (const b of last30Done) {
      const cur = byMaster.get(b.masterId) ?? { revenue: 0, commission: 0 };
      cur.revenue += b.totalPrice;
      cur.commission += b.commissionAmount;
      byMaster.set(b.masterId, cur);
    }
    const masterName = (id: string) =>
      salonMasters.find((m) => m.id === id)?.shortName ?? id;
    const revenueBreakdown: BreakdownItem[] = Array.from(byMaster.entries()).map(([id, v]) => ({
      id,
      label: masterName(id),
      value: formatCurrency(v.revenue),
      percent: revenue30 > 0 ? Math.round((v.revenue / revenue30) * 100) : 0,
    }));
    const commissionBreakdown: BreakdownItem[] = Array.from(byMaster.entries()).map(([id, v]) => ({
      id,
      label: masterName(id),
      value: formatCurrency(v.commission),
      percent: commissions30 > 0 ? Math.round((v.commission / commissions30) * 100) : 0,
    }));

    const pctDelta = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? 100 : 0;

    return {
      todayCount: todayBookings.length,
      upcomingCount: upcoming.length,
      last7Count: last7Done.length,
      revenue30,
      commissions30,
      avgCheck,
      noShowRate,
      noShowRateDelta: noShowRate - noShowRatePrev,
      revenueDelta: pctDelta(revenue30, revenuePrev30),
      commissionsDelta: pctDelta(commissions30, commissionsPrev30),
      avgCheckDelta: pctDelta(avgCheck, avgCheckPrev),
      dailyRevenue,
      dailyBookings,
      revenueBreakdown,
      commissionBreakdown,
    };
  }, [salonBookings]);

  const dir = (n: number): "up" | "down" | "stable" =>
    n > 0 ? "up" : n < 0 ? "down" : "stable";

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-24 md:pb-6">
      {/* KPI — UniversalKPICard grid with Δ trends, sparkline & breakdowns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <UniversalKPICard
          title="Сьогодні"
          value={stats.todayCount}
          icon={CalendarIcon}
          density="compact"
          description={`${stats.upcomingCount} наперед`}
          showDescription
          historicalData={stats.dailyBookings}
          onClick={() => setTab("today")}
        />
        <UniversalKPICard
          title="Виторг 30д"
          value={formatCurrency(stats.revenue30)}
          icon={Receipt}
          variant="success"
          density="compact"
          trend={{ value: Math.abs(stats.revenueDelta), direction: dir(stats.revenueDelta) }}
          historicalData={stats.dailyRevenue}
          breakdown={stats.revenueBreakdown}
          details={[
            { label: "Записів / 7д", value: String(stats.last7Count) },
            { label: "Δ vs попер. 30д", value: `${stats.revenueDelta >= 0 ? "+" : ""}${stats.revenueDelta}%` },
          ]}
          onClick={() => setTab("calendar")}
        />
        <UniversalKPICard
          title="Середній чек"
          value={formatCurrency(stats.avgCheck)}
          icon={Sparkles}
          density="compact"
          trend={{ value: Math.abs(stats.avgCheckDelta), direction: dir(stats.avgCheckDelta) }}
          details={[
            { label: "Δ vs попер. 30д", value: `${stats.avgCheckDelta >= 0 ? "+" : ""}${stats.avgCheckDelta}%` },
          ]}
        />
        <UniversalKPICard
          title="Винагороди 30д"
          value={formatCurrency(stats.commissions30)}
          icon={Users}
          density="compact"
          trend={{ value: Math.abs(stats.commissionsDelta), direction: dir(stats.commissionsDelta) }}
          breakdown={stats.commissionBreakdown}
          details={[
            { label: "Δ vs попер. 30д", value: `${stats.commissionsDelta >= 0 ? "+" : ""}${stats.commissionsDelta}%` },
          ]}
          onClick={() => setTab("payouts")}
        />
        <UniversalKPICard
          title="No-show 30д"
          value={`${stats.noShowRate}%`}
          icon={Clock}
          density="compact"
          variant={stats.noShowRate >= 10 ? "warning" : "default"}
          trend={{
            value: Math.abs(stats.noShowRateDelta),
            direction: dir(-stats.noShowRateDelta),
          }}
          details={[
            { label: "Δ vs попер. 30д", value: `${stats.noShowRateDelta >= 0 ? "+" : ""}${stats.noShowRateDelta} п.п.` },
          ]}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <TabsList className="flex md:grid md:grid-cols-6 w-full max-w-3xl overflow-x-auto snap-x scrollbar-hide h-auto">
            <TabsTrigger value="today" className="shrink-0 snap-start gap-1.5 text-[11px] md:text-xs px-2.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Сьогодні</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="shrink-0 snap-start gap-1.5 text-[11px] md:text-xs px-2.5">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Календар</span>
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="shrink-0 snap-start gap-1.5 text-[11px] md:text-xs px-2.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Очікування</span>
            </TabsTrigger>
            <TabsTrigger value="masters" className="shrink-0 snap-start gap-1.5 text-[11px] md:text-xs px-2.5">
              <Users className="w-3.5 h-3.5" />
              <span>Майстри</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="shrink-0 snap-start gap-1.5 text-[11px] md:text-xs px-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Послуги</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="shrink-0 snap-start gap-1.5 text-[11px] md:text-xs px-2.5">
              <Receipt className="w-3.5 h-3.5" />
              <span>Винагороди</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {(tab === "today" || tab === "calendar") && (
              <MasterFilter
                masters={salonMasters}
                value={masterFilterId}
                onChange={setMasterFilterId}
              />
            )}
            <Button
              size="sm"
              onClick={() => { setCreateDefaults(undefined); setCreateOpen(true); }}
              className="hidden md:inline-flex h-8 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Новий запис
            </Button>
          </div>
        </div>

        <TabsContent value="today" className="mt-4">
          <TodayAgenda
            cabinetId={cabinet.id}
            bookings={filteredBookings}
            masters={salonMasters}
            services={salonServices}
            clients={salonClients}
            workstations={salonWorkstations}
            shifts={salonShifts}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <BookingsCalendar
            cabinetId={cabinet.id}
            bookings={filteredBookings}
            masters={filteredMasters}
            services={salonServices}
            clients={salonClients}
            forceShowAllDays={!!masterFilterId}
          />
        </TabsContent>

        <TabsContent value="waitlist" className="mt-4">
          <WaitlistTab cabinetId={cabinet.id} masters={salonMasters} services={salonServices} />
        </TabsContent>

        <TabsContent value="masters" className="mt-4">
          <MastersGrid masters={salonMasters} bookings={salonBookings} services={salonServices} />
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <ServicesList services={salonServices} bookings={salonBookings} />
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <MasterPayoutsTable masters={salonMasters} bookings={salonBookings} services={salonServices} />
        </TabsContent>
      </Tabs>

      <BookingEditorSheet
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateDefaults(undefined); }}
        cabinetId={cabinet.id}
        booking={null}
        masters={salonMasters}
        services={salonServices}
        clients={salonClients}
        workstations={salonWorkstations}
        defaults={createDefaults}
      />

      {/* Mobile FAB — Новий запис */}
      <Button
        size="icon"
        onClick={() => { setCreateDefaults(undefined); setCreateOpen(true); }}
        className="md:hidden fixed bottom-20 right-4 z-30 h-12 w-12 rounded-full shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Новий запис"
      >
        <Plus className="w-5 h-5" />
      </Button>
    </div>
  );
}
