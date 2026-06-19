import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COURSES } from "@/portal/data/learn";

const CourseCheckoutSuccess = () => {
  const [params] = useSearchParams();
  const courseSlug = params.get("course");
  const fromLessonId = params.get("from");
  const course = COURSES.find(c => c.slug === courseSlug);

  const startLessonId = fromLessonId ?? course?.lessons[0]?.id;
  const startUrl = course && startLessonId
    ? `/learn/${course.category}/${course.slug}/${startLessonId}`
    : "/learn";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Card className="max-w-lg w-full">
        <CardContent className="p-6 sm:p-10 text-center space-y-5">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Курс відкрито!</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {course
                ? <>Ви отримали повний доступ до курсу <strong className="text-foreground">«{course.title}»</strong>. Чек і доступ продубльовані на ваш email.</>
                : <>Дякуємо за покупку. Чек надіслано на ваш email.</>
              }
            </p>
          </div>

          {course && (
            <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-accent/30 p-3 text-left">
              <span className="text-3xl">{course.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{course.title}</p>
                <p className="text-xs text-muted-foreground">{course.lessonsCount} уроків · {course.certificate ? "Сертифікат після завершення" : "Без сертифіката"}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild size="lg" className="flex-1">
              <Link to={startUrl}>
                {fromLessonId ? "Повернутися до уроку" : "Розпочати курс"} <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link to="/learn">
                <BookOpen className="h-4 w-4 mr-1" /> Усі курси
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCheckoutSuccess;
