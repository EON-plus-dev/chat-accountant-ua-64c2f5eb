import { Badge } from "@/components/ui/badge";
import { renderMarkdown } from "@/lib/markdownRenderer";
import { useMemo } from "react";
import { Star, ExternalLink, AlertTriangle, Scale } from "lucide-react";

interface ContentPreviewProps {
  data: Record<string, any>;
  previewType?: string;
}

function ConsultationPreview({ data }: { data: Record<string, any> }) {
  const html = useMemo(() => data.answer ? renderMarkdown(data.answer) : "", [data.answer]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {data.audience && (
            <Badge variant="secondary">
              {data.audience === "business" ? "Бізнес" : "Фізособа"}
            </Badge>
          )}
          {data.layout && <Badge variant="outline">{data.layout === "hub" ? "Hub" : "Standard"}</Badge>}
        </div>
        {data.heroTitle && <h1 className="text-2xl font-bold text-foreground leading-tight">{data.heroTitle}</h1>}
        <h1 className="text-xl font-bold text-foreground leading-tight">{data.question || "—"}</h1>
        {data.subtitle && <p className="text-muted-foreground text-sm">{data.subtitle}</p>}
        {data.relevanceNote && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">{data.relevanceNote}</p>
        )}
        {data.headerBadges && data.headerBadges.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {data.headerBadges.map((b: string) => (
              <Badge key={b} className="text-xs">{b}</Badge>
            ))}
          </div>
        )}
        {data.tags && data.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {data.tags.map((t: string) => (
              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {data.faqItems && Array.isArray(data.faqItems) && data.faqItems.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          <p className="font-semibold text-sm">FAQ</p>
          {data.faqItems.map((item: any, i: number) => (
            <div key={i} className="text-sm">
              <p className="font-medium">{typeof item === "string" ? item : item.question}</p>
              {typeof item !== "string" && item.answer && <p className="text-muted-foreground text-xs mt-1">{item.answer}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
        {data.date && <p>Дата: {data.date}</p>}
        {data.updatedDate && <p>Оновлено: {data.updatedDate}</p>}
        {data.slug && <p>Slug: {data.slug}</p>}
      </div>
    </div>
  );
}

function ArticlePreview({ data }: { data: Record<string, any> }) {
  const TYPE_LABELS: Record<string, string> = {
    news: "Новина", guide: "Гайд", analysis: "Аналітика", change: "Зміна",
    dps: "ДПС", podcast: "Подкаст", video: "Відео",
  };
  const contentHtml = useMemo(() => data.content ? renderMarkdown(data.content) : "", [data.content]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {data.type && <Badge variant="secondary">{TYPE_LABELS[data.type] || data.type}</Badge>}
          {data.audience && <Badge variant="outline">{data.audience === "business" ? "Бізнес" : data.audience === "personal" ? "Фізособа" : "Всі"}</Badge>}
          {data.isFeatured && <Badge className="bg-amber-100 text-amber-800">Featured</Badge>}
          {data.isPremium && <Badge className="bg-primary/10 text-primary">Premium</Badge>}
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-tight">{data.title || "—"}</h1>
        {data.excerpt && <p className="text-muted-foreground text-sm leading-relaxed">{data.excerpt}</p>}
        {data.tldr && (
          <div className="bg-muted/50 rounded-lg p-3 border">
            <p className="text-xs font-semibold text-muted-foreground mb-1">TL;DR</p>
            <p className="text-sm">{data.tldr}</p>
          </div>
        )}
        {data.tags && data.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {data.tags.map((t: string) => (
              <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
            ))}
          </div>
        )}
      </div>

      {data.mediaUrl && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-1">{data.mediaType || "media"}: {data.mediaDuration || ""}</p>
          <a href={data.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1">
            <ExternalLink className="h-3 w-3" /> {data.mediaUrl}
          </a>
        </div>
      )}

      {contentHtml && (
        <div className="border-t pt-4">
          <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      )}

      <div className="border-t pt-3 text-xs text-muted-foreground space-y-1">
        {data.publishedAt && <p>Опубліковано: {data.publishedAt}</p>}
        {data.updatedAt && <p>Оновлено: {data.updatedAt}</p>}
        {data.readingMinutes && <p>Час читання: {data.readingMinutes} хв</p>}
        {data.categoryLabel && <p>Категорія: {data.categoryLabel}</p>}
        {data.slug && <p>Slug: {data.slug}</p>}
      </div>
    </div>
  );
}

function GrantPreview({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {data.status && <Badge variant={data.status === "active" ? "default" : "secondary"}>{data.status}</Badge>}
        {data.type && <Badge variant="outline">{data.type}</Badge>}
        {data.audience && <Badge variant="outline">{data.audience}</Badge>}
      </div>
      <h1 className="text-xl font-bold">{data.name || "—"}</h1>
      {data.organization && <p className="text-sm text-muted-foreground">{data.organization}</p>}
      {data.amount && <p className="text-lg font-semibold text-primary">{data.amount}</p>}
      {data.deadline && <p className="text-sm">Дедлайн: {data.deadline}</p>}
      {data.description && <p className="text-sm whitespace-pre-wrap">{data.description}</p>}
      {data.requirements?.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">Вимоги:</p>
          <ul className="list-disc list-inside text-sm space-y-1">{data.requirements.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function PenaltyPreview({ data }: { data: Record<string, any> }) {
  const severityColor: Record<string, string> = {
    critical: "bg-red-100 text-red-800", high: "bg-orange-100 text-orange-800",
    medium: "bg-yellow-100 text-yellow-800", low: "bg-green-100 text-green-800",
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {data.severity && <Badge className={severityColor[data.severity] || ""}><AlertTriangle className="h-3 w-3 mr-1" />{data.severity}</Badge>}
        {data.category && <Badge variant="outline">{data.category}</Badge>}
      </div>
      <h1 className="text-xl font-bold">{data.title || "—"}</h1>
      {data.penaltyAmount && <p className="text-lg font-semibold text-destructive">{data.penaltyAmount}</p>}
      {data.penaltyAmountSecond && <p className="text-sm text-muted-foreground">Повторно: {data.penaltyAmountSecond}</p>}
      {data.description && <p className="text-sm whitespace-pre-wrap">{data.description}</p>}
      {data.legalBasis && <p className="text-xs text-muted-foreground flex items-center gap-1"><Scale className="h-3 w-3" />{data.legalBasis}</p>}
    </div>
  );
}

function RankingPreview({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {data.initials && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground" style={{ backgroundColor: data.initialsColor }}>
            {data.initials}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{data.name || "—"}</h1>
          {data.badge && <Badge variant="outline">{data.badge}</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="text-2xl font-bold">{data.score}/100</span>
        <span className="text-muted-foreground">#{data.rank}</span>
      </div>
      {data.description && <p className="text-sm">{data.description}</p>}
      {data.pros?.length > 0 && (
        <div><p className="text-sm font-medium text-green-700 mb-1">Переваги:</p>
          <ul className="text-sm space-y-1">{data.pros.map((p: string, i: number) => <li key={i} className="flex items-start gap-1"><span className="text-green-600">✓</span>{p}</li>)}</ul>
        </div>
      )}
      {data.cons?.length > 0 && (
        <div><p className="text-sm font-medium text-red-700 mb-1">Недоліки:</p>
          <ul className="text-sm space-y-1">{data.cons.map((c: string, i: number) => <li key={i} className="flex items-start gap-1"><span className="text-red-600">✗</span>{c}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function KnowledgePreview({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{data.term || "—"}</h1>
      {data.category && <Badge variant="outline">{data.category}</Badge>}
      {data.shortDefinition && <p className="text-sm leading-relaxed">{data.shortDefinition}</p>}
      {data.relatedTermSlugs?.length > 0 && (
        <div><p className="text-xs text-muted-foreground mb-1">Пов'язані терміни:</p>
          <div className="flex gap-1 flex-wrap">{data.relatedTermSlugs.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div>
        </div>
      )}
    </div>
  );
}

function LawPreview({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {data.category && <Badge variant="outline">{data.category}</Badge>}
        {data.type && <Badge variant="secondary">{data.type}</Badge>}
      </div>
      <h1 className="text-xl font-bold">{data.shortName || data.fullName || "—"}</h1>
      {data.number && <p className="text-sm text-muted-foreground">№ {data.number}</p>}
      {data.description && <p className="text-sm">{data.description}</p>}
      {data.keyPoints?.length > 0 && (
        <div><p className="text-sm font-medium mb-1">Ключові норми:</p>
          <ul className="list-disc list-inside text-sm space-y-1">{data.keyPoints.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>
        </div>
      )}
      {data.officialUrl && <a href={data.officialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1"><ExternalLink className="h-3 w-3" />Офіційний текст</a>}
    </div>
  );
}

function GenericPreview({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined) return null;
        const strVal = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
        const isLong = strVal.length > 200;
        return (
          <div key={key} className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{key}</p>
            {isLong ? (
              <pre className="text-sm bg-muted/50 rounded p-2 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">{strVal}</pre>
            ) : (
              <p className="text-sm break-words">{strVal}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ContentPreview({ data, previewType }: ContentPreviewProps) {
  const inner = (() => {
    switch (previewType) {
      case "consultation":
      case "ai-consultation":
        return <ConsultationPreview data={data} />;
      case "article":
        return <ArticlePreview data={data} />;
      case "grant":
        return <GrantPreview data={data} />;
      case "penalty":
        return <PenaltyPreview data={data} />;
      case "ranking":
        return <RankingPreview data={data} />;
      case "knowledge":
        return <KnowledgePreview data={data} />;
      case "law":
        return <LawPreview data={data} />;
      default:
        return <GenericPreview data={data} />;
    }
  })();

  return (
    <div className="border rounded-xl shadow-sm bg-background p-6">
      {inner}
    </div>
  );
}
