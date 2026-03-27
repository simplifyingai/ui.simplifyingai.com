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
  labels?: [string, string, string] // [A, B, C] axis labels
  showGrid?: boolean
  showLabels?: boolean
  gridLines?: number
  pointRadius?: number
  colorScheme?: string[]
  normalize?: boolean // Auto-normalize to sum=1
}

export function TernaryChart({
  data,
  className,
  labels = ["A", "B", "C"],
  showGrid = true,
  showLabels = true,
  gridLines = 5,
  pointRadius = 6,
  colorScheme = ["#1e40af", "#dc2626", "#059669", "#d97706", "#7c3aed"],
  normalize = true,
}: TernaryChartProps) {
  const [hoveredPoint, setHoveredPoint] = React.useState<string | null>(null)

  const width = 500
  const height = 450
  const margin = { top: 40, right: 40, bottom: 60, left: 40 }

  // Triangle dimensions
  const triangleHeight = height - margin.top - margin.bottom
  const triangleWidth = triangleHeight * (2 / Math.sqrt(3))
  const centerX = width / 2
  const topY = margin.top
  const bottomY = margin.top + triangleHeight

  // Triangle vertices
  const vertices = {
    top: { x: centerX, y: topY }, // C vertex
    bottomLeft: { x: centerX - triangleWidth / 2, y: bottomY }, // A vertex
    bottomRight: { x: centerX + triangleWidth / 2, y: bottomY }, // B vertex
  }

  // Get unique groups
  const groups = React.useMemo(() => {
    return [...new Set(data.map((d) => d.group ?? "default"))]
  }, [data])

  const getGroupColor = (group?: string) => {
    const index = groups.indexOf(group ?? "default")
    return colorScheme[index % colorScheme.length]
  }

  // Convert ternary coordinates to Cartesian
  const ternaryToCartesian = (a: number, b: number, c: number) => {
    // Normalize if needed
    const sum = a + b + c
    const na = normalize ? a / sum : a
    const nb = normalize ? b / sum : b
    const nc = normalize ? c / sum : c

    // Ternary to Cartesian transformation
    const x = vertices.bottomLeft.x +
      (nb * (vertices.bottomRight.x - vertices.bottomLeft.x)) +
      (nc * (vertices.top.x - vertices.bottomLeft.x))
    const y = vertices.bottomLeft.y +
      (nc * (vertices.top.y - vertices.bottomLeft.y))

    return { x, y }
  }

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
  }, [gridLines, vertices])

  // Generate tick labels
  const tickLabels = React.useMemo(() => {
    const ticks: { x: number; y: number; value: string; anchor: string }[] = []

    for (let i = 0; i <= gridLines; i++) {
      const t = i / gridLines
      const value = Math.round(t * 100)

      // A axis (bottom-left to top)
      const aPos = ternaryToCartesian(1 - t, 0, t)
      ticks.push({ x: aPos.x - 15, y: aPos.y, value: `${value}`, anchor: "end" })

      // B axis (bottom-left to bottom-right)
      const bPos = ternaryToCartesian(1 - t, t, 0)
      ticks.push({ x: bPos.x, y: bPos.y + 18, value: `${value}`, anchor: "middle" })

      // C axis (top to bottom-right)
      const cPos = ternaryToCartesian(0, 1 - t, t)
      ticks.push({ x: cPos.x + 15, y: cPos.y, value: `${value}`, anchor: "start" })
    }

    return ticks
  }, [gridLines, vertices])

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
      >
        {/* Triangle outline */}
        <polygon
          points={`${vertices.top.x},${vertices.top.y} ${vertices.bottomLeft.x},${vertices.bottomLeft.y} ${vertices.bottomRight.x},${vertices.bottomRight.y}`}
          fill="hsl(var(--muted))"
          fillOpacity={0.2}
          stroke="hsl(var(--border))"
          strokeWidth={1.5}
        />

        {/* Grid lines */}
        {showGrid && gridLineData.map((line, i) => (
          <line
            key={`grid-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            strokeOpacity={0.5}
          />
        ))}

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
        {showGrid && tickLabels.map((tick, i) => (
          <text
            key={`tick-${i}`}
            x={tick.x}
            y={tick.y}
            textAnchor={tick.anchor}
            dominantBaseline="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {tick.value}
          </text>
        ))}

        {/* Data points */}
        {data.map((d) => {
          const pos = ternaryToCartesian(d.a, d.b, d.c)
          const color = d.color ?? getGroupColor(d.group)
          const isHovered = hoveredPoint === d.id
          const radius = d.size ?? pointRadius

          return (
            <g key={d.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? radius * 1.5 : radius}
                fill={color}
                fillOpacity={hoveredPoint ? (isHovered ? 1 : 0.3) : 0.8}
                stroke="#fff"
                strokeWidth={1.5}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredPoint(d.id)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {isHovered && d.label && (
                <text
                  x={pos.x}
                  y={pos.y - radius - 8}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium"
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      {groups.length > 1 && (
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {groups.map((group) => (
            <div key={group} className="flex items-center gap-1.5 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getGroupColor(group) }}
              />
              <span className="text-muted-foreground">{group}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {hoveredPoint && (
        <div className="mt-2 text-center">
          <div className="border-border/50 bg-background mx-auto inline-block rounded-lg border px-3 py-2 text-sm shadow-lg">
            <div className="font-medium">
              {data.find((d) => d.id === hoveredPoint)?.label ?? hoveredPoint}
            </div>
            <div className="text-muted-foreground text-xs">
              {(() => {
                const point = data.find((d) => d.id === hoveredPoint)
                if (!point) return null
                const sum = point.a + point.b + point.c
                return (
                  <>
                    <div>{labels[0]}: {((point.a / sum) * 100).toFixed(1)}%</div>
                    <div>{labels[1]}: {((point.b / sum) * 100).toFixed(1)}%</div>
                    <div>{labels[2]}: {((point.c / sum) * 100).toFixed(1)}%</div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
