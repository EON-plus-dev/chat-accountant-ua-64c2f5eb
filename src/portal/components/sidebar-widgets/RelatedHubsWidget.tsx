import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface HubInfo {
  id: string;
  label: string;
  slug: string;
  emoji: string;
}

const ALL_HUBS: HubInfo[] = [
  { id: "taxes", label: "Оподаткування", slug: "/taxes", emoji: "🧾" },
  { id: "fop", label: "ФОП", slug: "/fop", emoji: "💼" },
  { id: "personal", label: "Фізособам", slug: "/personal", emoji: "👤" },
  { id: "accounting", label: "Бухоблік", slug: "/accounting", emoji: "📊" },
  { id: "law", label: "Законодавство", slug: "/law", emoji: "⚖️" },
  { id: "wartime", label: "Бізнес і війна", slug: "/wartime", emoji: "🪖" },
];

interface Props {
  hubIds: string[];
}

export const RelatedHubsWidget = ({ hubIds }: Props) => {
  const hubs = hubIds.map((id) => ALL_HUBS.find((h) => h.id === id)).filter(Boolean) as HubInfo[];
  if (hubs.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Пов'язані розділи</h4>
      <div className="space-y-2">
        {hubs.map((hub) => (
          <Link
            key={hub.id}
            to={hub.slug}
            className="flex items-center gap-2.5 text-xs text-foreground hover:text-primary transition-colors group"
          >
            <span className="text-base">{hub.emoji}</span>
            <span className="flex-1 group-hover:underline">{hub.label}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
};
