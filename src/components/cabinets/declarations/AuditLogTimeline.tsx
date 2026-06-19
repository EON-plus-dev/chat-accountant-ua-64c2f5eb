import { useMemo, useState } from "react";
import {
  History,
  Lock,
  ShieldCheck,
  User,
  UserCog,
  Bot,
  FileSignature,
  FileText,
  Send,
  MessageSquare,
  GitBranch,
  Filter,
  Download,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CaseAuditEntry } from "@/config/demoCabinets/declarationCases";

const ACTOR_ICON: Record<CaseAuditEntry["actorRole"], typeof User> = {
  owner: User,
  trustee: UserCog,
  tax_consultant: ShieldCheck,
  system: Bot,
};

const EVENT_META: Record<
  CaseAuditEntry["eventType"],
  { label: string; icon: typeof FileText; tone: string }
> = {
  field_changed: { label: "Зміна поля", icon: FileText, tone: "bg-muted text-muted-foreground border-transparent" },
  document_uploaded: { label: "Завантажено документ", icon: FileText, tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  status_changed: { label: "Зміна статусу", icon: GitBranch, tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30" },
  review_requested: { label: "Запит на перевірку", icon: ShieldCheck, tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  review_completed: { label: "Перевірку завершено", icon: CheckCircle2, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  signed: { label: "Підписано", icon: FileSignature, tone: "bg-primary/10 text-primary border-primary/30" },
  submitted: { label: "Подано до ДПС", icon: Send, tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  trustee_invited: { label: "Запрошено довірену особу", icon: UserCog, tone: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30" },
  comment: { label: "Коментар", icon: MessageSquare, tone: "bg-muted text-muted-foreground border-transparent" },
};

/**
 * Демо-генерація hash на базі id+createdAt — імітує hash-chain (kожен запис посилається на попередній).
 * У продакшні — реальний SHA-256 від canonical JSON + previousHash.
 */
function fakeHash(id: string, createdAt: string, prevHash: string): string {
  let h = 0;
  const input = `${prevHash}:${id}:${createdAt}`;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0");
  return `${hex}${id.slice(-2)}${createdAt.slice(-4, -1)}`;
}

interface AuditLogTimelineProps {
  entries: CaseAuditEntry[];
}

export function AuditLogTimeline({ entries }: AuditLogTimelineProps) {
  const [actorFilter, setActorFilter] = useState<"all" | CaseAuditEntry["actorRole"]>("all");
  const [eventFilter, setEventFilter] = useState<"all" | CaseAuditEntry["eventType"]>("all");

  // Build hash chain (chronological order)
  const chained = useMemo(() => {
    const sorted = [...entries].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    let prevHash = "genesis-0000";
    return sorted.map((entry) => {
      const hash = fakeHash(entry.id, entry.createdAt, prevHash);
      const result = { entry, hash, prevHash };
      prevHash = hash;
      return result;
    });
  }, [entries]);

  const filtered = useMemo(() => {
    return chained
      .filter((c) => actorFilter === "all" || c.entry.actorRole === actorFilter)
      .filter((c) => eventFilter === "all" || c.entry.eventType === eventFilter)
      .reverse(); // newest first for display
  }, [chained, actorFilter, eventFilter]);

  const handleExport = () => {
    toast({
      title: "Експорт журналу",
      description: `Демо: журнал з ${entries.length} записів готовий до завантаження (.csv + .json з hash-chain).`,
    });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 border-b space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  <History className="size-4" /> Журнал подій кейсу
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Lock className="size-3 text-emerald-600 dark:text-emerald-400" />
                  Незмінний хронологічний реєстр з hash-chain — кожен запис посилається на попередній
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="gap-1 cursor-help bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      <ShieldCheck className="size-3" /> Цілісність підтверджена
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Усі {entries.length} записів утворюють безперервний hash-ланцюг. Будь-яка спроба зміни попереднього запису порушить цілісність наступних.
                  </TooltipContent>
                </Tooltip>
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
                  <Download className="size-3.5" /> Експорт
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="size-3.5 text-muted-foreground" />
              <Select value={actorFilter} onValueChange={(v) => setActorFilter(v as any)}>
                <SelectTrigger className="h-7 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі учасники</SelectItem>
                  <SelectItem value="owner">Власник</SelectItem>
                  <SelectItem value="trustee">Довірена особа</SelectItem>
                  <SelectItem value="tax_consultant">Консультант</SelectItem>
                  <SelectItem value="system">Система / ДПС</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventFilter} onValueChange={(v) => setEventFilter(v as any)}>
                <SelectTrigger className="h-7 w-[180px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Усі події</SelectItem>
                  {(Object.keys(EVENT_META) as CaseAuditEntry["eventType"][]).map((k) => (
                    <SelectItem key={k} value={k}>{EVENT_META[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[11px] text-muted-foreground ml-auto">
                Показано: {filtered.length} з {entries.length}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              За обраними фільтрами записів немає
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(({ entry, hash, prevHash }) => {
                const Actor = ACTOR_ICON[entry.actorRole];
                const meta = EVENT_META[entry.eventType];
                const EventIcon = meta.icon;
                return (
                  <div key={entry.id} className="p-3 md:p-4 flex gap-3 hover:bg-muted/30 transition-colors">
                    {/* Actor avatar */}
                    <div className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0 border",
                      entry.actorRole === "owner" && "bg-primary/10 border-primary/30",
                      entry.actorRole === "trustee" && "bg-blue-500/10 border-blue-500/30",
                      entry.actorRole === "tax_consultant" && "bg-amber-500/10 border-amber-500/30",
                      entry.actorRole === "system" && "bg-muted border-transparent",
                    )}>
                      <Actor className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{entry.actorName}</span>
                        <Badge variant="outline" className={cn("text-[10px] h-5 gap-1", meta.tone)}>
                          <EventIcon className="size-3" /> {meta.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground tabular-nums ml-auto">
                          {new Date(entry.createdAt).toLocaleString("uk-UA", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>

                      {entry.fieldPath && (
                        <div className="text-xs">
                          <span className="font-mono text-muted-foreground">{entry.fieldPath}</span>
                          {entry.oldValue != null && entry.newValue != null && (
                            <span className="ml-1">
                              : <span className="line-through text-muted-foreground">{entry.oldValue}</span>
                              {" → "}
                              <span className="font-medium">{entry.newValue}</span>
                            </span>
                          )}
                        </div>
                      )}
                      {entry.reason && (
                        <p className="text-xs text-muted-foreground italic">«{entry.reason}»</p>
                      )}

                      {/* Hash chain footer */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground pt-1">
                        <Tooltip>
                          <TooltipTrigger className="inline-flex items-center gap-1 font-mono hover:text-foreground transition-colors">
                            <Hash className="size-2.5" />
                            {hash.slice(0, 10)}…
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs space-y-1 font-mono text-[10px]">
                            <div><span className="text-muted-foreground">hash:</span> {hash}</div>
                            <div><span className="text-muted-foreground">prev:</span> {prevHash}</div>
                          </TooltipContent>
                        </Tooltip>
                        {entry.ip && (
                          <span className="font-mono">IP: {entry.ip}</span>
                        )}
                        <Badge variant="outline" className="text-[9px] h-4 gap-0.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                          <Lock className="size-2.5" /> Незмінний
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default AuditLogTimeline;
