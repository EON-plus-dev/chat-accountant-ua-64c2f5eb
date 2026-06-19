import { SeoHead } from "@/components/seo/SeoHead";

interface PortalMetaProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  type?: "website" | "article" | "video.other";
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
}

/**
 * Thin wrapper around <SeoHead> that preserves the legacy PortalMeta API
 * (different prop names + automatic "| FINTODO" title suffix).
 */
export const PortalMeta = ({
  title,
  description,
  canonical,
  ogImage,
  type,
  publishedAt,
  updatedAt,
  authorName,
}: PortalMetaProps) => (
  <SeoHead
    title={title}
    description={description}
    canonical={canonical}
    ogImage={ogImage}
    ogType={type}
    publishedTime={publishedAt}
    modifiedTime={updatedAt}
    authorName={authorName}
    titleSuffix="FINTODO"
  />
);
