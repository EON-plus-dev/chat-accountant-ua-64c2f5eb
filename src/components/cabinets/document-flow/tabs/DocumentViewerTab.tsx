/**
 * DocumentViewerTab - Оновлена вкладка "Документ"
 * 
 * Модульна архітектура:
 * - DocumentToolbar: Верхня панель інструментів
 * - ContextShelf: Горизонтальна стрічка карток (Структура, Коментарі) - Hidden in edit mode
 * - DocumentContentArea: Основна зона тексту
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useDocumentShortcuts } from "@/hooks/useDocumentShortcuts";
import { Button } from "@/components/ui/button";
import { 
  EditableDocumentText, 
  type TextChange, 
  generateDemoAutoFilledCards, 
  generateDemoVerificationCards 
} from "../EditableDocumentText";
import { 
  DocumentToolbar, 
  type ViewLayoutMode 
} from "../viewer/DocumentToolbar";
import { DocumentContentArea } from "../viewer/DocumentContentArea";
import { ContextShelf, type ContextShelfTab } from "../viewer/ContextShelf";
import { VersionDiffViewer } from "../VersionDiffViewer";
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import { AICardStrip } from "../cards/AICardStrip";
import { AddCommentDialog } from "../dialogs/AddCommentDialog";
import { InlinePrintPreview } from "../viewer/InlinePrintPreview";
import { type DocumentComment } from "../viewer/panels/CommentsPanel";
import { type DocumentField } from "../viewer/panels/FieldsPanel";
import { type DiscrepancyCard } from "../viewer/panels/DiscrepanciesPanel";
import { 
  parseDocumentStructure, 
  generateDemoStructure,
  type DocumentSection 
} from "../viewer/utils/documentStructureParser";
import { 
  getVersionsForDocument,
  type DocumentVersion
} from "@/config/documentVersioningConfig";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import type { DocumentSummary, ContractSummary, FieldConfidence } from "@/types/documentSummary";
import type { MentionMember } from "@/components/ui/mention-textarea";
import type { UnifiedAICardData } from "@/types/aiVerification";

interface DocumentViewerTabProps {
  flowDocument?: FlowDocument;
  bodyText: string;
  isEditing?: boolean;
  canEditContent?: boolean;
  currentVersion?: number;
  versions?: DocumentVersion[];
  onVersionChange?: (versionId: string) => void;
  onStartContentEdit?: () => void;
  onCancelContentEdit?: () => void;
  onSaveContentEdit?: () => void;
  onTextChange?: (text: string, changes: TextChange[]) => void;
  onResetTextChanges?: () => void;
  onChatPrompt?: (prompt: string) => void;
  onExplainSelection?: (text: string) => void;
  onCheckRisk?: (text: string) => void;
  onDownloadPDF?: () => void;
  summary?: DocumentSummary | ContractSummary;
  onFieldClick?: (field: FieldConfidence) => void;
  onFieldValueUpdate?: (fieldName: string, newValue: string) => void;
  onCompareVersions?: () => void;
  discrepancyCards?: DiscrepancyCard[];
  onAddDiscrepancyCard?: (card: Partial<DiscrepancyCard>) => void;
  onEditDiscrepancyCard?: (card: DiscrepancyCard) => void;
  onDeleteDiscrepancyCard?: (id: string) => void;
  onCreateDiscrepancyAct?: () => void;
  comments?: DocumentComment[];
  onAddComment?: (content: string, fragmentId?: string, fragmentText?: string, mentionedUserIds?: string[]) => void;
  onReplyToComment?: (commentId: string, content: string, mentionedUserIds?: string[]) => void;
  onDeleteComment?: (commentId: string) => void;
  onResolveComment?: (commentId: string) => void;
  editableFields?: DocumentField[];
  onFieldValueChange?: (fieldId: string, newValue: string) => void;
  scrollToAnchor?: string;
  onAskAI?: (card: DiscrepancyCard) => void;
  teamMembers?: MentionMember[];
  // Callback to sync unsaved changes state with parent for tab navigation guard
  onUnsavedChangesChange?: (hasChanges: boolean) => void;
  className?: string;
}

export const DocumentViewerTab = ({
  flowDocument,
  bodyText,
  isEditing = false,
  canEditContent = false,
  currentVersion,
  versions,
  onVersionChange,
  onStartContentEdit,
  onCancelContentEdit,
  onSaveContentEdit,
  onTextChange,
  onChatPrompt,
  onExplainSelection,
  onCheckRisk,
  discrepancyCards = [],
  onAddDiscrepancyCard,
  onEditDiscrepancyCard,
  onDeleteDiscrepancyCard,
  onCreateDiscrepancyAct,
  onAskAI,
  comments = [],
  onAddComment,
  onReplyToComment,
  onDeleteComment,
  onResolveComment,
  editableFields = [],
  onFieldValueChange,
  scrollToAnchor,
  teamMembers = [],
  onUnsavedChangesChange,
  className,
}: DocumentViewerTabProps) => {
  // Versions - use unified source (getVersionsForDocument)
  const documentVersions = useMemo(() => 
    versions || getVersionsForDocument(flowDocument?.id || 'demo'),
    [versions, flowDocument?.id]
  );
  
  const currentVersionLabel = documentVersions[0]?.versionLabel || "v1.0";
  const [selectedVersionLabel, setSelectedVersionLabel] = useState(currentVersionLabel);
  
  // Document structure for ContextShelf
  const documentSections = useMemo(() => {
    if (bodyText.trim().startsWith('<')) {
      const parsed = parseDocumentStructure(bodyText);
      if (parsed.length > 0) return parsed;
    }
    return generateDemoStructure(flowDocument?.type || 'contract');
  }, [bodyText, flowDocument?.type]);
  
  // Toolbar state
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [viewLayout, setViewLayout] = useState<ViewLayoutMode>("continuous");
  const [zoom, setZoom] = useState(100);
  
  // Context Shelf state (desktop view mode)
  // Default to "comments" since structure is hidden in view mode (showStructure=false)
  const [activeShelfTab, setActiveShelfTab] = useState<ContextShelfTab>("comments");
  const [isShelfExpanded, setIsShelfExpanded] = useState(true);
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  
  // Version diff viewer state
  const [diffViewerOpen, setDiffViewerOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    left: DocumentVersion;
    right: DocumentVersion;
  } | null>(null);
  
  // Unsaved changes dialog state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [pendingModeChange, setPendingModeChange] = useState<"view" | null>(null);
  
  // Selection state
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [pendingCommentFragment, setPendingCommentFragment] = useState<{ id: string; text: string } | null>(null);
  
  // Add comment dialog state
  const [addCommentDialogOpen, setAddCommentDialogOpen] = useState(false);
  // Reply mode state - stores parent comment info for AddCommentDialog
  const [replyToComment, setReplyToComment] = useState<{
    id: string;
    authorName: string;
    content: string;
  } | null>(null);
  
  // Inline print preview state (Edit mode) - replaces editor area
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  // Track current edited text for print preview
  const [editedText, setEditedText] = useState(bodyText);
  
  // View mode no longer uses AI cards - they are in Edit mode only
  
  // Scroll anchor state for section navigation
  const [currentScrollAnchor, setCurrentScrollAnchor] = useState<string | undefined>(scrollToAnchor);
  
  // Content ref for ScrollSpy
  const contentAreaRef = useRef<HTMLDivElement>(null);
  
  // ScrollSpy для автоматичного підсвічування активної секції
  const { activeId: activeSectionId } = useScrollSpy({
    containerRef: contentAreaRef,
    sectionSelector: '[data-section-id], [data-anchor]',
    rootMargin: "-10% 0px -70% 0px",
  });
  
  // Клавіатурні скорочення
  useDocumentShortcuts({
    onTabChange: (tab) => {
      setActiveShelfTab(tab as ContextShelfTab);
    },
    onTogglePanel: () => setIsShelfExpanded(prev => !prev),
    enabled: !isEditing && mode !== "edit",
  });
  
  // Can edit logic
  const canEdit = canEditContent && 
    !["signed", "archived", "registered", "confirmed"].includes(flowDocument?.status || "");
  
  // Handle mode change with unsaved changes check
  const handleModeChange = useCallback((newMode: "view" | "edit") => {
    if (newMode === "edit" && canEdit) {
      setMode("edit");
      setHasUnsavedChanges(false);
      onUnsavedChangesChange?.(false);
      onStartContentEdit?.();
    } else if (mode === "edit") {
      // Always show dialog when exiting edit mode
      setPendingModeChange("view");
      setUnsavedDialogOpen(true);
    } else {
      setMode("view");
    }
  }, [canEdit, mode, onStartContentEdit, onUnsavedChangesChange]);
  
  // Handle text changes to track unsaved state
  const handleTextChange = useCallback((text: string, changes: TextChange[]) => {
    const hasChanges = changes.length > 0;
    setHasUnsavedChanges(hasChanges);
    setEditedText(text); // Track for print preview
    onUnsavedChangesChange?.(hasChanges); // Sync with parent for tab navigation guard
    onTextChange?.(text, changes);
  }, [onTextChange, onUnsavedChangesChange]);
  
  // Handle save and close from dialog
  const handleSaveAndClose = useCallback(() => {
    onSaveContentEdit?.();
    setMode("view");
    setHasUnsavedChanges(false);
    onUnsavedChangesChange?.(false); // Sync with parent
    setUnsavedDialogOpen(false);
    setPendingModeChange(null);
  }, [onSaveContentEdit, onUnsavedChangesChange]);
  
  // Handle discard changes from dialog
  const handleDiscardChanges = useCallback(() => {
    onCancelContentEdit?.();
    setMode("view");
    setHasUnsavedChanges(false);
    onUnsavedChangesChange?.(false); // Sync with parent
    setUnsavedDialogOpen(false);
    setPendingModeChange(null);
  }, [onCancelContentEdit, onUnsavedChangesChange]);
  
  // Handle version change - auto-compare with previous version when selecting from toolbar
  const handleVersionChange = useCallback((versionId: string) => {
    const versionIndex = documentVersions.findIndex(v => v.id === versionId);
    const version = documentVersions[versionIndex];
    
    if (version) {
      setSelectedVersionLabel(version.versionLabel);
      onVersionChange?.(versionId);
      
      // Find previous version for comparison (versions are sorted newest first)
      const previousVersion = versionIndex < documentVersions.length - 1 
        ? documentVersions[versionIndex + 1] 
        : null;
      
      if (previousVersion) {
        // Auto-open diff viewer with previous version
        setCompareVersions({
          left: previousVersion,
          right: version,
        });
        setDiffViewerOpen(true);
        
        toast({
          title: `Порівняння версій`,
          description: `${previousVersion.versionLabel} ↔ ${version.versionLabel}`,
        });
      } else {
        // This is the oldest version - no comparison available
        toast({
          title: `Версія ${version.versionLabel}`,
          description: `Це найстаріша версія документа`,
        });
      }
    }
  }, [documentVersions, onVersionChange]);
  
  // Handle search navigation
  const handleNavigateMatch = useCallback((direction: "prev" | "next") => {
    if (searchMatchCount === 0) return;
    
    if (direction === "next") {
      setCurrentMatchIndex((prev) => (prev + 1) % searchMatchCount);
    } else {
      setCurrentMatchIndex((prev) => (prev - 1 + searchMatchCount) % searchMatchCount);
    }
  }, [searchMatchCount]);
  
  // Handle add comment from selection
  const handleAddCommentFromSelection = useCallback(() => {
    if (selection) {
      const fragmentId = `frag-${Date.now()}`;
      setPendingCommentFragment({ id: fragmentId, text: selection.text });
      setActiveShelfTab("comments");
      setIsShelfExpanded(true);
    }
  }, [selection]);
  
  // Handle add comment from shelf button (without selection)
  const handleAddCommentFromShelf = useCallback(() => {
    setAddCommentDialogOpen(true);
  }, []);
  
  // Handle submit comment from dialog (supports both new comment and reply modes)
  const handleSubmitCommentFromDialog = useCallback((content: string, mentionedUserIds: string[]) => {
    if (replyToComment) {
      // Reply mode - use onReplyToComment
      onReplyToComment?.(replyToComment.id, content, mentionedUserIds);
      toast({
        title: "Відповідь додано",
        description: "Вашу відповідь успішно збережено",
      });
    } else if (onAddComment) {
      // New comment mode
      onAddComment(content, undefined, undefined, mentionedUserIds);
      toast({
        title: "Коментар додано",
        description: "Ваш коментар успішно збережено",
      });
    }
    // Reset reply state
    setReplyToComment(null);
  }, [replyToComment, onAddComment, onReplyToComment]);
  
  // Handle add to discrepancy from selection
  const handleAddToDiscrepancy = useCallback(() => {
    if (selection && onAddDiscrepancyCard) {
      onAddDiscrepancyCard({
        id: `disc-${Date.now()}`,
        originalText: selection.text,
        clauseReference: "Виділений фрагмент",
        status: "draft",
      });
      setActiveShelfTab("comments"); // Fallback to comments
      setIsShelfExpanded(true);
      toast({
        title: "Додано до розбіжностей",
        description: "Фрагмент додано до акту розбіжностей",
      });
    }
  }, [selection, onAddDiscrepancyCard]);
  
  // Scroll to section handler
  const handleScrollToSection = useCallback((sectionId: string) => {
    setCurrentScrollAnchor(sectionId);
    // Reset after a short delay to allow re-triggering same section
    setTimeout(() => setCurrentScrollAnchor(undefined), 100);
  }, []);
  
  
  // Sync external isEditing with internal mode
  // When external cancel happens (isEditing becomes false), reset internal mode
  useEffect(() => {
    if (!isEditing && mode === "edit") {
      setMode("view");
    }
  }, [isEditing]);
  // Sync external isEditing with internal mode
  // When external cancel happens (isEditing becomes false), reset internal mode
  useEffect(() => {
    if (!isEditing && mode === "edit") {
      setMode("view");
    }
  }, [isEditing]);
  
  // Listen for commands from AI chat
  useEffect(() => {
    const handleChatCommand = (event: Event) => {
      const customEvent = event as CustomEvent<{ type: string; payload: Record<string, unknown> }>;
      const { type, payload } = customEvent.detail || {};
      
      switch (type) {
        case 'scrollToSection':
          if (payload?.sectionId) {
            handleScrollToSection(payload.sectionId as string);
          }
          break;
        case 'highlightFragment':
          if (payload?.text) {
            // Trigger highlight via search
            setSearchQuery(payload.text as string);
          }
          break;
        case 'openVersionsPanel':
          // Versions tab removed - redirect to comments or show toast
          setActiveShelfTab('comments');
          setIsShelfExpanded(true);
          break;
        case 'openCommentsPanel':
          setActiveShelfTab('comments');
          setIsShelfExpanded(true);
          break;
        case 'openStructurePanel':
          // Structure is hidden in view mode (showStructure=false), redirect to comments
          setActiveShelfTab('comments');
          setIsShelfExpanded(true);
          break;
      }
    };
    
    window.addEventListener('document-chat-command', handleChatCommand);
    return () => window.removeEventListener('document-chat-command', handleChatCommand);
  }, [handleScrollToSection]);
  
  // Edit mode now keeps toolbar visible - handled below in unified render
  
  const openCommentsCount = comments.filter(c => !c.isResolved).length;
  const isEditMode = isEditing || mode === "edit";
  
  // Document context for Edit mode AI cards
  const documentContext = useMemo(() => flowDocument ? {
    contractor: flowDocument.contractor,
    amount: flowDocument.amount,
    dueDate: flowDocument.dueDate,
    date: flowDocument.date,
  } : undefined, [flowDocument]);
  
  return (
    <div className={cn("flex flex-col h-full", className)} data-section="document-viewer">
      {/* Toolbar - ALWAYS visible in both view and edit mode */}
      <DocumentToolbar
        mode={mode}
        onModeChange={handleModeChange}
        canEdit={canEdit}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchMatchCount={searchMatchCount}
        currentMatchIndex={currentMatchIndex}
        onNavigateMatch={handleNavigateMatch}
        viewLayout={viewLayout}
        onViewLayoutChange={setViewLayout}
        showViewLayoutToggle={false}
        zoom={zoom}
        onZoomChange={setZoom}
        versions={documentVersions}
        currentVersionLabel={selectedVersionLabel}
        onVersionChange={handleVersionChange}
        showPrintPreview={showPrintPreview}
        onPrintPreviewToggle={() => setShowPrintPreview(prev => !prev)}
      />
      
      {/* Context Shelf - Hidden in edit mode (comments are for review, not editing) */}
      {!isEditMode && (
        <ContextShelf
          activeTab={activeShelfTab}
          onTabChange={setActiveShelfTab}
          sections={documentSections}
          comments={comments}
          versions={documentVersions}
          activeSectionId={activeSectionId || undefined}
          highlightedSectionId={highlightedSectionId || undefined}
          highlightedCommentId={highlightedCommentId || undefined}
          onSectionHover={setHighlightedSectionId}
          onSectionClick={handleScrollToSection}
          onCommentHover={(fragmentId) => setHighlightedCommentId(fragmentId)}
          onCommentClick={(commentId) => {
            const comment = comments.find(c => c.id === commentId);
            if (comment?.fragmentId) {
              handleScrollToSection(comment.fragmentId);
            }
          }}
          onCommentReply={(commentId) => {
            // Find parent comment to show preview in dialog
            const parentComment = comments.find(c => c.id === commentId);
            if (parentComment) {
              setReplyToComment({
                id: parentComment.id,
                authorName: parentComment.author,
                content: parentComment.content,
              });
              setAddCommentDialogOpen(true);
            }
          }}
          onCommentResolve={(commentId) => {
            onResolveComment?.(commentId);
            toast({
              title: "Коментар вирішено",
              description: "Коментар позначено як вирішений",
            });
          }}
          onVersionView={(versionId) => {
            toast({
              title: "Перегляд версії",
              description: `Відкривається версія ${versionId} (демо)`,
            });
          }}
          onVersionCompare={(version, previousVersion) => {
            setCompareVersions({
              left: previousVersion,
              right: version,
            });
            setDiffViewerOpen(true);
          }}
          onVersionRestore={(version) => {
            toast({
              title: "Відновлення версії",
              description: `Відновлено ${version.versionLabel}`,
            });
          }}
          isExpanded={isShelfExpanded}
          onToggleExpand={() => setIsShelfExpanded(!isShelfExpanded)}
          showStructure={false}
          onAddComment={handleAddCommentFromShelf}
        />
      )}
      
      {/* Main Content Area - conditional based on mode */}
      <div className="flex-1 flex overflow-hidden" ref={contentAreaRef}>
        {isEditMode ? (
          showPrintPreview ? (
            // Inline Print Preview - replaces editor (no internal header, toggle in toolbar)
            <InlinePrintPreview
              bodyText={editedText}
              documentData={{
                type: flowDocument?.type || "Договір",
                number: flowDocument?.number || "Б/Н",
                date: flowDocument?.date || new Date().toLocaleDateString("uk-UA"),
                supplier: { name: "Постачальник", code: "" },
                buyer: flowDocument?.contractor || { name: "Покупець", code: "" },
                amount: flowDocument?.amount,
                currency: flowDocument?.currency || "UAH",
              }}
              className="flex-1"
            />
          ) : (
            <EditableDocumentText
              originalText={bodyText}
              isEditing={true}
              documentContext={documentContext}
              currentVersionLabel={selectedVersionLabel}
              onTextChange={handleTextChange}
              onSave={() => {
                onSaveContentEdit?.();
                setMode("view");
                setHasUnsavedChanges(false);
              }}
              onCancel={() => {
                if (hasUnsavedChanges) {
                  setUnsavedDialogOpen(true);
                } else {
                  onCancelContentEdit?.();
                  setMode("view");
                }
              }}
              className="flex-1"
            />
          )
        ) : (
          <DocumentContentArea
            contentType={bodyText.trim().startsWith('<') ? "html" : "plaintext"}
            htmlContent={bodyText.trim().startsWith('<') ? bodyText : undefined}
            plainText={!bodyText.trim().startsWith('<') ? bodyText : undefined}
            zoom={zoom}
            viewLayout={viewLayout}
            searchQuery={searchQuery}
            currentMatchIndex={currentMatchIndex}
            highlightedSectionId={highlightedSectionId || undefined}
            selection={selection}
            onSelectionChange={setSelection}
            onExplainSelection={onExplainSelection}
            onCheckRisk={onCheckRisk}
            onAddComment={handleAddCommentFromSelection}
            onAddToDiscrepancy={handleAddToDiscrepancy}
            showDiscrepancyOption={!!onAddDiscrepancyCard}
            showCommentOption={!!onAddComment}
            scrollToAnchor={currentScrollAnchor || scrollToAnchor}
            canEdit={canEdit}
            onStartEdit={() => {
              setMode("edit");
              onStartContentEdit?.();
            }}
            className="flex-1"
          />
        )}
      </div>
      
      {/* Version Diff Viewer */}
      {compareVersions && (
        <VersionDiffViewer
          leftVersion={compareVersions.left}
          rightVersion={compareVersions.right}
          open={diffViewerOpen}
          onClose={() => {
            setDiffViewerOpen(false);
            setCompareVersions(null);
          }}
        />
      )}
      
      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onOpenChange={setUnsavedDialogOpen}
        onSave={handleSaveAndClose}
        onDiscard={handleDiscardChanges}
        onCancel={() => setUnsavedDialogOpen(false)}
        hasChanges={hasUnsavedChanges}
      />
      
      {/* Add Comment Dialog - supports both new comment and reply modes */}
      <AddCommentDialog
        open={addCommentDialogOpen}
        onOpenChange={(open) => {
          setAddCommentDialogOpen(open);
          if (!open) setReplyToComment(null); // Reset reply state on close
        }}
        onSubmit={handleSubmitCommentFromDialog}
        teamMembers={teamMembers}
        replyToComment={replyToComment}
      />
      
      {/* Inline Print Preview is now rendered in the main content area above */}
    </div>
  );
};
