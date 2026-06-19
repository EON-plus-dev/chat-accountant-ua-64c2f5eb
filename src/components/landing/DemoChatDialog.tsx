import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowRight, ArrowUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

/* ── Scenario types ──────────────────────────────────────── */

type ScenarioEntry = { aiText: string; nextReplies: string[] | null };
type ScenarioMap = Record<string, ScenarioEntry>;
type KeywordMap = Record<string, string>;

/* ── Business scenarios (existing) ───────────────────────── */

const BUSINESS_SCENARIO: ScenarioMap = {
  "Як підключити банк?": {
    aiText:
      "Підключення банку займає 2 хвилини. Ми підтримуємо Monobank, ПриватБанк та будь-який банк через API. Просто авторизуйтесь — і виписки імпортуються автоматично.",
    nextReplies: ["Скільки коштує?", "Як подати декларацію?"],
  },
  "Скільки коштує?": {
    aiText:
      "Три тарифи: «Старт» — 399 грн/міс (~46 дій), «Смарт» — 799 грн/міс (~165 дій), «Преміум» — 1 199 грн/міс (~298 дій). Кредити списуються за дії: документи, звіти, AI-сесії. Базовий тариф Start — 300 кредитів/міс безкоштовно назавжди.",
    nextReplies: ["Як підключити банк?", "Як подати декларацію?"],
  },
  "Як подати декларацію?": {
    aiText:
      "AI автоматично збирає дані з ваших транзакцій, формує декларацію та перевіряє на помилки. Вам залишається лише підписати КЕП і надіслати — все в одному вікні.",
    nextReplies: ["Чи безпечні мої дані?", "Чи є інтеграція з 1С?"],
  },
  "Чи безпечні мої дані?": {
    aiText:
      "Дані зашифровані AES-256, сервери розташовані в ЄС, доступ лише через КЕП. Ми не передаємо дані третім сторонам і відповідаємо вимогам GDPR.",
    nextReplies: ["Скільки коштує?", "Як підключити банк?"],
  },
  "Чи є інтеграція з 1С?": {
    aiText:
      "Так! Двостороння синхронізація з 1С: імпорт залишків, експорт документів, автоматичне звіряння. Налаштування займає 15 хвилин через майстер підключення.",
    nextReplies: ["Працюєте з валютою?", "Скільки коштує?"],
  },
  "Працюєте з валютою?": {
    aiText:
      "Підтримуємо USD, EUR, PLN, GBP та інші валюти. Курс НБУ підтягується автоматично, конвертація та курсові різниці розраховуються при кожній операції.",
    nextReplies: null,
  },
};

const BUSINESS_KEYWORDS: KeywordMap = {
  банк: "Як підключити банк?",
  моно: "Як підключити банк?",
  монобанк: "Як підключити банк?",
  приват: "Як підключити банк?",
  підключ: "Як підключити банк?",
  ціна: "Скільки коштує?",
  тариф: "Скільки коштує?",
  вартість: "Скільки коштує?",
  кошту: "Скільки коштує?",
  грн: "Скільки коштує?",
  декларац: "Як подати декларацію?",
  звіт: "Як подати декларацію?",
  податк: "Як подати декларацію?",
  кеп: "Як подати декларацію?",
  безпек: "Чи безпечні мої дані?",
  дані: "Чи безпечні мої дані?",
  захист: "Чи безпечні мої дані?",
  шифр: "Чи безпечні мої дані?",
  "1с": "Чи є інтеграція з 1С?",
  інтеграц: "Чи є інтеграція з 1С?",
  валют: "Працюєте з валютою?",
  долар: "Працюєте з валютою?",
  євро: "Працюєте з валютою?",
};

/* ── Individual scenarios ────────────────────────────────── */

const INDIVIDUAL_SCENARIO: ScenarioMap = {
  "Як декларувати інвестиції?": {
    aiText:
      "AI автоматично розраховує прибуток від акцій, облігацій та криптовалюти. Імпортуйте звіти з брокера — система визначить базу оподаткування (ПДФО 18% + ВЗ 5%) та сформує додаток до декларації.",
    nextReplies: ["Податок з оренди — як розраховується?", "Скільки коштує сервіс для приватної особи?"],
  },
  "Податок з оренди — як розраховується?": {
    aiText:
      "Якщо ви здаєте нерухомість як фізособа, ставка ПДФО — 18% + 5% ВЗ від суми оренди. Ми автоматично формуємо квартальний розрахунок та нагадуємо про терміни сплати.",
    nextReplies: ["Як подати декларацію через Дію?", "Як декларувати інвестиції?"],
  },
  "Скільки платити за іноземний фріланс?": {
    aiText:
      "Дохід з-за кордону оподатковується ПДФО 18% + ВЗ 5%. Курс перераховується за НБУ на дату отримання. Ми автоматично конвертуємо та формуємо декларацію з усіма додатками.",
    nextReplies: ["Чи безпечні мої дані?", "Скільки коштує сервіс для приватної особи?"],
  },
  "Як подати декларацію через Дію?": {
    aiText:
      "Ми формуємо декларацію у форматі, сумісному з кабінетом ДПС та Дією. Після підготовки ви підписуєте КЕП і подаєте в один клік. Нагадування про дедлайни — автоматичні.",
    nextReplies: ["Скільки платити за іноземний фріланс?", "Як декларувати інвестиції?"],
  },
  "Скільки коштує сервіс для приватної особи?": {
    aiText:
      "Три тарифи для фізосіб: «Базовий» — 149 грн/міс, «Стандарт» — 349 грн/міс, «Професійний» — 699 грн/міс. Кредити списуються за дії: декларації, AI-консультації, перевірки. Базовий тариф Start — 300 кредитів/міс безкоштовно назавжди.",
    nextReplies: null,
  },
  "Чи безпечні мої дані?": {
    aiText:
      "Дані зашифровані AES-256, сервери розташовані в ЄС, доступ лише через КЕП. Ми не передаємо дані третім сторонам і відповідаємо вимогам GDPR.",
    nextReplies: ["Скільки коштує сервіс для приватної особи?", "Як декларувати інвестиції?"],
  },
};

const INDIVIDUAL_KEYWORDS: KeywordMap = {
  інвестиц: "Як декларувати інвестиції?",
  акці: "Як декларувати інвестиції?",
  крипт: "Як декларувати інвестиції?",
  облігац: "Як декларувати інвестиції?",
  брокер: "Як декларувати інвестиції?",
  оренд: "Податок з оренди — як розраховується?",
  нерухом: "Податок з оренди — як розраховується?",
  здаю: "Податок з оренди — як розраховується?",
  квартир: "Податок з оренди — як розраховується?",
  фріланс: "Скільки платити за іноземний фріланс?",
  іноземн: "Скільки платити за іноземний фріланс?",
  закордон: "Скільки платити за іноземний фріланс?",
  upwork: "Скільки платити за іноземний фріланс?",
  дія: "Як подати декларацію через Дію?",
  декларац: "Як подати декларацію через Дію?",
  кеп: "Як подати декларацію через Дію?",
  податк: "Як подати декларацію через Дію?",
  ціна: "Скільки коштує сервіс для приватної особи?",
  тариф: "Скільки коштує сервіс для приватної особи?",
  вартість: "Скільки коштує сервіс для приватної особи?",
  кошту: "Скільки коштує сервіс для приватної особи?",
  грн: "Скільки коштує сервіс для приватної особи?",
  безпек: "Чи безпечні мої дані?",
  дані: "Чи безпечні мої дані?",
  захист: "Чи безпечні мої дані?",
  шифр: "Чи безпечні мої дані?",
};

/* ── Audience-based config ───────────────────────────────── */

type Audience = "business" | "individual";

const SCENARIOS_BY_AUDIENCE: Record<Audience, ScenarioMap> = {
  business: BUSINESS_SCENARIO,
  individual: INDIVIDUAL_SCENARIO,
};

const KEYWORDS_BY_AUDIENCE: Record<Audience, KeywordMap> = {
  business: BUSINESS_KEYWORDS,
  individual: INDIVIDUAL_KEYWORDS,
};

/* ── Intent matching ─────────────────────────────────────── */

function matchIntent(text: string, scenario: ScenarioMap, keywords: KeywordMap): ScenarioEntry {
  const lower = text.toLowerCase();

  const directKey = Object.keys(scenario).find((k) => lower.includes(k.toLowerCase()));
  if (directKey) return scenario[directKey];

  for (const [keyword, scenarioKey] of Object.entries(keywords)) {
    if (lower.includes(keyword)) return scenario[scenarioKey];
  }

  const fallbackReplies = Object.keys(scenario).slice(0, 3);
  return {
    aiText:
      "Дякую за запитання! Я поки що навчаюсь і не маю точної відповіді. Спробуйте обрати одну із запропонованих тем нижче або зареєструйтесь — наші спеціалісти допоможуть особисто.",
    nextReplies: fallbackReplies,
  };
}

/* ── Types ───────────────────────────────────────────────── */

type Msg = { role: "ai" | "user"; text: string; timestamp: Date };

const formatTime = (date: Date): string =>
  date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

/* ── Typing indicator ────────────────────────────────────── */

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm bg-muted w-fit">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-muted-foreground/50"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

/* ── Chat body ───────────────────────────────────────────── */

interface ChatBodyProps {
  messages: Msg[];
  isTyping: boolean;
  quickReplies: string[] | null;
  showCta: boolean;
  onQuickReply: (text: string) => void;
  onCta: () => void;
}

const ChatBody = ({ messages, isTyping, quickReplies, showCta, onQuickReply, onCta }: ChatBodyProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, quickReplies, showCta]);

  // Auto-scroll when virtual keyboard opens/closes
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handleResize = () => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="p-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {m.text}
                <div className={`text-[10px] mt-1 ${m.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                  {formatTime(m.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <TypingDots />
          </motion.div>
        )}

        {!isTyping && quickReplies && quickReplies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 pt-1 sm:flex-wrap overflow-x-auto flex-nowrap scrollbar-hide pb-1 -mx-4 px-4"
          >
            {quickReplies.map((r) => (
              <Button key={r} variant="outline" size="sm" className="text-xs whitespace-nowrap shrink-0" onClick={() => onQuickReply(r)}>
                {r}
              </Button>
            ))}
          </motion.div>
        )}

        {!isTyping && showCta && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-2">
            <Button size="sm" className="gap-1.5" onClick={onCta}>
              Спробувати безкоштовно <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

/* ── Header ──────────────────────────────────────────────── */

const ChatHeader = ({ onClose }: { onClose?: () => void }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
    <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
      <Bot className="w-5 h-5 text-primary-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm">AI-бухгалтер</p>
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <p className="text-xs text-primary-foreground/70">Онлайн</p>
      </div>
    </div>
    {onClose && (
      <button
        onClick={onClose}
        aria-label="Закрити чат"
        className="ml-auto p-1 rounded-md text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

/* ── Chat Input ──────────────────────────────────────────── */

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t shrink-0">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Напишіть повідомлення..."
        disabled={disabled}
        enterKeyHint="send"
        aria-label="Повідомлення в чат"
        className="flex-1 h-9 text-base sm:text-sm"
      />
      <button type="submit" disabled={disabled || !value.trim()} className={cn("m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0 disabled:opacity-40", value.trim() ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground/40 cursor-default")}>
        <ArrowUp className="w-4 h-4" />
      </button>
    </form>
  );
};

/* ── Main component ──────────────────────────────────────── */

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  audience?: Audience;
}

export const DemoChatDialog = ({ open, onOpenChange, audience = "business" }: Props) => {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[] | null>(null);
  const [showCta, setShowCta] = useState(false);

  const scenario = SCENARIOS_BY_AUDIENCE[audience];
  const keywords = KEYWORDS_BY_AUDIENCE[audience];
  const initialReplies = Object.keys(scenario);

  // Reset on open
  useEffect(() => {
    if (open) {
      setMessages([{ role: "ai", text: "Привіт! Я AI-бухгалтер. Чим можу допомогти?", timestamp: new Date() }]);
      setQuickReplies(Object.keys(SCENARIOS_BY_AUDIENCE[audience]));
      setIsTyping(false);
      setShowCta(false);
    }
  }, [open, audience]);

  const processResponse = useCallback((entry: ScenarioEntry) => {
    setIsTyping(true);
    setQuickReplies(null);

    const delay = 800 + Math.random() * 400;
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: entry.aiText, timestamp: new Date() }]);
      setIsTyping(false);
      if (entry.nextReplies) {
        setQuickReplies(entry.nextReplies);
      } else {
        setShowCta(true);
      }
    }, delay);
  }, []);

  const handleQuickReply = useCallback(
    (text: string) => {
      if (isTyping) return;
      const entry = scenario[text];
      if (!entry) return;
      setMessages((prev) => [...prev, { role: "user", text, timestamp: new Date() }]);
      processResponse(entry);
    },
    [isTyping, processResponse, scenario],
  );

  const handleSendText = useCallback(
    (text: string) => {
      if (isTyping) return;
      setMessages((prev) => [...prev, { role: "user", text, timestamp: new Date() }]);
      const entry = matchIntent(text, scenario, keywords);
      processResponse(entry);
    },
    [isTyping, processResponse, scenario, keywords],
  );

  const handleCta = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }, [onOpenChange]);

  const disclaimer = messages.length === 1 && !isTyping && (
    <p className="text-[10px] text-muted-foreground text-center px-4 -mt-1 mb-1">
      Це демо-бот. Для повної консультації зареєструйтесь.
    </p>
  );

  const chatContent = (
    <>
      <ChatHeader onClose={() => onOpenChange(false)} />
      {disclaimer}
      <ChatBody
        messages={messages}
        isTyping={isTyping}
        quickReplies={quickReplies}
        showCta={showCta}
        onQuickReply={handleQuickReply}
        onCta={handleCta}
      />
      <ChatInput onSend={handleSendText} disabled={isTyping} />
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
        <DrawerContent className="h-[85dvh]">
          <DrawerTitle className="sr-only">Демо AI-чат</DrawerTitle>
          <div className="flex flex-col h-full">
            {chatContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: inline popup panel (Intercom-style)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] rounded-2xl border bg-background shadow-2xl flex flex-col overflow-hidden"
        >
          {chatContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
