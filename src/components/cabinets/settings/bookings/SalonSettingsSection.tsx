/**
 * SalonSettingsSection — корінь індустрійного підрозділу налаштувань кабінету.
 * Видимий для кабінетів з `industry` ∈ { "salon", "tennis_club", "restaurant" }.
 *
 * Усі три індустрії використовують спільну модель даних
 * (`SalonWorkstation` / `SalonMaster` / `salonMasterDelegations` / `SalonBooking`),
 * тому секції однакові — змінюються лише заголовок і лейбли sub-nav за `cabinet.industry`.
 * Модуль «Бронювання» / «Замовлення» — read-only споживачі цих довідників.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Armchair,
  Users,
  CalendarClock,
  Sparkles,
  Tags,
  Wallet,
  Clock,
  Heart,
  Globe,
  Bell,
  Plug,
  FileSignature,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cabinet } from "@/types/cabinet";
import { getVerticalPack, type VerticalPack } from "@/core";

import { WorkstationsSection } from "./sections/WorkstationsSection";
import { MastersSettingsSection } from "./sections/MastersSettingsSection";
import { MasterDelegationsSection } from "./sections/MasterDelegationsSection";
import { ShiftsEditorSection } from "./sections/ShiftsEditorSection";
import { ServicesPriceSection } from "./sections/ServicesPriceSection";
import { CategoriesPackagesSection } from "./sections/CategoriesPackagesSection";
import { PayoutRulesSection } from "./sections/PayoutRulesSection";
import { SalonHoursSection } from "./sections/SalonHoursSection";
import { ClientsLoyaltySection } from "./sections/ClientsLoyaltySection";
import { OnlineBookingWidgetSection } from "./sections/OnlineBookingWidgetSection";
import { RemindersSection } from "./sections/RemindersSection";
import { SalonIntegrationsSection } from "./sections/SalonIntegrationsSection";
import { SalesPurchasesPolicySection } from "../shared/SalesPurchasesPolicySection";

interface SalonSettingsSectionProps {
  cabinet: Cabinet;
  /** Опц. секція з URL/deep-link */
  initialSection?: SalonSectionId;
}

type SalonSectionId =
  | "workstations"
  | "masters"
  | "delegations"
  | "shifts"
  | "services"
  | "categories"
  | "payout-rules"
  | "hours"
  | "clients"
  | "sales-purchases"
  | "online-booking"
  | "reminders"
  | "integrations";

interface NavItem {
  id: SalonSectionId;
  label: string;
  icon: LucideIcon;
  description: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: "workstations", label: "Робочі місця", icon: Armchair, description: "Крісла, столи, кабінети" },
  { id: "masters", label: "Майстри і ставки", icon: Users, description: "Команда салону" },
  { id: "delegations", label: "Делегації майстрів", icon: FileSignature, description: "Договори, доступи, запрошення" },
  { id: "shifts", label: "Графік змін", icon: CalendarClock, description: "Хто, коли, де" },
  { id: "services", label: "Послуги та прайс", icon: Sparkles, description: "Каталог послуг" },
  { id: "categories", label: "Категорії та пакети", icon: Tags, description: "Групи, абонементи" },
  { id: "payout-rules", label: "Правила винагород", icon: Wallet, description: "Комісії, бонуси" },
  { id: "hours", label: "Розклад роботи", icon: Clock, description: "Години салону" },
  { id: "clients", label: "Клієнти й лояльність", icon: Heart, description: "Картка, кешбек, сегменти" },
  { id: "sales-purchases", label: "Продажі і закупки", icon: ShoppingCart, description: "Policy engine, канали, бюджет" },
  { id: "online-booking", label: "Онлайн-запис", icon: Globe, description: "Публічний віджет" },
  { id: "reminders", label: "Нагадування", icon: Bell, description: "SMS, Viber, Telegram" },
  { id: "integrations", label: "Інтеграції салону", icon: Plug, description: "ПРРО, боти, Google Calendar" },
];

function getNavItems(pack: VerticalPack): NavItem[] {
  const overrides = pack.settingsNav.overrides;
  return DEFAULT_NAV_ITEMS.map((item) => {
    const ov = overrides[item.id];
    return ov ? { ...item, label: ov.label, description: ov.description } : item;
  });
}

export function SalonSettingsSection({ cabinet, initialSection }: SalonSettingsSectionProps) {
  const [activeId, setActiveId] = useState<SalonSectionId>(initialSection ?? "workstations");
  const pack = getVerticalPack(cabinet);
  const navItems = getNavItems(pack);
  const { title, subtitle } = pack.settingsNav;

  const activeItem = navItems.find((i) => i.id === activeId) ?? navItems[0];

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>

      {/* Mobile: Select picker для 13 розділів */}
      <div className="lg:hidden">
        <Select value={activeId} onValueChange={(v) => setActiveId(v as SalonSectionId)}>
          <SelectTrigger className="h-11 w-full">
            <div className="flex items-center gap-2 min-w-0">
              <activeItem.icon className="w-4 h-4 text-primary shrink-0" />
              <SelectValue placeholder="Оберіть розділ" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[70vh]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <SelectItem key={item.id} value={item.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Sub-nav — desktop only */}
        <nav
          aria-label="Розділи налаштувань салону"
          className="hidden lg:block lg:sticky lg:top-4 lg:self-start rounded-lg border bg-card p-1 max-h-[80vh] overflow-y-auto"
        >
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.id === activeId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={cn(
                      "w-full flex items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/60 text-foreground",
                    )}
                  >
                    <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-tight">{item.label}</span>
                      <span className="block text-[11px] text-muted-foreground leading-tight mt-0.5 truncate">
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Active section */}
        <section aria-label={activeItem.label} className="min-w-0">
          {renderSection(activeId, cabinet, setActiveId)}
        </section>
      </div>
    </div>
  );
}

function renderSection(id: SalonSectionId, cabinet: Cabinet, setActiveId: (id: SalonSectionId) => void) {
  switch (id) {
    case "workstations":
      return <WorkstationsSection cabinet={cabinet} />;
    case "masters":
      return (
        <MastersSettingsSection
          cabinet={cabinet}
          onNavigateToDelegations={() => setActiveId("delegations")}
        />
      );
    case "delegations":
      return <MasterDelegationsSection cabinet={cabinet} />;
    case "shifts":
      return <ShiftsEditorSection cabinet={cabinet} />;
    case "services":
      return <ServicesPriceSection cabinet={cabinet} />;
    case "categories":
      return <CategoriesPackagesSection cabinet={cabinet} />;
    case "payout-rules":
      return <PayoutRulesSection cabinet={cabinet} />;
    case "hours":
      return <SalonHoursSection cabinet={cabinet} />;
    case "clients":
      return <ClientsLoyaltySection cabinet={cabinet} />;
    case "sales-purchases":
      return <SalesPurchasesPolicySection cabinet={cabinet} />;
    case "online-booking":
      return <OnlineBookingWidgetSection cabinet={cabinet} />;
    case "reminders":
      return <RemindersSection cabinet={cabinet} />;
    case "integrations":
      return <SalonIntegrationsSection cabinet={cabinet} />;
  }
}

export default SalonSettingsSection;
