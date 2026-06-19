import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Wrench, Bell, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAudience } from "@/contexts/AudienceContext";
import { getPersonas, getPersonaContext } from "@/portal/data/dailyDigest";
import { cn } from "@/lib/utils";

export const PersonaFilter = () => {
  const { audience } = useAudience();
  const personas = getPersonas(audience);
  const [activeId, setActiveId] = useState<string | null>(null);

  const ctx = activeId ? getPersonaContext(activeId) : null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-3">
        <User className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Що актуально для вас?</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {personas.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveId(prev => prev === p.id ? null : p.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border",
              activeId === p.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/40 text-foreground border-border hover:border-primary/50 hover:bg-muted",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {ctx && (
        <Card className="mt-4 border-primary/20 bg-primary/[0.02] animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <p className="text-xs text-muted-foreground">{ctx.persona.hint}</p>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Дедлайни */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Найближчі дедлайни
                </div>
                {ctx.deadlines.length > 0 ? (
                  ctx.deadlines.map((d, i) => (
                    <div key={i} className="text-xs text-foreground leading-snug">
                      <p className="font-medium line-clamp-2">{d.title}</p>
                      <p className="text-[10px] text-muted-foreground">{d.date} · {d.daysLeft} дн.</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Немає найближчих</p>
                )}
              </div>

              {/* Інструменти */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Wrench className="h-3.5 w-3.5 text-primary" />
                  Інструменти для вас
                </div>
                {ctx.tools.map(t => (
                  <Link
                    key={t.id}
                    to={t.href}
                    className="flex items-center gap-2 text-xs text-foreground hover:text-primary transition-colors group"
                  >
                    <span className="text-base">{t.emoji}</span>
                    <span className="truncate group-hover:underline">{t.name}</span>
                  </Link>
                ))}
              </div>

              {/* Зміни */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Bell className="h-3.5 w-3.5 text-primary" />
                  Свіжі зміни
                </div>
                {ctx.changes.length > 0 ? (
                  ctx.changes.map((c, i) => (
                    <Link
                      key={i}
                      to={c.href}
                      className="block text-xs text-foreground leading-snug hover:text-primary transition-colors line-clamp-2"
                    >
                      {c.title}
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Немає свіжих</p>
                )}
              </div>
            </div>

            <Link
              to={ctx.persona.hubHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {ctx.persona.hubLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  );
};
