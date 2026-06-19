/**
 * fromSequences — adapter: CRM sequence templates → ProcessTemplate.
 * Read-only обгортка для фази 0 міграції. Існуючі sequences продовжують
 * жити в `useCrmSequencesStore`; engine лише читає їх як уніфікований формат.
 */

import type { ProcessTemplate } from "../types";

/**
 * Placeholder — реальна імплементація читатиме `sequenceTemplates` з CRM module
 * і мапитиме на ProcessTemplate. Поки що повертає [].
 */
export function fromSequences(cabinetId: string): ProcessTemplate[] {
  // TODO Phase 1: import { sequenceTemplates } from "@/modules/crm/sequences/sequenceTemplates"
  // та мапити кожен на ProcessTemplate з kind="sequence", origin="sequence_adapter".
  return [];
}
