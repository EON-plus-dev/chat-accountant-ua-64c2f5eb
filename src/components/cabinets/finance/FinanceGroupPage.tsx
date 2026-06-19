import { Landmark } from "lucide-react";
import { useState } from "react";
import type { Cabinet } from "@/types/cabinet";
import { IaSectionShell } from "../stubs/IaSectionShell";
import { FinancePage } from "./index";
import { IndividualPaymentsPage } from "../payments/IndividualPaymentsPage";
import { FinMonitoringPage } from "../fin-monitoring/FinMonitoringPage";
import { DeclarationCasesListPage } from "../declarations/DeclarationCasesListPage";
import { DeclarationCasePage } from "../declarations/DeclarationCasePage";
import { TaxCreditDeclarationPage } from "../declarations/TaxCreditDeclarationPage";
import { KikDeclarationPage } from "../declarations/KikDeclarationPage";
import { MonthlyVzDeclarationPage } from "../declarations/MonthlyVzDeclarationPage";
import { DeclarationSourceBreakdown } from "../declarations/DeclarationSourceBreakdown";
import { DemoRoleViewProvider } from "@/contexts/DemoRoleViewContext";
import type { UnifiedDeclaration } from "@/lib/declarations/unifiedDeclarations";
import TaxDiscountInner from "./TaxDiscountInner";

interface Props {
  cabinet: Cabinet;
  defaultInner?: string;
  onNavigateToInner?: (innerId: string) => void;
  onNavigateToDocumentDetail?: (documentId: string) => void;
}

/**
 * Хаб «Фінанси» в кабінеті фізособи (одна з 7 груп під «Управління»).
 * Об'єднує state-режим (рахунки), flow (платежі), податки (декларації / знижка /
 * фін.моніторинг) і місце для майбутніх бюджетів / боргів / лояльності.
 */
export default function FinanceGroupPage({
  cabinet,
  defaultInner,
  onNavigateToInner,
  onNavigateToDocumentDetail,
}: Props) {
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [activeDeclaration, setActiveDeclaration] = useState<UnifiedDeclaration | null>(null);

  return (
    <IaSectionShell
      icon={<Landmark className="w-6 h-6" />}
      title="Фінанси"
      question="Що відбувається з моїми грошима?"
      description="Рахунки, платежі, бюджети, борги, податки і програми лояльності — єдиний фінансовий контекст особи."
      defaultSubTab={defaultInner}
      subTabs={[
        {
          id: "accounts",
          label: "Рахунки",
          question: "Скільки в мене грошей зараз?",
          description: "Залишки на банках, картках, готівці та е-гаманцях — net-баланс з курсом НБУ.",
          capabilities: [],
          ready: true,
          renderContent: () => (
            <FinancePage
              cabinet={cabinet}
              onNavigateToPayments={() => onNavigateToInner?.("payments")}
            />
          ),
        },
        {
          id: "payments",
          label: "Платежі",
          question: "Що треба сплатити?",
          description: "Календар податкових і регулярних платежів з формуванням платіжки.",
          capabilities: [],
          ready: true,
          renderContent: () => (
            <IndividualPaymentsPage
              cabinet={cabinet}
              onNavigateToFinMonitoring={() => onNavigateToInner?.("fin-monitoring")}
            />
          ),
        },
        {
          id: "budgets",
          label: "Бюджети",
          question: "В які рамки я вкладаюсь?",
          description: "Місячні та категорійні бюджети з нагадуваннями про перевищення.",
          capabilities: [
            { label: "Категорійні", description: "Їжа, транспорт, розваги — окремий ліміт на кожну." },
            { label: "Місячний", description: "Загальний потолок витрат." },
            { label: "Alerts", description: "Сповіщення при наближенні до ліміту." },
            { label: "AI-перерозподіл", description: "AI пропонує оптимізацію." },
          ],
        },
        {
          id: "debts",
          label: "Борги та кредити",
          question: "Скільки я винен і кому винні мені?",
          description: "Активні кредити, розстрочки, позики від друзів і навпаки.",
          capabilities: [
            { label: "Мої кредити", description: "Графіки платежів, відсотки, дострокове погашення." },
            { label: "Боргові розписки", description: "Те, що ви позичили, та повернення." },
            { label: "Калькулятор", description: "Що буде, якщо погасити швидше." },
          ],
        },
        {
          id: "declarations",
          label: "Декларації",
          question: "Які декларації мені треба подати?",
          description: "Річні декларації про майновий стан і доходи (ст. 179 ПКУ).",
          capabilities: [],
          ready: true,
          renderContent: () => (
            <DemoRoleViewProvider>
              <div className="space-y-4">
                {activeCaseId ? (
                  <DeclarationCasePage caseId={activeCaseId} onBack={() => setActiveCaseId(null)} />
                ) : activeDeclaration ? (
                  activeDeclaration.kind === "tax_credit" ? (
                    <TaxCreditDeclarationPage
                      cabinetId={cabinet.id}
                      reportId={activeDeclaration.refId}
                      onBack={() => setActiveDeclaration(null)}
                    />
                  ) : activeDeclaration.kind === "kik" ? (
                    <KikDeclarationPage
                      cabinetId={cabinet.id}
                      reportId={activeDeclaration.refId}
                      onBack={() => setActiveDeclaration(null)}
                    />
                  ) : activeDeclaration.kind === "vz_monthly" ? (
                    <MonthlyVzDeclarationPage
                      cabinetId={cabinet.id}
                      reportId={activeDeclaration.refId}
                      onBack={() => setActiveDeclaration(null)}
                    />
                  ) : null
                ) : (
                  <>
                    <DeclarationCasesListPage
                      cabinetId={cabinet.id}
                      onOpenCase={(id) => setActiveCaseId(id)}
                      onOpenDeclaration={(decl) => {
                        if (decl.source === "case") setActiveCaseId(decl.refId);
                        else setActiveDeclaration(decl);
                      }}
                    />
                    <DeclarationSourceBreakdown
                      cabinetId={cabinet.id}
                      onNavigateToFinMonitoring={() => onNavigateToInner?.("fin-monitoring")}
                    />
                  </>
                )}
              </div>
            </DemoRoleViewProvider>
          ),
        },
        {
          id: "tax-discount",
          label: "Податкова знижка",
          question: "Що я можу повернути з ПДФО?",
          description: "Повернення ПДФО за навчання, лікування, іпотеку, благодійність (ст. 166 ПКУ).",
          capabilities: [],
          ready: true,
          renderContent: () => <TaxDiscountInner />,
        },
        {
          id: "fin-monitoring",
          label: "Фін. моніторинг",
          question: "Звідки взялися всі мої доходи і витрати?",
          description: "Зведений реєстр усіх операцій з джерелом (банк, готівка, інвестиції, оренда).",
          capabilities: [],
          ready: true,
          renderContent: () => (
            <FinMonitoringPage
              cabinet={cabinet}
              onNavigateToDocumentDetail={onNavigateToDocumentDetail}
              onNavigateToTab={(tab) => onNavigateToInner?.(tab)}
            />
          ),
        },
        {
          id: "loyalty",
          label: "Лояльність",
          question: "Скільки в мене кешбеку і бонусів?",
          description: "Кешбек з карт, бонуси з закладів, бали лояльності — все в одному.",
          capabilities: [
            { label: "Кешбек", description: "Поточний баланс і історія нарахувань." },
            { label: "Бонуси закладів", description: "Карти лояльності з активними балами." },
            { label: "Що згорає", description: "Бали, які треба використати найближчим часом." },
          ],
        },
        {
          id: "ai-finance",
          label: "AI Finance",
          question: "Що каже AI про мої гроші?",
          description: "Особистий фінансовий консультант — інсайти, прогнози, what-if сценарії.",
          capabilities: [
            { label: "Місячний огляд", description: "Що змінилось і чому." },
            { label: "Прогноз", description: "Залишок на кінець місяця і ризики." },
            { label: "What-if", description: "Що буде, якщо +10% витрат на ресторани." },
            { label: "Аномалії", description: "Незвичні операції, що варті уваги." },
          ],
        },
      ]}
    />
  );
}
