"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import type { ChartConfig } from "./chart-config"
import { useChart } from "./chart-container"

export interface LegendItem {
  name: string
  color: string
  value?: number | string
}

export interface ChartLegendProps {
  items?: LegendItem[]
  className?: string
  position?: "top" | "bottom" | "left" | "right"
  hideIcon?: boolean
  onItemClick?: (name: string) => void
  onItemHover?: (name: string | null) => void
}

export function ChartLegend({
  items,
  className,
  position = "bottom",
  hideIcon = false,
  onItemClick,
  onItemHover,
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
        isVertical && "flex-col gap-3",
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
          className={cn(
            "flex items-center gap-2 text-sm",
            "transition-opacity hover:opacity-80",
            onItemClick && "cursor-pointer"
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
