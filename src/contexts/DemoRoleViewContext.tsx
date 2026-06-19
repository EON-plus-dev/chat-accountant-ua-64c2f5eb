/**
 * DemoRoleViewContext — глобальний перемикач ролі для демонстрації RBAC у кабінеті фізособи.
 *
 * ⚠️ DEMO ONLY: реальна авторизація та перевірка ролей буде реалізована на бекенді.
 * Тут ми лише імітуємо різні «погляди» на дані для презентації:
 *   • owner            — власник кабінету (повний доступ, єдиний хто підписує § 2)
 *   • trustee          — довірена особа (перегляд + підготовка, без підпису)
 *   • tax_consultant   — податковий консультант (черга перевірок, коментарі, SLA § 4)
 *
 * Перемикач зберігається в localStorage для зручності перегляду між сторінками.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type DemoRoleView = "owner" | "trustee" | "tax_consultant";

export const DEMO_ROLE_VIEW_LABELS: Record<DemoRoleView, string> = {
  owner: "Власник кабінету",
  trustee: "Довірена особа",
  tax_consultant: "Податковий консультант",
};

export const DEMO_ROLE_VIEW_DESCRIPTIONS: Record<DemoRoleView, string> = {
  owner: "Повний доступ. Єдиний, хто може підписувати декларацію.",
  trustee: "Заповнення та підготовка кейсу. Підпис заборонено.",
  tax_consultant: "Черга кейсів на перевірку, SLA-таймери, коментарі.",
};

interface DemoRoleViewContextValue {
  role: DemoRoleView;
  setRole: (r: DemoRoleView) => void;
  isOwner: boolean;
  isTrustee: boolean;
  isConsultant: boolean;
  /** Чи може поточна роль підписувати декларацію (§ 2 ТЗ) */
  canSign: boolean;
  /** Чи може поточна роль редагувати поля кейсу */
  canEdit: boolean;
}

const STORAGE_KEY = "demo:role-view";
const DemoRoleViewContext = createContext<DemoRoleViewContextValue | null>(null);

export function DemoRoleViewProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<DemoRoleView>(() => {
    if (typeof window === "undefined") return "owner";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "owner" || saved === "trustee" || saved === "tax_consultant") return saved;
    return "owner";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, role);
    }
  }, [role]);

  const value: DemoRoleViewContextValue = {
    role,
    setRole: setRoleState,
    isOwner: role === "owner",
    isTrustee: role === "trustee",
    isConsultant: role === "tax_consultant",
    canSign: role === "owner",
    canEdit: role === "owner" || role === "trustee",
  };

  return <DemoRoleViewContext.Provider value={value}>{children}</DemoRoleViewContext.Provider>;
}

export function useDemoRoleView(): DemoRoleViewContextValue {
  const ctx = useContext(DemoRoleViewContext);
  if (!ctx) {
    // Безпечний fallback — без провайдера працюємо як власник
    return {
      role: "owner",
      setRole: () => {},
      isOwner: true,
      isTrustee: false,
      isConsultant: false,
      canSign: true,
      canEdit: true,
    };
  }
  return ctx;
}
