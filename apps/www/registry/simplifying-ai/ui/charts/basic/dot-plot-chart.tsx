"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface DotPlotDataPoint {
  category: string
  value: number
  color?: string
}

export interface DotPlotChartProps {
  data: DotPlotDataPoint[]
  className?: string
  orientation?: "horizontal" | "vertical"
  dotSize?: number
  showGrid?: boolean
  showValues?: boolean
  valueFormatter?: (value: number) => string
  color?: string
}

export function DotPlotChart({
  data,
  className,
  orientation = "horizontal",
  dotSize = 12,
  showGrid = true,
  showValues = true,
  valueFormatter = (value) => value.toLocaleString(),
  color = "#2563eb",
}: DotPlotChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const isHorizontal = orientation === "horizontal"
  const width = 500
  const height = isHorizontal ? data.length * 40 + 60 : 400
  const margin = isHorizontal
    ? { top: 20, right: 60, bottom: 40, left: 120 }
    : { top: 20, right: 20, bottom: 80, left: 50 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const categoryScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.category))
      .range(isHorizontal ? [0, innerHeight] : [0, innerWidth])
      .padding(0.5)
  }, [data, innerWidth, innerHeight, isHorizontal])

  const valueScale = React.useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.value))
    return scaleLinear()
      .domain([0, maxVal * 1.1])
      .range(isHorizontal ? [0, innerWidth] : [innerHeight, 0])
      .nice()
  }, [data, innerWidth, innerHeight, isHorizontal])

  const ticks = valueScale.ticks(5)

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid && ticks.map((tick) => (
            <line
              key={tick}
              x1={isHorizontal ? valueScale(tick) : 0}
              x2={isHorizontal ? valueScale(tick) : innerWidth}
              y1={isHorizontal ? 0 : valueScale(tick)}
              y2={isHorizontal ? innerHeight : valueScale(tick)}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}

          {/* Baseline */}
          <line
            x1={isHorizontal ? 0 : 0}
            x2={isHorizontal ? 0 : innerWidth}
            y1={isHorizontal ? 0 : innerHeight}
            y2={isHorizontal ? innerHeight : innerHeight}
            stroke="hsl(var(--border))"
          />

          {/* Dots */}
          {data.map((d, index) => {
            const isHovered = hoveredIndex === index
            const dotColor = d.color ?? color
            const cx = isHorizontal
              ? valueScale(d.value)
              : (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
            const cy = isHorizontal
              ? (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
              : valueScale(d.value)

            return (
              <g key={d.category}>
                {/* Connector line */}
                <line
                  x1={isHorizontal ? 0 : cx}
                  x2={isHorizontal ? cx : cx}
                  y1={isHorizontal ? cy : innerHeight}
                  y2={cy}
                  stroke={dotColor}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.5}
                />

                {/* Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? dotSize * 1.2 : dotSize}
                  fill={dotColor}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    hoveredIndex !== null && !isHovered && "opacity-50"
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Value label */}
                {showValues && (
                  <text
                    x={isHorizontal ? cx + dotSize + 8 : cx}
                    y={isHorizontal ? cy : cy - dotSize - 8}
                    textAnchor={isHorizontal ? "start" : "middle"}
                    dominantBaseline={isHorizontal ? "middle" : "auto"}
                    className="fill-muted-foreground text-xs"
                  >
                    {valueFormatter(d.value)}
                  </text>
                )}
              </g>
            )
          })}

          {/* Category labels */}
          {data.map((d) => {
            const x = isHorizontal
              ? -10
              : (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
            const y = isHorizontal
              ? (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
              : innerHeight + 20

            return (
              <text
                key={`label-${d.category}`}
                x={x}
                y={y}
                textAnchor={isHorizontal ? "end" : "middle"}
                dominantBaseline={isHorizontal ? "middle" : "auto"}
                className="fill-foreground text-sm"
              >
                {d.category}
              </text>
            )
          })}

          {/* Value axis labels */}
          {ticks.map((tick) => (
            <text
              key={`tick-${tick}`}
              x={isHorizontal ? valueScale(tick) : -10}
              y={isHorizontal ? innerHeight + 20 : valueScale(tick)}
              textAnchor={isHorizontal ? "middle" : "end"}
              dominantBaseline={isHorizontal ? "auto" : "middle"}
              className="fill-muted-foreground text-xs"
            >
              {valueFormatter(tick)}
            </text>
          ))}
        </g>
      </svg>
    </div>
  )
}
