"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { useChartTheme } from "../chart-theme"
import { polarToCartesian } from "../chart-utils"

/**
 * Concentric progress rings — one arc per series, each against its own
 * track, with whatever you like in the middle.
 *
 * A donut divides a whole into parts; this compares several independent
 * ratios that do *not* sum to anything. Reaching for a donut there is the
 * usual reason dashboard "spend vs budget" cards read wrong.
 */

export interface RadialProgressSeries {
  name: string
  value: number
  /** Denominator for this ring only. Falls back to the chart's `max`. */
  max?: number
  color?: string
}

export interface RadialProgressChartProps {
  data: RadialProgressSeries[]
  /** Default denominator for rings that don't carry their own. */
  max?: number
  /** SVG viewBox edge, px. The chart scales to its container regardless. */
  size?: number
  /** Ring stroke width, px. */
  thickness?: number
  /** Space between rings, px. */
  gap?: number
  /** Degrees, 0 = twelve o'clock, growing clockwise. */
  startAngle?: number
  endAngle?: number
  rounded?: boolean
  track?: "dashed" | "solid" | "none"
  trackColor?: string
  /** Centre content — a headline number, a badge, anything. */
  children?: React.ReactNode
  showLegend?: boolean
  /** Side the legend sits on. `none` renders it under the rings. */
  legendPosition?: "right" | "bottom"
  valueFormatter?: (value: number) => string
  className?: string
  animate?: boolean
}

/** Clockwise arc from `a0` to `a1`. A full turn is degenerate as a single
 *  SVG arc, so it stops a hair short of closing. */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number
): string {
  const end = Math.abs(a1 - a0) >= 360 ? a0 + 359.99 : a1
  const s = polarToCartesian(cx, cy, r, a0)
  const e = polarToCartesian(cx, cy, r, end)
  const large = Math.abs(end - a0) > 180 ? 1 : 0
  const sweep = end >= a0 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`
}

export function RadialProgressChart({
  data,
  max = 100,
  size = 240,
  thickness = 12,
  gap = 8,
  startAngle = 0,
  endAngle = 360,
  rounded = true,
  track = "dashed",
  trackColor = "var(--border)",
  children,
  showLegend = false,
  legendPosition = "right",
  valueFormatter = (v) => `${v}`,
  className,
  animate,
}: RadialProgressChartProps) {
  const theme = useChartTheme()
  const isAnimated = animate ?? theme.animate

  // Grow the arcs on mount rather than snapping — `pathLength={1}` lets a
  // single dash offset drive it regardless of the ring's real length.
  const [drawn, setDrawn] = React.useState(!isAnimated)
  React.useEffect(() => {
    if (!isAnimated) return
    const id = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(id)
  }, [isAnimated])

  const cx = size / 2
  const cy = size / 2
  const outer = size / 2 - thickness / 2

  const rings = data.map((series, index) => {
    const radius = outer - index * (thickness + gap)
    const denominator = series.max ?? max
    const fraction =
      denominator > 0 ? Math.min(1, Math.max(0, series.value / denominator)) : 0
    return {
      ...series,
      radius,
      fraction,
      color: series.color ?? theme.palette[index % theme.palette.length],
    }
  })

  const legend = showLegend && (
    <ul
      className={cn(
        "space-y-3",
        legendPosition === "bottom" && "flex gap-6 space-y-0"
      )}
    >
      {rings.map((ring) => (
        <li key={ring.name} className="min-w-0">
          <span className="flex items-center gap-2">
            <span
              className="h-3.5 w-1 shrink-0 rounded-full"
              style={{ backgroundColor: ring.color }}
            />
            <span className="text-muted-foreground truncate text-sm">
              {ring.name}
            </span>
          </span>
          <span className="text-foreground block pl-3 text-lg font-semibold tabular-nums">
            {valueFormatter(ring.value)}
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <div
      className={cn(
        "flex w-full items-center gap-6",
        legendPosition === "bottom" && "flex-col",
        className
      )}
    >
      <div className="relative mx-auto w-full max-w-[280px] flex-1">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={rings
            .map((r) => `${r.name} ${Math.round(r.fraction * 100)}%`)
            .join(", ")}
        >
          {rings.map((ring) => (
            <g key={ring.name}>
              {track !== "none" && (
                <path
                  d={arcPath(cx, cy, ring.radius, startAngle, endAngle)}
                  fill="none"
                  stroke={trackColor}
                  strokeWidth={track === "dashed" ? 1 : thickness}
                  strokeDasharray={track === "dashed" ? "2 6" : undefined}
                  strokeLinecap="round"
                  opacity={track === "dashed" ? 1 : 0.35}
                />
              )}
              <path
                d={arcPath(cx, cy, ring.radius, startAngle, endAngle)}
                fill="none"
                stroke={ring.color}
                strokeWidth={thickness}
                strokeLinecap={rounded ? "round" : "butt"}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={drawn ? 1 - ring.fraction : 1}
                style={
                  isAnimated
                    ? {
                        transition: `stroke-dashoffset ${theme.animationDuration}ms ease-out`,
                      }
                    : undefined
                }
              />
            </g>
          ))}
        </svg>

        {children && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {children}
          </div>
        )}
      </div>

      {legend}
    </div>
  )
}
