import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, Plug, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CompetitorRow {
  domain: string;
  traffic_share?: number;
  top_keyword?: string;
  gap_keywords?: number;
}

// Mock-плейсхолдер, поки немає підключення до Semrush
const MOCK_ROWS = (domains: string[]): CompetitorRow[] =>
  domains.map((d, i) => ({
    domain: d,
    traffic_share: Math.round((25 - i * 3.5) * 10) / 10,
    top_keyword: ["податок ФОП 3 група", "як зареєструвати ФОП", "ставки ЄСВ 2026", "декларація фізособи"][i % 4],
    gap_keywords: 120 + i * 35,
  }));

export default function CmsCompetitorsPanel() {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("cms_settings")
      .select("value")
      .eq("key", "competitor_domains")
      .maybeSingle();
    const v = (data?.value as { domains?: string[] } | null)?.domains ?? [];
    setDomains(Array.isArray(v) ? v : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const persist = async (next: string[]) => {
    setSaving(true);
    const { error } = await supabase
      .from("cms_settings")
      .upsert(
        [{ key: "competitor_domains", value: { domains: next } as never, scope: "global" }],
        { onConflict: "key" },
      );
    setSaving(false);
    if (error) {
      toast.error("Не вдалось зберегти: " + error.message);
      return;
    }
    setDomains(next);
  };

  const add = async () => {
    const d = newDomain.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (!d) return;
    if (domains.includes(d)) {
      toast.info("Цей домен уже додано");
      return;
    }
    await persist([...domains, d]);
    setNewDomain("");
  };

  const remove = async (d: string) => {
    await persist(domains.filter((x) => x !== d));
  };

  const rows = useMemo(() => MOCK_ROWS(domains), [domains]);
  const ownShare = useMemo(() => {
    const total = rows.reduce((s, r) => s + (r.traffic_share ?? 0), 0);
    return Math.max(0, Math.round((100 - total) * 10) / 10);
  }, [rows]);
  const totalGap = rows.reduce((s, r) => s + (r.gap_keywords ?? 0), 0);

  const createIdea = async (row: CompetitorRow) => {
    if (!row.top_keyword) return;
    const { error } = await supabase.from("content_ideas").insert({
      page_path: "/",
      title: `[Gap] ${row.top_keyword}`,
      description: `Конкурент ${row.domain} ранжується за «${row.top_keyword}». Створити статтю.`,
      content_target: "article",
      audience: "business",
      priority: 3,
      status: "todo",
      source: "seo_gap",
      source_ref: row.domain,
    } as never);
    if (error) toast.error("Помилка створення ідеї: " + error.message);
    else toast.success("Ідею додано до плану");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Конкуренти / ринок
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Позиціонування проти конкурентів, gap-keywords та пропозиції для нового контенту.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-[11px]">
          <Plug className="h-3 w-3" /> Semrush — не підключено
        </Badge>
      </header>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ваша частка трафіку</p>
            <p className="text-2xl font-bold tabular-nums">{ownShare}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Gap-keywords (всього)</p>
            <p className="text-2xl font-bold tabular-nums">{totalGap.toLocaleString("uk-UA")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Конкурентів відстежується</p>
            <p className="text-2xl font-bold tabular-nums">{domains.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Domains manager */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Домени конкурентів</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="наприклад: dtkt.com.ua"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add();
              }}
              className="max-w-sm"
            />
            <Button size="sm" onClick={add} disabled={!newDomain.trim() || saving} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Додати
            </Button>
          </div>
          {domains.length === 0 ? (
            <p className="text-xs text-muted-foreground">Поки не додано жодного домену.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {domains.map((d) => (
                <Badge key={d} variant="secondary" className="gap-1 pr-1 text-xs">
                  {d}
                  <button
                    onClick={() => remove(d)}
                    className="ml-0.5 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                    aria-label={`Видалити ${d}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top pages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            Топ-сторінки конкурентів
            <Badge variant="outline" className="text-[10px]">демо-дані</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="px-4 py-6 text-xs text-muted-foreground">Додайте принаймні один домен, щоб побачити порівняння.</p>
          ) : (
            <div className="divide-y">
              {rows.map((r) => (
                <div key={r.domain} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.domain}</p>
                    <p className="text-xs text-muted-foreground truncate">Топ-кейворд: {r.top_keyword ?? "—"}</p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">{r.traffic_share}%</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{r.gap_keywords} gap</span>
                  <Button size="sm" variant="ghost" className="gap-1 h-7" onClick={() => createIdea(r)}>
                    <Sparkles className="h-3 w-3" /> Ідея
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground text-center">
        Підключіть Semrush у Connectors, щоб замінити демо-дані реальними метриками ринку.
      </p>
    </div>
  );
}
