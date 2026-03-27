"use client"

import * as React from "react"
import type { ScaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface ChartGridProps {
  xScale?: ScaleLinear<number, number>
  yScale?: ScaleLinear<number, number>
  width: number
  height: number
  xTickCount?: number
  yTickCount?: number
  strokeDasharray?: string
  className?: string
}

export function ChartGrid({
  xScale,
  yScale,
  width,
  height,
  xTickCount = 5,
  yTickCount = 5,
  strokeDasharray = "3,3",
  className,
}: ChartGridProps) {
  const xTicks = xScale?.ticks(xTickCount) ?? []
  const yTicks = yScale?.ticks(yTickCount) ?? []

  return (
    <g className={cn("chart-grid", className)}>
      {/* Horizontal grid lines */}
      {yTicks.map((tick, i) => (
        <line
          key={`h-${i}`}
          className="chart-grid-line"
          x1={0}
          x2={width}
          y1={yScale!(tick)}
          y2={yScale!(tick)}
          stroke="currentColor"
          strokeDasharray={strokeDasharray}
          strokeOpacity={0.3}
        />
      ))}

      {/* Vertical grid lines */}
      {xTicks.map((tick, i) => (
        <line
          key={`v-${i}`}
          className="chart-grid-line"
          x1={xScale!(tick)}
          x2={xScale!(tick)}
          y1={0}
          y2={height}
          stroke="currentColor"
          strokeDasharray={strokeDasharray}
          strokeOpacity={0.3}
        />
      ))}
    </g>
  )
}

// Simple horizontal-only grid
export interface ChartHorizontalGridProps {
  scale: ScaleLinear<number, number>
  width: number
  tickCount?: number
  strokeDasharray?: string
  className?: string
}

export function ChartHorizontalGrid({
  scale,
  width,
  tickCount = 5,
  strokeDasharray = "",
  className,
}: ChartHorizontalGridProps) {
  const ticks = scale.ticks(tickCount)

  return (
    <g className={cn("chart-grid", className)}>
      {ticks.map((tick, i) => (
        <line
          key={i}
          className="chart-grid-line"
          x1={0}
          x2={width}
          y1={scale(tick)}
          y2={scale(tick)}
          stroke="currentColor"
          strokeDasharray={strokeDasharray}
          strokeOpacity={0.15}
        />
      ))}
    </g>
  )
}

// Simple vertical-only grid
export interface ChartVerticalGridProps {
  scale: { ticks: (count?: number) => unknown[]; (value: unknown): number }
  height: number
  tickCount?: number
  strokeDasharray?: string
  className?: string
}

export function ChartVerticalGrid({
  scale,
  height,
  tickCount = 5,
  strokeDasharray = "3,3",
  className,
}: ChartVerticalGridProps) {
  const ticks = scale.ticks(tickCount)

  return (
    <g className={cn("chart-grid", className)}>
      {ticks.map((tick, i) => (
        <line
          key={i}
          className="chart-grid-line"
          x1={scale(tick)}
          x2={scale(tick)}
          y1={0}
          y2={height}
          stroke="currentColor"
          strokeDasharray={strokeDasharray}
          strokeOpacity={0.3}
        />
      ))}
    </g>
  )
}
