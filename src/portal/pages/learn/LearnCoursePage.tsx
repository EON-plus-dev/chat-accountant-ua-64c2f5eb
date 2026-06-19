import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { COURSES, LEARN_CATEGORIES, type CourseAudience } from "@/portal/data/learn";
import { Lock, Unlock, CheckCircle, ArrowRight, Star, Clock, CalendarDays } from "lucide-react";
import { pluralizeLessons } from "@/lib/ukrainian-pluralize";
import { hasCourseAccess, getLastLesson, getProgress } from "@/portal/lib/courseProgress";
import { CertifiedTryDialog } from "@/portal/components/CertifiedTryDialog";
import NotFound from "@/pages/NotFound";

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Початківець', intermediate: 'Середній', advanced: 'Просунутий',
};
const FORMAT_LABELS: Record<string, string> = {
  video: 'Відео', text: 'Текст', interactive: 'Інтерактивний', webinar: 'Вебінар',
};

const LearnCoursePage = () => {
  const { category, courseSlug } = useParams<{ category: string; courseSlug: string }>();
  const [searchParams] = useSearchParams();
  const course = COURSES.find(c => c.slug === courseSlug && c.category === category);
  const cat = category ? LEARN_CATEGORIES[category as CourseAudience] : undefined;
  const [tryDialogOpen, setTryDialogOpen] = useState(false);

  // Auto-open onboarding dialog if redirected from CTA elsewhere or after login
  useEffect(() => {
    if (course?.id === "fintodo-certified" && searchParams.get("onboarding") === "certified") {
      setTryDialogOpen(true);
    }
  }, [course?.id, searchParams]);

  if (!course || !cat) return <NotFound />;

  const isCertifiedCourse = course.id === "fintodo-certified";

  // Calculate total duration from lessons
  const totalMinutes = course.lessons.reduce((sum, lesson) => {
    const match = lesson.duration.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalDurationLabel = totalHours > 0
    ? `${totalHours} год ${remainingMinutes > 0 ? `${remainingMinutes} хв` : ""}`
    : `${totalMinutes} хв`;

  // Mock rating
  const mockRating = 4.6;
  const mockRatingsCount = Math.round(course.enrolled * 0.12);

  // ── CTA-логіка ──
  const hasAccess = hasCourseAccess(course.id, course.isFree);
  const firstLesson = course.lessons[0];
  const firstFreeLesson = course.lessons.find(l => l.isFree) ?? firstLesson;
  const lastLessonId = getLastLesson(course.id);
  const lastLesson = lastLessonId ? course.lessons.find(l => l.id === lastLessonId) : undefined;
  const progress = getProgress(course.id);
  const allDone = progress.size === course.lessons.length && course.lessons.length > 0;
  const hasProgress = progress.size > 0;

  // Куди веде первинна CTA
  const primaryLessonTarget = hasAccess
    ? `/learn/${category}/${course.slug}/${(lastLesson ?? firstLesson)?.id}`
    : `/learn/${category}/${course.slug}/${firstFreeLesson?.id}`;

  let primaryLabel: string;
  if (allDone && course.certificate) primaryLabel = "Переглянути сертифікат";
  else if (hasAccess && hasProgress) primaryLabel = `Продовжити (урок ${(course.lessons.findIndex(l => l.id === (lastLesson?.id ?? firstLesson?.id)) + 1)})`;
  else if (hasAccess) primaryLabel = "Розпочати курс";
  else if (course.isFree) primaryLabel = "Розпочати безкоштовно";
  else primaryLabel = "Спробувати безкоштовно";

  const primaryHref = allDone && course.certificate
    ? `/learn/${category}/${course.slug}/certificate`
    : primaryLessonTarget;
  const showSecondaryBuy = !course.isFree && !hasAccess;

  return (
    <PortalLayout meta={{
      title: `${course.title} — курс FINTODO`,
      description: course.tagline,
      canonical: `https://fintodo.com.ua/learn/${category}/${course.slug}`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Навчання", url: `${SITE_URL}/learn` },
        { name: cat.label, url: `${SITE_URL}/learn/${cat.slug}` },
        { name: course.title, url: `${SITE_URL}/learn/${category}/${course.slug}` },
      ])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.description,
        provider: { "@type": "Organization", name: "FINTODO", url: SITE_URL },
        hasCourseInstance: {
          "@type": "CourseInstance", courseMode: "online",
          instructor: { "@type": "Person", name: course.instructorName },
        },
        offers: course.isFree
          ? { "@type": "Offer", price: "0", priceCurrency: "UAH" }
          : { "@type": "Offer", price: String(course.price), priceCurrency: "UAH" },
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 lg:pb-16">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Навчання", to: "/learn" },
          { label: cat.label, to: `/learn/${cat.slug}` },
          { label: course.title },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left column */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{course.title}</h1>
            <p className="text-muted-foreground mb-4">{course.tagline}</p>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= Math.round(mockRating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-foreground">{String(mockRating).replace(".", ",")}</span>
              <span className="text-xs text-muted-foreground">({mockRatingsCount} оцінок)</span>
              <span className="text-xs text-muted-foreground">· {course.enrolled.toLocaleString("uk-UA")} навчаються</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{LEVEL_LABELS[course.level]}</Badge>
              <Badge variant="outline">{FORMAT_LABELS[course.format]}</Badge>
              <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />{totalDurationLabel} контенту</Badge>
              <Badge variant="outline">{course.lessonsCount} {pluralizeLessons(course.lessonsCount)}</Badge>
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
              <CalendarDays className="h-3.5 w-3.5" />
              Останнє оновлення: березень 2026
            </p>

            <p className="text-sm text-foreground mb-8">{course.description}</p>

            {/* What you'll learn */}
            <h2 className="text-xl font-semibold text-foreground mb-3">Що ви вивчите</h2>
            <ul className="space-y-2 mb-8">
              {course.whatYouLearn.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Course program */}
            <h2 className="text-xl font-semibold text-foreground mb-3">Програма курсу</h2>
            <Accordion type="single" collapsible className="mb-8">
              {course.lessons.map((lesson, i) => {
                const locked = !lesson.isFree && !hasAccess;
                const isDone = progress.has(lesson.id);
                const lessonHref = `/learn/${category}/${course.slug}/${lesson.id}`;
                return (
                  <AccordionItem key={lesson.id} value={lesson.id}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2 text-left">
                        {isDone ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : locked ? (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <Unlock className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                        <span>{i + 1}. {lesson.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>⏱ {lesson.duration}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {lesson.type === 'video' ? '📹 Відео' : lesson.type === 'quiz' ? '📝 Тест' : lesson.type === 'interactive' ? '🖥 Практикум' : '📄 Текст'}
                          </Badge>
                          {lesson.isFree && <Badge variant="secondary" className="text-[10px]">Безкоштовно</Badge>}
                        </div>
                        {locked ? (
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/learn/checkout/${course.slug}`}>
                              <Lock className="h-3.5 w-3.5 mr-1" /> Розблокувати курс
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary" asChild>
                            <Link to={lessonHref}>
                              {isDone ? 'Переглянути ще раз' : 'Відкрити урок'} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* Requirements */}
            <h2 className="text-xl font-semibold text-foreground mb-3">Вимоги</h2>
            {course.requirements.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground mb-8">
                {course.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground mb-8">Без попередніх знань — підходить для початківців</p>
            )}
          </div>

          {/* Right sticky sidebar */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4 text-center">
                <span className="text-5xl block">{course.emoji}</span>
                <div>
                  {course.isFree ? (
                    <>
                      <p className="text-2xl font-bold text-primary">Безкоштовно</p>
                      <p className="text-sm text-muted-foreground">Весь курс безкоштовно</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-foreground">{course.price} грн</p>
                      <p className="text-sm text-muted-foreground">Перший урок безкоштовно</p>
                    </>
                  )}
                </div>
                {isCertifiedCourse && !hasProgress ? (
                  <Button className="w-full" size="lg" onClick={() => setTryDialogOpen(true)}>
                    {primaryLabel} <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" asChild>
                    <Link to={primaryHref}>
                      {primaryLabel} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {showSecondaryBuy && (
                  <Button className="w-full" variant="outline" asChild>
                    <Link to={`/learn/checkout/${course.slug}`}>
                      Купити курс — {course.price} грн
                    </Link>
                  </Button>
                )}
                {course.certificate && (
                  <p className="text-xs text-muted-foreground">✓ Сертифікат після завершення</p>
                )}
                {course.fintodoFeature && (
                  <div className="text-xs text-muted-foreground border-t border-border/50 pt-3">
                    🔗 Пов'язана функція FINTODO: {course.fintodoFeature}
                  </div>
                )}
                <div className="text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <p className="font-medium text-foreground">{course.instructorName}</p>
                  <p>{course.instructorRole}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-border bg-background p-3 flex items-center justify-between z-40">
        <div>
          {course.isFree ? (
            <span className="text-lg font-bold text-primary">Безкоштовно</span>
          ) : (
            <span className="text-lg font-bold text-foreground">{course.price} грн</span>
          )}
        </div>
        {isCertifiedCourse && !hasProgress ? (
          <Button size="sm" onClick={() => setTryDialogOpen(true)}>
            Спробувати <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button size="sm" asChild>
            <Link to={primaryHref}>
              {primaryLabel.startsWith('Продовжити') ? 'Продовжити' : (course.isFree || hasAccess ? 'Розпочати' : 'Спробувати')}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        )}
      </div>

      {isCertifiedCourse && (
        <CertifiedTryDialog
          open={tryDialogOpen}
          onOpenChange={setTryDialogOpen}
          firstLessonHref={`/learn/${category}/${course.slug}/${firstLesson?.id}`}
          courseUrl={`/learn/${category}/${course.slug}`}
        />
      )}
    </PortalLayout>
  );
};

export default LearnCoursePage;
