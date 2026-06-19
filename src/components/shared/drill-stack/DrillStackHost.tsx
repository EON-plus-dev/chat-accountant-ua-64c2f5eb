/**
 * DrillStackHost — рендерить активний drill-view залежно від поточного top-рівня стека.
 * Підключається на рівні layout, в якому має працювати drill-навігація
 * (зараз — `CabinetOperationsPage`; за потреби — підняти на `Dashboard`).
 *
 * Усі onOpen* колбеки опційні — якщо передані, drill-view покаже escape-кнопку
 * «Відкрити повний розділ», що закриє стек і викличе callback (тип 3 — глибока навігація).
 */

import { useDrillStack } from "./DrillStackProvider";
import { IncomeRecordDrillView } from "./views/IncomeRecordDrillView";
import { ContractorDrillView } from "./views/ContractorDrillView";
import { DocumentDrillView } from "./views/DocumentDrillView";
import { DeclarationDrillView } from "./views/DeclarationDrillView";
import { PaymentDrillView } from "./views/PaymentDrillView";
import { ReportDrillView } from "./views/ReportDrillView";
import { AuditDrillView } from "./views/AuditDrillView";
import { BookingDrillView } from "./views/BookingDrillView";
import { SalonMasterDrillView } from "./views/SalonMasterDrillView";
import { ClientDrillView } from "./views/ClientDrillView";
import { OrderDrillView } from "./views/OrderDrillView";
import { PersonalOrderDrillView } from "./views/PersonalOrderDrillView";
import { SubscriptionDrillView } from "./views/SubscriptionDrillView";
import { LoyaltyProgramDrillView } from "./views/LoyaltyProgramDrillView";
import { PersonalOfferDrillView } from "./views/PersonalOfferDrillView";
import type { DrillKind } from "./types";

export interface DrillStackHostProps {
  onOpenIncomeBook?: (recordId: string) => void;
  onOpenContractorProfile?: (contractorId: string) => void;
  onOpenDocument?: (documentId: string) => void;
  onOpenDeclaration?: (declarationId: string) => void;
  onOpenPayment?: (paymentId: string) => void;
  onOpenReport?: (reportId: string) => void;
  onOpenAudit?: (auditId: string) => void;
  onOpenBooking?: (bookingId: string) => void;
  onOpenMasterEdit?: (masterId: string) => void;
  onOpenClient?: (clientId: string) => void;
  onOpenOrder?: (orderId: string, direction: "sale" | "purchase") => void;
  /** Personal Core: відкрити повну сторінку відповідного підрозділу «Замовлень». */
  onOpenPersonalOrders?: () => void;
  onOpenSubscriptions?: () => void;
  onOpenLoyalty?: () => void;
  onOpenOffersTarget?: (target: "shop" | "services" | "bookings" | "external") => void;
  /** Кабінет — для пошуку bookings у локальному сторі/публічних. */
  cabinetId?: string;
  /** Default sourceLabel якщо рівень не приніс свій (рідкісний кейс — refresh з URL) */
  defaultSourceLabel?: string;
}

const KIND_LABEL: Record<DrillKind, string> = {
  "income-record": "Запис книги",
  contractor: "Контрагент",
  document: "Документ",
  declaration: "Декларація",
  payment: "Платіж",
  report: "Звіт",
  audit: "Перевірка",
  workstation: "Робоче місце",
  "salon-master": "Майстер",
  "salon-service": "Послуга",
  booking: "Бронювання",
  client: "Клієнт",
  order: "Замовлення",
  "personal-order": "Замовлення",
  subscription: "Підписка",
  "loyalty-program": "Програма лояльності",
  "personal-offer": "Пропозиція",
};

export function DrillStackHost({
  onOpenIncomeBook,
  onOpenContractorProfile,
  onOpenDocument,
  onOpenDeclaration,
  onOpenPayment,
  onOpenReport,
  onOpenAudit,
  onOpenBooking,
  onOpenMasterEdit,
  onOpenClient,
  onOpenOrder,
  onOpenPersonalOrders,
  onOpenSubscriptions,
  onOpenLoyalty,
  onOpenOffersTarget,
  cabinetId,
  defaultSourceLabel = "попередній екран",
}: DrillStackHostProps) {
  const { current, stack } = useDrillStack();

  if (!current) return null;

  // sourceLabel = підпис рівня нижче (parent), або defaultSourceLabel
  const parentIdx = stack.length - 2;
  const parent = parentIdx >= 0 ? stack[parentIdx] : null;
  const sourceLabel = parent
    ? parent.sourceLabel || `${KIND_LABEL[parent.kind]} ${parent.displayName || parent.id}`
    : defaultSourceLabel;

  switch (current.kind) {
    case "income-record":
      return (
        <IncomeRecordDrillView
          recordId={current.id}
          sourceLabel={sourceLabel}
          onOpenInBook={onOpenIncomeBook}
        />
      );
    case "contractor":
      return (
        <ContractorDrillView
          contractorId={current.id}
          contractorName={current.displayName}
          sourceLabel={sourceLabel}
          onOpenFullProfile={onOpenContractorProfile}
        />
      );
    case "document":
      return (
        <DocumentDrillView
          documentId={current.id}
          sourceLabel={sourceLabel}
          onOpenFullDocument={onOpenDocument}
        />
      );
    case "declaration":
      return (
        <DeclarationDrillView
          declarationId={current.id}
          title={current.meta?.title || current.displayName}
          statusLabel={current.meta?.statusLabel}
          deadline={current.meta?.deadline}
          totalAmount={current.meta?.totalAmount}
          taxAmount={current.meta?.taxAmount}
          sourceLabel={sourceLabel}
          onOpenFullDeclaration={onOpenDeclaration}
        />
      );
    case "payment":
      return (
        <PaymentDrillView
          paymentId={current.id}
          amount={current.meta?.amount}
          currency={current.meta?.currency}
          date={current.meta?.date}
          contractor={current.meta?.contractor}
          purpose={current.meta?.purpose}
          statusLabel={current.meta?.statusLabel}
          relatedPprId={current.meta?.relatedPprId}
          sourceLabel={sourceLabel}
          onOpenFullPayment={onOpenPayment}
        />
      );
    case "report":
      return (
        <ReportDrillView
          reportId={current.id}
          title={current.meta?.title || current.displayName}
          period={current.meta?.period}
          statusLabel={current.meta?.statusLabel}
          deadline={current.meta?.deadline}
          taxAmount={current.meta?.taxAmount}
          sourceLabel={sourceLabel}
          onOpenFullReport={onOpenReport}
        />
      );
    case "audit":
      return (
        <AuditDrillView
          auditId={current.id}
          sourceLabel={sourceLabel}
          onOpenFullAudit={onOpenAudit}
        />
      );
    case "booking":
      return (
        <BookingDrillView
          bookingId={current.id}
          cabinetId={cabinetId}
          sourceLabel={sourceLabel}
          onOpenFullBooking={onOpenBooking}
        />
      );
    case "salon-master":
      return (
        <SalonMasterDrillView
          masterId={current.id}
          cabinetId={cabinetId}
          sourceLabel={sourceLabel}
          onEditInSettings={onOpenMasterEdit}
        />
      );
    case "client":
      return (
        <ClientDrillView
          clientId={current.id}
          cabinetId={cabinetId}
          sourceLabel={sourceLabel}
          onOpenFullClient={onOpenClient}
        />
      );
    case "order":
      return (
        <OrderDrillView
          orderId={current.id}
          cabinetId={cabinetId}
          sourceLabel={sourceLabel}
          onOpenFullOrder={onOpenOrder}
        />
      );
    case "personal-order":
      return (
        <PersonalOrderDrillView
          orderId={current.id}
          cabinetId={cabinetId}
          sourceLabel={sourceLabel}
          onOpenFullOrders={onOpenPersonalOrders}
        />
      );
    case "subscription":
      return (
        <SubscriptionDrillView
          subscriptionId={current.id}
          cabinetId={cabinetId}
          sourceLabel={sourceLabel}
          onOpenFullSubscriptions={onOpenSubscriptions}
        />
      );
    case "loyalty-program":
      return (
        <LoyaltyProgramDrillView
          programId={current.id}
          cabinetId={cabinetId}
          sourceLabel={sourceLabel}
          onOpenFullLoyalty={onOpenLoyalty}
        />
      );
    case "personal-offer":
      return (
        <PersonalOfferDrillView
          offerId={current.id}
          cabinetId={cabinetId}
          sourceLabel={sourceLabel}
          onAccept={onOpenOffersTarget}
        />
      );
    default:
      return null;
  }
}
