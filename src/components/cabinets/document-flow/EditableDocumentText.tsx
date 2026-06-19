import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { RotateCcw, FileEdit, Sparkles, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RichTextEditor } from "./RichTextEditor";
import { AICardStrip } from "./cards/AICardStrip";
import type { UnifiedAICardData, AICardStatus, AIAuditEntry } from "@/types/aiVerification";

export interface TextChange {
  id: string;
  lineIndex: number;
  originalText: string;
  newText: string;
  type: "modified" | "added" | "deleted";
}

// Document context for contextual AI card generation
interface DocumentContext {
  contractor?: { id: string; name: string; code: string };
  amount?: number;
  dueDate?: string;
  date?: string;
}

interface EditableDocumentTextProps {
  originalText: string;
  isEditing: boolean;
  documentContext?: DocumentContext;
  currentVersionLabel?: string;
  onTextChange?: (newText: string, changes: TextChange[]) => void;
  onSave?: (newText: string, changes: TextChange[]) => void;
  onCancel?: () => void;
  className?: string;
}

// Calculate next minor version from current label
const getNextVersionLabel = (current?: string): string => {
  if (!current) return "v1.0";
  const match = current.match(/v(\d+)\.(\d+)/);
  if (!match) return "v1.0";
  const major = parseInt(match[1]);
  const minor = parseInt(match[2]) + 1;
  return `v${major}.${minor}`;
};

// Calculate diff between original and edited text
const calculateChanges = (originalLines: string[], editedLines: string[]): TextChange[] => {
  const changes: TextChange[] = [];
  const maxLength = Math.max(originalLines.length, editedLines.length);

  for (let i = 0; i < maxLength; i++) {
    const original = originalLines[i] ?? "";
    const edited = editedLines[i] ?? "";

    if (original !== edited) {
      if (!original && edited) {
        changes.push({
          id: `change-${i}`,
          lineIndex: i,
          originalText: "",
          newText: edited,
          type: "added",
        });
      } else if (original && !edited) {
        changes.push({
          id: `change-${i}`,
          lineIndex: i,
          originalText: original,
          newText: "",
          type: "deleted",
        });
      } else {
        changes.push({
          id: `change-${i}`,
          lineIndex: i,
          originalText: original,
          newText: edited,
          type: "modified",
        });
      }
    }
  }

  return changes;
};

// Demo document text - NO line breaks inside <p> tags for reliable TipTap matching
const DEMO_DOCUMENT_TEXT = `<h2>ДОГОВІР ПОСТАВКИ № ДОГ-2025-001</h2>
<p>м. Київ, 15.01.2025</p>
<p>ТОВ Технопром (ЄДРПОУ: 12345678), в особі директора Іванова І.І., що діє на підставі Статуту, з однієї сторони, та ФОП Петренко П.П. (РНОКПП: 1234567890), з іншої сторони, уклали цей Договір про наступне:</p>
<h3>1. ПРЕДМЕТ ДОГОВОРУ</h3>
<p>1.1. Постачальник зобов'язується поставити, а Покупець прийняти та оплатити товар згідно з Специфікацією.</p>
<h3>2. ЦІНА ТА УМОВИ ОПЛАТИ</h3>
<p>2.1. Загальна вартість товару становить 960000 грн (дев'ятсот шістдесят тисяч гривень).</p>
<p>2.2. Оплата здійснюється протягом 5 банківських днів з моменту поставки.</p>
<p>2.3. У разі прострочення оплати Покупець сплачує пеню в розмірі 0.1% за кожен день.</p>
<h3>3. ВІДПОВІДАЛЬНІСТЬ</h3>
<p>3.1. Сторона, яка порушила договір, відшкодовує іншій стороні прямі та непрямі збитки.</p>
<p>3.2. Форс-мажором вважаються будь-які надзвичайні обставини.</p>
<h3>4. СТРОК ДІЇ</h3>
<p>4.1. Договір діє до 31.12.2025.</p>`.trim();

// Document type for contextual card generation
interface DocumentForCards {
  contractor?: { id: string; name: string; code: string };
  amount?: number;
  dueDate?: string;
  date?: string;
}

// Helper to format amount for display
const formatAmountForCard = (amount: number): string => {
  return amount.toLocaleString('uk-UA').replace(/,/g, ' ');
};

// Helper to format date from ISO to DD.MM.YYYY
const formatDateForCard = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Demo data for auto-filled fields - contextual textRef matching
// Exported for reuse in View mode
export const generateDemoAutoFilledCards = (
  text: string, 
  document?: DocumentForCards
): UnifiedAICardData[] => {
  const cards: UnifiedAICardData[] = [];
  const plainText = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  
  // ЄДРПОУ - search for contractor code from document
  const edrpouCode = document?.contractor?.code;
  if (edrpouCode && plainText.includes(edrpouCode)) {
    cards.push({
      id: "af1",
      type: "auto-filled",
      label: "ЄДРПОУ Замовника",
      value: edrpouCode,
      status: "approved",
      confidence: 100,
      source: "contractor",
      textRef: edrpouCode,
      aiComment: "Код підтверджено в ЄДР. ТОВ «Діджитал Солюшнс» — активний платник.",
    });
  } else if (plainText.includes('12345678')) {
    // Fallback to demo data
    cards.push({
      id: "af1",
      type: "auto-filled",
      label: "ЄДРПОУ",
      value: "12345678",
      status: "approved",
      confidence: 100,
      source: "contractor",
      textRef: "12345678",
      aiComment: "Код підтверджено в ЄДР. Статус: активний платник ПДВ.",
    });
  }
  
  // ІПН Виконавця - search for IPN pattern
  if (plainText.includes('1234567890')) {
    cards.push({
      id: "af1b",
      type: "auto-filled",
      label: "ІПН Виконавця",
      value: "1234567890",
      status: "approved",
      confidence: 100,
      source: "profile",
      textRef: "1234567890",
      aiComment: "Ваш ІПН. Дані підтверджено в реєстрі.",
    });
  }
  
  // Контрагент - search for contractor name from document
  const contractorName = document?.contractor?.name;
  if (contractorName) {
    // Extract main name without quotes for search
    const cleanName = contractorName.replace(/[«»""']/g, '').trim();
    // Try to find a unique short identifier (e.g., "Діджитал Солюшнс", "ВиробникПлюс")
    const nameParts = cleanName.split(/\s+/);
    // Look for longest matching part in text
    let matchedRef: string | null = null;
    for (let i = nameParts.length; i > 0; i--) {
      const candidate = nameParts.slice(0, i).join(' ');
      if (plainText.includes(candidate)) {
        matchedRef = candidate;
        break;
      }
    }
    // Also try individual words (skip org form)
    if (!matchedRef) {
      for (const part of nameParts) {
        if (part.length > 3 && plainText.includes(part) && !['ТОВ', 'ПП', 'ФОП', 'ПрАТ'].includes(part)) {
          matchedRef = part;
          break;
        }
      }
    }
    
    if (matchedRef) {
      cards.push({
        id: "af2",
        type: "auto-filled",
        label: "Контрагент",
        value: contractorName,
        status: "approved",
        confidence: 98,
        source: "contractor",
        textRef: matchedRef,
        aiComment: "Дані отримано з довідника контрагентів. Компанія верифікована в ЄДР.",
      });
    }
  } else if (plainText.includes('Технопром')) {
    // Fallback to demo data
    cards.push({
      id: "af2",
      type: "auto-filled",
      label: "Контрагент",
      value: "ТОВ Технопром",
      status: "approved",
      confidence: 98,
      source: "contractor",
      textRef: "Технопром",
      aiComment: "Дані отримано з довідника контрагентів. Компанія верифікована в ЄДР.",
    });
  }
  
  // IBAN - search for bank account
  const ibanMatch = plainText.match(/UA\d{27}/);
  if (ibanMatch) {
    cards.push({
      id: "af2b",
      type: "auto-filled",
      label: "IBAN",
      value: ibanMatch[0].substring(0, 10) + "..." + ibanMatch[0].slice(-4),
      status: "approved",
      confidence: 100,
      source: "profile",
      textRef: ibanMatch[0],
      aiComment: "Ваш рахунок в АТ «МОНОБАНК». Дані актуальні.",
    });
  }
  
  // Сума - search for amount from document or detect missing amount
  const amount = document?.amount;
  if (amount !== undefined && amount > 0) {
    const rawAmount = String(amount);
    const formattedAmount = formatAmountForCard(amount);
    // Try raw number first, then formatted
    const textRefToUse = plainText.includes(rawAmount) ? rawAmount : 
                         plainText.includes(formattedAmount) ? formattedAmount : null;
    
    if (textRefToUse) {
      cards.push({
        id: "af3",
        type: "auto-filled",
        label: "Сума",
        value: `${formattedAmount} грн`,
        status: "approved",
        confidence: 85,
        source: "ai",
        textRef: textRefToUse,
        aiComment: "Сума розпізнана з тексту договору.",
      });
    }
  } else if (plainText.includes('960000')) {
    // Fallback to demo data
    cards.push({
      id: "af3",
      type: "auto-filled",
      label: "Сума",
      value: "960 000 грн",
      status: "approved",
      confidence: 85,
      source: "ai",
      textRef: "960000",
      aiComment: "Сума розпізнана з тексту договору.",
    });
  } else if (plainText.includes('становить — грн')) {
    // Special case: amount is missing! Critical error for ДОГ-2024-016
    cards.push({
      id: "af3-error",
      type: "auto-filled",
      label: "⚠️ Сума",
      value: "НЕ ВКАЗАНА",
      status: "needs_review",
      confidence: 0,
      source: "ai",
      textRef: "становить — грн",
      aiComment: "❌ КРИТИЧНА ПОМИЛКА: Сума договору не заповнена! Текст: «становить — грн» без числового значення.",
      suggestions: ["Вкажіть суму договору перед підписанням"],
    });
  }
  
  // Термін дії - search for dueDate with multiple Ukrainian formats
  const dueDate = document?.dueDate;
  if (dueDate) {
    const formattedDateDot = formatDateForCard(dueDate); // "10.12.2025"
    // Ukrainian long format: "10 грудня 2025"
    const dateObj = new Date(dueDate);
    const months = ["січня", "лютого", "березня", "квітня", "травня", "червня", 
                    "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
    const formattedDateUkr = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    const formattedDateUkrWithR = `${formattedDateUkr} р.`;
    
    // Try multiple formats (Ukrainian contracts use "10 грудня 2025 р.")
    let textRefToUse: string | null = null;
    if (plainText.includes(formattedDateUkrWithR)) {
      textRefToUse = formattedDateUkrWithR;
    } else if (plainText.includes(formattedDateUkr)) {
      textRefToUse = formattedDateUkr;
    } else if (plainText.includes(formattedDateDot)) {
      textRefToUse = formattedDateDot;
    }
    
    if (textRefToUse) {
      cards.push({
        id: "af4",
        type: "auto-filled",
        label: "Термін дії",
        value: `до ${formattedDateUkr}`,
        status: "approved",
        confidence: 95,
        source: "ai",
        textRef: textRefToUse,
        aiComment: "Дата закінчення договору. Залишилось ~11 місяців.",
      });
    }
  } else if (plainText.includes('31.12.2025')) {
    // Fallback to demo data
    cards.push({
      id: "af4",
      type: "auto-filled",
      label: "Термін",
      value: "до 31.12.2025",
      status: "needs_review",
      confidence: 72,
      source: "ai",
      textRef: "31.12.2025",
      aiComment: "Дата закінчення договору.",
      suggestions: ["Уточніть дату в п.4.1 договору"],
    });
  }
  
  // Fallback: if no contextual cards found, try regex patterns
  if (cards.length === 0) {
    // Find any date in DD.MM.YYYY format
    const dateMatch = plainText.match(/\d{1,2}\.\d{2}\.\d{4}/);
    if (dateMatch) {
      cards.push({
        id: "fallback-date",
        type: "auto-filled",
        label: "Дата",
        value: dateMatch[0],
        status: "needs_review",
        confidence: 60,
        source: "ai",
        textRef: dateMatch[0],
        aiComment: "Знайдено дату в документі.",
      });
    }
    
    // Find any amount pattern with "грн"
    const amountMatch = plainText.match(/(\d[\d\s]*)\s*грн/);
    if (amountMatch) {
      cards.push({
        id: "fallback-amount",
        type: "auto-filled",
        label: "Сума",
        value: amountMatch[0],
        status: "needs_review",
        confidence: 50,
        source: "ai",
        textRef: amountMatch[1].replace(/\s/g, '').trim(),
        aiComment: "Знайдено суму в документі.",
      });
    }
  }
  
  return cards;
};

// Demo data for AI verification results - contextual textRef matching
// Exported for reuse in View mode
export const generateDemoVerificationCards = (text: string): UnifiedAICardData[] => {
  const cards: UnifiedAICardData[] = [];
  const plainText = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  
  // Define patterns that match real Ukrainian contract templates - ordered by importance
  const patterns = [
    {
      id: "v1",
      searchTexts: ["Виконавець зобов'язується надати", "Виконавець зобов'язується", "Постачальник зобов'язується", "зобов'язується надати"],
      label: "п.1.1",
      value: "Предмет договору",
      status: "approved" as const,
      aiComment: "Стандартне формулювання предмета договору. Відповідає ГКУ.",
      clauseRef: "п.1.1",
    },
    {
      id: "v2",
      searchTexts: ["банківських днів", "робочих днів", "календарних днів"],
      label: "п.2.3",
      value: "Умови оплати",
      status: "approved" as const,
      aiComment: "10 банківських днів — стандартний термін для B2B. Прийнятні умови.",
      clauseRef: "п.2.3",
    },
    {
      id: "v3",
      searchTexts: ["пеню у розмірі 0,1%", "пеню у розмірі", "пеню в розмірі", "штраф у розмірі"],
      label: "п.5.2",
      value: "Штрафні санкції",
      status: "needs_review" as const,
      aiComment: "⚠️ Пеня 0,1% за день = 36,5% річних! При затримці 30 днів — 3% від суми боргу.",
      suggestions: ["Розгляньте зменшення до 0,05% або встановіть ліміт 10%"],
      clauseRef: "п.5.2",
    },
    {
      id: "v4",
      searchTexts: ["автоматично пролонгується", "автоматичне продовження", "автопролонгація"],
      label: "п.4.2",
      value: "Автопролонгація",
      status: "needs_review" as const,
      aiComment: "Договір автоматично продовжується. Для розірвання потрібно письмово повідомити за 30 днів до закінчення.",
      suggestions: ["Додайте нагадування на 10 листопада 2025"],
      clauseRef: "п.4.2",
    },
    {
      id: "v5",
      searchTexts: ["непрямі збитки", "упущену вигоду", "моральну шкоду"],
      label: "п.3.1",
      value: "Відшкодування збитків",
      status: "needs_review" as const,
      aiComment: "Формулювання 'непрямі збитки' занадто широке і створює невизначені ризики.",
      suggestions: [
        "Замінити на 'прямі документально підтверджені збитки'",
        "Додати ліміт відповідальності"
      ],
      clauseRef: "п.3.1",
    },
    {
      id: "v6",
      searchTexts: ["надзвичайні обставини", "форс-мажор", "непереборна сила"],
      label: "п.3.2",
      value: "Форс-мажор",
      status: "needs_review" as const,
      aiComment: "Визначення форс-мажору занадто загальне. Без посилання на сертифікат ТПП важко буде довести форс-мажор у суді.",
      suggestions: [
        "Додати: 'підтверджені сертифікатом ТПП України'",
        "Перелічити конкретні обставини"
      ],
      clauseRef: "п.3.2",
    },
    {
      id: "v7",
      searchTexts: ["конфіденційну інформацію", "комерційна таємниця", "не підлягає розголошенню"],
      label: "п.6.1",
      value: "Конфіденційність",
      status: "approved" as const,
      aiComment: "Стандартне застереження про конфіденційність. Відповідає практиці.",
      clauseRef: "п.6.1",
    },
    {
      id: "v8",
      searchTexts: ["Без ПДВ", "без ПДВ", "платник єдиного податку"],
      label: "п.2.2",
      value: "Податковий статус",
      status: "approved" as const,
      aiComment: "ФОП на єдиному податку 3 групи. Ставка 5% від доходу. ПДВ не нараховується.",
      clauseRef: "п.2.2",
    },
  ];
  
  // Find matching patterns in text
  for (const pattern of patterns) {
    let matchedRef: string | null = null;
    
    for (const searchText of pattern.searchTexts) {
      if (plainText.includes(searchText)) {
        matchedRef = searchText;
        break;
      }
    }
    
    if (matchedRef) {
      cards.push({
        id: pattern.id,
        type: "ai-verified",
        label: pattern.label,
        value: pattern.value,
        status: pattern.status,
        aiComment: pattern.aiComment,
        suggestions: (pattern as { suggestions?: string[] }).suggestions,
        clauseRef: pattern.clauseRef,
        textRef: matchedRef,
      });
    }
  }
  
  return cards;
};

export const EditableDocumentText = ({
  originalText,
  isEditing,
  currentVersionLabel,
  documentContext,
  onTextChange,
  onSave,
  onCancel,
  className,
}: EditableDocumentTextProps) => {
  const isMobile = useIsMobile();
  const [editedText, setEditedText] = useState(originalText);
  
  // Ref to access the editor's ScrollArea for programmatic scrolling
  const editorScrollRef = useRef<HTMLDivElement>(null);
  
  // AI Cards state - collapsed by default on mobile for more document space
  const [aiCards, setAiCards] = useState<UnifiedAICardData[]>([]);
  const [stripExpanded, setStripExpanded] = useState(!isMobile);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  // Scroll target for card strip (set when clicking text in editor)
  const [clickedFromTextId, setClickedFromTextId] = useState<string | null>(null);
  // Separate state for scroll target (only set on click, not hover)
  const [activeScrollTargetId, setActiveScrollTargetId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  // Track if AI analysis is stale after text edits
  const [isStale, setIsStale] = useState(false);
  
  // Audit log (in-memory)
  const [auditLog, setAuditLog] = useState<AIAuditEntry[]>([]);

  // Reset edited text when original changes or editing starts
  // Auto-generate AI cards with full verification when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Use demo text if originalText is empty or short (for reliable demo)
      const textToUse = originalText && originalText.length > 100 
        ? originalText 
        : DEMO_DOCUMENT_TEXT;
      
      setEditedText(textToUse);
      
      // AUTO-GENERATE both auto-filled and verification cards on edit mode start
      const autoFilledCards = generateDemoAutoFilledCards(textToUse, documentContext);
      const verificationCards = generateDemoVerificationCards(textToUse);
      setAiCards([...autoFilledCards, ...verificationCards]);
      setHasVerified(true); // Mark as verified since we generate all cards
      setIsStale(false);
    } else {
      // Clear cards when exiting edit mode
      setAiCards([]);
      setHasVerified(false);
      setIsStale(false);
    }
  }, [isEditing, originalText, documentContext]);

  // Calculate changes
  const changes = useMemo(() => {
    const originalLines = originalText.split("\n");
    const editedLines = editedText.split("\n");
    return calculateChanges(originalLines, editedLines);
  }, [originalText, editedText]);

  const hasChanges = changes.length > 0;

  // Handle text change with orphaned card validation
  const handleTextChange = useCallback((newText: string) => {
    setEditedText(newText);
    const originalLines = originalText.split("\n");
    const editedLines = newText.split("\n");
    const newChanges = calculateChanges(originalLines, editedLines);
    onTextChange?.(newText, newChanges);
    
    // Check if AI cards are still valid (orphaned detection)
    const plainText = newText.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
    setAiCards(prev => prev.map(card => {
      if (card.textRef) {
        const isOrphaned = !plainText.includes(card.textRef);
        return isOrphaned !== card.isOrphaned ? { ...card, isOrphaned } : card;
      }
      return card;
    }));
    
    // Mark AI verification as stale if already verified
    if (hasVerified && !isStale) {
      setIsStale(true);
    }
  }, [originalText, onTextChange, hasVerified, isStale]);

  // Reset to original
  const handleReset = useCallback(() => {
    setEditedText(originalText);
    const newChanges: TextChange[] = [];
    onTextChange?.(originalText, newChanges);
  }, [originalText, onTextChange]);
  
  // AI Verification handler
  const handleAIVerification = useCallback(async () => {
    setIsVerifying(true);
    
    // Simulate AI verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (isStale) {
      // Re-verification: regenerate ALL cards based on current text
      const newAutoFilledCards = generateDemoAutoFilledCards(editedText);
      const newVerificationCards = generateDemoVerificationCards(editedText);
      setAiCards([...newAutoFilledCards, ...newVerificationCards]);
      setIsStale(false);
      
      toast.success("Перевірку оновлено", {
        description: `Проаналізовано ${newAutoFilledCards.length + newVerificationCards.length} елементів`,
      });
    } else {
      // First verification: add verification cards to existing auto-filled cards
      const verificationCards = generateDemoVerificationCards(editedText);
      setAiCards(prev => [...prev, ...verificationCards]);
      
      const needsReview = verificationCards.filter(c => c.status === "needs_review").length;
      const approved = verificationCards.filter(c => c.status === "approved").length;
      
      toast.success("AI-перевірка завершена", {
        description: `${approved} пунктів ОК, ${needsReview} потребують уваги`,
      });
    }
    
    setHasVerified(true);
    setIsVerifying(false);
  }, [isStale, editedText]);
  
  // Accept card handler
  const handleAccept = useCallback((cardId: string, comment?: string) => {
    const card = aiCards.find(c => c.id === cardId);
    if (!card) return;
    
    setAiCards(prev => prev.map(c => 
      c.id === cardId 
        ? { 
            ...c, 
            status: "accepted" as AICardStatus,
            userAction: "accepted" as const,
            userComment: comment,
            actionTimestamp: new Date().toISOString()
          }
        : c
    ));
    
    // Audit log
    setAuditLog(prev => [...prev, {
      cardId,
      action: "accepted" as const,
      previousStatus: card.status,
      newStatus: "accepted" as AICardStatus,
      userComment: comment,
      timestamp: new Date().toISOString(),
    }]);
    
    toast.success("Прийнято", { description: card.label });
  }, [aiCards]);
  
  // Dismiss card handler
  const handleDismiss = useCallback((cardId: string, comment?: string) => {
    const card = aiCards.find(c => c.id === cardId);
    if (!card) return;
    
    setAiCards(prev => prev.map(c => 
      c.id === cardId 
        ? { 
            ...c, 
            status: "dismissed" as AICardStatus,
            userAction: "dismissed" as const,
            userComment: comment,
            actionTimestamp: new Date().toISOString()
          }
        : c
    ));
    
    // Audit log
    setAuditLog(prev => [...prev, {
      cardId,
      action: "dismissed" as const,
      previousStatus: card.status,
      newStatus: "dismissed" as AICardStatus,
      userComment: comment,
      timestamp: new Date().toISOString(),
    }]);
    
    toast.info("Ігноровано", { description: card.label });
  }, [aiCards]);
  
  // Card click - set active highlight AND scroll target
  const handleCardClick = useCallback((cardId: string) => {
    setHoveredCardId(cardId);
    setActiveScrollTargetId(cardId); // Trigger scroll only on click
    
    // Clear active states after 2 seconds
    setTimeout(() => {
      setHoveredCardId(prev => prev === cardId ? null : prev);
      setActiveScrollTargetId(null);
    }, 2000);
  }, []);
  
  // Auto-scroll to highlighted text ONLY when activeScrollTargetId changes (click, not hover)
  // Uses global document.querySelector since TipTap decorations may be deep in DOM
  useEffect(() => {
    if (!activeScrollTargetId) return;
    
    let attempts = 0;
    const maxAttempts = 30;
    const intervalMs = 100;
    let timeoutId: number | undefined;
    
    const tryScroll = () => {
      attempts++;
      
      // Debug: log all highlights in DOM
      // Search globally in DOM for TipTap decorations with data-card-id
      const highlightEl = document.querySelector(
        `[data-card-id="${activeScrollTargetId}"]`
      ) as HTMLElement | null;
      
      if (highlightEl) {
        
        // Use native scrollIntoView - works reliably regardless of CSS/TipTap structure
        highlightEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
        
        // Visual feedback - pulse animation
        highlightEl.style.animation = 'none';
        highlightEl.offsetHeight; // Trigger reflow
        highlightEl.style.animation = 'highlight-pulse 1.5s ease-out';
        
        return; // Success!
      }
      
      // Retry if not found (TipTap may still be rendering decorations)
      if (attempts < maxAttempts) {
        timeoutId = window.setTimeout(tryScroll, intervalMs);
      } else {
        console.warn(`[AI Scroll] Element with data-card-id="${activeScrollTargetId}" not found after ${maxAttempts} attempts`);
        toast.warning("Фрагмент не знайдено в тексті", {
          description: "Перевірте відповідність значення в картці тексту документа"
        });
      }
    };
    
    // Start with small delay for TipTap decoration rendering
    timeoutId = window.setTimeout(tryScroll, 50);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeScrollTargetId]);

  // Transform aiCards to highlight format for editor
  const aiHighlights = useMemo(() => 
    aiCards
      .filter(card => card.textRef && card.textRef.length > 1)
      .map(card => ({
        id: card.id,
        textRef: card.textRef!,
        status: card.status,
      })),
    [aiCards]
  );

  // Handle click on highlighted text in editor - triggers scroll in AICardStrip via scrollToCardId prop
  // Handle click on highlighted text → scroll to corresponding AI card
  const handleHighlightClick = useCallback((cardId: string) => {
    if (import.meta.env.DEV) console.log(`[Text->Card] handleHighlightClick: ${cardId}`);
    
    // Ensure the strip is expanded so the card is visible
    setStripExpanded(true);
    
    // Set highlight state
    setHoveredCardId(cardId);
    
    // CRITICAL: Reset to null first to force useEffect re-trigger even for same cardId
    setClickedFromTextId(null);
    
    // Double-rAF to ensure null is processed before new value
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (import.meta.env.DEV) console.log(`[Text->Card] Setting clickedFromTextId: ${cardId}`);
        setClickedFromTextId(cardId);
      });
    });
    
    // Clear scroll trigger after animation completes
    setTimeout(() => setClickedFromTextId(null), 1200);
  }, []);

  if (!isEditing) {
    return (
      <ScrollArea className={cn("flex-1", className)}>
        <pre className="whitespace-pre-wrap text-sm font-mono text-foreground/90 leading-relaxed p-6">
          {originalText}
        </pre>
      </ScrollArea>
    );
  }

  return (
    <div className={cn("flex flex-col h-full min-w-0 overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-muted-foreground" />
          <Badge 
            variant="outline" 
            className="text-xs h-6 px-2 bg-muted/50 border-border font-medium"
          >
            Чернетка {getNextVersionLabel(currentVersionLabel)}
          </Badge>
          {hasVerified && (
            <span className="text-xs text-success font-medium">
              ✓ Перевірено
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* AI Verification / Refresh button */}
          {(!hasVerified || isStale) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={isStale ? "default" : "outline"}
                    size="sm" 
                    className={cn(
                      "h-7 gap-1.5 text-xs",
                      isStale && "bg-warning hover:bg-warning/90 text-warning-foreground border-warning"
                    )}
                    onClick={handleAIVerification}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isStale ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {isVerifying 
                      ? "Перевірка..." 
                      : isStale 
                        ? "Оновити перевірку" 
                        : "Перевірити AI"
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isStale 
                    ? "Текст змінено. Натисніть для повторного аналізу" 
                    : "Запустити AI-перевірку документа"
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {hasChanges && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Скинути зміни</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* AI Card Strip with stale indicator */}
      {aiCards.length > 0 && (
        <div className="relative">
          {/* Stale warning banner */}
          {isStale && (
            <div className="absolute -top-0 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="bg-warning/20 text-warning-foreground text-xs px-3 py-1 rounded-full border border-warning/50 flex items-center gap-1.5 shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                Текст змінено — перевірка може бути неактуальною
              </div>
            </div>
          )}
          <AICardStrip
            cards={aiCards}
            highlightedId={hoveredCardId ?? undefined}
            scrollToCardId={clickedFromTextId ?? undefined}
            onCardHover={setHoveredCardId}
            onCardClick={handleCardClick}
            onAccept={handleAccept}
            onDismiss={handleDismiss}
            isExpanded={stripExpanded}
            onToggleExpand={() => setStripExpanded(prev => !prev)}
            className={cn(isStale && "opacity-70")}
          />
        </div>
      )}

      {/* WYSIWYG Editor - stable key, highlights update via plugin state */}
      <div className="flex-1 min-h-0">
        <RichTextEditor
          key="editor-stable"
          ref={editorScrollRef}
          content={editedText}
          onChange={handleTextChange}
          className="h-full"
          aiHighlights={aiHighlights}
          activeHighlightId={hoveredCardId}
          onHighlightClick={handleHighlightClick}
        />
      </div>
    </div>
  );
};
