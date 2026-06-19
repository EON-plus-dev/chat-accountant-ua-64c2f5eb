import { Button } from "@/components/ui/button";

interface FinalCTASectionProps {
  onScrollToSection: (id: string) => void;
}

export const FinalCTASection = ({ onScrollToSection }: FinalCTASectionProps) => {
  return (
    <section className="text-center space-y-6 py-6">
      <h2 className="text-2xl font-bold">Запустіть порядок у фінансах без зайвої бюрократії</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Оберіть тариф, який підходить за обсягами, отримайте кредити та дайте системі взяти на себе документи, податки, платежі й зарплати.
      </p>
      <Button size="lg" onClick={() => onScrollToSection("tariffs")}>
        Обрати тариф та почати роботу
      </Button>
    </section>
  );
};
