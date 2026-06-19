import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  items: FaqItem[];
  title?: string;
}

export const FaqSection = ({ items, title = "Часті запитання" }: Props) => (
  <section className="space-y-3">
    <div className="flex items-center gap-2">
      <HelpCircle className="w-5 h-5 text-primary" />
      <h2 className="text-base sm:text-lg font-semibold text-foreground">❓ {title}</h2>
    </div>
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-sm font-medium">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);
