import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, ArrowUp, User, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/timeAgo";
import { buildFullKnowledgeBase } from "@/portal/services/knowledgeBase";
import { getUserContext } from "@/portal/services/userContext";

interface FollowUpMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface FollowUpChatProps {
  consultationId: string;
  consultationQuestion: string;
  consultationAnswer: string;
  audience: "business" | "individual";
}

const STORAGE_KEY_PREFIX = "followup_";

const getStoredMessages = (id: string): FollowUpMessage[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const storeMessages = (id: string, messages: FollowUpMessage[]) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(messages.slice(-20)));
  } catch {}
};

export const FollowUpChat = ({
  consultationId,
  consultationQuestion,
  consultationAnswer,
  audience,
}: FollowUpChatProps) => {
  const [messages, setMessages] = useState<FollowUpMessage[]>(() => getStoredMessages(consultationId));
  const knowledgeBase = useMemo(() => buildFullKnowledgeBase(), []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storeMessages(consultationId, messages);
  }, [consultationId, messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const visibleMessages = expanded || messages.length <= 4 ? messages : messages.slice(-4);

  const handleSubmit = useCallback(async () => {
    const q = input.trim();
    if (!q || isLoading) return;

    const userMsg: FollowUpMessage = { role: "user", content: q, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setExpanded(true);

    try {
      const contextPrompt = `Контекст консультації:\nПитання: ${consultationQuestion}\nВідповідь: ${consultationAnswer.slice(0, 2000)}\n\nКористувач уточнює це питання. Відповідай коротко, по суті, українською мовою. Посилайся на актуальне законодавство де можливо.`;

      const allMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: q },
      ];

      const response = await supabase.functions.invoke("portal-chat", {
        body: { messages: allMessages, systemPrompt: contextPrompt, audience, knowledgeBase, userContext: getUserContext() },
      });

      if (response.error) throw response.error;

      const reader = response.data?.getReader?.();
      if (reader) {
        let fullText = "";
        const decoder = new TextDecoder();
        const assistantMsg: FollowUpMessage = { role: "assistant", content: "", timestamp: Date.now() };
        setMessages((prev) => [...prev, assistantMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || parsed.text || "";
                fullText += delta;
              } catch {
                fullText += data;
              }
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...assistantMsg, content: fullText };
                return updated;
              });
            }
          }
        }
      } else {
        const text = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
        setMessages((prev) => [...prev, { role: "assistant", content: text, timestamp: Date.now() }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Вибачте, сталася помилка. Спробуйте ще раз.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, consultationQuestion, consultationAnswer, audience]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/30">
        <MessageSquare className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">
          Коментарі та уточнення
        </span>
        {messages.length > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {messages.length} повідомлень
          </span>
        )}
      </div>

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="px-4 py-6 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/25" />
          <p className="text-sm font-medium text-foreground/70 mb-1">
            Будьте першим — задайте уточнення
          </p>
          <p className="text-xs text-muted-foreground">
            AI відповість з урахуванням контексту цієї консультації
          </p>
        </div>
      )}

      {/* Comment thread */}
      {messages.length > 0 && (
        <div ref={scrollRef} className={cn(
          "overflow-y-auto p-4 space-y-4",
          expanded || messages.length <= 4 ? "max-h-[16rem] sm:max-h-[28rem]" : "max-h-48"
        )}>
          {!expanded && messages.length > 4 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-primary font-medium hover:underline"
            >
              Показати всі {messages.length} повідомлень
            </button>
          )}
          {visibleMessages.map((msg, i) => (
            <div key={i} className="flex gap-2.5">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "assistant" ? "bg-primary/10" : "bg-muted"
              )}>
                {msg.role === "assistant"
                  ? <Bot className="w-3.5 h-3.5 text-primary" />
                  : <User className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    {msg.role === "assistant" ? "FINTODO AI" : "Ви"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {timeAgo(new Date(msg.timestamp).toISOString())}
                  </span>
                </div>
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                  {msg.content || (isLoading && i === visibleMessages.length - 1 ? "..." : "")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border/40">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setExpanded(true)}
            placeholder="Додати коментар..."
            className="min-h-[36px] max-h-20 resize-none text-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={cn("m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0 self-end disabled:opacity-40", input.trim() && !isLoading ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground/40 cursor-default")}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
