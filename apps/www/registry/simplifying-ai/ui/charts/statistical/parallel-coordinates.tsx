"use client"

import * as React from "react"
import { scaleLinear, scalePoint } from "d3-scale"
import { curveMonotoneX, line } from "d3-shape"

import { cn } from "@/lib/utils"

export interface ParallelCoordinatesDataPoint {
  id: string
  values: Record<string, number>
  group?: string
}

export interface ParallelCoordinatesProps {
  data: ParallelCoordinatesDataPoint[]
  dimensions: string[]
  className?: string
  /** Visual style variant */
  variant?: "standard" | "curved"
  /** Show dimension labels */
  showLabels?: boolean
  /** Show tick values on axes */
  showValues?: boolean
  /** Line opacity (0-1) */
  lineOpacity?: number
  /** Single color for all lines (overrides group colors) */
  color?: string
  /** Color scheme for groups */
  colorScheme?: string[]
  /** Custom value formatter */
  valueFormatter?: (value: number, dimension: string) => string
}

const DEFAULT_COLOR = "var(--chart-1)"

const DEFAULT_COLOR_SCHEME = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

// Default value formatter with smart number formatting
const defaultValueFormatter = (v: number, _dim?: string): string => {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}K`
  if (Number.isInteger(v)) return v.toString()
  return v.toFixed(1)
}

export function ParallelCoordinates({
  data,
  dimensions,
  className,
  variant = "standard",
  showLabels = true,
  showValues = true,
  lineOpacity = 0.5,
  color,
  colorScheme = DEFAULT_COLOR_SCHEME,
  valueFormatter = defaultValueFormatter,
}: ParallelCoordinatesProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [tooltipData, setTooltipData] = React.useState<{
    id: string
    x: number
    y: number
  } | null>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)

  // Dynamic width based on number of dimensions
  const width = Math.max(400, dimensions.length * 100)
  const height = 350
  const margin = { top: 40, right: 40, bottom: 30, left: 40 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Get unique groups
  const groups = React.useMemo(() => {
    return [...new Set(data.map((d) => d.group ?? "default"))]
  }, [data])

  const getColor = (group?: string) => {
    if (color) return color
    if (groups.length === 1) return DEFAULT_COLOR
    const index = groups.indexOf(group ?? "default")
    return colorScheme[index % colorScheme.length]
  }

  // X scale for dimensions
  const xScale = scalePoint<string>().domain(dimensions).range([0, innerWidth])

  // Y scales for each dimension
  const yScales = React.useMemo(() => {
    const scales: Record<
      string,
      ReturnType<typeof scaleLinear<number, number>>
    > = {}

    dimensions.forEach((dim) => {
      const values = data
        .map((d) => d.values[dim])
        .filter((v) => v !== undefined)
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
  const lineGenerator = React.useMemo(() => {
    const generator = line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)

    if (variant === "curved") {
      generator.curve(curveMonotoneX)
    }

    return generator
  }, [variant])

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

  const handleMouseEnter = (
    d: ParallelCoordinatesDataPoint,
    e: React.MouseEvent
  ) => {
    setHoveredId(d.id)
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect()
      setTooltipData({
        id: d.id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex h-[350px] items-center justify-center",
          className
        )}
      >
        No data available
      </div>
    )
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Legend */}
      {groups.length > 1 && !color && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {groups.map((group) => (
            <div key={group} className="flex items-center gap-2">
              <div
                className="h-0.5 w-4 rounded"
                style={{ backgroundColor: getColor(group) }}
              />
              <span className="text-muted-foreground text-sm">{group}</span>
            </div>
          ))}
        </div>
      )}

      <svg
        ref={svgRef}
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
                  strokeWidth={1}
                  className="stroke-border"
                />

                {/* Ticks */}
                {showValues &&
                  ticks.map((tick, i) => (
                    <g key={i} transform={`translate(0, ${scale(tick)})`}>
                      <line
                        x1={-4}
                        x2={0}
                        className="stroke-border"
                      />
                      <text
                        x={-8}
                        textAnchor="end"
                        dominantBaseline="middle"
                        className="fill-muted-foreground text-[9px]"
                      >
                        {valueFormatter(tick, dim)}
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

            const lineColor = getColor(d.group)
            const isHovered = hoveredId === d.id

            return (
              <path
                key={d.id}
                d={path}
                fill="none"
                stroke={lineColor}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity={
                  hoveredId === null ? lineOpacity : isHovered ? 1 : 0.1
                }
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={(e) => handleMouseEnter(d, e)}
                onMouseLeave={() => {
                  setHoveredId(null)
                  setTooltipData(null)
                }}
              />
            )
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {tooltipData && hoveredId && (
        <div
          className="bg-foreground text-background pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltipData.x, top: tooltipData.y - 10 }}
        >
          <div className="mb-1 font-semibold">{tooltipData.id}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 opacity-90">
            {dimensions.map((dim) => {
              const item = data.find((d) => d.id === hoveredId)
              return (
                <React.Fragment key={dim}>
                  <span>{dim}:</span>
                  <span>{valueFormatter(item?.values[dim] ?? 0, dim)}</span>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
