/**
 * DocumentSidePanel - Права бокова панель вкладки "Документ" (Mobile only)
 * 
 * Вкладки:
 * - Структура
 * - Коментарі
 * - Версії (замість Розбіжностей)
 * 
 * Функціонал:
 * - Адаптивні лейбли для планшетів (768-1023px)
 * - Підказки клавіатурних скорочень в tooltips
 */

import { 
  FileText, MessageCircle, History,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getShortcutHint } from "@/hooks/useDocumentShortcuts";
import { StructurePanel } from "./panels/StructurePanel";
import { CommentsPanel, type DocumentComment } from "./panels/CommentsPanel";
import { DocumentVersionsSection } from "../DocumentVersionsSection";
import type { DocumentVersion } from "@/config/documentVersioningConfig";
import type { MentionMember } from "@/components/ui/mention-textarea";

export type SidePanelTab = "structure" | "comments" | "versions";

export interface DocumentSidePanelProps {
  // State
  isOpen: boolean;
  onToggle: () => void;
  activeTab: SidePanelTab;
  onTabChange: (tab: SidePanelTab) => void;
  
  // Data
  documentId?: string;
  documentHtml?: string;
  documentType?: string;
  comments: DocumentComment[];
  versions?: DocumentVersion[];
  teamMembers?: MentionMember[];
  
  // ScrollSpy - активна секція
  activeSectionId?: string;
  
  // Callbacks - Structure
  onScrollToSection: (sectionId: string) => void;
  
  // Callbacks - Comments
  pendingCommentFragment?: { id: string; text: string };
  onAddComment?: (content: string, fragmentId?: string, fragmentText?: string, mentionedUserIds?: string[]) => void;
  onReplyToComment?: (commentId: string, content: string, mentionedUserIds?: string[]) => void;
  onDeleteComment?: (commentId: string) => void;
  onResolveComment?: (commentId: string) => void;
  onScrollToFragment?: (fragmentId: string) => void;
  onMentionClick?: (userId: string) => void;
  
  // Callbacks - Versions
  onVersionView?: (versionId: string) => void;
  onVersionCompare?: (v1: DocumentVersion, v2: DocumentVersion) => void;
  onVersionRestore?: (version: DocumentVersion) => void;
  
  // Responsive
  isMobile?: boolean;
  
  className?: string;
}

export const DocumentSidePanel = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  documentId,
  documentHtml,
  documentType,
  comments,
  versions = [],
  teamMembers = [],
  activeSectionId,
  onScrollToSection,
  pendingCommentFragment,
  onAddComment,
  onReplyToComment,
  onDeleteComment,
  onResolveComment,
  onScrollToFragment,
  onMentionClick,
  onVersionView,
  onVersionCompare,
  onVersionRestore,
  isMobile = false,
  className,
}: DocumentSidePanelProps) => {
  const openCommentsCount = comments.filter(c => !c.isResolved).length;
  const versionsCount = versions.length;
  
  // Визначаємо планшетний режим для адаптивних лейблів
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  
  // Адаптивні лейбли для планшетів
  const tabLabels = {
    structure: isTablet ? "Стр." : "Структура",
    comments: isTablet ? "Ком." : "Коментарі",
    versions: isTablet ? "Вер." : "Версії",
  };
  
  const tabContent = (
    <TooltipProvider delayDuration={300}>
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => onTabChange(v as SidePanelTab)} 
        className="flex flex-col h-full"
      >
        <TabsList className="w-full grid grid-cols-3 mx-3 mt-2 shrink-0" style={{ width: 'calc(100% - 1.5rem)' }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="structure" className="text-xs px-1.5 gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tabLabels.structure}</span>
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Структура ({getShortcutHint("structure")})
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="comments" className="text-xs px-1.5 gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tabLabels.comments}</span>
                {openCommentsCount > 0 && (
                  <Badge variant="secondary" className="ml-0.5 text-[10px] h-4 px-1 hidden sm:flex">
                    {openCommentsCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Коментарі ({getShortcutHint("comments")})
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsTrigger value="versions" className="text-xs px-1.5 gap-1">
                <History className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tabLabels.versions}</span>
                {versionsCount > 0 && (
                  <Badge variant="secondary" className="ml-0.5 text-[10px] h-4 px-1 hidden sm:flex">
                    {versionsCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Версії
            </TooltipContent>
          </Tooltip>
        </TabsList>
        
        <TabsContent value="structure" className="flex-1 mt-0 overflow-hidden">
          <StructurePanel
            documentHtml={documentHtml}
            documentType={documentType}
            activeSection={activeSectionId}
            onScrollToSection={onScrollToSection}
          />
        </TabsContent>
        
        <TabsContent value="comments" className="flex-1 mt-0 overflow-hidden">
          <CommentsPanel
            comments={comments}
            teamMembers={teamMembers}
            pendingFragment={pendingCommentFragment}
            onAddComment={onAddComment}
            onReplyToComment={onReplyToComment}
            onDeleteComment={onDeleteComment}
            onResolveComment={onResolveComment}
            onScrollToFragment={onScrollToFragment}
            onMentionClick={onMentionClick}
          />
        </TabsContent>
        
        <TabsContent value="versions" className="flex-1 mt-0 overflow-hidden">
          <DocumentVersionsSection
            documentId={documentId || 'demo'}
            currentVersion={versions[0]?.versionNumber}
            onViewVersion={(versionId) => onVersionView?.(versionId)}
            onCompareVersions={(versionIds) => {
              const v1 = versions.find(v => v.id === versionIds[0]);
              const v2 = versions.find(v => v.id === versionIds[1]);
              if (v1 && v2) onVersionCompare?.(v1, v2);
            }}
            onRestoreVersion={(versionId) => {
              const version = versions.find(v => v.id === versionId);
              if (version) onVersionRestore?.(version);
            }}
          />
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
  
  // Mobile: Sheet/Drawer
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Панель документа</SheetTitle>
          </SheetHeader>
          {tabContent}
        </SheetContent>
      </Sheet>
    );
  }
  
  // Desktop: Collapsible Panel
  if (!isOpen) {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "flex flex-col h-full border-l bg-background",
        "w-[320px] lg:w-[360px]",
        className
      )}
      data-section="document-side-panel"
    >
      {tabContent}
    </div>
  );
};

// MobileTabBar was removed - ContextShelf is now adaptive for all screens
