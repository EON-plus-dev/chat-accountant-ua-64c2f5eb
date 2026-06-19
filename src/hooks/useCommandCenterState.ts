/**
 * useCommandCenterState — Unified state management for AI Command Center
 * 
 * Merges:
 * - Task completion state (from OverviewTasksBlock)
 * - Risk HITL state (from OverviewRisksBlock)
 * 
 * Persists to localStorage with document-specific keys.
 */

import { useState, useEffect, useCallback, useMemo } from "react";

interface CommandCenterState {
  completedTasks: Set<string>;
  confirmedRisks: Set<string>;
  disputedRisks: Set<string>;
  acceptedSuggestions: Set<string>;  // NEW: Track accepted AI suggestions
}

interface UseCommandCenterStateResult {
  // State
  completedTasks: Set<string>;
  confirmedRisks: Set<string>;
  disputedRisks: Set<string>;
  acceptedSuggestions: Set<string>;
  
  // Actions
  completeTask: (taskId: string) => void;
  confirmRisk: (riskId: string) => void;
  disputeRisk: (riskId: string) => void;
  acceptSuggestion: (riskId: string) => void;
  resetAll: () => void;
  
  // Helpers
  isTaskCompleted: (taskId: string) => boolean;
  isRiskConfirmed: (riskId: string) => boolean;
  isRiskDisputed: (riskId: string) => boolean;
  isSuggestionAccepted: (riskId: string) => boolean;
  getItemStatus: (id: string, type: "task" | "risk") => "pending" | "completed" | "confirmed" | "disputed";
}

export const useCommandCenterState = (documentId?: string): UseCommandCenterStateResult => {
  // Storage keys
  const tasksKey = documentId ? `doc-tasks-${documentId}` : null;
  const risksKey = documentId ? `doc-risks-hitl-${documentId}` : null;
  
  // Initialize state from localStorage
  const [state, setState] = useState<CommandCenterState>(() => {
    const initial: CommandCenterState = {
      completedTasks: new Set(),
      confirmedRisks: new Set(),
      disputedRisks: new Set(),
      acceptedSuggestions: new Set(),
    };
    
    if (typeof window === 'undefined') return initial;
    
    try {
      // Load completed tasks
      if (tasksKey) {
        const savedTasks = localStorage.getItem(tasksKey);
        if (savedTasks) {
          initial.completedTasks = new Set(JSON.parse(savedTasks));
        }
      }
      
      // Load HITL state
      if (risksKey) {
        const savedRisks = localStorage.getItem(risksKey);
        if (savedRisks) {
          const parsed = JSON.parse(savedRisks);
          initial.confirmedRisks = new Set(parsed.confirmed || []);
          initial.disputedRisks = new Set(parsed.disputed || []);
          initial.acceptedSuggestions = new Set(parsed.acceptedSuggestions || []);
        }
      }
    } catch {
      // Ignore parse errors
    }
    
    return initial;
  });
  
  // Persist tasks to localStorage
  useEffect(() => {
    if (tasksKey && state.completedTasks.size > 0) {
      try {
        localStorage.setItem(tasksKey, JSON.stringify([...state.completedTasks]));
      } catch {
        // Ignore storage errors
      }
    }
  }, [tasksKey, state.completedTasks]);
  
  // Persist HITL state to localStorage
  useEffect(() => {
    if (risksKey && (state.confirmedRisks.size > 0 || state.disputedRisks.size > 0 || state.acceptedSuggestions.size > 0)) {
      try {
        localStorage.setItem(risksKey, JSON.stringify({
          confirmed: [...state.confirmedRisks],
          disputed: [...state.disputedRisks],
          acceptedSuggestions: [...state.acceptedSuggestions],
        }));
      } catch {
        // Ignore storage errors
      }
    }
  }, [risksKey, state.confirmedRisks, state.disputedRisks, state.acceptedSuggestions]);
  
  // Actions
  const completeTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      completedTasks: new Set([...prev.completedTasks, taskId]),
    }));
  }, []);
  
  const confirmRisk = useCallback((riskId: string) => {
    setState(prev => ({
      ...prev,
      confirmedRisks: new Set([...prev.confirmedRisks, riskId]),
      // Remove from disputed if was previously disputed
      disputedRisks: new Set([...prev.disputedRisks].filter(id => id !== riskId)),
    }));
  }, []);
  
  const disputeRisk = useCallback((riskId: string) => {
    setState(prev => ({
      ...prev,
      disputedRisks: new Set([...prev.disputedRisks, riskId]),
      // Remove from confirmed if was previously confirmed
      confirmedRisks: new Set([...prev.confirmedRisks].filter(id => id !== riskId)),
    }));
  }, []);
  
  const acceptSuggestion = useCallback((riskId: string) => {
    setState(prev => ({
      ...prev,
      acceptedSuggestions: new Set([...prev.acceptedSuggestions, riskId]),
      // Also confirm the risk when suggestion is accepted
      confirmedRisks: new Set([...prev.confirmedRisks, riskId]),
    }));
  }, []);
  
  const resetAll = useCallback(() => {
    setState({
      completedTasks: new Set(),
      confirmedRisks: new Set(),
      disputedRisks: new Set(),
      acceptedSuggestions: new Set(),
    });
    
    // Clear localStorage
    if (tasksKey) localStorage.removeItem(tasksKey);
    if (risksKey) localStorage.removeItem(risksKey);
  }, [tasksKey, risksKey]);
  
  // Helpers
  const isTaskCompleted = useCallback((taskId: string) => 
    state.completedTasks.has(taskId), [state.completedTasks]);
    
  const isRiskConfirmed = useCallback((riskId: string) => 
    state.confirmedRisks.has(riskId), [state.confirmedRisks]);
    
  const isRiskDisputed = useCallback((riskId: string) => 
    state.disputedRisks.has(riskId), [state.disputedRisks]);
  
  const isSuggestionAccepted = useCallback((riskId: string) => 
    state.acceptedSuggestions.has(riskId), [state.acceptedSuggestions]);
  
  const getItemStatus = useCallback((id: string, type: "task" | "risk") => {
    if (type === "task") {
      return state.completedTasks.has(id) ? "completed" : "pending";
    }
    if (state.confirmedRisks.has(id)) return "confirmed";
    if (state.disputedRisks.has(id)) return "disputed";
    return "pending";
  }, [state]);
  
  return {
    completedTasks: state.completedTasks,
    confirmedRisks: state.confirmedRisks,
    disputedRisks: state.disputedRisks,
    acceptedSuggestions: state.acceptedSuggestions,
    completeTask,
    confirmRisk,
    disputeRisk,
    acceptSuggestion,
    resetAll,
    isTaskCompleted,
    isRiskConfirmed,
    isRiskDisputed,
    isSuggestionAccepted,
    getItemStatus,
  };
};
