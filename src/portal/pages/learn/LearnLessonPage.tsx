import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { COURSES, LEARN_CATEGORIES, type CourseAudience, type CourseLesson, type Course, type CourseQuizQuestion } from "@/portal/data/learn";
import { MINI_QUIZZES } from "@/portal/data/learnMiniQuizzes";
import { Lock, CheckCircle2, ArrowLeft, ArrowRight, ListChecks, PlayCircle, Sparkles, Award, BookOpen } from "lucide-react";
import {
  getProgress, isLessonDone, markLessonDone, setLastLesson, hasCourseAccess,
  getQuizResult, saveQuizResult, isQuizPassed, isCourseFullyCompleted,
} from "@/portal/lib/courseProgress";
import { LessonInlineTool } from "@/portal/components/learn/LessonInlineTool";
import { LessonMarkdown, extractToc } from "@/portal/components/learn/LessonMarkdown";
import { LessonSections, sectionsForLesson } from "@/portal/components/learn/LessonSections";
import NotFound from "@/pages/NotFound";

// ───────── helpers ─────────

const TYPE_LABELS: Record<CourseLesson['type'], string> = {
  video: '📹 Відео',
  text: '📄 Текст',
  interactive: '🖥 Практикум',
  quiz: '📝 Підсумковий тест',
};

function buildFallbackContent(course: Course, lesson: CourseLesson): string {
  const points = course.whatYouLearn.slice(0, 3).map(p => `• ${p}`).join('\n');
  return [
    lesson.summary ?? `Цей урок — частина курсу «${course.title}».`,
    '',
    `**Що ви опануєте на цьому уроці**`,
    points,
    '',
    `Тривалість: ${lesson.duration}. Тип: ${TYPE_LABELS[lesson.type]}.`,
  ].join('\n');
}

// Markdown renderer + TOC винесені в окремий компонент.

// ───────── lesson player ─────────

function VideoPlayer({ lesson }: { lesson: CourseLesson }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 aspect-video flex flex-col items-center justify-center gap-2 text-center p-6">
      <PlayCircle className="h-12 w-12 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">{lesson.title}</p>
      <p className="text-xs text-muted-foreground">{lesson.videoNote ?? 'Відео-урок зʼявиться найближчим часом'}</p>
    </div>
  );
}

interface QuizBlockProps {
  questions: CourseQuizQuestion[];
  threshold?: number;     // % правильних для проходження
  storedResult?: { score: number; correct: number; total: number; passedAt: string } | null;
  onPass: (score: number, correct: number, total: number) => void;
  variant?: 'mini' | 'final';
}

function QuizBlock({ questions, threshold = 66, storedResult, onPass, variant = 'final' }: QuizBlockProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(!!storedResult);

  if (questions.length === 0) return null;

  const correct = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const score = Math.round((correct / questions.length) * 100);
  const displayScore = submitted ? (storedResult?.score ?? score) : score;
  const passed = submitted && displayScore >= threshold;

  return (
    <div className="space-y-4">
      {storedResult && !Object.keys(answers).length && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-foreground flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Тест уже пройдено: {storedResult.score}% ({storedResult.correct}/{storedResult.total})
          </span>
          <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="text-xs underline text-muted-foreground">Пройти ще раз</button>
        </div>
      )}

      {(!storedResult || Object.keys(answers).length > 0 || !submitted) && questions.map((q, qi) => (
        <div key={qi} className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium text-foreground mb-3">{qi + 1}. {q.question}</p>
          <RadioGroup
            value={answers[qi]?.toString() ?? ''}
            onValueChange={(v) => setAnswers(a => ({ ...a, [qi]: Number(v) }))}
            disabled={submitted}
          >
            {q.options.map((opt, oi) => {
              const isUserPick = answers[qi] === oi;
              const isCorrect = q.correctIndex === oi;
              const showFeedback = submitted && (isUserPick || isCorrect);
              return (
                <div key={oi} className={`flex items-center gap-2 rounded p-2 ${showFeedback ? (isCorrect ? 'bg-emerald-500/10' : isUserPick ? 'bg-destructive/10' : '') : ''}`}>
                  <RadioGroupItem value={oi.toString()} id={`${variant}-q${qi}-o${oi}`} />
                  <Label htmlFor={`${variant}-q${qi}-o${oi}`} className="text-sm cursor-pointer">{opt}</Label>
                </div>
              );
            })}
          </RadioGroup>
          {submitted && q.explanation && (
            <p className="text-xs text-muted-foreground mt-2">💡 {q.explanation}</p>
          )}
        </div>
      ))}

      {!submitted ? (
        <Button
          onClick={() => {
            setSubmitted(true);
            const sc = Math.round((correct / questions.length) * 100);
            onPass(sc, correct, questions.length);
          }}
          disabled={Object.keys(answers).length < questions.length}
          variant={variant === 'mini' ? 'secondary' : 'default'}
        >
          Перевірити відповіді
        </Button>
      ) : Object.keys(answers).length > 0 && (
        <div className={`rounded-lg p-4 text-sm ${passed ? 'bg-emerald-500/10 text-foreground' : 'bg-destructive/10 text-foreground'}`}>
          {passed
            ? <>✅ Зараховано — {displayScore}% правильних ({correct}/{questions.length}).</>
            : <>Ви набрали {displayScore}%. Потрібно ≥{threshold}%, щоб пройти. <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="underline">Спробувати ще раз</button></>
          }
        </div>
      )}
    </div>
  );
}

// ───────── paywall ─────────

function Paywall({ course, fromLessonId }: { course: Course; fromLessonId?: string }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4 text-center">
        <Lock className="h-10 w-10 text-muted-foreground mx-auto" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">Цей урок доступний після покупки курсу</h2>
          <p className="text-sm text-muted-foreground mt-1">Розблокуйте всі {course.lessonsCount} уроків і {course.certificate ? 'сертифікат' : 'практичні матеріали'}.</p>
        </div>
        <div className="text-3xl font-bold text-foreground">{course.price} грн</div>
        <ul className="text-left text-sm text-foreground space-y-1.5 max-w-md mx-auto">
          {course.whatYouLearn.slice(0, 4).map((w, i) => (
            <li key={i} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{w}</li>
          ))}
        </ul>
        <Button size="lg" asChild className="w-full sm:w-auto">
          <Link to={`/learn/checkout/${course.slug}${fromLessonId ? `?from=${fromLessonId}` : ""}`}>
            Розблокувати курс <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ───────── lesson list (sidebar) ─────────

function LessonList({
  course, currentId, doneIds, hasAccess, onPickLocked,
}: {
  course: Course;
  currentId: string;
  doneIds: Set<string>;
  hasAccess: boolean;
  onPickLocked: () => void;
}) {
  return (
    <ul className="space-y-1">
      {course.lessons.map((l, i) => {
        const isDone = doneIds.has(l.id);
        const isCurrent = l.id === currentId;
        const isLocked = !l.isFree && !hasAccess;
        const base = `flex items-start gap-2 rounded-md p-2 text-sm transition-colors ${isCurrent ? 'bg-accent text-foreground' : 'hover:bg-accent/50 text-muted-foreground'}`;
        const inner = (
          <>
            <span className="shrink-0 mt-0.5">
              {isDone ? <CheckCircle2 className="h-4 w-4 text-primary" />
                : isLocked ? <Lock className="h-4 w-4" />
                : <span className="inline-flex items-center justify-center h-4 w-4 rounded-full border border-border text-[10px]">{i + 1}</span>}
            </span>
            <span className={`leading-snug ${isCurrent ? 'font-medium text-foreground' : ''}`}>{l.title}</span>
          </>
        );
        return (
          <li key={l.id}>
            {isLocked ? (
              <button type="button" onClick={onPickLocked} className={`${base} w-full text-left`}>{inner}</button>
            ) : (
              <Link to={`/learn/${course.category}/${course.slug}/${l.id}`} className={base}>{inner}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ───────── page ─────────

const LearnLessonPage = () => {
  const { category, courseSlug, lessonId } = useParams<{ category: string; courseSlug: string; lessonId: string }>();
  const navigate = useNavigate();

  const course = COURSES.find(c => c.slug === courseSlug && c.category === category);
  const cat = category ? LEARN_CATEGORIES[category as CourseAudience] : undefined;
  const lessonIndex = course?.lessons.findIndex(l => l.id === lessonId) ?? -1;
  const lesson = lessonIndex >= 0 ? course!.lessons[lessonIndex] : undefined;

  const hasAccess = useMemo(() => course ? hasCourseAccess(course.id, course.isFree) : false, [course]);
  const isLocked = lesson ? (!lesson.isFree && !hasAccess) : false;

  const [doneIds, setDoneIds] = useState<Set<string>>(() => course ? getProgress(course.id) : new Set());
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (course && lesson && !isLocked) setLastLesson(course.id, lesson.id);
    // прокрутка нагору при зміні уроку
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [course, lesson, isLocked]);

  if (!course || !cat || !lesson) return <NotFound />;

  const totalDone = doneIds.size;
  const totalLessons = course.lessons.length;
  const progressPct = Math.round((totalDone / totalLessons) * 100);

  const prevLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < totalLessons - 1 ? course.lessons[lessonIndex + 1] : null;
  const isLastLesson = !nextLesson;

  const goLesson = (l: CourseLesson | null) => {
    if (!l) return;
    if (!l.isFree && !hasAccess) { setPaywallOpen(true); return; }
    navigate(`/learn/${course.category}/${course.slug}/${l.id}`);
  };

  const handleMarkDone = () => {
    markLessonDone(course.id, lesson.id);
    setDoneIds(getProgress(course.id));
  };

  const content = lesson.content ?? buildFallbackContent(course, lesson);
  const structured = lesson.structured;
  const toc = useMemo(() => structured ? [] : extractToc(content), [content, structured]);

  // Mini-quiz: окреме поле або взяте з мапи MINI_QUIZZES.
  // Для уроку type 'quiz' — використовуємо lesson.quiz як підсумковий тест.
  const miniQuiz: CourseQuizQuestion[] = lesson.miniQuiz
    ?? (lesson.type !== 'quiz' ? (MINI_QUIZZES[`${course.id}:${lesson.id}`] ?? []) : []);
  const finalQuiz: CourseQuizQuestion[] = lesson.type === 'quiz' ? (lesson.quiz ?? []) : [];

  const miniResult = getQuizResult(course.id, lesson.id);
  const courseFullyCompleted = isCourseFullyCompleted(course.id, course.lessons);

  const handleQuizPass = (score: number, correct: number, total: number) => {
    saveQuizResult(course.id, lesson.id, {
      score, correct, total, passedAt: new Date().toISOString(),
    });
    if (score >= 66) {
      markLessonDone(course.id, lesson.id);
      setDoneIds(getProgress(course.id));
    }
    forceTick(t => t + 1);
  };

  return (
    <PortalLayout meta={{
      title: `${lesson.title} — ${course.title}`,
      description: lesson.summary ?? course.tagline,
      canonical: `https://fintodo.com.ua/learn/${category}/${course.slug}/${lesson.id}`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Навчання", url: `${SITE_URL}/learn` },
        { name: cat.label, url: `${SITE_URL}/learn/${cat.slug}` },
        { name: course.title, url: `${SITE_URL}/learn/${category}/${course.slug}` },
        { name: lesson.title, url: `${SITE_URL}/learn/${category}/${course.slug}/${lesson.id}` },
      ])} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12">
        <BreadcrumbNav items={[
          { label: "Навчання", to: "/learn" },
          { label: cat.label, to: `/learn/${cat.slug}` },
          { label: course.title, to: `/learn/${category}/${course.slug}` },
          { label: `Урок ${lessonIndex + 1}` },
        ]} />

        {/* Mobile: lessons sheet trigger */}
        <div className="lg:hidden mb-3">
          <Sheet open={listOpen} onOpenChange={setListOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2"><ListChecks className="h-4 w-4" />Уроки {totalDone}/{totalLessons}</span>
                <span className="text-xs text-muted-foreground">{progressPct}%</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{course.title}</SheetTitle>
                <SheetDescription>Прогрес: {totalDone} з {totalLessons} ({progressPct}%)</SheetDescription>
              </SheetHeader>
              <Progress value={progressPct} className="h-2 my-3" />
              <div onClick={() => setListOpen(false)}>
                <LessonList course={course} currentId={lesson.id} doneIds={doneIds} hasAccess={hasAccess} onPickLocked={() => { setListOpen(false); setPaywallOpen(true); }} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
          {/* Main content */}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{lesson.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
              <Badge variant="outline">Урок {lessonIndex + 1} з {totalLessons}</Badge>
              <Badge variant="outline">{TYPE_LABELS[lesson.type]}</Badge>
              <Badge variant="outline">⏱ {lesson.duration}</Badge>
              {lesson.isFree && <Badge variant="secondary">Безкоштовно</Badge>}
              {isLessonDone(course.id, lesson.id) && <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">✓ Пройдено</Badge>}
              {miniResult && isQuizPassed(miniResult) && <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">🧠 Тест: {miniResult.score}%</Badge>}
            </div>

            {isLocked ? (
              <Paywall course={course} fromLessonId={lesson.id} />
            ) : (
              <>
                {/* Player area */}
                <div className="mb-6 space-y-5">
                  {lesson.type === 'video' && <VideoPlayer lesson={lesson} />}

                  {(() => {
                    const miniQuizSlot = miniQuiz.length > 0 ? (
                      <section id="quiz" className="scroll-mt-24">
                        <Card>
                          <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="flex items-start gap-3">
                              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">🧠</span>
                              <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">Міні-перевірка</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {miniQuiz.length === 1 ? 'Одне питання' : `${miniQuiz.length} коротких питання`} · прохідний бал 66% · результат зберігається у прогресі
                                </p>
                              </div>
                            </div>
                            <QuizBlock
                              questions={miniQuiz}
                              threshold={66}
                              storedResult={miniResult}
                              variant="mini"
                              onPass={handleQuizPass}
                            />
                          </CardContent>
                        </Card>
                      </section>
                    ) : null;

                    if (structured) {
                      return (
                        <LessonSections
                          data={structured}
                          toolId={lesson.toolId}
                          storageKeyPrefix={`fintodo.lesson.${course.id}.${lesson.id}`}
                          miniQuizSlot={miniQuizSlot}
                        />
                      );
                    }

                    return (
                      <>
                        {(lesson.type === 'text' || lesson.type === 'interactive' || lesson.type === 'video') && (
                          <Card>
                            <CardContent className="p-5 sm:p-6 lg:p-8">
                              <LessonMarkdown source={content} />
                            </CardContent>
                          </Card>
                        )}

                        {lesson.toolId && (
                          <Card className="border-primary/20">
                            <CardContent className="p-4 sm:p-6 space-y-4">
                              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" /> Спробуйте просто зараз
                              </h2>
                              <LessonInlineTool toolId={lesson.toolId} />
                            </CardContent>
                          </Card>
                        )}

                        {lesson.type === 'quiz' && finalQuiz.length > 0 && (
                          <Card>
                            <CardContent className="p-5 sm:p-6 space-y-4">
                              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" /> Підсумковий тест
                              </h2>
                              <p className="text-sm text-muted-foreground">Прохідний бал — 66%. Після успішного проходження зʼявиться можливість отримати сертифікат.</p>
                              <QuizBlock
                                questions={finalQuiz}
                                threshold={66}
                                storedResult={miniResult}
                                variant="final"
                                onPass={handleQuizPass}
                              />
                            </CardContent>
                          </Card>
                        )}

                        {miniQuizSlot}
                      </>
                    );
                  })()}
                </div>

                {/* Upsell banner для першого free-уроку платного курсу */}
                {!course.isFree && !hasAccess && lesson.isFree && (
                  <Card className="mb-6 border-primary/30 bg-primary/5">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      <div className="text-sm text-foreground">
                        Це лише превʼю. Розблокуйте ще {totalLessons - course.lessons.filter(l => l.isFree).length} уроків і сертифікат за <strong>{course.price} грн</strong>.
                      </div>
                      <Button asChild size="sm">
                        <Link to={`/learn/checkout/${course.slug}`}>Купити курс</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Final / certificate state */}
                {isLastLesson && courseFullyCompleted && course.certificate && (
                  <Card className="mb-6 border-primary/40 bg-primary/5">
                    <CardContent className="p-6 text-center space-y-3">
                      <Award className="h-10 w-10 text-primary mx-auto" />
                      <h3 className="text-lg font-semibold text-foreground">Курс пройдено повністю</h3>
                      <p className="text-sm text-muted-foreground">Усі уроки і тести зараховані. Заповніть ПІБ та email — і отримаєте іменний сертифікат.</p>
                      <Button asChild size="lg">
                        <Link to={`/learn/${category}/${course.slug}/certificate`}>Отримати сертифікат <ArrowRight className="h-4 w-4 ml-1" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Footer nav (desktop) */}
                <div className="hidden lg:flex items-center justify-between gap-3 pt-4 border-t border-border">
                  <Button variant="outline" disabled={!prevLesson} onClick={() => goLesson(prevLesson)}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Попередній
                  </Button>
                  <Button
                    variant={isLessonDone(course.id, lesson.id) ? 'outline' : 'secondary'}
                    onClick={handleMarkDone}
                    disabled={isLessonDone(course.id, lesson.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {isLessonDone(course.id, lesson.id) ? 'Пройдено' : 'Позначити пройденим'}
                  </Button>
                  <Button onClick={() => goLesson(nextLesson)} disabled={!nextLesson}>
                    Наступний урок <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar: lessons + progress (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-foreground">Прогрес</span>
                    <span className="text-xs text-muted-foreground">{totalDone}/{totalLessons} · {progressPct}%</span>
                  </div>
                  <Progress value={progressPct} className="h-2 mb-4" />
                  <LessonList course={course} currentId={lesson.id} doneIds={doneIds} hasAccess={hasAccess} onPickLocked={() => setPaywallOpen(true)} />
                </CardContent>
              </Card>

              {!isLocked && (structured ? (
                (() => {
                  const sections = sectionsForLesson(structured, lesson.toolId, miniQuiz.length > 0);
                  if (sections.length === 0) return null;
                  return (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">Зміст уроку</span>
                        </div>
                        <ul className="space-y-0.5">
                          {sections.map((s) => {
                            const Icon = s.icon;
                            return (
                              <li key={s.id}>
                                <a
                                  href={`#${s.id}`}
                                  className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                                >
                                  <Icon className="h-3.5 w-3.5 text-primary/70" />
                                  {s.label}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })()
              ) : toc.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">Зміст уроку</span>
                    </div>
                    <ul className="space-y-1">
                      {toc.map((t, i) => (
                        <li key={`${t.id}-${i}`}>
                          <a
                            href={`#${t.id}`}
                            className={`block text-xs transition-colors py-1 leading-snug ${
                              t.level === 3
                                ? 'pl-3 text-muted-foreground/80 hover:text-foreground'
                                : 'text-muted-foreground hover:text-foreground font-medium'
                            }`}
                          >
                            {t.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-border bg-background p-3 flex items-center gap-2 z-40">
        <Button variant="outline" size="icon" disabled={!prevLesson} onClick={() => goLesson(prevLesson)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleMarkDone}
          disabled={isLocked || isLessonDone(course.id, lesson.id)}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          {isLessonDone(course.id, lesson.id) ? 'Пройдено' : 'Готово'}
        </Button>
        <Button size="sm" className="flex-1" onClick={() => goLesson(nextLesson)} disabled={!nextLesson}>
          Далі <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Paywall sheet */}
      <Sheet open={paywallOpen} onOpenChange={setPaywallOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Розблокувати курс</SheetTitle>
            <SheetDescription>Цей урок доступний після покупки повного курсу.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="text-3xl font-bold text-foreground">{course.price} грн</div>
            <ul className="text-sm text-foreground space-y-1.5">
              {course.whatYouLearn.map((w, i) => (
                <li key={i} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{w}</li>
              ))}
            </ul>
            <Button asChild size="lg" className="w-full">
              <Link to={`/learn/checkout/${course.slug}`}>Купити курс <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
};

export default LearnLessonPage;
