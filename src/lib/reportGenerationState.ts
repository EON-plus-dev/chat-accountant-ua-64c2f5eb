/**
 * Persistence layer for autonomous report generation state.
 * Stores state in localStorage to prevent duplicate generations between sessions.
 */

export interface GenerationState {
  lastCheck: string;
  generatedReportIds: string[];
  failedAttempts: Record<string, number>;
  lastGenerationTimestamp?: string;
}

const STORAGE_KEY_PREFIX = "report_generation_state_";

export function getGenerationState(cabinetId: string): GenerationState {
  try {
    const key = `${STORAGE_KEY_PREFIX}${cabinetId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to read generation state:", e);
  }
  
  return {
    lastCheck: new Date().toISOString(),
    generatedReportIds: [],
    failedAttempts: {},
  };
}

export function saveGenerationState(cabinetId: string, state: GenerationState): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${cabinetId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save generation state:", e);
  }
}

export function markReportAsGenerated(cabinetId: string, reportId: string): void {
  const state = getGenerationState(cabinetId);
  if (!state.generatedReportIds.includes(reportId)) {
    state.generatedReportIds.push(reportId);
    state.lastGenerationTimestamp = new Date().toISOString();
    saveGenerationState(cabinetId, state);
  }
}

export function isReportAlreadyGenerated(cabinetId: string, reportId: string): boolean {
  const state = getGenerationState(cabinetId);
  return state.generatedReportIds.includes(reportId);
}

export function markFailedAttempt(cabinetId: string, scheduleId: string): number {
  const state = getGenerationState(cabinetId);
  const currentAttempts = state.failedAttempts[scheduleId] || 0;
  state.failedAttempts[scheduleId] = currentAttempts + 1;
  saveGenerationState(cabinetId, state);
  return state.failedAttempts[scheduleId];
}

export function getFailedAttempts(cabinetId: string, scheduleId: string): number {
  const state = getGenerationState(cabinetId);
  return state.failedAttempts[scheduleId] || 0;
}

export function resetFailedAttempts(cabinetId: string, scheduleId: string): void {
  const state = getGenerationState(cabinetId);
  delete state.failedAttempts[scheduleId];
  saveGenerationState(cabinetId, state);
}

export function shouldAttemptGeneration(
  cabinetId: string, 
  scheduleId: string, 
  maxRetries: number = 3
): boolean {
  const attempts = getFailedAttempts(cabinetId, scheduleId);
  return attempts < maxRetries;
}

export function updateLastCheck(cabinetId: string): void {
  const state = getGenerationState(cabinetId);
  state.lastCheck = new Date().toISOString();
  saveGenerationState(cabinetId, state);
}

export function clearGenerationState(cabinetId: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${cabinetId}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Failed to clear generation state:", e);
  }
}
