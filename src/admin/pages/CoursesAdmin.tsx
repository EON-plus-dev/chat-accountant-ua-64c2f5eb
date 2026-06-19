import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { COURSES, LEARN_CATEGORIES, WEBINARS, type Course, type CourseLevel, type CourseFormat, type Webinar } from "@/portal/data/learn";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters, { type FilterConfig } from "@/admin/components/ContentFilters";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { courseSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, Star, Crown, Video } from "lucide-react";

const levelLabels: Record<CourseLevel, string> = { beginner: "Початковий", intermediate: "Середній", advanced: "Просунутий" };
const levelColors: Record<CourseLevel, string> = {
  beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  advanced: "bg-red-500/10 text-red-700 dark:text-red-400",
};
const formatLabels: Record<CourseFormat, string> = { video: "Відео", text: "Текст", interactive: "Інтерактив", webinar: "Вебінар" };

const columns: ColumnDef<Course, any>[] = [
  { accessorKey: "title", header: "Назва", cell: ({ row }) => (
    <div className="flex items-center gap-2">
      <span>{row.original.emoji}</span>
      <div>
        <p className="font-medium text-foreground">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{row.original.tagline}</p>
      </div>
      {row.original.isNew && <Badge className="bg-accent text-accent-foreground text-[10px]">NEW</Badge>}
      {row.original.isPopular && <Badge variant="secondary" className="text-[10px]">🔥</Badge>}
    </div>
  )},
  { accessorKey: "level", header: "Рівень", cell: ({ getValue }) => { const l = getValue<CourseLevel>(); return <Badge className={levelColors[l]}>{levelLabels[l]}</Badge>; }},
  { accessorKey: "format", header: "Формат", cell: ({ getValue }) => <Badge variant="outline">{formatLabels[getValue<CourseFormat>()]}</Badge> },
  { accessorKey: "lessonsCount", header: "Уроків", cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue<number>()}</span> },
  { accessorKey: "category", header: "Аудиторія", cell: ({ getValue }) => { const cat = LEARN_CATEGORIES[getValue<keyof typeof LEARN_CATEGORIES>()]; return cat ? <Badge variant="secondary">{cat.emoji} {cat.label}</Badge> : null; }},
  { accessorKey: "enrolled", header: "Записані", cell: ({ getValue }) => <span className="font-mono text-sm text-foreground">{getValue<number>().toLocaleString("uk-UA")}</span> },
  { accessorKey: "isFree", header: "Доступ", cell: ({ getValue }) => getValue<boolean>() ? <Badge variant="secondary">Безкоштовно</Badge> : <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400">Premium</Badge> },
];

const webinarColumns: ColumnDef<Webinar, any>[] = [
  { accessorKey: "title", header: "Назва", cell: ({ row }) => <span className="font-medium text-foreground">{row.original.title}</span> },
  { accessorKey: "date", header: "Дата", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.date}</span> },
  { id: "speaker", header: "Спікер", cell: ({ row }) => <div><span className="text-sm">{row.original.speakerName}</span><br/><span className="text-xs text-muted-foreground">{row.original.speakerRole}</span></div> },
  { accessorKey: "duration", header: "Тривалість" },
  { accessorKey: "isUpcoming", header: "Статус", cell: ({ row }) => <Badge variant={row.original.isUpcoming ? "default" : "secondary"}>{row.original.isUpcoming ? "Майбутній" : "Запис"}</Badge> },
  { accessorKey: "enrolled", header: "Записані", cell: ({ row }) => <span className="font-mono text-sm">{row.original.enrolled?.toLocaleString("uk-UA") ?? "—"}</span> },
];

const FILTERS: FilterConfig[] = [
  { key: "level", label: "Рівень", options: [{ value: "beginner", label: "Початковий" }, { value: "intermediate", label: "Середній" }, { value: "advanced", label: "Просунутий" }] },
  { key: "format", label: "Формат", options: [{ value: "video", label: "Відео" }, { value: "text", label: "Текст" }, { value: "interactive", label: "Інтерактив" }, { value: "webinar", label: "Вебінар" }] },
];

export default function CoursesAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("courses");

  const filtered = useMemo(() => {
    let result = [...COURSES];
    if (search) { const q = search.toLowerCase(); result = result.filter((c) => c.title.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q)); }
    if (filterValues.level && filterValues.level !== "all") result = result.filter((c) => c.level === filterValues.level);
    if (filterValues.format && filterValues.format !== "all") result = result.filter((c) => c.format === filterValues.format);
    return result;
  }, [search, filterValues]);

  const totalEnrolled = COURSES.reduce((s, c) => s + c.enrolled, 0);
  const freeCount = COURSES.filter((c) => c.isFree).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Курси та вебінари</h1>
          <p className="text-muted-foreground text-sm mt-1">Управління освітнім контентом платформи</p>
        </div>
        <ContentCreatorDialog schema={courseSchema} title="Додати курс" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{COURSES.length}</p><p className="text-xs text-muted-foreground">Курсів</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Video className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{WEBINARS.length}</p><p className="text-xs text-muted-foreground">Вебінарів</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{totalEnrolled.toLocaleString("uk-UA")}</p><p className="text-xs text-muted-foreground">Записаних</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Star className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{freeCount}</p><p className="text-xs text-muted-foreground">Безкоштовних</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Crown className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{COURSES.length - freeCount}</p><p className="text-xs text-muted-foreground">Premium</p></div></CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="courses">Курси ({COURSES.length})</TabsTrigger>
          <TabsTrigger value="webinars">Вебінари ({WEBINARS.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <ContentFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук курсів..."
            filters={FILTERS} filterValues={filterValues}
            onFilterChange={(key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }))}
            onClearAll={() => { setSearch(""); setFilterValues({}); }}
          />
          <ContentTable data={filtered} columns={columns} pageSize={15} globalFilter={search}
            onRowClick={(row) => navigate(`/admin/content/course/${row.slug}`)}
          />
        </TabsContent>
        <TabsContent value="webinars">
          <ContentTable columns={webinarColumns} data={WEBINARS} />
        </TabsContent>
      </Tabs>

      
    </div>
  );
}
