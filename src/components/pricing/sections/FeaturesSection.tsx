import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { FeatureComparisonTable } from "@/components/landing/FeatureComparisonTable";

export const FeaturesSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex justify-center">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="gap-2 text-base font-semibold">
              Порівняти функції тарифів
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-4">
            <FeatureComparisonTable />
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};
