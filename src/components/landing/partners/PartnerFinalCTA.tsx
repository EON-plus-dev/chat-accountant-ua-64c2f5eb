import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, ShieldCheck } from "lucide-react";

export const PartnerFinalCTA = () => (
  <section
    id="cta"
    className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background border-t border-border/40 scroll-mt-32"
  >
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">
            Готові порахувати вигоду на своїх клієнтах?
          </h2>
          <p className="text-muted-foreground mb-6">
            Сертифікація — безкоштовна (онлайн-курс і тест за 1–2 дні). Після неї одразу отримуєте
            Reseller-доступ і профіль у каталозі.
          </p>

          <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
            <Link to="/learn/certification">
              <GraduationCap className="h-4 w-4" />
              Стати сертифікованим партнером
            </Link>
          </Button>
          <div className="mt-3 text-sm">
            <Link to="/checkout?plan=pro_agency&trial=true" className="text-primary hover:underline">
              або спочатку випробувати продукт безкоштовно →
            </Link>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-foreground">
              <span className="font-semibold">Гарантія ROI ×1.5 за 90 днів.</span>{" "}
              <span className="text-muted-foreground">
                Вимірюється у партнерському кабінеті — кнопка «Запросити перевірку ROI».
                Не підтвердилося — повертаємо 100% вартості підписки.
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4">
          Дані станом на квітень 2026 за публічними тарифами FINTODO та умовами партнерських
          програм M.E.Doc / IFin.
        </p>
      </div>
    </div>
  </section>
);
