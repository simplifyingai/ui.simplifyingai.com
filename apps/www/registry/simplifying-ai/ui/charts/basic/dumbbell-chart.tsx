"use client"

import * as React from "react"
import { scaleBand, scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface DumbbellDataPoint {
  category: string
  start: number
  end: number
}

export interface DumbbellChartProps {
  data: DumbbellDataPoint[]
  className?: string
  dotSize?: number
  showGrid?: boolean
  valueFormatter?: (value: number) => string
  startColor?: string
  endColor?: string
  connectorColor?: string
  startLabel?: string
  endLabel?: string
}

export function DumbbellChart({
  data,
  className,
  dotSize = 8,
  showGrid = true,
  valueFormatter = (value) => value.toLocaleString(),
  startColor = "var(--chart-3)",
  endColor = "var(--chart-1)",
  connectorColor = "var(--muted)",
  startLabel = "Start",
  endLabel = "End",
}: DumbbellChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const width = 500
  const height = data.length * 45 + 70
  const margin = { top: 40, right: 40, bottom: 35, left: 90 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const categoryScale = React.useMemo(() => {
    return scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.4)
  }, [data, innerHeight])

  const valueScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => [d.start, d.end])
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const range = maxVal - minVal || 1
    const padding = range * 0.15
    return scaleLinear()
      .domain([Math.max(0, minVal - padding), maxVal + padding])
      .range([0, innerWidth])
      .nice()
  }, [data, innerWidth])

  const ticks = valueScale.ticks(5)

  return (
    <div className={cn("relative w-full", className)}>
      {/* Legend */}
      <div className="mb-3 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: startColor }}
          />
          <span className="text-muted-foreground text-sm">{startLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: endColor }}
          />
          <span className="text-muted-foreground text-sm">{endLabel}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid &&
            ticks.map((tick) => (
              <line
                key={tick}
                x1={valueScale(tick)}
                x2={valueScale(tick)}
                y1={0}
                y2={innerHeight}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}

          {/* Baseline */}
          <line
            x1={0}
            x2={innerWidth}
            y1={innerHeight}
            y2={innerHeight}
            stroke="#e5e7eb"
            strokeWidth={1}
          />

          {/* Dumbbells */}
          {data.map((d, index) => {
            const isHovered = hoveredIndex === index
            const categoryPos =
              (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2

            const x1 = valueScale(d.start)
            const x2 = valueScale(d.end)
            const y = categoryPos

            return (
              <g
                key={d.category}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1,
                  transition: "opacity 150ms",
                }}
              >
                {/* Connector line */}
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={connectorColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                />

                {/* Start dot */}
                <circle
                  cx={x1}
                  cy={y}
                  r={isHovered ? dotSize + 2 : dotSize}
                  fill={startColor}
                  style={{ transition: "r 150ms" }}
                />

                {/* End dot */}
                <circle
                  cx={x2}
                  cy={y}
                  r={isHovered ? dotSize + 2 : dotSize}
                  fill={endColor}
                  style={{ transition: "r 150ms" }}
                />
              </g>
            )
          })}

          {/* Category labels */}
          {data.map((d) => {
            const pos =
              (categoryScale(d.category) ?? 0) + categoryScale.bandwidth() / 2
            return (
              <text
                key={`label-${d.category}`}
                x={-12}
                y={pos}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={12}
                className="fill-foreground"
              >
                {d.category}
              </text>
            )
          })}

          {/* Value axis labels */}
          {ticks.map((tick) => (
            <text
              key={`tick-${tick}`}
              x={valueScale(tick)}
              y={innerHeight + 20}
              textAnchor="middle"
              fontSize={11}
              className="fill-muted-foreground"
            >
              {valueFormatter(tick)}
            </text>
          ))}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="bg-foreground text-background pointer-events-none absolute top-12 left-1/2 z-50 -translate-x-1/2 rounded-md px-3 py-1.5 text-xs font-medium shadow-lg">
          <span className="font-semibold">{data[hoveredIndex].category}</span>
          <span className="mx-2">·</span>
          <span>
            {startLabel}: {valueFormatter(data[hoveredIndex].start)}
          </span>
          <span className="mx-1">→</span>
          <span>
            {endLabel}: {valueFormatter(data[hoveredIndex].end)}
          </span>
          <span className="ml-2 opacity-70">
            ({data[hoveredIndex].end >= data[hoveredIndex].start ? "+" : ""}
            {valueFormatter(data[hoveredIndex].end - data[hoveredIndex].start)})
          </span>
        </div>
      )}
    </div>
  )
}
