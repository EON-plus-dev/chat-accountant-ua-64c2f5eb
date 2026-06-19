import { InlineCalculator } from "@/portal/components/InlineCalculator";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";

export const CalculatorsSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`py-10 sm:py-16 bg-muted/30 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Рахуємо за вас</h2>
          <p className="text-muted-foreground mt-1">Калькулятори з актуальними ставками для ФОП та фізичних осіб — результат за секунди</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <InlineCalculator type="esv" />
          <InlineCalculator type="tax" />
          <InlineCalculator type="salary" />
        </div>
      </div>
    </section>
  );
};
