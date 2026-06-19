import { Link } from "react-router-dom";
import { GraduationCap, Clock, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { COURSES } from "@/portal/data/learn";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";

const PROMO_COURSE_IDS = ["fop-start", "it-fop-full", "fintodo-certified"];

export const LearnPromoSection = () => {
  const { ref, isVisible } = useScrollReveal();
  const courses = COURSES.filter((c) => PROMO_COURSE_IDS.includes(c.id));

  return (
    <section
      ref={ref}
      className={`py-10 sm:py-14 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <GraduationCap className="h-3.5 w-3.5" />
            Навчальний центр
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Навчаємо від нуля
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Безкоштовні курси від FINTODO — результат за 1 день
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              to={`/learn/${course.category}/${course.slug}`}
              className="group rounded-xl border border-border/50 bg-card h-full flex flex-col overflow-hidden hover:border-primary/30 hover:shadow-[var(--shadow-lg)] transition-all duration-300"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Progress bar top */}
              <div className="h-0.5 bg-primary/15 group-hover:bg-primary transition-colors duration-300" />

              <div className="p-4 sm:p-5 flex flex-row sm:flex-col gap-3 sm:gap-0 sm:space-y-3 flex-1">
                {/* Step number + emoji + badge row */}
                <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground/50 tracking-widest">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-2xl">{course.emoji}</span>
                  </div>
                  <Badge variant={course.isFree ? "success" : "secondary"} size="sm" className="hidden sm:inline-flex">
                    {course.isFree ? "Безкоштовно" : `${course.price} грн`}
                  </Badge>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="hidden sm:block text-xs text-muted-foreground mt-1 line-clamp-2">
                    {course.tagline}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrolled.toLocaleString("uk-UA")}
                    </span>
                  </div>

                  {course.certificate && (
                    <p className="hidden sm:block text-xs text-primary font-medium mt-2">🏅 Сертифікат</p>
                  )}
                </div>

                {/* CTA pinned to bottom */}
                <div className="mt-auto pt-2 sm:pt-3 self-end sm:self-start">
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary bg-primary/5 rounded-lg px-3 py-1.5 group-hover:bg-primary/10 transition-colors">
                    Почати
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* All courses CTA */}
        <div className="text-center mt-5">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Всі курси
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
