import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  ArrowRight,
  FileText,
  Calculator,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import type { Cabinet } from "@/types/cabinet";
import type { TabType } from "@/components/dashboard/WorkspacePanel";

import { getOverviewConfig, type AttentionItem } from "@/config/overviewConfig";
import { getDocumentsForCabinet } from "@/config/documentFlowConfig";
import { getTaxPaymentsForCabinet } from "@/config/paymentsConfig";
import { aggregateAnalyticsData } from "@/lib/analytics/dataLayer";
import { useTodaySnapshot } from "@/hooks/useTodaySnapshot";
import { useUserEvents } from "@/hooks/useUserEvents";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { useTasksStore } from "@/hooks/useTasksStore";
import { useResponsiveContainer } from "@/hooks/useResponsiveContainer";

import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { TasksList } from "@/components/tasks/TasksList";
import { LimitStatusWidget } from "./LimitStatusWidget";
import { PassiveCabinetBanner } from "./PassiveCabinetBanner";
import { LockedFeatureCard } from "@/components/marketing/LockedFeatureCard";
import { DeclarationChecklistWidget } from "./overview/DeclarationChecklistWidget";
import { IndividualTaxCalendar } from "./overview/IndividualTaxCalendar";

import { OverviewBpProvider } from "./overview/OverviewBpContext";
import { OverviewBudgetSettlementCard } from "./overview/OverviewBudgetSettlementCard";
import { OverviewAttentionInbox } from "./overview/OverviewAttentionInbox";
import { OverviewRecentActivityStrip } from "./overview/OverviewRecentActivityStrip";
import { OverviewPassportCollapsible } from "./overview/OverviewPassportCollapsible";
import { OverviewCashPositionCard } from "./overview/OverviewCashPositionCard";
import { MyPlacesPanel } from "@/personal/components/MyPlacesPanel";
import { OverviewAiBrief } from "./overview/OverviewAiBrief";
import { PersonalOverviewStaff } from "./overview/PersonalOverviewStaff";
import { IndividualOverviewBoard } from "./individual/IndividualOverviewBoard";

interface CabinetOverviewPageProps {
  cabinet: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
  onTabChange?: (tab: TabType, analyticsSection?: string) => void;
}

const kpiToAnalyticsSection: Record<string, string> = {
  income: "chart",
  expenses: "expenses",
  "ep-vz": "taxes",
  esv: "taxes",
  profit: "chart",
  revenue: "chart",
  margin: "chart",
  clients: "chart",
  orders: "chart",
  "avg-check": "chart",
};

const CabinetOverviewPage = ({
  cabinet,
  onChatPromptInsert,
  onTabChange,
}: CabinetOverviewPageProps) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const responsive = useResponsiveContainer(containerRef);
  const { isAtLeast, cols, kpiCols } = responsive;

  const config = getOverviewConfig(cabinet.type, cabinet.id);
  const dataSet = useMemo(() => aggregateAnalyticsData(cabinet), [cabinet]);
  const todaySnapshot = useTodaySnapshot(cabinet, undefined, dataSet);
  const isPassive = cabinet.accessMode === "passive";

  const cabinetDocuments = useMemo(
    () => (cabinet.type === "individual" ? getDocumentsForCabinet(cabinet) : []),
    [cabinet],
  );

  const taxPayments = useMemo(
    () => (isPassive ? [] : getTaxPaymentsForCabinet(cabinet.id)),
    [cabinet.id, isPassive],
  );

  const {
    tasks,
    stats: taskStats,
    completeTask,
    startTask,
    reopenTask,
    deleteTask,
  } = useTasksStore({ cabinetId: cabinet.id });

  const { events: userEvents } = useUserEvents(cabinet.id);
  const upcomingUserEvents = useMemo(() => {
    const now = Date.now();
    return userEvents
      .filter((e) => e.status === "scheduled" && new Date(e.event_at).getTime() >= now)
      .slice(0, 3);
  }, [userEvents]);

  const { items: dbNotifications, markRead: markNotificationRead } = useUserNotifications();
  const reminderNotifications = useMemo(
    () =>
      dbNotifications
        .filter(
          (n) =>
            n.type === "event_reminder" &&
            !n.read_at &&
            (!n.cabinet_id || n.cabinet_id === cabinet.id),
        )
        .slice(0, 5),
    [dbNotifications, cabinet.id],
  );

  // Individual cabinets → new Life Status Board
  if (cabinet.type === "individual" && !isPassive) {
    return (
      <IndividualOverviewBoard
        cabinet={cabinet}
        onTabChange={onTabChange}
        onChatPromptInsert={onChatPromptInsert}
      />
    );
  }



  const handleCTA = (item: AttentionItem) => {
    switch (item.cta.action) {
      case "open":
        toast({ title: "Відкриваю...", description: item.text });
        break;
      case "explain":
        onChatPromptInsert?.(`Поясни: ${item.text}`);
        break;
      case "operations":
        toast({ title: "Перехід до операцій", description: "Демо" });
        break;
    }
  };

  const handleNavigateToIncomeBook = (intent?: "needs-clarification") => {
    if (intent) {
      const params = new URLSearchParams(window.location.search);
      params.set("quickFilter", intent);
      navigate({ search: `?${params.toString()}` }, { replace: false });
    }
    onTabChange?.("operations" as TabType, "income-book");
  };

  const handleNavigateToDocuments = () =>
    onTabChange?.("operations" as TabType, "documents");

  const openReminder = (n: { related_event_id?: string | null; id: string }) => {
    markNotificationRead(n.id);
    if (n.related_event_id) {
      navigate(
        buildUrlWithTrail(
          `/dashboard?tab=event-journal&cabinet=${cabinet.id}&eventId=${n.related_event_id}`,
          {
            label: `Огляд: ${cabinet.name}`,
            url: window.location.pathname + window.location.search,
          },
        ),
      );
    } else {
      onTabChange?.("event-journal");
    }
  };

  const openEvent = (eventId: string) =>
    navigate(
      buildUrlWithTrail(
        `/dashboard?tab=event-journal&cabinet=${cabinet.id}&eventId=${eventId}`,
        {
          label: `Огляд: ${cabinet.name}`,
          url: window.location.pathname + window.location.search,
        },
      ),
    );

  const hs = todaySnapshot.healthScore;
  const showCalendarPair = !isPassive && cabinet.type === "individual";

  return (
    <OverviewBpProvider value={responsive}>
      <div
        ref={containerRef}
        className={cn(
          "max-w-7xl mx-auto w-full md:overflow-auto space-y-4",
          isAtLeast("md") ? "p-4 md:p-6 md:space-y-5" : "p-3",
        )}
      >
        {/* Passive banner */}
        <PassiveCabinetBanner
          cabinet={cabinet}
          onViewPartner={(id) =>
            toast({ title: "Перехід до партнера", description: `Кабінет партнера: ${id}` })
          }
          onNavigateToDocuments={handleNavigateToDocuments}
        />

        {/* Phase A4 — AI Morning Brief (individual only, owner) */}
        {cabinet.type === "individual" && cabinet.role === "owner" && !isPassive && (
          <>
            <OverviewAiBrief
              cabinet={cabinet}
              onTabChange={onTabChange}
              onChatPromptInsert={onChatPromptInsert}
            />
            <PersonalOverviewStaff cabinet={cabinet} onTabChange={onTabChange} />
          </>
        )}


        {/* Passport — top of page, acts as hero when collapsed; includes Health Score chip */}
        <OverviewPassportCollapsible
          cabinet={cabinet}
          description={config.description}
          onOpenIntegrations={() => onTabChange?.("settings" as TabType, "integrations")}
        />

        {/* «Мої місця» — швидкий доступ до закладів, на які підписаний користувач.
            Піднято на позицію 2 (одразу після Passport) — для individual власника
            це найшвидший шлях до повсякденних дій (запис, замовлення, контакти). */}
        {cabinet.type === "individual" && cabinet.role === "owner" && (
          <MyPlacesPanel />
        )}

        {/* Operational Assessment (Health Score + Attention Inbox) */}
        {!isPassive && (
          <OverviewAttentionInbox
            attentionItems={config.attentionItems.filter((i) => i.priority === "high")}
            reminders={reminderNotifications}
            upcomingEvents={upcomingUserEvents}
            health={hs}
            onHealthDetails={() => onTabChange?.("analytics" as TabType, "health-score")}
            onCtaClick={handleCTA}
            onMarkRead={markNotificationRead}
            onOpenReminder={openReminder}
            onOpenEvent={openEvent}
            onOpenAllEvents={() => onTabChange?.("event-journal")}
          />
        )}

        {/* Залишок коштів — швидкий перегляд для розділу Огляд */}
        {!isPassive && (
          <OverviewCashPositionCard
            cabinet={cabinet}
            onOpenFinance={() => onTabChange?.("operations" as TabType, "finance")}
          />
        )}

        {/* Analytics */}
        {!isPassive ? (
          <div className="grid gap-4 md:gap-5 items-stretch [&>*]:h-full grid-cols-1">
            <Card className="border-border/70">
              <CardHeader className={cn(isAtLeast("md") ? "pb-3" : "pb-2 px-3 pt-3")}>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base min-w-0">
                    <BarChart3 className="w-5 h-5 text-primary shrink-0" />
                    <span className="truncate">Аналітика</span>
                    <span className="text-xs font-normal text-muted-foreground shrink-0">
                      · Квітень 2026
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-muted-foreground hover:text-foreground shrink-0"
                    onClick={() => onTabChange?.("analytics" as TabType, "kpis")}
                  >
                    Детальніше
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={cn("space-y-4", !isAtLeast("md") && "px-3 pb-3")}>
                <div
                  className={cn(
                    "grid gap-3",
                    kpiCols === 4 ? "grid-cols-4" : "grid-cols-2",
                  )}
                >
                  {config.kpis.map((kpi) => {
                    const variant =
                      kpi.semantic === "income"
                        ? "success"
                        : kpi.semantic === "expense"
                          ? "danger"
                          : kpi.semantic === "warning"
                            ? "warning"
                            : "default";
                    const targetSection = kpiToAnalyticsSection[kpi.id] || "kpis";
                    return (
                      <UniversalKPICard
                        key={kpi.id}
                        title={kpi.title}
                        value={kpi.value}
                        format={kpi.format}
                        icon={kpi.icon}
                        trend={kpi.trend}
                        description={kpi.description}
                        variant={variant}
                        density="compact"
                        onClick={() => onTabChange?.("analytics" as TabType, targetSection)}
                        navigateLabel="До аналітики"
                        onNavigate={() => onTabChange?.("analytics" as TabType, targetSection)}
                      />
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-border/60 grid gap-3 md:grid-cols-2 [&>*]:min-w-0">
                  {cabinet.type === "fop" && cabinet.fopGroup && (
                    <LimitStatusWidget
                      cabinet={cabinet}
                      onNavigateToIncomeBook={handleNavigateToIncomeBook}
                    />
                  )}
                  <OverviewBudgetSettlementCard
                    variant="inline"
                    taxPayments={taxPayments}
                    ctaLabel={cabinet.type === "fop" ? "Податки" : "Платежі"}
                    onOpenPayments={() =>
                      onTabChange?.(
                        "operations" as TabType,
                        cabinet.type === "fop" ? "taxes" : "payments",
                      )
                    }
                    onOpenTaxPayment={
                      cabinet.type === "fop"
                        ? (paymentId) => {
                            // URL param підхопить TaxesPage та відкриє drill-sheet
                            const next = new URLSearchParams(window.location.search);
                            next.set("taxPaymentId", paymentId);
                            window.history.replaceState(
                              null,
                              "",
                              `${window.location.pathname}?${next.toString()}`,
                            );
                            onTabChange?.("operations" as TabType, "taxes");
                          }
                        : undefined
                    }
                    onOpenAnalytics={() => onTabChange?.("analytics" as TabType, "taxes")}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Доступно на активному плані
            </h3>
            <div
              className={cn(
                "grid gap-3",
                cols === 2 ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              <LockedFeatureCard
                icon={FileText}
                title="Створення документів"
                description="Формуйте рахунки, акти та договори за секунди"
                benefit="Економте 3+ години на тиждень"
                planRequired="start"
                onUnlock={() => navigate("/pricing?source=passive-overview")}
              />
              <LockedFeatureCard
                icon={Calculator}
                title="Автоматичні податки"
                description="AI розраховує ЄП/ЄСВ на основі ваших доходів"
                benefit="Жодних помилок у звітах"
                planRequired="start"
                onUnlock={() => navigate("/pricing?source=passive-overview")}
              />
              <LockedFeatureCard
                icon={BarChart3}
                title="Бізнес-аналітика"
                description="Графіки, тренди та прогнози для вашого бізнесу"
                benefit="Рішення на основі даних"
                planRequired="smart"
                onUnlock={() => navigate("/pricing?source=passive-overview")}
              />
              <LockedFeatureCard
                icon={LinkIcon}
                title="Інтеграції"
                description="Банки, ПРРО, API для автоматизації"
                benefit="Все працює автоматично"
                planRequired="smart"
                onUnlock={() => navigate("/pricing?source=passive-overview")}
              />
            </div>
          </div>
        )}

        {/* Individual-only: Declaration + Calendar */}
        {showCalendarPair && (
          <div
            className={cn(
              "grid gap-4 md:gap-5 items-stretch [&>*]:h-full",
              cols === 2 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            <DeclarationChecklistWidget
              documents={cabinetDocuments}
              onNavigateToDocuments={handleNavigateToDocuments}
              onChatPromptInsert={onChatPromptInsert}
            />
            <IndividualTaxCalendar
              year={2025}
              onDeadlineClick={(id) => {
                const deadlineToTab: Record<string, string> = {
                  declaration: "declarations",
                  payment: "payments",
                  "tax-credit": "tax-discount",
                  "property-tax": "property",
                  collect: "documents",
                };
                const section = deadlineToTab[id];
                if (section) onTabChange?.("operations" as TabType, section);
              }}
            />
          </div>
        )}

        {/* Personal Core 9-card grid was removed from Overview:
            - 4 cards duplicated the sidebar "Операції" tabs
            - 5 cards були "soon" заглушками — створювали шум.
            MyPlacesPanel піднято на позицію 2 (вище). Замовлення/бронювання — в Операціях. */}


        {/* Tasks */}
        {!isPassive && tasks.length > 0 && (
          <Card className="border-border/70">
            <CardContent className={cn(isAtLeast("md") ? "p-4" : "p-2 sm:p-3")}>
              <TasksList
                tasks={tasks}
                stats={taskStats}
                onComplete={completeTask}
                onStart={startTask}
                onReopen={reopenTask}
                onDelete={deleteTask}
                onNavigateToDocument={() => onTabChange?.("operations" as TabType, "documents")}
                onCreateTask={() =>
                  toast({
                    title: "Створення завдання",
                    description: "Перейдіть до документа та додайте @згадку з дією",
                  })
                }
                compact
                maxHeight={isAtLeast("md") ? "300px" : "260px"}
              />
            </CardContent>
          </Card>
        )}

        {/* Recent activity strip */}
        <OverviewRecentActivityStrip
          title={isPassive ? "Останні документи" : "Останні дії"}
          events={config.recentEvents}
          onOpenAll={isPassive ? handleNavigateToDocuments : () => onTabChange?.("event-journal")}
          ctaLabel={isPassive ? "Усі документи" : "Усі події"}
        />
      </div>
    </OverviewBpProvider>
  );
};

export default CabinetOverviewPage;
