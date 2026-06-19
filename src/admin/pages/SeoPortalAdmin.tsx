import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, Globe, FileText, Bot, Search, Settings, BarChart3, Sparkles } from "lucide-react";
import BulkSeoGenerator from "@/admin/components/BulkSeoGenerator";
import SeoQualityMonitor from "@/admin/components/SeoQualityMonitor";
import { SitemapOverviewCard, SitemapSettingsCard } from "@/admin/components/SitemapMonitor";

import { ARTICLES } from "@/portal/data/articles";
import { mockConsultations } from "@/config/consultationMockData";
import { aiConsultations } from "@/config/aiConsultationMockData";
import { GRANTS } from "@/portal/data/grants";
import { PENALTIES } from "@/portal/data/penalties";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { LAWS } from "@/portal/data/laws";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { COURSES } from "@/portal/data/learn";
import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { RANKINGS } from "@/portal/data/rankings";
import { REGISTERS } from "@/portal/data/registers";
import { RATE_TABLES } from "@/portal/data/rates";
import { TEMPLATES } from "@/portal/data/templates";
import { LICENSES } from "@/portal/data/licenses";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { TOOLS } from "@/portal/data/tools";
import { HUBS } from "@/portal/data/hubs";
import { NEWSLETTER_ISSUES } from "@/portal/data/newsletter";
import { DEADLINES } from "@/portal/data/deadlines";
import { COMPARISONS } from "@/portal/data/comparisons";
import { CATALOG_CATEGORIES } from "@/portal/data/catalog";
import { POPULAR_QUESTIONS } from "@/portal/data/popularQuestions";

interface ContentAudit {
  label: string;
  total: number;
  withSeo: number;
  path: string;
  hasDetailPages: boolean;
}

/** Smart SEO counting — checks seoTitle/seoDescription OR fallback fields */
function countSeo(items: any[], fallbackFields?: [string, string]): number {
  return items.filter(i => {
    if (i.seoTitle || i.seoDescription) return true;
    if (fallbackFields) {
      return i[fallbackFields[0]] && i[fallbackFields[1]];
    }
    return false;
  }).length;
}

function countHubSeo(): number {
  return Object.values(HUBS).filter((h: any) => h.meta?.title && h.meta?.description).length;
}

export default function SeoPortalAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const audits = useMemo<ContentAudit[]>(() => [
    { label: "Статті", total: ARTICLES.length, withSeo: countSeo(ARTICLES), path: "/admin/articles", hasDetailPages: true },
    { label: "Консультації", total: mockConsultations.length, withSeo: countSeo(mockConsultations as any[]), path: "/admin/consultations", hasDetailPages: true },
    { label: "AI-консультації", total: aiConsultations.length, withSeo: countSeo(aiConsultations as any[], ["question", "answer"]), path: "/admin/ai-consultations", hasDetailPages: true },
    { label: "Гранти", total: GRANTS.length, withSeo: countSeo(GRANTS), path: "/admin/grants", hasDetailPages: true },
    { label: "Штрафи", total: PENALTIES.length, withSeo: countSeo(PENALTIES), path: "/admin/penalties", hasDetailPages: true },
    { label: "Словник", total: KNOWLEDGE.length, withSeo: countSeo(KNOWLEDGE), path: "/admin/knowledge", hasDetailPages: true },
    { label: "Закони", total: LAWS.length, withSeo: countSeo(LAWS), path: "/admin/laws", hasDetailPages: true },
    { label: "КВЕД", total: KVED_ENTRIES.length, withSeo: countSeo(KVED_ENTRIES), path: "/admin/kved", hasDetailPages: true },
    { label: "Курси", total: COURSES.length, withSeo: countSeo(COURSES), path: "/admin/courses", hasDetailPages: true },
    { label: "Установи", total: INSTITUTION_PROFILES.length, withSeo: countSeo(INSTITUTION_PROFILES), path: "/admin/institution-profiles", hasDetailPages: true },
    { label: "Рейтинги", total: RANKINGS.length, withSeo: countSeo(RANKINGS), path: "/admin/rankings", hasDetailPages: true },
    { label: "Реєстри", total: REGISTERS.length, withSeo: countSeo(REGISTERS, ["name", "description"]), path: "/admin/registers", hasDetailPages: true },
    { label: "Ставки", total: RATE_TABLES.length, withSeo: countSeo(RATE_TABLES), path: "/admin/rates", hasDetailPages: true },
    { label: "Шаблони", total: TEMPLATES.length, withSeo: countSeo(TEMPLATES as any[], ["name", "description"]), path: "/admin/templates", hasDetailPages: true },
    { label: "Ліцензії", total: LICENSES.length, withSeo: countSeo(LICENSES as any[], ["name", "description"]), path: "/admin/licenses", hasDetailPages: true },
    { label: "Форми бізнесу", total: BUSINESS_FORMS.length, withSeo: countSeo(BUSINESS_FORMS as any[], ["name", "fullDescription"]), path: "/admin/business-forms", hasDetailPages: true },
    { label: "Бухгалтери", total: ACCOUNTANTS.length, withSeo: countSeo(ACCOUNTANTS as any[], ["name", "description"]), path: "/admin/accountants", hasDetailPages: true },
    { label: "Інструменти", total: TOOLS.length, withSeo: countSeo(TOOLS, ["name", "description"]), path: "/admin/tools", hasDetailPages: true },
    { label: "Хаби", total: Object.keys(HUBS).length, withSeo: countHubSeo(), path: "/admin/hubs", hasDetailPages: true },
    { label: "Розсилки", total: NEWSLETTER_ISSUES.length, withSeo: -1, path: "/admin/newsletter", hasDetailPages: false },
    { label: "Дедлайни", total: DEADLINES.length, withSeo: -1, path: "/admin/tax-calendar", hasDetailPages: false },
    { label: "Порівняння", total: Object.keys(COMPARISONS).length, withSeo: -1, path: "/admin/comparisons", hasDetailPages: false },
    { label: "Каталог", total: CATALOG_CATEGORIES.length, withSeo: -1, path: "/admin/catalog", hasDetailPages: false },
    { label: "Поп. питання", total: POPULAR_QUESTIONS.length, withSeo: -1, path: "/admin/questions", hasDetailPages: false },
  ], []);

  const countable = audits.filter(a => a.hasDetailPages);
  const totalContent = countable.reduce((s, a) => s + a.total, 0);
  const totalWithSeo = countable.reduce((s, a) => s + a.withSeo, 0);
  const coverage = totalContent > 0 ? Math.round((totalWithSeo / totalContent) * 100) : 0;

  const structuredDataSchemas = [
    "SoftwareApplication", "WebSite", "Organization",
    "Article", "FAQPage", "QAPage", "DefinedTerm",
    "VideoObject", "PodcastEpisode", "PodcastSeries",
    "BreadcrumbList", "ItemList", "Review", "Course",
    "FinancialService", "BankOrCreditUnion", "DefinedTermSet", "LocalBusiness",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SEO порталу</h1>
        <p className="text-sm text-muted-foreground">Управління пошуковою оптимізацією, аналітика та генерація</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="gap-1.5">
            <Search className="h-3.5 w-3.5" /> Огляд
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Аналітика
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Масова генерація
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" /> Налаштування
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Search className="h-4 w-4" /> SEO Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{coverage}%</p>
                <p className="text-xs text-muted-foreground">{totalWithSeo} / {totalContent} сторінок</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Домен
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">fintodo.com.ua</p>
                <p className="text-xs text-muted-foreground">Canonical domain</p>
              </CardContent>
            </Card>
            <SitemapOverviewCard onNavigate={() => setActiveTab("settings")} />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Bot className="h-4 w-4" /> LLM Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">Дозволено</p>
                <p className="text-xs text-muted-foreground">robots.txt + llms.txt</p>
              </CardContent>
            </Card>
          </div>

          {/* Content SEO audit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Аудит SEO-полів контенту</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {audits.map((a) => {
                  const isNA = a.withSeo === -1;
                  const pct = isNA ? 0 : (a.total > 0 ? Math.round((a.withSeo / a.total) * 100) : 0);
                  const isFull = !isNA && pct === 100;
                  return (
                    <div key={a.label} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        {isNA ? (
                          <span className="h-4 w-4 text-muted-foreground text-xs font-bold flex items-center justify-center">—</span>
                        ) : isFull ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-sm font-medium">{a.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {isNA ? (
                          <span className="text-xs text-muted-foreground w-20 text-right">N/A</span>
                        ) : (
                          <>
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isFull ? "bg-green-500" : "bg-amber-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-20 text-right">
                              {a.withSeo}/{a.total} ({pct}%)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Structured Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">JSON-LD Structured Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {structuredDataSchemas.map((schema) => (
                  <Badge key={schema} variant="outline" className="justify-center py-1.5">
                    {schema}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <SeoQualityMonitor />
        </TabsContent>

        {/* Tab 3: Bulk Generation */}
        <TabsContent value="generate" className="space-y-6">
          <BulkSeoGenerator />
        </TabsContent>

        {/* Tab 4: Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Глобальні мета-дані</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">Default Title</span>
                <span className="font-medium">AI-Бухгалтер | FINTODO</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">Description</span>
                <span>AI-бухгалтер для ФОП та фізосіб в Україні. Автоматичні декларації, податковий календар, AI-консультації.</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">OG Image</span>
                <span className="font-medium">/og-default.png</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">robots.txt</span>
                <Badge variant="secondary">GPTBot, ClaudeBot, Googlebot — Allow</Badge>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">llms.txt</span>
                <Badge variant="secondary">Активний</Badge>
              </div>
            </CardContent>
          </Card>

          <SitemapSettingsCard />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Canonical URL</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">Основний домен</span>
                <span className="font-medium">https://fintodo.com.ua</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">Протокол</span>
                <Badge variant="secondary">HTTPS</Badge>
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-muted-foreground">Trailing Slash</span>
                <Badge variant="secondary">Без слеша</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
