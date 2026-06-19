import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  countByPriority,
  getHighestPriority,
  sortByPriority,
  type AttentionItem,
} from "./types";
import { AttentionInboxItem } from "./AttentionInboxItem";
import { AttentionInboxBottomSheet } from "./AttentionInboxBottomSheet";

interface AttentionInboxProps {
  /** Унікальний ключ розділу — використовується для sessionStorage memo. */
  sectionKey: string;
  items: AttentionItem[];
  /** Опціональний слот зверху картки (наприклад AI-status strip). */
  topSlot?: ReactNode;
  /** Скільки normal items показувати до «Показати ще». За замовчуванням 5. */
  normalLimit?: number;
}

const NORMAL_LIMIT_DEFAULT = 5;

function storageKey(section: string) {
  return `attention-inbox:${section}`;
}

function readMemo(section: string): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.sessionStorage.getItem(storageKey(section));
    if (v === "open") return true;
    if (v === "closed") return false;
    return null;
  } catch {
    return null;
  }
}

function writeMemo(section: string, open: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(section), open ? "open" : "closed");
  } catch {
    /* noop */
  }
}

export function AttentionInbox({
  sectionKey,
  items,
  topSlot,
  normalLimit = NORMAL_LIMIT_DEFAULT,
}: AttentionInboxProps) {
  const isMobile = useIsMobile();
  const sorted = useMemo(() => sortByPriority(items), [items]);
  const counts = useMemo(() => countByPriority(sorted), [sorted]);
  const highest = useMemo(() => getHighestPriority(sorted), [sorted]);

  const defaultOpen = highest === "critical";
  const [open, setOpen] = useState<boolean>(() => {
    const memo = readMemo(sectionKey);
    if (memo === null) return defaultOpen;
    return memo;
  });
  const [showAllNormal, setShowAllNormal] = useState(false);
  const [sheetItem, setSheetItem] = useState<AttentionItem | null>(null);

  // Якщо з'явився critical і користувач не приймав рішення в цій сесії — авто-розгортаємо
  useEffect(() => {
    if (defaultOpen && readMemo(sectionKey) === null) {
      setOpen(true);
    }
  }, [defaultOpen, sectionKey]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      writeMemo(sectionKey, next);
      return next;
    });
  };

  // Hidden completely
  if (sorted.length === 0 && !topSlot) return null;

  // Розділяємо normal-хвіст для ліміту
  const criticalAndAttention = sorted.filter((i) => i.priority !== "normal");
  const normals = sorted.filter((i) => i.priority === "normal");
  const visibleNormals = showAllNormal ? normals : normals.slice(0, normalLimit);
  const hiddenNormalCount = normals.length - visibleNormals.length;
  const visibleItems = [...criticalAndAttention, ...visibleNormals];

  const borderTone =
    highest === "critical"
      ? "border-destructive/60"
      : highest === "attention"
        ? "border-warning/50"
        : "border-border";

  const headerLabel = (() => {
    const parts: string[] = [];
    if (counts.critical > 0) parts.push(`${counts.critical} терміново`);
    if (counts.attention > 0) parts.push(`${counts.attention} цього тижня`);
    if (counts.normal > 0 && parts.length === 0) {
      parts.push(`${counts.normal} ${counts.normal === 1 ? "запланована подія" : "заплановані події"}`);
    } else if (counts.normal > 0) {
      parts.push(`${counts.normal} планові`);
    }
    return parts.join(" · ") || "Немає активних подій";
  })();

  const headerIconTone =
    highest === "critical"
      ? "text-destructive"
      : highest === "attention"
        ? "text-warning"
        : "text-muted-foreground";

  const stickyHeader = highest === "critical" && open;

  return (
    <Card className={cn("overflow-hidden p-0 border", borderTone)}>
      {topSlot}

      {sorted.length > 0 && (
        <>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className={cn(
              "w-full flex items-center gap-2 px-4 text-left",
              "min-h-[56px] sm:min-h-[48px]",
              "hover:bg-muted/40 transition-colors",
              stickyHeader && "sticky top-0 z-10 bg-card",
              highest === "critical" && !open && "animate-[pulse_5s_ease-in-out_infinite]",
            )}
          >
            <Inbox className={cn("h-4 w-4 shrink-0", headerIconTone)} />
            <span className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
              {headerLabel}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground shrink-0 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>

          {open && (
            <div>
              {visibleItems.map((item) => (
                <AttentionInboxItem
                  key={item.id}
                  item={item}
                  onMobileTap={(it) => {
                    if ((it.secondaryActions?.length ?? 0) > 0) {
                      setSheetItem(it);
                    } else {
                      it.primaryAction.onClick();
                    }
                  }}
                />
              ))}
              {hiddenNormalCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllNormal(true)}
                  className="w-full px-4 py-2 text-xs text-primary hover:bg-muted/40 border-t border-border/60 transition-colors"
                >
                  Показати ще {hiddenNormalCount}
                </button>
              )}
            </div>
          )}

          {isMobile && (
            <AttentionInboxBottomSheet
              item={sheetItem}
              open={!!sheetItem}
              onOpenChange={(o) => !o && setSheetItem(null)}
            />
          )}
        </>
      )}
    </Card>
  );
}
