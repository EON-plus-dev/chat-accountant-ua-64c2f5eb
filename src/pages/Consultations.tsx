import { useState, useMemo, useEffect, FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Tag, X, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSubscription } from "@/portal/services/subscriptions";
import { SeoHead, BASE_URL } from "@/components/seo/SeoHead";
import { JsonLd } from "@/components/seo/JsonLd";
import { mockConsultations } from "@/config/consultationMockData";
import { ConsultationCard } from "@/components/landing/ConsultationCard";
import { stripMarkdown } from "@/lib/markdownRenderer";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const TOPICS_LIST = [
  { value: "taxes", label: "Оподаткування" },
  { value: "accounting", label: "Бухоблік" },
  { value: "fop", label: "ФОП" },
  { value: "law", label: "Законодавство" },
  { value: "personal", label: "Фізособи" },
];

const AskQuestionForm = () => {
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !email.trim() || !email.includes("@")) return;
    setIsSubmitting(true);
    setErrorMsg("");
    const result = await createSubscription({
      email,
      topics: topic ? [topic] : ["general"],
      source: "lead_magnet",
    });
    setIsSubmitting(false);
    if (result.success) {
      setFormState("success");
    } else {
      setFormState("error");
      setErrorMsg(result.error || "Помилка. Спробуйте ще раз.");
    }
  };

  if (formState === "success") {
    return (
      <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center space-y-2">
        <Check className="h-8 w-8 text-primary mx-auto" />
        <h2 className="text-lg font-semibold text-foreground">Питання надіслано!</h2>
        <p className="text-sm text-muted-foreground">
          Відповідь отримаєте на <strong>{email}</strong> протягом 2 робочих днів.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
      <h2 className="text-lg font-semibold text-foreground text-center">
        Не знайшли відповідь на своє питання?
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-lg mx-auto">
        <Textarea
          placeholder="Опишіть вашу ситуацію..."
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
          required
          className="resize-none"
          rows={3}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="Ваш email для відповіді"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Тема" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS_LIST.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-center">
          <Button type="submit" disabled={isSubmitting || !question.trim() || !email.includes("@")}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Задати питання →"}
          </Button>
        </div>
        {errorMsg && <p className="text-xs text-destructive text-center">{errorMsg}</p>}
      </form>
    </div>
  );
};

const ITEMS_PER_PAGE = 12;

const Consultations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get("tag"));
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showAllTags, setShowAllTags] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const allTags = useMemo(() => {
    const source = selectedAudience
      ? mockConsultations.filter((c) => c.audience === selectedAudience)
      : mockConsultations;
    const tagSet = new Set<string>();
    source.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [selectedAudience]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return mockConsultations
      .filter((c) => {
        if (selectedAudience && c.audience !== selectedAudience) return false;
        if (selectedTag && !c.tags.includes(selectedTag)) return false;
        if (q && !c.question.toLowerCase().includes(q) && !c.tags.some((t) => t.toLowerCase().includes(q))) return false;
        return true;
      })
      .slice()
      .sort((a, b) => {
        const dateA = a.updatedDate || a.date;
        const dateB = b.updatedDate || b.date;
        return dateB.localeCompare(dateA);
      });
  }, [debouncedSearch, selectedTag, selectedAudience]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleTagClick = (tag: string) => {
    const newTag = selectedTag === tag ? null : tag;
    setSelectedTag(newTag);
    setPage(1);
    if (newTag) {
      setSearchParams({ tag: newTag });
    } else {
      setSearchParams({});
    }
  };

  const handleAudienceClick = (audience: string) => {
    setSelectedAudience(selectedAudience === audience ? null : audience);
    setSelectedTag(null);
    setSearchParams({});
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedTag(null);
    setSelectedAudience(null);
    setSearchParams({});
    setPage(1);
  };

  const hasActiveFilters = !!search || !!selectedTag || !!selectedAudience;

  useEffect(() => {
    if (page > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  const faqSchema = useMemo(() => {
    const top10 = filtered.slice(0, 10);
    if (top10.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: top10.map((c) => ({
        "@type": "Question",
        name: c.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: stripMarkdown(c.answer.split("\n\n")[0]),
        },
      })),
    };
  }, [filtered]);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Бібліотека" },
    ],
  };

  return (
    <PortalLayout meta={{
      title: "Бібліотека | FINTODO",
      description: "Центральний архів публікацій з податків, бухгалтерії та законодавства для ФОП та фізичних осіб.",
      canonical: `${BASE_URL}/consultations`,
    }}>
      <div className="min-h-screen bg-muted/30 dark:bg-background">
        <SeoHead
          title="Бібліотека | FINTODO"
          description="Центральний архів публікацій з податків, бухгалтерії та законодавства для ФОП та фізичних осіб. Податки, ЄСВ, декларації, звіти — відповіді AI-бухгалтера."
          canonical={`${BASE_URL}/consultations`}
        />
        <JsonLd data={breadcrumbSchema} />
        {faqSchema && <JsonLd data={faqSchema} />}

        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          {/* Breadcrumbs */}
          <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації", to: "/publications" }, { label: "Бібліотека" }]} />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3 flex-wrap">
              Бібліотека
              <Badge variant="secondary" className="text-sm font-medium">
                {mockConsultations.length}
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Консультації з бухгалтерського обліку від AI-бухгалтера FINTODO
            </p>
          </div>

          {/* Search + Filters in Card */}
          <Card className="mb-8">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Пошук консультацій..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-10"
                  aria-label="Пошук консультацій"
                />
              </div>

              {/* Audience filter */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedAudience === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedAudience(null); setPage(1); }}
                >
                  Всі
                </Button>
                <Button
                  variant={selectedAudience === "business" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAudienceClick("business")}
                >
                  Для бізнесу
                </Button>
                <Button
                  variant={selectedAudience === "individual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAudienceClick("individual")}
                >
                  Для фізосіб
                </Button>
              </div>

              {/* Tag filter */}
              <div className={cn(
                "flex gap-1.5 flex-wrap",
                !showAllTags && "max-h-[4.5rem] overflow-hidden"
              )}>
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => handleTagClick(tag)}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
              {allTags.length > 10 && (
                <Button variant="ghost" size="sm" onClick={() => setShowAllTags(!showAllTags)} className="text-muted-foreground">
                  {showAllTags ? "Згорнути теги" : `Показати всі (${allTags.length})`}
                </Button>
              )}

              {/* Reset all filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-muted-foreground">
                  <X className="w-3 h-3 mr-1" />
                  Скинути фільтри
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Знайдено {filtered.length} консультаці{filtered.length === 1 ? "ю" : filtered.length >= 2 && filtered.length <= 4 ? "ї" : "й"}
          </p>

          {/* Results */}
          {paginated.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Нічого не знайдено. Спробуйте змінити запит або фільтри.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((item) => (
                <ConsultationCard key={item.id} item={item} onTagClick={handleTagClick} />
              ))}
            </div>
          )}

          {/* Ask a Question Form */}
          <AskQuestionForm />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(page - 1)} className="cursor-pointer" />
                  </PaginationItem>
                )}
                {(() => {
                  const pages: (number | "ellipsis")[] = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (page > 3) pages.push("ellipsis");
                    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                    if (page < totalPages - 2) pages.push("ellipsis");
                    pages.push(totalPages);
                  }
                  return pages.map((p, idx) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`e-${idx}`}><PaginationEllipsis /></PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink>
                      </PaginationItem>
                    )
                  );
                })()}
                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(page + 1)} className="cursor-pointer" />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </PortalLayout>
  );
};

export default Consultations;
