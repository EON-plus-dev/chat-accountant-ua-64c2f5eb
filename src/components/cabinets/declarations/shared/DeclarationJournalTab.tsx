import { CheckCircle2, FileText, Send, ShieldCheck, GitBranch, MessageSquare, FileSignature } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface JournalEntry {
  at: string; // ISO або людський рядок
  actor?: string;
  actorRole?: "owner" | "trustee" | "tax_consultant" | "system";
  eventType?: "field_changed" | "document_uploaded" | "status_changed" | "review_requested" | "review_completed" | "signed" | "submitted" | "trustee_invited" | "comment";
  label: string;
  details?: string;
}

const EVENT_META: Record<NonNullable<JournalEntry["eventType"]>, { icon: typeof FileText; tone: string }> = {
  field_changed: { icon: FileText, tone: "bg-muted text-muted-foreground" },
  document_uploaded: { icon: FileText, tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  status_changed: { icon: GitBranch, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  review_requested: { icon: ShieldCheck, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  review_completed: { icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  signed: { icon: FileSignature, tone: "bg-primary/10 text-primary" },
  submitted: { icon: Send, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  trustee_invited: { icon: FileText, tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  comment: { icon: MessageSquare, tone: "bg-muted text-muted-foreground" },
};

const fmtDateTime = (iso: string) => {
  // Якщо це справжній ISO — форматуємо. Інакше повертаємо as-is.
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" });
};

interface Props {
  entries: JournalEntry[];
  emptyText?: string;
}

export function DeclarationJournalTab({ entries, emptyText = "Подій ще немає." }: Props) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="size-6 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">{emptyText}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {entries.map((e, idx) => {
            const meta = e.eventType ? EVENT_META[e.eventType] : undefined;
            const Icon = meta?.icon ?? FileText;
            return (
              <div key={idx} className="px-4 py-3 flex items-start gap-3">
                <div className={cn("rounded-md p-1.5 shrink-0", meta?.tone ?? "bg-muted text-muted-foreground")}>
                  <Icon className="size-3.5" />
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">{e.label}</span>
                    {e.actor && (
                      <Badge variant="outline" className="text-[10px] h-5">{e.actor}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground tabular-nums">{fmtDateTime(e.at)}</span>
                  </div>
                  {e.details && (
                    <div className="text-xs text-muted-foreground">{e.details}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
