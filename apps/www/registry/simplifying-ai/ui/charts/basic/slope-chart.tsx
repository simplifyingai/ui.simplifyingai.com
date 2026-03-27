"use client"

import * as React from "react"
import { scaleLinear, scalePoint } from "d3-scale"

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
  showValues?: boolean
  showGrid?: boolean
  valueFormatter?: (value: number) => string
  colorScheme?: string[]
}

export function SlopeChart({
  data,
  className,
  startLabel = "Before",
  endLabel = "After",
  showValues = true,
  showGrid = true,
  valueFormatter = (value) => value.toLocaleString(),
  colorScheme = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
}: SlopeChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const width = 500
  const height = 350
  const margin = { top: 40, right: 100, bottom: 40, left: 100 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // X scale for the two time points
  const xScale = scalePoint<string>()
    .domain([startLabel, endLabel])
    .range([0, innerWidth])

  // Y scale based on all values
  const yScale = React.useMemo(() => {
    const allValues = data.flatMap((d) => [d.start, d.end])
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const padding = (maxVal - minVal) * 0.15
    return scaleLinear()
      .domain([Math.max(0, minVal - padding), maxVal + padding])
      .range([innerHeight, 0])
      .nice()
  }, [data, innerHeight])

  const ticks = yScale.ticks(5)

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
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          ))}

          {/* Column headers */}
          <text
            x={xScale(startLabel) ?? 0}
            y={-20}
            textAnchor="middle"
            className="fill-foreground text-sm font-medium"
          >
            {startLabel}
          </text>
          <text
            x={xScale(endLabel) ?? innerWidth}
            y={-20}
            textAnchor="middle"
            className="fill-foreground text-sm font-medium"
          >
            {endLabel}
          </text>

          {/* Vertical axis lines */}
          <line
            x1={xScale(startLabel) ?? 0}
            x2={xScale(startLabel) ?? 0}
            y1={0}
            y2={innerHeight}
            stroke="hsl(var(--border))"
          />
          <line
            x1={xScale(endLabel) ?? innerWidth}
            x2={xScale(endLabel) ?? innerWidth}
            y1={0}
            y2={innerHeight}
            stroke="hsl(var(--border))"
          />

          {/* Slope lines */}
          {data.map((d, index) => {
            const isHovered = hoveredIndex === index
            const color = d.color ?? colorScheme[index % colorScheme.length]
            const x1 = xScale(startLabel) ?? 0
            const x2 = xScale(endLabel) ?? innerWidth
            const y1 = yScale(d.start)
            const y2 = yScale(d.end)
            const isIncreasing = d.end > d.start

            return (
              <g
                key={d.category}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredIndex !== null && !isHovered && "opacity-30"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth={isHovered ? 4 : 2}
                  className="transition-all duration-200"
                />

                {/* Start dot */}
                <circle
                  cx={x1}
                  cy={y1}
                  r={isHovered ? 8 : 6}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />

                {/* End dot */}
                <circle
                  cx={x2}
                  cy={y2}
                  r={isHovered ? 8 : 6}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                  className="transition-all duration-200"
                />

                {/* Start label */}
                <text
                  x={x1 - 12}
                  y={y1}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-foreground text-xs"
                >
                  {d.category}
                </text>

                {/* Start value */}
                {showValues && (
                  <text
                    x={x1 - 12}
                    y={y1 + 14}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs"
                  >
                    {valueFormatter(d.start)}
                  </text>
                )}

                {/* End value */}
                {showValues && (
                  <text
                    x={x2 + 12}
                    y={y2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-xs"
                  >
                    {valueFormatter(d.end)}
                    <tspan
                      fill={isIncreasing ? "#22c55e" : "#ef4444"}
                      className="text-[10px]"
                    >
                      {" "}({isIncreasing ? "+" : ""}{((d.end - d.start) / d.start * 100).toFixed(0)}%)
                    </tspan>
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div className="mt-2 text-center text-sm">
          <span className="font-medium">{data[hoveredIndex].category}</span>
          <span className="text-muted-foreground">
            : {valueFormatter(data[hoveredIndex].start)} → {valueFormatter(data[hoveredIndex].end)}
          </span>
        </div>
      )}
    </div>
  )
}
