import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

import { ARTICLES } from "@/portal/data/articles";
import { mockConsultations } from "@/config/consultationMockData";
import { aiConsultations } from "@/config/aiConsultationMockData";
import { GRANTS } from "@/portal/data/grants";
import { PENALTIES } from "@/portal/data/penalties";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { LAWS } from "@/portal/data/laws";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { COURSES } from "@/portal/data/learn";
import { TEMPLATES } from "@/portal/data/templates";
import { LICENSES } from "@/portal/data/licenses";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { ACCOUNTANTS } from "@/portal/data/accountants";
import { REGISTERS } from "@/portal/data/registers";
import { RATE_TABLES } from "@/portal/data/rates";

interface SeoIssue {
  type: "error" | "warning";
  category: string;
  item: string;
  issue: string;
}

function getTitle(item: any): string {
  return item.seoTitle || item.title || item.name || item.term || item.question || item.shortName || "—";
}

function getDescription(item: any): string {
  return item.seoDescription || item.description || item.tldr || item.shortDefinition || item.excerpt || item.fullDescription || "";
}

function analyzeItems(label: string, items: any[]): SeoIssue[] {
  const issues: SeoIssue[] = [];
  const titles = new Map<string, string[]>();
  const descriptions = new Map<string, string[]>();

  items.forEach((item) => {
    const id = item.id || item.slug || item.code || "?";
    const title = getTitle(item);
    const desc = getDescription(item);

    // Title length
    if (title.length < 30) {
      issues.push({ type: "warning", category: label, item: title.slice(0, 40), issue: `Title занадто короткий (${title.length} chars, min 30)` });
    } else if (title.length > 60) {
      issues.push({ type: "warning", category: label, item: title.slice(0, 40), issue: `Title занадто довгий (${title.length} chars, max 60)` });
    }

    // Description length
    if (!desc || desc.length < 70) {
      issues.push({ type: "warning", category: label, item: title.slice(0, 40), issue: `Description ${!desc ? "відсутній" : `занадто короткий (${desc.length} chars, min 70)`}` });
    } else if (desc.length > 160) {
      issues.push({ type: "warning", category: label, item: title.slice(0, 40), issue: `Description занадто довгий (${desc.length} chars, max 160)` });
    }

    // Missing slug
    if (!item.slug) {
      issues.push({ type: "error", category: label, item: title.slice(0, 40), issue: "Відсутній slug" });
    }

    // Track duplicates
    const tKey = title.toLowerCase().trim();
    if (!titles.has(tKey)) titles.set(tKey, []);
    titles.get(tKey)!.push(id);

    if (desc) {
      const dKey = desc.toLowerCase().trim().slice(0, 100);
      if (!descriptions.has(dKey)) descriptions.set(dKey, []);
      descriptions.get(dKey)!.push(id);
    }
  });

  // Report duplicates
  titles.forEach((ids, key) => {
    if (ids.length > 1) {
      issues.push({ type: "error", category: label, item: key.slice(0, 40), issue: `Дублікат title (${ids.length} записів)` });
    }
  });

  descriptions.forEach((ids, key) => {
    if (ids.length > 1 && key.length > 20) {
      issues.push({ type: "warning", category: label, item: key.slice(0, 40), issue: `Дублікат description (${ids.length} записів)` });
    }
  });

  return issues;
}

export default function SeoQualityMonitor() {
  const allIssues = useMemo(() => {
    const sources: [string, any[]][] = [
      ["Статті", ARTICLES],
      ["Консультації", mockConsultations],
      ["AI-консультації", aiConsultations],
      ["Гранти", GRANTS],
      ["Штрафи", PENALTIES],
      ["Словник", KNOWLEDGE],
      ["Закони", LAWS],
      ["КВЕД", KVED_ENTRIES],
      ["Курси", COURSES],
      ["Шаблони", TEMPLATES],
      ["Ліцензії", LICENSES],
      ["Форми бізнесу", BUSINESS_FORMS],
      ["Бухгалтери", ACCOUNTANTS as any[]],
      ["Реєстри", REGISTERS],
      ["Ставки", RATE_TABLES],
    ];

    return sources.flatMap(([label, items]) => analyzeItems(label, items));
  }, []);

  const errors = allIssues.filter(i => i.type === "error");
  const warnings = allIssues.filter(i => i.type === "warning");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          SEO Quality Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="flex gap-4">
          <Badge variant={errors.length === 0 ? "default" : "destructive"} className="gap-1">
            <XCircle className="h-3 w-3" /> {errors.length} помилок
          </Badge>
          <Badge variant={warnings.length === 0 ? "default" : "secondary"} className="gap-1">
            <AlertTriangle className="h-3 w-3" /> {warnings.length} попереджень
          </Badge>
          {allIssues.length === 0 && (
            <Badge className="gap-1">
              <CheckCircle className="h-3 w-3" /> Все OK
            </Badge>
          )}
        </div>

        {/* Issues list — top 20 */}
        {allIssues.length > 0 && (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {allIssues.slice(0, 20).map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2 py-1.5 border-b last:border-0 text-sm">
                {issue.type === "error" ? (
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <span className="font-medium">{issue.category}</span>
                  <span className="text-muted-foreground"> · </span>
                  <span className="text-muted-foreground truncate">{issue.item}</span>
                  <p className="text-xs text-muted-foreground">{issue.issue}</p>
                </div>
              </div>
            ))}
            {allIssues.length > 20 && (
              <p className="text-xs text-muted-foreground pt-2">
                + ще {allIssues.length - 20} проблем
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
