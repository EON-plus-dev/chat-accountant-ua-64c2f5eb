import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ARTICLES } from "@/portal/data/articles";
import { TOOLS } from "@/portal/data/tools";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { LAWS } from "@/portal/data/laws";
import { DEADLINES } from "@/portal/data/deadlines";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  FileText, Wrench, BookOpen, Scale, Calendar,
  TrendingUp, Eye, Star, Layers,
} from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(210, 70%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(45, 90%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(180, 50%, 45%)",
];

export default function ContentAnalytics() {
  const inventory = useMemo(() => [
    { name: "Статті", count: ARTICLES.length, icon: FileText, color: "text-blue-600" },
    { name: "Інструменти", count: TOOLS.length, icon: Wrench, color: "text-emerald-600" },
    { name: "Словник", count: KNOWLEDGE.length, icon: BookOpen, color: "text-amber-600" },
    { name: "Закони", count: LAWS.length, icon: Scale, color: "text-red-600" },
    { name: "Події", count: DEADLINES.length, icon: Calendar, color: "text-cyan-600" },
  ], []);

  const totalContent = inventory.reduce((s, i) => s + i.count, 0);

  // Articles by type
  const articlesByType = useMemo(() => {
    const map = new Map<string, number>();
    ARTICLES.forEach((a) => map.set(a.type, (map.get(a.type) || 0) + 1));
    const labels: Record<string, string> = {
      news: "Новини", guide: "Гайди", analysis: "Аналітика",
      dps: "ДПС", change: "Зміни", podcast: "Подкасти", video: "Відео",
    };
    return Array.from(map.entries())
      .map(([key, value]) => ({ name: labels[key] || key, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Articles by category
  const articlesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    ARTICLES.forEach((a) => {
      const cat = a.categoryLabel || a.category || "Без категорії";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Articles by audience
  const articlesByAudience = useMemo(() => {
    const map = new Map<string, number>();
    ARTICLES.forEach((a) => map.set(a.audience || "both", (map.get(a.audience || "both") || 0) + 1));
    const labels: Record<string, string> = { business: "Бізнес", personal: "Фізособи", both: "Всі" };
    return Array.from(map.entries())
      .map(([key, value]) => ({ name: labels[key] || key, value }));
  }, []);

  // Top articles by views
  const topArticles = useMemo(() =>
    [...ARTICLES]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8)
      .map((a) => ({ name: a.title.slice(0, 35) + (a.title.length > 35 ? "…" : ""), views: a.views || 0 })),
  []);

  // Tools by category
  const toolsByCategory = useMemo(() => {
    const map = new Map<string, number>();
    TOOLS.forEach((t) => map.set(t.category, (map.get(t.category) || 0) + 1));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Coverage radar
  const coverageData = useMemo(() => [
    { subject: "Статті", A: Math.round((ARTICLES.length / 50) * 100) },
    { subject: "Інструменти", A: Math.round((TOOLS.length / 20) * 100) },
    { subject: "Словник", A: Math.round((KNOWLEDGE.length / 30) * 100) },
    { subject: "Закони", A: Math.round((LAWS.length / 10) * 100) },
    { subject: "Події", A: Math.round((DEADLINES.length / 25) * 100) },
  ], []);

  // Content quality metrics
  const qualityMetrics = useMemo(() => {
    const withImages = ARTICLES.filter((a) => a.mediaUrl).length;
    const withTags = ARTICLES.filter((a) => a.tags && a.tags.length > 0).length;
    const featured = ARTICLES.filter((a) => a.isFeatured).length;
    const premium = TOOLS.filter((t) => t.isPremium).length;
    return { withImages, withTags, featured, premiumTools: premium };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Аналітика контенту</h1>
        <p className="text-muted-foreground mt-1">Розподіл, покриття та якість контенту порталу</p>
      </div>

      {/* Inventory KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="col-span-1">
          <CardContent className="p-4 text-center">
            <Layers className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{totalContent}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Всього</p>
          </CardContent>
        </Card>
        {inventory.map((item) => (
          <Card key={item.name}>
            <CardContent className="p-4 text-center">
              <item.icon className={`w-5 h-5 mx-auto mb-1 ${item.color}`} />
              <p className="text-2xl font-bold">{item.count}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quality badges */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="gap-1.5 py-1.5">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          {qualityMetrics.featured} featured статей
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5">
          📷 {qualityMetrics.withImages}/{ARTICLES.length} з зображеннями
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5">
          🏷️ {qualityMetrics.withTags}/{ARTICLES.length} з тегами
        </Badge>
        <Badge variant="outline" className="gap-1.5 py-1.5">
          👑 {qualityMetrics.premiumTools} premium інструментів
        </Badge>
      </div>

      {/* Charts grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Articles by type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Статті за типом</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={articlesByType} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value">
                  {articlesByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Articles by audience */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Статті за аудиторією</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={articlesByAudience} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={3} dataKey="value">
                  {articlesByAudience.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top articles */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" /> Топ-8 статей за переглядами
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topArticles} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={200} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Перегляди" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Coverage radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Покриття контенту</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={coverageData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} className="fill-muted-foreground" />
                <Radar name="Покриття %" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tools by category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Інструменти за категоріями</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={toolsByCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(210, 70%, 55%)" radius={[4, 4, 0, 0]} name="Кількість" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Articles by category */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Статті за категорією
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={articlesByCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(280, 60%, 55%)" radius={[4, 4, 0, 0]} name="Статей" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
