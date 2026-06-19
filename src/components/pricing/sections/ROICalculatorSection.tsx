import { useNavigate } from "react-router-dom";
import { ROICalculator } from "@/components/marketing/ROICalculator";
import { useContext } from "react";
import { AudienceContext } from "@/contexts/AudienceContext";

export const ROICalculatorSection = () => {
  const navigate = useNavigate();
  const ctx = useContext(AudienceContext);
  const audience = ctx?.audience ?? "business";

  const subtitle = audience === "business"
    ? "Введіть ваші обсяги роботи, щоб побачити, скільки часу та грошей ви зможете економити з нашою системою."
    : "Оберіть ваш сценарій декларування, щоб побачити потенційну економію часу та грошей.";

  return (
    <section id="roi-calculator" className="space-y-6 scroll-mt-20">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Розрахуйте вашу вигоду</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
      
      <ROICalculator 
        initialDocuments={15}
        initialPayments={8}
        initialTurnover={150000}
        onSelectPlan={(planId) => navigate(`/checkout?plan=${planId}`)}
      />
    </section>
  );
};
