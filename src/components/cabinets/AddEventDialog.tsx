/**
 * AddEventDialog - Modal for creating user calendar events with optional reminder
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { CreateEventInput } from "@/hooks/useUserEvents";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateEventInput) => Promise<unknown>;
  initial?: Partial<CreateEventInput>;
}

const REMIND_OPTIONS: { value: string; label: string; minutes: number | null }[] = [
  { value: "none", label: "Без нагадування", minutes: null },
  { value: "15", label: "За 15 хв", minutes: 15 },
  { value: "60", label: "За 1 годину", minutes: 60 },
  { value: "1440", label: "За 1 день", minutes: 1440 },
  { value: "10080", label: "За тиждень", minutes: 10080 },
];

const toLocalInputValue = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date(Date.now() + 60 * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const AddEventDialog = ({ open, onOpenChange, onCreate, initial }: AddEventDialogProps) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [eventAt, setEventAt] = useState(toLocalInputValue(initial?.event_at));
  const [remind, setRemind] = useState<string>("60");
  const [isDeadline, setIsDeadline] = useState<boolean>(initial?.is_deadline ?? false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !eventAt) return;
    setSubmitting(true);
    const opt = REMIND_OPTIONS.find((o) => o.value === remind);
    const result = await onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      event_at: new Date(eventAt).toISOString(),
      remind_before_minutes: isDeadline ? null : opt?.minutes ?? null,
      is_deadline: isDeadline,
      source: initial?.source ?? "manual",
    });
    setSubmitting(false);
    if (result) {
      setTitle("");
      setDescription("");
      setEventAt(toLocalInputValue());
      setRemind("60");
      setIsDeadline(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Нова подія</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="event-title">Назва</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Напр. Сплата ЄСВ"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-at">Дата й час</Label>
            <Input
              id="event-at"
              type="datetime-local"
              value={eventAt}
              onChange={(e) => setEventAt(e.target.value)}
            />
          </div>
          <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3">
            <Checkbox
              id="event-deadline"
              checked={isDeadline}
              onCheckedChange={(v) => setIsDeadline(v === true)}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor="event-deadline" className="cursor-pointer">Це дедлайн</Label>
              <p className="text-xs text-muted-foreground">
                {isDeadline
                  ? "Створимо нагадування за вашими налаштуваннями (Профіль → Сповіщення)."
                  : "Увімкніть, щоб запланувати кілька нагадувань заздалегідь."}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-remind">Нагадати</Label>
            <Select value={remind} onValueChange={setRemind} disabled={isDeadline}>
              <SelectTrigger id="event-remind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMIND_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-desc">Нотатки (опційно)</Label>
            <Textarea
              id="event-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !eventAt || submitting}>
            {submitting ? "Створення…" : "Створити"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
