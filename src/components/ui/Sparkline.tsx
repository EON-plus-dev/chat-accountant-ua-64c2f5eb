import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: "success" | "warning" | "destructive" | "primary";
  strokeWidth?: number;
  showGradient?: boolean;
  className?: string;
}

const colorMap = {
  success: {
    stroke: "hsl(var(--chart-2))",
    fill: "hsl(var(--chart-2) / 0.2)",
  },
  warning: {
    stroke: "hsl(38 92% 50%)", // amber-500
    fill: "hsl(38 92% 50% / 0.2)",
  },
  destructive: {
    stroke: "hsl(var(--destructive))",
    fill: "hsl(var(--destructive) / 0.2)",
  },
  primary: {
    stroke: "hsl(var(--primary))",
    fill: "hsl(var(--primary) / 0.15)",
  },
};

export function Sparkline({
  data,
  width = 80,
  height = 32,
  color = "primary",
  strokeWidth = 1.5,
  showGradient = true,
  className,
}: SparklineProps) {
  const { linePath, areaPath, lastPoint } = useMemo(() => {
    if (!data || data.length < 2) {
      return { linePath: "", areaPath: "", lastPoint: null };
    }

    const padding = 2;
    const effectiveWidth = width - padding * 2;
    const effectiveHeight = height - padding * 2;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * effectiveWidth;
      const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
      return { x, y };
    });

    // Create line path
    const linePath = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");

    // Create area path for gradient fill
    const areaPath = [
      linePath,
      `L ${points[points.length - 1].x} ${height - padding}`,
      `L ${points[0].x} ${height - padding}`,
      "Z",
    ].join(" ");

    const lastPoint = points[points.length - 1];

    return { linePath, areaPath, lastPoint };
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return null;
  }

  const colors = colorMap[color];
  const gradientId = `sparkline-gradient-${color}-${Math.random().toString(36).slice(2)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("motion-reduce:transition-none", className)}
      aria-hidden="true"
    >
      <defs>
        {showGradient && (
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.fill} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        )}
      </defs>

      {/* Area fill */}
      {showGradient && (
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          className="motion-reduce:transition-none"
        />
      )}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="motion-reduce:transition-none"
      />

      {/* Last point dot */}
      {lastPoint && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={2.5}
          fill={colors.stroke}
        />
      )}
    </svg>
  );
}
