import { useState, useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import {
  type Document,
  type DocumentFlowStatus,
  type DocumentComment,
  fopDemoDocuments,
  tovDemoDocuments,
  individualDemoDocuments,
} from "@/config/documentFlowConfig";
import {
  DEMO_CURRENT_USER_ID,
  DEMO_CURRENT_USER_NAME,
  DEMO_CURRENT_USER_ROLE,
} from "@/config/businessStatusConfig";
import { type Cabinet, type CabinetType } from "@/types/cabinet";
import { getContractorsForCabinet, type Contractor } from "@/config/settingsConfig";
import {
  addVersionToDocument,
  addAuditEntry,
  type ChangedFieldInfo,
} from "@/config/documentVersioningConfig";
import { type TextChange } from "../EditableDocumentText";
import { generateDocumentHTML } from "@/config/documentTemplates";
import {
  type ApprovalState,
  getApprovalState,
  roleLabels,
} from "@/config/approvalWorkflowConfig";

// Kept for backwards compatibility
export interface EditFormState {
  title: string;
  amount: string;
  dueDate: string;
  issueNote: string;
  contractorId: string | null;
  bodyText: string;
}

interface UseDocumentEditingProps {
  document: Document | null;
  cabinet: Cabinet;
  onDocumentUpdate?: (docId: string, updates: Partial<Document>) => void;
  isReadOnly?: boolean;
}

interface UseDocumentEditingReturn {
  // Content editing
  isContentEditing: boolean;
  editedText: string;
  textChanges: TextChange[];
  startContentEdit: () => void;
  cancelContentEdit: () => void;
  saveContentEdit: () => void;
  handleTextChange: (newText: string, changes: TextChange[]) => void;
  resetTextChanges: () => void;
  
  // Version dialog
  versionDialogOpen: boolean;
  changedFields: ChangedFieldInfo[];
  handleVersionConfirm: (description: string, createVersion: boolean) => void;
  handleVersionCancel: () => void;
  
  // Approval workflow
  approvalState: ApprovalState;
  handleApprove: (comment?: string) => void;
  handleReject: (comment: string) => void;
  handleRecommend: (comment: string) => void;              // М'яке погодження
  handleRequestClarification: (comment: string) => void;   // Повернути з коментарями
  handleRespondToClarification: (comment: string) => void; // Відповідь на запит уточнення
  handleResolveComment: (commentId: string, resolved: boolean) => void; // Вирішити коментар
  
  // Computed
  canEditContent: boolean;
  isLocked: boolean;
  bodyText: string;
  contractors: Contractor[];
  
  // Legacy compatibility (deprecated)
  isEditing: boolean;
  editForm: EditFormState;
  contractorOpen: boolean;
  setContractorOpen: (open: boolean) => void;
  startEdit: () => void;
  cancelEdit: () => void;
  saveEdit: () => void;
  updateField: (field: keyof EditFormState, value: string | null) => void;
  canEdit: boolean;
  pendingUpdates: Partial<Document> | null;
}

// Get document by ID from demo data
export const getDocumentById = (cabinetType: CabinetType, documentId: string): Document | null => {
  const allDocs = cabinetType === "tov" 
    ? tovDemoDocuments 
    : cabinetType === "individual" 
    ? individualDemoDocuments 
    : fopDemoDocuments;
  return allDocs.find(d => d.id === documentId) || null;
};

// Format date helper
export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const useDocumentEditing = ({
  document: doc,
  cabinet,
  onDocumentUpdate,
  isReadOnly = false,
}: UseDocumentEditingProps): UseDocumentEditingReturn => {
  // ============================================
  // CONTENT EDITING
  // ============================================
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [textChanges, setTextChanges] = useState<TextChange[]>([]);

  // ============================================
  // VERSION DIALOG
  // ============================================
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Document> | null>(null);
  const [changedFields, setChangedFields] = useState<ChangedFieldInfo[]>([]);

  // ============================================
  // APPROVAL WORKFLOW
  // ============================================
  const [approvalState, setApprovalState] = useState<ApprovalState>(() => 
    doc ? getApprovalState(doc.id, doc.type, doc.amount, cabinet.type) : {
      required: false,
      autoApproved: true,
      chain: [],
      currentStepIndex: 0,
      status: "approved",
    }
  );

  // ============================================
  // LEGACY STATE (for backwards compatibility)
  // ============================================
  const [contractorOpen, setContractorOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    amount: "",
    dueDate: "",
    issueNote: "",
    contractorId: null,
    bodyText: "",
  });

  // Get contractors for cabinet
  const contractors = useMemo(() => getContractorsForCabinet(cabinet), [cabinet]);

  // Generate body text using HTML templates
  const getBodyText = useCallback((document: Document) => {
    // If document has custom content (edited), use it
    if ((document as any).content) {
      return (document as any).content;
    }
    // If document has bodyHtml (HTML-formatted content with styling)
    if ((document as any).bodyHtml) {
      return (document as any).bodyHtml;
    }
    // If document has pre-defined bodyText (legacy plain text), use it
    if ((document as any).bodyText) {
      return (document as any).bodyText;
    }
    // Generate HTML from template
    return generateDocumentHTML(document, cabinet);
  }, [cabinet]);

  const bodyText = useMemo(() => doc ? getBodyText(doc) : "", [doc, getBodyText]);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const lockedStatuses: DocumentFlowStatus[] = ["signed", "sent", "confirmed", "paid", "partially-paid", "registered", "archived", "cancelled"];
  const isLocked = doc ? lockedStatuses.includes(doc.status) || (doc.signatures && doc.signatures.length > 0) : true;
  const canEditContent = !isReadOnly && !isLocked;

  // Legacy compatibility
  const canEdit = canEditContent;
  const isEditing = isContentEditing;

  // ============================================
  // CONTENT EDITING ACTIONS
  // ============================================
  const startContentEdit = useCallback(() => {
    if (!canEditContent) {
      toast({
        title: "Редагування заблоковано",
        description: isLocked 
          ? "Документ підписано або в обробці. Редагування неможливе." 
          : "Ви не маєте прав для редагування",
        variant: "destructive",
      });
      return;
    }
    setEditedText(bodyText);
    setTextChanges([]);
    setIsContentEditing(true);
  }, [canEditContent, isLocked, bodyText]);

  const cancelContentEdit = useCallback(() => {
    setIsContentEditing(false);
    setEditedText(bodyText);
    setTextChanges([]);
  }, [bodyText]);

  const handleTextChange = useCallback((newText: string, changes: TextChange[]) => {
    setEditedText(newText);
    setTextChanges(changes);
  }, []);

  const resetTextChanges = useCallback(() => {
    setEditedText(bodyText);
    setTextChanges([]);
  }, [bodyText]);

  const saveContentEdit = useCallback(() => {
    if (!doc || textChanges.length === 0) {
      setIsContentEditing(false);
      return;
    }
    
    const updates: Partial<Document> = {
      // Store new content
    };
    (updates as any).content = editedText;
    
    const changes: ChangedFieldInfo[] = [{
      fieldName: "content",
      fieldLabel: "Текст документа",
      previousValue: `${textChanges.length} рядків змінено`,
      newValue: editedText.substring(0, 50) + "...",
    }];
    
    setPendingUpdates(updates);
    setChangedFields(changes);
    setVersionDialogOpen(true);
  }, [doc, editedText, textChanges]);

  // ============================================
  // VERSION DIALOG ACTIONS
  // ============================================
  const handleVersionConfirm = useCallback((description: string, createVersion: boolean) => {
    if (!doc || !pendingUpdates) return;
    
    onDocumentUpdate?.(doc.id, pendingUpdates);
    
    if (createVersion) {
      addVersionToDocument(doc.id, description, changedFields, doc.version || 1);
    }
    
    changedFields.forEach(field => {
      addAuditEntry(doc.id, "field-changed", {
        fieldName: field.fieldName,
        previousValue: field.previousValue,
        newValue: field.newValue,
      });
    });
    
    if (createVersion) {
      addAuditEntry(doc.id, "version-created", {
        comment: description,
      });
    }
    
    toast({
      title: createVersion ? "Нова версія створена" : "Зміни збережено",
      description: createVersion 
        ? `v${((doc.version || 1) + 1)}: ${description}`
        : "Документ оновлено без створення версії",
    });
    
    setPendingUpdates(null);
    setChangedFields([]);
    setVersionDialogOpen(false);
    setIsContentEditing(false);
    setTextChanges([]);
  }, [doc, pendingUpdates, changedFields, onDocumentUpdate]);

  const handleVersionCancel = useCallback(() => {
    setPendingUpdates(null);
    setChangedFields([]);
    setVersionDialogOpen(false);
  }, []);

  // ============================================
  // LEGACY ACTIONS (for backwards compatibility)
  // ============================================
  const startEdit = useCallback(() => {
    startContentEdit();
  }, [startContentEdit]);

  const cancelEdit = useCallback(() => {
    cancelContentEdit();
  }, [cancelContentEdit]);

  const saveEdit = useCallback(() => {
    saveContentEdit();
  }, [saveContentEdit]);

  const updateField = useCallback((field: keyof EditFormState, value: string | null) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // ============================================
  // APPROVAL WORKFLOW ACTIONS
  // ============================================
  const handleApprove = useCallback((comment?: string) => {
    if (!doc) return;
    
    setApprovalState(prev => {
      const newChain = [...prev.chain];
      if (newChain[prev.currentStepIndex]) {
        newChain[prev.currentStepIndex] = {
          ...newChain[prev.currentStepIndex],
          status: "approved",
          timestamp: new Date().toISOString(),
          comment,
          clarificationRequested: false,
          clarificationReason: undefined,
        };
      }
      
      const nextIndex = prev.currentStepIndex + 1;
      const allApproved = nextIndex >= newChain.length;
      
      return {
        ...prev,
        chain: newChain,
        currentStepIndex: nextIndex,
        status: allApproved ? "approved" : "in-progress",
      };
    });
    
    addAuditEntry(doc.id, "status-changed", { comment: comment || "Документ погоджено" });
    toast({ title: "Документ погоджено", description: "Передано на наступний етап" });
  }, [doc]);

  const handleReject = useCallback((comment: string) => {
    if (!doc) return;
    
    setApprovalState(prev => {
      const newChain = [...prev.chain];
      if (newChain[prev.currentStepIndex]) {
        newChain[prev.currentStepIndex] = {
          ...newChain[prev.currentStepIndex],
          status: "rejected",
          timestamp: new Date().toISOString(),
          comment,
        };
      }
      
      return {
        ...prev,
        chain: newChain,
        status: "rejected",
      };
    });
    
    addAuditEntry(doc.id, "status-changed", { comment: `Відхилено: ${comment}` });
    toast({ title: "Документ відхилено", description: comment, variant: "destructive" });
  }, [doc]);

  // Рекомендація до реєстрації (м'яке погодження від юриста/бухгалтера)
  const handleRecommend = useCallback((comment: string) => {
    if (!doc) return;
    
    setApprovalState(prev => {
      const newChain = [...prev.chain];
      if (newChain[prev.currentStepIndex]) {
        newChain[prev.currentStepIndex] = {
          ...newChain[prev.currentStepIndex],
          status: "approved",
          timestamp: new Date().toISOString(),
          comment: `Рекомендую до реєстрації: ${comment}`,
          recommendedAt: new Date().toISOString(),
          recommendationComment: comment,
          clarificationRequested: false,
          clarificationReason: undefined,
        };
      }
      
      const nextIndex = prev.currentStepIndex + 1;
      const allApproved = nextIndex >= newChain.length;
      
      return {
        ...prev,
        chain: newChain,
        currentStepIndex: nextIndex,
        status: allApproved ? "approved" : "in-progress",
      };
    });
    
    addAuditEntry(doc.id, "status-changed", { comment: `Рекомендовано до реєстрації: ${comment}` });
    toast({ 
      title: "Рекомендовано до реєстрації", 
      description: "Документ передано на наступний етап з рекомендацією" 
    });
  }, [doc]);

  // Запит на уточнення (повернення з коментарями)
  const handleRequestClarification = useCallback((comment: string) => {
    if (!doc) return;
    
    // 1. Отримати інформацію про поточного погоджувача
    const currentApprover = approvalState.chain[approvalState.currentStepIndex];
    const approverRoleLabel = currentApprover?.role 
      ? roleLabels[currentApprover.role] 
      : "Погоджувач";
    
    // 2. Створити новий коментар з позначкою ⚠️
    const newComment: DocumentComment = {
      id: `cmt-clarification-${Date.now()}`,
      authorId: DEMO_CURRENT_USER_ID,
      authorName: DEMO_CURRENT_USER_NAME,
      authorRole: DEMO_CURRENT_USER_ROLE,
      content: `⚠️ Запит на уточнення від ${approverRoleLabel}:\n\n${comment}`,
      createdAt: new Date().toISOString(),
    };
    
    // 3. Оновити документ через callback (додати коментар)
    const existingComments = doc.comments || [];
    onDocumentUpdate?.(doc.id, {
      comments: [...existingComments, newComment],
    });
    
    // 4. Встановити статус workflow
    setApprovalState(prev => {
      const newChain = [...prev.chain];
      if (newChain[prev.currentStepIndex]) {
        newChain[prev.currentStepIndex] = {
          ...newChain[prev.currentStepIndex],
          status: "needs-clarification",
          clarificationRequested: true,
          clarificationReason: comment,
          timestamp: new Date().toISOString(),
        };
      }
      
      return {
        ...prev,
        chain: newChain,
        status: "in-progress",
      };
    });
    
    // 5. Додати audit entry
    addAuditEntry(doc.id, "note-added", { 
      comment: `⚠️ Запит на уточнення: ${comment}` 
    });
    
    toast({ 
      title: "Документ повернуто на доопрацювання", 
      description: "Коментар додано. Автор отримає повідомлення про необхідність уточнення",
      variant: "default"
    });
  }, [doc, approvalState, onDocumentUpdate]);

  // Відповідь на запит уточнення (від автора документа)
  const handleRespondToClarification = useCallback((responseComment: string) => {
    if (!doc) return;
    
    // 1. Створити новий коментар з позначкою 📩
    const newComment: DocumentComment = {
      id: `cmt-response-${Date.now()}`,
      authorId: DEMO_CURRENT_USER_ID,
      authorName: DEMO_CURRENT_USER_NAME,
      authorRole: DEMO_CURRENT_USER_ROLE,
      content: `📩 Відповідь на запит уточнення:\n\n${responseComment}`,
      createdAt: new Date().toISOString(),
    };
    
    // 2. Оновити документ через callback (додати коментар)
    const existingComments = doc.comments || [];
    onDocumentUpdate?.(doc.id, {
      comments: [...existingComments, newComment],
    });
    
    // 3. Скинути статус workflow
    setApprovalState(prev => {
      const newChain = [...prev.chain];
      if (newChain[prev.currentStepIndex]) {
        newChain[prev.currentStepIndex] = {
          ...newChain[prev.currentStepIndex],
          status: "pending",                     // Повернути на "очікує"
          clarificationRequested: false,         // Скинути запит
          clarificationReason: undefined,        // Очистити причину
        };
      }
      
      return {
        ...prev,
        chain: newChain,
        status: "in-progress",
      };
    });
    
    // 4. Додати audit entry
    addAuditEntry(doc.id, "note-added", { 
      comment: `📩 Відповідь на уточнення: ${responseComment}` 
    });
    
    toast({ 
      title: "Відповідь надіслано", 
      description: "Коментар додано до документа. Документ повернуто на погодження",
    });
  }, [doc, onDocumentUpdate]);

  // Обробка вирішення коментаря
  const handleResolveComment = useCallback((commentId: string, resolved: boolean) => {
    if (!doc) return;
    
    const existingComments = doc.comments || [];
    const updatedComments = existingComments.map(comment => 
      comment.id === commentId 
        ? {
            ...comment,
            resolved,
            resolvedAt: resolved ? new Date().toISOString() : undefined,
            resolvedBy: resolved ? DEMO_CURRENT_USER_ID : undefined,
            resolvedByName: resolved ? DEMO_CURRENT_USER_NAME : undefined,
          }
        : comment
    );
    
    onDocumentUpdate?.(doc.id, {
      comments: updatedComments,
    });
    
    addAuditEntry(doc.id, "note-added", { 
      comment: resolved 
        ? `✅ Коментар позначено як вирішений` 
        : `↩️ Статус "вирішено" знято з коментаря`
    });
    
    toast({ 
      title: resolved ? "Коментар вирішено" : "Статус знято",
      description: resolved 
        ? "Коментар позначено як вирішений"
        : "Коментар повернуто в активний стан",
    });
  }, [doc, onDocumentUpdate]);

  return {
    // Content editing
    isContentEditing,
    editedText,
    textChanges,
    startContentEdit,
    cancelContentEdit,
    saveContentEdit,
    handleTextChange,
    resetTextChanges,
    
    // Version dialog
    versionDialogOpen,
    changedFields,
    handleVersionConfirm,
    handleVersionCancel,
    
    // Approval workflow
    approvalState,
    handleApprove,
    handleReject,
    handleRecommend,
    handleRequestClarification,
    handleRespondToClarification,
    handleResolveComment,
    
    // Computed
    canEditContent,
    isLocked,
    bodyText,
    contractors,
    
    // Legacy compatibility
    isEditing,
    editForm,
    contractorOpen,
    setContractorOpen,
    startEdit,
    cancelEdit,
    saveEdit,
    updateField,
    canEdit,
    pendingUpdates,
  };
};
