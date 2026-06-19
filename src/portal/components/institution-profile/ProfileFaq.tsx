import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FullInstitutionProfile } from "@/portal/data/institutionProfiles";

interface Props {
  profile: FullInstitutionProfile;
}

export const ProfileFaq = ({ profile }: Props) => {
  if (!profile.faq || profile.faq.length === 0) return null;

  // Sort: popular first, then group by category
  const sorted = [...profile.faq].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
  const categories = [...new Set(sorted.map(f => f.category))];
  const isFewCategories = categories.length <= 2;

  return (
    <section id="faq" className="mt-6 scroll-mt-28">
      <h2 className="text-2xl font-bold text-foreground">Питання про {profile.name}</h2>

      {/* Flat accordion with category headers — no tabs */}
      <Accordion type="single" collapsible className="mt-4 space-y-1">
        {categories.map(cat => {
          const catFaqs = sorted.filter(f => f.category === cat);
          return (
            <div key={cat}>
              {/* Category header — only show if multiple categories */}
              {!isFewCategories && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2 first:mt-0">{cat}</p>
              )}
              {catFaqs.map((f, i) => (
                <AccordionItem key={`${cat}-${i}`} value={`faq-${cat}-${i}`} className="border border-border/60 rounded-lg px-4 mb-1">
                  <AccordionTrigger className="hover:no-underline text-left py-3">
                    <span className="text-sm text-foreground flex items-center gap-2">
                      {f.isPopular && <span className="text-xs text-amber-500">🔥</span>}
                      {f.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">{f.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          );
        })}
      </Accordion>

      {/* CTA — Ask AI */}
      <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">Не знайшли відповідь?</p>
        <a
          href={`/consultant?ctx=institution&id=${profile.slug}`}
          className="inline-flex items-center gap-1.5 mt-1.5 text-sm font-medium text-primary hover:underline"
        >
          💬 Запитайте AI про {profile.name} →
        </a>
      </div>
    </section>
  );
};
