"use client"

import * as React from "react"
import { scaleLinear, scalePoint } from "d3-scale"
import { line } from "d3-shape"

import { cn } from "@/lib/utils"

export interface ParallelCoordinatesDataPoint {
  id: string
  values: Record<string, number>
  color?: string
  group?: string
}

export interface ParallelCoordinatesProps {
  data: ParallelCoordinatesDataPoint[]
  dimensions: string[]
  className?: string
  showLabels?: boolean
  showValues?: boolean
  lineOpacity?: number
  colorScheme?: string[]
}

export function ParallelCoordinates({
  data,
  dimensions,
  className,
  showLabels = true,
  showValues = true,
  lineOpacity = 0.5,
  colorScheme = ["#1e40af", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
}: ParallelCoordinatesProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [brushedDimension, setBrushedDimension] = React.useState<string | null>(null)

  const width = 600
  const height = 350
  const margin = { top: 40, right: 30, bottom: 30, left: 30 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Get unique groups
  const groups = React.useMemo(() => {
    return [...new Set(data.map((d) => d.group ?? "default"))]
  }, [data])

  const getGroupColor = (group?: string) => {
    const index = groups.indexOf(group ?? "default")
    return colorScheme[index % colorScheme.length]
  }

  // X scale for dimensions
  const xScale = scalePoint<string>()
    .domain(dimensions)
    .range([0, innerWidth])

  // Y scales for each dimension
  const yScales = React.useMemo(() => {
    const scales: Record<string, ReturnType<typeof scaleLinear<number, number>>> = {}

    dimensions.forEach((dim) => {
      const values = data.map((d) => d.values[dim]).filter((v) => v !== undefined)
      const minVal = Math.min(...values)
      const maxVal = Math.max(...values)
      const padding = (maxVal - minVal) * 0.1 || 1

      scales[dim] = scaleLinear()
        .domain([minVal - padding, maxVal + padding])
        .range([innerHeight, 0])
        .nice()
    })

    return scales
  }, [data, dimensions, innerHeight])

  // Line generator
  const lineGenerator = line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)

  // Generate path for each data point
  const getPath = (d: ParallelCoordinatesDataPoint) => {
    const points = dimensions
      .map((dim) => {
        const x = xScale(dim)
        const y = yScales[dim]?.(d.values[dim])
        if (x === undefined || y === undefined) return null
        return { x, y }
      })
      .filter((p): p is { x: number; y: number } => p !== null)

    return lineGenerator(points)
  }

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Axes */}
          {dimensions.map((dim) => {
            const x = xScale(dim) ?? 0
            const scale = yScales[dim]
            const ticks = scale?.ticks(5) ?? []

            return (
              <g key={dim} transform={`translate(${x}, 0)`}>
                {/* Axis line */}
                <line
                  y1={0}
                  y2={innerHeight}
                  stroke="hsl(var(--border))"
                  strokeWidth={1}
                />

                {/* Ticks */}
                {showValues && ticks.map((tick, i) => (
                  <g key={i} transform={`translate(0, ${scale(tick)})`}>
                    <line x1={-4} x2={0} stroke="hsl(var(--border))" />
                    <text
                      x={-8}
                      textAnchor="end"
                      dominantBaseline="middle"
                      className="fill-muted-foreground text-[9px]"
                    >
                      {tick.toFixed(0)}
                    </text>
                  </g>
                ))}

                {/* Dimension label */}
                {showLabels && (
                  <text
                    y={-15}
                    textAnchor="middle"
                    className="fill-foreground text-xs font-medium"
                  >
                    {dim}
                  </text>
                )}
              </g>
            )
          })}

          {/* Lines */}
          {data.map((d) => {
            const path = getPath(d)
            if (!path) return null

            const color = d.color ?? getGroupColor(d.group)
            const isHovered = hoveredId === d.id

            return (
              <path
                key={d.id}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={isHovered ? 3 : 1.5}
                strokeOpacity={
                  hoveredId === null
                    ? lineOpacity
                    : isHovered
                      ? 1
                      : 0.1
                }
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(d.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredId && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="font-medium">{hoveredId}</div>
            <div className="text-muted-foreground grid grid-cols-2 gap-x-3 text-xs">
              {dimensions.map((dim) => {
                const item = data.find((d) => d.id === hoveredId)
                return (
                  <React.Fragment key={dim}>
                    <span>{dim}:</span>
                    <span>{item?.values[dim]?.toFixed(1)}</span>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {groups.length > 1 && (
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {groups.map((group) => (
            <div key={group} className="flex items-center gap-1.5 text-sm">
              <div
                className="h-0.5 w-4"
                style={{ backgroundColor: getGroupColor(group) }}
              />
              <span className="text-muted-foreground">{group}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
