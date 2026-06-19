import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, X, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAudience } from "@/contexts/AudienceContext";
import { ChatMarkdown } from "./ChatMarkdown";
import { buildFullKnowledgeBase } from "@/portal/services/knowledgeBase";
import { getUserContext } from "@/portal/services/userContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FloatingChatProps {
  onClose: () => void;
}

const FREE_MESSAGE_LIMIT = 2;
const POST_EMAIL_LIMIT = 3;
const EMAIL_STORAGE_KEY = "fint_chat_email";
const MSG_COUNT_KEY = "fint_chat_msg_count";

export const FloatingChat = ({ onClose }: FloatingChatProps) => {
  const { audience } = useAudience();
  const knowledgeBase = useMemo(() => buildFullKnowledgeBase(), []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(() => !!localStorage.getItem(EMAIL_STORAGE_KEY));
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [msgCount, setMsgCount] = useState(() => {
    try { return parseInt(localStorage.getItem(MSG_COUNT_KEY) || "0", 10); } catch { return 0; }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isLimitReached = !emailSubmitted && msgCount >= FREE_MESSAGE_LIMIT;
  const isFullyExhausted = emailSubmitted && msgCount >= FREE_MESSAGE_LIMIT + POST_EMAIL_LIMIT;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    // Check if email gate should show
    if (isLimitReached) {
      setShowEmailGate(true);
      return;
    }

    if (isFullyExhausted) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Increment message count
    const newCount = msgCount + 1;
    setMsgCount(newCount);
    localStorage.setItem(MSG_COUNT_KEY, String(newCount));

    try {
      const { data, error } = await supabase.functions.invoke("portal-chat", {
        body: {
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          audience: audience === "individual" ? "personal" : "business",
          knowledgeBase,
          userContext: getUserContext(),
        },
      });

      if (error) throw error;

      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                const content = assistantContent;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content };
                  return updated;
                });
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } else if (typeof data === "object" && data?.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${data.error}` }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Помилка з'єднання. Спробуйте ще раз." },
      ]);
    } finally {
      setIsStreaming(false);

      // Show email gate after response if limit reached
      const updatedCount = msgCount + 1;
      if (!emailSubmitted && updatedCount >= FREE_MESSAGE_LIMIT) {
        setTimeout(() => setShowEmailGate(true), 500);
      }
    }
  }, [input, isStreaming, messages, audience, msgCount, emailSubmitted, isLimitReached, isFullyExhausted, knowledgeBase]);

  const handleEmailSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Введіть коректний email");
      return;
    }

    try {
      await supabase.from("email_subscriptions").insert({
        email: trimmed,
        source: "floating_chat",
        audience_type: audience === "individual" ? "personal" : "business",
      });
    } catch { /* silent */ }

    localStorage.setItem(EMAIL_STORAGE_KEY, trimmed);
    setEmailSubmitted(true);
    setShowEmailGate(false);
    setEmailError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="fixed bottom-[5.5rem] right-6 z-50 w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] max-h-[70vh] rounded-2xl bg-background border border-border shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground">AI-Консультант</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          aria-label="Закрити чат"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Задайте питання — AI відповість миттєво.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <ChatMarkdown text={msg.content || "..."} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {/* Email gate overlay */}
        {showEmailGate && !emailSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4 mx-auto max-w-[90%]"
          >
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Продовжити безкоштовно</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Введіть email, щоб отримати ще {POST_EMAIL_LIMIT} безкоштовних відповіді
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                placeholder="your@email.com"
                className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
                onKeyDown={(e) => { if (e.key === "Enter") handleEmailSubmit(); }}
              />
              <button
                onClick={handleEmailSubmit}
                className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shrink-0"
              >
                Далі
              </button>
            </div>
            {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
          </motion.div>
        )}

        {/* Fully exhausted — CTA to /consultant */}
        {isFullyExhausted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4 mx-auto max-w-[90%] text-center"
          >
            <p className="text-sm font-medium text-foreground mb-2">
              Безкоштовні повідомлення вичерпано
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Перейдіть до повноцінного AI-консультанта з профілем, архівом розмов і персоналізацією
            </p>
            <Link
              to="/consultant"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Відкрити AI-консультант →
            </Link>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-2.5">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isFullyExhausted ? "Перейдіть до AI-консультанта ↑" : "Ваше питання..."}
            rows={1}
            disabled={isFullyExhausted}
            className="flex-1 resize-none bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 max-h-24 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || isFullyExhausted}
            className={cn("m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0 disabled:opacity-40", input.trim() && !isStreaming && !isFullyExhausted ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground/40 cursor-default")}
            aria-label="Надіслати"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
