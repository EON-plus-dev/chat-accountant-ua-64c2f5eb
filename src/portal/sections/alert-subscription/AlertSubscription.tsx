import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSubscription } from "@/portal/services/subscriptions";
import { analytics } from "@/portal/services/analytics";

const TOPICS = ["ФОП", "ПДВ", "Зарплата", "Корпоративне", "Ліцензії"];

export const AlertSubscription = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const toggle = (t: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await createSubscription({
      email,
      topics: selected.size > 0 ? [...selected] : ['all'],
      source: 'alert_subscription',
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitState('success');
      analytics.subscriptionCompleted('alert_subscription');
    } else {
      setSubmitState('error');
      setErrorMessage(result.error || 'Помилка. Спробуйте ще раз.');
    }
  };

  if (submitState === 'success') {
    return (
      <section id="alert-subscription" className="py-10 sm:py-16 bg-muted/30">
        <div className="max-w-xl mx-auto px-4 text-center space-y-3">
          <Bell className="h-8 w-8 text-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Підписку оформлено!</h2>
          <p className="text-sm text-muted-foreground">Ви отримуватимете сповіщення при змінах по обраних темах на {email}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="alert-subscription" className="py-10 sm:py-16 bg-muted/30">
      <div className="max-w-xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-xl font-bold text-foreground">
          🔔 Підпишіться на миттєві зміни по своїй темі
        </h2>

        <div className="flex flex-wrap justify-center gap-2">
          {TOPICS.map((t) => (
            <Badge
              key={t}
              variant={selected.has(t) ? "default" : "outline"}
              className={cn("cursor-pointer transition-colors", selected.has(t) && "ring-2 ring-primary/30")}
              onClick={() => toggle(t)}
            >
              {t}
            </Badge>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input type="email" placeholder="Ваш email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Підписатись"}
            </Button>
          </div>
          {errorMessage && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}
        </form>
      </div>
    </section>
  );
};
