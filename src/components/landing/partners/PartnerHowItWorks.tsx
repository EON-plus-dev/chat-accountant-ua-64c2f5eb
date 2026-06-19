import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Star, MapPin, Mail, Check, X } from "lucide-react";

const vsRows = [
  { feature: "Комісія з гонорару", fintodo: "0%", medoc: "—", ifin: "—" },
  { feature: "Знижка клієнту", fintodo: "−25/30/35%", medoc: "—", ifin: "до −10%" },
  { feature: "Marketplace-ліди", fintodo: true, medoc: false, ifin: false },
  { feature: "AI-розпізнавання", fintodo: true, medoc: false, ifin: false },
];

const cellOf = (v: unknown, primary?: boolean) => {
  if (v === true) return <Check className={`h-3.5 w-3.5 mx-auto ${primary ? "text-primary" : "text-success"}`} />;
  if (v === false) return <X className="h-3.5 w-3.5 mx-auto text-muted-foreground/50" />;
  return (
    <span className={`text-xs font-mono ${primary ? "font-semibold text-primary" : "text-foreground"}`}>
      {v as string}
    </span>
  );
};

export const PartnerHowItWorks = () => (
  <section id="how" className="py-12 md:py-16 scroll-mt-32">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Як це працює на практиці
        </h2>
        <p className="text-muted-foreground">
          Marketplace приводить клієнтів. Листи йдуть від вашого імені. Умови — кращі за альтернативи.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Marketplace */}
        <Card className="p-5 flex flex-col">
          <div className="text-xs font-medium text-muted-foreground mb-3">Місце в каталозі + ліди</div>
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-foreground text-sm">Олена Ткаченко</div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Львів · ФОП 1–3
                </div>
              </div>
              <Badge variant="outline" className="gap-1 text-[10px]">
                <ShieldCheck className="h-3 w-3 text-primary" /> Verified
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
              ))}
              <span className="text-muted-foreground ml-1">5.0 · 47 відгуків</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="text-3xl font-bold text-primary">~6</div>
            <div className="text-xs text-muted-foreground">заявок/міс на партнера</div>
          </div>
        </Card>

        {/* White-label */}
        <Card className="p-5 flex flex-col">
          <div className="text-xs font-medium text-muted-foreground mb-3">White-label у комунікації</div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-xs flex-1">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-[10px]">
                ОТ
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">Олена Ткаченко</div>
                <div className="text-[10px] text-muted-foreground truncate">olena@buhgalteria-lviv.com</div>
              </div>
              <Mail className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
            </div>
            <div className="text-foreground font-medium">Звіт за квітень готовий до підпису</div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Підготувала ЄП за квітень. Перевірте до 19 травня...
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Email, push, SMS — від вашого імені. FINTODO не згадується.
          </p>
        </Card>

        {/* vs alternatives */}
        <Card className="p-5 flex flex-col">
          <div className="text-xs font-medium text-muted-foreground mb-3">Порівняно з альтернативами</div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium text-muted-foreground py-1.5"></th>
                <th className="py-1.5 text-primary font-bold">FINTODO</th>
                <th className="py-1.5 text-muted-foreground font-medium">M.E.Doc</th>
                <th className="py-1.5 text-muted-foreground font-medium">IFin</th>
              </tr>
            </thead>
            <tbody>
              {vsRows.map((r) => (
                <tr key={r.feature} className="border-b border-border/40">
                  <td className="py-2 text-foreground">{r.feature}</td>
                  <td className="text-center bg-primary/5">{cellOf(r.fintodo, true)}</td>
                  <td className="text-center">{cellOf(r.medoc)}</td>
                  <td className="text-center">{cellOf(r.ifin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  </section>
);
