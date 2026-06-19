import { ChevronRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { AttentionItem } from "./types";

interface AttentionInboxBottomSheetProps {
  item: AttentionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttentionInboxBottomSheet({
  item,
  open,
  onOpenChange,
}: AttentionInboxBottomSheetProps) {
  if (!item) return null;
  const Icon = item.icon;

  const handle = (fn: () => void) => () => {
    onOpenChange(false);
    // Невелика затримка, щоб закриття drawer не перебивало навігацію
    setTimeout(fn, 50);
  };

  const accent =
    item.priority === "critical"
      ? "text-destructive"
      : item.priority === "attention"
        ? "text-warning"
        : "text-muted-foreground";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-start gap-3">
            <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", accent)} />
            <div className="min-w-0 flex-1">
              <DrawerTitle className="text-base">{item.title}</DrawerTitle>
              {item.meta && (
                <DrawerDescription className="mt-0.5">
                  {item.meta}
                </DrawerDescription>
              )}
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-1">
          <button
            type="button"
            onClick={handle(item.primaryAction.onClick)}
            className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-md bg-primary/10 hover:bg-primary/15 text-primary font-medium text-sm transition-colors"
          >
            <span>{item.primaryAction.label}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          {item.secondaryActions?.map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={handle(action.onClick)}
              className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-md hover:bg-muted text-foreground text-sm transition-colors"
            >
              <span>{action.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
