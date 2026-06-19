/**
 * FinancePage — orchestrator розділу «Фінанси» в Операціях кабінету.
 *
 * CFO-cockpit рівня Pleo/Brex/Agicap, адаптований під український контекст:
 *   1. Hero — Net + Book/Available/Pending + Δ + sparkline + стек-бар джерел
 *   2. KPI-стрічка — Inflow/Outflow 7д, Runway 90д, Незіставлено
 *   3. CFO-cockpit — Cash-flow waterfall, 13-week forecast, Liquidity buckets, Concentration risk
 *   4. UA-compliance — ФОП-ліміт, Резерв під податки
 *   5. Список банк-рахунків (drill у виписку) + ПРРО-каси (гейт `retail_prro`)
 */

import { useState } from "react";
import { ChevronRight, Landmark, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCabinetCashPosition } from "@/hooks/useCabinetCashPosition";
import { useReconciliationStatus } from "@/hooks/useReconciliationStatus";
import { buildUrlWithTrail } from "@/hooks/useBackTrail";
import type { Cabinet } from "@/types/cabinet";
import type { BankAccountSnapshot } from "@/hooks/usePaymentsAccountsBalance";
import { CashPositionHero } from "./CashPositionHero";
import { CashPositionKpiStrip } from "./CashPositionKpiStrip";
import { BankAccountCard } from "./BankAccountCard";
import { PrroCashboxCard } from "./PrroCashboxCard";
import { AccountDetailSheet } from "./AccountDetailSheet";
import { CashFlowWaterfallCard } from "./cockpit/CashFlowWaterfallCard";
import { ThirteenWeekForecastCard } from "./cockpit/ThirteenWeekForecastCard";
import { LiquidityBucketsCard } from "./cockpit/LiquidityBucketsCard";
import { ConcentrationRiskCard } from "./cockpit/ConcentrationRiskCard";
import { FopLimitProgressCard } from "./compliance/FopLimitProgressCard";
import { TaxReserveCard } from "./compliance/TaxReserveCard";

interface FinancePageProps {
  cabinet: Cabinet;
  onNavigateToPayments?: (params?: { account?: string; source?: string }) => void;
}

export function FinancePage({ cabinet, onNavigateToPayments }: FinancePageProps) {
  const position = useCabinetCashPosition(cabinet);
  const reconciliation = useReconciliationStatus(cabinet);
  const [openAccount, setOpenAccount] = useState<BankAccountSnapshot | null>(null);
  const isFop = cabinet.type === "fop";

  const handleOpenStatement = (id: string) => {
    const acc = position.bankAccounts.find((a) => a.id === id) ?? null;
    setOpenAccount(acc);
  };

  const handleOpenFullStatement = (accountId: string) => {
    setOpenAccount(null);
    if (onNavigateToPayments) {
      onNavigateToPayments({ account: accountId });
      return;
    }
    // Fallback: повна сторінка Платежів з BackTrail
    const url = buildUrlWithTrail(`${window.location.pathname}`, {
      label: "Фінанси",
      url: window.location.pathname + window.location.search,
    });
    const sp = new URL(url, window.location.origin).searchParams;
    sp.set("subtab", "payments");
    sp.set("account", accountId);
    window.location.assign(`${window.location.pathname}?${sp.toString()}`);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-6">
      {/* 1. Hero — Net Cash + 3 balances + Δ + sparkline */}
      <CashPositionHero position={position} />

      {/* 2. KPI strip */}
      <CashPositionKpiStrip
        position={position}
        reconciliation={reconciliation}
        onOpenUnmatched={() => onNavigateToPayments?.({ source: "unmatched" })}
      />

      {/* 3. CFO-cockpit — waterfall + forecast у 2 колонки на desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CashFlowWaterfallCard cabinet={cabinet} openingBalance={position.totalUah - position.flows.delta30d} />
        <ThirteenWeekForecastCard cabinet={cabinet} position={position} />
      </div>

      <LiquidityBucketsCard
        cabinet={cabinet}
        position={position}
        onEscapeToPayments={(source) => onNavigateToPayments?.({ source })}
        onEscapeToAccounts={() =>
          document.getElementById("finance-accounts")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ConcentrationRiskCard cabinet={cabinet} position={position} />
        <TaxReserveCard cabinet={cabinet} position={position} />
      </div>

      {/* 4. UA-compliance — ФОП-ліміт (рендериться лише для ФОП) */}
      {isFop && <FopLimitProgressCard cabinet={cabinet} />}

      {/* 5. Bank accounts */}
      <section id="finance-accounts" className="space-y-2 scroll-mt-20">
        <header className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Рахунки ({position.bankAccounts.length})</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1 text-primary px-2"
            onClick={() => onNavigateToPayments?.({})}
            aria-label="Усі операції"
          >
            <span className="hidden sm:inline">Усі операції</span> <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {position.bankAccounts.map((a) => (
            <BankAccountCard key={a.id} account={a} onOpenStatement={handleOpenStatement} />
          ))}
        </div>
      </section>

      {/* PRRO cashboxes — лише з capability `retail_prro` */}
      {position.prroCashboxes.length > 0 && (
        <section className="space-y-2">
          <header className="flex items-center gap-2 px-1">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Каси / Готівка ({position.prroCashboxes.length})</h3>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {position.prroCashboxes.map((c) => (
              <PrroCashboxCard key={c.id} cashbox={c} />
            ))}
          </div>
        </section>
      )}

      {/* Empty fallback */}
      {position.bankAccounts.length === 0 && position.prroCashboxes.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Жодного рахунку чи каси не підключено. Додайте джерело у Налаштуваннях кабінету.
          </CardContent>
        </Card>
      )}

      {/* Account drill */}
      <AccountDetailSheet
        account={openAccount}
        open={!!openAccount}
        onOpenChange={(o) => !o && setOpenAccount(null)}
        onOpenFullStatement={handleOpenFullStatement}
      />
    </div>
  );
}
