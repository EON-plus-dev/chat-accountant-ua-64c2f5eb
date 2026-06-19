import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { useMergedForumData } from "@/hooks/useAiChatQueries";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Search,
  MessageSquare,
  Bot,
  Flame,
  Sparkles,
  TrendingUp,
  Filter,
  MessagesSquare,
  HelpCircle,
} from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { stripMarkdown } from "@/lib/markdownRenderer";
import { cn } from "@/lib/utils";
import { JsonLd } from "@/components/seo/JsonLd";
import { BASE_URL } from "@/components/seo/SeoHead";
import { ForumThreadCard } from "@/portal/components/ForumThreadCard";
import { RecentlyViewedSidebar } from "@/portal/components/RecentlyViewedSidebar";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";

type SortMode = "hot" | "new" | "top";

const SORT_TABS: { value: SortMode; label: string; icon: typeof Flame }[] = [
  { value: "hot", label: "Гарячі", icon: Flame },
  { value: "new", label: "Нові", icon: Sparkles },
  { value: "top", label: "Топ", icon: TrendingUp },
];

const REF_DATE = new Date("2026-01-01").getTime();
const hotScore = (views: number, dateStr: string) => {
  const dateMs = new Date(dateStr).getTime();
  return Math.log10(Math.max(views, 1)) + (dateMs - REF_DATE) / 45_000_000_000;
};

const AIConsultationsPage = () => {
  const { items: aiConsultations } = useMergedForumData();
  const totalFollowUps = aiConsultations.reduce((sum, c) => sum + c.followUpCount, 0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get("tag") || null);
  const [sort, setSort] = useState<SortMode>("hot");
  const [showTags, setShowTags] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (activeTag) params.set("tag", activeTag);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeTag, setSearchParams]);

  const allTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    aiConsultations.forEach((c) => c.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);
  }, [aiConsultations]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    const items = aiConsultations.filter((c) => {
      if (activeTag && !c.tags.includes(activeTag)) return false;
      if (q) {
        return (
          c.question.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    switch (sort) {
      case "hot":
        return [...items].sort((a, b) => hotScore(b.viewCount, b.updatedDate || b.date) - hotScore(a.viewCount, a.updatedDate || a.date));
      case "top":
        return [...items].sort((a, b) => b.viewCount - a.viewCount);
      case "new":
      default:
        return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [debouncedSearch, activeTag, sort, aiConsultations]);

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent("open-floating-chat"));
  };

  const forumSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "АІ-форум з податків та бухгалтерії",
    description: "Каталог АІ-форуму з податків, бухгалтерії та законодавства України",
    url: `${BASE_URL}/ai-consultations`,
    hasPart: filtered.slice(0, 10).map((c) => ({
      "@type": "DiscussionForumPosting",
      headline: c.question,
      text: stripMarkdown(c.answer).slice(0, 200),
      datePublished: c.date,
      ...(c.updatedDate && { dateModified: c.updatedDate }),
      url: `${BASE_URL}/ai-consultations/${c.slug}`,
      author: { "@type": "Organization", name: "FINTODO" },
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ViewAction",
        userInteractionCount: c.viewCount,
      },
    })),
  };

  return (
    <PortalLayout
      meta={{
        title: "АІ-форум з податків та бухгалтерії — FINTODO",
        description: "Живий каталог АІ-форуму з податків, бухгалтерії та законодавства. Задайте питання AI або знайдіть відповідь у форумі.",
        canonical: `${BASE_URL}/ai-consultations`,
      }}
    >
      <JsonLd data={forumSchema} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "АІ-форум" }]} />

        <div className="flex flex-col lg:flex-row gap-6 pb-8">
          {/* Main feed */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessagesSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                    АІ-форум
                    <Badge variant="secondary" className="text-xs font-medium">
                      {aiConsultations.length}
                    </Badge>
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Живий форум — питання з AI-чату, модерація та публікація
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky compact toolbar */}
            <div className="sticky top-14 z-10 bg-background/95 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 border-b border-border/40 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex rounded-lg bg-muted p-0.5 shrink-0">
                  {SORT_TABS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSort(s.value)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        sort === s.value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <s.icon className="w-3.5 h-3.5" />
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Пошук..."
                    className="pl-8 h-8 text-xs"
                  />
                </div>

                <button
                  onClick={() => setShowTags(!showTags)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                    showTags
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Теги
                  {activeTag && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible tags with animation */}
            <Collapsible open={showTags} onOpenChange={setShowTags}>
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-2 data-[state=open]:slide-down-2 duration-200">
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1 pt-1">
                    {activeTag && (
                      <Badge
                        variant="destructive"
                        className="cursor-pointer text-xs"
                        onClick={() => setActiveTag(null)}
                      >
                        ✕ Скинути
                      </Badge>
                    )}
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={activeTag === tag ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Thread list */}
            <div className="space-y-2.5">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm mb-4">Нічого не знайдено. Спробуйте змінити фільтри.</p>
                  <div className="flex items-center justify-center gap-3">
                    {(activeTag || debouncedSearch) && (
                      <Button variant="outline" size="sm" onClick={() => { setActiveTag(null); setSearch(""); }}>
                        Скинути фільтри
                      </Button>
                    )}
                    <Button size="sm" className="gap-2" onClick={handleOpenChat}>
                      <Bot className="w-4 h-4" />
                      Задати питання AI
                    </Button>
                  </div>
                </div>
              ) : (
                filtered.map((c, i) => (
                  <ForumThreadCard key={c.id} consultation={c} viewCount={c.viewCount} rank={i + 1} />
                ))
              )}
            </div>
          </div>

          {/* Community sidebar — desktop */}
          <aside className="hidden lg:block lg:w-72 xl:w-80 shrink-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="bg-primary/10 px-4 py-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <MessagesSquare className="w-4 h-4 text-primary" />
                  Про форум
                </h2>
              </div>
              <div className="p-4 space-y-3 text-xs text-muted-foreground">
                <p>
                  Живий каталог AI-консультацій з податків, бухгалтерії та законодавства України. 
                  Питання публікуються з AI-чату після модерації.
                </p>
                <div className="flex items-center gap-4 py-2 border-t border-b border-border/40">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{aiConsultations.length}</div>
                    <div className="text-[10px] text-muted-foreground">Тредів</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{totalFollowUps}</div>
                    <div className="text-[10px] text-muted-foreground">Уточнень</div>
                  </div>
                </div>
                <Button onClick={handleOpenChat} size="sm" className="w-full gap-2">
                  <Bot className="w-4 h-4" />
                  Задати питання AI
                </Button>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                Як це працює
              </h3>
              <ol className="text-[11px] text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Задайте питання в AI-чаті</li>
                <li>AI генерує відповідь з посиланнями на закони</li>
                <li>Після модерації публікується у форумі</li>
                <li>Додавайте уточнення в коментарях</li>
              </ol>
            </div>

            {/* Top tags */}
            {allTags.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
                <h3 className="text-xs font-semibold text-foreground">Популярні теги</h3>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.slice(0, 8).map((tag) => (
                    <Badge
                      key={tag}
                      variant={activeTag === tag ? "default" : "outline"}
                      className="cursor-pointer text-[10px]"
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <RecentlyViewedSidebar />
          </aside>
        </div>
      </div>
    </PortalLayout>
  );
};

export default AIConsultationsPage;
