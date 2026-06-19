import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useAudience } from "@/contexts/AudienceContext";

const HUBS = [
  { emoji: "🏪", label: "ФОП", desc: "Єдиний податок, групи, звітність, пільги", href: "/fop", priority: { business: 0, individual: 4 } },
  { emoji: "📋", label: "Оподаткування", desc: "ПДФО, ПДВ, ВЗ, ставки та зміни", href: "/taxes", priority: { business: 1, individual: 1 } },
  { emoji: "📊", label: "Бухоблік", desc: "Облік, первинка, 1С, автоматизація", href: "/accounting", priority: { business: 2, individual: 5 } },
  { emoji: "⚖️", label: "Законодавство", desc: "ПКУ, КЗпП, нові закони", href: "/law", priority: { business: 3, individual: 3 } },
  { emoji: "🛡️", label: "Під час війни", desc: "Пільги, призупинення, мобілізація", href: "/wartime", priority: { business: 4, individual: 2 } },
  { emoji: "👤", label: "Фізособам", desc: "Декларації, нерухомість, інвестиції", href: "/personal", priority: { business: 5, individual: 0 } },
];

export const ThematicHubs = () => {
  const { audience } = useAudience();
  const sorted = [...HUBS].sort((a, b) => a.priority[audience] - b.priority[audience]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-foreground text-center mb-2">Тематичні розділи</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">Поглиблена інформація за напрямками</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sorted.map(hub => (
            <Link key={hub.href} to={hub.href}>
              <Card className="h-full hover:shadow-[var(--shadow-lg)] transition-all group">
                <CardContent className="p-4 space-y-2">
                  <span className="text-2xl">{hub.emoji}</span>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    {hub.label}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-muted-foreground">{hub.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
