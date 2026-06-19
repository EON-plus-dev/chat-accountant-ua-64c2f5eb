import { useState } from "react";
import { Plus, FileText, TrendingUp, Sparkles, Calculator, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useOverviewBp } from "./OverviewBpContext";
import { cn } from "@/lib/utils";

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  primary?: boolean;
}

interface Props {
  actions: QuickAction[];
}

export function OverviewQuickActions({ actions }: Props) {
  const { bp, isMobile } = useOverviewBp();
  const [open, setOpen] = useState(false);
  if (!actions.length) return null;

  // xs: drawer; sm: icon-only horizontal scroll; md+: text+icon
  if (bp === "xs") {
    const primary = actions.find((a) => a.primary) ?? actions[0];
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8 gap-1.5" onClick={primary.onClick}>
          <primary.icon className="w-3.5 h-3.5" />
          <span className="text-xs">{primary.label}</span>
        </Button>
        {actions.length > 1 && (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Більше дій">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Швидкі дії</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 grid grid-cols-2 gap-2">
                {actions.map((a) => (
                  <Button
                    key={a.id}
                    variant="outline"
                    className="h-auto justify-start gap-2 py-3"
                    onClick={() => {
                      setOpen(false);
                      a.onClick();
                    }}
                  >
                    <a.icon className="w-4 h-4" />
                    <span className="text-sm">{a.label}</span>
                  </Button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    );
  }

  if (bp === "sm") {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1">
        {actions.map((a) => (
          <Button
            key={a.id}
            variant={a.primary ? "default" : "outline"}
            size="sm"
            className="h-8 shrink-0 gap-1.5"
            onClick={a.onClick}
            title={a.label}
          >
            <a.icon className="w-3.5 h-3.5" />
            <span className="text-xs">{a.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", isMobile && "w-full")}>
      {actions.map((a) => (
        <Button
          key={a.id}
          variant={a.primary ? "default" : "outline"}
          size="sm"
          className="h-9 gap-1.5"
          onClick={a.onClick}
        >
          <a.icon className="w-4 h-4" />
          <span>{a.label}</span>
        </Button>
      ))}
    </div>
  );
}

export const QUICK_ACTION_ICONS = { Plus, FileText, TrendingUp, Sparkles, Calculator };
