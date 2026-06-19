import { useState } from "react";
import type { Article } from "@/portal/data/articles";
import { Badge } from "@/components/ui/badge";
import { ListChecks, FileText, Share2, Mic, Users, Clock, ExternalLink, Headphones, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Props {
  article: Article;
  allEpisodes?: Article[];
  currentIndex?: number;
}

const PODCAST_PLATFORMS = [
  { label: "Apple Podcasts", href: "#", icon: "🎧" },
  { label: "Spotify", href: "#", icon: "🟢" },
  { label: "Google Podcasts", href: "#", icon: "🎵" },
];

const TRANSCRIPT_PREVIEW_LENGTH = 300;

export const MediaArticleBody = ({ article, allEpisodes, currentIndex }: Props) => {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const isPodcast = article.mediaType === "podcast";
  const sectionTitle = isPodcast ? "Про що цей випуск" : "Про що це відео";

  const keyPoints = article.tldr
    .split(/[.;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const hasLongTranscript = article.transcript && article.transcript.length > TRANSCRIPT_PREVIEW_LENGTH;
  const transcriptPreview = hasLongTranscript
    ? article.transcript!.slice(0, TRANSCRIPT_PREVIEW_LENGTH) + "…"
    : article.transcript;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <article className="space-y-8">
      {/* About section */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
          <FileText className="h-5 w-5 text-primary" />
          {sectionTitle}
        </h2>
        <p className="text-muted-foreground leading-relaxed">{article.excerpt}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              #{tag}
            </Badge>
          ))}
        </div>
      </section>

      {/* Guests */}
      {article.guests && article.guests.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
            <Users className="h-5 w-5 text-primary" />
            {isPodcast ? "Гості випуску" : "Учасники"}
          </h2>
          <ul className="space-y-2">
            {article.guests.map((guest, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{guest}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Chapters / Timestamps */}
      {article.chapters && article.chapters.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
            <Clock className="h-5 w-5 text-primary" />
            Таймкоди
          </h2>
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-1.5">
            {article.chapters.map((ch, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-primary shrink-0 w-12">{ch.time}</span>
                <span className="text-muted-foreground">{ch.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key points */}
      {keyPoints.length > 1 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
            <ListChecks className="h-5 w-5 text-primary" />
            Ключові тези
          </h2>
          <ul className="space-y-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Transcript */}
      {article.transcript && (
        <section itemProp="transcript">
          <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
              <FileText className="h-5 w-5 text-primary" />
              Транскрипція
            </h2>
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              {hasLongTranscript ? (
                <>
                  {!transcriptOpen && (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {transcriptPreview}
                    </p>
                  )}
                  <CollapsibleContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {article.transcript}
                    </p>
                  </CollapsibleContent>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="mt-3 gap-1.5 text-primary hover:text-primary/80">
                      {transcriptOpen ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Згорнути
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Читати повністю
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {article.transcript}
                </p>
              )}
            </div>
          </Collapsible>
        </section>
      )}

      {/* External links */}
      {article.externalLinks && article.externalLinks.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
            <ExternalLink className="h-5 w-5 text-primary" />
            Корисні посилання
          </h2>
          <ul className="space-y-2">
            {article.externalLinks.map((link, i) => (
              <li key={i}>
                <Link
                  to={link.url}
                  className="text-sm text-primary hover:underline flex items-center gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Subscribe CTA for podcasts */}
      {isPodcast && (
        <section className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Headphones className="h-4 w-4 text-primary" />
            Слухайте також на
          </h2>
          <div className="flex flex-wrap gap-2">
            {PODCAST_PLATFORMS.map((p) => (
              <Button key={p.label} variant="outline" size="sm" asChild className="gap-1.5">
                <a href={p.href} target="_blank" rel="noopener noreferrer">
                  <span>{p.icon}</span>
                  {p.label}
                </a>
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Download for podcasts */}
      {isPodcast && (article as any).audioUrl && (
        <section>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <a href={(article as any).audioUrl} download>
              <Download className="h-4 w-4" />
              Завантажити випуск
            </a>
          </Button>
        </section>
      )}

      {/* Next / Previous episode */}
      {allEpisodes && allEpisodes.length > 1 && currentIndex !== undefined && (
        <section className="flex items-center justify-between gap-4 pt-4 border-t border-border/40">
          {currentIndex > 0 ? (
            <Link
              to={`/articles/${allEpisodes[currentIndex - 1].slug}`}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{allEpisodes[currentIndex - 1].title}</span>
            </Link>
          ) : <span />}
          {currentIndex < allEpisodes.length - 1 ? (
            <Link
              to={`/articles/${allEpisodes[currentIndex + 1].slug}`}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline ml-auto"
            >
              <span className="truncate max-w-[200px]">{allEpisodes[currentIndex + 1].title}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </section>
      )}

      {/* Share */}
      <section className="pt-4 border-t border-border/40">
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Поділитися
        </Button>
      </section>
    </article>
  );
};
