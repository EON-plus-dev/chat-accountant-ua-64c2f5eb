import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, RotateCcw, ArrowUp, Square, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { POPULAR_QUESTIONS, type PopularQuestion } from "@/portal/data/popularQuestions";

import { ChatMarkdown } from "@/components/landing/ChatMarkdown";
import { cn } from "@/lib/utils";
import { RecentConsultationsSidebar } from "@/portal/components/RecentConsultationsSidebar";
import { MessageActions } from "@/portal/components/MessageActions";
import { useIsMobile } from "@/hooks/use-mobile";
import { analytics } from "@/portal/services/analytics";
import { toast } from "sonner";
import { buildFullKnowledgeBase } from "@/portal/services/knowledgeBase";
import { getUserContext } from "@/portal/services/userContext";


type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-chat`;



// Animated thinking dots
const ThinkingDots = () => (
  <div className="flex items-center gap-2 py-1">
    <div className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
    <span className="text-xs text-muted-foreground">AI думає...</span>
  </div>
);



export const QaHubSection = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isMobile = useIsMobile();
  const knowledgeBase = useMemo(() => buildFullKnowledgeBase(), []);
  const userContext = useMemo(() => getUserContext(), []);
  const suggestionCards = useMemo(() => {
    const withCards = POPULAR_QUESTIONS.filter((q) => q.title && q.hint);
    const pick = (aud: string) => withCards.find((c) => c.audience === aud);
    return [pick("business"), pick("personal"), pick("accountant"), pick("both")].filter(Boolean) as PopularQuestion[];
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextareaInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, []);

  const streamChat = async (allMessages: Msg[]) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages, knowledgeBase, userContext }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Помилка сервера" }));
      throw new Error(err.error || `HTTP ${resp.status}`);
    }
    if (!resp.body) throw new Error("No stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantSoFar = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            const snapshot = assistantSoFar;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
              }
              return [...prev, { role: "assistant", content: snapshot }];
            });
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (messages.length === 0) analytics.aiChatStarted();
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error(e.message || "Помилка AI-консультанта");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Check if last assistant message is done streaming (for showing actions)
  const isLastAssistantDone = messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && !isLoading;

  return (
    <section className="py-10 sm:py-16 bg-muted/30" id="qa-hub">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Section header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Відповідаємо на питання
          </h2>
          <p className="text-muted-foreground text-sm">
            AI-консультант пояснить за 30 секунд, посилаючись на актуальне законодавство
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* Chat container */}
        <div className="flex flex-col rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden min-h-[480px] max-h-[640px]">
          {/* Chat header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">AI-Консультант</span>
              <Badge variant="info" className="text-[10px]">beta</Badge>
            </div>
            <div className="flex items-center gap-1 sm:ml-auto">
              {messages.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={clearChat}
                      className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Нова розмова</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
            {messages.length === 0 ? (
              /* Inspiring empty state */
              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-8">
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    Чим можу допомогти?
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Податки ФОП, декларування доходів, інвестиції, оренда — запитайте будь-що
                  </p>
                </div>

                {/* 2x2 action cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {suggestionCards.map((card) => (
                    <button
                      key={card.question}
                      onClick={() => sendMessage(card.question)}
                      disabled={isLoading}
                      className="group flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md text-left transition-all duration-200 disabled:opacity-50 relative overflow-hidden"
                    >
                      {/* Gradient left accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-2xl leading-none shrink-0">{card.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors block">{card.title}</span>
                        <span className="text-xs text-muted-foreground leading-snug block mt-0.5">{card.hint}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 opacity-0 group-hover:opacity-100 transition-all shrink-0 -translate-x-1 group-hover:translate-x-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <>
                {messages.map((msg, i) => {
                  const isLastAssistant = msg.role === "assistant" && i === messages.length - 1;
                  return (
                    <div key={i} className={`py-3 ${i > 0 ? "border-t border-border/30" : ""}`}>
                      {msg.role === "user" ? (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary/10 px-4 py-2.5 text-sm text-foreground">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 text-sm text-foreground prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                              <ChatMarkdown text={msg.content} />
                            </div>
                          </div>
                          {/* Show actions only on last assistant message when done */}
                          {isLastAssistant && !isLoading && (
                            <MessageActions content={msg.content} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="py-3 border-t border-border/30">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <ThinkingDots />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div className="px-3 pb-3 pt-1 space-y-1.5">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}
              className="relative flex items-end rounded-2xl border border-border/60 bg-muted/40 shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all duration-200"
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); handleTextareaInput(); }}
                onKeyDown={handleKeyDown}
                placeholder="Опишіть ваше питання з податків, бухгалтерії чи звітності..."
                disabled={isLoading}
                rows={2}
                className="flex-1 resize-none bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50 max-h-[160px] min-h-[72px]"
              />
              {isLoading ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={stopGeneration}
                      className="m-1.5 p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-200 shrink-0"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Зупинити генерацію</TooltipContent>
                </Tooltip>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={cn(
                    "m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0",
                    inputValue.trim()
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      : "text-muted-foreground/40 cursor-default",
                    "disabled:opacity-40"
                  )}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </form>
            {/* Hints & disclaimer */}
            <div className="flex items-center justify-between px-2 gap-4">
              <span className="text-[11px] text-muted-foreground/50">
                ⏎ Enter — надіслати · Shift+Enter — новий рядок
              </span>
              <span className="text-[11px] text-muted-foreground/50 text-right">
                AI може помилятись. Перевіряйте важливу інформацію.
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar — desktop only */}
        {!isMobile && (
          <div className="hidden lg:block rounded-2xl border border-border/60 bg-card shadow-lg p-4 max-h-[640px] overflow-hidden">
            <RecentConsultationsSidebar />
          </div>
        )}

        </div>{/* end grid */}
      </div>
    </section>
  );
};
