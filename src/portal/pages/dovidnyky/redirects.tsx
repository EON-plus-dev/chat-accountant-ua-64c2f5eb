import { Navigate, useParams } from "react-router-dom";

export function RedirectRankingsCat() {
  const { categorySlug } = useParams();
  return <Navigate to={`/publications/ratings/${categorySlug}`} replace />;
}

export function RedirectRankingsItem() {
  const { categorySlug, itemSlug } = useParams();
  return <Navigate to={`/publications/ratings/${categorySlug}/${itemSlug}`} replace />;
}

export function RedirectKnowledgeSlug() {
  const { slug } = useParams();
  return <Navigate to={`/dovidnyky/slovnyk/${slug}`} replace />;
}

export function RedirectCatalogCat() {
  const { categorySlug } = useParams();
  return <Navigate to={`/dovidnyky/ustanovy?cat=${categorySlug}`} replace />;
}

export function RedirectCatalogType() {
  const { categorySlug, typeSlug } = useParams();
  return <Navigate to={`/dovidnyky/ustanovy/${categorySlug}/${typeSlug}`} replace />;
}

export function RedirectInstitutionProfile() {
  const { slug } = useParams();
  return <Navigate to={`/dovidnyky/ustanovy/profile/${slug}`} replace />;
}

// Old category slug redirects (renamed categories)
export function RedirectOldCatalogSlug({ from, to }: { from: string; to: string }) {
  return <Navigate to={`/dovidnyky/ustanovy/${to}`} replace />;
}
