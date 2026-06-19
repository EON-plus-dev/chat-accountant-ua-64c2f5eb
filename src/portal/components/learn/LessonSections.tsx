import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import {
  BookOpen, Sparkles, ListChecks, Target, Link2, Brain,
  Calculator, LayoutGrid, BookMarked, Building2, ExternalLink,
} from "lucide-react";
import type { LessonStructured, LessonLink } from "@/portal/data/learn";
import { LessonMarkdown } from "./LessonMarkdown";
import { LessonInlineTool, hasInlineTool } from "./LessonInlineTool";

export interface LessonSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const sectionsForLesson = (
  data: LessonStructured,
  toolId: string | undefined,
  hasMiniQuiz: boolean,
): LessonSection[] => {
  const out: LessonSection[] = [];
  if (data.theory) out.push({ id: 'theory', label: 'Теорія', icon: BookOpen });
  if (toolId) out.push({ id: 'practice', label: 'Спробуйте', icon: Sparkles });
  if (data.checklist?.length) out.push({ id: 'checklist', label: 'Чек-лист', icon: ListChecks });
  if (data.task) out.push({ id: 'task', label: 'Завдання', icon: Target });
  if (data.links?.length) out.push({ id: 'links', label: 'Корисне', icon: Link2 });
  if (hasMiniQuiz) out.push({ id: 'quiz', label: 'Перевірка', icon: Brain });
  return out;
};

const linkIcon = (kind?: LessonLink['kind']) => {
  switch (kind) {
    case 'tool': return Calculator;
    case 'catalog': return LayoutGrid;
    case 'directory': return BookMarked;
    case 'partner': return Building2;
    default: return ExternalLink;
  }
};

const SectionShell = ({
  id, icon: Icon, title, kicker, children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-24">
    <Card>
      <CardContent className="p-5 sm:p-6 lg:p-7 space-y-4">
        <header className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">{title}</h2>
            {kicker && <p className="text-xs text-muted-foreground mt-0.5">{kicker}</p>}
          </div>
        </header>
        {children}
      </CardContent>
    </Card>
  </section>
);

const ChecklistBlock = ({ items, storageKey }: { items: string[]; storageKey: string }) => {
  const [checked, setChecked] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch { return new Set(); }
  });
  const toggle = (i: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* noop */ }
      return next;
    });
  };
  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const isChecked = checked.has(i);
        return (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <Checkbox
              id={`${storageKey}-${i}`}
              checked={isChecked}
              onCheckedChange={() => toggle(i)}
              className="mt-0.5"
            />
            <label
              htmlFor={`${storageKey}-${i}`}
              className={`leading-relaxed cursor-pointer ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
            >
              {item}
            </label>
          </li>
        );
      })}
    </ul>
  );
};

const LinksGrid = ({ links }: { links: LessonLink[] }) => (
  <div className="grid sm:grid-cols-2 gap-3">
    {links.map((l, i) => {
      const Icon = linkIcon(l.kind);
      const isExternal = /^https?:\/\//.test(l.href);
      const inner = (
        <div className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/30 h-full">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground group-hover:text-primary leading-snug">
              {l.label}
            </div>
            {l.description && (
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{l.description}</div>
            )}
          </div>
        </div>
      );
      return isExternal ? (
        <a key={i} href={l.href} target="_blank" rel="noopener noreferrer">{inner}</a>
      ) : (
        <Link key={i} to={l.href}>{inner}</Link>
      );
    })}
  </div>
);

interface LessonSectionsProps {
  data: LessonStructured;
  toolId?: string;
  storageKeyPrefix: string;
  miniQuizSlot?: React.ReactNode;
}

export function LessonSections({ data, toolId, storageKeyPrefix, miniQuizSlot }: LessonSectionsProps) {
  return (
    <div className="space-y-5">
      {data.tldr && (
        <div className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3">
          <p className="text-sm sm:text-[15px] leading-relaxed text-foreground">
            <span className="font-semibold text-primary">У двох словах:</span> {data.tldr}
          </p>
        </div>
      )}

      {data.theory && (
        <SectionShell id="theory" icon={BookOpen} title="Теорія" kicker="Що треба знати, щоб діяти">
          <LessonMarkdown source={data.theory} />
        </SectionShell>
      )}

      {toolId && (
        <SectionShell
          id="practice"
          icon={Sparkles}
          title="Спробуйте на своїх цифрах"
          kicker={data.practiceHint ?? 'Заповніть поля — результат миттєвий, дані залишаються у вас'}
        >
          {hasInlineTool(toolId) ? (
            <LessonInlineTool toolId={toolId} />
          ) : (
            <LessonInlineTool toolId={toolId} />
          )}
        </SectionShell>
      )}

      {data.checklist && data.checklist.length > 0 && (
        <SectionShell id="checklist" icon={ListChecks} title="Чек-лист" kicker="Відмічайте, що вже зробили — ваш прогрес зберігається">
          <ChecklistBlock items={data.checklist} storageKey={`${storageKeyPrefix}.checklist`} />
        </SectionShell>
      )}

      {data.task && (
        <SectionShell id="task" icon={Target} title="Практичне завдання" kicker="10–15 хвилин — і урок справді ваш">
          <ol className="space-y-2 list-decimal pl-5 text-sm text-foreground">
            {data.task.steps.map((s, i) => {
              const parts = s.split(/(\*\*[^*]+\*\*)/g);
              return (
                <li key={i} className="leading-relaxed pl-1">
                  {parts.map((p, pi) =>
                    p.startsWith('**') && p.endsWith('**')
                      ? <strong key={pi} className="font-semibold text-primary">{p.slice(2, -2)}</strong>
                      : <span key={pi}>{p}</span>
                  )}
                </li>
              );
            })}
          </ol>
          {data.task.selfCheck && data.task.selfCheck.length > 0 && (
            <div className="mt-4 rounded-md bg-muted/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Самоперевірка</p>
              <ul className="space-y-1.5 text-sm">
                {data.task.selfCheck.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="text-foreground/90 leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionShell>
      )}

      {data.links && data.links.length > 0 && (
        <SectionShell id="links" icon={Link2} title="Корисні посилання" kicker="Поглибте тему або порівняйте партнерів">
          <LinksGrid links={data.links} />
        </SectionShell>
      )}

      {miniQuizSlot}
    </div>
  );
}
