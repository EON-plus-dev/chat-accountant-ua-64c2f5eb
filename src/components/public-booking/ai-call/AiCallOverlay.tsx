/**
 * AI-голосовий «дзвінок» у браузері.
 * MVP: Web Speech API (browser-native) для STT і TTS — без серверних cost'ів.
 * LLM-логіка — той самий edge function `salon-booking-ai-chat`.
 *
 * Fallback на текст, якщо Web Speech API не підтримується (Firefox без флагу).
 */

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import type { PublicBookingDraft, PublicBookingRecord } from "@/lib/publicBooking/types";
import { confirmPublicBooking } from "@/lib/publicBooking/store";
import { LivePreviewCard } from "../LivePreviewCard";
import { ConfirmationView } from "../ConfirmationView";

interface Props {
  cabinet: Cabinet;
  brandName?: string;
  onClose: () => void;
  onSwitchToChat: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Web Speech API типи
type SpeechRecognitionConstructor = new () => SpeechRecognition;
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

type CallState = "intro" | "listening" | "thinking" | "speaking" | "ended";

export function AiCallOverlay({ cabinet, brandName, onClose, onSwitchToChat }: Props) {
  const { toast } = useToast();
  const displayName = brandName || cabinet.name;
  const [state, setState] = useState<CallState>("intro");
  const [transcript, setTranscript] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [draft, setDraft] = useState<PublicBookingDraft>({ serviceIds: [] });
  const [confirmed, setConfirmed] = useState<PublicBookingRecord | null>(null);
  const [muted, setMuted] = useState(false);
  const recRef = useRef<SpeechRecognition | null>(null);
  const supported = !!getRecognitionCtor() && "speechSynthesis" in window;

  const speak = (text: string) =>
    new Promise<void>((resolve) => {
      if (!("speechSynthesis" in window)) return resolve();
      setState("speaking");
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "uk-UA";
      utter.rate = 1.05;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });

  const sendToAi = async (userText: string) => {
    setTranscript((t) => [...t, { role: "user", text: userText }]);
    setState("thinking");
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/salon-booking-ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          cabinetId: cabinet.id,
          brandName: displayName,
          mode: "voice",
          messages: [
            ...transcript.map((t) => ({ role: t.role === "ai" ? "assistant" : "user", content: t.text })),
            { role: "user", content: userText },
          ],
          draft,
        }),
      });
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = await resp.json();
      if (data.draftPatch) setDraft((d) => ({ ...d, ...data.draftPatch }));
      const reply: string = data.reply || "Перепрошую, не зрозуміла.";
      setTranscript((t) => [...t, { role: "ai", text: reply }]);
      await speak(reply);
      if (state !== "ended") startListening();
    } catch (e) {
      console.error(e);
      const msg = "Звʼязок з AI перервався. Спробуйте перемкнутися на текст.";
      setTranscript((t) => [...t, { role: "ai", text: msg }]);
      await speak(msg);
      setState("ended");
    }
  };

  const startListening = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "uk-UA";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript?.trim();
      if (t) sendToAi(t);
    };
    rec.onerror = (e) => {
      console.warn("STT error", e.error);
      if (e.error === "no-speech" || e.error === "aborted") {
        setState("intro");
      } else {
        toast({ title: "Помилка мікрофона", description: e.error, variant: "destructive" });
      }
    };
    rec.onend = () => {
      if (state === "listening") setState("intro");
    };
    recRef.current = rec;
    setState("listening");
    rec.start();
  };

  const stopListening = () => {
    recRef.current?.stop();
    recRef.current = null;
  };

  const startCall = async () => {
    if (!supported) {
      toast({
        title: "Браузер не підтримує голос",
        description: "Спробуйте Chrome або Safari, або скористайтеся текстом.",
        variant: "destructive",
      });
      return;
    }
    const greet = `Вітаю в ${displayName}! Розкажіть, що хотіли б записати і коли вам зручно.`;
    setTranscript([{ role: "ai", text: greet }]);
    await speak(greet);
    startListening();
  };

  const endCall = () => {
    window.speechSynthesis?.cancel();
    stopListening();
    setState("ended");
  };

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    recRef.current?.stop();
  }, []);

  const handleConfirm = () => {
    const res = confirmPublicBooking(cabinet.id, draft, "ai-call");
    if (res.ok && res.booking) {
      setConfirmed(res.booking);
      speak(`Готово! Запис підтверджено на ${draft.date}, ${draft.startTime}. До зустрічі!`);
    } else {
      toast({ title: "Не вдалося", description: res.error, variant: "destructive" });
    }
  };

  if (confirmed) return <ConfirmationView cabinet={cabinet} brandName={displayName} booking={confirmed} />;

  const canConfirm =
    draft.serviceIds.length > 0 && draft.date && draft.startTime && draft.clientName && draft.clientPhone;

  return (
    <div className="flex flex-col min-h-[min(560px,calc(100dvh-220px))] md:min-h-[560px] bg-gradient-to-b from-primary/5 to-background">

      <div className="px-4 py-3 border-b bg-background/80 backdrop-blur flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {state !== "ended" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${state === "ended" ? "bg-muted-foreground" : "bg-success"}`}
          ></span>
        </span>
        <div className="text-sm">
          <div className="font-medium">Розмова з консʼєржем {displayName}</div>
          <div className="text-[10px] text-muted-foreground">
            {state === "intro" && "Натисніть «Розпочати»"}
            {state === "listening" && "Слухаю вас…"}
            {state === "thinking" && "Думаю…"}
            {state === "speaking" && "Говорю…"}
            {state === "ended" && "Розмова завершена"}
          </div>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto text-xs h-7" onClick={onSwitchToChat}>
          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Текстом
        </Button>
      </div>

      {!supported && (
        <div className="m-4 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs flex gap-2">
          <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            Голосовий режим потребує Chrome, Edge або Safari з підтримкою Web Speech API. Радимо
            обрати «AI-консʼєрж» текстом — там працює усюди.
          </div>
        </div>
      )}

      <div className="px-4 pt-3">
        <LivePreviewCard draft={draft} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 py-4 md:py-6">
        <div
          className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all ${
            state === "listening"
              ? "bg-success/15 scale-110 ring-4 ring-success/30"
              : state === "speaking"
                ? "bg-primary/15 scale-105 ring-4 ring-primary/30"
                : "bg-muted"
          }`}
        >
          {state === "intro" || state === "ended" ? (
            <Mic className="w-9 h-9 md:w-12 md:h-12 text-muted-foreground" />
          ) : muted ? (
            <MicOff className="w-9 h-9 md:w-12 md:h-12 text-foreground" />
          ) : (
            <Mic className="w-9 h-9 md:w-12 md:h-12 text-foreground" />
          )}
        </div>


        <div className="max-h-32 overflow-y-auto px-6 w-full max-w-md space-y-1.5 text-xs">
          {transcript.slice(-4).map((t, i) => (
            <div key={i} className={t.role === "user" ? "text-right" : ""}>
              <span
                className={`inline-block rounded-lg px-2 py-1 ${
                  t.role === "user" ? "bg-primary/10" : "bg-muted"
                }`}
              >
                {t.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {canConfirm && state !== "ended" && (
        <div className="px-4 pb-2">
          <Button onClick={handleConfirm} className="w-full">
            Підтвердити запис
          </Button>
        </div>
      )}

      <div
        className="p-4 border-t flex items-center justify-center gap-3"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {state === "intro" && (
          <Button onClick={startCall} size="lg" className="rounded-full" disabled={!supported}>
            <Mic className="w-5 h-5 mr-2" /> Розпочати розмову
          </Button>
        )}
        {(state === "listening" || state === "thinking" || state === "speaking") && (
          <>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setMuted((v) => !v);
                if (!muted) stopListening();
                else startListening();
              }}
            >
              {muted ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button size="lg" variant="destructive" className="rounded-full" onClick={endCall}>
              <PhoneOff className="w-5 h-5 mr-2" /> Завершити
            </Button>
          </>
        )}
        {state === "ended" && (
          <Button variant="outline" onClick={onClose}>
            Закрити
          </Button>
        )}
      </div>
    </div>
  );
}
