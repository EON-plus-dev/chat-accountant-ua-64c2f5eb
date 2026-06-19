import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { commonFaq, businessFaq, individualFaq } from "@/config/pricingData";
import { useAudience } from "@/contexts/AudienceContext";

export const FAQSection = () => {
  const navigate = useNavigate();
  const { audience } = useAudience();

  const faqItems = useMemo(
    () =>
      audience === "business"
        ? [...businessFaq, ...commonFaq]
        : [...individualFaq, ...commonFaq],
    [audience]
  );

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Часті запитання</h2>
      <Accordion type="single" collapsible className="max-w-2xl mx-auto">
        {faqItems.map((item, index) => (
          <AccordionItem key={`${audience}-${index}`} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <div className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard?tab=faq")}
          className="gap-2"
        >
          Усі питання та відповіді
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};
