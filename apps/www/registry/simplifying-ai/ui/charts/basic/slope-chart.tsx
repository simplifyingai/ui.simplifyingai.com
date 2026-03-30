"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface SlopeDataPoint {
  category: string
  start: number
  end: number
  color?: string
}

export interface SlopeChartProps {
  data: SlopeDataPoint[]
  className?: string
  startLabel?: string
  endLabel?: string
  showGrid?: boolean
  showChange?: boolean
  increaseColor?: string
  decreaseColor?: string
  neutralColor?: string
  valueFormatter?: (value: number) => string
}

export function SlopeChart({
  data,
  className,
  startLabel = "Before",
  endLabel = "After",
  showGrid = true,
  showChange = true,
  increaseColor = "#22c55e",
  decreaseColor = "#ef4444",
  neutralColor = "#6b7280",
  valueFormatter = (value) => value.toLocaleString(),
}: SlopeChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const width = 500
  const height = Math.max(280, data.length * 45)
  const margin = { top: 50, right: 80, bottom: 30, left: 80 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Y scale based on all values
  const yScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => [d.start, d.end])
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const padding = (maxVal - minVal) * 0.12
    return scaleLinear()
      .domain([Math.max(0, minVal - padding), maxVal + padding])
      .range([innerHeight, 0])
      .nice()
  }, [data, innerHeight])

  const yTicks = yScale.ticks(5)

  // Get line color based on direction
  const getLineColor = (d: SlopeDataPoint) => {
    if (d.color) return d.color
    if (d.end > d.start) return increaseColor
    if (d.end < d.start) return decreaseColor
    return neutralColor
  }

  // Calculate change percentage
  const getChange = (d: SlopeDataPoint) => {
    if (d.start === 0) return d.end > 0 ? 100 : 0
    return ((d.end - d.start) / d.start) * 100
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Legend */}
      <div className="mb-3 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div
            className="h-0.5 w-5"
            style={{ backgroundColor: increaseColor }}
          />
          <span className="text-muted-foreground text-sm">Increase</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-0.5 w-5"
            style={{ backgroundColor: decreaseColor }}
          />
          <span className="text-muted-foreground text-sm">Decrease</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {showGrid &&
            yTicks.map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
            ))}

          {/* Column headers */}
          <text
            x={0}
            y={-25}
            textAnchor="middle"
            fontSize={13}
            fontWeight={500}
            className="fill-foreground"
          >
            {startLabel}
          </text>
          <text
            x={innerWidth}
            y={-25}
            textAnchor="middle"
            fontSize={13}
            fontWeight={500}
            className="fill-foreground"
          >
            {endLabel}
          </text>

          {/* Vertical axis lines */}
          <line
            x1={0}
            x2={0}
            y1={-10}
            y2={innerHeight}
            stroke="#d1d5db"
            strokeWidth={1.5}
          />
          <line
            x1={innerWidth}
            x2={innerWidth}
            y1={-10}
            y2={innerHeight}
            stroke="#d1d5db"
            strokeWidth={1.5}
          />

          {/* Slope lines */}
          {data.map((d, index) => {
            const isHovered = hoveredIndex === index
            const color = getLineColor(d)
            const y1 = yScale(d.start)
            const y2 = yScale(d.end)

            return (
              <g
                key={d.category}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  opacity: hoveredIndex !== null && !isHovered ? 0.25 : 1,
                  transition: "opacity 150ms",
                }}
              >
                {/* Line */}
                <line
                  x1={0}
                  y1={y1}
                  x2={innerWidth}
                  y2={y2}
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeLinecap="round"
                  style={{ transition: "stroke-width 150ms" }}
                />

                {/* Start dot */}
                <circle
                  cx={0}
                  cy={y1}
                  r={isHovered ? 6 : 5}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  style={{ transition: "r 150ms" }}
                />

                {/* End dot */}
                <circle
                  cx={innerWidth}
                  cy={y2}
                  r={isHovered ? 6 : 5}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  style={{ transition: "r 150ms" }}
                />

                {/* Start label - category name */}
                <text
                  x={-10}
                  y={y1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-foreground"
                  style={{ fontWeight: isHovered ? 600 : 400 }}
                >
                  {d.category}
                </text>

                {/* End value with change indicator */}
                <text
                  x={innerWidth + 10}
                  y={y2}
                  textAnchor="start"
                  dominantBaseline="middle"
                  fontSize={11}
                  className="fill-foreground"
                >
                  {valueFormatter(d.end)}
                  {showChange && (
                    <tspan
                      fill={color}
                      fontSize={10}
                      fontWeight={500}
                    >
                      {" "}
                      {d.end >= d.start ? "+" : ""}
                      {getChange(d).toFixed(0)}%
                    </tspan>
                  )}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="bg-foreground text-background pointer-events-none absolute left-1/2 top-16 z-50 -translate-x-1/2 rounded-md px-3 py-2 text-xs font-medium shadow-lg">
          <div className="mb-1 font-semibold">{data[hoveredIndex].category}</div>
          <div className="flex items-center gap-3 opacity-90">
            <span>{startLabel}: {valueFormatter(data[hoveredIndex].start)}</span>
            <span>→</span>
            <span>{endLabel}: {valueFormatter(data[hoveredIndex].end)}</span>
          </div>
          <div
            className="mt-1 text-center font-semibold"
            style={{ color: getLineColor(data[hoveredIndex]) }}
          >
            {data[hoveredIndex].end >= data[hoveredIndex].start ? "+" : ""}
            {valueFormatter(data[hoveredIndex].end - data[hoveredIndex].start)}
            {" "}({data[hoveredIndex].end >= data[hoveredIndex].start ? "+" : ""}
            {getChange(data[hoveredIndex]).toFixed(1)}%)
          </div>
        </div>
      )}
    </div>
  )
}
