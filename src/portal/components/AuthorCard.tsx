import { Newspaper } from "lucide-react";
import type { Author } from "@/portal/data/authors";

interface Props {
  author: Author;
  date?: string;
  readingMinutes?: number;
}

export const AuthorCard = ({ author, date, readingMinutes }: Props) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Newspaper className="h-3.5 w-3.5" />
    </span>
    <span className="font-medium text-foreground">{author.name}</span>
    {date && <span>· {date}</span>}
    {readingMinutes && <span>· {readingMinutes} хв</span>}
  </div>
);
