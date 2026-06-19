import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, FileText, Headphones, Video, BookOpen, Newspaper } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "fintodo_content_calendar";

interface PlannedPost {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: "news" | "guide" | "podcast" | "video" | "review";
  status: "planned" | "draft" | "published";
  assignee?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  news: { label: "Новина", icon: Newspaper, color: "bg-blue-500" },
  guide: { label: "Гайд", icon: BookOpen, color: "bg-emerald-500" },
  podcast: { label: "Подкаст", icon: Headphones, color: "bg-violet-500" },
  video: { label: "Відео", icon: Video, color: "bg-rose-500" },
  review: { label: "Огляд", icon: FileText, color: "bg-amber-500" },
};

const STATUS_LABELS: Record<string, string> = {
  planned: "Заплановано",
  draft: "Чернетка",
  published: "Опубліковано",
};

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7; // Mon=0
  const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

  // Fill previous month
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push({ date: date.toISOString().slice(0, 10), day: d, isCurrentMonth: true });
  }
  // Fill to 42 (6 rows)
  while (days.length < 42) {
    const d = new Date(year, month + 1, days.length - startWeekday - lastDay.getDate() + 1);
    days.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), isCurrentMonth: false });
  }
  return days;
}

const MONTH_NAMES = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export default function ContentCalendarAdmin() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [posts, setPosts] = useState<PlannedPost[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [newPost, setNewPost] = useState({ title: "", type: "news" as PlannedPost["type"], assignee: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPosts(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (updated: PlannedPost[]) => {
    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const days = useMemo(() => getMonthDays(year, month), [year, month]);
  const today = now.toISOString().slice(0, 10);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (filterType !== "all" && p.type !== filterType) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      return true;
    });
  }, [posts, filterType, filterStatus]);

  const postsByDate = useMemo(() => {
    const map: Record<string, PlannedPost[]> = {};
    filteredPosts.forEach(p => {
      if (!map[p.date]) map[p.date] = [];
      map[p.date].push(p);
    });
    return map;
  }, [filteredPosts]);

  const monthPosts = filteredPosts.filter(p => p.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));

  const handleAddPost = () => {
    if (!newPost.title.trim() || !selectedDate) return;
    const post: PlannedPost = {
      id: crypto.randomUUID(),
      date: selectedDate,
      title: newPost.title,
      type: newPost.type,
      status: "planned",
      assignee: newPost.assignee || undefined,
    };
    save([...posts, post]);
    setNewPost({ title: "", type: "news", assignee: "" });
    setDialogOpen(false);
    toast.success("Пост заплановано");
  };

  const handleDeletePost = (id: string) => {
    save(posts.filter(p => p.id !== id));
    toast.success("Пост видалено");
  };

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Календар публікацій</h1>
          <p className="text-sm text-muted-foreground">{monthPosts.length} постів у {MONTH_NAMES[month].toLowerCase()}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" onClick={() => setSelectedDate(today)}>
              <Plus className="h-4 w-4" /> Додати пост
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Запланувати публікацію</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Дата</Label><Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} /></div>
              <div><Label>Заголовок</Label><Input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="Назва статті..." /></div>
              <div><Label>Тип</Label>
                <Select value={newPost.type} onValueChange={v => setNewPost(p => ({ ...p, type: v as PlannedPost["type"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(TYPE_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Відповідальний</Label><Input value={newPost.assignee} onChange={e => setNewPost(p => ({ ...p, assignee: e.target.value }))} placeholder="Ім'я (необов'язково)" /></div>
              <Button onClick={handleAddPost} className="w-full">Додати</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Тип" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі типи</SelectItem>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Статус" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі статуси</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-lg">{MONTH_NAMES[month]} {year}</CardTitle>
            <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {WEEKDAYS.map(wd => (
              <div key={wd} className="bg-muted px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">{wd}</div>
            ))}
            {days.map((d, i) => {
              const dayPosts = postsByDate[d.date] || [];
              const isToday = d.date === today;
              return (
                <div
                  key={i}
                  className={`bg-card min-h-[80px] p-1.5 cursor-pointer hover:bg-muted/30 transition-colors ${!d.isCurrentMonth ? "opacity-40" : ""} ${isToday ? "ring-2 ring-inset ring-primary/50" : ""}`}
                  onClick={() => { setSelectedDate(d.date); setDialogOpen(true); }}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{d.day}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayPosts.slice(0, 3).map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-1 group"
                        onClick={e => { e.stopPropagation(); handleDeletePost(p.id); }}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${TYPE_CONFIG[p.type]?.color || "bg-muted"}`} />
                        <span className="text-[10px] text-foreground truncate group-hover:line-through">{p.title}</span>
                      </div>
                    ))}
                    {dayPosts.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
          const count = monthPosts.filter(p => p.type === key).length;
          return (
            <Card key={key}>
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${cfg.color}`} />
                <div>
                  <p className="text-sm font-medium">{count}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
