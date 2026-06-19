import { useRef, useState, useCallback, useEffect } from "react";

interface DragToScrollOptions {
  friction?: number; // коефіцієнт затухання (0.92-0.96)
  minVelocity?: number; // мінімальна швидкість для зупинки
}

export function useDragToScrollWithMomentum(
  getViewport: () => HTMLElement | null,
  options: DragToScrollOptions = {}
) {
  const { friction = 0.94, minVelocity = 0.5 } = options;
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0, time: 0 });
  const velocityRef = useRef(0);
  const lastMoveRef = useRef({ x: 0, time: 0 });
  const animationRef = useRef<number | null>(null);

  // Momentum animation loop
  const animateMomentum = useCallback(() => {
    const el = getViewport();
    if (!el || Math.abs(velocityRef.current) < minVelocity) {
      animationRef.current = null;
      return;
    }
    
    el.scrollLeft -= velocityRef.current;
    velocityRef.current *= friction; // затухання
    
    animationRef.current = requestAnimationFrame(animateMomentum);
  }, [getViewport, friction, minVelocity]);

  const stopMomentum = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    velocityRef.current = 0;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = getViewport();
    if (!el) return;
    
    // Ignore interactive elements - don't start drag on buttons, inputs, etc.
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-no-drag]') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    
    // Зупинити поточну анімацію
    stopMomentum();
    
    setIsDragging(true);
    const now = performance.now();
    dragStartRef.current = { x: e.pageX, scrollLeft: el.scrollLeft, time: now };
    lastMoveRef.current = { x: e.pageX, time: now };
  }, [getViewport, stopMomentum]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = getViewport();
    if (!el) return;
    
    e.preventDefault();
    const now = performance.now();
    const dx = e.pageX - dragStartRef.current.x;
    
    // Рахуємо velocity (normalize to ~60fps frame time)
    const dt = now - lastMoveRef.current.time;
    if (dt > 0) {
      velocityRef.current = (e.pageX - lastMoveRef.current.x) / dt * 16;
    }
    
    lastMoveRef.current = { x: e.pageX, time: now };
    el.scrollLeft = dragStartRef.current.scrollLeft - dx;
  }, [isDragging, getViewport]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Запустити momentum якщо є швидкість
    if (Math.abs(velocityRef.current) > minVelocity) {
      animationRef.current = requestAnimationFrame(animateMomentum);
    }
  }, [isDragging, animateMomentum, minVelocity]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleMouseUp();
    }
  }, [isDragging, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopMomentum();
  }, [stopMomentum]);

  return {
    isDragging,
    stopMomentum, // Expose for external use (e.g., programmatic scroll)
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    },
  };
}
