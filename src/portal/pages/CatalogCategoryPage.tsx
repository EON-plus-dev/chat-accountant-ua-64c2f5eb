import { Navigate, useParams, useLocation } from "react-router-dom";

/** Redirect /dovidnyky/ustanovy/:categorySlug → /dovidnyky/ustanovy?cat=:categorySlug */
const CatalogCategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const location = useLocation();

  // Preserve existing search params and merge with cat
  const existingParams = new URLSearchParams(location.search);
  existingParams.set("cat", categorySlug || "");

  return <Navigate to={`/dovidnyky/ustanovy?${existingParams.toString()}`} replace />;
};

export default CatalogCategoryPage;
