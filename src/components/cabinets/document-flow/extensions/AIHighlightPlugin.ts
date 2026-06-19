import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { MutableRefObject } from 'react';

export interface AIHighlightItem {
  id: string;
  textRef: string;
  status: 'approved' | 'needs_review' | 'accepted' | 'dismissed' | 'pending';
}

export const aiHighlightPluginKey = new PluginKey('aiHighlight');

export interface AIHighlightPluginState {
  highlights: AIHighlightItem[];
  activeHighlightId: string | null;
}

export interface AIHighlightOptions {
  highlights: AIHighlightItem[];
  activeHighlightId: string | null;
  onHighlightClickRef?: MutableRefObject<((id: string) => void) | undefined>;
}

export const AIHighlightExtension = Extension.create<AIHighlightOptions>({
  name: 'aiHighlight',

  addOptions() {
    return {
      highlights: [],
      activeHighlightId: null,
      onHighlightClickRef: undefined,
    };
  },

  addProseMirrorPlugins() {
    const extensionOptions = this.options;

    return [
      new Plugin({
        key: aiHighlightPluginKey,

        state: {
          init(): AIHighlightPluginState {
            return {
              highlights: extensionOptions.highlights,
              activeHighlightId: extensionOptions.activeHighlightId,
            };
          },
          apply(tr, value): AIHighlightPluginState {
            const meta = tr.getMeta(aiHighlightPluginKey);
            if (meta) {
              return {
                highlights: meta.highlights ?? value.highlights,
                activeHighlightId: meta.activeHighlightId !== undefined 
                  ? meta.activeHighlightId 
                  : value.activeHighlightId,
              };
            }
            return value;
          },
        },

        props: {
          decorations(state) {
            const pluginState = aiHighlightPluginKey.getState(state) as AIHighlightPluginState;
            if (!pluginState) {
              return DecorationSet.empty;
            }

            const { highlights, activeHighlightId } = pluginState;
            const decorations: Decoration[] = [];
            const doc = state.doc;

            highlights.forEach((item) => {
              if (!item.textRef || item.textRef.length < 2) return;

              doc.descendants((node, pos) => {
                if (node.isText && node.text) {
                  const text = node.text;
                  let index = text.indexOf(item.textRef);

                  while (index !== -1) {
                    const from = pos + index;
                    const to = from + item.textRef.length;

                    const highlightClass =
                      item.status === 'accepted' ? 'ai-highlight-accepted' :
                      item.status === 'dismissed' ? 'ai-highlight-dismissed' :
                      item.status === 'needs_review' ? 'ai-highlight-review' :
                      'ai-highlight-approved';

                    const isActive = item.id === activeHighlightId;
                    const classes = isActive
                      ? `${highlightClass} ai-highlight-active`
                      : highlightClass;

                    decorations.push(
                      Decoration.inline(from, to, {
                        class: `${classes} scroll-mt-20 cursor-pointer`,
                        'data-card-id': item.id,
                      })
                    );

                    index = text.indexOf(item.textRef, index + 1);
                  }
                }
              });
            });

            return DecorationSet.create(doc, decorations);
          },

          // Handle clicks on AI highlight decorations
          // CRITICAL: event.target may be a Text node, not an Element!
          handleClick(view, pos, event) {
            // Check if already handled by capture listener
            if ((event as any).__aiHighlightHandled) {
              return false;
            }
            
            // Normalize target to Element (Text nodes don't have .closest())
            let element: Element | null = null;
            if (event.target instanceof Element) {
              element = event.target;
            } else if (event.target instanceof Node && event.target.parentElement) {
              element = event.target.parentElement;
            }
            
            if (!element) {
              return false;
            }
            
            const highlightEl = element.closest('[data-card-id]');
            
            if (highlightEl) {
              const cardId = highlightEl.getAttribute('data-card-id');
              if (cardId) {
                // Mark as handled to prevent double-triggering
                (event as any).__aiHighlightHandled = true;
                // Use ref for up-to-date callback
                extensionOptions.onHighlightClickRef?.current?.(cardId);
                return true; // Stop event propagation
              }
            }
            return false; // Allow default handling
          },
        },
      }),
    ];
  },
});
