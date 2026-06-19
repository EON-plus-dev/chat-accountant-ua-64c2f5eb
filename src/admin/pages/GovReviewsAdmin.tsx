import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateReviewStatus, useDeleteReview } from "@/admin/hooks/useGovAdmin";
import { Check, XCircle, Trash2, Star } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

interface ReviewRow {
  id: string;
  rating: number;
  text: string | null;
  status: string;
  visit_date: string | null;
  created_at: string;
  source_label: string;
  source: 'gov' | 'institution';
  user_id: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Очікує" },
  { value: "published", label: "Опубліковано" },
  { value: "rejected", label: "Відхилено" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
};

export default function GovReviewsAdmin() {
  const [tab, setTab] = useState<'gov' | 'institution'>('gov');
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({ status: "all" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(null);

  const { data: govReviews = [], isLoading: loadingGov } = useQuery({
    queryKey: ['gov-reviews', 'admin'],
    queryFn: async () => {
      const { data: reviewData, error } = await supabase.from('gov_reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const branchIds = [...new Set((reviewData || []).map(r => r.branch_id))];
      const { data: branchData } = await supabase.from('gov_branches').select('id, name, city').in('id', branchIds);
      const branchMap = new Map((branchData || []).map(b => [b.id, b]));
      return (reviewData || []).map(r => ({
        id: r.id, rating: r.rating, text: r.text, status: r.status, visit_date: r.visit_date, created_at: r.created_at,
        source: 'gov' as const,
        source_label: `${branchMap.get(r.branch_id)?.name ?? "—"} (${branchMap.get(r.branch_id)?.city ?? ""})`,
        user_id: r.user_id,
      }));
    },
  });

  const { data: instReviews = [], isLoading: loadingInst } = useQuery({
    queryKey: ['institution-reviews-admin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('institution_reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(r => ({
        id: r.id, rating: r.rating, text: r.text, status: r.status, visit_date: r.visit_date, created_at: r.created_at,
        source: 'institution' as const,
        source_label: r.institution_slug,
        user_id: r.user_id,
      }));
    },
  });

  const reviews = tab === 'gov' ? govReviews : instReviews;
  const isLoading = tab === 'gov' ? loadingGov : loadingInst;
  const updateStatus = useUpdateReviewStatus();
  const deleteReview = useDeleteReview();

  const filtered = useMemo(() => {
    return reviews.filter(r => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (search) {
        const q = search.toLowerCase();
        return (r.text?.toLowerCase().includes(q) || r.source_label.toLowerCase().includes(q));
      }
      return true;
    });
  }, [reviews, filters, search]);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const bulkAction = (status: 'published' | 'rejected') => {
    if (selected.size === 0) return;
    updateStatus.mutate({ ids: Array.from(selected), status, table: tab === 'gov' ? 'gov_reviews' : 'institution_reviews' }, { onSuccess: () => setSelected(new Set()) });
  };

  const tableName = tab === 'gov' ? 'gov_reviews' : 'institution_reviews';

  const columns: ColumnDef<ReviewRow, any>[] = [
    { id: "select", header: () => null, enableSorting: false, cell: ({ row }) => (
      <input type="checkbox" checked={selected.has(row.original.id)} onChange={() => toggleSelect(row.original.id)} className="rounded" />
    )},
    { accessorKey: "created_at", header: "Дата", cell: ({ row }) => <span className="text-xs">{format(new Date(row.original.created_at), "dd.MM.yy HH:mm")}</span> },
    { accessorKey: "source_label", header: tab === 'gov' ? "Відділення" : "Установа", cell: ({ row }) => <span className="text-sm font-medium line-clamp-1">{row.original.source_label}</span> },
    { accessorKey: "rating", header: "Рейтинг", cell: ({ row }) => (
      <div className="flex items-center gap-1">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-3 w-3 ${i < row.original.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />)}</div>
    )},
    { accessorKey: "text", header: "Текст", cell: ({ row }) => <span className="text-sm line-clamp-2 max-w-[300px]">{row.original.text || "—"}</span> },
    { accessorKey: "status", header: "Статус", cell: ({ row }) => <Badge className={`text-xs ${STATUS_COLORS[row.original.status]}`}>{STATUS_OPTIONS.find(s => s.value === row.original.status)?.label}</Badge> },
    { id: "actions", header: "", enableSorting: false, cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.status !== "published" && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ ids: [row.original.id], status: "published", table: tableName }); }}><Check className="h-3.5 w-3.5 text-emerald-600" /></Button>
        )}
        {row.original.status !== "rejected" && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ ids: [row.original.id], status: "rejected", table: tableName }); }}><XCircle className="h-3.5 w-3.5 text-red-500" /></Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); if (confirm("Видалити?")) deleteReview.mutate({ id: row.original.id, table: tableName }); }}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Модерація відгуків</h1>
          <p className="text-sm text-muted-foreground">{reviews.length} відгуків</p>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Обрано: {selected.size}</span>
            <Button size="sm" variant="outline" onClick={() => bulkAction("published")}><Check className="h-3.5 w-3.5 mr-1" />Опублікувати</Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction("rejected")}><XCircle className="h-3.5 w-3.5 mr-1" />Відхилити</Button>
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => { setTab(v as 'gov' | 'institution'); setSelected(new Set()); }}>
        <TabsList>
          <TabsTrigger value="gov">Держоргани ({govReviews.length})</TabsTrigger>
          <TabsTrigger value="institution">Установи ({instReviews.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <ContentFilters
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук по тексту..."
        filters={[{ key: "status", label: "Статус", options: STATUS_OPTIONS }]}
        filterValues={filters}
        onFilterChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClearAll={() => { setSearch(""); setFilters({ status: "all" }); }}
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Завантаження...</p> : (
        <ContentTable data={filtered} columns={columns} globalFilter={search} onRowClick={(row: ReviewRow) => setSelectedReview(row)} />
      )}

      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Деталі відгуку</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">{tab === 'gov' ? 'Відділення' : 'Установа'}</p>
                <p className="text-sm font-medium">{selectedReview.source_label}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Автор (ID)</p>
                <p className="text-sm font-mono text-muted-foreground">{selectedReview.user_id.slice(0, 8)}…</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Рейтинг</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < selectedReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              {selectedReview.text && (
                <div>
                  <p className="text-xs text-muted-foreground">Текст</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedReview.text}</p>
                </div>
              )}
              <div className="flex gap-4">
                {selectedReview.visit_date && (
                  <div>
                    <p className="text-xs text-muted-foreground">Дата візиту</p>
                    <p className="text-sm">{format(new Date(selectedReview.visit_date), "dd.MM.yyyy")}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Створено</p>
                  <p className="text-sm">{format(new Date(selectedReview.created_at), "dd.MM.yyyy HH:mm")}</p>
                </div>
              </div>
              <div>
                <Badge className={`text-xs ${STATUS_COLORS[selectedReview.status]}`}>
                  {STATUS_OPTIONS.find(s => s.value === selectedReview.status)?.label}
                </Badge>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                {selectedReview.status !== "published" && (
                  <Button size="sm" onClick={() => { updateStatus.mutate({ ids: [selectedReview.id], status: "published", table: tableName }, { onSuccess: () => setSelectedReview(null) }); }}>
                    <Check className="h-3.5 w-3.5 mr-1" />Опублікувати
                  </Button>
                )}
                {selectedReview.status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => { updateStatus.mutate({ ids: [selectedReview.id], status: "rejected", table: tableName }, { onSuccess: () => setSelectedReview(null) }); }}>
                    <XCircle className="h-3.5 w-3.5 mr-1" />Відхилити
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => { if (confirm("Видалити?")) deleteReview.mutate({ id: selectedReview.id, table: tableName }, { onSuccess: () => setSelectedReview(null) }); }}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />Видалити
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
