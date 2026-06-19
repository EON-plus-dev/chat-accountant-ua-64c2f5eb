import { useEffect } from "react";
import { SITE_URL } from "@/portal/seo/structuredData";

export interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "video.other";
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  locale?: string;
  keywords?: string;
  /** Optional brand suffix appended to title if not already present (e.g. "FINTODO"). */
  titleSuffix?: string;
}

export const SeoHead = ({
  title,
  description,
  canonical,
  ogImage,
  ogType,
  publishedTime,
  modifiedTime,
  authorName,
  locale,
  keywords,
  titleSuffix,
}: SeoHeadProps) => {
  useEffect(() => {
    const fullTitle =
      titleSuffix && !title.includes(titleSuffix) ? `${title} | ${titleSuffix}` : title;
    document.title = fullTitle;

    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    if (canonical) setMeta("property", "og:url", canonical);
    setMeta("property", "og:type", ogType ?? "website");
    if (ogImage) setMeta("property", "og:image", ogImage);
    if (publishedTime) setMeta("property", "article:published_time", publishedTime);
    if (modifiedTime) setMeta("property", "article:modified_time", modifiedTime);
    if (authorName) setMeta("property", "article:author", authorName);
    if (locale) setMeta("property", "og:locale", locale);
    if (keywords) setMeta("name", "keywords", keywords);

    setMeta("name", "twitter:card", ogImage ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    return () => {
      document.title = "AI-Бухгалтер | FINTODO";
      setMeta(
        "name",
        "description",
        "AI-бухгалтер для ФОП та фізосіб в Україні. Автоматичні декларації, податковий календар, AI-консультації.",
      );
    };
  }, [title, description, canonical, ogImage, ogType, publishedTime, modifiedTime, authorName, locale, keywords, titleSuffix]);

  return null;
};

export { SITE_URL as BASE_URL };
