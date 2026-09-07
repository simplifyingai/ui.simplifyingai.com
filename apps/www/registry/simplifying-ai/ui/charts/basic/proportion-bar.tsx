"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import type { ChartPatternKind } from "../chart-theme"
import { useChartTheme } from "../chart-theme"

/**
 * A share-of-total bar: rounded segments laid along one track, with an
 * optional legend carrying each share.
 *
 * This is the "Income Breakdown" / budget-usage mark that dashboards lean
 * on constantly and that a pie chart reads worse than. It is CSS rather
 * than SVG on purpose — the whole mark is rectangles, so there is nothing
 * an `<svg>` would buy.
 */

export interface ProportionSegment {
  label: string
  value: number
  color?: string
  /** Per-segment override of the chart's texture. */
  pattern?: ChartPatternKind
}

export interface ProportionBarProps {
  data: ProportionSegment[]
  /**
   * Denominator for each share. Defaults to the sum of `value`, so the
   * segments fill the track; pass a larger number to leave a remainder
   * (a budget with headroom left).
   */
  total?: number
  height?: number
  /** Gap between segments, px. */
  gap?: number
  /** Corner radius, px. Defaults to a full pill. */
  radius?: number
  showTrack?: boolean
  trackColor?: string
  /** Texture painted over every segment. Defaults to the theme. */
  pattern?: ChartPatternKind
  showLegend?: boolean
  /** What the legend prints on the right of each row. */
  legendValue?: "percent" | "value" | "none"
  valueFormatter?: (value: number) => string
  className?: string
}

/** CSS stand-in for the SVG `<pattern>` textures — a bar is a rectangle,
 *  so a repeating gradient is both cheaper and resolution-independent. */
function textureFor(kind: ChartPatternKind): string | undefined {
  switch (kind) {
    case "hatch":
      return "repeating-linear-gradient(45deg, rgba(255,255,255,0.30) 0 2px, transparent 2px 7px)"
    case "hatch-dense":
      return "repeating-linear-gradient(45deg, rgba(255,255,255,0.30) 0 1.5px, transparent 1.5px 4px)"
    case "dots":
      return "radial-gradient(rgba(255,255,255,0.45) 1px, transparent 1.2px)"
    case "grid":
      return "repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0 1px, transparent 1px 8px), repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 1px, transparent 1px 8px)"
    default:
      return undefined
  }
}

export function ProportionBar({
  data,
  total,
  height = 28,
  gap = 6,
  radius,
  showTrack = true,
  trackColor = "var(--muted)",
  pattern,
  showLegend = true,
  legendValue = "percent",
  valueFormatter = (v) => v.toLocaleString(),
  className,
}: ProportionBarProps) {
  const theme = useChartTheme()
  const texture = pattern ?? theme.activePattern
  const corner = radius ?? height / 2

  const sum = data.reduce((acc, d) => acc + (Number(d.value) || 0), 0)
  const denominator = total && total > 0 ? total : sum
  // An all-zero dataset would divide by zero; render an empty track instead.
  const share = (value: number) =>
    denominator > 0 ? Math.max(0, value) / denominator : 0

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div
        className="flex w-full overflow-hidden"
        style={{
          height,
          gap,
          borderRadius: corner,
          backgroundColor: showTrack ? trackColor : undefined,
        }}
        role="img"
        aria-label={data
          .map((d) => `${d.label} ${Math.round(share(d.value) * 100)}%`)
          .join(", ")}
      >
        {data.map((segment, index) => {
          const color =
            segment.color ?? theme.palette[index % theme.palette.length]
          const backgroundImage = textureFor(segment.pattern ?? texture)
          return (
            <div
              key={`${segment.label}-${index}`}
              title={`${segment.label}: ${valueFormatter(segment.value)}`}
              style={{
                flex: `0 0 ${share(segment.value) * 100}%`,
                backgroundColor: color,
                backgroundImage,
                backgroundSize:
                  (segment.pattern ?? texture) === "dots"
                    ? "6px 6px"
                    : undefined,
                borderRadius: corner,
                transition: theme.animate
                  ? `flex-basis ${theme.animationDuration}ms ease-out`
                  : undefined,
              }}
            />
          )
        })}
      </div>

      {showLegend && (
        <ul className="divide-border/60 divide-y">
          {data.map((segment, index) => {
            const color =
              segment.color ?? theme.palette[index % theme.palette.length]
            return (
              <li
                key={`${segment.label}-legend-${index}`}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-[4px]"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-foreground truncate">
                    {segment.label}
                  </span>
                </span>
                {legendValue !== "none" && (
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {legendValue === "percent"
                      ? `${Math.round(share(segment.value) * 100)} %`
                      : valueFormatter(segment.value)}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
