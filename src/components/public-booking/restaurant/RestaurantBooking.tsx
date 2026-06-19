/**
 * Публічний віджет для ресторану «Смак» (demo-restaurant-3).
 * URL: /book/restoran-smak
 *
 * Три сценарії в одному shell'і:
 *  1. Бронювання столика — дата/час → к-сть гостей → зона → столик → контакти
 *  2. Замовлення страв — тип (зал/самовивіз/доставка) → меню+корзина → контакти+адреса
 *  3. Оплатити столик — Pay-by-Table (QR/номер столика → оплата без очікування)
 *
 * Мобільний first, без AI-режимів. Без бекенду — confirmation toast.
 */

import { useState } from "react";
import { Lock, Sparkles, UtensilsCrossed, CalendarClock, ShoppingBag, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import type { SalonPublicProfile } from "@/lib/publicBooking/types";
import { TableReservationFlow } from "./TableReservationFlow";
import { MenuOrderFlow } from "./MenuOrderFlow";
import { PayAtTableFlow } from "./PayAtTableFlow";

interface Props {
  cabinet: Cabinet;
  profile: SalonPublicProfile;
  isDemoFallback?: boolean;
  initialTab?: Tab;
  initialTableNumber?: number;
}

export type Tab = "table" | "menu" | "pay";

export function RestaurantBooking({
  cabinet,
  profile,
  isDemoFallback,
  initialTab = "table",
  initialTableNumber,
}: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const accent = profile.accentColor ?? "#B45309";

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-muted/40 to-background">
      <div
        className="max-w-3xl mx-auto px-3 md:px-4 pt-3 md:pt-10 pb-4 md:pb-10"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {isDemoFallback && (
          <div className="mb-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Демо-режим. Це публічна сторінка-приклад ресторану «Смак».</span>
          </div>
        )}

        {/* Brand header */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div
            className="px-4 py-5 md:px-6 md:py-7 text-white"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-semibold leading-tight truncate">
                  {profile.brandName}
                </h1>
                {profile.tagline && (
                  <p className="text-xs md:text-sm opacity-90 mt-0.5 line-clamp-2">{profile.tagline}</p>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] md:text-xs opacity-90">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5">
                Пн–Нд · 11:00–23:00
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5">
                25 столиків · зал · тераса · VIP
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5">
                Доставка від 0 ₴
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Сценарії"
          className="mt-3 grid grid-cols-3 gap-1 p-1 md:p-1.5 rounded-xl border bg-card shadow-sm"
        >
          {[
            { id: "table" as const, label: "Бронювати столик", short: "Столик", icon: CalendarClock },
            { id: "menu" as const, label: "Замовити страви", short: "Меню", icon: ShoppingBag },
            { id: "pay" as const, label: "Оплатити столик", short: "Оплата", icon: Receipt },
          ].map((it) => {
            const Icon = it.icon;
            const active = tab === it.id;
            return (
              <button
                key={it.id}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(it.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs md:text-sm font-medium transition-all",
                  active
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{it.label}</span>
                <span className="md:hidden">{it.short}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mt-3 rounded-xl border bg-card shadow-sm overflow-hidden">
          {tab === "table" && (
            <TableReservationFlow cabinet={cabinet} brandName={profile.brandName} accent={accent} />
          )}
          {tab === "menu" && (
            <MenuOrderFlow cabinet={cabinet} brandName={profile.brandName} accent={accent} />
          )}
          {tab === "pay" && (
            <PayAtTableFlow
              accent={accent}
              brandName={profile.brandName}
              initialTableNumber={initialTableNumber}
            />
          )}
        </div>

        <footer className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Lock className="w-3 h-3" />
          Безпечний запис через Fintodo · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
