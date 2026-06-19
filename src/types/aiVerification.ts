/**
 * AI Verification Types
 * Unified types for AI-assisted document verification cards
 */

// Card type
export type AICardType = "auto-filled" | "ai-verified";

// Extended statuses with user actions
export type AICardStatus = 
  | "approved"      // AI approved
  | "needs_review"  // AI has concerns
  | "pending"       // Awaiting verification
  | "accepted"      // User accepted
  | "dismissed";    // User dismissed

// Auto-fill data source
export type AutoFillSource = "ai" | "profile" | "contractor";

// Unified card data structure
export interface UnifiedAICardData {
  id: string;
  type: AICardType;
  
  // Common fields
  label: string;           // "Контрагент" or "п.1.1"
  value: string;           // Value or text preview
  status: AICardStatus;
  textRef?: string;        // For document highlighting
  
  // For auto-filled cards
  confidence?: number;     // 0-100
  source?: AutoFillSource;
  
  // For ai-verified cards
  aiComment?: string;
  suggestions?: string[];
  clauseRef?: string;
  
  // User action tracking
  userAction?: "accepted" | "dismissed";
  userComment?: string;
  actionTimestamp?: string;
  
  // Orphaned state - textRef no longer found in document
  isOrphaned?: boolean;
}

// Audit logging for compliance
export interface AIAuditEntry {
  cardId: string;
  action: "accepted" | "dismissed" | "edited";
  previousStatus: AICardStatus;
  newStatus: AICardStatus;
  userComment?: string;
  timestamp: string;
  userId?: string;
}

// Filter type for card strip
export type AICardFilterType = AICardType | "all";
