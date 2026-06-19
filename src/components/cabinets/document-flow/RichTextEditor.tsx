import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useEffect, useRef, forwardRef, useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { RichTextToolbar } from "./RichTextToolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIHighlightExtension, AIHighlightItem, aiHighlightPluginKey } from './extensions/AIHighlightPlugin';
import { TemplateSelectionPopover } from "./TemplateSelectionPopover";

interface TextSelection {
  text: string;
  x: number;
  y: number;
}

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  aiHighlights?: AIHighlightItem[];
  activeHighlightId?: string | null;
  onHighlightClick?: (id: string) => void;
  // Text selection for field creation
  onCreateFieldFromSelection?: (selection: TextSelection) => void;
  onFindSimilar?: (text: string) => void;
  showSelectionPopover?: boolean;
}

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(({ 
  content, 
  onChange, 
  className,
  aiHighlights = [],
  activeHighlightId = null,
  onHighlightClick,
  onCreateFieldFromSelection,
  onFindSimilar,
  showSelectionPopover = true,
}, ref) => {
  // Store callback in ref to avoid recreating editor
  const onHighlightClickRef = useRef(onHighlightClick);
  onHighlightClickRef.current = onHighlightClick;

  // Store highlights in ref to use in editor initialization
  const aiHighlightsRef = useRef(aiHighlights);
  aiHighlightsRef.current = aiHighlights;

  // Text selection state for popover
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({ 
        types: ['heading', 'paragraph'] 
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({ 
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      AIHighlightExtension.configure({
        highlights: aiHighlights,
        activeHighlightId: activeHighlightId,
        onHighlightClickRef: onHighlightClickRef, // Pass ref for stable callback access
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full p-4',
      },
    },
  });

  // Update highlights dynamically via plugin state with delay for editor readiness
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    // Small delay to ensure editor view is fully ready
    const timeoutId = setTimeout(() => {
      if (editor && !editor.isDestroyed) {
        editor.view.dispatch(
          editor.state.tr.setMeta(aiHighlightPluginKey, {
            highlights: aiHighlights,
            activeHighlightId,
          })
        );
        
        // Force view update to ensure decorations are rendered
        editor.view.updateState(editor.view.state);
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [editor, aiHighlights, activeHighlightId]);

  // Fallback capture-phase click listener for Text→Card sync
  // This fires BEFORE ProseMirror's handlers, ensuring we catch clicks even when PM swallows them
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const handleCaptureClick = (event: MouseEvent) => {
      // Skip if already handled
      if ((event as any).__aiHighlightHandled) return;

      // Normalize target to Element (Text nodes don't have .closest())
      let element: Element | null = null;
      if (event.target instanceof Element) {
        element = event.target;
      } else if (event.target instanceof Node && (event.target as Node).parentElement) {
        element = (event.target as Node).parentElement;
      }

      if (!element) return;

      const highlightEl = element.closest('[data-card-id]');
      if (highlightEl) {
        const cardId = highlightEl.getAttribute('data-card-id');
        if (cardId) {
          // Mark as handled to prevent double-triggering with plugin handleClick
          (event as any).__aiHighlightHandled = true;
          onHighlightClickRef.current?.(cardId);
        }
      }
    };

    // Attach to editor DOM in capture phase
    const editorDom = editor.view.dom;
    editorDom.addEventListener('click', handleCaptureClick, true);

    return () => {
      editorDom.removeEventListener('click', handleCaptureClick, true);
    };
  }, [editor]);

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Text selection listener for popover
  useEffect(() => {
    if (!editor || editor.isDestroyed || !showSelectionPopover) return;

    const handleSelectionUpdate = () => {
      const { from, to, empty } = editor.state.selection;
      
      // Clear selection if empty or too short
      if (empty || from === to) {
        setSelection(null);
        return;
      }
      
      const text = editor.state.doc.textBetween(from, to);
      if (text.trim().length < 2) {
        setSelection(null);
        return;
      }
      
      // Get position from DOM for popover placement
      const coords = editor.view.coordsAtPos(to);
      
      // Calculate position relative to container
      const containerRect = editorContainerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setSelection({
          text: text.trim(),
          x: coords.left - containerRect.left,
          y: coords.top - containerRect.top,
        });
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, showSelectionPopover]);

  // Handle create field from selection
  const handleCreateField = useCallback(() => {
    if (selection && onCreateFieldFromSelection) {
      onCreateFieldFromSelection(selection);
      setSelection(null);
    }
  }, [selection, onCreateFieldFromSelection]);

  // Handle find similar
  const handleFindSimilarText = useCallback(() => {
    if (selection && onFindSimilar) {
      onFindSimilar(selection.text);
      setSelection(null);
    }
  }, [selection, onFindSimilar]);

  // Handle copy
  const handleCopy = useCallback(() => {
    if (selection) {
      navigator.clipboard.writeText(selection.text);
      setSelection(null);
    }
  }, [selection]);

  // Close popover
  const handleClosePopover = useCallback(() => {
    setSelection(null);
  }, []);


  return (
    <div 
      ref={editorContainerRef}
      className={cn("relative flex flex-col h-full border rounded-md overflow-hidden bg-background isolate", className)}
    >
      {/* Formatting Toolbar */}
      <RichTextToolbar editor={editor} />
      
      {/* Editor Content - ref on wrapper div for reliable scrollIntoView targeting */}
      <ScrollArea className="flex-1 min-h-0" style={{ overscrollBehavior: 'contain' }}>
        <div ref={ref} className="tiptap-editor-wrapper">
          <EditorContent 
            editor={editor} 
            className="tiptap-editor h-full"
          />
        </div>
      </ScrollArea>
      
      {/* Text Selection Popover */}
      {selection && showSelectionPopover && onCreateFieldFromSelection && (
        <TemplateSelectionPopover
          selectedText={selection.text}
          position={{ x: selection.x, y: selection.y }}
          onCreateField={handleCreateField}
          onFindSimilar={handleFindSimilarText}
          onCopy={handleCopy}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';