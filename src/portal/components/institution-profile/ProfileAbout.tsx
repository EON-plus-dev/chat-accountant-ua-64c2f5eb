import { useState } from "react";
import { Building2, Users, Clock, Award, Handshake, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

const milestoneMarker: Record<string, string> = {
  founding: "◆", product: "●", expansion: "▲", award: "★",
  leadership: "■", financial: "◇", crisis: "◈", recovery: "✓",
};

const newsTypeLabel = (t: string) => {
  const map: Record<string, string> = {
    product_launch: "Новинка", pricing_change: "Тарифи", award: "Нагорода",
    regulatory: "Регуляторне", partnership: "Партнерство", leadership: "Керівництво",
    expansion: "Розширення", changelog_feature: "Функція", changelog_pricing: "Тарифи",
  };
  return map[t] || t;
};

type TabId = "people" | "history" | "awards" | "partnerships" | "news";

interface Props {
  profile: FullInstitutionProfile;
}

export const ProfileAbout = ({ profile }: Props) => {
  const hasStory = !!profile.company.story;
  const hasPeople = profile.company.keyPeople.length > 0;
  const hasMilestones = profile.company.milestones.length > 0;
  const hasAwards = profile.awards.length > 0;
  const hasPartnerships = profile.partnerships && profile.partnerships.length > 0;

  const newsItems = (profile.news || []).map(n => ({ date: n.date, dateISO: n.dateISO, title: n.title, type: n.type }));
  const changelogItems = (profile.changelog || []).map(ch => ({ date: ch.date, dateISO: ch.date, title: ch.changes[0] || "Зміна", type: `changelog_${ch.type}` }));
  const latestUpdates = [...newsItems, ...changelogItems].sort((a, b) => b.dateISO.localeCompare(a.dateISO)).slice(0, 3);
  const hasUpdates = latestUpdates.length > 0;

  const [activeTab, setActiveTab] = useState<TabId>("people");

  if (!hasStory && !hasPeople && !hasMilestones && !hasAwards && !hasPartnerships && !hasUpdates) return null;

  const tabs: { id: TabId; label: string }[] = [
    ...(hasPeople ? [{ id: "people" as TabId, label: "Керівництво" }] : []),
    ...(hasMilestones ? [{ id: "history" as TabId, label: "Історія" }] : []),
    ...(hasAwards ? [{ id: "awards" as TabId, label: "Нагороди" }] : []),
    ...(hasPartnerships ? [{ id: "partnerships" as TabId, label: "Партнерства" }] : []),
    ...(hasUpdates ? [{ id: "news" as TabId, label: "Новини" }] : []),
  ];

  return (
    <section id="about" className="mt-6 border border-border rounded-lg p-4 scroll-mt-28">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-primary" /> Про компанію
      </h3>

      {/* Story + Mission — always visible */}
      {hasStory && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.company.story}</p>
          {profile.company.mission && (
            <p className="text-sm text-primary italic mt-1.5">🎯 {profile.company.mission}</p>
          )}
        </div>
      )}

      {/* Mini tabs */}
      {tabs.length > 0 && (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="min-h-[60px]">
            {activeTab === "people" && hasPeople && (
              <div className="space-y-1.5">
                {profile.company.keyPeople.map((person, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0">
                      {person.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <span className="font-medium text-foreground text-xs">{person.name}</span>
                    <span className="text-muted-foreground text-xs">— {person.role}</span>
                    {person.linkedIn && (
                      <a href={person.linkedIn} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline ml-auto">LinkedIn ↗</a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "history" && hasMilestones && (
              <div className="space-y-2 border-l-2 border-border pl-5">
                {profile.company.milestones.map((m, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-background border-2 border-primary" />
                    <p className="font-mono text-xs font-bold text-primary">{m.year}{m.month ? `.${String(m.month).padStart(2, "0")}` : ""}</p>
                    <p className="text-sm text-foreground">{milestoneMarker[m.type] || "●"} {m.event}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "awards" && hasAwards && (
              <div className="flex flex-wrap gap-2">
                {profile.awards.map((a, i) => (
                  <Badge key={i} variant="secondary" size="sm" className="font-normal">
                    <Award className="w-3 h-3 mr-1 text-amber-500" /> {a.year} — {a.name}
                  </Badge>
                ))}
              </div>
            )}

            {activeTab === "partnerships" && hasPartnerships && (
              <div className="space-y-1.5">
                {profile.partnerships!.map((p, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium text-foreground">{p.partner}</span>
                    <span className="text-muted-foreground"> — {p.description}</span>
                    {p.since && <span className="text-xs text-muted-foreground ml-1">({p.since})</span>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "news" && hasUpdates && (
              <div className="space-y-1">
                {latestUpdates.map((n, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <time className="text-muted-foreground font-mono w-20 shrink-0">{n.date}</time>
                    <Badge variant="secondary" size="sm" className="shrink-0 text-[10px]">{newsTypeLabel(n.type)}</Badge>
                    <span className="text-foreground truncate">{n.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};
