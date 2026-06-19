import { useMemo } from "react";
import { ARTICLES } from "@/portal/data/articles";
import CmsSeoPanel from "./CmsSeoPanel";
import PreviewPageAnalytics from "./PreviewPageAnalytics";
import CmsIdeasPanel from "./CmsIdeasPanel";
import CmsEditPreviewPane from "./CmsEditPreviewPane";
import type { PreviewMode } from "./CmsWorkspaceTabs";
import type { ContentIdea } from "@/admin/hooks/useContentIdeas";

const SITE_ORIGIN = "https://chat-accountant-ua.lovable.app";

interface Screenshot {
  dataUrl: string;
  rect: { x: number; y: number; w: number; h: number };
  path: string;
}

interface CmsPreviewFrameProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  mode: PreviewMode;
  onChatPrompt: (prompt: string) => void;
  onOpenIdeaInEditor?: (idea: ContentIdea) => void;
  onAttachScreenshot?: (shot: Screenshot) => void;
}

export default function CmsPreviewFrame({
  currentPath,
  mode,
  onChatPrompt,
  onOpenIdeaInEditor,
  onAttachScreenshot,
}: CmsPreviewFrameProps) {
  const matched = useMemo(() => {
    const slug = currentPath.replace(/^\/+/, "").split("/").pop() || "";
    return ARTICLES.find((a) => a.slug === slug || `/${a.slug}` === currentPath);
  }, [currentPath]);

  if (mode === "page") {
    return (
      <div className="absolute inset-0">
        <iframe
          src={`${SITE_ORIGIN}${currentPath}`}
          className="w-full h-full border-0"
          title="Site Preview"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    );
  }

  if (mode === "seo") {
    return (
      <div className="absolute inset-0 bg-background overflow-hidden">
        <CmsSeoPanel currentPath={currentPath} onChatPrompt={onChatPrompt} />
      </div>
    );
  }

  if (mode === "analytics") {
    return (
      <div className="absolute inset-0 bg-background overflow-hidden">
        <PreviewPageAnalytics currentPath={currentPath} onChatPrompt={onChatPrompt} />
      </div>
    );
  }

  // mode === "edit": уніфікований редактор контенту + панель ідей.
  return (
    <div className="absolute inset-0 flex bg-background overflow-hidden">
      <div className="flex-1 min-w-0 overflow-hidden">
        <CmsEditPreviewPane
          article={matched}
          currentPath={currentPath}
          onChatPrompt={onChatPrompt}
          onAttachScreenshot={onAttachScreenshot}
          onCreateIdeaFromSelection={(text) =>
            onChatPrompt(
              `Створи ідею контенту для сторінки ${currentPath} на основі виділеного фрагмента:\n"""${text}"""`,
            )
          }
        />
      </div>
      <div className="hidden lg:block w-[320px] shrink-0 border-l border-border/60 bg-muted/20">
        <CmsIdeasPanel
          currentPath={currentPath}
          onOpenInEditor={(idea) => onOpenIdeaInEditor?.(idea)}
          onChatPrompt={onChatPrompt}
        />
      </div>
    </div>
  );
}
