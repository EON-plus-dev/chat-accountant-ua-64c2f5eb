import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquare, Trash2, Loader2, X, History, Undo2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toast } from "sonner";
import { useCmsThreads } from "@/admin/hooks/useCmsThreads";
import CmsPageHistoryTimeline from "./CmsPageHistoryTimeline";

interface CmsHistoryPanelProps {
  onClose: () => void;
  currentPath?: string;
  defaultTab?: "page" | "threads";
  /** When rendered inside a Sheet (mobile), use full width instead of fixed sidebar width. */
  asSheet?: boolean;
}

export default function CmsHistoryPanel({ onClose, currentPath, defaultTab = "threads", asSheet = false }: CmsHistoryPanelProps) {
  const navigate = useNavigate();
  const { threadId: activeThreadId } = useParams<{ threadId?: string }>();
  const { threads, previews, loading, deleteThread } = useCmsThreads();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"page" | "threads">(defaultTab);

  const pendingPath = pendingId ? previews[pendingId]?.path ?? null : null;
  const pendingTitle = pendingId
    ? threads.find((t) => t.id === pendingId)?.title ||
      previews[pendingId]?.text?.slice(0, 60) ||
      "Новий чат"
    : "";

  const goToThread = (id: string, withPath: boolean) => {
    const path = previews[id]?.path;
    if (withPath && path) {
      navigate(`/admin/ai-cms/${id}?path=${encodeURIComponent(path)}`);
    } else {
      navigate(`/admin/ai-cms/${id}`);
    }
    onClose();
  };

  const handleOpenOnly = () => {
    if (!pendingId) return;
    goToThread(pendingId, true);
    setPendingId(null);
  };

  const handleRevert = () => {
    if (!pendingId) return;
    const id = pendingId;
    setPendingId(null);
    toast.info("Відкат у розробці", {
      description: "Поки що відкриваю сторінку без зміни вмісту.",
    });
    goToThread(id, true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await deleteThread(id);
    if (ok && id === activeThreadId) {
      navigate("/admin/ai-cms");
      onClose();
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar border-r border-border/50",
      asSheet ? "w-full" : "hidden md:flex md:w-[380px] flex-shrink-0"
    )}>
      <div className="flex items-center justify-between px-3 h-10 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <History className="h-4 w-4 text-muted-foreground" />
          Історія
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Закрити історію"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "page" | "threads")} className="flex-1 min-h-0 flex flex-col">
        <TabsList className="mx-2 mt-2 grid grid-cols-2 h-8">
          <TabsTrigger value="page" className="text-[11px]" disabled={!currentPath}>
            Цієї сторінки
          </TabsTrigger>
          <TabsTrigger value="threads" className="text-[11px]">
            Усі чати
          </TabsTrigger>
        </TabsList>

        <TabsContent value="page" className="flex-1 min-h-0 mt-2 mx-0">
          {currentPath ? (
            <CmsPageHistoryTimeline currentPath={currentPath} />
          ) : (
            <p className="px-3 py-6 text-xs text-muted-foreground text-center">
              Відкрийте сторінку в редакторі, щоб побачити її історію.
            </p>
          )}
        </TabsContent>

        <TabsContent value="threads" className="flex-1 min-h-0 mt-2 mx-0">
          <ScrollArea className="h-full">
            <div className="px-2 pb-2 space-y-0.5">
              {loading && (
                <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Завантаження...
                </div>
              )}
              {!loading && threads.length === 0 && (
                <p className="px-2 py-6 text-xs text-muted-foreground text-center">
                  Поки немає історії. Напишіть AI — і подія зʼявиться тут.
                </p>
              )}
              {threads.map((t) => {
                const isActive = t.id === activeThreadId;
                const preview = previews[t.id];
                const title = t.title || preview?.text?.slice(0, 60) || "Новий чат";
                return (
                  <div
                    key={t.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPendingId(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setPendingId(t.id);
                    }}
                    className={cn(
                      "group flex items-start gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50 text-foreground/80"
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">{title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {format(new Date(t.updated_at), "dd.MM.yyyy HH:mm", { locale: uk })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive shrink-0"
                      aria-label="Видалити чат"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <AlertDialog open={pendingId !== null} onOpenChange={(o) => !o && setPendingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Що зробити з цією подією?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block text-foreground font-medium truncate">{pendingTitle}</span>
              <span className="block mt-1 font-mono text-xs">
                {pendingPath ?? "Сторінка не визначена"}
              </span>
              <span className="block mt-2">
                Можете просто відкрити сторінку в редакторі або повернути її до стану перед цим
                чатом.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <Button variant="outline" onClick={handleRevert} className="gap-1.5">
              <Undo2 className="h-3.5 w-3.5" />
              Повернути
            </Button>
            <Button onClick={handleOpenOnly} className="gap-1.5">
              Відкрити
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
