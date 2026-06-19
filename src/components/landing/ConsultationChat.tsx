import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowRight, ArrowUp, X } from "lucide-react";
import { TAX_RATES, ESV_MONTHLY } from "@/config/taxConstantsConfig";
import { matchGlossary } from "@/config/chatGlossary";
import { decideConsultAnswer } from "@/lib/consultDecisionEngine";
import { validateEmail } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAudience } from "@/contexts/AudienceContext";
import { ChatActionButton } from "./ChatActionButton";
import { ChatMarkdown } from "./ChatMarkdown";

import {
  type UserProfile,
  type FunnelStage,
  type ChatAction,
  emptyProfile,
  GREETING_BUSINESS,
  GREETING_INDIVIDUAL,
  QUALIFYING_RESPONSES,
  QUALIFYING_2_RESPONSES,
  QUALIFYING_3_RESPONSES,
  QUALIFYING_4_RESPONSES,
  PAIN_POINT_RESPONSES,
  getQualifying3Question,
  getQualifying4Question,
  getPainDiscoveryQuestion,
  getValueAddNode,
  getActionResponse,
  getConversionText,
  getPricingNode,
  getEmailConfirmationText,
  getSoftCtaAfterEmail,
  matchFreeText,
  
  getFaqResponse,
  getConsultResponse,
  type ConsultResponseResult,
  getRemainingActions,
  getTotalActionsCount,
  getEmailNudgeText,
  getInactivityNudge,
  getFinalCtaText,
  getFallbackText,
  getFallbackReplies,
  calculateTaxForIncome,
  CTA_CONSULT_TOPICS,
  FALLBACK_TOPIC_REPLIES,
  CTA_QUICK_REPLIES,
  type PricingCalcProfile,
  type MatchResult,
  type DisambiguateResult,
  emptyPricingCalcProfile,
  getPricingCalcGreeting,
  getPricingCalcFollowUp,
  getPricingRecommendation,
  getFopCheckCTA,
} from "@/config/chatSalesFunnel";

/* ── Types ─────────────────────────────────────────── */

type Msg = {
  role: "ai" | "user";
  text: string;
  timestamp: Date;
  actions?: ChatAction[];
};

const fmtTime = (d: Date) => d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

/* ── Typing dots ───────────────────────────────────── */

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-sm bg-muted w-fit">
    {[0, 1, 2].map((i) => (
      <motion.span key={i} className="w-2 h-2 rounded-full bg-muted-foreground/50" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />
    ))}
  </div>
);

const INACTIVITY_DELAY_SHORT = 15_000;
const INACTIVITY_DELAY_LONG = 30_000;

/* ── Component ─────────────────────────────────────── */

export const ConsultationChat = () => {
  const { audience } = useAudience();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[] | null>(null);
  const [currentActions, setCurrentActions] = useState<ChatAction[] | null>(null);
  const [showCta, setShowCta] = useState(false);
  const [pendingEmailAction, setPendingEmailAction] = useState<ChatAction | null>(null);
  const [awaitingConsultQuestion, setAwaitingConsultQuestion] = useState(false);
  const [awaitingCalculation, setAwaitingCalculation] = useState(false);
  const [awaitingCalcType, setAwaitingCalcType] = useState(false);
  const [calcType, setCalcType] = useState<string | null>(null);
  
  const [declarationStep, setDeclarationStep] = useState(0);
  const PROFILE_KEY = "fintodo_chat_profile";
  const PROFILE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const { profile: p, emailCaptured: ec, timestamp } = JSON.parse(saved);
        if (Date.now() - timestamp < PROFILE_TTL) {
          return p;
        }
        localStorage.removeItem(PROFILE_KEY);
      }
    } catch { /* ignore */ }
    return emptyProfile;
  });
  const [stage, setStage] = useState<FunnelStage>("greeting");
  const [pricingCalcStep, setPricingCalcStep] = useState(0);
  const [pricingCalcProfile, setPricingCalcProfile] = useState<PricingCalcProfile>(emptyPricingCalcProfile);

  // Re-engagement state
  const [usedActions, setUsedActions] = useState<Set<string>>(new Set());
  const [actionCount, setActionCount] = useState(0);
  const [emailCaptured, setEmailCaptured] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) {
        const { emailCaptured: ec, timestamp } = JSON.parse(saved);
        if (Date.now() - timestamp < PROFILE_TTL) return !!ec;
      }
    } catch { /* ignore */ }
    return false;
  });
  const [inactivityFired, setInactivityFired] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const clarifyModeRef = useRef(false);

  // Clear inactivity timer
  const clearInactivity = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  // Reset on audience change
  useEffect(() => {
    const greeting = audience === "business" ? GREETING_BUSINESS : GREETING_INDIVIDUAL;
    setMessages([{ role: "ai", text: greeting.aiText, timestamp: new Date() }]);
    setQuickReplies(greeting.quickReplies || null);
    setCurrentActions(null);
    setIsTyping(false);
    setShowCta(false);
    setPendingEmailAction(null);
    setAwaitingConsultQuestion(false);
    setAwaitingCalculation(false);
    setAwaitingCalcType(false);
    setCalcType(null);
    setDeclarationStep(0);
    setProfile(emptyProfile);
    localStorage.removeItem(PROFILE_KEY);
    setStage("greeting");
    setUsedActions(new Set());
    setActionCount(0);
    setEmailCaptured(false);
    setInactivityFired(false);
    setPricingCalcStep(0);
    setPricingCalcProfile(emptyPricingCalcProfile);
    clearInactivity();
  }, [audience, clearInactivity]);

  // Cleanup timer on unmount
  useEffect(() => clearInactivity, [clearInactivity]);

  // Persist profile to localStorage
  useEffect(() => {
    if (profile.type) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        profile,
        emailCaptured,
        timestamp: Date.now(),
      }));
    }
  }, [profile, emailCaptured]);

  // Auto-scroll
  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping, quickReplies, currentActions, showCta, pendingEmailAction]);

  /* ── Inactivity timer ─────────────────────────────── */

  const startInactivityTimer = useCallback((currentProfile: UserProfile, longContent = false) => {
    clearInactivity();
    const delay = longContent ? INACTIVITY_DELAY_LONG : INACTIVITY_DELAY_SHORT;
    inactivityTimer.current = setTimeout(() => {
      setInactivityFired(true);
      const nudgeText = getInactivityNudge(currentProfile, usedActions);
      setIsTyping(true);
      setQuickReplies(null);
      setCurrentActions(null);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "ai", text: nudgeText, timestamp: new Date() }]);
        setIsTyping(false);
        // Show remaining actions + try free CTA
        // Show contextual quick replies for nudge (no currentActions to avoid duplicate buttons)
        const nudgeReplies = getRemainingActions(currentProfile, usedActions).map(a => a.label);
        nudgeReplies.push("Спробувати безкоштовно");
        setQuickReplies(nudgeReplies);
      }, 600);
    }, delay);
  }, [clearInactivity, usedActions]);

  /* ── AI response helper ───────────────────────────── */

  const addAiMessage = useCallback((text: string, options?: { actions?: ChatAction[]; replies?: string[]; showEmail?: boolean }) => {
    setIsTyping(true);
    setQuickReplies(null);
    setCurrentActions(null);
    if (!options?.showEmail) setPendingEmailAction(null);

    const delay = 600 + Math.random() * 500;
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: "ai",
        text,
        timestamp: new Date(),
        actions: options?.actions,
      }]);
      setIsTyping(false);
      if (options?.replies) setQuickReplies(options.replies);
      if (options?.actions) setCurrentActions(options.actions);
    }, delay);
  }, []);

  /* ── Show remaining actions after an action response ── */

  const showRemainingAfterAction = useCallback((currentProfile: UserProfile, newUsedActions: Set<string>, newActionCount: number, lastAction?: string) => {
    const remaining = getRemainingActions(currentProfile, newUsedActions);
    const totalActions = getTotalActionsCount(currentProfile);

    // All actions used → final CTA
    if (remaining.length === 0) {
      setTimeout(() => {
        addAiMessage(getFinalCtaText(currentProfile));
        setTimeout(() => setShowCta(true), 1500);
      }, 2000);
      return;
    }

    // After 2nd action without email → email nudge + remaining
    if (newActionCount >= 2 && !emailCaptured) {
      setTimeout(() => {
        const nudgeText = getEmailNudgeText(currentProfile, lastAction);
        addAiMessage(nudgeText, { actions: remaining, showEmail: true });
        setPendingEmailAction({ label: "Зберегти розмову", icon: "Mail", type: "consult" });
      }, 2000);
      return;
    }

    // Default: show remaining actions
    setTimeout(() => {
      setCurrentActions(remaining);
      // Start inactivity timer if not fired yet
      if (!inactivityFired) {
        startInactivityTimer(currentProfile);
      }
    }, 1500);
  }, [addAiMessage, emailCaptured, inactivityFired, startInactivityTimer]);

  /* ── Process funnel reply ─────────────────────────── */

  const processFunnelReply = useCallback((key: string): boolean => {
    clearInactivity();

    // ── Dynamic "Покажіть ціни" (audience-aware) ──
    if (key === "Покажіть ціни") {
      const node = getPricingNode(profile);
      const updatedProfile = { ...profile, ...node.profileUpdate };
      if (node.profileUpdate) setProfile(updatedProfile);
      setStage(node.nextStage);
      addAiMessage(node.aiText, { replies: node.quickReplies, actions: node.actions });
      return true;
    }

    // Audience-aware lookup for individual-specific nodes
    let lookupKey = key;
    if ((key === "Просто цікавлюсь" || key === "Просто порівнюю сервіси") && audience === "individual") {
      lookupKey = `${key}::individual`;
    }
    // Check qualifying responses
    const qNode = QUALIFYING_RESPONSES[lookupKey];
    if (qNode) {
      const updatedProfile = { ...profile, ...qNode.profileUpdate };
      if (qNode.profileUpdate) setProfile(updatedProfile);
      setStage(qNode.nextStage);
      addAiMessage(qNode.aiText, { replies: qNode.quickReplies, actions: qNode.actions });
      // ── Auto-show CTA on conversion stage or empty quickReplies ──
      if (qNode.nextStage === "conversion" || (qNode.quickReplies && qNode.quickReplies.length === 0)) {
        setTimeout(() => setShowCta(true), 1500);
      }
      return true;
    }

    // Check qualifying_2 responses
    const q2Node = QUALIFYING_2_RESPONSES[key];
    if (q2Node) {
      const updatedProfile = { ...profile, ...q2Node.profileUpdate };
      if (q2Node.profileUpdate) setProfile(updatedProfile);
      setStage(q2Node.nextStage);

      if (q2Node.nextStage === "qualifying_3") {
        addAiMessage(q2Node.aiText, { replies: q2Node.quickReplies });
        setTimeout(() => {
          const q3 = getQualifying3Question(updatedProfile as UserProfile);
          setStage("qualifying_3");
          addAiMessage(q3.aiText, { replies: q3.quickReplies });
        }, 2000 + Math.random() * 500);
        return true;
      }

      if (q2Node.nextStage === "pain_discovery") {
        addAiMessage(q2Node.aiText);
        setTimeout(() => {
          const pd = getPainDiscoveryQuestion(updatedProfile as UserProfile);
          setStage("pain_discovery");
          addAiMessage(pd.aiText, { replies: pd.quickReplies });
        }, 2000 + Math.random() * 500);
        return true;
      }

      if (q2Node.nextStage === "value_add" && !q2Node.actions) {
        addAiMessage(q2Node.aiText, { replies: q2Node.quickReplies });
        setTimeout(() => {
          const vaNode = getValueAddNode(updatedProfile as UserProfile);
          setStage("value_add");
          addAiMessage(vaNode.aiText, { actions: vaNode.actions });
          if (!inactivityFired) startInactivityTimer(updatedProfile as UserProfile);
        }, 2000 + Math.random() * 500);
        return true;
      }

      addAiMessage(q2Node.aiText, { replies: q2Node.quickReplies, actions: q2Node.actions });
      return true;
    }

    // Check qualifying_3 responses (VAT / tax system)
    const q3Node = QUALIFYING_3_RESPONSES[key];
    if (q3Node) {
      const updatedProfile = { ...profile, ...q3Node.profileUpdate };
      if (q3Node.profileUpdate) setProfile(updatedProfile);
      setStage(q3Node.nextStage);

      if (q3Node.nextStage === "qualifying_4") {
        addAiMessage(q3Node.aiText);
        setTimeout(() => {
          const q4 = getQualifying4Question(updatedProfile as UserProfile);
          setStage("qualifying_4");
          addAiMessage(q4.aiText, { replies: q4.quickReplies });
        }, 1500 + Math.random() * 500);
        return true;
      }

      addAiMessage(q3Node.aiText, { replies: q3Node.quickReplies });
      return true;
    }

    // Check qualifying_4 responses (employees / TOV VAT)
    const q4Node = QUALIFYING_4_RESPONSES[key];
    if (q4Node) {
      const updatedProfile = { ...profile, ...q4Node.profileUpdate };
      if (q4Node.profileUpdate) setProfile(updatedProfile);
      setStage(q4Node.nextStage);

      if (q4Node.nextStage === "pain_discovery") {
        addAiMessage(q4Node.aiText);
        setTimeout(() => {
          const pd = getPainDiscoveryQuestion(updatedProfile);
          setStage("pain_discovery");
          addAiMessage(pd.aiText, { replies: pd.quickReplies });
        }, 1500 + Math.random() * 500);
        return true;
      }

      addAiMessage(q4Node.aiText, { replies: q4Node.quickReplies });
      return true;
    }

    // Check pain point responses
    const ppNode = PAIN_POINT_RESPONSES[key];
    if (ppNode) {
      const updatedProfile = { ...profile, ...ppNode.profileUpdate };
      if (ppNode.profileUpdate) setProfile(updatedProfile);

      // Pain point "невизначеність" → auto-launch declaration flow (profile-aware)
      if (ppNode.profileUpdate?.painPoint === "невизначеність") {
        addAiMessage(ppNode.aiText || "Це часте питання! Давайте з'ясуємо за 30 секунд — я задам кілька простих питань.");
        setUsedActions(prev => new Set([...prev, "check_declaration"]));

        if (profile.fopGroup) {
          const isQuarterly = profile.fopGroup === 3;
          const deadline = isQuarterly
            ? "квартальна, найближчий дедлайн — 12 травня 2026"
            : "річна, дедлайн — 1 березня";
          setStage("value_add");
          setTimeout(() => {
            addAiMessage(`📋 ФОП ${profile.fopGroup} групи подає ${deadline}.\n\nFINTODO автоматично сформує декларацію за 3 хвилини.`);
            setTimeout(() => {
              addAiMessage("", {
                replies: ["Подати декларацію через FINTODO", "Розрахувати податок", "Інше питання"],
              });
            }, 1500);
          }, 1500 + Math.random() * 500);
          return true;
        }
        if (profile.type === "tov") {
          setStage("value_add");
          setTimeout(() => {
            addAiMessage("📋 ТОВ подає фінансову звітність та декларацію з податку на прибуток. FINTODO автоматизує підготовку всіх форм.");
            setTimeout(() => {
              addAiMessage("", {
                replies: ["Спробувати безкоштовно", "Інше питання"],
              });
            }, 1500);
          }, 1500 + Math.random() * 500);
          return true;
        }

        setStage("check_declaration");
        setTimeout(() => {
          setDeclarationStep(1);
          addAiMessage("Чи отримували ви у минулому році дохід НЕ від роботодавця?", {
            replies: ["Так, отримував", "Ні, тільки зарплата", "Не впевнений"],
          });
        }, 1500 + Math.random() * 500);
        return true;
      }

      // Pain point "помилки" → propose calculator
      if (ppNode.profileUpdate?.painPoint === "помилки") {
        setStage("value_add");
        addAiMessage(ppNode.aiText);
        setTimeout(() => {
          addAiMessage("Хочете розрахувати ваш податок прямо зараз? Я порахую точну суму за секунди.", {
            replies: ["Так, розрахувати", "Ні, інше питання"],
          });
        }, 1500);
        return true;
      }

      // Pain point "складність" → propose declaration check (profile-aware)
      if (ppNode.profileUpdate?.painPoint === "складність") {
        addAiMessage(ppNode.aiText);
        setUsedActions(prev => new Set([...prev, "check_declaration"]));

        if (profile.fopGroup) {
          const isQuarterly = profile.fopGroup === 3;
          const deadline = isQuarterly
            ? "квартальна, найближчий дедлайн — 12 травня 2026"
            : "річна, дедлайн — 1 березня";
          setStage("value_add");
          setTimeout(() => {
            addAiMessage(`📋 ФОП ${profile.fopGroup} групи подає ${deadline}.\n\nFINTODO автоматично сформує декларацію за 3 хвилини.`);
            setTimeout(() => {
              addAiMessage("", {
                replies: ["Подати декларацію через FINTODO", "Розрахувати податок", "Інше питання"],
              });
            }, 1500);
          }, 1500);
          return true;
        }
        if (profile.type === "tov") {
          setStage("value_add");
          setTimeout(() => {
            addAiMessage("📋 ТОВ подає фінансову звітність та декларацію з податку на прибуток. FINTODO автоматизує підготовку всіх форм.");
            setTimeout(() => {
              addAiMessage("", {
                replies: ["Спробувати безкоштовно", "Інше питання"],
              });
            }, 1500);
          }, 1500);
          return true;
        }

        setStage("check_declaration");
        setTimeout(() => {
          setDeclarationStep(1);
          addAiMessage("Давайте спочатку з'ясуємо, чи потрібна вам декларація. Чи отримували ви у минулому році дохід НЕ від роботодавця?", {
            replies: ["Так, отримував", "Ні, тільки зарплата", "Не впевнений"],
          });
        }, 1500);
        return true;
      }

      setStage("value_add");
      // "Перейти до дій" → skip intro text, show actions immediately
      if (key === "Перейти до дій ➡️") {
        const vaNode = getValueAddNode(updatedProfile as UserProfile);
        addAiMessage(vaNode.aiText, { actions: vaNode.actions });
        if (!inactivityFired) startInactivityTimer(updatedProfile as UserProfile);
        return true;
      }
      // Use specific aiText if available, otherwise generic
      const introText = ppNode.aiText || "Зрозуміло! Зараз підготую персоналізовані рекомендації...";
      addAiMessage(introText);
      setTimeout(() => {
        const vaNode = getValueAddNode(updatedProfile as UserProfile);
        addAiMessage(vaNode.aiText, { actions: vaNode.actions });
        if (!inactivityFired) startInactivityTimer(updatedProfile as UserProfile);
      }, 1500 + Math.random() * 500);
      return true;
    }

    return false;
  }, [addAiMessage, profile, clearInactivity, inactivityFired, startInactivityTimer]);

  /* ── Quick reply handler ──────────────────────────── */

  const handlePricingCalcReply = useCallback((text: string) => {
    if (pricingCalcStep === 0) {
      // Step 0: entity type selected
      const updatedCalc = { ...pricingCalcProfile, entityType: text };
      setPricingCalcProfile(updatedCalc);
      setPricingCalcStep(1);
      const followUp = getPricingCalcFollowUp(1, updatedCalc);
      addAiMessage(followUp.aiText, { replies: followUp.quickReplies });
    } else if (pricingCalcStep === 1) {
      // Step 1: detail selected
      const updatedCalc = { ...pricingCalcProfile, detail: text };
      setPricingCalcProfile(updatedCalc);

      if (pricingCalcProfile.entityType === "Фізична особа") {
        // Skip volume question for individuals
        setPricingCalcStep(3);
        const rec = getPricingRecommendation(updatedCalc);
        addAiMessage(rec.aiText, { replies: ["Задати інше питання"] });
        setTimeout(() => setShowCta(true), 1500);
      } else {
        setPricingCalcStep(2);
        const followUp = getPricingCalcFollowUp(2, updatedCalc);
        addAiMessage(followUp.aiText, { replies: followUp.quickReplies });
      }
    } else if (pricingCalcStep === 2) {
      // Step 2: volume selected → recommendation
      const updatedCalc = { ...pricingCalcProfile, volume: text };
      setPricingCalcProfile(updatedCalc);
      setPricingCalcStep(3);
      const rec = getPricingRecommendation(updatedCalc);
      addAiMessage(rec.aiText, { replies: ["Задати інше питання"] });
      setTimeout(() => setShowCta(true), 1500);
    }
  }, [pricingCalcStep, pricingCalcProfile, addAiMessage]);

  const handleQuickReply = useCallback((text: string) => {
    if (isTyping) return;
    clearInactivity();
    // Handle "Скасувати" — exit from awaiting states
    if (text === "Скасувати") {
      setAwaitingCalculation(false);
      setAwaitingCalcType(false);
      setCalcType(null);
      setAwaitingConsultQuestion(false);
      setDeclarationStep(0);
      setPendingEmailAction(null);
      setMessages((prev) => [...prev, { role: "user", text, timestamp: new Date() }]);
      addAiMessage("Зрозуміло! Чим ще можу допомогти?");
      const vaNode = getValueAddNode(profile);
      setTimeout(() => addAiMessage(vaNode.aiText, { actions: vaNode.actions }), 1500);
      return;
    }
    // Glossary check in quick replies (for consistency)
    const glossaryMatch = matchGlossary(text);
    if (glossaryMatch) {
      setMessages((prev) => [...prev, { role: "user", text, timestamp: new Date() }]);
      addAiMessage(glossaryMatch.definition);
      setTimeout(() => {
        const vaNode = getValueAddNode(profile);
        if (vaNode.actions && vaNode.actions.length > 0) {
          setCurrentActions(vaNode.actions);
        } else {
          setQuickReplies(CTA_QUICK_REPLIES);
        }
      }, 800);
      return;
    }
    // If declaration wizard is active, delegate to handleSend (which handles declarationStep)
    if (declarationStep > 0) {
      handleSend(text);
      return;
    }
    // If any awaiting state is active, delegate to handleSend to preserve the flow
    if (awaitingCalcType || awaitingCalculation || awaitingConsultQuestion) {
      handleSend(text);
      return;
    }
    // Check if text matches an action label BEFORE adding user message
    // (handleAction adds its own user message)
    const allActions = getValueAddNode(profile).actions || [];
    const matchedAction = allActions.find(a => a.label === text);
    if (matchedAction) {
      handleAction(matchedAction);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text, timestamp: new Date() }]);

    if (stage === "pricing_calc") {
      if (pricingCalcStep === 3 && text === "Задати інше питання") {
        setStage("consulting");
        setPricingCalcStep(0);
        setPricingCalcProfile(emptyPricingCalcProfile);
        setShowCta(false);
        setQuickReplies(null);
        addAiMessage("Звісно! Задавайте будь-яке питання — я готовий допомогти. 🙂");
        return;
      }
      handlePricingCalcReply(text);
      return;
    }

    // Handle "Подати декларацію через FINTODO" → CTA
    if (text === "Подати декларацію через FINTODO") {
      addAiMessage("Подача декларації через FINTODO займає 3 хвилини замість 2-3 годин. Після реєстрації:\n\n— AI автоматично збирає дані з банків та категоризує транзакції\n— Формує декларацію та перевіряє на 50+ типових помилок\n— Підписання КЕП та подача до ДПС — все в одному вікні\n\nРеєстрація займає 30 секунд через Дія.Підпис. Безкоштовний тариф Start (300 кредитів/міс) дозволяє подати декларацію без оплати.", {
        replies: ["Спробувати безкоштовно", "Що ще входить?", "Інше питання"],
      });
      return;
    }

    // Handle "Що ще входить?" → show pricing/features
    if (text === "Що ще входить?") {
      const pricingNode = getPricingNode(profile);
      addAiMessage(pricingNode.aiText, { replies: pricingNode.quickReplies });
      return;
    }

    // Handle "Ні, інше питання" or "Інше питання" → show value_add with actions
    if (text === "Ні, інше питання" || text === "Інше питання") {
      const remaining = getRemainingActions(profile, usedActions);
      if (remaining.length > 0) {
        addAiMessage("Чим ще можу допомогти?", { actions: remaining });
      } else {
        addAiMessage("Задайте будь-яке питання або оберіть тему:", {
          replies: [...FALLBACK_TOPIC_REPLIES, "Спробувати безкоштовно"],
        });
      }
      if (!inactivityFired) startInactivityTimer(profile);
      return;
    }

    // Handle "Перевірити декларацію" from nudge → launch declaration wizard (profile-aware)
    if (text === "Перевірити декларацію") {
      setAwaitingCalculation(false);
      setUsedActions(prev => new Set([...prev, "check_declaration"]));

      if (profile.fopGroup) {
        const isQuarterly = profile.fopGroup === 3;
        const deadline = isQuarterly
          ? "квартальна, найближчий дедлайн — 12 травня 2026"
          : "річна, дедлайн — 1 березня";
        setStage("value_add");
        addAiMessage(`📋 ФОП ${profile.fopGroup} групи подає ${deadline}.\n\nFINTODO автоматично сформує декларацію за 3 хвилини.`);
        setTimeout(() => {
          addAiMessage("", {
            replies: ["Подати декларацію через FINTODO", "Розрахувати податок", "Інше питання"],
          });
        }, 1500);
        return;
      }
      if (profile.type === "tov") {
        setStage("value_add");
        addAiMessage("📋 ТОВ подає фінансову звітність та декларацію з податку на прибуток. FINTODO автоматизує підготовку всіх форм.");
        setTimeout(() => {
          addAiMessage("", {
            replies: ["Спробувати безкоштовно", "Інше питання"],
          });
        }, 1500);
        return;
      }

      setDeclarationStep(1);
      setStage("check_declaration");
      addAiMessage("Давайте перевіримо, чи потрібна вам декларація. Чи отримували ви доходи, крім зарплати, за минулий рік?", {
        replies: ["Так, отримував", "Ні, тільки зарплата", "Не впевнений"],
      });
      return;
    }

    // Handle "Перевірити ФОП" from nudge → launch FOP check CTA
    if (text === "Перевірити ФОП") {
      setAwaitingCalculation(false);
      setAwaitingConsultQuestion(false);
      setUsedActions(prev => new Set([...prev, "check_fop"]));
      addAiMessage(getFopCheckCTA(profile), {
        replies: ["Спробувати безкоштовно", "Що ще входить?", "Інше питання"],
      });
      return;
    }

    // Handle "Надіслати на email" from library match → trigger email capture
    if (text === "Надіслати на email") {
      setPendingEmailAction({ label: "Надіслати на email", icon: "Mail", type: "send_email" });
      addAiMessage("Залиште ваш email — надішлю повне роз'яснення з прикладами та бонусними матеріалами.", { showEmail: true });
      return;
    }

    // Handle "Так, розрахувати" from pain point "помилки" → launch calculator
    if (text === "Так, розрахувати") {
      if (profile.type === "individual" || (!profile.type && !profile.fopGroup)) {
        setAwaitingCalcType(true);
        addAiMessage("Який тип доходу хочете розрахувати?", {
          replies: ["Оренда", "Інвестиції (акції/крипто)", "Продаж нерухомості", "Іноземний дохід", "Інший дохід"],
        });
      } else {
        setAwaitingCalculation(true);
        addAiMessage(getActionResponse({ label: "Розрахувати податок", icon: "Calculator", type: "calculate" }, profile));
      }
      setUsedActions(prev => new Set([...prev, "calculate"]));
      return;
    }

    // Handle "Розрахувати податок" quick reply → launch calculator
    if (text === "Розрахувати податок") {
      if (profile.type === "individual" || (!profile.type && !profile.fopGroup)) {
        setAwaitingCalcType(true);
        addAiMessage("Який тип доходу хочете розрахувати?", {
          replies: ["Оренда", "Інвестиції (акції/крипто)", "Продаж нерухомості", "Іноземний дохід", "Інший дохід"],
        });
      } else {
        setAwaitingCalculation(true);
        addAiMessage(getActionResponse({ label: "Розрахувати податок", icon: "Calculator", type: "calculate" }, profile));
      }
      setUsedActions(prev => new Set([...prev, "calculate"]));
      return;
    }

    // Action label matching moved to top of handleQuickReply (before setMessages)

    // Try funnel reply first
    const matched = processFunnelReply(text);
    if (matched) return;

    // Fallback: try free-text matching (fix #1 — contextual follow-ups work)
    const match = matchFreeText(text, profile);
    if (match) {
      if (match.source === "disambiguate") {
        // Multiple topics detected — ask user to choose
        const options = (match as DisambiguateResult).options;
        addAiMessage("Я знайшов кілька пов'язаних тем. Що саме вас цікавить?", { replies: options.map(o => o.label) });
        return;
      }
      const m = match as MatchResult;
      // Intercept __calculator__ — launch calculator flow
      if (m.key === "__calculator__") {
        if (profile.fopGroup) {
          setAwaitingCalculation(true);
          addAiMessage("Введіть суму доходу за місяць або за рік — розрахую податок для вашої групи ФОП:");
        } else {
          setAwaitingCalcType(true);
          addAiMessage("Який тип доходу хочете розрахувати?", {
            replies: ["Оренда", "Інвестиції (акції/крипто)", "Продаж нерухомості", "Іноземний дохід", "Інший дохід"],
          });
        }
        return;
      }
      if (m.source === "faq") {
        addAiMessage(getFaqResponse(m.key));
        const vaNode = getValueAddNode(profile);
        setTimeout(() => addAiMessage(vaNode.aiText, { actions: vaNode.actions }), 2000);
      } else if (m.source === "consult") {
        const result = getConsultResponse(m.key, profile);
        if (result && result.isLibraryMatch) {
          addAiMessage(result.text);
          setTimeout(() => addAiMessage("", { replies: ["Надіслати на email", "Інше питання"] }), 800);
        } else if (result) {
         addAiMessage(result.text);
          if (m.key === "персональна консультація") {
            setAwaitingConsultQuestion(true);
          } else {
            setTimeout(() => addAiMessage("", { replies: CTA_QUICK_REPLIES }), 800);
          }
        } else {
          // No match at all — fallback
          const fallbackReplies = getFallbackReplies(audience, profile.type);
          addAiMessage(getFallbackText(audience, profile.type), { replies: fallbackReplies });
        }
      } else {
        processFunnelReply(m.key);
      }
      return;
    }

    // Final fallback: try library search before generic fallback
    const libraryResult = getConsultResponse(text, profile);
    if (libraryResult) {
      addAiMessage(libraryResult.text);
      if (libraryResult.isLibraryMatch) {
        setTimeout(() => addAiMessage("", { replies: ["Надіслати на email", "Інше питання"] }), 800);
      } else {
        setTimeout(() => addAiMessage("", { replies: CTA_QUICK_REPLIES }), 800);
      }
      return;
    }
    const fallbackReplies = getFallbackReplies(audience, profile.type);
    addAiMessage(getFallbackText(audience, profile.type), { replies: fallbackReplies });
  }, [isTyping, processFunnelReply, clearInactivity, stage, handlePricingCalcReply, pricingCalcStep, addAiMessage, setShowCta, setQuickReplies, profile, audience]);

  /* ── Action button handler ────────────────────────── */

  const handleAction = useCallback((action: ChatAction) => {
    if (isTyping) return;
    clearInactivity();
    setMessages((prev) => [...prev, { role: "user", text: action.label, timestamp: new Date() }]);
    setCurrentActions(null);

    // Track used actions
    const newUsed = new Set(usedActions);
    newUsed.add(action.type);
    setUsedActions(newUsed);
    const newCount = actionCount + 1;
    setActionCount(newCount);

    if (action.type === "check_fop") {
      setAwaitingCalculation(false);
      setAwaitingConsultQuestion(false);
      addAiMessage(getActionResponse(action, profile), {
        replies: ["Спробувати безкоштовно", "Що ще входить?", "Інше питання"],
      });
      const newUsed = new Set(usedActions);
      newUsed.add("check_fop");
      setUsedActions(newUsed);
      return;
    }

    if (action.type === "consult") {
      setAwaitingConsultQuestion(true);
      setAwaitingCalculation(false);
      addAiMessage(getActionResponse(action, profile));
      return;
    }

    if (action.type === "calculate") {
      if (profile.type === "individual" || (!profile.type && !profile.fopGroup)) {
        setAwaitingCalcType(true);
        setAwaitingCalculation(false);
        setAwaitingConsultQuestion(false);
        addAiMessage("Який тип доходу хочете розрахувати?", {
          replies: ["Оренда", "Інвестиції (акції/крипто)", "Продаж нерухомості", "Іноземний дохід", "Інший дохід"],
        });
      } else {
        setAwaitingCalculation(true);
        setAwaitingConsultQuestion(false);
        addAiMessage(getActionResponse(action, profile));
      }
      return;
    }

    if (action.type === "check_declaration") {
      setAwaitingCalculation(false);
      setAwaitingConsultQuestion(false);

      if (profile.fopGroup) {
        const isQuarterly = profile.fopGroup === 3;
        const deadline = isQuarterly
          ? "квартальна, найближчий дедлайн — 12 травня 2026"
          : "річна, дедлайн — 1 березня";
        addAiMessage(`📋 ФОП ${profile.fopGroup} групи подає ${deadline}.\n\nFINTODO автоматично сформує декларацію за 3 хвилини.`);
        setTimeout(() => {
          addAiMessage("", {
            replies: ["Подати декларацію через FINTODO", "Розрахувати податок", "Інше питання"],
          });
        }, 1500);
        return;
      }
      if (profile.type === "tov") {
        addAiMessage("📋 ТОВ подає фінансову звітність та декларацію з податку на прибуток. FINTODO автоматизує підготовку всіх форм.");
        setTimeout(() => {
          addAiMessage("", {
            replies: ["Спробувати безкоштовно", "Інше питання"],
          });
        }, 1500);
        return;
      }

      setDeclarationStep(1);
      addAiMessage("Давайте перевіримо! Чи отримували ви у минулому році дохід НЕ від роботодавця?", {
        replies: ["Так, отримував", "Ні, тільки зарплата", "Не впевнений"],
      });
      return;
    }

    if (action.requiresEmail && !profile.email) {
      setPendingEmailAction(action);
      addAiMessage(getActionResponse(action, profile), { showEmail: true });
      return;
    }

    if (action.type === "register") {
      addAiMessage(getConversionText(profile));
      setTimeout(() => setShowCta(true), 1500);
      return;
    }

    // Regular action → response → show remaining
    addAiMessage(getActionResponse(action, profile));
    showRemainingAfterAction(profile, newUsed, newCount, action.type);
  }, [isTyping, profile, addAiMessage, usedActions, actionCount, showRemainingAfterAction, clearInactivity]);

  /* ── Email capture handler ────────────────────────── */

  const handleEmailSubmit = useCallback((email: string) => {
    setProfile((p) => ({ ...p, email }));
    setPendingEmailAction(null);
    setEmailCaptured(true);
    clearInactivity();
    setMessages((prev) => [...prev, { role: "user", text: email, timestamp: new Date() }]);

    // Step 1: Personalized confirmation
    addAiMessage(getEmailConfirmationText(email, profile));

    // Step 2: Soft CTA after 2.5s
    setTimeout(() => {
      addAiMessage(getSoftCtaAfterEmail(profile));
      setTimeout(() => setShowCta(true), 1500);
    }, 2500);
  }, [addAiMessage, profile, clearInactivity]);

  /* ── Free text handler ────────────────────────────── */

  const handleSend = useCallback((text: string) => {
    if (isTyping) return;
    clearInactivity();
    // Check if text matches an action label BEFORE adding user message
    const allActionsForSend = getValueAddNode(profile).actions || [];
    const matchedActionForSend = allActionsForSend.find(a => a.label === text);
    if (matchedActionForSend) {
      handleAction(matchedActionForSend);
      return;
    }

    // Handle pending email action early — before adding user message (handleEmailSubmit adds it)
    if (pendingEmailAction) {
      if (validateEmail(text.trim())) {
        handleEmailSubmit(text.trim());
        return;
      }
    }

    setMessages((prev) => [...prev, { role: "user", text, timestamp: new Date() }]);

    // Glossary check — answer term questions without resetting any wizard state
    const glossaryMatch = matchGlossary(text);
    if (glossaryMatch) {
      addAiMessage(glossaryMatch.definition);
      setTimeout(() => {
        const vaNode = getValueAddNode(profile);
        if (vaNode.actions && vaNode.actions.length > 0) {
          setCurrentActions(vaNode.actions);
        } else {
          setQuickReplies(CTA_QUICK_REPLIES);
        }
      }, 800);
      return;
    }

    // Handle pricing calculator free text input — with escape to new topic
    if (stage === "pricing_calc") {
      const newMatch = matchFreeText(text, profile);
      if (newMatch && newMatch.source !== "disambiguate") {
        const newMatchResult = newMatch as MatchResult;
        // If user asks to launch pricing calc again — just restart it
        if (newMatchResult.key === "__pricing_calculator__") {
          startPricingCalc();
          return;
        }
        // User wants to change topic — exit pricing calc
        setStage("greeting");
        setPricingCalcStep(0);
        setPricingCalcProfile(emptyPricingCalcProfile);
        setShowCta(false);
        // Fall through to main logic below
      } else {
        const lowerText = text.toLowerCase().trim();

        // Glossary: explain "джерело доходу" without exiting pricing_calc
        const glossaryPhrases = ["що таке джерело", "що таке дохід", "які джерела"];
        if (glossaryPhrases.some((p) => lowerText.includes(p))) {
          const currentStepData = pricingCalcStep === 0
            ? { quickReplies: ["ФОП", "Директор ТОВ", "Бухгалтер", "Фізична особа"] }
            : getPricingCalcFollowUp(pricingCalcStep, pricingCalcProfile);
          addAiMessage(
            "📖 **Джерело доходу** — це звідки ви отримуєте гроші. Наприклад: зарплата, оренда квартири, інвестиції, фріланс, продаж майна.\n\nОберіть кількість таких джерел:",
            { replies: [...(currentStepData.quickReplies || []), "Скасувати"] }
          );
          return;
        }

        // Escape: user wants to leave pricing_calc
        const escapePhrases = ["не знайшов", "не бачу свій", "потрібна консультація", "інше питання", "мій випадок"];
        if (escapePhrases.some((p) => lowerText.includes(p))) {
          setStage("greeting");
          setPricingCalcStep(0);
          setPricingCalcProfile(emptyPricingCalcProfile);
          setShowCta(false);
          setAwaitingConsultQuestion(true);
          addAiMessage("Зрозуміло! Опишіть вашу ситуацію — я підберу відповідь або порекомендую тариф.");
          return;
        }

        // Validate input against expected quick replies for current step
        const currentStepData = pricingCalcStep === 0
          ? { quickReplies: ["ФОП", "Директор ТОВ", "Бухгалтер", "Фізична особа"] }
          : getPricingCalcFollowUp(pricingCalcStep, pricingCalcProfile);
        const expectedReplies = currentStepData.quickReplies || [];
        const isValidChoice = expectedReplies.some(
          (r) => r.toLowerCase() === text.trim().toLowerCase()
        );
        if (isValidChoice) {
          handlePricingCalcReply(text);
        } else {
          addAiMessage(
            "Оберіть один з варіантів нижче або напишіть ваше питання:",
            { replies: [...expectedReplies, "Скасувати"] }
          );
        }
        return;
      }
    }

    // Handle pending email action — invalid email or new topic
    if (pendingEmailAction) {
      // Valid email already handled above (early return before setMessages)
      // Check if user is trying to ask a new question instead
      const newMatch = matchFreeText(text, profile);
      if (newMatch && newMatch.source !== "disambiguate") {
        setPendingEmailAction(null);
        // Re-process as new topic (fall through to main logic below)
      } else {
        addAiMessage("Будь ласка, введіть коректний email, наприклад: name@example.com", { replies: ["Скасувати"] });
        return;
      }
    }

    // Handle declaration wizard
    if (declarationStep > 0) {
      const lower = text.toLowerCase().trim();
      if (declarationStep === 1) {
        if (lower.includes("ні") || lower === "ні, тільки зарплата") {
          setDeclarationStep(0);
          addAiMessage("✅ Якщо ви отримували тільки зарплату від роботодавця — декларація НЕ потрібна. Роботодавець сплачує ПДФО та ВЗ як податковий агент.\n\n💡 Але якщо хочете отримати податкову знижку (навчання, лікування) — потрібно подати декларацію до 31 грудня.");
          const newUsed = new Set(usedActions);
          newUsed.add("check_declaration");
          setUsedActions(newUsed);
          clearInactivity();
          setInactivityFired(true);
          setTimeout(() => {
            addAiMessage("Хочете перевірити інші податкові питання?", {
              replies: ["Розрахувати податок", "Подати декларацію через FINTODO", "Спробувати безкоштовно", "Інше питання"],
            });
          }, 1500);
        } else {
          setDeclarationStep(2);
          addAiMessage("Який саме дохід ви отримували?", {
            replies: ["Оренда", "Продаж майна", "Інвестиції / крипто", "Іноземний дохід", "Інший дохід"],
          });
        }
        return;
      }
      if (declarationStep === 2) {
        setDeclarationStep(0);
        let answer = "";
        if (lower.includes("оренд")) {
          answer = `📋 **Декларація ОБОВ'ЯЗКОВА.**\n\nДохід від оренди від фізосіб — ви самостійно декларуєте та сплачуєте ПДФО ${TAX_RATES.personalIncomeTax * 100}% + ВЗ ${TAX_RATES.militaryTax * 100}%.\n\n📅 Дедлайн подачі: до 1 травня\n📅 Дедлайн сплати: до 1 серпня\n\n💡 Порада: оренда через ФОП вигідніша — лише 5% замість ${TAX_RATES.personalIncomeTax * 100 + TAX_RATES.militaryTax * 100}%.`;
        } else if (lower.includes("продаж")) {
          answer = "📋 **Декларація потрібна** якщо це другий продаж нерухомості/авто за рік, або нерухомість у власності менше 3 років.\n\nПерший продаж за рік (3+ роки у власності) — пільга 0%, але нотаріус все одно утримує податок.\n\n📅 Дедлайн: до 1 травня.";
        } else if (lower.includes("інвестиц") || lower.includes("крипто")) {
          answer = `📋 **Декларація ОБОВ'ЯЗКОВА.**\n\nІнвестиційний прибуток (акції, крипто, Forex): ПДФО ${TAX_RATES.personalIncomeTax * 100}% + ВЗ ${TAX_RATES.militaryTax * 100}%.\nДодаток ІП до декларації.\n\n📅 Дедлайн: до 1 травня\n📅 Метод розрахунку: FIFO.`;
        } else if (lower.includes("іноземн")) {
          answer = `📋 **Декларація ОБОВ'ЯЗКОВА.**\n\nБудь-який іноземний дохід декларується: ПДФО ${TAX_RATES.personalIncomeTax * 100}% + ВЗ ${TAX_RATES.militaryTax * 100}%.\nКурс НБУ на дату отримання.\nМожливе зарахування податку за конвенцією.\n\n📅 Дедлайн: до 1 травня.`;
        } else {
          answer = `📋 **Декларація скоріше за все ПОТРІБНА.**\n\nДохід від фізосіб, не утриманий податковим агентом, потребує самостійного декларування: ПДФО ${TAX_RATES.personalIncomeTax * 100}% + ВЗ ${TAX_RATES.militaryTax * 100}%.\n\n📅 Дедлайн: до 1 травня.`;
        }
        answer += "\n\nFINTODO сформує декларацію автоматично за 3 хвилини 🚀";
        addAiMessage(answer);
        const newUsed = new Set(usedActions);
        newUsed.add("check_declaration");
        setUsedActions(newUsed);
        clearInactivity();
        setInactivityFired(true);
        setTimeout(() => {
          addAiMessage("Хочете подати декларацію через FINTODO або розрахувати суму податку?", {
            replies: ["Подати декларацію через FINTODO", "Розрахувати податок", "Спробувати безкоштовно", "Інше питання"],
          });
        }, 1500);
        return;
      }
    }

    // Handle calc type selection for individuals
    if (awaitingCalcType) {
      const calcTypes = ["Оренда", "Інвестиції (акції/крипто)", "Продаж нерухомості", "Іноземний дохід", "Інший дохід"];
      const matched = calcTypes.find(ct => ct.toLowerCase() === text.trim().toLowerCase());
      if (matched) {
        setAwaitingCalcType(false);
        setCalcType(matched);
        setAwaitingCalculation(true);
        const prompts: Record<string, string> = {
          "Оренда": `Введіть суму місячної оренди. Я розрахую ПДФО (${TAX_RATES.personalIncomeTax * 100}%) + ВЗ (${TAX_RATES.militaryTax * 100}%) та покажу порівняння з ФОП.`,
          "Інвестиції (акції/крипто)": `Введіть суму інвестиційного ПРИБУТКУ (різниця продаж − купівля). ПДФО ${TAX_RATES.personalIncomeTax * 100}% + ВЗ ${TAX_RATES.militaryTax * 100}% нараховується на прибуток, не на суму продажу.`,
          "Продаж нерухомості": "Це перший чи другий продаж нерухомості за рік?",
          "Іноземний дохід": `Введіть суму доходу в гривнях (або долар/євро — конвертую за курсом НБУ). ПДФО ${TAX_RATES.personalIncomeTax * 100}% + ВЗ ${TAX_RATES.militaryTax * 100}%.`,
          "Інший дохід": `Введіть суму доходу — я розрахую ПДФО (${TAX_RATES.personalIncomeTax * 100}%) + ВЗ (${TAX_RATES.militaryTax * 100}%) та чистий дохід після оподаткування.`,
        };
        if (matched === "Продаж нерухомості") {
          setAwaitingCalculation(false);
          addAiMessage(prompts[matched], { replies: ["Перший продаж", "Другий або наступний"] });
        } else {
          addAiMessage(prompts[matched]);
        }
        return;
      }
      // Check escape
      const newMatch = matchFreeText(text, profile);
      if (newMatch && newMatch.source !== "disambiguate") {
        setAwaitingCalcType(false);
        setCalcType(null);
        // Fall through
      } else {
        addAiMessage("Оберіть тип доходу:", { replies: [...calcTypes, "Скасувати"] });
        return;
      }
    }

    // Handle property sale choice for individuals
    if (calcType === "Продаж нерухомості" && !awaitingCalculation) {
      const lower = text.toLowerCase().trim();
      if (lower.includes("перший")) {
        setCalcType(null);
        addAiMessage(`✅ Перший продаж нерухомості за рік (у власності 3+ роки) — **ПДФО 0%**, військовий збір 0%.\n\nВи нічого не сплачуєте! Нотаріус посвідчить договір без утримання податку.\n\n💡 Якщо нерухомість у власності менше 3 років — ПДФО 5% + ВЗ ${TAX_RATES.militaryTax * 100}%.`);
        const newUsed = new Set(usedActions);
        newUsed.add("calculate");
        setUsedActions(newUsed);
        clearInactivity();
        setInactivityFired(true);
        setTimeout(() => {
          addAiMessage(getEmailNudgeText(profile, "calculate"), {
            replies: ["Надіслати на email", "Подати декларацію через FINTODO", "Спробувати безкоштовно", "Інше питання"],
          });
        }, 1500);
        return;
      }
      if (lower.includes("другий") || lower.includes("наступн")) {
        setCalcType(null);
        setAwaitingCalculation(true);
        addAiMessage(`Введіть суму продажу — я розрахую ПДФО (5%) + ВЗ (${TAX_RATES.militaryTax * 100}%).`);
        return;
      }
    }

    // Handle inline tax calculator — with escape to new topic
    if (awaitingCalculation) {
      const num = parseFloat(text.replace(/\s/g, '').replace(',', '.'));
      if (!isNaN(num) && num > 0) {
        setAwaitingCalculation(false);
        let response: string;
        if (calcType === "Оренда") {
          const pdfo = Math.round(num * TAX_RATES.personalIncomeTax);
          const vz = Math.round(num * TAX_RATES.militaryTax);
          const total = pdfo + vz;
          const yearly = total * 12;
          const fopEp = Math.round(num * 0.05);
          const fopTotal = fopEp + ESV_MONTHLY;
          response = `📊 Розрахунок податку з оренди (${num.toLocaleString('uk-UA')} ₴/міс):\n\n**Як фізособа:**\n• ПДФО (18%): ${pdfo.toLocaleString('uk-UA')} ₴\n• ВЗ (${TAX_RATES.militaryTax * 100}%): ${vz.toLocaleString('uk-UA')} ₴\n• **Разом: ${total.toLocaleString('uk-UA')} ₴/міс** (${yearly.toLocaleString('uk-UA')} ₴/рік)\n\n**Через ФОП 3 групи (5%):**\n• ЄП: ${fopEp.toLocaleString('uk-UA')} ₴\n• ЄСВ: ${ESV_MONTHLY.toLocaleString('uk-UA')} ₴\n• **Разом: ${fopTotal.toLocaleString('uk-UA')} ₴/міс**\n\n💰 Економія через ФОП: ${(total - fopTotal).toLocaleString('uk-UA')} ₴/міс (${((total - fopTotal) * 12).toLocaleString('uk-UA')} ₴/рік)`;
        } else if (calcType === "Інвестиції (акції/крипто)") {
          const pdfo = Math.round(num * 0.18);
          const vz = Math.round(num * TAX_RATES.militaryTax);
          const total = pdfo + vz;
          response = `📊 Розрахунок податку з інвестиційного прибутку (${num.toLocaleString('uk-UA')} ₴):\n\n• ПДФО (18%): ${pdfo.toLocaleString('uk-UA')} ₴\n• ВЗ (${TAX_RATES.militaryTax * 100}%): ${vz.toLocaleString('uk-UA')} ₴\n\n💰 **Разом: ${total.toLocaleString('uk-UA')} ₴** (ефективна ставка ${((total / num) * 100).toFixed(1)}%)\n• Чистий прибуток: ${(num - total).toLocaleString('uk-UA')} ₴\n\n📋 Потрібен додаток ІП до декларації. Метод FIFO.`;
        } else if (calcType === "Продаж нерухомості" || calcType?.includes("Другий")) {
          const pdfo = Math.round(num * 0.05);
          const vz = Math.round(num * TAX_RATES.militaryTax);
          const total = pdfo + vz;
          response = `📊 Розрахунок податку з продажу нерухомості (${num.toLocaleString('uk-UA')} ₴):\n\n• ПДФО (5%): ${pdfo.toLocaleString('uk-UA')} ₴\n• ВЗ (${TAX_RATES.militaryTax * 100}%): ${vz.toLocaleString('uk-UA')} ₴\n\n💰 **Разом: ${total.toLocaleString('uk-UA')} ₴**\n• На руки: ${(num - total).toLocaleString('uk-UA')} ₴\n\n📝 Нотаріус утримує податок при посвідченні договору.`;
        } else {
          response = calculateTaxForIncome(num, profile);
        }
        setCalcType(null);
        response += "\n\nFINTODO автоматизує розрахунок та подачу декларації.";
        addAiMessage(response);
        const newUsed = new Set(usedActions);
        newUsed.add("calculate");
        setUsedActions(newUsed);
        const newCount = actionCount + 1;
        setActionCount(newCount);
        clearInactivity();
        setInactivityFired(true);
        setTimeout(() => {
          addAiMessage(getEmailNudgeText(profile, "calculate"), {
            replies: ["Надіслати на email", "Подати декларацію через FINTODO", "Спробувати безкоштовно", "Інше питання"],
          });
        }, 1500);
        return;
      } else {
        // Check if user is trying to ask a new question
        const newMatch = matchFreeText(text, profile);
        if (newMatch && newMatch.source !== "disambiguate") {
          setAwaitingCalculation(false);
          setCalcType(null);
          // Fall through to main logic below
        } else {
          addAiMessage("Введіть суму доходу цифрами, наприклад: 50000 або 100000", { replies: ["Скасувати"] });
          return;
        }
      }
    }


    // Handle personalized consultation question
    if (awaitingConsultQuestion) {
      setAwaitingConsultQuestion(false);

      // Try to detect role from free text before consult response
      const roleMap: Array<{ patterns: string[]; reply: string }> = [
        { patterns: ["директор", "керівник", "власник", "засновник", "ceo", "coo", "cfo", "комерційний"], reply: "Я директор ТОВ" },
        { patterns: ["фоп", "підприємець", "фізична особа-підприємець"], reply: "Я ФОП" },
        { patterns: ["бухгалтер", "головбух", "обліковець"], reply: "Я бухгалтер" },
      ];
      const lowerText = text.toLowerCase();
      const detectedRole = roleMap.find(r => r.patterns.some(p => lowerText.includes(p)));
      if (detectedRole && !profile.type) {
        processFunnelReply(detectedRole.reply);
        return;
      }

      // Decision Engine for consultation
      const decision = decideConsultAnswer(text, profile, audience, {
        fromClarify: clarifyModeRef.current,
      });

      if (decision.mode === "ANSWER") {
        clarifyModeRef.current = false;
        const c = decision.candidate;
        if (c.type === "glossary") {
          addAiMessage(c.text);
          setTimeout(() => {
            const vaNode = getValueAddNode(profile);
            if (vaNode.actions && vaNode.actions.length > 0) {
              setCurrentActions(vaNode.actions);
            } else {
              setQuickReplies(CTA_QUICK_REPLIES);
            }
          }, 800);
        } else if (c.type === "library") {
          addAiMessage(c.text);
          setTimeout(() => addAiMessage("", { replies: ["Надіслати на email", "Інше питання"] }), 800);
        } else {
          // handler or keyword
          addAiMessage(c.text);
          if (c.sourceKey === "персональна консультація") {
            setAwaitingConsultQuestion(true);
          } else {
            setTimeout(() => addAiMessage("", { replies: CTA_QUICK_REPLIES }), 800);
          }
        }
      } else if (decision.mode === "CLARIFY") {
        clarifyModeRef.current = true;
        addAiMessage("Я знайшов кілька пов'язаних тем. Що саме вас цікавить?", {
          replies: decision.options.map(o => o.title),
        });
      } else {
        clarifyModeRef.current = false;
        clearInactivity();
        setInactivityFired(true);
        const fallbackReplies = getFallbackReplies(audience, profile.type);
        addAiMessage(decision.message, { replies: fallbackReplies });
      }
      return;
    }

    // Action label matching moved to top of handleSend (before setMessages)

    const match = matchFreeText(text, profile);
    if (match) {
      if (match.source === "disambiguate") {
        const options = (match as DisambiguateResult).options;
        addAiMessage("Я знайшов кілька пов'язаних тем. Що саме вас цікавить?", { replies: options.map(o => o.label) });
        return;
      }
      const m = match as MatchResult;
      // Intercept __pricing_calculator__ — launch interactive tariff wizard
      if (m.key === "__pricing_calculator__") {
        startPricingCalc();
        return;
      }
      // Intercept __calculator__ — launch calculator flow
      if (m.key === "__calculator__") {
        if (profile.fopGroup) {
          setAwaitingCalculation(true);
          addAiMessage("Введіть суму доходу за місяць або за рік — розрахую податок для вашої групи ФОП:");
        } else {
          setAwaitingCalcType(true);
          addAiMessage("Який тип доходу хочете розрахувати?", {
            replies: ["Оренда", "Інвестиції (акції/крипто)", "Продаж нерухомості", "Іноземний дохід", "Інший дохід"],
          });
        }
        return;
      }
      // Non-consult sources: qualifying, qualifying_2 → use existing funnel
      if (m.source !== "consult" && m.source !== "faq") {
        processFunnelReply(m.key);
        return;
      }
    }

    // Decision Engine: for consulting stage, consult/faq matches, or no match at all
    const shouldUseDecisionEngine =
      stage === "consulting" ||
      (match && (match as MatchResult).source === "consult") ||
      (match && (match as MatchResult).source === "faq") ||
      !match;

    if (shouldUseDecisionEngine) {
      const decision = decideConsultAnswer(text, profile, audience, {
        fromClarify: clarifyModeRef.current,
      });

      if (decision.mode === "ANSWER") {
        clarifyModeRef.current = false;
        const c = decision.candidate;
        if (c.type === "glossary") {
          addAiMessage(c.text);
          setTimeout(() => {
            const vaNode = getValueAddNode(profile);
            if (vaNode.actions && vaNode.actions.length > 0) {
              setCurrentActions(vaNode.actions);
            } else {
              setQuickReplies(CTA_QUICK_REPLIES);
            }
          }, 800);
        } else if (c.type === "library") {
          addAiMessage(c.text);
          setTimeout(() => addAiMessage("", { replies: ["Надіслати на email", "Інше питання"] }), 800);
        } else {
          addAiMessage(c.text);
          if (c.sourceKey === "персональна консультація") {
            setAwaitingConsultQuestion(true);
          } else {
            setTimeout(() => addAiMessage("", { replies: CTA_QUICK_REPLIES }), 800);
          }
        }
        return;
      }

      if (decision.mode === "CLARIFY") {
        clarifyModeRef.current = true;
        addAiMessage("Я знайшов кілька пов'язаних тем. Що саме вас цікавить?", {
          replies: decision.options.map(o => o.title),
        });
        return;
      }

      // FALLBACK
      clarifyModeRef.current = false;
      const fallbackReplies = getFallbackReplies(audience, profile.type);
      addAiMessage(getFallbackText(audience, profile.type), { replies: fallbackReplies });
      return;
    }

    // Final fallback (should not normally reach here)
    const fallbackReplies = getFallbackReplies(audience, profile.type);
    addAiMessage(getFallbackText(audience, profile.type), { replies: fallbackReplies });
  }, [isTyping, addAiMessage, processFunnelReply, audience, profile, awaitingConsultQuestion, clearInactivity, usedActions, actionCount, showRemainingAfterAction, pendingEmailAction, handleEmailSubmit, stage, handlePricingCalcReply, awaitingCalcType, calcType, declarationStep, awaitingCalculation]);

  /* ── Chat prefill listener (from CTA buttons) ────── */

  const startPricingCalc = useCallback(() => {
    // Reset chat and start pricing calculator scenario
    const isIndividual = audience === "individual";
    setCurrentActions(null);
    setIsTyping(false);
    setShowCta(false);
    setPendingEmailAction(null);
    setAwaitingConsultQuestion(false);
    setStage("pricing_calc");
    clearInactivity();

    // Determine if we can skip the role-selection step based on known profile
    const knownEntityType = isIndividual
      ? "Фізична особа"
      : profile.type === "fop" ? "ФОП"
      : profile.type === "tov" ? "Директор ТОВ"
      : profile.type === "accountant" ? "Бухгалтер"
      : null;

    if (knownEntityType) {
      // Skip step 0 — go directly to detail question
      const calcProf = { ...emptyPricingCalcProfile, entityType: knownEntityType };
      const followUp = getPricingCalcFollowUp(1, calcProf);
      setMessages([{ role: "ai", text: followUp.aiText, timestamp: new Date() }]);
      setQuickReplies(followUp.quickReplies || null);
      setPricingCalcStep(1);
      setPricingCalcProfile(calcProf);
    } else {
      const greeting = getPricingCalcGreeting("business");
      setMessages([{ role: "ai", text: greeting.aiText, timestamp: new Date() }]);
      setQuickReplies(greeting.quickReplies || null);
      setPricingCalcStep(0);
      setPricingCalcProfile(emptyPricingCalcProfile);
    }
  }, [audience, clearInactivity, profile.type]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      if (detail?.message === "__pricing_calculator__") {
        startPricingCalc();
      } else if (detail?.message) {
        handleSend(detail.message);
      }
    };
    window.addEventListener("chat-prefill", handler);
    return () => window.removeEventListener("chat-prefill", handler);
  }, [handleSend, startPricingCalc]);

  /* ── CTA handler ──────────────────────────────────── */

  const handleCta = useCallback(() => {
    navigate("/checkout?plan=start");
  }, [navigate]);

  /* ── Input ───────────────────────────────────────── */

  const [inputValue, setInputValue] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = inputValue.trim();
    if (!t || isTyping) return;
    handleSend(t);
    setInputValue("");
  };

  return (
    <div id="consultation-chat" className="scroll-mt-32 border rounded-2xl bg-card shadow-lg overflow-hidden flex flex-col" style={{ height: "min(560px, 70vh)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
        <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">AI-бухгалтер</p>
            {profile.type && (
              <Badge variant="secondary" size="sm" className="bg-primary-foreground/20 text-primary-foreground border-none text-[10px]">
                {profile.type === "fop" ? `ФОП${profile.fopGroup ? ` ${profile.fopGroup} гр.` : ""}` :
                 profile.type === "tov" ? "ТОВ" :
                 profile.type === "accountant" ? "Бухгалтер" : "Фізособа"}
                {profile.vatPayer ? " + ПДВ" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground/40 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground/70" />
            </span>
            <p className="text-xs text-primary-foreground/70">Онлайн</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      {(messages.length === 1 || (messages.filter(m => m.role === 'ai').length % 5 === 0 && messages.filter(m => m.role === 'ai').length > 1)) && !isTyping && (
        <p className="text-[10px] text-muted-foreground text-center px-4 py-1">
          {messages.length === 1
            ? "Консультації мають інформаційний характер. Повноцінний облік — після реєстрації."
            : "Інформаційний режим. Зареєструйтесь для повного обліку."}
        </p>
      )}

      {/* Messages */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${m.role === "user" ? "" : ""}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                    {m.role === "user" ? m.text : <ChatMarkdown text={m.text} />}
                    <div className={`text-[10px] mt-1 ${m.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>{fmtTime(m.timestamp)}</div>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><TypingDots /></motion.div>
          )}

          {/* Quick replies */}
          {!isTyping && quickReplies && quickReplies.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-2 pt-1 flex-wrap">
              {quickReplies.map((r) => (
                <Button key={r} variant="outline" size="sm" className="text-xs whitespace-nowrap" onClick={() => handleQuickReply(r)}>{r}</Button>
              ))}
            </motion.div>
          )}

          {/* Action buttons */}
          {!isTyping && currentActions && currentActions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex gap-2 pt-1 flex-wrap">
              {currentActions.map((a) => (
                <ChatActionButton key={a.type} action={a} onClick={handleAction} disabled={isTyping} />
              ))}
            </motion.div>
          )}

          {/* CTA */}
          {!isTyping && showCta && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-2">
              <Button size="sm" className="gap-1.5" onClick={handleCta}>Спробувати безкоштовно <ArrowRight className="w-4 h-4" /></Button>
            </motion.div>
          )}

          <div />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 px-4 py-3 border-t shrink-0">
        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Напишіть повідомлення..." disabled={isTyping} enterKeyHint="send" className="flex-1 h-9 text-base sm:text-sm" />
        <button type="submit" disabled={isTyping || !inputValue.trim()} className={cn("m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0 disabled:opacity-40", inputValue.trim() ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground/40 cursor-default")}>
          <ArrowUp className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};