import { Badge } from "@/components/ui/badge";

interface Props {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}

export const TagCloud = ({ tags, selected, onSelect }: Props) => {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selected === null ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => onSelect(null)}
      >
        Всі
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selected === tag ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onSelect(selected === tag ? null : tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
};
