/**
 * AI-чат бронювання. Стрімить відповіді з edge function `salon-booking-ai-chat`.
 * Tool-calls виконуються на бекенді; UI лише рендерить підсумки і кнопки-suggestion.
 */

import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import type { PublicBookingDraft, PublicBookingRecord } from "@/lib/publicBooking/types";
import { confirmPublicBooking } from "@/lib/publicBooking/store";
import { LivePreviewCard } from "../LivePreviewCard";
import { ConfirmationView } from "../ConfirmationView";

interface Props {
  cabinet: Cabinet;
  brandName?: string;
  mode?: "chat" | "call";
  /** Зовнішнє керування драфтом (для голосового режиму, який повторно використовує цей же engine). */
  externalDraft?: PublicBookingDraft;
  onDraftChange?: (d: PublicBookingDraft) => void;
  onSwitchToWizard?: (d: PublicBookingDraft) => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function AiChatPanel({
  cabinet,
  brandName,
  mode = "chat",
  externalDraft,
  onDraftChange,
  onSwitchToWizard,
}: Props) {
  const { toast } = useToast();
  const displayName = brandName || cabinet.name;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Вітаю в **${displayName}**! Розкажіть, що хотіли б записати — і коли вам зручно. Я підберу слот і майстра.`,
      suggestions: ["Манікюр у суботу", "Стрижка завтра ввечері", "Масаж на тиждень"],
    },
  ]);
  const [draft, setDraft] = useState<PublicBookingDraft>(externalDraft ?? { serviceIds: [] });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<PublicBookingRecord | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalDraft) setDraft(externalDraft);
  }, [externalDraft]);

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft, onDraftChange]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/salon-booking-ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          cabinetId: cabinet.id,
          brandName: displayName,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          draft,
        }),
      });

      if (resp.status === 429) {
        toast({
          title: "Забагато запитів",
          description: "Зачекайте трохи і спробуйте знову.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({
          title: "AI тимчасово недоступний",
          description: "Скористайтесь швидким записом.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (!resp.ok) {
        throw new Error(`AI error ${resp.status}`);
      }

      const data = await resp.json();
      // Очікуваний формат: { reply: string, draftPatch?: PublicBookingDraft, suggestions?: string[], readyToConfirm?: boolean }
      if (data.draftPatch) {
        setDraft((d) => ({ ...d, ...data.draftPatch }));
      }
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply, suggestions: data.suggestions },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Звʼязок з AI тимчасово недоступний. Скористайтеся швидким записом — там усе працює офлайн.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    const res = confirmPublicBooking(cabinet.id, draft, mode === "call" ? "ai-call" : "ai-chat");
    if (!res.ok || !res.booking) {
      toast({
        title: "Не вдалося підтвердити",
        description: res.error,
        variant: "destructive",
      });
      return;
    }
    setConfirmed(res.booking);
  };

  if (confirmed) return <ConfirmationView cabinet={cabinet} brandName={displayName} booking={confirmed} />;

  const canConfirm =
    draft.serviceIds.length > 0 &&
    draft.date &&
    draft.startTime &&
    draft.clientName &&
    draft.clientPhone;

  return (
    <div className="flex flex-col h-[min(560px,calc(100dvh-220px))] min-h-[420px] md:h-[560px]">


      <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="text-sm">
          <div className="font-medium">AI-консʼєрж</div>
          <div className="text-[10px] text-muted-foreground">розуміє українську · підбере слот</div>
        </div>
        {onSwitchToWizard && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-xs h-7"
            onClick={() => onSwitchToWizard(draft)}
          >
            <Zap className="w-3.5 h-3.5 mr-1" /> Швидкий запис
          </Button>
        )}
      </div>

      <div className="px-4 pt-3">
        <LivePreviewCard draft={draft} />
      </div>

      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as never}>
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`max-w-[88%] md:max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                }`}
              >

                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-[11px] px-2 py-1 rounded-full bg-background border hover:bg-accent transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-muted rounded-2xl px-3 py-2 text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {canConfirm && (
        <div className="px-4 py-2 border-t bg-success/5">
          <Button onClick={handleConfirm} className="w-full">
            Підтвердити запис
          </Button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t flex gap-2 bg-card"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напишіть, що хочете записати…"
          disabled={isLoading}
          className="text-base md:text-sm h-11 md:h-10"
          inputMode="text"
        />

        <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="h-11 w-11 md:h-10 md:w-10 shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
