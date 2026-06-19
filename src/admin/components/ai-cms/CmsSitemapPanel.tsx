import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  FileText,
  Lightbulb,
  Sparkles,
  ChevronRight,
  ChevronDown,
  List,
  Network,
  Folder,
  MessageSquare,
  ExternalLink,
  Cog,
} from "lucide-react";
import { SYSTEM_PAGES, type SystemPage } from "./systemPages";
import { ARTICLES } from "@/portal/data/articles";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { LAWS } from "@/portal/data/laws";
import { GRANTS } from "@/portal/data/grants";
import { PENALTIES } from "@/portal/data/penalties";
import { LICENSES } from "@/portal/data/licenses";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { TEMPLATES } from "@/portal/data/templates";
import { REGISTERS } from "@/portal/data/registers";
import { RATE_TABLES } from "@/portal/data/rates";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { RANKINGS } from "@/portal/data/rankings";
import { NEWSLETTER_ISSUES } from "@/portal/data/newsletter";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { COURSES, WEBINARS } from "@/portal/data/learn";
import { COMPARISONS } from "@/portal/data/comparisons";
import { DEADLINES } from "@/portal/data/deadlines";
import { POPULAR_QUESTIONS } from "@/portal/data/popularQuestions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Лічильники колекцій, що живуть у статичних файлах src/portal/data/*.ts.
// Ключі мають збігатися з SystemPage.staticCollection.
const STATIC_COLLECTION_COUNTS: Record<string, number> = {
  knowledge: KNOWLEDGE.length,
  kved: KVED_ENTRIES.length,
  laws: LAWS.length,
  grants: GRANTS.length,
  penalties: PENALTIES.length,
  licenses: LICENSES.length,
  accountants: ACCOUNTANTS.length,
  templates: TEMPLATES.length,
  registers: REGISTERS.length,
  rates: RATE_TABLES.length,
  businessForms: BUSINESS_FORMS.length,
  rankings: RANKINGS.length,
  newsletter: NEWSLETTER_ISSUES.length,
  institutionProfiles: INSTITUTION_PROFILES.length,
  courses: COURSES.length,
  webinars: WEBINARS.length,
  comparisons: Object.keys(COMPARISONS).length,
  deadlines: DEADLINES.length,
  questions: POPULAR_QUESTIONS.length,
};

interface CmsSitemapPanelProps {
  onOpenIdeas: (path: string) => void;
}

interface PageRow {
  path: string;
  title: string;
  category: string;
  contentTarget: SystemPage["contentTarget"] | "article-leaf";
  trafficWeight?: number;
  source: "system" | "article-cms" | "article-aiq" | "article-static" | "orphan";
  collectionTable?: string;
  staticCollection?: string;
  adminUrl?: string;
  articleType?: string;
}

interface TreeNode {
  key: string;
  label: string;
  row?: PageRow;
  children: TreeNode[];
  isGroup?: boolean;
  badge?: string;
  hint?: string;
}

interface NodeRollup {
  todo: number;
  ready: number;
  highPriority: boolean;
  noContentLeaves: number; // листки з contentTarget="article" і 0 ідей
}

type ViewMode = "tree" | "list";
type FilterMode = "all" | "with-todo" | "ready" | "no-content";

const CATEGORY_ORDER = [
  "Лендинг",
  "Дашборд",
  "Хаб",
  "Аналітика",
  "Публікації",
  "Навчання",
  "Інструмент",
  "Каталог",
  "Довідник",
  "Опубліковані статті",
  "Без прив'язки до сторінки",
];

function buildPathSubtree(rows: PageRow[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  rows
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path))
    .forEach((r) => {
      map.set(r.path, { key: r.path, label: r.title, row: r, children: [] });
    });

  const roots: TreeNode[] = [];
  map.forEach((node, path) => {
    const segments = path.split("/").filter(Boolean);
    let parent: TreeNode | undefined;
    for (let i = segments.length - 1; i >= 1; i--) {
      const parentPath = "/" + segments.slice(0, i).join("/");
      if (map.has(parentPath)) {
        parent = map.get(parentPath);
        break;
      }
    }
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function buildTree(
  rows: PageRow[],
  collectionCounts: Record<string, number>,
  uncoveredQueries: number,
): TreeNode[] {
  const systemRows = rows.filter((r) => r.source === "system");
  const cmsRows = rows.filter((r) => r.source === "article-cms");
  const aiqRows = rows.filter((r) => r.source === "article-aiq");
  const staticRows = rows.filter((r) => r.source === "article-static");
  const orphanRows = rows.filter((r) => r.source === "orphan");

  // Системні: групування за категорією → під-дерево за path
  const byCategory: Record<string, PageRow[]> = {};
  systemRows.forEach((r) => {
    (byCategory[r.category] = byCategory[r.category] ?? []).push(r);
  });

  const categoryKeys = Object.keys(byCategory).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const roots: TreeNode[] = categoryKeys.map((cat) => {
    const subtree = buildPathSubtree(byCategory[cat]);
    const enrich = (n: TreeNode) => {
      if (n.row?.collectionTable) {
        const count = collectionCounts[n.row.collectionTable];
        if (count !== undefined && count > 0) {
          n.children.push({
            key: `${n.row.path}__collection`,
            label: `Записи в колекції · ${count.toLocaleString("uk-UA")}`,
            isGroup: true,
            children: [],
            badge: "Supabase",
          });
        }
      }
      if (n.row?.staticCollection) {
        const count = STATIC_COLLECTION_COUNTS[n.row.staticCollection];
        if (count !== undefined && count > 0) {
          n.children.push({
            key: `${n.row.path}__static`,
            label: `Записи в колекції · ${count.toLocaleString("uk-UA")}`,
            isGroup: true,
            children: [],
            badge: "у коді",
            hint: n.row.adminUrl ? `Адмінка: ${n.row.adminUrl}` : undefined,
          });
        }
      }
      n.children.forEach(enrich);
    };
    subtree.forEach(enrich);

    const hint =
      (cat === "Хаб" || cat === "Інструмент") && uncoveredQueries > 0
        ? `${uncoveredQueries} нових запитів з чату — згенеруйте ідеї`
        : undefined;

    return {
      key: `__cat__${cat}`,
      label: cat,
      isGroup: true,
      badge: `${byCategory[cat].length}`,
      children: subtree,
      hint,
    };
  });

  // Опубліковані статті — об'єднане дерево з 3 підгруп
  const articleChildren: TreeNode[] = [];
  if (cmsRows.length > 0) {
    articleChildren.push({
      key: "__articles__cms",
      label: "CMS (опубліковано)",
      isGroup: true,
      badge: `${cmsRows.length}`,
      children: cmsRows.map((r) => ({ key: r.path, label: r.title, row: r, children: [] })),
    });
  }
  if (aiqRows.length > 0) {
    articleChildren.push({
      key: "__articles__aiq",
      label: "AI-консультації",
      isGroup: true,
      badge: `${aiqRows.length}`,
      children: aiqRows.map((r) => ({ key: r.path, label: r.title, row: r, children: [] })),
    });
  }
  if (staticRows.length > 0) {
    const TYPE_LABELS: Record<string, string> = {
      news: "Новини",
      guide: "Гайди",
      analysis: "Огляди / Аналітика",
      change: "Зміни",
      podcast: "Подкасти",
      video: "Відео",
      review: "Відгуки",
      dps: "ДПС",
    };
    const byType = new Map<string, PageRow[]>();
    staticRows.forEach((r) => {
      const t = r.articleType || "other";
      if (!byType.has(t)) byType.set(t, []);
      byType.get(t)!.push(r);
    });
    const subgroups: TreeNode[] = Array.from(byType.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([t, rs]) => ({
        key: `__articles__static__${t}`,
        label: TYPE_LABELS[t] ?? t,
        isGroup: true,
        badge: `${rs.length}`,
        children: rs.map((r) => ({ key: r.path, label: r.title, row: r, children: [] })),
      }));
    articleChildren.push({
      key: "__articles__static",
      label: "Гайди (з коду)",
      isGroup: true,
      badge: `${staticRows.length}`,
      children: subgroups,
    });
  }
  if (articleChildren.length > 0) {
    roots.push({
      key: "__articles__",
      label: "Опубліковані статті",
      isGroup: true,
      badge: `${cmsRows.length + aiqRows.length + staticRows.length}`,
      children: articleChildren,
    });
  }

  // Orphan-ідеї — окрема гілка
  if (orphanRows.length > 0) {
    roots.push({
      key: "__orphans__",
      label: "Без прив'язки до сторінки",
      isGroup: true,
      badge: `${orphanRows.length}`,
      hint: "Ідеї з page_path, якого немає в системних маршрутах",
      children: orphanRows.map((r) => ({ key: r.path, label: r.title, row: r, children: [] })),
    });
  }

  return roots;
}

function computeRollups(
  nodes: TreeNode[],
  counts: Record<string, { todo: number; ready: number }>,
  highPriPaths: Set<string>,
): Map<string, NodeRollup> {
  const out = new Map<string, NodeRollup>();
  const walk = (n: TreeNode): NodeRollup => {
    const own = n.row ? counts[n.row.path] ?? { todo: 0, ready: 0 } : { todo: 0, ready: 0 };
    let acc: NodeRollup = {
      todo: own.todo,
      ready: own.ready,
      highPriority: n.row ? highPriPaths.has(n.row.path) : false,
      noContentLeaves:
        n.children.length === 0 &&
        n.row?.contentTarget === "article" &&
        own.todo + own.ready === 0
          ? 1
          : 0,
    };
    for (const c of n.children) {
      const r = walk(c);
      acc.todo += r.todo;
      acc.ready += r.ready;
      acc.highPriority = acc.highPriority || r.highPriority;
      acc.noContentLeaves += r.noContentLeaves;
    }
    out.set(n.key, acc);
    return acc;
  };
  nodes.forEach(walk);
  return out;
}

function filterTree(nodes: TreeNode[], q: string): TreeNode[] {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  const walk = (n: TreeNode): TreeNode | null => {
    const selfMatch =
      n.label.toLowerCase().includes(lower) || (n.row?.path.toLowerCase().includes(lower) ?? false);
    const children = n.children.map(walk).filter((x): x is TreeNode => x !== null);
    if (selfMatch || children.length > 0) return { ...n, children };
    return null;
  };
  return nodes.map(walk).filter((x): x is TreeNode => x !== null);
}

function filterByRollup(
  nodes: TreeNode[],
  rollups: Map<string, NodeRollup>,
  predicate: (r: NodeRollup, n: TreeNode) => boolean,
): TreeNode[] {
  const walk = (n: TreeNode): TreeNode | null => {
    const r = rollups.get(n.key);
    const selfOk = r ? predicate(r, n) : false;
    const children = n.children.map(walk).filter((x): x is TreeNode => x !== null);
    if (selfOk || children.length > 0) return { ...n, children };
    return null;
  };
  return nodes.map(walk).filter((x): x is TreeNode => x !== null);
}

function collectAllKeys(nodes: TreeNode[]): string[] {
  const out: string[] = [];
  const walk = (n: TreeNode) => {
    if (n.children.length > 0) out.push(n.key);
    n.children.forEach(walk);
  };
  nodes.forEach(walk);
  return out;
}

interface TreeRowProps {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  toggle: (k: string) => void;
  counts: Record<string, { todo: number; ready: number }>;
  rollups: Map<string, NodeRollup>;
  onOpenIdeas: (path: string) => void;
  onGenerate: (path: string) => void;
}

function TreeRow({
  node,
  depth,
  expanded,
  toggle,
  counts,
  rollups,
  onOpenIdeas,
  onGenerate,
}: TreeRowProps) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.key);
  const own = node.row ? counts[node.row.path] ?? { todo: 0, ready: 0 } : { todo: 0, ready: 0 };
  const rollup = rollups.get(node.key);
  const noContent = node.row?.contentTarget === "none";

  // Для груп показуємо rollup, для листків — власні counts
  const showTodo = node.isGroup ? (rollup?.todo ?? 0) : own.todo;
  const showReady = node.isGroup ? (rollup?.ready ?? 0) : own.ready;

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-1.5 px-2 py-1.5 text-sm hover:bg-muted/50 cursor-pointer border-b border-border/40",
          node.isGroup && "font-medium text-muted-foreground bg-muted/20",
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => {
          if (hasChildren) toggle(node.key);
          else if (node.row) onOpenIdeas(node.row.path);
        }}
      >
        <span className="w-4 shrink-0 flex items-center justify-center">
          {hasChildren ? (
            isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : null}
        </span>
        {node.isGroup ? (
          <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        {rollup?.highPriority && (
          <span
            className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"
            title="Є ідеї високого пріоритету"
          />
        )}
        <span className="truncate flex-1 min-w-0">{node.label}</span>

        {node.row && (
          <span className="text-[11px] text-muted-foreground font-mono truncate hidden md:inline max-w-[180px]">
            {node.row.path}
          </span>
        )}

        {/* Rollup-бейджі: для груп — підсумок гілки; для листків — власні */}
        {showTodo > 0 && (
          <Badge
            variant={node.isGroup ? "outline" : "default"}
            className="h-4 text-[10px] gap-0.5 shrink-0"
          >
            <Lightbulb className="h-2.5 w-2.5" />
            {showTodo}
          </Badge>
        )}
        {showReady > 0 && (
          <Badge variant="secondary" className="h-4 text-[10px] gap-0.5 shrink-0">
            <FileText className="h-2.5 w-2.5" />
            {showReady}
          </Badge>
        )}

        {node.row?.trafficWeight !== undefined && (
          <span className="hidden md:inline text-[10px] text-muted-foreground tabular-nums shrink-0 w-8 text-right">
            {Math.round(node.row.trafficWeight * 100)}%
          </span>
        )}

        {noContent && (
          <Badge variant="outline" className="text-[10px] h-4 shrink-0">read-only</Badge>
        )}

        {node.isGroup && node.hint && (
          <span
            className="hidden lg:inline text-[10px] text-amber-600 dark:text-amber-400 truncate max-w-[260px]"
            title={node.hint}
          >
            <MessageSquare className="inline h-3 w-3 mr-1" />
            {node.hint}
          </span>
        )}

        {node.isGroup && (
          <Badge variant="outline" className="text-[10px] h-4 shrink-0">
            {node.badge ?? node.children.length}
          </Badge>
        )}

        {/* Inline-дії на ховері для листків */}
        {node.row && !node.isGroup && (
          <span className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              title="Згенерувати ідеї"
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(node.row!.path);
              }}
            >
              <Sparkles className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              title="Відкрити preview"
              onClick={(e) => {
                e.stopPropagation();
                window.open(node.row!.path, "_blank");
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
            {node.row.adminUrl && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                title={`Відкрити в адмінці: ${node.row.adminUrl}`}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(node.row!.adminUrl!, "_blank");
                }}
              >
                <Cog className="h-3 w-3" />
              </Button>
            )}
          </span>
        )}
      </div>
      {hasChildren && isOpen &&
        node.children.map((child) => (
          <TreeRow
            key={child.key}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            toggle={toggle}
            counts={counts}
            rollups={rollups}
            onOpenIdeas={onOpenIdeas}
            onGenerate={onGenerate}
          />
        ))}
    </>
  );
}

export default function CmsSitemapPanel({ onOpenIdeas }: CmsSitemapPanelProps) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<ViewMode>("tree");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [counts, setCounts] = useState<Record<string, { todo: number; ready: number }>>({});
  const [highPriPaths, setHighPriPaths] = useState<Set<string>>(new Set());
  const [allIdeaPaths, setAllIdeaPaths] = useState<string[]>([]);
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({});
  const [publishedCms, setPublishedCms] = useState<Array<{ slug: string; title: string }>>([]);
  const [publishedAiq, setPublishedAiq] = useState<Array<{ slug: string; title: string }>>([]);
  const [uncoveredQueries, setUncoveredQueries] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState<string | null>(null);

  // Content ideas: counts per page + high priority + all paths
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("content_ideas")
        .select("page_path,status,priority");
      const map: Record<string, { todo: number; ready: number }> = {};
      const high = new Set<string>();
      const paths: string[] = [];
      (data ?? []).forEach((r: { page_path: string; status: string; priority: number }) => {
        const k = r.page_path;
        if (!map[k]) map[k] = { todo: 0, ready: 0 };
        if (r.status === "todo" || r.status === "generating") map[k].todo++;
        if (r.status === "generated" || r.status === "published") map[k].ready++;
        if ((r.priority ?? 0) >= 4) high.add(k);
        paths.push(k);
      });
      setCounts(map);
      setHighPriPaths(high);
      setAllIdeaPaths(Array.from(new Set(paths)));
    })();
  }, []);

  // Collection counts (best-effort)
  useEffect(() => {
    const tables = Array.from(
      new Set(SYSTEM_PAGES.map((p) => p.collectionTable).filter((t): t is string => !!t)),
    );
    (async () => {
      const out: Record<string, number> = {};
      await Promise.allSettled(
        tables.map(async (t) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const client = supabase as any;
            const { count, error } = await client
              .from(t)
              .select("*", { count: "exact", head: true });
            if (!error && typeof count === "number") out[t] = count;
          } catch {
            // ignore
          }
        }),
      );
      setCollectionCounts(out);
    })();
  }, []);

  // Реальні опубліковані статті (CMS + AI-консультації) + uncovered queries
  useEffect(() => {
    (async () => {
      const [cmsRes, aiqPubRes, aiqUncoveredRes] = await Promise.allSettled([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("articles")
          .select("slug,seo_title,title")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(300),
        supabase
          .from("ai_chat_queries")
          .select("slug,question")
          .eq("status", "published")
          .not("slug", "is", null)
          .order("published_at", { ascending: false })
          .limit(300),
        supabase
          .from("ai_chat_queries")
          .select("id", { count: "exact", head: true })
          .neq("status", "published"),
      ]);

      if (cmsRes.status === "fulfilled" && !cmsRes.value.error) {
        const rows = (cmsRes.value.data ?? []) as Array<{
          slug: string;
          seo_title?: string | null;
          title?: string | null;
        }>;
        setPublishedCms(
          rows
            .filter((r) => r.slug)
            .map((r) => ({ slug: r.slug, title: r.seo_title || r.title || r.slug })),
        );
      }
      if (aiqPubRes.status === "fulfilled" && !aiqPubRes.value.error) {
        const rows = (aiqPubRes.value.data ?? []) as Array<{ slug: string; question: string }>;
        setPublishedAiq(
          rows.filter((r) => r.slug).map((r) => ({ slug: r.slug, title: r.question })),
        );
      }
      if (aiqUncoveredRes.status === "fulfilled" && !aiqUncoveredRes.value.error) {
        const c = (aiqUncoveredRes.value as { count?: number | null }).count;
        setUncoveredQueries(c ?? 0);
      }
    })();
  }, []);

  const rows: PageRow[] = useMemo(() => {
    const sysRows: PageRow[] = SYSTEM_PAGES.map((p) => ({
      path: p.path,
      title: p.title,
      category: p.category,
      contentTarget: p.contentTarget,
      trafficWeight: p.trafficWeight,
      source: "system",
      collectionTable: p.collectionTable,
      staticCollection: p.staticCollection,
      adminUrl: p.adminUrl,
    }));

    const cmsRows: PageRow[] = publishedCms.map((a) => ({
      path: `/articles/${a.slug}`,
      title: a.title,
      category: "Опубліковані статті",
      contentTarget: "article-leaf",
      source: "article-cms",
    }));

    const aiqRows: PageRow[] = publishedAiq.map((a) => ({
      path: `/ai-consultations/${a.slug}`,
      title: a.title,
      category: "Опубліковані статті",
      contentTarget: "article-leaf",
      source: "article-aiq",
    }));

    const staticRows: PageRow[] = ARTICLES.slice(0, 60).map((a) => ({
      path: `/${a.slug}`,
      title: a.title,
      category: a.categoryLabel || a.category,
      contentTarget: "article-leaf",
      source: "article-static",
      articleType: (a as { type?: string }).type,
    }));

    const known = new Set<string>([
      ...sysRows.map((r) => r.path),
      ...cmsRows.map((r) => r.path),
      ...aiqRows.map((r) => r.path),
      ...staticRows.map((r) => r.path),
    ]);
    const orphanRows: PageRow[] = allIdeaPaths
      .filter((p) => !known.has(p))
      .map((p) => ({
        path: p,
        title: p,
        category: "Без прив'язки до сторінки",
        contentTarget: "article-leaf",
        source: "orphan",
      }));

    return [...sysRows, ...cmsRows, ...aiqRows, ...staticRows, ...orphanRows];
  }, [publishedCms, publishedAiq, allIdeaPaths]);

  const tree = useMemo(
    () => buildTree(rows, collectionCounts, uncoveredQueries),
    [rows, collectionCounts, uncoveredQueries],
  );

  const rollups = useMemo(() => computeRollups(tree, counts, highPriPaths), [tree, counts, highPriPaths]);

  const filteredBySearch = useMemo(() => filterTree(tree, search.trim()), [tree, search]);

  const finalTree = useMemo(() => {
    if (filterMode === "all") return filteredBySearch;
    if (filterMode === "with-todo")
      return filterByRollup(filteredBySearch, rollups, (r) => r.todo > 0);
    if (filterMode === "ready")
      return filterByRollup(filteredBySearch, rollups, (r) => r.ready > 0);
    if (filterMode === "no-content")
      return filterByRollup(filteredBySearch, rollups, (r) => r.noContentLeaves > 0);
    return filteredBySearch;
  }, [filteredBySearch, rollups, filterMode]);

  // Авто-розгортання при пошуку/фільтрі
  useEffect(() => {
    if (search.trim() || filterMode !== "all") {
      setExpanded(new Set(collectAllKeys(finalTree)));
    } else {
      setExpanded(new Set(tree.map((n) => n.key)));
    }
  }, [search, filterMode, tree, finalTree]);

  const toggle = (k: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const handleGenerate = async (pagePath: string) => {
    setGenerating(pagePath);
    try {
      const sysPage = SYSTEM_PAGES.find((p) => p.path === pagePath);
      const { data, error } = await supabase.functions.invoke("generate-content-ideas", {
        body: {
          pagePath,
          pageContext: sysPage
            ? {
                title: sysPage.title,
                category: sysPage.category,
                description: sysPage.description,
                contentTarget: sysPage.contentTarget,
              }
            : { title: pagePath, category: "—", description: "" },
        },
      });
      if (error) throw error;
      const created = (data as { created?: number })?.created ?? 0;
      toast.success(`Створено ${created} ідей для ${pagePath}`);
      // Refresh counts
      const { data: ideas } = await supabase
        .from("content_ideas")
        .select("page_path,status,priority");
      const map: Record<string, { todo: number; ready: number }> = {};
      const high = new Set<string>();
      const paths: string[] = [];
      (ideas ?? []).forEach((r: { page_path: string; status: string; priority: number }) => {
        const k = r.page_path;
        if (!map[k]) map[k] = { todo: 0, ready: 0 };
        if (r.status === "todo" || r.status === "generating") map[k].todo++;
        if (r.status === "generated" || r.status === "published") map[k].ready++;
        if ((r.priority ?? 0) >= 4) high.add(k);
        paths.push(k);
      });
      setCounts(map);
      setHighPriPaths(high);
      setAllIdeaPaths(Array.from(new Set(paths)));
    } catch (e) {
      toast.error("Помилка генерації: " + (e instanceof Error ? e.message : "невідома"));
    } finally {
      setGenerating(null);
    }
  };

  // List mode (flat grid grouped by category)
  const listGroups = useMemo(() => {
    const filtered = search
      ? rows.filter((r) => {
          const q = search.toLowerCase();
          return r.title.toLowerCase().includes(q) || r.path.toLowerCase().includes(q);
        })
      : rows;
    const g: Record<string, PageRow[]> = {};
    filtered.forEach((r) => {
      const k = r.source === "system" ? r.category : r.category;
      (g[k] = g[k] ?? []).push(r);
    });
    return g;
  }, [rows, search]);

  // Summary metrics
  const totalTodo = Object.values(counts).reduce((a, c) => a + c.todo, 0);
  const totalReady = Object.values(counts).reduce((a, c) => a + c.ready, 0);
  const orphanCount = rows.filter((r) => r.source === "orphan").length;
  const totalCount = rows.length;
  const filteredCount = search
    ? rows.filter((r) => {
        const q = search.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.path.toLowerCase().includes(q);
      }).length
    : totalCount;

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <div className="shrink-0 px-4 py-3 border-b border-border/60 bg-muted/30">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-none">Карта сайту</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Системних: {rows.filter((r) => r.source === "system").length} ·
              {" "}Статей: {rows.filter((r) => r.source.startsWith("article")).length}
              {" · Записів у колекціях: "}
              {(
                Object.values(collectionCounts).reduce((a, b) => a + b, 0) +
                Object.values(STATIC_COLLECTION_COUNTS).reduce((a, b) => a + b, 0)
              ).toLocaleString("uk-UA")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs">{filteredCount} / {totalCount}</Badge>
            <div className="inline-flex rounded-md border border-border bg-background p-0.5">
              <Button
                size="sm"
                variant={mode === "tree" ? "secondary" : "ghost"}
                className="h-7 px-2 gap-1"
                onClick={() => setMode("tree")}
              >
                <Network className="h-3.5 w-3.5" /> Дерево
              </Button>
              <Button
                size="sm"
                variant={mode === "list" ? "secondary" : "ghost"}
                className="h-7 px-2 gap-1"
                onClick={() => setMode("list")}
              >
                <List className="h-3.5 w-3.5" /> Список
              </Button>
            </div>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <Button
            size="sm"
            variant={filterMode === "all" ? "secondary" : "outline"}
            className="h-7 text-xs gap-1.5"
            onClick={() => setFilterMode("all")}
          >
            Усе
          </Button>
          <Button
            size="sm"
            variant={filterMode === "with-todo" ? "secondary" : "outline"}
            className="h-7 text-xs gap-1.5"
            onClick={() => setFilterMode("with-todo")}
          >
            <Lightbulb className="h-3 w-3 text-amber-500" />
            У роботі: <span className="font-semibold">{totalTodo}</span>
          </Button>
          <Button
            size="sm"
            variant={filterMode === "ready" ? "secondary" : "outline"}
            className="h-7 text-xs gap-1.5"
            onClick={() => setFilterMode("ready")}
          >
            <FileText className="h-3 w-3" />
            Готово: <span className="font-semibold">{totalReady}</span>
          </Button>
          <Button
            size="sm"
            variant={filterMode === "no-content" ? "secondary" : "outline"}
            className="h-7 text-xs gap-1.5"
            onClick={() => setFilterMode("no-content")}
          >
            Без контенту
          </Button>
          {uncoveredQueries > 0 && (
            <Badge variant="outline" className="h-7 text-xs gap-1.5 px-2 border-amber-500/40 text-amber-700 dark:text-amber-400">
              <MessageSquare className="h-3 w-3" />
              Нових запитів з чату: <span className="font-semibold">{uncoveredQueries}</span>
            </Badge>
          )}
          {orphanCount > 0 && (
            <Badge variant="outline" className="h-7 text-xs gap-1.5 px-2">
              Без прив'язки: <span className="font-semibold">{orphanCount}</span>
            </Badge>
          )}
          {generating && (
            <span className="text-xs text-muted-foreground">Генерація ідей для {generating}…</span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук сторінки за назвою або шляхом…"
            className="h-8 text-sm pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {mode === "tree" ? (
          <div className="max-w-6xl mx-auto py-2">
            {finalTree.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">Нічого не знайдено</div>
            ) : (
              finalTree.map((node) => (
                <TreeRow
                  key={node.key}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  toggle={toggle}
                  counts={counts}
                  rollups={rollups}
                  onOpenIdeas={onOpenIdeas}
                  onGenerate={handleGenerate}
                />
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-6 max-w-6xl mx-auto">
            {Object.entries(listGroups).map(([cat, items]) => (
              <section key={cat} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{cat}</h3>
                  <Badge variant="outline" className="text-[10px] h-4">{items.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((r) => {
                    const c = counts[r.path] ?? { todo: 0, ready: 0 };
                    const noContent = r.contentTarget === "none";
                    return (
                      <Card
                        key={r.path}
                        className={cn(
                          "p-3 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors",
                          c.todo > 0 && "border-primary/30",
                        )}
                        onClick={() => onOpenIdeas(r.path)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-sm font-semibold leading-tight line-clamp-2 flex-1 min-w-0">{r.title}</h4>
                          {noContent && (
                            <Badge variant="outline" className="text-[10px] h-4 shrink-0">read-only</Badge>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate mb-2">{r.path}</div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Lightbulb className="h-3 w-3 text-primary" />
                            <span className="font-medium text-foreground">{c.todo}</span>
                            <span>ідей</span>
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span className="font-medium text-foreground">{c.ready}</span>
                            <span>готові</span>
                          </span>
                          {r.trafficWeight !== undefined && (
                            <span className="flex items-center gap-1 text-muted-foreground ml-auto">
                              <Sparkles className="h-3 w-3" />
                              {Math.round(r.trafficWeight * 100)}%
                            </span>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
            {filteredCount === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">Нічого не знайдено</div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
