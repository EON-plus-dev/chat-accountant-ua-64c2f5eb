import { FileCheck2, FileText, Download, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type GeneratedDocStatus = "not_ready" | "draft" | "ready" | "submitted";

export interface GeneratedDoc {
  /** Код форми, напр. F0100114, J0108601 */
  formCode: string;
  /** Людська назва */
  title: string;
  status: GeneratedDocStatus;
}

const STATUS_META: Record<GeneratedDocStatus, { label: string; tone: string }> = {
  not_ready: { label: "Не готово", tone: "bg-muted text-muted-foreground" },
  draft: { label: "Чернетка", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  ready: { label: "Готово", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  submitted: { label: "Подано", tone: "bg-primary/10 text-primary" },
};

interface Props {
  docs: GeneratedDoc[];
}

export function GeneratedDocumentsBlock({ docs }: Props) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2.5">
        <h3 className="font-medium text-sm flex items-center gap-2">
          <FileCheck2 className="size-4" /> Згенеровані документи
        </h3>
        {docs.length === 0 ? (
          <p className="text-xs text-muted-foreground">Документи зʼявляться після підготовки до подання.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => {
              const meta = STATUS_META[d.status];
              const enabled = d.status !== "not_ready";
              return (
                <li key={d.formCode} className="rounded-md border p-2 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-muted-foreground">{d.formCode}</div>
                      <div className="text-sm font-medium leading-tight">{d.title}</div>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] h-5 shrink-0", meta.tone)}>
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs flex-1 gap-1"
                      disabled={!enabled}
                      onClick={() =>
                        toast({
                          title: `${d.formCode}`,
                          description: `Демо: попередній перегляд форми «${d.title}».`,
                        })
                      }
                    >
                      <Eye className="size-3" /> Переглянути
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={!enabled}
                      onClick={() =>
                        toast({
                          title: `Завантаження ${d.formCode}`,
                          description: "Демо: XML-файл для подачі через Кабінет ДПС.",
                        })
                      }
                    >
                      <Download className="size-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1 pt-1">
          <FileText className="size-3" /> Файли формуються автоматично за чинною формою ДПС.
        </p>
      </CardContent>
    </Card>
  );
}
