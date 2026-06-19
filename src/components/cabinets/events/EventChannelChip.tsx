import { cn } from "@/lib/utils";
import { EVENT_CHANNELS, type EventChannel } from "@/config/individualEventsRich";

interface Props {
  channel: EventChannel;
  size?: "sm" | "md";
  dotOnly?: boolean;
  className?: string;
}

/**
 * Channel chip with colored dot + icon + label. Uses CSS variables defined in
 * index.css (`--channel-*`) so colors stay theme-aware.
 */
export function EventChannelChip({ channel, size = "sm", dotOnly = false, className }: Props) {
  const meta = EVENT_CHANNELS[channel];
  if (!meta) return null;
  const Icon = meta.icon;
  const color = `hsl(var(--${meta.cssVar}))`;
  const bg = `hsl(var(--${meta.cssVar}) / 0.12)`;
  const border = `hsl(var(--${meta.cssVar}) / 0.30)`;

  if (dotOnly) {
    return (
      <span
        aria-label={meta.label}
        title={meta.label}
        className={cn("inline-block rounded-full flex-shrink-0", size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5", className)}
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium tabular-nums",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1",
        className,
      )}
      style={{ color, backgroundColor: bg, borderColor: border }}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {meta.label}
    </span>
  );
}
