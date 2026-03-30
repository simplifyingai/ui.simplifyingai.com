"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TernaryDataPoint {
  id: string
  a: number // Bottom-left axis (0-100 or 0-1)
  b: number // Bottom-right axis
  c: number // Top axis
  label?: string
  color?: string
  group?: string
  size?: number
}

export interface TernaryChartProps {
  data: TernaryDataPoint[]
  className?: string
  /** Visual style variant: standard (full grid), minimal (points only), filled (convex hull) */
  variant?: "standard" | "minimal" | "filled"
  /** Axis labels [A, B, C] */
  labels?: [string, string, string]
  /** Show grid lines */
  showGrid?: boolean
  /** Show axis labels */
  showLabels?: boolean
  /** Show tick value labels on axes */
  showTickValues?: boolean
  /** Number of grid divisions */
  gridLines?: number
  /** Data point radius */
  pointRadius?: number
  /** Single color for all points (overrides group colors) */
  color?: string
  /** Enable coloring by group */
  colorByGroup?: boolean
  /** Color scheme for groups when colorByGroup is true */
  colorScheme?: string[]
  /** Auto-normalize values to sum=1 */
  normalize?: boolean
}

const DEFAULT_COLOR = "#3b82f6"

const DEFAULT_COLOR_SCHEME = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
]

export function TernaryChart({
  data,
  className,
  variant = "standard",
  labels = ["A", "B", "C"],
  showGrid = true,
  showLabels = true,
  showTickValues = true,
  gridLines = 5,
  pointRadius = 6,
  color,
  colorByGroup = false,
  colorScheme = DEFAULT_COLOR_SCHEME,
  normalize = true,
}: TernaryChartProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })
  const containerRef = React.useRef<HTMLDivElement>(null)

  const width = 500
  const height = 450
  const margin = { top: 50, right: 50, bottom: 70, left: 50 }

  // Triangle dimensions
  const triangleHeight = height - margin.top - margin.bottom
  const triangleWidth = triangleHeight * (2 / Math.sqrt(3))
  const centerX = width / 2
  const topY = margin.top
  const bottomY = margin.top + triangleHeight

  // Triangle vertices
  const vertices = React.useMemo(
    () => ({
      top: { x: centerX, y: topY }, // C vertex
      bottomLeft: { x: centerX - triangleWidth / 2, y: bottomY }, // A vertex
      bottomRight: { x: centerX + triangleWidth / 2, y: bottomY }, // B vertex
    }),
    [centerX, topY, bottomY, triangleWidth]
  )

  // Get unique groups
  const groups = React.useMemo(() => {
    return [...new Set(data.map((d) => d.group ?? "default"))]
  }, [data])

  const getGroupColor = React.useCallback(
    (group?: string) => {
      if (color) return color
      if (!colorByGroup) return DEFAULT_COLOR
      const index = groups.indexOf(group ?? "default")
      return colorScheme[index % colorScheme.length]
    },
    [color, colorByGroup, groups, colorScheme]
  )

  // Convert ternary coordinates to Cartesian
  const ternaryToCartesian = React.useCallback(
    (a: number, b: number, c: number) => {
      // Normalize if needed
      const sum = a + b + c
      const na = normalize ? a / sum : a
      const nb = normalize ? b / sum : b
      const nc = normalize ? c / sum : c

      // Ternary to Cartesian transformation
      const x =
        vertices.bottomLeft.x +
        nb * (vertices.bottomRight.x - vertices.bottomLeft.x) +
        nc * (vertices.top.x - vertices.bottomLeft.x)
      const y =
        vertices.bottomLeft.y + nc * (vertices.top.y - vertices.bottomLeft.y)

      return { x, y }
    },
    [normalize, vertices]
  )

  // Generate grid lines
  const gridLineData = React.useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = []

    for (let i = 1; i < gridLines; i++) {
      const t = i / gridLines

      // Lines parallel to bottom edge (constant C)
      const c1Start = ternaryToCartesian(1 - t, 0, t)
      const c1End = ternaryToCartesian(0, 1 - t, t)
      lines.push({ x1: c1Start.x, y1: c1Start.y, x2: c1End.x, y2: c1End.y })

      // Lines parallel to left edge (constant B)
      const b1Start = ternaryToCartesian(1 - t, t, 0)
      const b1End = ternaryToCartesian(0, t, 1 - t)
      lines.push({ x1: b1Start.x, y1: b1Start.y, x2: b1End.x, y2: b1End.y })

      // Lines parallel to right edge (constant A)
      const a1Start = ternaryToCartesian(t, 1 - t, 0)
      const a1End = ternaryToCartesian(t, 0, 1 - t)
      lines.push({ x1: a1Start.x, y1: a1Start.y, x2: a1End.x, y2: a1End.y })
    }

    return lines
  }, [gridLines, ternaryToCartesian])

  // Generate tick labels
  const tickLabels = React.useMemo(() => {
    const ticks: { x: number; y: number; value: string; anchor: string }[] = []

    for (let i = 0; i <= gridLines; i++) {
      const t = i / gridLines
      const value = Math.round(t * 100)

      // A axis (bottom-left to top)
      const aPos = ternaryToCartesian(1 - t, 0, t)
      ticks.push({
        x: aPos.x - 15,
        y: aPos.y,
        value: `${value}`,
        anchor: "end",
      })

      // B axis (bottom-left to bottom-right)
      const bPos = ternaryToCartesian(1 - t, t, 0)
      ticks.push({
        x: bPos.x,
        y: bPos.y + 18,
        value: `${value}`,
        anchor: "middle",
      })

      // C axis (top to bottom-right)
      const cPos = ternaryToCartesian(0, 1 - t, t)
      ticks.push({
        x: cPos.x + 15,
        y: cPos.y,
        value: `${value}`,
        anchor: "start",
      })
    }

    return ticks
  }, [gridLines, ternaryToCartesian])

  // Calculate convex hull for filled variant
  const convexHullPath = React.useMemo(() => {
    if (variant !== "filled" || data.length < 3) return null

    const points = data.map((d) => ternaryToCartesian(d.a, d.b, d.c))

    // Simple convex hull using gift wrapping algorithm
    const hull: typeof points = []
    let pointOnHull = points.reduce((lowest, p) =>
      p.y > lowest.y ? p : lowest
    )
    let startPoint = pointOnHull
    let endpoint: (typeof points)[0]

    do {
      hull.push(pointOnHull)
      endpoint = points[0]

      for (const point of points) {
        if (
          endpoint === pointOnHull ||
          cross(pointOnHull, endpoint, point) < 0
        ) {
          endpoint = point
        }
      }

      pointOnHull = endpoint
    } while (endpoint !== startPoint && hull.length < points.length)

    if (hull.length < 3) return null

    return (
      hull.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
      " Z"
    )
  }, [variant, data, ternaryToCartesian])

  // Cross product helper for convex hull
  function cross(
    o: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  }

  const handleMouseMove = (e: React.MouseEvent, pointId: string) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
    setHoveredPoint(pointId)
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex h-[450px] items-center justify-center",
          className
        )}
      >
        No data available
      </div>
    )
  }

  const showGridLines = showGrid && variant !== "minimal"
  const effectiveColor = color ?? DEFAULT_COLOR

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Legend - only show when colorByGroup is enabled */}
      {colorByGroup && !color && groups.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {groups.map((group) => (
            <div key={group} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getGroupColor(group) }}
              />
              <span className="text-muted-foreground text-sm">{group}</span>
            </div>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        {/* Triangle outline */}
        <polygon
          points={`${vertices.top.x},${vertices.top.y} ${vertices.bottomLeft.x},${vertices.bottomLeft.y} ${vertices.bottomRight.x},${vertices.bottomRight.y}`}
          className="fill-muted/20 stroke-border"
          strokeWidth={1.5}
        />

        {/* Grid lines */}
        {showGridLines &&
          gridLineData.map((line, i) => (
            <line
              key={`grid-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className="stroke-border"
              strokeWidth={0.5}
              strokeOpacity={0.5}
            />
          ))}

        {/* Filled variant - convex hull */}
        {variant === "filled" && convexHullPath && (
          <path
            d={convexHullPath}
            fill={effectiveColor}
            fillOpacity={0.15}
            stroke={effectiveColor}
            strokeWidth={1}
            strokeOpacity={0.3}
          />
        )}

        {/* Axis labels */}
        {showLabels && (
          <>
            <text
              x={vertices.bottomLeft.x - 25}
              y={vertices.bottomLeft.y + 35}
              textAnchor="middle"
              className="fill-foreground text-sm font-medium"
            >
              {labels[0]}
            </text>
            <text
              x={vertices.bottomRight.x + 25}
              y={vertices.bottomRight.y + 35}
              textAnchor="middle"
              className="fill-foreground text-sm font-medium"
            >
              {labels[1]}
            </text>
            <text
              x={vertices.top.x}
              y={vertices.top.y - 15}
              textAnchor="middle"
              className="fill-foreground text-sm font-medium"
            >
              {labels[2]}
            </text>
          </>
        )}

        {/* Tick labels */}
        {showGridLines &&
          showTickValues &&
          tickLabels.map((tick, i) => (
            <text
              key={`tick-${i}`}
              x={tick.x}
              y={tick.y}
              textAnchor={tick.anchor as "start" | "middle" | "end"}
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {tick.value}
            </text>
          ))}

        {/* Data points */}
        {data.map((d) => {
          const pos = ternaryToCartesian(d.a, d.b, d.c)
          const pointColor = d.color ?? getGroupColor(d.group)
          const isHovered = hoveredPoint === d.id
          const radius = d.size ?? pointRadius

          return (
            <circle
              key={d.id}
              cx={pos.x}
              cy={pos.y}
              r={isHovered ? radius * 1.3 : radius}
              fill={pointColor}
              fillOpacity={hoveredPoint ? (isHovered ? 1 : 0.3) : 0.85}
              stroke="#fff"
              strokeWidth={1.5}
              className="cursor-pointer transition-all duration-150"
              onMouseMove={(e) => handleMouseMove(e, d.id)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="bg-foreground text-background pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 10 }}
        >
          {(() => {
            const point = data.find((d) => d.id === hoveredPoint)
            if (!point) return null
            const sum = point.a + point.b + point.c
            return (
              <>
                <div className="mb-1 font-semibold">
                  {point.label ?? hoveredPoint}
                </div>
                <div className="space-y-0.5 opacity-90">
                  <div>
                    {labels[0]}: {((point.a / sum) * 100).toFixed(1)}%
                  </div>
                  <div>
                    {labels[1]}: {((point.b / sum) * 100).toFixed(1)}%
                  </div>
                  <div>
                    {labels[2]}: {((point.c / sum) * 100).toFixed(1)}%
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
