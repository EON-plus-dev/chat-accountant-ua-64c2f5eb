import { useRef, useState, useEffect, useMemo } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";
import type { QuickPrompt } from "@/config/chatPromptsConfig";

interface QuickPromptsRowProps {
  prompts: QuickPrompt[];
  onPromptClick: (prompt: string) => void;
  className?: string;
}

export function QuickPromptsRow({ prompts, onPromptClick, className }: QuickPromptsRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  
  // Generate unique key when prompts change for animation trigger
  const animationKey = useMemo(() => {
    return prompts.map(p => p.text).join("|");
  }, [prompts]);

  const getViewport = () => scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;

  const { isDragging, handlers } = useDragToScrollWithMomentum(getViewport, {
    friction: 0.95, // трохи повільніше затухання для природності
    minVelocity: 0.3
  });

  const checkScroll = () => {
    const el = getViewport();
    if (el) {
      setShowLeftFade(el.scrollLeft > 0);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = getViewport();
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [prompts]);

  if (!prompts || prompts.length === 0) return null;

  return (
    <div className={cn("relative", className)} {...handlers}>
      {/* Left fade mask */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none fade-mask-left" />
      )}
      
      {/* Right fade mask */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none fade-mask-right" />
      )}

      <ScrollArea ref={scrollRef} className="w-full">
        <div className={cn(
          "flex items-center gap-1.5 py-1 px-0.5 snap-x snap-mandatory",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        )}>
          {prompts.map((prompt, index) => (
              <button
                key={`${animationKey}-${index}`}
                onClick={() => onPromptClick(prompt.text)}
                style={{ animationDelay: `${index * 60}ms` }}
                className="flex-shrink-0 snap-start text-xs px-3 py-1.5 rounded-full bg-muted/70 hover:bg-accent border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-95 whitespace-nowrap opacity-0 animate-prompt-appear"
              >
                {prompt.text}
              </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" variant="hidden" />
      </ScrollArea>
    </div>
  );
}

export default QuickPromptsRow;
