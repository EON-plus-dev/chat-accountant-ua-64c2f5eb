/**
 * BookingEditorSheet — operational hub бронювання.
 *
 * Modes:
 *  - `view` (booking is passed): статус-toolbar (Confirm/Check-in/Done/No-show/Cancel),
 *    редагування notes/internalNote/tip/discount/payment, видалення.
 *  - `create` (booking=null + isNew=true): повна форма (клієнт → послуги → майстер → дата+час).
 *
 * Усі мутації проходять через `bookingsStore` (localStorage + події).
 * AttentionInbox: при cancel/no-show опційно пропонуємо додати у waitlist.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import {
  CheckCircle2,
  Circle,
  LogIn,
  XCircle,
  Ban,
  Receipt,
  Banknote,
  CreditCard,
  ArrowDownToLine,
  Trash2,
  Copy,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Sparkles,
  Clock,
  CalendarX,
  Wand2,
} from "lucide-react";
import type {
  SalonBooking,
  SalonMaster,
  SalonService,
  SalonClient,
  SalonWorkstation,
  BookingStatus,
  BookingPaymentMethod,
  BookingSource,
} from "@/config/demoCabinets/salonData";
import {
  createBooking,
  updateBooking,
  deleteBooking,
  addToWaitlist,
} from "./bookingsStore";
import {
  computeAvailability,
  groupSlotsByDate,
} from "@/lib/publicBooking/computeAvailability";
import type { AvailableSlot } from "@/lib/publicBooking/types";
import { checkPlacement } from "./conflicts";
import { useMergedSalonBookings } from "./useMergedSalonBookings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  cabinetId: string;
  /** Якщо передано — view/edit, інакше — create */
  booking: SalonBooking | null;
  masters: SalonMaster[];
  services: SalonService[];
  clients: SalonClient[];
  workstations: SalonWorkstation[];
  /** Дефолти для create-режиму */
  defaults?: Partial<Pick<SalonBooking, "date" | "startTime" | "masterId" | "workstationId">>;
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  scheduled: "Заплановано",
  confirmed: "Підтверджено",
  done: "Виконано",
  "no-show": "Не прийшов",
  canceled: "Скасовано",
};

const STATUS_CHIP: Record<BookingStatus, string> = {
  scheduled: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  done: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  "no-show": "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  canceled: "bg-muted text-muted-foreground border-border",
};

const PAYMENT_LABEL: Record<BookingPaymentMethod, string> = {
  cash: "Готівка (ПРРО)",
  card: "Картка (ПРРО)",
  transfer: "Переказ на IBAN",
};

const SOURCE_LABEL: Record<BookingSource, string> = {
  "walk-in": "Без запису",
  phone: "Телефонний дзвінок",
  admin: "Адміністратор",
  wizard: "Онлайн-форма",
  "ai-chat": "AI-чат",
  "ai-call": "AI-голос",
  rebook: "Повторний запис",
};

function recalcTotals(serviceIds: string[], services: SalonService[], master?: SalonMaster) {
  const chosen = serviceIds
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is SalonService => !!s);
  const totalPrice = chosen.reduce((s, x) => s + x.price, 0);
  const durationMin = chosen.reduce((s, x) => s + x.durationMin, 0) || 30;
  const pct = master?.commissionPct ?? chosen[0]?.defaultCommissionPct ?? 40;
  const commissionAmount = Math.round((totalPrice * pct) / 100);
  return { totalPrice, durationMin, commissionAmount };
}

function todayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

function defaultStartTime() {
  const d = new Date();
  const h = Math.max(9, Math.min(20, d.getHours()));
  const m = d.getMinutes() < 30 ? "30" : "00";
  const hh = m === "00" ? h + 1 : h;
  return `${String(hh).padStart(2, "0")}:${m}`;
}

const TIME_OPTIONS = Array.from({ length: (21 - 9) * 2 }, (_, i) => {
  const h = 9 + Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function addMinutesToTime(hhmm: string, minutes: number): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const ANY_MASTER = "__any__";

function nowHHmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface PartOfDayBuckets {
  morning: AvailableSlot[];
  day: AvailableSlot[];
  evening: AvailableSlot[];
}

function bucketByPartOfDay(slots: AvailableSlot[]): PartOfDayBuckets {
  const b: PartOfDayBuckets = { morning: [], day: [], evening: [] };
  for (const s of slots) {
    const h = Number(s.startTime.slice(0, 2));
    if (h < 12) b.morning.push(s);
    else if (h < 17) b.day.push(s);
    else b.evening.push(s);
  }
  return b;
}

export function BookingEditorSheet({
  open,
  onClose,
  cabinetId,
  booking,
  masters,
  services,
  clients,
  workstations,
  defaults,
}: Props) {
  const isNew = !booking;
  const [date, setDate] = useState(booking?.date ?? defaults?.date ?? todayIso());
  const [startTime, setStartTime] = useState(
    booking?.startTime ?? defaults?.startTime ?? (isNew ? "" : defaultStartTime()),
  );
  const [masterId, setMasterId] = useState(
    booking?.masterId ?? defaults?.masterId ?? (isNew ? ANY_MASTER : masters[0]?.id ?? ""),
  );
  const [workstationId, setWorkstationId] = useState(
    booking?.workstationId ?? defaults?.workstationId ?? (isNew ? "" : workstations[0]?.id ?? ""),
  );
  const [serviceIds, setServiceIds] = useState<string[]>(booking?.serviceIds ?? []);
  const [clientId, setClientId] = useState(booking?.clientId ?? "");
  const [clientSearch, setClientSearch] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [internalNote, setInternalNote] = useState(booking?.internalNote ?? "");
  const [tipAmount, setTipAmount] = useState<number>(booking?.tipAmount ?? 0);
  const [discountAmount, setDiscountAmount] = useState<number>(booking?.discountAmount ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod | undefined>(
    booking?.paymentMethod,
  );
  const [source, setSource] = useState<BookingSource>(booking?.source ?? "admin");
  // Create-mode UX state
  const [advancedTime, setAdvancedTime] = useState(false);
  const [wsTouched, setWsTouched] = useState(false);
  const [showWsPicker, setShowWsPicker] = useState(false);
  const [expandedSuggestionDays, setExpandedSuggestionDays] = useState<Record<string, boolean>>({});


  // Conflict-confirmation dialog
  const [conflictDialog, setConflictDialog] = useState<{
    master: boolean;
    workstation: boolean;
    payload: SalonBooking;
    finalClientId: string;
  } | null>(null);

  // All bookings (для перевірки конфліктів). Hook → стабільно реактивний.
  const mergedBookings = useMergedSalonBookings(cabinetId);


  // reset when booking changes
  useEffect(() => {
    if (!open) return;
    const startingFresh = !booking;
    setDate(booking?.date ?? defaults?.date ?? todayIso());
    setStartTime(
      booking?.startTime ?? defaults?.startTime ?? (startingFresh ? "" : defaultStartTime()),
    );
    setMasterId(
      booking?.masterId ?? defaults?.masterId ?? (startingFresh ? ANY_MASTER : masters[0]?.id ?? ""),
    );
    setWorkstationId(
      booking?.workstationId ?? defaults?.workstationId ?? (startingFresh ? "" : workstations[0]?.id ?? ""),
    );
    setServiceIds(booking?.serviceIds ?? []);
    setClientId(booking?.clientId ?? "");
    setClientSearch("");
    setNewClientName("");
    setNewClientPhone("");
    setNotes(booking?.notes ?? "");
    setInternalNote(booking?.internalNote ?? "");
    setTipAmount(booking?.tipAmount ?? 0);
    setDiscountAmount(booking?.discountAmount ?? 0);
    setPaymentMethod(booking?.paymentMethod);
    setSource(booking?.source ?? "admin");
    setAdvancedTime(false);
    setWsTouched(false);
    setConflictDialog(null);
  }, [booking, open, defaults?.date, defaults?.startTime, defaults?.masterId, defaults?.workstationId, masters, workstations]);

  // ============================ Availability ============================
  const isAnyMaster = masterId === ANY_MASTER;
  const todayStr = todayIso();
  const currentHHmm = nowHHmm();

  const daySlots = useMemo<AvailableSlot[]>(() => {
    if (!isNew || serviceIds.length === 0 || !masterId || !date) return [];
    if (date < todayStr) return [];
    try {
      const fromDate = new Date(`${date}T00:00:00`);
      const all = computeAvailability({
        cabinetId,
        serviceIds,
        masterId: isAnyMaster ? undefined : masterId,
        fromDate,
        daysAhead: 0,
        minLeadHours: 0,
      });
      let filtered = all.filter((s) => s.date === date);
      // Сьогодні — не показуємо вже минулі слоти
      if (date === todayStr) {
        filtered = filtered.filter((s) => s.startTime >= currentHHmm);
      }
      // «Будь-який» — дедуп за startTime: лишаємо один слот на час (перший майстер).
      if (isAnyMaster) {
        const seen = new Map<string, AvailableSlot>();
        for (const s of filtered) if (!seen.has(s.startTime)) seen.set(s.startTime, s);
        return [...seen.values()].sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
      return filtered;
    } catch {
      return [];
    }
  }, [isNew, cabinetId, serviceIds, masterId, isAnyMaster, date, todayStr, currentHHmm]);

  // Кількість майстрів, доступних на кожен час (для chip‑підпису у «Будь-який»)
  const anyMasterCountByTime = useMemo<Record<string, number>>(() => {
    if (!isNew || !isAnyMaster || serviceIds.length === 0 || !date || date < todayStr) return {};
    try {
      const fromDate = new Date(`${date}T00:00:00`);
      const all = computeAvailability({
        cabinetId,
        serviceIds,
        masterId: undefined,
        fromDate,
        daysAhead: 0,
        minLeadHours: 0,
      });
      const counts: Record<string, Set<string>> = {};
      for (const s of all) {
        if (s.date !== date) continue;
        if (date === todayStr && s.startTime < currentHHmm) continue;
        (counts[s.startTime] ||= new Set()).add(s.masterId);
      }
      return Object.fromEntries(Object.entries(counts).map(([t, set]) => [t, set.size]));
    } catch {
      return {};
    }
  }, [isNew, isAnyMaster, cabinetId, serviceIds, date, todayStr, currentHHmm]);

  const nextDaysSuggestions = useMemo<Array<{ date: string; slots: AvailableSlot[] }>>(() => {
    if (!isNew || serviceIds.length === 0 || !masterId || daySlots.length > 0) return [];
    try {
      const fromDate = new Date(`${date}T00:00:00`);
      fromDate.setDate(fromDate.getDate() + 1);
      const all = computeAvailability({
        cabinetId,
        serviceIds,
        masterId: isAnyMaster ? undefined : masterId,
        fromDate,
        daysAhead: 7,
        minLeadHours: 0,
      });
      const grouped = groupSlotsByDate(all);
      return Object.keys(grouped)
        .sort()
        .slice(0, 3)
        .map((d) => ({ date: d, slots: grouped[d] }));
    } catch {
      return [];
    }
  }, [isNew, cabinetId, serviceIds, masterId, isAnyMaster, date, daySlots.length]);


  // Reset startTime when key inputs change so a stale time doesn't survive
  useEffect(() => {
    if (!isNew || advancedTime) return;
    if (!startTime) return;
    const stillValid = daySlots.some((s) => s.startTime === startTime);
    if (!stillValid) setStartTime("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daySlots]);

  // Auto-pick workstation from selected slot (unless user explicitly chose one)
  useEffect(() => {
    if (!isNew || advancedTime || wsTouched) return;
    const slot = daySlots.find((s) => s.startTime === startTime);
    if (slot && slot.workstationId !== workstationId) {
      setWorkstationId(slot.workstationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, daySlots]);

  // #3 — При зміні майстра видалити послуги, які він не виконує
  useEffect(() => {
    if (!isNew || isAnyMaster || !masterId) return;
    const m = masters.find((x) => x.id === masterId);
    if (!m) return;
    setServiceIds((cur) => {
      const allowed = cur.filter((id) => {
        const svc = services.find((s) => s.id === id);
        return svc ? m.specialties.includes(svc.category) : false;
      });
      if (allowed.length !== cur.length) {
        const dropped = cur
          .filter((id) => !allowed.includes(id))
          .map((id) => services.find((s) => s.id === id)?.name)
          .filter(Boolean);
        if (dropped.length > 0) {
          toast({
            title: "Послуги видалено",
            description: `${dropped.join(", ")} — обраний майстер їх не виконує.`,
          });
        }
      }
      return allowed;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterId]);


  // ============================ Derived ============================
  const master = masters.find((m) => m.id === masterId);
  const workstation = workstations.find((w) => w.id === workstationId);
  const client = clients.find((c) => c.id === clientId);
  const chosenServices = serviceIds
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is SalonService => !!s);
  const totals = useMemo(
    () => recalcTotals(serviceIds, services, master),
    [serviceIds, services, master],
  );

  // Категорії, необхідні для виконання обраних послуг
  const requiredCategories = useMemo(
    () =>
      Array.from(
        new Set(
          serviceIds
            .map((id) => services.find((s) => s.id === id)?.category)
            .filter(Boolean) as string[],
        ),
      ),
    [serviceIds, services],
  );

  // Майстри, що вміють ВСІ обрані категорії (AND)
  const eligibleMasters = useMemo(() => {
    if (requiredCategories.length === 0) return masters;
    return masters.filter((m) =>
      requiredCategories.every((c) => (m.specialties as string[]).includes(c)),
    );

  }, [masters, requiredCategories]);

  // Авто-скид майстра, якщо він більше не підходить під обрані послуги
  useEffect(() => {
    if (!isNew) return;
    if (!masterId || masterId === ANY_MASTER) return;
    if (requiredCategories.length === 0) return;
    if (eligibleMasters.some((m) => m.id === masterId)) return;
    setMasterId(ANY_MASTER);
    toast({
      title: "Майстра скинуто",
      description: "Поточний майстер не виконує обрану послугу — обрано «Будь-який вільний».",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredCategories.join("|"), eligibleMasters.length]);



  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients.slice(0, 6);
    const q = clientSearch.toLowerCase();
    return clients
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) || c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")),
      )
      .slice(0, 8);
  }, [clientSearch, clients]);

  // Допустимі робочі місця: kind має приймати хоч одну з обраних категорій
  const allowedWorkstations = useMemo(() => {
    const cats = new Set(chosenServices.map((s) => s.category));
    if (cats.size === 0) return workstations;
    return workstations.filter((w) =>
      [...cats].some((c) => w.allowedCategories.includes(c)),
    );
  }, [chosenServices, workstations]);

  const wsAllowedIds = useMemo(() => new Set(allowedWorkstations.map((w) => w.id)), [allowedWorkstations]);
  const wsOutOfScope = !!workstationId && !wsAllowedIds.has(workstationId);

  const needsManualWorkstation = isNew && advancedTime && allowedWorkstations.length > 1;

  // Авто-fill робочого місця: якщо поточне не в допустимих або порожнє — взяти перше сумісне
  useEffect(() => {
    if (!isNew) return;
    if (wsTouched) return;
    if (workstationId && wsAllowedIds.has(workstationId)) return;
    setWorkstationId(allowedWorkstations[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedWorkstations]);


  // ============================ Validation ============================
  const errors: string[] = [];
  if (serviceIds.length === 0) errors.push("Оберіть хоча б одну послугу");
  if (!masterId || masterId === ANY_MASTER) errors.push("Оберіть майстра або клікніть на вільний слот");
  if (!startTime) errors.push("Оберіть час початку");
  if (!workstationId && allowedWorkstations.length === 0 && serviceIds.length > 0)
    errors.push("Немає сумісного робочого місця для обраних послуг");

  if (isNew && date < todayStr) errors.push("Дата не може бути в минулому");
  if (!clientId && !(newClientName.trim() && newClientPhone.trim()))
    errors.push("Оберіть клієнта або заповніть нового");
  const canSave = errors.length === 0;

  // ============================ Actions ============================
  const persist = (payload: SalonBooking) => {
    if (isNew) {
      createBooking(cabinetId, payload);
      toast({ title: "Запис створено", description: `${date} · ${startTime} · ${master?.fullName ?? ""}` });
    } else {
      updateBooking(cabinetId, payload.id, payload);
      toast({ title: "Запис оновлено" });
    }
    onClose();
  };

  const handleSave = () => {
    if (!canSave) return;
    let finalClientId = clientId;
    if (!finalClientId) {
      finalClientId = `new-${Date.now()}`;
      toast({
        title: "Новий клієнт",
        description: `${newClientName.trim()} (${newClientPhone.trim()}) — буде додано у CRM при першому збереженні картки клієнта.`,
      });
    }
    const payload: SalonBooking = {
      id: booking?.id ?? `bk-${Date.now()}`,
      date,
      startTime,
      durationMin: totals.durationMin,
      clientId: finalClientId,
      masterId,
      workstationId,
      serviceIds,
      totalPrice: totals.totalPrice - discountAmount,
      commissionAmount: totals.commissionAmount,
      status: booking?.status ?? "scheduled",
      paymentMethod,
      prroCheckId: booking?.prroCheckId,
      notes: notes.trim() || undefined,
      relatedIncomeRecordId: booking?.relatedIncomeRecordId,
      relatedCommissionPaymentId: booking?.relatedCommissionPaymentId,
      source,
      tipAmount: tipAmount > 0 ? tipAmount : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      internalNote: internalNote.trim() || undefined,
      confirmedAt: booking?.confirmedAt,
      checkedInAt: booking?.checkedInAt,
      completedAt: booking?.completedAt,
      canceledAt: booking?.canceledAt,
    };

    // #6 — Перевірка конфліктів: коли час не належить вільному вікну, або редагується існуючий запис
    const timeIsManual =
      isNew && !!startTime && daySlots.length > 0 && !daySlots.some((s) => s.startTime === startTime);
    const needsCheck =
      timeIsManual ||
      (isNew && daySlots.length === 0 && !!startTime) ||
      (!isNew &&
        booking &&
        (booking.startTime !== startTime ||
          booking.date !== date ||
          booking.masterId !== masterId ||
          booking.workstationId !== workstationId ||
          booking.durationMin !== totals.durationMin));


    if (needsCheck) {
      const placement = checkPlacement({
        bookings: mergedBookings,
        excludeId: booking?.id,
        date,
        startTime,
        durationMin: totals.durationMin,
        masterId,
        workstationId,
      });
      if (placement.master || placement.workstation) {
        setConflictDialog({ ...placement, payload, finalClientId });
        return;
      }
    }
    persist(payload);
  };


  const handleStatusChange = (next: BookingStatus) => {
    if (!booking) return;
    const stamp = new Date().toISOString();
    const patch: Partial<SalonBooking> = { status: next };
    if (next === "confirmed") patch.confirmedAt = stamp;
    if (next === "done") patch.completedAt = stamp;
    if (next === "canceled") patch.canceledAt = stamp;
    if (next === "no-show") patch.canceledAt = stamp;
    updateBooking(cabinetId, booking.id, patch);
    toast({ title: STATUS_LABEL[next], description: `Запис #${booking.id}` });

    // No-show / cancel → пропозиція waitlist
    if ((next === "no-show" || next === "canceled") && booking) {
      const wlClient = clients.find((c) => c.id === booking.clientId);
      addToWaitlist(cabinetId, {
        id: `wl-${Date.now()}`,
        clientName: wlClient?.fullName ?? "Без імені",
        clientPhone: wlClient?.phone ?? "",
        serviceIds: booking.serviceIds,
        preferredMasterId: booking.masterId,
        fromDate: booking.date,
        toDate: booking.date,
        priority: "high",
        createdAt: stamp,
        status: "open",
        note: `Слот ${booking.startTime} звільнився — ${next === "no-show" ? "no-show" : "скасування"}.`,
      });
    }
    onClose();
  };

  const handleCheckIn = () => {
    if (!booking) return;
    updateBooking(cabinetId, booking.id, { checkedInAt: new Date().toISOString(), status: "confirmed" });
    toast({ title: "Клієнт прийшов", description: "Чек-ін зафіксовано." });
  };

  const handleDelete = () => {
    if (!booking) return;
    deleteBooking(cabinetId, booking.id);
    toast({ title: "Запис видалено" });
    onClose();
  };

  const handleDuplicate = () => {
    if (!booking) return;
    const dup: SalonBooking = {
      ...booking,
      id: `bk-${Date.now()}`,
      status: "scheduled",
      confirmedAt: undefined,
      checkedInAt: undefined,
      completedAt: undefined,
      canceledAt: undefined,
      paymentMethod: undefined,
      prroCheckId: undefined,
      relatedIncomeRecordId: undefined,
      relatedCommissionPaymentId: undefined,
    };
    createBooking(cabinetId, dup);
    toast({ title: "Запис продубльовано", description: "Відредагуйте час нової копії." });
    onClose();
  };

  // ============================ Render ============================
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            {isNew ? "Новий запис" : `Бронювання #${booking?.id}`}
            {booking && (
              <Badge variant="outline" size="sm" className={cn("text-[10px] border", STATUS_CHIP[booking.status])}>
                {STATUS_LABEL[booking.status]}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {isNew
              ? "Створіть запис: послуги, майстер, час, клієнт."
              : "Керування статусом, оплатою та нотатками."}
          </SheetDescription>
        </SheetHeader>

        {/* Status toolbar (тільки view) */}
        {booking && (
          <div className="px-5 py-3 border-b bg-muted/20">
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBtn
                  icon={CheckCircle2}
                  label="Підтвердити"
                  active={booking.status === "confirmed"}
                  disabled={booking.status === "done" || booking.status === "canceled"}
                  onClick={() => handleStatusChange("confirmed")}
                />
                <StatusBtn
                  icon={LogIn}
                  label="Чек-ін"
                  active={!!booking.checkedInAt}
                  disabled={booking.status === "done" || booking.status === "canceled"}
                  onClick={handleCheckIn}
                />
                <StatusBtn
                  icon={Sparkles}
                  label="Виконано"
                  active={booking.status === "done"}
                  disabled={booking.status === "canceled"}
                  onClick={() => handleStatusChange("done")}
                />
                <StatusBtn
                  icon={XCircle}
                  label="Не прийшов"
                  active={booking.status === "no-show"}
                  disabled={booking.status === "done"}
                  variant="rose"
                  onClick={() => handleStatusChange("no-show")}
                />
                <StatusBtn
                  icon={Ban}
                  label="Скасувати"
                  active={booking.status === "canceled"}
                  disabled={booking.status === "done"}
                  variant="muted"
                  onClick={() => handleStatusChange("canceled")}
                />
              </div>
            </TooltipProvider>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-5">
            {/* === Послуги (вище за час у create-режимі) === */}
            {isNew && (
              <>
                <section className="space-y-2">
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center justify-between">
                    <span>Послуги ({serviceIds.length})</span>
                    <span className="tabular-nums text-foreground">{formatCurrency(totals.totalPrice)}</span>
                  </h3>
                  <div className="border rounded-md max-h-56 overflow-auto divide-y">
                    {services
                      .filter((s) => !master || master.specialties.includes(s.category))
                      .map((s) => {
                        const checked = serviceIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              setServiceIds((cur) =>
                                cur.includes(s.id) ? cur.filter((x) => x !== s.id) : [...cur, s.id],
                              )
                            }
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm transition text-left",
                              checked ? "bg-primary/10" : "hover:bg-muted/40",
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center flex-none",
                                checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40",
                              )}
                            >
                              {checked && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{s.name}</div>
                              <div className="text-[10px] text-muted-foreground">{s.durationMin} хв</div>
                            </div>
                            <div className="tabular-nums text-xs">{formatCurrency(s.price)}</div>
                          </button>
                        );
                      })}
                  </div>
                </section>
                <Separator />
              </>
            )}

            {/* === Дата + час + майстер === */}
            <section className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Час і виконавець
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">

                <div>
                  <Label className="text-[11px] flex items-center justify-between">
                    <span>Майстер</span>
                    {isNew && requiredCategories.length > 0 && (
                      <span className="text-[10px] font-normal text-muted-foreground tabular-nums">
                        {eligibleMasters.length} з {masters.length}
                      </span>
                    )}
                  </Label>
                  <Select value={masterId} onValueChange={setMasterId}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Оберіть" />
                    </SelectTrigger>
                    <SelectContent>
                      {isNew && (
                        <SelectItem value={ANY_MASTER} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-muted-foreground" />
                            Будь-який вільний
                          </div>
                        </SelectItem>
                      )}
                      {isNew && eligibleMasters.length === 0 && requiredCategories.length > 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          Немає майстра, що виконує всі обрані послуги
                        </div>
                      ) : (
                        (isNew ? eligibleMasters : masters).map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-sm">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: m.color }}
                              />
                              {m.fullName}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px]">Дата</Label>
                  <Input
                    type="date"
                    value={date}
                    min={isNew ? todayStr : undefined}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-[11px]">Час початку</Label>
                  <Input
                    type="time"
                    step={300}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-9 text-sm tabular-nums"
                  />
                  {isNew && startTime && daySlots.length > 0 && !daySlots.some((s) => s.startTime === startTime) && (
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Поза вільними вікнами — перевіримо конфлікти
                    </div>
                  )}
                </div>
              </div>


              {/* Slot picker — допоміжний підбір вільних вікон (тільки для нового запису) */}
              {isNew && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Вільні вікна
                    {totals.durationMin > 0 && serviceIds.length > 0 && (
                      <span className="text-muted-foreground font-normal">
                        · потрібно {totals.durationMin} хв поспіль
                        {isAnyMaster && " · усі майстри"}
                      </span>
                    )}
                  </Label>
                  {serviceIds.length === 0 ? (
                    <div className="border rounded-md p-3 text-[12px] text-muted-foreground flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5" />
                      Оберіть послуги — підкажемо вільні вікна. Час уже можна вписати вручну вгорі.
                    </div>
                  ) : daySlots.length > 0 ? (
                    (() => {
                      const renderChip = (slot: AvailableSlot) => {
                        const active = slot.startTime === startTime;
                        const cnt = isAnyMaster ? anyMasterCountByTime[slot.startTime] ?? 1 : 0;
                        return (
                          <button
                            key={`${slot.startTime}-${slot.workstationId}`}
                            type="button"
                            onClick={() => {
                              setStartTime(slot.startTime);
                              if (isAnyMaster) {
                                setMasterId(slot.masterId);
                                setWorkstationId(slot.workstationId);
                                setWsTouched(false);
                              }
                            }}
                            className={cn(
                              "h-8 px-2 rounded-md border text-xs tabular-nums transition flex items-center gap-1",
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted/40",
                            )}
                          >
                            <span className="font-medium">{slot.startTime}</span>
                            <span className={cn("text-[10px]", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                              → {slot.endTime}
                            </span>
                            {isAnyMaster && cnt > 1 && (
                              <span className={cn("text-[10px] ml-0.5", active ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                · {cnt}👤
                              </span>
                            )}
                          </button>
                        );
                      };
                      if (daySlots.length <= 8) {
                        return <div className="flex flex-wrap gap-1.5">{daySlots.map(renderChip)}</div>;
                      }
                      const buckets = bucketByPartOfDay(daySlots);
                      const groups: Array<[string, AvailableSlot[]]> = [
                        ["Ранок · 09–12", buckets.morning],
                        ["День · 12–17", buckets.day],
                        ["Вечір · 17–21", buckets.evening],
                      ];
                      return (
                        <div className="space-y-2">
                          {groups.map(([label, arr]) =>
                            arr.length === 0 ? null : (
                              <div key={label} className="space-y-1">
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                  {label} <span className="normal-case">({arr.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">{arr.map(renderChip)}</div>
                              </div>
                            ),
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="border border-dashed rounded-md p-3 space-y-2">
                      <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                        <CalendarX className="w-3.5 h-3.5" />
                        На цю дату вільних вікон {isAnyMaster ? "у жодного майстра" : "у майстра"} немає. Можна вписати час вручну.
                      </div>
                      {nextDaysSuggestions.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Найближчі вільні дати ·{" "}
                            <span className="normal-case text-muted-foreground/80">
                              натисніть, щоб перенести запис
                            </span>
                          </div>
                          {nextDaysSuggestions.map(({ date: d, slots }) => {
                            const expanded = !!expandedSuggestionDays[d];
                            const visible = expanded ? slots : slots.slice(0, 6);
                            const remaining = slots.length - visible.length;
                            const label = new Intl.DateTimeFormat("uk-UA", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                            }).format(new Date(`${d}T00:00:00`));
                            return (
                              <div key={d} className="space-y-1">
                                <div className="text-[11px] font-medium">
                                  {label}
                                  <span className="text-muted-foreground font-normal">
                                    {" "}· {slots.length} {slots.length === 1 ? "вікно" : slots.length < 5 ? "вікна" : "вікон"}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {visible.map((slot) => (
                                    <button
                                      key={`${d}-${slot.startTime}-${slot.workstationId}`}
                                      type="button"
                                      onClick={() => {
                                        setDate(d);
                                        setStartTime(slot.startTime);
                                        if (isAnyMaster) {
                                          setMasterId(slot.masterId);
                                          setWorkstationId(slot.workstationId);
                                          setWsTouched(false);
                                        }
                                      }}
                                      className="h-7 px-2 rounded-md border text-xs hover:bg-muted/40 tabular-nums"
                                    >
                                      {slot.startTime}
                                    </button>
                                  ))}
                                  {remaining > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedSuggestionDays((cur) => ({ ...cur, [d]: true }))
                                      }
                                      className="h-7 px-2 rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted/40"
                                    >
                                      +{remaining} ще
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )}


              <div className="grid grid-cols-1">
                {(() => {
                  // Edge: жодного сумісного робочого місця
                  if (isNew && serviceIds.length > 0 && allowedWorkstations.length === 0) {
                    return (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Немає сумісного робочого місця для обраних послуг
                      </div>
                    );
                  }

                  const expanded = !isNew || needsManualWorkstation || showWsPicker;

                  if (!expanded && workstation) {
                    return (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>
                          Робоче місце:{" "}
                          <span className="text-foreground">{workstation.name}</span>
                        </span>
                        {allowedWorkstations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setShowWsPicker(true)}
                            className="text-primary hover:underline underline-offset-2"
                          >
                            Змінити
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div>
                      <Label className="text-[11px]">Робоче місце</Label>
                      <Select
                        value={workstationId}
                        onValueChange={(v) => {
                          setWorkstationId(v);
                          setWsTouched(true);
                        }}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Оберіть" />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedWorkstations.map((w) => (
                            <SelectItem key={w.id} value={w.id} className="text-sm">
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {wsOutOfScope && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Це робоче місце не підтримує всі обрані послуги.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>



              <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  Тривалість: <strong className="text-foreground">{totals.durationMin} хв</strong>
                </span>
                {startTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Закінчення: <strong className="text-foreground tabular-nums">{addMinutesToTime(startTime, totals.durationMin)}</strong>
                  </span>
                )}
              </div>
            </section>

            {/* === Послуги (у view-режимі — на старому місці) === */}
            {!isNew && (
              <>
                <Separator />
                <section className="space-y-2">
                  <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center justify-between">
                    <span>Послуги ({serviceIds.length})</span>
                    <span className="tabular-nums text-foreground">{formatCurrency(totals.totalPrice)}</span>
                  </h3>
                  <div className="border rounded-md max-h-56 overflow-auto divide-y">
                    {services
                      .filter((s) => !master || master.specialties.includes(s.category))
                      .map((s) => {
                        const checked = serviceIds.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              setServiceIds((cur) =>
                                cur.includes(s.id) ? cur.filter((x) => x !== s.id) : [...cur, s.id],
                              )
                            }
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 text-sm transition text-left",
                              checked ? "bg-primary/10" : "hover:bg-muted/40",
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center flex-none",
                                checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40",
                              )}
                            >
                              {checked && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{s.name}</div>
                              <div className="text-[10px] text-muted-foreground">{s.durationMin} хв</div>
                            </div>
                            <div className="tabular-nums text-xs">{formatCurrency(s.price)}</div>
                          </button>
                        );
                      })}
                  </div>
                </section>
              </>
            )}

            <Separator />

            {/* === Клієнт === */}
            <section className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Клієнт
              </h3>
              {client ? (
                <div className="border rounded-md p-3 space-y-1 bg-muted/20">
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    {client.fullName}
                    {client.isVip && (
                      <Badge variant="outline" size="sm" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-400">
                        VIP
                      </Badge>
                    )}
                  </div>
                  <div className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {client.phone}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Загалом візитів: {client.totalVisits}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setClientId("")}>
                    Змінити
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Пошук за ім'ям або телефоном"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="h-9 text-sm"
                  />
                  {filteredClients.length > 0 && (
                    <div className="border rounded-md divide-y max-h-40 overflow-auto">
                      {filteredClients.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setClientId(c.id);
                            setClientSearch("");
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-muted/40 text-sm text-left"
                        >
                          <span className="truncate">{c.fullName}</span>
                          <span className="text-[11px] text-muted-foreground">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="text-[11px] text-muted-foreground mb-1">Або новий клієнт:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Ім'я"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="h-9 text-sm"
                      />
                      <Input
                        placeholder="+380…"
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </section>

            <Separator />

            {/* === Оплата + чайові + знижка (видимо завжди, критично для done) === */}
            <section className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" /> Оплата
                {booking?.status === "done" && (
                  <Badge variant="outline" size="sm" className="ml-1 text-[10px]">
                    Чек-аут
                  </Badge>
                )}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <PaymentChip
                  active={paymentMethod === "cash"}
                  icon={Banknote}
                  label="Готівка"
                  onClick={() => setPaymentMethod("cash")}
                />
                <PaymentChip
                  active={paymentMethod === "card"}
                  icon={CreditCard}
                  label="Картка"
                  onClick={() => setPaymentMethod("card")}
                />
                <PaymentChip
                  active={paymentMethod === "transfer"}
                  icon={ArrowDownToLine}
                  label="Переказ"
                  onClick={() => setPaymentMethod("transfer")}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px]">Знижка ₴</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discountAmount || ""}
                    onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                    className="h-9 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Чайові ₴</Label>
                  <Input
                    type="number"
                    min={0}
                    value={tipAmount || ""}
                    onChange={(e) => setTipAmount(Number(e.target.value) || 0)}
                    className="h-9 text-sm tabular-nums"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">До сплати</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatCurrency(Math.max(0, totals.totalPrice - discountAmount) + tipAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Винагорода майстру ({master?.commissionPct ?? 0}%)</span>
                <span className="tabular-nums">{formatCurrency(totals.commissionAmount)}</span>
              </div>
              {booking?.prroCheckId && (
                <div className="text-[11px] text-muted-foreground">Чек ПРРО: {booking.prroCheckId}</div>
              )}
            </section>

            <Separator />

            {/* === Нотатки === */}
            <section className="space-y-2">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                Нотатки
              </h3>
              <div>
                <Label className="text-[11px]">Для клієнта (видно у нагадуванні)</Label>
                <Textarea
                  rows={2}
                  placeholder="Напр.: візьміть змінне взуття"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-[11px]">Внутрішня (тільки команда)</Label>
                <Textarea
                  rows={2}
                  placeholder="Алергія, побажання, історія…"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-[11px]">Джерело</Label>
                <Select value={source} onValueChange={(v) => setSource(v as BookingSource)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SOURCE_LABEL) as BookingSource[]).map((s) => (
                      <SelectItem key={s} value={s} className="text-sm">
                        {SOURCE_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Помилки */}
            {errors.length > 0 && (
              <div className="border border-rose-500/30 bg-rose-500/5 rounded-md p-3 text-[12px] text-rose-700 dark:text-rose-400 space-y-0.5">
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Виправте перед збереженням:
                </div>
                {errors.map((e) => (
                  <div key={e}>· {e}</div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-5 py-3 flex items-center justify-between gap-2 bg-background">
          <div className="flex items-center gap-1.5">
            {booking && (
              <>
                <Button variant="ghost" size="sm" onClick={handleDuplicate}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Дублювати
                </Button>
                <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700" onClick={handleDelete}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Видалити
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={onClose}>
              Скасувати
            </Button>
            <Button size="sm" disabled={!canSave} onClick={handleSave}>
              {isNew ? "Створити" : "Зберегти"}
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Конфлікт перед збереженням */}
      <AlertDialog open={!!conflictDialog} onOpenChange={(o) => !o && setConflictDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Конфлікт бронювання
            </AlertDialogTitle>
            <AlertDialogDescription>
              {conflictDialog?.master && (
                <div>· Майстер уже зайнятий в цей час іншим записом.</div>
              )}
              {conflictDialog?.workstation && (
                <div>· Робоче місце вже зайняте в цей час.</div>
              )}
              <div className="mt-2 text-foreground">
                {date} · {startTime}
                {startTime && totals.durationMin > 0 && ` – ${addMinutesToTime(startTime, totals.durationMin)}`}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (conflictDialog) persist(conflictDialog.payload);
                setConflictDialog(null);
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Все одно зберегти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

// ============================================================================
// Subcomponents
// ============================================================================

function StatusBtn({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
  variant = "default",
}: {
  icon: typeof Circle;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  variant?: "default" | "rose" | "muted";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "h-8 text-[11px] gap-1",
            !active && variant === "rose" && "hover:border-rose-500/40 hover:text-rose-700",
            !active && variant === "muted" && "text-muted-foreground",
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function PaymentChip({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Banknote;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 h-9 rounded-md border text-xs transition",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background hover:bg-muted/40",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
