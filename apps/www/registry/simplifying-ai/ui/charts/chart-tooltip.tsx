"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import type { ChartConfig } from "./chart-config"
import { useChart } from "./chart-container"

export interface TooltipData {
  label: string
  value: number | string
  color?: string
  category?: string
  [key: string]: unknown
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipData | TooltipData[]
  position?: { x: number; y: number }
  className?: string
  formatter?: (value: number | string, name: string) => React.ReactNode
  labelFormatter?: (label: string) => React.ReactNode
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "dot" | "line" | "dashed"
}

export function ChartTooltip({
  active = true,
  payload,
  position,
  className,
  formatter,
  labelFormatter,
  hideLabel = false,
  hideIndicator = false,
  indicator = "dot",
}: ChartTooltipProps) {
  const { config } = useChart()

  if (!active || !payload) return null

  const items = Array.isArray(payload) ? payload : [payload]

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-50",
        "border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        "min-w-[8rem]",
        className
      )}
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      {/* Label */}
      {!hideLabel && items[0]?.label && (
        <div className="mb-1 font-medium">
          {labelFormatter ? labelFormatter(items[0].label) : items[0].label}
        </div>
      )}

      {/* Items */}
      <div className="flex flex-col gap-1">
        {items.map((item, index) => {
          const itemConfig = config[item.category ?? item.label] ?? {}
          const color =
            item.color ?? itemConfig.color ?? `var(--chart-${index + 1})`

          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5">
                {/* Indicator */}
                {!hideIndicator && (
                  <div
                    className={cn(
                      "shrink-0 rounded-[2px]",
                      indicator === "dot" && "h-2.5 w-2.5",
                      indicator === "line" && "h-2.5 w-1",
                      indicator === "dashed" &&
                        "h-2.5 w-0 border-l-[1.5px] border-dashed"
                    )}
                    style={{
                      backgroundColor:
                        indicator !== "dashed" ? color : undefined,
                      borderColor: color,
                    }}
                  />
                )}

                {/* Name */}
                <span className="text-muted-foreground">
                  {itemConfig.label ?? item.category ?? item.label}
                </span>
              </div>

              {/* Value */}
              <span className="text-foreground font-mono font-medium tabular-nums">
                {formatter
                  ? formatter(item.value, item.label)
                  : typeof item.value === "number"
                    ? item.value.toLocaleString()
                    : item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Tooltip wrapper that tracks mouse position
export interface ChartTooltipWrapperProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}

export function ChartTooltipWrapper({
  children,
  content,
  className,
}: ChartTooltipWrapperProps) {
  const [position, setPosition] = React.useState<{
    x: number
    y: number
  } | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
    })
  }

  const handleMouseLeave = () => {
    setPosition(null)
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {position && (
        <div
          className="pointer-events-none absolute z-50"
          style={{ left: position.x, top: position.y }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

// Simple tooltip content component
export interface ChartTooltipContentProps {
  label?: string
  value?: number | string
  color?: string
  className?: string
}

export function ChartTooltipContent({
  label,
  value,
  color,
  className,
}: ChartTooltipContentProps) {
  return (
    <div
      className={cn(
        "border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {color && (
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="text-muted-foreground">{label}</span>
        {value !== undefined && (
          <span className="text-foreground font-mono font-medium tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        )}
      </div>
    </div>
  )
}
