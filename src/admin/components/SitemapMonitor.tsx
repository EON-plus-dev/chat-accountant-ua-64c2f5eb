import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";

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

interface SitemapGroup {
  label: string;
  count: number;
  priority: string;
  changefreq: string;
  pathPattern: string;
}

const STATIC_PAGES_COUNT = 25;
const HUB_PAGES_COUNT = 5;

const SITEMAP_GROUPS: SitemapGroup[] = [
  { label: "Статичні сторінки", count: STATIC_PAGES_COUNT, priority: "0.3–1.0", changefreq: "weekly/monthly", pathPattern: "/*, /overview, /tools, …" },
  { label: "Хаби", count: HUB_PAGES_COUNT, priority: "0.8", changefreq: "weekly", pathPattern: "/fop, /personal, …" },
  { label: "Консультації", count: mockConsultations.length, priority: "0.8", changefreq: "monthly", pathPattern: "/consultations/{slug}" },
  { label: "AI-консультації", count: aiConsultations.length, priority: "0.7", changefreq: "monthly", pathPattern: "/ai-consultations/{slug}" },
  { label: "Статті", count: ARTICLES.length, priority: "0.7", changefreq: "monthly", pathPattern: "/articles/{slug}" },
  { label: "Гранти", count: GRANTS.length, priority: "0.6", changefreq: "monthly", pathPattern: "/dovidnyky/granty/{slug}" },
  { label: "Штрафи", count: PENALTIES.length, priority: "0.6", changefreq: "monthly", pathPattern: "/dovidnyky/shtrafy/{slug}" },
  { label: "Закони", count: LAWS.length, priority: "0.6", changefreq: "monthly", pathPattern: "/dovidnyky/zakony/{slug}" },
  { label: "Словник", count: KNOWLEDGE.length, priority: "0.5", changefreq: "monthly", pathPattern: "/dovidnyky/slovnyk/{slug}" },
  { label: "КВЕД", count: KVED_ENTRIES.length, priority: "0.5", changefreq: "yearly", pathPattern: "/dovidnyky/kved/{code}" },
  { label: "Курси", count: COURSES.length, priority: "0.6", changefreq: "monthly", pathPattern: "/learn/{slug}" },
  { label: "Установи", count: INSTITUTION_PROFILES.length, priority: "0.5", changefreq: "monthly", pathPattern: "/dovidnyky/ustanovy/{slug}" },
  { label: "Шаблони", count: TEMPLATES.length, priority: "0.5", changefreq: "monthly", pathPattern: "/dovidnyky/templates/{slug}" },
  { label: "Ліцензії", count: LICENSES.length, priority: "0.5", changefreq: "monthly", pathPattern: "/dovidnyky/litsenziyi/{slug}" },
  { label: "Реєстри", count: REGISTERS.length, priority: "0.5", changefreq: "monthly", pathPattern: "/dovidnyky/reestry/{slug}" },
  { label: "Ставки", count: RATE_TABLES.length, priority: "0.5", changefreq: "monthly", pathPattern: "/dovidnyky/stavky/{slug}" },
  { label: "Форми бізнесу", count: BUSINESS_FORMS.length, priority: "0.5", changefreq: "monthly", pathPattern: "/dovidnyky/formy-biznesu/{slug}" },
  { label: "Бухгалтери", count: ACCOUNTANTS.length, priority: "0.5", changefreq: "monthly", pathPattern: "/dovidnyky/accountants/{slug}" },
  { label: "Рейтинги", count: RANKINGS.length, priority: "0.6", changefreq: "monthly", pathPattern: "/publications/ratings/{slug}" },
];

const TOTAL_URLS = SITEMAP_GROUPS.reduce((s, g) => s + g.count, 0);

export function SitemapOverviewCard({ onNavigate }: { onNavigate?: () => void }) {
  const groups = SITEMAP_GROUPS;

  const totalUrls = TOTAL_URLS;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-500" /> Sitemap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{totalUrls}</p>
          <span className="text-xs text-muted-foreground">URL</span>
        </div>
        <div className="space-y-0.5">
          {groups.slice(0, 3).map(g => (
            <div key={g.label} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{g.label}</span>
              <span className="font-medium">{g.count}</span>
            </div>
          ))}
        </div>
        {onNavigate && (
          <button onClick={onNavigate} className="text-xs text-primary hover:underline">
            +{groups.length - 3} типів → Детальніше
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export function SitemapSettingsCard() {
  const [verifyResult, setVerifyResult] = useState<{ count: number; error?: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const sitemapRoutes = useMemo(() => [
    { group: "Статичні", paths: ["/ (1.0)", "/overview (0.9)", "/consultations (0.9)", "/consultant (0.9)", "/analytics (0.8)", "/tools (0.8)", "/learn (0.8)", "/taxes (0.8)", "/articles (0.8)"], changefreq: "weekly" },
    { group: "Довідники", paths: ["/dovidnyky (0.8)", "/dovidnyky/slovnyk (0.7)", "/dovidnyky/litsenziyi (0.7)", "/dovidnyky/templates (0.7)", "/dovidnyky/reestry (0.7)", "/dovidnyky/stavky (0.7)", "/dovidnyky/formy-biznesu (0.7)", "/dovidnyky/accountants (0.7)", "/dovidnyky/kalendar (0.7)"], changefreq: "monthly" },
    { group: "Публікації", paths: ["/publications (0.8)", "/publications/podcasts (0.7)", "/publications/videos (0.7)", "/publications/ratings (0.7)"], changefreq: "weekly" },
    { group: "Хаби", paths: ["/fop (0.8)", "/personal (0.8)", "/accounting (0.8)", "/law (0.8)", "/wartime (0.8)"], changefreq: "weekly" },
    { group: "Інше", paths: ["/privacy (0.3)", "/terms (0.3)", "/ai-consultations (0.8)"], changefreq: "—" },
  ], []);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch("/sitemap.xml");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const count = (text.match(/<loc>/g) || []).length;
      setVerifyResult({ count });
    } catch (err: any) {
      setVerifyResult({ count: 0, error: err.message || "Не вдалося завантажити" });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Конфігурація Sitemap</span>
          <Button variant="outline" size="sm" onClick={handleVerify} disabled={verifying}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${verifying ? "animate-spin" : ""}`} />
            Перевірити sitemap
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {verifyResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${verifyResult.error ? "bg-destructive/10 text-destructive" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"}`}>
            {verifyResult.error ? (
              <><AlertTriangle className="h-4 w-4" /> Помилка: {verifyResult.error}</>
            ) : (
              <><CheckCircle className="h-4 w-4" /> Live sitemap.xml містить {verifyResult.count} URL</>
            )}
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Розподіл URL за типами</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-1.5 font-medium">Тип</th>
                  <th className="text-right p-1.5 font-medium w-14">К-ть</th>
                  <th className="text-center p-1.5 font-medium w-16">Priority</th>
                  <th className="text-center p-1.5 font-medium w-20">Changefreq</th>
                  <th className="text-left p-1.5 font-medium hidden md:table-cell">Шаблон URL</th>
                </tr>
              </thead>
              <tbody>
                {SITEMAP_GROUPS.map(g => (
                  <tr key={g.label} className="border-t">
                    <td className="p-1.5 text-muted-foreground">{g.label}</td>
                    <td className="p-1.5 text-right font-medium">{g.count}</td>
                    <td className="p-1.5 text-center">{g.priority}</td>
                    <td className="p-1.5 text-center">{g.changefreq}</td>
                    <td className="p-1.5 font-mono text-muted-foreground hidden md:table-cell">{g.pathPattern}</td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/30 font-medium">
                  <td className="p-1.5">Разом</td>
                  <td className="p-1.5 text-right">{TOTAL_URLS}</td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ScrollArea className="max-h-60">
          <div className="space-y-4">
            {sitemapRoutes.map(group => (
              <div key={group.group}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium">{group.group}</span>
                  <Badge variant="outline" size="sm">{group.changefreq}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {group.paths.map(p => (
                    <span key={p} className="text-xs text-muted-foreground font-mono">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Генерується build-time плагіном vite-plugin-consultation-prerender</span>
        </div>
      </CardContent>
    </Card>
  );
}
