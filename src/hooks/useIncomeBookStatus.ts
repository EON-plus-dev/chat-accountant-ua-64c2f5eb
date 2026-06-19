import { useMemo } from 'react';
import { demoIncomeRecords } from '@/config/incomeBookConfig';
import type { CabinetType } from '@/types/cabinet';
import type { IncomeBookStatus } from '@/components/cabinets/document-flow/cards/intelligence/types';

// FOP Group 3 limit for 2025 (1167 minimum wages * 8294 UAH)
const FOP_YEARLY_LIMIT_2025 = 9_672_900; // UAH

// Helper to get quarter label
const getQuarterLabel = (date: string): string => {
  const d = new Date(date);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
};

/**
 * Hook to get Income Book status for a document
 * Shows linkage with Income Book for FOP cabinets
 */
export const useIncomeBookStatus = (
  documentId: string, 
  cabinetType?: CabinetType
): IncomeBookStatus => {
  return useMemo(() => {
    // Only applicable for FOP cabinets
    if (cabinetType !== 'fop') {
      // For TOV, just return tax period
      if (cabinetType === 'tov' && documentId) {
        return { 
          isLinked: false, 
          includedInLimit: false,
          taxPeriod: getQuarterLabel(new Date().toISOString()),
        };
      }
      return { isLinked: false, includedInLimit: false };
    }
    
    // Find linked record in Income Book by documentFlowId
    const linkedRecord = demoIncomeRecords.find(
      r => r.documentFlowId === documentId
    );
    
    if (!linkedRecord) {
      return { isLinked: false, includedInLimit: false };
    }
    
    // Calculate limit impact
    const year = linkedRecord.date.slice(0, 4);
    const yearRecords = demoIncomeRecords.filter(
      r => r.date.startsWith(year) && r.status === 'income'
    );
    const currentTotal = yearRecords.reduce((sum, r) => sum + r.inIncomeBook, 0);
    
    return {
      isLinked: true,
      linkedRecord: {
        id: linkedRecord.id,
        date: linkedRecord.date,
        amount: linkedRecord.inIncomeBook,
      },
      taxPeriod: getQuarterLabel(linkedRecord.date),
      includedInLimit: linkedRecord.status === 'income',
      limitImpact: linkedRecord.status === 'income' ? {
        amount: linkedRecord.inIncomeBook,
        percentOfLimit: (linkedRecord.inIncomeBook / FOP_YEARLY_LIMIT_2025) * 100,
        currentTotal,
        yearlyLimit: FOP_YEARLY_LIMIT_2025,
      } : undefined,
    };
  }, [documentId, cabinetType]);
};
