import { Badge } from "@/components/ui/badge";
import type { Article } from "@/portal/data/articles";

const TYPE_MAP: Record<Article["type"], { label: string; variant: "info" | "warning" | "secondary" | "outline" | "news" }> = {
  guide: { label: "Гайд", variant: "info" },
  change: { label: "Зміна", variant: "warning" },
  analysis: { label: "Аналіз", variant: "secondary" },
  dps: { label: "ДПС", variant: "outline" },
  news: { label: "Новина", variant: "news" },
  podcast: { label: "Подкаст 🎙", variant: "outline" },
  video: { label: "Відео 📹", variant: "outline" },
  review: { label: "Огляд 📋", variant: "secondary" },
};

interface Props {
  type: Article["type"];
}

export const BadgeCategory = ({ type }: Props) => {
  const { label, variant } = TYPE_MAP[type] ?? TYPE_MAP.news;
  return <Badge variant={variant} size="sm">{label}</Badge>;
};
