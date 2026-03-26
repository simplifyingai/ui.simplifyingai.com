"use client"

import * as React from "react"
import type { ScaleBand, ScaleLinear, ScaleTime } from "d3-scale"

import { cn } from "@/lib/utils"

type AnyScale =
  | ScaleLinear<number, number>
  | ScaleBand<string>
  | ScaleTime<number, number>

export interface ChartAxisProps {
  scale: AnyScale
  orientation: "top" | "right" | "bottom" | "left"
  transform?: string
  tickCount?: number
  tickFormat?: (value: unknown) => string
  tickSize?: number
  label?: string
  className?: string
  hideAxisLine?: boolean
  hideTickMarks?: boolean
}

export function ChartAxis({
  scale,
  orientation,
  transform,
  tickCount = 5,
  tickFormat,
  tickSize = 6,
  label,
  className,
  hideAxisLine = false,
  hideTickMarks = false,
}: ChartAxisProps) {
  const isHorizontal = orientation === "top" || orientation === "bottom"
  const isLeft = orientation === "left"
  const isTop = orientation === "top"

  // Get ticks based on scale type
  const ticks = React.useMemo(() => {
    if ("ticks" in scale && typeof scale.ticks === "function") {
      return scale.ticks(tickCount)
    }
    if ("domain" in scale && typeof scale.domain === "function") {
      return scale.domain()
    }
    return []
  }, [scale, tickCount])

  // Get tick position
  const getTickPosition = (tick: unknown): number => {
    if ("bandwidth" in scale && typeof scale.bandwidth === "function") {
      const bandScale = scale as ScaleBand<string>
      return (bandScale(tick as string) ?? 0) + bandScale.bandwidth() / 2
    }
    return (scale as ScaleLinear<number, number>)(tick as number)
  }

  // Format tick value
  const formatTick = (tick: unknown): string => {
    if (tickFormat) return tickFormat(tick)
    if (tick instanceof Date) return tick.toLocaleDateString()
    if (typeof tick === "number") {
      if (Math.abs(tick) >= 1000000) return `${(tick / 1000000).toFixed(1)}M`
      if (Math.abs(tick) >= 1000) return `${(tick / 1000).toFixed(1)}K`
      return tick.toLocaleString()
    }
    return String(tick)
  }

  const range = scale.range()
  const rangeStart = Math.min(...range)
  const rangeEnd = Math.max(...range)

  return (
    <g className={cn("chart-axis", className)} transform={transform}>
      {/* Axis line */}
      {!hideAxisLine && (
        <line
          className="chart-axis-line"
          x1={isHorizontal ? rangeStart : 0}
          x2={isHorizontal ? rangeEnd : 0}
          y1={isHorizontal ? 0 : rangeStart}
          y2={isHorizontal ? 0 : rangeEnd}
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.2}
        />
      )}

      {/* Ticks */}
      {ticks.map((tick, i) => {
        const position = getTickPosition(tick)
        const tickX = isHorizontal ? position : 0
        const tickY = isHorizontal ? 0 : position

        return (
          <g key={i} transform={`translate(${tickX}, ${tickY})`}>
            {/* Tick mark */}
            {!hideTickMarks && (
              <line
                className="chart-axis-tick"
                x2={isHorizontal ? 0 : isLeft ? -tickSize : tickSize}
                y2={isHorizontal ? (isTop ? -tickSize : tickSize) : 0}
                stroke="currentColor"
                strokeWidth={1}
                strokeOpacity={0.2}
              />
            )}

            {/* Tick label - LARGER TEXT */}
            <text
              className="chart-axis-label"
              style={{ fontSize: "12px" }}
              x={isHorizontal ? 0 : isLeft ? -tickSize - 8 : tickSize + 8}
              y={isHorizontal ? (isTop ? -tickSize - 8 : tickSize + 16) : 0}
              textAnchor={isHorizontal ? "middle" : isLeft ? "end" : "start"}
              dominantBaseline={isHorizontal ? "auto" : "middle"}
              fill="currentColor"
            >
              {formatTick(tick)}
            </text>
          </g>
        )
      })}

      {/* Axis label - LARGER TEXT */}
      {label && (
        <text
          className="chart-axis-label"
          style={{ fontSize: "13px", fontWeight: 500 }}
          x={isHorizontal ? (rangeStart + rangeEnd) / 2 : 0}
          y={isHorizontal ? (isTop ? -36 : 44) : (rangeStart + rangeEnd) / 2}
          textAnchor="middle"
          dominantBaseline={isHorizontal ? "auto" : "middle"}
          transform={
            !isHorizontal
              ? `rotate(-90, ${isLeft ? -48 : 48}, ${(rangeStart + rangeEnd) / 2})`
              : undefined
          }
          fill="currentColor"
        >
          {label}
        </text>
      )}
    </g>
  )
}
