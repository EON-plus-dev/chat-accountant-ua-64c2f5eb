import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, Bot, User, Plus, Mic, FileUp, Camera, Sparkles, Calendar, Building2, SkipForward } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { uk } from "date-fns/locale";
import UnifiedCommandPalette from "./UnifiedCommandPalette";
import QuickPromptsRow from "./QuickPromptsRow";
import { getContextualPrompts } from "@/config/chatPromptsConfig";
import { 
  formatPaymentChatResponse, 
  explainTaxAmount,
  getPaymentUrgency,
} from "@/lib/paymentAI";
import { getTaxPaymentsForCabinet } from "@/config/paymentsConfig";
import type { Cabinet } from "@/types/cabinet";
import type { TabType } from "./WorkspacePanel";
import type { TodaySnapshotResult } from "@/hooks/useTodaySnapshot";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildAnalyticsContext } from "@/lib/analytics/analyticsContextBuilder";
import { toast } from "@/hooks/use-toast";
import { plans } from "@/config/pricingData";
import { parseDocumentIntent, hasDocumentCreationIntent } from "@/lib/documentIntentParser";
import type { DocumentType } from "@/config/documentFlowConfig";
import { AddExpenseSheet } from "@/components/cabinets/expenses";
import AiEventProposalCard, { parseCalendarProposal } from "./AiEventProposalCard";
import type {
  AnalyticsToolCall,
  ApplyFiltersArgs,
  AskClarificationArgs,
  ProposeActionArgs,
} from "@/lib/analytics/aiToolSchemas";
import { analyticsControlsRegistry } from "@/lib/analytics/analyticsControlsRegistry";
import { ClarificationChips } from "@/components/cabinets/analytics/chat/ClarificationChips";
import { ActionCard } from "@/components/cabinets/analytics/chat/ActionCard";
import { executeProposedAction } from "@/lib/analytics/actionExecutor";
import { executeNetworkTool, NETWORK_TOOL_NAMES } from "@/modules/network";
import { supabase } from "@/integrations/supabase/client";

// Helper: Get user needs from localStorage
const getUserNeeds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('user_needs') || '[]');
  } catch {
    return [];
  }
};

// Helper: Determine recommended plan based on needs
const getRecommendedPlan = (needs: string[]): 'start' | 'smart' | 'premium' => {
  if (needs.includes('payroll')) return 'premium';
  if (needs.includes('analytics') || needs.length >= 3) return 'smart';
  if (needs.includes('taxes')) return 'smart';
  return needs.length === 0 ? 'smart' : 'start';
};

// Helper: Convert need IDs to Ukrainian labels
const needsLabels: Record<string, string> = {
  documents: "Документи",
  taxes: "Податки",
  payroll: "Зарплата",
  analytics: "Аналітика",
};

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  quickActions?: { label: string; action: string }[];
  // Conversational BI: tool_call payloads
  clarification?: AskClarificationArgs;
  actions?: ProposeActionArgs[];
  actionStates?: Record<number, "pending" | "confirmed" | "dismissed">;
  appliedFilters?: ApplyFiltersArgs;
}

export type OnboardingStep = 
  | "welcome" 
  | "role" 
  | "business-name" 
  | "company-legal" 
  | "tax-system" 
  | "complete";

export interface TemplateTestState {
  enabled: boolean;
  fields: { key: string; label: string; source: string }[];
  currentFieldIndex: number;
  filledFields: Record<string, string>;
  editingFieldKey?: string; // Currently editing field key
}

// Document context for proactive messages
export interface DocumentContextForChat {
  documentId: string;
  documentType: string;
  documentNumber?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  parties?: Array<{ 
    name: string; 
    code?: string; 
    validationStatus?: 'valid' | 'pending' | 'warning' | 'error';
  }>;
  summary?: string;
  // Document control callbacks for chat orchestration
  navigateToTab?: (tabId: 'overview' | 'document' | 'integration' | 'history') => void;
  scrollToSection?: (sectionId: string) => void;
  enableDiscrepancyMode?: () => void;
  // Document data for AI responses
  aiSummary?: string;
  keyRisks?: Array<{ title: string; severity: string }>;
  accountingStatus?: string;
  hasLinkedDocuments?: boolean;
}

interface ChatOrchestratorProps {
  fullScreen?: boolean;
  onOnboardingComplete?: () => void;
  onOnboardingStep?: (step: OnboardingStep, data?: Record<string, string>) => void;
  onTabChange?: (tab: TabType) => void;
  onChatCommand?: (command: string) => void;
  // Controlled input for mobile unified footer
  externalInputValue?: string;
  onExternalInputChange?: (value: string) => void;
  sendTrigger?: number; // Increment to trigger send
  activeCabinet?: Cabinet | null;
  analyticsSnapshot?: TodaySnapshotResult | null;
  activeTab?: TabType;
  // Template test mode
  templateTestState?: TemplateTestState | null;
  onTemplateFieldUpdate?: (key: string, value: string) => void;
  onEditFieldRequest?: string | null; // Request to edit specific field from preview
  // Payment orchestration
  onOpenPaymentApproval?: (taxType: string) => void;
  // Document context for proactive AI messages
  documentContext?: DocumentContextForChat | null;
  // AI-driven document creation (Phase 1: Chat → Template integration)
  onNavigateToAddDocument?: (context: {
    method: "create" | "upload";
    relation: "new" | "linked";
    skipToStep: "template";
    initialType?: DocumentType;
    aiSuggestedTags?: string[];
    contractorHint?: string;
    subjectHint?: string;
  }) => void;
}

const ChatOrchestrator = ({ 
  fullScreen = false, 
  onOnboardingComplete, 
  onOnboardingStep, 
  onTabChange, 
  onChatCommand,
  externalInputValue,
  onExternalInputChange,
  sendTrigger = 0,
  activeCabinet,
  analyticsSnapshot,
  activeTab,
  templateTestState,
  onTemplateFieldUpdate,
  onEditFieldRequest,
  onOpenPaymentApproval,
  documentContext,
  onNavigateToAddDocument,
}: ChatOrchestratorProps) => {
  const isControlled = externalInputValue !== undefined;
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const isOnboardingDone = localStorage.getItem('onboarding_complete') === 'true';
  
  const [messages, setMessages] = useState<Message[]>(() => {
    if (isOnboardingDone) {
      return [{
        id: "1",
        role: "assistant",
        content: "Привіт! Чим можу допомогти сьогодні?",
        timestamp: new Date(),
        quickActions: [
          { label: "Показати аналітику", action: "show_analytics" },
          { label: "Створити рахунок", action: "create_invoice" },
          { label: "Додати витрату", action: "add_expense" },
        ],
      }];
    }
    return [
      {
        id: "1",
        role: "assistant",
        content: "Привіт! Я твій AI-Бухгалтер. Допоможу налаштувати облік і потім вести документи, доходи/витрати та звіти через цей чат.",
        timestamp: new Date(),
      },
      {
        id: "2",
        role: "assistant",
        content: "Спочатку давай трохи налаштуємо твій кабінет. Хто ти?",
        timestamp: new Date(),
        quickActions: [
          { label: "Я ФОП", action: "fop" },
          { label: "Я власник / директор ТОВ", action: "tov" },
          { label: "Я бухгалтер / аутсорс", action: "accountant" },
        ],
      },
    ];
  });
  const [inputValue, setInputValue] = useState("");
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(isOnboardingDone ? "complete" : "welcome");
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<Record<string, string>>({});
  const [commandOpen, setCommandOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCabinetRef = useRef<Cabinet | null | undefined>(undefined);
  const prevDocContextRef = useRef<string | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // AI Cabinet Chat — streaming handler
  const callCabinetAI = useCallback(async (userInput: string) => {
    if (!activeCabinet || !analyticsSnapshot) return;

    const analyticsCtx = buildAnalyticsContext(analyticsSnapshot, activeCabinet);

    // Build conversation history (last 10 messages)
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // Add current user message
    history.push({ role: "user", content: userInput });

    setIsTyping(true);

    try {
      abortControllerRef.current = new AbortController();
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const FN_URL = `https://${projectId}.supabase.co/functions/v1/cabinet-chat`;

      // Try to use the user's access token (some endpoints need it for RBAC)
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token ?? anonKey;
      const baseHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        apikey: anonKey,
      };

      // ─── PHASE 1: ANALYST (router) ───
      // Returns { toolCalls } — apply_analytics_filters, ask_clarification, propose_action…
      let toolCalls: AnalyticsToolCall[] = [];
      try {
        const analystRes = await fetch(`${FN_URL}?phase=analyst`, {
          method: "POST",
          headers: baseHeaders,
          body: JSON.stringify({
            messages: history,
            analyticsContext: analyticsCtx,
          }),
          signal: abortControllerRef.current.signal,
        });
        if (analystRes.ok) {
          const json = (await analystRes.json()) as { toolCalls?: AnalyticsToolCall[] };
          toolCalls = json.toolCalls ?? [];
        }
        // 402/429/5xx з analyst — м'яко ігноруємо, переходимо до chat-фази
      } catch (e) {
        // network / abort — analyst не критичний
        if ((e as Error)?.name === "AbortError") throw e;
      }

      // Process tool_calls
      let appliedFilters: ApplyFiltersArgs | undefined;
      let clarification: AskClarificationArgs | undefined;
      const proposedActions: ProposeActionArgs[] = [];
      const networkResults: Array<{ name: string; result: unknown }> = [];

      for (const call of toolCalls) {
        if (call.name === "apply_analytics_filters") {
          appliedFilters = call.args;
          // Намагаємось переключитись на вкладку аналітики, якщо ми не там
          if (activeTab !== "analytics" && onTabChange) {
            onTabChange("analytics");
          }
          // Виклик registry (працює, лише якщо CabinetAnalyticsPage примонтовано)
          analyticsControlsRegistry.apply(call.args);
        } else if (call.name === "ask_clarification") {
          clarification = call.args;
        } else if (call.name === "propose_action") {
          proposedActions.push(call.args);
        } else if (NETWORK_TOOL_NAMES.has(call.name as never)) {
          const result = executeNetworkTool(
            call.name,
            (call.args ?? {}) as Record<string, unknown>,
            { cabinetId: activeCabinet.id },
          );
          if (result) networkResults.push({ name: call.name, result });
        }
      }

      // Clarification path → пропускаємо chat-фазу, лише питаємо уточнення
      if (clarification) {
        const clarifyMsg: Message = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          clarification,
        };
        setMessages((prev) => [...prev, clarifyMsg]);
        setIsTyping(false);
        return;
      }

      // ─── PHASE 2: CHAT (streaming) ───
      const placeholderId = `ai-${Date.now()}`;
      const initialActionStates =
        proposedActions.length > 0
          ? Object.fromEntries(proposedActions.map((_, i) => [i, "pending" as const]))
          : undefined;
      setMessages((prev) => [
        ...prev,
        {
          id: placeholderId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          appliedFilters,
          actions: proposedActions.length > 0 ? proposedActions : undefined,
          actionStates: initialActionStates,
        },
      ]);

      const enrichedContext =
        analyticsCtx +
        (toolCalls.length > 0
          ? `\n\n[AI ВИКОНАВ ІНСТРУМЕНТИ]: ${JSON.stringify(toolCalls)}`
          : "") +
        (networkResults.length > 0
          ? `\n\n[РЕЗУЛЬТАТИ МЕРЕЖЕВИХ ІНСТРУМЕНТІВ]: ${JSON.stringify(networkResults)}`
          : "");

      const res = await fetch(FN_URL, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          messages: history,
          analyticsContext: enrichedContext,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        let friendly = "Помилка AI сервісу";
        if (res.status === 402) {
          friendly =
            "На жаль, на робочому просторі вичерпано AI-кредити. Поповніть баланс у Settings → Workspace → Usage, щоб продовжити.";
        } else if (res.status === 429) {
          friendly = "Забагато запитів за короткий час. Зачекайте кілька секунд і спробуйте знову.";
        } else {
          try {
            const errBody = await res.json();
            if (errBody?.error) friendly = errBody.error;
          } catch { /* ignore */ }
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === placeholderId ? { ...m, content: `⚠️ ${friendly}` } : m)),
        );
        setIsTyping(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === placeholderId ? { ...m, content: accumulated } : m
                  )
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      // Add contextual quick actions based on analytics
      const quickActions: { label: string; action: string }[] = [];
      if (analyticsSnapshot.healthScore.total < 50) {
        quickActions.push({ label: "Як покращити Health Score?", action: "Як покращити Health Score мого кабінету?" });
      }
      const criticalRisks = analyticsSnapshot.risks.items.filter((r) => r.severity === "critical");
      if (criticalRisks.length > 0) {
        quickActions.push({ label: "Деталі критичних ризиків", action: "Поясни деталі критичних ризиків мого кабінету" });
      }
      if (quickActions.length === 0) {
        quickActions.push({ label: "Що покращити?", action: "Що можна покращити в моєму кабінеті?" });
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId ? { ...m, quickActions } : m
        )
      );
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            role: "assistant",
            content: "⚠️ Не вдалося отримати відповідь AI. Спробуйте ще раз.",
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  }, [activeCabinet, analyticsSnapshot, messages, activeTab, onTabChange]);

  // Conversational BI: підтвердити пропозицію дії від AI
  const handleActionConfirm = useCallback(
    async (msgId: string, idx: number, action: ProposeActionArgs) => {
      // Mark as confirmed (optimistic)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, actionStates: { ...(m.actionStates ?? {}), [idx]: "confirmed" as const } }
            : m,
        ),
      );
      if (!activeCabinet) {
        toast({ title: "Помилка", description: "Не вибрано кабінет", variant: "destructive" });
        return;
      }
      const result = await executeProposedAction(action, activeCabinet.id);
      toast({
        title: result.ok ? "Дію створено" : "Помилка",
        description: result.message,
        variant: result.ok ? "default" : "destructive",
      });
      if (!result.ok) {
        // rollback
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? { ...m, actionStates: { ...(m.actionStates ?? {}), [idx]: "pending" as const } }
              : m,
          ),
        );
      }
    },
    [activeCabinet],
  );

  const handleActionDismiss = useCallback((msgId: string, idx: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, actionStates: { ...(m.actionStates ?? {}), [idx]: "dismissed" as const } }
          : m,
      ),
    );
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Handle keyboard: Enter = send, Shift+Enter = new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add system message when cabinet changes
  useEffect(() => {
    if (prevCabinetRef.current !== undefined && activeCabinet !== prevCabinetRef.current) {
      if (activeCabinet) {
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          role: "system",
          content: `Ти зараз працюєш у кабінеті: ${activeCabinet.name}. Можеш попросити мене показати аналітику, створити документи чи підготувати звіт.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    }
    prevCabinetRef.current = activeCabinet;
  }, [activeCabinet]);

  // Proactive messages when document with risks is opened
  useEffect(() => {
    if (!documentContext || documentContext.documentId === prevDocContextRef.current) return;
    prevDocContextRef.current = documentContext.documentId;
    
    const { riskLevel, parties, documentNumber } = documentContext;
    
    // 1. Risk warning for high/critical documents
    if (riskLevel === 'high' || riskLevel === 'critical') {
      const riskMessage: Message = {
        id: `proactive-risk-${Date.now()}`,
        role: "assistant",
        content: `⚠️ Документ ${documentNumber || ''} має ${
          riskLevel === 'critical' ? '**критичні**' : 'підвищені'
        } ризики. Хочете детальний аналіз?`,
        timestamp: new Date(),
        quickActions: [
          { label: "📋 Аналіз ризиків", action: "explain_risks" },
          { label: "💬 Простими словами", action: "explain_simple" },
        ],
      };
      setMessages(prev => [...prev, riskMessage]);
    }
    
    // 2. New contractor alert (pending validation)
    const pendingParty = parties?.find(p => p.validationStatus === 'pending');
    if (pendingParty) {
      setTimeout(() => {
        const contractorMessage: Message = {
          id: `proactive-contractor-${Date.now()}`,
          role: "assistant",
          content: `🔍 Виявлено нового контрагента: **${pendingParty.name}**${
            pendingParty.code ? ` (${pendingParty.code})` : ''
          }. Перевірити в реєстрах?`,
          timestamp: new Date(),
          quickActions: [
            { label: "🔎 Перевірити в OpenDataBot", action: `check_contractor:${pendingParty.code}` },
            { label: "Пропустити", action: "dismiss" },
          ],
        };
        setMessages(prev => [...prev, contractorMessage]);
      }, 1500); // Delay for better UX
    }
  }, [documentContext?.documentId, documentContext?.riskLevel]);

  // Handle template test mode - show initial question when enabled
  const prevTemplateTestRef = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (templateTestState?.enabled && !prevTemplateTestRef.current) {
      // Template test mode just started
      const fields = templateTestState.fields;
      if (fields.length > 0) {
        const firstField = fields[0];
        const testStartMessage: Message = {
          id: `template-test-start-${Date.now()}`,
          role: "assistant",
          content: `🧪 Режим тестування шаблону!\n\nВідповідайте на питання — документ оновлюється в реальному часі.\n\n${getFieldQuestion(firstField)}`,
          timestamp: new Date(),
          quickActions: getQuickActionsForField(firstField),
        };
        setMessages((prev) => [...prev, testStartMessage]);
      }
    } else if (!templateTestState?.enabled && prevTemplateTestRef.current) {
      // Template test mode ended
      const testEndMessage: Message = {
        id: `template-test-end-${Date.now()}`,
        role: "system",
        content: "Режим тестування шаблону завершено.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, testEndMessage]);
    }
    prevTemplateTestRef.current = templateTestState?.enabled;
  }, [templateTestState?.enabled]);

  // Handle edit field request from preview panel
  const prevEditFieldRef = useRef<string | null>(null);
  useEffect(() => {
    if (onEditFieldRequest && onEditFieldRequest !== prevEditFieldRef.current && templateTestState?.enabled) {
      prevEditFieldRef.current = onEditFieldRequest;
      const field = templateTestState.fields.find(f => f.key === onEditFieldRequest);
      if (field) {
        const fieldIndex = templateTestState.fields.findIndex(f => f.key === onEditFieldRequest);
        const currentValue = templateTestState.filledFields[field.key] || "";
        const editMessage: Message = {
          id: `edit-field-${Date.now()}`,
          role: "assistant",
          content: currentValue 
            ? `✏️ Редагуємо поле #${fieldIndex + 1} "${field.label}"\n\nПоточне значення: "${currentValue}"\n\nВведіть нове значення:`
            : `✏️ Заповнюємо поле #${fieldIndex + 1} "${field.label}"\n\n${getFieldQuestion(field)}`,
          timestamp: new Date(),
          quickActions: [
            ...getQuickActionsForField(field),
            ...(currentValue ? [{ label: "⬅️ Залишити як є", action: "__cancel_edit__" }] : []),
          ],
        };
        setMessages((prev) => [...prev, editMessage]);
      }
    }
  }, [onEditFieldRequest, templateTestState]);

  // Helper function to generate field questions
  const getFieldQuestion = (field: { key: string; label: string; source: string }) => {
    const questionMap: Record<string, string> = {
      contractor_name: "Як називається компанія-контрагент?",
      contractor_code: "Який код ЄДРПОУ або ІПН контрагента?",
      service_description: "Що є предметом договору? Опишіть послуги чи роботи.",
      total_amount: "Яка загальна сума договору?",
      start_date: "Коли починаються роботи?",
      end_date: "Коли завершуються роботи?",
      doc_number: "Який номер документа?",
      day: "Який день підписання?",
      month: "Який місяць підписання?",
    };
    return questionMap[field.key] || `Введіть значення для поля "${field.label}":`;
  };

  // Generate quick actions based on field type
  const getQuickActionsForField = (field: { key: string; label: string; source: string }) => {
    const actions: { label: string; action: string }[] = [];
    
    // Date fields
    if (field.key.includes("date") || field.key === "day" || field.key === "month" || field.key.includes("start") || field.key.includes("end")) {
      actions.push({ label: "📅 Сьогодні", action: `__fill_today__${field.key}` });
    }
    
    // Contractor name suggestions
    if (field.key === "contractor_name") {
      actions.push({ label: '🏢 ТОВ "Тестова компанія"', action: `__fill_demo_contractor__${field.key}` });
    }
    
    // Contractor code suggestions
    if (field.key === "contractor_code") {
      actions.push({ label: "📋 12345678", action: `__fill_demo_code__${field.key}` });
    }
    
    // Amount suggestions
    if (field.key.includes("amount") || field.key.includes("sum") || field.key.includes("total")) {
      actions.push({ label: "💰 10 000 грн", action: `__fill_demo_amount__${field.key}` });
    }
    
    // Always allow skip
    actions.push({ label: "⏭️ Пропустити", action: `__skip__${field.key}` });
    
    return actions;
  };

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Handle external send trigger from MobileFooter
  const prevSendTrigger = useRef(sendTrigger);
  useEffect(() => {
    if (sendTrigger > 0 && sendTrigger !== prevSendTrigger.current) {
      prevSendTrigger.current = sendTrigger;
      if (externalInputValue?.trim()) {
        handleSendMessageInternal(externalInputValue.trim());
      }
    }
  }, [sendTrigger, externalInputValue]);

  const currentInputValue = isControlled ? externalInputValue : inputValue;
  
  const handleSendMessageInternal = (text: string) => {
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input - either controlled or internal
    if (isControlled && onExternalInputChange) {
      onExternalInputChange("");
    } else {
      setInputValue("");
    }
    
    setIsTyping(true);

    // Симуляція відповіді AI
    setTimeout(() => {
      handleAIResponse(text);
      setIsTyping(false);
    }, 800);
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || currentInputValue?.trim() || "";
    handleSendMessageInternal(messageText);
  };

  const handleAIResponse = (userInput: string) => {
    let response: Message;
    let nextStep: OnboardingStep = currentStep;
    const newData = { ...userData };

    const lowerInput = userInput.toLowerCase();

    // === PAYMENT ORCHESTRATOR COMMANDS ===
    
    // "Покажи що треба оплатити" / "Покажи платежі"
    if ((lowerInput.includes("оплатити") || lowerInput.includes("платеж") || lowerInput.includes("платіж")) 
        && (lowerInput.includes("покажи") || lowerInput.includes("що треба") || lowerInput.includes("які"))) {
      if (activeCabinet) {
        const taxPayments = getTaxPaymentsForCabinet(activeCabinet.id);
        const content = formatPaymentChatResponse(taxPayments, "pending");
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content,
          timestamp: new Date(),
          quickActions: [
            { label: "💳 Оплатити ЄП", action: "open_payment_ep" },
            { label: "💳 Оплатити ЄСВ", action: "open_payment_esv" },
            { label: "📋 Усі платежі", action: "open_payments_tab" },
          ],
        };
      } else {
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Оберіть кабінет, щоб побачити платежі до сплати.",
          timestamp: new Date(),
        };
      }
      setMessages((prev) => [...prev, response]);
      return;
    }
    
    // "Чому така сума ЄП/ЄСВ?" / "Поясни розрахунок"
    if ((lowerInput.includes("чому") || lowerInput.includes("поясни")) && 
        (lowerInput.includes("сума") || lowerInput.includes("розрахунок"))) {
      const isESV = lowerInput.includes("єсв") || lowerInput.includes("есв");
      const isEP = lowerInput.includes("єп") || lowerInput.includes("податок") || lowerInput.includes("податку");
      
      if (activeCabinet) {
        const taxPayments = getTaxPaymentsForCabinet(activeCabinet.id);
        const payment = taxPayments.find(p => 
          isESV ? p.taxType === "esv" : p.taxType === "ep"
        );
        
        if (payment) {
          const content = explainTaxAmount(
            payment.taxType,
            payment.amountToPay,
            payment.calculatedFromIncome,
            payment.period
          );
          response = {
            id: Date.now().toString(),
            role: "assistant",
            content,
            timestamp: new Date(),
            quickActions: [
              { label: "📖 Книга доходів", action: "open_income_book" },
              { label: "💳 Сплатити", action: `open_payment_${payment.taxType}` },
            ],
          };
        } else {
          response = {
            id: Date.now().toString(),
            role: "assistant",
            content: "Не знайдено активних платежів. Перевірте розділ Платежі.",
            timestamp: new Date(),
          };
        }
      } else {
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Оберіть кабінет для перегляду розрахунків.",
          timestamp: new Date(),
        };
      }
      setMessages((prev) => [...prev, response]);
      return;
    }
    
    // "Сформуй платіж" / "Створи платіж"
    if ((lowerInput.includes("сформуй") || lowerInput.includes("створи")) && 
        (lowerInput.includes("платіж") || lowerInput.includes("платеж"))) {
      const isESV = lowerInput.includes("єсв") || lowerInput.includes("есв");
      const taxType = isESV ? "esv" : "ep";
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✓ Відкриваю форму підтвердження платежу ${isESV ? "ЄСВ" : "ЄП"}...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      onOpenPaymentApproval?.(taxType);
      return;
    }
    
    // "Коли наступний дедлайн?"
    if (lowerInput.includes("дедлайн") || lowerInput.includes("термін")) {
      if (activeCabinet) {
        const taxPayments = getTaxPaymentsForCabinet(activeCabinet.id);
        const pending = taxPayments.filter(p => p.status === "scheduled" || p.status === "created");
        
        if (pending.length > 0) {
          const sorted = [...pending].sort((a, b) => 
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
          const next = sorted[0];
          const urgency = getPaymentUrgency(next.deadline);
          
          response = {
            id: Date.now().toString(),
            role: "assistant",
            content: `📅 **Найближчий дедлайн:**\n\n**${next.taxTypeLabel}** за ${next.period}\n**Сума:** ${new Intl.NumberFormat("uk-UA").format(next.amountToPay)} ₴\n**Термін:** ${urgency.message}\n\n${urgency.level === "urgent" ? "⚠️ Рекомендую сплатити якнайшвидше!" : ""}`,
            timestamp: new Date(),
            quickActions: [
              { label: "💳 Сплатити зараз", action: `open_payment_${next.taxType}` },
              { label: "📋 Усі дедлайни", action: "open_payments_tab" },
            ],
          };
        } else {
          response = {
            id: Date.now().toString(),
            role: "assistant",
            content: "✓ Немає активних дедлайнів. Все сплачено!",
            timestamp: new Date(),
          };
        }
      } else {
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Оберіть кабінет для перегляду дедлайнів.",
          timestamp: new Date(),
        };
      }
      setMessages((prev) => [...prev, response]);
      return;
    }

    // === PASSIVE CABINET MARKETING HANDLERS ===
    const isPassiveCabinet = activeCabinet?.accessMode === "passive";
    
    // "Як отримати повний доступ?" / "upgrade" / "розблокувати"
    if (isPassiveCabinet && (
      lowerInput.includes("повний доступ") || 
      lowerInput.includes("upgrade") || 
      lowerInput.includes("розблокувати") ||
      lowerInput.includes("активний кабінет") ||
      lowerInput.includes("активувати")
    )) {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🚀 **Розблокуйте повний функціонал!**

Ваш партнер запросив вас до системи, і ви вже бачите, як це зручно. Але в пасивному режимі ви можете лише переглядати документи.

**Що ви отримаєте з активним планом:**
• 📄 Створення власних документів (рахунки, акти, договори)
• 🤖 AI-помічник для податків та звітів
• 📊 Автоматичний розрахунок ЄП/ЄСВ
• 🏦 Інтеграція з банком та ПРРО

**Спеціальна пропозиція для контрагентів:**
🎁 **Перший місяць -50%** при переході з пасивного кабінету
✨ **+50 бонусних кредитів** на старт`,
        timestamp: new Date(),
        quickActions: [
          { label: "📊 Розрахувати вигоду", action: "calculate_roi" },
          { label: "💳 Обрати тариф", action: "open_pricing" },
          { label: "🆓 Спробувати 14 днів", action: "start_trial" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // "Скільки я економлю?" / "вигода" / "roi"
    if (isPassiveCabinet && (
      lowerInput.includes("вигод") || 
      lowerInput.includes("економ") || 
      lowerInput.includes("roi") ||
      lowerInput.includes("розрахуй")
    )) {
      // Demo calculation based on typical usage
      const docsPerMonth = 15;
      const paymentsPerMonth = 8;
      const hourlyRate = 300; // UAH
      const manualTimePerDoc = 20; // minutes
      const manualTimePerPayment = 15; // minutes
      
      const timeSavedHours = ((docsPerMonth * manualTimePerDoc + paymentsPerMonth * manualTimePerPayment) * 0.7) / 60;
      const moneySaved = Math.round(timeSavedHours * hourlyRate);
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📈 **Ваша потенційна вигода**

Типовий ФОП з ~15 документами та ~8 платежами на місяць:

**Економія часу:**
• Документи: **-70%** часу на створення
• Податки: **автоматичний** розрахунок ЄП/ЄСВ
• Звіти: **1 клік** замість ручного заповнення

**Орієнтовна економія:**
• ⏱️ ~${timeSavedHours.toFixed(1)} годин на місяць
• 💰 ~${moneySaved.toLocaleString()} ₴ (при ставці ${hourlyRate} ₴/год)

**Вартість плану "Старт":** від 5 грн/міс
**ROI:** окупається за перші 2-3 документи!

💡 Хочете точніший розрахунок? Перейдіть на сторінку тарифів з калькулятором.`,
        timestamp: new Date(),
        quickActions: [
          { label: "🎯 Обрати тариф", action: "open_pricing" },
          { label: "📊 Калькулятор вигоди", action: "open_roi_calculator" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // "Що я можу робити?" / "функції"
    if (isPassiveCabinet && (
      lowerInput.includes("можу робити") || 
      lowerInput.includes("функціон") ||
      lowerInput.includes("можливост") ||
      (lowerInput.includes("що") && lowerInput.includes("доступ"))
    )) {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📋 **Ваші можливості в пасивному кабінеті:**

✅ **Доступно зараз:**
• Перегляд документів від партнера
• Підписання документів (якщо потрібно)
• Перегляд історії операцій
• Базова статистика

🔒 **Доступно на активному плані:**
• Створення власних документів
• Автоматичний розрахунок податків
• AI-помічник для бухгалтерії
• Інтеграція з банками та ПРРО
• Формування звітів
• Управління командою

Хочете спробувати повний функціонал?`,
        timestamp: new Date(),
        quickActions: [
          { label: "🚀 Активувати повний доступ", action: "explain_upgrade" },
          { label: "💬 Запитати партнера", action: "ask_partner" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // "Порівняй пасивний і активний"
    if (isPassiveCabinet && (
      lowerInput.includes("порівня") ||
      lowerInput.includes("різниц") ||
      (lowerInput.includes("пасив") && lowerInput.includes("актив"))
    )) {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚖️ **Пасивний vs Активний кабінет**

| Функція | Пасивний | Активний |
|---------|----------|----------|
| Перегляд документів | ✅ | ✅ |
| Підписання | ✅ | ✅ |
| Створення документів | ❌ | ✅ |
| Розрахунок податків | ❌ | ✅ |
| AI-помічник | ❌ | ✅ |
| Інтеграції | ❌ | ✅ |
| Звіти та аналітика | ❌ | ✅ |

**Бонус для контрагентів:** -50% на перший місяць! 🎁`,
        timestamp: new Date(),
        quickActions: [
          { label: "💳 Переглянути тарифи", action: "open_pricing" },
          { label: "📊 Розрахувати вигоду", action: "calculate_roi" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // Handle quick actions for passive cabinet marketing
    if (lowerInput === "open_pricing" || lowerInput === "open pricing") {
      onTabChange?.("pricing" as TabType);
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: "🎯 Відкриваю сторінку тарифів...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    if (lowerInput === "calculate_roi" || lowerInput === "open_roi_calculator") {
      onTabChange?.("pricing" as TabType);
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: "📊 Відкриваю калькулятор вигоди на сторінці тарифів...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    if (lowerInput === "start_trial") {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🆓 **14-денний пробний період**

Щоб активувати безкоштовний trial:

1. Перейдіть на сторінку тарифів
2. Оберіть будь-який план
3. Натисніть "Спробувати безкоштовно"

Картку прив'язувати не потрібно! Після закінчення trial ви самі вирішите, чи продовжувати.`,
        timestamp: new Date(),
        quickActions: [
          { label: "💳 Обрати тариф", action: "open_pricing" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    if (lowerInput === "explain_upgrade") {
      // Trigger the upgrade explanation
      handleAIResponse("як отримати повний доступ");
      return;
    }

    // === PERSONALIZED TARIFF RECOMMENDATION ===
    if (lowerInput.includes("який тариф") || 
        lowerInput.includes("рекомендуй план") ||
        lowerInput.includes("що обрати") ||
        lowerInput.includes("підібрати тариф") ||
        lowerInput.includes("порадь тариф") ||
        lowerInput.includes("який план") ||
        lowerInput.includes("який тариф обрати")) {
      
      const needs = getUserNeeds();
      const recommendedPlanId = getRecommendedPlan(needs);
      const plan = plans.find(p => p.id === recommendedPlanId)!;
      
      const needsList = needs.length > 0 
        ? needs.map(n => needsLabels[n] || n).join(", ")
        : "ще не вказані";
      
      let justification = "";
      if (recommendedPlanId === "premium") {
        justification = `**Чому «Преміум»?**
• Зарплата потребує великий обсяг операцій: табелі, нарахування, звіти
• Найбільший пакет кредитів (~${plan.actions} дій)
• Найвигідніша ціна за дію (-10% vs Старт)`;
      } else if (recommendedPlanId === "smart") {
        justification = `**Чому «Смарт»?**
• Оптимальне співвідношення ціни та можливостей
• Достатньо кредитів для ~${plan.actions} дій на місяць
• Бонусні кредити щомісяця
• На 5% дешевше за дію, ніж «Старт»`;
      } else {
        justification = `**Чому «Старт»?**
• Ідеальний для початку роботи
• Базовий пакет на ~${plan.actions} дій
• Можливість у будь-який момент докупити кредити`;
      }

      const alternatives = plans
        .filter(p => p.id !== recommendedPlanId)
        .map(p => `• «${p.name}» ($${p.price}) — ${p.id === 'start' ? 'якщо операцій менше 50/міс' : p.id === 'smart' ? 'баланс ціни та можливостей' : 'для великого документообігу'}`)
        .join('\n');

      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📊 **Персональна рекомендація тарифу**

На основі ваших потреб: **${needsList}**

---

🎯 **Рекомендую: план «${plan.name}»**
💵 **${plan.price} грн/міс** — до ~${plan.actions} дій

${justification}

---

**Альтернативи:**
${alternatives}

🆓 **14 днів безкоштовно** на будь-якому плані!`,
        timestamp: new Date(),
        quickActions: [
          { label: `🚀 Обрати ${plan.name}`, action: `select_plan_${recommendedPlanId}` },
          { label: "📊 Порівняти всі", action: "open_pricing" },
          { label: "🆓 Спробувати безкоштовно", action: "start_trial" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // Handle plan selection from recommendation
    if (lowerInput.startsWith("select_plan_")) {
      const planId = lowerInput.replace("select_plan_", "");
      const selectedPlan = plans.find(p => p.id === planId);
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ Чудовий вибір — план «${selectedPlan?.name || planId}»! Переходжу на сторінку оформлення...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      
      // Navigate to checkout with selected plan and trial
      setTimeout(() => {
        window.location.href = `/checkout?plan=${planId}&trial=true`;
      }, 500);
      return;
    }

    // === DOCUMENT CARD DEMO RESPONSES ===
    
    // "Поясни документ простими словами"
    if (lowerInput.includes("поясни") && (lowerInput.includes("документ") || lowerInput.includes("договір")) && lowerInput.includes("простими словами")) {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📄 **Простими словами:**\n\nЦе договір на надання послуг. Ваша компанія (Замовник) платить контрагенту за виконану роботу.\n\n**Головне:**\n• Сума: 250 000 грн (без ПДВ)\n• Строк: до кінця року\n• Оплата: після підписання акту\n\n**На що звернути увагу:**\n• Штраф за прострочення — 0,5% за день (це багато!)\n• Контрагент може розірвати договір в односторонньому порядку\n\nПотрібно детальніше про якийсь пункт?`,
        timestamp: new Date(),
        quickActions: [
          { label: "Детальніше про штрафи", action: "explain_penalties" },
          { label: "Умови розірвання", action: "explain_termination" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // "Поясни ризики"
    if (lowerInput.includes("поясни") && lowerInput.includes("ризик")) {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚠️ **Аналіз ризиків договору:**\n\n**1. Високі штрафні санкції (КРИТИЧНО)**\nШтраф 0,5% за день = 182,5% річних. Це значно вище ринкової ставки.\n\n*Рекомендація:* Узгодьте зменшення до 0,1% або обмеження загальної суми штрафу (наприклад, не більше 10% від суми договору).\n\n**2. Одностороннє розірвання**\nКонтрагент може розірвати договір без пояснень за 10 днів.\n\n*Рекомендація:* Додайте взаємні умови — якщо контрагент може, то і ви маєте таке право.\n\n**3. Відсутність детальної специфікації**\nНе вказано чіткі критерії якості послуг.\n\n*Рекомендація:* Додайте Додаток з детальним описом очікуваного результату.`,
        timestamp: new Date(),
        quickActions: [
          { label: "Як виправити штрафи?", action: "fix_penalties" },
          { label: "Шаблон специфікації", action: "specification_template" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // === DOCUMENT CARD NAVIGATION INTENTS ===

    // Intent: "Поясни цей документ" / "Що це за документ?"
    if (documentContext && (
      (lowerInput.includes("поясни") && lowerInput.includes("документ") && !lowerInput.includes("простими словами") && !lowerInput.includes("ризик")) ||
      lowerInput.includes("що це за документ") ||
      lowerInput.includes("про що документ") ||
      lowerInput === "що це"
    )) {
      documentContext.navigateToTab?.("overview");
      setTimeout(() => documentContext.scrollToSection?.("ai-summary"), 300);
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📄 **Документ ${documentContext.documentNumber || ''}:**\n\n${
          documentContext.aiSummary || 
          documentContext.summary ||
          "Це договір/документ, що визначає умови співпраці між сторонами."
        }\n\n_Показую деталі на вкладці «Огляд» → блок «Короткий зміст»_`,
        timestamp: new Date(),
        quickActions: [
          { label: "Детальніше про ризики", action: "explain_risks" },
          { label: "Простими словами", action: "explain_simple" },
        ],
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Intent: "Що тут важливо?" / "На що звернути увагу?"
    if (documentContext && (
      lowerInput.includes("що тут важливо") ||
      lowerInput.includes("на що звернути увагу") ||
      lowerInput.includes("головне в документ")
    )) {
      documentContext.navigateToTab?.("overview");
      setTimeout(() => documentContext.scrollToSection?.("risks"), 300);
      
      const risksText = documentContext.keyRisks?.length 
        ? documentContext.keyRisks.map(r => `• **${r.severity}:** ${r.title}`).join("\n")
        : "• Критичних ризиків не виявлено";
        
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚠️ **Ключові моменти для уваги:**\n\n${risksText}\n\n_Показую блок «Ризики» на вкладці «Огляд»_`,
        timestamp: new Date(),
        quickActions: [
          { label: "Поясни детальніше", action: "explain_risks" },
          { label: "Показати в тексті", action: "show_in_document" },
        ],
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Intent: "Що з ним в обліку?" / "Покажи облік"
    if (documentContext && (
      lowerInput.includes("в обліку") ||
      (lowerInput.includes("облік") && !lowerInput.includes("книг")) ||
      lowerInput.includes("в декларації") ||
      lowerInput.includes("податки цього документ") ||
      lowerInput.includes("як враховано")
    )) {
      documentContext.navigateToTab?.("integration");
      setTimeout(() => documentContext.scrollToSection?.("document-integration-accounting"), 300);
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `💰 **Статус обліку документа ${documentContext.documentNumber || ''}:**\n\n• Статус: ${
          documentContext.accountingStatus === 'completed' ? '✅ Враховано' : 
          documentContext.accountingStatus === 'pending' ? '⏳ Очікує обробки' : 
          '—'
        }\n\n_Показую вкладку «Інтеграція» → блок «Облік і податки»_`,
        timestamp: new Date(),
        quickActions: [
          { label: "Відкрити Книгу доходів", action: "open_income_book" },
          { label: "Показати проводки", action: "show_transactions" },
        ],
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Intent: "Покажи історію змін" / "Хто редагував?"
    if (documentContext && (
      lowerInput.includes("історія змін") ||
      lowerInput.includes("хто редагував") ||
      lowerInput.includes("хто змінював") ||
      lowerInput.includes("версії документ") ||
      lowerInput.includes("покажи історію") ||
      lowerInput.includes("покажи версії")
    )) {
      documentContext.navigateToTab?.("history");
      setTimeout(() => documentContext.scrollToSection?.("document-history-timeline"), 300);
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📜 **Історія документа ${documentContext.documentNumber || ''}:**\n\nВідкриваю вкладку «Історія» з повним таймлайном подій: створення, редагування, погодження, підписання.\n\n_Показую блок «Таймлайн подій»_`,
        timestamp: new Date(),
        quickActions: [
          { label: "Порівняти версії", action: "compare_versions" },
          { label: "Експорт аудиту", action: "export_audit" },
        ],
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Intent: "Покажи пов'язані документи" / "Зв'язки"
    if (documentContext && (
      lowerInput.includes("пов'язані документ") ||
      lowerInput.includes("зв'язки") ||
      lowerInput.includes("пов'язан") ||
      lowerInput.includes("залежн") ||
      lowerInput.includes("граф зв'язк") ||
      lowerInput.includes("зв'язані")
    )) {
      documentContext.navigateToTab?.("integration");
      setTimeout(() => documentContext.scrollToSection?.("document-integration-relations"), 300);
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🔗 **Зв'язки документа:**\n\n${
          documentContext.hasLinkedDocuments 
            ? "Цей документ має зв'язки з іншими документами. Відкриваю граф зв'язків."
            : "Зв'язків з іншими документами не знайдено."
        }\n\n_Показую вкладку «Інтеграція» → блок «Зв'язки»_`,
        timestamp: new Date(),
        quickActions: [
          { label: "Відкрити граф", action: "open_graph" },
          { label: "Показати платежі", action: "show_payments" },
        ],
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Intent: "Не погоджуюсь з умовами" / "Хочу акт розбіжностей"
    if (documentContext && (
      lowerInput.includes("не погоджуюсь") ||
      lowerInput.includes("не згоден") ||
      lowerInput.includes("не згодна") ||
      lowerInput.includes("акт розбіжност") ||
      lowerInput.includes("розбіжност") ||
      lowerInput.includes("оспорити") ||
      lowerInput.includes("заперечен")
    )) {
      documentContext.enableDiscrepancyMode?.();
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `⚖️ **Режим акту розбіжностей:**\n\nВідкриваю вкладку «Документ» у режимі створення акту розбіжностей.\n\n**Як користуватись:**\n1. Виділіть спірний фрагмент тексту\n2. Натисніть «Додати до акту»\n3. Опишіть вашу позицію\n4. Повторіть для всіх спірних пунктів\n\n_Готово до роботи! Виділяйте текст, з яким не погоджуєтесь._`,
        timestamp: new Date(),
        quickActions: [
          { label: "Приклад формулювання", action: "discrepancy_example" },
          { label: "Шаблон акту", action: "discrepancy_template" },
        ],
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Intent: Fallback for document context but no specific intent
    if (documentContext && !response && (
      lowerInput.includes("цей документ") ||
      lowerInput.includes("цього документ") ||
      lowerInput.includes("цьому документ")
    )) {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📄 Ви працюєте з документом **${documentContext.documentNumber || 'без номера'}**.\n\nЯ можу допомогти з:\n• Поясненням документа\n• Аналізом ризиків\n• Переглядом історії змін\n• Перевіркою в обліку\n• Створенням акту розбіжностей\n\nЩо саме вас цікавить?`,
        timestamp: new Date(),
        quickActions: [
          { label: "Поясни документ", action: "explain_simple" },
          { label: "Покажи ризики", action: "explain_risks" },
          { label: "Історія змін", action: "Покажи історію змін" },
        ],
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Виділений текст - пояснення
    if (lowerInput.startsWith("поясни:") || lowerInput.startsWith("explain:")) {
      const selectedText = userInput.substring(userInput.indexOf(":") + 1).trim();
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `📝 **Пояснення обраного фрагменту:**\n\n"${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}"\n\nЦей пункт означає, що сторони домовляються про конкретні умови виконання зобов'язань. У випадку порушення термінів, передбачені штрафні санкції.\n\n**Юридичний контекст:** Стандартна практика для господарських договорів в Україні. Відповідає вимогам ЦК та ГК України.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // Чи є ризик у виділеному тексті
    if (lowerInput.startsWith("ризик:") || lowerInput.startsWith("risk:")) {
      const selectedText = userInput.substring(userInput.indexOf(":") + 1).trim();
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `🔍 **Аналіз ризику:**\n\n"${selectedText.substring(0, 80)}${selectedText.length > 80 ? '...' : ''}"\n\n⚠️ **Потенційний ризик виявлено:**\n\nЦей пункт може створити невигідні умови для вашої сторони. Рекомендую:\n\n1. Уточнити формулювання\n2. Додати обмеження відповідальності\n3. Узгодити з юристом перед підписанням\n\n*Рівень ризику:* 🟡 Середній`,
        timestamp: new Date(),
        quickActions: [
          { label: "Запропонуй виправлення", action: "suggest_fix" },
          { label: "Ігнорувати ризик", action: "ignore_risk" },
        ],
      };
      setMessages((prev) => [...prev, response]);
      return;
    }

    // === AI-DRIVEN DOCUMENT CREATION (Phase 1: Chat → Template integration) ===
    // Check for document creation intent using semantic parser
    if (hasDocumentCreationIntent(userInput) && activeCabinet && onNavigateToAddDocument) {
      const intent = parseDocumentIntent(userInput);
      
      if (intent.confidence > 0.4 && intent.type) {
        // Build AI recommendation message
        const typeLabel = intent.type === "contract" ? "договір" :
                          intent.type === "invoice" ? "рахунок" :
                          intent.type === "act" ? "акт" :
                          intent.type === "rental-agreement" ? "договір оренди" :
                          intent.type === "supply-contract" ? "договір поставки" :
                          intent.type === "fop-service-contract" ? "договір з ФОП" :
                          intent.type;
        
        const contractorText = intent.contractorHint 
          ? `\n• **Контрагент:** ${intent.contractorHint}` 
          : "";
        const tagsText = intent.suggestedTags.length > 0 
          ? `\n• **Теги:** ${intent.suggestedTags.join(", ")}` 
          : "";
        
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: `📄 **Розпізнано запит на створення документа:**\n\n• **Тип:** ${typeLabel}${contractorText}${tagsText}\n\n_Відкриваю вибір шаблону з AI-рекомендаціями..._`,
          timestamp: new Date(),
          quickActions: [
            { label: "✓ Продовжити", action: "__confirm_document_creation__" },
            { label: "✏️ Уточнити", action: "clarify_document" },
          ],
        };
        setMessages((prev) => [...prev, response]);
        
        // Navigate to template selector with parsed intent
        setTimeout(() => {
          onNavigateToAddDocument({
            method: "create",
            relation: "new",
            skipToStep: "template",
            initialType: intent.type || undefined,
            aiSuggestedTags: intent.suggestedTags,
            contractorHint: intent.contractorHint,
            subjectHint: intent.subjectHint,
          });
        }, 500);
        return;
      }
    }

    // Handle "create template" command
    if (lowerInput.includes("створити шаблон") || lowerInput.includes("create_template") || lowerInput === "create template") {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Чудово! Відкриваю майстер створення шаблонів. Завантажте документ або спробуйте демо-договір.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      onTabChange?.("create-template");
      return;
    }

    // Handle template test mode
    if (templateTestState?.enabled && templateTestState.fields.length > 0) {
      const currentIndex = templateTestState.currentFieldIndex;
      const currentField = templateTestState.fields[currentIndex];
      const nextIndex = currentIndex + 1;
      const hasMoreFields = nextIndex < templateTestState.fields.length;
      
      // Handle special quick action commands
      let actualValue = userInput;
      let isSkipped = false;
      
      if (userInput.startsWith("__fill_today__")) {
        actualValue = format(new Date(), "dd.MM.yyyy", { locale: uk });
      } else if (userInput.startsWith("__fill_demo_contractor__")) {
        actualValue = 'ТОВ "Тестова компанія"';
      } else if (userInput.startsWith("__fill_demo_code__")) {
        actualValue = "12345678";
      } else if (userInput.startsWith("__fill_demo_amount__")) {
        actualValue = "10 000 грн";
      } else if (userInput.startsWith("__skip__")) {
        actualValue = "—";
        isSkipped = true;
      }
      
      // Update the current field value
      if (currentField && onTemplateFieldUpdate) {
        onTemplateFieldUpdate(currentField.key, actualValue);
      }
      
      if (hasMoreFields) {
        // Ask about the next field
        const nextField = templateTestState.fields[nextIndex];
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: isSkipped 
            ? `⏭️ Пропущено поле "${currentField?.label}".\n\n${getFieldQuestion(nextField)}`
            : `✓ "${currentField?.label}" → ${actualValue}\n\n${getFieldQuestion(nextField)}`,
          timestamp: new Date(),
          quickActions: getQuickActionsForField(nextField),
        };
      } else {
        // All fields filled - show edit options for each field
        const editActions = templateTestState.fields.slice(0, 4).map((f, idx) => ({
          label: `✏️ ${idx + 1}. ${f.label.slice(0, 12)}${f.label.length > 12 ? '...' : ''}`,
          action: `__edit_field__${f.key}`
        }));
        
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: isSkipped
            ? `⏭️ Пропущено поле "${currentField?.label}".\n\n🎉 Всі поля заповнено!\n\nПеревірте документ у превʼю. Натисніть на будь-яке поле для редагування або оберіть нижче:`
            : `✓ "${currentField?.label}" → ${actualValue}\n\n🎉 Всі поля заповнено!\n\nПеревірте документ у превʼю. Натисніть на будь-яке поле для редагування або оберіть нижче:`,
          timestamp: new Date(),
          quickActions: [
            ...editActions,
            { label: "🔄 Заповнити заново", action: "restart_template_test" },
          ],
        };
      }
      
      setMessages((prev) => [...prev, response]);
      return;
    }
    
    // Handle edit field command from quick actions
    if (userInput.startsWith("__edit_field__") && templateTestState?.enabled) {
      const fieldKey = userInput.replace("__edit_field__", "");
      const field = templateTestState.fields.find(f => f.key === fieldKey);
      
      if (field) {
        const fieldIndex = templateTestState.fields.findIndex(f => f.key === fieldKey);
        const currentValue = templateTestState.filledFields[fieldKey] || "";
        
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: `✏️ Редагуємо поле #${fieldIndex + 1} "${field.label}"\n\nПоточне значення: "${currentValue}"\n\nВведіть нове значення:`,
          timestamp: new Date(),
          quickActions: [
            ...getQuickActionsForField(field),
            { label: "⬅️ Залишити як є", action: "__cancel_edit__" },
          ],
        };
        
        setMessages((prev) => [...prev, response]);
        return;
      }
    }
    
    // Handle cancel edit
    if (userInput === "__cancel_edit__" && templateTestState?.enabled) {
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Добре, залишаємо без змін. Можете редагувати інші поля натиснувши на них у документі.",
        timestamp: new Date(),
        quickActions: templateTestState.fields.slice(0, 4).map((f, idx) => ({
          label: `✏️ ${idx + 1}. ${f.label.slice(0, 12)}${f.label.length > 12 ? '...' : ''}`,
          action: `__edit_field__${f.key}`
        })),
      };
      setMessages((prev) => [...prev, response]);
      return;
    }
    
    // Handle text command for editing (e.g., "редагуй поле 3")
    const editMatch = userInput.match(/^(редагуй|edit|змінити?|поле)\s*(поле\s*)?(\d+)$/i);
    if (editMatch && templateTestState?.enabled) {
      const fieldNumber = parseInt(editMatch[3], 10) - 1;
      const field = templateTestState.fields[fieldNumber];
      
      if (field) {
        const currentValue = templateTestState.filledFields[field.key] || "";
        response = {
          id: Date.now().toString(),
          role: "assistant",
          content: `✏️ Редагуємо поле #${fieldNumber + 1} "${field.label}"\n\nПоточне значення: "${currentValue || '—'}"\n\nВведіть нове значення:`,
          timestamp: new Date(),
          quickActions: [
            ...getQuickActionsForField(field),
            { label: "⬅️ Залишити як є", action: "__cancel_edit__" },
          ],
        };
        setMessages((prev) => [...prev, response]);
        return;
      }
    }

    // === AI CABINET CHAT FALLBACK ===
    // If cabinet + analytics snapshot available and onboarding is complete,
    // delegate to AI edge function instead of rule-based responses
    if (activeCabinet && analyticsSnapshot && currentStep === "complete") {
      callCabinetAI(userInput);
      return;
    }

    if (userInput === "fop" || userInput === "tov" || userInput === "accountant") {
      const roleLabels = {
        fop: "ФОП",
        tov: "власником ТОВ",
        accountant: "бухгалтером",
      };
      newData.role = userInput;
      newData.roleLabel = roleLabels[userInput as keyof typeof roleLabels];
      nextStep = "business-name";
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Чудово, ти працюєш як ${roleLabels[userInput as keyof typeof roleLabels]}. Як називається твоя діяльність або бізнес?`,
        timestamp: new Date(),
      };
    } else if (currentStep === "business-name") {
      newData.businessName = userInput;
      nextStep = "company-legal";
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Дякую! Як ми назвемо твою компанію в документах? Наприклад, "ФОП Іваненко Іван Іванович".`,
        timestamp: new Date(),
      };
    } else if (currentStep === "company-legal") {
      newData.companyLegal = userInput;
      nextStep = "tax-system";
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Яку систему оподаткування ти використовуєш?",
        timestamp: new Date(),
        quickActions: [
          { label: "ФОП 3 група без ПДВ", action: "fop3" },
          { label: "ФОП 3 група з ПДВ", action: "fop3vat" },
          { label: "Я ще не знаю / пропустити", action: "skip" },
        ],
      };
    } else {
      if (userInput === "fop3" || userInput === "fop3vat" || userInput === "skip") {
        newData.taxSystem = userInput === "fop3" ? "ФОП 3 група без ПДВ" : 
                           userInput === "fop3vat" ? "ФОП 3 група з ПДВ" : "Не вказано";
      }
      
      nextStep = "complete";
      
      response = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Готово! Я налаштував твій кабінет. Тепер ти можеш створювати рахунки, записувати доходи та витрати, додавати співробітників, формувати звіти — усе через цей чат.",
        timestamp: new Date(),
        quickActions: [
          { label: "Створити перший демо-рахунок", action: "create_invoice" },
          { label: "Додати витрату", action: "add_expense" },
          { label: "Показати аналітику", action: "show_analytics" },
        ],
      };
      
      if (onOnboardingComplete) {
        setTimeout(() => onOnboardingComplete(), 500);
      }
    }

    setUserData(newData);
    setCurrentStep(nextStep);
    setMessages((prev) => [...prev, response]);
    
    if (onOnboardingStep) {
      onOnboardingStep(nextStep, newData);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === "add_expense") {
      setAddExpenseOpen(true);
      return;
    }
    // Handle payment actions
    if (action.startsWith("open_payment_")) {
      const taxType = action.replace("open_payment_", "");
      onOpenPaymentApproval?.(taxType);
      return;
    }
    
    if (action === "open_payments_tab") {
      onChatCommand?.("navigate:payments");
      return;
    }
    
    if (action === "open_income_book") {
      onChatCommand?.("navigate:income-book");
      return;
    }

    // Handle document-related quick actions (from proactive messages)
    if (action === "explain_risks") {
      handleSendMessage("Поясни ризики цього документа детально");
      return;
    }
    if (action === "explain_simple") {
      handleSendMessage("Поясни цей документ простими словами");
      return;
    }
    if (action.startsWith("check_contractor:")) {
      const code = action.replace("check_contractor:", "");
      handleSendMessage(`Перевір контрагента з кодом ${code} в реєстрах`);
      return;
    }
    if (action === "dismiss") {
      // Just dismiss the quick action, no message needed
      return;
    }
    
    // NEW: Document navigation quick actions
    if (action === "show_in_document" && documentContext) {
      documentContext.navigateToTab?.("document");
      return;
    }
    
    if (action === "compare_versions" && documentContext) {
      documentContext.navigateToTab?.("history");
      setTimeout(() => documentContext.scrollToSection?.("document-history-versions"), 300);
      return;
    }
    
    if (action === "export_audit") {
      toast({ title: "Експорт аудиту розпочато" });
      return;
    }
    
    if (action === "open_graph" && documentContext) {
      documentContext.navigateToTab?.("integration");
      setTimeout(() => documentContext.scrollToSection?.("document-integration-relations"), 300);
      return;
    }
    
    if (action === "show_transactions" && documentContext) {
      documentContext.navigateToTab?.("integration");
      setTimeout(() => documentContext.scrollToSection?.("document-integration-accounting"), 300);
      return;
    }
    
    if (action === "show_payments" && documentContext) {
      documentContext.navigateToTab?.("integration");
      setTimeout(() => documentContext.scrollToSection?.("document-integration-relations"), 300);
      return;
    }
    
    if (action === "discrepancy_example") {
      handleSendMessage("Покажи приклад формулювання для акту розбіжностей");
      return;
    }
    
    if (action === "discrepancy_template") {
      handleSendMessage("Дай шаблон акту розбіжностей");
      return;
    }
    
    handleSendMessage(action);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Сьогодні";
    if (isYesterday(date)) return "Вчора";
    return format(date, "d MMMM yyyy", { locale: uk });
  };

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach((message) => {
      const dateLabel = getDateLabel(message.timestamp);
      const existingGroup = groups.find(g => g.date === dateLabel);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateLabel, messages: [message] });
      }
    });
    
    return groups;
  };

  const isMobile = useIsMobile();

  return (
    <div className="h-full w-full flex flex-col bg-sidebar text-sidebar-foreground overflow-hidden">

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className={`${fullScreen ? "px-3 py-2 pb-4" : "px-4 pt-4 pb-0"} w-full max-w-full`}>
            
            {/* Template Test Progress Banner */}
            {templateTestState?.enabled && (
              <div className="mb-4 p-2.5 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-primary flex items-center gap-1.5">
                    🧪 Тестування шаблону
                  </span>
                  <span className="text-muted-foreground">
                    {templateTestState.currentFieldIndex + 1} / {templateTestState.fields.length}
                  </span>
                </div>
                <Progress 
                  value={((templateTestState.currentFieldIndex + 1) / templateTestState.fields.length) * 100} 
                  className="h-1.5"
                />
              </div>
            )}
            
            <div className="space-y-6 w-full max-w-full overflow-hidden">
          {groupMessagesByDate().map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="px-2 py-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{group.date}</span>
                </div>
              </div>
              
              {group.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  } ${message.role === "system" ? "justify-center" : ""}`}
                >
                  {message.role === "system" ? (
                    <div className="px-3 py-2 bg-primary/10 rounded-lg border border-primary/20 text-xs text-center max-w-full mx-4">
                      <p className="text-foreground break-words [overflow-wrap:anywhere]">{message.content}</p>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          message.role === "assistant" 
                            ? "bg-chat-bubble-ai text-primary border border-border" 
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0 max-w-[calc(100%-40px)]">
                    {(() => {
                      const parsed = message.role === "assistant"
                        ? parseCalendarProposal(message.content)
                        : null;
                      const visibleText = parsed ? parsed.cleanedText : message.content;
                      return (
                        <>
                          <div
                            className={`px-3 py-2 shadow-sm rounded-lg border ${
                              message.role === "assistant"
                                ? "bg-chat-bubble-ai text-chat-bubble-ai-foreground border-border"
                                : "bg-chat-bubble-user text-chat-bubble-user-foreground border-primary/30"
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap">{visibleText}</p>
                          </div>
                          {parsed && (
                            <div className="pt-2">
                              <AiEventProposalCard
                                proposal={parsed.proposal}
                                cabinetId={activeCabinet?.id ?? null}
                              />
                            </div>
                          )}
                        </>
                      );
                    })()}
                    <div className={`flex items-center gap-2 ${message.role === "user" ? "justify-end" : ""}`}>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {format(message.timestamp, "HH:mm")}
                      </span>
                    </div>
                    {message.role === "assistant" && message.clarification && (
                      <div className="pt-2">
                        <ClarificationChips
                          question={message.clarification.question}
                          options={message.clarification.options}
                          onSelect={(value) => handleSendMessageInternal(value)}
                          disabled={isTyping}
                        />
                      </div>
                    )}
                    {message.role === "assistant" && message.actions && message.actions.length > 0 && (
                      <div className="pt-2 space-y-2">
                        {message.actions.map((action, idx) => (
                          <ActionCard
                            key={idx}
                            action={action}
                            state={message.actionStates?.[idx] ?? "pending"}
                            onConfirm={() => handleActionConfirm(message.id, idx, action)}
                            onDismiss={() => handleActionDismiss(message.id, idx)}
                          />
                        ))}
                      </div>
                    )}
                    {message.quickActions && (
                      <div className="flex flex-wrap gap-2 pt-1 pb-1">
                        {message.quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickAction(action.action)}
                            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm font-medium shadow-[0_1px_2px_0_hsl(var(--foreground)/0.04)] hover:bg-accent hover:border-primary/50 hover:shadow-[0_2px_4px_0_hsl(var(--foreground)/0.06)] transition-all duration-200 active:scale-95"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                      )}
                    </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-chat-bubble-ai text-primary border border-border">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="rounded-lg px-3 py-2 bg-chat-bubble-ai border border-border w-fit shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        </ScrollArea>
        
      </div>

      {/* Footer - приховуємо на мобільному в fullScreen режимі (input керується MobileFooter) */}
      {!fullScreen && (
        <div className="bg-sidebar px-2 pb-2 space-y-1.5">
          {/* Quick Prompts Row */}
          <QuickPromptsRow
            prompts={getContextualPrompts(activeCabinet, activeTab)}
            onPromptClick={(text) => setInputValue(text)}
            className="px-1"
          />
          
          <div className="bg-card rounded-xl border border-border shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.03),0_4px_12px_-2px_hsl(var(--foreground)/0.12)] ring-1 ring-border/50">
            {/* Рівень 1: Textarea + кнопки справа */}
            <div className="flex items-stretch">
              {/* Textarea — займає всю ширину зліва */}
              <div className="flex-1 py-1.5 pl-3 pr-1">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напиши повідомлення..."
                  rows={1}
                  className="w-full resize-none bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none py-1 min-h-[32px] max-h-[200px] text-sm leading-relaxed"
                />
              </div>
              
              {/* Права колонка: Sparkles + Send горизонтально */}
              <div className="flex items-center gap-1.5 p-1.5">
                {/* AI Prompts button */}
                <button
                  onClick={() => setCommandOpen(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  title="AI-підказки"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                
                {/* Send button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className={cn("m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0 disabled:opacity-40", inputValue.trim() ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground/40 cursor-default")}
                  aria-label="Відправити"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Рівень 2: Plus зліва, Mic справа */}
            <div className="flex items-center justify-between px-3 pb-1.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label="Додати"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-36 p-1" align="start" side="top">
                  <Button variant="ghost" className="w-full justify-start gap-2 h-9 rounded-lg">
                    <FileUp className="w-4 h-4" />
                    <span>Файл</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-2 h-9 rounded-lg">
                    <Camera className="w-4 h-4" />
                    <span>Камера</span>
                  </Button>
                </PopoverContent>
              </Popover>
              
              {/* Mic button */}
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 rounded-full border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                aria-label="Голосовий ввід"
              >
                <Mic className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          
          <UnifiedCommandPalette 
            open={commandOpen}
            onOpenChange={setCommandOpen}
            activeCabinet={activeCabinet}
            activeTab={activeTab}
            onChatCommand={onChatCommand}
            onPromptSelect={(text) => setInputValue(text)}
          />
         <AddExpenseSheet open={addExpenseOpen} onOpenChange={setAddExpenseOpen} cabinetId={activeCabinet?.id} />
        </div>
      )}
    </div>
  );
};

export default ChatOrchestrator;
