/**
 * AiEventProposalCard - Inline card rendered inside chat when AI proposes a calendar event.
 * User can confirm/edit/cancel; on confirm, the event is created via useUserEvents.
 */
import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar, Bell, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserEvents, type CreateEventInput } from "@/hooks/useUserEvents";
import AddEventDialog from "@/components/cabinets/AddEventDialog";

export interface ProposedEvent {
  title: string;
  event_at: string; // ISO
  remind_before_minutes: number | null;
  notes?: string;
}

interface AiEventProposalCardProps {
  proposal: ProposedEvent;
  cabinetId?: string | null;
}

export const AiEventProposalCard = ({ proposal, cabinetId }: AiEventProposalCardProps) => {
  const { createEvent } = useUserEvents(cabinetId ?? null);
  const [state, setState] = useState<"idle" | "creating" | "created" | "cancelled">("idle");
  const [editOpen, setEditOpen] = useState(false);

  const date = new Date(proposal.event_at);
  const isValid = !isNaN(date.getTime());

  const handleCreate = async (input?: CreateEventInput) => {
    setState("creating");
    const res = await createEvent(
      input ?? {
        title: proposal.title,
        event_at: proposal.event_at,
        description: proposal.notes,
        remind_before_minutes: proposal.remind_before_minutes,
        source: "ai",
        cabinet_id: cabinetId ?? null,
      }
    );
    setState(res ? "created" : "idle");
  };

  if (state === "cancelled") {
    return (
      <div className="text-xs text-muted-foreground italic px-3 py-2">
        Пропозицію події скасовано
      </div>
    );
  }

  if (state === "created") {
    return (
      <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-xs flex items-center gap-2">
        <Check className="w-4 h-4 text-success" />
        <span>Подію «{proposal.title}» додано до «Мої події»</span>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">AI пропонує створити подію</span>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium">{proposal.title}</div>
          <div className="text-xs text-muted-foreground tabular-nums flex items-center gap-2 flex-wrap">
            {isValid ? format(date, "d MMMM yyyy · HH:mm", { locale: uk }) : proposal.event_at}
            {proposal.remind_before_minutes != null && (
              <Badge variant="outline" size="sm" className="gap-1 text-[10px]">
                <Bell className="w-3 h-3" />
                {proposal.remind_before_minutes >= 1440
                  ? `за ${Math.round(proposal.remind_before_minutes / 1440)} дн.`
                  : `за ${proposal.remind_before_minutes} хв`}
              </Badge>
            )}
          </div>
          {proposal.notes && (
            <div className="text-xs text-muted-foreground">{proposal.notes}</div>
          )}
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          <Button
            size="sm"
            className="h-7 text-xs"
            disabled={state === "creating" || !isValid}
            onClick={() => handleCreate()}
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            {state === "creating" ? "Створення…" : "Створити"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Редагувати
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => setState("cancelled")}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Скасувати
          </Button>
        </div>
      </div>

      <AddEventDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onCreate={async (input) => {
          await handleCreate(input);
          return true;
        }}
        initial={{
          title: proposal.title,
          event_at: proposal.event_at,
          description: proposal.notes,
          source: "ai",
          is_deadline: true,
        }}
      />
    </>
  );
};

/**
 * Parse a [CALENDAR_EVENT]...[/CALENDAR_EVENT] block from AI text.
 * Returns { proposal, cleanedText } or null if no valid block found.
 */
export function parseCalendarProposal(
  text: string
): { proposal: ProposedEvent; cleanedText: string } | null {
  const re = /\[CALENDAR_EVENT\]([\s\S]*?)\[\/CALENDAR_EVENT\]/i;
  const m = text.match(re);
  if (!m) return null;
  const body = m[1];
  const get = (key: string) => {
    const r = new RegExp(`^\\s*${key}\\s*:\\s*(.+?)\\s*$`, "im");
    const mm = body.match(r);
    return mm ? mm[1].trim() : "";
  };
  const title = get("title");
  const event_at = get("event_at");
  const remindRaw = get("remind_before_minutes");
  const notes = get("notes");
  if (!title || !event_at) return null;
  const remind_before_minutes = remindRaw ? parseInt(remindRaw, 10) : null;
  return {
    proposal: {
      title,
      event_at,
      remind_before_minutes: Number.isFinite(remind_before_minutes as number)
        ? (remind_before_minutes as number)
        : null,
      notes: notes || undefined,
    },
    cleanedText: text.replace(re, "").trim(),
  };
}

export default AiEventProposalCard;
