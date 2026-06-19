/**
 * Touchpoint #5 — самостійний лендинг ПДФО-знижки.
 * Перехід з banner'ів у /receipt/:token і post-booking екрану під час
 * сезону грудень-лютий. Без авторизації; CTA — створити кабінет через Дію.
 */

import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Receipt, Clock4, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RegisterCabinetPitch } from "@/components/client-registration/RegisterCabinetPitch";

export default function TaxRefundPitchPage() {
  const [params] = useSearchParams();
  const fromCabinet = params.get("from") ?? "demo-tax-season";
  const phone = params.get("phone") ?? `tax-season:${Math.random().toString(36).slice(2, 8)}`;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> На головну
        </Link>

        <header className="space-y-2 text-center">
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            Сезон ПДФО-знижки
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
            Поверніть до 4 200 ₴ податку за рік
          </h1>
          <p className="text-muted-foreground">
            Ваші чеки за медицину, освіту та благодійність уже можуть бути на Fintodo —
            ми зберемо їх в один кабінет і порахуємо знижку.
          </p>
        </header>

        <section className="grid sm:grid-cols-3 gap-3">
          <Benefit icon={<Receipt className="w-5 h-5" />} title="Чеки самі знаходяться">
            Заклади, що працюють на Fintodo, прив'язують квитанції до вашого телефону.
          </Benefit>
          <Benefit icon={<Clock4 className="w-5 h-5" />} title="5 хв замість 5 годин">
            У грудні не доведеться шукати чеки за рік — все вже у вашому кабінеті.
          </Benefit>
          <Benefit icon={<ShieldCheck className="w-5 h-5" />} title="Кабінет — ваш">
            Заклади не бачать ваших інших чеків чи фінансів. Дані під вашим контролем.
          </Benefit>
        </section>

        <section className="rounded-xl border bg-card p-4 md:p-5 space-y-3">
          <h2 className="font-semibold">Що отримаєте після створення кабінету</h2>
          <ul className="space-y-2 text-sm">
            {[
              "Автоматичне зведення чеків від усіх ФОПів-учасників Fintodo",
              "Розрахунок ПДФО-знижки за категоріями (медицина, освіта, страхування життя)",
              "Готова декларація 3-ПДФО у форматі для Електронного кабінету ДПС",
              "Календар майбутніх записів та нагадування за 24 год",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <RegisterCabinetPitch
          clientId={phone}
          fopCabinetId={fromCabinet}
          source="tax-season"
          variant="card"
        />

        <p className="text-center text-xs text-muted-foreground">
          Кабінет створюється безкоштовно. Free tier: 200 AI-кредитів на місяць.
        </p>

        <div className="text-center">
          <Button asChild variant="ghost" size="sm">
            <Link to="/me/inbox">Перейти у Мої покупки</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function Benefit({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1.5">
      <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div className="font-medium text-sm">{title}</div>
      <p className="text-xs text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
