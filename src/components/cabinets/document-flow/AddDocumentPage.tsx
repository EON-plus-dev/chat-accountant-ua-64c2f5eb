import { useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Cabinet } from "@/types/cabinet";
import type { DocumentType, Document } from "@/config/documentFlowConfig";
import type { DocumentTemplate } from "@/config/documentTemplatesConfig";

// Step components
import { 
  ParentDocumentSearch,
  DocumentActionSelector,
  type AddMethod, 
  type DocumentRelation,
  type DocumentAction,
} from "./steps";

// Flow components
import { CreateDocumentSplitView } from "./CreateDocumentSplitView";
import { UploadDocumentContent } from "./UploadDocumentContent";
import { TemplateSelector } from "./template-selector";

type FlowStep = "action" | "parent-search" | "template" | "editor" | "upload";

interface AddDocumentPageProps {
  cabinet: Cabinet;
  initialMode?: "new" | "upload"; // Legacy support
  onBack?: () => void;
  onDocumentCreated?: () => void;
  onNavigateToDocument?: (documentId: string) => void;
  onChatMessage?: (prompt: string) => void;
  onNavigateToCreateTemplate?: () => void;
  // Context for shortcuts (e.g., from DocumentDetailPage "Create based on")
  // Also supports AI-driven creation from ChatOrchestrator with intent parsing
  initialContext?: {
    method?: AddMethod;
    relation?: DocumentRelation;
    parentDocument?: Document;
    skipToStep?: FlowStep;
    // AI-driven creation context (Phase 1: Chat → Template integration)
    initialType?: DocumentType;
    aiSuggestedTags?: string[];
    contractorHint?: string;
    subjectHint?: string;
  };
}

interface FlowState {
  method: AddMethod | null;
  relation: DocumentRelation | null;
  parentDocument: Document | null;
  selectedType: DocumentType;
  selectedTemplate: DocumentTemplate | null;
}

export const AddDocumentPage = ({
  cabinet,
  initialMode,
  onBack,
  onDocumentCreated,
  onNavigateToDocument,
  onChatMessage,
  onNavigateToCreateTemplate,
  initialContext,
}: AddDocumentPageProps) => {
  // Determine initial step based on context
  const getInitialStep = (): FlowStep => {
    if (initialContext?.skipToStep) {
      return initialContext.skipToStep;
    }
    return "action";
  };

  const [flowStep, setFlowStep] = useState<FlowStep>(getInitialStep);
  const [state, setState] = useState<FlowState>({
    method: initialContext?.method || null,
    relation: initialContext?.relation || null,
    parentDocument: initialContext?.parentDocument || null,
    selectedType: "invoice",
    selectedTemplate: null,
  });

  // Handler for unified action selector (replaces method + relation steps)
  const handleActionSelect = useCallback((action: DocumentAction) => {
    switch (action) {
      case "create-new":
        setState(prev => ({ ...prev, method: "create", relation: "new" }));
        setFlowStep("template");
        break;
      case "create-linked":
        setState(prev => ({ ...prev, method: "create", relation: "linked" }));
        setFlowStep("parent-search");
        break;
      case "upload-new":
        setState(prev => ({ ...prev, method: "upload", relation: "new" }));
        setFlowStep("upload");
        break;
      case "upload-linked":
        setState(prev => ({ ...prev, method: "upload", relation: "linked" }));
        setFlowStep("parent-search");
        break;
    }
  }, []);

  const handleParentSelect = useCallback((parentDocument: Document) => {
    setState(prev => ({ ...prev, parentDocument }));
    
    if (state.method === "create") {
      setFlowStep("template");
    } else {
      setFlowStep("upload");
    }
  }, [state.method]);

  const handleTemplateSelect = useCallback((type: DocumentType, template: DocumentTemplate) => {
    setState(prev => ({ 
      ...prev, 
      selectedType: type, 
      selectedTemplate: template 
    }));
    setFlowStep("editor");
  }, []);

  const handleDocumentCreated = useCallback(() => {
    onDocumentCreated?.();
    onBack?.();
  }, [onDocumentCreated, onBack]);

  // Back navigation logic
  const handleStepBack = useCallback((fromStep: FlowStep) => {
    switch (fromStep) {
      case "parent-search":
        setFlowStep("action");
        break;
      case "template":
        // If we came from shortcut (skipToStep=template with parentDocument),
        // navigate back to parent document instead of going to previous step
        if (initialContext?.skipToStep === "template" && state.parentDocument) {
          onNavigateToDocument?.(state.parentDocument.id);
          return;
        }
        if (state.relation === "linked") {
          setFlowStep("parent-search");
        } else {
          setFlowStep("action");
        }
        break;
      case "upload":
        if (state.relation === "linked") {
          setFlowStep("parent-search");
        } else {
          setFlowStep("action");
        }
        break;
      case "editor":
        setFlowStep("template");
        break;
      default:
        onBack?.();
    }
  }, [state.relation, state.parentDocument, initialContext?.skipToStep, onBack, onNavigateToDocument]);

  // Render current step
  const renderStep = () => {
    switch (flowStep) {
      case "action":
        return (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b bg-background">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">Додати документ</h1>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto">
              <DocumentActionSelector onSelect={handleActionSelect} />
            </div>
          </div>
        );

      case "parent-search":
        return (
          <ParentDocumentSearch
            cabinet={cabinet}
            onSelect={handleParentSelect}
            onBack={() => handleStepBack("parent-search")}
          />
        );

      case "template":
        return (
          <TemplateSelector
            cabinet={cabinet}
            onSelect={handleTemplateSelect}
            onBack={() => handleStepBack("template")}
            onCreateTemplate={onNavigateToCreateTemplate}
            parentDocument={state.parentDocument}
            // AI-driven creation context
            initialType={initialContext?.initialType}
            aiSuggestedTags={initialContext?.aiSuggestedTags}
          />
        );

      case "upload":
        return (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b bg-background">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleStepBack("upload")}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold truncate">Завантажити файл</h1>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto px-4 md:px-6 py-4">
              <UploadDocumentContent
                cabinet={cabinet}
                parentDocument={state.parentDocument}
                onDocumentUploaded={handleDocumentCreated}
                onChatMessage={onChatMessage}
              />
            </div>
          </div>
        );

      case "editor":
        return (
          <CreateDocumentSplitView
            cabinet={cabinet}
            initialType={state.selectedType}
            initialTemplate={state.selectedTemplate}
            parentDocument={state.parentDocument}
            onBack={() => handleStepBack("editor")}
            onDocumentCreated={handleDocumentCreated}
            onNavigateToDocument={onNavigateToDocument}
            onChatMessage={onChatMessage}
            onNavigateToCreateTemplate={onNavigateToCreateTemplate}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {renderStep()}
    </div>
  );
};
