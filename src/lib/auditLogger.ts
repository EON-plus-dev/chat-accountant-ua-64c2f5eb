// Audit Logger Service for AI Actions
// Logs all AI analysis events and user actions for legal compliance

import { supabase } from "@/integrations/supabase/client";
import { DEMO_CURRENT_USER_ID } from "@/config/businessStatusConfig";

export type AuditEventType = 
  // AI Analysis Events
  | 'ai_document_analyzed'
  | 'ai_risk_calculated'
  | 'ai_field_extracted'
  | 'ai_suggestion_shown'
  | 'ai_explanation_requested'
  // User Actions on AI Results
  | 'ai_field_corrected'
  | 'ai_suggestion_accepted'
  | 'ai_suggestion_rejected'
  // Document Chat Events
  | 'document_chat_command'
  | 'document_chat_response'
  // Income Book Events
  | 'income_book_linked'
  | 'income_book_unlinked';

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  documentId?: string;
  userId: string;
  metadata: Record<string, any>;
  // For legal compliance
  userAgent?: string;
}

class AuditLoggerService {
  private buffer: AuditEvent[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isProduction: boolean = false;
  
  constructor() {
    // Only enable periodic flush in production
    this.isProduction = import.meta.env.PROD;
    
    if (this.isProduction) {
      this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
    }
  }
  
  log(eventType: AuditEventType, metadata: Record<string, any>, documentId?: string) {
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType,
      documentId,
      userId: this.getCurrentUserId(),
      metadata,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
    
    this.buffer.push(event);
    
    // Console log in development
    if (!this.isProduction) {
      console.log('[Audit]', eventType, metadata);
    }
    
    // Immediate flush for critical events
    if (this.isCriticalEvent(eventType)) {
      this.flush();
    }
  }
  
  private isCriticalEvent(type: AuditEventType): boolean {
    return ['ai_field_corrected', 'ai_suggestion_accepted', 'ai_suggestion_rejected'].includes(type);
  }
  
  private async flush() {
    if (this.buffer.length === 0) return;
    
    const events = [...this.buffer];
    this.buffer = [];
    
    // Only send to backend in production
    if (this.isProduction) {
      try {
        await supabase.functions.invoke('audit-log', { body: { events } });
      } catch (error) {
        console.error('Audit log flush failed:', error);
        // Re-add to buffer for retry (max 100 events)
        this.buffer = [...events, ...this.buffer].slice(0, 100);
      }
    }
  }
  
  private getCurrentUserId(): string {
    // Try to get from auth, fallback to demo user
    return DEMO_CURRENT_USER_ID;
  }
  
  // Cleanup on unmount
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Singleton instance
export const auditLogger = new AuditLoggerService();

// Helper hooks for common audit events
export const useAuditLog = () => {
  return {
    logAIAnalysis: (documentId: string, result: {
      confidence?: number;
      fieldsExtracted?: number;
      hasWarnings?: boolean;
    }) => auditLogger.log('ai_document_analyzed', result, documentId),
    
    logRiskCalculation: (documentId: string, riskResult: {
      score: number;
      level: string;
      factors: string[];
    }) => auditLogger.log('ai_risk_calculated', riskResult, documentId),
    
    logFieldCorrection: (documentId: string, fieldName: string, oldValue: string, newValue: string) =>
      auditLogger.log('ai_field_corrected', { fieldName, oldValue, newValue }, documentId),
    
    logSuggestionAccepted: (documentId: string, suggestionType: string, details?: any) =>
      auditLogger.log('ai_suggestion_accepted', { suggestionType, details }, documentId),
    
    logSuggestionRejected: (documentId: string, suggestionType: string, reason?: string) =>
      auditLogger.log('ai_suggestion_rejected', { suggestionType, reason }, documentId),
    
    logIncomeBookLinked: (documentId: string, recordId: string) =>
      auditLogger.log('income_book_linked', { recordId }, documentId),
  };
};
