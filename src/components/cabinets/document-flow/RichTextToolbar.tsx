import { Editor } from '@tiptap/react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List, 
  ListOrdered, 
  Quote,
  Table,
  Undo, 
  Redo,
  Highlighter
} from "lucide-react";

interface RichTextToolbarProps {
  editor: Editor | null;
}

export const RichTextToolbar = ({ editor }: RichTextToolbarProps) => {
  if (!editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    tooltip, 
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    tooltip: string;
    children: React.ReactNode;
  }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="icon"
            className="h-11 w-11 sm:h-9 sm:w-9 touch-manipulation"
            onClick={onClick}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="relative" data-section="rich-text-toolbar">
      {/* Left fade mask - mobile only */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none sm:hidden" 
        aria-hidden="true"
      />
      
      {/* Toolbar content - horizontal scroll on mobile */}
      <div className={cn(
        "flex items-center gap-0.5 px-2 py-2 sm:py-1.5 border-b bg-muted/30",
        "overflow-x-auto scrollbar-hide",
        "flex-nowrap min-w-0"
      )}>
        {/* Undo/Redo group */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            tooltip="Скасувати (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            tooltip="Повторити (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

        {/* Text formatting group */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            tooltip="Жирний (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            tooltip="Курсив (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            tooltip="Підкреслений (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            tooltip="Закреслений"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            tooltip="Виділення"
          >
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

        {/* Alignment group */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            tooltip="По лівому краю"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            tooltip="По центру"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            tooltip="По правому краю"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1 shrink-0" />

        {/* Lists group */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            tooltip="Маркований список"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            tooltip="Нумерований список"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            tooltip="Цитата"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            tooltip="Вставити таблицю"
          >
            <Table className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>
      
      {/* Right fade mask - mobile only */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none sm:hidden" 
        aria-hidden="true"
      />
    </div>
  );
};
