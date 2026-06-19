import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { getDocumentsByCategory, type PersonalDocCategory } from "@/personal/documents/personalDocumentsMock";

interface Props {
  cabinetId: string;
  category: PersonalDocCategory;
}

export function PersonalDocumentsCategory({ cabinetId, category }: Props) {
  const docs = getDocumentsByCategory(cabinetId, category);
  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground">У цій категорії документів ще немає.</p>;
  }
  return (
    <div className="grid gap-2">
      {docs.map((d) => (
        <Card key={d.id} className="p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">{d.title}</span>
              {d.signed && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">КЕП</Badge>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 flex gap-2 flex-wrap">
              <span>видано: {d.issuedAt}</span>
              {d.expiresAt && <span>дійсний до: {d.expiresAt}</span>}
              <span>· {d.source}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
