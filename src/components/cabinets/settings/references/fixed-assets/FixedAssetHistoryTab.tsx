import { useMemo } from "react";
import { Play, MapPin, Wrench, TrendingUp, XCircle, ShieldCheck, CalendarCheck, ShoppingCart, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FixedAsset } from "@/config/fixedAssetsConfig";
import { writeOffReasonLabels, formatCurrency, inventoryResultLabels } from "@/config/fixedAssetsConfig";

type EventType = "commissioning" | "relocation" | "repair" | "revaluation" | "write-off" | "sale" | "maintenance" | "license-renewal" | "insurance" | "inventory";

interface TimelineEvent {
  id: string;
  type: EventType;
  date: string;
  title: string;
  description: string;
}

const eventConfig: Record<EventType, { icon: React.ElementType; color: string }> = {
  commissioning: { icon: Play, color: "bg-emerald-500 text-white" },
  relocation: { icon: MapPin, color: "bg-blue-500 text-white" },
  repair: { icon: Wrench, color: "bg-amber-500 text-white" },
  revaluation: { icon: TrendingUp, color: "bg-purple-500 text-white" },
  "write-off": { icon: XCircle, color: "bg-red-500 text-white" },
  maintenance: { icon: CalendarCheck, color: "bg-cyan-500 text-white" },
  "license-renewal": { icon: CalendarCheck, color: "bg-violet-500 text-white" },
  insurance: { icon: ShieldCheck, color: "bg-teal-500 text-white" },
  sale: { icon: ShoppingCart, color: "bg-blue-500 text-white" },
  inventory: { icon: ClipboardCheck, color: "bg-indigo-500 text-white" },
};

function generateEvents(asset: FixedAsset): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const start = new Date(asset.purchaseDate);

  events.push({
    id: "ev-1",
    type: "commissioning",
    date: asset.purchaseDate,
    title: "Введення в експлуатацію",
    description: `${asset.location} · ${asset.responsiblePerson}`,
  });

  // Add a relocation ~6 months after purchase for active assets
  if (asset.status === "active" || asset.status === "under-repair") {
    const relocDate = new Date(start);
    relocDate.setMonth(relocDate.getMonth() + 6);
    if (relocDate < new Date()) {
      events.push({
        id: "ev-2",
        type: "relocation",
        date: relocDate.toISOString().split("T")[0],
        title: "Переміщення",
        description: `${asset.location} · ${asset.responsiblePerson}`,
      });
    }
  }

  // Category-specific events
  if (asset.category === "transport") {
    // ТО every 6 months
    const toDate = new Date(start);
    toDate.setMonth(toDate.getMonth() + 12);
    if (toDate < new Date()) {
      events.push({
        id: "ev-transport-to",
        type: "maintenance",
        date: toDate.toISOString().split("T")[0],
        title: "Проходження ТО",
        description: "Планове технічне обслуговування",
      });
    }
    // Insurance renewal
    const insDate = new Date(start);
    insDate.setFullYear(insDate.getFullYear() + 1);
    if (insDate < new Date()) {
      events.push({
        id: "ev-transport-ins",
        type: "insurance",
        date: insDate.toISOString().split("T")[0],
        title: "Подовження страховки ОСАЦВ",
        description: "Оновлення страхового полісу",
      });
    }
  }

  if (asset.category === "equipment") {
    const toDate = new Date(start);
    toDate.setMonth(toDate.getMonth() + 12);
    if (toDate < new Date()) {
      events.push({
        id: "ev-equip-to",
        type: "maintenance",
        date: toDate.toISOString().split("T")[0],
        title: "Планове ТО",
        description: "Профілактичне обслуговування обладнання",
      });
    }
  }

  if (asset.category === "intangible") {
    const renDate = new Date(start);
    renDate.setFullYear(renDate.getFullYear() + 1);
    if (renDate < new Date()) {
      events.push({
        id: "ev-intang-ren",
        type: "license-renewal",
        date: renDate.toISOString().split("T")[0],
        title: "Подовження ліцензії",
        description: asset.licenseNumber ? `Ліцензія ${asset.licenseNumber}` : "Оновлення ліцензійного договору",
      });
    }
  }

  // Repair event for under-repair assets
  if (asset.status === "under-repair") {
    const repairDate = new Date(start);
    repairDate.setMonth(repairDate.getMonth() + 12);
    events.push({
      id: "ev-3",
      type: "repair",
      date: repairDate.toISOString().split("T")[0],
      title: "Ремонт",
      description: asset.notes || "Планове ТО",
    });
  }

  // Revaluation ~1 year after for long-lived assets
  if (asset.usefulLifeMonths > 36) {
    const revalDate = new Date(start);
    revalDate.setFullYear(revalDate.getFullYear() + 1);
    if (revalDate < new Date()) {
      events.push({
        id: "ev-4",
        type: "revaluation",
        date: revalDate.toISOString().split("T")[0],
        title: "Переоцінка",
        description: "Залишкова вартість скоригована",
      });
    }
  }

  // Write-off event — use real data
  if (asset.status === "written-off") {
    const woDate = asset.writeOffDate || (() => {
      const d = new Date(start);
      d.setMonth(d.getMonth() + asset.usefulLifeMonths);
      return d.toISOString().split("T")[0];
    })();
    const reasonLabel = asset.writeOffReason ? writeOffReasonLabels[asset.writeOffReason] : "";
    events.push({
      id: "ev-5",
      type: "write-off",
      date: woDate,
      title: "Списання",
      description: [
        reasonLabel,
        asset.writeOffActNumber ? `Акт №${asset.writeOffActNumber}` : "",
        asset.notes || "",
      ].filter(Boolean).join(" · ") || "Закінчення строку корисного використання",
    });
  }

  // Sale event
  if (asset.status === "sold") {
    events.push({
      id: "ev-sale",
      type: "sale",
      date: asset.saleDate || new Date().toISOString().split("T")[0],
      title: "Продаж",
      description: [
        asset.saleBuyer ? `Покупець: ${asset.saleBuyer}` : "",
        asset.salePrice ? formatCurrency(asset.salePrice) : "",
        asset.saleContractNumber ? `Договір ${asset.saleContractNumber}` : "",
      ].filter(Boolean).join(" · ") || "Продаж ОЗ",
    });
  }

  // Inventory event
  if (asset.lastInventoryDate) {
    events.push({
      id: "ev-inventory",
      type: "inventory",
      date: asset.lastInventoryDate,
      title: "Інвентаризація",
      description: asset.lastInventoryResult ? `Результат: ${inventoryResultLabels[asset.lastInventoryResult]}` : "Проведено інвентаризацію",
    });
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

interface FixedAssetHistoryTabProps {
  asset: FixedAsset;
}

export const FixedAssetHistoryTab = ({ asset }: FixedAssetHistoryTabProps) => {
  const events = useMemo(() => generateEvents(asset), [asset]);

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

      {events.map((event, idx) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className={cn("relative pb-6", isLast && "pb-0")}>
            {/* Dot */}
            <div className={cn("absolute -left-8 top-0.5 h-[30px] w-[30px] rounded-full flex items-center justify-center z-10", config.color)}>
              <Icon className="h-3.5 w-3.5" />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-medium">{event.title}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.date).toLocaleDateString("uk-UA")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{event.description}</p>
            </div>
          </div>
        );
      })}

      {events.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">Подій не знайдено</p>
      )}
    </div>
  );
};
