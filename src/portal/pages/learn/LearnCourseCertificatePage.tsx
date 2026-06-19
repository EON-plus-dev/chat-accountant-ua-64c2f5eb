import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Printer, ShieldCheck, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { COURSES, LEARN_CATEGORIES, type CourseAudience } from "@/portal/data/learn";
import { isCourseFullyCompleted, getProgress, getQuizResults } from "@/portal/lib/courseProgress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotFound from "@/pages/NotFound";

const NAME_REGEX = /^[A-Za-zА-Яа-яІіЇїЄєҐґʼ'\-\s]+$/;

const certSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "ПІБ занадто короткий")
    .max(120, "ПІБ занадто довгий")
    .regex(NAME_REGEX, "Лише літери, пробіли, дефіс і апостроф"),
  email: z.string().trim().email("Некоректний email").max(200),
  consent: z.literal(true, { errorMap: () => ({ message: "Потрібна згода" }) }),
});

interface IssuedCertificate {
  number: string;
  fullName: string;
  email: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
}

const LOCAL_KEY = "fintodo.certificates";

const readLocalCert = (courseId: string): IssuedCertificate | null => {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const arr = JSON.parse(raw) as IssuedCertificate[];
    return arr.find(c => c.courseId === courseId) ?? null;
  } catch { return null; }
};

const saveLocalCert = (cert: IssuedCertificate) => {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const arr = raw ? (JSON.parse(raw) as IssuedCertificate[]) : [];
    const next = [...arr.filter(c => c.courseId !== cert.courseId), cert];
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch { /* noop */ }
};

const generateCertNumber = (courseId: string): string => {
  // FT-2026-XXXXX (5 hex з timestamp+courseId)
  const seed = `${courseId}-${Date.now()}-${Math.random()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  const code = Math.abs(hash).toString(36).slice(0, 6).toUpperCase().padStart(6, "0");
  return `FT-2026-${code}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "long", year: "numeric" });

const LearnCourseCertificatePage = () => {
  const { category, courseSlug } = useParams<{ category: string; courseSlug: string }>();
  const navigate = useNavigate();

  const course = COURSES.find(c => c.slug === courseSlug && c.category === category);
  const cat = category ? LEARN_CATEGORIES[category as CourseAudience] : undefined;

  const completed = useMemo(
    () => course ? isCourseFullyCompleted(course.id, course.lessons) : false,
    [course],
  );

  const existing = useMemo(() => course ? readLocalCert(course.id) : null, [course]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued] = useState<IssuedCertificate | null>(existing);

  useEffect(() => {
    if (!course || !cat) return;
    if (!completed && !existing) {
      // Не пускаємо на сертифікат, якщо курс ще не пройдено
    }
  }, [course, cat, completed, existing]);

  if (!course || !cat) return <NotFound />;

  const totalDone = getProgress(course.id).size;
  const quizDone = Object.keys(getQuizResults(course.id)).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = certSchema.safeParse({ fullName, email, consent });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const number = generateCertNumber(course.id);
    const issuedAt = new Date().toISOString();

    try {
      const { error } = await supabase.from("course_certificates").insert({
        certificate_number: number,
        course_id: course.id,
        course_title: course.title,
        full_name: parsed.data.fullName,
        email: parsed.data.email,
      });
      if (error) throw error;

      const cert: IssuedCertificate = {
        number,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        courseId: course.id,
        courseTitle: course.title,
        issuedAt,
      };
      saveLocalCert(cert);
      setIssued(cert);
      toast.success("Сертифікат видано", {
        description: `Номер: ${number}. Збережіть його — за ним завжди можна перевірити дійсність.`,
      });
    } catch (err) {
      console.error(err);
      toast.error("Не вдалося видати сертифікат", {
        description: "Спробуйте ще раз за хвилину. Якщо помилка повториться — напишіть у підтримку.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout meta={{
      title: `Сертифікат — ${course.title} | FINTODO`,
      description: `Отримайте іменний сертифікат про проходження курсу «${course.title}».`,
      canonical: `https://fintodo.com.ua/learn/${category}/${course.slug}/certificate`,
    }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[
          { label: "Навчання", to: "/learn" },
          { label: cat.label, to: `/learn/${cat.slug}` },
          { label: course.title, to: `/learn/${category}/${course.slug}` },
          { label: "Сертифікат" },
        ]} />

        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to={`/learn/${category}/${course.slug}`}>
              <ArrowLeft className="h-4 w-4" /> До курсу
            </Link>
          </Button>
        </div>

        {!completed && !issued ? (
          <Card>
            <CardContent className="p-6 sm:p-8 space-y-4 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Сертифікат ще не доступний</h1>
              <p className="text-sm text-muted-foreground">
                Щоб отримати сертифікат, потрібно пройти всі {course.lessons.length} уроків і скласти всі міні-перевірки на ≥66%.
              </p>
              <div className="flex justify-center gap-2 text-xs">
                <Badge variant="outline">Уроків: {totalDone}/{course.lessons.length}</Badge>
                <Badge variant="outline">Тестів: {quizDone}</Badge>
              </div>
              <Button asChild>
                <Link to={`/learn/${category}/${course.slug}`}>Продовжити навчання</Link>
              </Button>
            </CardContent>
          </Card>
        ) : issued ? (
          <CertificatePreview cert={issued} onAnother={() => setIssued(null)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <Card>
              <CardContent className="p-6 sm:p-8 space-y-5">
                <div>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 mb-3">
                    ✓ Курс пройдено повністю
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Отримайте іменний сертифікат</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Введіть ПІБ і email — згенеруємо сертифікат із унікальним номером, який можна перевірити онлайн.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">ПІБ повністю</Label>
                    <Input
                      id="fullName"
                      placeholder="Напр., Олена Коваленко"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      maxLength={120}
                      autoComplete="name"
                    />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                    <p className="text-xs text-muted-foreground">Те, як буде написано на сертифікаті. Перевірте уважно.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      maxLength={200}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <Checkbox
                      checked={consent}
                      onCheckedChange={(v) => setConsent(v === true)}
                      className="mt-0.5"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Погоджуюсь з <Link to="/legal/privacy" className="underline">обробкою персональних даних</Link> для видачі та публічної перевірки сертифіката.
                    </span>
                  </label>
                  {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}

                  <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    Видати сертифікат
                  </Button>
                </form>
              </CardContent>
            </Card>

            <aside>
              <Card className="bg-accent/30">
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Що отримаєте
                  </h3>
                  <ul className="text-sm text-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Іменний сертифікат на ваше ПІБ
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Унікальний номер FT-2026-XXXXXX
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Публічна перевірка за номером
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      Можна роздрукувати або зберегти PDF
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

function CertificatePreview({ cert, onAnother }: { cert: IssuedCertificate; onAnother: () => void }) {
  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Надрукувати / Зберегти PDF
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link to={`/verify/${cert.number}`}>
            <ShieldCheck className="h-4 w-4" /> Перевірити онлайн
          </Link>
        </Button>
        <Button variant="ghost" onClick={onAnother}>Видати на іншого</Button>
      </div>

      {/* Сам сертифікат */}
      <div className="rounded-2xl border-4 border-primary/40 bg-card p-8 sm:p-12 text-center print:border-primary print:shadow-none shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center text-[18rem] font-bold">
          FT
        </div>
        <div className="relative space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">FINTODO Academy</p>
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mt-2">Сертифікат про проходження</h1>
            <p className="text-xs text-muted-foreground mt-1">Certificate of Completion</p>
          </div>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Цей сертифікат підтверджує, що</p>
            <p className="text-2xl sm:text-3xl font-serif font-semibold text-foreground border-b border-primary/30 pb-2 inline-block px-6">
              {cert.fullName}
            </p>
            <p className="text-sm text-muted-foreground mt-3">успішно завершив(ла) курс</p>
            <p className="text-lg sm:text-xl font-semibold text-foreground mt-1">«{cert.courseTitle}»</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border text-left max-w-2xl mx-auto">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Дата видачі</p>
              <p className="text-sm font-medium text-foreground">{formatDate(cert.issuedAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-10 w-10 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Номер</p>
                <p className="text-sm font-mono font-semibold text-foreground">{cert.number}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Перевірка</p>
              <p className="text-sm text-foreground">fintodo.com.ua/verify</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-4 text-sm text-muted-foreground flex items-start gap-2">
          <Download className="h-4 w-4 mt-0.5 shrink-0" />
          Для збереження у PDF натисніть «Надрукувати» і виберіть «Зберегти як PDF» у вашому браузері.
        </CardContent>
      </Card>
    </div>
  );
}

export default LearnCourseCertificatePage;
