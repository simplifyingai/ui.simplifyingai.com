"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface DumbbellDataPoint {
  category: string
  start: number
  end: number
  startLabel?: string
  endLabel?: string
}

export interface DumbbellChartProps {
  data: DumbbellDataPoint[]
  className?: string
  orientation?: "horizontal" | "vertical"
  dotSize?: number
  showGrid?: boolean
  showValues?: boolean
  valueFormatter?: (value: number) => string
  startColor?: string
  endColor?: string
  connectorColor?: string
}

export function DumbbellChart({
  data,
  className,
  orientation = "horizontal",
  dotSize = 10,
  showGrid = true,
  showValues = true,
  valueFormatter = (value) => value.toLocaleString(),
  startColor = "#93c5fd",
  endColor = "#1e40af",
  connectorColor = "#60a5fa",
}: DumbbellChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const isHorizontal = orientation === "horizontal"
  const width = 500
  const height = isHorizontal ? data.length * 50 + 80 : 400
  const margin = isHorizontal
    ? { top: 40, right: 40, bottom: 40, left: 120 }
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
    const allValues = data.flatMap((d) => [d.start, d.end])
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const padding = (maxVal - minVal) * 0.15
    return scaleLinear()
      .domain([Math.max(0, minVal - padding), maxVal + padding])
      .range(isHorizontal ? [0, innerWidth] : [innerHeight, 0])
      .nice()
  }, [data, innerWidth, innerHeight, isHorizontal])

  const ticks = valueScale.ticks(5)

  // Get legend labels
  const startLabel = data[0]?.startLabel ?? "Start"
  const endLabel = data[0]?.endLabel ?? "End"

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Legend */}
          <g transform={`translate(${innerWidth / 2 - 80}, -25)`}>
            <circle cx={0} cy={0} r={6} fill={startColor} />
            <text x={12} y={0} dominantBaseline="middle" className="fill-muted-foreground text-xs">
              {startLabel}
            </text>
            <circle cx={80} cy={0} r={6} fill={endColor} />
            <text x={92} y={0} dominantBaseline="middle" className="fill-muted-foreground text-xs">
              {endLabel}
            </text>
          </g>

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

          {/* Dumbbells */}
          {data.map((d, index) => {
            const isHovered = hoveredIndex === index
            const categoryPos = (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2

            const x1 = isHorizontal ? valueScale(d.start) : categoryPos
            const y1 = isHorizontal ? categoryPos : valueScale(d.start)
            const x2 = isHorizontal ? valueScale(d.end) : categoryPos
            const y2 = isHorizontal ? categoryPos : valueScale(d.end)

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
                {/* Connector line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={connectorColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                />

                {/* Start dot */}
                <circle
                  cx={x1}
                  cy={y1}
                  r={isHovered ? dotSize * 1.3 : dotSize}
                  fill={startColor}
                  stroke="#fff"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />

                {/* End dot */}
                <circle
                  cx={x2}
                  cy={y2}
                  r={isHovered ? dotSize * 1.3 : dotSize}
                  fill={endColor}
                  stroke="#fff"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />

                {/* Value labels */}
                {showValues && isHovered && (
                  <>
                    <text
                      x={x1}
                      y={y1 - dotSize - 6}
                      textAnchor="middle"
                      className="fill-muted-foreground text-xs"
                    >
                      {valueFormatter(d.start)}
                    </text>
                    <text
                      x={x2}
                      y={y2 - dotSize - 6}
                      textAnchor="middle"
                      className="fill-muted-foreground text-xs"
                    >
                      {valueFormatter(d.end)}
                    </text>
                  </>
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
          <span className="text-muted-foreground">
            : {valueFormatter(data[hoveredIndex].start)} → {valueFormatter(data[hoveredIndex].end)}
            {" "}({data[hoveredIndex].end >= data[hoveredIndex].start ? "+" : ""}
            {valueFormatter(data[hoveredIndex].end - data[hoveredIndex].start)})
          </span>
        </div>
      )}
    </div>
  )
}
