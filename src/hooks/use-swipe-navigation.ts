import { useState, useCallback, useRef } from "react";

interface UseSwipeNavigationOptions {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  threshold?: number; // Minimum swipe distance to trigger navigation
}

interface UseSwipeNavigationReturn {
  swipeOffset: number;
  isSwiping: boolean;
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

export function useSwipeNavigation({
  tabs,
  activeTab,
  onTabChange,
  threshold = 50,
}: UseSwipeNavigationOptions): UseSwipeNavigationReturn {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }
    }

    // Only track horizontal swipes
    if (isHorizontalSwipe.current) {
      const currentIndex = tabs.indexOf(activeTab);
      
      // Limit swipe if at edges
      if ((diffX > 0 && currentIndex === 0) || 
          (diffX < 0 && currentIndex === tabs.length - 1)) {
        setSwipeOffset(diffX * 0.3); // Reduced resistance at edges
      } else {
        setSwipeOffset(diffX);
      }
    }
  }, [isSwiping, tabs, activeTab]);

  const onTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    setIsSwiping(false);

    if (isHorizontalSwipe.current && Math.abs(swipeOffset) > threshold) {
      const currentIndex = tabs.indexOf(activeTab);
      
      if (swipeOffset > 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        onTabChange(tabs[currentIndex - 1]);
      } else if (swipeOffset < 0 && currentIndex < tabs.length - 1) {
        // Swipe left - go to next tab
        onTabChange(tabs[currentIndex + 1]);
      }
    }

    setSwipeOffset(0);
    isHorizontalSwipe.current = null;
  }, [isSwiping, swipeOffset, threshold, tabs, activeTab, onTabChange]);

  return {
    swipeOffset,
    isSwiping,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
