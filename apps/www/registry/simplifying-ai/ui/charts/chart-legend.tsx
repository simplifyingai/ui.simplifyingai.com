"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import type { ChartConfig } from "./chart-config"
import { useChart } from "./chart-container"

export type LegendPosition = "top" | "bottom" | "left" | "right"

export interface LegendItem {
  name: string
  color: string
  value?: number | string
}

export interface ChartLegendProps {
  items?: LegendItem[]
  className?: string
  position?: LegendPosition
  hideIcon?: boolean
  onItemClick?: (name: string) => void
  onItemHover?: (name: string | null) => void
  /** When provided, items for which this returns `false` render dimmed —
   * used to show which series is highlighted after a legend click/hover. */
  isItemActive?: (name: string) => boolean
}

export function ChartLegend({
  items,
  className,
  position = "bottom",
  hideIcon = false,
  onItemClick,
  onItemHover,
  isItemActive,
}: ChartLegendProps) {
  const { config } = useChart()

  // Generate items from config if not provided
  const legendItems: LegendItem[] = React.useMemo(() => {
    if (items) return items

    return Object.entries(config).map(([key, value], index) => ({
      name: (value.label as string) ?? key,
      color: value.color ?? `var(--chart-${index + 1})`,
    }))
  }, [items, config])

  if (!legendItems.length) return null

  const isVertical = position === "left" || position === "right"

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-6",
        isVertical && "max-h-full flex-col items-start gap-3 overflow-y-auto",
        position === "top" && "pb-4",
        position === "bottom" && "pt-4",
        position === "left" && "pr-4",
        position === "right" && "pl-4",
        className
      )}
    >
      {legendItems.map((item, index) => (
        <button
          key={index}
          type="button"
          aria-pressed={isItemActive ? !isItemActive(item.name) : undefined}
          className={cn(
            "flex items-center gap-2 text-sm",
            "transition-opacity hover:opacity-80",
            onItemClick && "cursor-pointer",
            isItemActive && !isItemActive(item.name) && "opacity-40"
          )}
          onClick={() => onItemClick?.(item.name)}
          onMouseEnter={() => onItemHover?.(item.name)}
          onMouseLeave={() => onItemHover?.(null)}
        >
          {!hideIcon && (
            <div
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="text-foreground font-medium">{item.name}</span>
          {item.value !== undefined && (
            <span className="text-muted-foreground font-mono tabular-nums">
              {typeof item.value === "number"
                ? item.value.toLocaleString()
                : item.value}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// Inline legend for embedding inside chart SVG
export interface ChartLegendInlineProps {
  items: LegendItem[]
  x?: number
  y?: number
  direction?: "horizontal" | "vertical"
  className?: string
}

export function ChartLegendInline({
  items,
  x = 0,
  y = 0,
  direction = "horizontal",
  className,
}: ChartLegendInlineProps) {
  const spacing = direction === "horizontal" ? 100 : 24

  return (
    <g
      className={cn("chart-legend", className)}
      transform={`translate(${x}, ${y})`}
    >
      {items.map((item, index) => (
        <g
          key={index}
          transform={
            direction === "horizontal"
              ? `translate(${index * spacing}, 0)`
              : `translate(0, ${index * spacing})`
          }
        >
          <rect width={12} height={12} rx={2} fill={item.color} />
          <text
            x={18}
            y={10}
            className="fill-foreground"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            {item.name}
          </text>
        </g>
      ))}
    </g>
  )
}

// ============================================================================
// Series highlight — Plotly-style legend emphasis
// ============================================================================

/**
 * Shared selection/hover state for multi-series charts. Clicking a legend
 * item "selects" a series (persists until clicked again); hovering a legend
 * item previews it. The focused series (hover takes precedence over the
 * click selection) is emphasized while every other series renders dimmed —
 * faded, never removed — mirroring Plotly's legend highlight behavior.
 *
 *   const hl = useSeriesHighlight()
 *   <path className={cn(hl.isDimmed(name) && "opacity-30")} />
 *   <ChartLegend onItemClick={hl.toggle} onItemHover={hl.setHovered}
 *     isItemActive={hl.isActive} />
 */
export function useSeriesHighlight() {
  const [selected, setSelected] = React.useState<string | null>(null)
  const [hovered, setHovered] = React.useState<string | null>(null)
  const focused = hovered ?? selected

  const isDimmed = React.useCallback(
    (name: string) => focused !== null && focused !== name,
    [focused]
  )
  const isActive = React.useCallback(
    (name: string) => focused === null || focused === name,
    [focused]
  )
  const toggle = React.useCallback(
    (name: string) => setSelected((prev) => (prev === name ? null : name)),
    []
  )

  return {
    /** Series pinned by a legend click (null when none). */
    selected,
    /** Series currently hovered in the legend (null when none). */
    hovered,
    /** Effective emphasized series: hover wins over the click selection. */
    focused,
    setSelected,
    setHovered,
    /** Click handler for a legend item — pin/unpin the series. */
    toggle,
    /** True when a different series is focused (this one should fade). */
    isDimmed,
    /** True when this series is focused or nothing is focused. */
    isActive,
  }
}

// ============================================================================
// Legend layout — arranges the plot and a persistent legend on any side
// ============================================================================

/**
 * Positions a persistent `ChartLegend` on any side of the plot without
 * disturbing the plot's own coordinate system. The plot (svg + any
 * absolutely-positioned tooltips/overlays) is wrapped in a `relative`
 * flex-1 box so its overlays stay anchored to the plot area regardless of
 * which side the legend occupies. Render this as the sole flex child of a
 * `ChartContainer`.
 */
export function ChartLegendLayout({
  position = "right",
  show = true,
  legend,
  children,
  className,
}: {
  position?: LegendPosition
  show?: boolean
  legend: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const isRow = position === "left" || position === "right"
  const legendFirst = position === "top" || position === "left"

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1",
        isRow ? "flex-row" : "flex-col",
        className
      )}
    >
      {show && legendFirst && legend}
      <div className="relative flex min-h-0 min-w-0 flex-1">{children}</div>
      {show && !legendFirst && legend}
    </div>
  )
}

// Legend content for use with shadcn patterns
export interface ChartLegendContentProps {
  payload?: Array<{
    value: string
    color: string
    dataKey?: string
    type?: string
  }>
  verticalAlign?: "top" | "bottom"
  hideIcon?: boolean
  nameKey?: string
  className?: string
}

export function ChartLegendContent({
  payload,
  verticalAlign = "bottom",
  hideIcon = false,
  nameKey,
  className,
}: ChartLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-6",
        verticalAlign === "top" ? "pb-4" : "pt-4",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = nameKey ?? item.dataKey ?? "value"
          const itemConfig = config[key] ?? {}

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {!hideIcon && (
                <div
                  className="size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span className="text-foreground font-medium">
                {(itemConfig.label as string) ?? item.value}
              </span>
            </div>
          )
        })}
    </div>
  )
}
