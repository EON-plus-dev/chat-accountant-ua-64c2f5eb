import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { FloatingChat } from "./FloatingChat";

export const FloatingChatButton = () => {
  const [scrollPassed, setScrollPassed] = useState(false);
  const [hiddenByQaHub, setHiddenByQaHub] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [hasDismissedBubble, setHasDismissedBubble] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const hasBottomTriggered = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      setScrollPassed(window.scrollY > 600);

      const qaHub = document.getElementById("qa-hub");
      if (qaHub) {
        const rect = qaHub.getBoundingClientRect();
        setHiddenByQaHub(rect.top < window.innerHeight && rect.bottom > 0);
      } else {
        setHiddenByQaHub(false);
      }

      // Show bubble when scrolled to bottom
      if (
        !hasBottomTriggered.current &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
      ) {
        hasBottomTriggered.current = true;
        setShowBubble(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Listen for "open-floating-chat" custom event
  useEffect(() => {
    const handler = () => {
      setScrollPassed(true);
      setChatOpen(true);
    };
    window.addEventListener("open-floating-chat", handler);
    return () => window.removeEventListener("open-floating-chat", handler);
  }, []);

  const visible = scrollPassed && !hiddenByQaHub;

  useEffect(() => {
    if (visible && !hasPulsed) {
      const t = setTimeout(() => setHasPulsed(true), 3000);
      return () => clearTimeout(t);
    }
  }, [visible, hasPulsed]);

  // Show bubble 1.5s after FAB appears
  useEffect(() => {
    if (visible && !hasDismissedBubble && !chatOpen) {
      const t = setTimeout(() => setShowBubble(true), 1500);
      return () => clearTimeout(t);
    }
    if (!visible || chatOpen) {
      setShowBubble(false);
    }
  }, [visible, hasDismissedBubble, chatOpen]);

  // Auto-dismiss bubble after 8s
  useEffect(() => {
    if (showBubble) {
      const t = setTimeout(() => {
        setShowBubble(false);
        setHasDismissedBubble(true);
      }, 8000);
      return () => clearTimeout(t);
    }
  }, [showBubble]);

  const dismissBubble = useCallback(() => {
    setShowBubble(false);
    setHasDismissedBubble(true);
  }, []);

  const handleClick = useCallback(() => {
    dismissBubble();
    setChatOpen((prev) => !prev);
  }, [dismissBubble]);

  return (
    <>
      <AnimatePresence>
        {chatOpen && visible && (
          <FloatingChat onClose={() => setChatOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && !chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 right-6 z-50 flex items-center gap-3"
          >
            {/* Speech bubble */}
            <AnimatePresence>
              {showBubble && !chatOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={handleClick}
                  className="relative cursor-pointer rounded-2xl bg-background shadow-lg border border-border px-4 py-3 max-w-[220px] sm:max-w-[260px]"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissBubble();
                    }}
                    aria-label="Закрити"
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <p className="text-[13px] sm:text-sm text-foreground leading-snug">
                    Привіт! 👋 Маєте питання?
                    <br />
                    <span className="text-muted-foreground">Запитайте — підкажу!</span>
                  </p>
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-background drop-shadow-sm" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAB */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleClick}
                    aria-label={chatOpen ? "Закрити AI-радник" : "Відкрити AI-радник"}
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200"
                  >
                    {!hasPulsed && !chatOpen && (
                      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ring-ping" />
                    )}
                    {chatOpen ? (
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" className="hidden sm:block">
                  {chatOpen ? "Закрити AI-радник" : "AI-радник"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
