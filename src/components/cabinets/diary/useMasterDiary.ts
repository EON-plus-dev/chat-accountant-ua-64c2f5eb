/**
 * useMasterDiary — агрегує бронювання, заробіток та оренду для конкретного
 * `individual` кабінету майстра з усіх його активних делегацій.
 *
 * Джерела:
 *   - `salonMasterDelegations` — активні `delegation_contracts` для цього кабінету
 *   - `useMergedSalonBookings(salonCabinetId)` для кожного салону, де є делегація
 *
 * Phase 2 — лише read-only агрегація. Жодних мутацій (вони відбуваються в
 * салонному кабінеті власника, синхронізуються через `bookingsStore`).
 */

import { useMemo } from "react";
import { useMergedSalonBookings } from "@/components/cabinets/bookings/useMergedSalonBookings";
import { getDelegationsForMasterCabinet, type SalonMasterDelegationContract } from "@/config/demoCabinets/salonMasterDelegations";
import {
  salonMasters,
  salonServices,
  salonClients,
  salonWorkstations,
  type SalonBooking,
} from "@/config/demoCabinets/salonData";

export interface DiaryBooking extends SalonBooking {
  /** Делегаційний контракт, через який цей запис видно майстру. */
  contract: SalonMasterDelegationContract;
  /** Скільки реально заробить майстер з цього запису. */
  masterEarning: number;
  /** Скільки буде утримано на користь салону (комісія, оренда, тощо). */
  salonShare: number;
  /** Назва салону (для агрегованого view, де може бути кілька салонів). */
  salonName: string;
}

export interface RentDue {
  contractId: string;
  salonCabinetId: string;
  salonName: string;
  period: "shift" | "day" | "month";
  amount: number;
  /** Орієнтовний дедлайн (для demo — кінець поточного місяця). */
  dueDate: string;
}

/** Інвойс за оренду робочого місця за конкретний період. */
export interface RentInvoice {
  id: string;
  contractId: string;
  salonName: string;
  /** YYYY-MM для місячних, YYYY-MM-DD для денних/змінних. */
  periodKey: string;
  periodLabel: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: "paid" | "due" | "upcoming" | "overdue";
}

export interface MasterDiaryData {
  delegations: SalonMasterDelegationContract[];
  bookings: DiaryBooking[];
  todayBookings: DiaryBooking[];
  upcomingBookings: DiaryBooking[];
  last30DoneBookings: DiaryBooking[];
  earnings30: number;
  earningsPrev30: number;
  rentDue: RentDue[];
  rentInvoices: RentInvoice[];
}

const SALON_NAMES: Record<string, string> = {
  "demo-salon-3": "Beauty Lab",
};

function endOfMonth(d = new Date()): string {
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return e.toISOString().slice(0, 10);
}

/**
 * Hook — повертає всі дані для Щоденника майстра.
 * NB: `useMergedSalonBookings` ми викликаємо для КОЖНОГО салону, де є активна
 * делегація. Хук React-friendly якщо к-сть салонів стабільна (як у demo).
 * Для multi-salon майстра треба обернути у власний агрегатор з useEffect.
 */
export function useMasterDiary(masterCabinetId: string): MasterDiaryData {
  const delegations = useMemo(
    () => getDelegationsForMasterCabinet(masterCabinetId),
    [masterCabinetId],
  );

  // У demo всі делегації — в одному салоні. Якщо в майбутньому буде кілька —
  // це місце треба переробити (для кожного salonCabinetId окремий хук-виклик
  // через map порушує rules-of-hooks). Поки що — perfect для одного салону.
  const primarySalonId = delegations[0]?.salonCabinetId ?? "demo-salon-3";
  const allSalonBookings = useMergedSalonBookings(primarySalonId);

  return useMemo(() => {
    if (delegations.length === 0) {
      return {
        delegations,
        bookings: [],
        todayBookings: [],
        upcomingBookings: [],
        last30DoneBookings: [],
        earnings30: 0,
        earningsPrev30: 0,
        rentDue: [],
        rentInvoices: [],
      };
    }

    const masterIds = new Set(delegations.map((d) => d.masterId));
    const today = new Date().toISOString().slice(0, 10);
    const dShift = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString().slice(0, 10);
    };
    const start30 = dShift(30);
    const start60 = dShift(60);

    const bookings: DiaryBooking[] = allSalonBookings
      .filter((b) => masterIds.has(b.masterId))
      .map((b) => {
        const contract =
          delegations.find((d) => d.masterId === b.masterId) ?? delegations[0];
        // Заробіток: per-booking revenueOwner override → інакше з terms.
        let masterEarning = 0;
        let salonShare = 0;
        if (b.masterPayoutAmount != null) {
          masterEarning = b.masterPayoutAmount;
          salonShare = b.totalPrice - b.masterPayoutAmount;
        } else if (contract.terms.kind === "employment") {
          masterEarning = 0; // штатник отримує зарплату, не з чека
          salonShare = b.totalPrice;
        } else if (contract.terms.kind === "revenue_split") {
          masterEarning = Math.round(b.totalPrice * (contract.terms.commission_pct / 100));
          salonShare = b.totalPrice - masterEarning;
        } else if (contract.terms.kind === "workspace_rental") {
          masterEarning = b.totalPrice; // ФОП-майстер забирає всю суму, окремо платить оренду
          salonShare = 0;
        } else if (contract.terms.kind === "hybrid") {
          masterEarning = Math.round(b.totalPrice * (contract.terms.commission_pct / 100));
          salonShare = b.totalPrice - masterEarning;
        }
        return {
          ...b,
          contract,
          masterEarning,
          salonShare,
          salonName: SALON_NAMES[contract.salonCabinetId] ?? contract.salonCabinetId,
        };
      });

    const todayBookings = bookings
      .filter((b) => b.date === today && b.status !== "canceled")
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const upcomingBookings = bookings
      .filter(
        (b) =>
          b.date > today &&
          (b.status === "scheduled" || b.status === "confirmed"),
      )
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
      .slice(0, 30);

    const last30DoneBookings = bookings.filter(
      (b) => b.status === "done" && b.date >= start30,
    );
    const prev30DoneBookings = bookings.filter(
      (b) => b.status === "done" && b.date >= start60 && b.date < start30,
    );
    const earnings30 = last30DoneBookings.reduce((s, b) => s + b.masterEarning, 0);
    const earningsPrev30 = prev30DoneBookings.reduce((s, b) => s + b.masterEarning, 0);

    // Оренда — лише для контрактів з workspace_rental або hybrid
    const rentalContracts = delegations.filter(
      (d) => d.terms.kind === "workspace_rental" || d.terms.kind === "hybrid",
    );
    const rentDue: RentDue[] = rentalContracts.map((d) => {
      const t = d.terms as Extract<
        SalonMasterDelegationContract["terms"],
        { kind: "workspace_rental" | "hybrid" }
      >;
      return {
        contractId: d.id,
        salonCabinetId: d.salonCabinetId,
        salonName: SALON_NAMES[d.salonCabinetId] ?? d.salonCabinetId,
        period: t.rent_period,
        amount: t.rent_amount,
        dueDate: endOfMonth(),
      };
    });

    // Інвойси за оренду — 3 минулі місяці (paid) + поточний (due) + наступний (upcoming).
    // Для не-місячних періодів — спрощено агрегуємо як місячний еквівалент.
    const now = new Date();
    const monthKey = (y: number, m: number) =>
      `${y}-${String(m + 1).padStart(2, "0")}`;
    const monthLabel = (y: number, m: number) =>
      new Date(y, m, 1).toLocaleDateString("uk-UA", {
        month: "long",
        year: "numeric",
      });
    const monthlyEquivalent = (
      t: Extract<
        SalonMasterDelegationContract["terms"],
        { kind: "workspace_rental" | "hybrid" }
      >,
    ) => {
      if (t.rent_period === "month") return t.rent_amount;
      if (t.rent_period === "day") return t.rent_amount * 22;
      return t.rent_amount * 12; // shift ≈ 2-3/тижд → ~12/міс
    };

    const rentInvoices: RentInvoice[] = [];
    for (const d of rentalContracts) {
      const t = d.terms as Extract<
        SalonMasterDelegationContract["terms"],
        { kind: "workspace_rental" | "hybrid" }
      >;
      const amount = monthlyEquivalent(t);
      // -3, -2, -1, 0, +1
      for (let offset = -3; offset <= 1; offset++) {
        const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const y = ref.getFullYear();
        const m = ref.getMonth();
        const issued = new Date(y, m, 1).toISOString().slice(0, 10);
        const due = new Date(y, m + 1, 0).toISOString().slice(0, 10);
        const status: RentInvoice["status"] =
          offset < 0 ? "paid" : offset === 0 ? "due" : "upcoming";
        rentInvoices.push({
          id: `inv-rent-${d.id}-${monthKey(y, m)}`,
          contractId: d.id,
          salonName: SALON_NAMES[d.salonCabinetId] ?? d.salonCabinetId,
          periodKey: monthKey(y, m),
          periodLabel: monthLabel(y, m),
          amount,
          issuedDate: issued,
          dueDate: due,
          status,
        });
      }
    }
    rentInvoices.sort((a, b) => b.periodKey.localeCompare(a.periodKey));

    return {
      delegations,
      bookings,
      todayBookings,
      upcomingBookings,
      last30DoneBookings,
      earnings30,
      earningsPrev30,
      rentDue,
      rentInvoices,
    };
  }, [delegations, allSalonBookings]);
}

// ============================================
// Helpers для UI
// ============================================

export function getServiceName(serviceId: string): string {
  return salonServices.find((s) => s.id === serviceId)?.name ?? serviceId;
}

export function getServiceNames(ids: string[]): string {
  return ids.map(getServiceName).join(" · ");
}

export function getClientName(clientId: string): string {
  return salonClients.find((c) => c.id === clientId)?.fullName ?? "Клієнт";
}

export function getWorkstationName(id?: string): string {
  if (!id) return "";
  return salonWorkstations.find((w) => w.id === id)?.name ?? id;
}

export function getMasterFullName(masterId: string): string {
  return salonMasters.find((m) => m.id === masterId)?.fullName ?? masterId;
}
