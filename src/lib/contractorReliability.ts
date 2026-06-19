// ============================================
// CONTRACTOR RELIABILITY CALCULATION
// ============================================

import type { Contractor } from "@/config/settingsConfig";
import type { ContractorPaymentRecord, HistoryEvent } from "@/config/contractorHistoryConfig";

export interface ReliabilityBreakdown {
  paymentTimeliness: number;    // 0-40 балів
  documentCompleteness: number; // 0-30 балів
  cooperationDuration: number;  // 0-20 балів
  operationVolume: number;      // 0-10 балів
}

export interface ReliabilityResult {
  score: number;
  breakdown: ReliabilityBreakdown;
  previousScore?: number;
  scoreHistory?: number[];
}

export interface PrimaryImpact {
  type: "success" | "warning" | "info";
  text: string;
}

/**
 * Get primary impact note for reliability score
 */
export function getPrimaryImpact(breakdown: ReliabilityBreakdown): PrimaryImpact {
  const factors = [
    { key: "paymentTimeliness", ratio: breakdown.paymentTimeliness / 40, label: "прострочені оплати" },
    { key: "documentCompleteness", ratio: breakdown.documentCompleteness / 30, label: "неповні документи" },
    { key: "cooperationDuration", ratio: breakdown.cooperationDuration / 20, label: "нетривала співпраця" },
    { key: "operationVolume", ratio: breakdown.operationVolume / 10, label: "малий обсяг операцій" },
  ];
  
  const weakest = factors.reduce((min, f) => f.ratio < min.ratio ? f : min);
  
  if (weakest.ratio >= 0.8) {
    return { type: "success", text: "Всі показники в нормі" };
  }
  if (weakest.ratio < 0.5) {
    return { type: "warning", text: `Головний фактор: ${weakest.label}` };
  }
  return { type: "info", text: `Можна покращити: ${weakest.label}` };
}

/**
 * Розрахунок надійності контрагента за 4 критеріями:
 * - Своєчасність оплат (40%)
 * - Повнота документів (30%)
 * - Тривалість співпраці (20%)
 * - Обсяг операцій (10%)
 */
export function calculateReliability(
  contractor: Contractor | undefined,
  documents: any[],
  payments: ContractorPaymentRecord[],
  history: HistoryEvent[]
): ReliabilityResult {
  if (!contractor) {
    return {
      score: 0,
      breakdown: {
        paymentTimeliness: 0,
        documentCompleteness: 0,
        cooperationDuration: 0,
        operationVolume: 0,
      },
    };
  }

  // 1. Своєчасність оплат (40 балів max)
  // Втрачаємо 8 балів за кожну прострочену/помилкову оплату
  const failedPayments = payments.filter(p => p.status === "failed").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const overdueDocuments = documents.filter(doc => {
    if (!doc.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(doc.dueDate);
    return dueDate < now && doc.status !== "paid" && doc.status !== "archived";
  }).length;
  
  const paymentPenalty = (failedPayments * 8) + (pendingPayments * 4) + (overdueDocuments * 5);
  const paymentTimeliness = Math.max(0, 40 - paymentPenalty);

  // 2. Повнота документів (30 балів max)
  // Втрачаємо бали за документи в статусі draft або без підпису
  const draftDocs = documents.filter(d => d.status === "draft").length;
  const unsignedDocs = documents.filter(d => d.status === "pending").length;
  const docPenalty = (draftDocs * 5) + (unsignedDocs * 2);
  const documentCompleteness = Math.max(0, 30 - docPenalty);

  // 3. Тривалість співпраці (20 балів max)
  // 2 бали за кожен місяць співпраці (до 20)
  const monthsActive = contractor.createdAt 
    ? calculateMonthsActive(contractor.createdAt)
    : 6; // default
  const cooperationDuration = Math.min(20, monthsActive * 2);

  // 4. Обсяг операцій (10 балів max)
  // Бонус за кількість документів та історію
  const totalOperations = documents.length + history.length;
  const operationVolume = Math.min(10, Math.floor(totalOperations / 3));

  // Бонуси
  let bonusPoints = 0;
  if (contractor.isEdrsVerified) bonusPoints += 3;
  if (contractor.isSynced) bonusPoints += 2;
  if (contractor.activeContractsCount && contractor.activeContractsCount > 0) bonusPoints += 2;

  const rawScore = paymentTimeliness + documentCompleteness + cooperationDuration + operationVolume + bonusPoints;
  const score = Math.max(0, Math.min(100, rawScore));

  // Імітація попереднього скоринга (для демо)
  const previousScore = score > 10 ? score + Math.floor(Math.random() * 10) - 5 : undefined;

  // Generate score history for sparkline (demo - simulating last 5 periods)
  const scoreHistory = [
    Math.max(0, Math.min(100, score - 15 + Math.floor(Math.random() * 5))),
    Math.max(0, Math.min(100, score - 10 + Math.floor(Math.random() * 5))),
    Math.max(0, Math.min(100, score - 5 + Math.floor(Math.random() * 5))),
    Math.max(0, Math.min(100, score - 2 + Math.floor(Math.random() * 3))),
    score
  ];

  return {
    score,
    breakdown: {
      paymentTimeliness,
      documentCompleteness,
      cooperationDuration,
      operationVolume,
    },
    previousScore: previousScore ? Math.max(0, Math.min(100, previousScore)) : undefined,
    scoreHistory,
  };
}

/**
 * Розрахунок кількості місяців з дати створення
 */
function calculateMonthsActive(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const months = (now.getFullYear() - created.getFullYear()) * 12 + 
                 (now.getMonth() - created.getMonth());
  return Math.max(1, months);
}

// ============================================
// CONTRACTOR STATS CALCULATION
// ============================================

export interface ContractorStats {
  totalAmount: number;
  paidAmount: number;
  balance: number;
  avgPaymentDays: number;
  overduePayments: number;
  reliabilityScore: number;
  lastPaymentDate?: string;
}

/**
 * Розрахунок статистики контрагента на основі документів
 */
export function calculateContractorStats(documents: any[], contractor?: Contractor): ContractorStats {
  const totalAmount = documents.reduce((sum, doc) => sum + (doc.amount || 0), 0);
  const paidAmount = documents.reduce((sum, doc) => sum + (doc.paidAmount || 0), 0);
  const balance = contractor?.balance ?? (paidAmount - totalAmount);
  
  // Calculate average payment days (demo logic)
  const paidDocs = documents.filter(doc => doc.status === "paid" || doc.paidAmount);
  const avgPaymentDays = paidDocs.length > 0 
    ? Math.round(paidDocs.reduce((sum, doc) => {
        const created = new Date(doc.date);
        const paid = doc.paidAmount ? new Date() : new Date(doc.updatedAt || doc.date);
        const days = Math.max(1, Math.ceil((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
        return sum + days;
      }, 0) / paidDocs.length)
    : 14;

  // Count overdue
  const now = new Date();
  const overduePayments = documents.filter(doc => 
    doc.dueDate && 
    new Date(doc.dueDate) < now && 
    doc.status !== "paid" && 
    doc.status !== "archived" &&
    doc.status !== "cancelled"
  ).length;

  // Calculate reliability score
  let reliabilityScore = 85;
  if (overduePayments > 0) reliabilityScore -= overduePayments * 10;
  if (avgPaymentDays > 30) reliabilityScore -= 10;
  if (avgPaymentDays > 45) reliabilityScore -= 10;
  if (documents.length > 10) reliabilityScore += 5;
  if (contractor?.isSynced) reliabilityScore += 5;
  reliabilityScore = Math.max(0, Math.min(100, reliabilityScore));

  // Find last payment
  const paidDocsWithDates = documents
    .filter(doc => doc.status === "paid")
    .sort((a, b) => new Date(b.updatedAt || b.date).getTime() - new Date(a.updatedAt || a.date).getTime());
  const lastPaymentDate = paidDocsWithDates[0]?.updatedAt || paidDocsWithDates[0]?.date;

  return {
    totalAmount,
    paidAmount,
    balance,
    avgPaymentDays,
    overduePayments,
    reliabilityScore,
    lastPaymentDate,
  };
}
