import { useState, useRef, useCallback } from "react";
import { OnboardingStep } from "@/config/onboardingConfig";

interface UseOnboardingSwipeOptions {
  currentStep: OnboardingStep;
  onNext?: () => void;
  onBack?: () => void;
  canGoBack: boolean;
  canSwipeForward: boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function useOnboardingSwipe({
  onNext,
  onBack,
  canGoBack,
  canSwipeForward,
}: UseOnboardingSwipeOptions): {
  swipeOffset: number;
  handlers: SwipeHandlers;
} {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const SWIPE_THRESHOLD = 80;
  const MAX_OFFSET = 120;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Determine swipe direction on first significant move
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    // Only handle horizontal swipes
    if (!isHorizontalSwipe.current) return;

    // Swipe right (positive deltaX) = go back
    // Swipe left (negative deltaX) = go forward
    const canSwipeRight = canGoBack && deltaX > 0;
    const canSwipeLeft = canSwipeForward && deltaX < 0;

    if (canSwipeRight || canSwipeLeft) {
      // Apply resistance when approaching limits
      const resistance = 0.4;
      const clampedDelta = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, deltaX * resistance));
      setSwipeOffset(clampedDelta);
    }
  }, [canGoBack, canSwipeForward]);

  const onTouchEnd = useCallback(() => {
    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      if (swipeOffset > 0 && canGoBack && onBack) {
        onBack();
      } else if (swipeOffset < 0 && canSwipeForward && onNext) {
        onNext();
      }
    }
    
    // Reset
    setSwipeOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  }, [swipeOffset, canGoBack, canSwipeForward, onBack, onNext]);

  return {
    swipeOffset,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
