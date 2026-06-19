import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, Shield, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { COURSES } from "@/portal/data/learn";
import { hasCourseAccess, markCoursePurchased } from "@/portal/lib/courseProgress";
import { pluralizeLessons } from "@/lib/ukrainian-pluralize";

const CourseCheckout = () => {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const course = useMemo(() => COURSES.find(c => c.slug === courseSlug), [courseSlug]);

  // Без курсу або безкоштовний — назад
  if (!course) return <Navigate to="/learn" replace />;
  if (course.isFree) return <Navigate to={`/learn/${course.category}/${course.slug}`} replace />;

  const fromLessonId = searchParams.get("from");
  const alreadyOwned = hasCourseAccess(course.id, course.isFree);

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    paymentMethod: "card",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const totalMinutes = course.lessons.reduce((sum, l) => {
    const m = l.duration.match(/(\d+)/);
    return sum + (m ? parseInt(m[1]) : 0);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDuration = totalHours > 0
    ? `${totalHours} год${totalMinutes % 60 ? ` ${totalMinutes % 60} хв` : ""}`
    : `${totalMinutes} хв`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agree) return;
    setSubmitting(true);
    // Заглушка платіжної обробки
    setTimeout(() => {
      markCoursePurchased(course.id);
      const successUrl = `/learn/checkout/success?course=${course.slug}${fromLessonId ? `&from=${fromLessonId}` : ""}`;
      navigate(successUrl);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.history.length > 1 ? navigate(-1) : navigate(`/learn/${course.category}/${course.slug}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-base">Оформлення покупки курсу</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-5xl">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link to="/learn" className="hover:text-foreground">Навчання</Link>
          {" › "}
          <Link to={`/learn/${course.category}/${course.slug}`} className="hover:text-foreground">{course.title}</Link>
          {" › "}
          <span className="text-foreground">Покупка</span>
        </nav>

        {alreadyOwned ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center space-y-4">
              <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
              <h2 className="text-xl font-semibold text-foreground">Ви вже маєте доступ до цього курсу</h2>
              <p className="text-sm text-muted-foreground">Повторна оплата не потрібна. Просто продовжуйте навчання.</p>
              <Button asChild size="lg">
                <Link to={`/learn/${course.category}/${course.slug}`}>
                  Перейти до курсу <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <h2 className="text-base font-semibold text-foreground">Контактні дані</h2>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="email" className="text-xs">Email *</Label>
                      <Input
                        id="email" type="email" required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      />
                      <p className="text-[11px] text-muted-foreground mt-1">На цей email ми надішлемо доступ і чек.</p>
                    </div>
                    <div>
                      <Label htmlFor="name" className="text-xs">Прізвище та імʼя *</Label>
                      <Input
                        id="name" required
                        placeholder="Іваненко Іван"
                        value={form.fullName}
                        onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                      />
                      {course.certificate && (
                        <p className="text-[11px] text-muted-foreground mt-1">Це імʼя зʼявиться у вашому сертифікаті.</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs">Телефон</Label>
                      <Input
                        id="phone" type="tel"
                        placeholder="+380 ..."
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 sm:p-6 space-y-3">
                  <h2 className="text-base font-semibold text-foreground">Спосіб оплати</h2>
                  <RadioGroup value={form.paymentMethod} onValueChange={(v) => setForm(f => ({ ...f, paymentMethod: v }))}>
                    <Label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-accent/50">
                      <RadioGroupItem value="card" />
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Банківська картка (Visa / Mastercard)</span>
                    </Label>
                    <Label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-accent/50">
                      <RadioGroupItem value="applepay" />
                      <span className="text-sm"></span>
                      <span className="text-sm"> Apple Pay / Google Pay</span>
                    </Label>
                    <Label className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-accent/50">
                      <RadioGroupItem value="privat" />
                      <span className="text-sm">🏦</span>
                      <span className="text-sm">Приват24</span>
                    </Label>
                  </RadioGroup>
                </CardContent>
              </Card>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="agree" checked={form.agree}
                  onCheckedChange={(v) => setForm(f => ({ ...f, agree: !!v }))}
                />
                <Label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  Я приймаю <Link to="/legal/terms" className="underline">умови оферти</Link> та <Link to="/legal/privacy" className="underline">політику конфіденційності</Link>. Розумію, що отримую електронний продукт; повернення — за гарантією 14 днів.
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={!form.agree || submitting}>
                {submitting ? "Обробка..." : `Сплатити ${course.price} грн`}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Shield className="h-3 w-3" /> Безпечна оплата · сертифікат PCI DSS
              </p>
            </form>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <Card>
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{course.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Ваш курс</p>
                      <p className="text-sm font-semibold text-foreground leading-snug">{course.title}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{course.lessonsCount} {pluralizeLessons(course.lessonsCount)}</Badge>
                    <Badge variant="outline" className="text-[10px]">⏱ {totalDuration}</Badge>
                    {course.certificate && <Badge variant="outline" className="text-[10px]">🏆 Сертифікат</Badge>}
                  </div>

                  <Separator />

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ціна курсу</span>
                      <span className="text-foreground tabular-nums">{course.price} грн</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Знижка</span>
                      <span className="text-muted-foreground tabular-nums">−0 грн</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-base">
                    <span className="font-semibold text-foreground">Разом</span>
                    <span className="font-bold text-foreground tabular-nums">{course.price} грн</span>
                  </div>

                  <Separator />

                  <ul className="space-y-2 text-xs text-foreground">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />Доступ назавжди, без щомісячних платежів</li>
                    {course.certificate && (
                      <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />Сертифікат після завершення</li>
                    )}
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />Гарантія повернення 14 днів</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />Усі майбутні оновлення курсу</li>
                    <li className="flex items-start gap-2"><Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />Інтеграція з кабінетом FINTODO</li>
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCheckout;
