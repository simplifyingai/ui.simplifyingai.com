"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface LollipopDataPoint {
  category: string
  value: number
  color?: string
}

export interface LollipopChartProps {
  data: LollipopDataPoint[]
  className?: string
  orientation?: "horizontal" | "vertical"
  dotSize?: number
  showGrid?: boolean
  showValues?: boolean
  valueFormatter?: (value: number) => string
  color?: string
  stemColor?: string
}

export function LollipopChart({
  data,
  className,
  orientation = "horizontal",
  dotSize = 10,
  showGrid = true,
  showValues = false,
  valueFormatter = (value) => value.toLocaleString(),
  color = "#2563eb",
  stemColor = "#93c5fd",
}: LollipopChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const isHorizontal = orientation === "horizontal"
  const width = 500
  const height = isHorizontal ? data.length * 36 + 60 : 400
  const margin = isHorizontal
    ? { top: 20, right: 40, bottom: 40, left: 100 }
    : { top: 20, right: 20, bottom: 80, left: 50 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const categoryScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.category))
      .range(isHorizontal ? [0, innerHeight] : [0, innerWidth])
      .padding(0.4)
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

          {/* Lollipops */}
          {data.map((d, index) => {
            const isHovered = hoveredIndex === index
            const dotColor = d.color ?? color
            const categoryPos = (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2

            const x1 = isHorizontal ? 0 : categoryPos
            const y1 = isHorizontal ? categoryPos : innerHeight
            const x2 = isHorizontal ? valueScale(d.value) : categoryPos
            const y2 = isHorizontal ? categoryPos : valueScale(d.value)

            return (
              <g
                key={d.category}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredIndex !== null && !isHovered && "opacity-50"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Stem */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stemColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                />

                {/* Dot */}
                <circle
                  cx={x2}
                  cy={y2}
                  r={isHovered ? dotSize * 1.3 : dotSize}
                  fill={dotColor}
                  className="transition-all duration-200"
                />

                {/* Value label */}
                {showValues && (
                  <text
                    x={isHorizontal ? x2 + dotSize + 6 : x2}
                    y={isHorizontal ? y2 : y2 - dotSize - 6}
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
            const pos = (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
            return (
              <text
                key={`label-${d.category}`}
                x={isHorizontal ? -10 : pos}
                y={isHorizontal ? pos : innerHeight + 20}
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

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="mt-2 text-center text-sm">
          <span className="font-medium">{data[hoveredIndex].category}</span>
          <span className="text-muted-foreground">: {valueFormatter(data[hoveredIndex].value)}</span>
        </div>
      )}
    </div>
  )
}
