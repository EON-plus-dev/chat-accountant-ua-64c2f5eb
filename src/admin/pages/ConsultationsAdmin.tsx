import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters, { type FilterConfig } from "@/admin/components/ContentFilters";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { consultationSchema } from "@/admin/schemas/contentSchemas";
import { mockConsultations, type MockConsultation } from "@/config/consultationMockData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, Eye, FileText, TrendingUp, LayoutTemplate, Loader2, Database,
} from "lucide-react";

const AUDIENCE_MAP: Record<string, string> = { business: "Бізнес", individual: "Фізособи" };

interface DbConsultation {
  id: string;
  question: string;
  answer: string;
  audience: string;
  tags: string[] | null;
  slug: string;
  status: string;
  views_count: number;
  created_at: string;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export default function ConsultationsAdmin() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"editorial" | "db">("editorial");

  // DB consultations
  const { data: dbConsultations = [], isLoading: dbLoading } = useQuery({
    queryKey: ["consultations-admin-db"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DbConsultation[];
    },
  });

  // Editorial consultations from mock data (same source as portal)
  const editorialConsultations = useMemo(() => mockConsultations, []);

  // Filter editorial
  const filteredEditorial = useMemo(() => {
    let result = editorialConsultations;
    if (filters.audience && filters.audience !== "all") result = result.filter((c) => c.audience === filters.audience);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.question.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [editorialConsultations, filters, search]);

  // Filter DB
  const filteredDb = useMemo(() => {
    let result = dbConsultations;
    if (filters.audience && filters.audience !== "all") result = result.filter((c) => c.audience === filters.audience);
    if (filters.status && filters.status !== "all") result = result.filter((c) => c.status === filters.status);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.question.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [dbConsultations, filters, search]);

  // Stats
  const editorialStats = useMemo(() => {
    const business = editorialConsultations.filter((c) => c.audience === "business").length;
    const hub = editorialConsultations.filter((c) => c.layout === "hub").length;
    return { total: editorialConsultations.length, business, individual: editorialConsultations.length - business, hub };
  }, [editorialConsultations]);

  const dbStats = useMemo(() => {
    const published = dbConsultations.filter((c) => c.status === "published").length;
    const draft = dbConsultations.filter((c) => c.status === "draft").length;
    const totalViews = dbConsultations.reduce((s, c) => s + c.views_count, 0);
    return { total: dbConsultations.length, published, draft, totalViews };
  }, [dbConsultations]);

  const filterConfigs: FilterConfig[] = tab === "editorial"
    ? [{ key: "audience", label: "Аудиторія", options: [{ value: "business", label: "Бізнес" }, { value: "individual", label: "Фізособи" }] }]
    : [
      { key: "audience", label: "Аудиторія", options: [{ value: "business", label: "Бізнес" }, { value: "individual", label: "Фізособи" }] },
      { key: "status", label: "Статус", options: [{ value: "published", label: "Опубліковано" }, { value: "draft", label: "Чернетка" }] },
    ];

  const editorialColumns: ColumnDef<MockConsultation, any>[] = [
    {
      accessorKey: "question", header: "Питання",
      cell: ({ row }) => (
        <div className="max-w-[350px]">
          <p className="font-medium text-sm truncate">{row.original.question}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "audience", header: "Аудиторія",
      cell: ({ row }) => <span className="text-sm">{AUDIENCE_MAP[row.original.audience] || row.original.audience}</span>,
    },
    {
      accessorKey: "layout", header: "Лейаут",
      cell: ({ row }) => (
        <Badge variant={row.original.layout === "hub" ? "default" : "secondary"}>
          {row.original.layout === "hub" ? "Hub" : "Standard"}
        </Badge>
      ),
    },
    {
      accessorKey: "tags", header: "Теги",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(row.original.tags || []).slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
          ))}
          {(row.original.tags || []).length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{row.original.tags!.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "date", header: "Дата",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.date}</span>,
    },
  ];

  const dbColumns: ColumnDef<DbConsultation, any>[] = [
    {
      accessorKey: "question", header: "Питання",
      cell: ({ row }) => (
        <div className="max-w-[350px]">
          <p className="font-medium text-sm truncate">{row.original.question}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "audience", header: "Аудиторія",
      cell: ({ row }) => <span className="text-sm">{AUDIENCE_MAP[row.original.audience] || row.original.audience}</span>,
    },
    {
      accessorKey: "status", header: "Статус",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
          {row.original.status === "published" ? "Опубліковано" : "Чернетка"}
        </Badge>
      ),
    },
    {
      accessorKey: "tags", header: "Теги",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(row.original.tags || []).slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
          ))}
          {(row.original.tags || []).length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{row.original.tags!.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "created_at", header: "Дата",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.created_at).toLocaleDateString("uk-UA")}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Консультації</h1>
          <p className="text-muted-foreground mt-1">
            Редакційні: {editorialStats.total} · БД: {dbStats.total}
          </p>
        </div>
        <ContentCreatorDialog schema={consultationSchema} title="Додати консультацію" />
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setFilters({}); setSearch(""); }}>
        <TabsList>
          <TabsTrigger value="editorial" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Редакційні ({editorialStats.total})
          </TabsTrigger>
          <TabsTrigger value="db" className="gap-1.5">
            <Database className="h-3.5 w-3.5" />
            База даних ({dbStats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editorial" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Всього", value: editorialStats.total, icon: MessageSquare, color: "text-primary" },
              { label: "Бізнес", value: editorialStats.business, icon: TrendingUp, color: "text-emerald-600" },
              { label: "Фізособи", value: editorialStats.individual, icon: Eye, color: "text-blue-600" },
              { label: "Hub-статті", value: editorialStats.hub, icon: LayoutTemplate, color: "text-purple-600" },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-lg font-bold">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <ContentFilters
            searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук за питанням, slug, тегами..."
            filters={filterConfigs} filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onClearAll={() => { setSearch(""); setFilters({}); }}
          />
          <ContentTable
            data={filteredEditorial} columns={editorialColumns} pageSize={20} globalFilter={search}
            onRowClick={(row) => navigate(`/admin/content/consultation/${row.slug}`)}
          />
        </TabsContent>

        <TabsContent value="db" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Всього", value: dbStats.total, icon: MessageSquare, color: "text-primary" },
              { label: "Опубліковано", value: dbStats.published, icon: LayoutTemplate, color: "text-purple-600" },
              { label: "Чернетки", value: dbStats.draft, icon: FileText, color: "text-sky-600" },
              { label: "Переглядів", value: dbStats.totalViews, icon: Eye, color: "text-blue-600" },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-lg font-bold">{kpi.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <ContentFilters
            searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук за питанням, slug, тегами..."
            filters={filterConfigs} filterValues={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onClearAll={() => { setSearch(""); setFilters({}); }}
          />
          {dbLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ContentTable
              data={filteredDb} columns={dbColumns} pageSize={20} globalFilter={search}
              onRowClick={(row) => navigate(`/admin/content/consultation/${row.slug}`)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
