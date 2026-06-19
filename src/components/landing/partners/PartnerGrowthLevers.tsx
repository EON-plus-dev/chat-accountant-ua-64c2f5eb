import { Card } from "@/components/ui/card";
import { Megaphone, Tag, TrendingUp, Award } from "lucide-react";

const levers = [
  {
    icon: Megaphone,
    title: "Marketplace-ліди",
    text: "Каталог сертифікованих партнерів у портальному розділі — клієнти, які шукають бухгалтера, бачать вас першими за вашою спеціалізацією та містом.",
  },
  {
    icon: Tag,
    title: "Білий лейбл у листуванні",
    text: "Звіти, рахунки й нагадування йдуть від вашого імені, не від FINTODO. Ваш клієнт бачить вас як основного контактного партнера.",
  },
  {
    icon: TrendingUp,
    title: "Автоматичні апсейли",
    text: "Коли клієнт переходить на Premium або Business — ви автоматично отримуєте свій % від апгрейду, без жодних зусиль.",
  },
  {
    icon: Award,
    title: "Сертифікація = пріоритет",
    text: "Сертифіковані партнери стоять у топі каталогу, отримують значок «Verified» і пріоритетну підтримку нашої команди.",
  },
];

export const PartnerGrowthLevers = () => (
  <section id="levers" className="py-12 md:py-16 scroll-mt-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Партнерські важелі зростання
        </h2>
        <p className="text-muted-foreground">
          Окрім калькульованої вигоди — ще чотири системних інструменти, які масштабують вашу практику.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {levers.map((l) => {
          const Icon = l.icon;
          return (
            <Card key={l.title} className="p-5 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{l.title}</h3>
                <p className="text-sm text-muted-foreground">{l.text}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  </section>
);
