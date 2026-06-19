// ============================================
// CONTRACTOR HISTORY CONFIGURATION (Demo Data)
// ============================================

export type HistoryEventType = 
  | "document_created" 
  | "document_signed"
  | "payment_received" 
  | "payment_sent"
  | "requisites_changed" 
  | "contract_signed" 
  | "contract_expired"
  | "reconciliation" 
  | "note_added"
  | "status_changed"
  | "contact_added";

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  date: string;
  title: string;
  description?: string;
  linkedDocumentId?: string;
  linkedDocumentNumber?: string;
  amount?: number;
  user?: string;
}

// Event type labels
export const historyEventTypeLabels: Record<HistoryEventType, string> = {
  document_created: "Документ створено",
  document_signed: "Документ підписано",
  payment_received: "Оплата отримана",
  payment_sent: "Оплата відправлена",
  requisites_changed: "Реквізити змінено",
  contract_signed: "Договір підписано",
  contract_expired: "Договір завершено",
  reconciliation: "Акт звірки",
  note_added: "Примітка додана",
  status_changed: "Статус змінено",
  contact_added: "Контакт додано",
};

// Event type icons (lucide icon names)
export const historyEventTypeIcons: Record<HistoryEventType, string> = {
  document_created: "FileText",
  document_signed: "FileCheck",
  payment_received: "ArrowDownLeft",
  payment_sent: "ArrowUpRight",
  requisites_changed: "Edit",
  contract_signed: "PenTool",
  contract_expired: "CalendarX",
  reconciliation: "Scale",
  note_added: "MessageSquare",
  status_changed: "RefreshCw",
  contact_added: "UserPlus",
};

// ============================================
// DETERMINISTIC DEMO DATA GENERATION
// ============================================

/** Simple hash from string to produce deterministic pseudo-random numbers */
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
};

/** Seeded pseudo-random number generator */
const seededRandom = (seed: number, index: number): number => {
  const x = Math.sin(seed + index * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

/** Generate a date in the past N days from now */
const dateInPast = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
};

const dateInPastSeeded = (seed: number, idx: number, maxDays: number): string => {
  const days = Math.floor(seededRandom(seed, idx) * maxDays);
  const hours = 9 + Math.floor(seededRandom(seed, idx + 100) * 8);
  const mins = Math.floor(seededRandom(seed, idx + 200) * 60);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, mins, 0, 0);
  return d.toISOString();
};

const users = ["Коваленко М.В.", "Петренко О.І.", "Система (авто)", "Адміністратор", "Система (ЕДО)"];
const banks = ["Monobank", "ПриватБанк", "ПУМБ", "Ощадбанк", "А-Банк"];

const pickFromArray = <T,>(arr: T[], seed: number, idx: number): T => {
  return arr[Math.floor(seededRandom(seed, idx) * arr.length)];
};

const generateAmount = (seed: number, idx: number): number => {
  const base = [5000, 8000, 10000, 12000, 15000, 18000, 20000, 25000, 30000, 35000, 42000, 50000];
  return pickFromArray(base, seed, idx);
};

// ============================================
// HISTORY GENERATION
// ============================================

const generateHistoryForContractor = (contractorId: string): HistoryEvent[] => {
  const seed = hashCode(contractorId);
  const eventCount = 6 + Math.floor(seededRandom(seed, 0) * 5); // 6-10 events
  const events: HistoryEvent[] = [];
  
  // Determine if this contractor is a supplier (outgoing payments) or client (incoming)
  const isSupplier = seededRandom(seed, 999) > 0.5;
  
  let eventIdx = 0;

  // Always: contract signed (oldest event)
  events.push({
    id: `${contractorId}-h${eventIdx}`,
    type: "contract_signed",
    date: dateInPastSeeded(seed, eventIdx, 180),
    title: "Підписано договір",
    description: isSupplier ? "Договір на постачання товарів/послуг" : "Договір на надання послуг",
    linkedDocumentId: `doc-contract-${contractorId}`,
    linkedDocumentNumber: `ДОГ-2024-${String(seed % 100).padStart(3, "0")}`,
    user: pickFromArray(users, seed, eventIdx + 50),
  });
  eventIdx++;

  // Contact added
  events.push({
    id: `${contractorId}-h${eventIdx}`,
    type: "contact_added",
    date: dateInPastSeeded(seed, eventIdx, 160),
    title: "Додано контактну особу",
    description: pickFromArray(
      ["Іваненко Олена — Менеджер", "Сидоренко Андрій — Бухгалтер", "Ткаченко Марія — Директор", "Бондар Ігор — Логіст"],
      seed, eventIdx
    ),
    user: "Адміністратор",
  });
  eventIdx++;

  // Generate payment + document pairs
  const paymentCount = 2 + Math.floor(seededRandom(seed, 10) * 3); // 2-4 payments
  for (let p = 0; p < paymentCount && eventIdx < eventCount; p++) {
    const amount = generateAmount(seed, p);
    const docNum = `РАХ-2024-${String(seed % 100 + p).padStart(3, "0")}`;
    const docId = `doc-${contractorId}-${p}`;
    
    // Document created
    events.push({
      id: `${contractorId}-h${eventIdx}`,
      type: "document_created",
      date: dateInPastSeeded(seed, eventIdx, 120),
      title: isSupplier ? "Отримано рахунок" : "Створено рахунок",
      description: `Рахунок на ${isSupplier ? "постачання" : "послуги"}`,
      linkedDocumentId: docId,
      linkedDocumentNumber: docNum,
      amount,
      user: pickFromArray(users, seed, eventIdx + 50),
    });
    eventIdx++;

    // Payment
    if (eventIdx < eventCount) {
      events.push({
        id: `${contractorId}-h${eventIdx}`,
        type: isSupplier ? "payment_sent" : "payment_received",
        date: dateInPastSeeded(seed, eventIdx, 90),
        title: isSupplier ? "Оплату відправлено" : "Отримано оплату",
        description: `Оплата за рахунок ${docNum}`,
        linkedDocumentId: docId,
        linkedDocumentNumber: docNum,
        amount,
        user: "Система (авто)",
      });
      eventIdx++;
    }
  }

  // Reconciliation (sometimes)
  if (seededRandom(seed, 77) > 0.4 && eventIdx < eventCount) {
    events.push({
      id: `${contractorId}-h${eventIdx}`,
      type: "reconciliation",
      date: dateInPastSeeded(seed, eventIdx, 60),
      title: "Підписано акт звірки",
      description: "Розбіжностей не виявлено",
      linkedDocumentId: `doc-reconciliation-${contractorId}`,
      linkedDocumentNumber: `АКТ-ЗВІРКИ-2024-Q4`,
      user: pickFromArray(users, seed, eventIdx + 50),
    });
    eventIdx++;
  }

  // Requisites changed (sometimes)
  if (seededRandom(seed, 88) > 0.5 && eventIdx < eventCount) {
    events.push({
      id: `${contractorId}-h${eventIdx}`,
      type: "requisites_changed",
      date: dateInPastSeeded(seed, eventIdx, 45),
      title: "Оновлено реквізити",
      description: pickFromArray(["Змінено IBAN рахунку", "Оновлено юридичну адресу", "Змінено назву"], seed, eventIdx),
      user: "Контрагент (ЕДО)",
    });
    eventIdx++;
  }

  // Note (sometimes)
  if (seededRandom(seed, 55) > 0.5 && eventIdx < eventCount) {
    events.push({
      id: `${contractorId}-h${eventIdx}`,
      type: "note_added",
      date: dateInPastSeeded(seed, eventIdx, 20),
      title: "Додано примітку",
      description: pickFromArray(
        ["VIP-клієнт, пріоритетна обробка", "Потребує акт звірки", "Надійний партнер", "Узгодити знижку на наступний квартал"],
        seed, eventIdx
      ),
      user: pickFromArray(users, seed, eventIdx + 50),
    });
    eventIdx++;
  }

  // Sort by date descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return events;
};

// Get contractor history (demo data)
export const getContractorHistory = (contractorId: string): HistoryEvent[] => {
  return generateHistoryForContractor(contractorId);
};

// ============================================
// PAYMENTS
// ============================================

export interface ContractorPaymentRecord {
  id: string;
  date: string;
  amount: number;
  direction: "incoming" | "outgoing";
  status: "completed" | "pending" | "failed";
  linkedDocumentId?: string;
  linkedDocumentNumber?: string;
  bankName?: string;
  paymentPurpose?: string;
}

const generatePaymentsForContractor = (contractorId: string): ContractorPaymentRecord[] => {
  const seed = hashCode(contractorId);
  const isSupplier = seededRandom(seed, 999) > 0.5;
  const paymentCount = 3 + Math.floor(seededRandom(seed, 20) * 3); // 3-5 payments
  const payments: ContractorPaymentRecord[] = [];

  for (let i = 0; i < paymentCount; i++) {
    const amount = generateAmount(seed, i + 30);
    const docNum = isSupplier
      ? `АКТ-2024-${String(seed % 100 + i).padStart(3, "0")}`
      : `РАХ-2024-${String(seed % 100 + i).padStart(3, "0")}`;
    const docId = `doc-${contractorId}-${i}`;
    const status: ContractorPaymentRecord["status"] = 
      seededRandom(seed, i + 40) > 0.85 ? "pending" : "completed";

    payments.push({
      id: `${contractorId}-p${i}`,
      date: dateInPastSeeded(seed, i + 30, 120),
      amount,
      direction: isSupplier ? "outgoing" : "incoming",
      status,
      linkedDocumentId: docId,
      linkedDocumentNumber: docNum,
      bankName: pickFromArray(banks, seed, i + 60),
      paymentPurpose: isSupplier
        ? `Оплата за ${pickFromArray(["послуги", "товари", "матеріали", "комплектуючі"], seed, i + 70)}`
        : `Оплата за ${pickFromArray(["IT-послуги", "консультації", "розробку", "підтримку"], seed, i + 70)}`,
    });
  }

  // Sort by date descending
  payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return payments;
};

// Get contractor payments (demo data)
export const getContractorPayments = (contractorId: string): ContractorPaymentRecord[] => {
  return generatePaymentsForContractor(contractorId);
};
