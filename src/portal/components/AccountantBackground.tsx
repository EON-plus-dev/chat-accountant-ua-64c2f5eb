import { GraduationCap, Briefcase, Award, Users, Building2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BackgroundDetails, AgencyBackground, IndividualBackground } from "@/portal/data/accountantProfileExtras";

interface Props {
  background: BackgroundDetails;
  /** Short 2–3 sentence description (acc.description). */
  description: string;
  /** Тематичні теги — спеціалізації / системи / галузі. */
  specializations: string[];
  taxSystems: string[];
  industries: string[];
  /** Optional team/office photo (agencies only). */
  teamPhotoUrl?: string;
}

/**
 * Unified "Про себе / Про компанію" block: description + аудиторія + детальна біографія.
 * Заміняє пару `#summary` + `#background` одним розширеним блоком `#about`.
 */
export function AccountantBackground({
  background,
  description,
  specializations,
  taxSystems,
  industries,
  teamPhotoUrl,
}: Props) {
  const isAgency = background.kind === "agency";
  return (
    <Card id="about" className="p-5 space-y-5 scroll-mt-24">
      <div className="flex items-center gap-2">
        {isAgency && <Building2 className="h-5 w-5 text-primary" />}
        <h2 className="font-bold text-foreground">
          {isAgency ? "Про компанію" : "Про себе"}
        </h2>
      </div>

      {/* 1. Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

      <Separator />

      {/* 2. Кому підходить */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground text-sm">Кому підходить</h3>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Спеціалізації</p>
          <div className="flex flex-wrap gap-1.5">
            {specializations.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Системи оподаткування</p>
          <div className="flex flex-wrap gap-1.5">
            {taxSystems.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Галузі</p>
          <div className="flex flex-wrap gap-1.5">
            {industries.map((ind) => <Badge key={ind} variant="outline">{ind}</Badge>)}
          </div>
        </div>
      </div>

      <Separator />

      {/* 3+ Background details (agency vs individual) */}
      {background.kind === "agency"
        ? <AgencyBody bg={background} teamPhotoUrl={teamPhotoUrl} />
        : <IndividualBody bg={background} />}
    </Card>
  );
}

function IndividualBody({ bg }: { bg: IndividualBackground }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      {bg.education.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <GraduationCap className="h-3.5 w-3.5" /> Освіта
          </h3>
          <ul className="space-y-1">
            {bg.education.map((e, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <strong className="text-foreground">{e.school}</strong> — {e.degree} ({e.year})
              </li>
            ))}
          </ul>
        </div>
      )}
      {bg.experience.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Briefcase className="h-3.5 w-3.5" /> Досвід
          </h3>
          <ul className="space-y-1">
            {bg.experience.map((e, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <strong className="text-foreground">{e.role}</strong> · {e.org} · {e.period}
              </li>
            ))}
          </ul>
        </div>
      )}
      {bg.certifications.length > 0 && (
        <div className="md:col-span-2">
          <h3 className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Award className="h-3.5 w-3.5" /> Сертифікації
          </h3>
          <ul className="space-y-1">
            {bg.certifications.map((c, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <strong className="text-foreground">{c.name}</strong> — {c.issuer}, {c.year}
                {c.id && <span className="font-mono text-[10px] ml-1">#{c.id}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {bg.memberships.length > 0 && (
        <div className="md:col-span-2">
          <h3 className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Users className="h-3.5 w-3.5" /> Членство
          </h3>
          <p className="text-xs text-muted-foreground">{bg.memberships.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}

function AgencyBody({ bg, teamPhotoUrl }: { bg: AgencyBackground; teamPhotoUrl?: string }) {
  return (
    <div className="space-y-5">
      {/* Team photo */}
      {teamPhotoUrl && (
        <img
          src={teamPhotoUrl}
          alt="Команда агенції"
          width={1024}
          height={576}
          loading="lazy"
          className="w-full h-48 sm:h-64 object-cover rounded-lg border border-border"
        />
      )}

      {/* Composition + focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
            <Users className="h-3.5 w-3.5" /> Склад команди
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{bg.teamComposition}</p>
        </div>
        <div>
          <h3 className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Цільовий клієнт
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{bg.clientFocus}</p>
        </div>
      </div>

      {bg.leaders.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Ключові партнери</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bg.leaders.map((l) => (
                <div key={l.name} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {l.photoUrl ? (
                      <img src={l.photoUrl} alt={l.name} width={40} height={40} loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted text-foreground font-bold text-xs flex items-center justify-center shrink-0">
                        {l.initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{l.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{l.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{l.bio}</p>
                  {l.certifications && l.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {l.certifications.map((c) => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {bg.milestones.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="flex items-center gap-1.5 font-semibold text-foreground text-sm mb-2">
              <Calendar className="h-4 w-4 text-primary" /> Ключові віхи
            </h3>
            <ol className="space-y-1.5">
              {bg.milestones.map((m, i) => (
                <li key={i} className="flex gap-3 text-xs">
                  <span className="font-mono font-semibold text-foreground w-12 shrink-0">{m.year}</span>
                  <span className="text-muted-foreground">{m.event}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {(bg.certifications.length > 0 || bg.memberships.length > 0) && (
        <>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {bg.certifications.length > 0 && (
              <div>
                <h3 className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  <Award className="h-3.5 w-3.5" /> Корпоративні сертифікати
                </h3>
                <ul className="space-y-1">
                  {bg.certifications.map((c, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{c.name}</strong> — {c.issuer}, {c.year}
                      {c.id && <span className="font-mono text-[10px] ml-1">#{c.id}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {bg.memberships.length > 0 && (
              <div>
                <h3 className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  <Users className="h-3.5 w-3.5" /> Членство
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {bg.memberships.map((m) => <li key={m}>· {m}</li>)}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-2.5 text-center">
      <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">{icon} {label}</p>
      <p className="font-semibold text-foreground text-sm leading-tight mt-0.5">{value}</p>
    </div>
  );
}
