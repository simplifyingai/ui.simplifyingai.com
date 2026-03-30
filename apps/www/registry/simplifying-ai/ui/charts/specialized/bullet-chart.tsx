"use client"

import * as React from "react"
import { scaleLinear } from "d3-scale"

import { cn } from "@/lib/utils"

export interface BulletChartData {
  label: string
  value: number
  target: number
  ranges: [number, number, number] // [poor, satisfactory, good]
  max?: number
}

export interface BulletChartProps {
  data: BulletChartData[]
  className?: string
  orientation?: "horizontal" | "vertical"
  showLabels?: boolean
  showValues?: boolean
  valueFormatter?: (value: number) => string
  barColor?: string
  targetColor?: string
  rangeColors?: [string, string, string]
}

export function BulletChart({
  data,
  className,
  orientation = "horizontal",
  showLabels = true,
  showValues = true,
  valueFormatter = (value) => value.toLocaleString(),
  barColor = "#1e40af",
  targetColor = "#1e293b",
  rangeColors = ["#dbeafe", "#93c5fd", "#3b82f6"],
}: BulletChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const isHorizontal = orientation === "horizontal"
  const barHeight = 24
  const barSpacing = 60
  const labelWidth = 100
  const valueWidth = 60

  const width = 500
  const height = isHorizontal ? data.length * barSpacing + 40 : 400

  const margin = isHorizontal
    ? { top: 20, right: valueWidth + 20, bottom: 20, left: labelWidth }
    : { top: 20, right: 20, bottom: 60, left: 40 }

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {data.map((d, index) => {
            const max = d.max ?? Math.max(d.ranges[2], d.target, d.value) * 1.1
            const scale = scaleLinear().domain([0, max]).range([0, innerWidth])

            const y = index * barSpacing
            const isHovered = hoveredIndex === index

            return (
              <g
                key={d.label}
                transform={`translate(0, ${y})`}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredIndex !== null && !isHovered && "opacity-50"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Range backgrounds */}
                <rect
                  x={0}
                  y={0}
                  width={scale(d.ranges[2])}
                  height={barHeight}
                  fill={rangeColors[0]}
                  rx={2}
                />
                <rect
                  x={0}
                  y={barHeight * 0.15}
                  width={scale(d.ranges[1])}
                  height={barHeight * 0.7}
                  fill={rangeColors[1]}
                  rx={2}
                />
                <rect
                  x={0}
                  y={barHeight * 0.3}
                  width={scale(d.ranges[0])}
                  height={barHeight * 0.4}
                  fill={rangeColors[2]}
                  rx={2}
                />

                {/* Value bar */}
                <rect
                  x={0}
                  y={barHeight * 0.35}
                  width={scale(d.value)}
                  height={barHeight * 0.3}
                  fill={barColor}
                  rx={2}
                />

                {/* Target marker */}
                <line
                  x1={scale(d.target)}
                  x2={scale(d.target)}
                  y1={barHeight * 0.1}
                  y2={barHeight * 0.9}
                  stroke={targetColor}
                  strokeWidth={3}
                />

                {/* Label */}
                {showLabels && (
                  <text
                    x={-10}
                    y={barHeight / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-foreground text-sm font-medium"
                  >
                    {d.label}
                  </text>
                )}

                {/* Value */}
                {showValues && (
                  <text
                    x={innerWidth + 10}
                    y={barHeight / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-sm"
                  >
                    {valueFormatter(d.value)}
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
          <span className="text-muted-foreground">
            {data[hoveredIndex].label}:{" "}
            {valueFormatter(data[hoveredIndex].value)} / Target:{" "}
            {valueFormatter(data[hoveredIndex].target)}
          </span>
        </div>
      )}
    </div>
  )
}
