import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COURSES, LEARN_CATEGORIES, type CourseAudience, type CourseLevel } from "@/portal/data/learn";
import { pluralizeLessons } from "@/lib/ukrainian-pluralize";
import NotFound from "@/pages/NotFound";

const LEVELS: { value: CourseLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'beginner', label: 'Початківець' },
  { value: 'intermediate', label: 'Середній' },
  { value: 'advanced', label: 'Просунутий' },
];

const PRICES = [
  { value: 'all', label: 'Всі' },
  { value: 'free', label: 'Безкоштовні' },
  { value: 'paid', label: 'Платні' },
];

const LearnCategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const cat = category ? LEARN_CATEGORIES[category as CourseAudience] : undefined;

  const [level, setLevel] = useState<CourseLevel | 'all'>('all');
  const [price, setPrice] = useState<string>('all');

  const filtered = useMemo(() => {
    return COURSES.filter(c => {
      if (c.category !== category) return false;
      if (level !== 'all' && c.level !== level) return false;
      if (price === 'free' && !c.isFree) return false;
      if (price === 'paid' && c.isFree) return false;
      return true;
    });
  }, [category, level, price]);

  if (!cat) return <NotFound />;

  return (
    <PortalLayout meta={{
      title: `${cat.label} — курси FINTODO`,
      description: cat.description,
      canonical: `https://fintodo.com.ua/learn/${cat.slug}`,
    }}>
      <JsonLd data={getBreadcrumbSchema([
        { name: "Головна", url: SITE_URL },
        { name: "Навчання", url: `${SITE_URL}/learn` },
        { name: cat.label, url: `${SITE_URL}/learn/${cat.slug}` },
      ])} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[
          { label: "Головна", to: "/" },
          { label: "Навчання", to: "/learn" },
          { label: cat.label },
        ]} />

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{cat.emoji} {cat.label}</h1>
        <p className="text-muted-foreground mb-6">{cat.description}</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Рівень:</span>
            <div className="flex gap-1">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${level === l.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ціна:</span>
            <div className="flex gap-1">
              {PRICES.map(p => (
                <button
                  key={p.value}
                  onClick={() => setPrice(p.value)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${price === p.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">Курсів за обраними фільтрами не знайдено</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(course => (
              <Link key={course.id} to={`/learn/${course.category}/${course.slug}`}>
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{course.emoji}</span>
                      <Badge variant={course.isFree ? "secondary" : "outline"}>
                        {course.isFree ? "Безкоштовно" : `${course.price} грн`}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.tagline}</p>
                    </div>
                    <div className="border-t border-border/50 pt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>⏱ {course.duration}</span>
                      <span>·</span>
                      <span>{course.lessonsCount} {pluralizeLessons(course.lessonsCount)}</span>
                      <span>·</span>
                      <span>{course.level === 'beginner' ? 'Початківець' : course.level === 'intermediate' ? 'Середній' : 'Просунутий'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      👤 {course.enrolled.toLocaleString("uk-UA")} вже навчаються
                    </div>
                    <Button size="sm" variant={course.isFree ? "default" : "outline"} className="w-full">
                      {course.isFree ? "Розпочати безкоштовно →" : `Придбати за ${course.price} грн`}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};

export default LearnCategoryPage;
