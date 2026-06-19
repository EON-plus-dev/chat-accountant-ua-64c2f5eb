import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Globe, Copy, Calculator, CalendarDays, Banknote, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArticleCard } from "@/portal/components/ArticleCard";
import type { Article } from "@/portal/data/articles";
import type { Author } from "@/portal/data/authors";
import { ARTICLES } from "@/portal/data/articles";
import { AUTHORS } from "@/portal/data/authors";
import { SITE_URL } from "@/portal/seo/structuredData";
import { toast } from "sonner";

const ARTICLE_INSTITUTION_MAP: Record<string, { slug: string; name: string; note: string }> = {
  'wise-dlya-fop': { slug: 'wise', name: 'Wise', note: 'Міжнародні перекази' },
  'mizhnarodni-perekazy': { slug: 'wise', name: 'Wise', note: 'Міжнародні перекази' },
  'strahuvannya-biznesu': { slug: 'usg', name: 'USG', note: 'Страхування бізнесу' },
  'ostsv-onlajn': { slug: 'usg', name: 'USG', note: 'Страхування онлайн' },
  'nova-poshta-api': { slug: 'nova-poshta', name: 'Нова Пошта', note: 'Логістика та доставка' },
  'startupy-ukraina': { slug: 'unit-city', name: 'Unit.City', note: 'Підтримка стартапів' },
  'usaid-granty': { slug: 'usaid-biz', name: 'USAID', note: 'Гранти до $50 000' },
  'edo-elektronnyj-dokumentoobig': { slug: 'vchasno-edo', name: 'Вчасно', note: 'Електронний документообіг' },
  'dia-pidpys': { slug: 'diia-sign', name: 'Дія.Підпис', note: 'Безкоштовний КЕП' },
  'kreditna-istoriya': { slug: 'ubki', name: 'УБКІ', note: 'Кредитна історія' },
  'liqpay-ekvayryn': { slug: 'liqpay', name: 'LiqPay', note: 'Онлайн-еквайринг' },
};

interface Props {
  article: Article;
  author: Author;
}

const SIDEBAR_TOOLS = [
  { label: "Калькулятор ЄСВ", href: "/tools/esv-calc", icon: Calculator },
  { label: "Податковий календар", href: "/tools/calendar", icon: CalendarDays },
  { label: "Калькулятор зарплати", href: "/tools/salary-calc", icon: Banknote },
];

export const ArticleSidebar = ({ article, author }: Props) => {
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSent, setAlertSent] = useState(false);

  const matchedInstitution = ARTICLE_INSTITUTION_MAP[article.slug];

  const isMedia = article.mediaType === 'podcast' || article.mediaType === 'video';

  // For media: show other episodes of same type; for text: topic-based
  const relatedArticles = (() => {
    if (isMedia) {
      const sameType = ARTICLES
        .filter((a) => a.id !== article.id && a.mediaType === article.mediaType)
        .sort((a, b) => b.views - a.views)
        .slice(0, 4);
      if (sameType.length >= 2) return sameType;
    }
    const topicRelated = ARTICLES
      .filter((a) => a.id !== article.id && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))))
      .sort((a, b) => b.views - a.views)
      .slice(0, 4);
    return topicRelated.length >= 2
      ? topicRelated
      : ARTICLES.filter((a) => a.id !== article.id).sort((a, b) => b.views - a.views).slice(0, 4);
  })();

  const relatedTitle = article.mediaType === 'podcast' ? 'Інші випуски' : article.mediaType === 'video' ? 'Інші відео' : "Пов'язані статті";
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(articleUrl);
    toast.success("Скопійовано!");
  };

  const handleShare = (platform: "telegram" | "linkedin") => {
    const urls = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
    };
    window.open(urls[platform], "_blank", "noopener");
  };

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      {/* Author card */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={author.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {author.initials}
              </span>
            )}
            <div>
              <p className="font-medium text-foreground text-sm">{author.name}</p>
              <p className="text-xs text-muted-foreground">{author.title}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {author.articlesCount} статей · {author.yearsExperience} років досвіду
          </p>
          <Link to="/taxes" className="text-xs font-medium text-primary hover:underline">
            Всі статті →
          </Link>
        </CardContent>
      </Card>

      {/* Related articles */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{relatedTitle}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {relatedArticles.map((a) => {
            const relAuthor = AUTHORS.find((au) => au.id === a.authorId);
            return <ArticleCard key={a.id} article={a} author={relAuthor} size="compact" />;
          })}
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Інструменти</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {SIDEBAR_TOOLS.map((tool) => (
            <Button key={tool.href} variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link to={tool.href}><tool.icon className="h-4 w-4" /> {tool.label}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Contextual institution */}
      {matchedInstitution && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Рекомендований сервіс</p>
            <Link
              to={`/dovidnyky/ustanovy/profile/${matchedInstitution.slug}`}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {matchedInstitution.name}
              <ExternalLink className="h-3 w-3" />
            </Link>
            <p className="text-xs text-muted-foreground">{matchedInstitution.note}</p>
          </CardContent>
        </Card>
      )}

      {/* Change alert */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Сповіщення про зміни</p>
          {alertSent ? (
            <p className="text-sm text-primary">✓ Підписано!</p>
          ) : (
            <>
              <Input
                type="email"
                placeholder="Email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
              />
              <Button size="sm" className="w-full" onClick={() => setAlertSent(true)}>
                Підписатись
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ask AI */}
      <Card>
        <CardContent className="p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Питання по темі?</p>
          <Link
            to={`/consultant?ctx=article&id=${article.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Запитати AI →
          </Link>
        </CardContent>
      </Card>

      {/* Share */}
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => handleShare("telegram")} title="Telegram">
          <Send className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleShare("linkedin")} title="LinkedIn">
          <Globe className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleCopy} title="Копіювати">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
};
