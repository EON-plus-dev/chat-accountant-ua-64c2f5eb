import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Download, Loader2 } from "lucide-react";
import { createSubscription } from "@/portal/services/subscriptions";
import { analytics } from "@/portal/services/analytics";

const CHECKLIST = [
  "Перевірити всі доходи за квартал",
  "Розрахувати та сплатити ЄП та ЄСВ",
  "Подати декларацію вчасно",
  "Зберегти підтверджуючі документи",
];

export const LeadMagnet = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Введіть коректну email-адресу');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await createSubscription({
      email,
      name: name || undefined,
      audienceType: userType || undefined,
      source: 'lead_magnet',
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitState('success');
      analytics.subscriptionCompleted('lead_magnet');
      if (name.trim()) {
        localStorage.setItem('fint_user_name', name.trim());
      }
    } else {
      setSubmitState('error');
      setErrorMessage(result.error || 'Помилка. Спробуйте ще раз.');
    }
  };

  return (
    <section className="py-10 sm:py-16 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-widest text-background/60">
              📥 Безкоштовний чекліст
            </p>
            <h2 className="text-3xl font-bold leading-tight">
              Закриття кварталу для ФОП — нічого не пропустити
            </h2>
            <ul className="space-y-3">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-background/80">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="p-6 bg-card text-card-foreground">
            {submitState === 'success' ? (
              <div className="text-center space-y-3 py-8">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto">
                  <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-foreground">Чекліст надіслано!</h3>
                <p className="text-sm text-muted-foreground">Перевірте пошту {email}. Якщо немає — перевірте Spam.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Email *" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Ім'я" value={name} onChange={(e) => setName(e.target.value)} />
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger><SelectValue placeholder="Хто ви?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fop1">ФОП 1 група</SelectItem>
                    <SelectItem value="fop2">ФОП 2 група</SelectItem>
                    <SelectItem value="fop3">ФОП 3 група</SelectItem>
                    <SelectItem value="accountant">Бухгалтер</SelectItem>
                    <SelectItem value="owner">Власник ТОВ</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Зберігаємо...</>
                  ) : (
                    <><Download className="h-4 w-4" /> Отримати чекліст безкоштовно</>
                  )}
                </Button>
                {errorMessage && (
                  <p className="text-xs text-destructive text-center">{errorMessage}</p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Натискаючи кнопку, ви погоджуєтесь з обробкою персональних даних
                </p>
              </form>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};
