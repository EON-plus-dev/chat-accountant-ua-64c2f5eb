/**
 * useScrollSpy - Хук для автоматичного відстеження активної секції при скролі
 * Використовує IntersectionObserver для ефективного моніторингу
 */

import { useState, useEffect, useRef, RefObject } from "react";

interface UseScrollSpyOptions {
  containerRef: RefObject<HTMLElement>;
  sectionSelector: string; // e.g. "[data-section-id]"
  offset?: number; // px від верху viewport
  rootMargin?: string; // IntersectionObserver root margin
  threshold?: number[]; // IntersectionObserver threshold
}

interface UseScrollSpyReturn {
  activeId: string | null;
}

export const useScrollSpy = ({
  containerRef,
  sectionSelector,
  offset = 100,
  rootMargin = "-20% 0px -60% 0px",
  threshold = [0, 0.25, 0.5, 0.75, 1],
}: UseScrollSpyOptions): UseScrollSpyReturn => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const visibleSections = useRef<Map<string, number>>(new Map());
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Знаходимо всі секції з data-section-id
    const sections = container.querySelectorAll(sectionSelector);
    
    if (sections.length === 0) {
      // Якщо немає розмічених секцій, шукаємо заголовки
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [data-anchor]');
      if (headings.length === 0) return;
      
      // Додаємо data-section-id до заголовків, якщо їх немає
      headings.forEach((heading, index) => {
        if (!heading.id && !heading.getAttribute('data-section-id')) {
          const text = heading.textContent?.trim().slice(0, 30).replace(/\s+/g, '-').toLowerCase() || `section-${index}`;
          heading.setAttribute('data-section-id', text);
        }
      });
    }
    
    // Оновлюємо список секцій після можливих модифікацій
    const allSections = container.querySelectorAll(`${sectionSelector}, h1, h2, h3, h4, h5, h6, [data-anchor]`);
    if (allSections.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section-id') || 
                     entry.target.getAttribute('data-anchor') || 
                     entry.target.id || 
                     '';
          
          if (entry.isIntersecting) {
            // Зберігаємо intersectionRatio для визначення найбільш видимої секції
            visibleSections.current.set(id, entry.intersectionRatio);
          } else {
            visibleSections.current.delete(id);
          }
        });
        
        // Знаходимо секцію з найбільшим intersectionRatio
        let maxRatio = 0;
        let mostVisibleId: string | null = null;
        
        visibleSections.current.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisibleId = id;
          }
        });
        
        // Якщо нічого не видно, беремо першу секцію з Map
        if (!mostVisibleId && visibleSections.current.size > 0) {
          mostVisibleId = visibleSections.current.keys().next().value;
        }
        
        if (mostVisibleId) {
          setActiveId(mostVisibleId);
        }
      },
      {
        root: null, // viewport
        rootMargin,
        threshold,
      }
    );
    
    // Спостерігаємо за всіма секціями
    allSections.forEach((section) => observer.observe(section));
    
    return () => {
      observer.disconnect();
      visibleSections.current.clear();
    };
  }, [containerRef, sectionSelector, offset, rootMargin, threshold]);
  
  return { activeId };
};
