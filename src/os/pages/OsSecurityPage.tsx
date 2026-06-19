// /os/security — архітектура безпеки.
// Hero → Pillars (6) → Audit-log mockup → Compliance bar → CTA.
import { Link } from "react-router-dom";
import {
  ShieldCheck, Lock, FileSignature, Eye, KeyRound, Database, ArrowRight, Activity, ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section } from "@/os/blocks/SectionShell";
import { BrowserChrome } from "@/os/mockups/CabinetMockups";

const PILLARS = [
  {
    icon: FileSignature,
    t: "КЕП та Дія.Підпис",
    d: "Юридично-вагомі підписи через кваліфікованих провайдерів. Авто-підпис — лише з trusted-reviewer і повним логом.",
  },
  {
    icon: Database,
    t: "RLS на рівні БД",
    d: "Кожен запит фільтрується за вашим user_id. Жодних випадкових перехресть між кабінетами на рівні бази даних.",
  },
  {
    icon: KeyRound,
    t: "Делегації з межами",
    d: "Бухгалтер, родина, партнер — заходять із власними правами через контракт делегації, який можна відкликати миттєво.",
  },
  {
    icon: Eye,
    t: "Аудит-лог",
    d: "Хто, що, коли, з якого IP — за кожною критичною дією. Експорт у CSV/JSON, retention за вашими правилами.",
  },
  {
    icon: Lock,
    t: "Шифрування",
    d: "TLS у транзиті, AES-256 у спокої. Секрети — у захищеному vault. Edge-функції з JWT та rate-limiting.",
  },
  {
    icon: ShieldCheck,
    t: "Прямий канал ДПС",
    d: "Листи від ДПС у нативному каналі без посередників — лише нейтральний бейдж «ДПС», без брендів проміжних сервісів.",
  },
];

const AUDIT_ROWS = [
  { t: "11:42:08", who: "Ви", what: "Підписали Акт №47 (КЕП)", ip: "85.91.21.4" },
  { t: "11:18:51", who: "Бухгалтер · Олена", what: "Експорт виписки за Q1", ip: "94.140.4.2" },
  { t: "10:02:14", who: "AI-директор", what: "Сформував Morning Brief", ip: "internal" },
  { t: "09:55:33", who: "Ви", what: "Надали делегацію партнеру", ip: "85.91.21.4" },
  { t: "08:30:00", who: "Система", what: "Sync ПриватБанк · 14 операцій", ip: "internal" },
];

const COMPLIANCE = [
  { t: "Дія.City", d: "Резидент юрисдикції" },
  { t: "GDPR", d: "Право на видалення, портативність" },
  { t: "Закон 2155", d: "Захист персональних даних" },
  { t: "ISO 27001", d: "У процесі сертифікації" },
];

export default function OsSecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.05] via-background to-background" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-medium mb-4 flex items-center gap-2">
                <span className="inline-block w-6 h-px bg-primary/40" /> Безпека
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.05] mb-5">
                Дані — ваші. Завжди.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-7">
                FINTODO побудований на принципі мінімальних привілеїв: ваш кабінет бачить лише вас і тих,
                кому ви явно надали доступ. Жодного «адмін бачить усе».
              </p>
              <div className="flex flex-wrap gap-2">
                {COMPLIANCE.map((c) => (
                  <span key={c.t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-card border border-border/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> {c.t}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <BrowserChrome label="fintodo.com.ua/audit-log">
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-primary/80 font-medium">Аудит-лог</div>
                      <div className="text-base font-semibold tracking-tight">Сьогодні · 5 подій</div>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" /> live
                    </div>
                  </div>
                  <div className="space-y-1">
                    {AUDIT_ROWS.map((r) => (
                      <div key={r.t} className="flex items-center gap-3 py-1.5 border-b border-border/20 last:border-0">
                        <div className="text-[10px] text-muted-foreground w-14 flex-shrink-0 font-mono">{r.t}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] truncate"><span className="text-primary font-medium">{r.who}</span> · {r.what}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{r.ip}</div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              </BrowserChrome>
              <div className="absolute -inset-6 -z-10 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <Section eyebrow="6 опор" title="З чого побудована безпека">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.t} className="p-6 hover:border-primary/30 transition-colors">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-4">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="font-semibold text-base mb-2">{p.t}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{p.d}</div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Compliance details */}
      <Section eyebrow="Сумісність" title="Юрисдикція та стандарти">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPLIANCE.map((c) => (
            <Card key={c.t} className="p-6">
              <ShieldCheck className="w-5 h-5 text-primary mb-3" />
              <div className="font-semibold mb-1">{c.t}</div>
              <div className="text-sm text-muted-foreground">{c.d}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/[0.06] via-background to-background border-primary/20 text-center">
          <div className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Потрібен опитувальник з безпеки?
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Якщо ваша служба безпеки запитує DPA, security whitepaper або тестовий доступ — ми готові.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild className="rounded-full">
              <Link to="/contact">Звʼязатися з нами <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/os/pricing">Подивитись тарифи</Link>
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}
