import { BookOpen } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { GuideData } from "@/portal/types/hub";

interface Props {
  data: GuideData;
}

export const GuideSection = ({ data }: Props) => {
  return (
    <Accordion type="multiple" className="space-y-2">
      {data.guides.map((guide, i) => (
        <AccordionItem
          key={i}
          value={`guide-${i}`}
          className="border border-border/60 rounded-lg px-4 data-[state=open]:bg-muted/30"
        >
          <AccordionTrigger className="hover:no-underline gap-3 py-3">
            <div className="flex items-center gap-2.5 text-left">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <div>
                <span className="font-semibold text-sm text-foreground">
                  {guide.title}
                </span>
                {guide.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {guide.subtitle}
                  </p>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-2 pl-1">
              {guide.steps.map((step, j) => (
                <li key={j} className="flex gap-2.5 text-sm text-foreground/90">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                    {j + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
