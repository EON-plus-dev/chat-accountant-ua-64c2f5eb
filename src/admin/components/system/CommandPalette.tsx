import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  MOCK_USERS,
  MOCK_CABINETS,
  MOCK_TICKETS,
  MOCK_INCIDENTS,
  MOCK_AI_QA,
} from "@/admin/system/data/mocks";
import { Users, Building2, MessageSquare, AlertTriangle, Bot, Plus, Sparkles, Bell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Глобальний пошук + швидкі дії для адмін-центру. */
export function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();

  const go = (url: string) => {
    onOpenChange(false);
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Пошук: користувач, кабінет, тікет, інцидент, діалог…" />
      <CommandList>
        <CommandEmpty>Нічого не знайдено.</CommandEmpty>

        <CommandGroup heading="Швидкі дії">
          <CommandItem onSelect={() => { onOpenChange(false); toast({ title: "Створено чернетку тікета (демо)" }); navigate("/admin/system/incidents/tickets"); }}>
            <Plus className="h-4 w-4" /> <span>Створити тікет (демо)</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/admin/system/rules/assistant")}>
            <Sparkles className="h-4 w-4" /> <span>Створити правило з регуляторного оновлення</span>
          </CommandItem>
          <CommandItem onSelect={() => { onOpenChange(false); toast({ title: "Notify affected — оберіть інцидент" }); navigate("/admin/system/incidents"); }}>
            <Bell className="h-4 w-4" /> <span>Notify affected (демо)</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Користувачі">
          {MOCK_USERS.map((u) => (
            <CommandItem key={u.id} value={`user ${u.name} ${u.email}`} onSelect={() => go(`/admin/system/users/${u.id}`)}>
              <Users className="h-4 w-4" />
              <span>{u.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{u.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Кабінети">
          {MOCK_CABINETS.map((c) => (
            <CommandItem key={c.id} value={`cabinet ${c.name} ${c.code}`} onSelect={() => go(`/admin/system/cabinets/${c.id}`)}>
              <Building2 className="h-4 w-4" />
              <span>{c.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{c.code}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Тікети">
          {MOCK_TICKETS.map((t) => (
            <CommandItem key={t.id} value={`ticket ${t.subject} ${t.cabinet}`} onSelect={() => go(`/admin/system/incidents/tickets/${t.id}`)}>
              <MessageSquare className="h-4 w-4" />
              <span>{t.subject}</span>
              <span className="text-xs text-muted-foreground ml-2">{t.cabinet}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Інциденти">
          {MOCK_INCIDENTS.map((i) => (
            <CommandItem key={i.id} value={`incident ${i.title}`} onSelect={() => go(`/admin/system/incidents/${i.id}`)}>
              <AlertTriangle className="h-4 w-4" />
              <span>{i.title}</span>
              <span className="text-xs text-muted-foreground ml-2">{i.severity}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="AI Діалоги">
          {MOCK_AI_QA.map((q) => (
            <CommandItem key={q.id} value={`qa ${q.intent} ${q.preview}`} onSelect={() => go(`/admin/system/ai/qa/${q.id}`)}>
              <Bot className="h-4 w-4" />
              <span>{q.intent}</span>
              <span className="text-xs text-muted-foreground ml-2 truncate">{q.preview.slice(0, 60)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/** Hook для глобального ⌘K / Ctrl+K. */
export function useCommandPaletteShortcut(onOpen: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
