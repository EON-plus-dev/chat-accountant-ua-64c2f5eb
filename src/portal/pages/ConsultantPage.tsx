import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAudience } from "@/contexts/AudienceContext";
import { Bot, MessageCircle, Lock, ArrowRight, RotateCcw, ArrowUp, Square, Menu, ChevronDown, MapPin, User, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { POPULAR_QUESTIONS, type PopularQuestion } from "@/portal/data/popularQuestions";
import { RecentConsultationsSidebar } from "@/portal/components/RecentConsultationsSidebar";
import { ConsultantForumTab } from "@/portal/components/ConsultantForumTab";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { MessageCircle as ChatIcon, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMarkdown } from "@/components/landing/ChatMarkdown";
import { MessageActions } from "@/portal/components/MessageActions";
import { toast } from "sonner";
import { buildFullKnowledgeBase } from "@/portal/services/knowledgeBase";
import { getUserContext, type UserContext } from "@/portal/services/userContext";
import { COMPETENCIES } from "@/portal/data/consultantCompetencies";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { GRANTS } from "@/portal/data/grants";
import { LAWS } from "@/portal/data/laws";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCompetencyAccess } from "@/portal/hooks/useCompetencyAccess";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// ── Types ──
type AudienceType = "business" | "personal" | "accountant";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  audience: AudienceType;
  topic: string | null;
  createdAt: number;
}

const FOP_TYPES = ["ФОП 1", "ФОП 2", "ФОП 3", "ТОВ", "Фізособа"];
const CITIES = ["Київ", "Харків", "Одеса", "Дніпро", "Запоріжжя", "Львів", "Інше"];

const STARTER_PROMPTS = [
  "Який зараз ЄСВ для ФОП 2 групи?",
  "Коли найближчий дедлайн декларації?",
  "Який штраф за неподання звітності?",
];

const STORAGE_KEY = "consultant_conversations";

const loadConversations = (): Conversation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
const saveConversations = (convs: Conversation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, 20)));
};

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const mins = diff / 60000;
  const hours = mins / 60;
  const days = hours / 24;
  if (mins < 60) return "Щойно";
  if (hours < 24) return `${Math.floor(hours)} год тому`;
  if (days < 2) return "Вчора";
  if (days < 7) return `${Math.floor(days)} дні тому`;
  return new Date(ts).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

const WEB_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FINTODO AI-консультант",
  applicationCategory: "FinanceApplication",
  description: "AI-консультант з оподаткування, бухобліку, законодавства та фінансових продуктів",
  offers: { "@type": "Offer", price: "0", priceCurrency: "UAH" },
  featureList: "Оподаткування, Бухоблік, Законодавство, Фінансові продукти, Документообіг, Установи",
  url: "https://fintodo.com.ua/consultant",
};

// ── Competency Chip Grid Component ──
interface CompetencyChipGridProps {
  activeComp: string;
  onSelect: (id: string) => void;
  getAccess: (id: string) => { canSend: boolean; remaining: number; isSponsored: boolean; sponsorName?: string };
  freeLimit: number;
  onExampleClick: (ex: string) => void;
  mobile?: boolean;
}

const CompetencyChipGrid = ({ activeComp, onSelect, getAccess, freeLimit, onExampleClick, mobile }: CompetencyChipGridProps) => {
  const selectedComp = COMPETENCIES.find((c) => c.id === activeComp);
  const access = selectedComp ? getAccess(selectedComp.id) : null;

  return (
    <div className="space-y-3">
      {/* Chip grid — 2 cols desktop, horizontal scroll mobile */}
      <div className={cn(
        mobile
          ? "flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1"
          : "grid grid-cols-2 gap-1.5 pt-2"
      )}>
        {COMPETENCIES.map((comp) => {
          const compAccess = getAccess(comp.id);
          const isActive = activeComp === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => onSelect(comp.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all text-left",
                mobile && "shrink-0 whitespace-nowrap",
                isActive
                  ? "bg-primary/10 border border-primary/40 text-primary shadow-sm"
                  : compAccess.isSponsored
                    ? "border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-foreground hover:border-emerald-300 dark:hover:border-emerald-700"
                    : "border border-border bg-background text-foreground hover:border-primary/30 hover:bg-muted/50",
                !compAccess.canSend && !compAccess.isSponsored && "opacity-50"
              )}
            >
              <span className="text-sm">{comp.emoji}</span>
              <span className="truncate">{comp.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected competency details */}
      {selectedComp && access && (
        <div className="space-y-2.5">
          <div>
            <p className="text-xs font-semibold text-foreground">{selectedComp.emoji} {selectedComp.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{selectedComp.description}</p>
          </div>

          {/* Access indicator */}
          {access.isSponsored ? (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <span>🤝</span>
              <span>Безкоштовно від {selectedComp.sponsorName}</span>
            </div>
          ) : access.canSend ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Використано</span>
                <span className="font-medium text-foreground">{freeLimit - access.remaining}/{freeLimit}</span>
              </div>
              <Progress
                value={((freeLimit - access.remaining) / freeLimit) * 100}
                className={cn(
                  "h-1.5",
                  access.remaining <= 1 ? "[&>div]:bg-destructive" : access.remaining <= 2 ? "[&>div]:bg-yellow-500" : ""
                )}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Ліміт вичерпано</span>
            </div>
          )}

          {/* Example questions as clickable cards */}
          <div className="flex flex-col gap-1">
            {selectedComp.examples.map((ex) => (
              <button
                key={ex}
                onClick={() => access.canSend && onExampleClick(ex)}
                disabled={!access.canSend}
                className={cn(
                  "flex items-center justify-between gap-2 text-left text-xs rounded-lg px-3 py-2 border transition-all group",
                  access.canSend
                    ? "border-border/60 hover:border-primary/40 hover:bg-primary/5 text-foreground cursor-pointer"
                    : "border-border/30 text-muted-foreground/50 cursor-not-allowed"
                )}
              >
                <span className="leading-snug">{ex}</span>
                {access.canSend && (
                  <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
                )}
              </button>
            ))}
            {selectedComp.quickStartPrompt && access.canSend && (
              <button
                onClick={() => onExampleClick(`🎯 Запусти режим підбору: ${selectedComp.quickStartPrompt}`)}
                className="text-xs text-left bg-primary/10 text-primary rounded-lg px-3 py-2 hover:bg-primary/20 transition-colors font-medium"
              >
                🎯 Запустити підбір →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ConsultantPage = () => {
  const isMobile = useIsMobile();
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const knowledgeBase = useMemo(() => buildFullKnowledgeBase(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "chat";
  const { getAccess, trackMessage, FREE_LIMIT } = useCompetencyAccess();

  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id ?? null);
  const { audience: globalAudience } = useAudience();
  const [audience, setAudience] = useState<AudienceType>(() => globalAudience === "individual" ? "personal" : "business");
  const [activeComp, setActiveComp] = useState<string>("tax");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userCtx, setUserCtx] = useState<UserContext>(getUserContext() || { fopGroup: null, city: null, bank: null, audience: "all" });


  useEffect(() => {
    setAudience(globalAudience === "individual" ? "personal" : "business");
  }, [globalAudience]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoSent = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeConversation?.messages ?? [];
  const effectiveComp = activeComp || "tax";
  const currentAccess = getAccess(effectiveComp);

  const suggestionCards = useMemo(() => {
    const withCards = POPULAR_QUESTIONS.filter((q) => q.title && q.hint);
    const pick = (aud: string) => withCards.find((c) => c.audience === aud);
    return [pick("business"), pick("personal"), pick("accountant"), pick("both")].filter(Boolean) as typeof POPULAR_QUESTIONS;
  }, []);

  useEffect(() => { saveConversations(conversations); }, [conversations]);
  useEffect(() => { const el = chatContainerRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages]);

  const refreshCtx = useCallback(() => {
    setUserCtx(getUserContext() || { fopGroup: null, city: null, bank: null, audience: "all" });
  }, []);

  const createConversation = useCallback((firstMessage?: string, topic?: string | null) => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id, title: firstMessage?.slice(0, 50) || "Нова розмова",
      messages: [], audience, topic: topic ?? effectiveComp, createdAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    if (isMobile) setSidebarOpen(false);
    return id;
  }, [audience, isMobile, effectiveComp]);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeId === id) setActiveId(filtered[0]?.id ?? null);
      return filtered;
    });
  }, [activeId]);

  const sendMessage = useCallback(async (text: string, targetId?: string) => {
    if (!text.trim() || isStreaming) return;

    const access = getAccess(effectiveComp);
    if (!access.canSend) return;

    trackMessage(effectiveComp);

    let convId = targetId || activeId;
    if (!convId) convId = createConversation(text);

    const userMessage: Message = { role: "user", content: text.trim() };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, userMessage], title: c.messages.length === 0 ? text.slice(0, 50) : c.title }
          : c
      )
    );
    setInput("");
    setIsStreaming(true);

    try {
      const conv = conversations.find((c) => c.id === convId);
      const allMessages = [...(conv?.messages ?? []), userMessage];
      const { data, error } = await supabase.functions.invoke("portal-chat", {
        body: {
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          audience: conv?.audience ?? audience,
          knowledgeBase,
          userContext: {
            ...userCtx, selectedTopic: effectiveComp,
            pageContext: searchParams.get("ctx"),
            pageSlug: searchParams.get("id") || searchParams.get("code"),
          },
        },
      });

      if (error) throw error;

      if (data instanceof ReadableStream) {
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, messages: [...c.messages, userMessage, { role: "assistant", content: "" }] } : c
          )
        );

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
                setConversations((prev) =>
                  prev.map((c) => {
                    if (c.id !== convId) return c;
                    const msgs = [...c.messages];
                    msgs[msgs.length - 1] = { role: "assistant", content };
                    return { ...c, messages: msgs };
                  })
                );
              }
            } catch { /* skip */ }
          }
        }
      } else if (typeof data === "object" && data?.error) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, messages: [...c.messages, userMessage, { role: "assistant", content: `⚠️ ${data.error}` }] } : c
          )
        );
      }
    } catch {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, { role: "assistant", content: "⚠️ Помилка з'єднання. Спробуйте ще раз." }] }
            : c
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [activeId, isStreaming, conversations, audience, knowledgeBase, createConversation, userCtx, effectiveComp, searchParams, getAccess, trackMessage]);

  // URL params context auto-send
  useEffect(() => {
    if (hasAutoSent.current) return;
    const ctx = searchParams.get("ctx");
    const id = searchParams.get("id") || searchParams.get("code");
    if (!ctx || !id) return;
    hasAutoSent.current = true;
    const autoQuestions: Record<string, (val: string) => string> = {
      institution: (val) => {
        const inst = INSTITUTION_PROFILES.find((p) => p.id === val || p.slug === val);
        return inst
          ? `Розкажи про ${inst.name}: де знаходиться, графік роботи, що потрібно для початку роботи`
          : `Розкажи про ${val}: де знаходиться, графік роботи, що потрібно для відкриття рахунку`;
      },
      grant: (val) => {
        const g = GRANTS.find((gr) => gr.id === val || gr.slug === val);
        return g
          ? `Допоможи подати заявку на "${g.name}": вимоги, документи, покрокова інструкція`
          : `Допоможи подати заявку на "${val}": документи, вимоги, покрокова інструкція`;
      },
      law: (val) => {
        const l = LAWS.find((lw) => lw.id === val || lw.slug === val);
        return l
          ? `Поясни ${l.shortName} просто: що це, як стосується ФОП, останні зміни`
          : `Поясни ${val} простими словами і як він впливає на ФОП`;
      },
      kved: (code) => `КВЕД ${code} — яку групу ФОП обрати і чи потрібна ліцензія?`,
      article: (slug) => `Маю питання по темі "${slug}" — що ще важливо знати?`,
    };
    const question = autoQuestions[ctx]?.(id);
    if (question) setTimeout(() => sendMessage(question), 400);
  }, [searchParams, sendMessage]);

  const startNew = useCallback(() => {
    setActiveId(null);
    setActiveComp("tax");
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleSelectFopType = (type: string) => {
    localStorage.setItem('fint_fop_group', type);
    refreshCtx();
  };

  const handleSelectCity = (city: string) => {
    localStorage.setItem('fint_city', city);
    refreshCtx();
  };

  const sponsoredCompIds = COMPETENCIES.filter(c => c.accessTier === 'sponsored').map(c => c.id);

  return (
    <PortalLayout
      meta={{
        title: activeTab === "forum"
          ? "АІ-форум з податків та бухгалтерії — FINTODO"
          : "AI-консультант — податки, банки, фінанси, закони | FINTODO",
        description: activeTab === "forum"
          ? "Живий каталог АІ-форуму з податків, бухгалтерії та законодавства. Задайте питання AI або знайдіть відповідь у форумі."
          : "Особистий AI-консультант: пояснює закони, рахує ЄСВ, підбирає банк і депозит. Знає 20+ установ і актуальні ставки.",
        canonical: "https://fintodo.com.ua/consultant",
      }}
    >
      <JsonLd data={WEB_APP_SCHEMA} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "AI-хаб" },
        ]} />

        {/* ── COMPACT HEADER: Title + Pill tabs in one row ── */}
        <div className="flex items-center justify-between gap-3 pt-4 pb-2">
          <h1 className="text-lg sm:text-xl font-bold shrink-0">AI-хаб</h1>

          <div className="inline-flex items-center bg-muted rounded-full p-0.5 gap-0.5">
            <button
              onClick={() => setSearchParams({ tab: "chat" })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === "chat"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ChatIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Консультант</span>
              <span className="sm:hidden">Чат</span>
            </button>
            <button
              onClick={() => setSearchParams({ tab: "forum" })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === "forum"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Форум
            </button>
          </div>

          {/* Spacer for centering */}
          <div className="w-[60px] shrink-0 hidden sm:block" />
        </div>

        {activeTab === "forum" ? (
          <div className="py-8">
            <ConsultantForumTab />
          </div>
        ) : (
        <>




        {/* ── MAIN AREA: SIDEBAR + CHAT ── */}
        <div className="flex gap-0 lg:gap-4 h-[calc(100dvh-10rem)] min-h-[400px] mt-3">

          {/* ── LEFT SIDEBAR: Competencies (Desktop) ── */}
          {!isMobile && !isTablet && (
             <aside className="shrink-0 w-[280px] flex flex-col border border-border/60 rounded-2xl bg-card shadow-lg overflow-hidden">
               {/* Who are you — profile dropdowns */}
               <div className="px-4 pt-3 pb-2 border-b border-border/40">
                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">👤 Хто ви</p>
                 <div className="flex gap-2">
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <button className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border border-border bg-background hover:border-primary/50 transition-colors">
                         <User className="w-3 h-3 text-muted-foreground" />
                         <span className="font-medium truncate">{userCtx.fopGroup || "Тип"}</span>
                         <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                       </button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="min-w-[140px]">
                       {FOP_TYPES.map((type) => (
                         <DropdownMenuItem key={type} onClick={() => handleSelectFopType(type)} className={cn("text-xs cursor-pointer", userCtx.fopGroup === type && "bg-primary/10 text-primary font-medium")}>
                           {type}
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuContent>
                   </DropdownMenu>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <button className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border border-border bg-background hover:border-primary/50 transition-colors">
                         <MapPin className="w-3 h-3 text-muted-foreground" />
                         <span className="font-medium truncate">{userCtx.city || "Місто"}</span>
                         <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                       </button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="min-w-[140px]">
                       {CITIES.map((city) => (
                         <DropdownMenuItem key={city} onClick={() => handleSelectCity(city)} className={cn("text-xs cursor-pointer", userCtx.city === city && "bg-primary/10 text-primary font-medium")}>
                           {city}
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
               </div>
               <div className="px-4 pt-3 pb-1">
                 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                   Питання
                 </p>
               </div>
               <div className="flex-1 overflow-y-auto px-3 pb-3">
                 <CompetencyChipGrid
                   activeComp={activeComp}
                   onSelect={setActiveComp}
                   getAccess={getAccess}
                   freeLimit={FREE_LIMIT}
                   onExampleClick={(ex) => sendMessage(ex)}
                 />
               </div>
             </aside>
          )}

          {/* ── MOBILE BOTTOM SHEET: Competencies ── */}
          {(isMobile || isTablet) && (
             <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
               <SheetContent side="bottom" className="max-h-[75dvh] px-4 pb-6">
                 <SheetHeader className="pb-2">
                   <SheetTitle className="text-sm">Оберіть тему</SheetTitle>
                 </SheetHeader>
                 {/* Who are you — mobile */}
                 <div className="flex gap-2 mb-3">
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <button className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border border-border bg-background hover:border-primary/50 transition-colors">
                         <User className="w-3 h-3 text-muted-foreground" />
                         <span className="font-medium truncate">{userCtx.fopGroup || "Тип"}</span>
                         <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                       </button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="min-w-[140px]">
                       {FOP_TYPES.map((type) => (
                         <DropdownMenuItem key={type} onClick={() => handleSelectFopType(type)} className={cn("text-xs cursor-pointer", userCtx.fopGroup === type && "bg-primary/10 text-primary font-medium")}>
                           {type}
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuContent>
                   </DropdownMenu>
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <button className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 border border-border bg-background hover:border-primary/50 transition-colors">
                         <MapPin className="w-3 h-3 text-muted-foreground" />
                         <span className="font-medium truncate">{userCtx.city || "Місто"}</span>
                         <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                       </button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="min-w-[140px]">
                       {CITIES.map((city) => (
                         <DropdownMenuItem key={city} onClick={() => handleSelectCity(city)} className={cn("text-xs cursor-pointer", userCtx.city === city && "bg-primary/10 text-primary font-medium")}>
                           {city}
                         </DropdownMenuItem>
                       ))}
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
                 <CompetencyChipGrid
                   activeComp={activeComp}
                   onSelect={setActiveComp}
                   getAccess={getAccess}
                   freeLimit={FREE_LIMIT}
                   onExampleClick={(ex) => {
                     sendMessage(ex);
                     setSidebarOpen(false);
                   }}
                   mobile
                 />
               </SheetContent>
             </Sheet>
          )}

          {/* ── MAIN CHAT ── */}
          <div className="flex-1 flex flex-col rounded-2xl border border-border/60 bg-card shadow-lg overflow-hidden min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-border/50 bg-muted/30 shrink-0">
              {(isMobile || isTablet) && !sidebarOpen && (
                <Button variant="ghost" size="icon" className="shrink-0 text-foreground hover:bg-muted h-8 w-8" onClick={() => setSidebarOpen(true)}>
                  <Menu className="w-4 h-4" />
                </Button>
              )}
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">AI-Консультант</span>
              <Badge variant="info" className="text-[10px]">beta</Badge>
              <div className="flex items-center gap-1 ml-auto">
                {messages.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={startNew}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Нова розмова</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-1">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-6">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                      Чим можу допомогти?
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Допоможу розібратись з податками, звітністю, дедлайнами та змінами в законодавстві
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-lg">
                    {suggestionCards.map((card) => (
                      <button
                        key={card.question}
                        onClick={() => sendMessage(card.question)}
                        disabled={isStreaming}
                        className="group flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md text-left transition-all duration-200 disabled:opacity-50 relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xl sm:text-2xl leading-none shrink-0">{card.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors block">{card.title}</span>
                          <span className="text-[11px] sm:text-xs text-muted-foreground leading-snug block mt-0.5">{card.hint}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 opacity-0 group-hover:opacity-100 transition-all shrink-0 -translate-x-1 group-hover:translate-x-0 hidden sm:block" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Partner disclosure banner for sponsored topics */}
                  {currentAccess.isSponsored && messages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-xs"
                    >
                      <span>🤝</span>
                      <span>Ця консультація безкоштовна завдяки партнерам FINTODO</span>
                    </motion.div>
                  )}

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
                                <ChatMarkdown text={msg.content || "..."} />
                              </div>
                            </div>
                            {isLastAssistant && !isStreaming && (
                              <MessageActions content={msg.content} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isStreaming && messages[messages.length - 1]?.role === "user" && (
                    <div className="py-3 border-t border-border/30">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex items-center gap-2 py-1">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-xs text-muted-foreground">AI думає...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <div className="px-2 sm:px-3 pb-2 sm:pb-3 pt-1 space-y-1">
              {!currentAccess.canSend ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-muted/50 p-3 sm:p-4 text-center space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Ви використали {FREE_LIMIT} безкоштовних запитань з «{COMPETENCIES.find(c => c.id === effectiveComp)?.title}»
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Спробуйте безкоштовні спонсоровані теми або оформіть підписку
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        const firstSponsored = sponsoredCompIds[0];
                        if (firstSponsored) setActiveComp(firstSponsored);
                      }}
                    >
                      🤝 Спробувати Фінанси / Установи
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/pricing">Оформити підписку →</Link>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); if (input.trim() && !isStreaming) { sendMessage(input); } }}
                  className="relative flex items-end rounded-2xl border border-border/60 bg-muted/40 shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all duration-200"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim() && !isStreaming) sendMessage(input);
                      }
                    }}
                    placeholder="Опишіть ваше питання..."
                    disabled={isStreaming}
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-3 sm:px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50 max-h-[120px] min-h-[44px]"
                  />
                  {isStreaming ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => { abortRef.current?.abort(); abortRef.current = null; setIsStreaming(false); }}
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
                      disabled={!input.trim()}
                      className={cn(
                        "m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0",
                        input.trim()
                          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          : "text-muted-foreground/40 cursor-default",
                        "disabled:opacity-40"
                      )}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}
                </form>
              )}
              {/* Starter prompt chips — only on empty state */}
              {messages.length === 0 && !input.trim() && currentAccess.canSend && (
                <div className="flex flex-wrap items-center gap-1.5 px-2 pt-1">
                  <span className="text-[11px] text-muted-foreground/60 shrink-0">Спробуйте:</span>
                  {STARTER_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setInput(p)}
                      className="text-[11px] rounded-full border border-border/60 bg-background px-2.5 py-1 text-foreground/70 hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
              {/* Hints — desktop only */}
              <div className="hidden sm:flex items-center justify-between px-2 gap-4">
                <span className="text-[11px] text-muted-foreground/50">
                  ⏎ Enter — надіслати · Shift+Enter — новий рядок
                </span>
                <span className="text-[11px] text-muted-foreground/50 text-right">
                  AI може помилятись. Перевіряйте важливу інформацію.
                </span>
              </div>
              {/* Mobile disclaimer only */}
              <p className="sm:hidden text-[10px] text-muted-foreground/50 text-center px-2">
                AI може помилятись
              </p>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR: Recent Consultations ── */}
          {!isMobile && !isTablet && (
            <div className="hidden lg:block w-[300px] shrink-0 rounded-2xl border border-border/60 bg-card shadow-lg p-4 overflow-y-auto h-full">
              <RecentConsultationsSidebar maxItems={6} />
            </div>
          )}
        </div>

        {/* ── DISCLOSURE ── */}
        <footer className="border-t px-4 py-3 text-center mt-3 space-y-1">
          <p className="text-[11px] text-foreground/80 leading-relaxed">
            <span className="font-medium">AI може помилятися. Перевіряйте важливі рішення.</span>{' '}
            Сервіс надає загальну інформацію і не є юридичною чи фінансовою консультацією.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Партнерські рекомендації позначені{' '}
            <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded">🤝 Партнер</span>
            {' '}і відібрані за незалежними рейтингами FINTODO. Спонсоровані теми (Фінанси, Установи) безкоштовні завдяки партнерам.{' '}
            <a href="/publications/ratings" className="underline hover:text-foreground">Методологія оцінок</a>
            {' '}·{' '}
            <a href="/privacy" className="underline hover:text-foreground">Конфіденційність</a>
          </p>
        </footer>
        </>
        )}
      </div>
    </PortalLayout>
  );
};

export default ConsultantPage;
