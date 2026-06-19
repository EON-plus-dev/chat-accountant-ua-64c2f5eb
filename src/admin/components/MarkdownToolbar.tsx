import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Bold, Italic, Link, Heading2, Heading3, List, ListOrdered,
  Table, Box, CheckCircle2, Info, Eye, PenLine,
} from "lucide-react";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onUpdate: (value: string) => void;
  isPreview: boolean;
  onTogglePreview: () => void;
}

type ToolAction = {
  icon: React.ElementType;
  label: string;
  wrap?: [string, string];
  insert?: string;
};

const tools: ToolAction[] = [
  { icon: Bold, label: "Жирний", wrap: ["**", "**"] },
  { icon: Italic, label: "Курсив", wrap: ["*", "*"] },
  { icon: Link, label: "Посилання", wrap: ["[", "](url)"] },
  { icon: Heading2, label: "H2", wrap: ["\n## ", "\n"] },
  { icon: Heading3, label: "H3", wrap: ["\n### ", "\n"] },
  { icon: List, label: "Список", insert: "\n- Пункт 1\n- Пункт 2\n- Пункт 3\n" },
  { icon: ListOrdered, label: "Нумерований", insert: "\n1. Пункт 1\n2. Пункт 2\n3. Пункт 3\n" },
  { icon: Table, label: "Таблиця", insert: "\n| Стовпець 1 | Стовпець 2 | Стовпець 3 |\n|---|---|---|\n| Дані | Дані | Дані |\n" },
  { icon: Box, label: ":::container", insert: "\n:::container\n**Заголовок блоку**\n\nТекст контейнера\n:::\n" },
  { icon: CheckCircle2, label: ":::conclusion", insert: "\n:::conclusion\n**Висновок**\n\nТекст висновку\n:::\n" },
  { icon: Info, label: ":::intro", insert: "\n:::intro\n**Для кого ця консультація?**\n\nОпис цільової аудиторії\n:::\n" },
];

export default function MarkdownToolbar({ textareaRef, onUpdate, isPreview, onTogglePreview }: MarkdownToolbarProps) {
  const applyTool = (tool: ToolAction) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = ta.value;
    const selected = text.slice(start, end);

    let newText: string;
    let cursorPos: number;

    if (tool.wrap) {
      const [before, after] = tool.wrap;
      const replacement = selected || "текст";
      newText = text.slice(0, start) + before + replacement + after + text.slice(end);
      cursorPos = start + before.length + replacement.length;
    } else if (tool.insert) {
      newText = text.slice(0, end) + tool.insert + text.slice(end);
      cursorPos = end + tool.insert.length;
    } else {
      return;
    }

    onUpdate(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <div className="flex items-center gap-0.5 flex-wrap border-b bg-muted/30 px-2 py-1 rounded-t-md">
      {tools.map((tool) => (
        <Tooltip key={tool.label}>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => applyTool(tool)}
              disabled={isPreview}
            >
              <tool.icon className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">{tool.label}</TooltipContent>
        </Tooltip>
      ))}
      <div className="ml-auto">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={onTogglePreview}
        >
          {isPreview ? <PenLine className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {isPreview ? "Редактор" : "Preview"}
        </Button>
      </div>
    </div>
  );
}
