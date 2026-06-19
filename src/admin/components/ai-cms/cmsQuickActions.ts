import type { CmsWorkspaceTab } from "./CmsWorkspaceTabs";

export interface CmsQuickAction {
  label: string;
  command: string;
}

export const QUICK_ACTIONS_BY_TAB: Record<CmsWorkspaceTab, CmsQuickAction[]> = {
  dashboard: [
    { label: "Що в нас зараз?", command: "Зроби короткий огляд CMS" },
    { label: "Топ-ідей у плані", command: "Покажи топ ідей зі статусом todo" },
    { label: "Запити без контенту", command: "Покажи ідеї з джерела ai_chat_query" },
  ],
  sitemap: [
    { label: "Ідеї для /overview", command: "Покажи ідеї для сторінки /overview" },
    { label: "Створи ідею", command: "Створи ідею для поточної сторінки" },
    { label: "Знайди статтю про ЄСВ", command: "Знайди консультації по ЄСВ" },
  ],
  preview: [
    { label: "Перейди на головну", command: "Перейди на сторінку /" },
    { label: "SEO цієї сторінки", command: "Перевір SEO цієї сторінки" },
    { label: "Створи ідею тут", command: "Створи ідею контенту для поточної сторінки" },
  ],
  analytics: [
    { label: "Аудит /overview", command: "Запусти SEO-аудит для /overview" },
    { label: "SEO-проблеми", command: "Покажи сторінки з SEO-проблемами" },
    { label: "Розсинхрони", command: "Покажи розділи зі статусом desync" },
  ],
  calendar: [
    { label: "Що цього тижня?", command: "Покажи заплановані публікації на цей тиждень" },
    { label: "Створити план", command: "Запропонуй контент-план на наступний місяць" },
  ],
  settings: [
    { label: "Покажи налаштування", command: "Покажи всі налаштування CMS" },
    { label: "SEO defaults", command: "Покажи налаштування seo_defaults" },
    { label: "AI generation", command: "Покажи налаштування ai_generation" },
  ],
};
