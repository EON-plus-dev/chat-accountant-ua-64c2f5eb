import { useState, useMemo } from "react";
import { useAudience } from "@/contexts/AudienceContext";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/portal/layouts/PortalLayout";
import { BreadcrumbNav } from "@/portal/components/BreadcrumbNav";
import { mockConsultations } from "@/config/consultationMockData";
import { useMergedForumData } from "@/hooks/useAiChatQueries";
import { ConsultationCard } from "@/components/landing/ConsultationCard";
import { ForumThreadCard } from "@/portal/components/ForumThreadCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBreadcrumbSchema, SITE_URL } from "@/portal/seo/structuredData";

export default function PublicationsConsultationsPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const { audience } = useAudience();
  const { items: aiItems } = useMergedForumData();
  const mappedAudience = audience === "individual" ? "individual" : "business";

  const filteredEditorial = useMemo(() => {
    let result = mockConsultations.filter(c => c.audience === mappedAudience);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q));
    }
    return result;
  }, [search, mappedAudience]);

  const filteredAI = useMemo(() => {
    let result = aiItems.filter(c => c.audience === mappedAudience);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.question.toLowerCase().includes(q));
    }
    return result;
  }, [search, mappedAudience, aiItems]);

  return (
    <PortalLayout
      meta={{
        title: "Консультації — відповіді на питання підприємців | FINTODO",
        description: "Редакційні консультації та AI-відповіді на типові питання підприємців.",
        canonical: `${SITE_URL}/publications/consultations`,
      }}
    >
      <JsonLd data={getBreadcrumbSchema([{ name: "Головна", url: SITE_URL }, { name: "Публікації", url: `${SITE_URL}/publications` }, { name: "Консультації", url: `${SITE_URL}/publications/consultations` }])} />
      <div className="max-w-5xl mx-auto px-4">
        <BreadcrumbNav items={[{ label: "Головна", to: "/" }, { label: "Публікації", to: "/publications" }, { label: "Консультації" }]} />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-6">Консультації</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук консультацій..."
            className="pl-10"
          />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">Всі</TabsTrigger>
            <TabsTrigger value="editorial">Редакційні</TabsTrigger>
            <TabsTrigger value="ai">AI-відповіді</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-3 mt-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Редакційні</h3>
              {filteredEditorial.slice(0, 5).map((c) => (
                <ConsultationCard key={c.id} item={c} />
              ))}
              {filteredEditorial.length > 5 && (
                <button onClick={() => setTab("editorial")} className="text-sm text-primary hover:underline">
                  Показати всі ({filteredEditorial.length}) →
                </button>
              )}
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-4">AI-відповіді</h3>
              {filteredAI.slice(0, 5).map((c) => (
                <ForumThreadCard key={c.id} consultation={c} viewCount={c.viewCount} rank={0} />
              ))}
              {filteredAI.length > 5 && (
                <button onClick={() => setTab("ai")} className="text-sm text-primary hover:underline">
                  Показати всі ({filteredAI.length}) →
                </button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="editorial">
            <div className="space-y-3 mt-4">
              {filteredEditorial.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Немає консультацій</p>
              ) : (
                filteredEditorial.map((c) => <ConsultationCard key={c.id} item={c} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="space-y-3 mt-4">
              {filteredAI.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Немає AI-відповідей</p>
              ) : (
                filteredAI.map((c) => <ForumThreadCard key={c.id} consultation={c} viewCount={c.viewCount} rank={0} />)
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <div className="mt-8 text-center py-8 px-4 rounded-lg bg-muted/30 border border-border/40">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-2">Не знайшли відповідь?</h2>
          <p className="text-sm text-muted-foreground mb-4">Запитайте AI-консультанта — він знає податкове законодавство</p>
          <Button asChild>
            <Link to="/consultant">
              ✦ Запитати AI <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </PortalLayout>
  );
}
