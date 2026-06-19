import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  COURSES,
  WEBINARS,
  LEARN_CATEGORIES,
  type Course,
  type CourseAudience,
} from "@/portal/data/learn";
import {
  Users,
  BookOpen,
  CalendarDays,
  ArrowRight,
  Sparkles,
  Award,
  Handshake,
  X,
} from "lucide-react";
import { useAudience } from "@/contexts/AudienceContext";
import {
  pluralizeCourses,
  pluralizeWebinars,
  pluralizeStudents,
} from "@/lib/ukrainian-pluralize";
import { CourseCard } from "@/portal/components/learn/CourseCard";
import {
  LearnToolbar,
  DEFAULT_FILTERS,
  matchDuration,
  parseDurationMinutes,
  type LearnFilters,
  type SortKey,
} from "@/portal/components/learn/LearnToolbar";
import { LearnFilterPanel } from "@/portal/components/learn/LearnFilterPanel";
import { LearnFilterSheet } from "@/portal/components/learn/LearnFilterSheet";

const ALL_AUDIENCES: CourseAudience[] = [
  "personal",
  "fop",
  "accountants",
  "business",
  "it",
];

const SHORT_AUDIENCE_LABEL: Record<CourseAudience, string> = {
  fop: "ФОП",
  business: "Бізнесу",
  personal: "Фізособам",
  it: "IT-фріланс",
  accountants: "Бухгалтерам",
};

const matchSearch = (text: string, q: string) => {
  if (!q) return true;
  const hay = text.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) => hay.includes(tok));
};

const matchCourse = (c: Course, f: LearnFilters) => {
  if (f.audiences.length > 0 && !f.audiences.includes(c.category)) return false;
  if (
    !matchSearch(
      `${c.title} ${c.tagline} ${c.description} ${c.whatYouLearn.join(" ")} ${c.categoryLabel}`,
      f.query,
    )
  )
    return false;
  if (f.level !== "all" && c.level !== f.level) return false;
  if (f.format !== "all" && c.format !== f.format) return false;
  if (f.price === "free" && !c.isFree) return false;
  if (f.price === "paid" && c.isFree) return false;
  if (!matchDuration(c, f.duration)) return false;
  if (f.certificateOnly && !c.certificate) return false;
  if (f.newOnly && !c.isNew) return false;
  return true;
};

const sortCourses = (
  list: Course[],
  sort: SortKey,
  preferAudience: CourseAudience,
): Course[] => {
  const arr = [...list];
  if (sort === "popular") {
    arr.sort((a, b) => b.enrolled - a.enrolled);
  } else if (sort === "new") {
    arr.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.enrolled - a.enrolled);
  } else if (sort === "shortest") {
    arr.sort(
      (a, b) => parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration),
    );
  } else if (sort === "price-asc") {
    arr.sort((a, b) => Number(b.isFree) - Number(a.isFree) || (a.price ?? 0) - (b.price ?? 0));
  } else {
    const score = (c: Course) =>
      (c.category === preferAudience ? 100 : 0) +
      (c.isPopular ? 30 : 0) +
      (c.isNew ? 10 : 0) +
      Math.min(c.enrolled / 100, 50);
    arr.sort((a, b) => score(b) - score(a));
  }
  return arr;
};

// ── URL <-> filters ───────────────────────────────────────────────
const filtersToParams = (f: LearnFilters): Record<string, string> => {
  const out: Record<string, string> = {};
  if (f.query) out.q = f.query;
  if (f.audiences.length) out.aud = f.audiences.join(",");
  if (f.level !== "all") out.level = f.level;
  if (f.format !== "all") out.format = f.format;
  if (f.price !== "all") out.price = f.price;
  if (f.duration !== "all") out.duration = f.duration;
  if (f.certificateOnly) out.cert = "1";
  if (f.newOnly) out.new = "1";
  if (f.sort !== "relevance") out.sort = f.sort;
  return out;
};

const filtersFromParams = (p: URLSearchParams): LearnFilters => {
  const audRaw = (p.get("aud") || "").split(",").filter(Boolean) as CourseAudience[];
  const audiences = audRaw.filter((a) => ALL_AUDIENCES.includes(a));
  const safe = <T extends string>(v: string | null, allowed: T[], fallback: T): T =>
    v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
  return {
    query: p.get("q") ?? "",
    audiences,
    level: safe(p.get("level"), ["all", "beginner", "intermediate", "advanced"], "all"),
    format: safe(
      p.get("format"),
      ["all", "video", "text", "interactive", "webinar"],
      "all",
    ),
    price: safe(p.get("price"), ["all", "free", "paid"], "all"),
    duration: safe(p.get("duration"), ["all", "short", "medium", "long"], "all"),
    certificateOnly: p.get("cert") === "1",
    newOnly: p.get("new") === "1",
    sort: safe(
      p.get("sort"),
      ["relevance", "popular", "new", "shortest", "price-asc"],
      "relevance",
    ),
  };
};

const LearnPage = () => {
  const { audience } = useAudience();
  const preferAudience: CourseAudience = audience === "individual" ? "personal" : "fop";

  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<LearnFilters>(() => filtersFromParams(params));
  const [sheetOpen, setSheetOpen] = useState(false);

  // Sync filters → URL
  useEffect(() => {
    const out = filtersToParams(filters);
    const next = new URLSearchParams();
    Object.entries(out).forEach(([k, v]) => next.set(k, v));
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const filteredCourses = useMemo(
    () => sortCourses(COURSES.filter((c) => matchCourse(c, filters)), filters.sort, preferAudience),
    [filters, preferAudience],
  );

  const matchedWebinars = useMemo(() => {
    const allowedAud =
      filters.audiences.length > 0 ? filters.audiences : ALL_AUDIENCES;
    return WEBINARS.filter(
      (w) =>
        w.audience.some((a) => allowedAud.includes(a)) &&
        matchSearch(`${w.title} ${w.description}`, filters.query),
    )
      .sort((a, b) => +new Date(a.dateISO) - +new Date(b.dateISO))
      .slice(0, 6);
  }, [filters.audiences, filters.query]);

  const showWebinars = filters.format === "all" || filters.format === "webinar";

  const audienceCounts = useMemo(() => {
    const acc: Record<CourseAudience, number> = {
      personal: 0,
      fop: 0,
      accountants: 0,
      business: 0,
      it: 0,
    };
    COURSES.forEach((c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
    });
    return acc;
  }, []);

  // Stats
  const totalEnrolled = useMemo(
    () => COURSES.reduce((s, c) => s + c.enrolled, 0),
    [],
  );
  const upcomingWebinarsCount = useMemo(
    () => WEBINARS.filter((w) => new Date(w.dateISO) > new Date()).length,
    [],
  );

  const flagshipCourse = useMemo(
    () =>
      COURSES.find(
        (c) =>
          c.id ===
          (audience === "individual" ? "personal-finlit-free" : "business-finlit-free"),
      ),
    [audience],
  );

  const advancedCount =
    (filters.level !== "all" ? 1 : 0) +
    (filters.format !== "all" ? 1 : 0) +
    (filters.price !== "all" ? 1 : 0) +
    (filters.duration !== "all" ? 1 : 0) +
    (filters.certificateOnly ? 1 : 0) +
    (filters.newOnly ? 1 : 0);

  const totalActive = advancedCount + filters.audiences.length;

  const isPristine =
    filters.query === "" &&
    filters.audiences.length === 0 &&
    advancedCount === 0 &&
    filters.sort === "relevance";

  const totalResults = filteredCourses.length + (showWebinars ? matchedWebinars.length : 0);

  // Active chips (mobile only) — щоб видно було, що застосовано без відкриття Sheet
  type ActiveChip = { key: string; label: string; clear: () => void };
  const activeChips: ActiveChip[] = [];
  filters.audiences.forEach((a) =>
    activeChips.push({
      key: `aud-${a}`,
      label: `${LEARN_CATEGORIES[a].emoji} ${SHORT_AUDIENCE_LABEL[a]}`,
      clear: () =>
        setFilters({ ...filters, audiences: filters.audiences.filter((x) => x !== a) }),
    }),
  );
  if (filters.level !== "all")
    activeChips.push({
      key: "level",
      label: filters.level === "beginner" ? "Початківець" : filters.level === "intermediate" ? "Середній" : "Просунутий",
      clear: () => setFilters({ ...filters, level: "all" }),
    });
  if (filters.format !== "all")
    activeChips.push({
      key: "format",
      label:
        filters.format === "video" ? "Відео" :
        filters.format === "text" ? "Текст" :
        filters.format === "interactive" ? "Інтерактив" : "Вебінар",
      clear: () => setFilters({ ...filters, format: "all" }),
    });
  if (filters.price !== "all")
    activeChips.push({
      key: "price",
      label: filters.price === "free" ? "Безкоштовно" : "Платні",
      clear: () => setFilters({ ...filters, price: "all" }),
    });
  if (filters.duration !== "all")
    activeChips.push({
      key: "duration",
      label:
        filters.duration === "short" ? "До 1 год" :
        filters.duration === "medium" ? "1–3 год" : "3+ год",
      clear: () => setFilters({ ...filters, duration: "all" }),
    });
  if (filters.certificateOnly)
    activeChips.push({
      key: "cert",
      label: "🎓 З сертифікатом",
      clear: () => setFilters({ ...filters, certificateOnly: false }),
    });
  if (filters.newOnly)
    activeChips.push({
      key: "new",
      label: "🆕 Новинки",
      clear: () => setFilters({ ...filters, newOnly: false }),
    });

  return (
    <PortalLayout
      meta={{
        title: "Навчання — курси з бухобліку, оподаткування та FINTODO | FINTODO",
        description:
          "Безкоштовні і платні курси для ФОП, бухгалтерів, IT-фрілансерів і власників бізнесу.",
        canonical: "https://fintodo.com.ua/learn",
      }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "FINTODO Навчальний центр",
          url: `${SITE_URL}/learn`,
        }}
      />
      <JsonLd
        data={getBreadcrumbSchema([
          { name: "Головна", url: SITE_URL },
          { name: "Навчання", url: `${SITE_URL}/learn` },
        ])}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Навчання" }]} />

        <header className="mb-3 sm:mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1.5 sm:mb-2">
            Навчальний центр FINTODO
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl line-clamp-2 sm:line-clamp-none">
            Усі курси, вебінари та матеріали в одному місці — для ФОП, бухгалтерів,
            фізосіб, IT-фрілансерів і власників бізнесу.
          </p>
        </header>

        {/* Compact stats — менший на mobile */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-2 text-xs sm:text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="font-semibold text-foreground">{COURSES.length}</span>{" "}
            <span className="hidden sm:inline">{pluralizeCourses(COURSES.length)}</span>
            <span className="sm:hidden">курсів</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="font-semibold text-foreground">
              {totalEnrolled.toLocaleString("uk-UA")}
            </span>{" "}
            <span className="hidden sm:inline">{pluralizeStudents(totalEnrolled)}</span>
            <span className="sm:hidden">учнів</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="font-semibold text-foreground">{upcomingWebinarsCount}</span>{" "}
            <span className="hidden sm:inline">{pluralizeWebinars(upcomingWebinarsCount)} попереду</span>
            <span className="sm:hidden">вебінарів</span>
          </span>
        </div>

        {/* Toolbar (sticky) */}
        <LearnToolbar
          filters={filters}
          onChange={setFilters}
          onOpenFilters={() => setSheetOpen(true)}
          activeFilterCount={totalActive}
        />

        {/* Mobile: рядок активних чіпсів */}
        {activeChips.length > 0 && (
          <div className="lg:hidden flex gap-1.5 mt-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full bg-primary/10 text-primary border border-primary/30 whitespace-nowrap"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="shrink-0 inline-flex items-center px-2.5 py-1 text-[11px] rounded-full text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              Скинути
            </button>
          </div>
        )}

        {/* Layout: sidebar + content */}
        <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6 mt-4">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
              <LearnFilterPanel
                filters={filters}
                onChange={setFilters}
                resultsCount={totalResults}
                audienceCounts={audienceCounts}
              />
            </div>
          </aside>

          <div className="min-w-0">
            {/* Promo strip — desktop only, на mobile прибираємо щоб не з'їдати екран */}
            {isPristine && flagshipCourse && (
              <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <Card className="md:col-span-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                  <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <Badge className="gap-1 mb-1.5" variant="default">
                        <Sparkles className="h-3 w-3" />
                        Безкоштовно · сертифікат
                      </Badge>
                      <p className="font-bold text-foreground text-base sm:text-lg leading-snug">
                        {flagshipCourse.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {flagshipCourse.tagline}
                      </p>
                    </div>
                    <Button asChild size="sm" className="shrink-0">
                      <Link to={`/learn/${flagshipCourse.category}/${flagshipCourse.slug}`}>
                        Почати <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                  <Link to="/learn/certification" className="group">
                    <Card className="h-full hover:border-primary/40 transition-colors">
                      <CardContent className="p-3 flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">Сертифікація</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Підтвердьте знання
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/partners" className="group">
                    <Card className="h-full hover:border-primary/40 transition-colors">
                      <CardContent className="p-3 flex items-center gap-2">
                        <Handshake className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">Партнерам</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Marketplace і знижки
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            )}

            {/* Results header (mobile) — лічильник */}
            <div className="lg:hidden flex items-center justify-between mt-4 mb-2">
              <span className="text-xs text-muted-foreground">
                Знайдено:{" "}
                <span className="font-semibold text-foreground">{totalResults}</span>
              </span>
            </div>

            {/* Results grid */}
            <section>
              {filteredCourses.length === 0 && (!showWebinars || matchedWebinars.length === 0) ? (
                <div className="text-center py-6 border border-dashed border-border rounded-lg">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-muted-foreground mb-4">
                    Нічого не знайшли за вашими фільтрами.
                  </p>
                  <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Скинути фільтри
                  </Button>
                </div>
              ) : (
                <>
                  {filteredCourses.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {filteredCourses.map((c) => (
                        <CourseCard key={c.id} course={c} />
                      ))}
                    </div>
                  )}

                  {showWebinars && matchedWebinars.length > 0 && (
                    <div className="mt-10">
                      <div className="flex items-baseline justify-between mb-3">
                        <h2 className="text-base sm:text-lg font-semibold text-foreground">
                          Вебінари ({matchedWebinars.length})
                        </h2>
                        <Button asChild variant="link" size="sm" className="px-0">
                          <Link to="/learn/webinars">Усі вебінари →</Link>
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {matchedWebinars.map((w) => (
                          <Card key={w.id} className="hover:border-primary/40 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 text-xs text-primary mb-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {w.date}
                              </div>
                              <p className="font-medium text-foreground line-clamp-2">{w.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {w.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <LearnFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        filters={filters}
        onChange={setFilters}
        resultsCount={totalResults}
        audienceCounts={audienceCounts}
      />
    </PortalLayout>
  );
};

export default LearnPage;
