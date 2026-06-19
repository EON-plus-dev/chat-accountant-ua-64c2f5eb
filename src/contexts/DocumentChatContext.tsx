import { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { auditLogger } from '@/lib/auditLogger';

// Command types for document-chat communication
export type DocumentChatCommand = 
  | { type: 'explain_simple'; documentId: string }
  | { type: 'explain_risks'; documentId: string; risks: string[] }
  | { type: 'check_contractor'; contractorCode: string; contractorName: string }
  | { type: 'explain_field'; fieldName: string; value: string }
  | { type: 'compare_template'; documentId: string; templateType: string }
  | { type: 'ask_question'; question: string; context: DocumentContext };

export interface DocumentContext {
  documentId: string;
  documentType: string;
  documentNumber?: string;
  summary?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  parties?: Array<{ name: string; code?: string; role: string }>;
  amount?: number;
  currency?: string;
}

export interface ProactiveMessage {
  id: string;
  type: 'insight' | 'warning' | 'suggestion' | 'action';
  content: string;
  actions?: Array<{ label: string; command: DocumentChatCommand }>;
}

interface DocumentChatContextValue {
  // Send command to chat
  sendCommand: (command: DocumentChatCommand) => void;
  // Current document context
  currentDocument: DocumentContext | null;
  setCurrentDocument: (doc: DocumentContext | null) => void;
  // Proactive messages queue
  proactiveMessages: ProactiveMessage[];
  addProactiveMessage: (message: Omit<ProactiveMessage, 'id'>) => void;
  dismissProactiveMessage: (id: string) => void;
}

const DocumentChatContext = createContext<DocumentChatContextValue | null>(null);

export const useDocumentChat = () => {
  const context = useContext(DocumentChatContext);
  // Return null-safe object if not in provider
  if (!context) {
    return {
      sendCommand: () => {},
      currentDocument: null,
      setCurrentDocument: () => {},
      proactiveMessages: [],
      addProactiveMessage: () => {},
      dismissProactiveMessage: () => {},
    };
  }
  return context;
};

// Format command for chat message
const formatCommandForChat = (command: DocumentChatCommand): string => {
  switch (command.type) {
    case 'explain_simple':
      return 'Поясни цей документ простими словами';
    case 'explain_risks':
      return `Поясни ризики цього документа: ${command.risks.join(', ')}`;
    case 'check_contractor':
      return `Перевір контрагента ${command.contractorName} (${command.contractorCode}) в реєстрах`;
    case 'explain_field':
      return `Поясни поле "${command.fieldName}" зі значенням "${command.value}"`;
    case 'compare_template':
      return `Порівняй цей документ з типовим шаблоном ${command.templateType}`;
    case 'ask_question':
      return command.question;
    default:
      return '';
  }
};

interface DocumentChatProviderProps {
  children: ReactNode;
  onChatCommand?: (command: string) => void;
}

export const DocumentChatProvider = ({ 
  children, 
  onChatCommand 
}: DocumentChatProviderProps) => {
  const [currentDocument, setCurrentDocument] = useState<DocumentContext | null>(null);
  const [proactiveMessages, setProactiveMessages] = useState<ProactiveMessage[]>([]);
  
  const sendCommand = useCallback((command: DocumentChatCommand) => {
    // Convert command to chat message format
    const chatMessage = formatCommandForChat(command);
    onChatCommand?.(chatMessage);
    
    // Log to audit trail
    auditLogger.log('document_chat_command', { 
      command: command.type,
      details: command,
    }, currentDocument?.documentId);
  }, [onChatCommand, currentDocument]);

  const addProactiveMessage = useCallback((message: Omit<ProactiveMessage, 'id'>) => {
    const newMessage: ProactiveMessage = {
      ...message,
      id: `proactive-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    setProactiveMessages(prev => [...prev, newMessage]);
  }, []);

  const dismissProactiveMessage = useCallback((id: string) => {
    setProactiveMessages(prev => prev.filter(m => m.id !== id));
  }, []);
  
  return (
    <DocumentChatContext.Provider value={{ 
      sendCommand, 
      currentDocument, 
      setCurrentDocument,
      proactiveMessages,
      addProactiveMessage,
      dismissProactiveMessage,
    }}>
      {children}
    </DocumentChatContext.Provider>
  );
};
