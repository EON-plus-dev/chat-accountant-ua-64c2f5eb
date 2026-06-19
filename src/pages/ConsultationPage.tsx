import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useEffect } from "react";

import { mockConsultations } from "@/config/consultationMockData";
import UnifiedConsultationLayout from "@/components/consultations/UnifiedConsultationLayout";
import NotFound from "./NotFound";

const ConsultationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/consultations?tag=${encodeURIComponent(tag)}`);
  };

  const item = useMemo(
    () => mockConsultations.find((c) => c.slug === slug),
    [slug]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const related = useMemo(() => {
    if (!item) return [];
    return mockConsultations
      .filter(
        (c) => c.id !== item.id && c.tags.some((t) => item.tags.includes(t))
      )
      .slice(0, 3);
  }, [item]);

  const siblings = useMemo(() => {
    if (!item) return undefined;
    const items = mockConsultations
      .filter((c) => c.audience === item.audience)
      .map((c) => ({
        slug: c.slug,
        label: c.question,
        group: c.tags[0] || "Інше",
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "uk"));
    return {
      items,
      currentSlug: item.slug,
      basePath: "/consultations",
      title: "Консультації",
      backHref: "/publications/consultations",
    };
  }, [item]);

  if (!item) return <NotFound />;

  return (
      <UnifiedConsultationLayout
        item={item}
        related={related}
        onTagClick={handleTagClick}
        siblings={siblings}
      />
  );
};

export default ConsultationPage;
