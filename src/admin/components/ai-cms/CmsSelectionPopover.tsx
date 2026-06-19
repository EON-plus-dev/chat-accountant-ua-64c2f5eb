import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Wand2, ShieldCheck, MessageSquarePlus, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SelectionPopoverProps {
  selectionText: string;
  rect: DOMRect | null;
  pagePath: string;
  articleTitle?: string;
  onPrompt: (prompt: string) => void;
  onCreateIdea?: (selectionText: string) => void;
  onClose: () => void;
}

const ACTIONS: { id: string; label: string; icon: typeof Sparkles; task: string }[] = [
  { id: "explain", label: "Пояснити", icon: Sparkles, task: "Поясни простими словами, що означає цей фрагмент і кому це важливо." },
  { id: "improve", label: "Покращити", icon: Wand2, task: "Перепиши фрагмент чіткіше, без води, збережи зміст і факти." },
  { id: "verify", label: "Перевірити факти", icon: ShieldCheck, task: "Перевір фактологічну точність фрагмента на актуальність 2026 року, познач сумнівні твердження." },
];

export default function CmsSelectionPopover({
  selectionText,
  rect,
  pagePath,
  articleTitle,
  onPrompt,
  onCreateIdea,
  onClose,
}: SelectionPopoverProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    // delay to avoid catching the mouseup that opened it
    const t = setTimeout(() => window.addEventListener("mousedown", onClick), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      window.removeEventListener("mousedown", onClick);
    };
  }, [onClose]);

  if (!rect) return null;

  const buildPrompt = (task: string) => {
    const titleLine = articleTitle ? `Стаття: "${articleTitle}"\n` : "";
    return `Сторінка: ${pagePath}\n${titleLine}Виділений фрагмент:\n"""${selectionText}"""\nЗадача: ${task}`;
  };

  const fire = (task: string) => {
    onPrompt(buildPrompt(task));
    onClose();
  };

  const top = window.scrollY + rect.top - 8;
  const left = window.scrollX + rect.left + rect.width / 2;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "absolute",
        top,
        left,
        transform: "translate(-50%, -100%)",
        zIndex: 60,
      }}
      className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-1.5 flex items-center gap-1 max-w-[min(92vw,520px)]"
      role="dialog"
      aria-label="AI-дії над виділеним"
    >
      {!customOpen ? (
        <>
          {ACTIONS.map((a) => (
            <Button
              key={a.id}
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => fire(a.task)}
            >
              <a.icon className="h-3.5 w-3.5 text-primary" />
              {a.label}
            </Button>
          ))}
          {onCreateIdea && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => {
                onCreateIdea(selectionText);
                onClose();
              }}
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Ідея
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => setCustomOpen(true)}
          >
            <MessageSquarePlus className="h-3.5 w-3.5" /> Свій запит…
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 ml-1"
            onClick={onClose}
            aria-label="Закрити"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) fire(custom.trim());
          }}
          className="flex items-center gap-1 w-[420px] max-w-[92vw]"
        >
          <Input
            autoFocus
            placeholder="Що зробити з цим фрагментом?"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="h-7 text-xs"
          />
          <Button size="sm" className="h-7 text-xs">Надіслати</Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setCustomOpen(false)}
            aria-label="Назад"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </form>
      )}
    </div>,
    document.body,
  );
}
