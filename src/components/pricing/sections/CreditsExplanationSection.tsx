import { Card, CardContent } from "@/components/ui/card";

export const CreditsExplanationSection = () => {
  const steps = [
    { step: "1", title: "Обираєте тариф", desc: "Раз на місяць отримуєте пакет кредитів." },
    { step: "2", title: "Працюєте в системі", desc: "Створюєте документи, звіти, платежі — за це списуються кредити. Нічого рахувати не треба, усе робить система." },
    { step: "3", title: "При потребі — докуповуєте", desc: "Якщо кредитів не вистачає, можна в будь-який момент поповнити баланс." }
  ];

  return (
    <section id="credits" className="space-y-6 scroll-mt-20">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Кредити — це просто</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Кредити — це внутрішні "бали" в системі. Ви поповнюєте їх грошима, а система списує кредити автоматично за дії в сервісі.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((item) => (
          <Card key={item.step}>
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 text-center">
          <p className="font-medium">
            💡 Кредити не згорають наприкінці місяця. Якщо ви використали менше — залишок переходить на наступний місяць.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};
