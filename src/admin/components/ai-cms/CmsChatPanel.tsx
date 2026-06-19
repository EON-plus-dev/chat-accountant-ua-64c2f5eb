import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type UIMessage,
} from "ai";
import { supabase } from "@/integrations/supabase/client";
import { Bot, ArrowUp, Square, Loader2, Check, X, ShieldAlert, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import type { CmsWorkspaceTab, PreviewMode } from "./CmsWorkspaceTabs";
import { appendPageHistory, makeId } from "./articleChangeHistory";

interface ScreenshotAttachment {
  dataUrl: string;
  rect: { x: number; y: number; w: number; h: number };
  path: string;
}

interface CmsChatPanelProps {
  collapsed: boolean;
  threadId: string | null;
  initialMessages: UIMessage[];
  currentPath: string;
  onNavigate: (path: string) => void;
  activeTab?: CmsWorkspaceTab;
  onSwitchTab?: (tab: CmsWorkspaceTab) => void;
  onPreviewModeChange?: (mode: PreviewMode) => void;
  registerPromptHandler?: (fn: (prompt: string) => void) => void;
  registerAttachmentHandler?: (fn: (shot: ScreenshotAttachment) => void) => void;
  /** When true (mobile full-screen mode), hides internal composer/quick-actions
   *  because CmsMobileFooter provides them instead. */
  mobileFullScreen?: boolean;
}

const QUICK_ACTIONS_BY_TAB: Record<CmsWorkspaceTab, { label: string; command: string }[]> = {
  dashboard: [
    { label: "Що в нас зараз?", command: "Зроби короткий огляд CMS" },
    { label: "Топ-ідей у плані", command: "Покажи топ ідей зі статусом todo" },
    { label: "Запити без контенту", command: "Покажи ідеї з джерела ai_chat_query" },
  ],
  sitemap: [
    { label: "Ідеї для /overview", command: "Покажи ідеї для сторінки /overview" },
    { label: "Створи ідею", command: "Створи ідею для поточної сторінки" },
    { label: "Знайди статтю про ЄСВ", command: "Знайди консультації по ЄСВ" },
  ],
  preview: [
    { label: "Перейди на головну", command: "Перейди на сторінку /" },
    { label: "SEO цієї сторінки", command: "Перевір SEO цієї сторінки" },
    { label: "Створи ідею тут", command: "Створи ідею контенту для поточної сторінки" },
  ],
  analytics: [
    { label: "Аудит /overview", command: "Запусти SEO-аудит для /overview" },
    { label: "SEO-проблеми", command: "Покажи сторінки з SEO-проблемами" },
    { label: "Розсинхрони", command: "Покажи розділи зі статусом desync" },
  ],
  calendar: [
    { label: "Що цього тижня?", command: "Покажи заплановані публікації на цей тиждень" },
    { label: "Створити план", command: "Запропонуй контент-план на наступний місяць" },
  ],
  settings: [
    { label: "Покажи налаштування", command: "Покажи всі налаштування CMS" },
    { label: "SEO defaults", command: "Покажи налаштування seo_defaults" },
    { label: "AI generation", command: "Покажи налаштування ai_generation" },
  ],
};

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cms-agent`;

const TOOL_NAME_LABELS: Record<string, string> = {
  navigation_go: "Навігація",
  cms_overview: "Огляд CMS",
  content_ideas_list: "Ідеї: пошук",
  content_ideas_create: "Ідеї: створення",
  content_ideas_update_status: "Ідеї: статус",
  consultations_list: "Статті: пошук",
  consultations_get: "Стаття: відкрити",
  consultations_update_field: "Стаття: правка",
  consultations_publish_toggle: "Стаття: публікація",
  consultations_bulk_publish: "Статті: масова публікація",
  consultations_bulk_seo_refresh: "Статті: масовий SEO-апдейт",
  articles_generate: "Стаття: генерація",
  cms_settings_get: "Налаштування: читання",
  cms_settings_set: "Налаштування: зміна",
};

export default function CmsChatPanel({
  collapsed,
  threadId,
  initialMessages,
  currentPath,
  onNavigate,
  activeTab = "dashboard",
  onSwitchTab,
  onPreviewModeChange,
  registerPromptHandler,
  registerAttachmentHandler,
  mobileFullScreen = false,
}: CmsChatPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef("");
  const navHandled = useRef<Set<string>>(new Set());
  const loggedHistoryRef = useRef<Set<string>>(new Set());
  const [attachment, setAttachment] = useState<ScreenshotAttachment | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: FUNCTION_URL,
        prepareSendMessagesRequest: async ({ messages, body }) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token ?? "";
          return {
            body: { messages, threadId, currentPath, ...body },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          };
        },
      }),
    [threadId, currentPath],
  );

  const chatId = threadId ?? "no-thread";

  const { messages, sendMessage, status, stop, error, addToolApprovalResponse } = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onError: (e) => console.error("[CmsChat] error", e),
  });

  // Auto-handle navigation_go tool output → trigger onNavigate
  useEffect(() => {
    for (const m of messages) {
      if (m.role !== "assistant") continue;
      for (const part of m.parts ?? []) {
        const anyPart = part as { type?: string; toolName?: string; output?: { navigated_to?: string }; toolCallId?: string };
        const isNavTool =
          anyPart.type === "tool-navigation_go" ||
          (anyPart.type === "dynamic-tool" && anyPart.toolName === "navigation_go");
        if (isNavTool && anyPart.output?.navigated_to && anyPart.toolCallId && !navHandled.current.has(anyPart.toolCallId)) {
          navHandled.current.add(anyPart.toolCallId);
          onNavigate(anyPart.output.navigated_to);
          onSwitchTab?.("preview");
          onPreviewModeChange?.("page");
        }
      }
    }
  }, [messages, onNavigate, onSwitchTab, onPreviewModeChange]);

  // (no dataUrl→File conversion needed; we attach as a FileUIPart with a data: URL)


  const sendPrompt = (text: string) => {
    if (!text.trim() || !threadId) return;
    sendMessage({ text: text.trim() });
  };

  useEffect(() => {
    if (registerPromptHandler) {
      registerPromptHandler(sendPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerPromptHandler, threadId]);

  useEffect(() => {
    if (!registerAttachmentHandler) return;
    registerAttachmentHandler((shot) => {
      setAttachment(shot);
      // Focus composer with a helpful placeholder
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerAttachmentHandler, threadId]);

  useEffect(() => {
    if (status === "ready") {
      textareaRef.current?.focus();
    }
  }, [status, threadId]);

  // Log assistant messages to per-page history when they complete.
  useEffect(() => {
    if (status !== "ready" || !currentPath) return;
    // Find the latest user prompt before each assistant message for context.
    let lastUserText = "";
    for (const m of messages) {
      if (m.role === "user") {
        const txt = (m.parts ?? [])
          .map((p) => (p as { type?: string; text?: string }))
          .filter((p) => p.type === "text")
          .map((p) => p.text ?? "")
          .join(" ")
          .trim();
        if (txt) lastUserText = txt;
        continue;
      }
      if (m.role !== "assistant") continue;
      if (loggedHistoryRef.current.has(m.id)) continue;
      const txt = (m.parts ?? [])
        .map((p) => (p as { type?: string; text?: string }))
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("\n")
        .trim();
      if (!txt) continue;
      loggedHistoryRef.current.add(m.id);
      appendPageHistory(currentPath, [
        {
          id: makeId(),
          articleId: "",
          at: new Date().toISOString(),
          author: "AI",
          kind: "ai-suggestion",
          summary: lastUserText
            ? `AI: «${lastUserText.slice(0, 80)}${lastUserText.length > 80 ? "…" : ""}»`
            : "Відповідь AI",
          prompt: lastUserText || undefined,
          excerpt: txt.slice(0, 280),
          threadId: threadId ?? undefined,
        },
      ]);
    }
  }, [status, messages, currentPath, threadId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = inputRef.current.trim();
    if (!threadId || status === "submitted" || status === "streaming") return;
    if (!v && !attachment) return;

    if (attachment) {
      const filename = `screenshot-${attachment.path.replace(/[^a-z0-9]+/gi, "_")}-${attachment.rect.w}x${attachment.rect.h}.png`;
      const context = `[Скріншот сторінки ${attachment.path}, область ${attachment.rect.w}×${attachment.rect.h}px]`;
      const text = v ? `${context}\n${v}` : `${context}\nЩо зробити з цією областю?`;
      sendMessage({
        role: "user",
        parts: [
          { type: "file", mediaType: "image/png", url: attachment.dataUrl, filename },
          { type: "text", text },
        ],
      });
      setAttachment(null);
    } else {
      sendMessage({ text: v });
    }
    inputRef.current = "";
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    inputRef.current = e.target.value;
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  if (collapsed) return null;

  const isBusy = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  return (
    <div
      className={
        mobileFullScreen
          ? "flex flex-1 flex-col bg-sidebar pt-2 min-h-0 w-full"
          : "hidden md:flex md:w-[380px] flex-shrink-0 flex-col bg-sidebar pt-2 min-h-0"
      }
    >
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="gap-4 p-4">
          {isEmpty && (
            <div className="flex flex-col items-start gap-2 rounded-lg border border-border bg-card/50 p-3 text-sm">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Bot className="h-4 w-4 text-primary" />
                FINTODO CMS-агент
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Я допомагаю керувати ідеями контенту, статтями-консультаціями та налаштуваннями CMS.
                Усі зміни в БД підтверджуєш ти. Поточна сторінка: <code className="text-foreground">{currentPath}</code>.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                {(m.parts ?? []).map((part, idx) => {
                  const p = part as {
                    type: string;
                    text?: string;
                    toolName?: string;
                    state?:
                      | "input-streaming"
                      | "input-available"
                      | "approval-requested"
                      | "approval-responded"
                      | "output-available"
                      | "output-error"
                      | "output-denied";
                    input?: unknown;
                    output?: unknown;
                    errorText?: string;
                    toolCallId?: string;
                    approval?: { id: string; approved?: boolean; reason?: string };
                  };

                  if (p.type === "text") {
                    return <MessageResponse key={idx}>{p.text ?? ""}</MessageResponse>;
                  }

                  if (p.type === "file") {
                    const fp = part as { type: "file"; mediaType?: string; url?: string; filename?: string };
                    if (fp.url && fp.mediaType?.startsWith("image/")) {
                      return (
                        <img
                          key={idx}
                          src={fp.url}
                          alt={fp.filename ?? "screenshot"}
                          className="max-w-[260px] rounded-md border border-border my-1"
                        />
                      );
                    }
                    return null;
                  }


                  if (p.type === "dynamic-tool" || p.type?.startsWith("tool-")) {
                    const toolName =
                      p.type === "dynamic-tool"
                        ? (p.toolName ?? "tool")
                        : p.type.replace(/^tool-/, "");
                    const friendly = TOOL_NAME_LABELS[toolName] ?? toolName;
                    const state = (p.state ?? "input-streaming") as
                      | "input-streaming"
                      | "input-available"
                      | "approval-requested"
                      | "approval-responded"
                      | "output-available"
                      | "output-error"
                      | "output-denied";
                    const needsApprovalUi = state === "approval-requested" && p.approval?.id;

                    return (
                      <div key={p.toolCallId ?? idx} className="space-y-1.5">
                        <Tool defaultOpen={Boolean(needsApprovalUi) || state === "output-error" || state === "output-denied"}>
                          <ToolHeader
                            type={"dynamic-tool" as const}
                            state={state}
                            toolName={friendly}
                          />
                          <ToolContent>
                            {p.input !== undefined && <ToolInput input={p.input} />}
                            {(p.output !== undefined || p.errorText) && (
                              <ToolOutput output={p.output as never} errorText={p.errorText} />
                            )}
                          </ToolContent>
                        </Tool>

                        {needsApprovalUi && (
                          <div className="rounded-md border border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-900 dark:text-amber-200">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Потрібне твоє підтвердження
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              AI хоче виконати <span className="font-medium text-foreground">{friendly}</span> з параметрами вище. Підтвердиш — зміна збережеться в БД та піде в історію.
                            </p>
                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => addToolApprovalResponse({ id: p.approval!.id, approved: true })}
                              >
                                <Check className="h-3 w-3" /> Підтвердити
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => addToolApprovalResponse({ id: p.approval!.id, approved: false, reason: "Відхилено редактором" })}
                              >
                                <X className="h-3 w-3" /> Відхилити
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return null;
                })}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <Shimmer>Аналізую...</Shimmer>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              Помилка: {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {!mobileFullScreen && (
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {(QUICK_ACTIONS_BY_TAB[activeTab] || QUICK_ACTIONS_BY_TAB.dashboard).map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => sendPrompt(action.command)}
            disabled={!threadId || isBusy}
            className="text-xs font-medium px-2.5 py-1 rounded-md bg-background border border-border shadow-[0_1px_2px_0_hsl(var(--foreground)/0.04)] hover:bg-accent hover:border-primary/50 text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action.label}
          </button>
        ))}
      </div>
      )}

      {!mobileFullScreen && (
      <form onSubmit={handleSubmit} className="p-3">
        <div className="bg-card rounded-xl border border-border shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.03),0_4px_12px_-2px_hsl(var(--foreground)/0.12)] ring-1 ring-border/50">
          {attachment && (
            <div className="flex items-center gap-2 p-2 border-b border-border/60">
              <img
                src={attachment.dataUrl}
                alt="Скріншот"
                className="h-12 w-12 rounded object-cover border border-border shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-foreground flex items-center gap-1 truncate">
                  <ImageIcon className="h-3 w-3 text-primary shrink-0" />
                  Скріншот {attachment.path}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {attachment.rect.w} × {attachment.rect.h} px · буде прикріплено до повідомлення
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                onClick={() => setAttachment(null)}
                aria-label="Прибрати скріншот"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          <div className="flex items-end gap-2 p-2">
            <textarea
              ref={textareaRef}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                attachment
                  ? "Що зробити з цією областю?"
                  : threadId
                    ? "Напишіть запит..."
                    : "Створюю новий чат..."
              }
              rows={1}
              disabled={!threadId}
              className="flex-1 min-h-[36px] max-h-[120px] resize-none text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground px-2 py-1.5 disabled:opacity-50"
            />
            <div className="flex items-center gap-1 shrink-0 pb-0.5">
              {isBusy ? (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => stop()}
                  aria-label="Зупинити"
                >
                  <Square className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  disabled={!threadId}
                  aria-label="Надіслати"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
      )}
    </div>
  );
}
