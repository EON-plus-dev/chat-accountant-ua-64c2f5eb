import { useState, useRef, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Bell, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSubscription } from "@/portal/services/subscriptions";
import { analytics } from "@/portal/services/analytics";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const FEATURES = [
  { icon: "📋", text: "Податки розраховуються автоматично" },
  { icon: "📅", text: "Нагадування до кожного дедлайну" },
  { icon: "📊", text: "Звіти і виписки в PDF/XML" },
  { icon: "📝", text: "Декларація про доходи для фізосіб" },
  { icon: "🔗", text: "Інтеграція з Monobank і Checkbox" },
];

const TOPICS = ["ФОП", "ПДВ", "Зарплата", "Корпоративне", "Інвестиції", "Оренда"];

export const UnifiedCTA = () => {
  const { ref, isVisible } = useScrollReveal();
  const emailRef = useRef<HTMLInputElement>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [checklistRequested, setChecklistRequested] = useState(false);

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setIsSubmitting(true);
    setErrorMessage("");

    const topics = [...selectedTopics];
    if (checklistRequested) topics.push("checklist_quarter_close");
    const result = await createSubscription({
      email,
      topics: topics.length > 0 ? topics : ["all"],
      source: "unified_cta",
    });

    setIsSubmitting(false);
    if (result.success) {
      setSubmitState("success");
      analytics.subscriptionCompleted("unified_cta");
    } else {
      setSubmitState("error");
      setErrorMessage(result.error || "Помилка. Спробуйте ще раз.");
    }
  };

  return (
    <section
      ref={ref}
      id="unified-cta"
      className={`py-10 sm:py-16 bg-muted/30 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground text-center mb-10">
          Готові автоматизувати облік?
        </h2>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left — Product CTA */}
          <div className="space-y-6">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">
              Рішення
            </p>
            <p className="text-lg font-semibold text-foreground">
              FINTODO зробить це замість вас
            </p>

            <ul className="space-y-3">
              {FEATURES.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-foreground">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-sm">{f.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to={CTA_CHECKOUT_URL}>Почати безкоштовно</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/#pricing">Переглянути ціни</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Безкоштовний тариф Start — 300 кредитів/міс · Без картки · від 399 ₴/міс на платних
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-2">
              {[
                { value: "12 000+", label: "розрахунків виконано" },
                { value: "< 2 хв", label: "відповідь AI-консультанта" },
                { value: "24/7", label: "доступність платформи" },
              ].map((s) => (
                <div key={s.value} className="space-y-0.5">
                  <p className="text-xl font-bold font-mono text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Subscribe */}
          <div className="space-y-5 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <p className="text-base font-semibold text-foreground">Або підпишіться на оновлення</p>
            </div>

            {submitState === "success" ? (
              <div className="text-center space-y-3 py-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Підписку оформлено!</p>
                <p className="text-sm text-muted-foreground">
                  Ви отримуватимете сповіщення на {email}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Оберіть теми та отримуйте сповіщення при змінах законодавства
                </p>

                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <Badge
                      key={t}
                      variant={selectedTopics.has(t) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedTopics.has(t) && "ring-2 ring-primary/30"
                      )}
                      onClick={() => toggleTopic(t)}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      ref={emailRef}
                      type="email"
                      placeholder="Ваш email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={cn(checklistRequested && "ring-2 ring-primary")}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Підписатись"}
                    </Button>
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-destructive">{errorMessage}</p>
                  )}
                  {checklistRequested && (
                    <p className="text-xs text-primary animate-in fade-in">
                      📋 Введіть email — надішлемо чекліст закриття кварталу
                    </p>
                  )}
                </form>

                <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
                  <Link to="/newsletter" className="text-sm text-primary hover:underline">
                    Переглянути архів дайджестів →
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Download className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      Безкоштовний чекліст закриття кварталу —{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => {
                          setChecklistRequested(true);
                          emailRef.current?.focus();
                        }}
                      >
                        отримати
                      </button>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
