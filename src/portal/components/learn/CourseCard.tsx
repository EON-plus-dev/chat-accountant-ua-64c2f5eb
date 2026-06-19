import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, FileText, Sparkles, MonitorPlay, Zap } from "lucide-react";
import type { Course } from "@/portal/data/learn";
import { pluralizeLessons } from "@/lib/ukrainian-pluralize";

const LEVEL_LABEL: Record<Course["level"], string> = {
  beginner: "Початківець",
  intermediate: "Середній",
  advanced: "Просунутий",
};

const FORMAT_ICON: Record<Course["format"], typeof Video> = {
  video: Video,
  text: FileText,
  interactive: Zap,
  webinar: MonitorPlay,
};

interface Props {
  course: Course;
  compact?: boolean;
}

export const CourseCard = ({ course, compact }: Props) => {
  const FormatIcon = FORMAT_ICON[course.format];
  return (
    <Link
      to={`/learn/${course.category}/${course.slug}`}
      aria-label={`Курс: ${course.title}`}
      className="group block h-full"
    >
      <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-sm md:group-hover:-translate-y-0.5">
        <CardContent className={compact ? "p-4 space-y-2" : "p-4 sm:p-5 space-y-3"}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl sm:text-3xl leading-none">{course.emoji}</span>
              <Badge variant="outline" className="text-[10px] font-normal truncate max-w-[120px]">
                {course.categoryLabel}
              </Badge>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge variant={course.isFree ? "secondary" : "outline"}>
                {course.isFree ? "Безкоштовно" : `${course.price} грн`}
              </Badge>
              {course.isNew && (
                <Badge variant="default" className="gap-1 text-[10px]">
                  <Sparkles className="h-2.5 w-2.5" /> Новинка
                </Badge>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
              {course.title}
            </h3>
            {!compact && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.tagline}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <FormatIcon className="h-3.5 w-3.5" />
              {LEVEL_LABEL[course.level]}
            </span>
            <span aria-hidden>·</span>
            <span>⏱ {course.duration}</span>
            <span aria-hidden>·</span>
            <span>
              {course.lessonsCount} {pluralizeLessons(course.lessonsCount)}
            </span>
          </div>
          {!compact && (
            <Button
              size="sm"
              variant={course.isFree ? "default" : "outline"}
              className="w-full"
              tabIndex={-1}
            >
              {course.isFree ? "Розпочати безкоштовно →" : "Деталі курсу →"}
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
