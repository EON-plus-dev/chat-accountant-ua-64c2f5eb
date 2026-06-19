import { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { NEWSLETTER_ISSUES, type NewsletterIssue } from "@/portal/data/newsletter";
import ContentTable from "@/admin/components/ContentTable";
import ContentFilters from "@/admin/components/ContentFilters";
import ContentEditorDrawer from "@/admin/components/ContentEditorDrawer";
import ContentCreatorDialog from "@/admin/components/ContentCreatorDialog";
import { newsletterSchema } from "@/admin/schemas/contentSchemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, Star } from "lucide-react";

const columns: ColumnDef<NewsletterIssue, any>[] = [
  { accessorKey: "issue", header: "#", cell: ({ getValue }) => <span className="font-mono font-semibold text-primary">#{getValue<number>()}</span>, size: 60 },
  { accessorKey: "title", header: "Заголовок", cell: ({ getValue }) => <span className="font-medium text-foreground">{getValue<string>()}</span> },
  { accessorKey: "date", header: "Дата", cell: ({ getValue }) => <span className="text-muted-foreground text-sm">{getValue<string>()}</span> },
  { accessorKey: "subscribersAtTime", header: "Підписники", cell: ({ getValue }) => <Badge variant="secondary">{getValue<number>().toLocaleString("uk-UA")}</Badge> },
  { accessorKey: "highlights", header: "Highlights", cell: ({ getValue }) => <Badge variant="outline">{getValue<string[]>().length} пунктів</Badge> },
  { accessorKey: "articleIds", header: "Статті", cell: ({ getValue }) => <Badge variant="outline">{getValue<string[]>().length} статей</Badge> },
];

export default function NewsletterAdmin() {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<NewsletterIssue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return NEWSLETTER_ISSUES;
    const q = search.toLowerCase();
    return NEWSLETTER_ISSUES.filter((n) => n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q));
  }, [search]);

  const totalSubs = NEWSLETTER_ISSUES.length > 0 ? NEWSLETTER_ISSUES[0].subscribersAtTime : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Розсилки</h1>
          <p className="text-muted-foreground text-sm mt-1">Управління випусками email-розсилки</p>
        </div>
        <ContentCreatorDialog schema={newsletterSchema} title="Додати випуск" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{NEWSLETTER_ISSUES.length}</p><p className="text-xs text-muted-foreground">Випусків</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{totalSubs.toLocaleString("uk-UA")}</p><p className="text-xs text-muted-foreground">Останній тираж</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Star className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{NEWSLETTER_ISSUES.reduce((s, n) => s + n.highlights.length, 0)}</p><p className="text-xs text-muted-foreground">Всього highlights</p></div></CardContent></Card>
      </div>

      <ContentFilters searchValue={search} onSearchChange={setSearch} searchPlaceholder="Пошук за заголовком..."
        filters={[]} filterValues={{}} onFilterChange={() => {}} onClearAll={() => setSearch("")} />

      <ContentTable data={filtered} columns={columns} pageSize={15} globalFilter={search}
        onRowClick={(row) => { setSelectedItem(row); setDrawerOpen(true); }}
      />

      <ContentEditorDrawer open={drawerOpen} onOpenChange={setDrawerOpen} data={selectedItem} schema={newsletterSchema} title="Розсилка" />
    </div>
  );
}
