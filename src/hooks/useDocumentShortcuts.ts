/**
 * useDocumentShortcuts - Хук для клавіатурних скорочень у Document Viewer
 * 
 * Підтримувані скорочення:
 * - Alt+1-4: Перемикання вкладок бокової панелі
 * - Alt+\: Toggle бокової панелі
 * - Ctrl/Cmd+F: Фокус на пошук (опціонально)
 */

import { useEffect, useCallback } from "react";

interface UseDocumentShortcutsOptions {
  onTabChange: (tab: string) => void;
  onTogglePanel: () => void;
  onSearch?: () => void;
  enabled?: boolean;
}

const TAB_SHORTCUTS: Record<string, string> = {
  "1": "structure",
  "2": "comments",
  "3": "fields",
  "4": "discrepancies",
};

export const useDocumentShortcuts = ({
  onTabChange,
  onTogglePanel,
  onSearch,
  enabled = true,
}: UseDocumentShortcutsOptions): void => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Ігноруємо якщо фокус на полі вводу
      const target = event.target as HTMLElement;
      const isInputField = 
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" || 
        target.isContentEditable;
      
      // Alt + цифра (1-4) для табів
      if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        const tab = TAB_SHORTCUTS[event.key];
        if (tab) {
          event.preventDefault();
          onTabChange(tab);
          return;
        }
        
        // Alt + \ для toggle панелі
        if (event.key === "\\" || event.code === "Backslash") {
          event.preventDefault();
          onTogglePanel();
          return;
        }
      }
      
      // Ctrl/Cmd + F для пошуку (тільки якщо не в полі вводу)
      if ((event.ctrlKey || event.metaKey) && event.key === "f" && !isInputField) {
        if (onSearch) {
          event.preventDefault();
          onSearch();
        }
      }
    },
    [enabled, onTabChange, onTogglePanel, onSearch]
  );
  
  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
};

// Хелпер для форматування підказок скорочень
export const getShortcutHint = (action: string): string => {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  
  switch (action) {
    case "structure":
      return "Alt+1";
    case "comments":
      return "Alt+2";
    case "fields":
      return "Alt+3";
    case "discrepancies":
      return "Alt+4";
    case "togglePanel":
      return "Alt+\\";
    case "search":
      return isMac ? "⌘+F" : "Ctrl+F";
    default:
      return "";
  }
};
